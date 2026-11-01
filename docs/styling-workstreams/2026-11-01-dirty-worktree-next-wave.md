# Dirty worktree continuation — next-wave audit plan — 2026-11-01

## Objective

Continue the active goal to reconcile the dirty working tree, commit reviewed requirements, and deploy exact verified outputs. The glossary CSS wave is complete in `b7db4990`; this plan covers the remaining unreviewed changes without redefining the goal around that release. Preserve the dirty generated `dist/` and user-owned/unrelated files. Keyboard acceptance, site-wide contrast, and Lighthouse/PageSpeed remain owner-reserved.

## Coordinator and expert framework

- **Coordinator role:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`, carried forward from the active goal plan. This role owns scope, dependencies, reconciliation, and release decision.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, readiness `ready`; full source was inspected in the active goal plan. Apply bounded workstreams, evidence-based decisions, and explicit closeout.
- **Code graph:** codebase-memory MCP again returned `Transport closed`; code discovery uses scoped Git/docs inspection as fallback. No graph-backed discovery is claimed.
- **Workspace preflight:** `tools/workspace-audit.py --preflight` passed before dispatch. Read-only reviews use the shared checkout and create no temporary environment.

## Workstream contracts

| DoD | Specialist and source | Read scope | Write scope | Verification and stop condition |
| --- | --- | --- | --- | --- |
| `DIRTY-SOURCE-COHORT-20261101` | Web-Ninja — Arachnia, UUID `94fbf051-34eb-413f-b8c6-824430c3529a`; complete prompt reviewed from the Indranet catalog export (`index.json`), no attachments. Fit: web development and UX; limitation: no Eleventy-specific expertise. Paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, readiness `ready`, full source previously reviewed for this goal. | Current dirty source paths, goal-related styling ledgers/fixes, recent release plans | None | Identify concrete remaining user-approved requirements and source cohorts; report exact paths, relevant evidence and blockers. Do not infer approval from a dirty diff. Stop if no evidence maps a source change to an open requirement. |
| `DIRTY-OUTPUT-MAP-20261101` | Debugger-Analyzer — Orko the Debugulator, UUID `3600aeb4-dd29-46dc-89b4-433b302b206f`; full 2,044-character prompt reviewed in `assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/prompt.json`, no attachments. Fit: code review, build/deployment analysis, and software QA. Paired with the same ready `Instructions - CODE` source above. | Deployment mapper, current manifest/source changes, tracked `dist` diffs, latest route/output reports | None | Find exact source→generated output candidates and classify each as releasable, stale, ambiguous, or unrelated. Recommend a dry-run scope only if current evidence supports it; never use or repair root `dist`. |
| `DIRTY-WORKSPACE-LIFECYCLE-20261101` | Ordinary specialist fallback: Local Workspace Lifecycle Auditor. Persona selector returned `no_suitable_persona`; digital forensics/project-management candidates were not suitable for local Git worktree ownership and deletion decisions. Paired with `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, full source previously reviewed for this goal. | `git worktree list`, active inventory, stale-checkout/cleanup reports, exact `/tmp` candidates and sizes | None | Report exact owner/status/size and whether each path is redundant, active, or ambiguous. No deletions during this audit; cleanup requires exact path and evidence of same-session task ownership or redundancy. |

### Shared constraints

- Workers are read-only; no overlapping write paths or temporary checkouts.
- Never use `git add -A`, reset, broad cleanup, broad build, or broad deployment.
- A candidate release must be tied to an open requirement, have fresh isolated output evidence, pass an exact deploy dry-run, and receive independent coordinator review before commit/deploy.
- If a relevant gate fails or live/source content conflicts, stop that candidate and preserve the local work.

## Completion gate

The coordinator will review all three reports, choose the next scoped work item, preserve unresolved work, and record the exact commit/deploy/live-verification evidence. The overall goal remains active until all required user-approved work has been reconciled and the current repository/live state is verified.

## Reconciled audit results — 2026-11-01

- `DIRTY-SOURCE-COHORT-20261101`: no general new source cohort was supported. The Student Hub referral helper was already committed in `d61471b4`; current source and generated hashes match, and both the live route and asset return HTTP 200. Keep `choke` and `open-mat` excluded pending content reconciliation. See [2026-11-01 glossary release plan](2026-11-01-glossary-css-release-plan.md).
- `DIRTY-OUTPUT-MAP-20261101`: the `footer-partner.html` diff only moves an existing 44px rule earlier in the source; it does not change the rule itself. Do not treat that move alone as a required styling fix. Schedule and pricing diffs that add untracked destinations remain excluded. Root `dist` is not release evidence.
- `DIRTY-WORKSPACE-LIFECYCLE-20261101`: no checkout or backup path is proven safe to remove. The 15 candidates from the large-checkout audit total 24,234,319,872 bytes; the two additional `style-swarm-20261026-hub` and `-controls` checkouts add about 2,100,482,048 bytes. They contain distinct dirty files or artifacts. Preserve pending ownership and source reconciliation; the task-owned glossary release checkout was separately closed after evidence capture.

## Bounded follow-up: glossary hub duplicate width rule

### Expert framework

- The selector again ranked `Static Site Generator (Markdown to HTML, Blog, Docs, etc.)` (UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`); its complete prompt had already been reviewed and does not fit an existing-site CSS cascade audit. `MainFrame` (UUID `233ea43c-361c-4207-bced-f7764860358e`) is a wireframe role and also does not fit. UI/UX catalog candidates had missing prompt exports or unavailable required attachments. Use the disclosed ordinary specialist fallback **Glossary Hub CSS Cascade and Hit-Area Reviewer**; no persona adoption is claimed.
- Pair with ready `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, whose full source was reviewed earlier in this goal. Apply the approved Impeccable audit-first and design-taste preserve-existing methods. The surface reads as an existing beginner glossary index in the site's calm Catskills Studio system; do not redesign or run owner-reserved keyboard, contrast, or Lighthouse/PageSpeed checks.
- The targeted change is one removed `min-width: 44px` declaration in `src/assets/css/pages/glossary.css`. The shared stylesheet already declares `min-width: 44px` for `.day-one-chip`, so the page rule is redundant.

### Current evidence

- Production `/bjj-glossary/` returned HTTP 200 (539,638 bytes). Its inline CSS SHA-256 is `dbaccfb3f80078e2c6884a020c47e4c600c0389ed31ef16572da1d70b8c10993`, matching the isolated candidate recorded in `2026-10-31-glossary-output-reconciliation.md`.
- The production inline CSS retains the shared `.day-one-chip` rule with both `min-width: 44px` and `min-height: 44px`; the page-local duplicate is not required for the rendered target size.
- The earlier isolated preview measured all eight day-one chips at 62×44px on 320px and 390px viewports. The earlier hub release qualification measured 56 hub controls at least 44px at 320px, 390px, and 1440px with no horizontal overflow. These records predate this live hash recheck and are not presented as a new browser run.
- Because the generated hub CSS already matches live and the root generated tree is dirty, this source-only reconciliation does not authorize an upload from root `dist`. Commit the single source declaration removal only after the independent specialist review; do not deploy a regenerated hub route in this workstream.

| DoD | Owner lens | Read scope | Write scope | Completion evidence |
| --- | --- | --- | --- | --- |
| `GLOSSARY-HUB-WIDTH-RECONCILIATION-20261101` | Glossary Hub CSS Cascade and Hit-Area Reviewer; ordinary specialist fallback paired with `Instructions - CODE` | The one-line page CSS diff, shared `.day-one-chip` rule, prior isolated output/hit-area report, current live inline-CSS hash | None | Independently confirm the cascade, target-size implication, unchanged generated/live output, and whether source-only commit is safe. Stop if the shared minimum is missing or the expected hash differs. |

### Review and disposition

- The independent review confirmed the shared `.day-one-chip` rule still supplies both 44px minimum dimensions; the category and alphabet controls retain shared 44px minimums. It accepted a one-file source-only commit.
- Commit `cec988d2` (`Remove duplicate glossary chip width rule`) contains only the redundant page-local declaration removal in `src/assets/css/pages/glossary.css`.
- No deployment was needed: current live hub returned HTTP 200 and its inline CSS hash `dbaccfb3f80078e2c6884a020c47e4c600c0389ed31ef16572da1d70b8c10993` matches the isolated candidate. No upload was made from root `dist`.
- The previously named Student Hub referral helper is already tracked in `d61471b4`; live page and asset are HTTP 200, so it is closed with no new code commit.
- Footer partner rule movement was not released: it relocates the existing 44px rule without changing its behavior.
- Workspace forensics found no safe-to-delete candidate. Seventeen exact paths totalling about 24.5 GiB remain preserved and need per-path ownership/source reconciliation. See the updated workspace inventory and `2026-11-01-large-checkout-cleanup-audit.md`.

The only identical `dist/` pair found is the 128-file hub/controls pair. Both copies are tracked in their separate Git repositories, and neither is production-verified, so both remain preserved. The old workspaces also use dependency symlinks to the main checkout or `/tmp/style-active`; no standalone `.venv` or `venv` was found in the candidate list.

## Next read-only reconciliation wave

Workspace preflight passed again before dispatch. These reviews create no checkout or build and share no write paths.

| DoD | Specialist and source | Read scope | Write scope | Verification |
| --- | --- | --- | --- | --- |
| `DIRTY-SOURCE-PATH-MATRIX-20261101` | Web-Ninja — Arachnia, UUID `94fbf051-34eb-413f-b8c6-824430c3529a`, with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`; sources and fit are recorded above | Every remaining modified/untracked `src/` and `scripts/`/`tools/` path; current goal and release plans | None | Classify each exact path as complete, owner-reserved, relevant but unverified, unrelated, or missing a requirement; cite the source plan and identify any smallest evidence-backed next fix. |
| `DIRTY-GENERATED-PATH-MATRIX-20261101` | Debugger-Analyzer — Orko the Debugulator, UUID `3600aeb4-dd29-46dc-89b4-433b302b206f`, with the same ready `Instructions - CODE`; full prompt source and fit recorded above | Every remaining tracked `dist/` change/deletion, active manifest and changed-output mapper, associated source paths and release evidence | None | Classify generated paths by exact source/route mapping, stale or missing fingerprint, source ownership, and current release status. Do not use or modify root `dist`; report whether any exact route can be separately produced in a future isolated build. |

Both reviews are read-only, use the shared checkout, and do not access owner-reserved keyboard, site-wide contrast, or Lighthouse/PageSpeed work.

## Reconciled path matrices and lifecycle gate — 2026-11-01

### Source and generated-output dispositions

- `DIRTY-SOURCE-PATH-MATRIX-20261101` found no dirty website source path cleared for release. `src/partials/nav-include.html` and `src/hyphen-weekend.html` remain owner-reserved for the keyboard SOP. Contrast and Lighthouse runners remain owner-reserved. The broad responsive/availability proxy QA change is not in a release scope. Product/content work (`src/after-booking-promise.html`, `src/options-pricing.njk`, `src/schedule.html`, and the untracked video-session/calculator/welcome pages) remains separate from the styling goal. Other dirty CSS, form, and route edits lack requirement-to-output proof; keep them local.
- `DIRTY-GENERATED-PATH-MATRIX-20261101` classified all 113 changed generated paths: 102 HTML/XML and 11 CSS/JS. No root `dist/` route is a release candidate because output freshness and active shared fingerprint references are not proven. The `mobile-foundation.d8c863.css` references are an alternate dirty build, and the deleted fingerprinted files lack live-reference evidence. The Near pages, source-record consumers, shared CSS fan-out, and Free Intro template mapping still need exact route mapping.
- The Kids/Teens schedule-link requirement is closed: commits `95c48890` and `fecdcb25` place the `Kids` and `Teens` links immediately after the time, and a live read of `/schedule/` returned six links to each audience route. The current dirty `src/schedule.html` hunk only adds separate video-session and calculator links. The schedule output visible in the dirty root tree is not release evidence.
- `scripts/deploy-release.py` had no current mapper change that safely resolves the remaining output gaps. F-01/F-02/F-03 reduced-motion fixes were already released in `e8659414`; they are not reopened by this audit.

### Workspace audit correction and current disposition

- The first audit invocation used the historical `2026-10-29-responsive-workstream-inventory.md`; the active inventory is `WORKSPACE-CLEANUP.md`. `tools/workspace-audit.py` also missed lifecycle cells beginning `active;` or `Preserve;`, and inspected only one nested level.
- The audit now reads lifecycle status prefixes, checks every temporary path in a table row, recognizes retained review dates, and scans nested temp environments without following symlinks. `package.json` and this guide point to the active inventory.
- The planned Schedule focus worktree was never created after keyboard behavior was shelved. The BJJ Stretches isolated build was closed after its recorded release. Both inventory rows now reflect their absent paths. The 2026-10-27 controls checkout remains retained because 51 differing files still need reconciliation.
- Current `WORKSPACE-CLEANUP.md` preflight passes. Seventeen large paths totaling about 26.33 GB remain retained; the hub and controls `dist` trees are identical but tracked in both separate repositories. No path is proven disposable, so none was deleted. The full audit is heuristic and does not infer ownership from age or hashes.
- Browser Use 0.1.13 is installed, but `browser-use --doctor` found no daemon or active connection. The live schedule check used a direct public-page fetch; no interactive browser was needed.

### Documentation, assets, and evidence review — 2026-11-01

- `DOCS-EVIDENCE-PATH-MATRIX-20261101` used the ordinary Documentation and Evidence Curator fallback because the selector returned no suitable ready persona; paired with ready `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`. The read-only review covered 529 paths before the browser-guide commit: 4 modified docs, 514 untracked docs, 9 photos, and 2 scratch files. No file was edited or deleted by the reviewer.
- The 251 styling-workstream files and 235 WS29 files are reports and run-scoped evidence; keyboard, contrast, and PageSpeed results remain owner-reserved. The ads/VSL docs, sales/bootcamp SOPs, 9 original photos, and 2 unique scratch files are separate work. Preserve them.
- Forty-one exact-hash duplicate groups (83 untracked files) were found among the reviewed docs/assets/scratch paths. Neither copy in those groups is committed; each run folder retains provenance. No untracked file exactly matched a tracked file, so the duplicates are not safe cleanup candidates under the current evidence.
- `docs/BROWSER-VERIFICATION.md` records the approved browser-use workflow and was committed separately as `0a728a7`; the remaining three modified docs stay local, including the owner keyboard SOP and the timestamp-only WS29 run report.
- The root `--help/` directory is separate from that 529-path review: it has 140 untracked viewport PNGs totaling 190,095,477 bytes, dated 2026-10-27. None has an exact hash match among tracked files. Preserve the unique images; their provenance is not established well enough to delete them.
- After commits `b87461c` and `0a728a7`, the current worktree has 852 dirty paths and no staged changes. `df -h` reports 91 GiB available. No temporary checkout or backup was deleted because none is proven redundant or already represented by committed evidence.

## Current-state continuation — 2026-11-02

- Workspace preflight passed. Current HEAD is `71f1278e`; no staged changes were present at inspection. A fresh status count found 52 dirty `src/` paths, 113 dirty generated paths, 4 modified docs, 7 script/tool paths, and 3 other tracked paths (179 total; this count excludes untracked files).
- Codebase-memory MCP `list_projects` again failed with `Transport closed`. Repository code discovery used the prior exact path matrices, targeted `git status`, and scoped diffs; no graph-backed mapping is claimed.
- Persona routing was rerun for the continuation. The selected `Ideaspace Connectome Explorer - ICE` (UUID `2e037526-b114-4238-94e9-f992135658bd`) was an ambiguous, poor fit for Git release reconciliation; no persona adoption is claimed. Use the existing coordinator and ordinary static-site release specialist lens recorded above. The current `Instructions - COMPETENCE` asset remains the relevant coordinator guidance, but its full source was reviewed earlier in this goal.
- The Free Intro source cohort has dirty shared templates and CSS, while its two generated route files are among 113 changed outputs and share the unresolved dirty asset fingerprint set. Its proposed source edits do not form a sufficiently evidenced, isolated deliverable in this pass.
- `src/waiver.html` has local `label[for]`/control `id` bindings and consent-label classes, but no open requirement in the styling plan maps to this diff. Existing route-wide control evidence records no missing labels in its sample. Do not commit the change solely because it appears beneficial; keep it in its current dirty state until a requirement or acceptance gap is tied to it.
- Current output matrix remains unchanged: no route or asset has fresh source-to-output and fingerprint evidence that qualifies it for deployment from root `dist/`. No commit or deployment was made. Owner-reserved keyboard acceptance, contrast, and Lighthouse/PageSpeed were not run.

### Isolated source/output map refresh — 2026-11-01

- Registered `/tmp/dirty-source-output-map-20261101-0747/` in the workspace inventory before creating it. It was an isolated archive from current `HEAD` `f6e92c57` with 77 dirty production inputs overlaid; root `dist/` was excluded, and root `node_modules` was reused by symlink.
- `npm run build` passed. The first isolated fingerprint check found 16 stale hashed siblings and a stale manifest. Running `node tools/fingerprint-assets.cjs --clean` only inside the candidate removed 15 stale hashed assets; the follow-up `--check` passed for 159 managed assets.
- Compared with the retained clean `HEAD` baseline, the isolated candidate has 2,211 generated files versus 2,227; 541 paths differ: 459 changed, 33 added, and 49 removed. Full source input hashes and per-output before/after hashes are in [the output map evidence](evidence/2026-11-01/dirty-source-output-map.json).
- The root asset manifest remained unchanged (SHA-256 `cb54ba3017cb9bd4cc5b1861c7448ca8cabd69bd4cad5d860f03d2b730119577`) and root `dist/` was not used or changed by the build. Its read-only fingerprint check still fails with 113 issues: 3 missing targets, 35 HTML rewrites required, 74 stale hashed siblings, and 1 stale manifest.
- The current source-to-requirement review found no dirty cohort ready for release. The schedule Kids/Teens hotlinks are already committed/live; its remaining dirty change is separate video-session/calculator content. The remaining Blog, Free Intro, and waiver changes lack a fresh requirement-to-output release case. No commit or deployment was made from this broad candidate.
- Closed the exact temporary build after preserving the comparison evidence; no process had files open there. Owner-reserved keyboard acceptance, site-wide contrast, and Lighthouse/PageSpeed remain untouched.

### Approved availability QA proxy follow-up — 2026-11-01

#### Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing (`937a02cd-470a-4211-b880-b05bdf8bf585`), carried forward from the active goal plan; `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`) remains the master instruction asset for this unchanged goal.
- **Worker role:** no suitable Indranet persona was returned by `auto_persona.py`. `Static Site Generator` (`10974975-0c53-4e27-bdca-e95e86ccb2e9`, full 896-character prompt) builds personal Markdown blogs; `MainFrame` (`233ea43c-361c-4207-bced-f7764860358e`, full 3,064-character prompt) designs product wireframes. Both are rejected as poor fits. Use the ordinary specialist fallback **Availability Proxy QA Reviewer**.
- **Worker instruction:** `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`), source `assets/indranet-prompt-exporter/exports/index.json`, catalog status `partial`; its complete 1,500-character text was read, SHA-256 `99075cfe1fba1325006241a460605c847c9c35c0be15da863951c11ec26a7ccf`, attachments none. It fits code review, functional testing, QA, and build/deployment verification. Apply focused requirement review, inspect the exact diff, verify the real GET relay, and preserve only metadata diagnostics.

#### Workstream contract

| DoD | Owner lens | Read scope | Write scope | Verification / stop condition |
| --- | --- | --- | --- | --- |
| `QA-AVAILABILITY-PROXY-20261101` | Ordinary Availability Proxy QA Reviewer; one read-only peer review | User approval at implementation ledger lines 224 and 261; `scripts/qa-viewports.mjs`; frontend GET/query contract in `js/first-visit-availability.js`; existing 96-route/460-sample records | Isolated clean-baseline and current-dirty builds/outputs under the registered `/tmp/availability-proxy-viewports-20261101/`; preserve compact reports and metadata-only proxy diagnostics under `docs/styling-workstreams/evidence/2026-11-01/` | Run 460 samples against each build; require successful real availability upstream responses and metadata-only diagnostics. Compare matrix failures between baseline and dirty output before releasing any source cohort. Stop on an upstream failure or when the candidate does not address a mapped requirement. This is local QA tooling and has no public-site deploy payload. |

### Next evidence needed

Reconcile the shared fingerprint manifest and its CSS/JS references in an isolated build from a known source revision, then map each changed generated route to the exact source diff and release requirement. Until that evidence exists, preserve root `dist/` and the remaining dirty source cohorts; do not stage broadly.


### Availability proxy comparison and next focused fix — 2026-11-01

- The clean-HEAD candidate passed 430/460 samples; the fresh build from 77 dirty production inputs passed 445/460. Exact route/screenshot/reason comparison: 17 clean-HEAD failure samples no longer failed, 13 are shared, and two new phone samples fail because `/blog/exactly-what-happens-first-bjj-class-minute-by-minute` requests missing `/assets/images/hero.89f093.webp`. All 457 clean-baseline and 456 dirty-candidate availability requests returned upstream HTTP 200; diagnostics contain request metadata only. Compact evidence: `evidence/2026-11-01/availability-proxy-comparison-2026-11-01.md` and `.json`. The 2.8 GiB temporary QA folder was closed after preserving compact evidence; the main `dist/` was untouched.
- **`HERO-SRCSET-RELEASE-20261101`** uses the ordinary fallback **Static-Site Asset Pipeline Auditor**. The contextual selector returned `no_suitable_persona`; `Instructions - COMPETENCE` ranked as ready but its source is a capability catalog, not a build/debug method. Apply the previously full-source-reviewed `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`). The isolated change is only the mobile `srcset` reference in `src/blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html`, from the obsolete hashed alias to visually matched canonical `/assets/images/hero.webp`. Read-only analysis found the asset fingerprint tool does not parse `srcset`; do not broaden the tool change unless the clean isolated build proves the canonical source path is still omitted.
- Build and verify from detached clean `HEAD` `581d6a7e` under the registered `/tmp/hero-srcset-release-20261101/`. Reuse root `node_modules` by symlink. Release gate: candidate route renders the intended mobile image with no missing request at 320/390px; generated diff is limited to the route and any required image artifact; `deploy-release.py --dry-run --only` lists exactly those paths. Preserve all other root dirty source/output paths.


### `HERO-SRCSET-RELEASE-20261101` completion

- Commit `c95c22f` changes only the mobile source image to the canonical `/assets/images/hero.webp`; commit `1d5bace` records the release evidence. The exact local source change matched the staged source diff.
- The first upload accidentally used the root ignored `dist/`, which had dirty shared-navigation CSS. It was replaced immediately from the registered clean-HEAD candidate. Final dry-run listed only `blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html`; final upload reported 141,787 bytes. Final live route: HTTP 200, one canonical mobile `srcset`, no legacy mobile source; image URL HTTP 200 at 69,664 bytes. Fresh backups were verified before both uploads; the final pre-correction rollback snapshot is `/home/sensdapt/senseisandy-predeploy-20261101T085105Z.tar.gz`.
- The isolated Browser Use check passed at 320px and 390px with the canonical image complete at 1856×822. The generated root `dist/` route was restored to its pre-task bytes after deployment. The candidate worktree, Chrome profile, and preview were closed, removing 1.6 GiB.
- This closes only the image delivery gap. The full goal remains active. The dirty-source matrix result, remaining source/output reconciliation, and owner-reserved keyboard, contrast, and Lighthouse checks remain open.


### Workstream contract — `VIDEOS-PRIMARY-TARGET-AUDIT-20261101`

- **Role:** ordinary **Videos Target Delivery Auditor** fallback; contextual persona selection returned `no_suitable_persona`. Pair with previously full-source-reviewed `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`, ready, `assets/indranet-prompt-exporter/exports/index.json`, no attachments). Codebase-memory MCP remains unavailable, so use scoped source inspection.
- **DoD:** find the source control responsible for the two `/videos` 320px and 390px `primary target below 44px` samples; prove whether the page's canonical CSS and active minified/generated CSS differ; recommend a smallest safe correction plus a focused responsive verification plan. Read-only; do not change root source or generated output.
- **Isolation:** detached worktree at `1d5bace`, exact root `/tmp/videos-primary-target-audit-20261101/`, no dependencies or browser profile. Only report path `/tmp/videos-primary-target-audit-20261101/report.md`. Exclusions: keyboard acceptance, contrast, Lighthouse, PageSpeed, network, and root `dist/`.

### Blog selector correction audit closeout — 2026-11-01

- The 87-page live recheck found both committed Blog CSS rules on 71 pages and found 16 without them. Its route table initially omitted `/blog/`; a focused live GET verified that route returns HTTP 200 and contains both rules, reconciling the 71/87 count.
- Durable evidence: `evidence/2026-11-01/blog-live-selector-recheck.md`. This corrects the prior coverage uncertainty but does not clear the Blog release hold: generated route content and asset references still differ from production, and the root `dist/` remains mixed.
