# Adult First Visit Reconciliation Specification

Status: pending trusted operations input. This is a private-report schema, not an
actual performance report and not an authorization to export, write, or publish
operational data.

## Purpose and boundary

Use this specification to reconcile one adult First Visit from provider
acceptance through staff confirmation, visit attendance, first-class attendance,
and a paid adult-plan start. Browser analytics measure site behavior; the
trusted private system joins real appointments and people.

Keep names, contact details, message text, waiver details, medical information,
raw provider payloads, provider UIDs, and payment records in the trusted private
system. Public analytics may receive only approved lane/campaign categories and
presence booleans. It must never receive the private join key.

## Ownership and refresh gate

The report cannot operate until the academy names all three items:

| Required item | Required decision | Current state |
| --- | --- | --- |
| Report owner | Person responsible for resolving records and approving a refresh | Pending. |
| Trusted sources | Provider appointment export, staff confirmation, attendance record, and enrollment/payment record with their owners | Pending. |
| Refresh cadence and observation window | Timezone, cohort close rule, first-class follow-up window, and paid-start window | Pending. |

Until those decisions and a trusted sample exist, label every operational rate
`not-yet-measured`. Do not substitute browser events for attendance or sales.

## Private row schema

Create one private reconciliation row per original accepted visit appointment.
Use a stable `trusted_appointment_key` generated and retained only in the
trusted system. The key may be a provider UID or a private derived key; it is
never sent to browser analytics or included in an exported public report.

| Field | Type | Source and rule |
| --- | --- | --- |
| `reconciliation_run_id` | Private string | Identifies one refresh run and its source snapshots. |
| `trusted_appointment_key` | Private stable key | Joins provider, staff, attendance, and enrollment records. |
| `person_key` | Private stable key | Used only to resolve repeated appointments and later classes for one person. |
| `appointment_at` | Datetime plus IANA timezone | Provider appointment timestamp and timezone as supplied. |
| `booking_accepted_at` | Datetime plus IANA timezone | Accepted-provider timestamp when available. |
| `adult_lane` | Boolean/category | Explicit adult route or staff-confirmed adult program; preserve `unknown` when evidence is absent. |
| `appointment_state` | Enum | `accepted`, `pending`, `canceled`, `rescheduled`, `completed`, or `unknown`. |
| `rescheduled_from_key` | Private key or empty | Points to the original appointment; count the person once under the documented rule. |
| `staff_confirmation_state` | Enum | `confirmed`, `not_confirmed`, `unknown`, or `not_required` only when a named operations rule permits it. |
| `visit_attendance_state` | Enum | `attended`, `did_not_attend`, `still_open`, `unknown`, or `not_due`. |
| `first_class_at` | Datetime plus IANA timezone or empty | The first trusted adult-class attendance linked within the approved window. |
| `first_class_state` | Enum | `attended`, `not_attended`, `still_open`, `unknown`, or `not_due`. |
| `paid_start_at` | Datetime plus IANA timezone or empty | Trusted adult-plan start; do not use a proposal or browser click. |
| `paid_start_state` | Enum | `started`, `not_started`, `still_open`, `unknown`, or `not_due`. |
| `join_coverage` | Enum | `complete`, `missing_provider`, `missing_staff`, `missing_attendance`, `missing_enrollment`, or `ambiguous`. |
| `resolution_note` | Private controlled note | Optional owner review note; never export to browser analytics. |

## Reconciliation rules

1. Freeze the source snapshot and record its timezone before counting.
2. Resolve duplicate provider messages by the trusted appointment key. Resolve a
   reschedule to its original visit; do not count both as people.
3. Keep cancellations and reschedules visible. A future appointment, a record
   inside the observation window, or an unresolved join is `still_open` or
   `unknown`, not a no-show.
4. Link a later first class to its original visit only under the owner-approved
   follow-up window. If several possible visits exist, mark `ambiguous` until a
   staff rule resolves it.
5. Count an attendance or paid start only from its trusted operational record.
   Provider acceptance and staff confirmation are separate facts.
6. Publish counts with join coverage, cancellations, reschedules, still-open
   records, and the cohort close date. Do not report a percentage without its
   denominator and coverage.

## De-identified output schema

For an approved internal summary, emit only these aggregate fields:

| Field | Meaning |
| --- | --- |
| Cohort dates and timezone | The dated cohort and its calculation timezone. |
| Adult lane category | `adults` or `unknown`; never infer age from an unidentified session. |
| Accepted, confirmed, attended, first-class, and paid-start counts | Separate stage totals under the rules above. |
| Canceled, rescheduled, still-open, unknown, and missing-coverage counts | Required context for every rate. |
| Join-coverage percentage | Complete private joins divided by the source records expected for that stage. |

The report may expose `booking_reference_present` only as a boolean coverage
measure. It must not expose appointment keys, people, provider IDs, contact
details, notes, or raw operational objects.

## Acceptance before operation

Before the first report, the owner must reconcile a de-identified sample from
accepted booking through confirmation, arrival, first class, and paid start.
The sample totals must match each named trusted source under the documented
duplicate, cancellation, reschedule, and observation-window rules. If a join is
missing, report missing coverage rather than a failed visitor.
