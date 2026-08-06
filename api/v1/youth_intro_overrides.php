<?php
declare(strict_types=1);

ss_require_ops_auth();
$db = ss_db();
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$statuses = ['Available', 'Intro capacity reached', 'Class roster full', 'Partner unavailable', 'Closed', 'Manual approval required'];
if ($method === 'GET') {
    $stmt = $db->query('SELECT id, class_id, override_date, status, intro_capacity, partner_approved, manual_review, moved_to_class_id, created_at FROM youth_intro_overrides ORDER BY created_at DESC LIMIT 250');
    ss_json(200, ['ok' => true, 'overrides' => $stmt->fetchAll(PDO::FETCH_ASSOC), 'statuses' => $statuses]);
}
if ($method !== 'POST') ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
$data = ss_request_data();
$classId = ss_clean_string($data['classId'] ?? '', 80);
$overrideDate = ss_clean_string($data['date'] ?? '', 10);
$status = ss_clean_string($data['status'] ?? '', 50);
$capacity = isset($data['introCapacity']) && $data['introCapacity'] !== '' ? filter_var($data['introCapacity'], FILTER_VALIDATE_INT) : null;
$partnerApproved = array_key_exists('partnerApproved', $data) ? (!empty($data['partnerApproved']) ? 1 : 0) : null;
$manualReview = !empty($data['manualReview']) ? 1 : 0;
$movedTo = ss_clean_string($data['movedToClassId'] ?? '', 80);
if ($classId === '' || !in_array($status, $statuses, true)) ss_json(422, ['ok' => false, 'errors' => ['classId' => 'Class id and valid status are required.']]);
if ($capacity !== null && ($capacity < 0 || $capacity > 2)) ss_json(422, ['ok' => false, 'errors' => ['introCapacity' => 'Intro capacity must be between 0 and 2.']]);
if ($overrideDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $overrideDate)) ss_json(422, ['ok' => false, 'errors' => ['date' => 'Date must use YYYY-MM-DD.']]);
$stmt = $db->prepare('INSERT INTO youth_intro_overrides (id, class_id, override_date, status, intro_capacity, partner_approved, manual_review, moved_to_class_id, actor_user_id, created_at) VALUES (:id, :class_id, :override_date, :status, :intro_capacity, :partner_approved, :manual_review, :moved_to_class_id, NULL, :created_at)');
$stmt->execute([':id' => ss_uuid_v4(), ':class_id' => $classId, ':override_date' => $overrideDate !== '' ? $overrideDate : null, ':status' => $status, ':intro_capacity' => $capacity, ':partner_approved' => $partnerApproved, ':manual_review' => $manualReview, ':moved_to_class_id' => $movedTo !== '' ? $movedTo : null, ':created_at' => ss_now_iso()]);
ss_log_event('youth_intro_override_created', ['class_id' => $classId, 'date' => $overrideDate, 'status' => $status]);
ss_json(201, ['ok' => true, 'status' => $status]);
