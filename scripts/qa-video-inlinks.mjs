import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  iterHtmlFiles,
  isSkippableHref,
  loadJson,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const REPORT_PATH = 'crawl-reports/video-inlinks.csv';

const HUB_FILES = new Set([
  'videos/index.html',
  'videos/kids.html',
  'videos/teens.html',
  'videos/adults.html',
  'videos/breakfalls.html',
  'videos/takedowns.html',
  'videos/guard-passing.html',
  'videos/escapes.html',
  'videos/submissions.html',
  'videos/self-defense.html'
]);

const MONEY_PAGES = new Set([
  'index.html',
  'kids.html',
  'teens.html',
  'adult-bjj.html',
  'bjj-classes-tannersville-ny.html',
  'schedule.html',
  'show-up-kit.html'
]);

const parseAnchorTags = (html) => {
  const tags = [];
  const htmlWithoutScripts = String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const anchorRegex = /<a\b[^>]*>/gi;
  let match;
  while ((match = anchorRegex.exec(htmlWithoutScripts)) !== null) {
    tags.push(match[0]);
  }
  return tags;
};

const parseAttrs = (tag) => {
  const attrs = {};
  const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    const key = String(match[1] || '').toLowerCase();
    const value = (match[3] ?? match[4] ?? match[5] ?? '').trim();
    attrs[key] = value;
  }
  return attrs;
};

const classifySourceType = (sourceRelPath) => {
  if (sourceRelPath.startsWith('partials/video-featured-')) return 'money-page';
  if (sourceRelPath === 'videos/index.html') return 'hub-master';
  if (sourceRelPath === 'videos/kids.html' || sourceRelPath === 'videos/teens.html' || sourceRelPath === 'videos/adults.html') {
    return 'hub-program';
  }
  if (
    sourceRelPath === 'videos/breakfalls.html'
    || sourceRelPath === 'videos/takedowns.html'
    || sourceRelPath === 'videos/guard-passing.html'
    || sourceRelPath === 'videos/escapes.html'
    || sourceRelPath === 'videos/submissions.html'
    || sourceRelPath === 'videos/self-defense.html'
  ) {
    return 'hub-technique';
  }
  if (MONEY_PAGES.has(sourceRelPath)) return 'money-page';
  if (sourceRelPath.startsWith('videos/') && sourceRelPath.endsWith('.html')) return 'video-related';
  return 'other';
};

const loadWatchPages = async () => {
  const entries = await fs.readdir(path.join(ROOT, 'videos'), { withFileTypes: true });
  const watchPaths = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.html')) continue;
    const relPath = path.posix.join('videos', entry.name);
    if (HUB_FILES.has(relPath)) continue;
    const slug = entry.name.slice(0, -'.html'.length);
    watchPaths.push(`/videos/${slug}`);
  }
  return watchPaths.sort();
};

const main = async () => {
  const contract = await loadJson('config/url-contract.json');
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  if (!canonicalOrigin) throw new Error('config/url-contract.json is missing canonicalOrigin.');

  const watchPaths = await loadWatchPages();
  if (!watchPaths.length) throw new Error('No watch pages found under videos/.');

  const watchPathSet = new Set(watchPaths);
  const stats = new Map(
    watchPaths.map((pathValue) => [pathValue, { inlinks: 0, sourceTypes: new Set(), sources: new Set() }])
  );

  const htmlFiles = await iterHtmlFiles(ROOT);

  for (const relPath of htmlFiles) {
    const html = await fs.readFile(path.join(ROOT, relPath), 'utf8');
    const sourceType = classifySourceType(relPath);

    for (const tag of parseAnchorTags(html)) {
      const attrs = parseAttrs(tag);
      const href = String(attrs.href || '').trim();
      if (!href || isSkippableHref(href)) continue;

      const relTokens = String(attrs.rel || '')
        .toLowerCase()
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean);
      if (relTokens.includes('nofollow')) continue;

      const resolved = resolveHref({
        href,
        sourceRelPath: relPath,
        baseOrigin: canonicalOrigin,
        contract
      });
      if (!resolved || !resolved.isInternal) continue;
      if (!watchPathSet.has(resolved.normalizedPath)) continue;

      const current = stats.get(resolved.normalizedPath);
      if (!current) continue;
      current.inlinks += 1;
      current.sourceTypes.add(sourceType);
      current.sources.add(relPath);
    }
  }

  const rows = [];
  const failures = [];

  for (const pathValue of watchPaths) {
    const record = stats.get(pathValue);
    const sourceTypes = [...record.sourceTypes].sort();
    const sourceFiles = [...record.sources].sort();
    const sourceTypeCount = sourceTypes.length;
    const inlinkCount = record.inlinks;
    const passed = inlinkCount >= 3 && sourceTypeCount >= 2;

    if (!passed) {
      failures.push(`${pathValue} (inlinks=${inlinkCount}, sourceTypes=${sourceTypeCount})`);
    }

    rows.push([
      `${canonicalOrigin}${pathValue}`,
      String(inlinkCount),
      String(sourceTypeCount),
      sourceTypes.join('|'),
      sourceFiles.slice(0, 5).join('|'),
      passed ? 'pass' : 'fail'
    ]);
  }

  await writeCsv({
    path: REPORT_PATH,
    headers: ['url', 'inlink_count', 'source_type_count', 'source_types', 'sample_sources', 'status'],
    rows
  });

  if (failures.length) {
    console.error(`qa-video-inlinks failed with ${failures.length} URL(s) below threshold.`);
    for (const failure of failures.slice(0, 30)) {
      console.error(`- ${failure}`);
    }
    if (failures.length > 30) {
      console.error(`... ${failures.length - 30} more`);
    }
    process.exit(1);
  }

  console.log(`qa-video-inlinks passed (${watchPaths.length} watch pages checked).`);
};

main().catch((error) => {
  console.error(`qa-video-inlinks failed: ${error.message}`);
  process.exit(1);
});
