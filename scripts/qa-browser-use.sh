#!/usr/bin/env bash
set -euo pipefail

# Browser Use rendered contract. Start the local site first, for example:
#   npm run dev -- --port=8080
# Then run:
#   npm run qa:browser-use -- http://127.0.0.1:8080

BASE_URL="${1:-http://127.0.0.1:8080}"

browser-use <<PY
from browser_use import *

base = "${BASE_URL%/}"
routes = ["/", "/schedule", "/free-bjj-intro-tannersville-ny"]
widths = [320, 375, 414, 768, 1440]
failures = []

for route in routes:
    for width in widths:
        new_tab(base + route)
        wait_for_load()
        set_viewport_size(width, 900)
        result = js("""
          (() => {
            const body = document.body;
            const root = document.documentElement;
            const primary = document.querySelector('.ss-btn--primary, .ss-global-btn--primary, .btn-primary');
            const icon = primary?.querySelector('.ss-btn__icon');
            const heading = document.querySelector('h1');
            const styles = heading ? getComputedStyle(heading) : null;
            return {
              scrollWidth: Math.max(root.scrollWidth, body?.scrollWidth || 0),
              clientWidth: root.clientWidth,
              primary: Boolean(primary),
              primaryText: primary?.innerText?.trim() || '',
              islandIcon: Boolean(icon),
              headingFont: styles?.fontFamily || '',
              headingStyle: styles?.fontStyle || '',
              bodyFont: getComputedStyle(body).fontFamily,
            };
          })()
        """)
        if result["scrollWidth"] > result["clientWidth"] + 1:
            failures.append(f"{route} @ {width}: horizontal overflow {result['scrollWidth']} > {result['clientWidth']}")
        if not result["primary"]:
            failures.append(f"{route} @ {width}: primary CTA missing")
        if route != "/schedule" and not result["islandIcon"]:
            failures.append(f"{route} @ {width}: primary CTA island icon missing")
        if result["headingStyle"] == "italic":
            failures.append(f"{route} @ {width}: H1 is italic")
        if "Instrument Serif" not in result["headingFont"]:
            failures.append(f"{route} @ {width}: unexpected heading font {result['headingFont']}")
        if "Lexend" not in result["bodyFont"]:
            failures.append(f"{route} @ {width}: unexpected body font {result['bodyFont']}")

if failures:
    print("Browser Use QA failed:")
    print("\\n".join("- " + item for item in failures))
    raise SystemExit(1)

print(f"Browser Use QA passed: {len(routes)} routes x {len(widths)} widths")
PY
