# WS-29 Phase 2 local report — mobile shell actions

## Scope and result

Implemented the compact phone header, direct mobile menu rows, and a paired **Text Sandy / Reserve Free Intro** action bar on the five approved funnel routes: `/`, `/visit`, `/free-bjj-intro-tannersville-ny`, `/options-pricing`, and `/programs`. The existing `.ss-mobile-actionbar` is reused. Kids, Teens, and Adults class pages retain their existing action bar behavior. No booking destination or editorial content changed.

Source changes are limited to `src/partials/nav-include.html`, `src/_includes/components/footer.njk`, `src/partials/footer-include.html`, and `src/assets/css/mobile-foundation.css`. `docs/ws29/capture-phase2-shell.mjs` gained a 767/768px breakpoint capture mode. This report and local captures are handoff evidence. The build regenerated `dist/` and `src/assets/data/asset-hash-manifest.json` in this isolated worktree; these generated changes are outside the Phase 2 source handoff.

## Browser evidence

- `docs/ws29/runs/phase2-20261023-shell-final/summary.json`: 24 route/width captures, zero failures. The six routes include the five funnel routes plus Kids as a non-funnel guard at 360, 390, 430, and 1280px. Mobile checks cover menu rows, current-page state, link targets, 44px controls, bar visibility, footer and form clearance, and overflow.
- The Home and Kids 360px open-menu captures show a visible pale green current row with a green inset rule. Kids also highlights its Classes group. Both were visually inspected after the final CSS change.
- `docs/ws29/runs/phase2-20261023-breakpoint-final/summary.json`: 2 captures, zero failures. At 767px, phone header text and both action links are visible. At 768px, the phone text and paired action bar are hidden. The existing collapsible menu button remains visible at 768px under the site's wider navigation breakpoint.
- `docs/ws29/runs/phase2-20261023-matrix-final/summary.json`: 56 captures across 14 routes and 360, 390, 430, and 1280px. All returned HTTP 200; no captured route exceeded its viewport width and no browser console errors were recorded.
- `docs/ws29/runs/phase2-20261023-pricing-current-final/summary.json`: focused 360px pricing menu capture after correcting current-page matching. Only Pricing has `aria-current="page"`; the `#visitor-training` section link and its group have no current-page styling. Screenshot inspected; zero capture failures.

## Ordered local gates

1. `npm run build` — passed after the final menu CSS change and again after the pricing current-page fix.
2. `npm run qa:volatile-facts` — passed; 572 files checked.
3. `npm run test:ads` — passed; 35 tests. The expected existing-output error line belongs to a negative test case.
4. `npm run validate` — passed.
5. `npm run qa:schedule` — passed.

The Phase 2 result remains local. Parent review and integration, production verification, and an owner phone check are separate gates. Rollback is to revert the four scoped source files and rebuild the site.
