# Large temporary checkout cleanup audit — 2026-11-01

## Goal

Identify only redundant large temporary Git worktrees that can be removed safely. Preserve unique dirty source, generated output, and evidence. This audit makes no file or Git changes and deletes nothing.

## Persona & Expert Framework

- **Coordinator:** ordinary temporary-workspace/Git forensic specialist fallback. The contextual persona selector returned `no_suitable_persona`.
- **Rejected selector result:** the automatically ranked `INSTRUCTIONS - CONTENT` asset is a copywriting workflow, not a filesystem or Git audit method. It was not adopted.
- **Selected instructions:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, from `assets/indranet-prompt-exporter/exports/index.json`. Its full 1,500-character source was read and applied for requirements-first review, status/diff inspection, evidence checks, and conservative change handling.
- **Worker:** ordinary Git worktree forensic auditor fallback for `TMP-WORKTREE-AUDIT-20261101`; no persona adoption is claimed. The worker has read-only scope and no write paths.

## Workstream contract

| DoD | Read paths | Write paths | Allowed methods | Verification |
| --- | --- | --- | --- | --- |
| `TMP-WORKTREE-AUDIT-20261101` | `docs/styling-workstreams/WORKSPACE-CLEANUP.md`, `tools/workspace-audit.py`, and the 15 exact `/tmp` candidates named below | None | Read-only inventory, `git worktree list`, `git status`, `git diff`, commit ancestry, exact file comparison, process-use checks, and size measurement | Every candidate has owner/status, exact base and dirty-state comparison, proof that unique changes/evidence are preserved or not, current process use, and a retain/remove recommendation. Do not delete any candidate. |

The named candidates are `/tmp/keyboard-navfix-20261029`, `/tmp/keyboard-sop-clean-20261029`, `/tmp/style-before-20261026`, `/tmp/style-swarm-20261026-a11y`, `/tmp/style-adults-cta-focus-impl`, `/tmp/style-resume-clean-20261027`, `/tmp/style-resume-build-20261027`, `/tmp/style-kids-integrated-20261026`, `/tmp/firstvisit-integrated-20261028`, `/tmp/pricing-badge-fix-20261028`, `/tmp/home-contrast-combined-20261028`, `/tmp/home-sticky-sms-fix-20261028`, `/tmp/style-blog-cta-focus-impl`, `/tmp/style-glossary-hover-impl`, and `/tmp/style-delivery-owner-20261026`.

The independently audited `/tmp/style-swarm-20261027-control` remains a separate retain decision: its 51 unique dirty differences are not yet reconciled.

## Result — read-only per-path verification complete

- All 15 named candidates still exist and total **24,234,319,872 bytes (~22.57 GiB)**. The two additional `/tmp/style-swarm-20261026-hub` and `-controls` repositories add **2,100,482,048 bytes**, for **26,334,801,920 bytes (~24.53 GiB)** across the 17 paths reviewed.
- Six paths contain Git repositories or linked worktrees with substantial dirty status. The other eleven are non-Git snapshots; comparison against current main found 67–112 tracked-file differences plus missing files. Their source/evidence Merkle hashes are distinct from each other after excluding generated output, dependencies, caches, and sensitive environment/credential paths.
- Unique content includes keyboard changes, styling source, QA scripts, screenshots, route proof, and provenance data. The hub and controls copies have identical `dist` trees but distinct untracked workstream artifacts and dirty sources, so that alone does not justify removing either full checkout.
- **No current path is proven safe to remove.** Preserve all 17 until each unique source/evidence set is reconciled and its owner confirms disposal. A full checkout is not redundant merely because its base is old or it has no Git metadata.
- Exact per-path owner, size, evidence, and review status are recorded in `docs/styling-workstreams/WORKSPACE-CLEANUP.md`. The separate active `/tmp/style-swarm-20261027-control` remains retained because its 51 differing dirty files have not been reconciled.
- This audit deleted nothing. Do not infer deletion authority from the workspace script's heuristic candidate list.
