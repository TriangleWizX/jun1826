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

cdp("Network.clearBrowserCache")

for route in routes:
    for width in widths:
        new_tab(base + route)
        wait_for_load()
        cdp(
            "Emulation.setDeviceMetricsOverride",
            width=width,
            height=900,
            deviceScaleFactor=1,
            mobile=width < 768,
        )
        result = js("""
          (() => {
            const body = document.body;
            const root = document.documentElement;
            const candidates = [...document.querySelectorAll(
              '.ss-btn-premium, .ss-btn-island, .ss-btn-primary, .ss-btn--primary, .ss-global-btn--primary, .btn-primary, .ss-btn'
            )];
            const primary = candidates.find((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 &&
                /free intro|reserve/i.test(element.innerText || '');
            });
            const heading = document.querySelector('h1');
            const styles = heading ? getComputedStyle(heading) : null;
            return {
              scrollWidth: Math.max(root.scrollWidth, body?.scrollWidth || 0),
              clientWidth: root.clientWidth,
              primary: Boolean(primary),
              primaryText: primary?.innerText?.trim() || '',
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
        if result["headingStyle"] == "italic":
            failures.append(f"{route} @ {width}: H1 is italic")
        if "Instrument Serif" not in result["headingFont"] and "Geist" not in result["headingFont"]:
            failures.append(f"{route} @ {width}: unexpected heading font {result['headingFont']}")
        if "Lexend" not in result["bodyFont"]:
            failures.append(f"{route} @ {width}: unexpected body font {result['bodyFont']}")

if failures:
    print("Browser Use QA failed:")
    print("\\n".join("- " + item for item in failures))
    raise SystemExit(1)

print(f"Browser Use QA passed: {len(routes)} routes x {len(widths)} widths")
PY
