import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const publicRoutes = [
  '/', '/bjj-classes', '/black-belt-concierge', '/blog/bio-ginastica-mobility',
  '/blog/onteora-park-summer-activities-catskills', '/community-partners',
  '/elite-concierge', '/phoenicia-diner', '/school-families-jiu-jitsu',
  '/show-up-kit', '/summer-academy', '/blog/gi-vs-no-gi-bjj-cheat-code',
  '/sources/kodokan-etiquette'
];
const privateRoutes = ['/report-card', '/student-hub'];
const glossaryRoutes = ['/bjj-glossary', '/bjj-glossary/armbar', '/bjj-glossary/back-control', '/bjj-glossary/butterfly-guard', '/bjj-glossary/bridge'];

const fileFor = (route) => {
  if (route === '/') return path.join(DIST, 'index.html');
  const clean = route.replace(/^\//, '');
  const nested = path.join(DIST, clean, 'index.html');
  return fs.existsSync(nested) ? nested : path.join(DIST, `${clean}.html`);
};
const read = (route) => fs.readFileSync(fileFor(route), 'utf8');
const count = (html, pattern) => (html.match(pattern) || []).length;
const meta = (html, name) => {
  const tag = html.match(new RegExp(`<meta[^>]+(?:name=["']${name}["'][^>]*|[^>]*content=["'][^"']*["'][^>]*name=["']${name}["'])[^>]*>`, 'i'))?.[0] || '';
  return tag.match(/content=["']([^"']*)/i)?.[1] || '';
};
const canonical = (html) => html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i)?.[1] || '';
const title = (html) => html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
const errors = [];

for (const route of [...publicRoutes, ...privateRoutes, ...glossaryRoutes]) {
  const file = fileFor(route);
  if (!fs.existsSync(file)) { errors.push(`${route}: rendered file missing`); continue; }
  const html = read(route);
  const descriptions = count(html, /<meta[^>]+name=["']description["'][^>]*>/gi);
  const canonicals = count(html, /<link[^>]+rel=["']canonical["'][^>]*>/gi);
  if (descriptions > 1) errors.push(`${route}: ${descriptions} meta descriptions`);
  if (canonicals !== 1) errors.push(`${route}: expected one canonical, found ${canonicals}`);
  if (!title(html)) errors.push(`${route}: missing title`);
  if (publicRoutes.includes(route) && /\bnoindex\b/i.test(meta(html, 'robots'))) errors.push(`${route}: public route is noindex`);
  if (privateRoutes.includes(route) && !/\bnoindex\b/i.test(meta(html, 'robots'))) errors.push(`${route}: private route lost noindex`);
}

const gi = read('/blog/gi-vs-no-gi-bjj-cheat-code');
if (count(gi, /<meta[^>]+name=["']description["'][^>]*>/gi) !== 1 || !meta(gi, 'description')) errors.push('gi-vs-no-gi article: unique description missing');

const sitemapFiles = ['sitemap-core.xml', 'sitemap-programs.xml', 'sitemap-locations.xml', 'sitemap-blog.xml', 'sitemap-glossary.xml'];
const sitemap = sitemapFiles.map((name) => fs.readFileSync(path.join(DIST, name), 'utf8')).join('\n');
for (const route of privateRoutes) if (sitemap.includes(`https://senseisandy.com${route}`)) errors.push(`${route}: private route appears in sitemap`);
for (const route of publicRoutes) if (!sitemap.includes(`https://senseisandy.com${route === '/' ? '/' : route}`)) errors.push(`${route}: public route missing from sitemap`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`SEO remediation QA passed (${publicRoutes.length} public, ${privateRoutes.length} private, ${glossaryRoutes.length} glossary routes).`);
