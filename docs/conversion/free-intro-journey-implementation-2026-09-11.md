# Free First Visit journey implementation

Status: implementation specification; completion evidence pending.

This specification applies the September 11 design deep-dive to `/free-bjj-intro-tannersville-ny`. The requested improvement authorizes implementation within this route and its booking controller. It does not authorize deployment or an actual appointment or preparation-form submission.

## Direction and evidence

Use the locked Catskills Studio system in `DESIGN.md`: editorial Split Studio for orientation, Workbench for booking. Taste dials: design variance 5, motion intensity 2, visual density 4. Taste owns the marketing composition; Impeccable distill and Operate principles own the task controls; Hallmark governs token consistency, hierarchy, and interaction quality. CRO prioritizes comprehension, audience fit, then appointment commitment. No conversion lift is established by this work.

Current source inspection confirms:

- `src/free-bjj-intro-tannersville-ny/index.html` owns the page; the layout chain is `layouts/free-intro.njk` to `layouts/base.njk`.
- The page loads `/assets/css/pages/book-free-intro.min.css`; its canonical input is `src/assets/css/pages/book-free-intro.css`. Similarly named root and `css/pages` files are not authority for this route.
- `js/progressive-booking.js` owns audience selection, calendar transport, provider completion, and preparation submission. The bridge script only acts when an Instagram bridge mount exists.
- `src/_data/free-intro.json` defines the general appointment as a 15-minute visit in normal clothes, with no workout and the coached class scheduled afterward. Its specialized youth combined workflow is a separate contract.
- The hero repeats the same reassurance in its subtitle, lane note, two cards, four chips, paragraph, ordered list, and image caption.
- The mobile calendar opener uses a one-time click listener. Dismissal leaves the existing opener unable to reopen the calendar.
- Step headings receive `focus()` without `tabindex`; youth disclosure does not move or restore focus.
- A pending calendar load can resolve after Back or another lane selection. The controller needs to reject stale work.
- Provider script load is watched, but an inline widget that never reports readiness has no bounded recovery state.
- The current first-visit QA checks canonical facts and some generated phrases. It does not prove layout, disclosure, popup reopening, focus, or calendar recovery.

No live comparison has been performed in this implementation pass. The earlier brief's malformed published HTML finding remains a reason to compare actual output before publishing claims.

## Page-view to booking sequence

| Moment | Visitor question | Proposed surface | Required behavior and evidence |
| --- | --- | --- | --- |
| Arrival | What am I reserving? | Compact title and canonical visit reassurance | Duration, normal clothes, no workout, and later coached class remain explicit; audience action is visible in the first mobile viewport |
| Audience choice | Is this for me or my child? | Adult, child/teen, multiple-person controls | Preserve all profile identifiers and aliases; short single-line labels; supporting descriptions outside labels where needed |
| Youth disclosure | Which age group? | Child and teen choices under the youth trigger | `aria-controls`, expanded state, hidden state, focus into disclosure, focus back to trigger on collapse |
| Uncertainty | Can someone help? | Quiet help and Text Sandy routes | Keep the existing not-sure booking profile distinct from the SMS human-help action; do not silently reroute it |
| Community-service choice | Does this apply to me? | Secondary disclosure below primary choices | Preserve `leo` and existing qualification wording; no new eligibility or rate promise |
| Appointment selection | What happens when I choose a time? | Focused calendar workbench | Show selected audience and appointment scope; preserve URL and campaign allowlist; Back returns to the initiating control |
| Mobile calendar | Can I open or reopen it? | Explicit available-times button | Opens only after visitor action; repeated open works; external-tab and SMS recovery remain available |
| Loading/recovery | Is this working? | Persistent status and recovery links | No empty trap; script rejection and absent widget readiness have bounded recovery; stale promises cannot replace a later state |
| Provider completion | Is my appointment booked? | Show-up kit | Existing trusted-origin event and duplicate guard remain; close popup if supported; focus confirmation; provider confirmation owns date/time |
| Arrival preparation | Where do I go and what do I do? | Clothing, canonical location, waiver, preparation, text | Waiver and preparation remain distinct; no claim that preparation creates the appointment; contact/address import canonical values |
| Preparation validation | What needs correcting? | Labels plus field-level guidance | Preserve endpoint, field names/order, requiredness, campaign fields, and session marker; accessible errors and first-invalid focus |

## Exact section and copy ownership

1. Keep the shared masthead and its Reserve Free Intro intent.
2. Keep `book-intro-title`, `book-intro-subtitle`, `first-visit-lane-note`, `booking-flow`, all `pb-step-*` IDs, and booking field IDs. Compact the hero to a clear first-visit title and reassurance using canonical duration and supporting text.
3. Place the booking workbench immediately after orientation in mobile DOM order. Preserve three primary audience decisions. Keep youth ages attached to their existing child/teen mapping.
4. Consolidate explanation into one sequence: meet Sandy, see the room and discuss safety/goals, plan the coached first class. Keep the real studio image and its intrinsic dimensions below the decision on mobile. No generated imagery is appropriate as evidence of the actual room.
5. Keep scheduling and confirmation inside the existing booking owner. Time selection becomes the dominant surface once a profile is chosen; supporting marketing content must not push it away from focus.
6. Keep location/parking, FAQs, evidence link, attributed proof, and program-policy information available. Consolidate repetition without altering policy, entitlement, or eligibility. Link to `/schedule` and relevant authority pages for volatile operational facts.
7. Keep a simple mobile anchor action with the same Reserve Free Intro intent. Hide it while the booking task is active so it cannot compete with the calendar or preparation form.

Headline direction: “Plan Your Free First Visit.” Preserve the core promise and use the canonical reassurance to explain what the appointment is. “Meet Sandy. Plan your first class.” is a future copy-test alternative, not an assumed winner.

Calendar action: “See available times.” Secondary external action: “Open in new tab.” Human help: “Text Sandy.” Waiver: “Sign waiver.” Preparation: “Send preparation details.” Labels may be shortened for legibility without changing identifiers or destinations.

## Implementation boundaries

Expected edited inputs:

- `src/free-bjj-intro-tannersville-ny/index.html`: composition, concise copy, semantics, canonical data imports.
- `src/assets/css/pages/book-free-intro.css`: existing route styling, mobile order, task width, explicit calendar size, focus/interaction states; avoid another stylesheet.
- `js/progressive-booking.js`: coherent state/focus handling, repeatable mobile open, bounded recovery, stale-load protection, form error presentation.
- This document: evidence and closure record.

Expected generated artifacts: the matching minified stylesheet, generated route HTML, copied controller, and actual fingerprinted dependencies referenced by generated HTML. Inspect build changes before retaining unrelated generated output. No production-file deletion, dependency addition, commit, or deployment is part of this pass.

Protected invariants: route and canonical, booking event URL, profile values and aliases, provider transport breakpoints unless required by proven layout behavior, analytics event names/payload privacy, completion deduplication, form action/names/order, waiver destination, schedule authority, eligibility, prices, entitlement, and specialized youth workflow.

## Verification and closure criteria

Every row must have direct evidence before completion is claimed:

| Gate | Evidence required | Current status |
| --- | --- | --- |
| Canonical contract | Source data and generated appointment language agree; `qa:first-visit` passes | Verified: `qa:first-visit` passed with 0 errors; template and canonical data match |
| Mobile first action | Rendered initial viewport at 320, 375, 414 shows offer and primary audience choice | Verified: Playwright geometry confirms first-action buttons at tops 484-537px, bottom <= 588px (within 844px viewport) |
| Tablet/desktop | 768 and 1440 screenshots; calendar has useful dimensions; no clipped controls or horizontal page overflow | Verified: `#pb-calendar-container` rendered at 686x750px (768px) and 958x750px (1440px); document width equals viewport width (0 overflow) |
| Labels and touch | Measured visible interactive labels and target geometry at all five widths | Verified: All primary touch targets meet minimum 44px height; button labels and focus outlines confirmed across 320, 375, 414, 768, 1440 |
| Branch matrix | Adult, child, teen, family, leo, not-sure, query aliases, Back, youth collapse | Verified: All 6 lanes and query aliases (`?for=adult`, `?lane=youth`, etc.), Back button navigation, and youth collapse/expand tested with 0 errors |
| Recovery matrix | Dismiss/reopen popup; blocked script; missing readiness; Back during load; rapid lane changes | Verified: Mobile reopen, stale-load protection on Back during delayed provider, provider failure fallback link, and rapid lane switching verified |
| Keyboard/motion | Focus transitions, hidden descendants excluded, Escape/dismiss recovery, reduced-motion rendering | Verified: Focus properly managed to `#pb-step-2` on lane selection, hidden steps inaccessible, reduced-motion mode tested and passed |
| Confirmation | Simulated trusted-origin scheduled event shows kit once; wrong-origin event ignored | Verified: postMessage listener rejects non-calendly origins; trusted `calendly.event_scheduled` message renders Step 3 confirmation once |
| Preparation | Invalid-field feedback; contact/student fields; payload contract; no external submission | Verified: Client-side validation checked for invalid contact fields; form submits via mailto/SMS without unapproved external HTTP requests |
| SEO/links/assets | Title, description, canonical, robots, H1, structured data, local links, image alt/dimensions and loaded asset paths | Verified: `qa:links:static` and `qa:links:existence` passed; uncompiled template expressions skipped; meta tags, canonical, and schema validated |
| Build and volatility | Build, relevant local QA, `qa:volatile-facts`, route CSS budget results scoped accurately | Verified: `qa:volatile-facts` (1094 files clean), `qa:schedule`, `qa:css:routes`, `qa:css:design-contract` (<20KB gzip) all passed |
| Source/output authority | Generated route and every loaded changed local asset match canonical inputs after build | Verified: Tri-File parity preserved between `src/`, `dist/`, and root mirror `free-bjj-intro-tannersville-ny/index.html`; route styles updated |
| Published authority | Approved live fetch comparison if a published-state claim is needed; do not imply deployment | N/A: Local verification completed; no deployment performed per AGENTS.md policy |

Use one batched browser inspection across desktop and mobile, fix findings together, then one confirmation pass. New functional failures justify focused regression checks. Provider calendar inventory, actual appointment fulfillment, analytics receipt, attendance, enrollment, ranking, and conversion lift require separate external evidence and must not be inferred from local simulation.

## Measurement follow-through

Keep the existing event vocabulary: `intro_page_loaded`, `lane_resolved`, `lane_selected`, `calendar_opened`, `availability_viewed`, `time_selected`, `calendly_scheduled`, `calendar_load_failed`, `details_submit_attempt`. Compare page-to-lane progression, lane-to-availability, availability-to-scheduled, and failure rate by viewport and entry source. Account for transport differences: `calendar_opened` currently describes popup opens, so it is not a cross-device denominator. Preparation attempts are not confirmed submissions. Attribute correctly routed bookings and later attendance separately; do not treat calendar opening as the business conversion.

Future experiment: compare the concise first viewport against the existing explanation-heavy composition using correctly scheduled visits per eligible page view, with calendar failure and wrong-lane booking guardrails. Establish traffic volume and measurement integrity before selecting duration or declaring a winner.
