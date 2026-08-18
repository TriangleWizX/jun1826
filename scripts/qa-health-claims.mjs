import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const claims = JSON.parse(read("src/_data/research-claims.json"));
const safety = read("src/jiu-jitsu-safety-tannersville-ny.html");
const linksResearch = read("src/partials/links-quote-block.html");
const evidenceResearch = read("src/partials/evidence-quote-block.html");
const home = read("src/index.html");
const ski = read("src/blog/jiu-jitsu-near-windham-mountain-club-ski-families/index.html");
const anatomy = read("src/bjj-anatomy-quiz.html");
const faq = read("src/bjj-faqs.html");
const catskill = read("src/bjj-classes/catskill-ny/index.html");
const teenEvidence = read("src/partials/evidence-accordion-teens.html");
const bully = read("src/bully-proof-jiu-jitsu-tannersville-ny.html");
const sources = read("src/sources/index.html");

for (const claim of claims) {
  for (const field of ["id", "population", "intervention", "outcome", "source", "sourceType", "reviewedDate", "allowedContexts", "prohibitedInferences"]) assert.ok(claim[field], `${claim.id}: missing ${field}`);
}
const ding = claims.find((claim) => claim.id === "ding-2022-youth-team-sport-warmup");
assert.ok(ding.prohibitedInferences.includes("BJJ injury reduction"));
assert.ok(ding.prohibitedInferences.includes("SSBJJ injury reduction"));

for (const surface of [safety, linksResearch, evidenceResearch, home, ski, anatomy, faq, catskill]) {
  assert.doesNotMatch(surface, /36% reduction|pooled injury rate ratio|injury prevention/i);
}
assert.match(linksResearch, /Research Context/);
assert.match(linksResearch, /retrospective survey of BJJ practitioners/);
assert.match(linksResearch, /mostly adult men/);
assert.match(linksResearch, /does not predict an individual student.s risk/);
assert.match(ski, /Why BJJ Can Fit a Ski Family.s Week/);
assert.match(ski, /not a promise of better ski performance or fewer injuries/);
assert.match(ski, /intensity managed around the student/);
assert.match(anatomy, /communicate more clearly about where they feel pressure or discomfort/);
assert.doesNotMatch(anatomy, /prevent injuries/);
assert.match(faq, /not medical rehabilitation/);
assert.match(catskill, /returning after medical clearance/);
assert.doesNotMatch(home, /injury prevention/);
assert.match(teenEvidence, /do not establish a guaranteed mental-health or developmental outcome/);
assert.match(bully, /clear boundaries, safe movement practice/);
assert.doesNotMatch(bully, /become calmer, more confident/);
assert.match(sources, /practical risk-management habits/);
assert.doesNotMatch(sources, /proven injury prevention guidelines/);

console.log("health claim QA passed");
