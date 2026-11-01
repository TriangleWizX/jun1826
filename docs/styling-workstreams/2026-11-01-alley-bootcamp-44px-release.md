# Alley Bootcamp mobile price target release — 2026-11-01

## Scope and review lens

The scoped change raises the mobile minimum height of `.page-alley-bootcamp .ab-price-link` to 44px at widths up to 575.98px. The source change was four CSS lines. It follows the repository's mobile tap-target guidance and does not change copy, schedule data, booking URLs, or desktop rules.

The active goal coordinator and `Instructions - COMPETENCE` are recorded in the broader dirty-worktree release plan. This workstream used an ordinary static-site CSS/release specialist lens; the codebase-memory service was unavailable (`Transport closed`), so route discovery used focused local source and mapper inspection. No separate worker persona or agent was used.

## Build and rendered checks

- Clean detached build at parent `5016ca7a`, with only the scoped CSS change applied, passed (`npm run build`). The main checkout's `dist/` was not used for the build.
- The generated route references `/assets/css/pages/alley-bootcamp.4676d1.css`. The generated CSS SHA-256 is `1fd104a872cd1419443336ba1e553c3440825b5645711b77ec1b3165fe20431f`.
- Live route and clean generated route main-content markup/text matched after excluding scripts and styles. The route uses server-side includes for shared navigation.
- Isolated Chromium with off-origin requests blocked returned HTTP 200 at 320, 390, 768, and 1440px. The price link measured 44px at 320 and 390px; at 768 and 1440px it retained its existing 25.9px height. There was no horizontal overflow or page error at any width. The 390px screenshot is [alley-bootcamp-390.png](evidence/2026-11-01/alley-bootcamp-390.png).
- Browser Use `--doctor` found the default daemon unavailable. The isolated local check used system Chromium through Playwright; no shared daemon was touched. No Lighthouse/PageSpeed or site-wide contrast check was run.

## Deploy mapping, commit, and live proof

The release mapper did not have a route-specific entry for this standalone stylesheet. Commit `7540eb33` (`Fix Alley Bootcamp mobile price target`) adds the 44px rule and a narrow mapper that selects the generated Alley Bootcamp route plus its one fingerprinted stylesheet. `python3 -m py_compile scripts/deploy-release.py` and scoped `git diff --check` passed.

The commit-based dry run selected exactly:

- `alley-bootcamp/index.html`
- `assets/css/pages/alley-bootcamp.4676d1.css`

The release completed with exit code 0 using `--reuse-existing-backup`. Live verification returned HTTP 200 for both files. The CSS was 31,835 bytes with SHA-256 `1fd104a872cd1419443336ba1e553c3440825b5645711b77ec1b3165fe20431f`, byte-identical to the clean build. The live route was 103,262 bytes and now references the new CSS fingerprint.

`main` was fast-forwarded to `7540eb33`; the exact CSS source now matches committed `HEAD` and is no longer a dirty entry. Rollback is available through the account-level pre-deploy backup accepted by the deployment script, or by restoring the previous route stylesheet reference and CSS from the parent commit.

## Closeout

The isolated worktree, its generated `dist/`, shared dependency symlink, and local server were removed after preserving the report and screenshot. Unrelated dirty files in the main checkout remain untouched.
