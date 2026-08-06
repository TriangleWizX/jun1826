<?php
declare(strict_types=1);

ss_require_ops_auth();
$db = ss_db();
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$stages = ['New inquiry', 'Intro invited', 'Intro booked', 'Confirmed', 'Attended', 'Core Culture recommended', 'Enrolled', 'Follow-up needed', 'Not ready', 'Not a fit', 'No-show', 'Visitor or alternate offer'];
$reasons = ['Schedule', 'Price', 'Child not interested', 'Parent not ready', 'Transportation', 'Program mismatch', 'Needs accommodation', 'Could not reach', 'Other'];
$checklistKeys = ['bookingInformationReviewed', 'waiverCompleted', 'parentAttended', 'suitablePartnerAssigned', 'safetyRuleExplained', 'controlledGameCompleted', 'specificSuccessIdentified', 'parentRecommendationReceived', 'coreCulturePriceStated', 'nextActionRecorded', 'followUpScheduled'];

if ($method === 'DELETE') {
    $id = ss_clean_string($_GET['id'] ?? '', 64);
    if ($id === '') ss_json(422, ['ok' => false, 'error' => 'Record id is required.']);
    $db->beginTransaction();
    $lookup = $db->prepare('SELECT lead_id FROM youth_intro_records WHERE id = :id');
    $lookup->execute([':id' => $id]);
    $leadId = $lookup->fetchColumn();
    if ($leadId === false) { $db->rollBack(); ss_json(404, ['ok' => false, 'error' => 'Youth intro record not found.']); }
    $db->prepare('DELETE FROM youth_intro_messages WHERE youth_intro_id = :id')->execute([':id' => $id]);
    $db->prepare('DELETE FROM youth_intro_records WHERE id = :id')->execute([':id' => $id]);
    $db->prepare('DELETE FROM lead_request_keys WHERE lead_id = :lead_id')->execute([':lead_id' => $leadId]);
    $db->prepare('DELETE FROM leads WHERE id = :lead_id')->execute([':lead_id' => $leadId]);
    $db->commit();
    ss_log_event('youth_intro_deleted', ['record_id' => $id]);
    ss_json(200, ['ok' => true, 'deleted' => true]);
}

if ($method === 'GET') {
    $stage = ss_clean_string($_GET['stage'] ?? '', 80);
    $sql = 'SELECT * FROM youth_intro_records';
    $params = [];
    if (in_array($stage, $stages, true)) { $sql .= ' WHERE pipeline_stage = :stage'; $params[':stage'] = $stage; }
    $sql .= ' ORDER BY created_at DESC LIMIT 250';
    $stmt = $db->prepare($sql); $stmt->execute($params);
    ss_json(200, ['ok' => true, 'records' => $stmt->fetchAll(PDO::FETCH_ASSOC), 'stages' => $stages, 'nonEnrollmentReasons' => $reasons]);
}
if ($method !== 'POST') ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
$data = ss_request_data();
$id = ss_clean_string($data['id'] ?? '', 64);
$stage = ss_clean_string($data['pipelineStage'] ?? '', 80);
$completionStatus = ss_clean_string($data['completionStatus'] ?? 'Incomplete', 40);
$checklist = is_array($data['checklist'] ?? null) ? $data['checklist'] : [];
$followUpDate = ss_clean_string($data['followUpDate'] ?? '', 32);
$reason = ss_clean_string($data['nonEnrollmentReason'] ?? '', 80);
$attendanceStatus = ss_clean_string($data['attendanceStatus'] ?? '', 40);
$rescheduleCount = filter_var($data['rescheduleCount'] ?? 0, FILTER_VALIDATE_INT);
$rescheduleCount = $rescheduleCount === false ? 0 : $rescheduleCount;
if ($id === '' || !in_array($stage, $stages, true)) ss_json(422, ['ok' => false, 'errors' => ['id' => 'Valid record id and pipeline stage are required.']]);
if (!in_array($completionStatus, ['Complete', 'Incomplete', 'Requires follow-up', 'Safety review required', 'Program mismatch'], true)) ss_json(422, ['ok' => false, 'errors' => ['completionStatus' => 'Invalid completion status.']]);
if ($reason !== '' && !in_array($reason, $reasons, true)) ss_json(422, ['ok' => false, 'errors' => ['nonEnrollmentReason' => 'Invalid non-enrollment reason.']]);
if ($rescheduleCount < 0 || $rescheduleCount > 1) ss_json(422, ['ok' => false, 'errors' => ['rescheduleCount' => 'Reschedule count must be 0 or 1.']]);
foreach ($checklistKeys as $key) $checklist[$key] = !empty($checklist[$key]);
if ($attendanceStatus === 'Complete' && count(array_filter($checklist)) !== count($checklistKeys)) ss_json(422, ['ok' => false, 'errors' => ['checklist' => 'All attended-intro checklist items must be complete before marking the intro complete.']]);
$bookingId = null;
if ($stage === 'Confirmed') {
    $confirmStmt = $db->prepare('SELECT y.*, l.name, l.email, l.phone FROM youth_intro_records y JOIN leads l ON l.id = y.lead_id WHERE y.id = :id');
    $confirmStmt->execute([':id' => $id]);
    $confirmRecord = $confirmStmt->fetch(PDO::FETCH_ASSOC);
    if ($confirmRecord === false) ss_json(404, ['ok' => false, 'error' => 'Youth intro record not found.']);
    if ((int)$confirmRecord['waiver_completed'] !== 1) ss_json(409, ['ok' => false, 'error' => 'A verified waiver record is required before confirmation; the checklist cannot substitute for verification.']);
    if ((string)$confirmRecord['appointment_datetime'] === '') ss_json(409, ['ok' => false, 'error' => 'Appointment datetime is required before confirmation.']);
    $personId = ss_upsert_person_from_lead($db, (string)$confirmRecord['name'], (string)($confirmRecord['email'] ?? ''), (string)($confirmRecord['phone'] ?? ''), true);
    $existingBooking = $db->prepare('SELECT id FROM booking WHERE source = :source AND external_id = :external_id LIMIT 1');
    $existingBooking->execute([':source' => 'youth_intro', ':external_id' => $id]);
    $bookingId = $existingBooking->fetchColumn() ?: ss_create_intro_booking($db, $personId, ss_program_id_for_lane((string)$confirmRecord['age_lane']), (string)$confirmRecord['appointment_datetime'], (new DateTimeImmutable((string)$confirmRecord['appointment_datetime']))->modify('+45 minutes')->format(DateTimeInterface::ATOM), 'youth_intro', $id);
    if ($bookingId === null) ss_json(409, ['ok' => false, 'error' => 'The appointment could not be reserved.']);
}
$stmt = $db->prepare('UPDATE youth_intro_records SET pipeline_stage = :stage, completion_status = :completion_status, checklist_json = :checklist_json, reschedule_count = :reschedule_count, attendance_status = :attendance_status, recommended_schedule = :recommended_schedule, follow_up_date = :follow_up_date, non_enrollment_reason = :non_enrollment_reason, updated_at = :updated_at WHERE id = :id');
$stmt->execute([':stage' => $stage, ':completion_status' => $completionStatus, ':checklist_json' => json_encode($checklist, JSON_UNESCAPED_SLASHES), ':reschedule_count' => $rescheduleCount, ':attendance_status' => $attendanceStatus, ':recommended_schedule' => ss_clean_string($data['recommendedSchedule'] ?? '', 500), ':follow_up_date' => $followUpDate, ':non_enrollment_reason' => $reason, ':updated_at' => ss_now_iso(), ':id' => $id]);
if ($stmt->rowCount() === 0) ss_json(404, ['ok' => false, 'error' => 'Youth intro record not found.']);
$stageEvents = ['Confirmed' => ['intro_appointment_booked', 'intro_confirmed'], 'Attended' => ['intro_attended'], 'Core Culture recommended' => ['core_recommended'], 'Enrolled' => ['core_enrolled'], 'No-show' => ['intro_no_show'], 'Not a fit' => ['intro_not_fit']];
foreach ($stageEvents[$stage] ?? [] as $event) ss_log_event($event, ['youth_intro_id' => $id, 'pipeline_stage' => $stage, 'non_enrollment_reason' => $reason]);
$audit = $db->prepare('INSERT INTO audit_log (id, actor_user_id, action, entity, entity_id, meta_json, created_at) VALUES (:id, NULL, :action, :entity, :entity_id, :meta_json, :created_at)');
$audit->execute([':id' => ss_uuid_v4(), ':action' => 'update', ':entity' => 'youth_intro_record', ':entity_id' => $id, ':meta_json' => json_encode(['stage' => $stage, 'completionStatus' => $completionStatus], JSON_UNESCAPED_SLASHES), ':created_at' => ss_now_iso()]);
ss_json(200, ['ok' => true, 'id' => $id, 'bookingId' => $bookingId, 'pipelineStage' => $stage, 'completionStatus' => $completionStatus]);
