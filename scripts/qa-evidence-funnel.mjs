import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const claims = readJson('src/_data/claim-registry.json');
const local = readJson('src/_data/local-activity-evidence.json');
const evidence = readJson('src/_data/evidence-records.json');
const evidencePage = fs.readFileSync(path.join(root, 'src/evidence.html'), 'utf8');
const source = (id) => evidence.find((item) => item.id === id);

assert.equal(new Set(claims.map((item) => item.id)).size, claims.length, 'claim IDs must be unique');
for (const claim of claims) {
  assert.ok(claim.id && claim.publicWording && claim.claimStrength, `${claim.id}: incomplete claim record`);
  assert.ok(Array.isArray(claim.evidenceIds) && claim.evidenceIds.length, `${claim.id}: missing evidence IDs`);
  assert.ok(Array.isArray(claim.prohibited) && claim.prohibited.length, `${claim.id}: missing prohibited inferences`);
  for (const id of claim.evidenceIds) assert.ok(evidence.some((item) => item.id === id), `${claim.id}: unknown evidence ID ${id}`);
}
for (const item of local) {
  assert.ok(item.id && item.claim && item.source && item.checkedAt && item.staleAfter, `${item.id}: incomplete local evidence record`);
  assert.match(item.source, /^https:\/\//, `${item.id}: source must be HTTPS`);
  assert.ok(!Number.isNaN(Date.parse(item.checkedAt)) && !Number.isNaN(Date.parse(item.staleAfter)), `${item.id}: invalid local review dates`);
}
for (const item of evidence) {
  for (const field of ['id', 'category', 'evidenceType', 'population', 'intervention', 'supports', 'doesNotSupport', 'source', 'verifiedAt', 'staleAfter']) assert.ok(item[field] !== undefined, `${item.id}: missing ${field}`);
  assert.match(item.source, /^https:\/\//, `${item.id}: source must be HTTPS`);
  assert.ok(!Number.isNaN(Date.parse(item.verifiedAt)) && !Number.isNaN(Date.parse(item.staleAfter)), `${item.id}: invalid review dates`);
  assert.ok(Array.isArray(item.supports) && Array.isArray(item.doesNotSupport), `${item.id}: supports/limits must be arrays`);
}
assert.match(evidencePage, /open-skill-youth-meta-analysis|Open-skill meta-analysis/i, 'canonical evidence page missing open-skill record');
assert.doesNotMatch(evidencePage, /BJJ is (?:better|superior) than soccer/i, 'superiority claim on evidence page');
assert.doesNotMatch(evidencePage, /will improve|guaranteed executive function/i, 'unqualified outcome claim on evidence page');
console.log(`Evidence funnel QA passed (${claims.length} claims, ${evidence.length} study records, ${local.length} local records).`);
