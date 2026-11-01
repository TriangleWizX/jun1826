# Show-Up Kit 44px next-step links release — 2026-11-01

## Scope

Applied the documented 44px minimum tap target to the three next-step links in the Show-Up Kit check-links row. The shared sticky action bar and other dirty Show-Up Kit edits were not part of this release.

## Source and generated output

- Main release commit: `b162220` — `Fix Show-Up Kit next-step tap targets`.
- Isolated candidate commit: `df04de2`.
- Source files: `src/assets/css/pages/show-up-kit.css`, its minified companion, `src/assets/data/asset-hash-manifest.json`, and the focused Show-Up Kit mapping in `scripts/deploy-release.py`.
- Active stylesheet: `/assets/css/pages/show-up-kit.min.7bf446.css`.
- Exact deploy payload: `show-up-kit.html` and `assets/css/pages/show-up-kit.min.7bf446.css`.
- The generated route references the active fingerprint. Remote stylesheet SHA-256 is `12d0566e9de1c4cac5496464625d083d4c91b3ee32220b43fb94a6475872f470` and matches the isolated candidate bytes.

## Verification

- Clean isolated build completed before release.
- Browser Use local rendering checked the route at 320px, 390px, and 1440px. “Finish the waiver,” “Text Sandy,” and “Maps” each measured 44px. No horizontal overflow, overlap, or JavaScript errors were observed.
- Deployment mapper dry run returned exactly the two payload files listed above.
- Production backup verified before upload: `/home/sensdapt/senseisandy-predeploy-20261101T131339Z.tar.gz`, containing 14,578 entries.
- The helper uploaded the stylesheet (10,570 bytes) and route (42,693 bytes).
- Live route returned HTTP 200 and redirected to the canonical `/show-up-kit` URL. Its HTML references the active fingerprinted stylesheet.
- Live stylesheet returned HTTP 200, matched the candidate byte-for-byte, and contains the 44px link rule.
- Post-release backup audit found two valid archives and no invalid archives. The next rotation candidate is the older `/home/sensdapt/senseisandy-predeploy-20261101T123003Z.tar.gz` archive.
- A post-deploy interactive browser session was not available: `browser-use --doctor` reported no running Chrome or Browser Use daemon. The local rendered-browser check plus the live route/CSS byte checks provide the release evidence.

## Rollback

Restore the pre-release `show-up-kit.html` and active stylesheet from the verified archive `senseisandy-predeploy-20261101T131339Z.tar.gz`. The release changed only those two production paths.

## Exclusions and remaining work

No Lighthouse/PageSpeed, site-wide contrast review, keyboard acceptance, or real form submission was performed. Keyboard acceptance remains in the owner SOP. The main checkout’s unrelated dirty source and generated output remain untouched.
