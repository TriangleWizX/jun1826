import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSitemapTree } from '../scripts/lib/sitemap-utils.mjs';
import { readHtmlWithSsi } from '../scripts/url-qa-lib.mjs';
import {
  CSS_BUNDLE_REGISTRY,
  ROOT,
  resolveWorkspacePath,
} from './css-bundle-registry.mjs';

const THIS_FILE = fileURLToPath(import.meta.url);
const TOOL_PATH = 'tools/migrate-component-bundle-routes.mjs';
const URL_CONTRACT_PATH = 'config/url-contract.json';
const ASSET_MANIFEST_PATH = 'assets/data/asset-hash-manifest.json';
const SITEMAP_PATHS = Object.freeze(['pages-sitemap.xml', 'blog-sitemap.xml']);

const LEGACY_COMPONENTS_PATH_RE =
  /^\/assets\/css\/components(?:\.min)?(?:\.[0-9a-f]{6})?\.css$/;
const BUNDLE_COMPONENTS_PATH_RE =
  /^\/assets\/css\/bundles\/components-[a-z0-9-]+(?:\.min)?(?:\.[0-9a-f]{6})?\.css$/;

const EXPECTED_ROUTE_COUNTS = Object.freeze({
  core: 5,
  home: 1,
  'glossary-hub': 2,
  'glossary-term': 141,
  schedule: 1,
  booking: 0,
  programs: 4,
  'law-enforcement': 0,
  contact: 0,
  near: 0,
  videos: 0,
  pricing: 1,
  'student-hub': 1,
});

const EXPECTED_MANAGED_ROUTES = 156;
const EXPECTED_SITEMAP_COUNTS = Object.freeze({
  'pages-sitemap.xml': 156,
  'blog-sitemap.xml': 0,
});

const SIMPLE_BODY_DISCRIMINANTS = Object.freeze([
  ['home', ['page-home']],
  ['schedule', ['page-schedule']],
  ['booking', ['page-book-intro']],
  ['programs', ['page-programs']],
  ['law-enforcement', ['page-law-enforcement']],
  ['contact', ['page-contact']],
  ['near', ['page-near']],
  ['videos', ['page-videos']],
  ['pricing', ['page-options-pricing']],
  ['student-hub', ['page-student-hub', 'ss-page-student-hub']],
]);

const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

const isPathInside = (root, candidate) => {
  const relative = path.relative(root, candidate);
  return relative === '' || (
    relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative)
  );
};

const normalizeWorkspaceRelativePath = (value, label = 'Workspace path') => {
  const input = String(value || '').trim().replace(/\\/g, '/');
  if (!input || input.includes('\0') || path.posix.isAbsolute(input)) {
    throw new Error(`${label} must be a non-empty workspace-relative path.`);
  }
  const normalized = path.posix.normalize(input);
  if (
    normalized === '.'
    || normalized === '..'
    || normalized.startsWith('../')
    || normalized !== input
  ) {
    throw new Error(`${label} must stay inside the workspace: ${value}`);
  }
  return normalized;
};

const resolveContainedWorkspacePath = (relativePath, label = 'Workspace path') => {
  const normalized = normalizeWorkspaceRelativePath(relativePath, label);
  const absolutePath = path.resolve(ROOT, ...normalized.split('/'));
  if (!isPathInside(ROOT, absolutePath)) {
    throw new Error(`${label} resolves outside the workspace: ${relativePath}`);
  }
  return { absolutePath, relativePath: normalized };
};

const assertContainedRegularFile = async (absolutePath, label, realRoot) => {
  const stat = await fs.lstat(absolutePath);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`${label} must be a regular file, not a symlink or special file.`);
  }
  const realPath = await fs.realpath(absolutePath);
  if (!isPathInside(realRoot, realPath)) {
    throw new Error(`${label} resolves outside the workspace.`);
  }
  return realPath;
};

const fileExists = async (absolutePath) => {
  try {
    const stat = await fs.lstat(absolutePath);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch (error) {
    if (error?.code === 'ENOENT' || error?.code === 'ENOTDIR') return false;
    throw error;
  }
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

const maskMatch = (value) => value.replace(/[^\r\n]/g, ' ');

const maskInactiveHtml = (html) => String(html || '')
  .replace(/<!--[\s\S]*?-->/g, maskMatch)
  .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, maskMatch)
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, maskMatch)
  .replace(/<template\b[^>]*>[\s\S]*?<\/template>/gi, maskMatch);

const parseTagAttributes = (tag, tagStart, tagName) => {
  const opening = String(tag || '').match(new RegExp(`^<${tagName}\\b`, 'i'));
  if (!opening) throw new Error(`Expected a <${tagName}> tag.`);

  const contentOffset = opening[0].length;
  const source = tag.slice(contentOffset).replace(/\/?\s*>$/, '');
  const attributes = new Map();
  const attributeRe = /([^\s"'=<>`/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attributeRe.exec(source)) !== null) {
    const name = match[1].toLowerCase();
    if (attributes.has(name)) {
      throw new Error(`<${tagName}> has duplicate ${name} attributes.`);
    }

    const groupIndex = match[2] !== undefined ? 2 : match[3] !== undefined ? 3 : match[4] !== undefined ? 4 : 0;
    const rawValue = groupIndex ? match[groupIndex] : '';
    let valueStart = null;
    let valueEnd = null;

    if (groupIndex) {
      const full = match[0];
      const equals = full.indexOf('=');
      const afterEquals = full.slice(equals + 1);
      const leadingWhitespace = afterEquals.length - afterEquals.trimStart().length;
      const quoteWidth = groupIndex === 4 ? 0 : 1;
      const offsetInMatch = equals + 1 + leadingWhitespace + quoteWidth;
      valueStart = tagStart + contentOffset + match.index + offsetInMatch;
      valueEnd = valueStart + rawValue.length;
    }

    attributes.set(name, {
      name,
      rawValue,
      value: decodeMarkupValue(rawValue),
      valueStart,
      valueEnd,
    });
  }

  return attributes;
};

const parseActiveStylesheetLinks = (html) => {
  const source = String(html || '');
  const masked = maskInactiveHtml(source);
  const links = [];

  for (const match of masked.matchAll(/<link\b[^>]*>/gi)) {
    const tagStart = match.index;
    const tagEnd = tagStart + match[0].length;
    const tag = source.slice(tagStart, tagEnd);
    const attributes = parseTagAttributes(tag, tagStart, 'link');
    if (attributes.has('disabled')) continue;

    const rel = String(attributes.get('rel')?.value || '').toLowerCase().split(/\s+/).filter(Boolean);
    const as = String(attributes.get('as')?.value || '').toLowerCase();
    const href = attributes.get('href');
    const isStylesheet = rel.includes('stylesheet');
    const isStylePreload = rel.includes('preload') && as === 'style';
    if (!href?.value || href.valueStart === null || (!isStylesheet && !isStylePreload)) continue;

    links.push({
      href: href.value.trim(),
      rawHref: source.slice(href.valueStart, href.valueEnd),
      hrefStart: href.valueStart,
      hrefEnd: href.valueEnd,
      tagStart,
      tagEnd,
    });
  }

  return links;
};

const extractBodyClasses = (html) => {
  const source = String(html || '');
  const masked = maskInactiveHtml(source);
  const matches = [...masked.matchAll(/<body\b[^>]*>/gi)];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one active <body> tag; found ${matches.length}.`);
  }

  const match = matches[0];
  const tag = source.slice(match.index, match.index + match[0].length);
  const attributes = parseTagAttributes(tag, match.index, 'body');
  return [...new Set(
    String(attributes.get('class')?.value || '').split(/\s+/).filter(Boolean)
  )].sort(compareText);
};

const classifyBodyClasses = (bodyClasses, availableBundleNames) => {
  const classes = new Set(Array.isArray(bodyClasses) ? bodyClasses : []);
  const available = availableBundleNames instanceof Set
    ? availableBundleNames
    : new Set(availableBundleNames || []);
  const candidates = new Set();

  const hasGlossaryTerm = classes.has('page-glossary-term');
  const hasGlossaryHub = classes.has('page-glossary');
  const hasGlossaryBase = classes.has('page-bjj-glossary');
  const hasAnyGlossaryMarker = hasGlossaryTerm || hasGlossaryHub || hasGlossaryBase;

  if (hasGlossaryTerm) {
    if (!hasGlossaryBase) {
      throw new Error('Glossary term marker requires exact class page-bjj-glossary.');
    }
    candidates.add('glossary-term');
  } else if (hasGlossaryHub || hasGlossaryBase) {
    if (!(hasGlossaryHub && hasGlossaryBase)) {
      throw new Error(
        'Glossary hub requires exact classes page-glossary and page-bjj-glossary.'
      );
    }
    candidates.add('glossary-hub');
  }

  for (const [bundleName, tokens] of SIMPLE_BODY_DISCRIMINANTS) {
    if (tokens.some((token) => classes.has(token))) candidates.add(bundleName);
  }

  if (candidates.size > 1) {
    throw new Error(
      `Unrelated component-bundle body discriminants: ${[...candidates].sort(compareText).join(', ')}.`
    );
  }

  const bundleName = candidates.size ? [...candidates][0] : 'core';
  if (hasAnyGlossaryMarker && bundleName === 'core') {
    throw new Error('Incomplete glossary body discriminants cannot fall back to core.');
  }
  if (!available.has(bundleName)) {
    throw new Error(`Body classifier selected bundle absent from registry: ${bundleName}.`);
  }
  return bundleName;
};

const applyHrefReplacements = (html, replacements) => {
  const source = String(html || '');
  const ordered = [...(replacements || [])].sort((left, right) => left.start - right.start);
  let cursor = 0;
  let output = '';

  for (const replacement of ordered) {
    const { start, end, oldValue, newValue } = replacement;
    if (
      !Number.isInteger(start)
      || !Number.isInteger(end)
      || start < cursor
      || end < start
      || end > source.length
    ) {
      throw new Error('Href replacement ranges must be ordered, non-overlapping, and in bounds.');
    }
    if (source.slice(start, end) !== oldValue) {
      throw new Error(`Href replacement source drift at byte range ${start}-${end}.`);
    }
    output += source.slice(cursor, start) + String(newValue);
    cursor = end;
  }

  return output + source.slice(cursor);
};

const parseArgs = (args = process.argv.slice(2)) => {
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    return { help: true, mode: null };
  }
  if (args.length !== 1 || !['--check', '--write'].includes(args[0])) {
    throw new Error(`Usage: node ${TOOL_PATH} --check|--write`);
  }
  return { help: false, mode: args[0].slice(2) };
};

const resolveRouteHtmlPath = async (absoluteUrl, realRoot) => {
  const parsed = new URL(absoluteUrl);
  if (parsed.search || parsed.hash) {
    throw new Error(`Sitemap routes with query strings or fragments are unsupported: ${absoluteUrl}`);
  }

  let pathname;
  try {
    pathname = decodeURIComponent(parsed.pathname);
  } catch {
    throw new Error(`Sitemap route has invalid percent encoding: ${absoluteUrl}`);
  }
  if (pathname.includes('\0') || pathname.includes('\\')) {
    throw new Error(`Sitemap route has an unsafe pathname: ${absoluteUrl}`);
  }

  const clean = pathname.replace(/^\/+|\/+$/g, '');
  const normalized = path.posix.normalize(clean || '.');
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`Sitemap route escapes the workspace: ${absoluteUrl}`);
  }

  const candidates = clean
    ? pathname.endsWith('.html')
      ? [normalized]
      : [`${normalized}/index.html`, `${normalized}.html`]
    : ['index.html'];
  const matches = [];

  for (const candidate of candidates) {
    const resolved = resolveContainedWorkspacePath(candidate, `HTML candidate for ${absoluteUrl}`);
    if (!await fileExists(resolved.absolutePath)) continue;
    await assertContainedRegularFile(resolved.absolutePath, candidate, realRoot);
    matches.push(resolved.relativePath);
  }

  if (matches.length !== 1) {
    throw new Error(
      `${absoluteUrl} must resolve to exactly one contained HTML file; found ${matches.length}: ${matches.join(', ')}`
    );
  }
  return matches[0];
};

const readJson = async (relativePath) => {
  const resolved = resolveContainedWorkspacePath(relativePath, relativePath);
  return JSON.parse(await fs.readFile(resolved.absolutePath, 'utf8'));
};

const loadRouteInventory = async (canonicalOrigin, realRoot) => {
  const canonical = new URL(canonicalOrigin);
  const routes = new Map();
  const sitemapRouteCounts = {};

  for (const sitemapPath of SITEMAP_PATHS) {
    const tree = await readSitemapTree({
      rootDir: ROOT,
      sitemapPath,
      canonicalOrigin,
    });
    const urls = [...tree.urls].map(decodeMarkupValue).sort(compareText);
    sitemapRouteCounts[sitemapPath] = urls.length;

    for (const absoluteUrl of urls) {
      let parsed;
      try {
        parsed = new URL(absoluteUrl);
      } catch {
        throw new Error(`${sitemapPath} contains an invalid URL: ${absoluteUrl}`);
      }
      if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) {
        throw new Error(`${sitemapPath} contains a non-canonical URL: ${absoluteUrl}`);
      }
      if (parsed.search || parsed.hash) {
        throw new Error(`${sitemapPath} contains a query string or fragment: ${absoluteUrl}`);
      }

      const route = parsed.pathname || '/';
      if (routes.has(route)) {
        throw new Error(
          `Route appears more than once across migration sitemaps: ${route} (${routes.get(route).sitemapPath}, ${sitemapPath})`
        );
      }
      const htmlPath = await resolveRouteHtmlPath(absoluteUrl, realRoot);
      routes.set(route, { absoluteUrl, htmlPath, route, sitemapPath });
    }
  }

  return {
    routes: [...routes.values()].sort((left, right) => compareText(left.route, right.route)),
    sitemapRouteCounts,
  };
};

const loadTargetAliases = async (canonicalOrigin, registry) => {
  const manifest = await readJson(ASSET_MANIFEST_PATH);
  const assets = manifest?.assets;
  if (!assets || typeof assets !== 'object' || Array.isArray(assets)) {
    throw new Error(`${ASSET_MANIFEST_PATH} must contain an assets object.`);
  }

  const correctTargets = new Map();
  const knownBundlePaths = new Map();
  const canonical = new URL(canonicalOrigin);

  const addPath = (map, rawPath, bundleName, label) => {
    const parsed = new URL(String(rawPath || ''), canonical);
    if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase() || parsed.search || parsed.hash) {
      throw new Error(`${label} must be a canonical-origin path without query or fragment: ${rawPath}`);
    }
    const existing = map.get(parsed.pathname);
    if (existing && existing !== bundleName) {
      throw new Error(`${label} collides across bundles: ${parsed.pathname}`);
    }
    map.set(parsed.pathname, bundleName);
  };

  for (const bundle of registry.bundles) {
    addPath(correctTargets, bundle.manifestKey, bundle.name, `${bundle.name} manifestKey`);
    addPath(knownBundlePaths, bundle.manifestKey, bundle.name, `${bundle.name} manifestKey`);
    addPath(knownBundlePaths, `/${bundle.canonicalPath}`, bundle.name, `${bundle.name} canonicalPath`);
    addPath(knownBundlePaths, `/${bundle.minifiedPath}`, bundle.name, `${bundle.name} minifiedPath`);

    const currentTarget = assets[bundle.manifestKey];
    if (currentTarget !== undefined) {
      if (typeof currentTarget !== 'string' || !currentTarget) {
        throw new Error(`${ASSET_MANIFEST_PATH} has an invalid target for ${bundle.manifestKey}.`);
      }
      addPath(correctTargets, currentTarget, bundle.name, `${bundle.name} fingerprint target`);
      addPath(knownBundlePaths, currentTarget, bundle.name, `${bundle.name} fingerprint target`);
    }
  }

  return { correctTargets, knownBundlePaths };
};

const classifyManagedStylesheetHref = ({
  href,
  routeUrl,
  canonicalOrigin,
  correctTargets,
  knownBundlePaths,
}) => {
  let parsed;
  try {
    parsed = new URL(href, routeUrl);
  } catch {
    return { kind: 'other', pathname: null };
  }

  const canonical = new URL(canonicalOrigin);
  if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) {
    return { kind: 'other', pathname: parsed.pathname };
  }

  if (LEGACY_COMPONENTS_PATH_RE.test(parsed.pathname)) {
    return { kind: 'legacy', pathname: parsed.pathname };
  }
  if (correctTargets.has(parsed.pathname)) {
    return {
      bundleName: correctTargets.get(parsed.pathname),
      kind: 'target',
      pathname: parsed.pathname,
    };
  }
  if (knownBundlePaths.has(parsed.pathname) || BUNDLE_COMPONENTS_PATH_RE.test(parsed.pathname)) {
    return {
      bundleName: knownBundlePaths.get(parsed.pathname) || null,
      kind: 'invalid-bundle-target',
      pathname: parsed.pathname,
    };
  }
  return { kind: 'other', pathname: parsed.pathname };
};

const relevantSignature = (reference) => {
  const state = reference.state;
  return `${state.kind}:${state.bundleName || ''}:${state.pathname || ''}`;
};

const multiset = (values) => {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort(([left], [right]) => compareText(left, right));
};

const analyzeRoute = async ({
  entry,
  canonicalOrigin,
  correctTargets,
  knownBundlePaths,
  availableBundleNames,
}) => {
  const resolved = resolveContainedWorkspacePath(entry.htmlPath, entry.htmlPath);
  const rawHtml = await fs.readFile(resolved.absolutePath, 'utf8');
  const expandedHtml = await readHtmlWithSsi(entry.htmlPath, { root: ROOT, strict: true });

  const classifyReferences = (html) => parseActiveStylesheetLinks(html).map((reference) => ({
    ...reference,
    state: classifyManagedStylesheetHref({
      href: reference.href,
      routeUrl: entry.absoluteUrl,
      canonicalOrigin,
      correctTargets,
      knownBundlePaths,
    }),
  }));

  const rawRelevant = classifyReferences(rawHtml).filter((reference) => reference.state.kind !== 'other');
  const expandedRelevant = classifyReferences(expandedHtml).filter((reference) => reference.state.kind !== 'other');
  const rawSignatures = multiset(rawRelevant.map(relevantSignature));
  const expandedSignatures = multiset(expandedRelevant.map(relevantSignature));

  if (JSON.stringify(rawSignatures) !== JSON.stringify(expandedSignatures)) {
    throw new Error(
      `${entry.route} has component-bundle stylesheet ownership in SSI-expanded markup; `
      + `the route file ${entry.htmlPath} must own the exact href before migration.`
    );
  }
  if (!rawRelevant.length) return null;

  const bodyClasses = extractBodyClasses(expandedHtml);

  const invalid = rawRelevant.filter((reference) => reference.state.kind === 'invalid-bundle-target');
  if (invalid.length) {
    throw new Error(
      `${entry.route} uses unsupported component bundle target(s): `
      + invalid.map((reference) => reference.state.pathname).join(', ')
    );
  }

  const legacy = rawRelevant.filter((reference) => reference.state.kind === 'legacy');
  const targets = rawRelevant.filter((reference) => reference.state.kind === 'target');
  if (legacy.length && targets.length) {
    throw new Error(`${entry.route} mixes legacy components and generated bundle stylesheets.`);
  }
  if (rawRelevant.length !== 1) {
    throw new Error(
      `${entry.route} must contain exactly one active managed component stylesheet; found ${rawRelevant.length}.`
    );
  }

  let bundleName;
  try {
    bundleName = classifyBodyClasses(bodyClasses, availableBundleNames);
  } catch (error) {
    throw new Error(`${entry.route} cannot be classified from <body>: ${error.message}`, { cause: error });
  }

  if (targets.length && targets[0].state.bundleName !== bundleName) {
    throw new Error(
      `${entry.route} loads ${targets[0].state.bundleName}, but its exact body predicate selects ${bundleName}.`
    );
  }

  const bundle = CSS_BUNDLE_REGISTRY.bundles.find((item) => item.name === bundleName);
  if (!bundle) throw new Error(`Registry bundle missing after classification: ${bundleName}.`);

  return {
    ...entry,
    bodyClasses,
    bundleName,
    rawHtml,
    reference: rawRelevant[0],
    state: legacy.length ? 'legacy' : 'target',
    targetHref: bundle.manifestKey,
  };
};

const validateExpectedInventory = (managedRoutes, registry = CSS_BUNDLE_REGISTRY) => {
  if (managedRoutes.length !== EXPECTED_MANAGED_ROUTES) {
    throw new Error(
      `Managed component route count drift: expected ${EXPECTED_MANAGED_ROUTES}, found ${managedRoutes.length}.`
    );
  }

  const byBundle = new Map(registry.bundles.map((bundle) => [bundle.name, 0]));
  const bySitemap = new Map(SITEMAP_PATHS.map((sitemapPath) => [sitemapPath, 0]));
  const htmlOwners = new Set();

  for (const route of managedRoutes) {
    if (!byBundle.has(route.bundleName)) {
      throw new Error(`Managed route selected unknown registry bundle: ${route.bundleName}.`);
    }
    byBundle.set(route.bundleName, byBundle.get(route.bundleName) + 1);
    if (!bySitemap.has(route.sitemapPath)) {
      throw new Error(`Managed route came from an unexpected sitemap: ${route.sitemapPath}.`);
    }
    bySitemap.set(route.sitemapPath, bySitemap.get(route.sitemapPath) + 1);
    if (htmlOwners.has(route.htmlPath)) {
      throw new Error(`Multiple managed routes resolve to the same HTML owner: ${route.htmlPath}.`);
    }
    htmlOwners.add(route.htmlPath);
  }

  for (const bundle of registry.bundles) {
    if (!(bundle.name in EXPECTED_ROUTE_COUNTS)) {
      throw new Error(`Expected-count contract is missing registry bundle: ${bundle.name}.`);
    }
    const expected = EXPECTED_ROUTE_COUNTS[bundle.name];
    const actual = byBundle.get(bundle.name);
    if (actual !== expected) {
      throw new Error(`Bundle route count drift for ${bundle.name}: expected ${expected}, found ${actual}.`);
    }
  }

  for (const [sitemapPath, expected] of Object.entries(EXPECTED_SITEMAP_COUNTS)) {
    const actual = bySitemap.get(sitemapPath) || 0;
    if (actual !== expected) {
      throw new Error(
        `Managed route count drift for ${sitemapPath}: expected ${expected}, found ${actual}.`
      );
    }
  }

  return {
    byBundle: Object.fromEntries([...byBundle.entries()]),
    bySitemap: Object.fromEntries([...bySitemap.entries()]),
  };
};

const validateTargetAssets = async (managedRoutes, realRoot) => {
  const usedBundles = new Set(managedRoutes.map((route) => route.bundleName));
  for (const bundle of CSS_BUNDLE_REGISTRY.bundles) {
    if (!usedBundles.has(bundle.name)) continue;
    const absolutePath = resolveWorkspacePath(bundle.minifiedPath);
    await assertContainedRegularFile(
      absolutePath,
      `${bundle.name} minified bundle ${bundle.minifiedPath}`,
      realRoot
    );
  }
};

const buildMigrationPlan = async () => {
  const realRoot = await fs.realpath(ROOT);
  const contract = await readJson(URL_CONTRACT_PATH);
  const canonicalOrigin = String(contract.canonicalOrigin || '').trim().replace(/\/$/, '');
  if (!canonicalOrigin) throw new Error(`${URL_CONTRACT_PATH} is missing canonicalOrigin.`);
  const canonical = new URL(canonicalOrigin);
  if (!/^https?:$/.test(canonical.protocol)) {
    throw new Error(`${URL_CONTRACT_PATH} canonicalOrigin must use http or https.`);
  }

  const availableBundleNames = new Set(CSS_BUNDLE_REGISTRY.bundles.map((bundle) => bundle.name));
  const { correctTargets, knownBundlePaths } = await loadTargetAliases(
    canonicalOrigin,
    CSS_BUNDLE_REGISTRY
  );
  const inventory = await loadRouteInventory(canonicalOrigin, realRoot);
  const managedRoutes = [];

  for (const entry of inventory.routes) {
    const analyzed = await analyzeRoute({
      entry,
      canonicalOrigin,
      correctTargets,
      knownBundlePaths,
      availableBundleNames,
    });
    if (analyzed) managedRoutes.push(analyzed);
  }

  const counts = validateExpectedInventory(managedRoutes);
  await validateTargetAssets(managedRoutes, realRoot);

  const pendingRoutes = managedRoutes.filter((route) => route.state === 'legacy');
  const currentRoutes = managedRoutes.filter((route) => route.state === 'target');
  return {
    canonicalOrigin,
    counts,
    currentRoutes,
    managedRoutes,
    pendingRoutes,
    realRoot,
    sitemapRouteCounts: inventory.sitemapRouteCounts,
  };
};

const prepareWrites = async (plan) => {
  const writes = [];
  for (const route of plan.pendingRoutes) {
    const resolved = resolveContainedWorkspacePath(route.htmlPath, route.htmlPath);
    await assertContainedRegularFile(resolved.absolutePath, route.htmlPath, plan.realRoot);
    const current = await fs.readFile(resolved.absolutePath, 'utf8');
    if (current !== route.rawHtml) {
      throw new Error(`${route.htmlPath} changed after migration planning; no files were written.`);
    }

    const updated = applyHrefReplacements(current, [{
      start: route.reference.hrefStart,
      end: route.reference.hrefEnd,
      oldValue: route.reference.rawHref,
      newValue: route.targetHref,
    }]);
    if (updated === current) {
      throw new Error(`${route.htmlPath} produced no href change; no files were written.`);
    }
    writes.push({
      absolutePath: resolved.absolutePath,
      htmlPath: route.htmlPath,
      targetHref: route.targetHref,
      updated,
    });
  }
  return writes;
};

const applyMigrationPlan = async (plan) => {
  const writes = await prepareWrites(plan);
  for (const write of writes) {
    await fs.writeFile(write.absolutePath, write.updated, 'utf8');
  }
  return writes.length;
};

const printReport = (plan, mode, written = 0) => {
  console.log(`Component bundle route migration ${mode} validated.`);
  console.log(
    `- sitemap inventory: ${SITEMAP_PATHS.map((name) => `${name}=${plan.sitemapRouteCounts[name]}`).join(', ')}`
  );
  console.log(
    `- managed routes: ${plan.managedRoutes.length}; pending=${plan.pendingRoutes.length}; already-correct=${plan.currentRoutes.length}`
  );
  console.log(
    `- managed sitemap split: ${SITEMAP_PATHS.map((name) => `${name}=${plan.counts.bySitemap[name]}`).join(', ')}`
  );
  for (const bundle of CSS_BUNDLE_REGISTRY.bundles) {
    const total = plan.counts.byBundle[bundle.name];
    const pending = plan.pendingRoutes.filter((route) => route.bundleName === bundle.name).length;
    if (!total && !pending) continue;
    console.log(
      `- ${bundle.name}: routes=${total}; pending=${pending}; target=${bundle.manifestKey}`
    );
  }
  if (mode === 'check') {
    console.log('- check mode: no files written.');
  } else {
    console.log(`- write mode: updated ${written} HTML file(s).`);
  }
};

const main = async () => {
  const options = parseArgs();
  if (options.help) {
    console.log(`Usage: node ${TOOL_PATH} --check|--write`);
    console.log('--check validates and reports the deterministic migration plan without writing.');
    console.log('--write validates the complete plan before replacing exact href values.');
    return;
  }

  const plan = await buildMigrationPlan();
  if (options.mode === 'check') {
    printReport(plan, options.mode);
    if (plan.pendingRoutes.length > 0) {
      const examples = plan.pendingRoutes
        .slice(0, 5)
        .map((route) => `${route.route} -> ${route.targetHref}`)
        .join(', ');
      throw new Error(
        `Component bundle route migration is not current: ${plan.pendingRoutes.length} route(s) still use the legacy components stylesheet. `
          + `Run node ${TOOL_PATH} --write. Examples: ${examples}`
      );
    }
    return;
  }

  const written = await applyMigrationPlan(plan);
  printReport(plan, options.mode, written);
};

const isDirectInvocation = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(THIS_FILE);

if (isDirectInvocation) {
  main().catch((error) => {
    console.error(`Component bundle route migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}

export {
  EXPECTED_MANAGED_ROUTES,
  EXPECTED_ROUTE_COUNTS,
  EXPECTED_SITEMAP_COUNTS,
  LEGACY_COMPONENTS_PATH_RE,
  applyHrefReplacements,
  applyMigrationPlan,
  buildMigrationPlan,
  classifyBodyClasses,
  classifyManagedStylesheetHref,
  extractBodyClasses,
  maskInactiveHtml,
  parseActiveStylesheetLinks,
  validateExpectedInventory,
};
