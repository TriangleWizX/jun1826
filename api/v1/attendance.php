<?php
declare(strict_types=1);

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if (!ss_rate_limit('attendance:' . ss_client_ip(), 60, 240)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$db = ss_db();

if ($method === 'GET') {
    $sessionId = ss_clean_string($_GET['session_id'] ?? '', 64);
    $personId = ss_clean_string($_GET['person_id'] ?? '', 64);

    $sql = 'SELECT a.session_id, a.person_id, a.status, a.checked_in_at, a.created_at,
                   s.start_at AS session_start_at, s.end_at AS session_end_at, s.title AS session_title,
                   p.first_name, p.last_name, p.email
            FROM attendance a
            JOIN session s ON s.id = a.session_id
            JOIN person p ON p.id = a.person_id
            WHERE 1=1';
    $params = [];

    if ($sessionId !== '') {
        $sql .= ' AND a.session_id = :session_id';
        $params[':session_id'] = $sessionId;
    }
    if ($personId !== '') {
        $sql .= ' AND a.person_id = :person_id';
        $params[':person_id'] = $personId;
    }

    $sql .= ' ORDER BY s.start_at DESC, p.last_name ASC, p.first_name ASC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    ss_json(200, [
        'ok' => true,
        'attendance' => $stmt->fetchAll(PDO::FETCH_ASSOC),
    ]);
}

if ($method !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

$data = ss_request_data();
$sessionId = ss_clean_string($data['session_id'] ?? '', 64);
$personId = ss_clean_string($data['person_id'] ?? '', 64);
$status = strtolower(ss_clean_string($data['status'] ?? 'present', 20));
$checkedInAt = ss_clean_string($data['checked_in_at'] ?? ss_now_iso(), 64);
$allowedStatuses = ['present', 'late', 'excused'];

$errors = [];
if ($sessionId === '') {
    $errors['session_id'] = 'session_id is required';
}
if ($personId === '') {
    $errors['person_id'] = 'person_id is required';
}
if (!in_array($status, $allowedStatuses, true)) {
    $errors['status'] = 'status must be present, late, or excused';
}

if ($errors !== []) {
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

$now = ss_now_iso();
$stmt = $db->prepare(
    'INSERT INTO attendance (session_id, person_id, status, checked_in_at, created_at)
     VALUES (:session_id, :person_id, :status, :checked_in_at, :created_at)
     ON CONFLICT(session_id, person_id)
     DO UPDATE SET status = excluded.status, checked_in_at = excluded.checked_in_at'
);
$stmt->execute([
    ':session_id' => $sessionId,
    ':person_id' => $personId,
    ':status' => $status,
    ':checked_in_at' => $checkedInAt,
    ':created_at' => $now,
]);

ss_log_event('attendance_upserted', [
    'session_id' => $sessionId,
    'person_id' => $personId,
    'status' => $status,
]);

ss_json(200, [
    'ok' => true,
    'session_id' => $sessionId,
    'person_id' => $personId,
    'status' => $status,
]);
