import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSV = path.join(ROOT, 'assets', 'senseisandy.com_links_with_non-descriptive_anchor_text_20260814.csv');
const DIST = path.join(ROOT, 'dist');
const generic = new Set(['learn more', 'click here', 'read more', 'more', 'here']);
const failures = [];
const rows = fs.readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);

for (const row of rows) {
  const [pageUrl, linkUrl] = row.split(',').map((value) => value.trim());
  const page = new URL(pageUrl);
  const relative = page.pathname.replace(/^\//, '').replace(/\/$/, '');
  const file = [path.join(DIST, relative, 'index.html'), path.join(DIST, `${relative}.html`)].find((candidate) => fs.existsSync(candidate));
  if (!file) { failures.push(`${pageUrl}: rendered file not found`); continue; }
  const target = new URL(linkUrl, page).pathname.replace(/\/$/, '');
  const html = fs.readFileSync(file, 'utf8');
  const matches = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .filter(([, href]) => new URL(href, page).pathname.replace(/\/$/, '') === target);
  if (!matches.length) { failures.push(`${pageUrl} -> ${linkUrl}: rendered anchor not found`); continue; }
  for (const match of matches) {
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!text || generic.has(text)) failures.push(`${pageUrl} -> ${linkUrl}: non-descriptive text "${text}"`);
  }
}

if (failures.length) {
  console.error(`non-descriptive-anchor QA failed (${failures.length} issue(s))`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else console.log(`non-descriptive-anchor QA passed (${rows.length} CSV link(s))`);
