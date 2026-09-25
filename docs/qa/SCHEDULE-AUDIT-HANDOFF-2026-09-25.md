# Schedule audit handoff — 2026-09-25

## Goal and acceptance criteria

Make the public weekly schedule easy to scan by day, cohort, time, age lane, and Gi/No-Gi format. Preserve the requested class pattern:

| Day | Youth and teens | Adults |
| --- | --- | --- |
| Monday | 5:00–6:00 PM · Ages 5–17 · No-Gi | 6:00–7:00 PM · Ages 18+ · Gi |
| Tuesday | 5:00–6:00 PM · Ages 5–17 · Gi | 6:00–7:00 PM · Ages 18+ · Gi |
| Wednesday | 5:00–6:00 PM · Ages 5–17 · No-Gi | 6:00–7:00 PM · Ages 18+ · Gi |
| Friday | 5:00–6:00 PM · Ages 5–17 · Gi | 6:00–7:00 PM · Ages 18+ · Gi |
| Saturday | — | 10:30–11:30 AM · Ages 18+ · No-Gi |

## Persona and expert framework

The contextual selector returned ambiguous and poor-fit candidates, so the audit workers checked actual source and readiness before choosing their lenses. Persona content guided analysis only; it did not authorize access or publication.

| Workstream | Role persona | Instruction asset | Fit and application |
| --- | --- | --- | --- |
| UX and responsive review (Taste) | **Data 5 User Experience (UX) Analysis Specialist — Jessie Lin**, UUID `7ce52d92-be7f-4388-974f-5ce0fae9d79f`, v1.0.0, status partial. Source: `assets/indranet-prompt-exporter/exports/index.json`, `_folderName=Data-5-User-Experience-UX-Analysis-Specialist---Jessie-Lin`. The full 3,884-character source text was read in four contiguous chunks. | **Instructions — CODE**, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, v1.0.0, status partial. Source: same `exports/index.json`, `_folderName=Instructions---CODE`; full 1,534-byte text was read. | Jessie’s user-journey, mobile UX, accessibility, and pain-point methods fit a static schedule audit. CODE supplied the UI/UX review and QA checklist. Jessie’s readiness is partial because a referenced knowledge attachment was unavailable; no analytics claims were made. |
| Visual pattern review (Hallmark) | **Local Leadgen Static Site Commander — Dex Ryder**, UUID `fc749ccb-f42b-4b36-afdf-44e7aae9c6ef`, status complete. Source: `assets/indranet-prompt-exporter/exports/index.json`, `_folderName=Local-Leadgen-Static-Site-Commander---Dex-Ryder`; complete source text was read. | **Instructions — CODE**, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, status partial; complete available source text read. | Dex’s mobile-first static-site and accessibility focus supported the Hallmark audit of page structure and scan order. Hallmark flagged the nested calendar frame; the incumbent `design.md` explicitly defines a double-bezel for schedule widgets, so the established system was retained. |
| Deterministic UI check (Impeccable) | Applied the installed Impeccable 4.0.4 technical detector and audit guidance. No additional Indranet role was claimed for this deterministic check. | — | The detector reported no findings for `src/schedule.html` and `src/assets/css/pages/schedule.css`. The user deferred the optional Impeccable update. |
| Release evidence review | **Debugger-Analyzer — Orko the Debugulator**, UUID `d4f92b03-1a52-49e1-8ffa-c7f2ce8cabfa`, v1.0.0, status complete, no attachments. Full source: `assets/indranet-prompt-exporter/exports/Debugger-Analyzer---Orko-the-Debugulator/versions/v1.0.0/prompt.json`. | No ready, release-specific instruction asset was available. `Instructions — CODE` was inspected as a partial-fit QA reference; release governance remained a host-side evidence review. | Orko’s code-analysis lens supported the independent review of generated outputs and payload boundaries. Its prompt was not treated as release authorization. |

## Findings and changes

- The canonical schedule, runtime JSON, static schedule export, browser JS feed, and reusable component data now agree on the acceptance matrix above. Misleading adult/youth IDs that encoded the old formats were corrected.
- The schedule page states both class times in the hero, then repeats audience, age lane, format, and time range on each day’s class row. Gi/No-Gi is expressed in text, not color alone. The expired September calendar block and redundant schedule preamble were removed.
- Browser inspection found the hero CTA rendered as a plain 32px link because the schedule page did not load a button rule. A page-scoped token-based rule now renders it as a 50px green button, above the fold at tested widths. The one-off inline booking link in Monday’s class label was removed; the hero action and schedule utility link remain.
- Weekday adult rows now say Ages 18+, matching the canonical eligibility data and Saturday label.
- Hallmark’s card-in-card warning conflicts with the repository’s locked `design.md`, which explicitly calls for a double-bezel on schedule widgets. The audit kept the incumbent enclosure and its tokens. Impeccable’s detector reported `[]`.

## Workstream contracts

- **UX-1 — Scan order and responsive behavior:** Read `src/schedule.html`, its page CSS, canonical data, and the built page. Done when cohort, age, time, and format are textual and readable at mobile/desktop widths. Verified at 320, 375, 414, 768, and 1440 CSS pixels.
- **VIS-1 — Incumbent visual integrity:** Apply Taste/Hallmark guidance without replacing the existing site system. Done when the main CTA has a visible 44px+ target, schedule rows stack in reading order on mobile, and intentional design tokens remain intact. Verified with a browser and Impeccable detector.
- **DATA-1 — Schedule consistency:** Compare active source feeds and rendered rows to the exact day/cohort/time/format matrix above. Done when each of the nine class records matches and no expired copy remains. Verified by `scripts/qa-schedule.mjs`, volatile-facts QA, unified QA, and rendered page inspection.
- **REL-1 — Scoped publication:** Commit the approved schedule changes and deploy only the reviewed schedule-related payload. Done when the deployment mapper’s exact path list is reviewed, upload succeeds, and live routes/data/CSS show the committed facts.

## Verification record

- `npm run build` — passed.
- `npm run qa:schedule` — passed; checks the canonical schedule, runtime JSON, static export, browser JS feed, and rendered day/time/format rows.
- `npm run qa:volatile-facts` — passed; 1,059 files checked on the final source state.
- `node --test scripts/qa-unified.mjs` — passed.
- `git diff --check` — passed.
- Chrome viewport audit at 320, 375, 414, 768, and 1440px — no horizontal overflow; CTA height 50px; CTA visible within the viewport; seven schedule cards; corrected age and format labels present; expired block absent.
- Impeccable detector: `[]` for the schedule page and its page CSS.
- Commit: `8e6c8834` (`Clarify weekly class schedule by audience`).
- Deployment dry run: 46 paths, all schedule-related. Production upload completed with exit code 0 through `scripts/deploy-release.py` using the exact allowlist.
- Live HTTP verification: `/schedule/` and `/schedule.html` returned 200 and resolved to `/schedule`; both contained all six schedule/CTA markers and no expired block. The deployed schedule CSS, runtime schedule JSON, and static schedule export returned 200. Homepage and Tannersville class page returned 200 and showed the updated schedule summary.

## Release boundary and preserved work

The commit and deploy include the requested schedule correction, supporting schedule feeds, QA/generator updates, and their generated schedule page outputs. Fifty-eight unrelated fingerprint-only generated page edits were restored before release; the deployment dry run contained no unrelated routes. Two pre-existing untracked persona-helper files were not staged, committed, or deployed:

- `assets/indranet-prompt-exporter/mcp/lib/persona_quick.py`
- `assets/indranet-prompt-exporter/mcp/tests/test_persona_quick.py`

The deploy script’s verified backup/rotation path remains the rollback route for this scoped release.
