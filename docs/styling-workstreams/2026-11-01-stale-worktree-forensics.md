# Stale detached checkout forensics — 2026-11-01

## Goal

Determine whether `/tmp/style-swarm-20261027-control` contains unique, recoverable work or can be closed safely. Preserve every change until its relationship to the main checkout is established.

## Persona & Expert Framework

- **Coordinator:** ordinary Git release coordinator fallback. The contextual selector returned `no_suitable_persona` for a read-only forensic comparison task.
- **Worker:** ordinary Git worktree forensic auditor fallback, unique to `STALE-CHECKOUT-AUDIT-1`.
- **Candidate reviewed:** `GitHoarder`, UUID `9fce08f7-2454-464c-9d12-cfa77a6c3466`, source `assets/indranet-prompt-exporter/exports/index.json`, status `partial`, no attachments. Its full 18,220-character prompt was read in contiguous chunks with SHA-256 `42cab71ac31a8d06c59c1359fea83d5da9aa12b1a0685ea27c74e610967d8e14`. It prescribes read-only repository cataloging and has no checkout reconciliation workflow; its catalog scope and partial readiness make it a poor fit.
- **Instructions candidates:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, is partial with missing notes and no local full-source file; `INSTRUCTIONS - COMMANDS`, UUID `33359423-93cf-416b-acf7-3f04068deffc`, is complete but is a command-shortcut set, not an audit method. Neither is adopted.
- **Method:** compare current file bytes and Git ancestry/status; classify evidence as exact match, unique difference, generated output, or unclear. Do not infer disposability from age or similar paths.

## Workstream contract

| DoD | Read scope | Write scope | Allowed methods | Completion evidence |
| --- | --- | --- | --- | --- |
| `STALE-CHECKOUT-AUDIT-1` | `/tmp/style-swarm-20261027-control`, current main worktree, cleanup inventory | None | Read-only `git status`, `git diff`, `git show`, safe file hashes and comparisons; no network, builds, installs, branch changes, commits, or cleanup | Path-by-path classification of all 91 dirty entries; recoverability and exact safe-close recommendation; unresolved items explicitly listed |

The existing detached checkout is the worker’s isolated review workspace. The coordinator retains all write paths and will independently validate the report before any preservation, commit, deployment, or removal.

## Audit result — preserve checkout

- The stale worktree has **91 dirty entries**: 87 tracked modifications and 4 untracked files.
- Its base `02634569` is an ancestor of main `5016ca7a`; `main...stale` has 92 main-only commits and zero stale-only commits. Commit history is not the reason to retain this checkout.
- All 91 paths exist in the current main working tree. **40 match byte-for-byte; 51 differ.** Of those 51, eight have a dirty counterpart in main but differ from it; the other 43 differ from files that are clean in main.
- The four untracked paths in the stale worktree are also present in main: `docs/mobile-desktop-styling-plan-2026-10-25.md`, `scripts/qa-faq-disclosures.mjs`, `scripts/qa-home-builder.mjs`, and `src/assets/js/student-hub-referral-copy.js`.
- The 51 differing paths include source/config/CSS changes and a 1,124-line mobile/desktop styling plan. These differences have not been independently accepted or mapped to generated output. **Do not delete or clean the checkout yet.**
- The auditor’s report was read-only. The coordinator must review the unique differences, map any release candidates, and preserve accepted patches before any cleanup.

## Three-way history comparison

A second comparison used stale HEAD `02634569`, current main HEAD `5016ca7a`, and the stale working bytes for all 87 tracked modifications:

- 64 files differ from the stale base while main HEAD still has the base version. These are not in main history and need review or explicit archival.
- 20 files differ from both the stale base and the stale working copy; main history has since changed these paths. Their stale edits need three-way semantic review before reuse.
- 3 stale working files match main HEAD exactly, so those file changes are already represented in main history.
- The 4 untracked files are exact copies of files already present in the main working tree.

The history comparison confirms no stale-only commits, but does not make the stale dirty edits redundant. The 64 untouched-history paths are the first review cohort; the 20 overlapping-history paths are a separate conflict cohort. No patches were applied or staged.

## Focused CSS review — 2026-11-02

- Re-ran `tools/workspace-audit.py --preflight`: PASS. Main remains 353 status entries; stale checkout remains 91 dirty entries. `/tmp` has 93 GiB free.
- Compared the stale checkout’s full CSS diff against `docs/mobile-desktop-styling-plan-2026-10-25.md`. The stale Kids, Teens, and Adults rules stack those heroes below 920px, while the plan explicitly requires their two-column heroes through 920px. Reject those three breakpoint rules unless a new rendered-evidence review supersedes the plan.
- Other unique CSS edits include 14px small-copy floors, some 44/46px targets, Home conversion layout changes, and page-specific color/focus tweaks. These are not accepted release changes: they span multiple sources/minified pairs, several include broad shared selectors, and the stale generated/minified outputs have not been mapped against current route outputs. Keep read-only pending source/route review.
- Pricing and shared shell source diffs are already represented in main history. No files were copied, staged, or altered in either checkout.
- The deployed glossary commit remains separate from main. Local dirty glossary source and generated HTML differ from the release branch, so do not merge/copy those generated files without rebuilding and confirming the exact route payload.
- Result: checkout still has unique unreviewed edits and must remain. Next safe action: inventory the remaining 43 unique source/config/template diffs by semantic category and compare with current plan/accepted history; then preserve only reviewed changes before cleanup. No build, deployment, or commit was attempted in this review.

## Follow-up audit contracts — 2026-11-01

The goal coordinator remains AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`, under `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, as recorded in the active release plan. Codebase-memory MCP is still unavailable. The persona selector ranked a Markdown static-site generator and a UI wireframe generator for these tasks; catalog title search found no suitable CSS/release auditor. Workers use disclosed ordinary-specialist fallbacks; no persona adoption is claimed.

| DoD | Role fallback | Read paths | Write paths | Allowed methods | Verification |
| --- | --- | --- | --- | --- | --- |
| `STALE-CSS-CANDIDATES-20261101` | Responsive CSS and UX auditor | Existing stale checkout `src/assets/css/**`; current main plan and corresponding source styles | None | Read-only diff comparison and requirement mapping | Identify unique changes that match explicit plan items, reject contradictions, flag output dependencies; cite paths/rules and confidence. |
| `STALE-RUNTIME-OUTPUT-MAP-20261101` | Static-site output and release mapper | Existing stale checkout’s non-CSS source, scripts, tools, generated manifest/route references; main deployment mapper | None | Read-only diff and source-to-output trace | Classify changes by route/runtime; name exact generated outputs, overlaps, and safe preservation/release boundaries. |

Both audits reuse `/tmp/style-swarm-20261027-control` as a shared read-only source; no additional checkout or browser profile is created. The coordinator independently reviews worker findings before preserving or releasing anything.

## Follow-up audit results and Student Hub asset repair scope — 2026-11-01

- `STALE-CSS-CANDIDATES-20261101` found no stale stylesheet safe to import wholesale. Current main already contains several stale rules; stale audience hero breakpoints and Schedule focus color conflict with the current plan. Free Intro and broad Winter Armor focus rules need rendered evidence. No CSS from the stale checkout is accepted for release.
- `STALE-RUNTIME-OUTPUT-MAP-20261101` found 26 of 39 non-CSS tracked changes byte-identical to current main work, eight differing paths overlapping dirty main files, and five paths differing from clean main. The stale deployment script is older and broader than main's mapper; do not copy it. Schedule's 768px focus-restoration code stays shelved under the keyboard SOP.
- Coordinator independently found a production dependency gap: committed `src/student-hub.html` references `/assets/js/student-hub-referral-copy.js`, but that exact live URL returned HTTP 404. The helper already exists as an untracked source file in main and as a generated `dist/assets/js/student-hub-referral-copy.js`; both have SHA-256 `eee1f9cac04b848e2bb08d6a5463e7b2a370ee99ee7bcca4f3d66c871829f1fd`. The current route itself returns HTTP 200 and includes the script reference.
- New bounded workstream `STUDENT-HUB-REFERRAL-ASSET-REPAIR-20261101`: read/validate `src/assets/js/student-hub-referral-copy.js`, current `src/student-hub.html`, generated asset, `scripts/deploy-release.py`, and live route/asset; only intended code write is adding the exact existing helper source to Git. Do not modify the older stale Student Hub HTML, YAM filters/data, or keyboard behavior. Definition of done: syntax and local pointer-copy/fallback checks, commit the helper, dry-run exactly `assets/js/student-hub-referral-copy.js`, deploy only that asset, then verify live HTTP/hash and route reference.

## Deployed glossary commit integration — 2026-11-01

- The already-live `d150476a` glossary release was integrated into main with a conflict-free committed-tree merge. Main is now a descendant of `glossary-hit-area-release-20261101`.
- Before merging, all six overlapping local paths were preserved in a named, path-limited stash. Four paths exactly matched the deployed commit. Stash reapplication conflicted only on `dist/bjj-glossary/index.html` and `src/assets/css/pages/glossary.css`; the exact saved local bytes were restored. SHA-1 Git blob checks confirmed all six paths exactly match the saved pre-merge worktree state. The temporary stash was dropped only after that verification; the unrelated pre-existing stash was retained.
- The two true follow-on diffs remain unstaged: generated glossary hub HTML and source glossary CSS. The CSS removes `.day-one-chip`'s `min-width:44px` while retaining its 44px minimum height. The generated route also changes a mobile-foundation fingerprint. Those changes were not committed or deployed in this integration step; route/output and target sizing need separate review.
- The deployed page did not need a second upload. No other dirty path was altered by this merge.

## Location-layout candidate decision — 2026-11-01

The stale-only `head-metadata.njk`/`location.njk` pair adds `locationExtraCss` links only when `bodyClass` contains `lane-mixed`. The stale location layout itself declares `bodyClass: "page-location ss-page"`, so this gate is false on that layout and the extra styles are not emitted. No location CSS change is carried forward; any intended route styling needs an explicit selector/activation contract and generated-output mapping first. The codebase-memory service again returned `Transport closed`; scoped template reads were used.
