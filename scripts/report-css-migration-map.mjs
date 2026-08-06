import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { readSitemapTree } from './lib/sitemap-utils.mjs';
import { readHtmlWithSsi } from './url-qa-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_PATH = 'scripts/report-css-migration-map.mjs';
const URL_CONTRACT_PATH = 'config/url-contract.json';
const MANIFEST_PATH = 'assets/data/asset-hash-manifest.json';
const SITEMAP_PATHS = ['pages-sitemap.xml', 'blog-sitemap.xml'];
const PROTECTED_OUTPUT_PATHS = new Set([
  SCRIPT_PATH,
  URL_CONTRACT_PATH,
  MANIFEST_PATH,
  ...SITEMAP_PATHS
]);
const HASHED_CSS_RE = /\.([0-9a-f]{6})(?=\.css$)/i;
const PAGE_CLASS_RE = /(?:^|-)page(?:-|$)/i;

const USAGE = `Usage: node ${SCRIPT_PATH} [--output=<workspace-relative path>]

Build a deterministic JSON map of the CSS used by routes in pages-sitemap.xml
and blog-sitemap.xml. Without --output, JSON is written to stdout.`;

const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const gzipBytes = (buffer) => gzipSync(buffer, { level: 9 }).length;
const toPosix = (value) => String(value || '').replace(/\\/g, '/');

const isPathInside = (root, candidate) => {
  const relative = path.relative(root, candidate);
  return relative === '' || (
    relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative)
  );
};

const normalizeOutputPath = (rawValue) => {
  const value = String(rawValue || '').trim();
  if (!value) throw new Error('--output requires a non-empty workspace-relative path.');
  if (value.includes('\0')) throw new Error('--output cannot contain a NUL byte.');
  if (path.isAbsolute(value) || path.win32.isAbsolute(value)) {
    throw new Error('--output must be workspace-relative, not absolute.');
  }

  const normalized = path.posix.normalize(toPosix(value));
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new Error('--output must resolve to a file inside the workspace.');
  }
  if (normalized.split('/')[0] === '.git') {
    throw new Error('--output cannot write inside .git.');
  }
  if (PROTECTED_OUTPUT_PATHS.has(normalized)) {
    throw new Error(`--output cannot overwrite report input/source file: ${normalized}`);
  }

  const absolutePath = path.resolve(ROOT, ...normalized.split('/'));
  if (!isPathInside(ROOT, absolutePath)) {
    throw new Error('--output must resolve to a file inside the workspace.');
  }

  return { absolutePath, relativePath: normalized };
};

const parseArgs = (args = process.argv.slice(2)) => {
  let output = null;
  let help = false;

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      help = true;
      continue;
    }
    if (arg.startsWith('--output=')) {
      if (output) throw new Error('--output may only be provided once.');
      output = normalizeOutputPath(arg.slice('--output='.length));
      continue;
    }
    if (arg === '--output') {
      throw new Error('--output requires the form --output=<workspace-relative path>.');
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (help && args.length > 1) throw new Error('--help cannot be combined with other arguments.');
  return { help, output };
};

const ensureSafeOutputTarget = async ({ absolutePath }) => {
  const realRoot = await fs.realpath(ROOT);
  let ancestor = path.dirname(absolutePath);

  while (true) {
    try {
      const realAncestor = await fs.realpath(ancestor);
      if (!isPathInside(realRoot, realAncestor)) {
        throw new Error('--output resolves through a directory outside the workspace.');
      }
      break;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      ancestor = parent;
    }
  }

  try {
    const stat = await fs.lstat(absolutePath);
    if (stat.isSymbolicLink()) throw new Error('--output cannot overwrite a symbolic link.');
    if (!stat.isFile()) throw new Error('--output must target a file, not a directory or special file.');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
};

const readJson = async (relPath) => {
  const raw = await fs.readFile(path.join(ROOT, relPath), 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${relPath} is not valid JSON: ${error.message}`, { cause: error });
  }
};

const isPlainStringMap = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return (prototype === Object.prototype || prototype === null)
    && Object.values(value).every((entry) => typeof entry === 'string');
};

const buildManifestState = async () => {
  const document = await readJson(MANIFEST_PATH);
  if (!isPlainStringMap(document?.assets)) {
    throw new Error(`${MANIFEST_PATH} assets must be a plain object with string values.`);
  }

  const sourceToTarget = new Map();
  const targetToSource = new Map();
  for (const [source, target] of Object.entries(document.assets).sort(([a], [b]) => compareText(a, b))) {
    if (!/\.css$/i.test(source) && !/\.css$/i.test(target)) continue;
    sourceToTarget.set(source, target);
    targetToSource.set(target, source);
  }

  return { sourceToTarget, targetToSource };
};

const getManifestReference = (assetPath, manifestState) => {
  if (manifestState.sourceToTarget.has(assetPath)) {
    return {
      status: 'source',
      source: assetPath,
      currentTarget: manifestState.sourceToTarget.get(assetPath)
    };
  }
  if (manifestState.targetToSource.has(assetPath)) {
    return {
      status: 'current_target',
      source: manifestState.targetToSource.get(assetPath),
      currentTarget: assetPath
    };
  }

  const possibleSource = assetPath.replace(HASHED_CSS_RE, '');
  if (possibleSource !== assetPath && manifestState.sourceToTarget.has(possibleSource)) {
    return {
      status: 'stale_target',
      source: possibleSource,
      currentTarget: manifestState.sourceToTarget.get(possibleSource)
    };
  }

  return { status: 'untracked', source: null, currentTarget: null };
};

const fileExists = async (fullPath) => {
  try {
    const stat = await fs.stat(fullPath);
    return stat.isFile();
  } catch {
    return false;
  }
};

const routeToHtmlPath = async (absoluteUrl) => {
  const parsed = new URL(absoluteUrl);
  let pathname;
  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    return null;
  }
  if (pathname.includes('\0') || pathname.includes('\\')) return null;

  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const normalized = path.posix.normalize(clean || '.');
  if (normalized === '..' || normalized.startsWith('../')) return null;

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

const decodeMarkupValue = (value) => String(value || '')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&apos;|&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&#x([0-9a-f]+);/gi, (match, hex) => {
    const codePoint = Number.parseInt(hex, 16);
    return Number.isSafeInteger(codePoint) && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : match;
  })
  .replace(/&#([0-9]+);/g, (match, decimal) => {
    const codePoint = Number.parseInt(decimal, 10);
    return Number.isSafeInteger(codePoint) && codePoint <= 0x10ffff
      ? String.fromCodePoint(codePoint)
      : match;
  });

const parseTagAttributes = (tag, tagName) => {
  const attributes = new Map();
  const source = String(tag || '')
    .replace(new RegExp(`^<${tagName}\\b`, 'i'), '')
    .replace(/\/?\s*>$/, '');
  const attributeRe = /([^\s"'=<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = attributeRe.exec(source)) !== null) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attributes.set(name, decodeMarkupValue(value));
  }
  return attributes;
};

const stripInactiveHtml = (html) => String(html || '')
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
  .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, ' ');

const parseActiveStylesheets = (activeHtml) => {
  const links = [];
  for (const match of activeHtml.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseTagAttributes(match[0], 'link');
    if (attributes.has('disabled')) continue;
    const rel = String(attributes.get('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const as = String(attributes.get('as') || '').toLowerCase();
    const href = String(attributes.get('href') || '').trim();
    const isStylesheet = rel.includes('stylesheet');
    const isAsyncStylesheet = rel.includes('preload') && as === 'style';
    if (!href || (!isStylesheet && !isAsyncStylesheet)) continue;
    links.push({ href, order: links.length });
  }
  return links;
};

const measureInlineStyles = (activeHtml) => {
  const blocks = [...activeHtml.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1]);
  const buffer = Buffer.from(blocks.join('\n'), 'utf8');
  return {
    blockCount: blocks.length,
    rawBytes: buffer.length,
    gzipBytes: buffer.length ? gzipBytes(buffer) : 0
  };
};

const escapeCssIdentifier = (value) => String(value || '').replace(
  /[^a-zA-Z0-9_-]/g,
  (character) => `\\${character.codePointAt(0).toString(16)} `
);

const escapeCssString = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/"/g, '\\"');

const parseBodyHints = (activeHtml) => {
  const match = activeHtml.match(/<body\b[^>]*>/i);
  if (!match) return { bodyClasses: [], bodyPageClasses: [], selectorHints: [] };

  const attributes = parseTagAttributes(match[0], 'body');
  const bodyClasses = [...new Set(
    String(attributes.get('class') || '').split(/\s+/).filter(Boolean)
  )].sort(compareText);
  const bodyPageClasses = bodyClasses.filter((name) => PAGE_CLASS_RE.test(name));
  const selectorHints = new Set(bodyClasses.map((name) => `body.${escapeCssIdentifier(name)}`));

  const id = String(attributes.get('id') || '').trim();
  if (id) selectorHints.add(`body#${escapeCssIdentifier(id)}`);
  for (const name of ['data-audience', 'data-layout', 'data-page', 'data-template']) {
    const value = String(attributes.get(name) || '').trim();
    if (value) selectorHints.add(`body[${name}="${escapeCssString(value)}"]`);
  }

  return {
    bodyClasses,
    bodyPageClasses,
    selectorHints: [...selectorHints].sort(compareText)
  };
};

const stylesheetFamilyKey = (href, { local }) => {
  const withoutQuery = href.replace(/[?#].*$/, '');
  if (/\/bootstrap@5\.3\.3\/dist\/css\/bootstrap(?:\.min)?\.css$/i.test(withoutQuery)) {
    return 'bootstrap@5.3.3';
  }
  if (/\/bootstrap-icons@1\.11\.3\/font\/bootstrap-icons(?:\.min)?\.css$/i.test(withoutQuery)) {
    return 'bootstrap-icons@1.11.3';
  }

  if (!local) return withoutQuery.replace(/\.min(?=\.css$)/i, '');
  return withoutQuery
    .replace(HASHED_CSS_RE, '')
    .replace(/\.min(?=\.css$)/i, '');
};

const normalizeLocalStylesheetPath = (pathname) => {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new Error('stylesheet URL pathname contains invalid percent encoding');
  }
  if (decoded.includes('\0') || decoded.includes('\\')) {
    throw new Error('stylesheet URL pathname contains an unsafe character');
  }

  const withoutLeadingSlash = decoded.replace(/^\/+/, '');
  const normalized = path.posix.normalize(withoutLeadingSlash || '.');
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new Error('stylesheet URL does not resolve to a workspace file');
  }

  const fullPath = path.resolve(ROOT, ...normalized.split('/'));
  if (!isPathInside(ROOT, fullPath)) {
    throw new Error('stylesheet URL resolves outside the workspace');
  }
  return normalized;
};

const normalizeStylesheet = (href, baseUrl, canonicalOrigin) => {
  let parsed;
  try {
    parsed = new URL(href, baseUrl);
  } catch {
    return { error: 'invalid_stylesheet_url' };
  }
  parsed.hash = '';

  const canonical = new URL(canonicalOrigin);
  if (parsed.origin !== canonical.origin) {
    const resolvedHref = parsed.href;
    return {
      asset: resolvedHref,
      external: true,
      family: stylesheetFamilyKey(resolvedHref, { local: false }),
      resolvedHref,
      absoluteHref: resolvedHref
    };
  }

  let relPath;
  try {
    relPath = normalizeLocalStylesheetPath(parsed.pathname);
  } catch (error) {
    return { error: 'invalid_local_stylesheet_path', detail: error.message };
  }

  const asset = `/${relPath}`;
  const resolvedHref = `${parsed.pathname}${parsed.search}`;
  return {
    asset,
    external: false,
    family: stylesheetFamilyKey(asset, { local: true }),
    relPath,
    resolvedHref,
    absoluteHref: parsed.href
  };
};

const parseCssImports = (css) => {
  const withoutComments = String(css || '').replace(/\/\*[\s\S]*?\*\//g, ' ');
  const imports = [];
  const importRe = /@import\s+(?:url\(\s*)?(?:["']([^"']+)["']|([^"')\s;]+))\s*\)?[^;]*;/gi;
  let match;
  while ((match = importRe.exec(withoutComments)) !== null) {
    imports.push(match[1] || match[2]);
  }
  return imports;
};

const stableObjectFromCounts = (counts) => {
  const result = {};
  for (const [key, count] of [...counts].sort(([a], [b]) => compareText(a, b))) {
    result[key] = count;
  }
  return result;
};

const decodeSitemapLoc = (value) => decodeMarkupValue(value).trim();

const loadRouteInventory = async (canonicalOrigin) => {
  const trees = await Promise.all(SITEMAP_PATHS.map(async (sitemapPath) => ({
    sitemapPath,
    tree: await readSitemapTree({ rootDir: ROOT, sitemapPath, canonicalOrigin })
  })));
  const canonical = new URL(canonicalOrigin);
  const routes = new Map();
  const sitemapRouteCounts = {};

  for (const { sitemapPath, tree } of trees) {
    const urls = [...tree.urls].map(decodeSitemapLoc).sort(compareText);
    sitemapRouteCounts[sitemapPath] = urls.length;
    for (const sitemapUrl of urls) {
      let parsed;
      try {
        parsed = new URL(sitemapUrl);
      } catch {
        throw new Error(`${sitemapPath} contains an invalid route URL: ${sitemapUrl}`);
      }
      parsed.hash = '';
      if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) {
        throw new Error(
          `${sitemapPath} route must use canonical origin ${canonical.origin}: ${sitemapUrl}`
        );
      }

      const route = `${parsed.pathname || '/'}${parsed.search}`;
      const normalizedUrl = parsed.href;
      const existing = routes.get(route);
      if (existing && existing.url !== normalizedUrl) {
        throw new Error(`Multiple sitemap URLs normalize to route ${route}.`);
      }
      if (existing) {
        existing.sitemaps.add(sitemapPath);
      } else {
        routes.set(route, { route, url: normalizedUrl, sitemaps: new Set([sitemapPath]) });
      }
    }
  }

  return {
    routes: [...routes.values()]
      .map((entry) => ({ ...entry, sitemaps: [...entry.sitemaps].sort(compareText) }))
      .sort((a, b) => compareText(a.route, b.route)),
    sitemapRouteCounts
  };
};

const normalizeErrorPath = (value) => {
  if (!value) return null;
  const raw = String(value);
  const absolute = path.resolve(raw);
  return isPathInside(ROOT, absolute) ? toPosix(path.relative(ROOT, absolute)) : raw;
};

const ssiFailureRef = (error, sourceHtml) => ({
  type: 'ssi_expansion_failed',
  sourceHtml,
  reason: error?.reason || error?.code || 'unknown',
  target: normalizeErrorPath(error?.target),
  includeChain: Array.isArray(error?.includeChain)
    ? error.includeChain.map(normalizeErrorPath)
    : [],
  message: error?.message || String(error)
});

const createEmptyRouteResult = (entry) => ({
  route: entry.route,
  url: entry.url,
  sitemaps: entry.sitemaps,
  status: 'pending',
  sourceHtml: null,
  stylesheets: {
    local: [],
    external: [],
    stylesheetSet: []
  },
  inlineStyle: { blockCount: 0, rawBytes: 0, gzipBytes: 0 },
  localCss: { assetCount: 0, rawBytes: 0, gzipBytes: 0 },
  bodyClasses: [],
  bodyPageClasses: [],
  selectorHints: [],
  duplicateFamilies: [],
  missingRefs: [],
  bundleId: null
});

const addMissingRef = (routeContext, missingRef) => {
  const key = JSON.stringify(missingRef);
  if (routeContext.missingRefKeys.has(key)) return;
  routeContext.missingRefKeys.add(key);
  routeContext.result.missingRefs.push(missingRef);
};

const manifestFields = (manifest) => ({
  manifestStatus: manifest.status,
  manifestSource: manifest.source,
  manifestTarget: manifest.currentTarget
});

const buildReport = async () => {
  const contract = await readJson(URL_CONTRACT_PATH);
  const canonicalOrigin = String(contract.canonicalOrigin || '').trim().replace(/\/$/, '');
  if (!canonicalOrigin) throw new Error(`${URL_CONTRACT_PATH} is missing canonicalOrigin.`);
  const canonical = new URL(canonicalOrigin);
  if (!/^https?:$/.test(canonical.protocol)) {
    throw new Error(`${URL_CONTRACT_PATH} canonicalOrigin must use http or https.`);
  }

  const [{ routes: inventory, sitemapRouteCounts }, manifestState] = await Promise.all([
    loadRouteInventory(canonicalOrigin),
    buildManifestState()
  ]);

  const assetCache = new Map();
  const assetAggregates = new Map();
  const routeResults = [];

  const loadLocalAsset = async (relPath) => {
    if (!assetCache.has(relPath)) {
      assetCache.set(relPath, (async () => {
        const fullPath = path.resolve(ROOT, ...relPath.split('/'));
        try {
          const buffer = await fs.readFile(fullPath);
          return {
            exists: true,
            rawBytes: buffer.length,
            gzipBytes: gzipBytes(buffer),
            imports: parseCssImports(buffer.toString('utf8'))
          };
        } catch (error) {
          if (error?.code === 'ENOENT' || error?.code === 'EISDIR') {
            return { exists: false, rawBytes: null, gzipBytes: null, imports: [] };
          }
          throw error;
        }
      })());
    }
    return assetCache.get(relPath);
  };

  const registerAssetReference = ({ normalized, record, routeContext }) => {
    const key = `${normalized.external ? 'external' : 'local'}:${normalized.asset}`;
    if (!assetAggregates.has(key)) {
      const manifest = normalized.external
        ? { status: null, source: null, currentTarget: null }
        : getManifestReference(normalized.asset, manifestState);
      assetAggregates.set(key, {
        asset: normalized.asset,
        kind: normalized.external ? 'external' : 'local',
        family: normalized.family,
        rawBytes: normalized.external ? null : record.rawBytes,
        gzipBytes: normalized.external ? null : record.gzipBytes,
        missing: normalized.external ? null : record.exists === false,
        manifest,
        directReferences: 0,
        importReferences: 0,
        routes: new Set()
      });
    }
    const aggregate = assetAggregates.get(key);
    if (record.via === 'link') aggregate.directReferences += 1;
    else aggregate.importReferences += 1;
    aggregate.routes.add(routeContext.result.route);
    if (!normalized.external && record.exists !== null) {
      aggregate.rawBytes = record.rawBytes;
      aggregate.gzipBytes = record.gzipBytes;
      aggregate.missing = record.exists === false;
    }
  };

  const processReference = async ({ href, via, importedFrom, baseUrl, routeContext }) => {
    const normalized = normalizeStylesheet(href, baseUrl, canonicalOrigin);
    if (normalized.error) {
      addMissingRef(routeContext, {
        type: normalized.error,
        href,
        via,
        importedFrom: importedFrom || null,
        detail: normalized.detail || null
      });
      return null;
    }

    const manifest = normalized.external
      ? { status: null, source: null, currentTarget: null }
      : getManifestReference(normalized.asset, manifestState);
    const record = {
      href,
      resolvedHref: normalized.resolvedHref,
      asset: normalized.asset,
      family: normalized.family,
      via,
      importedFrom: importedFrom || null,
      exists: normalized.external ? null : true,
      rawBytes: null,
      gzipBytes: null,
      ...manifestFields(manifest)
    };

    if (normalized.external) {
      routeContext.result.stylesheets.external.push(record);
      registerAssetReference({ normalized, record, routeContext });
      return normalized;
    }

    const asset = await loadLocalAsset(normalized.relPath);
    record.exists = asset.exists;
    record.rawBytes = asset.rawBytes;
    record.gzipBytes = asset.gzipBytes;
    routeContext.result.stylesheets.local.push(record);
    registerAssetReference({ normalized, record, routeContext });

    if (!asset.exists) {
      addMissingRef(routeContext, {
        type: via === 'link' ? 'local_stylesheet_missing' : 'local_imported_stylesheet_missing',
        href,
        asset: normalized.asset,
        via,
        importedFrom: importedFrom || null
      });
      return normalized;
    }

    if (routeContext.visitedLocalAssets.has(normalized.asset)) return normalized;
    routeContext.visitedLocalAssets.add(normalized.asset);
    routeContext.result.localCss.rawBytes += asset.rawBytes;
    routeContext.result.localCss.gzipBytes += asset.gzipBytes;

    for (const importHref of asset.imports) {
      if (/^data:/i.test(importHref)) continue;
      await processReference({
        href: importHref,
        via: 'import',
        importedFrom: normalized.asset,
        baseUrl: normalized.absoluteHref,
        routeContext
      });
    }
    return normalized;
  };

  for (const entry of inventory) {
    const result = createEmptyRouteResult(entry);
    const routeContext = {
      result,
      missingRefKeys: new Set(),
      visitedLocalAssets: new Set()
    };
    const sourceHtml = await routeToHtmlPath(entry.url);
    result.sourceHtml = sourceHtml;

    if (!sourceHtml) {
      result.status = 'missing_html';
      addMissingRef(routeContext, {
        type: 'sitemap_html_missing',
        url: entry.url
      });
      routeResults.push(result);
      continue;
    }

    let html;
    try {
      html = await readHtmlWithSsi(sourceHtml, { root: ROOT, strict: true });
    } catch (error) {
      result.status = 'ssi_failed';
      addMissingRef(routeContext, ssiFailureRef(error, sourceHtml));
      routeResults.push(result);
      continue;
    }

    result.status = 'ok';
    const activeHtml = stripInactiveHtml(html);
    result.inlineStyle = measureInlineStyles(activeHtml);
    Object.assign(result, parseBodyHints(activeHtml));

    const directStylesheets = parseActiveStylesheets(activeHtml);
    const directNormalized = [];
    for (const link of directStylesheets) {
      const normalized = await processReference({
        href: link.href,
        via: 'link',
        importedFrom: null,
        baseUrl: entry.url,
        routeContext
      });
      if (normalized) directNormalized.push(normalized);
    }

    result.stylesheets.stylesheetSet = [...new Set(
      directNormalized.map((item) => item.resolvedHref)
    )].sort(compareText);
    result.localCss.assetCount = routeContext.visitedLocalAssets.size;

    const families = new Map();
    for (const normalized of directNormalized) {
      if (!families.has(normalized.family)) families.set(normalized.family, []);
      families.get(normalized.family).push(normalized.resolvedHref);
    }
    result.duplicateFamilies = [...families.entries()]
      .filter(([, references]) => references.length > 1)
      .map(([family, references]) => ({
        family,
        count: references.length,
        references: [...references].sort(compareText)
      }))
      .sort((a, b) => compareText(a.family, b.family));
    result.missingRefs.sort((a, b) => compareText(JSON.stringify(a), JSON.stringify(b)));
    routeResults.push(result);
  }

  const bundleGroups = new Map();
  for (const routeResult of routeResults) {
    const stylesheetSet = routeResult.stylesheets.stylesheetSet;
    const key = JSON.stringify(stylesheetSet);
    if (!bundleGroups.has(key)) {
      bundleGroups.set(key, {
        id: `bundle-${createHash('sha256').update(key).digest('hex').slice(0, 12)}`,
        stylesheetSet,
        routes: [],
        localAssets: new Set(),
        externalAssets: new Set(),
        bodyPageClasses: new Set(),
        selectorHints: new Set(),
        occurrenceRawBytes: 0,
        occurrenceGzipBytes: 0
      });
    }
    const bundle = bundleGroups.get(key);
    bundle.routes.push(routeResult.route);
    bundle.occurrenceRawBytes += routeResult.localCss.rawBytes;
    bundle.occurrenceGzipBytes += routeResult.localCss.gzipBytes;
    for (const record of routeResult.stylesheets.local) bundle.localAssets.add(record.asset);
    for (const record of routeResult.stylesheets.external) bundle.externalAssets.add(record.asset);
    for (const bodyClass of routeResult.bodyPageClasses) bundle.bodyPageClasses.add(bodyClass);
    for (const hint of routeResult.selectorHints) bundle.selectorHints.add(hint);
    routeResult.bundleId = bundle.id;
  }

  const getAggregateByAsset = (kind, asset) => assetAggregates.get(`${kind}:${asset}`);
  const bundles = [...bundleGroups.values()].map((bundle) => {
    const localAssets = [...bundle.localAssets].sort(compareText);
    let uniqueRawBytes = 0;
    let uniqueGzipBytes = 0;
    for (const asset of localAssets) {
      const aggregate = getAggregateByAsset('local', asset);
      if (!aggregate || aggregate.missing) continue;
      uniqueRawBytes += aggregate.rawBytes;
      uniqueGzipBytes += aggregate.gzipBytes;
    }
    return {
      id: bundle.id,
      routeCount: bundle.routes.length,
      routes: bundle.routes.sort(compareText),
      stylesheetSet: bundle.stylesheetSet,
      localAssets,
      externalAssets: [...bundle.externalAssets].sort(compareText),
      localCss: {
        uniqueRawBytes,
        uniqueGzipBytes,
        occurrenceRawBytes: bundle.occurrenceRawBytes,
        occurrenceGzipBytes: bundle.occurrenceGzipBytes
      },
      bodyPageClasses: [...bundle.bodyPageClasses].sort(compareText),
      selectorHints: [...bundle.selectorHints].sort(compareText)
    };
  }).sort((a, b) => (
    b.routeCount - a.routeCount
    || compareText(JSON.stringify(a.stylesheetSet), JSON.stringify(b.stylesheetSet))
  ));

  const assets = [...assetAggregates.values()].map((aggregate) => {
    const routeOccurrences = aggregate.routes.size;
    const referenceOccurrences = aggregate.directReferences + aggregate.importReferences;
    return {
      asset: aggregate.asset,
      kind: aggregate.kind,
      family: aggregate.family,
      routeOccurrences,
      referenceOccurrences,
      directReferences: aggregate.directReferences,
      importReferences: aggregate.importReferences,
      rawBytes: aggregate.rawBytes,
      gzipBytes: aggregate.gzipBytes,
      occurrenceRawBytes: aggregate.rawBytes === null
        ? null
        : aggregate.rawBytes * routeOccurrences,
      occurrenceGzipBytes: aggregate.gzipBytes === null
        ? null
        : aggregate.gzipBytes * routeOccurrences,
      missing: aggregate.missing,
      ...manifestFields(aggregate.manifest),
      routes: [...aggregate.routes].sort(compareText)
    };
  }).sort((a, b) => compareText(`${a.kind}:${a.asset}`, `${b.kind}:${b.asset}`));

  const routesObject = {};
  for (const result of routeResults.sort((a, b) => compareText(a.route, b.route))) {
    routesObject[result.route] = result;
  }

  const routeStatusCounts = new Map();
  const manifestStatusCounts = new Map();
  let routesWithMissingRefs = 0;
  let duplicateFamilyCount = 0;
  let inlineStyleRawBytes = 0;
  let inlineStyleGzipBytes = 0;
  let localCssOccurrenceRawBytes = 0;
  let localCssOccurrenceGzipBytes = 0;
  let uniqueLocalCssRawBytes = 0;
  let uniqueLocalCssGzipBytes = 0;

  for (const result of routeResults) {
    routeStatusCounts.set(result.status, (routeStatusCounts.get(result.status) || 0) + 1);
    if (result.missingRefs.length) routesWithMissingRefs += 1;
    duplicateFamilyCount += result.duplicateFamilies.length;
    inlineStyleRawBytes += result.inlineStyle.rawBytes;
    inlineStyleGzipBytes += result.inlineStyle.gzipBytes;
    localCssOccurrenceRawBytes += result.localCss.rawBytes;
    localCssOccurrenceGzipBytes += result.localCss.gzipBytes;
  }
  for (const asset of assets) {
    if (asset.kind !== 'local') continue;
    manifestStatusCounts.set(
      asset.manifestStatus,
      (manifestStatusCounts.get(asset.manifestStatus) || 0) + 1
    );
    if (asset.rawBytes !== null) uniqueLocalCssRawBytes += asset.rawBytes;
    if (asset.gzipBytes !== null) uniqueLocalCssGzipBytes += asset.gzipBytes;
  }

  return {
    schemaVersion: 1,
    inputs: {
      canonicalOrigin,
      sitemaps: SITEMAP_PATHS,
      strictSsi: true,
      manifest: MANIFEST_PATH
    },
    summary: {
      sitemapRouteCounts,
      sitemapEntries: Object.values(sitemapRouteCounts).reduce((sum, count) => sum + count, 0),
      uniqueRoutes: routeResults.length,
      routeStatusCounts: stableObjectFromCounts(routeStatusCounts),
      routesWithMissingRefs,
      duplicateFamilyCount,
      bundleCount: bundles.length,
      assetCount: assets.length,
      localAssetCount: assets.filter((asset) => asset.kind === 'local').length,
      externalAssetCount: assets.filter((asset) => asset.kind === 'external').length,
      manifestStatusCounts: stableObjectFromCounts(manifestStatusCounts),
      inlineStyleRawBytes,
      inlineStyleGzipBytes,
      uniqueLocalCssRawBytes,
      uniqueLocalCssGzipBytes,
      localCssOccurrenceRawBytes,
      localCssOccurrenceGzipBytes
    },
    routes: routesObject,
    bundles,
    assets
  };
};

const main = async () => {
  const options = parseArgs();
  if (options.help) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }

  const report = await buildReport();
  const json = `${JSON.stringify(report, null, 2)}\n`;
  if (!options.output) {
    process.stdout.write(json);
    return;
  }

  await ensureSafeOutputTarget(options.output);
  await fs.mkdir(path.dirname(options.output.absolutePath), { recursive: true });
  await fs.writeFile(options.output.absolutePath, json, 'utf8');
};

process.stdout.on('error', (error) => {
  if (error?.code === 'EPIPE') process.exit(0);
  throw error;
});

main().catch((error) => {
  console.error(`report-css-migration-map failed: ${error.stack || error.message || String(error)}`);
  process.exit(1);
});
