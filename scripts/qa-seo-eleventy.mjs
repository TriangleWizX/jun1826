import fs from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'dist');
const errors = [];
let checked = 0;
const childSitemaps = ['sitemap-core.xml', 'sitemap-programs.xml', 'sitemap-locations.xml', 'sitemap-blog.xml', 'sitemap-glossary.xml'];
const primaryFiles = new Set(['index.html', 'free-bjj-intro-tannersville-ny/index.html', 'options-pricing/index.html', 'schedule/index.html', 'bjj-classes/kids-tannersville-ny/index.html', 'bjj-classes/teens-tannersville-ny/index.html', 'bjj-classes/adults-tannersville-ny/index.html', 'bjj-classes/tannersville-ny/index.html', 'bjj-classes/hunter-ny/index.html', 'bjj-classes/windham-ny/index.html', 'bjj-classes/haines-falls-ny/index.html']);

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const routeFile = (url) => {
  const pathname = new URL(url).pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!pathname) return 'index.html';
  return fs.existsSync(path.join(root, pathname, 'index.html')) ? path.join(pathname, 'index.html') : `${pathname}.html`;
};
const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
const fail = (message) => errors.push(message);

if (!fs.existsSync(root)) fail('dist directory is missing; run npm run build first.');
else {
  const index = read('sitemap.xml');
  if (!/<sitemapindex\b/i.test(index)) fail('dist/sitemap.xml must be a sitemap index.');
  const indexChildren = new Set(locs(index).map((url) => new URL(url).pathname.replace(/^\//, '')));
  for (const child of childSitemaps) {
    if (!indexChildren.has(child)) fail(`sitemap.xml is missing ${child}.`);
    if (!fs.existsSync(path.join(root, child))) fail(`missing generated child sitemap: ${child}.`);
  }

  const seen = new Set();
  for (const child of childSitemaps) {
    if (!fs.existsSync(path.join(root, child))) continue;
    for (const url of locs(read(child))) {
      let parsed;
      try { parsed = new URL(url); } catch { fail(`${child}: invalid URL ${url}`); continue; }
      if (parsed.origin !== 'https://senseisandy.com') fail(`${child}: noncanonical origin ${url}`);
      if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) fail(`${child}: trailing slash ${url}`);
      if (/\.html$|\.(?:venv|tmb|vscode)(?:\/|$)|confirmation/i.test(parsed.pathname)) fail(`${child}: forbidden URL ${url}`);
      if (seen.has(url)) fail(`duplicate sitemap URL ${url}`);
      seen.add(url);
      const file = routeFile(url);
      if (!fs.existsSync(path.join(root, file))) { fail(`${child}: no generated file for ${url} (${file})`); continue; }
      checked += 1;
      const html = read(file);
      if (!primaryFiles.has(file)) continue;
      if (!/<title\b[^>]*>\s*[^<]+\s*<\/title>/i.test(html)) fail(`${file}: missing title`);
      const canonicalMatch = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
      if (!canonicalMatch || !canonicalMatch[0].includes(`href="${url}"`)) fail(`${file}: canonical does not match ${url}`);
      if (!/<meta\b[^>]*name=["']description["'][^>]*>|<meta\b[^>]*content=["'][^"']+[^>]*name=["']description["']/i.test(html)) fail(`${file}: missing meta description`);
    }
  }
}

if (errors.length) {
  console.error(`Eleventy SEO QA failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Eleventy SEO QA passed: ${childSitemaps.length} child sitemaps and ${checked} canonical URLs checked.`);
