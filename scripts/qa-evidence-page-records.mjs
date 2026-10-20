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
const injuryId = 'bjj-injury-2025';
const researchIds = ['bjj-injury-rates-review', 'combat-sports-injury-epidemiology-review', 'combat-sports-post-concussion-care', 'deliberate-practice-expertise', 'exercise-cognition-neuroplasticity-review', 'greene-county-child-health-2024', 'greene-county-community-health-2022-2024', 'pediatric-bjj-injury-review', 'youth-sports-injury-prevention'];
const cardFields = ['cardLabel', 'cardTitle', 'cardSummary', 'cardLimit'];
const requiredFields = ['id', 'title', 'authors', 'year', 'publicationDate', 'category', 'sport', 'evidenceType', 'population', 'intervention', 'tested', 'found', 'notTested', 'source', 'detailUrl', 'verifiedAt', 'staleAfter'];

assert.match(page, /for record in evidencePageCards.evidenceTeachingCards/);
assert.match(page, /for record in evidencePageCards.evidenceOutcomeCards/);
assert.match(page, /for record in evidencePageCards.evidenceMoreReading/);
assert.match(sourceTemplate, /record\.found/);
assert.match(sourceTemplate, /record\.notTested/);
assert.match(sourceTemplate, /record\.sport/);
assert.match(sourceTemplate, /href="\/evidence"/);
assert.match(sourceTemplate, /record\.contextualUrl/);
assert.match(page, /<details class="mb-3"><summary>See study details<\/summary>/);
assert.equal((page.match(/<h1\b/g) || []).length, 1, 'evidence page must have exactly one H1');
assert.match(page, /What can you see in class\?/);
assert.match(page, /Book a Free First Visit/);

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

const injury = byId.get(injuryId);
assert.ok(injury, 'injury survey shared record is missing');
for (const field of requiredFields) assert.ok(injury[field] !== undefined && injury[field] !== '', `injury survey missing ${field}`);
assert.equal(injury.population.n, 881);
assert.match(injury.population.ageGroup, /mean age 30\.8 years/);
assert.equal(injury.contextualUrl, '/how-class-works#safety');
const injuryRoute = path.join(root, 'dist', injury.detailUrl.replace(/^\//, ''), 'index.html');
assert.ok(fs.existsSync(injuryRoute), 'injury survey built source route is missing');
const injuryDetail = fs.readFileSync(injuryRoute, 'utf8');
assert.ok(injuryDetail.includes(injury.source), 'injury route is missing PubMed source link');
assert.ok(injuryDetail.includes(injury.sport), 'injury route is missing sport');
assert.ok(injuryDetail.includes('/evidence'), 'injury route is missing return link');
assert.ok(injuryDetail.includes(injury.contextualUrl), 'injury route is missing safety context link');
const builtPage = fs.readFileSync(path.join(root, 'dist/evidence/index.html'), 'utf8');
assert.equal((builtPage.match(/<h1\b/g) || []).length, 1, 'built evidence page must have exactly one H1');
assert.match(builtPage, /In BJJ, your partner can move\./, 'built page is missing hero copy');
assert.match(builtPage, /What can you see in class\?/, 'built page is missing class section');
assert.match(builtPage, /Book a Free First Visit/, 'built page is missing first visit CTA');
assert.doesNotMatch(builtPage, /\{%\s*(?:record|if|endif|for)\b/, 'built page contains unrendered Nunjucks tags');
assert.equal((builtPage.match(/<article\b/g) || []).length, 9, 'built page must show exactly nine main study cards');
for (const id of researchIds) {
  const record = byId.get(id);
  assert.ok(record?.positiveResearchPage, `${id}: positive research page record is missing`);
  assert.match(record.source, /^https:\/\//, `${id}: source link must use HTTPS`);
  const route = path.join(root, 'dist', record.detailUrl.replace(/^\//, ''), 'index.html');
  assert.ok(fs.existsSync(route), `${id}: rendered route is missing`);
  const html = fs.readFileSync(route, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${id}: route must have one H1`);
  assert.match(html, /Study Summary &amp; Academic Scope/);
  const schemas = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]));
  assert.ok(schemas.some((schema) => JSON.stringify(schema).includes('ScholarlyArticle') && JSON.stringify(schema).includes(record.source)), `${id}: source-linked ScholarlyArticle JSON-LD is missing`);
  assert.ok(html.includes(record.source), `${id}: source link is missing`);
  assert.match(html, /Source Record<\/title>/);
}
console.log(`Evidence page record QA passed (${teachingIds.length} teaching, ${outcomeIds.length} outcome, ${moreIds.length} More reading, 1 legacy injury, ${researchIds.length} new research records).`);
