import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://senseisandy.com';
const registry = JSON.parse(await fs.readFile(path.join(ROOT, 'data/url-registry.json'), 'utf8'));
const out = path.join(ROOT, 'audits/indexation-policy.csv');
const dist = path.join(ROOT, 'dist');
const normalizePath = (value) => String(value || '/').replace(/\/$/, '') || '/';

const csv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
const disposition = (entry) => {
  if (entry.redirectTarget) return 'REDIRECT';
  if (entry.status !== 'active') return 'REMOVE';
  if (entry.canonicalPath && normalizePath(entry.canonicalPath) !== normalizePath(entry.path)) return 'NOINDEX, FOLLOW';
  return entry.indexable ? 'INDEX' : 'NOINDEX, FOLLOW';
};
const finalRobots = (entry) => entry.indexable && entry.status === 'active' && !entry.redirectTarget
  && (!entry.canonicalPath || normalizePath(entry.canonicalPath) === normalizePath(entry.path))
  ? 'index, follow'
  : entry.status === 'active' && !entry.redirectTarget ? 'noindex, follow' : '';

const htmlPathFor = (urlPath) => {
  if (urlPath === '/') return path.join(dist, 'index.html');
  const clean = urlPath.replace(/^\//, '').replace(/\/$/, '');
  return path.join(dist, `${clean}.html`);
};

const readPage = async (urlPath) => {
  try {
    let html;
    try {
      html = await fs.readFile(htmlPathFor(urlPath), 'utf8');
    } catch {
      const clean = urlPath.replace(/^\//, '').replace(/\/$/, '');
      html = await fs.readFile(path.join(dist, clean, 'index.html'), 'utf8');
    }
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/gi, ' ');
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] || '';
    const robots = html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i)?.[1] || '';
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return { html, title, canonical, robots, words };
  } catch {
    return { html: '', title: '', canonical: '', robots: '', words: '' };
  }
};

const pages = new Map();
for (const entry of registry) {
  if (entry.path && !entry.path.startsWith('/.')) pages.set(entry.path, await readPage(entry.path));
}
const inlinks = new Map([...pages.keys()].map((urlPath) => [urlPath, 0]));
for (const page of pages.values()) {
  for (const match of page.html.matchAll(/href=["'](\/[^"'#?]*)/gi)) {
    const target = match[1].replace(/\.html$/, '') || '/';
    if (inlinks.has(target)) inlinks.set(target, inlinks.get(target) + 1);
  }
}

const rows = registry
  .filter((entry) => entry.path && !entry.path.startsWith('/.'))
  .sort((a, b) => a.path.localeCompare(b.path))
  .map((entry) => {
    const page = pages.get(entry.path) || {};
    return [
    entry.path === '/' ? `${SITE}/` : `${SITE}${entry.path}`,
    entry.status === 'active' ? '200' : entry.redirectTarget ? '301' : '410',
    page.robots || entry.robots || (entry.indexable ? 'index, follow' : 'noindex, follow'),
    page.canonical || (entry.canonicalPath ? `${SITE}${entry.canonicalPath === '/' ? '/' : entry.canonicalPath}` : ''),
    page.title,
    '',
    inlinks.get(entry.path) ?? '',
    page.words,
    entry.pageType || '',
    disposition(entry),
    finalRobots(entry),
    entry.redirectTarget ? `${SITE}${entry.redirectTarget}` : '',
    entry.indexable && entry.status === 'active' && !entry.redirectTarget &&
      (!entry.canonicalPath || normalizePath(entry.canonicalPath) === normalizePath(entry.path)) ? 'yes' : 'no',
    entry.lastSignificantUpdate || '',
    entry.reason || ''
  ];
  });

const header = ['URL', 'HTTP Status', 'Robots Meta', 'Canonical', 'Page Title', 'X-Robots-Tag', 'Internal Links In', 'Word Count', 'Search Purpose', 'Action', 'Final Robots', 'Redirect Target', 'Sitemap', 'Last Modified', 'Reason'];
await fs.mkdir(path.dirname(out), { recursive: true });
await fs.writeFile(out, `${header.map(csv).join(',')}\n${rows.map((row) => row.map(csv).join(',')).join('\n')}\n`);
console.log(`Wrote ${rows.length} URL dispositions to ${path.relative(ROOT, out)}`);
