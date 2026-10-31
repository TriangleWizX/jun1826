# Programs Touch Targets — Release Record — 2026-10-31

## Scope

The Programs page had a secondary fourth card below the Kids, Teens, and Adults choices. The patch centers that card from 992px upward and makes the visit links and secondary audience links at least 44px tall for coarse pointers.

The generated page loads `tannersville.css` directly. The release mapper did not connect that stylesheet change to the generated `programs.html` route and fingerprinted CSS, so the commit adds that exact mapping and checks that the route points to one existing fingerprinted stylesheet.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05f8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`. The prior dirty-worktree release plan records the full-source review and adoption.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; source record in `assets/indranet-prompt-exporter/exports/index.json`. The prior plan records the full instruction text and its evidence and risk checks.
- **PROGRAM-TOUCH-1 reviewer:** no ready role persona fit the scoped CSS/accessibility review, so an ordinary specialist fallback was used. Paired with fully read `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`. The reviewer confirmed that the fourth card is the fourth direct `.col-md-4` child, that centering starts at Bootstrap's 992px `lg` breakpoint, and that the shared primary CTA rule plus these changes give coarse-pointer links 44px targets.
- **Generated-output reviewer:** ordinary static-site release specialist fallback; no suitable ready role persona was available. Independent review found no safe payload in the dirty main `dist`; it recommended an isolated clean build and exact route/asset selection.

## Changes and commit

Commit `d87c200` (`Fix Programs touch targets and release mapping`) contains four paths:

- `src/assets/css/pages/tannersville.css`: 25-line, page-scoped centering and coarse-pointer target rules.
- `src/assets/css/pages/tannersville.min.css`: regenerated from the source with the repository minifier.
- `src/assets/data/asset-hash-manifest.json`: only the two Tannersville stylesheet fingerprint entries were staged; unrelated dirty manifest edits remain unstaged.
- `scripts/deploy-release.py`: a changed Tannersville stylesheet now maps to `programs.html` and the single fingerprinted Tannersville CSS file referenced by that page.

The Programs markup already declares `high-end-near.css`. A clean build confirmed that source declaration, and the stylesheet includes page-programs selectors. The generated-output reviewer had flagged it for review; it was retained after the source and live asset checks.

## Build and browser evidence

`npm run build` passed in a clean isolated worktree at base `7ac2222` with only the reviewed stylesheet patch and synchronized minified source. It emitted 507 pages and generated `assets/css/pages/tannersville.66f343.css`. The stylesheet SHA-256 is `fbd1a9b2a83ec0ccce7266746e4aefd8395651ff12f7d1b5f06d3daf2a7c16e5`.

The `deploy-release.py --dry-run` for `d87c200`, filtered to the approved route and stylesheet, listed exactly:

- `programs.html`
- `assets/css/pages/tannersville.66f343.css`

Browser Use checked the isolated build and the deployed route. The local and live measurements showed:

| Width | Fourth card | Link targets | Overflow |
| ---: | --- | --- | --- |
| 390px | Full-width phone layout | Visit and secondary links: 44px | None |
| 768px | Left aligned | Coarse-pointer links: 44px | None |
| 991px | Left aligned in its row | Coarse-pointer links: 44px | None |
| 992px | Centered; measured left edge matched the calculated center | Coarse-pointer links: 44px | None |
| 1440px | Centered; measured left edge matched the calculated center | Five Free Intro CTAs present | None |

The deployed page also loaded the new fingerprinted stylesheet in Browser Use at 390px and 1440px. A live screenshot was reviewed at 390px. The 1440px screenshot request timed out, so desktop live evidence is the measured layout geometry and stylesheet load; a local 992px screenshot was also reviewed.

## Deployment and live verification

The deployment command exited successfully and reused the existing verified remote backup. The release tool's dry-run and upload were both restricted to the two paths listed above.

Live HTTP checks returned:

- `/programs?release=d87c200`: HTTP 200, HTML references `tannersville.66f343.css`.
- `/assets/css/pages/tannersville.66f343.css`: HTTP 200, `text/css`, 15,785 bytes, SHA-256 identical to the isolated build.
- The CSS contains both the fourth-card centering rule and the 44px coarse-pointer rules.
- The existing `high-end-near.4bfae6.css` dependency returned HTTP 200.

No Lighthouse or PageSpeed check was run; the owner reserved those checks. No form was submitted. Site-wide contrast and keyboard acceptance remain owner-reserved work.

## Rollback

If rollback is needed, rebuild from parent `7ac2222` and redeploy its generated `programs.html` plus the prior Tannersville fingerprint from that build. Leave the new immutable fingerprinted CSS file in place; it becomes an unused asset after the route is restored.

## Remaining dirty work

The main checkout's pre-existing dirty generated tree and unrelated source, documentation, media, and evidence remain untouched. The broad dirty-worktree commit/deploy goal is still open; this release closes only the Programs touch-target workstream.
