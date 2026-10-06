---
name: web-performance-evidence
description: Capture reproducible before-and-after web performance evidence with Lighthouse, Playwright, and Chrome traces.
---
# Web performance evidence

Use controlled evidence before changing performance code. Apply the same build, routes, browser, Lighthouse version, emulation, throttling, sample count, and server behavior to each phase. Read references/routes.md, references/thresholds.md, and references/methodology.md before work.

## Run a phase

Run from the repository root. Paths below are examples; choose a new absolute run directory for every capture. The runner rejects an existing destination, including a failed run. Keep failed evidence and choose a new run ID. To resume a failed capture, add `--resume-from /absolute/failed-run` with a fresh `--out`. The runner verifies identical site hash, phase, routes, sample count, versions and requested configuration, then copies only complete validated route samples and saved trace/log assets into the new directory. Provenance and skipped routes appear in `manifest.resume`; the original evidence is never changed. Older manifests lacking OS data are explicitly marked.

```sh
node .agents/skills/web-performance-evidence/scripts/baseline.mjs \
  --phase before \
  --out /tmp/performance-before-RUN_ID \
  --site-dir /absolute/path/to/dist \
  --project-root /absolute/path/to/repository \
  --skip-build \
  --lighthouse-bin /absolute/path/to/lighthouse \
  --lighthouse-version 13.4.1 \
  --chrome-path /usr/bin/google-chrome \
  --port 8080 \
  --samples 3
```

Use an installed executable matching the explicit version. The harness never installs or downloads a package. Omit `--skip-build` only when `npm run build` in the supplied project root is authorized and safe. Prebuilt isolated snapshots are preferred when unrelated dirty work is present. `--routes /,/schedule,/options-pricing` narrows a run; omit it for the seven funnel routes. Before and after must use identical route lists. `--port 0` requests an available loopback port; browser port does not represent a production origin.

The harness reserves the output directory, records the actual browser/package versions, source Git identity and dirty status, and hashes every built file. It preflights all requested routes before capturing. Local HTML serving supports directory `index.html` before flat `.html` (matching existing-directory routing), root-relative SSI includes, correct common media MIME types, and root containment. The local server disables caching and does not emulate production compression, redirects, CDN or hosting latency. Do not label these captures live performance.

Lighthouse captures three independent navigation samples by default with explicit mobile emulation and simulated throttling. Its actual returned `configSettings` are retained and must match across samples/phases. Raw JSON, trace and DevTools log assets are saved. Playwright separately captures 390×844 and 1440×1000 screenshots and checks HTTP status, exact route, title, visible H1, and visible actionable intro/text CTA links. These checks do not establish provider booking completion or full accessibility conformance.

## Compare and report

Capture `after` using the same command/settings with a fresh destination and `--phase after`. Then:

```sh
node .agents/skills/web-performance-evidence/scripts/compare-results.mjs \
  --before /tmp/performance-before-RUN_ID \
  --after /tmp/performance-after-RUN_ID \
  --out /tmp/performance-comparison-RUN_ID
node .agents/skills/web-performance-evidence/scripts/build-report.mjs \
  --input /tmp/performance-comparison-RUN_ID/metrics.json \
  --out /tmp/performance-comparison-RUN_ID/summary.md
```

Comparison rejects incomplete runs, incompatible environments/settings, mismatched routes/sample counts, missing required metrics, and missing screenshots/functional evidence. Numeric metrics use actual medians (including even sample counts), with per-sample values and min/max spread. LCP diagnostics identify the sample closest to median LCP; missing diagnostics remain null. Preserve trace artifacts for deeper diagnosis. CLS retains four decimal places in reports.

Inspect primary timing and stability regressions even if performance score rises. Keep raw evidence and manifests with the report; never infer live improvements from local measurements. Production verification requires the workspace network approval path. Do not commit generated artifacts, credentials, tokens, or browser profiles unless explicitly authorized.
