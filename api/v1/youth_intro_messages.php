<?php
declare(strict_types=1);

ss_require_ops_auth();
$db = ss_db();
$templatePath = dirname(__DIR__, 2) . '/config/youth-intro-message-templates.json';
$templates = json_decode((string)file_get_contents($templatePath), true, 512, JSON_THROW_ON_ERROR);
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if ($method === 'GET') {
    $messages = $db->query('SELECT id, youth_intro_id, template_key, recipient, status, sent_at, created_at FROM youth_intro_messages ORDER BY created_at DESC LIMIT 250')->fetchAll(PDO::FETCH_ASSOC);
    $alerts = $db->query('SELECT id, youth_intro_id, message_id, alert_type, details, resolved_at, created_at FROM youth_intro_alerts ORDER BY created_at DESC LIMIT 250')->fetchAll(PDO::FETCH_ASSOC);
    ss_json(200, ['ok' => true, 'approved' => (bool)$templates['approved'], 'templates' => $templates['templates'], 'messages' => $messages, 'alerts' => $alerts]);
}
if ($method !== 'POST') ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
$data = ss_request_data();
$action = ss_clean_string($data['action'] ?? 'queue', 20);
if ($action === 'approve') {
    $templates['approved'] = true;
    $templates['approvedAt'] = ss_now_iso();
    file_put_contents($templatePath, json_encode($templates, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL, LOCK_EX);
    ss_log_event('youth_intro_templates_approved', ['approved_at' => $templates['approvedAt']]);
    ss_json(200, ['ok' => true, 'approved' => true]);
}
$messageId = ss_clean_string($data['messageId'] ?? '', 64);
if ($action === 'failed') {
    if ($messageId === '') ss_json(422, ['ok' => false, 'error' => 'messageId is required.']);
    $failure = ss_clean_string($data['error'] ?? 'Message delivery failed.', 1000);
    $messageStmt = $db->prepare('SELECT youth_intro_id FROM youth_intro_messages WHERE id = :id');
    $messageStmt->execute([':id' => $messageId]);
    $youthIntroId = $messageStmt->fetchColumn();
    if ($youthIntroId === false) ss_json(404, ['ok' => false, 'error' => 'Message not found.']);
    $db->prepare('UPDATE youth_intro_messages SET status = \'failed\', failed_at = :failed_at, error_message = :error_message, attempt_count = attempt_count + 1 WHERE id = :id')
        ->execute([':failed_at' => ss_now_iso(), ':error_message' => $failure, ':id' => $messageId]);
    $db->prepare('INSERT INTO youth_intro_alerts (id, youth_intro_id, message_id, alert_type, details, created_at) VALUES (:id, :youth_intro_id, :message_id, \'message_delivery_failed\', :details, :created_at)')
        ->execute([':id' => ss_uuid_v4(), ':youth_intro_id' => $youthIntroId, ':message_id' => $messageId, ':details' => $failure, ':created_at' => ss_now_iso()]);
    ss_log_event('youth_intro_message_failed', ['message_id' => $messageId, 'youth_intro_id' => $youthIntroId]);
    ss_json(200, ['ok' => true, 'status' => 'failed', 'alertCreated' => true]);
}
if (!$templates['approved']) ss_json(409, ['ok' => false, 'error' => 'Templates require Sandy approval before activation.']);
$templateKey = ss_clean_string($data['templateKey'] ?? '', 60);
$introId = ss_clean_string($data['youthIntroId'] ?? '', 64);
$recipient = ss_clean_string($data['recipient'] ?? '', 190);
$mergeData = is_array($data['mergeData'] ?? null) ? $data['mergeData'] : [];
if (!isset($templates['templates'][$templateKey]) || $introId === '' || $recipient === '') ss_json(422, ['ok' => false, 'error' => 'Template, youth intro id, and recipient are required.']);
$recordStmt = $db->prepare('SELECT pipeline_stage, waiver_completed, reschedule_count FROM youth_intro_records WHERE id = :id');
$recordStmt->execute([':id' => $introId]);
$record = $recordStmt->fetch(PDO::FETCH_ASSOC);
if ($record === false) ss_json(404, ['ok' => false, 'error' => 'Youth intro record not found.']);
if (in_array($templateKey, ['immediate_confirmation', '24_hour_reminder', 'same_day_reminder'], true) && (int)$record['waiver_completed'] !== 1) ss_json(409, ['ok' => false, 'error' => 'Cannot queue appointment messages until the waiver is verified.']);
$required = $templates['templates'][$templateKey]['requiredFields'];
foreach ($required as $field) if (!array_key_exists($field, $mergeData) || trim((string)$mergeData[$field]) === '') ss_json(422, ['ok' => false, 'error' => "Missing required merge field: {$field}"]);
if ($templateKey === 'post_class_follow_up' && trim((string)($mergeData['specificSuccess'] ?? '')) === '') ss_json(422, ['ok' => false, 'error' => 'Specific success is required before post-class follow-up.']);
if ($templateKey === 'missed_appointment' && (int)$record['reschedule_count'] >= 1) ss_json(409, ['ok' => false, 'error' => 'Second missed appointment requires manual review.']);
$stmt = $db->prepare('INSERT INTO youth_intro_messages (id, youth_intro_id, template_key, recipient, merge_data_json, status, created_at) VALUES (:id, :intro_id, :template_key, :recipient, :merge_data, \'queued\', :created_at)');
$stmt->execute([':id' => ss_uuid_v4(), ':intro_id' => $introId, ':template_key' => $templateKey, ':recipient' => $recipient, ':merge_data' => json_encode($mergeData, JSON_UNESCAPED_SLASHES), ':created_at' => ss_now_iso()]);
ss_json(201, ['ok' => true, 'status' => 'queued']);
