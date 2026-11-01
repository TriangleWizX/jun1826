# Family page eyebrow release — 2026-10-31

## Scope

Raised the “Comparing Family Martial Arts” eyebrow to 14px (`0.875rem`) with a `1.3` line height. The source change was isolated to `src/family-jiu-jitsu.html`. The contextual persona selector found no suitable persona. `Instructions - CODE` was a candidate, but its full source helper was missing, so this release used an ordinary static-site release specialist fallback without claiming persona adoption.

## Build and release evidence

- Built only `src/family-jiu-jitsu.html` with Eleventy into `/tmp/family-eyebrow-release-20261031/`. Eleventy copied 502 MiB of unrelated site output; those copied files were removed, leaving only the 68 KiB route artifact and later browser evidence.
- Compared the isolated route with `dist/family-jiu-jitsu/index.html`. After normalizing asset fingerprint suffixes only, the HTML matched exactly.
- Committed as `ad66ef6` (`fix: set family page eyebrow type floor`).
- `scripts/deploy-release.py --commit HEAD --dry-run --only family-jiu-jitsu/index.html` selected exactly one file: `family-jiu-jitsu/index.html`.
- Deployment verified a fresh rollback archive at `/home/sensdapt/senseisandy-predeploy-20261101T032724Z.tar.gz` containing 14,572 files, then uploaded the route at 58,274 bytes. The backup rotation removed one older verified archive of 1,130,784,170 bytes.
- Live `https://senseisandy.com/family-jiu-jitsu` returned HTTP 200 and contained the new eyebrow rule.
- Isolated browser proof returned HTTP 200 at 390×844 and 1440×1000, with no horizontal overflow or page errors. Screenshots and rendered files were kept only in the temporary workspace and removed after review.

No Lighthouse or PageSpeed check, keyboard acceptance, or site-wide contrast review was run.
