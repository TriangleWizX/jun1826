# WS-29 audit handoff

Phase 0 inventory is ready for owner review. The isolated fresh build passed and the final 56-sample baseline reproduces the principal layout defects. Owner priority confirmation is required before Phase 1. Full WS-29 remains incomplete.

- [Original brief](WS-29-brief.md)
- [Load map and generator ownership](load-map.md)
- [Fresh rendered stylesheet order](rendered-load-map.md)
- [Draft defect log](defect-log.md)
- [360px text and control inventory](pinch-zoom-inventory.md)
- [Fresh-build baseline evidence](baseline/summary.json)
- [Fresh-build file provenance](provenance.json)

## Persona & Expert Framework

Coordinator and cascade worker used disclosed ordinary responsive-QA/build-auditor fallbacks. The selector candidate was Static Site Generator (Markdown to HTML, Blog, Docs, etc.), UUID `10974975-0c53-4e27-bdca-e95e86ccb2e9`; it did not fit a read-only responsive audit. Suggested Instructions - COMPETENCE, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, had no matching full source in the available export directories. The inspected Ada Turing app introduction was not a substitute for an actual linked persona prompt. No full-source adoption is claimed. Attachments: the complete supplied WS-29 brief. Methods: isolate writes, distinguish source/build/runtime evidence, measure actual rendered sizes, challenge serving assumptions, independently inspect screenshots, and hold implementation at the approval gate.

## Bounded workstreams

- WS29-I / cascade worker: isolated `/tmp/ws29-inventory`; source load map, minifier ownership and fresh-build check; write only isolated generated output and `/tmp/ws29-*` reports. DoD-I: concrete source paths, canonical routes, stylesheet order, generator caveats and SSI validation. Coordinator reviews output.
- WS29-B / coordinator: capture and audit only; write `docs/ws29/` and temporary audit tools. DoD-B: all 14 families at 360/390/430/1280, font/target/form inventory and limitations, defect log and confirmation request. No website source writes.
- WS29-IMPLEMENT: pending owner priority confirmation. Preserve the full brief's ordered Phases 1–4, content/data/anchor invariants, ordered release gates, production verification and owner phone checks. CI wiring requires a separate decision.

## Reproduction

Use the installed dependencies and browser; no installation is required. Browser and server sockets require elevated execution in this workspace.

```sh
node docs/ws29/capture-baseline.mjs /tmp/ws29-new-baseline /tmp/ws29-inventory
node docs/ws29/preview.mjs /tmp/ws29-inventory
# Use the origin printed by preview.mjs:
node docs/ws29/capture-details.mjs http://127.0.0.1:PORT /tmp/ws29-new-baseline
rtk proxy node tools/browser-proof.mjs http://127.0.0.1:PORT/ /tmp/ws29-helper
```

The capture tool resumes existing JSON samples in its output directory. Always use a new empty output directory after changing source/generated output. All custom captures block external requests and expand local SSI recursively. The helper uses its own 390/1440 widths and may request external public assets; it is auxiliary evidence. Initial-state screenshots do not establish provider booking, iOS zoom behavior, all lazy-loaded media, all nested menu states, or live parity.

## Authorization and release boundary

No CSS, copy, prices, schedule, contact, anchors or metadata have been changed. No dependencies have been installed. No production deployment has been performed. Existing unrelated dirty generated files and assets are preserved. The supplied brief requires committed phase artifacts. Only Phase 0 documentation, audit tools and rendered evidence are included in its scoped commit; unrelated work is excluded. No website release commit or deployment is included.

The existing main `dist/` output was stale relative to source; its preserved diagnostic captures are at `/tmp/ws29-current-generated-baseline`. See `fresh-build.log`, `fresh-build-comparison.json`, and `current-generated-provenance.json`. The final `baseline/` captures use the isolated fresh output, recursive SSI expansion and blocked external requests. Top-level mobile menu open states were tested; nested submenu and real-device checks remain implementation verification tasks.

Verification: the isolated `npm run build` passed. Audit scripts passed `node --check`; evidence validation confirmed 14 × 4 distinct route-width samples, matching screenshots, HTTP 200, no JavaScript page errors, and unrestricted captured viewport metadata. The 56 local availability-API 404 responses are an expected static-preview limitation. Release tests and live/browser/owner-phone acceptance remain pending.

The helper’s raw rendered HTML is retained byte-for-byte at `/tmp/ws29-browser-proof-raw/`; its JSON evidence and PNG captures are in the phase commit. This avoids reformatting generated runtime evidence to remove source whitespace.
