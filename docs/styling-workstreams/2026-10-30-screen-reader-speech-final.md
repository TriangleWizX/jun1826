# Screen-reader speech acceptance — final results

## Production checks

Checks used task-owned Google Chrome at 390×844 and Orca 46.1. Evidence is Orca's logged speech output, not independent listening. No form was submitted and no booking, SMS, email, or availability action was activated.

| Area | Result | Observed speech and matching state |
| --- | --- | --- |
| Navigation | Pass | Tab to Menu: “Open menu collapsed push button.” Enter: “Close menu expanded push button,” then “Home link.” The settled navigation was visible, `aria-expanded=true`, and focus was on Home. Escape: “Open menu collapsed push button.” The menu closed, `aria-expanded=false`, and focus returned to Menu. |
| Schedule | Pass for the tested date change | With Friday, October 30 selected, ArrowRight selected Saturday, October 31. Orca said: “Saturday, October 31, 2026. 10:30–11:30 AM Adult No-Gi. 5:00–8:00 PM Halloween Spooktacular · Meet Sasquatch toggle button expanded.” The selected button and visible details matched. |
| Free Intro form | Error speech present; repeat observed | Tab reached “Your name (parent or guardian for a child or teen) entry required.” Field-level native validation produced “Please fill out this field.” Orca logged that error three times in production within about 180 ms. The local preview logged it once. The reason for this difference is not established. |

## Fix and release evidence

The request form now associates each inline validation message with its field using `aria-describedby`, sets `aria-invalid`, and exposes the message through a polite atomic status region. Orca announced the error on the local preview and on production after release.

- Commits: `b654b4d4` and `cea4afa`.
- Each dry run resolved to one payload path: `js/progressive-booking.js`.
- Final upload reported `remote_bytes=22362`.
- A cache-busted production read returned HTTP 200 and 22,362 bytes with the `role=status`, `aria-live=polite`, and `aria-atomic=true` markers.
- `node --check js/progressive-booking.js` passed. An isolated Eleventy output was built outside the main generated tree and used for the local Orca check.
- Deployment cleanup rotated two older predeploy archives (about 1.13 GB each), as recorded in the evidence JSON.

The production repetition remains a follow-up observation. Navigation and Schedule speech matched browser state; the Free Intro error is announced, but its repeat count differs between local preview and production. This is a focused acceptance check, not a complete screen-reader audit.
