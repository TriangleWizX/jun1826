# API Contracts (v1)

Base path: `/api`

## Owner-Only Ops Auth

These endpoints require an ops key:

- `/api/students`
- `/api/sessions`
- `/api/attendance` and `/api/attendance/checkin`
- `/api/waivers`
- `/api/exports/attendance.csv`

Provide one of:

- `X-Ops-Api-Key: <OPS_API_KEY>`
- `Authorization: Bearer <OPS_API_KEY>`

## `GET /api/health`

Response:

```json
{
  "ok": true,
  "status": "healthy",
  "db": "up",
  "timestamp": "2026-02-12T00:00:00+00:00"
}
```

## `POST /api/leads`

Request JSON (or form-encoded):

```json
{
  "name": "Jane Doe",
  "contact_method": "text",
  "phone": "+19175551212",
  "email": "jane@example.com",
  "interest_lane": "adults",
  "message": "Looking for a first class this week",
  "source_url": "https://senseisandy.com/contact",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "free_intro",
  "intro_start_at": "2026-02-15T15:00:00Z",
  "booking_source": "manual",
  "booking_external_id": "evt_12345_optional",
  "website": ""
}
```

Notes:

- `website` is honeypot and must stay blank.
- At least one of `phone` or `email` is required.
- Also upserts canonical `person` (`status=lead`) and can create `booking` when `intro_start_at` is provided.

## `POST /api/webhook/booking`

Required header:

- `X-Booking-Webhook-Secret: <BOOKING_WEBHOOK_SECRET>`

Example payload:

```json
{
  "provider": "calendly",
  "provider_event_id": "evt_12345",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+19175551212",
  "lane": "adults",
  "start_time": "2026-02-15T15:00:00Z",
  "source_url": "https://senseisandy.com/book-free-intro/adults",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "free_intro"
}
```

Notes:

- Writes legacy webhook mirror table and canonical `person`/`booking` records.

## `GET /api/reviews`

Returns latest cached review payload from `review_cache`.

## `GET /api/students`

Query params:

- `status` optional: `lead|active|inactive|archived|all` (default `active`)

Response includes person rows with nested enrollments.

## `POST /api/students`

Creates `person + household + enrollment` in one transaction.

Request JSON:

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com",
  "phone": "+19175551212",
  "birthdate": "2014-08-21",
  "is_minor": true,
  "status": "active",
  "notes": "Prefers Tuesday classes",
  "household_name": "Doe Household",
  "household_role": "child",
  "guardian_person_id": "existing-guardian-uuid",
  "program_code": "kids",
  "plan_id": "optional-plan-uuid",
  "enrollment_status": "active",
  "start_date": "2026-02-15",
  "end_date": null
}
```

Notes:

- `program_id` can be used instead of `program_code`.
- `program_code` accepted values depend on rows in `program` (default includes `kids`, `teens`, `adults`, `privates`).
- At least one of `email` or `phone` is required.

## `GET /api/sessions`

Query params:

- `date_from` optional ISO timestamp
- `date_to` optional ISO timestamp
- `program_id` optional

## `POST /api/sessions`

Request JSON:

```json
{
  "location_id": "uuid",
  "program_id": "uuid",
  "title": "Adults Fundamentals",
  "start_at": "2026-02-15T18:00:00Z",
  "end_at": "2026-02-15T19:00:00Z",
  "capacity": 24
}
```

## `GET /api/attendance`

Query params:

- `session_id` optional
- `person_id` optional

## `POST /api/attendance`

Alias: `POST /api/attendance/checkin`

Request JSON:

```json
{
  "session_id": "uuid",
  "person_id": "uuid",
  "status": "present",
  "checked_in_at": "2026-02-15T18:02:00Z"
}
```

## `GET /api/waivers`

Query params:

- `person_id` optional

## `POST /api/waivers`

Metadata-only waiver record (file stored outside DB):

```json
{
  "person_id": "uuid",
  "guardian_id": "uuid",
  "signed_at": "2026-02-15T17:00:00Z",
  "waiver_version": "2026-02",
  "storage_uri": "s3://secure-waivers/waiver-123.pdf",
  "file_sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "ip_address": "203.0.113.10"
}
```

## `GET /api/exports/attendance.csv`

Returns CSV download joined from `attendance + session + person + program`.
