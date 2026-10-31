# Homepage performance findings

## Goal and boundaries

Resolve only the findings in the owner supplied homepage report. Preserve the current homepage copy, responsive behavior, tracking, consent, booking actions, and keyboard focus behavior. Do not run Lighthouse or PageSpeed; the owner will run those checks. Do not claim measured performance improvement without a new owner-approved measurement.

## Persona and expert framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, v4.0.0, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`, SHA-256 `7e9919c2325eb5aba5c645f41b21c977a077a563161de22cea6caf8583ada092`. Previously read in full; selected for multi-stream coordination, risk review, and independent acceptance.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; source `assets/indranet-prompt-exporter/exports/index.json`, SHA-256 `ac1d6284b8e841d3417dfc5c6e7034625cb0d54bc8c54f6c3552c08e1d7152ad`. Previously read in full; applied to evidence review, bounded work, and completion criteria.
- **Code instruction:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`; same catalog source, SHA-256 `99075cfe1fba1325006241a460605c847c9c35c0be15da863951c11ec26a7ccf`. Previously read in full; implementation and verification follow the applicable code-review and error-handling methods.
- **Worker choices:** CSS request-graph analyst and browser-render-delay analyst are disclosed ordinary-specialist fallbacks because no complete source-backed persona matched those audits. The forced-reflow work uses Debugger-Analyzer — Orko the Debugulator, v1.0.0, UUID `d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`, source `assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/versions/v1.0.0/prompt.json`, SHA-256 `7cc6452750b3ab2fac09a586d6a00133a8ede8465da7dec1c38c1c981d2d833e`; previously read in full, fit to tracing the reported synchronous layout reads. No worker instruction asset is claimed beyond the reviewed CODE instruction.
- **Documentation:** codegraph transport was closed, so definitions were traced using targeted source reads. Context7 resolved PurgeCSS to `/fullhuman/purgecss`; its safelist documentation supports preserving runtime classes when adding a stylesheet to the existing purge input.

## Workstream contracts

| DoD | Reviewer | Read scope | Write scope | Acceptance evidence |
| --- | --- | --- | --- | --- |
| HOME-PERF-CSS | CSS request-graph analyst (ordinary specialist fallback) | Homepage stylesheet links, `tools/build-home-styles.mjs`, input cascade, runtime safelist and generated route | Read-only review | Confirm whether `mobile-foundation.css` can be included in existing homepage inline delivery without changing cascade, other routes, runtime selectors, or output ownership. |
| HOME-PERF-REFLOW | Orko Debugulator (`d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`) | `footer.njk`, action-bar CSS, relevant observer and fallback paths | Read-only review | Trace each report location; identify read-after-write layout work and propose a change that preserves overlap, focus, footer, form, and resize behavior. |
| HOME-PERF-LCP | Browser-render-delay analyst (ordinary specialist fallback) | Initial HTML, subhead CSS/visibility, script loading and DOM evidence | Read-only review | Determine whether source evidence justifies a render-delay or DOM change; otherwise mark the finding not actionable from available evidence. |

## Report findings and initial source mapping

- One render-blocking request: `mobile-foundation.114422.css`, 3.2 KiB, reported duration 150 ms and estimated savings 300 ms. The live CSS matches clean `HEAD:src/assets/css/mobile-foundation.css` (4,430 bytes, SHA-256 `4414af7111252cd81e95a48661a77641b5dc9c8ec8784beb6c858bc60ce76b6e`). Existing `tools/build-home-styles.mjs` inlines six stylesheet inputs and leaves this seventh link external.
- Forced reflow is attributed to the inline footer action-bar observer. Source mapping from the reported live lines: `src/_includes/components/footer.njk`, `pageActionOverlapsBar()` (`offsetHeight`, `getBoundingClientRect()`), and `observeFooter()` (action-bar geometry). `.ss-mobile-actionbar.is-observed` changes opacity, transform, and visibility in `src/assets/css/site-shell.css`.
- LCP is the initial `.ss-home-conversion__subhead`; report says 2,340 ms render delay and 90 ms TTFB. The paragraph is present in `src/partials/home-conversion-shell.html`. No copy, DOM, or visibility change is approved absent a concrete source cause.
- DOM count 652 and one 55 ms deferred analytics task are observations only; neither supports a source change on its own. No preconnect candidate was reported.

## Release gates

Keep all changes isolated from the dirty main generated tree. Verify source-to-output mapping in a clean checkout; build and run focused browser checks only, with external requests blocked for local preview. Review responsive and desktop layout, CTA visibility, link destinations, and keyboard focus behavior. Never run Lighthouse/PageSpeed. Commit only reviewed source files, dry-run deployment and deploy only the exact approved payload, verify live HTTP/content and browser behavior separately, then close owned temporary workspaces and run the workspace audit. If a report item cannot be fixed safely, record why and leave it explicit for the owner rather than claiming it is resolved.

## Local candidate results

- **Render-blocking CSS:** added the fingerprinted mobile-foundation stylesheet as the seventh input to the existing homepage-only delivery builder. The live style’s six-character fingerprint is accepted. The existing order, import expansion, runtime safelist, PurgeCSS, and inline delivery remain in use. A clean baseline build produced 176,186 input bytes and 85,610 output CSS bytes; the candidate produced 180,617 and 88,378. The candidate homepage has no external stylesheet links and retains the mobile foundation and homepage selectors in `#home-delivery-inline`. It no longer requests `mobile-foundation.114422.css` separately.
- **Generated output scope:** baseline and candidate builds each emitted 2,212 files. Their only differences are `dist/index.html`, removal of the unreferenced baseline `home-delivery.01715bfd0d92.css`, and creation of the unreferenced candidate `home-delivery.87a5d7bd23e3.css`. All other output files, including Schedule and the shared footer fragment, are byte-identical. Therefore the release payload is only `index.html`; the CSS builder’s sidecar file is not linked by the page.
- **Local byte comparison:** baseline HTML is 160,887 bytes and candidate HTML is 163,746 bytes. Gzip of the baseline HTML plus its external 4,430-byte mobile stylesheet is 34,618 bytes; gzip of the candidate HTML is 33,967 bytes. This local gzip comparison is not a live transfer or Core Web Vitals measurement.
- **Forced reflow:** delayed the homepage-only `is-observed` class until after the initial overlap and visibility geometry reads. Other routes render the original script byte-for-byte. The homepage’s existing CSS hides the shared action bar, and the local proof preserved that state. No performance score or reflow reduction is claimed without a new measurement.
- **Non-actionable findings:** the LCP paragraph is in the initial HTML and has no reveal, visibility gate, animation, or script-populated content. The 652-node count does not identify a safe reduction. The 55 ms analytics task is already deferred, and the report names no useful preconnect origin. No copy, DOM, analytics, or preconnect change is justified.
- **Build and browser proof:** a clean full build completed successfully. Isolated Chromium loaded the homepage at 390 × 844 and 1440 × 1000 with HTTP 200, no horizontal overflow, no page errors, and no off-origin requests. The main CTA’s top is 329.9 px on mobile and 385.2 px on desktop. All page styles are inline in the candidate. The shared Schedule action-bar script also loaded and ran with HTTP 200, no overflow, and no page errors. No keyboard behavior checks, Lighthouse, or PageSpeed runs were performed.

## Status

Candidate changes are ready for narrow commit and deployment. Production verification and temporary-workspace closeout remain pending. Lighthouse/PageSpeed measurement remains owner-run; the report’s estimated 300 ms savings and LCP/reflow observations are not claimed as resolved measurements.
