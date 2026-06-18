import fs from 'node:fs/promises';
import path from 'node:path';
import { readSitemapTree } from './lib/sitemap-utils.mjs';

const ROOT = process.cwd();
const ROOT_SITEMAP = 'sitemap.xml';
const PAGES_SITEMAP = 'pages-sitemap.xml';
const BLOG_SITEMAP = 'blog-sitemap.xml';
const VIDEO_SITEMAP = 'video-sitemap.xml';
const NEAR_TOWN_CONFIG = path.join('near', 'town-config.json');
const PAGE_VIDEO_HUB_PATHS = new Set([
  '/bjj-videos',
  '/videos/kids',
  '/videos/teens',
  '/videos/adults',
  '/videos/breakfalls',
  '/videos/takedowns',
  '/videos/guard-passing',
  '/videos/escapes',
  '/videos/submissions',
  '/videos/self-defense',
]);
const REQUIRED_INDEXABLE_PATHS = ['/waiver', '/blog/confidence-protocol'];
const ROBOTS_PATH = 'robots.txt';
const HTACCESS_PATH = '.htaccess';
const CSV_DUPLICATES = path.join('ubersuggest', 'duplicate_title_tags.csv');
const CSV_SHORT = path.join('ubersuggest', 'title_tag_too_short.csv');
const CSV_URL_NON_FRIENDLY = path.join('ubersuggest', 'seo_non_friendly_url.csv');
const CSV_URL_CHARACTERS = path.join('ubersuggest', 'seo_friendly_url_characters_check.csv');
const MAX_TITLE_LENGTH = 65;
const MIN_META_DESCRIPTION_LENGTH = 140;
const MAX_META_DESCRIPTION_LENGTH = 155;
const URL_HEURISTIC_EXCEPTIONS = new Map([
  [
    'https://senseisandy.com/teen-jiu-jitsu-tannersville-ny',
    'Keyworded teen lane URL intentionally retained as the canonical program slug.'
  ],
  [
    'https://senseisandy.com/bjj-videos',
    'Keyworded BJJ videos hub URL intentionally retained as the canonical video-library slug.'
  ]
]);

const errors = [];
const notes = [];
const acceptedExceptions = [];

const normalizeUrl = (rawUrl, canonicalOrigin) => {
  const url = new URL(rawUrl.trim());
  let pathname = url.pathname || '/';
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  return `${canonicalOrigin}${pathname}`;
};

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
};

const fileExists = async (relPath) => {
  try {
    await fs.access(path.join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
};

const resolveUrlToFile = async (urlString) => {
  const url = new URL(urlString);
  const pathname = normalizePathname(url.pathname);
  const slug = pathname.replace(/^\/+/, '');
  const candidates = [];

  if (pathname === '/') {
    candidates.push('index.html');
  } else {
    candidates.push(`${slug}.html`);
    candidates.push(path.join(slug, 'index.html'));
    if (slug.endsWith('.html')) candidates.push(slug);
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  throw new Error(`No local file found for URL ${urlString} (tried: ${candidates.join(', ')})`);
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

const extractMetaNameContents = (html, name) => {
  const values = [];
  const target = String(name || '').toLowerCase();
  const metaRegex = /<meta\b[^>]*>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = parseHtmlAttrs(match[0]);
    if ((attrs.name || '').toLowerCase() !== target) continue;
    values.push((attrs.content || '').trim());
  }
  return values;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\/.+/i.test(String(value || '').trim());

const extractJsonLdObjects = (html, relFile, pageUrl) => {
  const objects = [];
  const scriptRegex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const rawJson = (match[1] || '').trim();
    if (!rawJson) continue;
    try {
      const parsed = JSON.parse(rawJson);
      objects.push(parsed);
    } catch {
      errors.push(`${pageUrl} (${relFile}): invalid JSON-LD payload.`);
    }
  }
  return objects;
};

const collectPrimaryImageUrls = (value, acc = []) => {
  if (!value || typeof value !== 'object') return acc;
  if (Array.isArray(value)) {
    for (const item of value) collectPrimaryImageUrls(item, acc);
    return acc;
  }
  if (value.primaryImageOfPage && typeof value.primaryImageOfPage === 'object') {
    const primaryImageUrl = String(value.primaryImageOfPage.url || '').trim();
    if (primaryImageUrl) acc.push(primaryImageUrl);
  }
  for (const nested of Object.values(value)) {
    collectPrimaryImageUrls(nested, acc);
  }
  return acc;
};

const extractMetaDirectives = (html, name) => {
  const directives = [];
  const metaRegex = /<meta\b[^>]*>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = parseHtmlAttrs(match[0]);
    if ((attrs.name || '').toLowerCase() !== name) continue;
    const content = (attrs.content || '').toLowerCase();
    if (!content) continue;
    directives.push(...content.split(',').map((token) => token.trim()).filter(Boolean));
  }
  return directives;
};

const extractTitle = (html) => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return '';
  return match[1].replace(/\s+/g, ' ').trim();
};

const hasDirective = (tokens, token) => tokens.includes(token);

const isNoindex = (tokens) => hasDirective(tokens, 'noindex') || hasDirective(tokens, 'none');

const parseCsv = (input) => {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"') {
      if (inQuotes && input[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
      continue;
    }
    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = '';
      continue;
    }
    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
};

const readCsvRows = async (relPath) => {
  if (!(await fileExists(relPath))) {
    notes.push(`CSV not found (skipped): ${relPath}`);
    return null;
  }

  const raw = await fs.readFile(path.join(ROOT, relPath), 'utf8');
  const rows = parseCsv(raw);
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());

  return rows.slice(1).map((cells) => {
    const out = {};
    headers.forEach((header, index) => {
      out[header] = (cells[index] || '').trim();
    });
    return out;
  });
};

const getCsvUrl = (row) => row.url || row['url'] || row['url '];

const classifyUrlHeuristicFlag = ({ csvName, url }) => {
  const reason = URL_HEURISTIC_EXCEPTIONS.get(url);
  if (reason) {
    acceptedExceptions.push(`${csvName}: ${url} (${reason})`);
    return;
  }
  errors.push(`${csvName}: ${url} is still flagged for URL format/keyword heuristic.`);
};

const VIDEO_HUB_SLUGS = new Set([
  'index',
  'kids',
  'teens',
  'adults',
  'breakfalls',
  'takedowns',
  'guard-passing',
  'escapes',
  'submissions',
  'self-defense'
]);

const listVideoWatchFiles = async () => {
  const videosDir = path.join(ROOT, 'videos');
  const entries = await fs.readdir(videosDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .filter((name) => !VIDEO_HUB_SLUGS.has(name.replace(/\.html$/, '')))
    .sort();
};

const loadLiveNearCanonicalPaths = async () => {
  const raw = await fs.readFile(path.join(ROOT, NEAR_TOWN_CONFIG), 'utf8');
  const towns = JSON.parse(raw);
  if (!Array.isArray(towns)) {
    throw new Error(`${NEAR_TOWN_CONFIG} must be an array.`);
  }

  const paths = new Set();
  for (const town of towns) {
    const status = String(town?.status || '').trim().toLowerCase();
    const slug = String(town?.slug || '').trim();
    if (status !== 'live' || !slug) continue;
    paths.add(`/near/${slug}`);
  }

  return [...paths].sort();
};

const main = async () => {
  const [contract, legacy, liveNearCanonicalPaths, htaccessText, videoWatchFiles] = await Promise.all([
    fs.readFile(path.join(ROOT, 'config', 'url-contract.json'), 'utf8').then((raw) => JSON.parse(raw)),
    fs.readFile(path.join(ROOT, 'config', 'legacy-redirects.json'), 'utf8').then((raw) => JSON.parse(raw)),
    loadLiveNearCanonicalPaths(),
    fs.readFile(path.join(ROOT, HTACCESS_PATH), 'utf8'),
    listVideoWatchFiles()
  ]);
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  const canonicalHost = String(contract.canonicalHost || '').toLowerCase().trim();
  const pathPolicy = String(contract.pathPolicy || '').trim();
  const trailingSlashAllowlist = new Set(
    Array.isArray(contract.trailingSlashAllowlist) ? contract.trailingSlashAllowlist.map((item) => String(item || '').trim()) : []
  );
  const legacyRedirects = legacy && typeof legacy.redirects === 'object' ? legacy.redirects : {};
  const legacyRedirectSources = new Set(Object.keys(legacyRedirects));

  if (!canonicalOrigin || !canonicalHost) {
    throw new Error('config/url-contract.json must define canonicalOrigin and canonicalHost.');
  }

  const REQUIRED_ROBOTS_SITEMAPS = [`Sitemap: ${canonicalOrigin}/sitemap.xml`];

  const robotsRaw = await fs.readFile(path.join(ROOT, ROBOTS_PATH), 'utf8');
  const robotsText = robotsRaw.replace(/\r/g, '');
  if (!/User-agent:\s*\*/i.test(robotsText)) {
    errors.push('robots.txt must include "User-agent: *".');
  }
  if (!/Allow:\s*\/(?:\n|$)/i.test(robotsText)) {
    errors.push('robots.txt must include "Allow: /".');
  }
  for (const sitemapLine of REQUIRED_ROBOTS_SITEMAPS) {
    if (!robotsText.includes(sitemapLine)) {
      errors.push(`robots.txt is missing required sitemap line: ${sitemapLine}`);
    }
  }
  if (/^\s*Disallow:\s*\/\s*$/im.test(robotsText)) {
    errors.push('robots.txt must not contain "Disallow: /".');
  }

  const sitemapTree = await readSitemapTree({
    rootDir: ROOT,
    sitemapPath: ROOT_SITEMAP,
    canonicalOrigin
  });
  const { sitemapToUrls, urlToSitemaps } = sitemapTree;
  const urls = new Set();
  const urlOwnership = new Map();

  if (!sitemapToUrls.has(PAGES_SITEMAP)) {
    errors.push(`${ROOT_SITEMAP}: missing required child sitemap "${PAGES_SITEMAP}".`);
  }
  if (!sitemapToUrls.has(BLOG_SITEMAP)) {
    errors.push(`${ROOT_SITEMAP}: missing required child sitemap "${BLOG_SITEMAP}".`);
  }
  if (!sitemapToUrls.has(VIDEO_SITEMAP)) {
    errors.push(`${ROOT_SITEMAP}: missing required child sitemap "${VIDEO_SITEMAP}".`);
  }

  for (const [rawUrl, sourceSet] of urlToSitemaps.entries()) {
    const sourceList = [...sourceSet];
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      errors.push(`${sourceList.join(', ')}: invalid <loc> URL "${rawUrl}".`);
      continue;
    }

    if (parsed.protocol !== 'https:') {
      errors.push(`${sourceList.join(', ')}: URL must use https: ${rawUrl}`);
    }
    if (parsed.hostname.toLowerCase() !== canonicalHost) {
      errors.push(`${sourceList.join(', ')}: URL must use canonical host ${canonicalHost}: ${rawUrl}`);
    }
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      errors.push(`${sourceList.join(', ')}: URL must not end with trailing slash: ${rawUrl}`);
    }

    const normalizedSitemapPath = normalizePathname(parsed.pathname || '/');
    if (legacyRedirectSources.has(normalizedSitemapPath)) {
      errors.push(`${sourceList.join(', ')}: URL points to legacy redirect source: ${rawUrl}`);
    }

    const normalizedUrl = normalizeUrl(rawUrl, canonicalOrigin);
    urls.add(normalizedUrl);

    if (!urlOwnership.has(normalizedUrl)) urlOwnership.set(normalizedUrl, new Set());
    for (const source of sourceList) {
      urlOwnership.get(normalizedUrl).add(source);
    }
  }

  for (const [normalizedUrl, sourceSet] of urlOwnership.entries()) {
    if (sourceSet.size > 1) {
      errors.push(
        `Sitemap ownership conflict for ${normalizedUrl}: listed in ${[...sourceSet].join(', ')}.`
      );
    }
  }

  const videoUrls = sitemapToUrls.get(VIDEO_SITEMAP) || [];
  for (const rawUrl of videoUrls) {
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      continue;
    }
    const normalizedPath = normalizePathname(parsed.pathname || '/');
    if (!normalizedPath.startsWith('/videos/')) {
      errors.push(`${VIDEO_SITEMAP}: URL must be a /videos/ watch page: ${rawUrl}`);
    }
  }

  const pageUrls = new Set();
  for (const rawUrl of sitemapToUrls.get(PAGES_SITEMAP) || []) {
    try {
      const parsed = new URL(rawUrl);
      const normalizedPath = normalizePathname(parsed.pathname || '/');
      if (normalizedPath === '/blog' || normalizedPath.startsWith('/blog/')) {
        errors.push(`${PAGES_SITEMAP}: blog URLs must not be listed: ${rawUrl}`);
      }
      if (normalizedPath.startsWith('/videos/') && !PAGE_VIDEO_HUB_PATHS.has(normalizedPath)) {
        errors.push(`${PAGES_SITEMAP}: video watch pages must not be listed: ${rawUrl}`);
      }
      pageUrls.add(normalizeUrl(rawUrl, canonicalOrigin));
    } catch {
      errors.push(`${PAGES_SITEMAP}: invalid <loc> URL "${rawUrl}".`);
    }
  }

  for (const requiredPath of liveNearCanonicalPaths) {
    const requiredUrl = `${canonicalOrigin}${requiredPath}`;
    if (!pageUrls.has(requiredUrl)) {
      errors.push(`${PAGES_SITEMAP}: required canonical town URL missing: ${requiredUrl}`);
    }
  }

  const blogUrls = sitemapToUrls.get(BLOG_SITEMAP) || [];
  const blogUrlSet = new Set();
  for (const rawUrl of blogUrls) {
    try {
      const parsed = new URL(rawUrl);
      const normalizedPath = normalizePathname(parsed.pathname || '/');
      if (!(normalizedPath === '/blog' || normalizedPath.startsWith('/blog/'))) {
        errors.push(`${BLOG_SITEMAP}: URL must be a /blog/ page: ${rawUrl}`);
      }
      blogUrlSet.add(normalizeUrl(rawUrl, canonicalOrigin));
    } catch {
      errors.push(`${BLOG_SITEMAP}: invalid <loc> URL "${rawUrl}".`);
    }
  }

  const videoUrlSet = new Set();
  for (const rawUrl of videoUrls) {
    try {
      videoUrlSet.add(normalizeUrl(rawUrl, canonicalOrigin));
    } catch {
      errors.push(`${VIDEO_SITEMAP}: invalid <loc> URL "${rawUrl}".`);
    }
  }
  for (const url of videoUrlSet) {
    if (pageUrls.has(url)) {
      errors.push(`${PAGES_SITEMAP} and ${VIDEO_SITEMAP} both include ${url}.`);
    }
    if (blogUrlSet.has(url)) {
      errors.push(`${BLOG_SITEMAP} and ${VIDEO_SITEMAP} both include ${url}.`);
    }
  }
  for (const url of blogUrlSet) {
    if (pageUrls.has(url)) {
      errors.push(`${PAGES_SITEMAP} and ${BLOG_SITEMAP} both include ${url}.`);
    }
  }

  const urlToFile = new Map();
  const urlToTitle = new Map();
  const titleToUrls = new Map();

  for (const url of urls) {
    const relFile = await resolveUrlToFile(url);
    const html = await fs.readFile(path.join(ROOT, relFile), 'utf8');
    const title = extractTitle(html);
    const titleLength = title.length;
    const metaDescriptions = extractMetaNameContents(html, 'description');
    const canonicalHrefs = extractCanonicalHrefs(html);
    const ogUrls = extractMetaProperties(html, 'og:url');
    const ogImages = extractMetaProperties(html, 'og:image');
    const canonicalHref = canonicalHrefs[0] || '';
    const ogUrl = ogUrls[0] || '';
    const ogImage = ogImages[0] || '';

    if (!title) {
      errors.push(`${url} (${relFile}): missing <title>.`);
    } else if (titleLength < 30) {
      errors.push(`${url} (${relFile}): title too short (${titleLength} chars) -> "${title}".`);
    } else if (titleLength > MAX_TITLE_LENGTH) {
      errors.push(`${url} (${relFile}): title too long (${titleLength} chars) -> "${title}".`);
    }
    if (metaDescriptions.length !== 1) {
      errors.push(`${url} (${relFile}): must contain exactly one meta description; found ${metaDescriptions.length}.`);
    } else {
      const metaDescription = metaDescriptions[0];
      const metaDescriptionLength = metaDescription.length;
      if (!metaDescription) {
        errors.push(`${url} (${relFile}): meta description must be non-empty.`);
      } else if (
        metaDescriptionLength < MIN_META_DESCRIPTION_LENGTH
        || metaDescriptionLength > MAX_META_DESCRIPTION_LENGTH
      ) {
        errors.push(
          `${url} (${relFile}): meta description length out of range (${metaDescriptionLength} chars; expected ${MIN_META_DESCRIPTION_LENGTH}-${MAX_META_DESCRIPTION_LENGTH}) -> "${metaDescription}".`
        );
      }
    }

    const robots = extractMetaDirectives(html, 'robots');
    const googlebot = extractMetaDirectives(html, 'googlebot');
    if (isNoindex(robots)) errors.push(`${url} (${relFile}): robots meta contains noindex/none.`);
    if (isNoindex(googlebot)) errors.push(`${url} (${relFile}): googlebot meta contains noindex/none.`);
    if (canonicalHrefs.length === 0) {
      errors.push(`${url} (${relFile}): missing canonical link.`);
    } else if (canonicalHrefs.length > 1) {
      errors.push(
        `${url} (${relFile}): must contain exactly one canonical link; found ${canonicalHrefs.length}.`
      );
    }
    if (canonicalHref && !isAbsoluteHttpUrl(canonicalHref)) {
      errors.push(`${url} (${relFile}): canonical link must be absolute http(s): "${canonicalHref}".`);
    } else if (canonicalHref) {
      try {
        const canonicalUrl = new URL(canonicalHref);
        const canonicalPath = normalizePathname(canonicalUrl.pathname || '/');
        if (canonicalUrl.protocol !== 'https:') {
          errors.push(`${url} (${relFile}): canonical must use https: "${canonicalHref}".`);
        }
        if (canonicalUrl.hostname.toLowerCase() !== canonicalHost) {
          errors.push(`${url} (${relFile}): canonical must use host ${canonicalHost}: "${canonicalHref}".`);
        }
        if (
          pathPolicy === 'no_trailing_slash_except_root'
          && canonicalUrl.pathname.length > 1
          && canonicalUrl.pathname.endsWith('/')
          && !trailingSlashAllowlist.has(canonicalUrl.pathname)
          && !trailingSlashAllowlist.has(canonicalPath)
        ) {
          errors.push(`${url} (${relFile}): canonical must not end with trailing slash: "${canonicalHref}".`);
        }
        if (legacyRedirectSources.has(canonicalPath)) {
          const target = legacyRedirects[canonicalPath] || '';
          errors.push(
            `${url} (${relFile}): canonical points to legacy redirect source "${canonicalPath}"` +
            (target ? ` (expected ${target}).` : '.')
          );
        }
      } catch {
        errors.push(`${url} (${relFile}): canonical is not a valid URL: "${canonicalHref}".`);
      }
    }

    if (ogUrls.length === 0) {
      errors.push(`${url} (${relFile}): missing og:url.`);
    } else if (ogUrls.length > 1) {
      errors.push(`${url} (${relFile}): must contain exactly one og:url; found ${ogUrls.length}.`);
    }
    if (ogUrl && !isAbsoluteHttpUrl(ogUrl)) {
      errors.push(`${url} (${relFile}): og:url must be absolute http(s): "${ogUrl}".`);
    }

    if (ogImages.length === 0) {
      errors.push(`${url} (${relFile}): missing og:image.`);
    } else if (ogImages.length > 1) {
      errors.push(`${url} (${relFile}): must contain exactly one og:image; found ${ogImages.length}.`);
    }
    if (ogImage && !isAbsoluteHttpUrl(ogImage)) {
      errors.push(`${url} (${relFile}): og:image must be absolute http(s): "${ogImage}".`);
    }

    if (canonicalHref && ogUrl && canonicalHref !== ogUrl) {
      errors.push(
        `${url} (${relFile}): og:url must match canonical exactly. canonical="${canonicalHref}" og:url="${ogUrl}".`
      );
    }

    const normalizedPagePath = normalizePathname(new URL(url).pathname || '/');
    if (liveNearCanonicalPaths.includes(normalizedPagePath)) {
      if (canonicalHref !== url) {
        errors.push(
          `${url} (${relFile}): canonical must self-reference exactly for required near page. canonical="${canonicalHref}".`
        );
      }
    }

    const jsonLdObjects = extractJsonLdObjects(html, relFile, url);
    const primaryImageUrls = jsonLdObjects.flatMap((obj) => collectPrimaryImageUrls(obj));
    for (const primaryImageUrl of primaryImageUrls) {
      if (!isAbsoluteHttpUrl(primaryImageUrl)) {
        errors.push(
          `${url} (${relFile}): JSON-LD primaryImageOfPage.url must be absolute http(s): "${primaryImageUrl}".`
        );
      }
    }

    urlToFile.set(url, relFile);
    urlToTitle.set(url, title);
    if (title) {
      const bucket = titleToUrls.get(title) || [];
      bucket.push(url);
      titleToUrls.set(title, bucket);
    }
  }

  for (const [title, titleUrls] of titleToUrls.entries()) {
    if (titleUrls.length > 1) {
      errors.push(`Duplicate title "${title}" across: ${titleUrls.join(', ')}`);
    }
  }

  for (const requiredPath of REQUIRED_INDEXABLE_PATHS) {
    const requiredUrl = `https://senseisandy.com${requiredPath}`;
    const relFile = await resolveUrlToFile(requiredUrl);
    const html = await fs.readFile(path.join(ROOT, relFile), 'utf8');
    const robots = extractMetaDirectives(html, 'robots');
    const googlebot = extractMetaDirectives(html, 'googlebot');

    if (isNoindex(robots) || isNoindex(googlebot)) {
      errors.push(`${requiredUrl} (${relFile}): required route is noindexed.`);
    }

    if (!hasDirective(robots, 'index') || !hasDirective(robots, 'follow')) {
      errors.push(`${requiredUrl} (${relFile}): robots meta must explicitly be index, follow.`);
    }
    if (!hasDirective(googlebot, 'index') || !hasDirective(googlebot, 'follow')) {
      errors.push(`${requiredUrl} (${relFile}): googlebot meta must explicitly be index, follow.`);
    }
  }

  const duplicateRows = await readCsvRows(CSV_DUPLICATES);
  if (duplicateRows) {
    for (const row of duplicateRows) {
      const rawUrl = row.url || row['url'] || row['url '];
      if (!rawUrl) continue;
      const url = normalizeUrl(rawUrl, canonicalOrigin);
      if (!urls.has(url)) continue;
      const title = urlToTitle.get(url);
      const duplicateCount = (titleToUrls.get(title) || []).length;
      if (duplicateCount > 1) {
        errors.push(`${url}: still flagged by duplicate_title_tags.csv and title remains duplicated.`);
      }
    }
  }

  const shortRows = await readCsvRows(CSV_SHORT);
  if (shortRows) {
    for (const row of shortRows) {
      const rawUrl = getCsvUrl(row);
      if (!rawUrl) continue;
      const url = normalizeUrl(rawUrl, canonicalOrigin);
      if (!urls.has(url)) continue;
      const title = urlToTitle.get(url) || '';
      if (title.length < 30) {
        errors.push(`${url}: still flagged by title_tag_too_short.csv (${title.length} chars).`);
      }
    }
  }

  const urlNonFriendlyRows = await readCsvRows(CSV_URL_NON_FRIENDLY);
  if (urlNonFriendlyRows) {
    for (const row of urlNonFriendlyRows) {
      const rawUrl = getCsvUrl(row);
      if (!rawUrl) continue;
      const url = normalizeUrl(rawUrl, canonicalOrigin);
      if (!urls.has(url)) continue;
      classifyUrlHeuristicFlag({ csvName: 'seo_non_friendly_url.csv', url });
    }
  }

  const urlCharactersRows = await readCsvRows(CSV_URL_CHARACTERS);
  if (urlCharactersRows) {
    for (const row of urlCharactersRows) {
      const rawUrl = getCsvUrl(row);
      if (!rawUrl) continue;
      const url = normalizeUrl(rawUrl, canonicalOrigin);
      if (!urls.has(url)) continue;
      classifyUrlHeuristicFlag({ csvName: 'seo_friendly_url_characters_check.csv', url });
    }
  }

  if (
    !htaccessText.includes('RewriteRule ^videos/([a-z0-9-]+)\\.html$ https://senseisandy.com/videos/$1 [L,R=301,NE,NC]')
  ) {
    errors.push(`${HTACCESS_PATH}: missing 301 rule from /videos/<slug>.html to clean /videos/<slug>.`);
  }
  if (
    !htaccessText.includes('RewriteCond %{DOCUMENT_ROOT}/videos/$1.html -f')
    || !htaccessText.includes('RewriteRule ^videos/([a-z0-9-]+)/?$ /videos/$1.html [L,NC]')
  ) {
    errors.push(`${HTACCESS_PATH}: missing file-gated internal rewrite from clean /videos/<slug> to /videos/<slug>.html.`);
  }
  if (/NOINDEX_PARAMS/i.test(htaccessText)) {
    errors.push(`${HTACCESS_PATH}: query-parameter NOINDEX_PARAMS behavior must not be present.`);
  }
  if (
    /SetEnvIfNoCase\s+Query_String[\s\S]*\b(utm_source|utm_medium|utm_campaign|utm_term|utm_content|gclid|fbclid|msclkid|src|ref|loc)\b/i.test(htaccessText)
    && /X-Robots-Tag\s+"noindex,\s*follow"\s+env=NOINDEX_PARAMS/i.test(htaccessText)
  ) {
    errors.push(`${HTACCESS_PATH}: tracked query strings must not trigger X-Robots-Tag noindex headers.`);
  }

  const sampledWatchFiles = videoWatchFiles.slice(0, 12);
  for (const fileName of sampledWatchFiles) {
    const relFile = path.join('videos', fileName);
    const html = await fs.readFile(path.join(ROOT, relFile), 'utf8');
    const canonicalHrefs = extractCanonicalHrefs(html);
    const robots = extractMetaDirectives(html, 'robots');
    const googlebot = extractMetaDirectives(html, 'googlebot');
    const slug = fileName.replace(/\.html$/, '');
    const expectedCanonical = `https://senseisandy.com/videos/${slug}`;

    if (canonicalHrefs.length !== 1 || canonicalHrefs[0] !== expectedCanonical) {
      errors.push(`${relFile}: canonical must self-reference clean URL ${expectedCanonical}.`);
    }
    if (isNoindex(robots) || isNoindex(googlebot)) {
      errors.push(`${relFile}: watch page must not be noindex.`);
    }
    if (!hasDirective(robots, 'index') || !hasDirective(robots, 'follow')) {
      errors.push(`${relFile}: robots meta must explicitly be index, follow.`);
    }
  }

  if (notes.length) {
    for (const note of notes) console.log(`NOTE: ${note}`);
  }
  if (acceptedExceptions.length) {
    for (const accepted of acceptedExceptions) console.log(`SEO QA ACCEPTED_EXCEPTION: ${accepted}`);
  }

  if (errors.length) {
    for (const error of errors) console.error(`SEO QA FAIL: ${error}`);
    process.exit(1);
  }

  console.log(`SEO QA passed for ${urls.size} sitemap URLs.`);
};

main().catch((error) => {
  console.error(`SEO QA failed: ${error.message}`);
  process.exit(1);
});
