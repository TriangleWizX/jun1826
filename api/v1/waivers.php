<?php
declare(strict_types=1);

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if (!ss_rate_limit('waivers:' . ss_client_ip(), 60, 120)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$db = ss_db();

if ($method === 'GET') {
    $personId = ss_clean_string($_GET['person_id'] ?? '', 64);
    $sql = 'SELECT id, person_id, guardian_id, signed_at, waiver_version, storage_uri, file_sha256, ip_address, created_at
            FROM waiver';
    $params = [];

    if ($personId !== '') {
        $sql .= ' WHERE person_id = :person_id';
        $params[':person_id'] = $personId;
    }

    $sql .= ' ORDER BY signed_at DESC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    ss_json(200, [
        'ok' => true,
        'waivers' => $stmt->fetchAll(PDO::FETCH_ASSOC),
    ]);
}

if ($method !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

$data = ss_request_data();
$personId = ss_clean_string($data['person_id'] ?? '', 64);
$guardianId = ss_clean_string($data['guardian_id'] ?? '', 64);
$signedAt = ss_clean_string($data['signed_at'] ?? ss_now_iso(), 64);
$waiverVersion = ss_clean_string($data['waiver_version'] ?? '', 40);
$storageUri = ss_clean_string($data['storage_uri'] ?? '', 255);
$fileSha256 = strtolower(ss_clean_string($data['file_sha256'] ?? '', 64));
$ipAddress = ss_clean_string($data['ip_address'] ?? ss_client_ip(), 45);

$errors = [];
if ($personId === '') {
    $errors['person_id'] = 'person_id is required';
}
if ($waiverVersion === '') {
    $errors['waiver_version'] = 'waiver_version is required';
}
if ($storageUri === '') {
    $errors['storage_uri'] = 'storage_uri is required';
}
if (!preg_match('/^[a-f0-9]{64}$/', $fileSha256)) {
    $errors['file_sha256'] = 'file_sha256 must be a 64-char lowercase hex sha256';
}

$personStmt = $db->prepare('SELECT id, is_minor FROM person WHERE id = :id');
$personStmt->execute([':id' => $personId]);
$personRow = $personStmt->fetch(PDO::FETCH_ASSOC);
if ($personRow === false) {
    $errors['person_id'] = 'person not found';
}

if ($errors !== []) {
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

$isMinor = ((int)$personRow['is_minor']) === 1;
if ($isMinor && $guardianId === '') {
    ss_json(422, ['ok' => false, 'errors' => ['guardian_id' => 'guardian_id is required for minors']]);
}

if ($guardianId !== '') {
    $guardianStmt = $db->prepare('SELECT id FROM person WHERE id = :id');
    $guardianStmt->execute([':id' => $guardianId]);
    if ($guardianStmt->fetch(PDO::FETCH_ASSOC) === false) {
        ss_json(422, ['ok' => false, 'errors' => ['guardian_id' => 'guardian not found']]);
    }

    if ($isMinor) {
        $householdStmt = $db->prepare(
            'SELECT 1
             FROM household_member hm_person
             JOIN household_member hm_guardian
                ON hm_person.household_id = hm_guardian.household_id
             WHERE hm_person.person_id = :person_id
               AND hm_guardian.person_id = :guardian_id
             LIMIT 1'
        );
        $householdStmt->execute([
            ':person_id' => $personId,
            ':guardian_id' => $guardianId,
        ]);

        if ($householdStmt->fetchColumn() === false) {
            ss_json(422, [
                'ok' => false,
                'errors' => ['guardian_id' => 'guardian must be in the same household for minors'],
            ]);
        }
    }
}

$id = ss_uuid_v4();
$createdAt = ss_now_iso();
$insert = $db->prepare(
    'INSERT INTO waiver (id, person_id, guardian_id, signed_at, waiver_version, storage_uri, file_sha256, ip_address, created_at)
     VALUES (:id, :person_id, :guardian_id, :signed_at, :waiver_version, :storage_uri, :file_sha256, :ip_address, :created_at)'
);
$insert->execute([
    ':id' => $id,
    ':person_id' => $personId,
    ':guardian_id' => $guardianId !== '' ? $guardianId : null,
    ':signed_at' => $signedAt,
    ':waiver_version' => $waiverVersion,
    ':storage_uri' => $storageUri,
    ':file_sha256' => $fileSha256,
    ':ip_address' => $ipAddress !== '' ? $ipAddress : null,
    ':created_at' => $createdAt,
]);

ss_log_event('waiver_created', ['waiver_id' => $id, 'person_id' => $personId, 'is_minor' => $isMinor]);
ss_json(201, ['ok' => true, 'id' => $id]);
