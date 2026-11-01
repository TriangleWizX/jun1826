# BJJ Stretches FAQ target-size release — 2026-10-31

## Scope and persona method

Release the already-reviewed 44px minimum height for the four FAQ accordion headers on `/bjj-stretches/`. Preserve all other dirty source and generated output. Lighthouse/PageSpeed, site-wide contrast review, the physical-keyboard SOP, and form submission are excluded by the owner.

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`. This persona and the Master `Instructions - COMPETENCE` asset, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, were adopted for the active goal; their full sources are recorded as inspected in `2026-10-31-dirty-worktree-release-plan.md`.
- **Source auditor:** ordinary frontend/CSS reviewer fallback; selector found no suitable fit. Paired with ready `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`; full instruction source was previously inspected for this goal. Read-only worktree; no attachments.
- **Output mapper:** ordinary Eleventy/deployment mapper fallback; the static-site-generator catalog candidate was rejected because its source described Markdown/blog generation, not route-output mapping. Paired with `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; full source was previously inspected for this goal. Read-only worktree; no attachments.
- **Implementation:** ordinary CSS/accessibility release specialist fallback paired with `Instructions - CODE`; no suitable ready catalog persona was returned. The codebase-memory service returned `Transport closed`; scoped source reads were used.
- **Browser method:** Browser Use 0.1.13, task-owned Chrome profile and named daemon, explicit loopback CDP, local-only preview, off-origin resolution blocked. No cloud or shared browser was used.

## Source and mapping

The source addition in `src/assets/css/pages/bjj-stretches.css` is:

```css
.page-bjj-stretches #stretchesFaqAccordion .accordion-button { min-height: 44px; }
```

It matches the active page wrapper and all four FAQ buttons. It raises their minimum hit-area height and does not cap natural expansion. The linked minified stylesheet is generated from the canonical CSS pair with `tools/minify-css.mjs`.

The first filtered deploy dry run selected only the fingerprinted CSS and omitted the route that must reference it. The mapper was updated to treat both BJJ Stretches CSS source paths as route-scoped inputs, require exactly one fingerprinted minified stylesheet in `dist/bjj-stretches.html`, and select that HTML plus the referenced CSS. Python syntax compilation and the exact dry run passed; the dry run selected exactly:

- `bjj-stretches.html`
- `assets/css/pages/bjj-stretches.min.156b62.css`

## Build and local review

- Clean detached build at parent `cecfa4c`; shared `node_modules` symlink only; no root `dist` copied or used.
- Regenerated only the BJJ Stretches minified stylesheet from the CSS source, then `npm run build` completed successfully. Eleventy generated 507 pages.
- The generated route references `bjj-stretches.min.156b62.css`; the generated asset contains the 44px rule and is 6,459 bytes.
- Browser Use at 390, 768, and 1,440 CSS-pixel widths found no horizontal overflow. All four FAQ buttons measured 44px high. At 390px and 1,440px, the Free First Visit CTA was visible; page title, H1, and canonical were present. The route was loaded locally; no forms were submitted.
- The clean candidate route's 118 visible main-text nodes matched the live route exactly before release.

## Commit, deploy, and live proof

- `443e66ad` — `fix(a11y): enlarge BJJ Stretches FAQ targets` (canonical CSS and minified pair).
- `e358bff6` — `fix(release): pair BJJ Stretches route and CSS` (24-line route-output mapping plus route-scoped inputs).
- Backup QA found two valid archives, zero invalid archives, and one older rotation candidate. Deployment reused a verified existing archive; no backup cleanup was requested in that command.
- Deployment exited 0 and uploaded exactly two files: the route (56,376 bytes) and fingerprinted CSS (6,459 bytes).
- Live `/bjj-stretches/` returned HTTP 200, referenced the new CSS fingerprint, retained all four FAQ controls, and its visible main text matched the clean candidate. The live CSS returned HTTP 200 and matched the clean artifact byte for byte: SHA-256 `67accebaa29a2b3ecd03a329f2985e1f7be74c58640ac65a9384899f139410df`. The 44px selector is present in the live CSS.
- The commits were fast-forward integrated into `main`. To preserve the already-dirty main CSS file, a normal fast-forward was allowed to abort; its current source bytes had been verified identical to the committed candidate. The index was then advanced with a mixed reset (no staged changes existed), and only the previously clean minified source and deploy mapper were synchronized to `HEAD`. The root dirty generated tree was not used as release bytes.

## Workspace closeout and remaining goal

The two read-only audit worktrees were removed after their reports returned. After final live verification, the 1.6 GiB clean build worktree and 7.2 MiB task-owned browser profile/schema were removed; Chrome, the preview server, and the named Browser Use daemon were stopped, and both local ports were confirmed closed. The broader dirty-worktree goal remains active; the main checkout still has hundreds of unrelated dirty paths requiring classification and focused release work. No Lighthouse/PageSpeed, site-wide contrast, physical-keyboard acceptance, or form submission was performed.
