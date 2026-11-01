# Dirty Worktree Commit and Release Plan — 2026-10-31

## Objective

Review the 905 remaining dirty paths in the main checkout, classify each by source ownership and release status, commit coherent approved changes, and deploy only generated public outputs that pass the repository release checks. Keep private, temporary, or duplicate evidence out of public payloads. Do not stage or discard unknown user work.

## Current baseline

- Audit baseline: `bdd1bc5`; 201 modified, 10 deleted, and 692 untracked paths (903 total). Largest groups: 531 docs/evidence paths, 113 generated `dist` paths, and 85 source paths. Untracked files total about 366 MB after removing 34 exact duplicates of committed screenshots (25.7 MB freed).
- The requested Kids/Teens schedule links are already in committed calendar code and live. The public schedule loads the inline-youth version of `schedule-month-calendar.js`; this is not additional dirty work.
- Recent HTTP verification and deployment authorization persist. Lighthouse/PageSpeed runs remain excluded by the owner's prior instruction.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, v4.0.0, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`. Previously read in full and applied for cross-workstream risk review and integration.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; source record `assets/indranet-prompt-exporter/exports/index.json`. The complete 1,500-character instruction text was inspected. Apply critical thinking, evidence checks, risk assessment, and clear reporting.
- **DW-SOURCE-1:** Debugger-Analyzer — Orko Debugulator, actual prompt UUID `d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`, v1.0.0; source `assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/versions/v1.0.0/prompt.json` (complete 2,835-character source read in chunks). Paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, complete 1,500-character source record read from `index.json`. Fit: trace changed implementation files and separate supported, stale, and risky code changes.
- **DW-GENERATED-2:** Ordinary static-site release specialist fallback. The selector found no ready persona for release-path auditing; promising static-site and code-oracle candidates lacked an available full prompt source. Paired with `Instructions - CODE`. No persona adoption is claimed.
- **DW-RECORDS-3:** Ordinary documentation and evidence curator fallback. The catalog's Knowledge Manager prompt source was unavailable locally, so no persona adoption is claimed. Paired with `Instructions - COMPETENCE`.

## Read-only Workstream Contracts

| DoD | Workstream and write boundary | Read scope | Completion evidence |
| --- | --- | --- | --- |
| `DW-SOURCE-1` | Review changed application/source code. No write path; return findings to coordinator. | Changed `src/`, `js/`, `scripts/`, `tools/`, `tests/`, and `package.json` paths in main; compare with `HEAD`. | Every changed source path grouped by feature; source-of-truth and tests/QA mapped; sensitive or unsupported claims flagged; commit/deploy recommendation per group. |
| `DW-GENERATED-2` | Review generated outputs and release mapping. No write path; return findings to coordinator. | Changed/deleted `dist/` paths, `asset-hash-manifest.json`, build scripts, deployment script, and live route mappings. | Exact source-to-generated mapping; exact eligible deployment payload; deletions and cache-buster behavior explained; clean/dirty artifact hazards identified. |
| `DW-RECORDS-3` | Review docs, reports, screenshots, archives, and scratch files. No write path; return findings to coordinator. | Untracked/changed `docs/`, `assets/`, `scratch/`, `--help/`, and root artifacts. | Files classified as canonical docs, evidence, temporary outputs, exact duplicates, private/sensitive, or unknown; preserve/delete/commit recommendations with hashes/sizes. |
| `DW-RELEASE-4` | Coordinator integration and release. | Worker reports, exact changed paths, release script dry run, focused QA, live HTTP/content/browser proof. | Focused commits; exact generated payload(s); pre-deploy backup; live verification; final dirty paths are either resolved or individually documented with owner reason. |

## Safety and execution rules

1. Workers read the main dirty checkout but do not edit it, stage files, delete artifacts, create commits, or deploy.
2. Each worker uses a separately registered minimal worktree based on `2459515a`; no copied `dist`, dependencies, browser profiles, or full assets. Their report returns through the agent message, not a shared write path.
3. The coordinator stages exact paths only after reviewing all source/generated pairings. Do not release the root dirty `dist` file directly: `deploy-release.py --commit` selects eligible paths but reads bytes from its current checkout.
4. Skip untracked artifacts from public payloads. Before any cleanup, prove an exact committed duplicate or obtain owner direction.
5. Keep Lighthouse/PageSpeed and the owner's contrast review out of scope.

## Read-only audit results

- `DW-SOURCE-1` found 92 tracked source/code paths (+2,170/-573) plus 8 untracked code/tool paths. Changes span youth form analytics, homepage claims, global/page CSS, CSS builders, glossary/article generation, editorial/location pages, QA scripts, and three new pages. Keep shelved keyboard and site-wide contrast changes out; review claims, form event/privacy data, new pages, and source records before their release. `qa-cwv-lab` must remain unrun.
- `DW-GENERATED-2` found 113 dirty `dist` paths: 103 modified and 10 deleted across blog, location, glossary, source, free-intro, root, sitemap, and shared asset outputs. The nine deleted fingerprint variants need a clean build/manifest reconciliation; `dist/schedule.html` has 16 references and cannot be treated as a safe deletion. Never upload the dirty root pricing route, which contains local-only calculator/session links. The release tool reads bytes from its current checkout even when `--commit` is supplied.
- `DW-RECORDS-3` found 528 untracked docs/evidence files (~168 MB), 140 untracked viewport PNGs (~190 MB), nine personal-looking photos (~8 MB), three drafts, patches, and a bundle. There are no remaining exact duplicates of tracked blobs. Keep photos, drafts, evidence, patches, and bundle out of blanket commit/deployment; several evidence images are referenced by records. No high-confidence token/private-key pattern was found in scanned text paths.
- A separate, previously authorized repository cleanup commit `5c87f625` removes the obsolete tracked `.htaccess.bk`; it is not a production payload. The current `.htaccess` is a distinct file.
- The temporary `/tmp/dw-schedule-build-20261031/` checkout was removed after confirming no build process was active; the workspace inventory now records its closeout. This recovered about 1.2 GiB and does not alter the main worktree.
- A focused route-CSS review found the dirty shared `location.njk` declaration would add Woodstock and Tannersville styles to many unrelated town routes. `tannersville.min.css` already belongs to the Tannersville route; `high-end-near.css` targets a different Woodstock page and does not match the Woodstock class route. The shared template edits and Woodstock trial link were removed. The local generated tree still has both extra stylesheet links on 23 modified town pages (46 extra links total); those outputs remain unreleased and uncommitted pending clean-build reconciliation.
- These findings reject a single `git add -A` plus full-site deployment. Continue by reviewing coherent, source-backed release bundles in isolated clean builds. Do not call the overall dirty-worktree goal complete while unreviewed paths remain.

## Follow-up release checks — 2026-10-31

- **Schedule link placement:** User clarified that Kids and Teens should be linked in the class text immediately after the time, without separate page-link labels. The committed schedule fallback already renders `5:00–6:00 PM` followed by `Kids + Teens Small-Group Class …`, with the words “Kids” and “Teens” linked to their matching program routes. The calendar script builds the same inline links. A live HTTP parse of `/schedule` (200) confirmed those two links in the class name after the 5:00 PM time, and the referenced script returned 200 with the corresponding route logic. No source edit was needed. Browser Use doctor reported no running Chrome/daemon; the skill permits plain HTTP for public content, so no browser was started.
- **DW-HOME-CONVERSION-1:** Selector found no suitable ready role persona, so an ordinary homepage conversion/static-site release reviewer fallback was used with `Instructions - CODE` UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`; its complete 1,500-character source was inspected. The source facts were consistent with `pricing.json`, `programs.json`, `structured-data.njk`, and `offers.json`; relevant first-visit, schedule, text, reviews, and guarantee links remain. Deployment is **no-go** from dirty `dist/index.html`: it has 376 changed lines, inline CSS, and the source wrapper depends on dirty `home.css` plus a changed asset fingerprint. Rebuild this route and stylesheet together from a clean scoped checkout before considering release. No build or tests were run.
- The isolated homepage audit worktree and patch were removed; lifecycle preflight passed. The overall objective remains open with 369 dirty paths in the main checkout; release work must continue in reviewed bundles.

## Homepage first-visit release — 2026-10-31

- **Commit:** `4bbd4169` (`Refresh homepage first-visit flow`), parent `37f846a`. It contains only `src/assets/css/pages/home.css`, `src/assets/data/asset-hash-manifest.json` (the Home CSS fingerprint and the one referenced alley-bootcamp image fingerprint), `src/index.html`, `src/partials/home-conversion-shell.html`, generated `dist/index.html`, and `dist/assets/images/alley-bootcamp-hero-960.d42000.webp`.
- **Source review:** `DW-HOME-CONVERSION-1` found the displayed class cap, instructor, class-age, term, review, and guarantee facts represented in local canonical data; the schedule, visit, text, review, and terms links remain. The first-visit wrapper is coupled to the page CSS, so both were included. No source-copy or policy changes were made during the clean build.
- **Build and local viewport evidence:** `npm run build` passed in a sparse clean worktree at parent `37f846a` with only the three reviewed homepage source diffs applied. The site generator reported 107 other stale/generated output differences, which were excluded. The homepage uses its generated delivery CSS inline; its output was 164,044 bytes with SHA-256 `58b3aa9bd3e832b0744f175a410f7946662888955948233640a499b0fc0234a7`. Isolated headless Chrome with all off-origin requests blocked returned HTTP 200 at 390px and 1440px, one H1, no horizontal overflow, no page errors, and no request failures. At 390px the first-visit action measured 358×54px at y=330; at 1440px it measured 505×54px at y=385. Full-page screenshots were reviewed and removed with the temporary checkout. Browser Use doctor had no active daemon; the local Playwright/Chrome proof was used instead.
- **Exact release and deployment:** `deploy-release.py --dry-run --commit 4bbd4169 --only index.html --only assets/images/alley-bootcamp-hero-960.d42000.webp` listed exactly those two paths. Deployment reused the existing verified remote backup and exited 0. Live `/index.html` returned HTTP 200; expanding its three live SSI fragments made its HTML byte-for-byte identical to the isolated generated `dist/index.html`. The fingerprinted image returned HTTP 200, 70,042 bytes, SHA-256 `eb26a4bd95bb31551610e62596ae2853f0e5d4b75b71e1d948278dbb553e9dde`, matching the clean build. The SVG icon dependencies were also confirmed live. No Lighthouse/PageSpeed, form submission, keyboard SOP, or contrast audit was run.
- **Dirty-tree preservation:** `main` now points to `4bbd4169`. A mixed reset kept the working tree untouched; the pre-existing dirty root `dist/index.html` still has SHA-256 `aa358e0ab0dada73cda7e9c18cea605dc6e73c1c58dccdfaa60d5aea01274350` and remains unstaged. The clean release output lives in the commit. The temporary worktree, preview server, screenshots, and symlinks were removed. Workspace audit reported 366 remaining dirty paths; the broad objective remains open.
- **Rollback:** Restore the previous homepage from the verified remote backup, or rebuild/deploy the parent `37f846a` homepage route. The fingerprinted image is immutable and may remain unused after rollback.

## Free Intro youth-form validation release — 2026-10-31

- **Fix:** A blank age was converted to `0` before required-field validation. That sent parents to the out-of-range route and skipped inline validation. The route now activates only after an age is entered; an entered age outside 5–17 still opens the alternate route.
- **Commit:** `8d310b79` (`Fix blank-age youth intro validation`), on primary `main`, parent `187fc899`. It contains the reviewed youth form source, focused browser QA, and generated JavaScript. The main dirty tree was not rebuilt; only the exact release files were synchronized. Other dirty generated outputs remain untouched.
- **Checks:** `npm run build` passed. Browser QA passed 10 local rendered views at 390px and 1440px, checks blank-age focus and associated inline error text, age-4 alternate routing, and mocked submission. All off-origin requests were blocked. Lighthouse/PageSpeed and physical-keyboard checks remain owner-run.
- **Deploy:** `scripts/deploy-release.py --dry-run --commit 8d310b79 --only js/youth-intro-form.js` selected exactly one file. Deployment with the verified-backup procedure exited successfully. Live `/js/youth-intro-form.js` returned HTTP 200, 13,800 bytes, SHA-256 `319e6617a1681fcf5f0df35d9f80c5aeb449aa1cb9a174b9b28666bf51a38ff1`, matching the isolated build and committed artifact.
- **Closeout:** The 1.1 GiB isolated checkout and 12 KiB QA output were removed after process/open-file checks. Shared dependencies and the other retained worktrees were left alone. The overall dirty-worktree objective remains open; continue reviewing source ownership and releasing only coherent verified bundles.

## Next release-wave reviews — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`. The active goal already adopted this role.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; source `assets/indranet-prompt-exporter/exports/index.json`; previously read in full for this goal.
- **Motion review:** the selector returned Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, status partial. Its catalog text describes building a Markdown-to-HTML blog generator and its complete prompt source is unavailable; reject as a fit. Search found no ready full-source accessibility/reduced-motion persona. Use an ordinary reduced-motion accessibility specialist fallback, paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165` (full source previously read for this goal); no attachments.
- **Release-map review:** selector found no suitable ready static-site release persona. Use a distinct ordinary release-ownership specialist fallback, paired with `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f` (full source previously read); no attachments.

### Read-only workstream contracts

| DoD | Owner lens | Read scope | Write scope | Verification |
| --- | --- | --- | --- | --- |
| `DW-NEXT-MOTION` | Ordinary reduced-motion accessibility specialist fallback; CODE instructions | Dirty CSS/JS source, route imports, current motion acceptance notes | None | Map each concrete finding to source and routes; distinguish local source from deployed proof; cite `prefers-reduced-motion` behavior; recommend a bounded fix or no-change. |
| `DW-NEXT-RELEASE` | Ordinary static-site release-ownership specialist fallback; COMPETENCE instructions | Dirty source cohorts, release plan, `scripts/deploy-release.py`, generated mappings | None | Compare source with `HEAD` and dirty `dist`; identify one coherent next bundle or no-go; give exact eligible paths, checks, and clean-build requirement. |

Both reviews use the shared checkout read-only, create no worktrees/builds/profiles, perform no network requests, and do not stage, commit, edit, or delete files. Exclusions remain Lighthouse/PageSpeed, site-wide contrast, physical keyboard SOP, and Student Hub weekly/YAM data.

## Everyday Jiu-Jitsu mobile navigation release — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`; the active goal already adopted it.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; source `assets/indranet-prompt-exporter/exports/index.json`; full text previously read for this goal.
- **Worker:** selector candidate Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, partial, was rejected: the available catalog source describes a Markdown blog generator, its full prompt file is unavailable, and that method does not fit route-level mobile navigation/accessibility QA. Use the ordinary frontend navigation/accessibility implementer fallback; pair with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165` (full text previously read for this goal), no attachments. Apply the approved `design-taste-frontend` audit-first/preserve-existing-system guidance and its reduced-motion criterion from `/home/twizss/.codex/skills/design-taste-frontend/SKILL.md` §6.B.

### Bounded contract — `EDJ-NAV-IMPLEMENT`

- **Write paths:** only `src/everyday-jiu-jitsu-training.html` and `src/assets/css/pages/everyday-jiu-jitsu.css` in its isolated worktree. Exclude the dirty `tools/build-article-styles.mjs` change; it concerns blog hero badge retention.
- **DoD:** verify semantic toggle state, open/close, Escape and focus return, lesson selection, visible/fallback links at mobile and desktop widths; verify sidebar and lesson motion when reduced motion is requested; run a clean current-source build and focused local browser QA; dry-run the exact route and one fingerprinted stylesheet; independently review before commit/deploy.
- **Scope:** no unrelated shared shell, content, schedule, dependency, or public-copy edits. Block off-origin requests. No forms are submitted. Lighthouse/PageSpeed, site-wide contrast, physical-keyboard SOP, and Student Hub weekly/YAM remain excluded.
- **Release map from read-only audit:** source pair should map to `everyday-jiu-jitsu-training/index.html` and the one CSS fingerprint referenced by that generated route. Candidate is conditional until clean build, interaction QA, and `--only` dry run prove the exact payload.

### Everyday Jiu-Jitsu navigation release evidence — 2026-10-31

- Commit: `c1db2c9` (`Fix Everyday Jiu-Jitsu mobile navigation`), containing only `src/everyday-jiu-jitsu-training.html` and `src/assets/css/pages/everyday-jiu-jitsu.css`.
- Clean isolated `npm run build` passed. The generated route was 33,940 bytes (SHA-256 `904ae788b234cf0e1bfd5a7c3ec3b2e1cf12da46efce0fef62ce3ad5d8be4d1f`) and references `/assets/css/pages/everyday-jiu-jitsu.5f2c9f.css` (5,942 bytes; SHA-256 `56e43108c3cf58184bfd9b3ead3e4abe84ae4fd9504006349c1ece90030d6599`).
- Filtered deploy dry run and upload listed exactly `everyday-jiu-jitsu-training/index.html` and `assets/css/pages/everyday-jiu-jitsu.5f2c9f.css`. The deployment tool verified a predeploy backup with 14,561 files, then reported remote upload sizes of 5,942 and 33,940 bytes.
- Live HTTP: the route and stylesheet each returned 200. The stylesheet response was 5,942 bytes and matched the generated file byte for byte. The live HTML response was 82,918 bytes after server processing; it contains the new button, menu mark, and ARIA state, but its bytes differ from the 33,940-byte build file.
- Browser Use local and live verification passed at 390px and 1440px: no horizontal overflow, the mobile button is announced as “Open lesson navigation,” open state updates `aria-expanded`, Escape closes and returns focus, selecting lesson 2 activates it and sets `aria-current="true"`, reduced motion computes sidebar transition to `0s`, and the Free First Visit CTA remains visible. Desktop navigation is visible and the mobile toggle is hidden. Screenshots were inspected; the live mobile menu mark renders correctly.
- Deployment backup rotation removed `/home/sensdapt/senseisandy-predeploy-20261031T054934Z.tar.gz` (1,130,698,031 bytes) after reporting 2 backup entries checked, 0 invalid, and 1 older top-level rotation removed. No Lighthouse or PageSpeed check was run.
- Temporary worktree/profile closeout: isolated checkout, local/live Chrome profiles, GSettings overlay, preview server, and QA captures were removed after live verification; approximately 1.6 GiB recovered.


## Glossary reduced-motion route audit — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; already adopted for this active goal.
- **Workstream role:** The selector returned no suitable ready persona. Catalog search found Arcweft UI UX Forge, UUID `f276d95a-0473-4ba1-94cd-c6532e4d9e52`, but its required ZIP attachment is unavailable in the repository, so it is not adopted. Use an ordinary JavaScript and accessibility auditor fallback with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`; the full instruction source was already read for this goal.
- **Contract `GLOSSARY-MOTION-ROUTE-20261031`:** Read-only source-to-route audit of `js/glossary-filters.js` reduced-motion behavior, its exact glossary route consumers, generated asset references, and `scripts/deploy-release.py` mapping. No source edits, builds, tests, browser profiles, external requests, commits, or deploys. DoD: explain the calls and triggers; identify all affected routes/output paths; distinguish dirty main `dist` from clean source truth; recommend an exact bounded fix and payload or no-go.

### Glossary reduced-motion route audit result — 2026-10-31

- The active glossary source has two smooth-scroll calls in `js/glossary-filters.js`: selection scrolls the reader on mobile when explicitly requested; quick-term chips also scroll the app section. A mobile quick-term tap can invoke both. Neither call checks `prefers-reduced-motion`. The separate global `js/script.js` anchor and scroll-to-top calls also use smooth motion and remain a distinct, broader workstream.
- Independent count: 156 glossary source HTML files; 145 reference the glossary filter runtime: the main glossary index, 143 term pages, and the updates page. The `frames` and `position` term pages have a reader root but do not load this runtime. The main index has the app section; the updates page has neither the term root nor that app section.
- The only dirty source diff in `js/glossary-filters.js` is 4 insertions/1 deletion for `aria-pressed` and disabled letter-click handling. It does not change either scroll call. Preserve it as user work. `js/script.js` is not dirty.
- Source pages name `/js/glossary-filters.min.c056e1.js`; the dirty main `dist` pages name `/js/glossary-filters.min.js` and expose conflicting hashed aliases. Seven dirty `dist/bjj-glossary` route files also contain unrelated large generated-page changes. Do not use these outputs as release bytes.
- `fingerprint-assets.cjs` and `ensure-glossary-asset-alias.cjs` create a content-fingerprinted runtime and a legacy alias; exact output hashes and route references must come from a clean isolated build. No payload is approved until that build and a filtered deployment dry run reconcile all affected pages and runtime files.

### Glossary reduced-motion implementation probe — 2026-10-31

- The scoped implementation experiment added a shared `getScrollBehavior()` helper to both `js/glossary-filters.js` and its tracked `.min.js` counterpart. It returns `auto` when the browser requests reduced motion and `smooth` otherwise. The two call sites are the mobile reader selection and quick-term chip navigation.
- A clean isolated `npm run build` passed at `c1db2c9e` with only those two source files changed. Both passed `node --check`; `git diff --check` passed. The build generated 507 pages, fingerprinted 172 assets, and rewrote 449 HTML files.
- Release remains **no-go**: the clean build's 145 glossary runtime consumers reference `/js/glossary-filters.min.js`; the source pages name `/js/glossary-filters.min.c056e1.js`, and the current generator/fingerprinter resolves that stale name to the unversioned alias. The generated runtime therefore has a 30-day cache policy. Updating only the JS would leave existing hashed source URLs untouched and could serve stale cached code. The generated glossary pages also differ broadly from committed route outputs (seven tracked outputs each show 179 additions and 11 removals), so those route files cannot be included as a transparent cache-key-only release without reviewing their content deltas.
- No source edits were copied to the main checkout, no commit or deploy was made, and no browser check ran. The temporary 1,011 MiB worktree and dependency symlink were removed after the build; the main dirty source files remain untouched. Next step: reconcile the glossary generator, fingerprinted asset name, and all 145 route references in a source-to-output plan before reconsidering release.

## Legacy workspace reconciliation wave — 2026-10-31

### Coordinator framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`, source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`; already adopted for this goal.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, `assets/indranet-prompt-exporter/exports/index.json`; full source previously inspected for this goal. Use evidence-first reasoning, preserve unique work, and document ownership/closeout.
- **Workspace contract:** Two read-only audits; no writes, source integration, deletion, builds, network, commit, or deploy. Workers report findings to the coordinator for independent review. Reuse the already-inventoried legacy workspaces; create no additional checkout or environment.

### Workstreams

| DoD | Persona and fit | Read paths | Write paths | Completion evidence |
| --- | --- | --- | --- | --- |
| `ROUTE-PURGE-SOURCE-1` | Debugger-Analyzer — Orko Debugulator, UUID `d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`, v1.0.0, source `assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/versions/v1.0.0/prompt.json`; previously read in full and used for source/generated triage. Pair with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, full source previously inspected. Fit: classify divergent implementation files and identify safe integration boundaries. | Dirty source, scripts, tools, package metadata, and related docs in `/tmp/style-route-purge-prototype-20261027`; compare exact working bytes to main and `/tmp/style-swarm-20261027-control`. | None; read-only. | Report every unique source/code path, byte/status comparison, feature grouping, generated/runtime dependencies, and commit/deploy recommendation. Do not infer that a path is disposable from age or overlap. |
| `LEGACY-EVIDENCE-2` | Ordinary evidence/workspace curator fallback. Persona selector returned `no_suitable_persona`; no catalog persona is adopted. Pair with ready `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, whose source was previously inspected. Fit: determine which legacy performance and browser evidence is still uniquely cited and what precise minimum artifacts are necessary to preserve it. | Performance trace/results trees under `/tmp/style-route-purge-prototype-20261027`; `/tmp/target-matrix-classifier-rebase-5`; references in `docs/mobile-desktop-styling-plan-2026-10-25.md` and `docs/styling-workstreams/2026-10-28-gap-workstream-orchestration.md`. | None; read-only. | Inventory unique bytes/artifacts, map each to existing committed summaries or open acceptance criteria, and recommend exact retain/remove paths with rationale. No deletion recommendation based only on directory age. |

### Integration gate

- The workspace audit found `/tmp/style-route-purge-prototype-20261027` is a distinct 4.0 GiB Git clone with 840 changed/untracked paths and nine deleted paths; 306 current files match main byte-for-byte, 39 source files differ from main, and 34 docs plus performance artifact trees are absent from main. Keep it retained through review; do not remove its `.git`, `dist`, source, or evidence payload as a unit.
- `/tmp/target-matrix-classifier-rebase-5` is a 3.9 GiB non-Git snapshot referenced by the open target-matrix audit. Keep it retained until the acceptance gaps and evidence references are closed.
- Independent reviewers must return the exact candidate paths and proven byte/state overlaps. The coordinator then integrates only accepted source changes, preserves required evidence, and removes only exact now-redundant paths. Final lifecycle preflight and disk audit follow closeout.

### Independent reviewer results

- `ROUTE-PURGE-SOURCE-1` confirmed 31 source/code paths are already preserved in the retained control checkout, 11 match main, and 12 differ from both. The 12 include `package.json`, `scripts/qa-viewports.mjs`, glossary/Home/Free Intro CSS pairs, `hyphen-weekend.css`, the asset manifest, `src/report-card.html`, and untracked `tools/purge-audience-route-css.mjs`. No release is approved: the viewport script proxies the real availability endpoint; the Free Intro/Home style changes include contrast states; `report-card.html` is shelved pending the owner keyboard SOP; and the purge tool mutates generated `dist` without a reproducible source pipeline. All generated routes need a clean mapping. No source edits were copied.
- Direct comparison of `hyphen-weekend.css` also shows the old snapshot would remove two current-main improvements: the 14px mobile readability rules and the visible skip link. Keep main's version.
- `LEGACY-EVIDENCE-2` found no exact evidence files safe to delete now. Keep the separate `perf-before*`, `perf-after*`, and interleaved runs because the styling plan cites each run's summaries, traces, screenshots, and caveats. In target-matrix evidence, 308 screenshots (about 203 MiB) are byte-identical across two runs, but both `summary.json` files refer to their own copies; preserve until the newer acceptance audit is run and summaries are updated. Keep the 3.9 GiB target-matrix snapshot because its 460-sample run predates later fixes and its `.tmb` tree includes release/rollback data requiring separate review.
- No retained workspace was deleted. The 4.0 GiB clone and 3.9 GiB target-matrix snapshot remain explicitly owned and have 2026-11-05 review dates. The evidence worker confirmed no active processes in either path.
- End-of-session lifecycle audit passed: glossary build worktree and Git registration are absent; only main plus the separately retained control checkout remain registered. `npm run qa:workspace:preflight` passed, the full 1 GiB+ workspace scan completed read-only, and disk headroom is 92.2 GiB. Main has 895 changed/untracked entries when counted with `--untracked-files=all`; no application paths were edited, staged, committed, or deployed in this session.

## Birthday Parties sticky action-bar release — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; already adopted for this active goal.
- **Workstream role:** `persona_quick.py --plan` returned `no_suitable_persona`. Catalog search did not locate a ready source-backed route-level frontend/accessibility specialist; use the ordinary frontend/accessibility implementation fallback. Pair with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, whose full source was previously inspected for this goal. No attachments. Fit: preserve the existing page, make the smallest route-scoped interaction change, and verify generated outputs and browser behavior. Apply the previously approved `design-taste-frontend` audit-first/preserve-the-existing-system method; do not expand into a redesign.
- **Independent release-map review:** ordinary static-site release-ownership fallback paired with `Instructions - COMPETENCE`; its full findings are in this plan and identify the exact source pair, expected payload, dirty-output hazard, and browser acceptance criteria.

### Bounded implementation contract — `BIRTHDAY-STICKY-RELEASE-20261031`

- **Write paths:** only `src/birthday-parties.html` and `src/assets/css/pages/birthday-parties.css`, in the isolated build worktree. Copy these two reviewed dirty source files exactly from main; do not copy or rebuild main `dist`.
- **Scope:** retain the existing birthday inquiry form and copy. Hide the page's sticky action bar only while it overlaps a visible main control; keep the global mobile action bar suppressed on phone widths; retain the page's 48px mobile buttons and page-scoped visible focus styling. Do not alter prices, booking endpoints, schedule facts, global CSS, keyboard behavior, or other routes.
- **Definition of done:** clean build; focused Browser Use checks at 390px, 768px, and 1440px for route load, no overflow/errors, CTA visibility, local/global bar behavior, overlap hide/reappear on scroll and resize, link destinations, and form fields; no form submission. Inspect generated route, canonical stylesheet, active fingerprint, and sitemap diffs. Run the exact release dry run and stop on unexpected paths or unrelated output changes. Commit only reviewed source/generated paths, deploy the exact approved payload, then verify live HTTP/content and rendered behavior separately.
- **Exclusions:** owner-run physical keyboard SOP, Lighthouse/PageSpeed, site-wide contrast compliance, Student Hub weekly/YAM data, and external form side effects.
- **Rollback:** use the deployment tool's verified predeploy backup or redeploy the parent commit's Birthday Parties route and stylesheet.
- **Cascade finding:** committed shared CSS suppresses `.birthday-mobile-sticky` whenever the shared `.ss-mobile-actionbar` exists. The route candidate also suppresses the shared bar; the isolated implementation must explicitly restore this page's own bar within the phone breakpoint. Keep any required `!important` limited to that route-specific override and confirm computed display in the browser.

### Release evidence — 2026-10-31

- **Commit:** `a60a3df` (`Improve Birthday Parties mobile action bar`), containing `src/birthday-parties.html`, `src/assets/css/pages/birthday-parties.css`, and a route-specific mapping in `scripts/deploy-release.py`. The unrelated `.ss-consent-label` source hunk remains unstaged in the main checkout.
- **Build and local browser:** isolated `npm run build` passed. Browser Use at 390px, 768px, and 1440px found no horizontal overflow and kept the primary CTA visible. At 390px, the Birthday bar displayed while clear, hid over a visible date control, and reappeared after scrolling clear; the generic bar stayed hidden. At tablet and desktop widths, both mobile bars were hidden. The inquiry form had 10 labels and 8 inputs; it was not submitted. Phone screenshot reviewed. No Lighthouse/PageSpeed or physical-keyboard check was run.
- **Generated mapping:** the dirty root build changed unrelated outputs and asset-manifest rows, so none were included. The deploy mapper now recognizes the route-owned Birthday stylesheet fingerprint. `scripts/deploy-release.py --dry-run --commit a60a3df --only birthday-parties.html --only assets/css/pages/birthday-parties.0e2430.css` selected exactly those two files.
- **Deploy and live read:** verified-backup deployment exited 0. The route uploaded at 56,760 bytes and CSS at 15,090 bytes. Live `/birthday-parties` and the fingerprinted stylesheet both returned HTTP 200. The live route contains the overlap behavior and CSS reference; the CSS matched the local build SHA-256 `d06e1de3570ae7ee9ac2639b70e61675b23bd6d2b8c13fc83b33a4627b2ca1f3` byte for byte. Deployment backup rotation removed one older verified archive (`1,130,740,643` bytes).
- **Closeout:** preview server and Browser Use Chrome were stopped. Remove the exact isolated worktree/profile after confirming its Git registration and that no associated process remains. The broader dirty-worktree goal remains open; other source and generated changes are still unclassified or unverified.

## Kids/Teens CSS release qualification — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; already adopted for the active goal. Master instructions remain `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`.
- **Source reviewer:** selector returned `no_suitable_persona` for accessibility/frontend. Use an ordinary frontend/accessibility source reviewer fallback paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`; its full source was previously inspected for this goal. No attachments. Fit: check exact selectors, owning page markup, mobile layout behavior, and route-specific focus/type adjustments. Write scope: none.
- **Release mapper:** selector candidate Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, was rejected: the available prompt describes a Markdown blog generator and does not provide a suitable route-output mapping method. Use an ordinary static-site release mapper fallback paired with the same fully inspected `Instructions - CODE`; no persona adoption claimed. Fit: trace builder inputs, route outputs, fingerprints, manifest coupling, and exact deploy paths. Write scope: none.

### Read-only contracts

| DoD | Workstream | Read scope | Write scope | Completion evidence |
| --- | --- | --- | --- | --- |
| `KIDS-TEENS-SOURCE-AUDIT-20261031` | Kids/Teens surface review | `src/assets/css/pages/kids.css`, `src/assets/css/pages/teens.css`, corresponding page markup, current user-reserved acceptance exclusions | None | Map every changed selector to actual markup; distinguish confirmed visual defects from owner-reserved contrast/keyboard checks; identify any malformed or conflicting CSS. |
| `KIDS-TEENS-RELEASE-MAP-20261031` | Generated-output and deploy mapping | Audience CSS builders, `src/assets/data/asset-hash-manifest.json`, generated route references, `scripts/deploy-release.py` | None | Identify all clean-build prerequisites and exact route/fingerprint payload; reject broad or stale dirty `dist` outputs. |

The reports must be reconciled before any Kids/Teens source integration, isolated build, commit, or deployment. Do not run Lighthouse/PageSpeed or the physical-keyboard SOP; site-wide contrast remains owner-run.


### Audit results and bounded build contract

- `KIDS-TEENS-SOURCE-AUDIT-20261031` confirmed all changed selectors map to active Kids/Teens page markup. The two routes add a one-column hero through 920px, raise reassurance copy from 0.85rem to 0.875rem, increase selected supporting labels/chips to about 14px, strengthen hero focus indicators, and darken secondary-button/chip borders. The stronger Kids hero focus selector supersedes its earlier primary-button outline only within the hero. Rendered layout, type, contrast, and visible focus remain unverified; site-wide contrast and physical-keyboard checks remain owner-run.
- `KIDS-TEENS-RELEASE-MAP-20261031` found route-specific builders can emit an exact paired release. The dirty root routes have broad content deltas (Kids +279/-33 lines; Teens +276/-30), and the dirty asset manifest contains many unrelated mappings, so neither root `dist` nor the dirty manifest is a release source.
- **Implementation fallback:** ordinary frontend/CSS release specialist paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`; the complete instruction source was previously inspected for this goal. The selector found no suitable ready page-accessibility persona. The weak Markdown blog-generator persona is rejected. Apply the approved audit-first existing-system method; no new dependencies, content changes, or shared layout edits.
- **`KIDS-TEENS-CLEAN-BUILD-20261031` write boundary:** the two reviewed CSS source diffs, `tools/build-kids-styles.mjs`, `tools/build-audience-styles.mjs`, and only their `package.json` build-script insertion in an isolated clean worktree at `a60a3df`, plus generated output inside that worktree. Do not copy dirty route output or the dirty manifest. Build from a clean dist and copy only the two CSS patches. Use a shared `node_modules` symlink; keep browser profile/captures inside the inventoried workstream path.
- **Expected deploy payload, conditional on clean build and exact dry run:** `bjj-classes/kids-tannersville-ny/index.html`, one `assets/css/pages/kids-delivery.<12-hex>.css`, `bjj-classes/teens-tannersville-ny/index.html`, one `assets/css/pages/teens-delivery.<12-hex>.css`, and one `assets/css/routes/site-teens-delivery.<12-hex>.css`. Exclude Adults, manifest, sitemaps, and other generated output unless the build/dry-run proves a dependency and it is separately reviewed.
- **DoD:** clean build; 390/768/1440px Browser Use review for overflow, route load, visible primary action, intended hero stacking, and one-column mobile rendering; verify relevant form/CTA labels remain present; inspect exact active route stylesheet links; run the deploy mapper with `--only` for the five verified paths. Commit/deploy only if all gates pass and the mapper emits exactly those outputs. Do not run Lighthouse/PageSpeed, site-wide contrast, physical-keyboard SOP, or submit forms.


### Clean-build dependency correction

The first clean build at `a60a3df` completed but still emitted the old Kids and Teens stylesheet links because the committed `package.json` build does not invoke the two route-owned delivery builders. Those builders and only their build-script insertion are dirty/untracked in main; other package script edits are unrelated. Reconcile the builders by source review and test them in the isolated worktree before considering any release. The isolated build boundary is now updated; the current root `dist` remains excluded.

### Kids/Teens release outcome — 2026-10-31

- Commit `2778c72` (`Deliver Kids and Teens route styles`) contains only `package.json`, the Kids and Teens CSS sources, and their two route-owned build scripts. The focused commit is now the `main` HEAD; the existing unrelated worktree changes were preserved.
- `npm run build` completed in `/tmp/kids-teens-clean-build-20261031`. Browser Use at 390, 768, and 1440 CSS pixels found no horizontal overflow on either route, confirmed active fingerprinted CSS links, and found the primary Free Intro actions visible near the top.
- The built Kids and Teens main content matched the current live page text exactly. The deploy dry run selected exactly the two route HTML files and three fingerprinted CSS files; the deploy completed successfully.
- Live routes and all three CSS files returned HTTP 200. Each live CSS SHA-256 matched the isolated build artifact. The deploy tool removed one older verified backup under its rotation policy (1,130,793,125 bytes).
- Lighthouse/PageSpeed, physical-keyboard acceptance, and site-wide contrast checks remain owner-run. No forms were submitted. The dirty root `dist` was not used or overwritten.

## Adults program CSS source audit — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; already adopted for the active goal. Master instructions: `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, full source previously inspected.
- **Worker:** Adults Program Route CSS Auditor, an ordinary frontend/CSS specialist fallback. `persona_quick.py` returned `no_suitable_persona`. `auto_persona.py --plan --brief` returned no worker persona. The lexical candidate Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, was rejected because its catalog source `assets/indranet-prompt-exporter/exports/index.json` describes a Markdown/blog generator and does not establish fit for route CSS auditing. No attachments.
- **Instructions:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, readiness `ready`; source `assets/indranet-prompt-exporter/exports/index.json`. Its complete source was previously inspected for the active goal. Apply code review, dependency tracing, and precise route output mapping.
- **Skill:** repository `.agents/skills/design-taste-frontend/SKILL.md`; apply its redesign-preserve audit-first method: map existing brand and patterns, preserve information architecture/copy/analytics, and favor a targeted evolution. Do not apply its generic redesign checklist or run owner-reserved site-wide contrast checks.

### Read-only workstream contract — `ADULTS-CSS-SOURCE-AUDIT-20261031`

| DoD | Read scope | Write scope | Tools | Verification |
| --- | --- | --- | --- | --- |
| `ADULTS-CSS-SOURCE` | `src/assets/css/pages/adults.css`, `src/bjj-classes/adults-tannersville-ny/index.html`, audience CSS builder, `scripts/deploy-release.py`, and scoped release notes | None | Local code search/read and Git diff only | Match each changed selector to active markup; distinguish route CSS from shared CSS; report CSS/build prerequisites, exact candidate output paths, and risks or no-go. No build, tests, browser, network, edits, commit, or deploy. |

The graph service returned `Transport closed`; discovery falls back to scoped local reads. Existing dirty work remains untouched pending coordinator review.

### Source-audit results — `ADULTS-CSS-SOURCE-AUDIT-20261031`

- The only task-specific source change is the dirty `src/assets/css/pages/adults.css`; the route HTML itself is clean and loads the audience stylesheet. Each changed rule maps to the active Adult conversion partial: hero stack ≤920px, eyebrow/section kicker, hero chips, guarantee kicker, reassurance copy, outlined Text Sandy link, and route `.btn:focus-visible` ring.
- The focus selector reaches all anchor `.btn` controls on the Adults page, including below-hero actions; its comment says “program hero actions,” so that scope/comment mismatch should be resolved before release. No markup edits are needed.
- The clean build runs the audience builder after Eleventy, SSI materialization, and asset fingerprinting. It emits an Adults page bundle and route bundle; `scripts/deploy-release.py` filters Adults when `--only` names its route. Candidate payload is the Adults route HTML plus the two active fingerprinted CSS files.
- **Current release state: no-go pending a clean isolated build, route-content comparison, exact three-path dry run, and local responsive Browser Use review.** Do not use or overwrite main `dist`. Lighthouse/PageSpeed, site-wide contrast, physical-keyboard acceptance, and form submission remain excluded.


## Adults program route CSS release — 2026-10-31

- **Persona and instructions:** The contextual persona selector returned `no_suitable_persona`; an ordinary static-site CSS release specialist fallback was used. `Instructions - CODE` was selected (UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, ready). The Browser Use skill (0.1.13) guided isolated local browser setup and visual checks.
- **Commit:** `a9e52a15780b2737c965f30759f241fc6445a2c0` (`Style Adults program route`), integrated on `main`. The commit contains only `src/assets/css/pages/adults.css`, the generated Adults route, and its two fingerprinted CSS assets. The broad regenerated manifest and unrelated `dist` outputs were excluded.
- **Build and local browser:** `npm run build` passed in an isolated worktree at parent `2778c723` with only the reviewed Adults CSS change applied. Browser Use checks at 390, 768, and 1440px showed no horizontal overflow; the two active Adults stylesheets loaded, the Free First Visit action was visible, and the hero stacked at 390/768px and used two columns at 1440px. Screenshots were inspected and kept only in the temporary workspace.
- **Content and release mapping:** The generated route's `<main>` visible text and tag/attribute stream matched the live route. The exact dry run selected three files: `bjj-classes/adults-tannersville-ny/index.html`, `assets/css/pages/adults-delivery.b64270844d52.css`, and `assets/css/routes/site-adults-delivery.d027512ba43b.css`.
- **Backup and deploy:** Read-only backup QA found one verified backup, zero invalid backups, and zero removal candidates. Deployment exited 0 using `--reuse-existing-backup`. Live route and both CSS assets returned HTTP 200. Live CSS SHA-256 values matched the clean build: `b64270844d52e5ba438909a61f51c1003e007897d35dc738ee564d5411209022` and `d027512ba43b0cb6be02562bb6889b833780b1346fafb808e9b0e4daa088e7b9`.
- **Dirty-tree preservation and limits:** The main checkout's pre-existing dirty Adults route was not replaced; its SHA-256 remains `3688c962c114292a9415f5efc9a84d7a6cad939e322b6bc2fb31c8b2ee81b10c`. The committed clean route has SHA-256 `39467a4666983addebc12afae2000ce8ab960b35ee51b638128d46dc17a4512f`. No Lighthouse/PageSpeed, site-wide contrast audit, physical-keyboard acceptance, or form submission was performed. Rollback is available from the verified account backup or by restoring the prior route/CSS from parent `2778c723`.

## Near-town CSS release qualification — 2026-10-31

### Persona & Expert Framework

- **Coordinator:** Reuse the active-goal coordinator, AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; Master instructions `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, previously source-inspected for this goal.
- **Source-audit candidate:** `Static Site Generator (Markdown to HTML, Blog, Docs, etc.)`, UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, selector source `assets/indranet-prompt-exporter/exports/index.json`; rejected as a poor fit because its prompt describes Markdown blog generation rather than CSS selector or route-scope review.
- **Worker fallback and instructions:** ordinary CSS/static-release auditor paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`, readiness `ready`. The generic code instructions were already source-inspected for this goal. Codegraph MCP returned `Transport closed`; scoped source reads were used.

### Bounded workstreams

| DoD | Read scope | Write scope | Verification |
| --- | --- | --- | --- |
| `NEAR-CSS-SOURCE-AUDIT-20261031` | `src/assets/css/pages/near.css`, six `src/near/*` pages, `src/nearby-towns.html`, `src/bjj-classes/index.html`, relevant layouts | None | Map changed selectors to body classes, imported stylesheet, and rendered route. |
| `NEAR-CSS-RELEASE-MAP-20261031` | Asset manifest, clean build outputs, `scripts/deploy-release.py`, live route HTML and CSS URLs | None | Prove exact source-to-output payload and compare public routes with candidate output before any commit/deploy. |

### Findings and release decision

- The dirty `near.css` change adds green default links and slate hover/focus colors within `.near-section` on six `/near/{town}-ny/` routes, changes breadcrumb type from `0.85rem` to `0.875rem`, and wraps long `.he-eyebrow` labels below `576px` on `/nearby-towns/`. The source audit verified the route-scoped selectors. The original eyebrow selector also named the classes hub, but that route does not load `near.css`; its eyebrow already computed to `normal` at 390px. The isolated candidate narrowed that selector to `body.page-near .he-eyebrow` for the build and visual check only.
- A clean isolated `npm run build` completed. Browser Use on the isolated build showed no horizontal overflow on Hunter and Nearby Towns at 390px, 768px, and 1440px. At 390px, the near link color computed to `rgb(17, 106, 66)`, breadcrumbs to `14px`, and the Nearby Towns eyebrow to `normal`. The classes hub also had no horizontal overflow at 390px, without loading `near.css`. No forms were submitted and no Lighthouse/PageSpeed checks were run.
- Release is **no-go** because public pages do not match repository-generated route outputs. Live `/near/` pages returned HTTP 200 and ranged from 88,258 to 93,110 bytes; the sampled live stylesheet links included `/assets/css/routes/site-18ac9c2704ce.min.css` and `mobile-foundation.114422.css`, but no `near.css`. The public `/nearby-towns/` page returned HTTP 200, 97,390 bytes, and still references `/assets/css/pages/near.0668cf.css`. Committed generated `/near/` routes are about 21-24 KB, while the clean source build emits 31-34 KB. Deploying those outputs would replace materially different live pages and alter shared stylesheet references beyond this CSS change.
- No source or generated file was copied into the main checkout, staged, committed, or deployed. Main dirty `dist` was not overwritten. The isolated worktree peaked at about 1.6 GiB and was removed after checks; the 6.6 MiB Browser Use profile and local preview server were also closed and removed. Reconcile the public route source/output mapping before reconsidering this CSS release.

## Verified duplicate artifact cleanup — 2026-10-31

- Removed 15 untracked files totaling 370,592 bytes only after independently confirming each file was still untracked and its Git blob matched a committed blob in `246be6a1e4f36f7c8a109920ff502bab3225a0d3` (`Fix keyboard access across shared routes`). Fourteen were same-path keyboard evidence/brief copies; `scratch/bjj-butterfly-guard-draft.html` matched the committed `src/bjj-butterfly-guard.html` blob.
- Preserved the other untracked scratch files and all remaining styling evidence. They have no committed byte-identical equivalent; same-content screenshots were kept because their names may record separate acceptance contexts.
