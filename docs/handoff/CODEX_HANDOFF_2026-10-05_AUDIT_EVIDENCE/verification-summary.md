# Verification evidence summary (before deployment)

- `npm run validate`: PASS. Fresh build created the five child sitemap files and index; unified suite passed 15/15; Cal migration QA passed for 460 generated pages and 73 active dependencies. Cal QA printed a pre-existing missing Bootstrap Icons CSS warning.
- `npm run test:ads`: PASS, 35 tests. Its expected negative test prints an output-already-exists diagnostic.
- `npm run qa:schedule`: PASS.
- `npm run qa:volatile-facts`: PASS, 1,062 files checked.
- `python3 scripts/qa-free-intro-copy.py --report /tmp/tmb-key-gap-copy-final.json`: PASS, 470 HTML files, 532 measured blocks, 346 unique blocks, 0 above grade 3, 0 stale policy blocks. The detailed report is in `copy-failures.json` from the original pre-fix audit snapshot; the post-fix zero counts are recorded here.
- `ast.parse(scripts/deploy-release.py)`: PASS after the sitemap payload mapping change. The exact release dry run remains pending the commit.

Live status/body hashes and content markers for the initial audit sample are in `live-responses.json`. It contains no response bodies or private headers.

## Post-release evidence

- Source payload commit `2557a603` deployed with the exact nine-file filter recorded in `release-verification.json`; deployment exited 0.
- Remote backup QA: one valid archive, zero invalid, zero cleanup candidates; no cleanup was performed.
- Three changed public pages returned HTTP 200 with all expected copy markers. Old “safer calls”, “safer holds”, and guarantee promises were absent from the law-enforcement page main content.
- Sitemap index and all five children returned HTTP 200. The index lists each child, `sitemap-core.xml` includes law-enforcement and Friday Night Fanatics, and `sitemap-locations.xml` includes Nearby Towns.
- Targeted local Chrome browser check on the changed page passed at 375×667 and 1440×900: no horizontal overflow; one H1 and a canonical URL; the Free First Visit CTA was visible; all main images had alt attributes; no page errors. Bounds are stored in `release-verification.json`.
