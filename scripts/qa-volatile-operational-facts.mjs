import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const fail = (message) => errors.push(message);
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const canonical = JSON.parse(read("src/_data/schedule.json"));
const expected = [
  ["Monday", "Youth/Teen", "5:00 PM", "No-Gi"],
  ["Tuesday", "Youth/Teen", "5:00 PM", "Gi"],
  ["Wednesday", "Youth/Teen", "5:00 PM", "No-Gi"],
  ["Thursday", "Youth/Teen", "5:00 PM", "Gi"],
  ["Friday", "Youth/Teen", "5:00 PM", "Gi"],
  ["Monday", "Adult", "6:00 PM", "Gi"],
  ["Tuesday", "Adult", "6:00 PM", "Gi"],
  ["Wednesday", "Adult", "6:00 PM", "Gi"],
  ["Thursday", "Adult", "6:00 PM", "Gi"],
  ["Friday", "Adult", "6:00 PM", "Gi"],
  ["Saturday", "Adult", "10:30 AM", "No-Gi"]
];
const active = canonical.groupClasses.filter((item) => item.active);
for (const [day, audience, time, format] of expected) {
  const match = active.find((item) => item.day === day && item.audience === audience);
  if (!match || match.time !== time || match.format !== format) fail(`canonical schedule mismatch: ${day} ${audience}`);
  if (match && !match.id) fail(`canonical class is missing an id: ${day} ${audience}`);
}
if (canonical.privateCoaching?.slots?.some((slot) => slot.time !== "By request")) fail("private coaching contains a recurring time");
const bootcampExpected = [
  ["tuesday-alley-bootcamp", "Tuesday", "Strength"],
  ["thursday-alley-bootcamp", "Thursday", "Engine"]
];
for (const [id, day, focus] of bootcampExpected) {
  const entry = canonical.groupClasses.find((item) => item.id === id);
  if (!entry || entry.day !== day || entry.time !== "6:30 AM" || entry.endTime !== "7:10 AM" ||
      entry.capacity !== 8 || entry.focus !== focus || !entry.active) {
    fail(`canonical bootcamp schedule mismatch: ${id}`);
  }
}
const foundationsClasses = active.filter((item) => item.publicLabel === "White Belt Foundations");
if (foundationsClasses.length !== 2 || foundationsClasses.some((item) => !["Tuesday", "Thursday"].includes(item.day) || item.time !== "6:00 PM")) fail("White Belt Foundations must be listed only Tuesday and Thursday at 6 PM.");
const womensDates = canonical.datedClasses || [];
if (womensDates.length !== 6 || womensDates.some((item) => item.time !== "9:00 AM" || item.audience !== "Women" || item.ages !== "18+")) fail("Women’s Foundations must list six approved Saturday sessions at 9 AM for adults.");
if (womensDates.some((item) => item.date === "2026-11-28")) fail("Women’s Foundations must skip November 28.");

const scheduleJs = read("data/schedule.js");
if (!scheduleJs.includes('scheduling: "by_request"') || !scheduleJs.includes("publicRecurringSlots: []")) fail("data/schedule.js does not model private coaching as request-based");
if (!read("src/blog/bjj-schedule-windham-ny/index.html").includes('href="/schedule"')) fail("Windham schedule guide does not link to /schedule");

const allowHistorical = new Set(["src/holiday-schedule.html", "dist/holiday-schedule.html"]);
const banned = [/semi[- ]private/i, /book free goal mapping/i, /free goal mapping/i, /30-day confidence guarantee/i, /6:30\s*AM/i, /6:30AM/i, /10:00\s*AM/i, /\b10\s*AM\b/i];
const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && !["node_modules", ".git", ".tmb"].includes(name)) walk(full);
    else if (stat.isFile() && /\.(html|md|js|json)$/.test(name)) files.push(path.relative(root, full));
  }
}
walk(path.join(root, "src"));
for (const file of files) {
  if (allowHistorical.has(file)) continue;
  const body = read(file);
  // The approved bootcamp entries are the sole source allowed to carry these
  // early-morning times. Mask only those exact JSON fields before the global scan.
  const scanBody = file === "src/_data/schedule.json"
    ? body.replace(/("id": "(?:tuesday|thursday)-alley-bootcamp"[\s\S]*?"active": true)/g, (entry) =>
        entry.replace(/"(?:time|endTime)": "(?:6:30 AM|7:10 AM)"/g, '"time": "BOOTCAMP_TIME"'))
    : file === "dist/schedule/index.html"
      ? body.replace(/&quot;id&quot;:&quot;(?:tuesday|thursday)-alley-bootcamp&quot;,[^}]*?&quot;active&quot;:true/g, (entry) =>
          entry.replace(/&quot;(?:time|endTime)&quot;:&quot;(?:6:30 AM|7:10 AM)&quot;/g, "&quot;time&quot;:&quot;BOOTCAMP_TIME&quot;"))
      : body
      // These exact rendered labels are permitted only after the canonical rows above pass.
      .replaceAll("Tue + Thu, 6:30 AM", "BOOTCAMP_TIME")
      .replaceAll("Tuesday 6:30 AM Bootcamp", "BOOTCAMP_TIME")
      .replaceAll("Thursday 6:30 AM Bootcamp", "BOOTCAMP_TIME");
  for (const rule of banned) if (rule.test(scanBody)) fail(`${file}: contains banned volatile fact or legacy term ${rule}`);
}

for (const file of [
  "src/blog/gi-bjj-windham-ny/index.html",
  "src/blog/jiu-jitsu-windham-ny/index.html",
  "src/blog/private-jiu-jitsu-lessons-windham-ny/index.html",
  "src/blog/no-gi-windham-ny/index.html"
]) {
  if (read(file).includes('href="/student-hub"')) fail(`${file}: Student Hub remains in acquisition/editorial helper links`);
}

if (errors.length) {
  console.error(errors.map((error) => `VOLATILE FACT QA FAIL: ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Volatile operational-fact QA passed (${files.length} files checked).`);
