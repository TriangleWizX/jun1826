import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, writeCsv } from './url-qa-lib.mjs';

// This script verifies live redirect behavior and live/source parity snapshots.
// It does not assert direct internal-link canonicalization in source files.
// Use `npm run qa:blog:links:canonical` for static source canonical-link checks.

const DEFAULT_PATHS = [
  '/blog/',
  '/blog/seated-guard-basics/',
  '/blog/bjj-black-belt-degree-time/',
  '/blog/schedule-sensei/',
  '/blog/takedown-defense/',
  '/blog/takedown-defense'
];

const DEFAULT_PARITY_PATHS = [
  '/',
  '/schedule',
  '/blog/index.html',
  '/blog/wrestle-ups-scramble',
  '/blog/can-you-beat-sensei-without-a-black-belt'
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    baseUrl: 'https://senseisandy.com',
    timeoutMs: 12000,
    maxHops: 5,
    paths: [...DEFAULT_PATHS],
    parityPaths: [...DEFAULT_PARITY_PATHS]
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
    if (arg === '--max-hops') {
      out.maxHops = Number.parseInt(args[i + 1] || String(out.maxHops), 10);
      i += 1;
      continue;
    }
    if (arg === '--paths') {
      const raw = String(args[i + 1] || '').trim();
      if (raw) {
        out.paths = raw.split(',').map((item) => item.trim()).filter(Boolean);
      }
      i += 1;
      continue;
    }
    if (arg === '--parity-paths') {
      const raw = String(args[i + 1] || '').trim();
      if (raw) {
        out.parityPaths = raw.split(',').map((item) => item.trim()).filter(Boolean);
      }
      i += 1;
    }
  }

  return out;
};

const isRedirectStatus = (status) => [301, 302, 303, 307, 308].includes(status);

const toAbsoluteUrl = (baseUrl, maybeRelative) => {
  if (!maybeRelative) return '';
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return '';
  }
};

const fetchManual = async ({ url, timeoutMs }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      method: 'GET',
      signal: controller.signal,
      headers: {
        'user-agent': 'senseisandy-qa-blog-slash-live/1.0'
      }
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
};

const followChain = async ({ startUrl, timeoutMs, maxHops }) => {
  const chain = [];
  const seen = new Set();
  let current = startUrl;
  let hops = 0;
  let finalText = '';

  while (hops <= maxHops) {
    if (seen.has(current)) {
      return {
        chain,
        hops,
        finalUrl: current,
        finalStatus: 0,
        finalText,
        error: 'redirect loop detected'
      };
    }
    seen.add(current);

    const { response, text } = await fetchManual({ url: current, timeoutMs });
    const status = response.status;
    const locationRaw = response.headers.get('location') || '';
    const locationAbs = toAbsoluteUrl(current, locationRaw);
    chain.push({ url: current, status, location: locationAbs || locationRaw });
    finalText = text;

    if (!isRedirectStatus(status)) {
      return {
        chain,
        hops,
        finalUrl: current,
        finalStatus: status,
        finalText,
        error: ''
      };
    }

    if (!locationRaw) {
      return {
        chain,
        hops,
        finalUrl: current,
        finalStatus: status,
        finalText,
        error: 'redirect missing location header'
      };
    }

    if (!locationAbs) {
      return {
        chain,
        hops,
        finalUrl: current,
        finalStatus: status,
        finalText,
        error: `invalid redirect location: ${locationRaw}`
      };
    }

    current = locationAbs;
    hops += 1;
  }

  return {
    chain,
    hops,
    finalUrl: current,
    finalStatus: 0,
    finalText,
    error: `redirect hop limit exceeded (${maxHops})`
  };
};

const stripOrigin = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

const countPattern = (text, pattern) => {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
};

const readLocalText = async (webPath) => {
  const pathname = stripOrigin(webPath).replace(/\?.*$/, '');
  const normalized = pathname === '/' ? '/index.html' : pathname;
  const base = path.join(ROOT, normalized.startsWith('/') ? normalized.slice(1) : normalized);
  const candidates = [];

  if (base.endsWith('.html')) {
    candidates.push(base);
  } else {
    candidates.push(`${base}.html`);
    candidates.push(path.join(base, 'index.html'));
  }

  for (const candidate of candidates) {
    try {
      return await fs.readFile(candidate, 'utf8');
    } catch {
      // try next candidate
    }
  }
  return '';
};

const main = async () => {
  const args = parseArgs();
  const baseUrl = String(args.baseUrl || '').replace(/\/$/, '');
  if (!baseUrl) throw new Error('base URL is required.');

  const redirectRows = [];
  let failures = 0;

  for (const rawPath of args.paths) {
    const pathOnly = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const startUrl = `${baseUrl}${pathOnly}`;
    const expectedPath = pathOnly === '/blog/' ? '/blog' : pathOnly.replace(/\/+$/, '') || '/';
    const expectedFinal = `${baseUrl}${expectedPath}`;

    let result;
    try {
      result = await followChain({
        startUrl,
        timeoutMs: args.timeoutMs,
        maxHops: args.maxHops
      });
    } catch (error) {
      failures += 1;
      redirectRows.push([
        startUrl,
        expectedFinal,
        'ERR',
        '',
        '',
        '',
        '',
        String(error.message || error)
      ]);
      continue;
    }

    const first = result.chain[0] || { status: 0, location: '' };
    const finalComparable = stripOrigin(result.finalUrl);
    const expectedComparable = stripOrigin(expectedFinal);
    const chainStr = result.chain.map((step) => `${step.status}:${stripOrigin(step.url)}`).join(' -> ');

    const pass = !result.error && first.status === 301 && result.finalStatus === 200 && finalComparable === expectedComparable;
    if (!pass) failures += 1;

    redirectRows.push([
      startUrl,
      expectedFinal,
      String(first.status || 0),
      first.location || '',
      String(result.hops),
      String(result.finalStatus || 0),
      result.finalUrl,
      pass ? '' : (result.error || `expected 301 -> 200 at ${expectedComparable}, got ${chainStr}`)
    ]);
  }

  const parityRows = [];
  for (const rawPath of args.parityPaths) {
    const requestUrl = `${baseUrl}${rawPath.startsWith('/') ? rawPath : `/${rawPath}`}`;
    let live;
    try {
      live = await followChain({
        startUrl: requestUrl,
        timeoutMs: args.timeoutMs,
        maxHops: args.maxHops
      });
    } catch (error) {
      failures += 1;
      parityRows.push([requestUrl, 'ERR', '', '', '', '', String(error.message || error)]);
      continue;
    }

    const liveHtml = String(live.finalText || '');
    const localHtml = await readLocalText(rawPath);
    const liveBlogRootTrailing = countPattern(liveHtml, /href=["']https:\/\/senseisandy\.com\/blog\/["']/gi);
    const localBlogRootTrailing = countPattern(localHtml, /href=["']https:\/\/senseisandy\.com\/blog\/["']/gi);
    const liveBlogSlugTrailing = countPattern(liveHtml, /href=["'](?:https:\/\/senseisandy\.com)?\/blog\/[^"'?#]+\/["']/gi);
    const localBlogSlugTrailing = countPattern(localHtml, /href=["'](?:https:\/\/senseisandy\.com)?\/blog\/[^"'?#]+\/["']/gi);

    const pass = !live.error
      && live.finalStatus === 200
      && liveBlogRootTrailing === localBlogRootTrailing
      && liveBlogSlugTrailing === localBlogSlugTrailing;
    if (!pass) failures += 1;

    parityRows.push([
      requestUrl,
      String(live.finalStatus || 0),
      String(liveBlogRootTrailing),
      String(localBlogRootTrailing),
      String(liveBlogSlugTrailing),
      String(localBlogSlugTrailing),
      pass ? '' : (live.error || 'live/local trailing-slash link pattern mismatch')
    ]);
  }

  await Promise.all([
    writeCsv({
      path: 'crawl-reports/blog-slash-live-redirect-baseline.csv',
      headers: ['start_url', 'expected_final', 'first_status', 'first_location', 'hops', 'final_status', 'final_url', 'error'],
      rows: redirectRows
    }),
    writeCsv({
      path: 'crawl-reports/blog-slash-live-template-parity.csv',
      headers: [
        'request_url',
        'final_status',
        'live_abs_blog_root_slash_count',
        'local_abs_blog_root_slash_count',
        'live_blog_slug_slash_count',
        'local_blog_slug_slash_count',
        'error'
      ],
      rows: parityRows
    })
  ]);

  if (failures > 0) {
    console.error(`qa-blog-slash-live failed with ${failures} issue(s).`);
    console.error('See crawl-reports/blog-slash-live-redirect-baseline.csv and crawl-reports/blog-slash-live-template-parity.csv');
    process.exit(1);
  }

  console.log('qa-blog-slash-live passed.');
  console.log('Reports: crawl-reports/blog-slash-live-redirect-baseline.csv, crawl-reports/blog-slash-live-template-parity.csv');
};

main().catch((error) => {
  console.error(`qa-blog-slash-live failed: ${error.message}`);
  process.exit(1);
});
