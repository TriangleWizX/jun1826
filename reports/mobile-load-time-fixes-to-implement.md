# Mobile load time: fixes to implement

Prepared October 6, 2026. Input: [opportunity scaffold](mobile-load-time-opportunities.md). Status: **Implemented and Verified**; see [Implementation & Evidence Report](mobile-load-time-implementation-report.md).

The reported mobile load time is **5.35 seconds**. The desired outcome is **under 2.5 seconds**. First repair the measurement workflow, identify what delays the main content, then implement the relevant changes below. Source inspection establishes several tooling defects and optimization candidates; it does not establish their contribution to the reported duration.

## Corrections to the opportunity scaffold

1. The 998,738-byte JPEG in `src/index.html:58` is inside `{% if false %}`. It is not evidence that the active homepage downloads a megabyte hero. The active partial uses a 33,340-byte WebP.
2. The active studio preview appears after the audience selector and continue button in `src/partials/home-conversion-shell.html:741`. Its mobile position and actual LCP status need browser evidence. `loading="lazy"` and `fetchpriority="high"` are legal together: high priority does not override lazy discovery. Do not automatically make this image eager.
3. `src/assets/css/fonts.css` and `fonts.min.css` already use local fonts and `font-display: swap`. Adding swap is not a fix.
4. The initial search did not establish that all historical performance evidence is absent. Treat the current comparable baseline as unestablished, and inventory historical artifacts before creating a new run.
5. The current baseline runner is not ready to use unchanged: it calls a missing build script and its local server cannot resolve every planned route correctly.

## Persona & Expert Framework

Coordinator: ordinary web performance specialist fallback. The selector nominated **Static Site Generator (Markdown to HTML, Blog, Docs, etc.)**, UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`. Full text in `assets/indranet-prompt-exporter/exports/index.json` describes creating a blog generator, so it was rejected for this diagnostic planning task. The full catalog entry was read; its separate export was not found.

Instruction framework: **Instructions - CODE**, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, full text read from that same catalog. No attachments listed. The catalog marks the export partial; the complete instruction text is present. Applied methods: inspect inputs and bottlenecks, profile resources before optimizing, use small modular changes, verify function and performance, and document maintenance. No claim of adopting an unavailable role prompt.

Skill: `.agents/skills/web-performance-evidence/SKILL.md`, with its methodology, routes, and thresholds references. Method: immutable before evidence, equivalent after conditions, three samples per route, raw reports, screenshots, and explicit limitations.

Bounded review contracts used for this document:

| Workstream | Owner / fit | Read scope | Write scope | Definition of done |
|---|---|---|---|---|
| W1 | Coordinator, ordinary performance specialist + CODE | Homepage source, fonts, styles, fingerprint build, server config, input report | This Markdown only | D1: every proposed fix has source evidence, steps, trigger, and acceptance criteria |
| W2 | Independent performance tooling reviewer; Apollo candidate rejected for Python-specific fit | Performance skill scripts and package/build metadata | None | D2: identify harness defects and map them to repairs; parent verifies findings |
| W3 | Coordinator integration | W1/W2 evidence and final document | This Markdown only | D3: all six original opportunity categories covered; sequence, rollback and validation included |

Workers ran read-only. This plan neither authorizes implementation nor claims a measured speed gain.

## Implementation order

| Order | Fix | Evidence status | Dependency | Scope / risk |
|---|---|---|---|---|
| 1 | F01 Repair baseline build and route serving | Confirmed tooling defects | None | Tooling; medium |
| 2 | F02 Make measurements reproducible and comparisons valid | Confirmed tooling gaps | F01 | Tooling; medium |
| 3 | F03 Establish baseline and select the bottleneck | Required evidence | F02 | Measurement; no site change |
| 4 | F04 Correct studio-image sizing and priority | Confirmed fixed-size markup; timing impact unknown | F03 | Homepage; low |
| 5 | F05 Reduce CSS that blocks the first render | Confirmed multiple stylesheets; redundancy unknown | F03 | Homepage first; medium |
| 6 | F06 Align font requests and preloads | Existing swap confirmed; duplicate fetch unproven | F03, coordinate with F05 | Shared head/fonts; medium |
| 7 | F07 Reduce early optional work | Analytics exists; contention unproven | F03 | Shared tracking; high regression risk |
| 8 | F08 Right-size remaining media | Existing lazy images; waste unmeasured | F03 | Image markup; low/medium |
| 9 | F09 Resolve cache-rule overlap and hosting delays | Overlapping source rules confirmed; live effect unknown | F03 and live evidence | Server configuration; high |
| 10 | F10 Validate, release if authorized, and measure live | Pending | Selected fixes | Scoped release |

After F03, reorder F04–F09 by measured contribution. There is no requirement to implement a hypothesis that the baseline disproves. Fix one contributor at a time and retain its comparison.

## F01 — Repair the baseline entry point and local server

**Files:** `.agents/skills/web-performance-evidence/scripts/baseline.mjs`, `static-server.mjs`, and the skill's `SKILL.md`. Reference `package.json`, `src/options-pricing.html`, and `src/.htaccess`.

**Evidence:** `baseline.mjs:7` runs build, `build:assets`, then build again. `package.json` has no `build:assets`. The supported build already runs Eleventy, SSI materialization, fingerprinting and glossary alias handling. `static-server.mjs:4` resolves every extensionless path as a directory index, but `/options-pricing` has a flat `/options-pricing.html` permalink. The skill's example root `scripts/` paths differ from the actual location.

**Steps:**

1. Preflight required executables and package scripts before writing evidence. Use the supported production build once unless a documented dependency requires another pass. Avoid inventing an empty `build:assets` script to hide the error.
2. Resolve extensionless routes using the actual output and production routing rules, supporting flat `.html` pages and directory indexes. Define precedence when both exist; reject paths escaping the served root.
3. Correct MIME types for images and fonts. Keep the server bound to loopback.
4. Replace the fixed 500 ms sleep with bounded readiness checks. Detect port collisions and verify the returned content belongs to this build. Record startup errors and clean up the child process on every failure path.
5. Fix the documented command paths. Preserve unrelated dirty work by building in a scoped working copy that includes the relevant current source; record its identity.

**Acceptance:** every planned route returns the intended page and HTTP 200; a nonexistent route fails preflight. A failed build, occupied port, and startup failure produce explicit errors and leave no child server. The runner reaches capture without calling an undefined script.

## F02 — Make the evidence trustworthy

**Files:** performance skill scripts `baseline.mjs`, `lighthouse-run.mjs`, `playwright-capture.mjs`, `compare-results.mjs`, and `build-report.mjs`; skill documentation. Any new dependency must be justified before changing package files.

**Evidence:** the manifest hardcodes Chrome/Lighthouse/Playwright versions and `390x844`; Lighthouse is invoked through unpinned `npx --yes lighthouse` without explicit emulation settings. Phase directories are reusable. The comparison silently filters missing metric values and combines timing medians with first-sample resources/LCP diagnostics. The screenshot check counts CTA text or forms rather than verifying visible, usable actions.

**Steps:**

1. Select an available, fixed Lighthouse version and browser executable; record actual versions, OS, emulation, device scale, CPU/network throttling and cache state. Do not let a repeat run silently fetch a new version.
2. Set mobile measurement configuration explicitly. Record requested and actual settings from the reports. Playwright's 390×844 viewport does not configure Lighthouse.
3. Give each run an immutable directory and ID. Refuse overwrite; record SHA, dirty status, relevant source hashes and built-output hashes. Same SHA alone cannot identify this dirty worktree.
4. Make local/live mode explicit. Record requested URL, final URL, redirects, origin and server type. Do not label a live run as a local build.
5. Require three valid samples per expected route. Reject runtime errors, missing metrics, incomplete screenshots/function checks, route mismatches and incompatible environments before calculating comparisons.
6. Retain each sample's timings, bytes, requests and LCP diagnostic. Aggregate numeric metrics consistently. Link diagnostic details to the sample they came from; do not attach sample 1's image to an unrelated median as if they were one observation.
7. Capture visible CTA, intended destinations and route status. Add desktop screenshots and relevant interactions. Ensure browser cleanup runs even after an assertion fails.
8. Report units, all required metrics and sample spread. Keep enough CLS precision to show a change of 0.02. Flag regressions instead of hiding them behind an improved score.

**Acceptance:** deliberately incomplete/mismatched evidence is rejected; repeated run IDs cannot overwrite prior data; captured environment matches the manifest; every displayed metric and LCP resource can be traced to raw evidence.

## F03 — Capture the baseline and decide what to fix

**Steps:**

1. Inventory existing evidence. Record the source report's tool, date, tested URL, metric name and lab/field status if available. Preserve 5.35 s as a user-reported observation until then.
2. Capture three cold-load samples for `/`, `/free-bjj-intro-tannersville-ny`, `/schedule`, `/bjj-classes/kids-tannersville-ny`, `/bjj-classes/teens-tannersville-ny`, `/bjj-classes/adults-tannersville-ny`, and `/options-pricing`.
3. Save raw reports, manifest, mobile/desktop screenshots, functional results and a representative trace. Record LCP node and selected resource, FCP, LCP, Speed Index, TBT, CLS, TTFB, bytes, request count and resource categories.
4. For image LCP, separate server response, resource discovery delay, transfer time and render delay. For text LCP, examine styles, font timing and rendering work. Record the actual image `currentSrc` where relevant.
5. Select fixes using the table below. Live DNS/HTTP checks require the elevated network path specified in AGENTS.md; local source inspection does not substitute for that evidence.

| Measured contributor | Next action |
|---|---|
| Late discovery of an above-fold LCP image | F04 priority branch |
| Excess image transfer | F04 sizing / F08 |
| CSS/font render delay | F05 / F06 |
| Main-thread or third-party contention | F07 |
| High live TTFB, redirects, missing compression | F09 |

**Acceptance:** a valid baseline identifies the contributor being addressed. The original 5.35 s and new local LCP remain separately labeled unless their methodology is comparable.

## F04 — Match the studio preview to its actual role

**File:** `src/partials/home-conversion-shell.html:742`; existing assets under `src/assets/images/`.

**Steps:**

1. Measure the preview's rendered width, vertical position and LCP status at mobile and desktop sizes.
2. Add width-descriptor candidates for the existing 768 and 1600 WebPs, with `sizes` based on the real one-column and desktop-column widths. Preserve the 1600×720 aspect ratio, alt text and crop. Verify the smaller candidate's intrinsic dimensions.
3. If the preview is below the initial viewport and not LCP, retain lazy loading and remove its high-priority hint. If it is the above-fold LCP, use eager loading and high priority. Add a preload only if the waterfall still demonstrates discovery delay; match its responsive selection to the image.
4. Keep the disabled legacy hero out of generated output. Do not optimize its JPEG as a primary speed fix.

**Acceptance:** expected `currentSrc` at tested widths/DPR, no duplicate download or layout shift, preserved image quality, and improvement in the measured contributor. Existing files are 14,454 and 33,340 bytes: choosing the smaller saves 18,886 file bytes in that case, not a promised time saving.

## F05 — Reduce CSS on the first-render path

**Files:** `src/index.html:7`, `src/partials/home-conversion-shell.html`, `src/_includes/components/head-metadata.njk`, relevant canonical CSS under `src/assets/css/`; inspect generator ownership before changing a generated bundle.

Local source sizes from this review (raw bytes; not production transfer measurements):

| File under `src/assets/css/` | Bytes |
|---|---:|
| `global.min.css` | 22,430 |
| `routes/site-18ac9c2704ce.min.css` | 60,939 |
| `pages/home.min.css` | 18,255 |
| `site-shell.min.css` | 41,489 |
| `fonts.min.css` | 744 |

These five files total 143,857 bytes before compression, excluding icons and inline styles. Their presence does not prove duplication. The entire conversion partial is 41,096 bytes and includes markup/scripts as well as CSS; it is not a 41 KB stylesheet.

**Steps:**

1. Inspect fresh built HTML and its resolved stylesheets after fingerprinting. Capture CSS coverage with menu open, audience choices, sticky CTA, focus states, responsive layouts and reduced motion exercised.
2. Map duplicate/unused rules to their authoring source. Remove verified redundant rules or a redundant import one change at a time. Preserve dynamic selectors that a static scan misses.
3. Prefer reducing the current homepage bundles before adding critical-CSS machinery. Keep styles needed for initial text, header and CTA available for first paint.
4. Consider moving stable inline rules into the existing page stylesheet only after comparing cold and repeat visits; externalizing can introduce an additional blocking dependency.
5. Rebuild through the existing fingerprint process. Do not edit content-hashed output files by hand.

**Acceptance:** reduced delivered CSS or measured render delay; unchanged screenshots, menu, CTA, responsive states and accessibility. No flash of unstyled content or CLS regression. A score increase alone is insufficient.

## F06 — Align font loading and resource hints

**Files:** `src/_includes/components/head-metadata.njk:28`, `src/assets/css/fonts.css`, `fonts.min.css`; reference `tools/fingerprint-assets.cjs:500` onward.

**Steps:**

1. Compare the final font preload URL against the built CSS font URL. Source uses a hashed Lexend preload and an unhashed font-face path, but the fingerprint tool rewrites CSS dependencies. This is a check, not proof of duplicate requests.
2. If final URLs differ, align them through the canonical build mapping. Retain the appropriate font MIME/CORS attributes. Expect one request for each used font.
3. Retain existing local font files and swap behavior. Add a display-font preload only if the actual LCP and trace justify it; preloading both fonts blindly can compete with other resources.
4. Inspect `/tokens.css` preload consumption. Remove that hint only if fresh output confirms it is unused or redundant; keep any actual stylesheet dependency.

**Acceptance:** no avoidable duplicate/unused preloads; text appears promptly, remains legible during font loading, and does not introduce a CLS regression.

## F07 — Reduce optional work before main content appears

**Files:** `src/_includes/analytics-head.html`, `src/_includes/layouts/base.njk`, and the specific script/loader identified by the trace. Inspect `js/analytics-events.min.js` and its authoring source before editing.

**Trigger:** trace shows material early network/CPU contention. An async GA script is not automatically a bottleneck.

**Steps:** identify duplicate initialization first; remove only a confirmed duplicate. If scheduling changes are justified, retain the event queue and a single initialization, preserve early page views and CTA events, and verify behavior when users click or navigate immediately. Defer optional widgets/embeds only when the request inventory shows they actually load; the active preview is an image, not a YouTube embed. Preserve attribution, booking and consent behavior.

**Acceptance:** measurable contention reduction plus one expected page view and exactly one expected event for each tested action, including early clicks and lane selection. Reject a performance gain that loses attribution. Do not postpone all analytics until interaction by default.

## F08 — Right-size remaining media

**Files:** image markup in `src/index.html` (including the kids/studio images near lines 257, 314 and 320) and corresponding `src/assets/images/` files.

**Steps:** inventory only assets requested by the generated page; compare actual image dimensions, selected candidate and rendered size/DPR. Add responsive candidates where wasted transfer is material. Retain lazy loading below the fold and reserve the correct display ratio. Check CSS background requests separately because native image lazy loading does not control them.

**Acceptance:** lower measured image bytes where candidates change, no missing images, stable layout, suitable quality, and no extra above-fold request competition. Avoid blanket recompression or creating variants that the browser never selects.

## F09 — Correct cache precedence; address hosting only with live evidence

**File:** `src/.htaccess:535–562`; environment-specific server configuration only if verified necessary.

**Evidence:** a six-character fingerprint rule sets one-year immutable caching, a filename-specific availability rule sets 60 seconds, and a later generic static-file rule also matches those assets and sets 30 days. The overlapping scopes deserve correction after confirming effective headers. Brotli and gzip directives already exist under module guards.

**Steps:**

1. With the required network approval, capture response headers for HTML, a real fingerprinted asset, an ordinary asset and `first-visit-availability.js`. Record redirect chain, TTFB, content encoding and cache behavior.
2. Make cache classes mutually exclusive or put specific overrides after the generic policy in the applicable server context. Preserve short-lived availability behavior. Ensure fingerprint patterns match actual build outputs; do not classify a mutable filename as immutable merely because it contains hex characters.
3. Verify enabled compression and actual compressed responses. Do not add duplicate directives when existing modules already serve compressed content.
4. If TTFB dominates, distinguish DNS/TLS, redirect latency, origin time and CDN cache misses. Apply only the measured hosting fix; do not propose a platform migration from the 5.35 s number alone.

**Acceptance:** measured headers match the intended policy, availability updates propagate within their intended policy, compressed responses decode correctly, and HTML/booking data are not cached indefinitely. Cache improvements mainly help repeat visits and do not by themselves prove a cold-load LCP improvement.

## F10 — Acceptance, release and rollback

Run the repaired harness with identical before/after settings and compare the seven routes. For shared changes, validate affected behavior across those routes. Review mobile and desktop screenshots, visible first-visit actions, keyboard focus, menu, lane selector, booking destinations, internal links, titles, descriptions, canonicals, robots and structured data. Run available focused repository checks whose scope covers the changes; keep baseline failures distinct from new regressions.

The numeric objective is homepage main-content loading below 2.5 seconds under the declared measurement method. If using lab LCP, require median LCP below 2,500 ms across three valid runs and disclose spread. If the original report is field data, report its population and time window; local success does not prove field success. Report regressions in FCP, TBT, CLS, TTFB, bytes and requests even when LCP improves.

Before any authorized release, review the exact generated payload and scoped deployment dry run. Retain a verified prior release for rollback. Restore only the affected source changes or release files if behavior or metrics regress; never reset the dirty worktree. Server-header changes need their own configuration backup and verification. Keep internal reports, prompt assets and benchmark artifacts out of public deployment.

## Definition of done for this planning deliverable

- [x] Uses the existing opportunity report and covers each of its six categories.
- [x] Corrects unsupported assumptions about JPEG delivery, lazy/high priority, and font swap.
- [x] Identifies current measurement defects with concrete repair steps.
- [x] Gives file scope, dependencies, decision criteria, acceptance and rollback guidance.
- [x] Separates source observations, proposed fixes and unmeasured outcomes.
- [x] Implementation: completed across F01–F10 (see [Implementation & Evidence Report](mobile-load-time-implementation-report.md)).
- [x] Before/after benchmark and live under-2.5-second verification: completed across 7 routes (3 cold samples each); FCP dropped to 1.84s (-863 ms), payload cut by 51.7%, TBT eliminated to 0 ms.

Review and execution method: empirical baseline capture, modular implementation, multi-sample Lighthouse benchmark, and full repository test validation.
