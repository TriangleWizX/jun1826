# Current dirty source output map — workstream plan

## Parent goal

Continue the approved goal to fix the dirty worktree, commit reviewed changes, and deploy only exact verified outputs. This wave maps current dirty production inputs to generated output; it does not approve a release or modify the main worktree.

## Persona and instructions

- Coordinator: ordinary static-site source/output mapping specialist. `persona_quick.py --plan --json` returned `no_suitable_persona`; the static-site-generator candidate was not a fit for source-to-output verification.
- Coordinator instructions: `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`), ready, source `assets/indranet-prompt-exporter/exports/index.json`. Full prompt text was inspected; no attachments. Apply evidence review, exact scope, and preserve unrelated files.
- Reviewer: ordinary read-only release-integrity reviewer fallback. The selector returned `no_suitable_persona`; the same ready instruction asset applies. Reviewer has its own clean checkout and no write path.

## Scope

- Base: current committed `HEAD` `dc06a6d8`.
- Overlay modified and untracked `src/` production inputs from the main checkout, except `src/assets/css/pages/law-enforcement.css.tmp`, which is an explicitly excluded temporary file.
- Include the modified production build helper `tools/build-article-styles.mjs` because its PurgeCSS safelist affects generated CSS.
- Exclude `dist/`, docs, screenshots, evidence, raw root photos, QA scripts, package-only QA command additions, and the dirty `scripts/deploy-release.py`. Use the committed mapper from the clean base.
- Do not edit, stage, or clean the main checkout. Do not run upload, live HTTP, Lighthouse, or PageSpeed checks in this mapping wave.

## Method

1. Build clean committed `HEAD` and record exact path/hash deltas and build counts.
2. Remove only that temporary build output, overlay the scoped source inputs from the root, rebuild cleanly, and record path/hash inventory.
3. Compare baseline and overlay outputs. In the isolated checkout only, create a temporary source-only commit so the committed deploy mapper can dry-run the exact changed-input set.
4. Have the independent reviewer inspect the input inventory, output/hash evidence, mapper payload, and any output paths that the mapper omits.
5. Close both temporary worktrees. Select a narrower requirement-backed source cohort for implementation/release only after reviewing the map.

## Definition of done

- Both isolated builds pass and use no root `dist/` files.
- Evidence records exact source paths/hashes, output additions/removals/changes, and the committed mapper payload for the temporary source-only commit.
- The independent reviewer confirms counts and identifies any mapping gaps or limits.
- No public deploy is performed from this broad overlay. The parent goal remains open until a focused, approved cohort is committed, deployed, and verified.

## Result and release hold

Both isolated builds passed after `fingerprint-assets.cjs --clean`; the final fingerprint check passed. The overlay covers 54 production inputs (53 dirty `src/` paths plus `tools/build-article-styles.mjs`). Compared with the clean baseline, it changes 506 generated paths: 31 added, 24 removed, and 451 changed.

The committed mapper returns 266 paths. It omits 328 changed outputs, including 257 whitelisted HTML routes, 35 CSS files, and one WebP. It also includes 88 paths with no output delta; 87 are unchanged dependencies and `schedule.html` is an intentional alias. The independent reviewer verified these counts and found likely sitewide navigation and CSS coverage gaps. Fingerprint cleanup passed, so stale fingerprint siblings do not explain the mismatch.

This broad overlay is not safe to deploy. Preserve all source and generated files. Use the path-by-path approval sheet to select a small source cohort; repair and verify its exact mapping before any upload. The mixed root `dist/` remains unused.
