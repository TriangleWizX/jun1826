# Sprint B: Near-Town Consolidation Map

Date: 2026-02-06
Scope: `near/*` location pages + overlap with existing top-level town pages.

## Method used
- Audited all `near/*/index.html` pages for structural similarity, word count, and repeated section patterns.
- Compared heading skeletons and found repeated H2 frameworks across most pages.
- Checked overlap against existing stronger top-level URLs (`/hunter-ny-jiu-jitsu`, `/cairo-ny-jiu-jitsu`, `/catskill-ny-jiu-jitsu`, `/tannersville-ny-jiu-jitsu`).
- Exported a per-URL decision map to `data/sprint-b-near-town-map.csv`.

## Key findings
- 20 near-town pages are indexable; 1 is already a noindex redirect shell (`/near/jewett-east-jewett-ny`).
- Most pages share the same section blueprint (6 H2 + 8 H3 blocks), with token swaps for town/route only.
- All audited near pages currently have `img_count = 0` (no local unique image blocks), which weakens uniqueness for scaled local pages.
- Several URLs are clear intent duplicates of stronger top-level location pages.

## Recommended actions
- Keep 5 near hubs and enrich them deeply (route photos, commuter timing guidance, and lane-specific internal links).
- Merge/301 the other near pages into the closest hub or top-level town page.
- Update `nearby-towns.html` links after redirects so internal links point directly to final canonical targets.

## Keep set (canonical near hubs)
- `/near/east-jewett-ny`
- `/near/palenville-ny`
- `/near/windham-ny`
- `/near/phoenicia-ny`
- `/near/woodstock-ny`

## Merge set (301)
See `data/sprint-b-near-town-map.csv` for full source→target mapping.

## Implementation order
1. Ship all 301 rules first (single-hop to canonical target).
2. Update internal links in `nearby-towns.html` and any cross-links in near pages.
3. Enrich kept hubs with unique local proof:
   - one unique route photo + unique alt text
   - one concrete route/parking note
   - one “best class time from [area]” line
   - varied internal anchors to Kids/Teens/Adults/Schedule
4. Re-crawl and validate no redirect chains.
