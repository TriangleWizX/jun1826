# WS-29 Phase 3a local report — Schedule on phones

## Scope and result

Implemented the phone-adaptive `/schedule` page:
- At phone widths (< 768px), the cramped seven-column month table and duplicate selected-day panel are hidden.
- Added a compact "Next class" summary card derived from canonical schedule data, showing the next upcoming class date, time, title, and booking link without horizontal scrolling.
- Rendered a phone-friendly single-column month day-card list (`.ss-month-mobile-days`) using the existing schedule and class data. Each date card provides a clear, >=44px toggle control with legible text (>=16px class text, >=14px metadata).
- Retained full keyboard navigation, month navigation (Previous, Next, This month), jump dates, and class booking links.
- At desktop widths (>= 768px), the desktop month grid and selected-day panel remain active and visually unchanged from the Phase 0 baseline.
- Scoped source changes: `src/schedule.html`, `src/assets/js/schedule-month-calendar.js`, and `src/assets/css/pages/schedule-month-calendar.css`.

Generated build outputs (`dist/` and `src/assets/data/asset-hash-manifest.json`) are preserved locally for browser validation but strictly excluded from source staging and commits.

## Browser evidence

- `docs/ws29/runs/phase3-schedule-20261023-final/summary.json`: captures across 360, 390, 430, 640, 767, 768, and 1280px viewports. Zero failures, zero errors.
- Phone widths (360, 390, 430, 640, 767px):
  - `scrollWidth === width` across all samples; zero horizontal overflow.
  - "Next class" card renders cleanly above the day cards.
  - Controls satisfy tap target floors (month nav controls >= 44px, date buttons >= 48px min-height, booking links >= 44px min-height).
  - Type scale complies with readability floors: class titles and times >= 16px, secondary labels >= 14px.
  - Interactive verification confirms month switching (e.g. October -> November -> October), date selection, and keyboard arrow navigation.
- Desktop widths (768, 1280px):
  - Table and selected day panel are visible; mobile day cards and next class card are hidden (`display: none`).
  - Layout and interactions match desktop baseline.

## Ordered local gates

1. `npm run qa:volatile-facts` — passed (572 files checked).
2. `npm run test:ads` — passed (35 tests).
3. `npm run validate` — passed (all 15 tests in 4 suites, Cal migration QA, evidence funnel/page records QA).
4. `npm run qa:schedule` — passed.
