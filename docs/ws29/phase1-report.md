# WS-29 Phase 1 report

**Status:** local implementation and evidence assembled; review/commit and later WS-29 phases remain open. P0-01–P0-10 were approved as the Phase 0 priorities. This report does not claim production release or live verification.

## Scope delivered

- Added a shared `mobile-foundation.css` link after route styles in the shared head include and created the shared mobile rules for readable type, fluid headings, bounded media, text sizing, and primary action targets.
- Applied narrow fixes to the pricing hero actions, the blog article wrapper, and the programs hero badge based on captured overflow evidence.
- Raised FAQ body paragraphs to 16px after the width sweep identified 14.72px paragraph text.
- Kept the existing Bootstrap/native CSS stack and breakpoint spine (640, 768, 992, 1100px). No copy, price, schedule data, IDs, URLs, structured data, or page metadata were intentionally changed.

## Browser evidence

Evidence is in [the final 14-route capture set](runs/phase1-20261023-rerun-02/) and [the FAQ final follow-up](runs/phase1-20261023-faq-final/). Chromium captures cover the 14 representative routes at 360, 390, 430, and 1280px. The first 56-capture matrix recorded zero mobile overflow and zero text below 14px.

The intermediate-width sweep covered 361–767px and selected 768/992/1100px boundaries. Its first exit was nonzero because the text classifier counted `.op-eyebrow` secondary text as body copy and it found FAQ paragraphs at 14.72px. After raising those FAQ paragraphs to 16px, the FAQ follow-up passed 415 width samples: zero overflow, text below 14px, body paragraphs or inputs below 16px, and primary targets below 44px.

The FAQ follow-up passed on the final FAQ CSS. A subsequent attempt to repeat the entire intermediate sweep did not run: the sandbox returned `listen EPERM` for the local browser server, and the inherited temporary helper in `/tmp` is incomplete. The failed attempt is not counted as a pass. The broad intermediate sweep therefore has the earlier classifier failure on record; the only later edit to the shared foundation was a comment documenting the approved breakpoint spine.

Desktop schedule captures differ below the calendar because the baseline shows two "Plan a free visit for this class" links in the selected Friday classes and the later capture does not. The later headings shift up by about 67px, matching the missing link rows. `schedule-month-calendar.js` only renders those links while a class is upcoming on the current day, so the screenshots were taken on opposite sides of the class times. The upper layout is aligned; Phase 1 made no desktop-active CSS or schedule source changes. Both captures recorded the static preview's `/api/first-visit-availability` 404, which is not a production API result.

## Local gates recorded

The isolated build and prior validation run recorded:

- `qa:volatile-facts`: passed, 572 files checked.
- `test:ads`: passed, 35 tests.
- `validate`: passed, including 15 unified tests and Cal migration QA.
- `qa:schedule`: passed.
- CSS parser checks: passed.

These are local checks only. No live network, production, phone-owner, or deployment verification is included.

## Worktree incident and handling

An accidental `npm run build` in the main checkout overwrote pre-existing dirty generated files under `dist/` and `src/assets/data/asset-hash-manifest.json`. No byte-for-byte backup of the prior files was available. The screenshots and JSON under `/tmp/ws29-current-generated-baseline` are evidence captures, not a backup of the generated source files. The generated changes remain visible in `git status` and must not be treated as restored or staged as Phase 1 output. Unrelated untracked photos also remain untouched.

## Changed source and evidence paths

- `src/_includes/components/head-metadata.njk`
- `src/assets/css/mobile-foundation.css`
- `src/assets/css/pages/options-pricing-highend.css`
- `src/assets/css/blog.css`
- `src/assets/css/high-end-near.css`
- `docs/ws29/runs/phase1-20261023-rerun-02/`
- `docs/ws29/runs/phase1-20261023-faq-final/`

The generated `dist/` tree and asset hash manifest are excluded from this list and from Phase 1 staging.

## Remaining WS-29 work

Preserve the generated-file incident in any handoff and finish the remaining shell/navigation and page-family workstreams in order. Production verification and owner phone checks are still required.
