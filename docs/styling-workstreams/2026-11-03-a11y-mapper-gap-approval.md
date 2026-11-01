# Accessibility UI mapper fix: release record

## Decision and implementation

The user approved the mapper fix after approving Category A of the accessibility UI cohort. `scripts/deploy-release.py` now maps these changed sources to their generated outputs and fails if any output is missing:

| Source | Generated output |
| --- | --- |
| `src/core-culture-parent-guide.html` | `core-culture-parent-guide/index.html` |
| `src/front-headlock-series/index.html` | `front-headlock-series/index.html` |
| `src/practice-vault.njk` | `practice-vault/index.html` |
| `src/tactical-longevity.html` | `tactical-longevity/index.html` |

The deploy script is private tooling. It was committed but not included in the public upload.

## Release evidence

- Release commit: `825a6ac` (`Release focused accessibility UI improvements`).
- `npm run clean && npm run build` completed successfully from the approved source cohort.
- The exact mapper dry-run selected 64 paths. This is the previous 59-path payload, the four newly mapped pages, and the fingerprinted global CSS required by the clean build. The list is in [mapper-dry-run.txt](evidence/2026-11-03/a11y-release-output-map/mapper-dry-run.txt).
- `git diff --cached --check` passed before commit; the generated `dist/` had unrelated baseline formatting differences and was never staged.
- All 64 approved payload files uploaded successfully with remote byte counts reported. The deployment created and verified an account-level rollback backup, and removed one older verified backup of about 1.1 GB.
- Live reads returned HTTP 200 and matching local titles for `/front-headlock-series/` and `/practice-vault/`.
- Keyboard acceptance, site-wide contrast, and Lighthouse/PageSpeed were not run, per the user's instructions.

## Live route finding requiring a separate decision

Two uploaded outputs are behind existing canonical redirects:

- `/core-culture-parent-guide/` redirects to `/parent-resources`.
- `/tactical-longevity/` redirects to `/law-enforcement-bjj`.

The redirect registry and `.htaccess` both define these redirects. The new alias outputs were uploaded, but those two URL paths serve the canonical pages instead. The approved source cohort did not include `src/parent-resources.html` or `src/law-enforcement-bjj.html`, so this release did not copy the accessibility edits onto those canonical pages. If those edits are needed on the public canonical pages, review and approve that separate, narrowly scoped source update.

The rest of the previously unapproved dirty work remains preserved in `hold-before-a11y-release-20261103`.
