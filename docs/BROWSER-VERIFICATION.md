# Browser verification

## Repeatable public-page checks

Use an isolated headless browser first for repeatable public-page checks. The
installed Playwright dependency launches its own browser and fresh contexts; it
needs no personal Chrome profile, login, or remote browser service.

```sh
rtk proxy node tools/browser-proof.mjs https://senseisandy.com/programs /tmp/programs-proof
```

Request elevated network approval before checking external URLs. In this managed
workspace, browser launch also needs elevation because sandbox restrictions block
Chromium sockets. A socket permission error calls for an approved elevated run,
not repeated sandbox launch. Use `CHROME_PATH` to select an existing executable
if the bundled browser is unavailable. The helper checks installed Chrome or
Chromium and does not install dependencies or download browsers. Each run closes
its browser and writes separate 390px mobile and 1440px desktop screenshots,
rendered HTML, and JSON evidence. JSON includes visible text, links, CTA
dimensions and viewport positions, headings, metadata, JSON-LD, horizontal
overflow, page errors, and failed requests. Inspect screenshots against the exact
task requirements; successful navigation alone does not prove acceptance. Use a
distinct output directory for each run and retain prior evidence. Keep evidence
in `/tmp` or another non-public location.

## Interactive browser work

Use the user-level `browser-use` CLI and skill when a task needs direct browser
interaction, JavaScript-rendered state, or visual inspection. Check setup with
`browser-use --doctor`. For local-only work, use a fresh temporary browser
profile and an explicit `BU_CDP_URL`. Give every concurrent workstream a unique
`BU_NAME`: `BU_CDP_URL` alone can still attach calls to the shared default
daemon. Never reload the default daemon while another workstream may use it.
Block off-origin requests while inspecting a local preview. Use the user's
existing profile only when the task specifically requires its signed-in
session. Do not start a cloud browser unless the task requires it and the user
has authorized it.

The `browser-use` CLI and skill are installed outside this repository and must
not be added to the site's dependencies. Local recordings remain off unless the
user opts in.

Use browser-use for task-approved keyboard, scroll, click, and targeted state
inspection. Keep `tools/browser-proof.mjs` as the repeatable mobile/desktop
evidence path for route checks. Use isolated contexts for local interaction;
never submit forms or trigger external side effects unless the task explicitly
authorizes them.

## Local Chrome CDP setup on this host

This host has Google Chrome at `/usr/bin/google-chrome-stable`; `/snap/bin/chromium` cannot provide the CDP connection required by browser-use. Set `BH_CHROME_PATH=/usr/bin/google-chrome-stable`. For an isolated local preview, launch headed Chrome on X11 with a fresh user-data directory, loopback-only remote debugging, and host-resolver rules that block off-origin requests. Use a unique `BU_NAME` and explicit `BU_CDP_URL=http://127.0.0.1:<port>` for each workstream. Chrome also needs a temporary GSettings schema overlay here because the installed XSettings schema is missing `font-antialiasing`; setup and verification are recorded in [the native zoom acceptance report](styling-workstreams/2026-10-29-native-zoom-reflow-acceptance.md). Keep the profile and schema overlay inside the inventoried temporary workspace and remove them at closeout. Do not reuse or reload the default daemon while another workstream may be using it.
