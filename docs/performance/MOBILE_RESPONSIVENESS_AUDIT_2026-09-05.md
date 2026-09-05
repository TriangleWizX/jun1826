# Mobile responsiveness and quick response audit

Date: 2026-09-05  
Scope: source and generated site, representative acquisition routes, local Chromium at 320/390/768/1440px, and controlled Lighthouse mobile runs.  
Source revision: `fd9fc0f5c3e91eb6fd72b9001cbfc19355ffb023`.

This is an audit only. No application fix or deployment was made. Existing dirty files `crawl-reports/orphan-reachability.csv`, `reports/image-qa.json`, and `.serena/` were preserved.

Follow-up remediation (2026-09-05): the CSS minifier now preserves the narrowly scoped mobile navigation contract while continuing to omit the legacy shell block. Regenerated `src/assets/css/site-shell.min.css` and `src/assets/data/asset-hash-manifest.json`; `qa:css:minified`, `qa:css:design-contract`, and `qa:nav` pass. A final 390px Chromium render reports `scrollWidth=390`, closed nav `display:none`, `height=0`, `aria-expanded=false`, and the homepage H1 at y≈167. The weekly check-in radio controls were then constrained to 1×1 clipped controls; `npm run build` and `npm run qa:weekly-audit` pass. The Calendly, glossary, image, and font findings below remain open.

## Executive findings

The main mobile blocker is the shared navigation CSS pipeline. `tools/minify-css.mjs` removes everything after the `Canonical Tannersville shell guardrail` marker in `src/assets/css/site-shell.css` (the marker is around line 1727), but the mobile closed/open rules are later in the source (around lines 2625–2664). The delivered `site-shell.min.css` therefore contains no `#ssMainNav` mobile state rules. At 390px, the menu was visible on first paint despite `aria-expanded="false"`; the menu toggle could set `aria-expanded="false"` while the menu remained visible. A browser-only insertion of the missing rules moved the homepage H1 from y=873 to y=167 and removed 706px of first-screen navigation content. This is P0 because it displaces the primary CTA and makes state/visibility disagree.

The weekly check-in has a separate, confirmed overflow defect. Its generated radio inputs are created by `js/weekly-audit.js` and inherit `.checkin-field input`-style width behavior through the page CSS. At requested widths 320/390/768/1440, inputs produced layout widths 465/651/768/1440 and document widths 465/651/1206/1993. A browser-only rule constraining `.checkin-context input` to a 1px clipped control restored 320/390/768 widths. This is P1: it makes phones render at a scaled-out viewport and breaks desktop layout at the 768px breakpoint.

The booking popup is also broken in the local generated page. Selecting the child profile at 320px or 390px creates `.calendly-overlay`, but without Calendly’s widget stylesheet it is `position: static`, below the page at y≈4216, with a zero-height close control. Injecting the missing widget CSS changes it to fixed, full viewport, with a 19px close control, and the control then closes the overlay. The stylesheet is not present in the page’s local stylesheet list. This is P1 for mobile booking completion.

## Controlled mobile performance

The bundled Lighthouse runner completed three sequential samples for each of seven routes using Lighthouse 13.4.1, Chromium 151 user-agent emulation, 390×844, DPR 1, simulated mobile Slow 4G, 4× CPU, and a local built `dist` server with recursive SSI expansion. Raw reports and manifest are in `/tmp/tmb-mobile-audit/controlled/`; they are not production artifacts.

| Route | Median score | Median FCP | Median LCP | Median TBT | Median transferred bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| `/` | 0.88 | 2,256 ms | 3,406 ms | 106 ms | 590,750 |
| `/free-bjj-intro-tannersville-ny` | 0.87 | 2,120 ms | 3,334 ms | 205 ms | 622,118 |
| `/schedule` | 0.90 | 1,974 ms | 2,584 ms | 241 ms | 488,367 |
| `/bjj-classes/kids-tannersville-ny` | 0.78 | 2,255 ms | 5,107 ms | 137 ms | 965,765 |
| `/bjj-classes/teens-tannersville-ny` | 0.93 | 2,104 ms | 2,856 ms | 97 ms | 541,414 |
| `/bjj-classes/adults-tannersville-ny` | 0.89 | 2,256 ms | 2,947 ms | 199 ms | 542,981 |
| `/options-pricing` | 0.94 | 1,958 ms | 2,638 ms | 119 ms | 484,929 |

The largest measured opportunity is the kids hero image: Lighthouse identifies a 433,230-byte 3024px image displayed around 344px wide and estimates 426,603 bytes savings. The same page has 66,687 bytes of render-blocking page CSS and an estimated 1,330ms render-blocking saving. Homepage render-blocking CSS estimates 1,050ms. These are controlled lab estimates, not field CWV.

Homepage Lighthouse also identifies 174KB transferred Google Analytics JavaScript, with about 74KB estimated unused, and about 53KB estimated unused local CSS on the homepage. Main-thread work is dominated by style/layout (about 450–555ms in sampled runs) and script evaluation (about 296–356ms). The page loads both the preloaded fingerprinted Lexend URL and the stylesheet’s unhashed Lexend URL; the files are byte-identical, so the browser requests the font twice in the local run (about 39,850 bytes each).

## Functional and layout evidence

- Nine routes were checked at 320, 390, 768, and 1440px in Chromium. Apart from `/weekly-audit`, no horizontal overflow was observed after the viewport-state correction. Additional checks at 390px for `/blog`, `/nearby-towns`, `/bjj-tannersville-ny-directions`, `/bjj-glossary/guard`, and `/sensei-studio` had matching inner and document widths and no broken images.
- The mobile menu opened and the Programs submenu opened and closed with Escape. With the delivered CSS, closing the menu left `#ssMainNav` visible while `aria-expanded` was false; the browser-only missing CSS corrected this.
- Selecting a booking profile advanced to step 2 and opened the Calendly overlay, but the overlay was unusable without widget CSS. No form was submitted.
- Glossary search entered `guard` with all 141 cards still visible and result count unchanged. `js/glossary-filters.js` sets `card.hidden = !visible`; the active glossary card rules in `src/assets/css/bjj-glossary.css` have no corresponding `[hidden]` display contract. This should be fixed and rechecked; current behavior is a confirmed filter regression, not merely a performance concern.
- Two generated canonical blog routes were missing from the local build inventory: `/blog/bio-ginastica-mobility` and `/blog/onteora-park-summer-activities-catskills`. This is a route/build completeness issue to resolve separately from mobile layout.

## Static gates and live delivery

Passed: `npm run build`, `qa:css:design-contract` (262 routes; largest `/` 19,396 gzip bytes against 20,480), `qa:css:route-bundles`, `qa:css:minified`, and `qa:assets:size`.  
Failed: `qa:lazy-loading` (tournament-grid lazy images omit `decoding="async"`) and `qa:image-contract` (missing `/winter-rank-drop` PNG/WebP references).

Read-only live probes on 2026-09-05 showed production serves gzip HTML and Brotli CSS. `/assets/css/site-shell.min.css` is 5,252 bytes Brotli with a 7-day cache header. The three homepage mobile background URLs return HTTP 200 in production (43,638/27,682/33,196 bytes), while the local build server returned 404 for them; reconcile the local asset/build state before relying on local screenshots for those cards.

## Remediation order

1. Ensure Calendly widget CSS is loaded with the popup path (or provide equivalent local popup CSS); verify open, close, Escape, focus, and mobile viewport containment.
2. Repair glossary `[hidden]` behavior and verify a query reduces the 141-card set; measure input responsiveness after the functional fix.
3. Add responsive image sources/dimensions for the kids hero and avoid duplicate font requests. Keep the current acquisition CTA and schedule behavior intact.
4. Investigate route-specific CSS delivery and defer non-critical analytics only after the layout/state fixes; preserve analytics semantics and validate the booking funnel.

## Evidence boundary

The report proves source-level defects, local rendered behavior, controlled lab metrics, and selected production headers/statuses. It does not prove field Core Web Vitals, device coverage beyond Chromium emulation, production browser behavior after fixes, ranking impact, or a deployed remediation.
