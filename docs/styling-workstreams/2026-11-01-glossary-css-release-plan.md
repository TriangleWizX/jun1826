# Glossary CSS dirty-tree release review — 2026-11-01

## Goal and scope

Reconcile the current dirty shared BJJ glossary CSS and glossary route outputs. Find any bounded source change that can be committed and deployed without shipping stale term pages or replacing the dirty generated tree. Keep the user-owned exclusions: no Lighthouse/PageSpeed, site-wide contrast audit, physical-keyboard acceptance, form submission, or broad rebuild of main `dist`.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; active goal role, with `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f` (full source previously inspected for this goal).
- **CSS/source worker:** Web-Ninja — Arachnia, UUID `94fbf051-34eb-413f-b8c6-824430c3529a`, complete, source `assets/indranet-prompt-exporter/exports/index.json`, no attachments. The full 1,940-character prompt was inspected. Fit: explicit HTML/CSS/JavaScript web-development scope and UX principles. Limit: it does not establish Eleventy or deployment-mapper expertise.
- **Output/release worker:** ordinary static-site output-mapping auditor fallback. The selector's highest candidate, Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, is rejected after reading its complete 896-character source: it describes creating a personal Markdown blog generator, not mapping an existing Eleventy site. The next UI/UX candidate is not a static-site release mapper. No persona adoption claimed for this workstream.
- **Instructions:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, readiness `ready`; complete source was previously inspected for the active goal. Apply source-to-output tracing, narrow scope, and verification. No attachments.
- **Code graph:** codebase-memory MCP returned `Transport closed` on repeated calls. Use scoped local literal/source searches as fallback for this audit and do not claim graph-backed discovery.
- **Design method:** use the previously approved `design-taste-frontend` audit-first method; preserve the glossary's established page system and avoid redesign.

## Read-only workstream contracts

| DoD ID | Owner lens | Read scope | Write scope | Completion evidence |
| --- | --- | --- | --- | --- |
| `GLOSSARY-CSS-SOURCE-20261101` | Web-Ninja; CODE instructions | Current dirty `src/assets/css/bjj-glossary.css`, `src/assets/css/pages/glossary.css`, hub and term source markup, earlier target-size/overflow records | None | Map every changed selector to active hub/term markup; separate hub behavior from term behavior; identify changes that depend on deferred keyboard or contrast acceptance. |
| `GLOSSARY-OUTPUT-MAP-20261101` | Ordinary Eleventy release-mapper fallback; CODE instructions | Dirty `dist/bjj-glossary/**`, `src/assets/data/asset-hash-manifest.json`, glossary page builder and aliases, `scripts/deploy-release.py`, current release reports | None | Reconcile each dirty source route with local generated route, fingerprinted assets, mapper behavior, and live route evidence; recommend exact payload or no-go. |

### Workspace inventory

| Workstream ID | Owner | Exact path | Purpose / base | Created | Expected size | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GLOSSARY-CSS-SOURCE-20261101` | Web-Ninja — Arachnia | `/tmp/glossary-css-source-audit-20261101/` | Detached read-only source/selector review at `b65926a`; no dependencies, generated `dist`, or browser profile | 2026-11-01 | ≤1.2 GiB | Closed after coordinator review; worktree removed | removed |
| `GLOSSARY-OUTPUT-MAP-20261101` | Ordinary Eleventy release-mapper fallback; coordinator owns isolated build and release | `/tmp/glossary-release-map-audit-20261101/` (closed) | Detached at `b65926a`; isolated build and local browser comparison completed; exact release deployed from isolated `dist` | 2026-11-01 | ≤2.0 GiB | Close after post-deploy route and stylesheet verification; then remove profile and worktree | closed; 1.6 GiB checkout and 9 MiB browser profile removed after preserving evidence |

## Coordinator review of read-only audits

- **Source audit:** `src/assets/css/bjj-glossary.css` maps to real hub and term markup. Hub selectors cover 44px chips, categories, A–Z controls, reader controls, focus rings, and responsive wrapping. Term selectors affect shared glossary controls across roughly 143–145 source pages. The `details > summary` selector is broader than the older FAQ-only selector and needs a scope check. `src/assets/css/pages/glossary.css` removes a 44px `min-width` now supplied by the shared glossary stylesheet. The diff mixes hit targets, focus styling, responsive layout, and link/hover colors.
- **Output audit:** current source edits are nine term files (`bottom-position`, `choke`, `drilling`, `frames`, `front-headlock-series`, `open-mat`, `position`, `roll`, `sweep-single`) plus both CSS files and the broad asset-hash manifest. Current dirty generated output modifies seven pages (`bottom-position`, `collar-grip`, `hip-escape`, `index`, `open-guard-pass`, `waiter-sweep`, `x-guard`); only `bottom-position` overlaps. The source-only and generated-only route sets are unresolved.
- `tools/build-glossary-pages.mjs` writes the glossary hub and term sources under `src/bjj-glossary/`. Current dirty output points at `bjj-glossary.f33d91.css`; hub output also carries `mobile-foundation.d8c863.css`. The glossary-style builder has a separate hub mapping. The generic mapper does not safely fan out the glossary subtree for these source edits; it only does so for a `.gitignore` change.
- **Current decision:** no-go for the existing root generated output. The October 31 report's route-set mismatch is still accurate, but its hub `payload_files=0` result is stale because current dirty hub output and fingerprint references differ. A scoped clean build in the recorded release-map worktree is the next coordinator check. Do not stage or deploy the current root `dist`, CSS source, or broad manifest before that build and route parity review.

## Shared release gates

- Do not stage or deploy current root `dist` output as release bytes.
- Integrate a source-only commit only when current evidence proves its behavior is intended and its public output is already byte-equivalent or can be produced in an isolated clean build.
- For any candidate release, use the exact route-specific build and `deploy-release.py --dry-run --only` paths; stop if the payload includes stale or unrelated term pages, shared CSS, manifest, or sitemap files.
- A release must include current-source browser checks for the affected glossary hub and term pages at 320px, 390px, and desktop widths. Keyboard/contrast checks remain excluded as directed.
- Keep all unreviewed term-page source and generated changes untouched.


## Release result — 2026-11-01

- Commit: `b7db4990` (`Release glossary CSS updates`). The commit contains the shared glossary stylesheet, seven reviewed term-page source class updates, the glossary fingerprint manifest entry, and a deploy mapper fan-out fix. The broad dirty root `dist` was not used.
- The isolated build produced the fingerprinted stylesheet `assets/css/bjj-glossary.f33d91.css` (51,328 bytes; SHA-256 `4aabafd0decbcac3eed785fff42528fd4f0a4f973e95331089830aad4ffa9a39`).
- Dry run and upload covered exactly 152 paths: the CSS asset and 151 glossary term routes. `choke` and `open-mat` remained excluded because their live main text/links differ from the isolated generated output.
- Post-deploy read-only verification returned HTTP 200 for all 151 routes; each references the new CSS. The live CSS returned HTTP 200 and matched the expected byte count and SHA-256. Evidence: `docs/styling-workstreams/evidence/2026-11-01/glossary-css-release/`.
- Local browser comparison found no horizontal overflow at 390px or 1440px on the glossary hub and representative term page; sampled controls met 44px target size. Keyboard and contrast acceptance were not run per owner direction. Lighthouse/PageSpeed were not run.
- The task-owned Browser Use daemon, Chromium, local server, profile, and isolated build checkout were closed after preserving release evidence.
- The broader goal remains active: unrelated dirty source, generated output, scripts, and documentation remain uncommitted and require separate scoped workstreams.
