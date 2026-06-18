<?php
declare(strict_types=1);

if (strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    ss_json(405, ['ok' => false, 'error' => 'Method Not Allowed']);
}

if (!ss_rate_limit('webhook:' . ss_client_ip(), 60, 120)) {
    ss_json(429, ['ok' => false, 'error' => 'Too Many Requests']);
}

$expectedSecret = ss_env('BOOKING_WEBHOOK_SECRET', '');
if ($expectedSecret === '') {
    ss_json(503, ['ok' => false, 'error' => 'Webhook endpoint not configured']);
}

$providedSecret = (string)($_SERVER['HTTP_X_BOOKING_WEBHOOK_SECRET'] ?? $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '');
if ($providedSecret === '' || !hash_equals($expectedSecret, $providedSecret)) {
    ss_log_event('booking_webhook_rejected', ['reason' => 'bad_secret']);
    ss_json(401, ['ok' => false, 'error' => 'Unauthorized']);
}

$payload = ss_request_body_json();
if ($payload === []) {
    ss_json(400, ['ok' => false, 'error' => 'Invalid JSON payload']);
}

$provider = strtolower(ss_clean_string($payload['provider'] ?? 'unknown', 40));
$providerEventId = ss_clean_string($payload['provider_event_id'] ?? $payload['event_id'] ?? '', 120);
$name = ss_clean_string($payload['name'] ?? '', 120);
$email = strtolower(ss_clean_string($payload['email'] ?? '', 160));
$phone = ss_clean_string($payload['phone'] ?? '', 32);
$lane = strtolower(ss_clean_string($payload['lane'] ?? 'unknown', 32));
$startTime = ss_clean_string($payload['start_time'] ?? '', 64);
$sourceUrl = ss_clean_string($payload['source_url'] ?? '', 2048);

$utmSource = ss_clean_string($payload['utm_source'] ?? '', 120);
$utmMedium = ss_clean_string($payload['utm_medium'] ?? '', 120);
$utmCampaign = ss_clean_string($payload['utm_campaign'] ?? '', 120);
$utmContent = ss_clean_string($payload['utm_content'] ?? '', 120);
$utmTerm = ss_clean_string($payload['utm_term'] ?? '', 120);

if ($providerEventId === '') {
    ss_json(422, ['ok' => false, 'error' => 'provider_event_id is required']);
}

$db = ss_db();
$stmt = $db->prepare(
    'INSERT OR IGNORE INTO bookings (
        created_at, provider, provider_event_id, name, email, phone, lane,
        start_time, source_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term
    ) VALUES (
        :created_at, :provider, :provider_event_id, :name, :email, :phone, :lane,
        :start_time, :source_url, :utm_source, :utm_medium, :utm_campaign, :utm_content, :utm_term
    )'
);

$stmt->execute([
    ':created_at' => ss_now_iso(),
    ':provider' => $provider !== '' ? $provider : 'unknown',
    ':provider_event_id' => $providerEventId,
    ':name' => $name !== '' ? $name : null,
    ':email' => $email !== '' ? $email : null,
    ':phone' => $phone !== '' ? $phone : null,
    ':lane' => $lane !== '' ? $lane : 'unknown',
    ':start_time' => $startTime !== '' ? $startTime : null,
    ':source_url' => $sourceUrl !== '' ? $sourceUrl : null,
    ':utm_source' => $utmSource !== '' ? $utmSource : null,
    ':utm_medium' => $utmMedium !== '' ? $utmMedium : null,
    ':utm_campaign' => $utmCampaign !== '' ? $utmCampaign : null,
    ':utm_content' => $utmContent !== '' ? $utmContent : null,
    ':utm_term' => $utmTerm !== '' ? $utmTerm : null,
]);

$inserted = $stmt->rowCount() > 0;
$bookingId = $inserted ? (int)$db->lastInsertId() : null;

$personId = ss_upsert_person_from_lead($db, $name, $email, $phone, false);
$canonicalBookingId = ss_create_intro_booking(
    $db,
    $personId,
    ss_program_id_for_lane($lane),
    $startTime !== '' ? $startTime : ss_now_iso(),
    null,
    $provider !== '' ? $provider : 'unknown',
    $providerEventId,
    $utmSource !== '' ? $utmSource : null,
    $utmMedium !== '' ? $utmMedium : null,
    $utmCampaign !== '' ? $utmCampaign : null,
    $sourceUrl !== '' ? $sourceUrl : null
);

ss_log_event('booking_webhook_received', [
    'provider' => $provider,
    'provider_event_id' => $providerEventId,
    'inserted' => $inserted,
]);

ss_json(200, [
    'ok' => true,
    'inserted' => $inserted,
    'id' => $bookingId,
    'person_id' => $personId,
    'booking_id' => $canonicalBookingId,
]);
