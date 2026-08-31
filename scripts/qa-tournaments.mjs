import fs from 'node:fs';

const file = 'dist/local-bjj-tournaments-for-parents.html';
if (!fs.existsSync(file)) throw new Error(`Missing ${file}; run npm run build first.`);
const html = fs.readFileSync(file, 'utf8');
const visibleHtml = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
const cards = [...visibleHtml.matchAll(/<article class="tournament-card"[\s\S]*?<\/article>/g)].map((m) => m[0]);
const failures = [];
const schemaMatches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
const schemas = schemaMatches.map((match) => { try { return JSON.parse(match[1]); } catch { failures.push('invalid tournament JSON-LD'); return null; } });
const schema = schemas.find((candidate) => Array.isArray(candidate?.itemListElement));
if (!schema) failures.push('missing tournament JSON-LD');
const schemaItems = schema?.itemListElement ?? [];
if (schemaItems.length !== cards.length) failures.push(`JSON-LD/card count mismatch (${schemaItems.length}/${cards.length})`);
const cardDates = cards.map((card) => card.match(/<p class="small fw-semibold">([^<]+)<\/p>/)?.[1] ?? '');
if (cardDates.some((date, index) => index > 0 && Date.parse(date) < Date.parse(cardDates[index - 1]))) failures.push('published cards are not date sorted');
if (cards.length !== 4) failures.push(`expected 4 published cards, found ${cards.length}`);
if (visibleHtml.includes('Kids ROLLSTAR Rumbles')) failures.push('expired Rollstar content is visible');
if (visibleHtml.includes('NAGA Connecticut Grappling Championship')) failures.push('conflicted Connecticut event is visible');
if (html.includes('getElementById("tournament-grid")')) failures.push('legacy renderer still targets the published grid');
cards.forEach((card, index) => {
  const eventLinks = [...card.matchAll(/href="(https:\/\/[^\"]+\/event\/\d+)"/g)];
  if (eventLinks.length !== 1) failures.push(`card ${index + 1} must have one exact event link`);
  if (!/Official event details/.test(card)) failures.push(`card ${index + 1} is missing Official event details`);
  if (!/>Ask Sandy<\//.test(card)) failures.push(`card ${index + 1} is missing Ask Sandy`);
  if (!/<img[^>]+width="343"[^>]+height="127"[^>]+alt="[^"]+"/.test(card)) failures.push(`card ${index + 1} has an invalid local thumbnail contract`);
  if (/<img[^>]+src="https?:/.test(card)) failures.push(`card ${index + 1} uses a remote image`);
});
if (new Set(schemaItems.map((entry) => entry.item?.url)).size !== schemaItems.length) failures.push('JSON-LD event URLs are not unique');
if (failures.length) { console.error(failures.map((failure) => `- ${failure}`).join('\n')); process.exit(1); }
console.log(`Tournament QA passed (${cards.length} published cards, exact links/actions/thumbnails present).`);
