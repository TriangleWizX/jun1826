# Class Rules badge wrap release — 2026-10-29

Workstream: `CLASS-RULES-WRAP-RELEASE-1`
Status: **implemented, committed, deployed, and live-verified**

## Persona and scope

The route/release auditor used the ordinary specialist fallback **Class Rules Badge Reflow and Release Auditor**. A suitable complete catalog prompt was not established for this bounded responsive/release review. The coordinator independently inspected the source delta, clean generated output, exact deploy mapping, and production browser evidence.

The source change is one declaration in `src/class-rules.html`: the existing hero badge now uses `white-space: normal`. This lets “Dojo Etiquette · Tannersville, NY” wrap inside the existing badge at narrow widths while preserving its desktop line.

## Local build and release mapping

- Clean isolated `npm run clean && npm run build` passed at `b7d021264449cc8d67c6154529342f526b78810b` plus only the badge declaration.
- The generated `dist/class-rules.html` contains the new rule. `git diff --check` passed for the source change.
- The committed deploy helper maps `src/class-rules.html` to `dist/class-rules.html`. The exact dry run for commit `aae01924113d1384dd647429b0f704fed11e7078` selected only `class-rules.html`.
- The deployment helper reported a fresh verified rollback archive with 14,555 files, then uploaded `class-rules.html` at 35,217 bytes. One older verified archive was rotated according to the helper’s cleanup policy.

## Live verification

The deployed route returned HTTP 200. At 320px and 390px, the computed badge `white-space` was `normal`; the badge occupied two lines, and its text stayed inside the badge. At 1440px, the badge occupied one line. Document scroll width matched the viewport at all three widths: 320, 390, and 1440px. No page errors or failed requests occurred.

The repeatable browser proof at 390×844 and 1440×1000 also returned HTTP 200 with no horizontal overflow or page errors. Screenshots, rendered HTML, compact route JSON, and `geometry.json` are in [`evidence/2026-10-29/class-rules-live/`](evidence/2026-10-29/class-rules-live/).

No form was submitted. No Lighthouse, PageSpeed, keyboard-route, site-wide contrast, spoken AT, or physical-device check was run.
