# First Visit Funnel Tracking

The site measures the visitor path without sending names, email addresses, phone numbers, or message text to analytics.

## Events

| Event | Trigger | Notes |
| --- | --- | --- |
| `first_visit_cta_click` | Booking-link click | Automatic; includes lane, source page, and campaign. |
| `booking_started` | First valid-form interaction | Automatic; includes requested period and preferred day when selected. |
| `booking_submitted` | Valid booking-form submit | Automatic; does not mean Sandy has confirmed the appointment. |
| `visit_confirmed` | Sandy confirms the appointment | Operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `first_visit_showed` | Prospect arrives | Operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `first_class_attended` | First coached class completed | Operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `core_purchased` | 12-week program purchased | Operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `activated_30d` | Chosen early-attendance threshold reached | Operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |
| `renewed` | Student continues the first term | Operational system calls `window.SS_TRACK_FUNNEL_STAGE`. |

Every event carries `lane`, `source_page`, and `campaign`. Booking events may also carry `requested_start_period` and `preferred_day`. A trusted operational integration may add `lead_id` or `customer_id`; do not send contact details.

## Dashboard rates

Use distinct people or lead IDs where available:

1. CTA click → booking start
2. Booking start → booking submit
3. Booking submit → visit showed
4. Visit showed → core purchased
5. Core purchased → activated within 30 days

Break down each rate by `lane` (`kids`, `teens`, `adults`, `family_unsure`) and campaign. The largest loss is the next constraint to investigate.
