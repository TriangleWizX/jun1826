# Dirty Worktree Commit and Release Plan — 2026-10-31

## Objective

Review the 905 remaining dirty paths in the main checkout, classify each by source ownership and release status, commit coherent approved changes, and deploy only generated public outputs that pass the repository release checks. Keep private, temporary, or duplicate evidence out of public payloads. Do not stage or discard unknown user work.

## Current baseline

- Main is at `5c87f625`; no paths are staged.
- Dirty state: 202 modified, 11 deleted, and 692 untracked paths (905 total). Largest groups: 566 docs/evidence paths, 113 generated `dist` paths, and 85 source paths. Untracked files total about 366 MB after removing 34 exact duplicates of committed screenshots (25.7 MB freed).
- The requested Kids/Teens schedule links are already in committed calendar code and live. The public schedule loads the inline-youth version of `schedule-month-calendar.js`; this is not additional dirty work.
- Recent HTTP verification and deployment authorization persist. Lighthouse/PageSpeed runs remain excluded by the owner's prior instruction.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, v4.0.0, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; source `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`. Previously read in full and applied for cross-workstream risk review and integration.
- **Master instructions:** `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`; source record `assets/indranet-prompt-exporter/exports/index.json`. The complete 1,500-character instruction text was inspected. Apply critical thinking, evidence checks, risk assessment, and clear reporting.
- **DW-SOURCE-1:** Debugger-Analyzer — Orko Debugulator, actual prompt UUID `d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`, v1.0.0; source `assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/versions/v1.0.0/prompt.json` (complete 2,835-character source read in chunks). Paired with `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, complete 1,500-character source record read from `index.json`. Fit: trace changed implementation files and separate supported, stale, and risky code changes.
- **DW-GENERATED-2:** Ordinary static-site release specialist fallback. The selector found no ready persona for release-path auditing; promising static-site and code-oracle candidates lacked an available full prompt source. Paired with `Instructions - CODE`. No persona adoption is claimed.
- **DW-RECORDS-3:** Ordinary documentation and evidence curator fallback. The catalog's Knowledge Manager prompt source was unavailable locally, so no persona adoption is claimed. Paired with `Instructions - COMPETENCE`.

## Read-only Workstream Contracts

| DoD | Workstream and write boundary | Read scope | Completion evidence |
| --- | --- | --- | --- |
| `DW-SOURCE-1` | Review changed application/source code. No write path; return findings to coordinator. | Changed `src/`, `js/`, `scripts/`, `tools/`, `tests/`, and `package.json` paths in main; compare with `HEAD`. | Every changed source path grouped by feature; source-of-truth and tests/QA mapped; sensitive or unsupported claims flagged; commit/deploy recommendation per group. |
| `DW-GENERATED-2` | Review generated outputs and release mapping. No write path; return findings to coordinator. | Changed/deleted `dist/` paths, `asset-hash-manifest.json`, build scripts, deployment script, and live route mappings. | Exact source-to-generated mapping; exact eligible deployment payload; deletions and cache-buster behavior explained; clean/dirty artifact hazards identified. |
| `DW-RECORDS-3` | Review docs, reports, screenshots, archives, and scratch files. No write path; return findings to coordinator. | Untracked/changed `docs/`, `assets/`, `scratch/`, `--help/`, and root artifacts. | Files classified as canonical docs, evidence, temporary outputs, exact duplicates, private/sensitive, or unknown; preserve/delete/commit recommendations with hashes/sizes. |
| `DW-RELEASE-4` | Coordinator integration and release. | Worker reports, exact changed paths, release script dry run, focused QA, live HTTP/content/browser proof. | Focused commits; exact generated payload(s); pre-deploy backup; live verification; final dirty paths are either resolved or individually documented with owner reason. |

## Safety and execution rules

1. Workers read the main dirty checkout but do not edit it, stage files, delete artifacts, create commits, or deploy.
2. Each worker uses a separately registered minimal worktree based on `2459515a`; no copied `dist`, dependencies, browser profiles, or full assets. Their report returns through the agent message, not a shared write path.
3. The coordinator stages exact paths only after reviewing all source/generated pairings. Do not release the root dirty `dist` file directly: `deploy-release.py --commit` selects eligible paths but reads bytes from its current checkout.
4. Skip untracked artifacts from public payloads. Before any cleanup, prove an exact committed duplicate or obtain owner direction.
5. Keep Lighthouse/PageSpeed and the owner's contrast review out of scope.

## Read-only audit results

- `DW-SOURCE-1` found 92 tracked source/code paths (+2,170/-573) plus 8 untracked code/tool paths. Changes span youth form analytics, homepage claims, global/page CSS, CSS builders, glossary/article generation, editorial/location pages, QA scripts, and three new pages. Keep shelved keyboard and site-wide contrast changes out; review claims, form event/privacy data, new pages, and source records before their release. `qa-cwv-lab` must remain unrun.
- `DW-GENERATED-2` found 113 dirty `dist` paths: 103 modified and 10 deleted across blog, location, glossary, source, free-intro, root, sitemap, and shared asset outputs. The nine deleted fingerprint variants need a clean build/manifest reconciliation; `dist/schedule.html` has 16 references and cannot be treated as a safe deletion. Never upload the dirty root pricing route, which contains local-only calculator/session links. The release tool reads bytes from its current checkout even when `--commit` is supplied.
- `DW-RECORDS-3` found 528 untracked docs/evidence files (~168 MB), 140 untracked viewport PNGs (~190 MB), nine personal-looking photos (~8 MB), three drafts, patches, and a bundle. There are no remaining exact duplicates of tracked blobs. Keep photos, drafts, evidence, patches, and bundle out of blanket commit/deployment; several evidence images are referenced by records. No high-confidence token/private-key pattern was found in scanned text paths.
- A separate, previously authorized repository cleanup commit `5c87f625` removes the obsolete tracked `.htaccess.bk`; it is not a production payload. The current `.htaccess` is a distinct file.
- The temporary `/tmp/dw-schedule-build-20261031/` checkout was removed after confirming no build process was active; the workspace inventory now records its closeout. This recovered about 1.2 GiB and does not alter the main worktree.
- These findings reject a single `git add -A` plus full-site deployment. Continue by reviewing coherent, source-backed release bundles in isolated clean builds. Do not call the overall dirty-worktree goal complete while unreviewed paths remain.
