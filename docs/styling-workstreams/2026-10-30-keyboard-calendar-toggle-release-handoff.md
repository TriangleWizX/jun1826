# Keyboard release handoff: Schedule date details

## Change

The mobile Schedule date selector now separates selected state from details expansion. The selected day remains clear while its details can expand or collapse through the native date button. Enter and Space retain native button activation; pointer activation uses the same toggle. The Calendar script reference uses a fresh cache version.

## Focused local verification

- Built the current source with Eleventy into `/tmp/keyboard-schedule-build`, leaving the shared dirty `dist/` tree untouched.
- Confirmed the built Calendar asset matched `src/assets/js/schedule-month-calendar.js` before the final keyboard-event clarification; copied the final source into the isolated build for the final interaction run.
- Used headless Google Chrome through Playwright against a temporary local server. Off-origin requests were blocked; no booking, SMS, contact, or form action was activated.
- Passed: Enter expands; Space collapses, then expands; click collapses. `aria-expanded` and the associated details panel's hidden state matched each action.
- Passed: focus stayed on the same date through CSS widths 767 → 768 → 769 → 767.
- `node --check` passed for source and generated Calendar JS; `git diff --check` passed for the source change.
- SHA-256 for source and generated Calendar JS: `86fbf944fb9d451a61bff2314a74ca11b75d25b795063be8277665810306ddf5`.

## Scoped release handling

The shared Schedule source and generated route have unrelated dirty edits. Only the Calendar script cache-reference line is staged in each HTML file; the other edits remain unstaged. The route's staged Git blob is based on `HEAD` plus that single cache-version line, so its commit does not include unrelated page changes. Before deployment, the release helper must be dry-run with exact paths. To deploy the committed route blob safely, temporarily place that committed blob at the generated path, deploy only the committed Schedule route and Calendar JS, then restore the original dirty generated file byte-for-byte. Verify restoration after the upload.

## Open acceptance work

The production keyboard SOP report records shared navigation, menu behavior, Schedule date navigation at 767/768/769, form focus, footer actions, and 200% zoom/sticky clearance as passed. The distinct sticky-action check that presses PageDown while a lower-page control is focused has no explicit pass evidence in that report; keep it open until that exact check is recorded. Physical keyboard hardware and screen-reader speech are outside that SOP run. Lighthouse/PageSpeed remains owner-run and was not performed.

## Production compatibility correction

The first live browser check found that the previously committed generated Schedule route did not include `data-calendar-mobile-days` or link `schedule-month-calendar.css`, even though both are present in the source template. The new JS loaded but threw when it tried to render the missing mobile container. The local source build and interaction test passed because they included both dependencies.

The follow-up release adds only the source-backed mobile container and stylesheet link to the stale generated route. The production calendar stylesheet was independently read and returned HTTP 200 (11,369 bytes); it includes the mobile day-card, button, and hidden-details rules. The release must be rechecked in production for no page errors and Enter/Space state behavior before calling this fix live-verified.

## Final production verification

- Calendar fix commit: `d689e37`; exact deploy payload: `assets/js/schedule-month-calendar.js` and `schedule/index.html`.
- Route compatibility commit: `b359bf9`; exact deploy payload: `schedule/index.html` only.
- Both deploys temporarily substituted the committed route blob, then restored the unrelated dirty generated route byte-for-byte (SHA-256 `5bf1b9e47627b22f01efb14262f7865de289ab908f1876ef363f7e89e0dcbbb2`).
- Production browser verification after the compatibility correction passed: `/schedule/` HTTP 200; cache-busted Calendar JS and stylesheet each HTTP 200; no page errors; Enter expanded, Space collapsed and re-expanded; focus stayed on the same date through 767/768/769/767.
- The separate PageDown sticky-action step passed on production Free Intro at 390×844 CSS px. Keyboard Tab navigation focused a form input near the bottom (Tab stop 18); PageDown kept focus visible, moved the input from y=721.98–765.98 to y=205.98–249.98, and the sticky action did not overlap it. No form was submitted.
- The `npm run qa:schedule` audit passed. `npm run qa:schedule-booking` could not launch its bundled Chrome and failed with `SIGTRAP`; the focused isolated and production Playwright checks passed independently.

The written owner SOP requires a physical keyboard. This session used browser-generated keyboard events, so the physical HID run remains for the owner. No Lighthouse/PageSpeed check was run.
