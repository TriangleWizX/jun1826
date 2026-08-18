import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const gain = read("src/blog/gain-points-system/index.html");
const report = read("src/report-card.html");
const parent = read("src/core-culture-parent-guide.html");
const hub = read("src/student-hub.html");
const safety = read("src/jiu-jitsu-safety-tannersville-ny.html");
const wrestle = read("src/blog/wrestle-ups-scramble/index.html");

assert.match(gain, /What Progress Looks Like in Kids Jiu-Jitsu/);
assert.match(gain, /repeated live training evidence/);
assert.match(gain, /parent observation is not automatically Report Card evidence/);
assert.match(gain, /What felt easier today\?/);
assert.match(gain, /What problem were you working on\?/);
assert.match(gain, /Did anything surprise you\?/);
assert.match(gain, /Did you need to change your first idea\?/);
assert.match(gain, /Report Card/);
assert.match(gain, /Core Culture Parent Guide/);
assert.match(gain, /How Class Works/);
assert.doesNotMatch(gain, /Gain Points|\+1\s+(Calm|Focus|Confidence|Boundaries|Social Skill)|Hidden Curriculum|Scoreboard at Home|homework stamina|quiet confidence|somatic confidence|adult personality|level up|deters bullies/);

assert.match(report, /repeated live evidence/);
assert.match(report, /neither is a grade or a failure/);
assert.match(report, /it is not perfection/);
assert.match(parent, /Please ask what felt different/);
assert.match(hub, /What problem were you working on today\?/);
assert.match(hub, /href="\/report-card"/);
assert.match(safety, /understanding the room, the safety rules, and the next useful step/);
assert.match(safety, /safer decisions, controlled movement, and useful grappling/);
assert.match(wrestle, /Optional solo practice/);
assert.match(wrestle, /not a Core Culture requirement/);

console.log("progress communication QA passed");
