# Release and QA Tooling Review

This is the next separate category, from `stash@{0}` (“remove committed E3/E5 source changes”). It covers only the seven release/QA tooling paths listed below. The stash is not applied; this review changes no tooling.

Reply with `1 approve, 2 deny...` to decide. **Recommended reply:** `1 deny, 2 deny, 3 approve, 4 approve, 5 approve, 6 approve, 7 approve`.

## Path decisions

1. **`scripts/deploy-release.py` — DENY.** This removes 36 lines of special output mapping for Winter Rank Drop and Show-Up Kit styles. The stash still contains the Show-Up Kit page and CSS sources, so removing its explicit release mapping could leave a future release missing its page styling. Keep this behavior until the current source-to-output route map proves it is obsolete.

2. **`package.json` — DENY.** The added `qa:faq-disclosures` and `qa:home-builder` commands point to script files that are absent from the stash. Those commands would fail when run. The `qa:cwv:lab` command has a matching script, but approve it separately only after its setup requirements are reviewed.

3. **`scripts/qa-cwv-lab.mjs` — APPROVE.** This replaces implicit local server and `npx lighthouse` behavior with explicit site directory, output directory, Lighthouse binary/version, Chrome path, and route inputs. It also checks the declared runner and executable inputs before running. Its command is still unregistered in this choice; that is handled by item 2.

4. **`scripts/qa-desktop-topbar-overlap.mjs` — APPROVE.** The edit narrows the desktop overlap check to the intended viewport and controls, reducing unrelated page noise.

5. **`scripts/qa-sticky-overlap.mjs` — APPROVE.** The edit tightens the sticky overlap check around the page’s actual sticky controls.

6. **`scripts/qa-viewports.mjs` — APPROVE.** This expands viewport checks and evidence reporting. It is the largest tooling change here, so run it against the intended local build before relying on its results.

7. **`scripts/qa-visibility.mjs` — APPROVE.** The edit improves visibility assertions for rendered page content. Confirm its expected local server/build inputs when running it.

## Scope left for later

This category does not include the stash’s generated `dist/` output, page/CSS source edits, documentation edits, or other source paths. The separate remediation stash `stash@{1}` has already had its six categories reviewed; its denied video redirect and partner-card changes remain excluded.

The stash and all workbook exports remain untouched.
