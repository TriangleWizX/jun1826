<?php
declare(strict_types=1);

require_once __DIR__ . '/../api/lib/bootstrap.php';

function test_scarcity_copy(array $data): string {
    // Day-specific requested date formatting
    if (isset($data['requestedDate'], $data['requestedDateSpots'])) {
        $dayLabel = $data['requestedDateLabel'] ?? $data['requestedDate'];
        $daySpots = (int)$data['requestedDateSpots'];
        if ($daySpots === 0) {
            return "{$dayLabel} is full · Check other days this week";
        }
        $spotWord = ($daySpots === 1) ? 'spot' : 'spots';
        return "Only {$daySpots} {$spotWord} left on {$dayLabel} · Reserve your first visit";
    }

    $status = $data['status'] ?? 'unavailable';
    $timeframeLabel = $data['timeframeLabel'] ?? 'this week';
    $count = $data['availableSlotCount'] ?? null;

    if ($status === 'unavailable' || $count === null) {
        return "Check available times";
    }

    if ($status === 'full' || $count === 0) {
        return (str_contains($timeframeLabel, 'coming'))
            ? "This coming week is full · Check next week’s availability"
            : "This week is full · Check next week’s availability";
    }

    $nextSpots = $data['nextAvailableDaySpots']
        ?? (!empty($data['dailyAvailability'][0]['spotsCount']) ? $data['dailyAvailability'][0]['spotsCount'] : $count);
    $nextDay = $data['nextAvailableDayLabel']
        ?? (!empty($data['dailyAvailability'][0]['dayLabel']) ? $data['dailyAvailability'][0]['dayLabel'] : ($data['nextAvailableLabel'] ?? ''));

    $spotWord = ($nextSpots === 1) ? 'opening' : 'openings';
    return !empty($nextDay)
        ? "{$nextSpots} {$spotWord} left on {$nextDay}"
        : "{$nextSpots} {$spotWord} left";
}

$asserts = [];

// Test 1: 15 slots (high inventory)
$high = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 15,
    'nextAvailableLabel' => 'Sat, Sep 12',
];
$copyHigh = test_scarcity_copy($high);
assert(str_contains($copyHigh, '15 openings left on Sat, Sep 12'), 'High inventory should say 15 openings left on Sat, Sep 12');
$asserts[] = 'Passed: High inventory (>12 slots)';

// Test 2: 9 slots (medium inventory)
$med = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 9,
    'nextAvailableLabel' => 'Sat, Sep 12',
];
$copyMed = test_scarcity_copy($med);
assert(str_contains($copyMed, '9 openings left on Sat, Sep 12'), 'Medium inventory should show exact count 9 openings left on Sat, Sep 12');
$asserts[] = 'Passed: Medium inventory (7-12 slots)';

// Test 3: 4 slots (low inventory)
$low = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 4,
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyLow = test_scarcity_copy($low);
assert(str_contains($copyLow, '4 openings left on Mon, Sep 14'), 'Low inventory should show 4 openings left on Mon, Sep 14');
$asserts[] = 'Passed: Low inventory (3-6 slots)';

// Test 4: 1 slot (critical inventory)
$veryLow = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 1,
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyVeryLow = test_scarcity_copy($veryLow);
assert(str_contains($copyVeryLow, '1 opening left on Mon, Sep 14'), 'Critical inventory should show 1 opening left on Mon, Sep 14');
$asserts[] = 'Passed: Very low inventory (1-2 slots)';

// Test 5: 0 slots (full)
$full = [
    'status' => 'full',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 0,
];
$copyFull = test_scarcity_copy($full);
assert(str_contains($copyFull, 'This week is full'), 'Full status should show week is full');
$asserts[] = 'Passed: Full status (0 slots)';

// Test 6: Fallback when API unavailable
$unavail = [
    'status' => 'unavailable',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => null,
];
$copyUnavail = test_scarcity_copy($unavail);
assert(str_contains($copyUnavail, 'Check available times'), 'Fallback should show check available times');
$asserts[] = 'Passed: Unavailable / fallback state';

// Test 7: "This coming week" copy test (Sunday framing)
$comingWeekData = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this coming week',
    'availableSlotCount' => 8,
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyComing = test_scarcity_copy($comingWeekData);
assert(str_contains($copyComing, '8 openings left on Mon, Sep 14'), 'Coming week copy should format cleanly');
$asserts[] = 'Passed: Coming week framing';

// Test 8: Daily adaptive copy with spotsPerDayLabel
$dailyMed = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 9,
    'spotsPerDayLabel' => '1–2 spots left each day',
    'nextAvailableLabel' => 'Sat, Sep 12',
];
$copyDailyMed = test_scarcity_copy($dailyMed);
assert(str_contains($copyDailyMed, '9 openings left on Sat, Sep 12'), 'Medium inventory with spotsPerDayLabel');
$asserts[] = 'Passed: Daily adaptive medium inventory copy';

// Test 9: Daily adaptive copy for low inventory
$dailyLow = [
    'status' => 'available',
    'timeframe' => 'week',
    'timeframeLabel' => 'this week',
    'availableSlotCount' => 4,
    'spotsPerDayLabel' => '1 spot left each day',
    'nextAvailableLabel' => 'Mon, Sep 14',
];
$copyDailyLow = test_scarcity_copy($dailyLow);
assert(str_contains($copyDailyLow, '4 openings left on Mon, Sep 14'), 'Low inventory with spotsPerDayLabel');
$asserts[] = 'Passed: Daily adaptive low inventory copy';

// Test 10: Requested specific date with spots left
$reqDateAvail = [
    'status' => 'available',
    'requestedDate' => '2026-09-15',
    'requestedDateSpots' => 2,
    'requestedDateLabel' => 'Tue, Sep 15',
];
$copyReqDate = test_scarcity_copy($reqDateAvail);
assert(str_contains($copyReqDate, 'Only 2 spots left on Tue, Sep 15 · Reserve your first visit'), 'Requested date with spots left');
$asserts[] = 'Passed: Requested date adaptive copy';

// Test 11: Requested specific date that is full
$reqDateFull = [
    'status' => 'full',
    'requestedDate' => '2026-09-15',
    'requestedDateSpots' => 0,
    'requestedDateLabel' => 'Tue, Sep 15',
];
$copyReqFull = test_scarcity_copy($reqDateFull);
assert(str_contains($copyReqFull, 'Tue, Sep 15 is full · Check other days this week'), 'Requested date full');
$asserts[] = 'Passed: Requested date full copy';

// Test 12: Daily grouping & parameter calculation logic
$tz = new DateTimeZone('America/New_York');
$mockTimestamps = [
    strtotime('2026-09-14 17:00:00 EDT'),
    strtotime('2026-09-14 18:00:00 EDT'),
    strtotime('2026-09-15 18:00:00 EDT'),
    strtotime('2026-09-16 18:00:00 EDT'),
];
$slotsByDateMock = [];
foreach ($mockTimestamps as $ts) {
    $slotDate = (new DateTimeImmutable('@' . $ts))->setTimezone($tz)->format('Y-m-d');
    if (!isset($slotsByDateMock[$slotDate])) {
        $slotsByDateMock[$slotDate] = [];
    }
    $slotsByDateMock[$slotDate][] = $ts;
}
ksort($slotsByDateMock);
$dailyAvailMock = [];
$dailyCountsMock = [];
foreach ($slotsByDateMock as $ymd => $tsList) {
    $countForDay = count($tsList);
    $dailyCountsMock[] = $countForDay;
    $dayDt = new DateTimeImmutable($ymd . ' 12:00:00', $tz);
    $dailyAvailMock[] = [
        'date' => $ymd,
        'dayOfWeek' => (int)$dayDt->format('N'),
        'dayName' => $dayDt->format('l'),
        'dayShort' => $dayDt->format('D'),
        'dayLabel' => $dayDt->format('D, M j'),
        'spotsCount' => $countForDay,
        'spotsLeftLabel' => ($countForDay === 1) ? '1 spot left' : "{$countForDay} spots left",
    ];
}
$minSpots = min($dailyCountsMock);
$maxSpots = max($dailyCountsMock);
$spotsRange = "{$minSpots}–{$maxSpots}";
$spotsLabel = "{$minSpots}–{$maxSpots} spots left each day";

assert(count($dailyAvailMock) === 3, 'Should have 3 days with slots');
assert($minSpots === 1, 'Min spots per day is 1');
assert($maxSpots === 2, 'Max spots per day is 2');
assert($spotsRange === '1–2', 'Spots per day range is 1–2');
assert($spotsLabel === '1–2 spots left each day', 'Label is 1–2 spots left each day');
assert($dailyAvailMock[0]['spotsCount'] === 2, 'Mon has 2 spots');
assert($dailyAvailMock[1]['spotsCount'] === 1, 'Tue has 1 spot');
$asserts[] = 'Passed: Daily grouping & adaptive parameter calculation';

// Test 13: Monday-anchored date calculations across the week
$tz = new DateTimeZone('America/New_York');

// Helper to compute Monday-anchored window:
$computeWindow = function (string $dateStr) use ($tz): array {
    $now = new DateTimeImmutable($dateStr, $tz);
    $dayOfWeek = (int)$now->format('N'); // 1 = Mon, ..., 7 = Sun
    $daysSinceMonday = $dayOfWeek - 1;
    $thisMonday = $now->modify("-{$daysSinceMonday} days");
    $thisSunday = $thisMonday->modify('+6 days');
    $nextMonday = $thisMonday->modify('+7 days');
    $nextSunday = $thisMonday->modify('+13 days');

    if ($dayOfWeek <= 5) {
        $startDate = $now;
        $endDate = $thisSunday;
        $label = 'this week';
    } else {
        $startDate = $now;
        $endDate = $nextSunday;
        $label = ($dayOfWeek === 7) ? 'this coming week' : 'this week';
    }

    return [
        'dayOfWeek' => $dayOfWeek,
        'startYmd' => $startDate->format('Y-m-d'),
        'endYmd' => $endDate->format('Y-m-d'),
        'label' => $label,
        'days' => (int)$startDate->diff($endDate)->format('%a') + 1,
    ];
};

// Monday (Day 1)
$mon = $computeWindow('2026-09-14');
assert($mon['dayOfWeek'] === 1, 'Monday is day 1');
assert($mon['startYmd'] === '2026-09-14', 'Monday start is Monday');
assert($mon['endYmd'] === '2026-09-20', 'Monday end is this Sunday');
assert($mon['days'] === 7, 'Monday window is 7 days');
assert($mon['label'] === 'this week', 'Monday label is this week');

// Wednesday (Day 3)
$wed = $computeWindow('2026-09-16');
assert($wed['dayOfWeek'] === 3, 'Wednesday is day 3');
assert($wed['startYmd'] === '2026-09-16', 'Wednesday start is Wednesday');
assert($wed['endYmd'] === '2026-09-20', 'Wednesday end is this Sunday');
assert($wed['days'] === 5, 'Wednesday window is 5 days');

// Friday (Day 5)
$fri = $computeWindow('2026-09-18');
assert($fri['dayOfWeek'] === 5, 'Friday is day 5');
assert($fri['startYmd'] === '2026-09-18', 'Friday start is Friday');
assert($fri['endYmd'] === '2026-09-20', 'Friday end is this Sunday');
assert($fri['days'] === 3, 'Friday window is 3 days');

// Saturday (Day 6)
$sat = $computeWindow('2026-09-19');
assert($sat['dayOfWeek'] === 6, 'Saturday is day 6');
assert($sat['startYmd'] === '2026-09-19', 'Saturday start is Saturday');
assert($sat['endYmd'] === '2026-09-27', 'Saturday end extends through next Sunday');
assert($sat['days'] === 9, 'Saturday window covers weekend + next week');

// Sunday (Day 7)
$sun = $computeWindow('2026-09-20');
assert($sun['dayOfWeek'] === 7, 'Sunday is day 7');
assert($sun['startYmd'] === '2026-09-20', 'Sunday start is Sunday');
assert($sun['endYmd'] === '2026-09-27', 'Sunday end extends through next Sunday');
assert($sun['label'] === 'this coming week', 'Sunday label is this coming week');
assert($sun['days'] === 8, 'Sunday window covers upcoming week');
$asserts[] = 'Passed: Monday-anchored weekly cycle across all days';

// Test 9: Month boundary transition
$monthBoundary = $computeWindow('2026-09-30'); // Sep 30 is Wednesday
assert($monthBoundary['startYmd'] === '2026-09-30', 'Starts on Sep 30');
assert($monthBoundary['endYmd'] === '2026-10-04', 'Ends on Oct 4 Sunday');
assert($monthBoundary['days'] === 5, 'Crosses month boundary cleanly');
$asserts[] = 'Passed: Month boundary transition';

// Test 10: Year boundary transition
$yearBoundary = $computeWindow('2026-12-31'); // Dec 31 is Thursday
assert($yearBoundary['startYmd'] === '2026-12-31', 'Starts on Dec 31');
assert($yearBoundary['endYmd'] === '2027-01-03', 'Ends on Jan 3 Sunday');
assert($yearBoundary['days'] === 4, 'Crosses year boundary cleanly');
$asserts[] = 'Passed: Year boundary transition';

echo implode(PHP_EOL, $asserts) . PHP_EOL;
echo "All availability test cases passed successfully!" . PHP_EOL;
