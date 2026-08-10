import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT = path.join(ROOT, 'crawl-reports', 'town-url-inventory.csv');
const CANONICAL_TOWNS = new Set(['tannersville-ny', 'hunter-ny', 'windham-ny', 'haines-falls-ny']);
const RETIRED = ['/martial-arts-hunter-ny', '/windham-ny'];

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  if (entry.isDirectory()) return walk(file);
  return entry.name.endsWith('.html') ? [file] : [];
});

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const front = (html, key) => html.match(new RegExp(`^${key}:\\s*["']([^"']+)["']`, 'm'))?.[1] || '';
const text = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&(?:amp|nbsp);/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const shingles = (value) => {
  const words = value.split(/\s+/).filter(Boolean);
  return new Set(words.slice(0, -4).map((_, index) => words.slice(index, index + 5).join(' ')));
};
const similarity = (a, b) => {
  const left = shingles(a); const right = shingles(b);
  const intersection = [...left].filter((item) => right.has(item)).length;
  return intersection / Math.max(1, new Set([...left, ...right]).size);
};

const files = walk(path.join(ROOT, 'src')).filter((file) => {
  const relative = path.relative(path.join(ROOT, 'src'), file).replaceAll(path.sep, '/');
  return relative.startsWith('bjj-classes/') || /^(hunter|windham|haines|tannersville)/i.test(relative) || relative.startsWith('blog/');
});
const rows = [];
const editorial = [];
const errors = [];

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(path.join(ROOT, 'src'), file).replaceAll(path.sep, '/');
  const url = (front(html, 'permalink') || `/${relative.replace(/\/index\.html$/, '').replace(/\.html$/, '')}`).replace(/\/index\.html$/, '');
  const townMatch = url.match(/(?:bjj-classes|blog|near)\/(?:[^/]*-)?(tannersville|hunter|windham|haines-falls)(?:-ny)?/i) || url.match(/\/(tannersville|hunter|windham|haines-falls)(?:-ny)?/i);
  if (!townMatch) continue;
  const town = townMatch[1].replaceAll('-', ' ');
  const isCanonical = /^\/bjj-classes\/(tannersville-ny|hunter-ny|windham-ny|haines-falls-ny)\/?$/.test(url);
  const action = isCanonical ? 'KEEP' : RETIRED.includes(url.replace(/\/$/, '')) ? 'MERGE + 301' : 'REVIEW INTENT';
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  rows.push([url, '200', 'yes', front(html, 'canonicalUrl'), front(html, 'title'), h1, town, isCanonical ? 'local landing page' : relative.startsWith('blog/') ? 'informational article' : 'local/support page', isCanonical ? 'commercial local' : 'informational or supporting', action]);
  if (isCanonical) editorial.push({ url, value: text(html) });
  if (isCanonical && (!front(html, 'title') || !h1 || front(html, 'canonicalUrl') !== `https://senseisandy.com${url.replace(/\/$/, '')}`)) errors.push(`${url}: title, H1, or self-canonical is missing/misaligned`);
}

for (let i = 0; i < editorial.length; i++) for (let j = i + 1; j < editorial.length; j++) {
  const score = similarity(editorial[i].value, editorial[j].value);
  if (score > 0.5) errors.push(`editorial similarity warning ${Math.round(score * 100)}%: ${editorial[i].url} vs ${editorial[j].url}`);
}

const sourceText = walk(path.join(ROOT, 'src')).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
for (const retired of RETIRED) if (sourceText.includes(`href="${retired}`) || sourceText.includes(`href='${retired}`)) errors.push(`internal link still points to retired URL: ${retired}`);

fs.mkdirSync(path.dirname(REPORT), { recursive: true });
fs.writeFileSync(REPORT, ['url,status,indexable,canonical,title,h1,town,page_type,target_intent,action', ...rows.map((row) => row.map(csv).join(',')), ''].join('\n'));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Town inventory passed (${rows.length} scoped URLs; ${editorial.length} canonical town pages). Report: ${path.relative(ROOT, REPORT)}`);
