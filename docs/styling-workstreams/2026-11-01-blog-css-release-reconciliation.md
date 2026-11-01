# Blog CSS release reconciliation — 2026-11-01

## Scope

Reconcile the documented Blog hero badge wrap and CTA focus ring with the dirty source tree and current public output. Preserve other Blog typography, target-size, and alert-layout changes because this audit found no direct requirement evidence for those edits.

## Specialist framework

- The persona selector returned no suitable ready role for this static-site CSS release. Use an ordinary Blog CSS and release specialist fallback.
- Pair with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`; its full source was reviewed earlier in this goal. No attachment was required.
- Apply the existing-system, audit-first method: preserve the Bootstrap and site styling, use only the two documented fixes, build in a clean worktree, and compare the affected outputs with current live routes before release.

## Changes and verification

- Kept only `.page-blog .hero__inner > .badge` wrapping, `.page-blog .btn:focus-visible` outline styling, and the PurgeCSS safelist entry in the focused commit. The other dirty Blog CSS edits remain separate.
- The clean build at `0f2769a3` passed with `npm run build` (exit 0). It produced 33 changed Blog route files.
- All 33 affected public routes returned HTTP 200. Fourteen matched the clean build's main content and key metadata; 19 had live content or metadata differences and were excluded.
- The live inline-style scan found at least one of the two intended rules on 15 of the 33 routes. The per-route result for each selector was not preserved, so this does not prove that every matching route has both fixes or that all live pages have them.
- At least one generated candidate also changed non-CSS page output, including shared stylesheet references and sticky action bar markup. The dirty generated tree was not used as deploy bytes.
- The earlier handoff's 53-route payload could not be reconciled with this clean build's 33 changed Blog routes. Its exact path list and dry-run evidence are not present in the current checkout state, so that payload remains unverified.
- Browser Use doctor found another active daemon showing a local preview at `127.0.0.1:8320`. That browser and preview were left untouched. No visual browser check, keyboard acceptance, Lighthouse/PageSpeed, or site-wide contrast review was performed.
- The exact clean build worktree used 1,595,920,024 bytes and was removed after checking that no process used it. Its accepted source changes were preserved separately.

## Disposition

Commit the two source rules and builder safelist. Do not deploy Blog route files from this build: 19 outputs diverge from live content, and the live selector scan is not complete enough to prove that an upload is required or unnecessary. Reconcile the missing 53-route evidence separately. The broader dirty-worktree goal remains open; continue with other reviewed source and output cohorts.

Historical requirement evidence: `docs/mobile-desktop-styling-plan-2026-10-25.md` (badge wrap at lines 1472–1513; CTA focus at line 1631).
