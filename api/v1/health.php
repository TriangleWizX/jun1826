<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

$db = ss_db();
$ok = false;

try {
    $ok = (bool)$db->query('SELECT 1')->fetchColumn();
} catch (Throwable $e) {
    ss_json(503, [
        'ok' => false,
        'status' => 'degraded',
        'db' => 'down',
        'timestamp' => ss_now_iso(),
    ]);
}

ss_json($ok ? 200 : 503, [
    'ok' => $ok,
    'status' => $ok ? 'healthy' : 'degraded',
    'db' => $ok ? 'up' : 'down',
    'timestamp' => ss_now_iso(),
]);

