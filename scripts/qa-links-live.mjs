import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  getCanonicalAndInternalHosts,
  iterHtmlFiles,
  isSkippableHref,
  loadJson,
  parseAnchorHrefs,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    baseUrl: '',
    timeoutMs: 12000,
    concurrency: 10
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--base-url') {
      out.baseUrl = args[i + 1] || out.baseUrl;
      i += 1;
      continue;
    }
    if (arg === '--timeout-ms') {
      out.timeoutMs = Number.parseInt(args[i + 1] || String(out.timeoutMs), 10);
      i += 1;
      continue;
    }
    if (arg === '--concurrency') {
      out.concurrency = Number.parseInt(args[i + 1] || String(out.concurrency), 10);
      i += 1;
    }
  }

  return out;
};

const toAbsoluteLocation = (location, baseUrl) => {
  if (!location) return '';
  try {
    return new URL(location, baseUrl).toString();
  } catch {
    return location;
  }
};

const runWithConcurrency = async (items, limit, handler) => {
  const results = [];
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const currentIndex = index;
      index += 1;
      const item = items[currentIndex];
      results[currentIndex] = await handler(item);
    }
  };

  const count = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: count }, () => worker()));
  return results;
};

const fetchNoFollow = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: 'manual',
      method: 'GET',
      signal: controller.signal,
      headers: {
        'user-agent': 'senseisandy-qa-links-live/1.0'
      }
    });
  } finally {
    clearTimeout(timeout);
  }
};

const main = async () => {
  const args = parseArgs();
  const contract = await loadJson('config/url-contract.json');
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  const baseOrigin = (args.baseUrl || canonicalOrigin).replace(/\/$/, '');

  if (!canonicalOrigin) {
    throw new Error('config/url-contract.json is missing canonicalOrigin.');
  }

  const { canonicalHost, internalHosts } = getCanonicalAndInternalHosts(contract);
  const baseHost = new URL(`${baseOrigin}/`).hostname.toLowerCase();
  const effectiveHosts = new Set(internalHosts);
  effectiveHosts.add(baseHost);
  if (!baseHost.startsWith('www.')) {
    effectiveHosts.add(`www.${baseHost}`);
  }
  if (canonicalHost && !canonicalHost.startsWith('www.')) {
    effectiveHosts.add(`www.${canonicalHost}`);
  }

  const files = await iterHtmlFiles(ROOT);
  const urlSources = new Map();

  for (const relPath of files) {
    const html = await fs.readFile(path.join(ROOT, relPath), 'utf8');

    for (const href of parseAnchorHrefs(html)) {
      if (isSkippableHref(href)) continue;

      const resolved = resolveHref({
        href,
        sourceRelPath: relPath,
        baseOrigin,
        contract,
        internalHostsOverride: effectiveHosts
      });

      if (!resolved || !resolved.isInternal) continue;

      const requestUrl = `${resolved.url.origin}${resolved.url.pathname}${resolved.url.search}`;
      if (!urlSources.has(requestUrl)) {
        urlSources.set(requestUrl, new Set());
      }
      urlSources.get(requestUrl).add(relPath);
    }
  }

  const urls = [...urlSources.keys()].sort();

  const results = await runWithConcurrency(urls, args.concurrency, async (url) => {
    try {
      const response = await fetchNoFollow(url, args.timeoutMs);
      return {
        url,
        statusCode: response.status,
        location: toAbsoluteLocation(response.headers.get('location') || '', url),
        error: ''
      };
    } catch (error) {
      return {
        url,
        statusCode: 0,
        location: '',
        error: error.message
      };
    }
  });

  const fullRows = [];
  const rows3xx = [];
  const rows4xx5xx = [];
  let failures = 0;

  for (const result of results) {
    const sources = urlSources.get(result.url) || new Set();
    const row = [
      result.url,
      String(result.statusCode),
      result.location,
      String(sources.size),
      [...sources][0] || '',
      result.error
    ];

    fullRows.push(row);

    const is3xx = result.statusCode >= 300 && result.statusCode <= 399;
    const is4xx5xxOrError = result.statusCode >= 400 || result.statusCode === 0;

    if (is3xx) rows3xx.push(row);
    if (is4xx5xxOrError) rows4xx5xx.push(row);

    if (result.statusCode !== 200) {
      failures += 1;
    }
  }

  await Promise.all([
    writeCsv({
      path: 'crawl-reports/full-crawl-internal-links.csv',
      headers: ['url', 'status_code', 'location', 'source_count', 'sample_source', 'error'],
      rows: fullRows
    }),
    writeCsv({
      path: 'crawl-reports/internal-links-3xx.csv',
      headers: ['url', 'status_code', 'location', 'source_count', 'sample_source', 'error'],
      rows: rows3xx
    }),
    writeCsv({
      path: 'crawl-reports/internal-links-4xx-5xx.csv',
      headers: ['url', 'status_code', 'location', 'source_count', 'sample_source', 'error'],
      rows: rows4xx5xx
    })
  ]);

  if (failures > 0) {
    console.error(`qa-links-live failed: ${failures} internal link(s) did not return direct 200.`);
    console.error(`- 3xx links: ${rows3xx.length}`);
    console.error(`- 4xx/5xx/error links: ${rows4xx5xx.length}`);
    process.exit(1);
  }

  console.log(`qa-links-live passed (${fullRows.length} internal links checked).`);
};

main().catch((error) => {
  console.error(`qa-links-live failed: ${error.message}`);
  process.exit(1);
});
