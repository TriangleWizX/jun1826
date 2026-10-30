# Screen-reader speech acceptance plan — 2026-10-30

## Objective

Perform the live production screen-reader speech checks for shared navigation/menu behavior, Schedule date selection, and the Free Intro form. Capture Orca's actual speech output and its matching browser state. Do not submit forms or activate booking/contact actions.

## Persona & Expert Framework

### Coordinator

- **Role persona:** AI SuperExpert Agent Specialist — Dr. Ada Turing, standalone version v4.0.0, UUID `937a02cd-470a-4211-b880-b05bdf8bf585`.
- **Source:** `assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.md`; source profile at the matching `versions/v4.0.0/prompt.json`. The root app profile UUID `5915f1d9-9acc-41bf-b8be-66baf6f3140c` points to a missing linked UUID `409d1008-477c-4a2f-9efb-6143ee864455`, so the versioned prompt was inspected and its own UUID is recorded here. It is complete, with no attachments.
- **Fit:** its documented methods include strategic planning, situational analysis, risk assessment, project management, quality management, test strategy, review, and documentation. These support coordination and independent evidence review; they do not substitute for assistive-technology expertise.
- **Selected master INSTRUCTIONS asset:** `INSTRUCTIONS - Business Operations`, UUID `c3369696-d996-447e-8973-5f2cd73d33c9`, complete, no attachments; full prompt text is in `assets/indranet-prompt-exporter/exports/index.json` because its standalone folder is not present. Apply its risk mitigation, execution planning, data analysis, and outcome-assessment methods.
- **Routing review:** `auto_persona.py --plan` selected `Static Site Generator` (UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`) and `Instructions - COMPETENCE` (UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`). Those lexical candidates do not provide the screen-reader or coordination methods required, so they were not adopted. `persona_read.py`, referenced by repository guidance, is absent; the complete versioned persona file was read in contiguous chunks instead.

### Workstream role choices

- **SR-NAV-1 — Navigation speech auditor:** UI-UX Maestro — Paige Lane, UUID `388c0fbe-9a38-42ad-988a-7a9b7ce29a13`, complete, no attachments; source is the full 1,079-character prompt in `assets/indranet-prompt-exporter/exports/index.json`. Its user-focused interaction, accessibility development, and iterative usability testing fit navigation/menu state checks. It is not a screen-reader specialist; use it only as a supporting UX lens.
- **SR-SCHEDULE-1 — Calendar announcement auditor:** ordinary task-specialist fallback. The catalog's testing profiles are incomplete or not specific to spoken assistive technology. Use the Business Operations methods above for bounded keyboard actions, risk control, and recorded outcomes.
- **SR-FORM-1 — Form validation speech auditor:** ordinary task-specialist fallback. No ready catalog profile fits screen-reader form validation. Use the same Business Operations methods; do not infer speech from ARIA markup alone.

## Workstream contracts

| DoD | Read scope | Write scope | Verification |
| --- | --- | --- | --- |
| `SR-NAV-1` | Shared navigation source and previous spoken-output report | `evidence/2026-10-30/screen-reader/nav.json` | On production, record Orca speech for skip link, landmarks/links, menu open state, expanded/collapsed announcement, Escape, and focus return. Compare announced state with browser accessibility state. |
| `SR-SCHEDULE-1` | Schedule route, calendar behavior, previous spoken-output report | `evidence/2026-10-30/screen-reader/schedule.json` | On production, record focus on a date, ArrowRight selection, announced date, selected state, and spoken class details. Compare speech with rendered data. |
| `SR-FORM-1` | Free Intro form source and previous spoken-output report | `evidence/2026-10-30/screen-reader/free-intro-form.json` | On a blank production form, record field name/required announcements and native invalid-field message through Orca. Check label/error associations. Do not submit. |

The workstreams share the local display and Orca service, so they run sequentially even though their evidence paths are independent. The coordinator reviews every result before acceptance. Inputs are keyboard-only where the SOP requires it; Playwright/CDP is used only to reset the test page and capture DOM state, not to invent speech output. Record logged Orca speech as speech-dispatch output; do not claim independent listening unless performed.

## Completion criteria

Complete only when all three evidence records include route, browser/Orca versions, input sequence, exact logged utterance, matching browser state, and action limits; any unannounced state or missing field error is classified as a finding; owned temporary workspaces and browser sessions are closed; and the coordinator independently reconciles the acceptance report. A failure remains a finding until a safe fix is made and retested or clearly handed off.
