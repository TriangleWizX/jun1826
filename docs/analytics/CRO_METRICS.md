# Free Intro conversion metrics

These definitions are the measurement contract for the post-CRO funnel. All
rates use distinct sessions (the `sensei_attribution_v1` first-party
session) and are segmented by `lane` and `town` where the event provides them.

## Qualified commercial session

A session is qualified when its first-party source path is `/`, a program
route, a location route (`/near/` or `/bjj-classes/`), `/options-pricing`, or
`/success-stories`. Do not use total site traffic as the denominator.

## Primary KPI

`Free Intro Conversion Rate = distinct booking_completed sessions / distinct
qualified commercial sessions`.

`booking_completed` is valid only when emitted from the confirmed
`calendly.event_scheduled` message. Clicks, form submissions, navigation, and
the confirmation page are not completion evidence.

## Supporting funnels

- `CTA effectiveness = distinct free_intro_cta_click sessions / qualified commercial sessions`
- `Booking-start rate = distinct booking_started sessions / distinct free_intro_cta_click sessions`
- `Booking-completion rate = distinct booking_completed sessions / distinct booking_started sessions`
- Lane conversion: calculate independently for `kids`, `teens`, `adults`, and `community_service`.
- Location conversion: calculate independently for `tannersville`, `hunter`, `windham`, and `haines_falls`.

## Required event contract

Commercial events carry `source_page`, `source_path`, `page_type`, `lane`, and
where available `town`, `destination_path`, and `cta_location`. Attribution
also carries `original_source_page` and `latest_commercial_source_page` in
session storage and event payloads.

Analytics payloads must never include names, email addresses, phone numbers,
child names, medical information, or freeform form responses.

## Booking state funnel

`intro_page_loaded → lane_resolved → availability_displayed →
appointment_selected → form_started → form_validated → booking_submitted →
booking_confirmed`.

The state events are diagnostic telemetry; only `booking_completed` is a
conversion event, and it requires confirmed appointment creation.
