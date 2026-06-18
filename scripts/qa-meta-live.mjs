import fs from 'node:fs/promises';
import path from 'node:path';
import { readSitemapTree } from './lib/sitemap-utils.mjs';

const ROOT = process.cwd();
const ROOT_SITEMAP = 'sitemap.xml';

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

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
};

const parseHtmlAttrs = (tag) => {
  const attrs = {};
  const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = attrRegex.exec(tag)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[3] ?? match[4] ?? match[5] ?? '';
    attrs[key] = value.trim();
  }
  return attrs;
};

const extractCanonicalHrefs = (html) => {
  const hrefs = [];
  const linkRegex = /<link\b[^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const attrs = parseHtmlAttrs(match[0]);
    if ((attrs.rel || '').toLowerCase() !== 'canonical') continue;
    const href = (attrs.href || '').trim();
    if (href) hrefs.push(href);
  }
  return hrefs;
};

const extractMetaProperties = (html, propertyName) => {
  const values = [];
  const target = String(propertyName || '').toLowerCase();
  const metaRegex = /<meta\b[^>]*>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = parseHtmlAttrs(match[0]);
    if ((attrs.property || '').toLowerCase() !== target) continue;
    const content = (attrs.content || '').trim();
    if (content) values.push(content);
  }
  return values;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\/.+/i.test(String(value || '').trim());

const runWithConcurrency = async (items, limit, handler) => {
  const results = [];
  let index = 0;

  const worker = async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await handler(items[current]);
    }
  };

  const count = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: count }, () => worker()));
  return results;
};

const fetchFollow = async (url, timeoutMs) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      method: 'GET',
      signal: controller.signal,
      headers: {
        'user-agent': 'senseisandy-qa-meta-live/1.0'
      }
    });
    const body = await response.text();
    return { response, body };
  } finally {
    clearTimeout(timeout);
  }
};

const validateRequest = async ({ requestUrl, expectedCanonical, timeoutMs }) => {
  const issues = [];
  let statusCode = 0;
  let finalUrl = '';

  try {
    const { response, body } = await fetchFollow(requestUrl, timeoutMs);
    statusCode = response.status;
    finalUrl = response.url || requestUrl;

    if (statusCode !== 200) {
      issues.push(`status ${statusCode} (expected 200)`);
      return { requestUrl, expectedCanonical, statusCode, finalUrl, issues };
    }

    const canonicalHrefs = extractCanonicalHrefs(body);
    const ogUrls = extractMetaProperties(body, 'og:url');
    const ogImages = extractMetaProperties(body, 'og:image');

    if (canonicalHrefs.length !== 1) {
      issues.push(`canonical count ${canonicalHrefs.length} (expected 1)`);
    }
    if (ogUrls.length !== 1) {
      issues.push(`og:url count ${ogUrls.length} (expected 1)`);
    }
    if (ogImages.length !== 1) {
      issues.push(`og:image count ${ogImages.length} (expected 1)`);
    }

    const canonical = canonicalHrefs[0] || '';
    const ogUrl = ogUrls[0] || '';
    const ogImage = ogImages[0] || '';

    if (canonical && !isAbsoluteHttpUrl(canonical)) {
      issues.push(`canonical not absolute: "${canonical}"`);
    }
    if (ogUrl && !isAbsoluteHttpUrl(ogUrl)) {
      issues.push(`og:url not absolute: "${ogUrl}"`);
    }
    if (ogImage && !isAbsoluteHttpUrl(ogImage)) {
      issues.push(`og:image not absolute: "${ogImage}"`);
    }
    if (canonical && canonical !== expectedCanonical) {
      issues.push(`canonical "${canonical}" (expected "${expectedCanonical}")`);
    }
    if (canonical && ogUrl && canonical !== ogUrl) {
      issues.push(`og:url "${ogUrl}" does not match canonical "${canonical}"`);
    }
  } catch (error) {
    issues.push(`request failed: ${error.message}`);
  }

  return { requestUrl, expectedCanonical, statusCode, finalUrl, issues };
};

const main = async () => {
  const args = parseArgs();
  const contractRaw = await fs.readFile(path.join(ROOT, 'config', 'url-contract.json'), 'utf8');
  const contract = JSON.parse(contractRaw);
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  const baseOrigin = (args.baseUrl || canonicalOrigin).replace(/\/$/, '');

  if (!canonicalOrigin) {
    throw new Error('config/url-contract.json is missing canonicalOrigin.');
  }

  const canonicalUrls = new Set();
  const { urls } = await readSitemapTree({
    rootDir: ROOT,
    sitemapPath: ROOT_SITEMAP,
    canonicalOrigin
  });
  for (const rawUrl of urls) {
    const parsed = new URL(rawUrl);
    const normalizedPath = normalizePathname(parsed.pathname || '/');
    canonicalUrls.add(`${canonicalOrigin}${normalizedPath}`);
  }

  const requests = [];
  for (const canonicalUrl of [...canonicalUrls].sort()) {
    const parsed = new URL(canonicalUrl);
    const normalizedPath = normalizePathname(parsed.pathname || '/');
    const requestCanonical = `${baseOrigin}${normalizedPath}`;

    requests.push({
      requestUrl: requestCanonical,
      expectedCanonical: canonicalUrl
    });

    if (normalizedPath !== '/') {
      requests.push({
        requestUrl: `${requestCanonical}/`,
        expectedCanonical: canonicalUrl
      });
    }
  }

  const results = await runWithConcurrency(
    requests,
    args.concurrency,
    (item) => validateRequest({ ...item, timeoutMs: args.timeoutMs })
  );

  const failures = results.filter((result) => result.issues.length > 0);
  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(
        `META LIVE FAIL: ${failure.requestUrl} -> ${failure.issues.join('; ')}`
      );
    }
    process.exit(1);
  }

  console.log(`qa-meta-live passed (${results.length} request variants across ${canonicalUrls.size} sitemap URLs).`);
};

main().catch((error) => {
  console.error(`qa-meta-live failed: ${error.message}`);
  process.exit(1);
});
