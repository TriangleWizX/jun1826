import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'location-provenance.json'), 'utf8'));
const primary = Object.keys(manifest.primary);
const failures = [];
const pageText = (slug) => fs.readFileSync(path.join(SRC, 'bjj-classes', slug, 'index.html'), 'utf8');
const visible = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, ' ').replace(/&(?:amp|nbsp);/gi, ' ').replace(/\s+/g, ' ').trim();

for (const slug of primary) {
  const html = pageText(slug);
  const text = visible(html);
  const ownTown = manifest.primary[slug].town;
  for (const token of manifest.forbiddenTokens[slug] || []) {
    if (new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)) failures.push(`${slug}: forbidden local token ${token}`);
  }
  if (!text.toLowerCase().includes(ownTown.toLowerCase())) failures.push(`${slug}: missing own town reference`);
}
if (!pageText('tannersville-ny').includes('6045 Main')) failures.push('tannersville-ny: missing physical studio address');

const allTownPages = fs.readdirSync(path.join(SRC, 'bjj-classes'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.endsWith('-ny') && fs.existsSync(path.join(SRC, 'bjj-classes', entry.name, 'index.html')))
  .map((entry) => entry.name);
for (const slug of allTownPages) {
  const html = pageText(slug);
  if (/Committed Adults/i.test(html)) failures.push(`${slug}: schedule-character label "Committed Adults"`);
  if (/make the .*drive disappear/i.test(visible(html))) failures.push(`${slug}: consistency overclaims geography`);
}

const nearPages = fs.readdirSync(path.join(SRC, 'near'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(SRC, 'near', entry.name, 'index.html')))
  .map((entry) => entry.name);
for (const slug of nearPages) {
  const html = fs.readFileSync(path.join(SRC, 'near', slug, 'index.html'), 'utf8');
  for (const token of manifest.forbiddenTokens[slug] || []) {
    if (new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(visible(html))) failures.push(`near/${slug}: forbidden local token ${token}`);
  }
  if (/Committed Adults|make the .*drive disappear/i.test(visible(html))) failures.push(`near/${slug}: schedule-character or geography overclaim`);
}

const localFactVocabulary = /route|school|district|minutes|drive|traffic|winter|parking|mountain/i;
const signatures = new Map();
for (const slug of primary) {
  const paragraphs = pageText(slug).match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [];
  for (const paragraph of paragraphs) {
    const text = visible(paragraph).toLowerCase();
    if (!localFactVocabulary.test(text) || text.length < 80 || text.includes('use main street parking first') || text.startsWith('our schedule is built to align with school')) continue;
    const normalized = text.replace(/tannersville|hunter|windham|haines falls|woodstock/g, '<town>').replace(/\d+/g, '<number>');
    const previous = signatures.get(normalized);
    if (previous && previous !== slug) failures.push(`local-fact paragraph duplicated across ${previous} and ${slug}`);
    else signatures.set(normalized, slug);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Location provenance QA passed (${primary.length} primary pages; ${allTownPages.length} town pages; ${nearPages.length} near pages; ${signatures.size} local-fact paragraphs checked).`);
