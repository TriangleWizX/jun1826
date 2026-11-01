# Schedule links and linked calculator routes: release plan

Status: active. Scope is to reconcile the dirty Schedule contact-card links and their two untracked route sources with canonical facts, current generated output, exact deploy mapping, and live verification. The main checkout's dirty `dist/` is not release input.

## Persona & Expert Framework

- **Coordinator role:** Static Site Release Coordinator, ordinary specialist fallback. The selector found no suitable coordinator profile for mixed dirty-source, Eleventy output, and release-map reconciliation.
- **Coordinator instructions:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`, ready, no attachments. Its source covers task decomposition, code review, QA, build, deploy, and preservation of scope. Apply it through exact diffs, isolated generated output, release-map dry run, narrow commit, and live proof.
- **Rejected candidates:** `Solon SEO Sage`, UUID `2d52210b-edae-48f2-b5a5-095e3dd4c523`, was an ambiguous SEO match without pricing/offer verification methods. `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, was returned as the instruction asset but is promotional competency copy, not an execution or evidence method. Neither is adopted.
- **Worker role:** Canonical Pricing and Offer Claim Auditor, ordinary specialist fallback. An independent source audit is required because calculator and video-page copy contains public rates, discounts, capacity, included items, and guarantee claims.
- **Worker instructions:** `INSTRUCTIONS - Business Operations`, UUID `c3369696-d996-447e-8973-5f2cd73d33c9`, source `assets/indranet-prompt-exporter/exports/index.json`, ready, no attachments. Use its data-analysis and risk-assessment lens only; host verification criteria below govern conclusions.

## Bounded workstreams

| DoD | Owner / role | Read paths | Write paths | Completion evidence |
| --- | --- | --- | --- | --- |
| `CLAIM-CANONICAL-1` | Independent worker; Canonical Pricing and Offer Claim Auditor (ordinary fallback) | `src/video-goal-session.html`, `src/sales-calculator.html`, `src/_data/pricing.json`, `src/_data/offers.json`, `src/_data/schedule.json`, claim registry and cited terms | `docs/styling-workstreams/2026-11-01-calculator-claim-audit.md` only | Every material price, discount, schedule, capacity, inclusion, private-coaching comparison, and guarantee claim classified as supported, conflicting, or unverified with exact source pointers; no copy edits |
| `ROUTE-OUTPUT-MAP-1` | Coordinator; Static Site Release Coordinator | `src/schedule.html`, the two route sources, Eleventy config/layout, committed and dirty deployment helper, current main status and generated `dist/` | This plan and separate isolated candidate after inventory gate | Candidate build proves all three linked routes and their canonical URLs; exact generated payload dry run includes only approved routes and required assets |
| `SCHEDULE-TARGETS-1` | Coordinator; Schedule Link Target Auditor, ordinary specialist fallback | `src/schedule.html`, `src/assets/css/pages/schedule.css`, isolated generated Schedule route, production Schedule response | `docs/styling-workstreams/evidence/2026-11-01/schedule-link-target-source-render.json` | Visible standalone links remain at least 44px at 320/390/1440 with no horizontal overflow; live HTML contains the corresponding scoped rule |

## Current findings and gates

- Dirty `src/schedule.html` adds links to `/video-goal-session` and `/sales-calculator`.
- The two linked sources are untracked and declare `/video-goal-session/index.html` and `/sales-calculator/index.html` permalinks. Neither destination currently appears as a changed generated route in the main checkout status.
- The calculator embeds tuition and offer values in inline JavaScript. Canonical `src/_data/pricing.json` contains a pricing ladder, but annual and household terms do not match the page's simplified `save 2 months` and `15% on second family member` claims. The 30-day guarantee, capacity, uniform value, and private-session comparison require exact term-level checks.
- The video page contains the phrase `ZERO SWEAT`; repository copy rules prohibit “zero.” Its schedule and capped-class claims also need authority checks.
- `SCHEDULE-TARGETS-1` is **met for the current source and confirmed in live HTML**. The committed rule `.page-schedule .ss-schedule-target { min-height:44px }` was measured in the isolated generated route at 320, 390, and 1440px; all three standalone links were at least 44px and the page had no horizontal overflow. Production `/schedule` returned HTTP 200 and contains the same scoped rule. Exact measurements are in `evidence/2026-11-01/schedule-link-target-source-render.json`. The live browser itself was not rendered in this check.
- Isolated `npm run build` emitted the Schedule and both new route files. `npm run qa:volatile-facts` passed 580 files. Global `fingerprint-assets.cjs --check` failed on 16 stale image/manifest items in the isolated full build; those are not attributed to the Schedule route and remain an overall release gate if a broader payload is proposed.
- The CodeGraph MCP returned `Transport closed`; source discovery uses scoped repository inspection until that service is available.
- Release is held until both claim audit and route-map gates pass. Lighthouse/PageSpeed and keyboard acceptance remain owner-reserved.
