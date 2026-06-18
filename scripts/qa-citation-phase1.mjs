import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

const PAGES = [
  {
    rel: 'tannersville-ny-jiu-jitsu.html',
    canonical: 'https://senseisandy.com/tannersville-ny-jiu-jitsu',
    mustInclude: [
      /Fast Facts \+ Verified Sources/i,
      /straight-line distance computed from 2020 U\.S\. Census Gazetteer representative coordinates/i,
      /https:\/\/www\.census\.gov\/geographies\/reference-files\/time-series\/geo\/gazetteer-files\.2020\.html/i,
      /https:\/\/www\.census\.gov\/quickfacts\/fact\/table\/tannersvillevillagegreencountynewyork\/PST045225/i
    ],
    forbidden: [
      /wikipedia\.org/i,
      /pickleheads\.com/i,
      /greatnortherncatskills\.com/i
    ],
    customChecks: (html, rel) => {
      const retrievedCount = (html.match(/<strong>Retrieved:<\/strong>/g) || []).length;
      const whyCount = (html.match(/<strong>Why this matters:<\/strong>/g) || []).length;
      if (retrievedCount < 3) errors.push(`${rel}: expected at least 3 "Retrieved" lines, found ${retrievedCount}.`);
      if (whyCount < 3) errors.push(`${rel}: expected at least 3 "Why this matters" lines, found ${whyCount}.`);
    }
  },
  {
    rel: 'directions.html',
    canonical: 'https://senseisandy.com/directions',
    mustInclude: [
      /Straight-Line Distance from Nearby Towns/i,
      /about 2\.2 miles straight-line/i,
      /about 9\.6 miles straight-line/i,
      /about 1\.7 miles straight-line/i,
      /Method: straight-line distance computed from 2020 U\.S\. Census Gazetteer representative coordinates/i
    ],
    forbidden: [
      /<li[^>]*>\s*<a href="\/near\/hunter-ny">[\s\S]*?minutes/i,
      /<li[^>]*>\s*<a href="\/near\/windham-ny">[\s\S]*?minutes/i,
      /<li[^>]*>\s*<a href="\/near\/haines-falls">[\s\S]*?minutes/i
    ]
  },
  {
    rel: 'private-lessons.html',
    canonical: 'https://senseisandy.com/private-lessons',
    mustInclude: [
      /Method for town distances: straight-line from 2020 U\.S\. Census Gazetteer representative coordinates/i,
      /<strong>Straight-line distance:<\/strong> about 9\.6 miles/i,
      /<strong>Straight-line distance:<\/strong> about 2\.2 miles/i
    ],
    forbidden: [
      /<strong>Drive time:<\/strong>/i
    ]
  },
  {
    rel: 'schedule.html',
    canonical: 'https://senseisandy.com/schedule',
    mustInclude: [
      /https:\/\/ibjjf\.com\/graduation-system/i,
      /Training format reference:/i
    ],
    forbidden: []
  }
];

const FORBIDDEN_LINKS = [
  '/videos',
  '/hunter-ny-jiu-jitsu',
  '/faqs',
  '/adults'
];

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const check = (condition, message) => {
  if (!condition) errors.push(message);
};

const read = async (rel) => fs.readFile(path.join(ROOT, rel), 'utf8');

const canonicalTagRegex = /<link\b[^>]*>/gi;
const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;

const extractCanonical = (html) => {
  const tags = html.match(canonicalTagRegex) || [];
  for (const tag of tags) {
    const attrs = {};
    let match;
    while ((match = attrRegex.exec(tag)) !== null) {
      const key = match[1].toLowerCase();
      const value = (match[3] ?? match[4] ?? match[5] ?? '').trim();
      attrs[key] = value;
    }
    if ((attrs.rel || '').toLowerCase() === 'canonical') {
      return attrs.href || '';
    }
  }
  return '';
};

const run = async () => {
  for (const page of PAGES) {
    const html = await read(page.rel);
    const canonical = extractCanonical(html);
    check(Boolean(canonical), `${page.rel}: missing canonical tag.`);
    if (canonical) check(canonical === page.canonical, `${page.rel}: canonical mismatch (${canonical}).`);

    for (const pattern of page.mustInclude) {
      check(pattern.test(html), `${page.rel}: missing required pattern ${pattern}.`);
    }

    for (const pattern of page.forbidden) {
      check(!pattern.test(html), `${page.rel}: contains forbidden pattern ${pattern}.`);
    }

    for (const bad of FORBIDDEN_LINKS) {
      const badHrefPattern = new RegExp(`href=["']${escapeRegExp(bad)}(?:["'#?]|$)`, 'i');
      check(!badHrefPattern.test(html), `${page.rel}: contains non-canonical legacy link ${bad}.`);
    }

    if (typeof page.customChecks === 'function') {
      page.customChecks(html, page.rel);
    }
  }

  if (errors.length) {
    for (const error of errors) console.error(`CITATION PHASE1 QA FAIL: ${error}`);
    process.exit(1);
  }

  console.log('Citation phase1 QA passed.');
};

run().catch((error) => {
  console.error(`CITATION PHASE1 QA FAIL: ${error.message}`);
  process.exit(1);
});
