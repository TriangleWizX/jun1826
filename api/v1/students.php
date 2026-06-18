<?php
declare(strict_types=1);

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if (!in_array($method, ['GET', 'POST'], true)) {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('students:' . ss_client_ip(), 60, 120)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$db = ss_db();

if ($method === 'GET') {
    $status = strtolower(ss_clean_string($_GET['status'] ?? 'active', 32));
    $allowedStatuses = ['lead', 'active', 'inactive', 'archived', 'all'];
    if (!in_array($status, $allowedStatuses, true)) {
        $status = 'active';
    }

    $sql = 'SELECT
        p.id,
        p.first_name,
        p.last_name,
        p.email,
        p.phone,
        p.birthdate,
        p.is_minor,
        p.status AS person_status,
        p.created_at,
        p.updated_at,
        e.id AS enrollment_id,
        e.status AS enrollment_status,
        e.start_date,
        e.end_date,
        pr.id AS program_id,
        pr.code AS program_code,
        pr.name AS program_name,
        pl.id AS plan_id,
        pl.code AS plan_code,
        pl.name AS plan_name
    FROM person p
    LEFT JOIN enrollment e ON e.person_id = p.id
    LEFT JOIN program pr ON pr.id = e.program_id
    LEFT JOIN plan pl ON pl.id = e.plan_id';
    $params = [];

    if ($status !== 'all') {
        $sql .= ' WHERE p.status = :status';
        $params[':status'] = $status;
    }

    $sql .= ' ORDER BY p.updated_at DESC, e.start_date DESC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $studentsById = [];
    foreach ($rows as $row) {
        $id = (string)$row['id'];
        if (!isset($studentsById[$id])) {
            $studentsById[$id] = [
                'id' => $id,
                'first_name' => (string)($row['first_name'] ?? ''),
                'last_name' => (string)($row['last_name'] ?? ''),
                'email' => $row['email'] !== null ? (string)$row['email'] : null,
                'phone' => $row['phone'] !== null ? (string)$row['phone'] : null,
                'birthdate' => $row['birthdate'] !== null ? (string)$row['birthdate'] : null,
                'is_minor' => ((int)$row['is_minor']) === 1,
                'status' => (string)$row['person_status'],
                'created_at' => (string)$row['created_at'],
                'updated_at' => (string)$row['updated_at'],
                'enrollments' => [],
            ];
        }

        if ($row['enrollment_id'] !== null) {
            $studentsById[$id]['enrollments'][] = [
                'id' => (string)$row['enrollment_id'],
                'status' => (string)$row['enrollment_status'],
                'start_date' => (string)$row['start_date'],
                'end_date' => $row['end_date'] !== null ? (string)$row['end_date'] : null,
                'program' => [
                    'id' => $row['program_id'] !== null ? (string)$row['program_id'] : null,
                    'code' => $row['program_code'] !== null ? (string)$row['program_code'] : null,
                    'name' => $row['program_name'] !== null ? (string)$row['program_name'] : null,
                ],
                'plan' => [
                    'id' => $row['plan_id'] !== null ? (string)$row['plan_id'] : null,
                    'code' => $row['plan_code'] !== null ? (string)$row['plan_code'] : null,
                    'name' => $row['plan_name'] !== null ? (string)$row['plan_name'] : null,
                ],
            ];
        }
    }

    ss_json(200, [
        'ok' => true,
        'count' => count($studentsById),
        'students' => array_values($studentsById),
    ]);
}

$data = ss_request_data();

$firstName = ss_clean_string($data['first_name'] ?? '', 80);
$lastName = ss_clean_string($data['last_name'] ?? '', 80);
$email = strtolower(ss_clean_string($data['email'] ?? '', 190));
$phone = ss_clean_string($data['phone'] ?? '', 30);
$birthdate = ss_clean_string($data['birthdate'] ?? '', 20);
$isMinor = (int)(($data['is_minor'] ?? false) ? 1 : 0);
$personStatus = strtolower(ss_clean_string($data['status'] ?? 'active', 20));
$notes = ss_clean_string($data['notes'] ?? '', 2000);

$householdName = ss_clean_string($data['household_name'] ?? '', 120);
$guardianPersonId = ss_clean_string($data['guardian_person_id'] ?? '', 64);
$studentRole = strtolower(ss_clean_string($data['household_role'] ?? ($isMinor === 1 ? 'child' : 'adult'), 20));

$programId = ss_clean_string($data['program_id'] ?? '', 64);
$programCode = strtolower(ss_clean_string($data['program_code'] ?? '', 20));
$planId = ss_clean_string($data['plan_id'] ?? '', 64);
$enrollmentStatus = strtolower(ss_clean_string($data['enrollment_status'] ?? 'active', 20));
$startDate = ss_clean_string($data['start_date'] ?? '', 20);
$endDate = ss_clean_string($data['end_date'] ?? '', 20);

$errors = [];
if ($firstName === '') {
    $errors['first_name'] = 'first_name is required';
}
if ($lastName === '') {
    $errors['last_name'] = 'last_name is required';
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'email format is invalid';
}
if ($phone === '' && $email === '') {
    $errors['contact'] = 'email or phone is required';
}
if ($birthdate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $birthdate)) {
    $errors['birthdate'] = 'birthdate must be YYYY-MM-DD';
}
if (!in_array($personStatus, ['lead', 'active', 'inactive', 'archived'], true)) {
    $errors['status'] = 'status must be lead, active, inactive, or archived';
}
if (!in_array($studentRole, ['guardian', 'child', 'adult', 'emergency'], true)) {
    $errors['household_role'] = 'household_role must be guardian, child, adult, or emergency';
}
if ($programId === '' && $programCode === '') {
    $errors['program'] = 'program_id or program_code is required';
}
if ($startDate === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
    $errors['start_date'] = 'start_date must be YYYY-MM-DD';
}
if ($endDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
    $errors['end_date'] = 'end_date must be YYYY-MM-DD when provided';
}
if (!in_array($enrollmentStatus, ['active', 'paused', 'ended'], true)) {
    $errors['enrollment_status'] = 'enrollment_status must be active, paused, or ended';
}

if ($errors !== []) {
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

if ($email !== '') {
    $dupeStmt = $db->prepare('SELECT id FROM person WHERE email = :email LIMIT 1');
    $dupeStmt->execute([':email' => $email]);
    if ($dupeStmt->fetch(PDO::FETCH_ASSOC) !== false) {
        ss_json(409, ['ok' => false, 'error' => 'person with this email already exists']);
    }
}

if ($programId === '' && $programCode !== '') {
    $programLookup = $db->prepare('SELECT id FROM program WHERE code = :code LIMIT 1');
    $programLookup->execute([':code' => $programCode]);
    $programRow = $programLookup->fetch(PDO::FETCH_ASSOC);
    if ($programRow === false) {
        ss_json(422, ['ok' => false, 'errors' => ['program_code' => 'program not found']]);
    }
    $programId = (string)$programRow['id'];
}

$programCheck = $db->prepare('SELECT id FROM program WHERE id = :id LIMIT 1');
$programCheck->execute([':id' => $programId]);
if ($programCheck->fetch(PDO::FETCH_ASSOC) === false) {
    ss_json(422, ['ok' => false, 'errors' => ['program_id' => 'program not found']]);
}

if ($planId !== '') {
    $planCheck = $db->prepare('SELECT id FROM plan WHERE id = :id AND program_id = :program_id LIMIT 1');
    $planCheck->execute([
        ':id' => $planId,
        ':program_id' => $programId,
    ]);
    if ($planCheck->fetch(PDO::FETCH_ASSOC) === false) {
        ss_json(422, ['ok' => false, 'errors' => ['plan_id' => 'plan not found for program']]);
    }
}

if ($guardianPersonId !== '') {
    $guardianCheck = $db->prepare('SELECT id FROM person WHERE id = :id LIMIT 1');
    $guardianCheck->execute([':id' => $guardianPersonId]);
    if ($guardianCheck->fetch(PDO::FETCH_ASSOC) === false) {
        ss_json(422, ['ok' => false, 'errors' => ['guardian_person_id' => 'guardian not found']]);
    }
}

$now = ss_now_iso();
$personId = ss_uuid_v4();
$householdId = ss_uuid_v4();
$enrollmentId = ss_uuid_v4();

if ($householdName === '') {
    $householdName = trim($lastName . ' Household');
    if ($householdName === '') {
        $householdName = trim($firstName . ' Household');
    }
}

try {
    $db->beginTransaction();

    $insertPerson = $db->prepare(
        'INSERT INTO person (
            id, first_name, last_name, email, phone, birthdate, is_minor, status, notes, created_at, updated_at
         ) VALUES (
            :id, :first_name, :last_name, :email, :phone, :birthdate, :is_minor, :status, :notes, :created_at, :updated_at
         )'
    );
    $insertPerson->execute([
        ':id' => $personId,
        ':first_name' => $firstName,
        ':last_name' => $lastName,
        ':email' => $email !== '' ? $email : null,
        ':phone' => $phone !== '' ? $phone : null,
        ':birthdate' => $birthdate !== '' ? $birthdate : null,
        ':is_minor' => $isMinor,
        ':status' => $personStatus,
        ':notes' => $notes !== '' ? $notes : null,
        ':created_at' => $now,
        ':updated_at' => $now,
    ]);

    $insertHousehold = $db->prepare(
        'INSERT INTO household (id, name, created_at, updated_at)
         VALUES (:id, :name, :created_at, :updated_at)'
    );
    $insertHousehold->execute([
        ':id' => $householdId,
        ':name' => $householdName !== '' ? $householdName : null,
        ':created_at' => $now,
        ':updated_at' => $now,
    ]);

    $insertHouseholdMember = $db->prepare(
        'INSERT INTO household_member (household_id, person_id, role, is_primary, created_at)
         VALUES (:household_id, :person_id, :role, :is_primary, :created_at)'
    );
    $insertHouseholdMember->execute([
        ':household_id' => $householdId,
        ':person_id' => $personId,
        ':role' => $studentRole,
        ':is_primary' => 1,
        ':created_at' => $now,
    ]);

    if ($guardianPersonId !== '') {
        $insertHouseholdMember->execute([
            ':household_id' => $householdId,
            ':person_id' => $guardianPersonId,
            ':role' => 'guardian',
            ':is_primary' => 0,
            ':created_at' => $now,
        ]);
    }

    $insertEnrollment = $db->prepare(
        'INSERT INTO enrollment (
            id, person_id, program_id, plan_id, status, start_date, end_date, created_at, updated_at
         ) VALUES (
            :id, :person_id, :program_id, :plan_id, :status, :start_date, :end_date, :created_at, :updated_at
         )'
    );
    $insertEnrollment->execute([
        ':id' => $enrollmentId,
        ':person_id' => $personId,
        ':program_id' => $programId,
        ':plan_id' => $planId !== '' ? $planId : null,
        ':status' => $enrollmentStatus,
        ':start_date' => $startDate,
        ':end_date' => $endDate !== '' ? $endDate : null,
        ':created_at' => $now,
        ':updated_at' => $now,
    ]);

    $db->commit();
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    ss_log_event('student_create_failed', ['error' => $e->getMessage()]);
    ss_json(500, ['ok' => false, 'error' => 'Failed to create student record']);
}

ss_log_event('student_created', [
    'person_id' => $personId,
    'household_id' => $householdId,
    'enrollment_id' => $enrollmentId,
]);

ss_json(201, [
    'ok' => true,
    'person_id' => $personId,
    'household_id' => $householdId,
    'enrollment_id' => $enrollmentId,
]);
