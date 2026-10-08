import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const records = JSON.parse(fs.readFileSync(path.join(root, 'src/_data/evidence-records.json'), 'utf8'));
const sourceTemplate = fs.readFileSync(path.join(root, 'src/sources/research/records.njk'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src/evidence.html'), 'utf8');
const byId = new Map(records.map((record) => [record.id, record]));
const teachingIds = [
  'bjj-ecological-dynamical-2026',
  'manninen-games-based-pe-review-2025',
  'saha-pe-game-pedagogy-review-2026',
  'roaas-loras-challenge-perspective-2026'
];
const outcomeIds = [
  'bjj-school-rct',
  'youth-martial-arts-attention-rct',
  'open-skill-youth-meta-analysis',
  'bjj-adult-fitness',
  'bjj-mma-youth-development'
];
const moreIds = ['rugby-ecological-dynamics-2026', 'ecological-dynamic-learning-review-2026'];
const cardFields = ['cardLabel', 'cardTitle', 'cardSummary', 'cardLimit'];
const requiredFields = ['id', 'title', 'authors', 'year', 'publicationDate', 'category', 'sport', 'evidenceType', 'population', 'intervention', 'tested', 'found', 'notTested', 'source', 'detailUrl', 'verifiedAt', 'staleAfter'];

assert.match(page, /for record in evidencePageCards.evidenceTeachingCards/);
assert.match(page, /for record in evidencePageCards.evidenceOutcomeCards/);
assert.match(page, /for record in evidencePageCards.evidenceMoreReading/);
assert.match(sourceTemplate, /record\.found/);
assert.match(sourceTemplate, /record\.notTested/);
assert.match(sourceTemplate, /record\.sport/);
assert.match(sourceTemplate, /href="\/evidence"/);
assert.match(page, /<details class="mb-3"><summary>See study details<\/summary>/);

for (const [group, ids] of [['teaching', teachingIds], ['outcomes', outcomeIds]]) {
  for (const id of ids) {
    const record = byId.get(id);
    assert.ok(record, `${id}: shared record is missing`);
    assert.equal(record.evidenceGroup, group, `${id}: wrong evidence group`);
    for (const field of requiredFields) assert.ok(record[field] !== undefined && record[field] !== '', `${id}: missing ${field}`);
    for (const field of cardFields) assert.ok(record[field], `${id}: missing ${field}`);
    assert.match(record.source, /^https:\/\//, `${id}: source must be HTTPS`);
    assert.ok(Date.parse(record.verifiedAt) && Date.parse(record.staleAfter), `${id}: review dates must be valid`);
    assert.ok(fs.existsSync(path.join(root, 'dist', record.detailUrl.replace(/^\//, ''), 'index.html')), `${id}: built source route is missing`);
    const detail = fs.readFileSync(path.join(root, 'dist', record.detailUrl.replace(/^\//, ''), 'index.html'), 'utf8');
    assert.ok(detail.includes(record.source), `${id}: detail route is missing its source link`);
    assert.ok(detail.includes('/evidence'), `${id}: detail route is missing its return link`);
    assert.ok(detail.includes(record.sport), `${id}: detail route is missing sport`);
    const builtPage = fs.readFileSync(path.join(root, 'dist/evidence/index.html'), 'utf8');
    assert.ok(builtPage.includes(record.cardSummary), `${id}: card summary is missing from built evidence page`);
    assert.ok(builtPage.includes(record.cardLimit), `${id}: adjacent limit is missing from built evidence page`);
  }
}

for (const id of moreIds) {
  const record = byId.get(id);
  assert.ok(record, `${id}: More reading record is missing`);
  assert.equal(record.moreReadingOnly, true, `${id}: this source must stay out of the main cards`);
  assert.ok(record.moreReadingTitle && record.moreReadingSummary, `${id}: More reading label or limit is missing`);
  assert.ok(record.detailUrl && record.source, `${id}: source detail route or source URL is missing`);
  for (const field of requiredFields) assert.ok(record[field] !== undefined && record[field] !== '', `${id}: missing ${field}`);
  const route = path.join(root, 'dist', record.detailUrl.replace(/^\//, ''), 'index.html');
  assert.ok(fs.existsSync(route), `${id}: built source route is missing`);
  const detail = fs.readFileSync(route, 'utf8');
  assert.ok(detail.includes(record.source), `${id}: detail route is missing its source link`);
  assert.ok(detail.includes('/evidence'), `${id}: detail route is missing its return link`);
  assert.ok(detail.includes(record.sport), `${id}: detail route is missing sport`);
  const builtPage = fs.readFileSync(path.join(root, 'dist/evidence/index.html'), 'utf8');
  assert.ok(builtPage.includes(record.moreReadingTitle), `${id}: More reading title is missing from the evidence page`);
  assert.ok(builtPage.includes(record.moreReadingSummary), `${id}: More reading limit is missing from the evidence page`);
}

for (const record of records.filter((item) => teachingIds.includes(item.id) || outcomeIds.includes(item.id))) {
  const builtPage = fs.readFileSync(path.join(root, 'dist/evidence/index.html'), 'utf8');
  assert.ok(builtPage.includes(record.sport), `${record.id}: sport is missing from card details`);
  assert.ok(builtPage.includes(record.tested), `${record.id}: tested outcomes are missing from card details`);
}

console.log(`Evidence page record QA passed (${teachingIds.length} teaching, ${outcomeIds.length} outcome, ${moreIds.length} More reading records).`);
