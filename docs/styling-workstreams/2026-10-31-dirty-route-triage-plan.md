# Dirty route release triage — 2026-10-31

## Goal

Continue the active dirty-worktree release goal by independently checking two questionable source cohorts before integration. Both workstreams are read-only against production sources and generated output; each has a separate report path. No new checkout, browser profile, dependency, or generated build is created.

## Persona & Expert Framework

- **Coordinator:** continue the active goal coordinator and `Instructions - COMPETENCE` pairing recorded in the goal orchestration record. The coordinator owns scope, review, integration, and any release decision.
- **Near CSS worker candidate:** `Static Site Generator (Markdown to HTML, Blog, Docs, etc.)`, UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, source `assets/indranet-prompt-exporter/exports/index.json`, status partial, no attachments. The complete 896-character source describes a Markdown personal blog generator; it is rejected as a CSS/route-audit mismatch. Use an ordinary route-scoped CSS auditor fallback.
- **Core Culture worker:** selector returned `no_suitable_persona` for source-to-live redirect reconciliation. Use an ordinary static-route and release auditor fallback.
- **Worker instructions:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`, selector readiness `ready`, no attachments. The available 1,500-character source applies requirements-first inspection, small diffs, QA, and deployment mapping. It does not grant mutation or network authority.

## Workstream contracts

| DoD | Read paths | Write path | Allowed work | Verification |
| --- | --- | --- | --- | --- |
| `NEAR-CSS-CONSUMER-AUDIT-20261031` | Dirty `src/assets/css/pages/near.css`; route sources that load it; `high-end-near.css`; matching generated pages/assets; existing near and BJJ Classes reports; deploy mapper | `docs/styling-workstreams/2026-10-31-near-css-consumer-audit.md` | Read-only route/selector mapping and live checks within already approved public-page verification | Enumerate every live consumer of `near.css`; show exact body/element classes and active stylesheet; classify each dirty hunk as effective, ineffective, supported, or unresolved; name any exact payload only if proven. |
| `CORE-CULTURE-ROUTE-GATE-20261031` | Dirty Core Culture HTML/CSS source; generated route; redirect configuration; live canonical route; prior retirement/SEO decisions | `docs/styling-workstreams/2026-10-31-core-culture-route-gate.md` | Read-only source/output/redirect mapping and public HTTP verification | Establish whether the source route is active or redirects; confirm stylesheet and output mapping; recommend retain, integrate, or hold without changing or deleting any page. |

## Shared constraints

- Do not modify source, generated routes, deployment mappings, or public content in either worker stream.
- Do not stage or deploy any paths based on these audits alone.
- Preserve the unrelated schedule links and all other dirty work.
- Keep keyboard acceptance, site-wide contrast, Lighthouse, and PageSpeed checks shelved.
- Coordinator independently reviews each report and current Git/live state before any release.

## Coordinator review

- `CORE-CULTURE-ROUTE-GATE-20261031`: verified live `301` to `/parent-resources`, one-hop destination `200`; confirmed redirect authority in `src/_data/url-dispositions.json`, `config/legacy-redirects.json`, `src/.htaccess`, root `.htaccess`, and generated `dist/.htaccess`. The generated `dist/core-culture-parent-guide/index.html` still exists with retired Open Graph/Twitter URLs, but canonical route behavior redirects. Hold dirty source/CSS styling; no public release candidate.
- `NEAR-CSS-CONSUMER-AUDIT-20261031`: the dirty CSS has eight source consumers plus a placeholder. Its generated local CSS and route set do not match production stylesheet references, and the deploy mapper does not prove the needed HTML fan-out. Hold all three hunks; no public release candidate from this audit.
- No site source, generated route, redirect configuration, or deployment mapping was modified. The next step remains classification of another dirty cohort, not a broad build or stage.
