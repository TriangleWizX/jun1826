# Mobile load time opportunities

**Scope:** site-wide opportunities for mobile loading on `senseisandy.com`
**Evidence reviewed:** repository source, generated local builds, and saved Lighthouse before/after artifacts dated October 6, 2026
**Status:** evidence-backed investigation list; no production or live network checks were performed for this report.

## Summary

The available Lighthouse comparison shows substantial reductions in transferred bytes and JavaScript, but median LCP remains above 2.5 seconds on every measured route. In all three most recent homepage samples, the LCP is the studio preview image inside the first-visit builder (`#home-first-visit-builder .ss-home-conversion__media img`); its element render delay ranges from 233 to 852 ms. The prior baseline identified `.ss-home-conversion__subhead` instead. The latest seven-route after run has LCP diagnostics and per-route metrics, but it is not a valid comparison with the older before build. Reconcile the homepage diagnostic geometry and timing before choosing image changes, then establish a matching baseline.

The saved lab runs used Chrome 151, Lighthouse 13.4.1, viewport 390×844, simulated mobile throttling (150 ms RTT, 1.6 Mbps, 4× CPU slowdown), three samples per route, and a local static server with caching disabled and no production compression. The latest run is complete across seven routes, but has no valid comparison with the earlier baseline. It represents local lab evidence, not global field performance. The user-provided **5.35 s “Poor”** report lacks a route, date, device, test tool, connection profile, and metric definition, so it cannot be directly compared with these LCP values.

## What current evidence establishes

| Evidence | Result | Interpretation |
|---|---:|---|
| Homepage LCP, current after run | 3,341.8 ms median; range 3,185.2–3,460.5 ms | Above 2.5 s. LCP is the first-visit builder image in all three samples. |
| Homepage LCP, prior comparison | 3,539.7 ms before → 3,341.8 ms after (median) | 197.9 ms faster in that saved comparison, but its after build differs from the current source snapshot. |
| Homepage FCP, prior comparison | 2,704.9 ms → 1,841.8 ms | First paint improved in that comparison; FCP is not LCP and does not establish the main-content target. |
| Homepage transferred bytes, prior comparison | 971,148 → 468,582 | 502,566 bytes lower in that local report. |
| Homepage CSS bytes, prior comparison | 160,112 → 68,289 | Lower reported transfer size; current-source LCP is an image and remains above 2.5 s. |
| Homepage JavaScript bytes, prior comparison | 246,381 → 67,779 | Lower in that local comparison. Third-party production behavior still needs separate evidence. |
| Schedule LCP, prior comparison | 2,793.0 ms → 2,930.0 ms | 137.0 ms regression in the earlier saved comparison. |
| Kids page LCP, prior comparison | 3,420.1 ms → 3,588.9 ms | 168.8 ms regression in the earlier saved comparison. |
| Homepage CLS, prior comparison | 0.0693 → 0.0005 median | Improvement in the earlier report, but after samples ranged up to 0.2802; inspect the outlier and its cause. |
| Local TTFB, prior comparison | 2–7 ms across routes in the reports | Not representative of production hosting: local server has no CDN, compression, or real origin path. |

The current completed run is `/tmp/ssbjj-mobile-perf-evidence/after-run3`; its manifest records seven routes and three samples, and `/tmp/ssbjj-mobile-perf-evidence/comparison-run3/metrics.json` contains per-route medians for that after run. The older baseline is `/tmp/ssbjj-mobile-perf-evidence/before-valid`; it was captured from a different built output hash than after-run3. Do not treat it as a valid current comparison.

## Ranked opportunities

Rank expresses investigation priority, not guaranteed time saved.

| Rank | Opportunity | Current evidence | Next action and success check |
|---|---|---|---|
| **P0** | Reconcile and reduce homepage studio-preview LCP delay | In all three after-run3 samples, the first-visit builder's studio preview is the LCP. Sample 1 breakdown: 29 ms TTFB, 114 ms resource load delay, 124 ms transfer, 852 ms element render delay; samples 2 and 3 have 630 ms and 233 ms render delay. Discovery checks pass (priority hint, discoverable markup, eager loading). Its reported 756 px bounding box conflicts with the declared 390 px viewport. | Reconcile viewport, screenshot, element geometry, and trace timing before selecting changes. Then inspect decode/paint, image visibility, layout/animation, and main-thread work. Keep the existing high-priority hint unless a valid trace shows it competing with earlier content. Require lower matched median LCP and stable CLS/CTA behavior. The 5.35 s observation remains unclassified until its methodology is known. |
| **P0** | Improve LCP across the measured route set | Current after-run medians range from 2,714.9 ms on the Free Intro route to 3,588.9 ms on Kids; every route is above 2.5 s. The earlier comparison showed `/schedule` +137 ms and Kids +169 ms. | Inspect current route LCP elements and subpart timings across all seven routes, starting with Kids, Teens, Adults, and homepage. Compare only matching snapshots. Address route-specific causes, then verify shared changes across all seven routes. |
| **P1** | Reduce remaining render-blocking and unused CSS across shared routes | Homepage CSS transfer fell to 68,289 bytes, while other routes report 128–189 KB CSS bytes. Saved previous notes identify unused CSS in sampled routes; verify against current snapshots before acting. | Inventory actual stylesheet requests and coverage for each route, including interactive states (navigation, audience selector, sticky CTA, focus, responsive layout). Remove verified dead/duplicate rules at their source. Rebuild fingerprinted output and compare LCP/FCP plus behavior. Do not judge by source byte count alone. |
| **P1** | Find and fix layout-shift outliers | Current homepage CLS ranges from 0.0005 to 0.2802 (median 0.0005); current schedule, teens, adults, and pricing samples are near 0.069. | Map layout-shift trace entries to nodes and causes. Check image dimensions/aspect ratios, late content insertion, font swaps, banners, and sticky controls. Require stable three-sample CLS and preserved content/CTA placement. |
| **P1** | Measure production delivery by region and connection | Local TTFB is only a local-server measurement. The report cannot establish global CDN/edge performance, compression, redirect cost, cache hit rate, or geographic variation. | With authorized network access, collect response timing and headers from representative regions and mobile networks. Record DNS, connection/TLS, redirects, TTFB, content encoding, cache status, and HTML/fingerprinted asset cache policy. Separate cold visits from repeat visits. |
| **P2** | Check responsive image selection across global routes | The current homepage LCP is an image, while prior reports show 28–76 KB image bytes on several other routes. Route-wide `currentSrc`/DPR coverage is not documented. | Audit requested images and CSS backgrounds in the route matrix. Compare source dimensions, rendered size, DPR-selected candidate, and bytes. Add responsive variants only where the browser downloads materially oversized media; retain lazy loading below the fold and dimensions/aspect ratios. |
| **P2** | Verify font preload and text rendering on all routes | Local fonts and `font-display: swap` are already present. The available report records font bytes but does not establish whether each preload is used early or competes with the LCP path. | Compare built preload URLs with actual font requests and inspect font timing against text LCP and CLS. Keep only preloads used in the initial viewport. Do not add another preload unless trace evidence supports it. |
| **P2** | Measure third-party request cost in production | Analytics is included from shared head markup. Local reports show lower JS bytes, but local-vs-live environment behavior differs and no production waterfall was captured. | Capture production requests and main-thread tasks by origin. Confirm whether analytics, booking, chat, maps, video, or other third parties load before LCP. Change loading only for measured contention and preserve consent, attribution, booking, and CTA event behavior. |
| **P3** | Establish field performance by geography and device class | No current CrUX, RUM, or region-specific field dataset was included with the local artifacts. | Gather a privacy-appropriate field baseline segmented by route, mobile device class, and geography, with p75 LCP/INP/CLS and sample sizes. Use it to validate global improvements; do not infer field results from Lighthouse score or local byte reductions. |

## Recommended order

1. Keep saved evidence immutable. Use after-run3 as the current seven-route, three-sample result; do not compare it with a different after snapshot.
2. Capture a matching before baseline from the same source snapshot with complete LCP and CLS diagnostics.
3. Inspect homepage, Kids, Teens, Adults, schedule, and layout-shift traces. Record measured causes before changing code.
4. Prioritize the largest verified LCP subpart and route regressions. Make one scoped change at a time.
5. Repeat the full seven-route, three-sample comparison with identical browser, Lighthouse version, local build assumptions, emulation, and server behavior. Keep raw traces and screenshots.
6. Separately verify production delivery and field data for geographic claims. Request the missing metadata for the original 5.35 s report.

## Measurement limits

- Local lab numbers are not production measurements. The harness explicitly disables caching and does not emulate production compression, redirects, CDN behavior, hosting latency, or regional routing.
- A Lighthouse performance score, smaller CSS bundle, or lower transfer size alone does not prove that mobile load time improved.
- The existing implementation report contains claims that conflict with the saved comparison artifacts (for example, homepage TBT and CLS summaries). Prefer raw manifests and comparison metrics; treat unsupported live-performance claims as unverified.
- No implementation, deployment, live HTTP check, or field-performance measurement was performed here.

## Source and evidence references

- Earlier local comparison: `/tmp/ssbjj-mobile-perf-evidence/comparison-run3/report.md` and `metrics.json` (its after phase is after-run3; the before phase is a different build snapshot, so deltas are historical evidence only).
- Earlier before manifest and raw traces: `/tmp/ssbjj-mobile-perf-evidence/before-valid/`.
- Current complete after run: `/tmp/ssbjj-mobile-perf-evidence/after-run3/` (seven routes, three samples, with LCP diagnostics).
- Method and route expectations: [web-performance-evidence skill](../.agents/skills/web-performance-evidence/SKILL.md), [routes](../.agents/skills/web-performance-evidence/references/routes.md), [methodology](../.agents/skills/web-performance-evidence/references/methodology.md).
- Source areas for follow-up: `src/_includes/components/head-metadata.njk`, `src/_includes/analytics-head.html`, `src/assets/css/`, `src/partials/home-conversion-shell.html`, and route-specific page templates/styles.
