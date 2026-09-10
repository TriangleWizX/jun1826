# First Visit Funnel Tracking

The site measures the visitor path without sending names, email addresses, phone numbers, student names, message text, or full user-supplied URLs to analytics.

## Events

| Event | Trigger | Notes |
| --- | --- | --- |
| `first_visit_cta_click` | Booking-link click | Includes lane, source page, and campaign when available. |
| `lead_form_started` | First meaningful form interaction | Fires once per form instance. |
| `first_visit_submitted` | Valid booking-form submit attempt | Fires once per form instance; does not prove delivery or staff confirmation. |
| `booking_confirmed` | Receipt-page arrival | Browser-observable only; direct visits and reloads are not staff confirmation. |
| `visit_confirmed` | Sandy confirms the appointment | A trusted operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `first_visit_showed` | Prospect arrives | A trusted operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `first_class_attended` | First coached class completed | A trusted operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `core_purchased` | 12-week program purchased | A trusted operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `activated_30d` | Chosen early-attendance threshold reached | A trusted operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `renewed` | Student continues after the first term | A trusted operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |

Every funnel event carries `lane`, `source_page`, and `campaign` when available. Booking events may also carry `requested_start_period` and `preferred_day`. The homepage and dedicated booking form use the shared funnel producer; page handlers do not emit duplicate start or submit events.

## Dashboard rates

Use distinct people or lead IDs where an existing trusted system provides them:

1. `first_visit_cta_click` → `lead_form_started`
2. `lead_form_started` → `first_visit_submitted`
3. `first_visit_submitted` → `first_visit_showed`
4. `first_visit_showed` → `core_purchased`
5. `core_purchased` → `activated_30d`

Use one consistent cohort and follow-up window. Appointments whose date has not arrived are not no-shows. If only session counts exist, label rates as session-level. Missing operational data is unknown, not zero.
