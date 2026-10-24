# WS-29 Phase 2 plan — mobile shell and actions

**Scope:** one ordered workstream on the isolated `/tmp/ws29-phase2` checkout at Phase 1 commit `b461560`. The parent agent reviews and integrates the work; no deployment or CI wiring is in this phase.

## Persona & Expert Framework

- Contextual `persona_quick.py --plan --json` returned `no_suitable_persona` with frontend and accessibility uncovered. The proposed `INSTRUCTIONS - CONTENT` asset (UUID `6e94db8f-e23d-4387-8cc6-bac209e890aa`) is about writing and does not fit shell implementation. No catalog role or instruction prompt was adopted. Work proceeds with an ordinary responsive frontend and accessibility specialist method.
- The repo's `design-taste-frontend` skill informs an audit-first, preserve-design pass. Design read: a local studio site for first-time students and parents, calm and compact on phones, using the existing Bootstrap 5.3 and native CSS system. Dials: variance 3, motion 2, density 4.
- Codebase Memory graph located the existing sticky visibility function; target markup is in shared navigation and footer includes. Bootstrap documentation was consulted through Context7 for the existing collapse and dropdown structure. A flat phone menu may be shown inside the same collapse while desktop dropdowns remain intact.

## Contract

- **Read:** Phase 0 baseline and defect log, Phase 1 report, shared nav/footer markup, site shell CSS, funnel page body classes, build and capture scripts.
- **Write:** `src/partials/nav-include.html`, the canonical footer includes needed by the five routes, `src/assets/css/mobile-foundation.css`, and Phase 2 plan/report/capture evidence under `docs/ws29/`. No page editorial copy, data, IDs, booking destinations, minified CSS, or dependency changes.
- **Verification:** build in this worktree; inspect 360/390/430/1280 captures for home, visit, Free Intro, pricing, programs, plus menu open states. Verify exact menu current state, control sizes, route links, safe-area and form/footer clearance; run ordered existing gates after the implementation.

## Definition of done

1. Below 768px, the header contains logo, one Text Sandy action, and menu in a single compact row. The desktop header is unchanged.
2. The phone menu opens as full-width rows. All interactive rows meet 44px; the current page/section is visibly marked; mobile dropdown links are directly available while desktop dropdown behavior stays intact.
3. The five funnel pages display one bottom action bar with Text Sandy and Reserve Free Intro. It respects the safe-area inset, hides at 768px and above, and yields when the footer or a form submit is visible.
4. At 360/390/430px, no affected page exceeds the requested viewport; the header, menu, and bottom actions remain readable and keyboard usable. At 1280px, the rendered shell matches the Phase 0 baseline apart from time-dependent page content.
5. A scoped report records files, captures, ordered QA gate results, and open production/owner-phone gates. The parent agent reviews before commit or release.
