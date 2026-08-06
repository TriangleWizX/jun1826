import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { readSitemapTree } from './lib/sitemap-utils.mjs';
import { readHtmlWithSsi } from './url-qa-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT_REAL = await fs.realpath(ROOT);
const DEFAULT_BUDGET_KB = 50;
const DEFAULT_TOP = 12;
const ISSUE_SAMPLES_PER_TYPE = 3;
const BASELINE_DEBT_TYPES = new Set([
  'css_payload_budget_exceeded',
  'unfingerprinted_stylesheet_reference',
  'unmeasured_external_stylesheet'
]);
const HASHED_ASSET_RE = /\.[0-9a-f]{6}\.css$/i;
const MANIFEST_PATH = 'assets/data/asset-hash-manifest.json';
const URL_CONTRACT_PATH = 'config/url-contract.json';
const BOOTSTRAP_VENDOR_PATH = 'tools/vendor/bootstrap-5.3.3.min.css';
const LOCAL_ICON_DIR = 'assets/icons/bootstrap';
const LOCAL_ICON_STYLESHEET = '/assets/css/bootstrap-icons-local.css';
const BOOTSTRAP_533_RE = /^https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.3\/dist\/css\/bootstrap(?:\.min)?\.css$/i;

const parseArgs = () => {
  const args = process.argv.slice(2);
  let budgetKb = DEFAULT_BUDGET_KB;
  let budgetEnabled = true;
  let reportOnly = false;
  let top = DEFAULT_TOP;
  let sitemapPath = 'sitemap.xml';

  for (const arg of args) {
    if (arg === '--report-only') {
      reportOnly = true;
      continue;
    }
    if (arg === '--no-budget') {
      budgetEnabled = false;
      continue;
    }
    if (arg.startsWith('--budget-kb=')) {
      const rawBudget = arg.slice('--budget-kb='.length);
      if (!rawBudget) throw new Error('--budget-kb requires a value greater than zero.');
      budgetKb = Number(rawBudget);
      budgetEnabled = true;
      continue;
    }
    if (arg.startsWith('--top=')) {
      top = Number(arg.slice('--top='.length));
      continue;
    }
    if (arg.startsWith('--sitemap=')) {
      sitemapPath = arg.slice('--sitemap='.length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(budgetKb) || budgetKb <= 0) {
    throw new Error('--budget-kb must be a number greater than zero; use --no-budget to disable it.');
  }
  if (!Number.isInteger(top) || top < 1) {
    throw new Error('--top must be a positive integer.');
  }

  return {
    budgetBytes: budgetEnabled ? Math.ceil(budgetKb * 1024) : null,
    budgetEnabled,
    budgetKb,
    reportOnly,
    sitemapPath,
    top
  };
};

const readJson = async (relPath) => {
  const fullPath = path.resolve(ROOT, ...String(relPath).split('/'));
  if (!isPathInside(ROOT, fullPath) || !await fileExists(fullPath)) {
    throw new Error(`JSON input is missing or outside the QA root: ${relPath}`);
  }
  const value = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(value);
};

const isPathInside = (base, candidate) => {
  const relative = path.relative(base, candidate);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

const fileExists = async (fullPath) => {
  try {
    const resolved = path.resolve(fullPath);
    if (!isPathInside(ROOT, resolved)) return false;
    const linkStat = await fs.lstat(resolved);
    if (linkStat.isSymbolicLink() || !linkStat.isFile()) return false;
    const real = await fs.realpath(resolved);
    if (!isPathInside(ROOT_REAL, real)) return false;
    return true;
  } catch {
    return false;
  }
};

const md5Prefix = (buffer) => createHash('md5').update(buffer).digest('hex').slice(0, 6);
const gzipBytes = (buffer) => gzipSync(buffer, { level: 9 }).length;
const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const isPlainStringMap = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null)
    && Object.values(value).every((entry) => typeof entry === 'string');
};

const inlineStyleGzipBytes = (html) => {
  const activeHtml = maskInactiveHtml(html);
  const blocks = [...activeHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1]);
  const css = blocks.join('\n');
  return css ? gzipBytes(Buffer.from(css, 'utf8')) : 0;
};

const getAttribute = (tag, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const quoted = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  if (quoted) return quoted[2];
  const unquoted = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*([^\\s>]+)`, 'i'));
  return unquoted ? unquoted[1] : '';
};

const decodeHtmlAttribute = (value) => String(value || '')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'");

const maskText = (value) => value.replace(/[^\r\n]/g, ' ');
const maskInactiveHtml = (html) => {
  let masked = html.replace(/<!--[\s\S]*?(?:-->|$)/g, (match) => maskText(match));
  masked = masked.replace(/<noscript\b[^>]*>[\s\S]*?(?:<\/noscript\s*>|$)/gi, (match) => maskText(match));
  masked = masked.replace(/<template\b[^>]*>[\s\S]*?(?:<\/template\s*>|$)/gi, (match) => maskText(match));
  masked = masked.replace(/<script\b[^>]*>[\s\S]*?(?:<\/script\s*>|$)/gi, (match) => maskText(match));
  return masked;
};

const maskCssComments = (css) => css.replace(/\/\*[\s\S]*?(?:\*\/|$)/g, (match) => maskText(match));
const collectCssReferences = (css) => {
  const masked = maskCssComments(css);
  const refs = [];
  const urlRe = /(url\(\s*)(?:"([^"]*)"|'([^']*)'|([^)]*?))(\s*\))/gi;
  let match;
  while ((match = urlRe.exec(masked))) {
    const prefix = match[1];
    const quote = match[2] !== undefined ? '"' : match[3] !== undefined ? "'" : '';
    const value = match[2] ?? match[3] ?? match[4].trim();
    const closing = match[5];
    refs.push({
      end: match.index + match[0].length,
      render: (next) => `${prefix}${quote}${next}${quote}${closing}`,
      start: match.index,
      value
    });
  }
  const importRe = /(@import\s*)(["'])([^"']*)\2/gi;
  while ((match = importRe.exec(masked))) {
    const prefix = match[1];
    const quote = match[2];
    refs.push({
      end: match.index + match[0].length,
      render: (next) => `${prefix}${quote}${next}${quote}`,
      start: match.index,
      value: match[3]
    });
  }
  return refs.sort((a, b) => a.start - b.start);
};

const transformCss = (css, replacer) => {
  const refs = collectCssReferences(css);
  let cursor = 0;
  let out = '';
  for (const ref of refs) {
    if (ref.start < cursor) continue;
    out += css.slice(cursor, ref.start);
    const next = replacer(ref);
    out += next === null ? css.slice(ref.start, ref.end) : ref.render(next);
    cursor = ref.end;
  }
  return out + css.slice(cursor);
};

const splitUrlSuffix = (value) => {
  const suffixIndex = value.search(/[?#]/);
  return suffixIndex < 0
    ? { pathname: value, suffix: '' }
    : { pathname: value.slice(0, suffixIndex), suffix: value.slice(suffixIndex) };
};

const resolveLocalCssUrl = (value, ownerRelPath) => {
  const ref = String(value || '').trim();
  if (
    !ref
    || ref.startsWith('#')
    || ref.startsWith('//')
    || /^[a-z][a-z0-9+.-]*:/i.test(ref)
    || /^var\(/i.test(ref)
  ) return null;

  let { pathname } = splitUrlSuffix(ref);
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    return { error: 'invalid URL encoding', ref };
  }

  if (!pathname || pathname.includes('\0') || pathname.includes('\\')) {
    return { error: 'invalid local path', ref };
  }

  const relPath = pathname.startsWith('/')
    ? path.posix.normalize(pathname.replace(/^\/+/, ''))
    : path.posix.normalize(path.posix.join(path.posix.dirname(ownerRelPath), pathname));
  if (!relPath || relPath === '.' || relPath === '..' || relPath.startsWith('../') || path.posix.isAbsolute(relPath)) {
    return { error: 'path escapes the site root', ref };
  }
  const fullPath = path.resolve(ROOT, ...relPath.split('/'));
  if (!isPathInside(ROOT, fullPath)) return { error: 'path escapes the site root', ref };
  return { fullPath, ref, relPath };
};

const replacementReference = (original, ownerRelPath, targetManifestPath) => {
  const trimmed = original.trim();
  const { pathname, suffix } = splitUrlSuffix(trimmed);
  const targetRelPath = targetManifestPath.replace(/^\/+/, '');
  let nextPath;
  if (pathname.startsWith('/')) {
    nextPath = `/${targetRelPath}`;
  } else {
    nextPath = path.posix.relative(path.posix.dirname(ownerRelPath), targetRelPath);
    if (pathname.startsWith('./') && !nextPath.startsWith('.')) nextPath = `./${nextPath}`;
  }
  return `${nextPath}${suffix}`;
};

const reconstructManifestCss = (css, sourceRelPath, manifest, targetToSource) => transformCss(
  css,
  (ref) => {
    const local = resolveLocalCssUrl(ref.value, sourceRelPath);
    if (!local || local.error) return null;
    const localKey = `/${local.relPath}`;
    let sourceKey = manifest[localKey] ? localKey : targetToSource.get(localKey);
    if (!sourceKey) {
      const unhashedKey = localKey.replace(/\.[0-9a-f]{6}(\.[^./]+)$/i, '$1');
      if (manifest[unhashedKey]) sourceKey = unhashedKey;
    }
    const target = sourceKey ? manifest[sourceKey] : null;
    return target ? replacementReference(ref.value, sourceRelPath, target) : null;
  }
);

const validateTargetCssUrls = async (css, targetRelPath, targetManifestPath) => {
  const issues = [];
  const inspected = new Set();
  for (const ref of collectCssReferences(css)) {
    const value = ref.value;
    const local = resolveLocalCssUrl(value, targetRelPath);
    if (!local) continue;
    if (local.error) {
      issues.push({
        type: 'manifest_css_local_url_missing',
        detail: `${targetManifestPath} url(${value}) ${local.error}`
      });
      continue;
    }
    if (inspected.has(local.relPath)) continue;
    inspected.add(local.relPath);
    if (await fileExists(local.fullPath)) continue;
    issues.push({
      type: 'manifest_css_local_url_missing',
      detail: `${targetManifestPath} url(${value}) -> /${local.relPath}`
    });
  }
  return issues;
};

const parseActiveStylesheets = (html) => {
  const links = [];
  const activeHtml = maskInactiveHtml(html);

  for (const match of activeHtml.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = getAttribute(tag, 'rel').toLowerCase().split(/\s+/).filter(Boolean);
    const as = getAttribute(tag, 'as').toLowerCase();
    const href = decodeHtmlAttribute(getAttribute(tag, 'href').trim());
    const isStylesheet = rel.includes('stylesheet');
    const isAsyncStylesheet = rel.includes('preload') && as === 'style';
    if (!href || (!isStylesheet && !isAsyncStylesheet)) continue;
    links.push({ href, tag });
  }

  return links;
};

const parseBootstrapIconNames = (html) => {
  const names = new Set();
  const activeHtml = maskInactiveHtml(html);
  for (const match of activeHtml.matchAll(/\bclass\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    for (const token of match[2].split(/\s+/)) {
      if (/^bi-[a-z0-9-]+$/i.test(token)) names.add(token.slice(3).toLowerCase());
    }
  }
  return names;
};

const routeToHtmlPath = async (absoluteUrl) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(absoluteUrl).pathname);
  } catch {
    return null;
  }
  if (pathname.includes('\0') || pathname.includes('\\')) return null;
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const normalized = path.posix.normalize(clean || '.');
  if (normalized === '..' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) return null;
  const candidates = clean
    ? pathname.endsWith('.html')
      ? [normalized]
      : [`${normalized}/index.html`, `${normalized}.html`]
    : ['index.html'];

  for (const candidate of candidates) {
    const fullPath = path.resolve(ROOT, ...candidate.split('/'));
    if (!isPathInside(ROOT, fullPath)) continue;
    if (await fileExists(fullPath)) return candidate;
  }

  return null;
};

const stylesheetFamilyKey = (href) => {
  const withoutQuery = href.replace(/[?#].*$/, '');
  if (/\/bootstrap@5\.3\.3\/dist\/css\/bootstrap(?:\.min)?\.css$/i.test(withoutQuery)) {
    return 'bootstrap@5.3.3';
  }
  if (/\/bootstrap-icons@1\.11\.3\/font\/bootstrap-icons(?:\.min)?\.css$/i.test(withoutQuery)) {
    return 'bootstrap-icons@1.11.3';
  }
  return href;
};

const normalizeStylesheet = (href, pageUrl, canonicalOrigin) => {
  let parsed;
  try {
    parsed = new URL(href, pageUrl);
  } catch {
    return { error: 'invalid_stylesheet_url', href };
  }

  parsed.hash = '';
  const canonical = new URL(canonicalOrigin);
  if (parsed.origin !== canonical.origin) {
    return {
      external: true,
      familyKey: stylesheetFamilyKey(parsed.href),
      href: parsed.href,
      key: parsed.href
    };
  }

  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(parsed.pathname);
  } catch {
    return { error: 'invalid_stylesheet_url', href };
  }
  if (decodedPathname.includes('\0') || decodedPathname.includes('\\')) {
    return { error: 'invalid_stylesheet_url', href };
  }
  const relPath = path.posix.normalize(decodedPathname.replace(/^\/+/, ''));
  if (!relPath || relPath === '.' || relPath === '..' || relPath.startsWith('../') || path.posix.isAbsolute(relPath)) {
    return { error: 'invalid_stylesheet_url', href };
  }
  const fullPath = path.resolve(ROOT, ...relPath.split('/'));
  if (!isPathInside(ROOT, fullPath)) return { error: 'invalid_stylesheet_url', href };
  return {
    external: false,
    familyKey: stylesheetFamilyKey(`${parsed.pathname}${parsed.search}`),
    href: parsed.href,
    key: `${parsed.pathname}${parsed.search}`,
    relPath
  };
};

const buildManifestState = async () => {
  const manifestDocument = await readJson(MANIFEST_PATH);
  if (!isPlainStringMap(manifestDocument?.assets)) {
    throw new Error(`${MANIFEST_PATH} assets must be a plain object with string values.`);
  }

  const manifest = manifestDocument.assets;
  const byTarget = new Map();
  const targetToSource = new Map(Object.entries(manifest).map(([source, target]) => [target, source]));
  const issues = [];

  for (const [source, target] of Object.entries(manifest)) {
    const sourceMatch = source.match(/^(\/.+)(\.[^/]+)$/);
    const targetMatch = target.match(/^(\/.+)\.([0-9a-f]{6})(\.[^/]+)$/i);
    const sourceSegments = source.slice(1).split('/');
    const targetSegments = target.slice(1).split('/');
    const sourceIsSafe = sourceMatch
      && sourceSegments.every((segment) => segment && segment !== '.' && segment !== '..')
      && !source.includes('\\') && !source.includes('\0');
    const targetIsSafe = targetMatch
      && targetSegments.every((segment) => segment && segment !== '.' && segment !== '..')
      && !target.includes('\\') && !target.includes('\0');
    const sameFamily = sourceIsSafe
      && targetIsSafe
      && targetMatch[1] === sourceMatch[1]
      && targetMatch[3] === sourceMatch[2];
    const isCss = Boolean(sourceMatch && sourceMatch[2].toLowerCase() === '.css');

    if (!sameFamily) {
      issues.push({
        type: isCss ? 'manifest_css_family_mismatch' : 'manifest_asset_family_mismatch',
        detail: `${source} -> ${target}; expected /x.ext -> /x.<6hex>.ext in the same path family`
      });
      continue;
    }

    if (isCss) byTarget.set(target, source);
    const sourceRel = source.replace(/^\/+/, '');
    const targetRel = target.replace(/^\/+/, '');
    const sourcePath = path.resolve(ROOT, ...sourceRel.split('/'));
    const targetPath = path.resolve(ROOT, ...targetRel.split('/'));
    if (!isPathInside(ROOT, sourcePath) || !isPathInside(ROOT, targetPath)) {
      issues.push({
        type: 'manifest_css_family_mismatch',
        detail: `${source} -> ${target}; resolved path escapes the site root`
      });
      continue;
    }
    const [sourceExists, targetExists] = await Promise.all([
      fileExists(sourcePath),
      fileExists(targetPath)
    ]);

    if (!sourceExists || !targetExists) {
      issues.push({
        type: 'manifest_file_missing',
        detail: `${source} -> ${target}`
      });
      continue;
    }

    const [sourceBytes, targetBytes] = await Promise.all([
      fs.readFile(sourcePath),
      fs.readFile(targetPath)
    ]);
    const expectedHash = md5Prefix(targetBytes);
    const filenameHash = targetMatch[2].toLowerCase();
    if (isCss) {
      const sourceCss = sourceBytes.toString('utf8');
      const targetCss = targetBytes.toString('utf8');
      const expectedTargetCss = reconstructManifestCss(sourceCss, sourceRel, manifest, targetToSource);
      if (!Buffer.from(expectedTargetCss, 'utf8').equals(targetBytes)) {
        issues.push({
          type: 'manifest_content_drift',
          detail: `${target} does not equal the exact manifest-driven transform of ${source}`
        });
      }
      issues.push(...await validateTargetCssUrls(targetCss, targetRel, target));
    } else if (!sourceBytes.equals(targetBytes)) {
      issues.push({
        type: 'manifest_content_drift',
        detail: `${target} differs from canonical leaf source ${source}`
      });
    }
    if (!filenameHash || filenameHash !== expectedHash) {
      issues.push({
        type: 'manifest_hash_drift',
        detail: `${target} should use .${expectedHash}.css`
      });
    }
  }

  return { byTarget, issues, manifest };
};

const hasActiveManifestStylesheet = (normalizedLinks, manifestState, source) => (
  normalizedLinks.some((link) => {
    if (link.error || link.external) return false;
    const activePath = `/${link.relPath}`;
    return activePath === source || manifestState.byTarget.get(activePath) === source;
  })
);

const externalStylesheetBytes = async (href, bootstrapBytes) => {
  const normalized = href.replace(/[?#].*$/, '');
  if (BOOTSTRAP_533_RE.test(normalized)) return bootstrapBytes;
  return null;
};

const parseCssImports = (css) => {
  const imports = [];
  const importRe = /@import\s+(?:url\(\s*)?(?:["']([^"']+)["']|([^"')\s;]+))\s*\)?[^;]*;/gi;
  for (const match of css.matchAll(importRe)) imports.push(match[1] || match[2]);
  return imports;
};

const measureLocalStylesheet = async ({
  assetKey,
  canonicalOrigin,
  issues,
  manifestState,
  missingType,
  pageUrl,
  relPath,
  sizeCache,
  unknownExternal,
  visited
}) => {
  if (visited.has(assetKey)) return 0;
  visited.add(assetKey);

  const fullPath = path.join(ROOT, relPath);
  if (!await fileExists(fullPath)) {
    issues.push({ type: missingType, route: pageUrl, detail: `/${relPath}` });
    return 0;
  }

  const manifestKey = `/${relPath}`;
  if (HASHED_ASSET_RE.test(relPath)) {
    if (!manifestState.byTarget.has(manifestKey)) {
      issues.push({
        type: 'hashed_stylesheet_not_manifest_current',
        route: pageUrl,
        detail: manifestKey
      });
    }
  } else {
    issues.push({
      type: 'unfingerprinted_stylesheet_reference',
      route: pageUrl,
      detail: manifestState.manifest[manifestKey]
        ? `${manifestKey} should reference ${manifestState.manifest[manifestKey]}`
        : `${manifestKey} is not represented by a current manifest target`
    });
  }

  if (!sizeCache.has(relPath)) {
    const buffer = await fs.readFile(fullPath);
    sizeCache.set(relPath, {
      gzip: gzipBytes(buffer),
      imports: parseCssImports(buffer.toString('utf8'))
    });
  }

  const cached = sizeCache.get(relPath);
  let total = cached.gzip;
  const cssBaseUrl = new URL(`/${relPath}`, canonicalOrigin).href;

  for (const importHref of cached.imports) {
    if (/^data:/i.test(importHref)) continue;
    const imported = normalizeStylesheet(importHref, cssBaseUrl, canonicalOrigin);
    if (imported.error) {
      issues.push({ type: imported.error, route: pageUrl, detail: importHref });
      continue;
    }
    if (imported.external) {
      unknownExternal.add(imported.href);
      continue;
    }
    total += await measureLocalStylesheet({
      assetKey: imported.key,
      canonicalOrigin,
      issues,
      manifestState,
      missingType: 'local_imported_stylesheet_missing',
      pageUrl,
      relPath: imported.relPath,
      sizeCache,
      unknownExternal,
      visited
    });
  }

  return total;
};

const main = async () => {
  const options = parseArgs();
  const contract = await readJson(URL_CONTRACT_PATH);
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  if (!canonicalOrigin) throw new Error(`${URL_CONTRACT_PATH} is missing canonicalOrigin.`);

  const [{ urls }, manifestState, bootstrapBuffer, localIconEntries] = await Promise.all([
    readSitemapTree({ rootDir: ROOT, sitemapPath: options.sitemapPath, canonicalOrigin }),
    buildManifestState(),
    fs.readFile(path.join(ROOT, BOOTSTRAP_VENDOR_PATH)),
    fs.readdir(path.join(ROOT, LOCAL_ICON_DIR))
  ]);

  const bootstrapBytes = gzipBytes(bootstrapBuffer);
  const localIcons = new Set(
    localIconEntries.filter((name) => name.endsWith('.svg')).map((name) => name.slice(0, -4))
  );
  const issues = [...manifestState.issues];
  const routeResults = [];
  const sizeCache = new Map();

  for (const pageUrl of [...urls].sort()) {
    const relPath = await routeToHtmlPath(pageUrl);
    if (!relPath) {
      issues.push({ type: 'sitemap_html_missing', route: pageUrl, detail: pageUrl });
      continue;
    }

    let html;
    try {
      html = await readHtmlWithSsi(relPath, { root: ROOT, strict: true });
    } catch (error) {
      issues.push({
        type: 'ssi_expansion_failed',
        route: pageUrl,
        detail: `${relPath}: ${error.message}`
      });
      continue;
    }

    const parsedLinks = parseActiveStylesheets(html);
    const iconNames = parseBootstrapIconNames(html);
    for (const iconName of iconNames) {
      if (localIcons.has(iconName)) continue;
      issues.push({
        type: 'local_icon_svg_missing',
        route: pageUrl,
        detail: `${LOCAL_ICON_DIR}/${iconName}.svg`
      });
    }
    const normalizedLinks = parsedLinks.map(({ href }) => normalizeStylesheet(href, pageUrl, canonicalOrigin));
    if (iconNames.size && !hasActiveManifestStylesheet(
      normalizedLinks,
      manifestState,
      LOCAL_ICON_STYLESHEET
    )) {
      issues.push({
        type: 'local_icon_stylesheet_missing',
        route: pageUrl,
        detail: `${LOCAL_ICON_STYLESHEET} is required for ${iconNames.size} local bi-* icon(s)`
      });
    }
    const groups = new Map();
    const families = new Map();
    let localGzip = inlineStyleGzipBytes(html);
    let knownExternalGzip = 0;
    const unknownExternal = new Set();
    const visitedLocalStylesheets = new Set();

    for (const link of normalizedLinks) {
      if (link.error) {
        issues.push({ type: link.error, route: pageUrl, detail: link.href });
        continue;
      }
      const group = groups.get(link.key) || [];
      group.push(link);
      groups.set(link.key, group);
      const family = families.get(link.familyKey) || [];
      family.push(link);
      families.set(link.familyKey, family);
    }

    for (const [familyKey, family] of families) {
      if (family.length < 2) continue;
      issues.push({
        type: 'duplicate_runtime_stylesheet',
        route: pageUrl,
        detail: `${familyKey} (${family.length} references after SSI)`
      });
    }

    for (const group of groups.values()) {
      const link = group[0];
      if (link.external) {
        const bytes = await externalStylesheetBytes(link.href, bootstrapBytes);
        if (bytes === null) unknownExternal.add(link.href);
        else knownExternalGzip += bytes;
        continue;
      }

      localGzip += await measureLocalStylesheet({
        assetKey: link.key,
        canonicalOrigin,
        issues,
        manifestState,
        missingType: 'local_stylesheet_missing',
        pageUrl,
        relPath: link.relPath,
        sizeCache,
        unknownExternal,
        visited: visitedLocalStylesheets
      });
    }

    for (const href of unknownExternal) {
      issues.push({
        type: 'unmeasured_external_stylesheet',
        route: pageUrl,
        detail: href
      });
    }

    const measuredGzip = localGzip + knownExternalGzip;
    if (options.budgetEnabled && measuredGzip > options.budgetBytes) {
      issues.push({
        type: 'css_payload_budget_exceeded',
        route: pageUrl,
        detail: `${formatKb(measuredGzip)} measured > ${formatKb(options.budgetBytes)} budget`
      });
    }

    routeResults.push({
      pageUrl,
      relPath,
      localGzip,
      knownExternalGzip,
      measuredGzip,
      unknownExternal: [...unknownExternal].sort()
    });
  }

  routeResults.sort((a, b) => b.measuredGzip - a.measuredGzip || a.pageUrl.localeCompare(b.pageUrl));
  const issueCounts = new Map();
  for (const issue of issues) issueCounts.set(issue.type, (issueCounts.get(issue.type) || 0) + 1);

  console.log(`qa-css-assets inspected ${routeResults.length}/${urls.size} sitemapped route(s).`);
  console.log(options.budgetEnabled
    ? `Measured budget: ${options.budgetKb} KB gzip per route (local CSS + vendored Bootstrap equivalent).`
    : 'Measured CSS budget disabled for this diagnostic run.');
  console.log('Largest measured CSS payloads:');
  for (const result of routeResults.slice(0, options.top)) {
    const unknown = result.unknownExternal.length
      ? `; ${result.unknownExternal.length} unmeasured external stylesheet(s)`
      : '';
    console.log(
      `- ${formatKb(result.measuredGzip)} (${formatKb(result.localGzip)} local + ` +
      `${formatKb(result.knownExternalGzip)} known external) ${result.pageUrl}${unknown}`
    );
  }

  if (issueCounts.size) {
    console.error('CSS asset issues:');
    for (const [type, count] of [...issueCounts].sort()) {
      console.error(`- ${type}: ${count}`);
      const samples = issues
        .filter((issue) => issue.type === type)
        .slice(0, ISSUE_SAMPLES_PER_TYPE);
      for (const issue of samples) {
        console.error(`  ${issue.type}${issue.route ? ` | ${issue.route}` : ''} | ${issue.detail}`);
      }
      if (count > samples.length) {
        console.error(`  ... ${count - samples.length} more ${type} issue(s)`);
      }
    }
  }

  const hardIssues = issues.filter((issue) => !BASELINE_DEBT_TYPES.has(issue.type));
  if (hardIssues.length) {
    console.error(`qa-css-assets failed with ${hardIssues.length} hard issue(s).`);
    process.exit(1);
  }
  if (issues.length && !options.reportOnly) process.exit(1);
  if (issues.length) {
    console.log(
      `qa-css-assets baseline completed with ${issues.length} known debt issue(s); ` +
      'hard correctness checks passed.'
    );
  } else {
    console.log('qa-css-assets passed.');
  }
};

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
