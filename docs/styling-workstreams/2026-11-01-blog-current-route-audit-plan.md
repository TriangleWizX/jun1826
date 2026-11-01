# Blog current-source route audit plan — 2026-11-01

## Goal

Reconcile the committed Blog CSS delivery fixes (`71f1278e`) against a fresh build of current committed source and current public output. Determine whether any exact, safe generated payload remains. Preserve the mixed main `dist/` and all unrelated dirty work.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing (`937a02cd-470a-4211-b880-b05bdf8bf585`), carried forward from the active goal plan. Owns scope, isolated workspace, release decision, integration, and final verification.
- **Master instructions:** `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`), ready; full source was reviewed earlier in the active goal. Apply bounded contracts, explicit stop conditions, evidence review, and closeout.
- **Workstream specialist:** ordinary fallback **Blog Live-Route and Generated-Output Reconciler**. The selector's top candidate, Static Site Generator (`10974975-0c53-4e27-bdca-e95e86ccb2e9`), has a partial, 896-character prompt focused on writing a personal Markdown blog generator, so it does not fit live release reconciliation. MainFrame is a wireframe role. TestForge's required attachment is not available locally. Orko Debugulator was used for the preceding Blog audit, so it is not reused for this distinct gap. No Indranet role persona is claimed for this workstream.
- **Workstream instruction:** `Instructions - CODE` (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`), selector readiness `ready`, source `assets/indranet-prompt-exporter/exports/index.json`, no attachments. Full 1,500-character source was inspected. Apply its code review, functional verification, QA, and deploy-mapping methods; do not infer a release from a build pass alone.
- **Tools and source status:** codebase-memory MCP returned `Transport closed`; scoped Git, mapper, build, and HTTP evidence are the fallback. The prior 99-file payload is stale and must be regenerated from current committed `HEAD`.

## Bounded workstreams

| DoD | Owner and write scope | Read scope | Completion criteria and stop condition |
| --- | --- | --- | --- |
| `BLOG-CURRENT-CLEAN-BUILD-20261101` | Coordinator; isolated worktree `/tmp/blog-current-route-audit-20261101/`; no writes to main source or root `dist/` | Current committed source, `71f1278e`, `scripts/deploy-release.py`, asset manifest, prior Blog audit records | Build current `HEAD`, run exact mapper dry-run, retain candidate output list and build result. Stop on build failure, missing fingerprint, or unexpected mapper output. |
| `BLOG-CURRENT-LIVE-MATRIX-20261101` | Independent read-only auditor; report only at `docs/styling-workstreams/2026-11-01-blog-current-route-audit.md` | Exact current mapper output and candidate route/CSS files; public counterparts for each mapped path | Compare every mapped output with live status/content and identify route-level divergence and whether the intended fixes are missing. No code changes or upload. Stop and recommend hold if any output would overwrite unrelated live content or if an output cannot be verified. |

## Shared constraints

- Use the single registered clean worktree as the source/build candidate; no second checkout for read-only review.
- Share root `node_modules` by symlink only if required. No copied dependencies, browser profile, root `dist/`, or site-wide build output elsewhere.
- No deployment in this audit. A later release requires exact current payload, independent coordinator review, and the already-authorized production backup/deploy gates.
- Exclude Lighthouse/PageSpeed, site-wide contrast, keyboard acceptance, and unrelated Blog CSS edits.
- Close the exact worktree in-session after durable evidence is recorded; update the workspace inventory and pass preflight.

## Coordinator review and disposition

- Fresh build at `535e5aae` passed. The current mapper returned 99 unique paths: 90 HTML and 9 CSS.
- Independent review confirmed the auditor's route matrix has 90 unique HTML rows and 9 unique CSS rows; their union matches all 99 mapper outputs exactly.
- All 99 production GETs completed. Ninety-seven returned HTTP 200. The two 404s are new candidate-only fingerprint URLs, not currently deployed production references.
- Six of nine CSS outputs match live bytes. The badge-wrap rule is absent from the live Blog routes; the committed focus rule is absent on `bjj-schedule-windham-ny` and `confidence-protocol`.
- All 90 candidate HTML outputs differ from live visible text and asset references. Some metadata differs as well. These differences are not explained by the two CSS fixes, so no complete route payload or safe subset was established.
- **Decision: hold Blog deployment.** Preserve `71f1278e` as the source fix, keep unrelated dirty Blog styling local, and do not use the dirty main `dist/`. A later release needs a reviewed way to apply only the approved CSS changes while retaining current live page content and asset references.
- The clean worktree was removed after the report was saved; no source or deployment mutation occurred during this audit.
