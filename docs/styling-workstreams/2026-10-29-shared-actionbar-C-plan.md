# Shared mobile action-bar workstream C plan

Date: 2026-10-29
Goal: review, isolate, verify, and release the shared action-bar overlap changes after the completed Free Intro B release.

## Scope and constraints

C is the shared `.ss-mobile-actionbar` behavior currently mixed into `src/_includes/components/footer.njk`. It must prevent the fixed bar from covering another visible action target, across both IntersectionObserver and fallback execution. The prior B release (`59f0c062`) remains intact. Keep unrelated dirty `dist/`, CSS outputs, and shared checkout edits outside the C commit unless generated outputs are required by the exact source mapping. No Lighthouse/PageSpeed checks, form submissions, owner keyboard acceptance, or unrelated shared-footer changes.

The current uncommitted footer diff adds a broad action-target selector, intersection checks, target refresh on DOM changes, and a no-IntersectionObserver fallback. It changes all pages generated from this footer component. The existing static overlap audit (`scripts/qa-sticky-overlap.mjs`) audits five routes but its fallback checks only static contracts; it does not prove rendered behavior.

## Persona & Expert Framework

- Coordinator: ordinary shared-UI and static-site release specialist fallback. The contextual selector had no suitable persona; no persona adoption is claimed.
- Master instructions: `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, source `assets/indranet-prompt-exporter/exports/index.json`; catalog status `partial`, no readiness field, no attachments. Full available source reviewed. Apply observation, risk assessment, independent evidence, and bounded integration.
- Worker instructions: `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`; catalog status `partial`, no readiness field, no attachments. Full 1,500-character source reviewed. Apply focused code review, functional validation, build/deploy mapping, and regression checks.
- Codebase graph MCP returned `Transport closed`; source discovery falls back to focused `rg`, exact reads, git diffs, and isolated rendered output.

## Bounded workstreams

| DoD | Specialist role | Read scope | Write scope | Completion evidence |
| --- | --- | --- | --- | --- |
| C-01 | Shared browser-JS behavior auditor (ordinary fallback) | Footer diff, CSS visibility contract, prior overlap evidence | None | State-transition and false-positive/negative findings; concrete mobile and desktop scenario matrix |
| C-02 | Frontend runtime/performance auditor (ordinary fallback) | Footer diff, action-target volume, mutation/fallback observers, shared CSS | None | Churn/per-frame cost and compatibility risks, with source-backed recommendations |
| C-03 | Eleventy scoped-release auditor (ordinary fallback) | Layout inclusion paths, deploy helper, exact build outputs | None | Exact authored-route/output mapping and minimum safe deployment payload with dirty `dist` preservation steps |

The coordinator owns implementation, source isolation, independent integration review, verification, release, and final reporting. Workers do not write or access live systems. Their read-only reviews are separate and do not share write paths.

## Independent review results

- C-01 confirms the visibility scan's declaration ordering and target filtering are coherent. It recommends runtime state-transition checks because the existing overlap probe does not assert that this implementation hides and restores the bar.
- C-02 found that the no-IntersectionObserver fallback lacks the selector-attribute cache refresh used in the observer path and runs full geometry scans synchronously on scroll/resize/mutations. The code will mirror cache refresh and coalesce those scans with `requestAnimationFrame`.
- C-03 confirms `base.njk` selects `components/footer.njk` when `footerSsi` is unset/false; no assignment was found in `src`. The deploy helper treats this component as site-wide and reads upload bytes from main `dist`. The final path list must come from the isolated candidate's emitted HTML with the scanner, filtered through deployable roots and verified using the helper's exact dry-run.

Temporary build workspace owner record: coordinator; workstream `ACTIONBAR-C-BUILD-1`; planned path `/tmp/shared-actionbar-C-20261029/`; created 2026-10-29; clean committed source plus only the current `footer.njk` candidate, shared `node_modules` symlink only, no browser profile or copied dependencies; remove after output mapping and rendered checks. No worker workspace is needed because all three worker contracts are read-only.

Temporary browser owner record: coordinator; workstream `ACTIONBAR-C-RUNTIME-1`; planned profile `/tmp/actionbar-C-chrome-profile/`; created 2026-10-29 only for isolated local browser checks; no copied dependencies; stop browser and remove profile after state-transition evidence is saved.

## Definition of done

1. Resolve all material C-01/C-02 findings; the action bar appears when unobstructed and hides only while it would cover a visible usable action target.
2. Verify target visibility filtering for controls inside the bar, disabled/hidden controls, and dynamically inserted or enabled controls.
3. Verify both IntersectionObserver and no-IntersectionObserver paths, including page top, a conflicting lower-page control, footer approach, and a state change.
4. Confirm the action bar remains absent at desktop widths and preserves existing funnel/footer behavior where no overlap exists.
5. Build from clean committed source plus only reviewed C edits; enumerate every changed generated route and prove the exact deploy payload. Preserve and restore the dirty main generated tree byte-for-byte.
6. Commit only reviewed C source, required generated artifacts, and evidence. Deploy the exact payload under the standing authorization, then verify live HTTP/content/browser behavior separately from local evidence.
7. Close all owned temporary processes/workspaces and retain evidence. Lighthouse/PageSpeed and owner keyboard acceptance remain excluded.
