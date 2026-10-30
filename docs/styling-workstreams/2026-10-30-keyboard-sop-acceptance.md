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

## Earlier local CSS recheck

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

Prior CSS commit: `f38f1ff4de6f953c5add7f8f5ea0f19892941a5f`. Its generated standalone CSS asset returns HTTP 200 and matches its candidate hash, but the live Free Intro route does not link that asset; its CSS is inline and it loads `mobile-foundation.114422.css`. The current keyboard-handler source change has not yet been committed or deployed.

## Production browser finding and updated local candidate

- Fetched the canonical route with elevated network access: HTTP 200, 144,965-byte HTML body, title `Free First BJJ Visit in Tannersville | Sensei Sandy`.
- The route contains the 88px scroll-padding rule inline. It links `mobile-foundation.114422.css`; it does not link the standalone `free-intro-delivery.f79608e60361.css`. The standalone asset SHA-256 matches the earlier candidate, but that asset is not active for this route.
- On production at a 452 × 351 CSS viewport and DPR 2.5, real Tab traversal reached the hero `Text Sandy` link. Before the handler, bounds were y=343.95…392.23 and the visible sticky CTA began at y=285.33, so the link was obscured. Focus was visible and no link was activated. This is viewport-equivalent sizing, not native browser zoom.
- A production DOM trial of the page-scoped keyboard handler moved the same focused link to y=224.73…273.41, above the sticky CTA at y=285.33. `:focus-visible` stayed true, viewport was 452 × 351 at DPR 2.5, and horizontal overflow was false.
- The handler is now in `src/free-bjj-intro-tannersville-ny/index.html`. A fresh isolated build of the candidate passed the same keyboard sequence and geometry check; screenshot: `evidence/2026-10-30/keyboard-sop/free-intro-local-handler-200-focus.png`.

## Release status update

- Prior CSS commit: `f38f1ff4de6f953c5add7f8f5ea0f19892941a5f`. The keyboard scroll handler is a new, uncommitted source change.
- The isolated candidate dry-run listed exactly `free-bjj-intro-tannersville-ny/index.html` and `assets/css/pages/free-intro-delivery.f79608e60361.css`.
- An earlier default deploy attempt completed backup QA and removed one older verified archive of 1,130,752,653 bytes as part of configured rotation, but returned no upload receipt. The later exact deploy reused the newest verified account-level backup and attempted these two paths: `free-bjj-intro-tannersville-ny/index.html` and `assets/css/pages/free-intro-delivery.f79608e60361.css`. The live CSS HEAD response confirms the asset is served at the expected URL and size, but not the file hash or route HTML upload.
- Live HTTP/content and production browser checks remain unverified. The current execution environment has restricted external network access, so no further live check was made. Do not treat this as deployed until remote bytes and live behavior are confirmed.
- The shared `dist/` tree is dirty and currently lacks the candidate fingerprinted CSS. It was not edited or restored for this release. The candidate remains in `/tmp/keyboard-sop-fix-build-20261030/release-candidate/` for byte comparison when network access returns.


## Remaining live acceptance handoff

1. Commit the route source and reviewed evidence. Dry-run the exact generated payload and deploy only `free-bjj-intro-tannersville-ny/index.html`.
2. Fetch production HTML and confirm the inline handler is present.
3. Repeat Tab traversal on production at 452 × 351 CSS pixels / DPR 2.5. Confirm `Text Sandy` stays fully above the visible sticky CTA, `:focus-visible` remains present, and no link is activated. Save screenshot and measurements.
4. If headed Chrome can launch, repeat with native 200% browser zoom.

The handler is page-scoped and changes scroll position only after keyboard Tab focus. Pointer use is unaffected. Lighthouse/PageSpeed, physical HID, screen-reader speech, site-wide contrast, and live form/booking/contact actions remain outside this SOP.
