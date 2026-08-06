# Releases 1–5 Inventory

Recorded 2026-08-05 from the current repository. This is an inventory, not a claim that the releases pass the full gate.

| Release | Reference | Current gate status | Notes |
|---|---|---|---|
| 1 | `release-1-stabilization-2026-08-05` | `BLOCKED` | Tag exists; requirement-by-requirement evidence is still required. |
| 2 | `release-2-eleventy-architecture-2026-08-05` | `BLOCKED` | Tag exists; requirement-by-requirement evidence is still required. |
| 3 | `release-3-conversion-pricing-analytics-2026-08-05` | `BLOCKED` | Tag exists; requirement-by-requirement evidence is still required. |
| 4 | `release-4-content-consolidation-technical-seo-2026-08-05` | `BLOCKED` | Tag exists; requirement-by-requirement evidence is still required. |
| 5 | `feature/release-5-optimize-launch` | `BLOCKED` | Current branch has extensive uncommitted and untracked work. |

## Worktree classification

The worktree was inventoried without reset, clean, deletion, or overwrite. Existing edits and untracked files remain user-owned. The current state includes modified Eleventy/templates/sitemap sources and QA code, plus untracked generated assets, route pages, data, scripts, reports, and documentation. Before release-candidate creation, the owner must classify each item as intentional release content, generated output, evidence, scratch work, or unrelated user work.

The gate deliberately does not auto-delete or auto-stage any of these files. A clean temporary clone is required for an independent release build; that clone must be created outside the working tree and must not alter this inventory.
