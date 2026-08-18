import assert from "node:assert/strict";
import fs from "node:fs";

const hub = fs.readFileSync("src/student-hub.html", "utf8");
const acquisition = [
  "src/nervous-first-timers.html",
  "src/near/cairo-ny/index.html",
  "src/near/catskill-ny/index.html",
  "src/near/haines-falls-ny/index.html",
  "src/near/hunter-ny/index.html",
  "src/near/palenville-ny/index.html",
  "src/near/template.html"
].map((file) => fs.readFileSync(file, "utf8")).join("\n");

assert.match(hub, /robots:\s*"noindex, follow"/);
assert.match(hub, /This Week's Training Problem/);
assert.match(hub, /Starting area/);
assert.match(hub, /Useful result/);
assert.match(hub, /Optional Class References/);
assert.match(hub, /Watching is never required/);
assert.match(hub, /specific action/i);
assert.match(hub, /does not affect the Report Card or rank/i);
assert.match(hub, /planned home class/i);
assert.doesNotMatch(hub, /safe, having fun, and on task/i);
assert.doesNotMatch(hub, /Consistency compounds/i);
assert.doesNotMatch(hub, /next clean opening/i);
assert.doesNotMatch(hub, /YAM points|YAM streak|leaderboard|completion tracking|homework/i);
assert.doesNotMatch(acquisition, /href=["']\/student-hub["']/i);

console.log("Student Hub authority checks passed.");
