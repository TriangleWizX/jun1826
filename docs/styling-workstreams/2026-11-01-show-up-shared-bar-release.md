# Show-Up Kit duplicate mobile action bar release — 2026-11-01

## Change and release

Removed the Show-Up page's duplicate fixed mobile action bar. The site-wide shared mobile action bar remains in place. The three next-step links keep their 44px minimum height.

- Main-branch source commit: `3c982e1` (`Remove duplicate Show-Up mobile action bar`).
- Isolated deploy candidate commit: `0ed05e4`; its Show-Up source and fingerprint mapping match the main-branch commit.
- The main checkout's mixed `dist/` and unrelated manifest edits were not staged or used as deploy input.
- The main checkout's dirty `scripts/deploy-release.py` was not used. The committed helper from the isolated checkout was used.
- Exact helper dry run and upload payload: `show-up-kit.html`, `assets/css/pages/show-up-kit.min.24f805.css`.
- Candidate route: 42,304 bytes, SHA-256 `75ef7249affd1db1e874de7127a9083f30be844573f2484526c58908c61d34b7`.
- Candidate stylesheet: 9,799 bytes, SHA-256 `bff68ddbecb9d07dcaba6f0f2f82017e3635254a523c072a0705e10672e61d9c`.
- Before upload, the helper verified `/home/sensdapt/senseisandy-predeploy-20261101T143114Z.tar.gz` (14,579 entries). It rotated out older archive `senseisandy-predeploy-20261101T123003Z.tar.gz` under the configured retention policy.
- Upload completed for both exact paths; helper reported remote byte counts 9,799 and 42,304.

## Verification

- Isolated clean build and managed-asset fingerprint check passed before this release continuation.
- Exact deploy-helper dry run selected two files and no others.
- Fresh live HTTPS request to `/show-up-kit` returned HTTP 200 and referenced `show-up-kit.min.24f805.css`.
- Fresh live HTTPS request to the fingerprinted stylesheet returned HTTP 200, 9,799 bytes, and SHA-256 identical to the candidate. It contains the 44px link rule and no Show-Up `.ss-mobile-sticky` rules.
- The live route no longer contains the duplicate page-bar markup.
- Browser Use connected to the approved isolated daemon, but navigation to the live domain produced Chrome's error page; this is not counted as rendered-live proof. Prior local candidate browser measurements remain separate from the live HTTP evidence.
- Lighthouse/PageSpeed and keyboard acceptance were not run; both remain owner-reserved.
