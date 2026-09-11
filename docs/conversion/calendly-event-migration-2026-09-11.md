# Free First Visit Calendly event migration

**Release version:** 2026-09-11. **Scope:** `/free-bjj-intro-tannersville-ny` only.

The route controller is the sole owner of a confirmed Calendly booking. The
shared analytics listener remains active on other routes, but does not count
or redirect a booking from this route.

| Stage | Event | Trigger | Counting rule |
|---|---|---|---|
| Route exposure | `intro_page_loaded` | Booking route loads | Diagnostic only. |
| Lane resolution | `lane_resolved` | Valid query lane or manual choice | Includes `selection_method`. |
| Lane change | `lane_selected` | A manual choice changes the current lane | Does not fire for calendar rendering. |
| Scheduler view | `availability_viewed` | Calendly sends `calendly.event_type_viewed` | This means the scheduler view appeared; it does not claim an open slot. |
| Mobile open | `calendar_opened` | Visitor taps **See available times** | Intent only; no booking is inferred. |
| Time selection | `time_selected` | Calendly sends `calendly.date_and_time_selected` | Selection only; no booking is inferred. |
| Booking | `calendly_scheduled` | Trusted `calendly.event_scheduled` message | One event per provider event/invitee URI; a repeated message is ignored. |
| Details | `details_submit_attempt` | Valid client-side details form submission | An attempt only. Form acknowledgement remains the data owner's responsibility. |

The controller accepts only `https://calendly.com` messages and only the
documented view, selection, and scheduled event types. It forwards a bounded
campaign allowlist and a pathname, never the complete page URL, provider URI,
or attendee details.

Historical dashboards must treat pre-2026-09-11 completion aliases separately
from `calendly_scheduled`; they are not a compatible combined booking total.
