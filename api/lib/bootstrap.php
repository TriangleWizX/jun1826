<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function ss_load_env_file(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $parts = explode('=', $trimmed, 2);
        if (count($parts) !== 2) {
            continue;
        }

        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $value = trim($value, "\"'");

        if ($key !== '' && getenv($key) === false) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
        }
    }
}

function ss_env(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }
    return $value;
}

function ss_now_iso(): string
{
    return gmdate('c');
}

function ss_uuid_v4(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function ss_json(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function ss_request_body_json(): array
{
    $raw = file_get_contents('php://input');
    if (!is_string($raw) || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }
    return $decoded;
}

function ss_request_data(): array
{
    $method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
    if ($method !== 'POST') {
        return [];
    }

    if (!empty($_POST)) {
        return $_POST;
    }
    return ss_request_body_json();
}

function ss_clean_string(mixed $value, int $maxLen = 255): string
{
    if (!is_scalar($value)) {
        return '';
    }
    $str = trim((string)$value);
    $str = preg_replace('/\s+/', ' ', $str) ?? '';
    if ($maxLen > 0 && strlen($str) > $maxLen) {
        $str = substr($str, 0, $maxLen);
    }
    return $str;
}

function ss_client_ip(): string
{
    $xff = (string)($_SERVER['HTTP_X_FORWARDED_FOR'] ?? '');
    if ($xff !== '') {
        $parts = explode(',', $xff);
        $candidate = trim($parts[0] ?? '');
        if ($candidate !== '') {
            return $candidate;
        }
    }
    $remote = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    return $remote !== '' ? $remote : '0.0.0.0';
}

function ss_ip_hash(string $ip): string
{
    $salt = ss_env('IP_HASH_SALT', 'replace-me');
    return hash('sha256', $salt . '|' . $ip);
}

function ss_rate_limit(string $key, int $windowSeconds, int $maxHits): bool
{
    $db = ss_db();
    $windowStart = time() - (time() % $windowSeconds);
    $bucket = $key . ':' . $windowSeconds;

    $select = $db->prepare('SELECT window_start, hit_count FROM rate_limits WHERE bucket_key = :bucket');
    $select->execute([':bucket' => $bucket]);
    $row = $select->fetch(PDO::FETCH_ASSOC);

    if ($row === false) {
        $insert = $db->prepare(
            'INSERT INTO rate_limits (bucket_key, window_start, hit_count) VALUES (:bucket, :window_start, 1)'
        );
        $insert->execute([
            ':bucket' => $bucket,
            ':window_start' => $windowStart,
        ]);
        return true;
    }

    $storedWindow = (int)$row['window_start'];
    $hits = (int)$row['hit_count'];

    if ($storedWindow !== $windowStart) {
        $reset = $db->prepare(
            'UPDATE rate_limits SET window_start = :window_start, hit_count = 1 WHERE bucket_key = :bucket'
        );
        $reset->execute([
            ':bucket' => $bucket,
            ':window_start' => $windowStart,
        ]);
        return true;
    }

    if ($hits >= $maxHits) {
        return false;
    }

    $increment = $db->prepare('UPDATE rate_limits SET hit_count = hit_count + 1 WHERE bucket_key = :bucket');
    $increment->execute([':bucket' => $bucket]);

    if (random_int(1, 25) === 1) {
        $cleanupBefore = $windowStart - ($windowSeconds * 2);
        $cleanup = $db->prepare('DELETE FROM rate_limits WHERE window_start < :cleanup_before');
        $cleanup->execute([':cleanup_before' => $cleanupBefore]);
    }

    return true;
}

function ss_log_event(string $eventType, array $payload = []): void
{
    $db = ss_db();
    $stmt = $db->prepare(
        'INSERT INTO event_log (created_at, event_type, payload_json, ip_hash, user_agent)
         VALUES (:created_at, :event_type, :payload_json, :ip_hash, :user_agent)'
    );
    $stmt->execute([
        ':created_at' => ss_now_iso(),
        ':event_type' => $eventType,
        ':payload_json' => json_encode($payload, JSON_UNESCAPED_SLASHES),
        ':ip_hash' => ss_ip_hash(ss_client_ip()),
        ':user_agent' => ss_clean_string($_SERVER['HTTP_USER_AGENT'] ?? '', 512),
    ]);
}

function ss_require_ops_auth(): void
{
    $expected = ss_env('OPS_API_KEY', '');
    if ($expected === '') {
        ss_json(503, ['ok' => false, 'error' => 'Ops endpoints not configured']);
    }

    $provided = ss_clean_string($_SERVER['HTTP_X_OPS_API_KEY'] ?? '', 255);
    if ($provided === '') {
        $authHeader = ss_clean_string($_SERVER['HTTP_AUTHORIZATION'] ?? '', 512);
        if (preg_match('/^Bearer\s+(.+)$/i', $authHeader, $m) === 1) {
            $provided = ss_clean_string($m[1], 255);
        }
    }

    if ($provided === '' || !hash_equals($expected, $provided)) {
        ss_log_event('ops_auth_rejected', ['path' => (string)($_SERVER['REQUEST_URI'] ?? '')]);
        ss_json(401, ['ok' => false, 'error' => 'Unauthorized']);
    }
}

ss_load_env_file(dirname(__DIR__, 2) . '/.env');
date_default_timezone_set('UTC');
ss_db();

if (PHP_SAPI !== 'cli') {
    header('X-Content-Type-Options: nosniff');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Ops-Api-Key, X-Booking-Webhook-Secret, X-Webhook-Secret');
    header('Vary: Origin');

    $allowedOriginsRaw = ss_env('ALLOWED_ORIGINS', '');
    $allowedOrigins = array_values(array_filter(array_map('trim', explode(',', (string)$allowedOriginsRaw))));
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');

    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }

    if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
