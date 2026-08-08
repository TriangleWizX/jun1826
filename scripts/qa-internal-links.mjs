import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  iterHtmlFiles,
  loadJson,
  readHtmlWithSsi,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const DEFAULT_REPORT = 'crawl-reports/internal-links-inventory.csv';
const ANCHOR_RE = /<a\b([^>]*?)>([\s\S]*?)<\/a\s*>/gi;
const ATTR_RE = /([:\w-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i;
const ID_RE = /\bid\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const INTERNAL_DEV_RE = /(?:localhost|127\.0\.0\.1|staging|preview|(?:^|[/.])dev(?:[/.]|$)|(?:^|[/.])test(?:[/.]|$))/i;
const MALFORMED_INTERNAL_RE = /(?:https?:\/\/https?:\/\/|https?:\/\/senseisandy\.comhttps?:\/\/|https?:\/\/senseisandy\.com\/https?:\/\/|https?:\/\/(?:www\.)?senseisandy\.com\/senseisandy\.com|^\/\/(?:www\.)?senseisandy\.com|^senseisandy\.com[\/]|^https?:\/\/senseisandy\.com[^\/])/i;
const CUSTOM_REWRITES = {
  '/calendar/private-4pm.ics': '/assets/calendar/private-lessons-4pm.ics',
  '/calendar/youth-5pm.ics': '/assets/calendar/youth-class-5pm.ics',
  '/calendar/adult-6pm.ics': '/assets/calendar/adult-class-6pm.ics',
  '/calendar/saturday.ics': '/assets/calendar/saturday-block.ics'
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const reportIndex = args.indexOf('--report');
  return { report: reportIndex >= 0 ? args[reportIndex + 1] || DEFAULT_REPORT : DEFAULT_REPORT };
};

const attr = (attrs, name) => {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return match ? (match[2] ?? match[3] ?? match[4] ?? '').trim() : '';
};

const sourceLabel = (relPath) => {
  if (/(?:^|\/)src\/_includes\//.test(relPath) || /(?:^|\/)partials\//.test(relPath)) return 'GLOBAL COMPONENT';
  if (/footer|header|nav/i.test(relPath)) return 'HEADER/FOOTER';
  if (/blog/i.test(relPath)) return 'BLOG TEMPLATE';
  if (/breadcrumb/i.test(relPath)) return 'BREADCRUMB TEMPLATE';
  if (/cta|booking|intro/i.test(relPath)) return 'CTA COMPONENT';
  return 'HARDCODED HTML';
};

const fileExists = async (pathname) => {
  const clean = CUSTOM_REWRITES[pathname] || decodeURIComponent(pathname);
  const candidates = [path.join(ROOT, clean)];
  if (!path.extname(clean)) candidates.push(path.join(ROOT, `${clean}.html`), path.join(ROOT, clean, 'index.html'));
  for (const candidate of candidates) {
    try { if ((await fs.stat(candidate)).isFile()) return true; } catch {}
  }
  return false;
};

const targetIdsCache = new Map();
const targetIds = async (pathname) => {
  const clean = CUSTOM_REWRITES[pathname] || decodeURIComponent(pathname);
  if (targetIdsCache.has(clean)) return targetIdsCache.get(clean);
  const candidates = [path.join(ROOT, clean)];
  if (!path.extname(clean)) candidates.push(path.join(ROOT, `${clean}.html`), path.join(ROOT, clean, 'index.html'));
  let ids = new Set();
  for (const candidate of candidates) {
    try {
      const html = await fs.readFile(candidate, 'utf8');
      ids = new Set([...html.matchAll(ID_RE)].map((match) => (match[2] ?? match[3] ?? match[4] ?? '').trim()));
      break;
    } catch {}
  }
  targetIdsCache.set(clean, ids);
  return ids;
};

const main = async () => {
  const { report } = parseArgs();
  const contract = await loadJson('config/url-contract.json');
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  const files = await iterHtmlFiles(ROOT);
  const rows = [];
  const failures = [];

  for (const relPath of files) {
    const html = await readHtmlWithSsi(relPath);
    for (const match of html.matchAll(ANCHOR_RE)) {
      const attrs = match[1] || '';
      const href = attr(attrs, 'href');
      const anchor = attrs.replace(/\s+/g, ' ').trim();
      const text = (match[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const resolved = href ? resolveHref({ href, sourceRelPath: relPath, baseOrigin: canonicalOrigin, contract }) : null;
      let status = 'SKIPPED';
      let finalUrl = '';
      let canonicalUrl = '';
      let redirectCount = '';
      let issue = '';
      if (!href || href === '#' || /^javascript:/i.test(href)) issue = 'empty_or_fake_navigation';
      else if (MALFORMED_INTERNAL_RE.test(href) || /\\/.test(href) || /\s/.test(href)) issue = 'malformed_internal_href';
      else if (INTERNAL_DEV_RE.test(href)) issue = 'development_or_staging_url';
      else if (resolved?.isInternal) {
        finalUrl = resolved.canonicalAbsoluteUrl;
        canonicalUrl = resolved.canonicalAbsoluteUrl;
        const fragment = resolved.url.hash.slice(1);
        if (fragment && !(await targetIds(resolved.normalizedPath)).has(decodeURIComponent(fragment))) issue = 'broken_fragment';
        else if (!(await fileExists(resolved.normalizedPath))) issue = 'broken_internal_link_404';
        else if (/^http:/i.test(href)) issue = 'internal_http_url';
        else if (resolved.url.hostname !== new URL(canonicalOrigin).hostname) issue = 'wrong_internal_hostname';
        else if (CUSTOM_REWRITES[resolved.normalizedPath]) issue = 'legacy_calendar_path';
        status = issue ? 'FAIL' : '200_LOCAL';
        redirectCount = '0';
      } else if (href) status = resolved ? 'EXTERNAL_OR_SKIPPED' : 'INVALID_URI';
      if (issue) failures.push(`${relPath}|${href}|${issue}`);
      rows.push([relPath, text, href, resolved?.absoluteUrl || '', status, finalUrl, redirectCount, canonicalUrl, issue, sourceLabel(relPath), anchor]);
    }
  }
  await writeCsv({
    path: report,
    headers: ['source_url', 'anchor_text', 'raw_href', 'resolved_url', 'status_code', 'final_url', 'redirect_count', 'canonical_url', 'issue', 'root_cause', 'anchor_markup'],
    rows
  });
  console.log(`internal-link inventory: ${rows.length} anchors, ${failures.length} issue(s); report=${report}`);
  for (const failure of failures.slice(0, 40)) console.error(`- ${failure}`);
  if (failures.length) process.exit(1);
};

main().catch((error) => { console.error(`qa-internal-links failed: ${error.message}`); process.exit(1); });
