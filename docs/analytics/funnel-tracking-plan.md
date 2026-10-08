# First Visit Funnel Tracking

The site measures browser behavior without sending names, email addresses,
phone numbers, student names, message text, medical information, booking IDs,
or raw provider objects to analytics. Operational records stay in the trusted
private system.

## Active event contract

| Event | Trigger | Reporting meaning |
| --- | --- | --- |
| `intro_page_loaded` | Booking flow initializes | Page diagnostic; not an eligible adult session by itself. |
| `first_visit_cta_click` | A visitor clicks a link to the booking route | First Visit intent. |
| `lane_resolved` | Booking profile resolves | Includes direct lanes and aliases. |
| `lane_selected` | Visitor manually changes the profile | A change diagnostic; preselected adults still count as resolved. |
| `availability_viewed` | Cal reports `linkReady` | The provider view is ready. It is not proof of an open slot. |
| `calendar_load_failed` | Calendar load fails | Recovery diagnostic; not a booking result. |
| `booking_completed` | Cal `bookingSuccessfulV2` has a UID, `ACCEPTED` status, and no payment requirement | Canonical accepted browser booking. |
| `calendly_scheduled`, `booking_complete`, `book_intro_submit` | The same accepted callback | Legacy aliases for the one accepted booking lifecycle. Keep them for downstream compatibility; never sum them. |
| `lead_form_started`, `first_visit_submitted` | A current form instance receives input or a valid submit | Homepage lead-form branch only when that form is active. They are not calendar stages or booking proof. |
| `visit_confirmed` | Trusted staff or operations integration calls `SS_TRACK_FUNNEL_STAGE` | Operational confirmation, not a receipt view. |
| `first_visit_showed`, `first_class_attended`, `core_purchased`, `activated_30d`, `renewed` | Trusted operations integration calls `SS_TRACK_FUNNEL_STAGE` | Later operational stages. The hook itself is not an authenticated record. |

`booking_confirmed` is not an active browser event. It was formerly inferred
from the receipt heading, which exists in hidden markup before any accepted
booking. Historical reports must treat it as a retired diagnostic, never as a
completion or staff-confirmation measure.

## Booking-event gates

Only the current Cal callback can emit `booking_completed`. Initial load,
hidden success content, a direct page reload, `linkReady`, a forged message,
a missing UID, `PENDING`, or `paymentRequired: true` must emit no conversion.
Repeated accepted callbacks with the same UID yield one completion in the
current page lifecycle. This in-memory deduplication does not establish
cross-session or provider-side deduplication.

Every shared funnel event has `lane`, `source_page`, and `campaign` when
available. Normalize names before reporting: adult and `adult-beginner` map to
`adults`; kid, child, and youth map to `kids`; teen maps to `teens`; family
or unknown maps to `family_unsure`. The accepted booking payload uses only
categorical scheduler fields and `booking_reference_present: true`.

## Reporting and reconciliation

Use `booking_completed` as the one browser conversion. Map legacy aliases to
that same lifecycle only for compatibility. Report browser rates in distinct
sessions and operational rates in mature appointments or people; do not divide
those units together.

Before reporting attendance or paid starts, reconcile the private appointment,
staff, attendance, and enrollment records under the rules in
[adult-first-visit-reconciliation-spec.md](adult-first-visit-reconciliation-spec.md).
Unknown joins, future appointments, and pending reschedules remain unknown;
they are not failed visitors.
