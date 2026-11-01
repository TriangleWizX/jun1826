# Home parent guide target fix — 2026-11-02

## Finding and repair

The Home input declares `home.min.css`. Canonical `home.css` already had a mobile `min-height: 44px` rule for `.ss-home-parent-guide-link`, but the minified stylesheet consumed by the homepage builder did not. Added that same rule to `src/assets/css/pages/home.min.css`; no other source CSS was changed.

## Verification

- Built in detached worktree `/tmp/home-parent-target-fix-20261102` from `1d5bace`, with only the reviewed minified CSS change applied. The build output remained inside that worktree; root `dist/` was not used.
- Opened the generated homepage from the isolated build at a loopback-only local server. Used installed Chrome through Playwright because `browser-use --doctor` reported no running Chrome or daemon. Requests outside `http://127.0.0.1:4177` were blocked.
- Measured `.ss-home-parent-guide-link` at 44px at widths 320, 360, 390, 430, 639, 640, 641, and 767px. At 768px it measures 26.39px, confirming the mobile rule stops at the intended 767.98px boundary.
- `git diff --check` passed for the source change.

## Release proof

- Source/evidence commit: `3f877e0 fix: restore home parent guide tap target`.
- Output-mapping commit: `2a2ed80 fix: map home styles to generated homepage`.
- `deploy-release.py --dry-run --commit 3f877e0 --dist-dir /tmp/home-parent-target-fix-20261102/dist --only index.html` listed exactly one file: `index.html`.
- Deployment uploaded only `index.html`, reporting 164,127 bytes. The tool verified a fresh backup at `/home/sensdapt/senseisandy-predeploy-20261101T090623Z.tar.gz` before upload.
- Live `/` returned HTTP 200 at 320, 390, 767, and 768px. The link measured 44px at 320, 390, and 767px; it measured 26.39px at 768px as expected beyond the mobile rule boundary.
- Keyboard acceptance, contrast review, and Lighthouse/PageSpeed were not run.
