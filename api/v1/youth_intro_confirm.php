<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? '')) !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}
$expectedSecret = ss_env('YOUTH_INTRO_CONFIRM_SECRET', '');
if ($expectedSecret === '') ss_json(503, ['ok' => false, 'error' => 'Confirmation webhook endpoint not configured']);
$providedSecret = (string)($_SERVER['HTTP_X_YOUTH_INTRO_CONFIRM_SECRET'] ?? $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '');
if ($providedSecret === '' || !hash_equals($expectedSecret, $providedSecret)) {
    ss_log_event('youth_intro_confirm_rejected', ['reason' => 'bad_secret']);
    ss_json(401, ['ok' => false, 'error' => 'Unauthorized']);
}
$payload = ss_request_body_json();
$introId = ss_clean_string($payload['youth_intro_id'] ?? '', 64);
$message = strtoupper(trim(ss_clean_string($payload['message'] ?? '', 120)));
if ($introId === '' || !in_array($message, ['CONFIRM', 'STOP'], true)) ss_json(422, ['ok' => false, 'error' => 'youth_intro_id and an exact CONFIRM or STOP message are required.']);
$db = ss_db();
$stmt = $db->prepare('SELECT pipeline_stage, waiver_completed, appointment_datetime FROM youth_intro_records WHERE id = :id');
$stmt->execute([':id' => $introId]);
$record = $stmt->fetch(PDO::FETCH_ASSOC);
if ($record === false) ss_json(404, ['ok' => false, 'error' => 'Youth intro record not found.']);
if ($message === 'STOP') {
    $db->prepare('UPDATE youth_intro_records SET message_consent = 0, updated_at = :updated_at WHERE id = :id')->execute([':updated_at' => ss_now_iso(), ':id' => $introId]);
    ss_log_event('youth_intro_opted_out', ['youth_intro_id' => $introId]);
    ss_json(200, ['ok' => true, 'messageConsent' => false]);
}
if ((int)$record['waiver_completed'] !== 1 || (string)$record['appointment_datetime'] === '') ss_json(409, ['ok' => false, 'error' => 'Verified waiver and appointment are required before confirmation.']);
$update = $db->prepare('UPDATE youth_intro_records SET pipeline_stage = \'Confirmed\', updated_at = :updated_at WHERE id = :id AND pipeline_stage NOT IN (\'Attended\', \'Core Culture recommended\', \'Enrolled\')');
$update->execute([':updated_at' => ss_now_iso(), ':id' => $introId]);
ss_log_event('youth_intro_confirmed', ['youth_intro_id' => $introId, 'changed' => $update->rowCount() > 0]);
ss_json(200, ['ok' => true, 'pipelineStage' => 'Confirmed', 'changed' => $update->rowCount() > 0]);
