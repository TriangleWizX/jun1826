# Screen-reader speech acceptance — 2026-10-30

## Scope and result

Production checks used Orca 46.1 with the task-owned Google Chrome session. Orca's debug speech output is the evidence source; no independent listening was performed. Browser state was read from the same production tab. No form was submitted and no booking/contact action was activated.

| Area | Result | Evidence |
| --- | --- | --- |
| Shared navigation | **Follow-up required.** Orca announced the skip link. On the menu test, the menu became visible and focus moved to “Classes,” while the inspected toggle still reported `aria-expanded="false"`. The live announcement did not clearly confirm the expanded state. | `evidence/2026-10-30/screen-reader/acceptance.json` |
| Schedule | **Pass for the tested date change.** Orca announced Friday, Oct 30 with its two classes; ArrowRight selected Saturday, Oct 31 and Orca announced the date and class/event details. The selected button and live region matched. | Same evidence record |
| Free Intro form | **Follow-up required.** The visible name field is required and correctly labelled in the DOM. Native validity returned “Please fill out this field.” No corresponding field/error utterance appeared in the Orca speech log during this check. The hidden schedule-dialog field was excluded from the result. | Same evidence record |

## Constraints and next action

These are focused production checks, not a full assistive-technology audit. Navigation state synchronization and spoken Free Intro field/error feedback need review and retest. The evidence does not establish independent audible output. This is documentation/evidence only; it does not change site code and has no website deployment payload.
