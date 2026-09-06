import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: { input: { type: 'string', default: 'dist' } } });
const root = path.resolve(values.input);
const terms = JSON.parse(await fs.readFile('data/glossary-terms.json', 'utf8'));
const index = JSON.parse(await fs.readFile(path.join(root, 'assets/data/glossary-search.json'), 'utf8'));
const hub = await fs.readFile(path.join(root, 'bjj-glossary/index.html'), 'utf8');
const decode = (text) => text.replace(/&(?:amp|quot|#39|apos|lt|gt);/g,
  (entity) => ({ '&amp;': '&', '&quot;': '"', '&#39;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>' })[entity]);
const normalized = (text) => text.normalize('NFKD').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\bno[ -]gi\b/g, 'nogi').replace(/\s+/g, ' ').trim();
const generic = /common bjj term used in class to describe a key position/i;
let definitions = 0;
assert.ok(!generic.test(hub), 'Glossary hub retains placeholder search text');
for (const term of terms) {
  const html = await fs.readFile(path.join(root, 'bjj-glossary', term.slug, 'index.html'), 'utf8');
  assert.ok(!generic.test(html), `${term.slug}: placeholder remains in page/schema`);
  const record = index.find((item) => item.slug === term.slug);
  assert.ok(record && !generic.test(record.searchText), `${term.slug}: missing/stale search record`);
  const nodes = [];
  for (const script of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const graph = JSON.parse(script[1]);
    nodes.push(...(graph['@graph'] || [graph]));
  }
  assert.equal(nodes.filter((node) => node['@type'] === 'DefinedTerm').length, 1, `${term.slug}: missing/duplicate term schema`);
  assert.equal(nodes.filter((node) => node['@type'] === 'FAQPage').length, 1, `${term.slug}: missing/duplicate FAQ schema`);
  assert.equal((html.match(/<title\b/g) || []).length, 1, `${term.slug}: duplicate document title`);
  const question = `What does ${term.term.toLowerCase()} mean in BJJ?`;
  if (!term.faq.some(({ q, a }) => q === question && a === term.summary)) continue;
  const faq = [...html.matchAll(/<details\b[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)]
    .find((match) => decode(match[1]) === question);
  assert.ok(faq, `${term.slug}: missing visible definition FAQ`);
  assert.equal(decode(faq[2]), term.summary, `${term.slug}: visible definition differs from canonical summary`);
  const questions = nodes.filter((node) => node['@type'] === 'FAQPage').flatMap((node) => node.mainEntity);
  const structured = questions.filter((item) => item.name === question);
  assert.equal(structured.length, 1, `${term.slug}: missing/duplicate structured question`);
  assert.equal(structured[0].acceptedAnswer.text, term.summary, `${term.slug}: schema definition drift`);
  assert.ok(record.searchText.includes(normalized(term.summary)), `${term.slug}: search lacks definition`);
  const tag = [...hub.matchAll(/<article\b[^>]*data-glossary-card\b[^>]*>/g)]
    .find((match) => match[0].includes(`data-slug="${term.slug}"`));
  assert.ok(tag, `${term.slug}: missing hub card`);
  assert.equal(decode(tag[0].match(/data-search="([^"]*)"/)[1]), record.searchText, `${term.slug}: hub/search disagreement`);
  definitions += 1;
}
assert.ok(definitions >= 71, `Expected at least 71 summary-backed definition FAQs, found ${definitions}`);
console.log(`Glossary definition QA passed: ${terms.length} terms, ${definitions} visible/schema/search/hub definitions in ${root}.`);
