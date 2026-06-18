import fs from 'node:fs/promises';
import path from 'node:path';

const URLSET_RE = /<urlset\b/i;
const SITEMAP_INDEX_RE = /<sitemapindex\b/i;

const normalizeLocalPath = (rawPath) => {
  const input = String(rawPath || '').trim().replace(/\\/g, '/');
  const withoutLeadingSlash = input.replace(/^\/+/, '');
  if (!withoutLeadingSlash) {
    throw new Error(`Sitemap path is empty: "${rawPath}"`);
  }

  const normalized = path.posix.normalize(withoutLeadingSlash);
  if (!normalized || normalized === '.' || normalized.startsWith('../')) {
    throw new Error(`Sitemap path resolves outside root: "${rawPath}"`);
  }

  return normalized;
};

const extractLocFromBlock = (block) => {
  const match = block.match(/<loc>\s*([^<]+)\s*<\/loc>/i);
  return match ? match[1].trim() : '';
};

export const parseUrlsetLocs = (xml) => {
  const locs = [];
  const urlRegex = /<url\b[^>]*>([\s\S]*?)<\/url>/gi;
  let match;
  while ((match = urlRegex.exec(xml)) !== null) {
    const loc = extractLocFromBlock(match[1]);
    if (loc) locs.push(loc);
  }
  return locs;
};

export const parseSitemapIndexLocs = (xml) => {
  const locs = [];
  const sitemapRegex = /<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi;
  let match;
  while ((match = sitemapRegex.exec(xml)) !== null) {
    const loc = extractLocFromBlock(match[1]);
    if (loc) locs.push(loc);
  }
  return locs;
};

export const detectSitemapType = (xml) => {
  if (SITEMAP_INDEX_RE.test(xml)) return 'sitemapindex';
  if (URLSET_RE.test(xml)) return 'urlset';
  return 'unknown';
};

export const sitemapLocToLocalPath = (loc, canonicalOrigin) => {
  let parsed;
  try {
    parsed = new URL(String(loc || '').trim());
  } catch {
    throw new Error(`Invalid sitemap <loc> URL: "${loc}"`);
  }

  if (!canonicalOrigin) {
    throw new Error('canonicalOrigin is required to resolve sitemap index <loc> values.');
  }

  const canonical = new URL(String(canonicalOrigin).trim().replace(/\/$/, ''));
  if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) {
    throw new Error(
      `Sitemap index <loc> must use canonical origin ${canonical.origin}: "${loc}"`
    );
  }

  return normalizeLocalPath(parsed.pathname || '');
};

export const readSitemapTree = async ({
  rootDir,
  sitemapPath = 'sitemap.xml',
  canonicalOrigin
}) => {
  const root = path.resolve(rootDir || process.cwd());
  const visitedSitemaps = new Set();
  const sitemapToUrls = new Map();
  const urlToSitemaps = new Map();

  const visit = async (relPath) => {
    const localPath = normalizeLocalPath(relPath);
    if (visitedSitemaps.has(localPath)) return;
    visitedSitemaps.add(localPath);

    const absolutePath = path.join(root, localPath);
    const xml = await fs.readFile(absolutePath, 'utf8');
    const type = detectSitemapType(xml);

    if (type === 'urlset') {
      const urls = parseUrlsetLocs(xml);
      sitemapToUrls.set(localPath, urls);
      for (const url of urls) {
        if (!urlToSitemaps.has(url)) urlToSitemaps.set(url, new Set());
        urlToSitemaps.get(url).add(localPath);
      }
      return;
    }

    if (type === 'sitemapindex') {
      const childLocs = parseSitemapIndexLocs(xml);
      for (const childLoc of childLocs) {
        const childPath = sitemapLocToLocalPath(childLoc, canonicalOrigin);
        await visit(childPath);
      }
      return;
    }

    throw new Error(`Unsupported sitemap type in ${localPath}.`);
  };

  await visit(sitemapPath);

  return {
    urls: new Set(urlToSitemaps.keys()),
    urlToSitemaps,
    sitemapToUrls,
    visitedSitemaps
  };
};

