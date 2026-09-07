import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const relationships = JSON.parse(fs.readFileSync(path.join(root, "data/lineage-relationships.json"), "utf8"));
const lineage = fs.readFileSync(path.join(root, "src/sensei-jiu-jitsu.html"), "utf8");
const bio = fs.readFileSync(path.join(root, "src/bio.html"), "utf8");
const registry = fs.readFileSync(path.join(root, "data/lineage-registry.md"), "utf8");
const allowed = new Set(["black_belt_award", "primary_training", "documented_training", "historical_influence", "family_relationship", "current_instructor_role"]);

assert.ok(relationships.relationships.length > 0);
for (const edge of relationships.relationships) {
  assert.ok(allowed.has(edge.type), `unknown relationship type: ${edge.type}`);
  assert.ok(edge.source && edge.sourceType && edge.status && edge.verifiedDate, `incomplete provenance for ${edge.from} -> ${edge.to}`);
  if (edge.type === "historical_influence") assert.notEqual(edge.type, "black_belt_award");
}
for (const claim of relationships.excludedFormalClaims) {
  assert.equal(claim.status, "unverified");
  assert.deepEqual(claim.sources, []);
}

assert.match(lineage, /Sandy Jose Nunez received his Brazilian Jiu-Jitsu black belt from fourth-degree black belt Josh Griffiths/);
assert.match(lineage, /Training relationship:/);
assert.doesNotMatch(lineage, /Clockwork Jiu Jitsu Affiliate|maintains an active relationship|technical standard.*matches|elite quality|premier BJJ academy|prestigious lineage|third-party documentation/);
assert.match(bio, /I was awarded my black belt by .*Josh Griffiths.*Clockwork Jiu Jitsu/);
assert.doesNotMatch(bio, /Clockwork Jiu-Jitsu logo|Combat Base affiliate|Haueter lineage|Kawaishi lineage/);
assert.match(registry, /Relationship Type/);
assert.match(registry, /Claim Status/);

console.log("lineage integrity QA passed");
