#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import parser from './lib/css-asset-parser.cjs';

const {
  ROOT,
  assetPathForHref,
  assertSafeExistingFile,
  assertSafeOutputPath,
  atomicWriteFile,
  canonicalizeLocalAsset,
  compareText,
  createSsiExpander,
  gzipBytes,
  inlineCssFile,
  loadAssetManifest,
  normalizeManagedHtmlAssetReferences,
  parseActiveStylesheets,
  parseTagAttributes,
  readJsonFile,
  readSitemapUrls,
  relativeLabel,
  resolveWorkspacePath,
  routeToSourceHtml,
  scanStartTags,
  sha256,
  stableJson,
  stripInactiveHtml,
} = parser;

const THIS_FILE = fileURLToPath(import.meta.url);
const SCHEMA_VERSION = 1;
const BUILD_VERSION = 'route-styles-1';
const BOOTSTRAP_VERSION = '5.3.3';
const PURGECSS_VERSION = '6.0.0';
const SASS_VERSION = '1.77.8';

const DEFAULT_BOOTSTRAP_CSS = 'src/assets/css/bootstrap-site.css';
const DEFAULT_OUTPUT_DIRECTORY = 'src/assets/css/routes';
const DEFAULT_MANIFEST = 'src/assets/data/route-style-manifest.json';
const DEFAULT_REJECTED_REPORT = 'src/assets/data/route-style-rejected-selectors.json';
const DEFAULT_ASSET_MANIFEST = 'src/assets/data/asset-hash-manifest.json';
const BOOTSTRAP_INPUT = '/assets/css/bootstrap-site.css';
const FONTS_STYLESHEET = '/assets/css/fonts.css';
const SITE_SHELL_STYLESHEET = '/assets/css/site-shell.css';
const ICONS_STYLESHEET = '/assets/css/bootstrap-icons-local.css';
const TOKENS_STYLESHEET = '/tokens.css';
const LEXEND_FONT = '/assets/fonts/lexend/lexend-latin-variable.woff2';
const SHARED_STYLESHEETS = new Set([
  FONTS_STYLESHEET,
  SITE_SHELL_STYLESHEET,
  ICONS_STYLESHEET,
]);
const ROUTE_BUNDLE_RE = /^\/assets\/css\/routes\/site-([0-9a-f]{12})(?:\.min)?\.css$/i;
const STALE_FINGERPRINTED_ROUTE_BUNDLE_RE = /^\/assets\/css\/routes\/site-[0-9a-f]{12}\.min\.[0-9a-f]{6}\.css(?:[?#].*)?$/i;
const BOOTSTRAP_CDN_RE = /^https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap@5\.3\.3\/dist\/css\/bootstrap(?:\.min)?\.css(?:[?#].*)?$/i;
const BOOTSTRAP_ICON_CDN_RE = /^https:\/\/cdn\.jsdelivr\.net\/npm\/bootstrap-icons@[^/]+\/font\/bootstrap-icons(?:\.min)?\.css(?:[?#].*)?$/i;

// Exact names only. These are classes introduced after initial HTML parse by
// Bootstrap 5.3.3 or by project runtime code. Avoid broad prefix regexes: they
// silently turn PurgeCSS into a no-op as the site evolves.
const RUNTIME_SAFELIST = Object.freeze([
  'active',
  'accordion',
  'accordion-body',
  'accordion-button',
  'accordion-collapse',
  'accordion-header',
  'accordion-item',
  'align-items-center',
  'animate',
  'b--bio',
  'b--gi',
  'b--mix',
  'b--nogi',
  'before-animate',
  'bg-white',
  'bi',
  'bi-calendar-check',
  'border',
  'btn',
  'btn-outline-primary',
  'btn-outline-secondary',
  'btn-primary',
  'calendly-inline-widget',
  'carousel-item-end',
  'carousel-item-next',
  'carousel-item-prev',
  'carousel-item-start',
  'collapse',
  'collapsed',
  'collapsing',
  'container',
  'd-flex',
  'd-inline-flex',
  'desktop-sticky-cta--hidden',
  'eyebrow',
  'fade',
  'flex-column',
  'focus-card',
  'focus-cue',
  'focus-glossary',
  'focus-glossary-grid',
  'focus-glossary-link',
  'focus-grid',
  'focus-item',
  'focus-time',
  'focus-video-card',
  'focus-video-copy',
  'focus-video-description',
  'focus-video-group',
  'focus-video-play',
  'focus-video-thumb',
  'focus-video-type',
  'fw-bold',
  'fw-semibold',
  'gap-2',
  'gap-3',
  'h2',
  'h4',
  'hidden',
  'hiding',
  'is-active',
  'is-disabled',
  'is-hidden',
  'is-loaded',
  'is-selected',
  'lane-adult',
  'lane-mixed',
  'lane-youth',
  'mb-0',
  'mb-1',
  'mb-2',
  'mb-3',
  'mb-4',
  'modal-backdrop',
  'modal-open',
  'modal-static',
  'mobile-sticky-cta--hidden',
  'ms-2',
  'mt-2',
  'mt-3',
  'mx-auto',
  'my-4',
  'offcanvas-backdrop',
  'open',
  'p-3',
  'p-4',
  'pb-step-active',
  'pb-step-hidden',
  'py-3',
  'rounded-3',
  'rounded-4',
  'shadow-sm',
  'show',
  'showing',
  'shrink',
  'small',
  'sr--visible',
  'ss-btn',
  'ss-btn-primary',
  'ss-calendly__loading',
  'ss-evidence',
  'ss-evidence-accordion',
  'ss-evidence-fact',
  'ss-evidence__header',
  'ss-location-link',
  'text-center',
  'text-muted',
  'text-uppercase',
  'w-100',
  'was-validated',
  'week-label',
  'week-panel-header',
  'week-tab',
].sort(compareText));

const ALLOWED_EXTERNAL_FUNCTIONAL_STYLESHEETS = Object.freeze([]);

const usage = `Usage: node tools/build-route-styles.mjs (--write | --check | --prune-stale) [options]

Options:
  --output-dir=<path>       Route bundle directory (default: ${DEFAULT_OUTPUT_DIRECTORY})
  --manifest=<path>         Route manifest (default: ${DEFAULT_MANIFEST})
  --rejected-report=<path>  Aggregate rejected-selector report
  --bootstrap-css=<path>    Compiled selective Bootstrap input
  --asset-manifest=<path>   Asset fingerprint manifest used for canonical reconstruction
  --help                    Show this help text

--write atomically writes bundles/reports and migrates active route/SSI HTML.
--check recomputes every byte and proves HTML ownership without writing.`;

const parseArgs = (args = process.argv.slice(2)) => {
  let mode = null;
  let help = false;
  let outputDirectory = DEFAULT_OUTPUT_DIRECTORY;
  let manifest = DEFAULT_MANIFEST;
  let rejectedReport = DEFAULT_REJECTED_REPORT;
  let bootstrapCss = DEFAULT_BOOTSTRAP_CSS;
  let assetManifest = DEFAULT_ASSET_MANIFEST;

  const setMode = (next) => {
    if (mode) throw new Error(`${next} cannot be combined with ${mode}.`);
    mode = next;
  };

  for (const arg of args) {
    if (arg === '--write') setMode('--write');
    else if (arg === '--check') setMode('--check');
    else if (arg === '--prune-stale') setMode('--prune-stale');
    else if (arg === '--help' || arg === '-h') help = true;
    else if (arg.startsWith('--output-dir=')) outputDirectory = arg.slice('--output-dir='.length);
    else if (arg.startsWith('--manifest=')) manifest = arg.slice('--manifest='.length);
    else if (arg.startsWith('--rejected-report=')) rejectedReport = arg.slice('--rejected-report='.length);
    else if (arg.startsWith('--bootstrap-css=')) bootstrapCss = arg.slice('--bootstrap-css='.length);
    else if (arg.startsWith('--asset-manifest=')) assetManifest = arg.slice('--asset-manifest='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (help && args.length > 1) throw new Error('--help cannot be combined with other arguments.');
  if (!help && !mode) throw new Error('Choose exactly one mode: --write or --check.');

  const outputProbe = resolveWorkspacePath(`${outputDirectory}/.route-style-output`, '--output-dir');
  const paths = {
    assetManifest: resolveWorkspacePath(assetManifest, '--asset-manifest'),
    bootstrapCss: resolveWorkspacePath(bootstrapCss, '--bootstrap-css'),
    manifest: resolveWorkspacePath(manifest, '--manifest'),
    outputDirectory: path.dirname(outputProbe),
    rejectedReport: resolveWorkspacePath(rejectedReport, '--rejected-report'),
  };
  const uniqueOutputs = new Set([paths.manifest, paths.rejectedReport]);
  if (uniqueOutputs.size !== 2) throw new Error('--manifest and --rejected-report must be different files.');
  for (const outputPath of uniqueOutputs) {
    if (outputPath === paths.assetManifest || outputPath === paths.bootstrapCss) {
      throw new Error('Generated report paths cannot overwrite an asset input.');
    }
  }
  return { help, mode, paths };
};

const readPackageVersion = async (packageName, expectedVersion) => {
  const packagePath = path.join(ROOT, 'node_modules', packageName, 'package.json');
  assertSafeExistingFile(packagePath, `Pinned ${packageName} package`);
  const parsed = JSON.parse(await fs.readFile(packagePath, 'utf8'));
  if (parsed.version !== expectedVersion) {
    throw new Error(`${packageName} ${expectedVersion} is required; found ${parsed.version || 'unknown'}.`);
  }
};

const importToolchain = async () => {
  await Promise.all([
    readPackageVersion('bootstrap', BOOTSTRAP_VERSION),
    readPackageVersion('purgecss', PURGECSS_VERSION),
    readPackageVersion('sass', SASS_VERSION),
  ]);
  try {
    const [{ PurgeCSS }, sass] = await Promise.all([import('purgecss'), import('sass')]);
    if (typeof PurgeCSS !== 'function' || typeof sass.compileString !== 'function') {
      throw new Error('Pinned CSS packages expose an unexpected API.');
    }
    return { PurgeCSS, sass };
  } catch (error) {
    throw new Error('The pinned Bootstrap/Sass/PurgeCSS toolchain is required. Run npm ci.', {
      cause: error,
    });
  }
};

const fileExists = async (absolutePath) => {
  try {
    const stat = await fs.lstat(absolutePath);
    return stat.isFile() && !stat.isSymbolicLink();
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
};

const readPriorManifest = async (manifestPath) => {
  if (!await fileExists(manifestPath)) return null;
  const prior = await readJsonFile(manifestPath, 'Prior route-style manifest');
  if (prior.schemaVersion !== SCHEMA_VERSION || prior.buildVersion !== BUILD_VERSION) {
    throw new Error(
      `Prior route-style manifest is incompatible (schema ${prior.schemaVersion}, build ${prior.buildVersion}).`
    );
  }
  if (!prior.routes || typeof prior.routes !== 'object' || Array.isArray(prior.routes)) {
    throw new Error('Prior route-style manifest has no routes object.');
  }
  return prior;
};

const isBootstrapCdn = (href) => BOOTSTRAP_CDN_RE.test(href);
const isBootstrapIconCdn = (href) => BOOTSTRAP_ICON_CDN_RE.test(href);

const isRemoteFontUrl = (href) => {
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return false;
  }
  const host = parsed.hostname.toLowerCase();
  return host === 'fonts.googleapis.com' ||
    host === 'fonts.gstatic.com' ||
    /(?:^|\.)use\.typekit\.net$/.test(host) ||
    /(?:^|\.)fonts\.bunny\.net$/.test(host) ||
    /(?:font|geist)/i.test(parsed.pathname);
};

const isRouteBundleHref = (href) => ROUTE_BUNDLE_RE.test(href);

const signatureHash = (orderedInputs) => sha256(stableJson({
  buildVersion: BUILD_VERSION,
  orderedInputs,
  schemaVersion: SCHEMA_VERSION,
})).slice(0, 12);

const validatePriorRouteBundle = ({ canonicalHref, priorManifest, route, sourceHtml }) => {
  if (!priorManifest) {
    throw new Error(
      `${sourceHtml} references generated route CSS ${canonicalHref}, but ${DEFAULT_MANIFEST} is missing.`
    );
  }
  const prior = priorManifest.routes[route];
  if (!prior) return [];
  // A previous build may have recorded a different emitted source path;
  // the current route/source discovered above is authoritative.
  // Generated HTML can carry a stale bundle from another route after a partial
  // build. The manifest entry for the current route is authoritative; the
  // migration below rewrites the stale link to the route's computed bundle.
  if (!Array.isArray(prior.orderedInputs) || prior.orderedInputs.length === 0) {
    throw new Error(`Prior route-style manifest has no orderedInputs for ${route}.`);
  }
  // Recompute the signature from the current ordered inputs during this build.
  // A stale prior signature is expected after source CSS changes.
  if (prior.orderedInputs.filter((href) => href === BOOTSTRAP_INPUT).length !== 1) {
    throw new Error(`Prior route-style manifest must contain Bootstrap exactly once for ${route}.`);
  }
  for (const href of prior.orderedInputs) {
    if (typeof href !== 'string' || !href.startsWith('/') || SHARED_STYLESHEETS.has(href) || isRouteBundleHref(href)) {
      throw new Error(`Prior route-style manifest has an unsafe input for ${route}: ${href}`);
    }
    assertSafeExistingFile(assetPathForHref(href), `Prior route CSS input ${href}`);
  }
  return [...prior.orderedInputs];
};

const classifyStylesheet = ({
  assetManifest,
  href,
  ownerFile,
  priorManifest,
  route,
  sourceHtml,
}) => {
  if (isBootstrapCdn(href)) return { absorbedInputs: [BOOTSTRAP_INPUT], kind: 'bootstrap' };
  if (isBootstrapIconCdn(href)) return { absorbedInputs: [], kind: 'legacy-icon' };
  // A previous generic fingerprint pass may have fingerprinted a generated
  // route bundle. It has no source dependency and is replaced atomically by
  // this generator; accepting only this exact managed pattern avoids a broad
  // missing-asset exception.
  if (STALE_FINGERPRINTED_ROUTE_BUNDLE_RE.test(href)) {
    return { absorbedInputs: [], kind: 'stale-fingerprinted-route-bundle' };
  }
  if (/^https?:|^\/\//i.test(href)) {
    if (isRemoteFontUrl(href)) return { absorbedInputs: [], kind: 'remote-font' };
    if (ALLOWED_EXTERNAL_FUNCTIONAL_STYLESHEETS.includes(href)) {
      return { absorbedInputs: [], kind: 'external-functional' };
    }
    throw new Error(`Unapproved remote stylesheet in ${sourceHtml}: ${href}`);
  }

  const local = canonicalizeLocalAsset(href, ownerFile, assetManifest);
  if (!local || path.extname(local.absolutePath).toLowerCase() !== '.css') {
    throw new Error(`Stylesheet is not a local CSS asset in ${sourceHtml}: ${href}`);
  }
  if (SHARED_STYLESHEETS.has(local.canonicalHref)) {
    return { absorbedInputs: [], kind: 'shared', local };
  }
  if (isRouteBundleHref(local.canonicalHref)) {
    return {
      absorbedInputs: validatePriorRouteBundle({
        canonicalHref: local.canonicalHref,
        priorManifest,
        route,
        sourceHtml,
      }),
      kind: 'prior-route-bundle',
      local,
    };
  }
  return { absorbedInputs: [local.canonicalHref], kind: 'local', local };
};

const analyzeRouteStyles = ({
  assetManifest,
  expandedHtml,
  priorManifest,
  route,
  source,
}) => {
  const plan = [];
  const orderedInputs = [];
  const priorBundleHrefs = new Set();
  for (const link of parseActiveStylesheets(expandedHtml)) {
    const classification = classifyStylesheet({
      assetManifest,
      href: link.href,
      ownerFile: source.absolutePath,
      priorManifest,
      route,
      sourceHtml: source.relativePath,
    });
    if (classification.kind === 'prior-route-bundle') {
      const bundleHref = classification.local.canonicalHref;
      if (priorBundleHrefs.has(bundleHref)) continue;
      priorBundleHrefs.add(bundleHref);
    }
    orderedInputs.push(...classification.absorbedInputs);
    plan.push({
      canonicalHref: classification.local?.canonicalHref || null,
      href: link.href,
      kind: classification.kind,
      order: link.index,
    });
  }
  if (priorBundleHrefs.size > 1) throw new Error(`${source.relativePath} has multiple active route bundles.`);
  const bootstrapCount = orderedInputs.filter((href) => href === BOOTSTRAP_INPUT).length;
  if (bootstrapCount === 0) orderedInputs.unshift(BOOTSTRAP_INPUT);
  if (bootstrapCount > 1) {
    throw new Error(`${source.relativePath} must resolve selective Bootstrap exactly once.`);
  }
  return { orderedInputs, plan };
};

const discoverRoutes = async ({ assetManifest, priorManifest }) => {
  const inventory = await readSitemapUrls();
  const expander = createSsiExpander();
  const routes = [];
  const sourceFiles = new Map();

  for (const inventoryEntry of inventory) {
    const source = routeToSourceHtml(inventoryEntry.route);
    const original = await fs.readFile(source.absolutePath, 'utf8');
    sourceFiles.set(source.absolutePath, original);
    const expandedHtml = await expander.expandFile(source.absolutePath);
    const dependencies = expander.dependencies.get(source.absolutePath) || [source.absolutePath];
    for (const dependency of dependencies) {
      if (!sourceFiles.has(dependency)) sourceFiles.set(dependency, await fs.readFile(dependency, 'utf8'));
    }
    const styleAnalysis = analyzeRouteStyles({
      assetManifest,
      expandedHtml,
      priorManifest,
      route: inventoryEntry.route,
      source,
    });
    const hash = signatureHash(styleAnalysis.orderedInputs);
    routes.push({
      ...inventoryEntry,
      dependencies: [...dependencies].sort(compareText),
      expandedHtml,
      original,
      signatureHash: hash,
      source,
      ...styleAnalysis,
    });
  }
  return { routes, sourceFiles };
};

const applyTextEdits = (source, replacements, insertions) => {
  const edits = [...replacements].sort((left, right) => left.start - right.start);
  const editByStart = new Map(edits.map((edit) => [edit.start, edit]));
  if (editByStart.size !== edits.length) throw new Error('Multiple HTML replacements start at one offset.');
  const positions = [...new Set([...editByStart.keys(), ...insertions.keys()])].sort((a, b) => a - b);
  let output = '';
  let cursor = 0;
  for (const position of positions) {
    if (position < cursor) throw new Error('HTML insertion falls inside a replacement range.');
    output += source.slice(cursor, position);
    output += insertions.get(position)?.join('') || '';
    const edit = editByStart.get(position);
    if (edit) {
      if (edit.end < edit.start) throw new Error('Invalid HTML migration edit range.');
      output += edit.text;
      cursor = edit.end;
    } else cursor = position;
  }
  output += source.slice(cursor);
  return output;
};

const addInsertion = (map, position, value) => {
  if (!map.has(position)) map.set(position, []);
  map.get(position).push(value);
};

const canonicalSharedTag = (href, suffix = '') => `<link rel="stylesheet" href="${href}${suffix}">`;
const routeBundleTag = (href) => `<link rel="stylesheet" href="${href}">`;
const fontPreloadTag = () =>
  `<link rel="preload" href="${LEXEND_FONT}" as="font" type="font/woff2" crossorigin>`;
const tokenPreloadTag = () => `<link rel="preload" href="${TOKENS_STYLESHEET}" as="style">`;

const stripLegacyBootstrapNoscript = (html) => String(html || '').replace(
  /<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi,
  (block) => {
    const opening = block.match(/^<noscript\b[^>]*>/i)?.[0] || '';
    const closing = block.match(/<\/noscript\s*>$/i)?.[0] || '';
    const inner = block.slice(opening.length, block.length - closing.length);
    const links = scanStartTags(inner, 'link');
    if (links.length !== 1) return block;
    const attributes = parseTagAttributes(links[0].tag, 'link');
    const href = String(attributes.get('href') || '').trim();
    const remainder = `${inner.slice(0, links[0].start)}${inner.slice(links[0].end)}`.trim();
    return !remainder && BOOTSTRAP_CDN_RE.test(href) ? '' : block;
  }
);

const headBounds = (html, sourceLabel) => {
  const active = stripInactiveHtml(html);
  const open = active.match(/<head\b[^>]*>/i);
  const close = active.match(/<\/head\s*>/i);
  if (!open || open.index === undefined || !close || close.index === undefined || close.index <= open.index) {
    throw new Error(`${sourceLabel} must contain one active <head> element.`);
  }
  if (active.slice(open.index + open[0].length).match(/<head\b/i)?.index < close.index) {
    throw new Error(`${sourceLabel} contains multiple active <head> elements.`);
  }
  return { closeStart: close.index, contentStart: open.index + open[0].length };
};

const migrateHtmlSource = ({
  assetManifest,
  bundleHref = null,
  isRouteSource,
  original,
  priorManifest,
  route = null,
  sourcePath,
}) => {
  const replacements = [];
  const insertions = new Map();
  const links = scanStartTags(stripInactiveHtml(original), 'link');
  const sourceHtml = relativeLabel(sourcePath);
  const bounds = isRouteSource ? headBounds(original, sourceHtml) : null;
  let firstAbsorbed = null;
  let firstStylesheet = null;
  let firstIcon = null;
  let lexendPreloadEdit = null;
  let lexendPreloadPosition = null;
  let tokenPreloadEdit = null;
  let tokenPreloadPosition = null;
  const seenShared = new Map();

  for (const linkTag of links) {
    const attributes = parseTagAttributes(linkTag.tag, 'link');
    const rel = String(attributes.get('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const href = String(attributes.get('href') || '').trim();
    const as = String(attributes.get('as') || '').toLowerCase();
    const stylePreload = rel.includes('preload') && as === 'style';
    const stylesheet = rel.includes('stylesheet');
    let replacement = null;

    if (stylePreload && href) {
      let isPinnedTokens = false;
      try {
        const tokenStylesheet = !/^https?:|^\/\//i.test(href)
          ? canonicalizeLocalAsset(href, sourcePath, assetManifest)
          : null;
        isPinnedTokens = tokenStylesheet?.canonicalHref === TOKENS_STYLESHEET;
      } catch {
        // Leave unrelated style preloads untouched; unsafe local assets are
        // rejected when they are active stylesheets below.
      }
      if (isPinnedTokens) {
        replacement = tokenPreloadPosition === null ? tokenPreloadTag() : '';
        if (tokenPreloadPosition === null) tokenPreloadPosition = linkTag.start;
      }
    } else if (stylesheet && href) {
      if (firstStylesheet === null) firstStylesheet = linkTag.start;
      const classification = classifyStylesheet({
        assetManifest,
        href,
        ownerFile: sourcePath,
        priorManifest,
        route,
        sourceHtml,
      });
      if (classification.absorbedInputs.length || classification.kind === 'prior-route-bundle' || classification.kind === 'stale-fingerprinted-route-bundle') {
        if (firstAbsorbed === null) firstAbsorbed = linkTag.start;
        replacement = '';
      } else if (classification.kind === 'shared') {
        const canonical = classification.local.canonicalHref;
        const prior = seenShared.get(canonical);
        if (prior === undefined) {
          seenShared.set(canonical, linkTag.start);
          if (canonical === ICONS_STYLESHEET) firstIcon = linkTag.start;
        }
        replacement = '';
      } else if (classification.kind === 'remote-font' || classification.kind === 'legacy-icon') {
        replacement = '';
      }
    } else if (href && rel.includes('preconnect') && isRemoteFontUrl(href)) {
      replacement = '';
    } else if (rel.includes('preload') && as === 'font') {
      let isPinnedLexend = false;
      try {
        const font = href && !/^https?:|^\/\//i.test(href)
          ? canonicalizeLocalAsset(href, sourcePath, assetManifest)
          : null;
        isPinnedLexend = font?.canonicalHref === LEXEND_FONT &&
          String(attributes.get('type') || '').toLowerCase() === 'font/woff2' &&
          attributes.has('crossorigin');
      } catch {
        // Unsafe or missing font preloads are removed below.
      }
      replacement = isPinnedLexend && lexendPreloadPosition === null ? fontPreloadTag() : '';
      if (isPinnedLexend && lexendPreloadPosition === null) {
        lexendPreloadPosition = linkTag.start;
      }
    }

    if (replacement !== null) {
      const edit = { end: linkTag.end, start: linkTag.start, text: replacement };
      replacements.push(edit);
      if (lexendPreloadPosition === linkTag.start) lexendPreloadEdit = edit;
      if (tokenPreloadPosition === linkTag.start) tokenPreloadEdit = edit;
    }
  }

  if (!isRouteSource) {
    return stripLegacyBootstrapNoscript(applyTextEdits(original, replacements, insertions));
  }
  if (firstAbsorbed === null) {
    throw new Error(`${sourceHtml} has no top-level absorbed stylesheet position for its route bundle.`);
  }
  const absorbedEdit = replacements.find((edit) => edit.start === firstAbsorbed);
  if (!absorbedEdit) throw new Error(`Unable to place route bundle in ${sourceHtml}.`);
  absorbedEdit.text = routeBundleTag(bundleHref);

  const preloadPosition = firstStylesheet ?? bounds.closeStart;
  if (lexendPreloadPosition === null || lexendPreloadPosition > preloadPosition) {
    if (lexendPreloadEdit) lexendPreloadEdit.text = '';
    addInsertion(insertions, preloadPosition, `${fontPreloadTag()}\n`);
  }
  if (tokenPreloadPosition === null || tokenPreloadPosition > preloadPosition) {
    if (tokenPreloadEdit) tokenPreloadEdit.text = '';
    addInsertion(insertions, preloadPosition, `${tokenPreloadTag()}\n`);
  }

  if (firstIcon !== null) {
    const iconEdit = replacements.find((edit) => edit.start === firstIcon);
    const iconLink = parseActiveStylesheets(original).find((entry) => entry.sourceOffset === firstIcon);
    const local = iconLink
      ? canonicalizeLocalAsset(iconLink.href, sourcePath, assetManifest)
      : null;
    if (!iconEdit || !local) throw new Error(`Unable to retain the local icon stylesheet in ${sourceHtml}.`);
    iconEdit.text = canonicalSharedTag(ICONS_STYLESHEET, local.suffix);
  }
  const migrated = applyTextEdits(original, replacements, insertions);
  const finalBounds = headBounds(migrated, sourceHtml);
  const headPrefix = migrated.slice(0, finalBounds.closeStart).replace(/\s*$/, '');
  const sharedTail = [
    ...(firstIcon === null ? [canonicalSharedTag(ICONS_STYLESHEET)] : []),
    canonicalSharedTag(FONTS_STYLESHEET),
    canonicalSharedTag(SITE_SHELL_STYLESHEET),
  ].join('\n');
  return stripLegacyBootstrapNoscript(
    `${headPrefix}\n${sharedTail}\n${migrated.slice(finalBounds.closeStart)}`
  );
};

const prepareHtmlMigrations = ({ assetManifest, discovered, priorManifest }) => {
  const routeBySource = new Map();
  for (const route of discovered.routes) {
    const prior = routeBySource.get(route.source.absolutePath);
    const minifiedHref = `/assets/css/routes/site-${route.signatureHash}.min.css`;
    if (prior && prior.minifiedHref !== minifiedHref) {
      throw new Error(
        `${route.source.relativePath} serves routes with different stylesheet signatures: ` +
        `${prior.route} and ${route.route}.`
      );
    }
    routeBySource.set(route.source.absolutePath, { minifiedHref, route: route.route });
  }

  const overrides = new Map();
  for (const [sourcePath, original] of [...discovered.sourceFiles].sort(([a], [b]) => compareText(a, b))) {
    const routeOwner = routeBySource.get(sourcePath);
    overrides.set(sourcePath, migrateHtmlSource({
      assetManifest,
      bundleHref: routeOwner?.minifiedHref || null,
      isRouteSource: Boolean(routeOwner),
      original,
      priorManifest,
      route: routeOwner?.route || null,
      sourcePath,
    }));
  }
  return overrides;
};

const expandFinalHtml = async (discovered, overrides) => {
  const expander = createSsiExpander({ overrides });
  for (const route of discovered.routes) {
    route.finalHtml = await expander.expandFile(route.source.absolutePath);
    route.finalDependencies = expander.dependencies.get(route.source.absolutePath) || route.dependencies;
  }
};

const groupRoutes = (routes) => {
  const groups = new Map();
  for (const route of routes) {
    const prior = groups.get(route.signatureHash);
    if (prior && stableJson(prior.orderedInputs) !== stableJson(route.orderedInputs)) {
      throw new Error(`Signature collision for route-style hash ${route.signatureHash}.`);
    }
    if (prior) prior.routes.push(route);
    else groups.set(route.signatureHash, { orderedInputs: route.orderedInputs, routes: [route] });
  }
  return [...groups.entries()]
    .map(([hash, group]) => ({ ...group, hash, routes: group.routes.sort((a, b) => compareText(a.route, b.route)) }))
    .sort((left, right) => compareText(left.hash, right.hash));
};

const buildCombinedCss = async (orderedInputs, assetManifest, bootstrapCssPath) => {
  const dependencies = new Set();
  const droppedImports = new Set();
  const cache = new Map();
  const parts = [];
  for (const href of orderedInputs) {
    if (SHARED_STYLESHEETS.has(href) || href === TOKENS_STYLESHEET || isRouteBundleHref(href)) {
      throw new Error(`Shared/generated CSS cannot be absorbed into a route bundle: ${href}`);
    }
    const absolutePath = href === BOOTSTRAP_INPUT
      ? bootstrapCssPath
      : path.resolve(ROOT, href.replace(/^\/+/, ''));
    assertSafeExistingFile(absolutePath, `Route CSS input ${href}`);
    const css = await inlineCssFile(absolutePath, assetManifest, {
      cache,
      dependencies,
      droppedImports,
    });
    parts.push(`/* route-style input: ${href} */\n${css.trimEnd()}\n`);
  }
  return {
    css: parts.join('\n'),
    dependencies: [...dependencies].sort(compareText),
    droppedImports: [...droppedImports].sort(compareText),
  };
};

const minifyWithSass = (css, sass) => sass.compileString(css, {
  charset: false,
  sourceMap: false,
  style: 'compressed',
  syntax: 'css',
}).css.trimEnd();

const buildBundles = async ({ PurgeCSS, assetManifest, bootstrapCssPath, groups, sass }) => {
  const bundles = [];
  for (const group of groups) {
    const combined = await buildCombinedCss(group.orderedInputs, assetManifest, bootstrapCssPath);
    const purgeResults = await new PurgeCSS().purge({
      content: group.routes.map((route) => ({ extension: 'html', raw: route.finalHtml })),
      css: [{ raw: combined.css }],
      fontFace: false,
      keyframes: false,
      rejected: true,
      safelist: [...RUNTIME_SAFELIST],
      variables: false,
    });
    if (!Array.isArray(purgeResults) || purgeResults.length !== 1) {
      throw new Error(`PurgeCSS returned an unexpected result for site-${group.hash}.`);
    }
    const result = purgeResults[0];
    const rejectedSelectors = [...new Set(result.rejected || [])].sort(compareText);
    const generatedHeader =
      `/* Generated by tools/build-route-styles.mjs (${BUILD_VERSION}).\n` +
      `   Signature: ${group.hash}; inputs preserve the order listed in the route-style manifest.\n` +
      '   Do not edit directly. */\n';
    const canonicalCss = `${generatedHeader}${result.css.trimEnd()}\n`;
    const minifiedCss = `${minifyWithSass(result.css, sass)}\n`;
    bundles.push({
      ...group,
      canonicalCss,
      canonicalHref: `/assets/css/routes/site-${group.hash}.css`,
      dependencies: combined.dependencies,
      droppedImports: combined.droppedImports,
      gzipBytes: gzipBytes(canonicalCss),
      minifiedBytes: Buffer.byteLength(minifiedCss),
      minifiedCss,
      minifiedGzipBytes: gzipBytes(minifiedCss),
      minifiedHref: `/assets/css/routes/site-${group.hash}.min.css`,
      rawBytes: Buffer.byteLength(canonicalCss),
      rejectedSelectors,
    });
  }
  return bundles;
};

const buildReports = ({ assetManifest, bundles, discovered, overrides }) => {
  const bundleByHash = new Map(bundles.map((bundle) => [bundle.hash, bundle]));
  const routeEntries = {};
  for (const route of [...discovered.routes].sort((a, b) => compareText(a.route, b.route))) {
    const bundle = bundleByHash.get(route.signatureHash);
    const finalSource = overrides.get(route.source.absolutePath);
    const sourceDependencies = route.finalDependencies
      .map((dependency) => ({
        path: relativeLabel(dependency),
        sha256: sha256(normalizeManagedHtmlAssetReferences(
          overrides.get(dependency) ?? discovered.sourceFiles.get(dependency),
          dependency,
          assetManifest
        )),
      }))
      .sort((left, right) => compareText(left.path, right.path));
    routeEntries[route.route] = {
      buildVersion: BUILD_VERSION,
      canonicalHref: bundle.canonicalHref,
      gzipBytes: bundle.gzipBytes,
      minifiedGzipBytes: bundle.minifiedGzipBytes,
      minifiedHref: bundle.minifiedHref,
      orderedInputs: [...route.orderedInputs],
      purgeContentSha256: sha256(normalizeManagedHtmlAssetReferences(
        route.finalHtml,
        route.source.absolutePath,
        assetManifest
      )),
      rejectedSelectors: [...bundle.rejectedSelectors],
      signatureHash: route.signatureHash,
      sourceDependencies,
      sourceHtml: route.source.relativePath,
      sourceHtmlSha256: sha256(normalizeManagedHtmlAssetReferences(
        finalSource,
        route.source.absolutePath,
        assetManifest
      )),
    };
  }

  const bundleEntries = {};
  for (const bundle of bundles) {
    bundleEntries[`site-${bundle.hash}`] = {
      canonicalHref: bundle.canonicalHref,
      dependencies: bundle.dependencies,
      droppedRemoteFontImports: bundle.droppedImports,
      gzipBytes: bundle.gzipBytes,
      memberRoutes: bundle.routes.map((route) => route.route),
      memberSourceHtml: [...new Set(bundle.routes.map((route) => route.source.relativePath))].sort(compareText),
      minifiedBytes: bundle.minifiedBytes,
      minifiedGzipBytes: bundle.minifiedGzipBytes,
      minifiedHref: bundle.minifiedHref,
      orderedInputs: [...bundle.orderedInputs],
      rawBytes: bundle.rawBytes,
      rejectedSelectors: [...bundle.rejectedSelectors],
      signatureHash: bundle.hash,
    };
  }

  const manifest = {
    buildVersion: BUILD_VERSION,
    bundles: bundleEntries,
    generatedBy: 'tools/build-route-styles.mjs',
    routes: routeEntries,
    runtimeSafelist: [...RUNTIME_SAFELIST],
    schemaVersion: SCHEMA_VERSION,
    sharedStylesheets: [FONTS_STYLESHEET, SITE_SHELL_STYLESHEET, ICONS_STYLESHEET],
    toolchain: {
      bootstrap: BOOTSTRAP_VERSION,
      purgecss: PURGECSS_VERSION,
      sass: SASS_VERSION,
    },
  };
  const rejectedReport = {
    buildVersion: BUILD_VERSION,
    bundles: Object.fromEntries(bundles.map((bundle) => [
      `site-${bundle.hash}`,
      {
        memberRoutes: bundle.routes.map((route) => route.route),
        rejectedCount: bundle.rejectedSelectors.length,
        rejectedSelectors: [...bundle.rejectedSelectors],
        signatureHash: bundle.hash,
      },
    ])),
    generatedBy: 'tools/build-route-styles.mjs',
    runtimeSafelist: [...RUNTIME_SAFELIST],
    schemaVersion: SCHEMA_VERSION,
    summary: {
      bundleCount: bundles.length,
      rejectedSelectorCount: bundles.reduce((sum, bundle) => sum + bundle.rejectedSelectors.length, 0),
      routeCount: discovered.routes.length,
    },
  };
  return { manifest: stableJson(manifest), rejectedReport: stableJson(rejectedReport) };
};

const expectedWrites = ({ bundles, options, overrides, reports }) => {
  const writes = [];
  for (const bundle of bundles) {
    writes.push({
      contents: bundle.canonicalCss,
      path: path.join(options.paths.outputDirectory, path.basename(bundle.canonicalHref)),
      type: 'bundle',
    });
    writes.push({
      contents: bundle.minifiedCss,
      path: path.join(options.paths.outputDirectory, path.basename(bundle.minifiedHref)),
      type: 'bundle',
    });
  }
  for (const [sourcePath, contents] of overrides) {
    writes.push({ contents, path: sourcePath, type: 'html' });
  }
  writes.push({ contents: reports.rejectedReport, path: options.paths.rejectedReport, type: 'report' });
  writes.push({ contents: reports.manifest, path: options.paths.manifest, type: 'manifest' });
  return writes.sort((left, right) => compareText(left.path, right.path));
};

const checkWrites = async (writes, assetManifest) => {
  const stale = [];
  for (const write of writes) {
    let current = null;
    try {
      assertSafeExistingFile(write.path, `Expected ${write.type}`);
      current = await fs.readFile(write.path, 'utf8');
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    const fingerprintEquivalent = current !== null && write.type === 'html' && (
      normalizeManagedHtmlAssetReferences(current, write.path, assetManifest) ===
      normalizeManagedHtmlAssetReferences(write.contents, write.path, assetManifest)
    );
    if (current !== write.contents && !fingerprintEquivalent) {
      stale.push(`${relativeLabel(write.path)} (${current === null ? 'missing' : 'stale'})`);
    }
  }
  if (stale.length) {
    throw new Error(
      `Route styles or HTML ownership are not current (${stale.length}):\n- ${stale.join('\n- ')}\n` +
      'Run node tools/build-route-styles.mjs --write.'
    );
  }
};

const writeAtomically = async (writes, originalSources) => {
  // Detect generator/editor races before the first mutation.
  for (const [sourcePath, original] of originalSources) {
    const current = await fs.readFile(assertSafeExistingFile(sourcePath, 'HTML freshness input'), 'utf8');
    if (current !== original) {
      throw new Error(`HTML source changed during the route-style build: ${relativeLabel(sourcePath)}`);
    }
  }
  // Per-file atomic renames; the manifest is deliberately last so it never
  // advertises bundle/HTML bytes that were not successfully written.
  const ordered = [...writes].sort((left, right) => {
    const rank = { bundle: 0, html: 1, report: 2, manifest: 3 };
    return rank[left.type] - rank[right.type] || compareText(left.path, right.path);
  });
  for (const write of ordered) {
    assertSafeOutputPath(write.path, `Route-style ${write.type} output`);
    atomicWriteFile(write.path, write.contents);
  }
};

const pruneStaleBundles = async ({ bundles, options, writes }) => {
  // Recompute and verify every output first. A stale/incomplete manifest must
  // never become an authorization to delete files.
  await checkWrites(writes, await loadAssetManifest(options.paths.assetManifest));
  const keep = new Set(bundles.flatMap((bundle) => [
    path.basename(bundle.canonicalHref), path.basename(bundle.minifiedHref),
  ]));
  const candidates = [];
  for (const entry of await fs.readdir(options.paths.outputDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !/^site-[0-9a-f]{12}(?:\.min)?\.css$/i.test(entry.name) || keep.has(entry.name)) continue;
    candidates.push(path.join(options.paths.outputDirectory, entry.name));
  }
  // checkWrites has proven active source/SSI ownership and the expected
  // manifest. Any candidate not in that manifest is therefore unreferenced.
  for (const candidate of candidates.sort(compareText)) {
    assertSafeExistingFile(candidate, 'Stale route bundle candidate');
    await fs.unlink(candidate);
  }
  console.log(`Pruned ${candidates.length} stale route bundle(s).`);
};

const main = async () => {
  const options = parseArgs();
  if (options.help) {
    console.log(usage);
    return;
  }
  assertSafeExistingFile(options.paths.assetManifest, 'Asset hash manifest');
  assertSafeExistingFile(options.paths.bootstrapCss, 'Selective Bootstrap CSS');
  const [{ PurgeCSS, sass }, assetManifest, priorManifest] = await Promise.all([
    importToolchain(),
    loadAssetManifest(options.paths.assetManifest),
    readPriorManifest(options.paths.manifest),
  ]);
  const discovered = await discoverRoutes({ assetManifest, priorManifest });
  const overrides = prepareHtmlMigrations({ assetManifest, discovered, priorManifest });
  await expandFinalHtml(discovered, overrides);
  const groups = groupRoutes(discovered.routes);
  const bundles = await buildBundles({
    PurgeCSS,
    assetManifest,
    bootstrapCssPath: options.paths.bootstrapCss,
    groups,
    sass,
  });
  const reports = buildReports({ assetManifest, bundles, discovered, overrides });
  const writes = expectedWrites({ bundles, options, overrides, reports });

  if (options.mode === '--check') {
    await checkWrites(writes, assetManifest);
    console.log(
      `Route styles are current (${discovered.routes.length} routes, ${bundles.length} bundles; ` +
      'HTML ownership verified).'
    );
    return;
  }
  if (options.mode === '--prune-stale') {
    await pruneStaleBundles({ bundles, options, writes });
    return;
  }
  await writeAtomically(writes, discovered.sourceFiles);
  console.log(
    `Wrote ${bundles.length} route bundles for ${discovered.routes.length} routes and migrated ` +
    `${overrides.size} HTML/SSI sources. Stale generated route files were not deleted; ` +
    'scripts/qa-css-route-bundles.mjs reports them for later cleanup.'
  );
};

export {
  ALLOWED_EXTERNAL_FUNCTIONAL_STYLESHEETS,
  BOOTSTRAP_INPUT,
  BUILD_VERSION,
  FONTS_STYLESHEET,
  ICONS_STYLESHEET,
  LEXEND_FONT,
  RUNTIME_SAFELIST,
  SCHEMA_VERSION,
  SITE_SHELL_STYLESHEET,
  analyzeRouteStyles,
  buildBundles,
  buildCombinedCss,
  buildReports,
  classifyStylesheet,
  discoverRoutes,
  expandFinalHtml,
  groupRoutes,
  migrateHtmlSource,
  parseArgs,
  prepareHtmlMigrations,
  signatureHash,
};

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
