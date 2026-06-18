import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readHtmlWithSsi } from './url-qa-lib.mjs';

const NAV_ITEM_RE = /<li\b[^>]*class=(["'])[^"']*\bnav-item\b[^"']*\1[^>]*>[\s\S]*?<\/(?:li)>/gi;
const LINK_TEXT_RE = /<(?:a|button)\b[^>]*class=(["'])[^"']*\bnav-link\b[^"']*\1[^>]*>([\s\S]*?)<\/(?:a|button)>/i;
const TAG_RE = /<[^>]+>/g;

const pages = ['index.html', 'teens.html', 'teen-jiu-jitsu-tannersville-ny.html', 'student-hub.html', 'schedule.html'];

const textOf = (value) => value.replace(TAG_RE, ' ').replace(/\s+/g, ' ').trim();

const main = async () => {
  const failures = [];
  const nav = await fs.readFile(path.join(ROOT, 'nav-include.html'), 'utf8');
  const dotMatches = [...nav.matchAll(/<span\b[^>]*class=(["'])[^"']*\bss-topbar-dot\b[^"']*\1([^>]*)>/gi)];

  if (!dotMatches.length) {
    failures.push('nav-include.html: missing .ss-topbar-dot separators.');
  }

  for (const match of dotMatches) {
    const attrs = match[0];
    if (!/aria-hidden\s*=\s*(["'])true\1/i.test(attrs) || !/role\s*=\s*(["'])presentation\1/i.test(attrs)) {
      failures.push('nav-include.html: .ss-topbar-dot must include aria-hidden="true" and role="presentation".');
      break;
    }
  }

  for (const relPath of pages) {
    const html = await readHtmlWithSsi(relPath);
    const navRoot = html.match(/<div id="ssMainNav"[\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/i);
    if (!navRoot) {
      failures.push(`${relPath}: missing assembled #ssMainNav block.`);
      continue;
    }

    const labels = [];
    let navItemMatch;
    while ((navItemMatch = NAV_ITEM_RE.exec(navRoot[0])) !== null) {
      const classes = navItemMatch[0].match(/class=(["'])([^"']+)\1/i)?.[2] || '';
      if (/\bd-none\b/.test(classes)) continue;
      const linkMatch = navItemMatch[0].match(LINK_TEXT_RE);
      if (!linkMatch) continue;
      labels.push(textOf(linkMatch[2]));
    }

    const seen = new Set();
    const duplicates = new Set();
    for (const label of labels) {
      if (!label) continue;
      if (seen.has(label)) duplicates.add(label);
      seen.add(label);
    }

    if (duplicates.size) {
      failures.push(`${relPath}: duplicate visible nav labels in assembled source (${[...duplicates].join(', ')}).`);
    }

    const straySeparators = labels.filter((label) => label === '•' || label === '|');
    if (straySeparators.length) {
      failures.push(`${relPath}: separator artifact appears as visible nav label.`);
    }
  }

  if (failures.length) {
    console.error('qa-nav-visible-duplicates failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('qa-nav-visible-duplicates passed.');
};

main().catch((error) => {
  console.error(`qa-nav-visible-duplicates failed: ${error.message}`);
  process.exit(1);
});
