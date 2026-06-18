import fs from 'node:fs/promises';
import path from 'node:path';
import { readSitemapTree } from './lib/sitemap-utils.mjs';

const ROOT = process.cwd();
const ROOT_SITEMAP = 'sitemap.xml';
const ERROR_TOKEN = '[an error occurred while processing this directive]';
const PRIORITY_PATHS = [
  '/kids',
  '/teens',
  '/teen-jiu-jitsu-tannersville-ny',
  '/student-hub',
  '/directions',
  '/contact',
  '/schedule',
  '/near/windham-ny',
  '/blog/beginner-friendly-bjj-tannersville-links'
];

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
};

const resolveUrlToFile = async (urlString) => {
  const parsed = new URL(urlString);
  const pathname = normalizePathname(parsed.pathname);
  const slug = pathname.replace(/^\/+/, '');
  const candidates = pathname === '/'
    ? ['index.html']
    : [`${slug}.html`, path.join(slug, 'index.html')];

  for (const candidate of candidates) {
    const full = path.join(ROOT, candidate);
    try {
      await fs.access(full);
      return candidate;
    } catch {
      // try next
    }
  }

  throw new Error(`No local file found for ${urlString} (tried ${candidates.join(', ')})`);
};

const main = async () => {
  const contract = JSON.parse(await fs.readFile(path.join(ROOT, 'config', 'url-contract.json'), 'utf8'));
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  if (!canonicalOrigin) {
    throw new Error('config/url-contract.json must define canonicalOrigin.');
  }

  const { urls } = await readSitemapTree({
    rootDir: ROOT,
    sitemapPath: ROOT_SITEMAP,
    canonicalOrigin
  });

  const targetUrls = new Set(urls);
  for (const relPath of PRIORITY_PATHS) {
    targetUrls.add(`${canonicalOrigin}${relPath}`);
  }

  const findings = [];
  for (const url of [...targetUrls].sort()) {
    const relFile = await resolveUrlToFile(url);
    const html = await fs.readFile(path.join(ROOT, relFile), 'utf8');
    if (html.includes(ERROR_TOKEN)) {
      findings.push({ url, relFile });
    }
  }

  if (findings.length) {
    for (const finding of findings) {
      console.error(`QA SSI FAIL: ${finding.url} (${finding.relFile}) contains "${ERROR_TOKEN}"`);
    }
    process.exit(1);
  }

  console.log(`qa-ssi passed (${targetUrls.size} sitemap/priority URLs checked).`);
};

main().catch((error) => {
  console.error(`qa-ssi failed: ${error.message}`);
  process.exit(1);
});
