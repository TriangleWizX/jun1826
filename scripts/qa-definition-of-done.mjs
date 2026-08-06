import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const manifestPath = path.join(root, "docs/qa/release-gate.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const allowed = new Set(["PASS", "BLOCKED", "PARTIAL", "OWNER-ACCEPTED LIMITATION", "POST-LAUNCH FOLLOW-UP"]);
const failures = [];
const results = [];

function record(id, status, detail) {
  results.push({ id, status, detail });
  if (!allowed.has(status)) failures.push(`${id}: invalid status ${status}`);
}

for (const release of manifest.releases) {
  if (!release.id || !release.tag) failures.push("release entry is missing id or tag");
  else record(`${release.id}.tag`, release.status, release.evidence || `tag ${release.tag}`);
}

for (const item of manifest.checks) {
  if (!item.id || !item.area || !item.description) failures.push("check entry is missing id, area, or description");
  else record(item.id, item.status, item.evidence || "No evidence recorded");
  if (item.status === "PASS" && (!item.evidence || !item.evidence.trim())) {
    failures.push(`${item.id}: PASS requires evidence`);
  }
}

const localChecks = [
  ["build", "npm", ["run", "build"]],
  ["release5-local", "npm", ["run", "validate:release5"]],
];

for (const [id, command, args] of localChecks) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", stdio: "pipe" });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (result.status === 0) record(`local.${id}`, "PASS", `${command} ${args.join(" ")}`);
  else {
    record(`local.${id}`, "BLOCKED", `${command} ${args.join(" ")} failed; see command output`);
    failures.push(`local.${id}: command failed\n${output.slice(-4000)}`);
  }
}

const unresolved = results.filter(({ status }) => status !== "PASS");
console.log(`Definition-of-done gate: ${results.length - unresolved.length} PASS, ${unresolved.length} unresolved`);
for (const result of results) console.log(`${result.status.padEnd(28)} ${result.id} — ${result.detail}`);

if (failures.length || unresolved.length) {
  console.error("\nRelease gate is NOT COMPLETE.");
  if (failures.length) console.error(failures.join("\n"));
  console.error("Resolve each unresolved item or document it under an allowed exception category before release.");
  process.exitCode = 1;
} else {
  console.log("Release gate PASSED: every required item has PASS evidence.");
}
