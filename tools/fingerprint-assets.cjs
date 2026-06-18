#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = process.cwd();
const CLEANUP = process.argv.includes('--clean');
const MANIFEST_PATH = path.join(ROOT, 'assets', 'data', 'asset-hash-manifest.json');

const HTML_EXT = new Set(['.html']);
const CSS_EXT = new Set(['.css']);
const JS_EXT = new Set(['.js']);
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

const isHashed = (filename) => /\.[0-9a-f]{6}\./i.test(filename);
const unhashedSiblingPath = (abs) => {
  const ext = path.extname(abs);
  const dir = path.dirname(abs);
  const base = path.basename(abs, ext).replace(/\.[0-9a-f]{6}$/i, '');
  return path.join(dir, `${base}${ext}`);
};

const listFiles = (dir, exts) => {
  const out = [];
  const walk = (p) => {
    const entries = fs.readdirSync(p, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(p, e.name);
      if (e.isDirectory()) {
        walk(full);
      } else {
        if (!exts || exts.has(path.extname(e.name))) out.push(full);
      }
    }
  };
  walk(dir);
  return out;
};

const readText = (p) => fs.readFileSync(p, 'utf8');

const hashFile = (p) => {
  const buf = fs.readFileSync(p);
  return crypto.createHash('md5').update(buf).digest('hex').slice(0, 6);
};

const toPosix = (p) => p.split(path.sep).join('/');
const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const resolveFromRoot = (ref) => {
  const clean = ref.replace(/[?#].*$/, '');
  if (clean.startsWith('/')) {
    return path.join(ROOT, clean.slice(1));
  }
  return path.join(ROOT, clean);
};

const collectHtmlRefs = (html) => {
  const refs = [];
  const attrRe = /(href|src)\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = attrRe.exec(html))) {
    refs.push(m[2]);
  }
  return refs;
};

const collectCssUrls = (css) => {
  const refs = [];
  const urlRe = /url\(([^)]+)\)/gi;
  let m;
  while ((m = urlRe.exec(css))) {
    let val = m[1].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    refs.push({ raw: m[0], url: val });
  }
  return refs;
};

const isLocalAsset = (ref) => {
  if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('data:')) return false;
  return ref.includes('/assets/') || ref.startsWith('assets/') || ref.includes('/js/') || ref.startsWith('js/');
};

const allHtml = listFiles(ROOT, HTML_EXT);
const allCss = listFiles(path.join(ROOT, 'assets', 'css'), CSS_EXT)
  .concat(listFiles(path.join(ROOT, 'js'), new Set(['.css'])));

const assetRefs = new Set();

for (const htmlPath of allHtml) {
  const html = readText(htmlPath);
  for (const ref of collectHtmlRefs(html)) {
    if (!isLocalAsset(ref)) continue;
    assetRefs.add(ref);
  }
}

const cssRefsByFile = new Map();
for (const cssPath of allCss) {
  if (!fs.existsSync(cssPath)) continue;
  const css = readText(cssPath);
  const refs = collectCssUrls(css);
  cssRefsByFile.set(cssPath, refs);
  for (const ref of refs) {
    if (!isLocalAsset(ref.url)) continue;
    assetRefs.add(ref.url);
  }
}

const resolvedAssets = new Map(); // abs path -> hash path (abs)

for (const ref of assetRefs) {
  let abs = resolveFromRoot(ref);
  if (isHashed(path.basename(abs))) {
    const sibling = unhashedSiblingPath(abs);
    if (fs.existsSync(sibling)) abs = sibling;
  }
  if (!fs.existsSync(abs)) continue;
  const ext = path.extname(abs).toLowerCase();
  if (![...CSS_EXT, ...JS_EXT, ...IMG_EXT].includes(ext)) continue;
  if (isHashed(path.basename(abs))) continue;
  const hash = hashFile(abs);
  const dir = path.dirname(abs);
  const base = path.basename(abs, ext);
  const hashedName = `${base}.${hash}${ext}`;
  const hashedAbs = path.join(dir, hashedName);
  if (!fs.existsSync(hashedAbs)) {
    fs.copyFileSync(abs, hashedAbs);
  }
  resolvedAssets.set(abs, hashedAbs);
}

const rewriteHtml = (html) => {
  let out = html;
  for (const [abs, hashedAbs] of resolvedAssets) {
    const rel = toPosix(path.relative(ROOT, abs));
    const hashedRel = toPosix(path.relative(ROOT, hashedAbs));
    const ext = path.extname(rel);
    const relBase = rel.slice(0, -ext.length);
    const variants = new Set([
      rel,
      '/' + rel,
    ]);
    for (const v of variants) {
      const hv = v.startsWith('/') ? '/' + hashedRel : hashedRel;
      const vBase = v.slice(0, -ext.length);
      out = out.replace(new RegExp(`${escapeRegExp(vBase)}\\.[0-9a-f]{6}${escapeRegExp(ext)}`, 'gi'), hv);
      out = out.split(v).join(hv);
    }
  }
  return out;
};

const rewriteCss = (cssPath, css) => {
  const refs = cssRefsByFile.get(cssPath) || [];
  let out = css;
  for (const ref of refs) {
    const url = ref.url;
    if (!isLocalAsset(url)) continue;
    const abs = resolveFromRoot(url);
    const hashedAbs = resolvedAssets.get(abs);
    if (!hashedAbs) continue;
    const fromDir = path.dirname(cssPath);
    const relHashed = toPosix(path.relative(fromDir, hashedAbs));
    const replacement = `url("${relHashed}")`;
    out = out.replace(ref.raw, replacement);
  }
  return out;
};

for (const htmlPath of allHtml) {
  const html = readText(htmlPath);
  const updated = rewriteHtml(html);
  if (updated !== html) fs.writeFileSync(htmlPath, updated, 'utf8');
}

for (const cssPath of allCss) {
  if (!fs.existsSync(cssPath)) continue;
  const css = readText(cssPath);
  const updated = rewriteCss(cssPath, css);
  if (updated !== css) fs.writeFileSync(cssPath, updated, 'utf8');
}

if (CLEANUP) {
  const managedFamilies = new Map();
  for (const [srcAbs, hashedAbs] of resolvedAssets) {
    const ext = path.extname(srcAbs);
    const base = path.basename(srcAbs, ext);
    const dir = path.dirname(srcAbs);
    managedFamilies.set(path.join(dir, `${base}${ext}`), path.resolve(hashedAbs));
  }
  let removed = 0;
  for (const [familyKey, keepAbs] of managedFamilies) {
    const dir = path.dirname(familyKey);
    if (!fs.existsSync(dir)) continue;
    const siblings = fs.readdirSync(dir, { withFileTypes: true });
    for (const sibling of siblings) {
      if (!sibling.isFile()) continue;
      const file = path.join(dir, sibling.name);
      if (!isHashed(sibling.name)) continue;
      if (path.resolve(unhashedSiblingPath(file)) !== path.resolve(familyKey)) continue;
      const abs = path.resolve(file);
      if (abs !== keepAbs) {
        fs.unlinkSync(abs);
        removed += 1;
      }
    }
  }
  console.log(`Removed old hashed assets: ${removed}`);
}

const manifest = {};
for (const [abs, hashedAbs] of resolvedAssets) {
  const sourceRel = '/' + toPosix(path.relative(ROOT, abs));
  const hashedRel = '/' + toPosix(path.relative(ROOT, hashedAbs));
  manifest[sourceRel] = hashedRel;
}
fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  assets: Object.fromEntries(Object.entries(manifest).sort((a, b) => a[0].localeCompare(b[0])))
}, null, 2)}\n`, 'utf8');

console.log(`Hashed assets: ${resolvedAssets.size}`);
console.log(`Wrote asset manifest: ${toPosix(path.relative(ROOT, MANIFEST_PATH))}`);
