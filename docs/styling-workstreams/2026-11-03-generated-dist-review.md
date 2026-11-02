# Generated `dist/` Output Review

This review covers the 81 generated files in `stash@{0}` under `dist/` (12,048 insertions and 2,486 deletions in the stash diff). It is separate from the source and QA reviews. The stash was not applied, and the current `dist/` tree was restored after the approved release.

**Decision recorded:** the user approved denying direct use of all nine generated-output groups. Rebuild from current source only if a later approved source change requires another release.

Reply with `1 deny, 2 deny...` to decide. **Recommendation: deny all direct use of these stash outputs.** They are generated snapshots; rebuild from the current approved sources and use the release script's exact payload if more output needs deployment.

## Output groups

1. **`dist/assets/css/**` — 10 files — DENY.** Includes fingerprinted Free Intro, home, and schedule styles, plus calendar styles. These hashes and generated CSS must come from the current source build.
2. **`dist/assets/js/schedule-month-calendar.js` — 1 file — DENY.** Regenerate from current JavaScript source so it stays paired with the active calendar bundle.
3. **`dist/bjj-classes/**` — 27 route pages — DENY.** Rebuild from canonical class and location sources; do not carry old generated copies forward.
4. **`dist/bjj-glossary/**` — 7 route pages — DENY.** Rebuild from the current glossary source and index.
5. **`dist/near/**` — 6 route pages — DENY.** Rebuild from current location sources.
6. **`dist/sources/**` — 7 pages — DENY.** Rebuild from current source-record data and templates.
7. **`dist/free-bjj-intro-tannersville-ny/**` — 2 pages — DENY.** Rebuild the intro and confirmation routes from current templates.
8. **Other route outputs — 5 pages — DENY.** `dist/instagram/index.html`, `dist/options-pricing/index.html`, `dist/schedule/index.html`, `dist/tactical-longevity/index.html`, and `dist/white-belt-foundations/index.html` should come from the current build.
9. **Root HTML and sitemap outputs — 16 files — DENY.** `dist/giveaway-rules.html`, `dist/index.html`, `dist/local-bjj-tournaments-for-families.html`, `dist/nav-include.html`, `dist/options-pricing.html`, `dist/pricing-module-fragment.html`, `dist/schedule.html`, `dist/sensei-jiu-jitsu.html`, `dist/sensei-studio.html`, `dist/sitemap-core.xml`, `dist/sitemap-glossary.xml`, `dist/sitemap-locations.xml`, `dist/sitemap-programs.xml`, `dist/sitemap-research.xml`, `dist/student-hub.html`, and `dist/womens-jiu-jitsu-tannersville.html` should also be regenerated, not copied from the stash.

## Why this is one deny decision

The stash outputs are an older generated snapshot, and all 81 differ from the current committed `dist/` files. The approved source changes are already represented in the current source tree, and the shared shell styling was built, fingerprinted, committed, and deployed from those sources. Copying the stash outputs risks mixing older pages and asset hashes with the current release.

Suggested reply: `1 deny, 2 deny, 3 deny, 4 deny, 5 deny, 6 deny, 7 deny, 8 deny, 9 deny`.
