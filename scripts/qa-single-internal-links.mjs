import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSV = path.join(ROOT, 'assets', 'senseisandy.com_pages_with_only_one_internal_link_20260814.csv');
const DIST = path.join(ROOT, 'dist');

const rows = fs.readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);
const failures = [];
const checked = [];

for (const row of rows) {
  const url = row.split(',')[0].trim();
  const parsed = new URL(url);
  const relative = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [
    path.join(DIST, `${relative}.html`),
    path.join(DIST, relative, 'index.html')
  ];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    failures.push(`${url}: rendered file not found`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const links = new Set();
  for (const match of html.matchAll(/href\s*=\s*["'](\/[^"'#?]*)/gi)) {
    const target = match[1].replace(/\/$/, '') || '/';
    if (target !== parsed.pathname.replace(/\/$/, '') && !target.startsWith('/assets/')) links.add(target);
  }
  const count = links.size;
  checked.push({ url, count });
  if (count <= 1) failures.push(`${url}: ${count} unique internal link(s)`);
}

for (const item of checked) console.log(`single-link QA: ${item.count} unique internal links ${item.url}`);
if (failures.length) {
  console.error(`single-link QA failed (${failures.length} issue(s))`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`single-link QA passed (${checked.length} CSV page(s), all above one unique internal link)`);
}
