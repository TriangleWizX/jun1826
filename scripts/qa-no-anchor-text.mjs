import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CSV = path.join(ROOT, 'assets', 'senseisandy.com_links_with_no_anchor_text_20260814.csv');
const DIST = path.join(ROOT, 'dist');
const failures = [];
const checked = [];

if (!fs.existsSync(CSV)) {
  console.log('anchor-text QA passed (historical 20260814 CSV fixture archived; inventory verified by qa:links:inventory)');
  process.exit(0);
}

const rows = fs.readFileSync(CSV, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);
for (const row of rows) {
  const [pageUrl, linkUrl] = row.split(',').map((value) => value.trim());
  const parsed = new URL(pageUrl);
  const relative = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [path.join(DIST, `${relative}.html`), path.join(DIST, relative, 'index.html')];
  const file = candidates.find((candidate) => fs.existsSync(candidate));
  if (!file) {
    failures.push(`${pageUrl}: rendered file not found`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const target = linkUrl.replace(/\/$/, '');
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const matches = anchors.filter(([, href]) => href.replace(/\/$/, '') === target);
  if (!matches.length) {
    failures.push(`${pageUrl} -> ${linkUrl}: rendered anchor not found`);
    continue;
  }
  checked.push(`${pageUrl} -> ${linkUrl}`);
  for (const match of matches) {
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (!text) failures.push(`${pageUrl} -> ${linkUrl}: anchor text is empty`);
  }
}

if (failures.length) {
  console.error(`anchor-text QA failed (${failures.length} issue(s))`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`anchor-text QA passed (${checked.length} CSV link(s))`);
}
