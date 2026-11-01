# Temporary workspace lifecycle

Use this policy for styling workstreams and other temporary repository copies. Treat every isolated checkout, browser profile, generated build, and virtual environment as temporary unless the owner records a reason to retain it.

## Inventory before dispatch

### Current keyboard acceptance session

| Workstream ID | Owner | Exact path | Purpose | Creation date / base | Size budget | Closeout trigger | Status and preserved artifacts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `KEY-PAGEDOWN-CLOUD-20261030` | Coordinator | `/tmp/keyboard-pagedown-cloud-runtime-20261030/` and `/tmp/keyboard-pagedown-cloud-tmp-20261030/` (removed) | Attempted live post-deploy synthetic Tab and PageDown acceptance; local daemon failed without Chromium, Cloud SDK hung; active-session query returned zero | 2026-10-30 / commit `9e451b9` | ≤20 MiB local runtime/temp | Remove exact runtime/temp after this session | `removed`; exact runtime/temp removed after confirming no active Cloud session; evidence retained in acceptance report |
| `KEY-PAGEDOWN-CHROME-20261030` | Coordinator | `/tmp/keyboard-pagedown-chrome-profile-20261030/` and `/tmp/keyboard-pagedown-chrome-runtime-20261030/` (removed) | Isolated local Chrome with Browser Use CDP for live generated Tab and PageDown acceptance | 2026-10-30 / commit `9e451b9` | 182 MiB profile plus 12 KiB runtime measured at cleanup | Stop owned Chrome and remove exact profile/runtime after evidence capture | `removed`; Chrome was closed; exact profile/runtime removed; evidence retained in acceptance report |
| `KEY-PAGEDOWN-RELEASE-20261030` | Coordinator | `/tmp/keyboard-pagedown-release-20261030/` (removed) | Clean detached worktree for building the PageDown handler and inspecting exact generated deploy payload; base `eca47b2ea5655a674068bc974af53209f68f79d8`; shared `node_modules` symlink only | 2026-10-30 | 1.0 GiB measured before cleanup | Remove after exact deploy and post-deploy verification this session | `removed`; worktree registration and path removed after release evidence was recorded |
| `KEY-SOP-LIVE-AUDIT-20261030` | Coordinator | `/tmp/keyboard-sop-live-audit-runtime-20261030/`, `/tmp/keyboard-sop-live-audit-tmp-20261030/`, and `/tmp/keyboard-sop-live-audit-profile-20261030/` (removed) | Isolated Browser Use daemon plus task-owned headless Chrome profile on CDP port 9237 for production SOP gap recheck; generated keyboard input only; no form submission or external action | 2026-10-30 / deployed commit `9e451b9` | 167 MiB profile; 92 KiB runtime/temp measured at cleanup | Stop task-owned Chrome/daemon and remove exact profile/runtime/temp after evidence capture | `removed`; Chrome session ended, daemon PID had no running process, exact paths removed. 200% failure screenshot saved in keyboard SOP evidence. |
| `SCHEDULE-FOCUS-CUE-FIX-20261030` | Coordinator; ordinary accessibility QA/CSS focus specialist fallback | `/tmp/schedule-focus-cue-fix-20261030/` | Isolated worktree from `4b499b7`; change only the invalid Schedule hero CTA focus outline, build to map its exact generated CSS/route output, reuse the shared `node_modules` symlink | 2026-10-30 | ≤1.5 GiB; no copied dependencies or browser profile | Same session after focused checks, reviewed commit, exact deployment, live 100%/200% focus proof; then remove exact worktree | planned; inventory recorded before creation after preflight passed |

| Workstream ID | Owner | Exact path | Purpose | Creation date / base | Size budget | Closeout trigger | Status and preserved artifacts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `KEY-ACCEPTANCE-RESUME-20261030` | Coordinator | `/tmp/keyboard-final-browser-runtime/` and `/tmp/keyboard-final-browser-tmp/` | Browser Use isolated daemon runtime only; no Chrome profile created | 2026-10-30 / `eca47b2e` | 10 MiB | Remove after native Schedule transition verification attempt this session | `removed`; daemon could not attach because no Chrome was running; no evidence created |
| `KEY-PAGEDOWN-OUTPUT-20261030` | Coordinator | `/tmp/keyboard-pagedown-output-20261030/` | Current-source Eleventy output for verifying the shared PageDown focus-preservation script and route mapping | 2026-10-30 / working tree source | 108 MiB measured; ≤200 MiB | Remove after rendered-output and syntax checks this session | `removed`; current-source render verified handler on Home, Schedule, Free Intro, and Visit; output deleted |

Before creating a temporary workspace, record in the orchestration report:

- Workstream ID, owner, purpose, and exact path.
- Creation date, base commit/source snapshot, and expected size.
- Closeout trigger and target date. The default trigger is coordinator acceptance or cancellation in the same session.
- Required artifacts to preserve after closeout.

Prefer a Git worktree over a full repository copy. Do not copy `node_modules`, `.venv`, `venv`, browser profiles/caches, or generated `dist` by default. Reuse the repository toolchain where supported. If an exception is required, record its reason and size; place it inside the owned workspace and remove it at closeout.

### Creation gate

Before creating a checkout, environment, profile, or build directory:

1. Search the inventory and existing task outputs for a reusable workspace; reuse it only when its owner confirms the same base/source and clean status.
2. Record the lifecycle fields above **before** creation. If the workspace cannot be inventoried, do not create it.
3. Set an explicit same-session closeout trigger. For work that must span sessions, assign a named next owner and a review date no more than seven days out.
4. Set a size budget. Measure the created workspace after setup; if it exceeds the estimate materially, stop and remove avoidable duplicated content before work continues.
5. Put ephemeral data under the owned workspace, never in a shared/default profile or broad temp directory. Set unique profile names and ports for concurrent browser tasks.

Do not create multiple full checkouts from the same source for read-only reviews. Use one source checkout and separate report paths. When Git metadata is unavailable, use a read-only shared checkout and isolated evidence paths; do not silently fall back to repository copies.

## Recurring review

At the start and end of each focused work session, reconcile the workspace inventory with `git worktree list --porcelain`, exact temporary paths, and `df -h /tmp .`. Do not dispatch another wave until the prior wave's entries have a current owner and status. Treat an expired closeout date as a cleanup review due: preserve unique evidence, confirm no process is using the path, then remove the exact verified workspace or record a named next owner and new review date.

Run the read-only audit below at session start, before dispatch, and at closeout. It reports likely large temp workspaces and nested environments; discovery is heuristic, so review the candidates and inspect inventory paths too. The audit never decides whether deletion is safe. Report new untracked directories, stale entries, overdue review dates, and low disk headroom before starting another wave.

Make cleanup part of the workstream's DoD, not a later maintenance task. Before reporting a focused session complete, close every owned temporary path in that session or update its inventory row with `retained`, a named next owner, a concrete reuse reason, and a review date within seven days. A path without an owner or current inventory row is an audit finding: identify its owner from the orchestration log, preserve any unique work, then remove it only after the checks below pass. Never leave an expired environment silently active across sessions.

For new work, append the inventory row before creating the path and update it immediately when the path is created, resized, shared, or closed. Shared resources (such as one preview build used by several audits) have one coordinator owner; dependent workstreams record that shared path and their dependency, and the coordinator removes it after the last consumer closes. Workers must report process IDs they started and stop those exact processes during closeout. Do not transfer ownership implicitly when a worker finishes.

The stale-registration check is non-destructive. Inspect each registered path and flag registrations whose path is absent. `git worktree prune --dry-run --verbose` can preview stale administrative entries. After verifying absent paths and preserving needed artifacts, `git worktree prune` removes stale Git metadata; it does not delete existing directories.

## Workstream closeout

1. Coordinator reviews the source diff and verification evidence independently.
2. Confirm the change is integrated and any required commit/deployment proof is recorded. A clean Git status alone is not evidence of integration.
3. Move unique reports, patches, logs, and evidence to a durable location and verify those files exist.
4. Confirm no running process uses the checkout, profile, build, or environment.
5. Remove only the exact accepted workspace and its temporary outputs. Record retained artifacts, cleanup evidence, and the disk-space change in the inventory.
6. Re-run the workspace audit and compare the inventory's active/retained rows with exact paths on disk. Resolve every same-session `active` row before closing the session.

The coordinator owns cleanup if a worker crashes, times out, or exits early. Keep a workspace with unintegrated source changes, unresolved ownership, or unpreserved evidence. Mark it `retained` with a named next owner and review date. Do not delete unowned work to save space.

If release work remains open but a candidate is already integrated into the shared tree, compare the candidate and shared source bytes, retain its patch/report/evidence, and remove only the duplicate checkout. Record that source integration is complete while commit or deployment remains open.

## Quick checks

```bash
git status --short --branch
git worktree list --porcelain
git worktree prune --dry-run --verbose
df -h /tmp .
```

Optional consolidated, read-only inventory (only if the audit script is present):

```bash
rtk proxy python3 tools/workspace-audit.py --root . --inventory docs/styling-workstreams/2026-10-29-responsive-workstream-inventory.md --temp-root /tmp
```

Use `npm run qa:workspace:preflight` before creating or dispatching any temporary checkout, build, profile, or environment. This checks that no inventory row is still `active` or `planned`, retained rows have a named owner and review date within seven days, and registered worktree paths exist. A nonzero result blocks new temporary work until the inventory is reconciled. Then run `npm run qa:workspace` to review large unregistered candidates and disk headroom. The preflight is deliberately read-only: it cannot decide whether a dirty path is disposable and never deletes anything.

Run the audit as an explicit lifecycle gate at session start, before dispatch, and after cleanup. The script is read-only by design; it cannot determine ownership, prove that evidence is preserved, or delete a candidate. Record each candidate's disposition in the inventory rather than treating a clean script exit as cleanup approval.

The audit reports registered worktrees, missing registered paths, tracked inventory path mentions, likely large project workspaces/nested environments, and disk headroom. It must not run `git worktree prune`, remove files, or scan/delete arbitrary temporary directories. Treat candidates and any inventory/path mismatch as human review items. `--min-size-mib` sets the report threshold (default 128 MiB).

Before deleting a Git checkout, compare its branch commit with the integrated source and inspect its worktree status. Before deleting a Python environment, confirm no active process uses its interpreter. Check `du -sh` on exact candidate paths. Never run blanket deletion such as `rm -rf /tmp/*`, delete by wildcard, or remove a dirty/unowned checkout automatically.

For Python environments, first identify the exact interpreter and check process command lines for that interpreter/path; never infer inactivity from age alone. For browser profiles and generated builds, check that their owning server/browser is stopped and that unique evidence has been preserved. For a redundant checkout, compare every dirty/untracked file with the shared source and durable evidence before removal. If ownership, integration, or evidence is uncertain, retain it with a next owner and review date rather than deleting it.

## Stale-environment prevention standard

- Prefer no environment per workstream: share the installed project toolchain when compatible, and use a single temp environment per active wave when isolation is needed.
- Record environment paths in the workspace inventory before creation, including why reuse is unsuitable, expected size, owner, and same-session closeout trigger.
- Put caches and browser profiles under the owning workspace; never let default browser or package-manager caches become untracked task artifacts. Do not copy environments into worktrees.
- At session end, close browser/server processes, preserve required evidence, and remove only the exact owned environment/profile/build path after checking process use. Update the inventory with size and cleanup result.
- At session start, review the auditor's large candidate list. A directory's age or name alone never authorizes deletion; reconcile ownership and process use first.
- Do not retain virtual environments or generated builds after their accepted artifacts are captured unless a named owner documents a specific reuse need and review date.
- Reuse the coordinator's current build for dependent read-only checks where source hashes and build scope match; do not start another build just because a worker has a separate report directory.
- Stop exact browser, preview-server, and build processes before removing their paths. Record the process check and resulting size/free-space change; if a process is still needed by another stream, record the dependency and coordinator owner.
- End each session with no `active` environment row owned by that session. Retention requires explicit `retained` status, next owner, reuse reason, and a review date within seven days; at that review, either close it or document a fresh bounded reuse period.
- For shared or user-created temporary paths whose ownership cannot be established, record `unowned - review required`; do not delete until the originating work and unique artifacts have been reconciled.

## Inventory fields

For each workspace, track: workstream ID, owner, path, purpose, creation date, base commit/source snapshot, expected size, closeout target, status (`active`, `accepted`, `retained`, or `removed`), unique artifacts preserved, cleanup evidence, and next review date when retained. Reconcile this inventory against Git registrations and exact temporary paths before each new wave and at goal closeout.

## Active session profiles

| Workstream | Owner | Exact path | Purpose / created from | Expected size | Closeout trigger | Status / evidence |
| --- | --- | --- | --- | --- | --- | --- |
| `KEYBOARD-200-NATIVE-ZOOM-20261030` | Coordinator | `/tmp/keyboard-sop-200-zoom-20261030/` | Isolated headed Chrome CDP profile and local build for 200% keyboard acceptance; created 2026-10-30 from committed release `8fa2cf7` | actual 708 MiB | Close isolated Chrome and remove exact profile/build after evidence capture | `removed`; local Visit focus evidence recorded in `2026-10-30-keyboard-sop-acceptance.md`; closed preview tab/server and Chrome, verified no Chrome process referenced the path, removed 708 MiB |
| `KEYBOARD-RELEASE-CLEAN-BUILD-20261030` | Coordinator | `/tmp/keyboard-sop-release-build-20261030/` | Trial clean committed-source archive; exceeded 300 MiB budget before any build | actual 1.0 GiB | Remove immediately when size exceeded budget | `removed`; no build run; exact 1.0 GiB archive deleted |
| `KEYBOARD-RELEASE-ARTIFACT-20261030` | Coordinator | `/tmp/keyboard-sop-release-artifact-20261030/` | Save current ignored Visit output and retrieve exact raw remote Visit file for narrow patch/deploy; preserve and restore local bytes | ≤10 MiB | Restore generated Visit output and remove remote copy after deploy verification this session | `removed`; exact local Visit/Kids/Teens/Adults generated files restored byte-for-byte; remote baseline/candidate and backups removed after deploy |
| `KEYBOARD-NATIVE-POSTDEPLOY-20261030` | Coordinator | `/tmp/keyboard-sop-native-final-20261030/` | Isolated headed Chrome CDP profile to verify production Visit at native 200% after `2462f0c9` using generated keyboard input | ≤800 MiB | Close isolated Chrome and remove exact profile after evidence capture this session | `removed`; native 200% acceptance evidence recorded in `2026-10-30-keyboard-sop-acceptance.md`; verified no Chrome process referenced the profile, removed 203 MiB |

## Schedule class-link cache-buster handoff — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `SCL-DIRTY-ROUTE-PRESERVE-20261031` | Coordinator | `/tmp/scl-dirty-schedule-index-20261031.html` | Byte-preserving copy of the dirty local generated Schedule route while a clean committed route with only the cache-buster change is staged; base `d713212` | 2026-10-31 | Current route file only | Restore original bytes immediately after deployment verification, then remove | removed after live verification; preserved snapshot hash `58d38e5885de43fc13456e6d458e401a88d7d5ddc8bc6e3a6020b133d1c680ef`; restored local route hash `9d2a0a1c1c40f1370a64077156f1c5f6c1b29da17ec951eb4af4c52090635183`; temp backup deleted |

## Near-town CSS release workspace — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `NEAR-CSS-CLEAN-BUILD-20261031` | Coordinator | `/tmp/near-css-release-20261031/` | Clean detached worktree at `a9e52a15780b2737c965f30759f241fc6445a2c0`, with only reviewed `src/assets/css/pages/near.css` diff applied; shared `node_modules` symlink only; no copy of dirty `dist` | 2026-10-31 | ≤2 GiB; no browser profile | After exact build/dry-run and browser evidence are reconciled into the release report, stop owned processes and remove exact worktree | removed; actual peak 1.6 GiB, no unique edits or artifacts retained |

| `NEAR-CSS-BROWSER-20261031` | Coordinator | `/tmp/near-css-browser-profile-20261031/` | Isolated local Chrome profile for Browser Use checks of `/near/hunter-ny/` and `/nearby-towns/`; CDP `127.0.0.1:9237`; off-origin DNS blocked | 2026-10-31 | ≤800 MiB | Stop Chrome/Browser Use daemon and local preview server, capture evidence, then remove exact profile/runtime | removed; profile and preview server were previously removed (6.6 MiB profile); later doctor still reported named `near-css-20261031` session despite no matching local process/listener, so coordinator stopped only that named daemon; post-stop doctor confirmed 0 active connections and no Chrome; retained control worktree untouched |

## Hospitality partner CSS release workspace — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PARTNERS-HOSPITALITY-CSS-20261031` | Coordinator; read-only CSS source auditor | `/tmp/partners-hospitality-css-20261031/` | Clean detached worktree at `7667308d`, with reviewed hospitality CSS diff; shared `node_modules` symlink; no copy of dirty `dist` | 2026-10-31 | actual 1,012 MiB | Remove after selector and live-route evidence are reconciled | removed; CSS source committed as `40a7fc6`; production HTML matched local generated route main content and stylesheet references; production CSS matched local generated bytes exactly (26,285 bytes, SHA-256 `67fc90a160bdd59386a4914e4bffe608bafbca9099953821926e05c1a2fd9295`); no process referenced worktree; removed exact checkout, recovering about 1,012 MiB; browser check skipped because Browser Use doctor reported another active `near-css-20261031` session |

## Glossary reduced-motion release workstream — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GLOSSARY-MOTION-RELEASE-20261031` | Coordinator; ordinary JavaScript/accessibility release specialist fallback | `/tmp/glossary-motion-release-20261031/` | Sparse detached worktree at `95c4889`; source/build inputs and two required root image assets only; shared `node_modules` symlink; clean `dist` generated during build | 2026-10-31 | ≤1.5 GiB; actual peak about 1.1 GiB | After focused build, exact release dry-run, live/browser evidence, or documented no-go; remove same session | removed after commit `cecfa4c`, deployment, live HTTP verification, and Browser Use reduced/normal-motion proof; no unique artifacts retained |
| `GLOSSARY-MOTION-BROWSER-20261031` | Coordinator | `/tmp/glossary-motion-browser-profile-20261031/` | Isolated local Chrome profile and Browser Use daemon `glossarymotion20261031` on CDP `127.0.0.1:9241`; local build only; off-origin DNS blocked | 2026-10-31 | ≤600 MiB | Stop task-owned browser and local preview, then remove after reduced-motion and normal-motion checks | removed after both checks passed; daemon, Chrome, preview server, and exact profile stopped/removed; port `9241` closed |

## Free Intro styling audit workstreams — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `FREE-INTRO-STYLING-SOURCE-AUDIT-20261031` | Coordinator; ordinary frontend/CSS/accessibility auditor fallback | `/tmp/free-intro-source-audit-20261031/` | Sparse detached worktree at `cecfa4c`; only the two dirty Free Intro partials and owning route/layout/shared tokens, with those source diffs copied for read-only review; no dependencies or generated output | 2026-10-31 | ≤128 MiB | Same-session coordinator review; remove exact worktree | removed after confirming both partials are not active sources; findings preserved in current goal handoff; exact Git worktree removal completed; no unique artifacts |
| `FREE-INTRO-STYLING-OUTPUT-MAP-20261031` | Coordinator; ordinary Eleventy/deploy mapping auditor fallback | `/tmp/free-intro-output-audit-20261031/` | Sparse detached worktree at `cecfa4c`; package/build config, the two changed partials, owning route, layout, and deploy mapper; source diffs copied for read-only review; no dependencies or generated output | 2026-10-31 | ≤128 MiB | Same-session coordinator review; remove exact worktree | removed after confirming generated mapping requires `tools/build-free-intro-styles.mjs` in scoped release; findings preserved in current goal handoff; exact Git worktree removal completed; no unique artifacts |

## BJJ Stretches release audit workstreams — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `BJJ-STRETCHES-SOURCE-AUDIT-20261031` | Coordinator; ordinary frontend/CSS reviewer fallback | `/tmp/bjj-stretches-source-audit-20261031/` | Sparse detached worktree at current main HEAD; active BJJ Stretches source/CSS, no dependencies or generated output; read-only | 2026-10-31 | ≤64 MiB | Coordinator reviews result and removes exact worktree same session | removed after read-only selector review; exact Git worktree removed after no process or unique artifact was found |
| `BJJ-STRETCHES-OUTPUT-MAP-20261031` | Coordinator; ordinary Eleventy/deployment mapper fallback | `/tmp/bjj-stretches-output-audit-20261031/` | Sparse detached worktree at current main HEAD; route source, builder, minifier, package script, deploy mapper; no dependencies or generated output; read-only | 2026-10-31 | ≤64 MiB | Coordinator reviews result and removes exact worktree same session | removed after read-only route/output review; exact Git worktree removed after no process or unique artifact was found |
| `BJJ-STRETCHES-CLEAN-BUILD-20261031` | Coordinator; ordinary CSS release specialist fallback | `/tmp/bjj-stretches-clean-build-20261031/` | Clean detached worktree at `cecfa4c`; candidate one-line FAQ target-size source change and regenerated minified pair; shared `node_modules` symlink only; clean generated `dist` | 2026-10-31 | ≤1.8 GiB | After exact route/CSS dry run and local browser evidence, or documented no-go; remove same session | active; source and output mapping audits are closed; isolated clean build created only after preflight |
| `BJJ-STRETCHES-BROWSER-20261031` | Coordinator | `/tmp/bjj-stretches-browser-profile-20261031/` | Task-owned headed Chrome profile plus temporary GSettings schema overlay for local `/bjj-stretches.html` preview; loopback CDP and off-origin resolution blocked | 2026-10-31 | ≤800 MiB | Stop browser and preview server, remove exact profile/schema after responsive evidence | removed; actual profile/schema size 7.2 MiB; task-owned Chrome and preview server exited, named Browser Use daemon stopped, CDP/preview ports confirmed closed; exact profile/schema removed |

## Wellness partner CSS audit workstreams — 2026-10-31

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `WELLNESS-PARTNER-SOURCE-AUDIT-20261031` | Coordinator; ordinary frontend/CSS reviewer fallback | `/tmp/wellness-partner-source-audit-20261031/` | Sparse detached worktree at current main HEAD; wellness route/CSS and relevant includes; no dependencies/generated output; read-only | 2026-10-31 | ≤128 MiB | Coordinator review then exact worktree removal same session | removed after selector review; exact checkout removed; findings recorded in release handoff |
| `WELLNESS-PARTNER-OUTPUT-MAP-20261031` | Coordinator; ordinary Eleventy/deploy mapper fallback | `/tmp/wellness-partner-output-map-20261031/` | Sparse detached worktree at current main HEAD; route, CSS, package/build scripts, deploy mapper; read-only | 2026-10-31 | ≤128 MiB | Coordinator review then exact worktree removal same session | removed after route mapping review; exact checkout removed; findings recorded in release handoff |
| `WELLNESS-PARTNER-CLEAN-BUILD-20261031` | Coordinator; ordinary CSS/static-site release specialist fallback | `/tmp/wellness-partner-clean-build-20261031/` | Clean detached worktree at `59dccea`; apply only Wellness CSS font-size rule plus focused route-pair deploy mapping; shared `node_modules` symlink only; isolated clean `dist` | 2026-10-31 | ≤1.8 GiB | After exact route/CSS dry run, local responsive evidence, live verification or documented no-go; remove same session | removed after commit `c5c97bfb`, deployment and live route/CSS verification; generated output and manifest discarded; exact 1.6 GiB worktree removed 2026-10-31 |
| `WELLNESS-PARTNER-BROWSER-20261031` | Coordinator | `/tmp/wellness-partner-browser-profile-20261031/` | Task-owned headed Chrome profile and temporary GSettings schema overlay; explicit loopback CDP; block off-origin requests | 2026-10-31 | ≤800 MiB | Stop browser/server, remove exact profile/schema after responsive evidence | browser daemon/server stopped; a 12 MiB profile residue was later discovered with no Chrome process or open file using it, then removed 2026-11-01; port 9228 closed |

## Glossary hit-area release qualification — 2026-11-01

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `GLOSSARY-HIT-AREA-CLEAN-BUILD-20261101` | Coordinator; ordinary frontend/accessibility release specialist fallback | `/tmp/glossary-hit-area-clean-build-20261101/` | Clean detached worktree based on `5016ca7a`; qualified hub-only CSS/ARIA/filter changes; excluded shared term-page stylesheet; included temporary deployment script only to target this worktree; shared `node_modules` symlink | 2026-11-01 | ≤1.8 GiB; actual 1.6 GiB | After focused build, live browser proof, exact deployment dry run and verification; remove same session | closed after commit `d150476a` was deployed as exactly `bjj-glossary/index.html` and `js/glossary-filters.min.js`; local and live browser checks passed at 320, 360, 390, 430, and 1440px; live JS bytes matched; 155-route parity evidence retained at `docs/styling-workstreams/evidence/2026-11-01/glossary-live-parity.json` (three route mismatches); 1.6 GiB checkout and generated artifacts removed |
| `GLOSSARY-HIT-AREA-OUTPUT-AUDIT-20261101` | Coordinator; ordinary Eleventy output-mapping auditor fallback paired with `Instructions - CODE` | `/tmp/glossary-hit-area-output-audit-20261101/` | Minimal detached review worktree with exact candidate HTML pages, fingerprinted CSS, JS alias, changed glossary sources and live samples; no dependencies or browser profile; read-only audit | 2026-11-01 | ≤256 MiB | Coordinator reviews report, then removes exact worktree same session | review complete; 157-path broad payload no-go because mapper omitted `updates/index.html`; 7 sampled routes matched; exact 11 MiB review worktree removed 2026-11-01 |

## Stale detached checkout forensic workstream — 2026-11-01

| Workstream ID | Owner | Exact path | Purpose / base | Creation date | Size budget | Closeout trigger | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `STALE-CHECKOUT-AUDIT-1` | Coordinator; read-only ordinary Git worktree forensic auditor fallback | `/tmp/style-swarm-20261027-control/` | Existing detached checkout at `02634569`; compare its 91 dirty paths to main; no new checkout, no writes, no build, no dependency copy | 2026-11-01 | actual about 1,002 MiB | After all 51 differing paths are reviewed, selected changes safely preserved, and no unique user work remains | active; 40 exact current-worktree matches; 51 current-worktree differences; 64 tracked changes absent from main history, 20 overlapped by later main commits, 3 already in main HEAD; unsafe to remove pending reconciliation; see `docs/styling-workstreams/2026-11-01-stale-worktree-forensics.md` |

| `ALLEY-BOOTCAMP-44PX-RELEASE-20261101` | Coordinator; ordinary static-site CSS/release specialist fallback | `/tmp/alley-bootcamp-44px-release-20261101/` | Validate the existing four-line `src/assets/css/pages/alley-bootcamp.css` tap-target change from clean main, build the exact generated route and fingerprinted stylesheet, then inspect an exact deploy dry run; no unrelated source/output changes | 2026-11-01 / commit `5016ca7a` plus only the scoped source patch | ≤1.2 GiB; symlink shared `node_modules` only | Same-session after clean build, payload review, and release decision; remove exact worktree and build outputs, retain report and screenshot | closed; commit `7540eb33` fast-forwarded to main, exact two-file deployment verified live, worktree and browser server removed |

| `STUDENT-HUB-COPY-PREVIEW-20261101` | Coordinator | `/tmp/student-hub-copy-preview-20261101/` (removed) | Isolated local Chromium check of the Student Hub referral copy button's clipboard success and selection fallback; no form submission or external requests | 2026-11-01 / current main `596eb40` generated `dist` | ≤200 MiB; no copied dependencies or shared browser profile | Stop server and browser; remove exact profile/temp directory after same-session checks | closed; Playwright system Chromium used after Browser Use doctor found no task-owned Chrome/daemon; off-origin requests blocked; profile and server removed |

| `GLOSSARY-DAY-ONE-TARGET-PREVIEW-20261101` | Coordinator | `/tmp/glossary-day-one-target-preview-20261101/` (removed) | Measure existing generated glossary day-one button boxes at 320px and 390px for the preserved `min-width` CSS edit; local-only pointer/layout evidence, no route modification | 2026-11-01 / main `5ecf10b2` plus current dirty glossary output | ≤200 MiB; one explicit temporary Chromium profile, no copied dependencies | Same-session after measurements; stop server and remove exact profile | closed; all eight buttons measured 62x44px at 320px and 390px; no overflow; profile and server removed |

| `GLOSSARY-DAY-ONE-CSS-RELEASE-20261101` | Coordinator; ordinary static-site release specialist fallback | `/tmp/glossary-day-one-css-release-20261101/` plus `browser-profile/` child (removed) | Clean Eleventy candidate for glossary CSS; compare live inline CSS; measure hub targets at 320px, 390px, and desktop; verify exact route and term-page output mapping | 2026-11-01 / main merge `5ecf10b2` plus scoped glossary CSS and term-source inputs | ≤1.7 GiB; shared `node_modules` symlink only | Same-session after parity decision and evidence handoff | closed; candidate CSS SHA-256 `dbaccfb3…` matched live, all 56 hub controls were ≥44px at 320/390/1440 with no overflow, schedule links were live as requested; term-page output mismatch was documented; exact checkout, browser profile, and local servers removed; details in `docs/styling-workstreams/2026-10-31-glossary-output-reconciliation.md` |
