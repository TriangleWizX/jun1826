<?php
declare(strict_types=1);

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('csp_reports:' . ss_client_ip(), 60, 120)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$raw = file_get_contents('php://input');
$payload = [];
if (is_string($raw) && trim($raw) !== '') {
    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        if (isset($decoded['csp-report']) && is_array($decoded['csp-report'])) {
            $payload = $decoded['csp-report'];
        } else {
            $payload = $decoded;
        }
    }
}

$summary = [
    'document_uri' => ss_clean_string((string)($payload['document-uri'] ?? $payload['documentURL'] ?? ''), 2048),
    'blocked_uri' => ss_clean_string((string)($payload['blocked-uri'] ?? $payload['blockedURL'] ?? ''), 2048),
    'violated_directive' => ss_clean_string((string)($payload['violated-directive'] ?? $payload['effectiveDirective'] ?? ''), 200),
    'source_file' => ss_clean_string((string)($payload['source-file'] ?? $payload['sourceFile'] ?? ''), 2048),
    'line_number' => (int)($payload['line-number'] ?? $payload['lineNumber'] ?? 0),
    'status_code' => (int)($payload['status-code'] ?? $payload['statusCode'] ?? 0),
];

ss_log_event('csp_report', $summary);

ss_json(202, ['ok' => true]);
