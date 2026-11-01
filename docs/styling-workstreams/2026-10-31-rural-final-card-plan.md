# Rural final card mobile layout review — 2026-10-31

## Goal and design read

Qualify the isolated 14-line phone breakpoint change on the Rural BJJ final conversion card, then commit and deploy it only if current-source rendering, generated-route mapping, and the exact deployment payload pass review. Reading this as a trust-first local service landing page for first-time students and parents. Preserve the current Rural page structure, copy, colors, and type; assess only the existing mobile card behavior.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`; active goal role, with `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f` (full source previously inspected for this goal).
- **Worker role:** Rural final-card CSS and static-route release auditor, ordinary specialist fallback. The contextual selector returned `no_suitable_persona` for accessibility/frontend. No persona adoption is claimed; no attachments are required.
- **Worker instructions:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, readiness `ready`; complete source was previously inspected for this active goal. Use requirements-first source review, inspect exact route ownership, and identify the narrow generated output.
- **Skill:** `design-taste-frontend` audit-first existing-system method, already approved as standard for similar styling work. Preserve this page's established visual language and make no redesign or shared-style changes.
- **Uncovered capability:** The selector did not identify a ready persona specifically suited to frontend accessibility or CSS route qualification; the ordinary specialist fallback remains explicit.

## Workstream contract — `RURAL-FINAL-CARD-QUALIFY-20261031`

| Field | Contract |
| --- | --- |
| Read paths | Current `src/rural-bjj-catskills.html` diff and markup; committed parent route; prior Rural overflow evidence and release scope notes; Eleventy build and deploy mapping configuration. |
| Write paths | None for worker. Coordinator may later use only the reviewed source hunk and its generated route. |
| Workspace | `/tmp/rural-final-card-audit-20261031/`, detached at current main `a6e008a`; no copied dependencies or generated `dist`. Coordinator review output/evidence may be kept in `/tmp/rural-final-card-preview-20261031/`; task-owned Chrome profile in `/tmp/rural-final-card-profile-20261031/`. |
| Allowed work | Worker: read-only selector-to-markup review, CSS behavior assessment, source/output/deploy mapping, and recommendation. Coordinator: after independent source review, may build into the exact inventoried preview directory and run scoped rendered layout checks. No network, staging, commit, deploy, or cleanup by worker. |
| Definition of done | Determine whether each declaration is required by an observable mobile defect; identify the exact route artifact and release mapper behavior; report a go/no-go and remaining verification. |
| Stop conditions | Stop if the patch's intended behavior has no supported acceptance need, if the route is materially different from live, or if the mapper cannot isolate the route output. |
| Closeout | Coordinator stops task-owned Chrome and preview servers, then removes the exact worktree, preview output, and profile after recording evidence; retain this plan and final evidence. |

## Workspace inventory

| Workstream ID | Owner | Exact path | Purpose / base | Created | Expected size | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `RURAL-FINAL-CARD-QUALIFY-20261031` | Ordinary CSS and static-route auditor fallback; coordinator Dr. Ada Turing | `/tmp/rural-final-card-audit-20261031/`, `/tmp/rural-final-card-preview-20261031/`, `/tmp/rural-final-card-profile-20261031/` | Detached review at `a6e008a`; shared `node_modules` symlink only; isolated Eleventy outputs and responsive measurements; task-owned headless Chrome | 2026-10-31 | ≤2.0 GiB combined | Closed after coordinator review; exact worktree, preview outputs, profile, servers, and Browser Use daemon removed | removed |

## Independent audit and coordinator verification

- The worker found the changed declarations map to `.rural-final-card` and its two direct child divs. Existing matrix evidence concerns the hero eyebrow only. The final-card label is `MOUNTAINTOP MARTIAL ARTS`, and no prior record identified a final-card overflow requirement. Worker recommendation: no-go absent a measured defect.
- Coordinator built baseline and candidate from isolated source with Eleventy `--input=src --output=...`; both builds exited 0 and emitted `rural-bjj-catskills.html`. The generated route map remains `src/rural-bjj-catskills.html` → `rural-bjj-catskills.html`.
- Browser Use attached to task-owned headless Chrome through CDP, with a unique temporary profile and host resolution limited to localhost. The user-level doctor initially had no running Chrome; after Chrome was started, Browser Use successfully read both local renders. Full-page screenshot capture timed out, so no screenshot is claimed or retained.
- At 320px, the baseline label occupies 233×22px on one line and the page scroll width is 320px. The candidate changes it to a 230×34px two-line box; the final card grows from 441px to 449px high while page scroll width remains 320px. At 390px both variants have a 358×399px card with a one-line label and no document overflow. At 768px the breakpoint is inactive and both variants have a 696×311px card with no overflow. At 1440px neither variant has document overflow.
- **Decision: no-go for this hunk.** The baseline has no final-card overflow; the candidate forces an extra line at 320px and increases card height by about 8px. Keep the 14-line source change unstaged and undeployed until a concrete owner requirement or reproducible defect supports it. No Lighthouse/PageSpeed, site-wide contrast, keyboard acceptance, or form submission occurred.
- **Closeout:** all temporary workspaces and browser processes created for this review were stopped and removed. Approximate reclaimed space: 2.1 GiB. The unrelated `/tmp/style-swarm-20261027-control` checkout remains untouched because it still contains unique unreviewed changes.

## Acceptance and release gates

- Inspect the changed card at narrow phone, tablet, and desktop widths, including eyebrow wrapping and action visibility; do not run Lighthouse/PageSpeed, site-wide contrast, or physical-keyboard acceptance.
- Build in a clean isolated output tree and compare the generated route with the current live route before deployment.
- Dry-run the deploy mapper with only the proven Rural route path. Stop on any additional payload.
- Commit the source hunk and generated route only after the acceptance need and exact release payload are independently verified; then deploy with rollback backup and confirm live HTTP/content/rendering.
- Preserve every unrelated dirty path and the root generated tree.
