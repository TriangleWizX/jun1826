import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const failures = [];
let pages = 0;
let images = 0;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function localPath(url) {
  if (!url || !url.startsWith('/')) return null;
  return path.join(root, url.replace(/^\//, '').split(/[?#]/, 1)[0]);
}

for (const file of await walk(root)) {
  const pageRel = path.relative(root, file).replaceAll(path.sep, '/');
  if (pageRel.startsWith('_drafts/') || pageRel.startsWith('snippets/')) continue;
  pages += 1;
  const html = await fs.readFile(file, 'utf8');
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    images += 1;
    const attrs = match[1];
    const rel = path.relative(process.cwd(), file);
    if (!/\balt\s*=\s*["'][^"']*["']/i.test(attrs)) failures.push(`${rel}: image missing alt`);
    if (!/\bwidth\s*=\s*["']\d+["']/i.test(attrs) || !/\bheight\s*=\s*["']\d+["']/i.test(attrs)) {
      failures.push(`${rel}: image missing explicit width/height`);
    }
    const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const target = localPath(src);
    if (target) {
      try { await fs.access(target); } catch { failures.push(`${rel}: missing image ${src}`); }
    }
  }
  for (const match of html.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',').map((item) => item.trim().split(/\s+/)[0])) {
      const target = localPath(candidate);
      if (target) {
        try { await fs.access(target); } catch { failures.push(`${path.relative(process.cwd(), file)}: missing srcset image ${candidate}`); }
      }
    }
  }
}

if (failures.length) {
  console.error(`qa:image-contract failed (${failures.length} issue(s))`);
  for (const failure of failures.slice(0, 100)) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`qa:image-contract passed (${images} images across ${pages} HTML files)`);
}
