<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/api/lib/bootstrap.php';

$url = ss_env('REVIEWS_SOURCE_URL', '');
if ($url === '') {
    fwrite(STDERR, "REVIEWS_SOURCE_URL is not set.\n");
    exit(1);
}

$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'timeout' => 10,
        'ignore_errors' => true,
        'header' => "Accept: application/json\r\n",
    ],
]);

$raw = @file_get_contents($url, false, $context);
if (!is_string($raw) || $raw === '') {
    fwrite(STDERR, "Failed to fetch reviews source.\n");
    exit(1);
}

$decoded = json_decode($raw, true);
if (!is_array($decoded)) {
    fwrite(STDERR, "Reviews source did not return JSON array/object.\n");
    exit(1);
}

$provider = ss_env('REVIEWS_PROVIDER', 'google') ?? 'google';
$db = ss_db();

$stmt = $db->prepare(
    'INSERT INTO review_cache (provider, payload_json, fetched_at)
     VALUES (:provider, :payload_json, :fetched_at)'
);
$stmt->execute([
    ':provider' => $provider,
    ':payload_json' => json_encode($decoded, JSON_UNESCAPED_SLASHES),
    ':fetched_at' => ss_now_iso(),
]);

ss_log_event('reviews_refreshed', [
    'provider' => $provider,
    'records' => is_countable($decoded) ? count($decoded) : null,
]);

echo "Reviews refreshed for provider={$provider}\n";

