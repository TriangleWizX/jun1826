import assert from "node:assert/strict";
import fs from "node:fs";

const taxonomy = JSON.parse(fs.readFileSync("src/_data/taxonomy.json", "utf8"));
const { profiles, scheduledClasses, products, transitions } = taxonomy;
assert.deepEqual([profiles.kids.minAge, profiles.kids.maxAge], [5, 9]);
assert.deepEqual([profiles.teens.minAge, profiles.teens.maxAge], [10, 17]);
assert.equal(profiles.adults.minAge, 18);
assert.deepEqual(scheduledClasses.youthTeen.eligibleProfiles, ["kids", "teens"]);
assert.equal(scheduledClasses.youthTeen.ageRange, "5–17");
assert.deepEqual(products.youthCore.eligibleProfiles, ["kids", "teens"]);
assert.equal(products.youthCore.ageRange, "5–17");
assert.deepEqual(products.adultCore.eligibleProfiles, ["adults"]);
assert.match(transitions.age17To18, /Sandy confirms/i);

function profileForAge(age) {
  return age >= 5 && age <= 9 ? "kids" : age >= 10 && age <= 17 ? "teens" : age >= 18 ? "adults" : null;
}
for (const [age, expected] of [[5, "kids"], [9, "kids"], [10, "teens"], [17, "teens"], [18, "adults"]]) assert.equal(profileForAge(age), expected);
assert.equal(profileForAge(4), null);

const rendered = fs.readFileSync("dist/programs.html", "utf8").toLowerCase();
for (const phrase of ["kids and teens share", "youth + teen class", "not separate class hours"]) {
  assert.equal(rendered.includes(phrase), true, `Programs is missing taxonomy phrase: ${phrase}`);
}
assert.equal(
  rendered.includes("youth core culture") || rendered.includes("youth 12-week program"),
  true,
  "Programs is missing taxonomy phrase: youth core culture or youth 12-week program"
);
console.log("Taxonomy integrity and boundary QA passed.");
