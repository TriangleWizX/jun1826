# Media Manifest Governance

This runbook defines how we track intentional media duplicates (source, fingerprinted outputs, and aliases) without deleting files automatically.

## Files
- Manifest: `assets/data/media-manifest.json`
- Audit script: `scripts/qa-media-manifest.mjs`
- Report output: `crawl-reports/media-reference-audit.json`

## Manifest Model
Each `groups[]` entry should include:
- `group_id`: stable logical ID (do not rename casually)
- `canonical_source`: editable source of truth
- `fingerprinted_outputs`: hash-suffixed production variants
- `dated_aliases`: aliases (for example YAM date assets)
- `reference_status`: keep as `derived-from-scan` (do not hand-maintain status)
- `notes`: replacement/migration context

## Add A New Media Group
1. Pick a stable `group_id`.
2. Set `canonical_source` to the editable original.
3. Add known fingerprinted outputs and aliases.
4. Add a short `notes` reason.
5. Run `npm run qa:media:manifest` and confirm the group appears with expected status.

## Replacement Workflow
1. Keep old and new files in the same group while migration is in progress.
2. Update page references to the new asset.
3. Re-run audit and verify old members become `unreferenced`.
4. Do visual QA on impacted pages before manual deletion.
5. Delete only after at least one clean scan confirms zero active references.

## Scan And QA
Run:

```bash
npm run qa:media:manifest
```

Interpretation:
- `referenced`: explicit path found in HTML/CSS/JS.
- `pattern-referenced`: linked by known runtime pattern (currently `yam-${assetId}.webp`).
- `unreferenced`: no explicit or known pattern linkage.

## Deletion Policy
- This workflow is report-only.
- No script in this phase deletes media files.
- Manual deletions require a quick visual QA pass for affected pages (promo, hero/OG, student hub YAM).
