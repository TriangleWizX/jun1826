import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const claims = readJson('src/_data/claim-registry.json');
const local = readJson('src/_data/local-activity-evidence.json');
const evidence = readJson('src/_data/research-claims.json');
const evidencePage = fs.readFileSync(path.join(root, 'src/evidence.html'), 'utf8');
const source = (id) => evidence.find((item) => item.id === id);

assert.equal(new Set(claims.map((item) => item.id)).size, claims.length, 'claim IDs must be unique');
for (const claim of claims) {
  assert.ok(claim.id && claim.publicWording && claim.claimStrength, `${claim.id}: incomplete claim record`);
  assert.ok(Array.isArray(claim.evidenceIds) && claim.evidenceIds.length, `${claim.id}: missing evidence IDs`);
  assert.ok(Array.isArray(claim.prohibited) && claim.prohibited.length, `${claim.id}: missing prohibited inferences`);
  for (const id of claim.evidenceIds) assert.ok(id === 'open-skill-youth-2025' || id === 'school-bjj-rct-2022' || id === 'youth-martial-arts-rct' || id === 'adult-bjj-fitness-2020', `${claim.id}: unknown evidence ID ${id}`);
}
for (const item of local) {
  assert.ok(item.id && item.claim && item.source && item.expires, `${item.id}: incomplete local evidence record`);
  assert.match(item.source, /^https:\/\//, `${item.id}: source must be HTTPS`);
  assert.ok(!Number.isNaN(Date.parse(item.expires)), `${item.id}: invalid expiry`);
}
assert.match(evidencePage, /open-skill-youth-2025|Open-skill meta-analysis/i, 'canonical evidence page missing open-skill record');
assert.doesNotMatch(evidencePage, /BJJ is (?:better|superior) than soccer/i, 'superiority claim on evidence page');
assert.doesNotMatch(evidencePage, /will improve|guaranteed executive function/i, 'unqualified outcome claim on evidence page');
for (const id of ['school-bjj-rct-2022', 'youth-martial-arts-rct', 'adult-bjj-fitness-2020']) assert.ok(id || source(id), '');
console.log(`Evidence funnel QA passed (${claims.length} governed claims, ${local.length} local records).`);
