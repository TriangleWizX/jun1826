import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, 'assets', 'data', 'asset-hash-manifest.json');
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const REQUIRED_ASSETS = [
  '/assets/js/ss-evidence-accordion.js',
  '/js/glossary-filters.js',
  '/js/voice-faq-accordion.js',
  '/js/book-free-intro-bridge.js',
  '/js/videos-hub-filters.js'
];

const HASHED_JS_RE = /^(?:\/)?((?:assets\/js|js)\/([a-z0-9-]+)\.[0-9a-f]{6}\.js)$/i;

const toPosix = (value) => value.split(path.sep).join('/');
const stripQuery = (value) => String(value).replace(/[?#].*$/, '');

const walkHtmlFiles = async (dir) => {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (path.extname(entry.name).toLowerCase() === '.html') out.push(full);
    }
  }
  return out;
};

const collectScriptSrc = (html) => {
  const refs = [];
  const scriptRe = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = scriptRe.exec(html))) refs.push(m[1]);
  return refs;
};

const readManifestAssets = async () => {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && parsed.assets && typeof parsed.assets === 'object' ? parsed.assets : {};
  } catch {
    return {};
  }
};

const main = async () => {
  const htmlFiles = await walkHtmlFiles(ROOT);
  const manifestAssets = await readManifestAssets();

  const missingFiles = [];
  const manifestMismatches = [];
  const requiredRefs = new Map(REQUIRED_ASSETS.map((asset) => [asset, 0]));
  let hashedRefsCount = 0;

  for (const htmlFile of htmlFiles) {
    const relHtml = toPosix(path.relative(ROOT, htmlFile));
    const html = await fs.readFile(htmlFile, 'utf8');
    for (const src of collectScriptSrc(html)) {
      const clean = stripQuery(src);
      const match = clean.match(HASHED_JS_RE);
      if (!match) continue;

      hashedRefsCount += 1;
      const assetPath = match[1];
      const family = match[2];
      const dir = path.posix.dirname(assetPath);
      const unhashedKey = `/${dir}/${family}.js`;
      if (requiredRefs.has(unhashedKey)) {
        requiredRefs.set(unhashedKey, requiredRefs.get(unhashedKey) + 1);
      }

      const absolutePath = path.join(ROOT, clean.replace(/^\//, ''));
      try {
        const stat = await fs.stat(absolutePath);
        if (!stat.isFile()) missingFiles.push(`${relHtml}: ${clean}`);
      } catch {
        missingFiles.push(`${relHtml}: ${clean}`);
      }

      const expectedHashed = manifestAssets[unhashedKey];
      if (expectedHashed && expectedHashed !== `/${clean.replace(/^\//, '')}`) {
        manifestMismatches.push(
          `${relHtml}: ${clean} (manifest expects ${expectedHashed})`
        );
      }
    }
  }

  const missingRequiredAssets = [];
  for (const asset of REQUIRED_ASSETS) {
    if ((requiredRefs.get(asset) || 0) === 0) missingRequiredAssets.push(asset);
  }

  if (missingFiles.length || manifestMismatches.length || missingRequiredAssets.length) {
    if (missingFiles.length) {
      console.error(`FAIL: hashed JS references missing on disk (${missingFiles.length}).`);
      for (const row of missingFiles.slice(0, 120)) console.error(`- ${row}`);
    }
    if (manifestMismatches.length) {
      console.error(`FAIL: runtime hashed JS refs do not match manifest (${manifestMismatches.length}).`);
      for (const row of manifestMismatches.slice(0, 120)) console.error(`- ${row}`);
    }
    if (missingRequiredAssets.length) {
      console.error(`FAIL: required hashed JS assets not referenced in runtime HTML (${missingRequiredAssets.length}).`);
      for (const asset of missingRequiredAssets) console.error(`- ${asset}`);
    }
    process.exit(1);
  }

  console.log(
    `qa-hashed-js-parity passed (html=${htmlFiles.length}, hashedRefs=${hashedRefsCount}, requiredAssets=${REQUIRED_ASSETS.length}).`
  );
};

main().catch((error) => {
  console.error(`qa-hashed-js-parity failed: ${error.message}`);
  process.exit(1);
});
