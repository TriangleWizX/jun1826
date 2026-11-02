#!/usr/bin/env node
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const runner = resolve(projectRoot, ".agents/skills/web-performance-evidence/scripts/baseline.mjs");
const siteInput = process.env.CWV_SITE_DIR;
const siteDir = siteInput ? resolve(siteInput) : "";
const outDir = process.env.CWV_OUT_DIR;
const lighthouseBin = process.env.CWV_LIGHTHOUSE_BIN;
const lighthouseVersion = process.env.CWV_LIGHTHOUSE_VERSION;
const chromePath = process.env.CWV_CHROME_PATH;
const performanceRoutes = process.env.CWV_ROUTES || [
  "/",
  "/free-bjj-intro-tannersville-ny",
  "/schedule",
  "/bjj-classes/kids-tannersville-ny",
  "/bjj-classes/teens-tannersville-ny",
  "/bjj-classes/adults-tannersville-ny",
  "/options-pricing",
  "/winter-armor-2027"
].join(",");

const required = [
  ["CWV_SITE_DIR", siteInput],
  ["CWV_OUT_DIR", outDir],
  ["CWV_LIGHTHOUSE_BIN", lighthouseBin],
  ["CWV_LIGHTHOUSE_VERSION", lighthouseVersion],
  ["CWV_CHROME_PATH", chromePath]
];
const missing = required.filter(([, value]) => !value).map(([name]) => name);
if (missing.length) {
  console.error(`qa:cwv:lab requires ${missing.join(", ")}. See .agents/skills/web-performance-evidence/SKILL.md.`);
  process.exit(2);
}
if (!isAbsolute(siteInput)) {
  console.error("CWV_SITE_DIR must be an absolute path to a prebuilt isolated site snapshot.");
  process.exit(2);
}
if (!isAbsolute(outDir)) {
  console.error("CWV_OUT_DIR must be an absolute, fresh path; evidence runs are never overwritten.");
  process.exit(2);
}

for (const [name, path, mode] of [["site", siteDir, constants.R_OK], ["Lighthouse", lighthouseBin, constants.X_OK], ["Chrome", chromePath, constants.X_OK], ["baseline runner", runner, constants.R_OK]]) {
  try {
    await access(path, mode);
  } catch {
    console.error(`Required local ${name} is unavailable at ${path}. No package install or download will be attempted.`);
    process.exit(2);
  }
}

const args = [
  runner,
  "--phase", process.env.CWV_PHASE || "before",
  "--out", outDir,
  "--site-dir", siteDir,
  "--project-root", projectRoot,
  "--skip-build",
  "--lighthouse-bin", lighthouseBin,
  "--lighthouse-version", lighthouseVersion,
  "--chrome-path", chromePath,
  "--port", process.env.CWV_PORT || "0",
  "--samples", process.env.CWV_SAMPLES || "3"
];
args.push("--routes", performanceRoutes);

const run = spawnSync(process.execPath, args, { cwd: projectRoot, stdio: "inherit" });
if (run.error) throw run.error;
process.exit(run.status ?? 1);
