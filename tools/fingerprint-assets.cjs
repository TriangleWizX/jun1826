#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(process.cwd());
const ROOT_REAL = fs.realpathSync(ROOT);
const MANIFEST_PATH = path.join(ROOT, 'assets', 'data', 'asset-hash-manifest.json');

const HTML_EXT = new Set(['.html']);
const CSS_EXT = new Set(['.css']);
const LEAF_EXT = new Set([
  '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif',
  '.woff', '.woff2', '.ttf', '.eot'
]);
const ASSET_EXT = new Set([...CSS_EXT, ...LEAF_EXT]);
const HTML_SKIP_TOP_LEVEL_DIRS = new Set([
  '.agents', '.codegraph', '.codex', '.git', '.github', '.vscode',
  '__pycache__', '_archive', '_drafts', 'archive', 'assets', 'config',
  'content', 'crawl-reports', 'css', 'data', 'docs', 'email-templates',
  'dist', 'jobs', 'marketing-plans', 'node_modules', 'playwright-report',
  'retired', 'scratch', 'scripts', 'seo', 'test-results', 'tests', 'tmp',
  'tools', 'ubersuggest'
]);
const HTML_SKIP_NESTED_DIRS = new Set([
  '_archive', '_drafts', 'archive', 'deprecated', 'retired', 'scratch', 'tmp'
]);

const parseArgs = () => {
  const allowed = new Set(['--check', '--check-additive', '--clean']);
  const seen = new Set();
  for (const arg of process.argv.slice(2)) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`);
    if (seen.has(arg)) throw new Error(`Duplicate argument: ${arg}`);
    seen.add(arg);
  }
  const additiveCheck = seen.has('--check-additive');
  const check = seen.has('--check') || additiveCheck;
  const clean = seen.has('--clean');
  const modes = ['--check', '--check-additive', '--clean'].filter((mode) => seen.has(mode));
  if (modes.length > 1) {
    throw new Error('--check, --check-additive, and --clean cannot be used together.');
  }
  return { additiveCheck, check, clean };
};

const { additiveCheck: ADDITIVE_CHECK, check: CHECK, clean: CLEANUP } = parseArgs();
const toPosix = (value) => value.split(path.sep).join('/');
const comparePaths = (a, b) => {
  const left = toPosix(a);
  const right = toPosix(b);
  return left < right ? -1 : left > right ? 1 : 0;
};
const hashBytes = (bytes) => crypto.createHash('md5').update(bytes).digest('hex').slice(0, 6);
const isHashed = (filename) => /\.[0-9a-f]{6}\.[^.]+$/i.test(filename);
const unhashedSiblingPath = (abs) => {
  const ext = path.extname(abs);
  const base = path.basename(abs, ext).replace(/\.[0-9a-f]{6}$/i, '');
  return path.join(path.dirname(abs), `${base}${ext}`);
};
const isPathInside = (base, candidate) => {
  const relative = path.relative(base, candidate);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};
const relativeLabel = (abs) => toPosix(path.relative(ROOT, abs)) || '.';
const lstatIfExists = (abs) => {
  try {
    return fs.lstatSync(abs);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};
const assertLexicallyInsideRoot = (abs, label) => {
  if (!isPathInside(ROOT, path.resolve(abs))) {
    throw new Error(`${label} escapes the site root: ${abs}`);
  }
};
const assertSafeExistingFile = (abs, label = 'Asset source') => {
  const resolved = path.resolve(abs);
  assertLexicallyInsideRoot(resolved, label);
  const parts = path.relative(ROOT, resolved).split(path.sep);
  let cursor = ROOT;
  for (let index = 0; index < parts.length; index += 1) {
    cursor = path.join(cursor, parts[index]);
    const stat = fs.lstatSync(cursor);
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} uses a symlinked path: ${relativeLabel(cursor)}`);
    }
    if (index < parts.length - 1 && !stat.isDirectory()) {
      throw new Error(`${label} has a non-directory parent: ${relativeLabel(cursor)}`);
    }
    if (index === parts.length - 1 && !stat.isFile()) {
      throw new Error(`${label} is not a regular file: ${relativeLabel(cursor)}`);
    }
  }
  const real = fs.realpathSync(resolved);
  if (!isPathInside(ROOT_REAL, real)) {
    throw new Error(`${label} resolves outside the site root: ${relativeLabel(resolved)}`);
  }
  return resolved;
};
const assertSafeOutputPath = (abs, label = 'Output path') => {
  const resolved = path.resolve(abs);
  assertLexicallyInsideRoot(resolved, label);
  const parts = path.relative(ROOT, resolved).split(path.sep);
  let cursor = ROOT;
  for (let index = 0; index < parts.length - 1; index += 1) {
    cursor = path.join(cursor, parts[index]);
    const stat = lstatIfExists(cursor);
    if (!stat) break;
    if (stat.isSymbolicLink()) {
      throw new Error(`${label} uses a symlinked parent: ${relativeLabel(cursor)}`);
    }
    if (!stat.isDirectory()) {
      throw new Error(`${label} has a non-directory parent: ${relativeLabel(cursor)}`);
    }
    const real = fs.realpathSync(cursor);
    if (real !== ROOT_REAL && !isPathInside(ROOT_REAL, real)) {
      throw new Error(`${label} parent resolves outside the site root: ${relativeLabel(cursor)}`);
    }
  }
  const targetStat = lstatIfExists(resolved);
  if (targetStat) {
    if (targetStat.isSymbolicLink()) {
      throw new Error(`${label} is a symlink: ${relativeLabel(resolved)}`);
    }
    if (!targetStat.isFile()) {
      throw new Error(`${label} is not a regular file: ${relativeLabel(resolved)}`);
    }
    const real = fs.realpathSync(resolved);
    if (!isPathInside(ROOT_REAL, real)) {
      throw new Error(`${label} resolves outside the site root: ${relativeLabel(resolved)}`);
    }
  }
  return resolved;
};
const ensureSafeDirectory = (dir) => {
  const resolved = path.resolve(dir);
  assertLexicallyInsideRoot(path.join(resolved, '.keep'), 'Output directory');
  const parts = path.relative(ROOT, resolved).split(path.sep).filter(Boolean);
  let cursor = ROOT;
  for (const part of parts) {
    cursor = path.join(cursor, part);
    const stat = lstatIfExists(cursor);
    if (!stat) fs.mkdirSync(cursor);
    const current = fs.lstatSync(cursor);
    if (current.isSymbolicLink() || !current.isDirectory()) {
      throw new Error(`Output directory is not a safe directory: ${relativeLabel(cursor)}`);
    }
    const real = fs.realpathSync(cursor);
    if (real !== ROOT_REAL && !isPathInside(ROOT_REAL, real)) {
      throw new Error(`Output directory resolves outside the site root: ${relativeLabel(cursor)}`);
    }
  }
};
let tempFileCounter = 0;
const writeFileAtomically = (target, bytes, fallbackMode = 0o644) => {
  assertSafeOutputPath(target, 'Atomic output target');
  const existing = lstatIfExists(target);
  const mode = existing ? existing.mode & 0o777 : fallbackMode;
  const tempName = `.${path.basename(target)}.fingerprint-tmp-${process.pid}-${tempFileCounter++}`;
  const tempPath = path.join(path.dirname(target), tempName);
  assertSafeOutputPath(tempPath, 'Atomic staging file');
  let created = false;
  let descriptor = null;
  try {
    descriptor = fs.openSync(tempPath, 'wx', mode);
    created = true;
    fs.writeFileSync(descriptor, bytes);
    fs.closeSync(descriptor);
    descriptor = null;
    assertSafeExistingFile(tempPath, 'Atomic staging file');
    assertSafeOutputPath(target, 'Atomic output target');
    fs.renameSync(tempPath, target);
  } finally {
    if (descriptor !== null) {
      try {
        fs.closeSync(descriptor);
      } catch {
        // Preserve the original staging error.
      }
    }
    if (created) {
      const tempStat = lstatIfExists(tempPath);
      if (tempStat && (tempStat.isFile() || tempStat.isSymbolicLink())) fs.unlinkSync(tempPath);
    }
  }
};

const splitSuffix = (value) => {
  const queryIndex = value.indexOf('?');
  const hashIndex = value.indexOf('#');
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  const suffixIndex = indexes.length ? Math.min(...indexes) : -1;
  return suffixIndex < 0
    ? { pathname: value, suffix: '' }
    : { pathname: value.slice(0, suffixIndex), suffix: value.slice(suffixIndex) };
};
const isExternalRef = (value) => (
  !value || value.startsWith('#') || value.startsWith('//')
  || /^[a-z][a-z0-9+.-]*:/i.test(value) || /^var\(/i.test(value)
);
const isPinnedAsset = (abs) => (
  isPathInside(ROOT, abs)
  && toPosix(path.relative(ROOT, abs)).startsWith('assets/icons/bootstrap/')
);
const isAllowedCssSource = (abs) => {
  if (path.extname(abs).toLowerCase() !== '.css') return false;
  if (path.dirname(abs) === ROOT || path.dirname(abs) === path.join(ROOT, 'js')) return true;
  return isPathInside(path.join(ROOT, 'assets', 'css'), abs);
};
const resolveAssetRef = (ref, ownerPath) => {
  const trimmed = String(ref || '').trim();
  const { pathname } = splitSuffix(trimmed);
  if (isExternalRef(pathname)) return null;
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    throw new Error(`Invalid URL encoding in asset reference: ${ref}`);
  }
  if (!decoded || decoded.includes('\0') || decoded.includes('\\')) {
    throw new Error(`Invalid local asset reference: ${ref}`);
  }
  const abs = decoded.startsWith('/')
    ? path.resolve(ROOT, decoded.replace(/^\/+/, ''))
    : path.resolve(path.dirname(ownerPath), decoded);
  if (!isPathInside(ROOT, abs)) return null;
  const ext = path.extname(abs).toLowerCase();
  if (!ASSET_EXT.has(ext)) return null;
  assertSafeOutputPath(abs, 'Asset reference path');
  if (!lstatIfExists(abs)) return null;
  assertSafeExistingFile(abs, 'Asset reference');
  if (!isHashed(path.basename(abs))) return abs;
  const sibling = unhashedSiblingPath(abs);
  if (!lstatIfExists(sibling)) {
    throw new Error(
      `Hashed-only asset reference is invalid without its canonical sibling: ${relativeLabel(abs)}`
    );
  }
  assertSafeExistingFile(sibling, 'Canonical asset sibling');
  return sibling;
};

const maskText = (value) => value.replace(/[^\r\n]/g, ' ');
const maskInactiveHtml = (html) => {
  let masked = html.replace(/<!--[\s\S]*?(?:-->|$)/g, (match) => maskText(match));
  masked = masked.replace(/<noscript\b[^>]*>[\s\S]*?(?:<\/noscript\s*>|$)/gi, (match) => maskText(match));
  masked = masked.replace(/<template\b[^>]*>[\s\S]*?(?:<\/template\s*>|$)/gi, (match) => maskText(match));
  // A script element's src attribute is active, but href/src-shaped strings in
  // its body are not markup. Preserve only the opening tag for discovery.
  masked = masked.replace(
    /(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>|$)/gi,
    (match, opening, body, closing) => opening + maskText(body + closing)
  );
  return masked;
};
const collectHtmlAttributes = (html) => {
  const masked = maskInactiveHtml(html);
  const refs = [];
  const attrRe = /(\b(?:href|src)\s*=\s*)(["'])([\s\S]*?)\2/gi;
  let match;
  while ((match = attrRe.exec(masked))) {
    const valueStart = match.index + match[1].length + 1;
    refs.push({
      end: valueStart + match[3].length,
      start: valueStart,
      value: html.slice(valueStart, valueStart + match[3].length)
    });
  }
  return refs;
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
      kind: 'url',
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
      kind: 'import',
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

const listActiveHtmlFiles = () => {
  const out = [];
  const walk = (dir, depth) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) {
        if (HTML_EXT.has(path.extname(entry.name).toLowerCase())) {
          throw new Error(`Active HTML source is a symlink: ${relativeLabel(full)}`);
        }
        continue;
      }
      if (entry.isDirectory()) {
        const lowerName = entry.name.toLowerCase();
        if (entry.name.startsWith('.')) continue;
        if (depth === 0 && HTML_SKIP_TOP_LEVEL_DIRS.has(lowerName)) continue;
        if (depth > 0 && HTML_SKIP_NESTED_DIRS.has(lowerName)) continue;
        walk(full, depth + 1);
      } else if (entry.isFile() && HTML_EXT.has(path.extname(entry.name).toLowerCase())) {
        assertSafeExistingFile(full, 'Active HTML source');
        out.push(full);
      }
    }
  };
  walk(ROOT, 0);
  return out;
};

const allHtml = listActiveHtmlFiles();
const htmlDocuments = new Map();
const sourceSnapshots = new Map();
const cssRoots = new Set();
const leafSources = new Set();
for (const htmlPath of allHtml) {
  const bytes = fs.readFileSync(htmlPath);
  const html = bytes.toString('utf8');
  htmlDocuments.set(htmlPath, { bytes, html });
  for (const attr of collectHtmlAttributes(html)) {
    const source = resolveAssetRef(attr.value, htmlPath);
    if (!source || isPinnedAsset(source)) continue;
    if (CSS_EXT.has(path.extname(source).toLowerCase())) {
      if (isAllowedCssSource(source)) cssRoots.add(source);
    } else {
      leafSources.add(source);
    }
  }
}

// Only active HTML stylesheets seed the graph. CSS dependencies are discovered
// transitively; unused canonical stylesheets cannot pull assets into a build.
const cssTexts = new Map();
const cssSources = new Set(cssRoots);
const cssQueue = [...cssRoots].sort(comparePaths);
for (let index = 0; index < cssQueue.length; index += 1) {
  const cssPath = cssQueue[index];
  if (cssTexts.has(cssPath)) continue;
  assertSafeExistingFile(cssPath, 'Canonical CSS source');
  const cssBytes = fs.readFileSync(cssPath);
  const css = cssBytes.toString('utf8');
  sourceSnapshots.set(cssPath, cssBytes);
  cssTexts.set(cssPath, css);
  for (const ref of collectCssReferences(css)) {
    const dependency = resolveAssetRef(ref.value, cssPath);
    if (!dependency || isPinnedAsset(dependency)) continue;
    if (CSS_EXT.has(path.extname(dependency).toLowerCase())) {
      if (!isAllowedCssSource(dependency)) continue;
      if (!cssSources.has(dependency)) {
        cssSources.add(dependency);
        cssQueue.push(dependency);
      }
    } else {
      leafSources.add(dependency);
    }
  }
}

const resolvedAssets = new Map();
const plannedTargets = new Map();
const targetPathForBytes = (source, bytes) => {
  const ext = path.extname(source);
  const base = path.basename(source, ext);
  return path.join(path.dirname(source), `${base}.${hashBytes(bytes)}${ext}`);
};
const planTarget = (source, bytes, sourceDependencies = new Set([source])) => {
  assertSafeExistingFile(source, 'Canonical asset source');
  const target = targetPathForBytes(source, bytes);
  assertSafeOutputPath(target, 'Fingerprint target');
  resolvedAssets.set(source, target);
  plannedTargets.set(source, {
    bytes,
    sourceDependencies: new Set(sourceDependencies),
    target
  });
  return target;
};
for (const source of [...leafSources].sort(comparePaths)) {
  const sourceBytes = fs.readFileSync(source);
  sourceSnapshots.set(source, sourceBytes);
  planTarget(source, sourceBytes);
}

const replacementReference = (original, ownerPath, target) => {
  const trimmed = original.trim();
  const { pathname, suffix } = splitSuffix(trimmed);
  let nextPath;
  if (pathname.startsWith('/')) {
    nextPath = `/${toPosix(path.relative(ROOT, target))}`;
  } else {
    nextPath = toPosix(path.relative(path.dirname(ownerPath), target));
    if (pathname.startsWith('./') && !nextPath.startsWith('.')) nextPath = `./${nextPath}`;
  }
  return `${nextPath}${suffix}`;
};
const cssBuildStack = [];
const cssBuilding = new Set();
const buildCssTarget = (source) => {
  if (resolvedAssets.has(source)) return resolvedAssets.get(source);
  if (cssBuilding.has(source)) {
    const cycleStart = cssBuildStack.indexOf(source);
    const cycle = [...cssBuildStack.slice(cycleStart), source]
      .map((file) => relativeLabel(file)).join(' -> ');
    throw new Error(`Circular CSS dependency cannot be fingerprinted: ${cycle}`);
  }
  cssBuilding.add(source);
  cssBuildStack.push(source);
  try {
    const canonicalCss = cssTexts.get(source);
    const sourceDependencies = new Set([source]);
    const transformedCss = transformCss(canonicalCss, (ref) => {
      const dependency = resolveAssetRef(ref.value, source);
      if (!dependency || isPinnedAsset(dependency)) return null;
      const isCss = CSS_EXT.has(path.extname(dependency).toLowerCase());
      if (isCss && !isAllowedCssSource(dependency)) return null;
      const target = isCss ? buildCssTarget(dependency) : resolvedAssets.get(dependency);
      if (target) {
        const dependencyPlan = plannedTargets.get(dependency);
        for (const dependencySource of dependencyPlan.sourceDependencies) {
          sourceDependencies.add(dependencySource);
        }
      }
      return target ? replacementReference(ref.value, source, target) : null;
    });
    return planTarget(source, Buffer.from(transformedCss, 'utf8'), sourceDependencies);
  } finally {
    cssBuildStack.pop();
    cssBuilding.delete(source);
  }
};
for (const source of [...cssSources].sort(comparePaths)) buildCssTarget(source);

const htmlPlans = new Map();
for (const [htmlPath, document] of htmlDocuments) {
  const { bytes: currentBytes, html } = document;
  const attrs = collectHtmlAttributes(html);
  let cursor = 0;
  let updated = '';
  for (const attr of attrs) {
    updated += html.slice(cursor, attr.start);
    const source = resolveAssetRef(attr.value, htmlPath);
    const target = source && !isPinnedAsset(source) ? resolvedAssets.get(source) : null;
    updated += target ? replacementReference(attr.value, htmlPath, target) : attr.value;
    cursor = attr.end;
  }
  updated += html.slice(cursor);
  htmlPlans.set(htmlPath, {
    currentBytes,
    updated,
    updatedBytes: Buffer.from(updated, 'utf8')
  });
}

const cleanupCandidates = new Set();
const staleManagedSiblings = [];
if (CLEANUP || CHECK) {
  for (const [source, keepTarget] of [...resolvedAssets].sort(([a], [b]) => comparePaths(a, b))) {
    const ext = path.extname(source);
    const base = path.basename(source, ext);
    const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const familyRe = new RegExp(`^${escape(base)}\\.[0-9a-f]{6}${escape(ext)}$`, 'i');
    for (const sibling of fs.readdirSync(path.dirname(source), { withFileTypes: true })) {
      if (!familyRe.test(sibling.name)) continue;
      const candidate = path.join(path.dirname(source), sibling.name);
      if (sibling.isSymbolicLink()) {
        throw new Error(`Managed fingerprint sibling is a symlink: ${relativeLabel(candidate)}`);
      }
      if (!sibling.isFile()) continue;
      assertSafeExistingFile(candidate, 'Managed fingerprint sibling');
      if (path.resolve(candidate) === path.resolve(keepTarget)) continue;
      staleManagedSiblings.push(candidate);
      if (CLEANUP) cleanupCandidates.add(candidate);
    }
  }
}

const manifestAssets = {};
for (const [source, target] of [...resolvedAssets].sort(([a], [b]) => comparePaths(a, b))) {
  manifestAssets[`/${toPosix(path.relative(ROOT, source))}`] = `/${toPosix(path.relative(ROOT, target))}`;
}
const manifestText = `${JSON.stringify({ assets: manifestAssets }, null, 2)}\n`;
assertSafeOutputPath(MANIFEST_PATH, 'Asset manifest');
const currentManifest = lstatIfExists(MANIFEST_PATH) ? fs.readFileSync(MANIFEST_PATH, 'utf8') : null;

const targetWrites = [];
for (const [source, plan] of [...plannedTargets].sort(([a], [b]) => comparePaths(a, b))) {
  assertSafeOutputPath(plan.target, 'Fingerprint target');
  const stat = lstatIfExists(plan.target);
  const current = stat ? fs.readFileSync(plan.target) : null;
  if (!current || !current.equals(plan.bytes)) targetWrites.push({ source, ...plan });
}
const htmlWrites = [...htmlPlans]
  .filter(([, plan]) => !plan.currentBytes.equals(plan.updatedBytes))
  .sort(([a], [b]) => comparePaths(a, b));
const assertHtmlFresh = (htmlPath, expectedBytes) => {
  assertSafeExistingFile(htmlPath, 'Active HTML freshness check');
  const currentBytes = fs.readFileSync(htmlPath);
  if (!currentBytes.equals(expectedBytes)) {
    throw new Error(`Active HTML changed after preflight: ${relativeLabel(htmlPath)}`);
  }
};
const assertSourceFresh = (sourcePath, expectedBytes) => {
  assertSafeExistingFile(sourcePath, 'Canonical source freshness check');
  const currentBytes = fs.readFileSync(sourcePath);
  if (!currentBytes.equals(expectedBytes)) {
    throw new Error(`Canonical source changed after preflight: ${relativeLabel(sourcePath)}`);
  }
};
const assertSourcesFresh = (sources) => {
  for (const sourcePath of [...sources].sort(comparePaths)) {
    assertSourceFresh(sourcePath, sourceSnapshots.get(sourcePath));
  }
};

if (CHECK) {
  const issues = [];
  for (const plan of targetWrites) {
    issues.push(`${lstatIfExists(plan.target) ? 'Stale target bytes' : 'Missing target'}: ${relativeLabel(plan.target)}`);
  }
  for (const [htmlPath] of htmlWrites) issues.push(`HTML rewrite required: ${relativeLabel(htmlPath)}`);
  if (!ADDITIVE_CHECK) {
    for (const sibling of staleManagedSiblings) issues.push(`Stale managed sibling: ${relativeLabel(sibling)}`);
  }
  if (currentManifest === null) issues.push(`Missing manifest: ${relativeLabel(MANIFEST_PATH)}`);
  else if (currentManifest !== manifestText) issues.push(`Stale manifest: ${relativeLabel(MANIFEST_PATH)}`);

  if (issues.length) {
    console.error(`Asset fingerprint check failed (${issues.length} issue(s)):`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exitCode = 1;
  } else {
    const mode = ADDITIVE_CHECK ? 'additive check' : 'check';
    console.log(`Asset fingerprint ${mode} passed (${resolvedAssets.size} managed asset(s)).`);
    if (ADDITIVE_CHECK && staleManagedSiblings.length) {
      console.warn(
        `WARNING: additive mode retained ${staleManagedSiblings.length} stale managed sibling(s).`
      );
    }
  }
} else {
  // All graph, path, symlink, cycle, output, HTML, manifest, and cleanup
  // validation is complete before the first mutation below.
  assertSourcesFresh(sourceSnapshots.keys());
  for (const [htmlPath, plan] of htmlWrites) assertHtmlFresh(htmlPath, plan.currentBytes);
  for (const plan of targetWrites) {
    assertSourcesFresh(plan.sourceDependencies);
    assertSafeOutputPath(plan.target, 'Fingerprint target');
    const sourceMode = fs.lstatSync(plan.source).mode & 0o777;
    writeFileAtomically(plan.target, plan.bytes, sourceMode);
  }
  for (const [htmlPath, plan] of htmlWrites) {
    assertHtmlFresh(htmlPath, plan.currentBytes);
    writeFileAtomically(htmlPath, plan.updatedBytes);
  }
  if (currentManifest !== manifestText) {
    ensureSafeDirectory(path.dirname(MANIFEST_PATH));
    assertSafeOutputPath(MANIFEST_PATH, 'Asset manifest');
    writeFileAtomically(MANIFEST_PATH, Buffer.from(manifestText, 'utf8'));
  }
  for (const candidate of [...cleanupCandidates].sort(comparePaths)) {
    assertSafeExistingFile(candidate, 'Cleanup target');
    fs.unlinkSync(candidate);
  }
  console.log(`Hashed assets: ${resolvedAssets.size} (${targetWrites.length} target file(s) written)`);
  console.log(`HTML files rewritten: ${htmlWrites.length}`);
  if (CLEANUP) console.log(`Removed old hashed assets: ${cleanupCandidates.size}`);
  console.log(`Asset manifest: ${relativeLabel(MANIFEST_PATH)}`);
}
