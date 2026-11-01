# Hyphen Weekend mobile small-text release — 2026-11-02

## Scope and expert framework

This closes the documented mobile text-floor gap for native `<small>` copy on `/hyphen-weekend/`. The contextual persona selector found no suitable role. The ordinary specialist fallback was a static-site CSS and release engineer, paired with `Instructions - CODE` (UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, full source reviewed earlier in this goal). The selector's `INSTRUCTIONS - CONTENT` candidate was not a fit for CSS implementation.

## Change and verification

- Added a phone-only `.hw-page small { font-size: 14px; }` rule in `src/assets/css/hyphen-weekend.css`.
- Added a focused `scripts/deploy-release.py` mapping. A change to this stylesheet now requires the generated route to reference the active manifest fingerprint and deploys that stylesheet with `hyphen-weekend/index.html`.
- Updated only the Hyphen Weekend CSS entry in `src/assets/data/asset-hash-manifest.json`.
- Built from a clean detached checkout at `89b7895c`. `npm run build` exited 0. Root `dist/` was not built from or used.
- The local isolated render at 320px and 390px measured all 6 visible `<small>` elements at 14px, with no text below 14px and no horizontal overflow. At 1440px, the existing 13.33px small text remains unchanged; the correction is phone-only. Third-party requests were blocked.
- The deploy dry-run selected exactly `assets/css/hyphen-weekend.bdac9d.css` and `hyphen-weekend/index.html`.

## Commit and live proof

- Commit `19acddf4` — `fix: keep Hyphen Weekend small text readable on mobile`.
- Upload completed for exactly the two dry-run files: CSS 19,600 bytes; route 17,354 bytes.
- The deploy script verified a fresh rollback archive (`senseisandy-predeploy-20261101T102931Z.tar.gz`, 14,575 files), then rotated one older verified archive (1,127,715,782 bytes) under the configured retention rule.
- Live `/hyphen-weekend/` returned HTTP 200 and references the active stylesheet. The live CSS returned HTTP 200, measured 19,600 bytes, and its SHA-256 matched the isolated candidate: `669fcae34a0d40c62ddd086f5d2b46286051d0fe22e88ae7630e31f562b9f516`.
- Live headless Chromium proof at 320px and 390px measured all 6 `<small>` elements at 14px, none below the floor, and no horizontal overflow. At 1440px, all 6 measured 13.3333px with no overflow. Requests to other hosts were blocked.
- Browser Use 0.1.13 was checked, but its doctor found no active Chrome daemon or browser connection. The repeatable check used isolated Playwright with the installed Chrome binary and the approved local/browser network access; it did not use an interactive Browser Use session.

## Limits

No keyboard acceptance, site-wide contrast audit, Lighthouse, or PageSpeed check was run. The dirty root `dist/` and unrelated worktree changes were preserved.
