#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const IMAGE_EXT = /\.(?:avif|gif|jpe?g|png|svg|webp)$/i;
const SKIP = new Set(['.git', 'node_modules', 'tmp', 'archive', '_drafts', '.tmb', 'artifacts']);
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2] || '';
const walk = async (dir) => {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && !SKIP.has(entry.name) && !entry.name.startsWith('.') && !entry.name.startsWith('_')) out.push(...await walk(path.join(dir, entry.name)));
    else if (entry.isFile()) out.push(path.relative(ROOT, path.join(dir, entry.name)));
  }
  return out;
};
const files = await walk(ROOT);
const imageFiles = files.filter(file => file.startsWith('src/assets/') && IMAGE_EXT.test(file));
const sourceFiles = files.filter(file => /^(src|dist)\//.test(file) && /\.(?:html|css|js|mjs|njk|json|xml)$/i.test(file));
const sourceText = new Map();
for (const file of sourceFiles) sourceText.set(file, await fs.readFile(path.join(ROOT, file), 'utf8'));
const allText = [...sourceText.values()].join('\n');
const imageUrls = [...allText.matchAll(/(?:src|srcset|poster|url\()\s*[:=]?\s*["']?([^"'()\s,]+)|\/assets\/[^\s"'()>,]+/gi)].map(match => match[1] || match[0]);
const referenced = new Set(imageUrls.map(url => url.split(/[?#]/)[0].replace(/^\//, '')));
const failures = []; const warnings = [];
for (const file of sourceFiles.filter(file => file.endsWith('.html'))) {
  const html = sourceText.get(file);
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]; const line = html.slice(0, match.index).split('\n').length; const src = attr(tag, 'src');
    if (!src || /^(?:data:|https?:|\/\/)/i.test(src)) continue;
    const cleanSrc = src.replace(/^\//, '').split(/[?#]/)[0];
    const target = file.startsWith('dist/') ? path.join(ROOT, cleanSrc.replace(/^assets\//, 'dist/assets/')) : path.join(ROOT, cleanSrc.replace(/^assets\//, 'src/assets/'));
    try { await fs.access(target); } catch { (file.includes('/snippets/') ? warnings : failures).push(`${file}:${line}: missing image ${src}`); }
    if (!attr(tag, 'alt') && !/role\s*=\s*["']presentation/i.test(tag)) failures.push(`${file}:${line}: image missing alt attribute`);
    if (!attr(tag, 'width') || !attr(tag, 'height')) warnings.push(`${file}:${line}: image missing explicit dimensions`);
    if (attr(tag, 'loading').toLowerCase() === 'lazy' && attr(tag, 'decoding').toLowerCase() !== 'async') warnings.push(`${file}:${line}: lazy image missing decoding="async"`);
  }
  for (const match of html.matchAll(/<(?:source|img)\b[^>]*\bsrcset\s*=\s*(["'])(.*?)\1/gi)) {
    for (const candidate of match[2].split(',').map(item => item.trim().split(/\s+/)[0])) {
      if (!candidate || /^(?:data:|https?:|\/\/)/i.test(candidate)) continue;
      const clean = candidate.replace(/^\//, '').split(/[?#]/)[0]; const target = file.startsWith('dist/') ? path.join(ROOT, clean.replace(/^assets\//, 'dist/assets/')) : path.join(ROOT, clean.replace(/^assets\//, 'src/assets/'));
      try { await fs.access(target); } catch { warnings.push(`${file}: missing srcset image ${candidate}`); }
    }
  }
}
const unreferenced = imageFiles.filter(file => !referenced.has(file) && !referenced.has(file.replace(/^src\//, ''))).sort();
const report = { imageFiles: imageFiles.length, htmlFiles: sourceFiles.filter(file => file.endsWith('.html')).length, referencedImages: referenced.size, missingReferences: failures, warnings, unreferencedSourceImages: unreferenced };
await fs.mkdir(path.join(ROOT, 'reports'), { recursive: true }); await fs.writeFile(path.join(ROOT, 'reports/image-qa.json'), JSON.stringify(report, null, 2));
if (failures.length) { console.error(`qa-images failed (${failures.length} blocking issue(s))`); failures.slice(0, 50).forEach(item => console.error(`- ${item}`)); process.exit(1); }
console.log(`qa-images passed (${imageFiles.length} source images, ${report.htmlFiles} HTML files, ${warnings.length} warnings, ${unreferenced.length} unreferenced candidates).`);
