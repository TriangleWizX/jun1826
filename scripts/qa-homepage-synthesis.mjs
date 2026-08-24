import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const home = fs.readFileSync(path.join(process.cwd(), "src/index.html"), "utf8");

assert.match(home, /A calm place to begin/);
assert.match(home, /Kids Jiu-Jitsu in/);
assert.match(home, /kids and teens/);
assert.match(home, /matched partner/);
assert.match(home, /Reserve Your Free Intro/);
assert.match(home, /View Schedule/);
assert.match(home, /6045 Main Street/);
assert.match(home, /What students practice/);
assert.match(home, /Learn clear skills with a partner/);
assert.match(home, /12-week program/);
assert.doesNotMatch(home, /Seen\. Tested\. Becoming\./);
assert.doesNotMatch(home, /Annual Track|Elite Concierge|ADAPT.*TEST.*EXPRESS/);
assert.match(home, /href="\/bjj-classes\/kids-tannersville-ny"/);
assert.match(home, /href="\/bjj-classes\/teens-tannersville-ny"/);
assert.match(home, /href="\/bjj-classes\/adults-tannersville-ny"/);
assert.match(home, /data-analytics-event="home_intro_click"/);

console.log("homepage synthesis QA passed");
