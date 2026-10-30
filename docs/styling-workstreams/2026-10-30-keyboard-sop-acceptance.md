# Keyboard acceptance SOP — 2026-10-30

## Scope and outcome

Completed the owner keyboard acceptance SOP against production before the focused fix, then repeated the failing Free Intro sticky-focus case against a fresh local build containing the fix. The production baseline passed the route, navigation, Schedule, form-focus, and zoom checks recorded below, except for the Free Intro focus overlap described in the finding. The final local recheck passed that case.

The fix applies 88 CSS pixels of scroll padding to the viewport only when the Free Intro page is active at mobile CSS widths. It keeps keyboard-focused controls out of the mobile sticky action area.

## Defect and correction

- At native 200% Chrome zoom, the focused Free Intro `Text Sandy` link partly overlapped the mobile sticky action bar.
- A `scroll-margin-block-end` rule on the focused element did not reliably move a partially visible link clear of the fixed bar.
- The final source rule uses `html:has(body.page-book-intro) { scroll-padding-block-end: calc(var(--space-2xl) + var(--space-sm)); }` at `max-width: 767.98px`.
- A temporary browser trial showed root scroll padding moves the focused link above the bar. The same rule was included in the isolated build and passed the keyboard recheck.

## Production SOP coverage before the fix

| SOP area | Result | Evidence / limits |
| --- | --- | --- |
| Shared navigation across the nine route cohorts | Pass | First Tab exposed the skip link; Enter moved focus to main; visible focus, traversal order, footer links, and wrap were checked. |
| Mobile menu | Pass | Enter/Space, expanded state, focus into links, Escape, and focus return checked. |
| Desktop Classes menu | Pass | Keyboard opening exposed all four class links; Escape returned focus to Classes. |
| Schedule at 767, 768, and 769 CSS px | Pass | Arrow keys, Home/End, PageUp/PageDown, Enter/Space, and selected-date focus were checked. Focus stayed on the corresponding date during 767↔768↔769 transitions. At 769, the browser reported `screen.width` 769; `innerWidth` rounded to 770. |
| Free Intro form | Pass | Labels, fields, choices, and submit control received visible focus. No form was submitted. |
| 200% zoom on Home, Schedule, Free Intro, and Visit | Partial | Native Chrome zoom narrowed the CSS viewport; no horizontal overflow was found and sticky actions cleared the tested footer links. The focused Free Intro link overlapped the sticky action, which failed acceptance and was fixed below. |
| Footer actions | Pass | Internal link Enter behavior checked. External contact and booking actions were not activated. |

The production browser was Chrome 151.0.7922.137. The production response was HTTP 200, dated Fri, 30 Oct 2026 04:28:33 GMT; it exposed no release identifier. Evidence screenshots from that run are under `evidence/2026-10-30/keyboard-sop/`.

## Final local recheck

- Environment: isolated current-HEAD source build served from loopback; route `/free-bjj-intro-tannersville-ny/`.
- Browser: Chrome 151.0.7922.137, headed, isolated profile; off-origin DNS blocked.
- Native zoom: 200%; CSS viewport `452 × 351`, DPR `2.5`, `visualViewport.scale` `1`.
- Input: OS-level X11 XTest key events sent to the task-owned Chrome window. This is not a physical HID keyboard.
- Keyboard sequence: Ctrl+Home, Tab to “Book your free visit”, Tab to “Text Sandy”. Neither link was activated.
- Final focused link: `:focus-visible` true; viewport scroll padding `88px`; link bounds `y=214.36…262.64`; sticky bar top `y=285.73`; no overlap; center point remained top-painted by the focused link.
- Screenshot: `evidence/2026-10-30/keyboard-sop/free-intro-200-focus-fixed.png`.
- A clean baseline build from the same `HEAD` without the fix produced identical route HTML outside the inline stylesheet. The candidate delivery CSS equals that baseline stylesheet plus only the scoped scroll-padding rule (baseline SHA-256 `92e25ef1f169acc4767e23e340cf99b621972b52afbfa921886f9481680b48ad`; candidate SHA-256 `f79608e60361a9ae3e611d6bcb5fe71b236d8d20d17f993a4c506468978c7548`).

## Boundaries

No booking, SMS, email, availability, or form action was activated. The test does not cover a physical keyboard, screen-reader speech, site-wide contrast compliance, or Lighthouse/PageSpeed. The local recheck proves the rebuilt route behavior; production recheck remains pending the scoped release.

## Release record

Pending: commit, exact Free Intro route deployment, and live browser recheck. Record the commit ID, exact deployed paths, HTTP/content evidence, and final browser result here before closing the release.
