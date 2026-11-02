# Held Stash Artifact Retention Review

This sheet covers the 688 unique, untracked files left in `stash@{0}` (`acb176af48924db5c06a342c8dcaa7286727774e`). It asks whether to remove selected captures from that stash. Approval removes only the listed files from the hold stash; it does not change the live site.

The listed byte totals are file-size sums, not guaranteed disk savings. Git packs and deduplicates blobs, and dropped stash objects can remain until pruning. No exact copies of these files were found in current `HEAD`.

## Persona & Expert Framework

- **Role:** Ordinary artifact-retention reviewer. The selector returned no suitable catalog persona.
- **Instructions candidate:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; its exported source file is unavailable locally, so it was not adopted.
- **Review method:** Count files and bytes from the stash tree, compare blob IDs with `HEAD`, check internal references, and preserve user photos, task inputs, and release evidence unless removal is approved.
- **Read-only audits:** `--help/` and `docs/ws29/runs/`; `docs/styling-workstreams/evidence/`; and the remaining assets, code, and documents. No worktrees or environments were created.
- **Decision rule:** “Approve” means remove the named paths from the hold stash and update retained internal records that refer to them. “Deny” means keep the paths.

## Approve or deny

| # | Path and contents | Size | Recommendation | Your choice |
|---:|---|---:|---|---|
| 1 | `--help/*.png` — 140 full-page viewport captures across 7 routes | 190,095,477 B | **APPROVE removal.** This is the largest capture set. Three internal approval/manifest documents refer to it; if removed, those records will be updated to say the captures were discarded. | APPROVED |
| 2 | `docs/ws29/runs/**/*.png` — 120 viewport captures; retain the 114 JSON records | 126,787,307 B for PNGs; 3,737,510 B for JSON | **APPROVE removal of PNGs only.** Two internal documents refer to this run tree; update them to note the screenshots were removed. Keep the compact JSON results. | APPROVED |
| 3 | `docs/styling-workstreams/evidence/**/*.png` — 142 release, contrast, and keyboard evidence captures | 33,640,899 B | **DENY removal.** These support three retained review/SOP documents. Keep the JSON, reports, patches, text files, tables, and bundle too. | DENIED |
| 4 | `assets/` — seven dated JPGs and two HEIC originals | 8,093,310 B | **DENY removal.** They are unique image files with no copy in `HEAD`; the repository record does not establish that they are disposable. | DENIED |
| 5 | `scratch/jiu-jitsu-terms-test.html` | 13,210 B | **APPROVE removal.** It is a standalone test page and saves little space. Keep `scratch/sales-swarm-brief.json` (5,680 B), which is unique task input. | APPROVED |
| 6 | Remaining `docs/` outside `ws29/runs/` and `styling-workstreams/evidence/` — 87 internal plans, audit records, and SOP files | 3,326,168 B | **DENY removal.** This includes keyboard evidence relevant to the owner SOP and records used by other retained artifacts. | DENIED |
| 7 | `scripts/` and `tests/` — three QA helpers and one test file | 14,561 B | **DENY removal.** They are unique code referenced by internal audits and save little space. | DENIED |

The `docs/styling-workstreams/evidence/` group also has 212 files total (36,579,272 B), including 49 JSON files, 12 Markdown files, 3 patches, 3 text files, 2 TSV files, and 1 bundle. The `docs/ws29/runs/` group has 234 files total (130,524,817 B). Some PNG paths have identical blobs in other run folders; Git stores identical blobs once, so deleting duplicate path names alone may not reclaim their blob storage.

## Suggested reply

Recommended choices: **`1 approve, 2 approve, 3 deny, 4 deny, 5 approve, 6 deny, 7 deny`**.

Reply with your choices, for example: `1 approve, 2 deny, 3 deny, 4 deny, 5 approve, 6 deny, 7 deny`. Unanswered paths stay in the hold stash.

## Verification after approval

- Rebuild the hold stash from its current base without the approved deletion paths.
- Keep JSON results, remaining documents, originals, scripts, tests, and the separate workbook stash according to your choices.
- Update any retained internal records that reference deleted captures.
- Confirm the exact remaining path list and counts, and leave the worktree clean after recording the decision.


## Applied decisions

The user approved removing items 1, 2, and 5, and denied removal of items 3, 4, 6, and 7. The hold stash now has no `--help/*.png`, no `docs/ws29/runs/**/*.png`, and no `scratch/jiu-jitsu-terms-test.html`. Its 114 WS29 JSON records, 142 styling evidence PNGs, 9 photo originals, sales brief, internal documents, QA scripts, and test remain.

The hold stash is now `stash@{0}` at `65ff7e174c0086b6d7eab1ee29db099fc4eadd40`. The separate workbook stash remains at `stash@{1}` (`f55134104b24f5d7767a56820d05547cee08eed4`). The retained approval and run-history records were updated to explain the screenshot removal. No live site files changed and no deployment was needed.

The removed files total 316,895,994 bytes by raw file size. Actual disk reclamation depends on Git packing, blob sharing, and later pruning; no repository-wide garbage collection was run.
