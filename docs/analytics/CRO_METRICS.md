# Free Intro conversion metrics

These definitions are the measurement contract for the adult-first-visit funnel.
They describe browser behavior separately from appointments, attendance, and
sales. A browser event cannot prove an operational outcome.

## Reporting units and segments

Use distinct observed browser sessions for browser rates and distinct eligible
appointments or people for operational rates. Do not divide one unit by the
other. Report the unit, date range, timezone, missing-event coverage, and any
unknown lane beside each rate.

A qualified commercial source is `/`, a program route, a location route
(`/near/` or `/bjj-classes/`), `/options-pricing`, or `/success-stories`. For
an adult rate, it must also have an explicit adult route, lane, or approved
campaign signal. Do not use total site traffic as the denominator.

Map current names before reporting:

| Reporting field | Canonical values | Current inputs and rule |
| --- | --- | --- |
| `lane` | `kids`, `teens`, `adults`, `family_unsure` | Map `kid`, `child`, and `youth` to `kids`; `teen` to `teens`; `adult` and `adult-beginner` to `adults`; map family and unknown values to `family_unsure`. |
| `campaign` | Stored approved attribution or `none` | Use `campaign` or `utm_campaign` when available. Do not use a raw full URL as a reporting dimension. |
| booking reference | Boolean only | Browser payloads may contain `booking_reference_present: true`; provider UIDs and booking IDs stay in the private reconciliation system. |

## Canonical browser conversion

`booking_completed` is the canonical browser booking conversion. It is emitted
only by `js/progressive-booking.js` after Cal's `bookingSuccessfulV2` callback
has a UID, `status: "ACCEPTED"`, and no payment requirement. It is deduplicated
by UID for the current page lifecycle.

The same accepted callback currently emits these legacy compatibility aliases:
`calendly_scheduled`, `booking_complete`, and `book_intro_submit`. They all
describe the same accepted booking lifecycle. Count `booking_completed` once;
never add aliases together or count them as separate bookings.

`booking_confirmed` is retired as a browser event. A hidden
`#booking-confirmation-title`, a direct page visit, a reload, a calendar-ready
signal, a form attempt, or a provider request that is pending, payment-required,
or missing a UID is not a conversion. The confirmation UI is allowed to appear
only after the accepted callback; it is not a staff confirmation record.

The page-lifecycle UID set does not prove deduplication across a reload or
another browser session. The private reconciliation process is the authority
for appointment-level duplicates, cancellations, and reschedules.

## Current browser funnel

| Stage | Current event and trigger | Reporting rule |
| --- | --- | --- |
| Eligible adult entry | Qualified source path plus an explicit adult route, lane, or approved campaign signal | Count observed sessions; report unknown intent separately. |
| First Visit CTA | `first_visit_cta_click` on a link to the booking route | Deduplicate only under the documented session/action rule. |
| Lane resolved | `lane_resolved` after the booking profile resolves; `lane_selected` records a manual change | Include preselected adults; do not require a manual click. |
| Calendar ready | `availability_viewed` after Cal `linkReady` | Provider-ready diagnostic only. It does not prove an open slot or an appointment. |
| Calendar recovery | `calendar_load_failed` | Diagnostic only; preserve it for failure-rate analysis. |
| Booking accepted | `booking_completed` from the accepted Cal callback | One canonical conversion per accepted booking lifecycle. |

The calendar page has no active details form in the current rendered booking
path. Exclude `lead_form_started`, `first_visit_submitted`, and
`details_submit_attempt` from the calendar funnel. The shared funnel module may
record `lead_form_started` and `first_visit_submitted` for an active homepage
lead form; report that as a separate branch and do not call it a calendar
completion.

## Operational funnel

`visit_confirmed`, `first_visit_showed`, `first_class_attended`,
`core_purchased`, `activated_30d`, and `renewed` are integration hooks for a
trusted operational system. Calling `window.SS_TRACK_FUNNEL_STAGE` does not
authenticate a staff record or create one. `visit_confirmed` means a trusted
staff or operations record confirms the visit; it never means browser receipt
view, provider acceptance, or a planned class time.

The browser hook accepts only `booking_reference_present` and
`operational_record_present` booleans from an operational caller. It rejects
contact details, message text, medical information, booking IDs, and raw
provider objects. The private system owns identities and joins.

## Metrics

Browser rates use sessions:

- CTA rate = adult CTA sessions / eligible adult-entry sessions.
- Calendar-ready rate = ready sessions / resolved adult sessions.
- Accepted-booking rate = `booking_completed` sessions / calendar-ready sessions.

Operational rates use mature records in the same documented cohort and
follow-up window:

- Visit-show rate = attended visits / confirmed visits due in the cohort.
- First-class rate = first-class attendees / visit attendees with the same
  follow-up window.
- Paid-start rate = paid adult-plan starts / first-class attendees in that
  cohort.

Future appointments, canceled or rescheduled appointments awaiting
reconciliation, and records with no trusted join are unknown or still open;
they are not no-shows. A paid start does not establish retention or a personal
training outcome. See
[the private reconciliation specification](adult-first-visit-reconciliation-spec.md)
before publishing an operational rate.
