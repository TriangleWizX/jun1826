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

$errors = [];
$allowedContactMethods = ['phone', 'email', 'text', 'unknown'];
$allowedLanes = ['kids', 'teens', 'adults', 'mixed', 'private', 'unknown'];

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

if (!in_array($interestLane, $allowedLanes, true)) {
    $interestLane = 'unknown';
}

if ($errors !== []) {
    ss_log_event('lead_validation_failed', ['errors' => array_keys($errors)]);
    ss_json(422, ['ok' => false, 'errors' => $errors]);
}

$db = ss_db();
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
