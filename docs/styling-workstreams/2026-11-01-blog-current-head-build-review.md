# Blog current-head build review — 2026-11-01

## Scope

Recheck the committed Blog badge/focus fix (`71f1278e`) from current committed `HEAD` (`851b482c`) without using or rebuilding the dirty main `dist/` tree.

## Evidence

- A registered clean worktree at `851b482c` ran `npm run build` successfully. The worktree used the main `node_modules` through a symlink; no dependencies were copied.
- The mapper dry run for `71f1278e` listed 99 paths: 87 Blog routes, 3 BJJ class routes, and 9 CSS outputs. The exact list is preserved in [the dry-run evidence](evidence/2026-11-01/blog-legacy-cleanup/current-head-851b482-dry-run.txt).
- The mapper’s 99 files come from `tools/build-article-styles.mjs` and the committed Blog CSS change. Current `HEAD` also includes later source commits, including a Blog article source change, shared CSS changes, and other route fixes. Therefore, a build from `851b482c` is not an exact build of commit `71f1278e` alone.
- Earlier route-level production evidence in [the Blog route audit](2026-11-01-blog-current-route-audit.md) found route/output differences and candidate fingerprints returning 404. This current pass did not refresh those external results.
- No upload or production change was made. No Lighthouse/PageSpeed, keyboard acceptance, or site-wide contrast check was run.

## Disposition

Hold this Blog deployment. The exact commit and route content need to be aligned before releasing the 99 paths. The clean build worktree and its generated output were removed after preserving the dry-run list, reclaiming 1,623,772,311 bytes. The main dirty source and `dist/` were left untouched.
