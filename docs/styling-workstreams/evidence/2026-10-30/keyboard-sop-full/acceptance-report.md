# Keyboard Acceptance Report

Date: 2026-10-30
Environment: production HTTPS
Browser: headed Google Chrome through Browser Use 0.1.13, isolated task profile
Release under review: shared navigation/calendar `d74cee9910b9fb280bd905286870c66eef9dfdda`; Free Intro form script `84554b75`
Viewport baseline: 390 × 844 CSS px at 100%; native Chrome page zoom 200% was used for the zoom checks.

## Results

| Requirement | Result | Evidence and notes |
| --- | --- | --- |
| Skip link and main landmark | Pass across 10 route cohorts | `navigation-routes.json`. Schedule uses `<main id="schedule">`; the primary action is “Reserve Free First Visit.” |
| Mobile menu open, Tab, Escape, focus return | Pass across 10 route cohorts | `navigation-routes.json`. Focus moved into the open menu, remained visible, and returned to the Menu toggle on Escape. |
| Header forward and reverse traversal | Pass across 10 route cohorts | `navigation-reverse-header.json`. |
| Desktop Classes links | Pass, shared component | `classes-dropdown.json`. All four class links were keyboard reachable. The live control is a Menu toggle with class links, not a control named “Classes.” The separate “Your first class” dropdown stayed open through Tab and closed on Escape with focus returned. |
| Primary action name and destination | Pass across sampled route cohorts | `navigation-routes.json`; actions were focused but not activated. No booking or external action was submitted. |
| Footer focus and sticky overlap | Pass across 10 routes, with a subpixel geometry note | `navigation-footer-settled.json`. All 17 footer controls received visible focus on every route, with no visible sticky-bar overlap. On Adults, Glossary, Blog, Pricing, and Visit, Contact and FAQ bounds extended 0.16–0.29 CSS px below the viewport edge; their focus rings remained visible. |
| Footer Enter activation | Pass for 14 same-origin links on the shared footer | `footer-internal-enter.json`. Call, Text, and Email were not activated because they invoke tel, sms, and mailto handlers. |
| Schedule date keyboard controls at 767/768/769 | Pass in the foreground-visible production Browser Use session | The prior hidden-tab harness suppressed native media-query delivery; the callback was exercised in both directions. The final production run used generated Tab, observed native `MediaQueryList.change` events at 768 and 767, retained the same selected date with `:focus-visible` at all widths, and confirmed PageDown/PageUp month navigation. See [production trace](schedule-tab-focus-visible-production.json) and [screenshot](schedule-tab-focus-visible-production.png). |
| Schedule Enter/Space detail toggle | Pass for mobile date activation | `schedule-breakpoints.json` plus the post-deploy follow-up below. Space was sent as the literal `' '` key; Enter and Space selected a different date and opened its details. |
| Sticky action/footer clearance at 100%/200% | Pass after route-specific follow-ups | `sticky-focus-200-native.json` records visible focus and no sticky-bar overlap on Home, Schedule, Free Intro, and Visit. The Schedule hero CTA now also has a dedicated post-release native 200% PageDown check in [schedule-focus-recheck.md](schedule-focus-recheck.md). |
| Free Intro form at native 200% zoom | Pass, stopped before submission | `free-intro-form-200-native.json`. Five labelled fields and the submit control received visible focus; there was no sticky overlap. No form was submitted. The form’s `allLabeled` summary flag is false because hidden/non-user fields were included; all five user-facing fields had labels. |
| 200% reflow | Pass on Home, Schedule, Free Intro, and Visit | `sticky-boundary-200-native.json`. No horizontal overflow was recorded; the CSS viewport narrowed under actual Chrome page zoom. |

## Schedule breakpoint follow-up

Production release `cf362f7` served the canonical `/schedule` route (the trailing-slash URL redirected with HTTP 301; the final route returned HTTP 200) with `schedule-month-calendar.js?v=20261030-focus-visible`. The live asset returned HTTP 200, 15,891 bytes, and SHA-256 `1a1bb3823dfdcb9c793246b854d4673277ec5d8755644f66e77087e7d57c597d`, matching the committed generated asset.

The initial hidden-tab Browser Use run exercised the captured production focus-transfer callback in both directions because background Chrome suppressed `MediaQueryList.change` and `requestAnimationFrame`. That run established callback geometry only. The later foreground-visible production run verified native `MediaQueryList.change` events in both directions at 767↔768 and focus stability at 769; it is recorded below.

The live mobile date controls also passed Enter and literal Space activation: each selected a different date, set `aria-pressed="true"` and `aria-expanded="true"`, and exposed its class details. No booking or external action was activated.

## Scope and limits

No booking, availability, contact, tel, sms, mailto, or form submission was triggered. Lighthouse/PageSpeed, site-wide contrast, screen-reader speech, and physical-device checks remain excluded per the owner’s instructions. This report distinguishes route coverage from shared-component checks and does not establish screen-reader conformance.

## Completed acceptance gaps — 2026-10-30

The owner approved browser-generated keyboard input in place of physical keyboard input. No physical HID test was performed or required. Live interaction used isolated headless Google Chrome 151.0.7922.137 controlled through Playwright 1.62.1 over loopback CDP. Only Tab and PageDown were sent; no link was activated and no form or external action was submitted.

### PageDown focus visibility — PASS

On production Home at 1512×900 CSS pixels, Tab focused “Reserve Your Free First Visit” at y=556.3–610.7. PageDown scrolled from `scrollY=0` to `548`; after scrolling settled, the same link remained `:focus-visible` at y=8.3–62.7. Its focus outline remained solid (3px before, 2px after) with the visible green shadow. This confirms normal scroll movement while keeping the focus indicator visible.

### Schedule breakpoint delivery — PASS

On production `/schedule/`, the 767px viewport matched `(width < 768px)`. Browser Tab focused date `2026-10-30` in the mobile date list with `:focus-visible`. Resizing to 768px delivered one native `MediaQueryList.change` event with `matches=false`; the production `requestAnimationFrame` handler transferred focus to the same date in the desktop calendar, still visible at y=378.3–522.3 in a 900px viewport. At 769px the query stayed false and focus remained on that date.

With the Schedule date still focused, PageDown advanced the calendar from October 2026 to November 2026. Focus remained visible on date `2026-11-30` inside the calendar. This confirms the global focus handler leaves the calendar’s month-navigation behavior intact.

### Release and local checks — PASS

Commit `9e451b9` contains the shared handler in `js/link-utils.js` and the served `js/link-utils.min.js`. The isolated Eleventy build passed; `node --check` passed for both JavaScript files; the generated Home, Schedule, Free Intro, and Visit HTML loads the shared runtime without an inline duplicate. The filtered deploy dry run listed exactly one file, `js/link-utils.min.js`. Production returned HTTP 200, 7,233 bytes, and SHA-256 `c49d3ebf5699bfa0a4de09a5dfa58abc2abec2658878ce2fd84721cddabec203`, matching the isolated build. The main checkout’s generated `dist/js/link-utils.min.js` was restored to its original clean bytes after upload.

Browser Use Cloud could not start because the account lacked Cloud browser permission, and its local daemon could not attach before Chrome was started. The accepted browser-generated input was verified with isolated local Chrome through Playwright CDP instead. The Chrome profile and process were task-owned and closed after the checks.

## Scope and limits

Physical keyboard/HID testing, screen-reader speech, Lighthouse/PageSpeed, site-wide contrast, and physical-device checks remain excluded under the owner’s instructions. No booking, availability, contact, telephone, SMS, email, or form action was activated.

### Schedule hero CTA PageDown at native 200% — PASS

After commit `6da8cc6` was deployed, an active task-owned Chrome 151 session at native 200% Page Zoom used generated Tab ×5, then PageDown on `/schedule`. At 756×406 CSS px, DPR 2, and `visualViewport.scale=1`, the focused CTA remained visible at y=7.75–57.75 after `scrollY` moved from 53.5 to 326. It retained a solid 3px dark outline and a 5px paper-colored shadow ring. No sticky action bar overlapped it; the page had no horizontal overflow. Both public aliases returned HTTP 200 with the new declaration. See [schedule-focus-recheck.md](schedule-focus-recheck.md) and [production screenshot](schedule-focus-after-pagedown-production-200.png). No link or form was activated.

## Production date focus and breakpoint recheck — 2026-10-30

**Result: PASS.** In a foreground-visible Browser Use 0.1.13 session with HeadlessChrome 151.0.7922.137, generated Tab ×12 at a 767 × 900 CSS viewport focused the selected mobile date (`2026-10-31`). After 2.5 seconds for scrolling to settle, the full control and its 3px green focus outline were visible at y=425.7–474.0; `scrollY=2435`.

The same date stayed selected and visibly focused across exact CSS widths 767 → 768 → 769 → 767. Native `MediaQueryList.change` events fired at 768 (`matches=false`) and 767 (`matches=true`); the corresponding desktop and mobile date controls remained in view. At 767, PageDown advanced to November 30 and PageUp returned to October 30 while focus remained visible. No horizontal overflow occurred. No link, form, or external action was activated.

Evidence: [production trace](schedule-tab-focus-visible-production.json) and [production screenshot](schedule-tab-focus-visible-production.png). The earlier offscreen sample came from a hidden tab; after activating the task-owned tab, normal browser scrolling brought the focused date into view.
