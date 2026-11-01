# Glossary generated-output reconciliation — 2026-10-31

## Persona & Expert Framework

- **Coordinator role:** ordinary static-site release specialist fallback. `persona_quick.py --plan --json` returned `no_suitable_persona` for reconciling dirty CSS, generated output, and deployment scope.
- **Rejected persona candidate:** `Static Site Generator (Markdown to HTML, Blog, Docs, etc.)`, UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`, source `assets/indranet-prompt-exporter/exports/index.json`. Its full 896-character prompt describes building a personal Markdown blog generator, not auditing an existing Eleventy release; it was not adopted.
- **Instructions asset:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`, selector readiness `ready`. Its full 1,500-character text was read. Applied its requirements-first, review, QA, build/deploy, and KISS guidance to the source-to-output check; it does not grant additional authority.
- **Independent worker:** ordinary static-site release auditor fallback for `GLO-OUT-01`; no persona was claimed. The worker used read-only paths and made no changes.

## Scope and decision

`GLO-OUT-01` checked whether the dirty glossary hub and term-page outputs can be safely released from the current source. Keep the term-page cohort separate until its source/output mismatches are reconciled. Do not replace the dirty root generated tree with the isolated candidate.

The glossary hub candidate was built in `/tmp/glossary-day-one-css-release-20261101/` from the committed base plus the current `src/assets/css/bjj-glossary.css` and `src/assets/css/pages/glossary.css` changes, with the committed mobile-foundation CSS. Its inlined CSS SHA-256 is `dbaccfb3f80078e2c6884a020c47e4c600c0389ed31ef16572da1d70b8c10993`, identical to the live `/bjj-glossary/` response. Both use `/assets/css/mobile-foundation.114422.css`.

An alternate candidate built from the full dirty shared CSS tree produced inline CSS SHA-256 `60718817b370352c787503939668bc36039db546beb5f508947682a01fdb961b` and references `mobile-foundation.d8c863.css`. That is not the live-parity candidate and includes unrelated shared changes, including the keyboard focus-triggered mobile action-bar rule. It was excluded from this route release.

## Verification evidence

- The isolated Eleventy build completed successfully.
- A local browser loaded the final hub candidate with HTTP 200 at 320px, 390px, and 1440px. At each width, the 8 day-one chips, 27 alphabet controls, 17 category controls, and 4 reader-navigation controls measured at least 44px high; document width matched viewport width.
- The public hub returned successfully. Its inlined CSS hash and mobile-foundation reference match the narrow candidate.
- The public schedule route has five `5:00–6:00 PM` spans with `Kids` and `Teens` links directly after the time, and zero old `Kids page` or `Teen page` labels. That requested link placement is already live.
- Deployment dry-run from the narrow candidate returned `payload_files=0`: the generated hub output matches the committed route, so there is no new route payload to deploy from this candidate.
- No Lighthouse/PageSpeed, site-wide contrast, or keyboard acceptance checks were run; those remain with the owner/SOP.

## Term-page mapping remains open

The dirty source pages are:

`src/bjj-glossary/{bottom-position,choke,drilling,frames,front-headlock-series,open-mat,position,roll,sweep-single}/index.html`

The dirty generated pages are:

`dist/bjj-glossary/{bottom-position,collar-grip,hip-escape,index,open-guard-pass,waiter-sweep,x-guard}/index.html`

Only `bottom-position` overlaps. The generated term pages reference fingerprinted glossary and shared CSS assets; a public term-page sample does not currently link the local `bjj-glossary.f33d91.css` asset. Do not infer a safe combined term-page payload from these dirty lists. Reconcile exact source routes, generated routes, and live asset availability before that release.

## Disposition

No production file was changed and no code commit or deployment was made for this workstream. Preserve the dirty root output and term-page differences for their own reconciliation. The overall goal remains active.
