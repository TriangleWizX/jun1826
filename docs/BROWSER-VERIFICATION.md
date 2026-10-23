# Browser verification

Use an isolated headless browser first for public-page checks. The installed
Playwright dependency launches its own browser and fresh contexts; it needs no
Chrome harness, CDP daemon, personal profile, login, or remote browser service.

```sh
rtk proxy node tools/browser-proof.mjs https://senseisandy.com/programs /tmp/programs-proof
```

Request elevated network approval before checking external URLs. In this managed
workspace, browser launch also needs elevation because sandbox restrictions block
Chromium sockets. A socket permission error calls for the approved elevated run,
not a repeated sandbox launch. Use `CHROME_PATH` to select an existing executable
if the bundled browser is unavailable. The helper also checks installed Chrome
and Chromium. It does not install dependencies or download browsers.

Each run closes its browser and writes separate 390px mobile and 1440px desktop
screenshots, rendered HTML, and JSON evidence. JSON includes visible text, links,
CTA dimensions and viewport position, headings, metadata, JSON-LD, horizontal
overflow, page errors, and failed requests. Inspect the screenshots and the exact
task requirements; successful navigation alone does not prove acceptance.
Use a distinct output directory for each page or run to retain prior evidence.
Keep evidence in `/tmp` or another non-public location.

For interaction checks, extend a task-specific script using isolated Playwright
contexts. Reserve the interactive Chrome harness for work that explicitly needs
the user's existing signed-in browser session. If that session is required and
unavailable, report the missing access; an isolated browser does not prove access
to a signed-in account.
