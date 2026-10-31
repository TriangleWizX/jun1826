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
| `SCL-DIRTY-ROUTE-PRESERVE-20261031` | Coordinator | `/tmp/scl-dirty-schedule-index-20261031.html` | Byte-preserving copy of the dirty local generated Schedule route while a clean committed route with only the cache-buster change is staged; base `d713212` | 2026-10-31 | Current route file only | Restore original bytes immediately after deployment verification, then remove | active; SHA-256 58d38e5885de43fc13456e6d458e401a88d7d5ddc8bc6e3a6020b133d1c680ef |
