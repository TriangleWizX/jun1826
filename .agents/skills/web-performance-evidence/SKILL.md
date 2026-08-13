---
name: web-performance-evidence
description: Capture reproducible before-and-after web performance evidence with Lighthouse, Playwright, and Chrome traces. Use when optimizing, auditing, or releasing a website performance change and when claims need raw lab artifacts, mobile screenshots, functional regression checks, or deployment follow-up.
---

# Web performance evidence

Use this skill for DEV-PERF-001-style work. Do not edit performance code until a baseline exists. Run the same production build, server, routes, viewport, throttling, sample count, and tool versions before and after.

## Workflow

1. Read [routes.md](references/routes.md), [thresholds.md](references/thresholds.md), and [methodology.md](references/methodology.md).
2. Confirm the worktree is safe and record the current git SHA. Never overwrite `artifacts/performance/before`.
3. Run `node scripts/baseline.mjs --phase before` from the repository root. It builds the site, starts the configured production server, runs three Lighthouse samples per route, captures 390x844 Playwright screenshots and functional assertions, and writes raw JSON plus a manifest.
4. Make the narrowly scoped optimization.
5. Run the exact same command with `--phase after`.
6. Run `node scripts/compare-results.mjs` and `node scripts/build-report.mjs`. Treat regressions in primary metrics as regressions even if the Lighthouse score rises.
7. Use Chrome DevTools MCP for trace diagnosis when Lighthouse identifies a problem without explaining its cause. Store trace evidence under the matching phase; do not invent trace facts from scores.
8. For deployed acceptance, label local lab evidence separately from live PSI/WebPageTest/field evidence.

## Required evidence

Each phase must retain raw Lighthouse JSON, screenshots, functional-check output, a manifest with git SHA/timestamp/tool versions, and machine-readable metrics. The comparison must identify the LCP element/resource and report score, FCP, LCP, Speed Index, TBT, CLS, TTFB, transferred bytes, request count, JS/CSS/image bytes, and LCP subparts when available.

Scripts are intentionally dependency-light and fail closed when prerequisites or required artifacts are missing. Do not commit credentials, external service tokens, or generated artifacts unless the task explicitly requests them.
