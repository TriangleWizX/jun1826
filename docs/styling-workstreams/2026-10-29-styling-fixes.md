# Styling fixes: qualified and quantified follow-up

This document is the execution record for the remaining delivery wave. It turns confirmed source findings into small fixes, records the measurable scope, and leaves owner-run checks explicit.

## Completed fixes

### F-01 — Reduced motion for legacy animated CTAs

Qualification: confirmed. `src/assets/css/styles.css` contained three animation paths (`.sticky-cta`, `.btn-animated`, and the two scoped CTA selectors) with no reduced-motion rule. These selectors serve the legacy style family. The fix adds one `prefers-reduced-motion: reduce` block covering all four selectors and regenerates `styles.min.css`.

Measure: 4 animated selector paths now have `animation: none` under reduced motion. Source and minified output both contain the rule. This is a CSS-only change with no route or copy change.

### F-02 — Reduced motion for Everyday Jiu-Jitsu lesson reveal

Qualification: confirmed. `.acq-lesson` used `fadeIn 0.3s ease` and had no reduced-motion override. The fix adds one route-scoped media query setting `animation: none`.

Measure: 1 animated route selector is covered. Route ownership and generated-asset mapping were reconciled in the focused release described below.

### F-03 — Reduced motion for Hospitality partner stamp

Qualification: confirmed. `.stamp-gold-logo` used `stamp-rotate 35s linear infinite` and had no reduced-motion override. The fix adds one route-scoped media query covering the stamp and descendants.

Measure: 1 continuous animation is disabled under reduced motion. Pointer events remain unchanged because the stamp is decorative.

### Release closeout

F-01, F-02, and F-03 were released together from focused commit `e8659414e38b542abd57ee58aeb2f915df0748ea`. The exact deployed payload was:

- `everyday-jiu-jitsu-training/index.html`
- `assets/css/pages/everyday-jiu-jitsu.e07e21.css`
- `partners-hospitality-hunter-windham.html`
- `assets/css/pages/partners-hospitality-hunter-windham.c7e93c.css`

Deployment created and verified a fresh rollback archive, rotated one older archive, and uploaded all four files with expected remote byte counts. Both routes and both fingerprinted stylesheets were then checked over HTTP. This is deployment/HTTP evidence only, not browser, Lighthouse, PageSpeed, physical-device, or owner acceptance.

## Delivery classification

F-01, F-02, and F-03 are now mapped in `scripts/deploy-release.py`: a source CSS or page change selects the generated page and extracts exactly one active fingerprinted stylesheet from that page. The broad working tree still contains many unrelated source and generated changes; no broad staging is safe.

## Verification performed

- `node tools/minify-css.mjs` completed successfully after the source changes.
- An isolated `npm run build` completed from `/tmp/styling-fixes-build-20261029/project`; the dirty main `dist/` was not used. The build emitted 507 pages and the expected CSS assets. Source and generated output inspection confirmed the reduced-motion media rules are present in the isolated output.
- The mapper now covers both output shapes: `everyday-jiu-jitsu-training/index.html` and root `partners-hospitality-hunter-windham.html`. It fails closed when either page is missing, when the page has zero or multiple matching fingerprints, or when the referenced fingerprinted CSS file is absent.
- Source inspection confirms each new media query and selector.
- `npm run qa:workspace:preflight` remains the lifecycle gate; temporary build/profile paths from the preceding form-validation work were removed.
- No Lighthouse, PageSpeed, keyboard, site-wide contrast, physical-device, or spoken screen-reader check was run. Those remain owner or manual acceptance work.

## Next execution order

1. For any subsequent cohort, build an isolated clean output and verify the affected route and active fingerprint.
2. Run focused viewport and runtime checks against that isolated output.
3. Commit only reviewed source, generated, and documentation paths; deploy only the exact generated payload after dry-run and rollback evidence.

The styling goal remains active until those release gates and owner acceptance items are complete.

## Friday Night Fanatics form-label delivery — 2026-10-29

### Qualification and implementation

`FRIDAY-FORM-LABEL-TYPE-FLOOR-1` raised `.ff-form-label` from `0.85rem` (13.6px at the default root size) to `0.875rem` (14px). The source stylesheet is linked directly by the route; the production builder fingerprints it as `friday-night-fanatics.<hash>.css`.

### Release mapping correction

The first focused commit, `51b3cb629391300bff9388d390b4582b06c15d17`, uploaded only `friday-night-fanatics.ef93be.css`. A live computed-style check caught that production HTML still referenced the prior `29c51e` fingerprint and labels remained 13.6px. That deployment was incomplete. The corrected commit `b7d021264449cc8d67c6154529342f526b78810b` adds a narrow `changed_outputs()` mapping that selects the Friday Night Fanatics route HTML and exactly one stylesheet fingerprint referenced by that HTML.

The corrected dry run selected exactly:

- `friday-night-fanatics.html`
- `assets/css/pages/friday-night-fanatics.ef93be.css`

The clean isolated `npm run clean && npm run build` passed. Candidate CSS and generated fingerprinted CSS both had SHA-256 `162a5e376612316538348687082280f6d0488adfefe1a0a7869733668bd3ac38`. The corrected upload reported 54,879 bytes for the route and 13,167 bytes for the stylesheet. A fresh rollback archive passed QA before upload.

### Production verification

The live route returned HTTP 200 and now references `friday-night-fanatics.ef93be.css`; the live CSS hash matches the isolated candidate. The isolated headless browser returned HTTP 200 at 390×844 and 1440×1000, with no horizontal overflow, page errors, or failed requests. All 10 form labels computed to 14px at both widths, and each remained associated with its control. Screenshots, rendered HTML, route JSON, and label geometry are in `evidence/2026-10-29/friday-label-live-after-mapping/`.

The first, incomplete browser capture is retained in `evidence/2026-10-29/friday-label-live/` because it identified the stale production stylesheet link. No forms were submitted. No Lighthouse, PageSpeed, keyboard-route, site-wide contrast, or device acceptance checks were run.
