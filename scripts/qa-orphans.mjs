import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  filePathToWebPath,
  iterHtmlFiles,
  isSkippableHref,
  loadJson,
  normalizePath,
  parseAnchorHrefs,
  readHtmlWithSsi,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const REPORT_PATH = 'crawl-reports/orphan-reachability.csv';
const SITEMAPS = ['pages-sitemap.xml', 'blog-sitemap.xml', 'video-sitemap.xml'];

const canonicalTagRegex = /<link\b[^>]*>/gi;
const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;

const extractCanonical = (html) => {
  const tags = String(html || '').match(canonicalTagRegex) || [];
  for (const tag of tags) {
    const attrs = {};
    attrRegex.lastIndex = 0;
    let match;
    while ((match = attrRegex.exec(tag)) !== null) {
      const key = String(match[1] || '').toLowerCase();
      attrs[key] = (match[3] ?? match[4] ?? match[5] ?? '').trim();
    }
    if ((attrs.rel || '').toLowerCase() === 'canonical') return attrs.href || '';
  }
  return '';
};

const hasNoindex = (html) => {
  const tags = String(html || '').match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attrs = {};
    attrRegex.lastIndex = 0;
    let match;
    while ((match = attrRegex.exec(tag)) !== null) {
      const key = String(match[1] || '').toLowerCase();
      attrs[key] = (match[3] ?? match[4] ?? match[5] ?? '').trim();
    }
    if ((attrs.name || '').toLowerCase() !== 'robots') continue;
    if (String(attrs.content || '').toLowerCase().split(/[\s,]+/).includes('noindex')) return true;
  }
  return false;
};

const loadSitemapPaths = async ({ canonicalOrigin }) => {
  const paths = new Set();
  for (const relPath of SITEMAPS) {
    const xml = await fs.readFile(path.join(ROOT, relPath), 'utf8');
    const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
    for (const match of locs) {
      try {
        const url = new URL(match[1]);
        if (url.origin !== canonicalOrigin) continue;
        paths.add(normalizePath(url.pathname || '/'));
      } catch {
        // Ignore malformed sitemap entries here; sitemap QA handles XML correctness separately.
      }
    }
  }
  return paths;
};

const main = async () => {
  const contract = await loadJson('config/url-contract.json');
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  if (!canonicalOrigin) throw new Error('config/url-contract.json is missing canonicalOrigin.');

  const htmlFiles = await iterHtmlFiles(ROOT);
  const routeToFile = new Map();
  const localIndexablePaths = new Set();

  for (const relPath of htmlFiles) {
    const routePath = filePathToWebPath(relPath);
    routeToFile.set(routePath, relPath);

    const rawHtml = await fs.readFile(path.join(ROOT, relPath), 'utf8');
    const canonical = extractCanonical(rawHtml);
    if (!canonical || hasNoindex(rawHtml)) continue;

    let canonicalPath = '';
    try {
      const canonicalUrl = new URL(canonical, `${canonicalOrigin}/`);
      if (canonicalUrl.origin !== canonicalOrigin) continue;
      canonicalPath = normalizePath(canonicalUrl.pathname || '/');
    } catch {
      continue;
    }

    if (canonicalPath === routePath) {
      localIndexablePaths.add(routePath);
    }
  }

  const sitemapPaths = await loadSitemapPaths({ canonicalOrigin });
  const intendedPaths = new Set([...localIndexablePaths, ...sitemapPaths]);
  const graph = new Map();
  const incoming = new Map();

  for (const [routePath, relPath] of routeToFile.entries()) {
    const html = await readHtmlWithSsi(relPath);
    const edges = new Set();

    for (const href of parseAnchorHrefs(html)) {
      if (isSkippableHref(href)) continue;
      const resolved = resolveHref({
        href,
        sourceRelPath: relPath,
        baseOrigin: canonicalOrigin,
        contract
      });
      if (!resolved || !resolved.isInternal) continue;
      const targetPath = normalizePath(resolved.normalizedPath);
      if (!routeToFile.has(targetPath)) continue;
      edges.add(targetPath);
      if (!incoming.has(targetPath)) incoming.set(targetPath, new Set());
      incoming.get(targetPath).add(routePath);
    }

    graph.set(routePath, edges);
  }

  const reachable = new Set();
  const queue = ['/'];
  while (queue.length) {
    const current = queue.shift();
    if (!current || reachable.has(current)) continue;
    reachable.add(current);
    for (const next of graph.get(current) || []) {
      if (!reachable.has(next)) queue.push(next);
    }
  }

  const rows = [];
  const failures = [];
  for (const targetPath of [...intendedPaths].sort()) {
    const inlinks = [...(incoming.get(targetPath) || [])].sort();
    const source =
      localIndexablePaths.has(targetPath) && sitemapPaths.has(targetPath)
        ? 'local+self_sitemap'
        : localIndexablePaths.has(targetPath)
          ? 'local_self_canonical'
          : 'sitemap';
    const existsLocally = routeToFile.has(targetPath);
    const isReachable = existsLocally && reachable.has(targetPath);
    const status = isReachable ? 'pass' : 'fail';

    rows.push([
      `${canonicalOrigin}${targetPath === '/' ? '' : targetPath}`,
      source,
      existsLocally ? 'yes' : 'no',
      isReachable ? 'yes' : 'no',
      String(inlinks.length),
      inlinks.slice(0, 6).join('|'),
      status
    ]);

    if (!isReachable) failures.push(targetPath);
  }

  await writeCsv({
    path: REPORT_PATH,
    headers: ['url', 'intended_source', 'local_file_present', 'reachable_from_home', 'incoming_internal_links', 'sample_sources', 'status'],
    rows
  });

  if (failures.length) {
    console.error(`qa-orphans failed with ${failures.length} unreachable intended page(s).`);
    for (const targetPath of failures.slice(0, 40)) {
      console.error(`- ${targetPath}`);
    }
    if (failures.length > 40) console.error(`... ${failures.length - 40} more`);
    process.exit(1);
  }

  console.log(`qa-orphans passed (${rows.length} intended indexable URLs checked).`);
};

main().catch((error) => {
  console.error(`qa-orphans failed: ${error.message}`);
  process.exit(1);
});
