<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('leads:' . ss_client_ip(), 60, 6)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$data = ss_request_data();

$honeypot = ss_clean_string($data['website'] ?? $data['hp'] ?? '', 200);
if ($honeypot !== '') {
    ss_log_event('lead_spam_blocked', ['reason' => 'honeypot']);
    ss_json(202, ['ok' => true, 'accepted' => false]);
}

$name = ss_clean_string($data['name'] ?? '', 120);
$contactMethod = strtolower(ss_clean_string($data['contact_method'] ?? 'unknown', 32));
$phone = ss_clean_string($data['phone'] ?? '', 32);
$email = strtolower(ss_clean_string($data['email'] ?? '', 160));
$interestLane = strtolower(ss_clean_string($data['interest_lane'] ?? 'unknown', 32));
$message = ss_clean_string($data['message'] ?? '', 2000);
$sourceUrl = ss_clean_string($data['source_url'] ?? ($_SERVER['HTTP_REFERER'] ?? ''), 2048);

$utmSource = ss_clean_string($data['utm_source'] ?? '', 120);
$utmMedium = ss_clean_string($data['utm_medium'] ?? '', 120);
$utmCampaign = ss_clean_string($data['utm_campaign'] ?? '', 120);
$utmContent = ss_clean_string($data['utm_content'] ?? '', 120);
$utmTerm = ss_clean_string($data['utm_term'] ?? '', 120);
$introStartAt = ss_clean_string($data['intro_start_at'] ?? '', 64);
$introEndAt = ss_clean_string($data['intro_end_at'] ?? '', 64);
$bookingSource = strtolower(ss_clean_string($data['booking_source'] ?? 'manual', 30));
$bookingExternalId = ss_clean_string($data['booking_external_id'] ?? '', 120);
$isYouthIntro = (($data['funnel'] ?? '') === 'youth_intro');
$guardianName = ss_clean_string($data['guardianName'] ?? '', 120);
$studentType = ss_clean_string($data['studentType'] ?? '', 20);
$studentName = ss_clean_string($data['studentName'] ?? '', 120);
$studentAge = filter_var($data['studentAge'] ?? null, FILTER_VALIDATE_INT);
$town = ss_clean_string($data['town'] ?? '', 120);
$priorExperience = ss_clean_string($data['priorExperience'] ?? '', 2000);
$mainGoal = ss_clean_string($data['mainGoal'] ?? '', 120);
$participationNotes = ss_clean_string($data['participationNotes'] ?? '', 2000);
$loanerGiRequested = !empty($data['loanerGi']) ? 1 : 0;
$preferredDate = ss_clean_string($data['preferredDate'] ?? '', 32);
$ageLane = ss_clean_string($data['ageLane'] ?? '', 20);
$scheduledClassId = ss_clean_string($data['scheduledClassId'] ?? '', 80);
$appointmentDateTime = ss_clean_string($data['appointmentDateTime'] ?? '', 64);
$arrivalDateTime = ss_clean_string($data['arrivalDateTime'] ?? '', 64);
// The browser acknowledgment is not proof of a signed waiver. Verification is
// written only by the configured waiver workflow/admin integration.
$waiverCompleted = 0;
$mediaChoice = ss_clean_string($data['mediaChoice'] ?? '', 80);
$messageConsent = !empty($data['messageConsent']) ? 1 : 0;
$onsiteAcknowledged = !empty($data['onsite']) ? 1 : 0;
$arrivalAcknowledged = !empty($data['arrival']) ? 1 : 0;
$rescheduleAcknowledged = !empty($data['reschedule']) ? 1 : 0;
$consentTextVersion = 'youth-intro-v1';
$messageConsentAt = $messageConsent === 1 ? ss_now_iso() : null;
$requestKey = ss_clean_string($data['idempotency_key'] ?? '', 120);

$errors = [];
$allowedContactMethods = ['phone', 'email', 'text', 'unknown'];
$allowedLanes = ['kids', 'teens', 'adults', 'mixed', 'private', 'youth_intro', 'unknown'];

if (strlen($name) < 2) {
    $errors['name'] = 'Name must be at least 2 characters.';
}

if (!in_array($contactMethod, $allowedContactMethods, true)) {
    $errors['contact_method'] = 'Invalid contact method.';
}

if ($phone !== '' && !preg_match('/^\+?[0-9()\-\s]{7,20}$/', $phone)) {
    $errors['phone'] = 'Phone number format is invalid.';
}

if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Email format is invalid.';
}

if ($phone === '' && $email === '') {
    $errors['contact'] = 'Provide at least a phone or email.';
}
$db = ss_db();
if ($requestKey !== '') {
    $existingKey = $db->prepare('SELECT lead_id FROM lead_request_keys WHERE request_key = :request_key LIMIT 1');
    $existingKey->execute([':request_key' => $requestKey]);
    $existingLeadId = $existingKey->fetchColumn();
    if ($existingLeadId !== false) ss_json(200, ['ok' => true, 'duplicate' => true, 'id' => (int)$existingLeadId, 'message' => 'Lead already captured.']);
}
if ($isYouthIntro) {
    if ($studentType !== 'first_time') $errors['studentType'] = 'Returning students and visitors must use the appropriate alternate route.';
    if ($guardianName === '' || $studentName === '') $errors['student'] = 'Guardian and student names are required.';
    if ($studentAge === false || $studentAge < 5 || $studentAge > 17) $errors['studentAge'] = 'Youth intro age must be between 5 and 17.';
    if ($town === '' || $priorExperience === '' || $mainGoal === '' || $participationNotes === '') $errors['starting_context'] = 'Complete the required youth starting-context fields.';
    if ($preferredDate === '' || !in_array($ageLane, ['kids', 'teens'], true) || $scheduledClassId === '' || $appointmentDateTime === '' || $arrivalDateTime === '') $errors['appointment'] = 'Choose an available class and confirm the 20-minute arrival requirement.';
    if ($mediaChoice === '' || $messageConsent !== 1 || $onsiteAcknowledged !== 1 || $arrivalAcknowledged !== 1 || $rescheduleAcknowledged !== 1) $errors['policies'] = 'Complete message consent, parent attendance, arrival, and reschedule acknowledgments.';
    $availabilityConfig = json_decode((string)file_get_contents(dirname(__DIR__, 2) . '/config/youth-intro-availability.json'), true);
    $configuredClass = null;
    foreach (($availabilityConfig['classes'] ?? []) as $class) if (($class['classId'] ?? '') === $scheduledClassId) { $configuredClass = $class; break; }
    if ($configuredClass === null || !$configuredClass['active'] || !in_array($ageLane, $configuredClass['ageLanes'] ?? [], true)) $errors['appointment'] = 'Choose a configured class for the selected age lane.';
    if ($configuredClass !== null && $preferredDate !== '') {
        $dateObject = DateTimeImmutable::createFromFormat('!Y-m-d', $preferredDate);
        if (!$dateObject || $dateObject->format('l') !== ($configuredClass['day'] ?? '')) $errors['appointment'] = 'Choose a class date matching the selected class day.';
        $classDateTime = $dateObject ? new DateTimeImmutable($preferredDate . ' ' . ($configuredClass['startTime'] ?? ''), new DateTimeZone('America/New_York')) : null;
        $expectedStart = $classDateTime ? $classDateTime->format('Y-m-d\TH:i:sP') : '';
        $expectedArrival = $classDateTime ? $classDateTime->modify('-20 minutes')->format('Y-m-d\TH:i:sP') : '';
        if ($appointmentDateTime !== $expectedStart || $arrivalDateTime !== $expectedArrival) $errors['appointment'] = 'Appointment and arrival times must match the selected class.';
    }
    $weekStart = date('Y-m-d', strtotime('monday this week', strtotime($preferredDate)));
    $weekEnd = date('Y-m-d', strtotime('+6 days', strtotime($weekStart)));
    $slotStmt = $db->prepare("SELECT COUNT(*) FROM youth_intro_records WHERE preferred_date = :preferred_date AND scheduled_class_id = :class_id AND pipeline_stage NOT IN ('Not fit', 'Visitor or alternate offer')");
    $slotStmt->execute([':preferred_date' => $preferredDate, ':class_id' => $scheduledClassId]);
    $slotCapacity = (int)($availabilityConfig['introCapacity'] ?? 2);
    $overrideStmt = $db->prepare('SELECT status, intro_capacity, partner_approved FROM youth_intro_overrides WHERE class_id = :class_id AND (override_date IS NULL OR override_date = :override_date) ORDER BY created_at DESC LIMIT 1');
    $overrideStmt->execute([':class_id' => $scheduledClassId, ':override_date' => $preferredDate]);
    $override = $overrideStmt->fetch(PDO::FETCH_ASSOC) ?: null;
    if ($override && $override['intro_capacity'] !== null) $slotCapacity = (int)$override['intro_capacity'];
    if ((int)$slotStmt->fetchColumn() >= $slotCapacity) $errors['capacity'] = 'Intro capacity has been reached for this class.';
    if ($override && in_array((string)$override['status'], ['Closed', 'Class roster full', 'Partner unavailable', 'Manual approval required', 'Intro capacity reached'], true)) $errors['capacity'] = 'That class is no longer available for youth intros.';
    if (($configuredClass['requiresPartnerApproval'] ?? false) && (!$override || (int)($override['partner_approved'] ?? 0) !== 1)) $errors['capacity'] = 'That class still requires partner approval.';
    $weekStmt = $db->prepare('SELECT COUNT(*) FROM youth_intro_records WHERE preferred_date BETWEEN :week_start AND :week_end AND pipeline_stage NOT IN (\'Not fit\', \'Visitor or alternate offer\')');
    $weekStmt->execute([':week_start' => $weekStart, ':week_end' => $weekEnd]);
    if ((int)$weekStmt->fetchColumn() >= (int)($availabilityConfig['weeklyIntroLimit'] ?? 4)) $errors['weekly_capacity'] = 'Youth intro availability is closed for this week.';
}

if (!in_array($interestLane, $allowedLanes, true)) {
    $interestLane = 'unknown';
}

if ($errors !== []) {
    ss_log_event('lead_validation_failed', ['errors' => array_keys($errors)]);
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

$stmt = $db->prepare(
    'INSERT INTO leads (
        created_at, name, contact_method, phone, email, interest_lane, message,
        source_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term, ip_hash, user_agent
    ) VALUES (
        :created_at, :name, :contact_method, :phone, :email, :interest_lane, :message,
        :source_url, :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term, :ip_hash, :user_agent
    )'
);

$stmt->execute([
    ':created_at' => ss_now_iso(),
    ':name' => $name,
    ':contact_method' => $contactMethod,
    ':phone' => $phone !== '' ? $phone : null,
    ':email' => $email !== '' ? $email : null,
    ':interest_lane' => $interestLane,
    ':message' => $message !== '' ? $message : null,
    ':source_url' => $sourceUrl !== '' ? $sourceUrl : null,
    ':utm_source' => $utmSource !== '' ? $utmSource : null,
    ':utm_medium' => $utmMedium !== '' ? $utmMedium : null,
    ':utm_campaign' => $utmCampaign !== '' ? $utmCampaign : null,
    ':utm_content' => $utmContent !== '' ? $utmContent : null,
    ':utm_term' => $utmTerm !== '' ? $utmTerm : null,
    ':ip_hash' => ss_ip_hash(ss_client_ip()),
    ':user_agent' => ss_clean_string($_SERVER['HTTP_USER_AGENT'] ?? '', 512),
]);

$leadId = (int)$db->lastInsertId();
if ($requestKey !== '') {
    $keyInsert = $db->prepare('INSERT OR IGNORE INTO lead_request_keys (request_key, lead_id, created_at) VALUES (:request_key, :lead_id, :created_at)');
    $keyInsert->execute([':request_key' => $requestKey, ':lead_id' => $leadId, ':created_at' => ss_now_iso()]);
}
if ($isYouthIntro) {
    $record = $db->prepare(
        'INSERT INTO youth_intro_records (
            id, lead_id, guardian_name, student_name, student_age, town,
            prior_experience, main_goal, participation_notes, loaner_gi_requested,
            preferred_date, age_lane, waiver_completed, media_choice, message_consent,
            scheduled_class_id, appointment_datetime, arrival_datetime,
            message_consent_at, consent_text_version,
            created_at, updated_at
         ) VALUES (
            :id, :lead_id, :guardian_name, :student_name, :student_age, :town,
            :prior_experience, :main_goal, :participation_notes, :loaner_gi_requested,
            :preferred_date, :age_lane, :waiver_completed, :media_choice, :message_consent,
            :scheduled_class_id, :appointment_datetime, :arrival_datetime,
            :message_consent_at, :consent_text_version,
            :created_at, :updated_at
         )'
    );
    $now = ss_now_iso();
    $record->execute([
        ':id' => ss_uuid_v4(), ':lead_id' => $leadId, ':guardian_name' => $guardianName,
        ':student_name' => $studentName, ':student_age' => $studentAge, ':town' => $town,
        ':prior_experience' => $priorExperience, ':main_goal' => $mainGoal,
        ':participation_notes' => $participationNotes, ':loaner_gi_requested' => $loanerGiRequested,
        ':preferred_date' => $preferredDate, ':age_lane' => $ageLane,
        ':waiver_completed' => $waiverCompleted, ':media_choice' => $mediaChoice,
        ':message_consent' => $messageConsent, ':created_at' => $now, ':updated_at' => $now,
        ':scheduled_class_id' => $scheduledClassId, ':appointment_datetime' => $appointmentDateTime, ':arrival_datetime' => $arrivalDateTime,
        ':message_consent_at' => $messageConsentAt, ':consent_text_version' => $consentTextVersion,
    ]);
    ss_log_event('youth_intro_created', ['lead_id' => $leadId, 'student_age_band' => $studentAge <= 9 ? '5-9' : '10-17']);
}

$personId = ss_upsert_person_from_lead($db, $name, $email, $phone, true);

$createdBookingId = null;
if ($introStartAt !== '') {
    $createdBookingId = ss_create_intro_booking(
        $db,
        $personId,
        ss_program_id_for_lane($interestLane),
        $introStartAt,
        $introEndAt !== '' ? $introEndAt : null,
        $bookingSource !== '' ? $bookingSource : 'manual',
        $bookingExternalId !== '' ? $bookingExternalId : null,
        $utmSource !== '' ? $utmSource : null,
        $utmMedium !== '' ? $utmMedium : null,
        $utmCampaign !== '' ? $utmCampaign : null,
        $sourceUrl !== '' ? $sourceUrl : null
    );
}

ss_log_event('lead_created', ['lead_id' => $leadId, 'interest_lane' => $interestLane]);

ss_json(201, [
    'ok' => true,
    'id' => $leadId,
    'person_id' => $personId,
    'booking_id' => $createdBookingId,
    'message' => 'Lead captured.',
]);
