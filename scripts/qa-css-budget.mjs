#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  FONTS_STYLESHEET,
  ICONS_STYLESHEET,
  SITE_SHELL_STYLESHEET,
} from '../tools/build-route-styles.mjs';
import parser from '../tools/lib/css-asset-parser.cjs';

const {
  ROOT,
  assertSafeExistingFile,
  atomicWriteFile,
  canonicalizeLocalAsset,
  compareText,
  createSsiExpander,
  findCssImports,
  gzipBytes,
  loadAssetManifest,
  normalizeManifestAssetHref,
  parseActiveStylesheets,
  parseCssImportPrelude,
  readJsonFile,
  readSitemapUrls,
  relativeLabel,
  resolveWorkspacePath,
  routeToSourceHtml,
  stableJson,
} = parser;

const THIS_FILE = fileURLToPath(import.meta.url);
const STRICT_BUDGET_BYTES = 51_200;
const DEFAULT_MANIFEST = 'src/assets/data/route-style-manifest.json';
const DEFAULT_ASSET_MANIFEST = 'src/assets/data/asset-hash-manifest.json';

const usage = `Usage: node scripts/qa-css-budget.mjs [options]

Options:
  --budget=<bytes>          Strict per-route gzip ceiling (default: ${STRICT_BUDGET_BYTES})
  --manifest=<path>         Route-style manifest
  --asset-manifest=<path>   Asset fingerprint manifest
  --report=<path>           Optional deterministic JSON report output

A route passes only when the summed gzip size of every active local CSS file,
including recursive CSS @imports, is strictly less than the ceiling. Font
binary files referenced by url() are intentionally excluded.`;

const parseArgs = (args = process.argv.slice(2)) => {
  let budget = STRICT_BUDGET_BYTES;
  let manifest = DEFAULT_MANIFEST;
  let assetManifest = DEFAULT_ASSET_MANIFEST;
  let report = null;
  let help = false;
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') help = true;
    else if (arg.startsWith('--budget=')) {
      const value = Number(arg.slice('--budget='.length));
      if (!Number.isSafeInteger(value) || value <= 0) throw new Error('--budget must be a positive integer.');
      budget = value;
    } else if (arg.startsWith('--manifest=')) manifest = arg.slice('--manifest='.length);
    else if (arg.startsWith('--asset-manifest=')) assetManifest = arg.slice('--asset-manifest='.length);
    else if (arg.startsWith('--report=')) report = arg.slice('--report='.length);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (help && args.length > 1) throw new Error('--help cannot be combined with other arguments.');
  const parsed = {
    budget,
    help,
    paths: {
      assetManifest: resolveWorkspacePath(assetManifest, '--asset-manifest'),
      manifest: resolveWorkspacePath(manifest, '--manifest'),
      report: report ? resolveWorkspacePath(report, '--report') : null,
    },
  };
  if (
    parsed.paths.report &&
    (parsed.paths.report === parsed.paths.assetManifest || parsed.paths.report === parsed.paths.manifest)
  ) {
    throw new Error('--report cannot overwrite a manifest input.');
  }
  return parsed;
};

const isExternalReference = (href) => /^https?:|^\/\//i.test(href);

const createCssMeasurer = (assetManifest) => {
  const fileMetricCache = new Map();

  const ownMetric = async (asset) => {
    if (fileMetricCache.has(asset.canonicalHref)) return fileMetricCache.get(asset.canonicalHref);
    const promise = (async () => {
      assertSafeExistingFile(asset.absolutePath, `CSS budget asset ${asset.canonicalHref}`);
      const bytes = await fs.readFile(asset.absolutePath);
      return Object.freeze({
        bytes: bytes.length,
        css: bytes.toString('utf8'),
        gzipBytes: gzipBytes(bytes),
      });
    })();
    fileMetricCache.set(asset.canonicalHref, promise);
    return promise;
  };

  const walk = async (asset, state) => {
    if (state.stack.includes(asset.canonicalHref)) {
      throw new Error(`CSS @import cycle in budget graph: ${[...state.stack, asset.canonicalHref].join(' -> ')}`);
    }
    if (state.seen.has(asset.canonicalHref)) return;
    state.seen.add(asset.canonicalHref);
    const metric = await ownMetric(asset);
    state.assets.push({
      bytes: metric.bytes,
      gzipBytes: metric.gzipBytes,
      href: asset.canonicalHref,
      importedBy: state.stack.at(-1) || null,
    });

    const nextState = { ...state, stack: [...state.stack, asset.canonicalHref] };
    for (const imported of findCssImports(metric.css)) {
      const { href } = parseCssImportPrelude(imported.prelude);
      if (isExternalReference(href)) {
        throw new Error(`External CSS @import is outside the local budget: ${asset.canonicalHref} -> ${href}`);
      }
      const child = canonicalizeLocalAsset(href, asset.absolutePath, assetManifest);
      if (!child || path.extname(child.absolutePath).toLowerCase() !== '.css') {
        throw new Error(`Non-CSS @import in ${asset.canonicalHref}: ${href}`);
      }
      await walk(child, nextState);
    }
  };

  return async (activeAssets) => {
    const state = { assets: [], seen: new Set(), stack: [] };
    for (const asset of activeAssets) await walk(asset, state);
    state.assets.sort((left, right) => compareText(left.href, right.href));
    return {
      assets: state.assets,
      gzipBytes: state.assets.reduce((sum, asset) => sum + asset.gzipBytes, 0),
      rawBytes: state.assets.reduce((sum, asset) => sum + asset.bytes, 0),
    };
  };
};

const collectActiveLocalCss = ({ assetManifest, expandedHtml, source }) => {
  const assets = [];
  for (const link of parseActiveStylesheets(expandedHtml)) {
    if (isExternalReference(link.href)) {
      throw new Error(`${source.relativePath} has an external active stylesheet outside the local budget: ${link.href}`);
    }
    const asset = canonicalizeLocalAsset(link.href, source.absolutePath, assetManifest);
    if (!asset || path.extname(asset.absolutePath).toLowerCase() !== '.css') {
      throw new Error(`${source.relativePath} has a non-local CSS stylesheet: ${link.href}`);
    }
    assets.push(asset);
  }
  return assets;
};

const validateRouteManifestAsset = (href, assetManifest, route) => {
  try {
    const canonicalHref = normalizeManifestAssetHref(href, assetManifest);
    const asset = canonicalizeLocalAsset(canonicalHref, path.resolve(ROOT, 'index.html'), assetManifest);
    if (!asset || path.extname(asset.absolutePath).toLowerCase() !== '.css') {
      throw new Error(`not a local CSS file: ${href}`);
    }
    return canonicalHref;
  } catch (error) {
    throw new Error(`route manifest asset ${href} cannot be resolved: ${error.message}`);
  }
};

const main = async () => {
  const options = parseArgs();
  if (options.help) {
    console.log(usage);
    return;
  }
  const [manifest, assetManifest, inventory] = await Promise.all([
    readJsonFile(options.paths.manifest, 'Route-style manifest'),
    loadAssetManifest(options.paths.assetManifest),
    readSitemapUrls(),
  ]);
  const expander = createSsiExpander();
  const measure = createCssMeasurer(assetManifest);
  const failures = [];
  const routeReports = {};

  for (const route of inventory) {
    const routeEntry = manifest.routes?.[route.route];
    if (!routeEntry) {
      failures.push(`${route.route}: missing route-style manifest entry`);
      continue;
    }
    const source = routeToSourceHtml(route.route);
    const expandedHtml = await expander.expandFile(source.absolutePath);
    try {
      const activeAssets = collectActiveLocalCss({ assetManifest, expandedHtml, source });
      const activeHrefs = activeAssets.map((asset) => normalizeManifestAssetHref(asset.canonicalHref, assetManifest));
      const routeHref = validateRouteManifestAsset(routeEntry.minifiedHref, assetManifest, route.route);
      const allowed = new Set([
        routeHref,
        normalizeManifestAssetHref(ICONS_STYLESHEET, assetManifest),
        normalizeManifestAssetHref(FONTS_STYLESHEET, assetManifest),
        normalizeManifestAssetHref(SITE_SHELL_STYLESHEET, assetManifest),
      ]);
      if (activeHrefs.length !== 4 || activeHrefs.some((href) => !allowed.has(href))) {
        failures.push(`${route.route}: expected exactly the four active CSS layers; found ${activeHrefs.join(', ')}`);
      }
      const measurement = await measure(activeAssets);
      routeReports[route.route] = {
        activeStylesheets: activeHrefs,
        cssAssets: measurement.assets,
        gzipBytes: measurement.gzipBytes,
        rawBytes: measurement.rawBytes,
        remainingGzipBytes: options.budget - measurement.gzipBytes - 1,
        sourceHtml: source.relativePath,
      };
      if (measurement.gzipBytes >= options.budget) {
        failures.push(
          `${route.route}: ${measurement.gzipBytes} gzip bytes is not strictly below ${options.budget}`
        );
      }
    } catch (error) {
      failures.push(`${route.route}: ${error.message}`);
    }
  }

  const orderedRoutes = Object.fromEntries(
    Object.entries(routeReports).sort(([left], [right]) => compareText(left, right))
  );
  const totals = Object.values(orderedRoutes).map((entry) => entry.gzipBytes);
  const report = {
    budgetBytesExclusive: options.budget,
    generatedBy: 'scripts/qa-css-budget.mjs',
    routes: orderedRoutes,
    schemaVersion: 1,
    summary: {
      failureCount: failures.length,
      largestRouteGzipBytes: totals.length ? Math.max(...totals) : 0,
      routeCount: inventory.length,
      smallestRouteGzipBytes: totals.length ? Math.min(...totals) : 0,
    },
  };
  if (options.paths.report) atomicWriteFile(options.paths.report, stableJson(report));

  if (failures.length) {
    throw new Error(`qa-css-budget failed (${failures.length}):\n- ${failures.join('\n- ')}`);
  }
  const largest = Object.entries(orderedRoutes)
    .sort(([leftRoute, left], [rightRoute, right]) => (
      right.gzipBytes - left.gzipBytes || compareText(leftRoute, rightRoute)
    ))[0];
  console.log(
    `qa-css-budget passed (${inventory.length} routes; strict < ${options.budget} gzip bytes; ` +
    `largest ${largest ? `${largest[0]} at ${largest[1].gzipBytes}` : 'n/a'}).`
  );
};

export { STRICT_BUDGET_BYTES, collectActiveLocalCss, createCssMeasurer, parseArgs };

if (process.argv[1] && path.resolve(process.argv[1]) === THIS_FILE) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exitCode = 1;
  });
}
