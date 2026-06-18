<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('export_attendance:' . ss_client_ip(), 60, 30)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$db = ss_db();
$stmt = $db->query(
    'SELECT
        a.session_id,
        a.person_id,
        a.status,
        a.checked_in_at,
        s.start_at AS session_start_at,
        s.end_at AS session_end_at,
        s.title AS session_title,
        p.first_name,
        p.last_name,
        p.email,
        pr.code AS program_code,
        pr.name AS program_name
     FROM attendance a
     JOIN session s ON s.id = a.session_id
     JOIN person p ON p.id = a.person_id
     LEFT JOIN program pr ON pr.id = s.program_id
     ORDER BY s.start_at DESC, p.last_name ASC, p.first_name ASC'
);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$filename = 'attendance-' . gmdate('Ymd-His') . '.csv';
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$out = fopen('php://output', 'w');
if ($out === false) {
    ss_json(500, ['ok' => false, 'error' => 'Failed to open output stream']);
}

fputcsv($out, [
    'session_id',
    'session_start_at',
    'session_end_at',
    'session_title',
    'program_code',
    'program_name',
    'person_id',
    'first_name',
    'last_name',
    'email',
    'attendance_status',
    'checked_in_at',
]);

foreach ($rows as $row) {
    fputcsv($out, [
        (string)$row['session_id'],
        (string)$row['session_start_at'],
        (string)$row['session_end_at'],
        (string)($row['session_title'] ?? ''),
        (string)($row['program_code'] ?? ''),
        (string)($row['program_name'] ?? ''),
        (string)$row['person_id'],
        (string)($row['first_name'] ?? ''),
        (string)($row['last_name'] ?? ''),
        (string)($row['email'] ?? ''),
        (string)$row['status'],
        (string)($row['checked_in_at'] ?? ''),
    ]);
}

fclose($out);
ss_log_event('attendance_exported_csv', ['row_count' => count($rows)]);
exit;
