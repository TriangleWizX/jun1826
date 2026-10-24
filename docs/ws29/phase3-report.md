# WS-29 Phase 3 & Phase 4 Report — Page Families & Viewport Gate

## Scope and Result

Completed all page-family passes and implemented the Phase 4 automated viewport gate:

1. **/schedule** (committed in `6416935a`):
   - At phone viewports (< 768px), the 7-column month grid is replaced by a single-column, tap-friendly day-card list (`.ss-month-mobile-days`).
   - Added a compact "Next class" summary card at the top pointing to the next future slot with a 44px booking CTA.
   - All month navigation arrows, "This month", and special-date jump buttons meet >=44px touch targets.
   - Preserved the desktop 7-column table at >=768px without layout regressions.

2. **/options-pricing**:
   - Preserved all deep-link anchors (171 files reference `#start`, `#timeline-wins`, `#accepted-payments`, `#flexible`, `#continue`, `#annual-track`, etc.).
   - Verified the WS-20 sequential module flow and collapsible payment details block behavior.
   - Hero grid and actions fit cleanly inside the 360px viewport with zero horizontal overflow.

3. **Home (`/`)**:
   - Reflowed hero action buttons (`.ss-home-conversion__actions`) to full-width stacked column on mobile (< 768px).
   - Reorganized above-the-fold stats rail (`.ss-hero-stats`) into a balanced 2-column grid to prevent awkward line breaks on narrow devices.
   - Maintained fluid headline scale and verified no overflow or text clipping.

4. **/free-bjj-intro-tannersville-ny + /visit**:
   - All form inputs, selects, and textareas compute to full width (`inline-size: 100%`) with font-size >= 16px to prevent iOS auto-zoom.
   - Action buttons and SMS links (`a.btn[href^="sms:"]`, hero CTA buttons) reflow to full width (`inline-size: 100%`) on mobile.
   - Submit buttons and fallback actions stack cleanly with >=44px tap targets.

5. **Blog + Glossary**:
   - Enforced readable content measure with contained reading shell on `.page-blog`.
   - Guaranteed media containment (`max-inline-size: 100%` on images, videos, iframes).
   - Adjusted glossary action buttons (`#copy-term-link`, `#copy-state-link`) to satisfy the 44px minimum tap target floor.

6. **Landing Pages (`/alley-bootcamp`, `/winter-armor-2027`)**:
   - Verified against the mobile foundation at 360px.
   - Both pages report zero horizontal overflow and zero sub-14px typography defects.

7. **Phase 4 Viewport Gate (`scripts/qa-viewports.mjs`)**:
   - Created headless Chromium audit script rendering all 14 Phase 0 routes across 360px, 390px, and 430px viewports.
   - Asserts: zero horizontal overflow (`scrollWidth <= innerWidth`), zero text under 14px, zero body text under 16px, primary actions >= 44px, and zoom-enabled viewport meta.
   - Produces machine-readable evidence (`docs/ws29/runs/qa-viewports/summary.json`) and screenshot sets.

## Browser Evidence

- `docs/ws29/runs/qa-viewports/summary.json`: 42 samples across 14 routes and 3 mobile widths.
- Result: **42 of 42 passed (100%)**.
- Horizontal overflow: 0 across all routes.
- Sub-14px text runs: 0 across all routes.
- Body text sub-16px runs: 0 across all routes.
- Primary tap target defects: 0 across all routes.
- Viewport zoom: preserved across all routes (`user-scalable=no` banned).

## Ordered Local Gates

1. `npm run qa:volatile-facts` — PASSED (572 files checked, 0 banned strings).
2. `npm run test:ads` — PASSED (35 tests, 0 failures).
3. `npm run validate` — PASSED (15/15 tests in 4 suites, Cal migration QA, evidence funnel/page records).
4. `npm run qa:schedule` — PASSED (No banned schedule strings found).
5. `node scripts/qa-viewports.mjs` — PASSED (42/42 passing viewport records).
