# Winter Rank Drop type floor release — 2026-11-02

## Scope and framework

- Raised the rendered small text on `/winter-rank-drop/` to at least 14px.
- Role: ordinary responsive typography and static-site release specialist fallback; no suitable matching role persona was established for this bounded CSS release.
- Instructions: `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, readiness previously reviewed as ready; source was inspected in the active goal plan. Applied its source-to-output tracing and narrow verification approach. No attachments.
- Candidate commit: `758bb9ea` (`Fix Winter Rank Drop small text`), based on `bfc8db99`.

## Change and release

- Added 14px minimum rules for the rendered navigation, kicker, product text, text links, choice/card labels, and footer text. Left the route copy and other styling unchanged.
- Added the Winter Rank Drop CSS source-to-generated-output mapping to `scripts/deploy-release.py`.
- Updated only the Winter Rank Drop entry in `src/assets/data/asset-hash-manifest.json` to `/assets/css/pages/winter-rank-drop.cb1eca.css`.
- The deploy dry run selected exactly `winter-rank-drop/index.html` and `assets/css/pages/winter-rank-drop.cb1eca.css`.
- Deployed those two paths. Production returned HTTP 200 for both. The served stylesheet was 7,089 bytes and its SHA-256 matched the isolated build: `7824ab8a075f8626a4862e6b06e4c57448820c4e6598f0ad18f2846732b01b9e`.
- Live route HTML matched the isolated generated route after normalizing only the fingerprinted Winter stylesheet filename.

## Verification

- Isolated build: `npm run build` completed.
- Browser: checked 320, 390, 700, 701, 768, 992, and 1440px. Every width returned HTTP 200, had no horizontal overflow, and had no visible text below 14px.
- No Lighthouse, PageSpeed, site-wide contrast, or keyboard acceptance was run; those remain owner-reserved.
- The root `dist/` was not used. The candidate source release was built in `/tmp/winter-rank-type-release-20261102/`.
- The temporary checkout and its local preview server were removed after verification.

## Integration status

The deployed candidate commit was created in the isolated linked worktree. The same reviewed patch must be recorded on the main branch using exact-path staging, because the root checkout has unrelated dirty source and generated files. Do not stage its working tree wholesale.
