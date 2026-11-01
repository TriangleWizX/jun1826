# Near CSS consumer audit — 2026-10-31

## Persona and method

The selector chose **Static Site Generator (Markdown to HTML, Blog, Docs, etc.)**, UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, score 52. Its full prompt describes a Markdown blog generator, so it is a mismatch for CSS selector and route-scope auditing. I used an ordinary CSS and static-route auditor fallback. The selected `Instructions - CODE` asset, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, was ready and source-inspected; its generic guidance supported requirements-first inspection, scoped changes, QA, and output mapping. No attachments were required.

Codegraph `search_code` returned `Transport closed`; scoped source and generated-file reads were used. No checkout, build, profile, source edit, generated-output edit, or staging operation was performed for this audit.

## Source consumers and selector fit

Direct source references to `/assets/css/pages/near.css` are:

- Six public town routes: `src/near/{hunter-ny,haines-falls-ny,cairo-ny,windham-ny,catskill-ny,palenville-ny}/index.html`.
- `src/nearby-towns.html`.
- `src/bjj-classes/index.html`.
- `src/near/template.html`, a placeholder source template (`/near/[slug]`), not a town page.

The six town routes use `layout: layouts/location.njk`, body classes `page-near ss-page ss-page-near`, and `extraCss: /assets/css/pages/near.css`. Each has 7–8 `.near-section` sections and a `.ss-near-breadcrumbs` element. An HTML source scan found 10–15 qualifying paragraph links and 3–5 qualifying list links under those sections per town page.

`src/nearby-towns.html` and `src/bjj-classes/index.html` both load `high-end-near.css` and `near.css`. Their body classes share `ss-page-bjj-classes ss-page-nearby-towns`; `/nearby-towns` also has `page-near`. The added eyebrow rule therefore matches both pages. `high-end-near.css` sets `.ss-page-nearby-towns .he-eyebrow { white-space: nowrap; }`, so the more-specific mobile rule can override it on both pages. This is a two-route effect, broader than `/nearby-towns` alone.

## Hunk classification

| Dirty hunk | Route and selector effect | Classification |
| --- | --- | --- |
| Link color and hover/focus color | `body.page-near .near-section .container > p > a:not(.btn)` and `body.page-near .near-section .container > ul a:not(.btn)` target non-button text links in the six town routes. They do not target the `.ss-near-section` markup on the directory pages. | **Supported and source-effective** on the six town pages. Visual and contrast acceptance was not performed in this audit. |
| Breadcrumb type `.85rem` → `.875rem` | `.ss-near-breadcrumbs` occurs on the six town pages and placeholder template only. | **Supported and source-effective** on the six town pages. Rendered-size acceptance was not performed in this audit. |
| Mobile eyebrow `white-space: normal` | `body.ss-page-bjj-classes.ss-page-nearby-towns .he-eyebrow` applies below 576px to both the BJJ Classes hub and Nearby Towns source. | **Unresolved scope/effectiveness.** Nearby Towns has an existing nowrap rule to override; current source also selects BJJ Classes. The current generated BJJ Classes route lacks a direct `near.css` reference, unlike its source metadata, so a clean build is needed to establish its rendered cascade. |

## Generated-output and live evidence

The current local source stylesheet and `dist/assets/css/pages/near.5c00d3.css` are byte-identical (12,356 bytes; SHA-256 `2a040acbb69e86b597e47388f73fa05dde05a13363a4ece6e1c5b63055862a2a`) and contain all three dirty hunks. The current dirty generated files `dist/near/{hunter-ny,haines-falls-ny,cairo-ny,windham-ny,catskill-ny,palenville-ny}/index.html` and `dist/nearby-towns.html` reference that fingerprint. `dist/bjj-classes/index.html` does not reference `near.css`, despite its source `extraCss` metadata. Because the main generated tree is dirty and this audit did not rebuild it, this is not proof of a clean output set.

The production HTTP checks were read-only:

- All six `/near/{town}-ny` pages returned HTTP 200. Their active stylesheet references were `tokens.40ed4d.css` (preload), `bootstrap-icons-local.6444e2.css`, `fonts.min.5ee9a4.css`, `site-shell.min.7f177f.css`, `routes/site-18ac9c2704ce.min.css`, and `mobile-foundation.114422.css`. The sampled route bundle did not contain the new `.near-section .container` link selector or `.ss-near-breadcrumbs` rules. These live pages do not directly reference `near.css`.
- `/nearby-towns` returned HTTP 200 and referenced `high-end-near.4bfae6.css`, `pages/near.0668cf.css`, and `mobile-foundation.114422.css` (plus the shared icon/font/site styles). Live `near.0668cf.css` returned HTTP 200 (11,729 bytes; SHA-256 `dca1c01a51a6795d48e4d36887ff53699079bb7851686e1f3c1626e593ae1743`) and lacks the new underline-offset, `.875rem` breadcrumb, and mobile eyebrow declarations.
- `/bjj-classes` returned HTTP 200 and its linked stylesheets did not include `near.css` or `high-end-near.css`.

The repository build pipeline runs Eleventy, asset fingerprinting, and route-style builders (`package.json`, `build` script). Source route permalinks map the six town files to `dist/near/{town}-ny/index.html`, Nearby Towns to `dist/nearby-towns.html`, and BJJ Classes to `dist/bjj-classes/index.html`.

`scripts/deploy-release.py` maps a changed CSS source to its dist asset, manifest fingerprint, and optional minified variants. It has explicit generated-page mapping for Kids and audience routes, but no corresponding mapping for the six `/near/` pages, `/nearby-towns.html`, or `/bjj-classes/index.html` when only `near.css` changes. An exact deploy payload is therefore **not proven**; the CSS change alone may not publish the HTML that references the new fingerprint.

## Prior qualification and disposition

`docs/styling-workstreams/2026-10-31-dirty-worktree-release-plan.md` records an earlier isolated Near CSS build and Browser Use pass for a candidate that narrowed the eyebrow selector to `body.page-near .he-eyebrow`. That report also records a release **no-go** because public pages differed materially from generated routes: live town pages were about 88–93 KB while source builds emitted about 31–34 KB, and live `/near/` pages did not reference `near.css`. The current dirty hunk restores the broader shared body selector, so the earlier visual pass does not verify this exact candidate. The current live checks above confirm the stylesheet and route-output mismatch remains.

**Disposition: hold.** The link and breadcrumb hunks are correctly scoped to the six town routes, but the live `/near/` consumers currently load a different stylesheet bundle, the eyebrow hunk also targets BJJ Classes, and the deploy mapper does not prove a complete route payload. Do not stage or release this CSS based on this audit alone. The next useful evidence is a coordinator-approved reconciliation of the public `/near/` route/output mapping and the exact build/deploy path; this contract did not create another build or overwrite the dirty generated tree.
