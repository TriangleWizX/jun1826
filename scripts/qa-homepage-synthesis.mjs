import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const home = fs.readFileSync(path.join(process.cwd(), "src/partials/home-conversion-shell.html"), "utf8");
const rendered = fs.readFileSync(path.join(process.cwd(), "dist/index.html"), "utf8");

for (const surface of [home, rendered]) {
  assert.match(surface, /Tannersville, NY · Kids · Teens · Adults/);
  assert.match(surface, /Jiu-Jitsu for Kids, Teens &amp; Adults in Tannersville/);
  assert.match(surface, /Small classes\. Beginner-friendly partners\. Live practice with coach nearby\./);
}
assert.match(home, /value="child"/);
assert.match(home, /value="teen"/);
assert.match(home, /value="adult"/);
assert.match(home, /value="family"/);
assert.match(home, /href="\/schedule"/);
assert.doesNotMatch(rendered, /transformative|ecological dynamics|constraints-led|unlock your potential/i);

console.log("homepage synthesis QA passed");
