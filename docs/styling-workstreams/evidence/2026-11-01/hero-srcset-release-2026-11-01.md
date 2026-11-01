# Mobile hero `srcset` release — 2026-11-01

## Workstream and decision

- **DoD:** `HERO-SRCSET-RELEASE-20261101`.
- **Role:** ordinary **Static-Site Asset Pipeline Auditor** fallback. `persona_quick.py --plan --json` returned `no_suitable_persona`; the ready `Instructions - COMPETENCE` result is a capability catalog, not a build/debug method. Applied the previously full-source-reviewed `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`). Codebase-memory MCP was unavailable (`Transport closed`), so the exact source/output paths were inspected directly.
- **Scope:** change the mobile image source on the minute-by-minute first-class blog route from `/assets/images/hero.89f093.webp` to the canonical `/assets/images/hero.webp`. The two local images were visually compared and match. The old hash-named path disappeared from a fresh build while the canonical image remained.

## Verification

- A detached clean-HEAD worktree at `581d6a7e` received only the source change. `npm run build` passed; the isolated generated route was 141,787 bytes and retained the canonical mobile `srcset`.
- `browser-use --doctor` initially found no Chrome process or daemon. After starting a dedicated loopback Chrome profile with off-origin DNS blocked, Browser Use connected to the local preview. At 320px and 390px, the image reported `complete: true`, `currentSrc: http://127.0.0.1:4173/assets/images/hero.webp`, and natural dimensions 1856×822. The task tab, preview server, and Chrome process were closed afterward.
- `deploy-release.py --dry-run --commit c95c22f --dist-dir /tmp/hero-srcset-release-20261101/dist --only blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html` listed exactly one route.

## Release and live proof

- Commit `c95c22f` contains the source change and the approved viewport comparison evidence. No generated `dist/` path was added to Git; the deploy helper maps the committed source path to its generated route.
- The first upload used the root ignored `dist/` route, which contained unrelated dirty shared-navigation CSS. After detecting that difference, the route was replaced from the isolated clean-HEAD build artifact. The final upload reported 141,787 remote bytes. The helper verified a fresh backup at `/home/sensdapt/senseisandy-predeploy-20261101T085105Z.tar.gz` (14,574 files). It removed one older backup through its configured rotation.
- A cache-bypassed live GET returned HTTP 200 for `/blog/exactly-what-happens-first-bjj-class-minute-by-minute/` (190,765 expanded response bytes). The expanded response contains one canonical mobile `srcset` and no legacy mobile reference. `/assets/images/hero.webp` returned HTTP 200 (69,664 bytes).
- The expanded live response contains `ss-keyboard-focus-fallback`, while the isolated route artifact does not. No keyboard acceptance claim is made; the user-reserved keyboard SOP remains open.

## Limits and remaining goal

- This closes only the mobile hero image delivery gap. It does not close the full styling goal or qualify the other dirty source/generated cohorts for deployment.
- The dirty-source viewport matrix remains 445/460, with 15 failures: Home and Videos target sizes, Bio text/viewport findings, and two phone samples on this route before the fix. The fix was verified on the isolated route at 320px and 390px; the full matrix was not rerun after the one-attribute change.
- Lighthouse/PageSpeed, keyboard acceptance, and site-wide contrast checks were not run. They remain owner-reserved.
