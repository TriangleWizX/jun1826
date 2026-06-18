<?php
declare(strict_types=1);

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if (!ss_rate_limit('sessions:' . ss_client_ip(), 60, 180)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$db = ss_db();

if ($method === 'GET') {
    $dateFrom = ss_clean_string($_GET['date_from'] ?? '', 32);
    $dateTo = ss_clean_string($_GET['date_to'] ?? '', 32);
    $programId = ss_clean_string($_GET['program_id'] ?? '', 64);

    $sql = 'SELECT s.id, s.location_id, s.program_id, s.title, s.start_at, s.end_at, s.capacity,
                   s.created_at, s.updated_at,
                   p.code AS program_code, p.name AS program_name,
                   l.name AS location_name
            FROM session s
            LEFT JOIN program p ON p.id = s.program_id
            LEFT JOIN location l ON l.id = s.location_id
            WHERE 1=1';
    $params = [];

    if ($dateFrom !== '') {
        $sql .= ' AND s.start_at >= :date_from';
        $params[':date_from'] = $dateFrom;
    }
    if ($dateTo !== '') {
        $sql .= ' AND s.start_at <= :date_to';
        $params[':date_to'] = $dateTo;
    }
    if ($programId !== '') {
        $sql .= ' AND s.program_id = :program_id';
        $params[':program_id'] = $programId;
    }

    $sql .= ' ORDER BY s.start_at ASC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    ss_json(200, [
        'ok' => true,
        'sessions' => $stmt->fetchAll(PDO::FETCH_ASSOC),
    ]);
}

if ($method !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

$data = ss_request_data();
$locationId = ss_clean_string($data['location_id'] ?? '', 64);
$programId = ss_clean_string($data['program_id'] ?? '', 64);
$title = ss_clean_string($data['title'] ?? '', 140);
$startAt = ss_clean_string($data['start_at'] ?? '', 64);
$endAt = ss_clean_string($data['end_at'] ?? '', 64);
$capacityRaw = $data['capacity'] ?? null;
$capacity = is_numeric($capacityRaw) ? (int)$capacityRaw : null;

$errors = [];
if ($locationId === '') {
    $errors['location_id'] = 'location_id is required';
}
if ($programId === '') {
    $errors['program_id'] = 'program_id is required';
}
if ($startAt === '') {
    $errors['start_at'] = 'start_at is required';
}
if ($endAt === '') {
    $errors['end_at'] = 'end_at is required';
}
if ($capacity !== null && $capacity < 0) {
    $errors['capacity'] = 'capacity must be >= 0';
}

if ($errors !== []) {
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

$id = ss_uuid_v4();
$now = ss_now_iso();
$stmt = $db->prepare(
    'INSERT INTO session (id, location_id, program_id, title, start_at, end_at, capacity, created_at, updated_at)
     VALUES (:id, :location_id, :program_id, :title, :start_at, :end_at, :capacity, :created_at, :updated_at)'
);
$stmt->execute([
    ':id' => $id,
    ':location_id' => $locationId,
    ':program_id' => $programId,
    ':title' => $title !== '' ? $title : null,
    ':start_at' => $startAt,
    ':end_at' => $endAt,
    ':capacity' => $capacity,
    ':created_at' => $now,
    ':updated_at' => $now,
]);

ss_log_event('session_created', ['session_id' => $id, 'program_id' => $programId]);
ss_json(201, ['ok' => true, 'id' => $id]);
