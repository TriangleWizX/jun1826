# Rural hero eyebrow release — 2026-10-31

## Scope

Released only the documented mobile wrap rule for the long Rural BJJ hero eyebrow in `src/rural-bjj-catskills.html`. The main checkout also contained a separate 14-line `.rural-final-card` layout change; it was not included in the staged commit or generated route and remains untouched. The earlier scoped audit selected the ordinary fallback **Rural BJJ Eyebrow Wrapping Specialist** and reviewed the available `Instructions - CODE` source.

## Build and release evidence

- Created a detached worktree at `8aea37b` and applied only the seven-line hero rule. `npm run build` completed successfully. The generated `dist/rural-bjj-catskills.html` SHA-256 was `b01bd865e31901d756eeabbd2fe3f692fd812fbe4e79681d30baa3c00dcc741d`.
- Verified all candidate asset references were present in the live route; no additional asset payload was needed.
- Staged and committed only the hero rule as `365d8fc` (`fix: wrap rural hero label on mobile`). The separate card-layout hunk remains unstaged.
- Dry run selected exactly `rural-bjj-catskills.html`.
- Deployment verified a fresh rollback archive at `/home/sensdapt/senseisandy-predeploy-20261101T033554Z.tar.gz` containing 14,572 files, then uploaded the route at 44,854 bytes. Backup rotation removed one older verified archive of 1,130,765,631 bytes.
- Live `https://senseisandy.com/rural-bjj-catskills` returned HTTP 200 with the hero rule and without the unreviewed card-layout block.
- Post-deploy browser proof returned HTTP 200 at 390×844 and 1440×1000, with no horizontal overflow or page errors.
- Before deployment, the main checkout's ignored `dist/rural-bjj-catskills.html` was saved (`22d71720…`), temporarily replaced with the isolated candidate, and restored. The restored file's SHA-256 again matched `22d71720…`.

No Lighthouse or PageSpeed check, keyboard acceptance, or site-wide contrast review was run.
