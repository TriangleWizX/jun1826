import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const home = read("src/index.html");

assert.match(home, /Calm, Coach-Led Brazilian Jiu-Jitsu/);
assert.match(home, /Tannersville/);
assert.match(home, /kids, teens, and adults learning practical Jiu-Jitsu/);
assert.match(home, /matched partners/);
assert.match(home, /coached resistance/);
assert.match(home, /Reserve Your Free Intro/);
assert.match(home, /View Schedule/);
assert.match(home, /6045 Main Street/);
assert.match(home, /Tour · Goal Map · Next Step/);
assert.match(home, /general Free Intro starts with a 15-minute Goal Mapping visit/);
assert.match(home, /specialized youth path can combine Goal Mapping and class during one visit/);
assert.match(home, /Core Culture · 12 Weeks/);
assert.match(home, /Three planned weekly classes, partner matching, and clear progress feedback/);
assert.match(home, /specific problem, quieter first step, or focused technical work/);
assert.doesNotMatch(home, /injury prevention|guaranteed confidence|better life|personality transformation/);
assert.doesNotMatch(home, /Annual Track|Elite Concierge|Kawaishi|Haueter|ADAPT.*TEST.*EXPRESS/);
assert.match(home, /href="\/bjj-classes\/kids-tannersville-ny"/);
assert.match(home, /href="\/bjj-classes\/teens-tannersville-ny"/);
assert.match(home, /href="\/bjj-classes\/adults-tannersville-ny"/);

console.log("homepage synthesis QA passed");
