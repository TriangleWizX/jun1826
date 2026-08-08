'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { gzipSync } = require('node:zlib');

const ROOT = path.resolve(__dirname, '..', '..');
const ROOT_REAL = fs.realpathSync(ROOT);
const ASSET_SOURCE_ROOT = path.join(ROOT, 'src', 'assets');
const DEFAULT_ASSET_MANIFEST_PATH = path.join(ASSET_SOURCE_ROOT, 'data', 'asset-hash-manifest.json');
const DEFAULT_SITEMAPS = Object.freeze(['pages-sitemap.xml', 'blog-sitemap.xml']);
const HTML_EXTENSIONS = Object.freeze(['.html', '.shtml']);
const HASHED_ASSET_RE = /\.[0-9a-f]{6}(?=\.[^.]+$)/i;
const BUNDLE_HASH_RE = /\.[0-9a-f]{12}(?=\.(?:min\.)?[^.]+$)/i;

const toPosix = (value) => String(value).split(path.sep).join('/');
const compareText = (left, right) => (left < right ? -1 : left > right ? 1 : 0);
const relativeLabel = (absolutePath) => toPosix(path.relative(ROOT, absolutePath)) || '.';

const isPathInside = (base, candidate, { allowEqual = true } = {}) => {
  const relative = path.relative(base, candidate);
  if (relative === '') return allowEqual;
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};

const lstatIfExists = (absolutePath) => {
  try {
    return fs.lstatSync(absolutePath);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
};

const assertWorkspaceRelativePath = (value, label = 'Workspace path') => {
  if (typeof value !== 'string' || !value || value.includes('\0') || value.includes('\\')) {
    throw new Error(`${label} must be a non-empty workspace-relative POSIX path.`);
  }
  const normalized = path.posix.normalize(value);
  if (
    normalized !== value ||
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value)
  ) {
    throw new Error(`${label} must be a normalized workspace-relative path: ${value}`);
  }
  if (normalized.split('/')[0] === '.git') {
    throw new Error(`${label} cannot be inside .git: ${value}`);
  }
  return normalized;
};

const resolveWorkspacePath = (value, label = 'Workspace path') => {
  const normalized = assertWorkspaceRelativePath(value, label);
  const absolutePath = path.resolve(ROOT, ...normalized.split('/'));
  if (!isPathInside(ROOT, absolutePath, { allowEqual: false })) {
    throw new Error(`${label} escapes the workspace: ${value}`);
  }
  return absolutePath;
};

const assertSafeExistingFile = (value, label = 'Input file') => {
  const absolutePath = path.resolve(value);
  if (!isPathInside(ROOT, absolutePath, { allowEqual: false })) {
    throw new Error(`${label} escapes the workspace: ${value}`);
  }

  const parts = path.relative(ROOT, absolutePath).split(path.sep);
  let cursor = ROOT;
  for (const [index, part] of parts.entries()) {
    cursor = path.join(cursor, part);
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} uses a symbolic link: ${relativeLabel(cursor)}`);
    }
    if (index < parts.length - 1 && !stat.isDirectory()) {
      throw new Error(`${label} has a non-directory parent: ${relativeLabel(cursor)}`);
    }
    if (index === parts.length - 1 && !stat.isFile()) {
      throw new Error(`${label} is not a regular file: ${relativeLabel(cursor)}`);
    }
  }

  const realPath = fs.realpathSync(absolutePath);
  if (!isPathInside(ROOT_REAL, realPath, { allowEqual: false })) {
    throw new Error(`${label} resolves outside the workspace: ${relativeLabel(absolutePath)}`);
  }
  return absolutePath;
};

const assertSafeOutputPath = (value, label = 'Output file') => {
  const absolutePath = path.resolve(value);
  if (!isPathInside(ROOT, absolutePath, { allowEqual: false })) {
    throw new Error(`${label} escapes the workspace: ${value}`);
  }

  const parts = path.relative(ROOT, absolutePath).split(path.sep);
  let cursor = ROOT;
  for (let index = 0; index < parts.length - 1; index += 1) {
    cursor = path.join(cursor, parts[index]);
    const stat = lstatIfExists(cursor);
    if (!stat) break;
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} uses a symbolic-link parent: ${relativeLabel(cursor)}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`${label} has a non-directory parent: ${relativeLabel(cursor)}`);
    }
    const realPath = fs.realpathSync(cursor);
    if (realPath !== ROOT_REAL && !isPathInside(ROOT_REAL, realPath, { allowEqual: false })) {
      throw new Error(`${label} parent resolves outside the workspace: ${relativeLabel(cursor)}`);
    }
  }

  const targetStat = lstatIfExists(absolutePath);
  if (targetStat) {
    if (targetStat.isSymbolicLink()) {
      throw new Error(`${label} is a symbolic link: ${relativeLabel(absolutePath)}`);
    }
    if (!targetStat.isFile()) {
      throw new Error(`${label} is not a regular file: ${relativeLabel(absolutePath)}`);
    }
    const realPath = fs.realpathSync(absolutePath);
    if (!isPathInside(ROOT_REAL, realPath, { allowEqual: false })) {
      throw new Error(`${label} resolves outside the workspace: ${relativeLabel(absolutePath)}`);
    }
  }
  return absolutePath;
};

const ensureSafeDirectory = (value) => {
  const absoluteDirectory = path.resolve(value);
  if (!isPathInside(ROOT, absoluteDirectory, { allowEqual: true })) {
    throw new Error(`Output directory escapes the workspace: ${value}`);
  }
  const parts = path.relative(ROOT, absoluteDirectory).split(path.sep).filter(Boolean);
  let cursor = ROOT;
  for (const part of parts) {
    cursor = path.join(cursor, part);
    const stat = lstatIfExists(cursor);
    if (!stat) fs.mkdirSync(cursor);
    const current = fs.lstatSync(cursor);
    if (current.isSymbolicLink() || !current.isDirectory()) {
      throw new Error(`Unsafe output directory: ${relativeLabel(cursor)}`);
    }
    const realPath = fs.realpathSync(cursor);
    if (realPath !== ROOT_REAL && !isPathInside(ROOT_REAL, realPath, { allowEqual: false })) {
      throw new Error(`Output directory resolves outside the workspace: ${relativeLabel(cursor)}`);
    }
  }
  return absoluteDirectory;
};

let atomicCounter = 0;
const atomicWriteFile = (target, contents, { mode = 0o644 } = {}) => {
  const absoluteTarget = assertSafeOutputPath(target, 'Atomic output target');
  ensureSafeDirectory(path.dirname(absoluteTarget));
  const existing = lstatIfExists(absoluteTarget);
  const outputMode = existing ? existing.mode & 0o777 : mode;
  const temporary = path.join(
    path.dirname(absoluteTarget),
    `.${path.basename(absoluteTarget)}.route-style-tmp-${process.pid}-${atomicCounter++}`
  );
  assertSafeOutputPath(temporary, 'Atomic staging file');

  let descriptor = null;
  try {
    descriptor = fs.openSync(temporary, 'wx', outputMode);
    fs.writeFileSync(descriptor, contents);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = null;
    assertSafeExistingFile(temporary, 'Atomic staging file');
    assertSafeOutputPath(absoluteTarget, 'Atomic output target');
    fs.renameSync(temporary, absoluteTarget);
  } finally {
    if (descriptor !== null) {
      try {
        fs.closeSync(descriptor);
      } catch {
        // Keep the original write error.
      }
    }
    const temporaryStat = lstatIfExists(temporary);
    if (temporaryStat && temporaryStat.isFile() && !temporaryStat.isSymbolicLink()) {
      fs.unlinkSync(temporary);
    }
  }
};

const canonicalizeJson = (value) => {
  if (Array.isArray(value)) return value.map(canonicalizeJson);
  if (!value || typeof value !== 'object') return value;
  const result = {};
  for (const key of Object.keys(value).sort(compareText)) {
    result[key] = canonicalizeJson(value[key]);
  }
  return result;
};

const stableJson = (value) => `${JSON.stringify(canonicalizeJson(value), null, 2)}\n`;
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const gzipBytes = (value) => gzipSync(Buffer.isBuffer(value) ? value : Buffer.from(value), { level: 9 }).length;

const readJsonFile = async (absolutePath, label = 'JSON file') => {
  const safePath = assertSafeExistingFile(absolutePath, label);
  let parsed;
  try {
    parsed = JSON.parse(await fsp.readFile(safePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to parse ${relativeLabel(safePath)}: ${error.message}`, { cause: error });
  }
  return parsed;
};

const splitUrlSuffix = (value) => {
  const query = value.indexOf('?');
  const fragment = value.indexOf('#');
  const indexes = [query, fragment].filter((index) => index >= 0);
  const splitAt = indexes.length ? Math.min(...indexes) : -1;
  return splitAt < 0
    ? { pathname: value, suffix: '' }
    : { pathname: value.slice(0, splitAt), suffix: value.slice(splitAt) };
};

const decodeMarkupValue = (value) => String(value || '')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&apos;|&#39;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&#x([0-9a-f]+);/gi, (match, hexadecimal) => {
    const codePoint = Number.parseInt(hexadecimal, 16);
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

const loadAssetManifest = async (manifestPath = DEFAULT_ASSET_MANIFEST_PATH) => {
  const parsed = await readJsonFile(manifestPath, 'Asset hash manifest');
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !parsed.assets) {
    throw new Error('Asset hash manifest must contain an assets object.');
  }
  if (typeof parsed.assets !== 'object' || Array.isArray(parsed.assets)) {
    throw new Error('Asset hash manifest assets must be an object.');
  }

  const assets = new Map();
  const reverse = new Map();
  for (const [canonicalHref, fingerprintedHref] of Object.entries(parsed.assets)) {
    if (
      typeof canonicalHref !== 'string' ||
      typeof fingerprintedHref !== 'string' ||
      !canonicalHref.startsWith('/') ||
      !fingerprintedHref.startsWith('/') ||
      canonicalHref.includes('\\') ||
      fingerprintedHref.includes('\\')
    ) {
      throw new Error(`Invalid asset hash manifest entry: ${canonicalHref}`);
    }
    const prior = reverse.get(fingerprintedHref);
    if (prior && prior !== canonicalHref) {
      throw new Error(`Asset hash manifest target is ambiguous: ${fingerprintedHref}`);
    }
    assets.set(canonicalHref, fingerprintedHref);
    reverse.set(fingerprintedHref, canonicalHref);
  }
  return Object.freeze({ assets, reverse, path: path.resolve(manifestPath) });
};

// Return the manifest's stable identity for either spelling of an asset URL.
// The unhashed spelling is also accepted for legacy files when that source is
// present; callers still use the fingerprinted target for the physical file.
const normalizeManifestAssetHref = (rawHref, manifest) => {
  const href = splitUrlSuffix(decodeMarkupValue(String(rawHref || '').trim())).pathname;
  if (!href.startsWith('/') || !manifest) return href;
  if (manifest.reverse.has(href)) return manifest.reverse.get(href);
  if (manifest.assets.has(href)) return href;
  const candidate = assetPathForHref(href);
  if (lstatIfExists(candidate)?.isFile()) return href;
  const basename = path.basename(candidate);
  if (BUNDLE_HASH_RE.test(basename)) {
    const canonicalHref = `${path.posix.dirname(href)}/${basename.replace(BUNDLE_HASH_RE, '')}`;
    if (lstatIfExists(assetPathForHref(canonicalHref))?.isFile()) return canonicalHref;
  }
  return href;
};

// Assets are authored under src/assets but deliberately retain /assets public
// URLs. Keeping this translation here makes generators and QA use one owner.
const rootHrefForFile = (absolutePath) => {
  const resolved = path.resolve(absolutePath);
  if (isPathInside(ASSET_SOURCE_ROOT, resolved, { allowEqual: false })) {
    return `/assets/${toPosix(path.relative(ASSET_SOURCE_ROOT, resolved))}`;
  }
  return `/${toPosix(path.relative(ROOT, resolved))}`;
};

const assetPathForHref = (href) => {
  const normalized = String(href || '').replace(/^\/+/, '');
  return normalized === 'assets' || normalized.startsWith('assets/')
    ? path.join(ASSET_SOURCE_ROOT, normalized.slice('assets'.length).replace(/^\/+/, ''))
    : path.resolve(ROOT, normalized);
};

const isAbsoluteUrl = (value) => /^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith('//');

const canonicalizeLocalAsset = (
  rawHref,
  ownerFile,
  manifest,
  { canonicalOrigin = 'https://senseisandy.com', mustExist = true } = {}
) => {
  const href = decodeMarkupValue(String(rawHref || '').trim());
  if (!href || href.startsWith('#') || /^data:/i.test(href) || /^var\(/i.test(href)) return null;

  let localValue = href;
  if (isAbsoluteUrl(href)) {
    let parsed;
    try {
      parsed = new URL(href, canonicalOrigin);
    } catch {
      throw new Error(`Invalid asset URL: ${href}`);
    }
    const canonical = new URL(canonicalOrigin);
    if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) return null;
    localValue = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  const { pathname: encodedPathname, suffix } = splitUrlSuffix(localValue);
  let decodedPathname;
  try {
    decodedPathname = decodeURIComponent(encodedPathname);
  } catch {
    throw new Error(`Asset URL has invalid percent encoding: ${href}`);
  }
  if (!decodedPathname || decodedPathname.includes('\0') || decodedPathname.includes('\\')) {
    throw new Error(`Asset URL has an unsafe path: ${href}`);
  }

  const candidate = decodedPathname.startsWith('/')
    ? assetPathForHref(decodedPathname)
    : assetPathForHref(toPosix(path.relative(ROOT, path.resolve(path.dirname(ownerFile), decodedPathname))));
  if (!isPathInside(ROOT, candidate, { allowEqual: false })) {
    throw new Error(`Asset URL escapes the workspace: ${href}`);
  }

  const referencedHref = rootHrefForFile(candidate);
  let canonicalHref = manifest?.reverse?.get(referencedHref) || referencedHref;
  if (HASHED_ASSET_RE.test(path.basename(referencedHref)) && !manifest?.reverse?.has(referencedHref)) {
    const canonicalName = path.basename(referencedHref).replace(/\.[0-9a-f]{6}(?=\.[^.]+$)/i, '');
    const sibling = path.join(path.dirname(candidate), canonicalName);
    if (!fs.existsSync(sibling)) {
      throw new Error(`Fingerprinted asset is missing from the manifest: ${referencedHref}`);
    }
    canonicalHref = rootHrefForFile(sibling);
  }
  let canonicalPath = assetPathForHref(canonicalHref);
  if (!lstatIfExists(canonicalPath)?.isFile() && manifest?.assets?.has(canonicalHref)) {
    const fingerprintedHref = manifest.assets.get(canonicalHref);
    const fingerprintedPath = assetPathForHref(fingerprintedHref);
    if (lstatIfExists(fingerprintedPath)?.isFile()) canonicalPath = fingerprintedPath;
  }
  if (!isPathInside(ROOT, canonicalPath, { allowEqual: false })) {
    throw new Error(`Canonical asset escapes the workspace: ${canonicalHref}`);
  }
  if (mustExist) assertSafeExistingFile(canonicalPath, `Canonical asset ${canonicalHref}`);

  return Object.freeze({
    absolutePath: canonicalPath,
    canonicalHref,
    originalHref: href,
    referencedHref,
    suffix,
    reconstructed: canonicalHref !== referencedHref,
  });
};

const parseTagAttributes = (tag, tagName = '') => {
  const attributes = new Map();
  let index = 1;
  while (index < tag.length && /[a-z0-9:-]/i.test(tag[index])) index += 1;
  if (tagName && tag.slice(1, index).toLowerCase() !== tagName.toLowerCase()) {
    throw new Error(`Expected <${tagName}> tag.`);
  }

  while (index < tag.length) {
    while (index < tag.length && /\s/.test(tag[index])) index += 1;
    if (index >= tag.length || tag[index] === '>' || tag[index] === '/') break;
    const nameStart = index;
    while (index < tag.length && !/[\s=/>]/.test(tag[index])) index += 1;
    const name = tag.slice(nameStart, index).toLowerCase();
    if (!name) throw new Error(`Malformed attribute in ${tag.slice(0, 80)}.`);
    while (index < tag.length && /\s/.test(tag[index])) index += 1;

    let value = '';
    if (tag[index] === '=') {
      index += 1;
      while (index < tag.length && /\s/.test(tag[index])) index += 1;
      const quote = tag[index] === '"' || tag[index] === "'" ? tag[index++] : null;
      const valueStart = index;
      if (quote) {
        while (index < tag.length && tag[index] !== quote) index += 1;
        if (index >= tag.length) throw new Error(`Unclosed ${name} attribute in <${tagName}>.`);
        value = tag.slice(valueStart, index);
        index += 1;
      } else {
        while (index < tag.length && !/[\s>]/.test(tag[index])) index += 1;
        value = tag.slice(valueStart, index);
      }
    }
    attributes.set(name, decodeMarkupValue(value));
  }
  return attributes;
};

const scanStartTags = (html, tagName) => {
  const lower = html.toLowerCase();
  const needle = `<${tagName.toLowerCase()}`;
  const tags = [];
  let cursor = 0;
  while (cursor < html.length) {
    const start = lower.indexOf(needle, cursor);
    if (start < 0) break;
    const boundary = lower[start + needle.length];
    if (boundary && !/[\s/>]/.test(boundary)) {
      cursor = start + needle.length;
      continue;
    }
    let quote = null;
    let escaped = false;
    let end = start + needle.length;
    for (; end < html.length; end += 1) {
      const character = html[end];
      if (quote) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === quote) quote = null;
      } else if (character === '"' || character === "'") quote = character;
      else if (character === '>') break;
    }
    if (end >= html.length) throw new Error(`Unclosed <${tagName}> tag.`);
    tags.push({ end: end + 1, start, tag: html.slice(start, end + 1) });
    cursor = end + 1;
  }
  return tags;
};

const maskMarkup = (value) => value.replace(/[^\r\n]/g, ' ');

const stripInactiveHtml = (html) => String(html || '')
  .replace(/<!--[\s\S]*?(?:-->|$)/g, maskMarkup)
  .replace(/<noscript\b[^>]*>[\s\S]*?(?:<\/noscript\s*>|$)/gi, maskMarkup)
  .replace(/<template\b[^>]*>[\s\S]*?(?:<\/template\s*>|$)/gi, maskMarkup)
  .replace(/<script\b[^>]*>[\s\S]*?(?:<\/script\s*>|$)/gi, maskMarkup);

const maskInactiveHtmlAssetText = (html) => {
  let masked = String(html || '').replace(/<!--[\s\S]*?(?:-->|$)/g, maskMarkup);
  masked = masked.replace(/<noscript\b[^>]*>[\s\S]*?(?:<\/noscript\s*>|$)/gi, maskMarkup);
  masked = masked.replace(/<template\b[^>]*>[\s\S]*?(?:<\/template\s*>|$)/gi, maskMarkup);
  // A script element's src is active markup; href/src-shaped strings in its
  // body are not. Keep the opening tag at its original offsets.
  return masked.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>|$)/gi,
    (match, opening, body, closing) => opening + maskMarkup(body + closing)
  );
};

const normalizeManagedHtmlAssetReferences = (html, ownerFile, manifest) => {
  const source = String(html || '');
  const masked = maskInactiveHtmlAssetText(source);
  const attributePattern = /(\b(?:href|src)\s*=\s*)(["'])([\s\S]*?)\2/gi;
  let cursor = 0;
  let output = '';
  let match;
  while ((match = attributePattern.exec(masked))) {
    const valueStart = match.index + match[1].length + 1;
    const valueEnd = valueStart + match[3].length;
    const rawValue = source.slice(valueStart, valueEnd);
    output += source.slice(cursor, valueStart);
    let normalized = rawValue;
    try {
      const asset = canonicalizeLocalAsset(rawValue, ownerFile, manifest, { mustExist: false });
      if (asset && manifest.assets.has(asset.canonicalHref)) {
        normalized = `${asset.canonicalHref}${asset.suffix}`;
      }
    } catch {
      // Invalid or non-local values remain byte-for-byte unchanged; their
      // owning validation reports the actionable error separately.
    }
    output += normalized;
    cursor = valueEnd;
  }
  output += source.slice(cursor);
  return output;
};

const parseActiveStylesheets = (expandedHtml) => {
  const activeHtml = stripInactiveHtml(expandedHtml);
  const stylesheets = [];
  for (const { end, tag, start } of scanStartTags(activeHtml, 'link')) {
    const attributes = parseTagAttributes(tag, 'link');
    if (attributes.has('disabled')) continue;
    const rel = String(attributes.get('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    const as = String(attributes.get('as') || '').toLowerCase();
    const href = String(attributes.get('href') || '').trim();
    if (!href) continue;
    const stylesheet = rel.includes('stylesheet');
    // A plain style preload warms the cache but does not apply CSS. Treat it
    // as an active stylesheet only when an onload handler promotes it.
    const asynchronousStylesheet = rel.includes('preload') && as === 'style' && attributes.has('onload');
    if (!stylesheet && !asynchronousStylesheet) continue;
    stylesheets.push(Object.freeze({
      asynchronous: asynchronousStylesheet && !stylesheet,
      attributes,
      endOffset: end,
      href,
      index: stylesheets.length,
      sourceOffset: start,
      tag,
    }));
  }
  return stylesheets;
};

const resolveVirtualTarget = (target) => {
  if (typeof target !== 'string' || !target.startsWith('/') || target.includes('?') || target.includes('#')) {
    throw new Error(`SSI virtual target must be a root-relative path without a query or fragment: ${target}`);
  }
  let decoded;
  try {
    decoded = decodeURIComponent(target);
  } catch {
    throw new Error(`SSI virtual target has invalid percent encoding: ${target}`);
  }
  if (!decoded || decoded.includes('\0') || decoded.includes('\\')) {
    throw new Error(`SSI virtual target has an unsafe path: ${target}`);
  }
  const normalized = path.posix.normalize(decoded.replace(/^\/+/, ''));
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`SSI virtual target escapes the workspace: ${target}`);
  }
  const candidates = [
    normalized,
    `${normalized}.html`,
    `${normalized}.shtml`,
    path.posix.join(normalized, 'index.html'),
    path.posix.join(normalized, 'index.shtml'),
  ];
  for (const candidate of candidates) {
    const absolutePath = path.resolve(ROOT, ...candidate.split('/'));
    const stat = lstatIfExists(absolutePath);
    if (!stat) continue;
    return assertSafeExistingFile(absolutePath, `SSI include ${target}`);
  }
  throw new Error(`SSI virtual target does not exist: ${target}`);
};

const parseSsiDirective = (directive, sourceLabel) => {
  const trimmed = directive.trim();
  const nameMatch = trimmed.match(/^([a-z][a-z0-9_-]*)\b/i);
  if (!nameMatch) throw new Error(`Malformed SSI directive in ${sourceLabel}.`);
  const name = nameMatch[1].toLowerCase();
  const rest = trimmed.slice(nameMatch[0].length).trim();
  if (name === 'config') {
    if (!/^errmsg\s*=\s*(["'])(?:[^"']*)\1\s*$/i.test(rest)) {
      throw new Error(`SSI #config must contain exactly one quoted errmsg= value in ${sourceLabel}.`);
    }
    return { type: 'config' };
  }
  if (name !== 'include') {
    throw new Error(`Unsupported SSI directive #${nameMatch[1]} in ${sourceLabel}.`);
  }
  if (/\bfile\s*=/i.test(rest)) {
    throw new Error(`SSI file= includes are not allowed in ${sourceLabel}.`);
  }
  const match = rest.match(/^virtual\s*=\s*(["'])([^"']+)\1\s*$/i);
  if (!match) {
    throw new Error(`SSI include must contain exactly one quoted virtual= target in ${sourceLabel}.`);
  }
  return { target: match[2], type: 'include' };
};

const createSsiExpander = ({ overrides = new Map() } = {}) => {
  const cache = new Map();
  const dependencies = new Map();

  const expandFile = async (file, stack = []) => {
    const absolutePath = assertSafeExistingFile(file, 'SSI source');
    if (stack.includes(absolutePath)) {
      const chain = [...stack, absolutePath].map(relativeLabel).join(' -> ');
      throw new Error(`SSI include cycle detected: ${chain}`);
    }
    if (stack.length >= 64) throw new Error(`SSI include depth exceeded at ${relativeLabel(absolutePath)}.`);
    if (cache.has(absolutePath)) return cache.get(absolutePath);

    const source = overrides.has(absolutePath)
      ? String(overrides.get(absolutePath))
      : await fsp.readFile(absolutePath, 'utf8');
    const nextStack = [...stack, absolutePath];
    const includedFiles = new Set([absolutePath]);
    let output = '';
    let cursor = 0;

    while (cursor < source.length) {
      const start = source.indexOf('<!--#', cursor);
      if (start < 0) {
        output += source.slice(cursor);
        break;
      }
      output += source.slice(cursor, start);
      const end = source.indexOf('-->', start + 5);
      if (end < 0) throw new Error(`Unclosed SSI directive in ${relativeLabel(absolutePath)}.`);
      const directive = source.slice(start + 5, end);
      const parsedDirective = parseSsiDirective(directive, relativeLabel(absolutePath));
      if (parsedDirective.type === 'include') {
        const includePath = resolveVirtualTarget(parsedDirective.target);
        const expanded = await expandFile(includePath, nextStack);
        output += expanded;
        includedFiles.add(includePath);
        for (const dependency of dependencies.get(includePath) || []) includedFiles.add(dependency);
      }
      cursor = end + 3;
    }

    cache.set(absolutePath, output);
    dependencies.set(absolutePath, Object.freeze([...includedFiles].sort(compareText)));
    return output;
  };

  return Object.freeze({ cache, dependencies, expandFile });
};

const decodeXmlValue = (value) => decodeMarkupValue(value).trim();

const readSitemapUrls = async ({
  sitemapPaths = DEFAULT_SITEMAPS,
  canonicalOrigin = 'https://senseisandy.com',
} = {}) => {
  const canonical = new URL(canonicalOrigin);
  const visited = new Set();
  const routes = new Map();

  const visit = async (relativePath) => {
    const normalized = assertWorkspaceRelativePath(relativePath, 'Sitemap path');
    if (visited.has(normalized)) return;
    visited.add(normalized);
    const absolutePath = assertSafeExistingFile(resolveWorkspacePath(normalized), 'Sitemap');
    const xml = await fsp.readFile(absolutePath, 'utf8');

    if (/<sitemapindex\b/i.test(xml)) {
      const blocks = [...xml.matchAll(/<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi)];
      if (!blocks.length) throw new Error(`Sitemap index has no entries: ${normalized}`);
      for (const block of blocks) {
        const loc = block[1].match(/<loc>\s*([^<]+)\s*<\/loc>/i);
        if (!loc) throw new Error(`Sitemap index entry has no <loc>: ${normalized}`);
        const parsed = new URL(decodeXmlValue(loc[1]));
        if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) {
          throw new Error(`Sitemap child uses a non-canonical origin: ${parsed.href}`);
        }
        await visit(parsed.pathname.replace(/^\/+/, ''));
      }
      return;
    }

    if (!/<urlset\b/i.test(xml)) throw new Error(`Unsupported sitemap XML: ${normalized}`);
    const blocks = [...xml.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi)];
    for (const block of blocks) {
      const loc = block[1].match(/<loc>\s*([^<]+)\s*<\/loc>/i);
      if (!loc) throw new Error(`Sitemap URL entry has no <loc>: ${normalized}`);
      const parsed = new URL(decodeXmlValue(loc[1]));
      parsed.hash = '';
      if (parsed.origin.toLowerCase() !== canonical.origin.toLowerCase()) {
        throw new Error(`Sitemap route uses a non-canonical origin: ${parsed.href}`);
      }
      const route = `${parsed.pathname || '/'}${parsed.search}`;
      const prior = routes.get(route);
      if (prior && prior.url !== parsed.href) {
        throw new Error(`Multiple sitemap URLs normalize to route ${route}.`);
      }
      if (prior) prior.sitemaps.add(normalized);
      else routes.set(route, { route, url: parsed.href, sitemaps: new Set([normalized]) });
    }
  };

  for (const sitemapPath of sitemapPaths) await visit(sitemapPath);
  return [...routes.values()]
    .map((entry) => Object.freeze({
      route: entry.route,
      sitemaps: Object.freeze([...entry.sitemaps].sort(compareText)),
      url: entry.url,
    }))
    .sort((left, right) => compareText(left.route, right.route));
};

const routeToSourceHtml = (route) => {
  const parsed = new URL(route, 'https://senseisandy.com');
  let decoded;
  try {
    decoded = decodeURIComponent(parsed.pathname);
  } catch {
    throw new Error(`Route has invalid percent encoding: ${route}`);
  }
  if (decoded.includes('\0') || decoded.includes('\\')) throw new Error(`Route has an unsafe path: ${route}`);
  const clean = decoded.replace(/^\/+|\/+$/g, '');
  const normalized = path.posix.normalize(clean || '.');
  if (normalized === '..' || normalized.startsWith('../')) throw new Error(`Route escapes the workspace: ${route}`);
  const candidates = clean
    ? decoded.endsWith('.html')
      ? [normalized]
      : [`${normalized}/index.html`, `${normalized}.html`]
    : ['index.html'];
  for (const candidate of candidates) {
    const absolutePath = path.resolve(ROOT, ...candidate.split('/'));
    if (!lstatIfExists(absolutePath)) continue;
    return Object.freeze({
      absolutePath: assertSafeExistingFile(absolutePath, `Route source ${route}`),
      relativePath: candidate,
    });
  }
  throw new Error(`No source HTML file exists for sitemap route ${route}.`);
};

const skipCssComment = (source, start) => {
  const end = source.indexOf('*/', start + 2);
  if (end < 0) throw new Error('Unclosed CSS comment.');
  return end + 2;
};

const skipCssString = (source, start) => {
  const quote = source[start];
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === quote) return index + 1;
    if (source[index] === '\\') index += 2;
    else index += 1;
  }
  throw new Error('Unclosed CSS string.');
};

const findCssImports = (source) => {
  const imports = [];
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '/' && source[index + 1] === '*') {
      index = skipCssComment(source, index) - 1;
      continue;
    }
    if (source[index] === '"' || source[index] === "'") {
      index = skipCssString(source, index) - 1;
      continue;
    }
    if (source[index] !== '@' || source.slice(index + 1, index + 7).toLowerCase() !== 'import') continue;
    const boundary = source[index + 7];
    if (boundary && /[a-z0-9_-]/i.test(boundary)) continue;
    let cursor = index + 7;
    let depth = 0;
    for (; cursor < source.length; cursor += 1) {
      if (source[cursor] === '/' && source[cursor + 1] === '*') {
        cursor = skipCssComment(source, cursor) - 1;
        continue;
      }
      if (source[cursor] === '"' || source[cursor] === "'") {
        cursor = skipCssString(source, cursor) - 1;
        continue;
      }
      if (source[cursor] === '(') depth += 1;
      else if (source[cursor] === ')') depth -= 1;
      else if (source[cursor] === ';' && depth === 0) break;
      if (depth < 0) throw new Error('Unexpected ")" in CSS @import.');
    }
    if (cursor >= source.length) throw new Error('CSS @import is missing a terminating semicolon.');
    imports.push({
      end: cursor + 1,
      prelude: source.slice(index + 7, cursor).trim(),
      start: index,
    });
    index = cursor;
  }
  return imports;
};

const consumeBalanced = (source, start) => {
  if (source[start] !== '(') throw new Error('Expected "(".');
  let depth = 1;
  for (let index = start + 1; index < source.length; index += 1) {
    if (source[index] === '"' || source[index] === "'") {
      index = skipCssString(source, index) - 1;
      continue;
    }
    if (source[index] === '(') depth += 1;
    else if (source[index] === ')') {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  throw new Error('Unclosed parenthesis in CSS.');
};

const parseCssImportPrelude = (prelude) => {
  let index = 0;
  while (/\s/.test(prelude[index] || '')) index += 1;
  let href;
  if (prelude[index] === '"' || prelude[index] === "'") {
    const end = skipCssString(prelude, index);
    href = prelude.slice(index + 1, end - 1);
    index = end;
  } else if (prelude.slice(index, index + 3).toLowerCase() === 'url') {
    index += 3;
    while (/\s/.test(prelude[index] || '')) index += 1;
    if (prelude[index] !== '(') throw new Error(`Malformed CSS @import URL: ${prelude}`);
    const end = consumeBalanced(prelude, index);
    let value = prelude.slice(index + 1, end - 1).trim();
    if ((value[0] === '"' && value.at(-1) === '"') || (value[0] === "'" && value.at(-1) === "'")) {
      value = value.slice(1, -1);
    }
    href = value;
    index = end;
  } else {
    throw new Error(`CSS @import must use a quoted string or url(): ${prelude}`);
  }
  if (!href || href.includes('\\')) throw new Error(`Unsupported CSS @import URL: ${href}`);
  return { href, modifiers: prelude.slice(index).trim() };
};

const parseImportModifiers = (value) => {
  let rest = value.trim();
  let layer = null;
  let supports = null;
  if (/^layer\b/i.test(rest)) {
    rest = rest.slice(5).trimStart();
    if (rest.startsWith('(')) {
      const end = consumeBalanced(rest, 0);
      layer = rest.slice(1, end - 1).trim();
      rest = rest.slice(end).trimStart();
    } else layer = '';
  }
  if (/^supports\s*\(/i.test(rest)) {
    const open = rest.indexOf('(');
    const end = consumeBalanced(rest, open);
    supports = rest.slice(open + 1, end - 1).trim();
    rest = rest.slice(end).trimStart();
  }
  return { layer, media: rest, supports };
};

const wrapImportedCss = (css, modifierText) => {
  const { layer, media, supports } = parseImportModifiers(modifierText);
  let output = css;
  if (media) output = `@media ${media} {\n${output}\n}\n`;
  if (supports !== null) {
    const condition = supports.startsWith('(') || /^selector\(/i.test(supports)
      ? supports
      : `(${supports})`;
    output = `@supports ${condition} {\n${output}\n}\n`;
  }
  if (layer !== null) output = `@layer${layer ? ` ${layer}` : ''} {\n${output}\n}\n`;
  return output;
};

const parseCssUrlAt = (source, start) => {
  let index = start + 3;
  while (/\s/.test(source[index] || '')) index += 1;
  if (source[index] !== '(') return null;
  const open = index;
  const end = consumeBalanced(source, open);
  let value = source.slice(open + 1, end - 1).trim();
  if ((value[0] === '"' && value.at(-1) === '"') || (value[0] === "'" && value.at(-1) === "'")) {
    value = value.slice(1, -1);
  }
  return { end, value };
};

const cssString = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

const rebaseCssUrls = (source, ownerFile, manifest, options = {}) => {
  let output = '';
  let cursor = 0;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '/' && source[index + 1] === '*') {
      index = skipCssComment(source, index) - 1;
      continue;
    }
    if (source[index] === '"' || source[index] === "'") {
      index = skipCssString(source, index) - 1;
      continue;
    }
    if (source.slice(index, index + 3).toLowerCase() !== 'url') continue;
    const before = source[index - 1];
    if (before && /[a-z0-9_-]/i.test(before)) continue;
    const parsed = parseCssUrlAt(source, index);
    if (!parsed) continue;
    const value = parsed.value.trim();
    if (!value || value.startsWith('#') || /^data:/i.test(value) || /^var\(/i.test(value)) {
      index = parsed.end - 1;
      continue;
    }
    const local = canonicalizeLocalAsset(value, ownerFile, manifest, options);
    if (!local) {
      index = parsed.end - 1;
      continue;
    }
    output += source.slice(cursor, index);
    output += `url(${cssString(`${local.canonicalHref}${local.suffix}`)})`;
    cursor = parsed.end;
    index = parsed.end - 1;
  }
  output += source.slice(cursor);
  return output;
};

const isGoogleFontUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname === 'fonts.googleapis.com' || parsed.hostname === 'fonts.gstatic.com';
  } catch {
    return false;
  }
};

const inlineCssFile = async (
  entryFile,
  manifest,
  {
    canonicalOrigin = 'https://senseisandy.com',
    dropGoogleFontImports = true,
    cache = new Map(),
    dependencies = new Set(),
    droppedImports = new Set(),
    stack = [],
  } = {}
) => {
  const absolutePath = assertSafeExistingFile(entryFile, 'CSS input');
  const realPath = fs.realpathSync(absolutePath);
  if (stack.includes(realPath)) {
    throw new Error(`CSS @import cycle detected: ${[...stack, realPath].map(relativeLabel).join(' -> ')}`);
  }
  dependencies.add(rootHrefForFile(absolutePath));
  if (cache.has(realPath)) return cache.get(realPath);

  const promise = (async () => {
    let css = await fsp.readFile(absolutePath, 'utf8');
    css = css.replace(/^\uFEFF?\s*@charset\s+(?:"[^"]*"|'[^']*')\s*;/i, '');
    const imports = findCssImports(css);
    let output = '';
    let cursor = 0;
    const nextStack = [...stack, realPath];

    for (const imported of imports) {
      output += rebaseCssUrls(css.slice(cursor, imported.start), absolutePath, manifest, { canonicalOrigin });
      const { href, modifiers } = parseCssImportPrelude(imported.prelude);
      if (isAbsoluteUrl(href)) {
        if (dropGoogleFontImports && isGoogleFontUrl(href)) {
          droppedImports.add(href);
          output += `/* Local fonts.css replaces ${href} */\n`;
        } else {
          throw new Error(`External CSS @import cannot be absorbed from ${relativeLabel(absolutePath)}: ${href}`);
        }
      } else {
        const local = canonicalizeLocalAsset(href, absolutePath, manifest, { canonicalOrigin });
        if (!local || path.extname(local.absolutePath).toLowerCase() !== '.css') {
          throw new Error(`CSS @import is not a local CSS file in ${relativeLabel(absolutePath)}: ${href}`);
        }
        const child = await inlineCssFile(local.absolutePath, manifest, {
          cache,
          canonicalOrigin,
          dependencies,
          dropGoogleFontImports,
          droppedImports,
          stack: nextStack,
        });
        output += wrapImportedCss(child, modifiers);
      }
      cursor = imported.end;
    }
    output += rebaseCssUrls(css.slice(cursor), absolutePath, manifest, { canonicalOrigin });
    return output;
  })();

  cache.set(realPath, promise);
  try {
    return await promise;
  } catch (error) {
    cache.delete(realPath);
    throw error;
  }
};

module.exports = Object.freeze({
  DEFAULT_ASSET_MANIFEST_PATH,
  ASSET_SOURCE_ROOT,
  assetPathForHref,
  DEFAULT_SITEMAPS,
  HTML_EXTENSIONS,
  ROOT,
  ROOT_REAL,
  assertSafeExistingFile,
  assertSafeOutputPath,
  assertWorkspaceRelativePath,
  atomicWriteFile,
  canonicalizeJson,
  canonicalizeLocalAsset,
  compareText,
  createSsiExpander,
  decodeMarkupValue,
  ensureSafeDirectory,
  findCssImports,
  gzipBytes,
  inlineCssFile,
  isGoogleFontUrl,
  isPathInside,
  loadAssetManifest,
  normalizeManifestAssetHref,
  normalizeManagedHtmlAssetReferences,
  parseActiveStylesheets,
  parseCssImportPrelude,
  parseTagAttributes,
  readJsonFile,
  readSitemapUrls,
  rebaseCssUrls,
  relativeLabel,
  resolveVirtualTarget,
  resolveWorkspacePath,
  rootHrefForFile,
  routeToSourceHtml,
  scanStartTags,
  sha256,
  stableJson,
  stripInactiveHtml,
  toPosix,
  wrapImportedCss,
});
