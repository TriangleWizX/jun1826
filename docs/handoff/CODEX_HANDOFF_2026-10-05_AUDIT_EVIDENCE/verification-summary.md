# Verification evidence summary (before deployment)

- `npm run validate`: PASS. Fresh build created the five child sitemap files and index; unified suite passed 15/15; Cal migration QA passed for 460 generated pages and 73 active dependencies. Cal QA printed a pre-existing missing Bootstrap Icons CSS warning.
- `npm run test:ads`: PASS, 35 tests. Its expected negative test prints an output-already-exists diagnostic.
- `npm run qa:schedule`: PASS.
- `npm run qa:volatile-facts`: PASS, 1,062 files checked.
- `python3 scripts/qa-free-intro-copy.py --report /tmp/tmb-key-gap-copy-final.json`: PASS, 470 HTML files, 532 measured blocks, 346 unique blocks, 0 above grade 3, 0 stale policy blocks. The detailed report is in `copy-failures.json` from the original pre-fix audit snapshot; the post-fix zero counts are recorded here.
- `ast.parse(scripts/deploy-release.py)`: PASS after the sitemap payload mapping change. The exact release dry run remains pending the commit.

Live status/body hashes and content markers for the initial audit sample are in `live-responses.json`. It contains no response bodies or private headers.
