# Keyboard SOP browser acceptance handoff — 2026-10-30

## Goal and scope

Complete the keyboard acceptance SOP using owner-approved browser-generated keyboard input instead of physical HID input. Keep Lighthouse/PageSpeed, site-wide contrast, screen-reader speech, physical-device checks, and live booking/contact/form submissions out of scope.

## Persona & Expert Framework

- **Coordinator role:** ordinary keyboard-accessibility/frontend task specialist. `persona_quick.py --plan --json` returned `no_suitable_persona` with `accessibility` and `frontend` uncovered; no catalog role UUID or prompt source was suitable. This fallback was used explicitly.
- **Master INSTRUCTIONS asset:** `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, version `v1.0.0`, ready, no attachments. Source: `assets/indranet-prompt-exporter/exports/index.json`, `text` field, 1,500 characters, SHA-256 `99075cfe1fba1325006241a460605c847c9c35c0be15da863951c11ec26a7ccf`. The complete source was read in contiguous chunks. Applied methods: scope requirements first, use a small targeted change only when evidence shows a defect, verify the rendered behavior, preserve release boundaries, and document evidence.
- **Independent reviewer:** `schedule_focus_cue_audit` used an ordinary accessibility QA specialist fallback after its selector found no suitable accessibility/frontend profile. Read-only review confirmed that an offscreen target would fail the SOP if it remained offscreen after scrolling settled, and recommended activating a hidden browser tab before classifying the result. No files were changed by the reviewer.
- **Skill used:** Browser Use 0.1.13. Its initial doctor check found Chrome stopped; a task-owned isolated Chrome was started. The final production tab was activated so native scrolling, animation frames, and media-query events could settle.

## Bounded workstream contract

**ID:** `KEY-SCHEDULE-TAB-VISIBILITY-20261030`

- **Read paths:** owner SOP, acceptance summary/report, `src/assets/js/schedule-month-calendar.js`, generated Schedule route, and deployed production Schedule route.
- **Write paths:** acceptance evidence and SOP/report documentation only. A temporary source candidate was built in `/tmp/schedule-tab-focus-20261030/`; it was not retained or deployed.
- **Allowed actions:** Browser Use-generated Tab/PageDown/PageUp, exact viewport changes, read-only DOM inspection, isolated build, narrow documentation updates, and cleanup of task-owned temporary paths.
- **Prohibited actions:** physical keyboard claims, link activation, form submission, external booking/contact actions, Lighthouse/PageSpeed, site-wide contrast checks, broad staging, and cleanup of unrelated dirty work.

## Definition of done and evidence

| DoD | Acceptance evidence | Result |
| --- | --- | --- |
| `KA-1` Browser-generated keyboard input replaces physical HID input | Production Browser Use 0.1.13 with Chrome 151.0.7922.137; generated Tab/PageDown/PageUp only | Pass; no physical keyboard used |
| `KA-2` Tab reaches the selected mobile date at 767 CSS px and leaves visible focus after scrolling settles | [Production trace](evidence/2026-10-30/keyboard-sop-full/schedule-tab-focus-visible-production.json), [screenshot](evidence/2026-10-30/keyboard-sop-full/schedule-tab-focus-visible-production.png) | Pass; focus ring visible at y=425.7–474.0 after 2.5s; `scrollY=2435` |
| `KA-3` Same date remains selected and visibly focused through 767 → 768 → 769 → 767 | Trace records native `MediaQueryList.change` events at 768 (`matches=false`) and 767 (`matches=true`); the 769 desktop layout stays focused | Pass in both directions |
| `KA-4` PageDown/PageUp preserves Schedule calendar month-navigation behavior and visible focus | Trace records November 30 after PageDown and October 30 after PageUp, with `:focus-visible=true` and no horizontal overflow | Pass |
| `KA-5` No external side effect occurs | No links activated; no forms or external actions submitted | Pass |
| `KA-6` Release remains narrow and documented | Existing production CSS correction `6da8cc6` remains deployed; no new site code was needed. Documentation will be committed narrowly; docs are not a production payload. | Pass |
| `KA-7` Unrelated dirty checkout and generated tree remain intact; task-owned environments close | The temporary candidate worktree is disposable; existing dirty `dist/` and unrelated files are not staged or restored | Closeout pending until workspace audit below |

## Finding and decision

A first sample showed the date offscreen while the task-owned Browser Use tab was hidden. After activating that tab and repeating generated Tab from the top, Chrome completed its normal focus scroll and showed the date and its focus ring. The independent reviewer advised waiting for scrolling to settle and not treating a hidden-tab sample as a production failure. The foreground-visible production run then passed the native breakpoint transitions in both directions and PageDown/PageUp.

The local helper candidate that scrolled on `focusin` was unnecessary for the observed production behavior. It was not committed or deployed. The existing scoped Schedule CSS fix remains the latest production code change for this acceptance wave.

## Closeout

- Production evidence and the acceptance report are the source of truth for this run. The owner clarified that PageDown acceptance requires the focused control to remain visible; the production trace passes this criterion.
- The production code release remains the previously deployed narrow payload; no new public files require deployment.
- The owned Chrome sessions are stopped, `browser-use --doctor` confirms Chrome, daemon, and active connections are absent, the local preview server is stopped, and the two task-owned profile directories are removed. Production JSON and screenshot remain in the repository.
- The isolated candidate worktree directory is absent, but Git metadata is read-only in this session. `git worktree list` reports a stale, prunable registration and its temporary branch remains. The workspace audit ran before closeout and produced no findings; rerun after Git metadata cleanup is available.
