# Unresolved Work: Dirty Worktree Commit and Deploy

Status snapshot: `main` at `ad4fe4d`; 180 commits ahead of `origin/main`; 301 dirty or untracked entries remain. This handoff is not a completion claim. The shared `dist/` folder is mixed and is not a safe release source.

## Persona and review method

- **Role:** ordinary static-site release and workspace-reconciliation specialist. The contextual persona selector returned `no_suitable_persona` for this evidence review.
- **Coordinator instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, carried forward from the active goal. Applied methods: trace source to generated output, keep each release narrow, preserve unrelated dirty work, and verify deployment separately from local build results.
- **Review basis:** current Git status, the read-only workspace audit, and the cited release and hold reports below. The last broad output comparison is based on `423eb464`, earlier than current `HEAD`; it is not current release proof.

## Already closed

- Blog CSS: commit `99a58f2` integrated the nine approved style changes and the two live-release records. The release was already deployed and verified; no second upload was needed. Extra dirty Blog styling and generated Blog files were left out.
- Local CodeGraph state: commit `ec86ee5` stops the daemon PID file from dirtying Git status again. The inactive PID and socket were removed; the local database and logs were preserved.
- Keyboard SOP wording: commit `4414ef7` corrected which production commits the owner SOP covers. Browser-generated keyboard input is accepted; a physical keyboard is not required.
- Workspace inventory: commit `ad4fe4d` records two inactive Show-Up browser-profile closeouts. Together they freed 11,336,038 bytes; the post-cleanup audit measured about 90 GiB free. Large retained workspaces still need exact-path reconciliation.

## Fix and release work still open

### 1. Refresh the source-to-output map

The last isolated comparison used base `423eb464`. It found 454 changed outputs, 32 added outputs, and 22 removed outputs from a broad dirty-source overlay. That comparison rejected a broad release, and it cannot qualify today’s files because `HEAD` has moved to `4414ef7`.

**Next fix:** build from current `HEAD` in a temporary isolated directory, add only source files tied to an open approved requirement, and map each changed output back to its source. Keep the root `dist/` out of the build and deploy payload. Do not release the full dirty `dist/` tree.

Evidence: [dirty source/output comparison](2026-11-02-dirty-source-output-refresh.md) and [its output map](evidence/2026-11-02/dirty-source-output-refresh.json).

### 2. Keep sales pages and schedule links held

The local sales calculator, video session, welcome primer, and their schedule links do not yet have a release-ready source. The review found prices that conflict with canonical pricing, use of the class-size limit as scarcity, unresolved route/canonical behavior, and a promised welcome video that is absent.

**Needed before a fix can ship:** confirm the allowed offer and price from an authoritative source, confirm the video-session booking path, and provide the promised video or approve corrected copy. Then rebuild and verify the exact routes. Keep these pages and links out of production until those facts are settled.

Evidence: [sales flow route and claim hold](2026-11-02-sales-flow-pages-hold.md).

### 3. Resolve remaining styling source changes one group at a time

The working tree still has 55 dirty production source entries. Examples include Free Intro templates, shared CSS, Schedule, Near, waiver, Blog, and the asset manifest/deploy mapper. The last broad review did not tie these remaining changes to a single approved requirement or safe output set.

**Next fix:** for each group, name the open requirement, isolate only its source hunks, build its exact generated output, and verify the mapped route and payload. Keep the group local when any step is missing. In particular:

- Keep extra Blog rail/card hit-area and alert-layout edits separate from the already released Blog CSS.
- Do not release the Near breadcrumb CSS until a live canonical route is shown to use it.
- Keep the Schedule video-session and calculator links held with the sales pages.
- Do not ship the full shared asset manifest or deploy-helper diff as part of a page-only fix.

Evidence: [current Blog route audit](2026-11-01-blog-current-route-audit.md), [Near breadcrumb route gate](2026-11-01-near-breadcrumb-live-route-gate.md), and [dirty-source release boundaries](2026-11-02-dirty-source-output-refresh.md).

### 4. Finish owner-run checks when the owner is ready

- **Keyboard:** use [the keyboard acceptance SOP](keyboard-route-acceptance-owner-sop.md). Record tester, date, browser, route, viewport, zoom, and each result. Browser-generated keyboard input is accepted.
- **Contrast:** broad site-wide contrast review is owner-run.
- **Lighthouse/PageSpeed:** the user will run these; agent work must not run Lighthouse or PageSpeed checks.
- **Student Hub:** weekly training focus and YAM archive records are shelved because current approved records are missing. The user said they have not tracked these since May 2026. Resume only when current approved data is available.

## Workspace cleanup still open

- The latest audit reports about **91 GiB free**. It lists many large temporary paths, including `/tmp/style-active` (6.1 GiB), `/tmp/home-review-stars-fix2-20261028` (4.8 GiB), `/tmp/style-route-purge-prototype-20261027` (3.9 GiB), and `/tmp/target-matrix-classifier-rebase-5` (3.8 GiB). These contain unique work or evidence; size and age alone do not make them safe to delete. Reconcile each exact path, check active processes, preserve unique files, then remove only proven duplicates.
- `/tmp/style-swarm-20261027-control` is the only other registered Git worktree. It has unique differences and stays until those files are reconciled.
- `--help/` contains 140 unique viewport screenshots (about 190 MB). No exact copies were found in the reviewed QA folders; preserve them until their provenance and use are resolved.
- The latest workspace audit is read-only. It reports candidates; it does not approve deletion. See [workspace cleanup rules and inventory](WORKSPACE-CLEANUP.md).

## Completion checks

The goal is still open. Close it only after each approved, in-scope fix is committed, its exact generated payload is deployed, and live output is verified; unresolved or owner-run items must remain clearly assigned and must not be represented as passed. Keep mixed generated output, unique evidence, and unsupported public claims out of a release.
