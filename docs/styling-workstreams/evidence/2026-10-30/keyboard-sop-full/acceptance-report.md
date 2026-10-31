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
| Schedule date keyboard controls at 767/768/769 | Exact CSS widths confirmed; focus recovery exercised with a callback harness | `schedule-breakpoints.json` plus the post-deploy follow-up below. Browser Use recorded exact `innerWidth` values 767, 768, and 769; the phone media query matched only at 767. The deployed callback kept the same keyboard-focused date visible across the tested transitions. The isolated headless browser suppressed native media-query and animation-frame events, so the callback was exercised with a synchronous animation-frame stub; natural resize-event timing remains unverified. |
| Schedule Enter/Space detail toggle | Pass for mobile date activation | `schedule-breakpoints.json` plus the post-deploy follow-up below. Space was sent as the literal `' '` key; Enter and Space selected a different date and opened its details. |
| Sticky action and footer clearance at 100%/200% | No visible action-bar overlap observed; PageDown focus-visibility criterion remains unresolved | `sticky-boundary-100.json`, `sticky-boundary-200-native.json`, `sticky-focus-200-native.json`. At settled footer states the action bars were hidden and no focused footer control overlapped them. After PageDown on several routes, the previously focused element’s bounds moved partly or wholly outside the viewport. No visible sticky bar covered it, but an offscreen focus ring cannot remain visible. The owner SOP explicitly requires the focus indicator to stay visible after PageDown, so this item is **not a pass**. No code change was made because forcing focus back into view could defeat ordinary PageDown scrolling and the intended interaction is not established. |
| Free Intro form at native 200% zoom | Pass, stopped before submission | `free-intro-form-200-native.json`. Five labelled fields and the submit control received visible focus; there was no sticky overlap. No form was submitted. The form’s `allLabeled` summary flag is false because hidden/non-user fields were included; all five user-facing fields had labels. |
| 200% reflow | Pass on Home, Schedule, Free Intro, and Visit | `sticky-boundary-200-native.json`. No horizontal overflow was recorded; the CSS viewport narrowed under actual Chrome page zoom. |

## Schedule breakpoint follow-up

Production release `cf362f7` served the canonical `/schedule` route (the trailing-slash URL redirected with HTTP 301; the final route returned HTTP 200) with `schedule-month-calendar.js?v=20261030-focus-visible`. The live asset returned HTTP 200, 15,891 bytes, and SHA-256 `1a1bb3823dfdcb9c793246b854d4673277ec5d8755644f66e77087e7d57c597d`, matching the committed generated asset.

In the isolated Browser Use session, the same date (`2026-10-30`) kept `:focus-visible` and remained inside the viewport at exact CSS widths 767, 768, and 769. It used the mobile date control at 767 and the desktop calendar control at 768 and 769. The focus recovery callback was exercised in both directions through 767 → 768 → 769 → 767 → 768. Because this headless Chrome changed CSS width without dispatching `MediaQueryList.change` and did not advance `requestAnimationFrame`, the harness invoked the captured production callback and ran its two animation-frame callbacks synchronously. This verifies callback behavior and visible geometry, but does not establish native resize-event timing.

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
