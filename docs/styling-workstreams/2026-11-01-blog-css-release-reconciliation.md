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

## Reconciliation update — 2026-11-02

- Current HEAD is `71f1278e`. The two source changes above are committed; the Blog source file has additional unrelated dirty styling edits and the current `dist/blog` tree has 33 modified routes.
- The historical 53-route dry-run in `/tmp/blog-css-release-20261102/deploy-dry-run.txt` targets `6722bb70349fe9af7ca5cb7569bf3b20b1fb2a36`, which is not an ancestor of current HEAD. Only 15 of those old output files matched that commit's bytes; the remainder differ or are absent. The candidate set overlaps 15 of today's 33 dirty Blog routes. It is not a trustworthy deployment payload.
- The current 33-route `dist/blog` diff adds roughly 181 lines to most pages because the inline article CSS was regenerated. `bjj-sensei` has substantially larger changes. This checkout's `dist/` remains mixed with unrelated generated changes; no Blog output was staged or deployed.
- `src/assets/css/blog.css` currently contains other local typography, target-size, and mobile alert changes. Those are outside the two already committed fixes. The current source diff also has formatting-only churn; do not bundle it with the committed fix absent a separate approved requirement.
- Current status still includes unrelated dirty `src/schedule.html` and `dist/schedule.html`; prior live verification established the `Kids` and `Teens` links already appear directly after times. No schedule output was deployed from the mixed tree.
- Workspace lifecycle preflight passed on 2026-11-02. Both registered worktrees remain retained pending their recorded evidence review. No cleanup or deployment was performed in this reconciliation.
- Codebase-memory MCP was unavailable (`Transport closed`); targeted Git diff/status and repository docs were used instead. No build, Lighthouse/PageSpeed, site-wide contrast, or keyboard acceptance run was performed.

## Disposition

Hold the Blog deployment until a fresh isolated build from current committed source yields an exact payload and route-by-route comparison proves that only the intended committed CSS changes are delivered, or until a new release scope is established for the other Blog styling edits. The current mixed root `dist/` and stale 53-route handoff are not suitable deployment inputs. Continue the broader dirty-worktree reconciliation by exact path cohorts, preserving unrelated dirty work.

## Live selector coverage correction — 2026-11-01

The follow-up audit checked all 87 mapped Blog pages and seven production-linked same-origin CSS files. It found both committed rules on 71/87 pages. Its route table initially omitted `blog/index.html`; a focused live GET confirmed HTTP 200 and both rules on that route, so the 71/87 totals stand. Sixteen routes lack the rules. Full method and route evidence: [Blog live selector correction audit](evidence/2026-11-01/blog-live-selector-recheck.md).

This closes the selector-count uncertainty only. It does not resolve the 99-output route/reference mismatch or authorize deployment from the dirty root `dist/`.
