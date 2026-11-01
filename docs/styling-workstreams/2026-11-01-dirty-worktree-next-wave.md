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
