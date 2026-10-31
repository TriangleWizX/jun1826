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

The calendar now renders class-page links in the desktop month cells, mobile day details, selected-day list, and next-class summary. Desktop class cards are containers, not booking anchors; class-page destinations and booking actions are sibling links. The combined youth/teen entry exposes both age-specific class pages. Class-page links remain absent for closures and event records without a matching page.

Checks completed: `node --check` on source and generated calendar JavaScript; `npm run qa:schedule`; `npm run qa:schedule-booking`; `npm run qa:volatile-facts`; `git diff --check`; isolated local Chromium interaction at 390px and 1440px with off-origin requests blocked. Both browser widths passed checks for youth, teen, adult, Bootcamp, Foundations, women's pilot routes, separate booking links, closure behavior, zero nested anchors, and no page errors. No Lighthouse or PageSpeed checks were run.

## Release boundary and recovery note

The implementation commit updates only `src/assets/js/schedule-month-calendar.js`. Because the live page uses a 30-day cache policy and a fixed query string, a follow-up release changes only the script version in `src/schedule.html` and the equivalent clean committed `dist/schedule/index.html`. The main source and generated Schedule files contain unrelated local edits; the follow-up generated route is reconstructed from committed `HEAD` plus only the query-string change. A full build was mistakenly run in the shared checkout earlier in this session and rewrote the dirty generated Schedule output. Its post-build local state was saved byte-for-byte before preparing the safe release candidate, then will be restored with the cache-string change added locally. No further full build should run in this checkout.
