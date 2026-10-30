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
| Schedule date keyboard controls at 767/768/769 | Pass for recorded key actions; breakpoint-width fidelity needs clarification | `schedule-breakpoints.json`. Arrow keys, Home/End, PageUp/PageDown, visible focus, selection, and breakpoint focus transfer were observed. At the requested 769px setting, one recorded `innerWidth` was 770 due browser sizing/rounding. The owner should decide whether to rerun with an exact `innerWidth === 769` before treating that boundary as exact. |
| Schedule Enter/Space detail toggle | Pass for the observed mobile date | `schedule-breakpoints.json` plus this session’s correction: Space was sent as the literal `' '` key and toggled details. Schedule’s main landmark and primary action labels were corrected in the interpretation above. |
| Sticky action and footer clearance at 100%/200% | No visible action-bar overlap observed; PageDown focus-visibility criterion remains unresolved | `sticky-boundary-100.json`, `sticky-boundary-200-native.json`, `sticky-focus-200-native.json`. At settled footer states the action bars were hidden and no focused footer control overlapped them. After PageDown on several routes, the previously focused element’s bounds moved partly or wholly outside the viewport. No visible sticky bar covered it, but an offscreen focus ring cannot remain visible. The owner SOP explicitly requires the focus indicator to stay visible after PageDown, so this item is **not a pass**. No code change was made because forcing focus back into view could defeat ordinary PageDown scrolling and the intended interaction is not established. |
| Free Intro form at native 200% zoom | Pass, stopped before submission | `free-intro-form-200-native.json`. Five labelled fields and the submit control received visible focus; there was no sticky overlap. No form was submitted. The form’s `allLabeled` summary flag is false because hidden/non-user fields were included; all five user-facing fields had labels. |
| 200% reflow | Pass on Home, Schedule, Free Intro, and Visit | `sticky-boundary-200-native.json`. No horizontal overflow was recorded; the CSS viewport narrowed under actual Chrome page zoom. |

## Scope and limits

No booking, availability, contact, tel, sms, mailto, or form submission was triggered. Lighthouse/PageSpeed, site-wide contrast, screen-reader speech, and physical-device checks remain excluded per the owner’s instructions. This report distinguishes route coverage from shared-component checks and does not establish screen-reader conformance.

## Remaining acceptance work

1. Resolve the PageDown criterion with the site owner: retain the current browser scrolling behavior and amend the expected observation, or identify a specific interaction that keeps focus visible without trapping scrolling.
2. If exact breakpoint width is required, repeat the 769px check and capture the actual CSS `innerWidth` and matching media-query state.
3. Keep the goal open until the unresolved acceptance decision and any resulting verification are complete.
