# WS-29 Phase 0 — stylesheet ownership and load map

Status: source/cascade inventory only, 2026-10-23. No website edits, builds, tests, commits, or deployments performed by this worker.

## Scope and authority

Source inspected in isolated detached worktree `/tmp/ws29-inventory` at HEAD `3c16e8c044efcb0875813f452d10703bc95242ae`. Current generated files inspected read-only in `/home/twizss/Documents/ssbjjweb/tmb/dist`; those files already contain unrelated working-tree changes. Source declarations describe a fresh build's inputs, not a guarantee that the existing dist is fresh or production-equivalent. No live HTTP checked.

Persona readiness: ordinary build/cascade auditor fallback. Parent routing found a poorly fitting Static Site Generator candidate and no source-ready fitting role/instruction pair. No persona adoption is claimed. Applied method: distinguish source inputs, generated delivery output, SSI-expanded document order, and serving-route resolution; challenge capture validity before drawing layout conclusions.

## Shared source cascade

`src/_includes/layouts/base.njk` includes `components/head-metadata.njk`, then optional `headExtra`, then rendered body and shared header/footer. `src/_includes/components/head-metadata.njk` declares, in order:

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. Page/layout `extraCss`, in declared order.
5. `/assets/css/blog.css` if effective bodyClass contains `page-blog`.
6. `/assets/css/bjj-glossary.css` if effective bodyClass contains `page-bjj-glossary`.

`/tokens.css` is preloaded before this list, but preload alone is not a stylesheet application. `site-shell.css` begins with `@import "../../tokens.css"`, so tokens enter its cascade at that import location. CSS links inside body/SSI and inline style blocks must also be inventoried from expanded HTML; the head list is not the full browser cascade.

In the table below `SHARED` means the three ordered head sheets above, and `ROUTE` means `/assets/css/routes/site-18ac9c2704ce.min.css`. All other abbreviated CSS paths are relative to `/assets/css/`.

| Family / canonical route | Authoritative source | Layout chain | Declared cascade after SHARED |
| --- | --- | --- | --- |
| Home `/` | `src/index.html` | home → base | `global.min.css` → ROUTE → `pages/home.min.css?v=bf4945a8` |
| `/schedule` | `src/schedule.html` | schedule → base | ROUTE → `pages/schedule.css` → `pages/schedule-month-calendar.css` |
| `/options-pricing` | `src/options-pricing.njk` | pricing → base | ROUTE → `pages/options-pricing-highend.css` |
| `/free-intro` alias; canonical `/free-bjj-intro-tannersville-ny` | `src/free-bjj-intro-tannersville-ny/index.html` | free-intro → base | `pages/book-free-intro.min.css` |
| `/visit` | `src/visit/index.html` | base | ROUTE → `faqs.css` |
| `/programs` | `src/programs.html` | base | ROUTE → `pages/tannersville.css` → `high-end-near.css` |
| Kids `/bjj-classes/kids-tannersville-ny` | `src/bjj-classes/kids-tannersville-ny/index.html` | program → base | ROUTE → `pages/kids.css` |
| Adults `/bjj-classes/adults-tannersville-ny` | `src/bjj-classes/adults-tannersville-ny/index.html` | program → base | ROUTE → `pages/adults.css` |
| Teens `/bjj-classes/teens-tannersville-ny` | `src/bjj-classes/teens-tannersville-ny/index.html` | program → base | ROUTE → `pages/teens.css` |
| Blog `/blog/after-school-jiu-jitsu` | `src/blog/after-school-jiu-jitsu/index.html` | article → base | inherited ROUTE, then conditional `blog.css` |
| Glossary `/bjj-glossary/arm-drag` | `src/bjj-glossary/arm-drag/index.html` | base | conditional `bjj-glossary.css` |
| `/alley-bootcamp` | `src/alley-bootcamp/index.html` | base | `pages/alley-bootcamp.css` |
| `/winter-armor-2027` | `src/winter-armor-2027/index.html` | base | `pages/winter-armor-2027.css` |
| `/bjj-faqs` | `src/bjj-faqs.html` | base | ROUTE → `faqs.css` |

The legacy flat `src/options-pricing.html` is a different artifact from the canonical pricing template. It uses base layout with no page extraCss. Do not render that legacy alias as the canonical pricing baseline.

## Build ownership and minified twins

`package.json` build runs sitemap generation → Eleventy → `tools/materialize-ssi-fragments.mjs` → `tools/fingerprint-assets.cjs` → glossary asset alias → page delivery builders for home, schedule, glossary hub, directions, Tannersville, visit, Instagram, free intro, options/pricing, BJJ classes hub, and blog articles. These delivery builders read fresh rendered HTML, expand local CSS imports and SSI for purge analysis, collect linked JS runtime class usage, purge with runtime safelists, compress with Sass, and emit a digest-named delivery CSS file. Relevant builders replace owned link tags with an inline delivery `<style>` in the generated page. They require a fresh build and refuse an already processed delivery marker.

Verified concrete scopes:

- `tools/build-home-styles.mjs`: homepage only; six owned inputs from existing link order: icons, fonts, shell, global, route bundle, home sheet. Generates `home-delivery.<digest>.css` and `<style id="home-delivery-inline">`; removes redundant token preload.
- `tools/build-schedule-styles.mjs`: schedule canonical index plus flat alias handling; output schedule delivery.
- `tools/build-options-pricing-styles.mjs`: canonical pricing index; output options-pricing delivery.
- `tools/build-free-intro-styles.mjs` and `tools/build-visit-styles.mjs`: respective canonical pages; output free-intro/visit delivery.
- `tools/build-article-styles.mjs`: recursively gathers generated HTML in `dist/blog`, combines owned stylesheet inputs from sample article and aggregate content/runtime coverage, emits article delivery and replaces owned links on blog pages.
- `tools/build-glossary-styles.mjs`: glossary hub `dist/bjj-glossary/index.html` (and flat hub alias), not every glossary term. Do not assume the arm-drag entry shares the hub's inline bundle.
- `tools/build-bjj-classes-styles.mjs`: `dist/bjj-classes/index.html` hub only, not kids/adults/teens detail pages. Those detail pages retain their page sheets unless another explicit mechanism changes them.

`tools/minify-css.mjs` owns canonical/minified pairs. Its job list includes bootstrap-site, fonts, site-shell, styles, ss, bjj-glossary, global, components, many `pages/*` sheets, blog/blog-cro, schedule-consistency and registered component bundles. `tools/css-bundle-registry.mjs` resolves `assets/...` paths to `src/assets/...`; `config/css-bundle-registry.json` owns component bundle pair registration. The minifier strips comments and collapses safe whitespace. It intentionally excludes an obsolete site-shell guardrail block while preserving the mobile navigation contract below it. Therefore minified shell behavior is not simply a byte-compressed full canonical file.

Important command caveat: the minifier's stale error tells users to run `npm run styles:min`, but the current `package.json` does not declare a `styles:min` script. The direct existing entry point is `node tools/minify-css.mjs` (or `--check` for read-only comparison). The ordinary `npm run build` script does not explicitly invoke this minifier. Do not claim that building alone regenerates every hand-paired `.min.css` twin. Determine the exact generator for each edited canonical file and regenerate that owned output through its tool, never edit a min file by hand. No regeneration was run in Phase 0.

## Baseline validity defects discovered

1. The initial custom capture server tried `[base, base + '.html', base + '/index.html']`. For canonical `/options-pricing`, it served legacy flat `dist/options-pricing.html`, which lacks the canonical pricing stylesheet and content. Resolve directory index before flat fallback where both exist, and recapture affected evidence. Schedule flat/canonical artifacts also differ and need canonical resolution.
2. Main `dist/index.html`, canonical pricing and canonical schedule still contain Apache `<!--#include virtual="/nav-include.html" -->`. A plain static HTTP server does not expand this. Initial captures therefore omit real navigation and cannot establish the mobile-shell baseline. Home also contains a reviews-village SSI include. Expand local SSI read-only and recursively in the audit server, with root/path/cycle protection, before taking replacement baseline captures.
3. Current main `dist/index.html` has six external source-like sheets rather than `home-delivery-inline`; current schedule canonical index has no schedule delivery inline marker, while its flat alias does. Existing generated output is mixed. Preserve it, record hashes/timestamps for captures, and avoid describing current local renders as a verified fresh production build or live state.

## Phase 0 handoff gates

The parent still needs validated browser-measured styles, full 360/390/430/1280 capture coverage, visual review and defect log (including 360px pinch-zoom list), explicit serving/SSI/external-resource limitations, and owner priority confirmation before Phase 1. This source report proves ownership and declared ordering only; it does not prove responsive behavior, working booking, production parity, or Phase 0 completion by itself.

## Current local dist stylesheet order (SSI expanded, static parse)

These are canonical generated files, directory indexes preferred over flat aliases; exact filenames reflect current local state. Styles are listed in document order; this is not a computed-style or successful-network-load assertion. Inline styles without ids are retained in the map.

### `dist/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/global.min.css`
5. `/assets/css/routes/site-18ac9c2704ce.min.css`
6. `/assets/css/pages/home.min.css?v=bf4945a8`
7. `INLINE #(unnamed)`

### `dist/schedule/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/routes/site-18ac9c2704ce.min.css`
5. `/assets/css/pages/schedule.css`
6. `/assets/css/pages/schedule-month-calendar.css`
7. `INLINE #(unnamed)`
8. `INLINE #(unnamed)`

### `dist/options-pricing/index.html`

1. `INLINE #options-pricing-delivery-inline`
2. `INLINE #(unnamed)`

### `dist/free-bjj-intro-tannersville-ny/index.html`

1. `INLINE #free-intro-delivery-inline`
2. `INLINE #(unnamed)`

### `dist/visit/index.html`

1. `INLINE #visit-delivery-inline`
2. `INLINE #(unnamed)`

### `dist/programs.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/routes/site-18ac9c2704ce.min.css`
5. `/assets/css/pages/tannersville.css`
6. `/assets/css/high-end-near.css`
7. `INLINE #(unnamed)`

### `dist/bjj-classes/kids-tannersville-ny/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/routes/site-18ac9c2704ce.min.css`
5. `/assets/css/pages/kids.css`
6. `INLINE #(unnamed)`

### `dist/bjj-classes/adults-tannersville-ny/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/routes/site-18ac9c2704ce.min.css`
5. `/assets/css/pages/adults.css`
6. `INLINE #(unnamed)`

### `dist/bjj-classes/teens-tannersville-ny/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/routes/site-18ac9c2704ce.min.css`
5. `/assets/css/pages/teens.css`
6. `INLINE #(unnamed)`

### `dist/blog/after-school-jiu-jitsu/index.html`

1. `INLINE #article-delivery-inline`
2. `INLINE #(unnamed)`

### `dist/bjj-glossary/arm-drag/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/bjj-glossary.css`
5. `INLINE #(unnamed)`

### `dist/alley-bootcamp/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/pages/alley-bootcamp.css`
5. `INLINE #(unnamed)`

### `dist/winter-armor-2027/index.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/pages/winter-armor-2027.css`
5. `INLINE #(unnamed)`

### `dist/bjj-faqs.html`

1. `/assets/css/bootstrap-icons-local.css`
2. `/assets/css/fonts.min.css`
3. `/assets/css/site-shell.min.css`
4. `/assets/css/routes/site-18ac9c2704ce.min.css`
5. `/assets/css/faqs.css`
6. `INLINE #(unnamed)`

SSI recursion inventory: five unique existing virtual targets: `/_includes/analytics-head.html`, `/nav-include.html`, `/partials/reviews-village.html`, `/partials/nearby-areas-links.html`, `/partials/acquisition-editorial-rail.html`. No missing includes among 19 visited documents. See `/tmp/ws29-ssi-map.json`.

## Independent fresh-build validation

At parent's later request, ran the existing `npm run build` in `/tmp/ws29-inventory` against installed dependencies linked read-only by usage from the main checkout (`node_modules` symlink; no installation). Build **passed, exit 0**. Log: `/tmp/ws29-fresh-build.log`. No main-checkout files were mutated. Isolated build changed its generated `src/assets/data/asset-hash-manifest.json` and ignored `dist` output; the symlink is untracked. This is build validation only, not the release gate chain.

The fresh result confirms a mixed/stale-generated-output issue in the earlier main-checkout baseline: home and canonical schedule lacked delivery inline markers in main but receive them in a clean build from current HEAD. Fresh outputs are `home-delivery.c1276729a1c5.css` and `schedule-delivery.2a9836ab5023.css`, inlined under the respective delivery ids. Pricing, free-intro, visit and sample blog have delivery inline markers in both trees, with different HTML bytes. Programs, kids, adults, teens, arm-drag glossary term, alley, winter and FAQs appropriately retain external stylesheets; hub builders do not target them.

Machine-readable 14-route comparison: `/tmp/ws29-fresh-build-comparison.json` (inline ids, stylesheet-link counts, HTML bytes, SSI counts). Fresh home still contains 3 SSI directives; fresh schedule/pricing/free-intro contain 2 each; visit contains 3. Fresh rendering must therefore still expand SSI in the audit server. Old main-dist typography/layout observations must not be promoted to source defects before checking fresh-render evidence.
