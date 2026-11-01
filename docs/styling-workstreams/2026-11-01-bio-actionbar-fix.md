# Bio mobile action bar fix — 2026-11-01

This workstream fixes the `/bio` Reserve CTA clipping found in the 460-sample viewport run. The initial matrix had 459 passing samples and one failure: at 320×720 the full “Reserve Free Intro” label painted beyond the action bar and viewport. The availability proxy recorded 457 HTTP 200 responses and no proxy errors.

The Bio-only mobile rules in `src/assets/css/pages/bio-mobile-fixes.css` let action bar labels wrap and stay visible. `scripts/deploy-release.py` now maps this CSS input to both the generated `bio.html` and its fingerprinted stylesheet, so a CSS-only commit releases the reference and the asset together.

## Verification and release

- Isolated candidate build completed; fingerprint check passed for 160 managed assets.
- Browser checks passed at 320×720, 360×640, and 390×844. The complete CTA is visible, the target is 44px tall, and document width equals viewport width.
- Live browser checks passed at 320×720 and 390×844. Both loaded `/assets/css/pages/bio-mobile-fixes.dec1ca.css`.
- Live route returned HTTP 200; the deployed CSS SHA-256 matched the built asset: `6d75e59192bdeea10845cc1ab4d5c69f7e2a7bd3af4a37a56f7241949263fcc0`.
- Commit `4f4be833` deployed exactly `bio.html` and `assets/css/pages/bio-mobile-fixes.dec1ca.css`.
- Lighthouse/PageSpeed and keyboard acceptance were not run. The complete 460-sample matrix was not rerun after the focused fix.

## Evidence

- [Initial matrix report](evidence/2026-11-01/bio-actionbar/matrix-before.md)
- [Focused results](evidence/2026-11-01/bio-actionbar/focused-results.json)
- [Before screenshot at 320px](evidence/2026-11-01/bio-actionbar/bio-320-before.png)
- [Live screenshot after fix at 320px](evidence/2026-11-01/bio-actionbar/bio-320-live-after.png)
- [Availability proxy diagnostics](evidence/2026-11-01/bio-actionbar/availability-proxy-diagnostics.json)

The broader dirty worktree goal remains open. During this workstream, one build command was mistakenly run from the root checkout and changed generated `dist/` output. Those paths remain dirty and unstaged; no broad generated output was deployed. The original root `dist/` state before that build was not snapshotted, so do not assume those generated files match their earlier contents.
