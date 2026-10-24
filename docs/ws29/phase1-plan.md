# WS-29 Phase 1 plan — one mobile foundation

**Status:** approved to start; implementation in progress. Owner approved P0-01–P0-10 after reviewing Phase 0. This plan authorizes Phase 1 only. Follow the original page-family order for Phase 3.

## Persona & Expert Framework

- **Role persona:** none adopted. The Phase 1 contextual selector returned `no_suitable_persona`; the fallback is an ordinary responsive frontend engineer and QA coordinator. The earlier Static Site Generator profile does not fit responsive engineering, and the available coding profile does not identify a responsive UI specialist.
- **Instructions asset:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, ready in selector output. Its available source names task decomposition, modular design, test, functional verification, QA, build validation, documentation, and KISS/SOLID/DRY. No separate exported full-source file or `persona_read.py` is present in this checkout, so full-source adoption is not claimed; apply an ordinary specialist fallback.
- **Frontend skill:** `.agents/skills/design-taste-frontend/SKILL.md`, applied sections 0 (infer the brief and audience), 1 (set the three dials), 2–3 (use the current design system and stack), 6 (accessibility and reduced motion), 11 (audit-first preserve-mode redesign), and 14 (preflight). Design read: phone-first targeted evolution for new students, parents, and returning adults; calm, clear, familiar, and brand-preserving. Dials: variance 3, motion 2, density 4. Bootstrap 5.3.3 plus existing native CSS stays in place; no new package or visual system.
- **Documentation:** Context7 resolved MDN Web Docs (`/mdn/content`). The clamp reference supports bounding fluid type with minimum/preferred/maximum values. The grid and overflow guidance supports zero-minimum tracks, shrinkable items, and media bounded by their containing block. Existing class-specific rules remain the primary source where a local component caused overflow.
- **Discovery:** the repository Codebase Memory MCP and Codegraph transport were unavailable during this phase. The main repository was indexed before the failure; targeted searches and source reads were used for CSS and template literals, with generator sources inspected before selecting the foundation load point.

## Workstream contract

**WS29-P1 — mobile foundation and Phase 0 overflow repairs**

- **Owner:** primary coordinator; independent reviewer uses the isolated Phase 0 worktree and writes only a review report under `/tmp`.
- **Read paths:** Phase 0 evidence, `src/_includes/components/head-metadata.njk`, CSS load/build tools, and source styles for the pricing hero, blog article container, and programs eyebrow.
- **Write paths:** one new `src/assets/css/mobile-foundation.css`, one stylesheet include in `src/_includes/components/head-metadata.njk`, narrow mobile rules in the pricing, blog, and Tannersville source CSS only where rendered evidence proves a local cause, plus `docs/ws29/` evidence. Preserve all pre-existing generated files and assets in the main worktree.
- **Tools:** existing CSS and build tools, fresh isolated output, headless Chromium captures. No new dependencies, copy/data/anchor/URL/metadata edits, minified-file hand edits, or CI wiring.

## Definition of done

1. One mobile foundation loads after route and conditional CSS for every family and remains available after all route-delivery optimization steps. Its file documents the sole new breakpoint spine: 640, 768, 992, and 1100px. New foundation and repair queries use those boundaries only.
2. On phone widths the layer sets consistent container gutters, fluid `clamp()` heading steps, body copy at 16px minimum, secondary text at 14px minimum, text-size adjustment at 100%, bounded media, primary-action targets at least 44px, and form controls at least 16px.
3. Resolve every Phase 0 page-overflow/clipping finding locally: pricing hero and its CTAs, the representative blog article shell, and the programs hero badge. Do not hide page overflow as a substitute. Preserve desktop rules.
4. Captured `maximum-scale`/`user-scalable=no` remains absent. Text, prices, times, form names/order, section IDs, links, structured data, copy, and canonical content are unchanged.
5. Fresh-build and browser evidence covers all 14 Phase 0 routes at 360, 390, 430, and 1280px. Intermediate-width overflow is sampled across every integer width 361–767 and around 640/768/992/1100, with a true desktop context at 1280. Screenshots and a page-by-page report live under `docs/ws29/`.
6. Inspect mobile and desktop captures. No page exceeds its requested mobile viewport, text stays within the size floors, and media remains contained. Compare 1280 captures with Phase 0 and resolve every desktop difference before closing this phase.
7. Verify the fresh build includes the foundation for every route family, run the applicable existing checks in their required order, preserve all unrelated dirty state, and make one scoped Phase 1 commit. Deployment and production/owner-phone proof remain separate gates.

## Execution order

1. Prove the new stylesheet’s final load position through source templates and each CSS delivery builder. Add the foundation and narrowly targeted responsive source rules.
2. Build only in `/tmp/ws29-inventory`, where `node_modules` already links to the installed main-worktree dependencies. Do not run a build that rewrites the main checkout’s dirty `dist/` files or asset manifest.
3. Inspect all targeted mobile and desktop captures, repair evidence-backed regressions, and rerun the same matrix.
4. Run existing local validation gates. Record exact outputs, source invariants, screenshots, and deferred issues in a Phase 1 report.
5. Stage only Phase 1 source and evidence paths, inspect the cached diff, and commit this phase.

## Approval and constraints

P0-01–P0-10 are the approved review priorities. Phase 1 does not perform the separate Phase 2 shell redesign or the Phase 3 schedule/pricing reflow. A defect can be recorded for that later page-family pass while this phase repairs any actual page overflow at its source. Production release, live verification, and owner's phone checks remain required by the original brief.
