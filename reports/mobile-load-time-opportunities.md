# Mobile load time opportunities

## Goal and current evidence

- **Reported mobile load time:** 5.35 seconds, rated “Poor” for `senseisandy.com` (user-provided screenshot/text; date, tested route, device, network profile, tool, and metric definition were not supplied).
- **Target:** main content loads in under 2.5 seconds. Confirm whether this target means Largest Contentful Paint (LCP), another field metric, or a report-specific measure before comparing results.
- **Gap if the numbers are comparable:** at least 2.85 seconds. This is arithmetic from the supplied number, not a measured optimization estimate.
- **Current lab baseline:** missing. No local Lighthouse artifacts or matching dated field report were found in the repository during this review.
- **Diagnosis status:** provisional. Do not call any source observation the cause of 5.35 seconds until a controlled run identifies the LCP element/resource and timing chain.

## Ranked opportunities to investigate

Priority is a starting order for evidence gathering, not a claim about expected seconds saved.

| Rank | Opportunity | Source evidence | Why investigate | Verification / decision |
|---|---|---|---|---|
| P0 | Reproduce the reported measurement and establish a controlled baseline | User-provided 5.35 s report omits test method and conditions. The repository performance workflow requires three matching Lighthouse samples, median reporting, raw JSON, screenshots, route and environment details. | Without a comparable measure, the 2.5 s target and likely bottleneck cannot be evaluated. | Capture the report URL/date/device/network/tool and metric definition. Run the documented production-build baseline at 390×844, three samples per representative route; retain manifest, raw JSON, screenshots, final URLs, and functional checks. Record LCP element/resource and subparts. |
| P1 | Resolve the hero image loading hints and responsive delivery | `src/partials/home-conversion-shell.html` marks the studio image `loading="lazy"` and `fetchpriority="high"` at the same time, requests the fixed `Screenshot_20260810_071208_YouTube-1600.webp`, and does not expose a mobile `srcset`. The local 1600 WebP is 33,340 bytes; the legacy JPEG is 998,738 bytes. | This is a high-visibility candidate that may be the LCP image, but it is lazy-loaded and its position/priority is contradictory. Its actual LCP status must be confirmed in the trace. | Inspect the measured LCP element and request priority/start time. If this image is LCP, test eager/high-priority loading plus appropriately sized responsive `srcset`/`sizes`; compare LCP image load delay/duration and mobile bytes. Preserve image dimensions and visual crop. |
| P2 | Check render-blocking CSS and homepage CSS payload | `src/index.html` declares `global.min.css`, `routes/site-18ac9c2704ce.min.css`, and `pages/home.min.css`; shared metadata also adds font/icon and shell styles. `src/partials/home-conversion-shell.html` contains a large inline style block. Exact generated CSS sizes and blocking impact were not measured. | CSS download/parse and large inline rules can delay first render and LCP. | From the baseline, record CSS bytes, request timing, unused CSS and render-blocking audit details. Check whether homepage needs all delivered global/route rules. Prototype only source-backed removals or critical-style changes; compare LCP/FCP and visual/accessibility checks. |
| P3 | Measure third-party analytics cost and connection setup | `src/_includes/components/head-metadata.njk` includes `/_includes/analytics-head.html`; that file preconnects to Google Tag Manager and loads `gtag.js` asynchronously in the head. | Third-party DNS/TLS/download/CPU work can contend with early loading, though async loading means its presence alone does not prove a render delay. | Inspect request waterfall and main-thread trace under the same mobile profile. Quantify transfer, connection, and CPU cost. If material, evaluate consent-respecting delayed/conditional loading without losing required events; verify booking/CTA analytics behavior. |
| P4 | Audit below-the-fold image and media transfer | Homepage source includes multiple editorial/studio images; the repository uses lazy loading on at least some below-the-fold images. Per-route image transfer and request counts are not yet recorded. | Early requests and large images can compete with the hero for bandwidth, especially on constrained mobile connections. | Use Lighthouse network data or a trace to identify images fetched before/near LCP and total image bytes. Ensure below-fold assets stay lazy and right-sized; check for embeds or background images that bypass native lazy loading. |
| P5 | Review font loading and visible text rendering | Shared metadata preloads Lexend; the conversion shell uses an Instrument Serif display family for its H1. Font request sizes, source files, fallback behavior, and swap timing have not been measured here. | Font discovery or late swaps can affect text paint and perceived stability, but there is no current evidence they drive the reported duration. | Inspect font requests, CSS font-face declarations, LCP subparts, and layout shifts. Keep only necessary preloads; confirm local fallbacks and `font-display` behavior. Preserve legibility and CLS. |

## Measurement and implementation sequence

1. Preserve the supplied 5.35 s as an external reported observation; capture its source details and exact metric before comparing it with LCP.
2. Run the repository `web-performance-evidence` workflow on the current worktree before any performance edits. Its documented routes are `/`, `/free-bjj-intro-tannersville-ny`, `/schedule`, kids, teens, adults, and `/options-pricing`, using a 390×844 viewport and three samples per route.
3. Use the raw report and, if needed, a Chrome trace to identify the actual LCP element/resource, blocking chain, and relevant network/CPU contributors. Update the opportunity ranks from that evidence.
4. Change one validated bottleneck at a time. Keep the baseline immutable and use the same build, server, viewport, throttling, routes, sample count, and tool versions for after measurements.
5. Compare median LCP and supporting metrics (FCP, Speed Index, TBT, CLS, TTFB, transferred bytes, request count, and resource bytes). Confirm the affected page still shows its first-visit CTA promptly and passes mobile/desktop, accessibility, link, and SEO checks.
6. Re-measure the reported field/third-party metric under matching conditions where possible. Keep local lab and external/field results labeled separately.

## Scope and cautions

- No site code or user worktree changes were made as part of this scaffold.
- No performance gain is predicted. The rows above are source-backed investigation candidates, not measured causes or promised savings.
- Do not remove analytics, fonts, styles, or content solely because they appear in source; establish request/paint impact and preserve required functionality.
- Existing project guidance says to keep performance evidence reproducible and retain raw artifacts. The baseline runner writes under `artifacts/performance/before`; confirm that destination is absent/available before running it.

## Source references

- User-supplied report in this task: mobile load time 5.35 s, “Poor,” target under 2.5 s.
- Homepage entry/template: `src/index.html` and `src/_includes/layouts/home.njk`.
- Active homepage conversion partial: `src/partials/home-conversion-shell.html` (included from `src/_includes/partials/home-conversion-shell.html`).
- Shared head: `src/_includes/components/head-metadata.njk` and `src/_includes/analytics-head.html`.
- Measurement process: `.agents/skills/web-performance-evidence/SKILL.md`, `references/methodology.md`, `references/routes.md`, and `references/thresholds.md`.
