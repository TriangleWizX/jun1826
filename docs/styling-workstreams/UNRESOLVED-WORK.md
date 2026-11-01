# Unresolved work: dirty worktree, commit, and deploy

**Status snapshot:** `main` at `522a1abd` (`Integrate live Blog text floor output`), 182 commits ahead of `origin/main`. The worktree has 302 status entries, including 81 under `dist/` and 54 under `src/`. Blog release paths integrated below are clean; the remaining generated tree is mixed and is not a release source.

## Closed work

- **Blog CSS:** commit `99a58f2` integrated the approved badge-wrap and CTA-focus changes. Commit `522a1ab` now integrates the separately approved Blog text-floor/category-pill release: 34 exact deployed route snapshots plus the completed report and SFTP/HTTP/browser receipts. The route blobs match all 34 recorded deployed SHA-256 values. No second upload was needed.
- **CodeGraph PID noise:** commit `ec86ee5` prevents the inactive daemon PID file from dirtying Git status. Inactive PID/socket files were removed; database and logs were retained.
- **Keyboard SOP wording:** commit `4414ef7` corrected its list of production commits. The owner-run keyboard SOP remains open; browser-generated keyboard input is accepted, and physical keyboard input is not required.
- **Show-Up browser profiles:** commit `ad4fe4d` records removal of two inactive profiles, freeing 11,336,038 bytes. The latest documented cleanup audit measured roughly 90 GiB free.
- **Stale Blog candidate in root `dist/`:** its tracked Blog routes and sitemap were restored to match `HEAD`; do not treat root `dist/` as a release source.

## Remaining work

### 1. Rebuild the source-to-output map from current `HEAD`

The [Nov. 2 dirty-source report](2026-11-02-dirty-source-output-refresh.md) used base `423eb464`; it is not current release proof. The current source baseline is `dc06a6d8`, a docs-only advance from the clean-HEAD audit. The [dirty-source overlay review](2026-11-02-dirty-source-overlay-map-plan.md) found 506 generated path changes; the committed mapper selects 266 and omits 293 whitelisted deployable outputs (257 HTML, 35 CSS, 1 WebP). Do not deploy the broad overlay. See the [path-by-path approval sheet](2026-11-02-dirty-path-approval-sheet.md) and [exact mapping evidence](evidence/2026-11-02/dirty-source-overlay-map/output-delta.json). Keep mixed root `dist/` out of deployment.

### 2. Decide the unmerged keyboard branch separately from the owner SOP

`keyboard-release` remains unmerged at `246be6a1`, based on `6ef764a7`. It changes `src/assets/js/schedule-month-calendar.js` and `src/partials/nav-include.html`, plus route reports and screenshots. The changes cover calendar breakpoint focus transfer, mobile day-detail toggling, menu focus placement/return, and focus-ring fallbacks. They are not the same as the owner-run keyboard acceptance task. Preserve the branch and dirty current files until the source changes are reconciled against current `main`, already deployed behavior, and the owner's SOP disposition. Do not merge the branch wholesale or claim keyboard acceptance passed.

### 3. Keep sales pages and schedule links held

The local sales calculator, video-goal-session, welcome-primer pages, and related schedule links are not release-ready. [The route and claims review](2026-11-02-sales-flow-pages-hold.md) found pricing conflicts with canonical data, class-size limits used as urgency, unresolved public offer and booking details, and a promised welcome video that is absent. Production checks found the routes return 404 and the live schedule does not link to the held pages. Keep the local files intact until the owner confirms authoritative offer values and booking path, and the video is supplied or its claim is revised. Then remap, build, and verify exact routes.

### 4. Reconcile remaining dirty source cohorts one requirement at a time

- The current dirty-source overlay at `dc06a6d8` changes 506 generated outputs, while the committed mapper emits 266 paths. Independent review found 293 deployable route/style outputs missing. This is a coverage gap, not a release set; no upload. Use the approval sheet to choose a narrow source cohort, then repair and re-check its mapping.

- Winter text-floor item `WINTER-DESKTOP-TYPE-1` is stale: the committed runtime removes `.winter-summary` and renders no `.winter-product` elements. The isolated preview showed HTTP 200, no horizontal overflow, and no page errors at the planned widths, but the specified targets were absent. No CSS patch or deploy; see [review](2026-11-02-winter-desktop-type-release-plan.md). Reconcile the intended visible content and selectors before reopening.

The Nov. 2 broad output comparison does not justify releasing the remaining changes. Select a concrete approved requirement, identify only its owned source paths, compare current source to the relevant plan/evidence, then create an isolated current-`HEAD` build and verify the exact route/output set. Preserve unrelated dirty files. Specific holds:

- Blog typography, hit-area, and alert-layout changes remain outside the already committed Blog fixes; the old 53-route payload is stale and the current mixed `dist/` is unsuitable.
- Near breadcrumb CSS remains held until the live canonical route is shown to use it.
- Schedule links to the held sales pages remain out of production.
- Do not bundle broad shared asset-manifest or deploy-helper diffs into a page-only fix.
- F-01/F-02/F-03 and Kids/Teens schedule links, Free Intro form/layout B, and shared action-bar C are recorded as released; do not replay without a newly identified defect.

### 5. Keep owner-reserved checks with the owner

- Keyboard behavior acceptance: follow [the owner SOP](keyboard-route-acceptance-owner-sop.md). Browser-generated input is acceptable; no physical keyboard is required.
- Site-wide contrast review: owner-run.
- Lighthouse/PageSpeed: user-run; agent work must not run these checks.
- Student Hub weekly focus and YAM archive records: shelved until current approved data is available. The user has not tracked the records since May 2026.

### 6. Continue exact workspace cleanup

Only `/tmp/style-swarm-20261027-control` is registered as a separate Git worktree. It has unique changes and remains preserved. The cleanup inventory documents numerous other large temporary workspaces with unique or ambiguous source/evidence; age or size alone is not a deletion reason. `/--help/` (shown by Git as `--help/`) contains unique viewport screenshots and remains preserved. Before removing any path, reconcile its exact contents and ownership, check active processes, retain unique evidence, and update [the workspace inventory](WORKSPACE-CLEANUP.md). Do not start another isolated workstream until its lifecycle row and closeout trigger are recorded.

## Release and completion gate

For every release: select an approved requirement; preserve unrelated dirty work; build from current committed source in isolation; inspect the exact generated file list and hashes; use a narrow commit and exact deployment payload; then report upload, HTTP/content, browser, and owner/live-read evidence separately. Do not deploy from the mixed root `dist/`. Do not run Lighthouse/PageSpeed or site-wide contrast review.

The overall goal remains open while eligible dirty changes lack requirement-to-output evidence or require a release. Owner-held checks and shelved data remain clearly assigned and must not be reported as passed.
