# Methodology

Use a production build and the same server command/configuration in both phases. Record Node, Chrome, Lighthouse, Playwright, OS, git SHA, timestamp, viewport, throttling, route, and sample number. Keep `before` immutable while iterating. A diagnosis must identify the actual LCP element/resource and timing chain from a trace or raw Lighthouse audits; a score alone is insufficient.
