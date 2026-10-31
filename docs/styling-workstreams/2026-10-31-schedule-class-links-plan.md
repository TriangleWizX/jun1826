# Schedule class-page links

## Goal

Every actual class listed for a date in the month calendar should link to the matching existing class or program detail page. The schedule’s booking links must remain separate and usable. Non-class closures must not look like class links.

## Persona & Expert Framework

- **Coordinator:** AI SuperExpert Agent Specialist — Dr. Ada Turing, v4.0.0, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`. Source: `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json`; SHA-256 of the full `text` field: `7e9919c2325eb5aba5c645f41b21c977a077a563161de22cea6caf8583ada092`; attachments: none. Fit: agent orchestration, systems analysis, risk review, code review, and project management. Applied by decomposing route, interface, and release checks into isolated read-only workstreams and retaining coordinator review of the final mapping and output.
- **INSTRUCTIONS asset:** no complete, source-backed Indranet instructions asset was available. The `Instructions - CODE` candidate (`25a8fe8a-c164-4e8e-8236-3a6585bfa165`) and `Instructions - COMPETENCE` candidate (`e144b81f-10ea-41a6-a06c-03d69dfb738f`) are marked partial in the export index and lack their full `prompt.json` sources. Use the fully read repository schedule workflow at `/home/twizss/.codex/memories/skills/tmb-schedule-sync/SKILL.md` plus `assets/indranet-prompt-exporter/skills/plan-persona/SKILL.md` as the applicable instructions. Their methods are dirty-tree preservation, canonical schedule review, complete renderer/feed tracing, exact-output release mapping, and rendered mobile/desktop/no-JavaScript verification.
- **Worker persona selection:** the selector found no suitable source-backed calendar-route, accessibility, or static-release persona. The closest index candidates were rejected because their full prompt exports are missing or their focus does not fit. Workers use distinct ordinary specialist fallbacks: schedule route mapper, calendar interaction/accessibility auditor, and static-site release engineer. They have read-only contracts and no write paths.

## Workstreams

| DoD | Workstream | Owner/persona | Read paths | Write paths | Verification |
| --- | --- | --- | --- | --- | --- |
| D1 | Map every current class record to the correct existing detail route; distinguish classes from events and closures. | SCL-DATA-1, schedule route mapper (ordinary fallback) | `src/_data/schedule.json`, `src/bjj-classes/`, `src/white-belt-foundations/index.html`, `src/alley-bootcamp/index.html`, `src/womens-jiu-jitsu-tannersville.html`, `src/halloween-spooktacular.html`, `src/holiday-schedule.html` | None | Report each audience/program destination with file evidence; identify ambiguous entries. |
| D2 | Audit every class renderer and semantic interaction. | SCL-UI-1, calendar interaction/accessibility auditor (ordinary fallback) | `src/assets/js/schedule-month-calendar.js`, `src/assets/css/pages/schedule-month-calendar.css`, `src/schedule.html` | None | Report desktop, selected-day, mobile, and next-class renderers; verify native link semantics, keyboard focus, and separate booking actions. |
| D3 | Review exact generated-output mapping and safe release method around dirty source/output. | SCL-RELEASE-1, static-site release engineer (ordinary fallback) | `scripts/deploy-release.py`, `package.json`, `src/schedule.html`, `src/assets/js/schedule-month-calendar.js`, current `dist/schedule/index.html` snapshot | None | Identify exact output paths, focused QA, isolated build approach, and dirty paths to preserve. |

## Definition of Done

- D1: every current class category has a verified existing class/program detail destination; closures stay non-linkable and event records without class pages are distinguished from class records.
- D2: every actual class entry links to its class page in the desktop date grid, selected-day details, and mobile date details. The next-class listing is consistent. Booking links remain separate. Links use native anchors with visible focus.
- D3: an isolated build proves the rendered destinations and link behavior; each route resolves in the generated output; only the exact reviewed generated files are included in the deploy dry run and upload. Existing dirty source and `dist` output remain untouched.
- Coordinator independently reviews worker evidence, the integrated source change, focused QA, exact payload, and live result before closing the goal.

## Constraints

- Do not change schedule dates, times, age groups, formats, or event facts.
- Do not wrap anchors inside existing booking anchors; preserve the booking action as a separate link.
- Do not run Lighthouse or PageSpeed checks.
- Keep worker worktrees read-only and remove them after their evidence is reviewed.

## Route mapping decisions

| Schedule record | Class page destination |
| --- | --- |
| Youth/Teen, ages 5–17 | Separate Kids (ages 5–9) and Teens (ages 10–17) links because the published detail pages split this combined class by age. |
| Adult | `/bjj-classes/adults-tannersville-ny/` |
| White Belt Foundations | Existing `programUrl` `/white-belt-foundations/` |
| Alley Bootcamp | `/alley-bootcamp/` |
| Women's Foundations pilot | `/womens-jiu-jitsu-tannersville.html` |
| Special record with a verified `programUrl` | Use that page. Other events and closures have no class-page link. |

## Implementation and verification

The calendar renders class-page links in desktop month cells, mobile day details, selected-day lists, and the source next-class renderer. Desktop class cards are containers, not booking anchors; class-page destinations and booking actions are sibling links. The combined youth/teen entry exposes both age-specific class pages. Closures and event records without a matching page remain plain text. The current production Schedule HTML does not expose the Next class summary container, so its source renderer is not counted as live proof; the acceptance target is each dated calendar entry.

Checks completed: `node --check` on source and generated calendar JavaScript; `npm run qa:schedule`; `npm run qa:schedule-booking`; `npm run qa:volatile-facts`; `git diff --check`; isolated local Chromium interaction at 390px and 1440px with off-origin requests blocked. Both browser widths passed checks for youth, teen, adult, Bootcamp, Foundations, women's pilot routes, separate booking links, closure behavior, zero nested anchors, and no page errors. No Lighthouse or PageSpeed checks were run.

## Release boundary and recovery note

The implementation commit updates only `src/assets/js/schedule-month-calendar.js`. Because the live page uses a 30-day cache policy and a fixed query string, a follow-up release changes only the script version in `src/schedule.html` and the equivalent clean committed `dist/schedule/index.html`. The main source and generated Schedule files contain unrelated local edits; the follow-up generated route is reconstructed from committed `HEAD` plus only the query-string change. A full build was mistakenly run in the shared checkout earlier in this session and rewrote the dirty generated Schedule output. Its post-build local state was saved byte-for-byte before preparing the safe release candidate, then will be restored with the cache-string change added locally. No further full build should run in this checkout.


## Release and live verification

- Commit `d713212`: implementation and handoff. Dry run and deployment selected only `assets/js/schedule-month-calendar.js`; the live file is 17,120 bytes and its SHA-256 matches the committed generated asset (`b044853fb5e66908a6655ccfa46f28b807b8369d1e95ff28f370e4b011d6b412`).
- Commit `2e50764`: cache-key refresh. Dry run and deployment selected only `schedule/index.html`; the live page returned HTTP 200 and references `?v=20261031-class-page-links`. The deployed HTML is not byte-identical to the local candidate, so only the observed reference and browser behavior are claimed.
- Live browser: 390px and 1440px selected-day checks pass; desktop month-grid links pass; no nested anchors or page errors. Both booking links remain separate. Closure date has no links.
- All seven destinations were checked live and returned HTTP 200. Lighthouse and PageSpeed were not run.
- The temporary snapshot of dirty `dist/schedule/index.html` was removed after restoring the snapshot plus the local cache-key change. Snapshot hash before cache-key change: `58d38e5885de43fc13456e6d458e401a88d7d5ddc8bc6e3a6020b133d1c680ef`; restored local hash: `9d2a0a1c1c40f1370a64077156f1c5f6c1b29da17ec951eb4af4c52090635183`.

## Independent audit closeout

- SCL-DATA-1 retracted the suspected White Belt route mismatch after confirming both Tuesday and Thursday records supply `/white-belt-foundations/`, which takes precedence over the Adult fallback.
- SCL-UI-1 passed source-level semantics review for desktop date cells, mobile details, selected-day cards, and the next-class renderer: class and booking actions are separate native anchors, anchors are not nested, and classes without routes remain text. CSS declares visible focus outlines. This was source/CSS inspection, not an additional runtime keyboard test; rendered route behavior is covered by the separate live browser checks above.
- Both audit worktrees were clean and removed after review. Their inventory rows now record closeout. The older `/tmp/style-swarm-20261027-control` checkout remains retained under its existing named inventory owner because it contains unreconciled dirty work; it was not touched.
- `npm run qa:workspace:preflight` passed. The full workspace audit did not complete within the session command window and was interrupted; no cleanup action was based on its heuristic candidates.

## Youth link label follow-up — 2026-10-31

- Commit `652dfcc` changes the combined youth class links to the concise labels `Kids` and `Teens`, retaining `/bjj-classes/kids-tannersville-ny/` and `/bjj-classes/teens-tannersville-ny/` as their destinations.
- The script cache key changed to `20261031-class-page-links-labels`. Deploy dry run and upload each selected only `assets/js/schedule-month-calendar.js` and `schedule/index.html`; deployment reused a verified remote backup.
- Live HTTP verification confirmed the Schedule page references the new key and the delivered script contains both labels with their matching destinations. Browser-use was attempted, but no local Chrome instance was running, so the final check used live HTTP content. No Lighthouse or PageSpeed checks were run.
- The dirty local `dist/schedule/index.html` was restored byte-for-byte after release candidate deployment. Its SHA-256 is recorded in the workspace inventory.

## Inline youth link follow-up — 2026-10-31

- Commit `fecdcb2` moves the Kids and Teens anchors into the class label immediately after the time. For standard youth slots, the rendered text reads `Kids and teens No-Gi` or `Kids and teens Gi`, with only `Kids` and `Teens` linked to their matching pages. A named youth class keeps its name and adds the linked audience labels in parentheses.
- The script cache key is `20261031-class-page-links-inline-youth`. The dry run and deployment selected only `assets/js/schedule-month-calendar.js` and `schedule/index.html`; the deployment reused an existing verified remote backup.
- `npm run qa:schedule`, JavaScript syntax checks, and the read-only workspace audit passed. Live HTTP checks confirmed the new key, both route targets, and the absence of the old separate-link row. Browser-use could not attach because Chrome was not running, so rendered browser inspection was unavailable.
- The dirty local Schedule route was restored byte-for-byte; its matching SHA-256 is recorded in the workspace inventory. No Lighthouse or PageSpeed checks were run.
