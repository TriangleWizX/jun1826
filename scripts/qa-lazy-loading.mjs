import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set(['.git', 'archive', 'tmp']);
const HTML_ROOTS = ['.'];
const SOURCE_TEMPLATE_FILES = ['near/template.html'];
const THIRD_PARTY_IFRAME_RE = /(?:youtube\.com\/embed|google\.com\/maps|maps\.google)/i;
const BELOW_FOLD_IMAGE_RE = /(?:card-img-top|\/assets\/images\/yams?\/|\/assets\/img\/yam\/)/i;

const errors = [];

const hasAttr = (tag, name, value) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const attr = new RegExp(`\\b${escaped}\\s*=\\s*["']${value}["']`, 'i');
  return attr.test(tag);
};

const hasAnyAttr = (tag, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\s*=`, 'i').test(tag);
};

const getAttr = (tag, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = tag.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match?.[2] || '';
};

const walkHtmlFiles = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      files.push(...await walkHtmlFiles(path.join(dir, entry.name)));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.relative(ROOT, path.join(dir, entry.name)));
    }
  }

  return files;
};

const lineFor = (html, index) => html.slice(0, index).split('\n').length;

const inspectHtml = (relPath, html) => {
  const imageRe = /<img\b[^>]*>/gi;
  const iframeRe = /<iframe\b[^>]*>/gi;
  let match;

  while ((match = imageRe.exec(html)) !== null) {
    const tag = match[0];
    const line = lineFor(html, match.index);
    const classes = getAttr(tag, 'class');
    const src = getAttr(tag, 'src');

    if (hasAttr(tag, 'loading', 'lazy')) {
      if (!hasAttr(tag, 'decoding', 'async')) {
        errors.push(`${relPath}:${line}: lazy image must include decoding="async".`);
      }
      if (!hasAnyAttr(tag, 'width') || !hasAnyAttr(tag, 'height')) {
        errors.push(`${relPath}:${line}: lazy image must include width and height.`);
      }
    }

    if (classes.includes('hero-bg-video')) {
      if (hasAttr(tag, 'loading', 'lazy')) {
        errors.push(`${relPath}:${line}: hero image must not be lazy-loaded.`);
      }
      if (!hasAttr(tag, 'decoding', 'async') || !hasAttr(tag, 'fetchpriority', 'high')) {
        errors.push(`${relPath}:${line}: hero image must include decoding="async" and fetchpriority="high".`);
      }
    }

    if (BELOW_FOLD_IMAGE_RE.test(`${classes} ${src}`) && !hasAttr(tag, 'loading', 'lazy')) {
      errors.push(`${relPath}:${line}: known below-fold image pattern must include loading="lazy".`);
    }
  }

  while ((match = iframeRe.exec(html)) !== null) {
    const tag = match[0];
    const line = lineFor(html, match.index);
    const src = getAttr(tag, 'src');
    if (!THIRD_PARTY_IFRAME_RE.test(src)) continue;

    if (!hasAttr(tag, 'loading', 'lazy')) {
      errors.push(`${relPath}:${line}: third-party iframe must include loading="lazy".`);
    }
    if (!hasAttr(tag, 'referrerpolicy', 'strict-origin-when-cross-origin')) {
      errors.push(`${relPath}:${line}: third-party iframe must use referrerpolicy="strict-origin-when-cross-origin".`);
    }
    for (const attr of ['title', 'width', 'height']) {
      if (!hasAnyAttr(tag, attr)) {
        errors.push(`${relPath}:${line}: third-party iframe must include ${attr}.`);
      }
    }
  }
};

const main = async () => {
  const htmlFiles = new Set();
  for (const root of HTML_ROOTS) {
    for (const file of await walkHtmlFiles(path.join(ROOT, root))) {
      htmlFiles.add(file);
    }
  }
  SOURCE_TEMPLATE_FILES.forEach((file) => htmlFiles.add(file));

  for (const file of [...htmlFiles].sort()) {
    inspectHtml(file, await fs.readFile(path.join(ROOT, file), 'utf8'));
  }

  if (errors.length) {
    console.error(`qa-lazy-loading failed (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`qa-lazy-loading passed (${htmlFiles.size} HTML files scanned)`);
};

main().catch((error) => {
  console.error(`qa-lazy-loading failed: ${error.message}`);
  process.exit(1);
});
