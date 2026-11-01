# Current HEAD generated output audit — 2026-11-02

## Scope and routing

This is a read-only reconciliation step for the active goal to fix the dirty worktree, commit reviewed changes, and deploy exact approved outputs. It establishes current committed HEAD behavior; it does not classify or authorize the mixed dirty source tree.

- Coordinator: ordinary static-site release specialist fallback. `persona_quick.py --plan --json` returned `no_suitable_persona` for this output mapping task.
- Coordinator instructions: `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`), ready. Full prompt text was inspected from `assets/indranet-prompt-exporter/exports/index.json`; no attachments.
- Independent reviewer: ordinary release-integrity reviewer fallback. The selector also returned `no_suitable_persona`; the reviewer used the same ready `Instructions - COMPETENCE` asset. Its clean checkout was isolated from the build checkout.
- CodeGraph indexing in the primary checkout failed with `Transport closed`. The independent reviewer indexed its checkout but the graph excludes `scripts/`; the committed deploy mapper was inspected directly.

## Method

1. Build committed `b495bc6a` in `/tmp/head-output-map-20261102`, with the root `node_modules` linked by symlink and an isolated `dist/`.
2. Record exact build-vs-committed-`dist` paths and SHA-256 values in [the evidence JSON](evidence/2026-11-02/current-head-output-map/map.json).
3. Run the committed `scripts/deploy-release.py` in dry-run mode for `b495bc6a`, using an empty temporary config. Dry-run exits before network access.
4. Have a separate read-only checkout review the mapper and evidence.

## Results

- `npm run build` passed. The isolated output contains 2,229 files totaling 560,920,883 bytes.
- The build changes 100 tracked output paths relative to the committed generated tree: 99 modified and 1 deleted. The evidence records all modified-file hashes and the deleted path.
- `b495bc6a` changes no `src/` paths relative to its parent. The exact mapper dry-run returns `payload_files=0`.
- The independent reviewer confirmed the zero-file dry-run applies to this documentation-only commit. The 100 output differences are build-vs-committed-artifact drift; they are not attributed to an approved dirty source change.

## Disposition

No site payload is releasable from `b495bc6a`. Do not deploy the 100 build differences as a batch. The mixed root `dist/` was not read or used. For the next release, select one approved dirty source cohort, preserve unrelated work, build it from a clean base, and verify its exact mapper-approved payload before deployment.

## Completion

- Clean committed-HEAD build: complete.
- Exact mapper dry-run: complete; zero files for this docs-only commit.
- Independent review: complete; confirms the scope and limitations above.
- Dirty-source attribution and release: still open.
