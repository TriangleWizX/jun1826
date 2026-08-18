import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const home = read("src/index.html");

assert.match(home, /A calm place to begin Jiu-Jitsu/);
assert.match(home, /Tannersville/);
assert.match(home, /kids, teens, and adults/);
assert.match(home, /matched partners/);
assert.match(home, /coached class/);
assert.match(home, /Reserve Your Free Intro/);
assert.match(home, /View Schedule/);
assert.match(home, /6045 Main Street/);
assert.match(home, /Meet\. Match\. Train\./);
assert.match(home, /meet Sandy, see the room, talk about your goals/);
assert.match(home, /Youth students may be able to combine the intro and class in one visit/);
assert.match(home, /Core Culture · 12 Weeks/);
assert.match(home, /Three planned weekly classes, partner matching, and clear progress feedback/);
assert.match(home, /specific problem, quieter first step, or focused technical work/);
assert.doesNotMatch(home, /injury prevention|guaranteed confidence|better life|personality transformation/);
assert.doesNotMatch(home, /Annual Track|Elite Concierge|Kawaishi|Haueter|ADAPT.*TEST.*EXPRESS/);
assert.match(home, /href="\/bjj-classes\/kids-tannersville-ny"/);
assert.match(home, /href="\/bjj-classes\/teens-tannersville-ny"/);
assert.match(home, /href="\/bjj-classes\/adults-tannersville-ny"/);
assert.match(home, /data-analytics-event="home_view"|data-analytics-event="home_intro_click"/);
assert.match(home, /Youth \$550 · Adult \$715/);

console.log("homepage synthesis QA passed");
