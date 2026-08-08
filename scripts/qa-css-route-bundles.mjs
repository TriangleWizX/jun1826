#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ALLOWED_EXTERNAL_FUNCTIONAL_STYLESHEETS,
  BUILD_VERSION,
  FONTS_STYLESHEET,
  ICONS_STYLESHEET,
  LEXEND_FONT,
  RUNTIME_SAFELIST,
  SCHEMA_VERSION,
  SITE_SHELL_STYLESHEET,
  signatureHash,
} from '../tools/build-route-styles.mjs';
import parser from '../tools/lib/css-asset-parser.cjs';

const {
  ROOT,
  assertSafeExistingFile,
  canonicalizeLocalAsset,
  compareText,
  createSsiExpander,
  gzipBytes,
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
const DEFAULT_MANIFEST = 'src/assets/data/route-style-manifest.json';
const DEFAULT_REJECTED_REPORT = 'src/assets/data/route-style-rejected-selectors.json';
const DEFAULT_ASSET_MANIFEST = 'src/assets/data/asset-hash-manifest.json';
const DEFAULT_OUTPUT_DIRECTORY = 'src/assets/css/routes';
const ROUTE_BUNDLE_RE = /^\/assets\/css\/routes\/site-([0-9a-f]{12})\.min\.css$/i;
const GENERATED_FILE_RE = /^site-[0-9a-f]{12}(?:\.min)?\.css$/i;

const usage = `Usage: node scripts/qa-css-route-bundles.mjs [options]

Options:
  --manifest=<path>         Route-style manifest
  --rejected-report=<path>  Aggregate rejected-selector report
  --asset-manifest=<path>   Asset fingerprint manifest
  --output-dir=<path>       Generated route bundle directory`;

const parseArgs = (args = process.argv.slice(2)) => {
  let manifest = DEFAULT_MANIFEST;
  let rejectedReport = DEFAULT_REJECTED_REPORT;
  let assetManifest = DEFAULT_ASSET_MANIFEST;
  let outputDirectory = DEFAULT_OUTPUT_DIRECTORY;
  let help = false;
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') help = true;
    else if (arg.startsWith('--manifest=')) manifest = arg.slice('--manifest='.length);
    else if (arg.startsWith('--rejected-report=')) rejectedReport = arg.slice('--rejected-report='.length);
    else if (arg.startsWith('--asset-manifest=')) assetManifest = arg.slice('--asset-manifest='.length);
    else if (arg.startsWith('--output-dir=')) outputDirectory = arg.slice('--output-dir='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (help && args.length > 1) throw new Error('--help cannot be combined with other arguments.');
  return {
    help,
    paths: {
      assetManifest: resolveWorkspacePath(assetManifest, '--asset-manifest'),
      manifest: resolveWorkspacePath(manifest, '--manifest'),
      outputDirectory: path.dirname(resolveWorkspacePath(`${outputDirectory}/.qa-probe`, '--output-dir')),
      rejectedReport: resolveWorkspacePath(rejectedReport, '--rejected-report'),
    },
  };
};

const isRemoteFontUrl = (href) => {
  try {
    const parsed = new URL(href);
    return parsed.hostname === 'fonts.googleapis.com' ||
      parsed.hostname === 'fonts.gstatic.com' ||
      /(?:font|geist)/i.test(parsed.pathname);
  } catch {
    return false;
  }
};

const assertSortedUnique = (values, label, failures) => {
  if (!Array.isArray(values)) {
    failures.push(`${label} must be an array`);
    return;
  }
  const expected = [...new Set(values)].sort(compareText);
  if (stableJson(values) !== stableJson(expected)) failures.push(`${label} must be sorted and unique`);
};

const classifyFinalStylesheets = ({ assetManifest, html, ownerFile, label, failures }) => {
  const local = [];
  const external = [];
  for (const link of parseActiveStylesheets(html)) {
    if (/^https?:|^\/\//i.test(link.href)) {
      if (isRemoteFontUrl(link.href)) failures.push(`${label}: remote font stylesheet remains: ${link.href}`);
      else if (/bootstrap@5\.3\.3\/dist\/css/i.test(link.href)) {
        failures.push(`${label}: Bootstrap CDN stylesheet remains`);
      } else if (!ALLOWED_EXTERNAL_FUNCTIONAL_STYLESHEETS.includes(link.href)) {
        failures.push(`${label}: unapproved remote stylesheet: ${link.href}`);
      } else external.push(link.href);
      continue;
    }
    try {
      const asset = canonicalizeLocalAsset(link.href, ownerFile, assetManifest);
      local.push({ ...asset, index: link.index, sourceOffset: link.sourceOffset });
    } catch (error) {
      failures.push(`${label}: ${error.message}`);
    }
  }
  return { external, local };
};

const verifyHeadContract = ({ assetManifest, rawHtml, source, routeEntry, failures }) => {
  const active = stripInactiveHtml(rawHtml);
  const open = active.match(/<head\b[^>]*>/i);
  const close = active.match(/<\/head\s*>/i);
  if (!open || open.index === undefined || !close || close.index === undefined) {
    failures.push(`${source.relativePath}: missing active head`);
    return;
  }
  const headStart = open.index + open[0].length;
  const headEnd = close.index;
  const links = scanStartTags(active, 'link').filter((entry) => (
    entry.start >= headStart && entry.end <= headEnd
  ));
  let preloadCount = 0;
  const preconnectFailures = [];
  for (const entry of links) {
    const attributes = parseTagAttributes(entry.tag, 'link');
    const rel = String(attributes.get('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const href = String(attributes.get('href') || '').trim();
    const as = String(attributes.get('as') || '').toLowerCase();
    if (rel.includes('preconnect') && isRemoteFontUrl(href)) preconnectFailures.push(href);
    if (rel.includes('preload') && as === 'font') {
      try {
        const font = canonicalizeLocalAsset(href, source.absolutePath, assetManifest);
        if (
          font?.canonicalHref === LEXEND_FONT &&
          String(attributes.get('type') || '').toLowerCase() === 'font/woff2' &&
          attributes.has('crossorigin')
        ) preloadCount += 1;
        else failures.push(`${source.relativePath}: unexpected font preload ${href}`);
      } catch (error) {
        failures.push(`${source.relativePath}: ${error.message}`);
      }
    }
  }
  if (preloadCount !== 1) failures.push(`${source.relativePath}: expected one Lexend preload; found ${preloadCount}`);
  for (const href of preconnectFailures) failures.push(`${source.relativePath}: remote font preconnect remains: ${href}`);

  const styles = classifyFinalStylesheets({
    assetManifest,
    failures,
    html: rawHtml,
    label: source.relativePath,
    ownerFile: source.absolutePath,
  }).local;
  const hrefs = styles.map((asset) => asset.canonicalHref);
  for (const sharedHref of [FONTS_STYLESHEET, SITE_SHELL_STYLESHEET, ICONS_STYLESHEET]) {
    const count = hrefs.filter((href) => href === sharedHref).length;
    if (count !== 1) failures.push(`${source.relativePath}: expected one ${sharedHref}; found ${count}`);
  }
  const routeBundles = hrefs.filter((href) => ROUTE_BUNDLE_RE.test(href));
  if (routeBundles.length !== 1 || routeBundles[0] !== routeEntry.minifiedHref) {
    failures.push(
      `${source.relativePath}: route bundle ownership mismatch (expected ${routeEntry.minifiedHref}, ` +
      `found ${routeBundles.join(', ') || 'none'})`
    );
  }
  const allowed = new Set([
    routeEntry.minifiedHref,
    FONTS_STYLESHEET,
    SITE_SHELL_STYLESHEET,
    ICONS_STYLESHEET,
  ]);
  for (const href of hrefs) {
    if (!allowed.has(href)) failures.push(`${source.relativePath}: unowned local stylesheet remains: ${href}`);
  }
  if (hrefs.at(-2) !== FONTS_STYLESHEET || hrefs.at(-1) !== SITE_SHELL_STYLESHEET) {
    failures.push(`${source.relativePath}: fonts.css then site-shell.css must be the final stylesheets in head`);
  }
};

const verifyBundle = async ({ bundleId, entry, outputDirectory, failures }) => {
  const expectedId = `site-${entry.signatureHash}`;
  if (bundleId !== expectedId) failures.push(`${bundleId}: key must be ${expectedId}`);
  const expectedCanonical = `/assets/css/routes/${expectedId}.css`;
  const expectedMinified = `/assets/css/routes/${expectedId}.min.css`;
  if (entry.canonicalHref !== expectedCanonical) failures.push(`${bundleId}: canonicalHref mismatch`);
  if (entry.minifiedHref !== expectedMinified) failures.push(`${bundleId}: minifiedHref mismatch`);
  if (signatureHash(entry.orderedInputs || []) !== entry.signatureHash) {
    failures.push(`${bundleId}: ordered input signature mismatch`);
  }
  assertSortedUnique(entry.rejectedSelectors, `${bundleId}.rejectedSelectors`, failures);
  for (const [href, byteKey, gzipKey] of [
    [entry.canonicalHref, 'rawBytes', 'gzipBytes'],
    [entry.minifiedHref, 'minifiedBytes', 'minifiedGzipBytes'],
  ]) {
    const absolutePath = path.join(outputDirectory, path.basename(href));
    try {
      assertSafeExistingFile(absolutePath, `Route bundle ${href}`);
      const bytes = await fs.readFile(absolutePath);
      if (bytes.length !== entry[byteKey]) failures.push(`${bundleId}: ${byteKey} is stale`);
      if (gzipBytes(bytes) !== entry[gzipKey]) failures.push(`${bundleId}: ${gzipKey} is stale`);
    } catch (error) {
      failures.push(`${bundleId}: ${error.message}`);
    }
  }
};

const main = async () => {
  const options = parseArgs();
  if (options.help) {
    console.log(usage);
    return;
  }
  const [manifest, rejectedReport, assetManifest, inventory] = await Promise.all([
    readJsonFile(options.paths.manifest, 'Route-style manifest'),
    readJsonFile(options.paths.rejectedReport, 'Rejected-selector report'),
    loadAssetManifest(options.paths.assetManifest),
    readSitemapUrls(),
  ]);
  const failures = [];
  const warnings = [];
  if (manifest.schemaVersion !== SCHEMA_VERSION) failures.push('manifest schemaVersion mismatch');
  if (manifest.buildVersion !== BUILD_VERSION) failures.push('manifest buildVersion mismatch');
  if (stableJson(manifest.runtimeSafelist) !== stableJson(RUNTIME_SAFELIST)) {
    failures.push('manifest runtimeSafelist mismatch');
  }
  if (stableJson(manifest.sharedStylesheets) !== stableJson([
    FONTS_STYLESHEET,
    SITE_SHELL_STYLESHEET,
    ICONS_STYLESHEET,
  ])) failures.push('manifest sharedStylesheets mismatch');

  const expectedRoutes = inventory.map((entry) => entry.route).sort(compareText);
  const manifestRoutes = Object.keys(manifest.routes || {}).sort(compareText);
  if (stableJson(expectedRoutes) !== stableJson(manifestRoutes)) failures.push('manifest route inventory is stale');

  const expander = createSsiExpander();
  for (const route of inventory) {
    const entry = manifest.routes?.[route.route];
    if (!entry) continue;
    const source = routeToSourceHtml(route.route);
    if (entry.sourceHtml !== source.relativePath) failures.push(`${route.route}: sourceHtml mismatch`);
    const rawHtml = await fs.readFile(source.absolutePath, 'utf8');
    const normalizedRawHtml = normalizeManagedHtmlAssetReferences(rawHtml, source.absolutePath, assetManifest);
    if (sha256(normalizedRawHtml) !== entry.sourceHtmlSha256) failures.push(`${route.route}: source HTML is stale`);
    const expandedHtml = await expander.expandFile(source.absolutePath);
    const normalizedExpandedHtml = normalizeManagedHtmlAssetReferences(
      expandedHtml,
      source.absolutePath,
      assetManifest
    );
    if (sha256(normalizedExpandedHtml) !== entry.purgeContentSha256) {
      failures.push(`${route.route}: expanded SSI content is stale`);
    }
    if (entry.buildVersion !== BUILD_VERSION) failures.push(`${route.route}: route buildVersion mismatch`);
    if (entry.signatureHash !== signatureHash(entry.orderedInputs || [])) {
      failures.push(`${route.route}: ordered input signature mismatch`);
    }
    verifyHeadContract({ assetManifest, failures, rawHtml, routeEntry: entry, source });
    const expandedStyles = classifyFinalStylesheets({
      assetManifest,
      failures,
      html: expandedHtml,
      label: `${route.route} expanded SSI`,
      ownerFile: source.absolutePath,
    }).local.map((asset) => asset.canonicalHref);
    const leadingStyles = expandedStyles.slice(0, -2).sort(compareText);
    const expectedLeading = [entry.minifiedHref, ICONS_STYLESHEET].sort(compareText);
    if (
      stableJson(leadingStyles) !== stableJson(expectedLeading) ||
      expandedStyles.at(-2) !== FONTS_STYLESHEET ||
      expandedStyles.at(-1) !== SITE_SHELL_STYLESHEET
    ) {
      failures.push(`${route.route}: expanded SSI stylesheet ownership/order mismatch`);
    }
    const dependencyMap = new Map((entry.sourceDependencies || []).map((item) => [item.path, item.sha256]));
    for (const dependency of expander.dependencies.get(source.absolutePath) || []) {
      const label = relativeLabel(dependency);
      const dependencyHtml = await fs.readFile(dependency, 'utf8');
      const currentHash = sha256(normalizeManagedHtmlAssetReferences(
        dependencyHtml,
        dependency,
        assetManifest
      ));
      if (dependencyMap.get(label) !== currentHash) failures.push(`${route.route}: dependency hash stale for ${label}`);
      dependencyMap.delete(label);
    }
    for (const label of dependencyMap.keys()) failures.push(`${route.route}: obsolete dependency in manifest: ${label}`);
  }

  const bundleEntries = Object.entries(manifest.bundles || {}).sort(([a], [b]) => compareText(a, b));
  await Promise.all(bundleEntries.map(([bundleId, entry]) => verifyBundle({
    bundleId,
    entry,
    failures,
    outputDirectory: options.paths.outputDirectory,
  })));
  for (const [bundleId, entry] of bundleEntries) {
    const reportEntry = rejectedReport.bundles?.[bundleId];
    if (!reportEntry || stableJson(reportEntry.rejectedSelectors) !== stableJson(entry.rejectedSelectors)) {
      failures.push(`${bundleId}: rejected-selector report mismatch`);
    }
  }
  if (rejectedReport.schemaVersion !== SCHEMA_VERSION || rejectedReport.buildVersion !== BUILD_VERSION) {
    failures.push('rejected-selector report version mismatch');
  }

  const expectedGenerated = new Set(bundleEntries.flatMap(([, entry]) => [
    path.basename(entry.canonicalHref),
    path.basename(entry.minifiedHref),
  ]));
  try {
    for (const entry of await fs.readdir(options.paths.outputDirectory, { withFileTypes: true })) {
      if (entry.isFile() && GENERATED_FILE_RE.test(entry.name) && !expectedGenerated.has(entry.name)) {
        warnings.push(`stale generated route bundle (not deleted): ${entry.name}`);
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  if (failures.length) {
    throw new Error(`qa-css-route-bundles failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  }
  for (const warning of warnings) console.warn(`WARNING: ${warning}`);
  console.log(
    `qa-css-route-bundles passed (${manifestRoutes.length} routes, ${bundleEntries.length} bundles` +
    `${warnings.length ? `, ${warnings.length} cleanup warning(s)` : ''}).`
  );
};

export { classifyFinalStylesheets, parseArgs, verifyHeadContract };

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
