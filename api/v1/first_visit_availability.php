<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('first_visit_avail:' . ss_client_ip(), 60, 120)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

header('Cache-Control: public, max-age=300, s-maxage=300');

$tz = new DateTimeZone('America/New_York');
$now = new DateTimeImmutable('now', $tz);

$year = (int)$now->format('Y');
$monthNumber = (int)$now->format('n');
$monthName = $now->format('F');
$todayYmd = $now->format('Y-m-d');
$dayOfWeek = (int)$now->format('N'); // ISO 8601: 1 (Monday) to 7 (Sunday)

// Monday-anchored weekly cycle:
// Academy training runs Monday through Saturday; Sunday is closed.
// Mon-Fri: query today through this week's Sunday.
// Weekend (Sat-Sun): query today through next week's Sunday to bridge to the upcoming week.
$daysSinceMonday = $dayOfWeek - 1;
$thisMonday = $now->modify("-{$daysSinceMonday} days");
$thisSunday = $thisMonday->modify('+6 days');
$nextMonday = $thisMonday->modify('+7 days');
$nextSunday = $thisMonday->modify('+13 days');

if ($dayOfWeek <= 5) {
    // Monday through Friday: remainder of current training week
    $startDateObj = $now;
    $endDateObj = $thisSunday;
    $defaultTimeframeLabel = 'this week';
} else {
    // Saturday (6) or Sunday (7): upcoming week starting Monday
    // (includes today Saturday if morning slots are still open)
    $startDateObj = $now;
    $endDateObj = $nextSunday;
    $defaultTimeframeLabel = ($dayOfWeek === 7) ? 'this coming week' : 'this week';
}

$startYmd = $startDateObj->format('Y-m-d');
$endYmd = $endDateObj->format('Y-m-d');
$nowTs = $now->getTimestamp();
$endTs = $endDateObj->setTime(23, 59, 59)->getTimestamp();
$windowDays = (int)$startDateObj->diff($endDateObj)->format('%a') + 1;

$db = ss_db();
$cacheKey = "avail:week:{$todayYmd}";
$currentTime = time();

$stmt = $db->prepare('SELECT payload_json, expires_at FROM first_visit_availability_cache WHERE cache_key = :key LIMIT 1');
$stmt->execute([':key' => $cacheKey]);
$cached = $stmt->fetch(PDO::FETCH_ASSOC);

if ($cached && (int)$cached['expires_at'] > $currentTime) {
    $payload = json_decode((string)$cached['payload_json'], true);
    if (is_array($payload)) {
        ss_json(200, $payload);
    }
}

$apiKey = ss_env('CAL_API_KEY', '');

if ($apiKey !== '') {
    $queryParams = http_build_query([
        'start' => $startYmd,
        'end' => $endYmd,
        'eventTypeSlug' => 'first-visit',
        'username' => 'senseisandy',
        'timeZone' => 'America/New_York',
    ]);
    $calUrl = 'https://api.cal.com/v2/slots?' . $queryParams;

    $response = null;
    $httpCode = 0;

    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $calUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'cal-api-version: 2024-09-04',
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT => 5,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_FOLLOWLOCATION => true,
        ]);
        $response = curl_exec($ch);
        $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => "Authorization: Bearer {$apiKey}\r\n" .
                            "cal-api-version: 2024-09-04\r\n" .
                            "Accept: application/json\r\n",
                'timeout' => 5,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ],
        ];
        $ctx = stream_context_create($opts);
        $streamRes = @file_get_contents($calUrl, false, $ctx);
        if (is_string($streamRes)) {
            $response = $streamRes;
            if (isset($http_response_header) && is_array($http_response_header) && count($http_response_header) > 0) {
                if (preg_match('/HTTP\/\S+\s+(\d{3})/', $http_response_header[0], $matches)) {
                    $httpCode = (int)$matches[1];
                }
            }
        }
    }

    if ($httpCode >= 200 && $httpCode < 300 && is_string($response) && $response !== '') {
        $json = json_decode($response, true);
        if (is_array($json)) {
            $rawSlots = [];
            if (isset($json['data']['slots']) && is_array($json['data']['slots'])) {
                $rawSlots = $json['data']['slots'];
            } elseif (isset($json['data']) && is_array($json['data'])) {
                $rawSlots = $json['data'];
            } elseif (isset($json['slots']) && is_array($json['slots'])) {
                $rawSlots = $json['slots'];
            }

            $slotTimestamps = [];
            $nowTs = $now->getTimestamp();
            $flatten = function ($item) use (&$flatten, &$slotTimestamps, $nowTs, $endTs) {
                if (is_array($item)) {
                    if (isset($item['start']) && is_string($item['start'])) {
                        $ts = strtotime($item['start']);
                        if ($ts !== false && $ts >= $nowTs && $ts <= $endTs) {
                            $slotTimestamps[$ts] = true;
                        }
                    } elseif (isset($item['startTime']) && is_string($item['startTime'])) {
                        $ts = strtotime($item['startTime']);
                        if ($ts !== false && $ts >= $nowTs && $ts <= $endTs) {
                            $slotTimestamps[$ts] = true;
                        }
                    } elseif (isset($item['time']) && is_string($item['time'])) {
                        $ts = strtotime($item['time']);
                        if ($ts !== false && $ts >= $nowTs && $ts <= $endTs) {
                            $slotTimestamps[$ts] = true;
                        }
                    } else {
                        foreach ($item as $sub) {
                            $flatten($sub);
                        }
                    }
                }
            };

            $flatten($rawSlots);

            $sortedTimestamps = array_keys($slotTimestamps);
            sort($sortedTimestamps, SORT_NUMERIC);
            $availableSlotCount = count($sortedTimestamps);

            if ($availableSlotCount === 0) {
                $status = 'full';
                $availabilityLevel = 'full';
                $nextAvailableAt = null;
                $nextAvailableLabel = null;
                $timeframeLabel = ($dayOfWeek === 7) ? 'this coming week' : 'this week';
            } else {
                $status = 'available';
                $firstTs = $sortedTimestamps[0];
                $firstDt = (new DateTimeImmutable('@' . $firstTs))->setTimezone($tz);
                $nextAvailableAt = $firstDt->format('c');
                $nextAvailableLabel = $firstDt->format('D, M j');

                // Dynamic framing on weekend:
                if ($dayOfWeek === 7) {
                    $timeframeLabel = 'this coming week';
                } elseif ($dayOfWeek === 6) {
                    // If the earliest opening is next week (Mon+), frame as coming week
                    if ($firstDt >= $nextMonday->setTime(0, 0, 0)) {
                        $timeframeLabel = 'this coming week';
                    } else {
                        $timeframeLabel = 'this week';
                    }
                } else {
                    $timeframeLabel = 'this week';
                }

                if ($availableSlotCount <= 2) {
                    $availabilityLevel = 'very_low';
                } elseif ($availableSlotCount <= 6) {
                    $availabilityLevel = 'low';
                } elseif ($availableSlotCount <= 12) {
                    $availabilityLevel = 'medium';
                } else {
                    $availabilityLevel = 'high';
                }
            }

            $result = [
                'status' => $status,
                'timeframe' => 'week',
                'timeframeLabel' => $timeframeLabel,
                'weekCycle' => 'monday',
                'startDate' => $startYmd,
                'endDate' => $endYmd,
                'windowDays' => $windowDays,
                'month' => $monthName,
                'monthNumber' => $monthNumber,
                'year' => $year,
                'daysRemaining' => $windowDays,
                'availableSlotCount' => $availableSlotCount,
                'nextAvailableAt' => $nextAvailableAt,
                'nextAvailableLabel' => $nextAvailableLabel,
                'availabilityLevel' => $availabilityLevel,
                'generatedAt' => $now->format('c'),
            ];

            // Cache successful lookup for 300 seconds (5 minutes)
            $expiresAt = $currentTime + 300;
            $upsert = $db->prepare(
                'INSERT INTO first_visit_availability_cache (cache_key, payload_json, fetched_at, expires_at)
                 VALUES (:key, :payload, :fetched, :expires)
                 ON CONFLICT(cache_key) DO UPDATE SET payload_json = :payload, fetched_at = :fetched, expires_at = :expires'
            );
            $upsert->execute([
                ':key' => $cacheKey,
                ':payload' => json_encode($result, JSON_UNESCAPED_SLASHES),
                ':fetched' => $now->format('c'),
                ':expires' => $expiresAt,
            ]);

            ss_json(200, $result);
        }
    }
}

// Fallback when CAL_API_KEY is not set or Cal API is unreachable
$fallbackTimeframeLabel = ($dayOfWeek === 7) ? 'this coming week' : 'this week';
$fallback = [
    'status' => 'unavailable',
    'timeframe' => 'week',
    'timeframeLabel' => $fallbackTimeframeLabel,
    'weekCycle' => 'monday',
    'startDate' => $startYmd,
    'endDate' => $endYmd,
    'windowDays' => $windowDays,
    'month' => $monthName,
    'monthNumber' => $monthNumber,
    'year' => $year,
    'daysRemaining' => $windowDays,
    'availableSlotCount' => null,
    'nextAvailableAt' => null,
    'nextAvailableLabel' => null,
    'availabilityLevel' => 'unknown',
    'message' => 'First visits available by appointment',
    'generatedAt' => $now->format('c'),
];

// Cache fallback briefly (60s) to minimize duplicate external calls
$expiresAt = $currentTime + 60;
$upsert = $db->prepare(
    'INSERT INTO first_visit_availability_cache (cache_key, payload_json, fetched_at, expires_at)
     VALUES (:key, :payload, :fetched, :expires)
     ON CONFLICT(cache_key) DO UPDATE SET payload_json = :payload, fetched_at = :fetched, expires_at = :expires'
);
$upsert->execute([
    ':key' => $cacheKey,
    ':payload' => json_encode($fallback, JSON_UNESCAPED_SLASHES),
    ':fetched' => $now->format('c'),
    ':expires' => $expiresAt,
]);

ss_json(200, $fallback);
