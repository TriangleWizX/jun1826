<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('reviews:' . ss_client_ip(), 60, 120)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$db = ss_db();
$stmt = $db->query(
    'SELECT provider, payload_json, fetched_at
     FROM review_cache
     ORDER BY fetched_at DESC
     LIMIT 1'
);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

header('Cache-Control: public, max-age=300, s-maxage=300');

if ($row === false) {
    ss_json(200, [
        'ok' => true,
        'provider' => ss_env('REVIEWS_PROVIDER', 'google'),
        'fetched_at' => null,
        'reviews' => [],
    ]);
}

$payload = json_decode((string)$row['payload_json'], true);
if (!is_array($payload)) {
    $payload = [];
}

ss_json(200, [
    'ok' => true,
    'provider' => (string)$row['provider'],
    'fetched_at' => (string)$row['fetched_at'],
    'reviews' => $payload,
]);

