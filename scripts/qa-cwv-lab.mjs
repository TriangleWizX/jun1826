#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const BASE_URL = process.env.CWV_BASE_URL || "http://127.0.0.1:8123";
const OUT_DIR = process.env.CWV_OUT_DIR || "tmp/cwv-lab";
const PAGES = ["/", "/schedule", "/book-free-intro", "/adult-bjj", "/options-pricing"];

mkdirSync(OUT_DIR, { recursive: true });

const lighthouseProbe = spawnSync("lighthouse", ["--version"], { encoding: "utf8" });
if (lighthouseProbe.error || lighthouseProbe.status !== 0) {
  console.error("qa:cwv:lab requires Lighthouse CLI on PATH.");
  console.error("Install Lighthouse globally or run in an environment that already has it.");
  process.exit(2);
}

const toMs = (value) => Math.round((Number(value) || 0) * 1000);
const toNum = (value) => Math.round((Number(value) || 0) * 1000) / 1000;
const now = new Date().toISOString();
const runResults = [];

for (const path of PAGES) {
  const url = `${BASE_URL}${path}`;
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
  const reportPath = join(OUT_DIR, `${slug}.json`);

  rmSync(reportPath, { force: true });

  const run = spawnSync(
    "lighthouse",
    [
      url,
      "--only-categories=performance",
      "--emulated-form-factor=mobile",
      "--throttling-method=simulate",
      "--output=json",
      `--output-path=${reportPath}`,
      "--quiet",
      "--chrome-flags=--headless --no-sandbox --disable-gpu --disable-dev-shm-usage"
    ],
    { encoding: "utf8" }
  );

  if (run.status !== 0) {
    throw new Error(`Lighthouse failed for ${url}\n${run.stderr || run.stdout}`);
  }

  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const audits = report.audits || {};
  const metrics = {
    url: report.finalDisplayedUrl || url,
    score: Math.round((report.categories?.performance?.score || 0) * 100),
    lcp_ms: toMs(audits["largest-contentful-paint"]?.numericValue),
    inp_ms: toMs(audits.interaction-to-next-paint?.numericValue),
    cls: toNum(audits["cumulative-layout-shift"]?.numericValue)
  };
  runResults.push(metrics);
}

const summaryPath = join(OUT_DIR, "summary.json");
writeFileSync(summaryPath, JSON.stringify({ generated_at: now, base_url: BASE_URL, pages: runResults }, null, 2));

const rows = runResults
  .map((r) => `| ${r.url} | ${r.score} | ${r.lcp_ms} | ${r.inp_ms} | ${r.cls} |`)
  .join("\n");
const md = [
  "# CWV Lab Summary",
  "",
  `Generated: ${now}`,
  `Base URL: ${BASE_URL}`,
  "",
  "| URL | Perf Score | LCP (ms) | INP (ms) | CLS |",
  "| --- | ---: | ---: | ---: | ---: |",
  rows,
  ""
].join("\n");
writeFileSync(join(OUT_DIR, "summary.md"), md);

console.log(`Wrote ${summaryPath}`);
console.log(`Wrote ${join(OUT_DIR, "summary.md")}`);
