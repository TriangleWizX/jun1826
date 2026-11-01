# Dirty source and generated output comparison — 2026-11-02

## Method

- Base: current `HEAD` `423eb464`.
- Built a clean Git archive, then a second build with 68 changed or untracked production inputs overlaid from the checkout (`src/`, `js/`, `api/`, `scripts/`, `tools/`, and `package.json`).
- Kept root `dist/` out of both builds. Reused root `node_modules` by symlink. Excluded docs, screenshots, raw root photos, and `src/assets/css/pages/law-enforcement.css.tmp` from the source overlay.
- Both `npm run build` commands passed. The initial fingerprint checks found stale generated siblings in the temporary candidates; `node tools/fingerprint-assets.cjs --clean` removed only those candidate-local stale files. The final checks passed: 157 managed assets in the clean baseline and 160 in the dirty-source candidate.
- Per-input source hashes and exact generated path/hash differences are in [the comparison evidence](evidence/2026-11-02/dirty-source-output-refresh.json).

## Results

| Candidate | Generated files |
| --- | ---: |
| Clean source at `423eb464` | 2,214 |
| Current dirty source overlay | 2,224 |

The dirty-source build adds 32 outputs, removes 22, and changes 454 existing outputs. Changes span glossary pages (156), blog pages (87), assets (72), class pages (38), and source pages (32), plus smaller groups across other routes. This is broad shared-output fan-out, not one isolated route payload.

## Release disposition

No production path was staged or deployed from this comparison. The currently documented release boundaries still apply: Kids/Teens schedule links, Free Intro form/layout B, shared action-bar C, and F-01/F-02/F-03 are already released; keyboard acceptance, site-wide contrast, and Lighthouse/PageSpeed remain owner-reserved; schedule video/calculator links and sales pages remain held; the other dirty cohorts still lack a verified mapping to an open approved requirement. Root `dist/` was not read as candidate release bytes or modified.

The fresh comparison narrows the next audit but does not make the broad dirty output tree releasable. Preserve remaining dirty work until each source cohort has a specific open requirement and a narrowly verified generated payload.

## Workspace closeout

Temporary workspace: `/tmp/dirty-source-output-refresh-20261101/` (measured at 3.1 GiB by `du`; budget 4 GiB). After preserving this report and JSON evidence and confirming no process referenced the path, the exact workspace was removed and its inventory row was closed.
