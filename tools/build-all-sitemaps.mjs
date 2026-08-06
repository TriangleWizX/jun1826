import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://senseisandy.com';
const TODAY = new Date().toISOString().slice(0, 10);

const URL_REGISTRY_PATH = path.join(ROOT, 'data', 'url-registry.json');
const MASTER_SITEMAP = path.join(ROOT, 'sitemap.xml');
const CORE_SITEMAP = path.join(ROOT, 'sitemap-core.xml');
const PROGRAMS_SITEMAP = path.join(ROOT, 'sitemap-programs.xml');
const LOCATIONS_SITEMAP = path.join(ROOT, 'sitemap-locations.xml');
const BLOG_SITEMAP = path.join(ROOT, 'sitemap-blog.xml');
const GLOSSARY_SITEMAP = path.join(ROOT, 'sitemap-glossary.xml');
const SRC_SITEMAP_DIR = path.join(ROOT, 'src');

const escapeXml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildXml = (urls) => {
  const sorted = [...urls].sort((a, b) => a.localeCompare(b));
  const rows = sorted.map((u) => {
    return [
      '  <url>',
      `    <loc>${escapeXml(u)}</loc>`,
      `    <lastmod>${TODAY}</lastmod>`,
      '  </url>'
    ].join('\n');
  });

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${rows.join('\n')}\n` +
    '</urlset>\n'
  );
};

const buildIndexXml = (sitemapUrls) => {
  const rows = sitemapUrls.map((loc) => {
    return [
      '  <sitemap>',
      `    <loc>${escapeXml(loc)}</loc>`,
      '  </sitemap>'
    ].join('\n');
  });

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${rows.join('\n')}\n` +
    '</sitemapindex>\n'
  );
};

export const main = async () => {
  const registry = JSON.parse(await fs.readFile(URL_REGISTRY_PATH, 'utf8'));

  const coreUrls = new Set();
  const programUrls = new Set();
  const locationUrls = new Set();
  const blogUrls = new Set();
  const glossaryUrls = new Set();

  for (const entry of registry) {
    if (!entry.indexable || entry.status !== 'active' || entry.redirectTarget) {
      continue;
    }

    // Private/editor/tooling paths must never become public sitemap URLs.
    if (/^\/?(?:\.venv|\.tmb|\.vscode|node_modules|\.git)(?:\/|$)/i.test(entry.path || '')) {
      continue;
    }

    const fullUrl = entry.path === '/' ? `${SITE}/` : `${SITE}${entry.path}`;

    if (entry.sitemapGroup === 'core') {
      coreUrls.add(fullUrl);
    } else if (entry.sitemapGroup === 'programs') {
      programUrls.add(fullUrl);
    } else if (entry.sitemapGroup === 'locations') {
      locationUrls.add(fullUrl);
    } else if (entry.sitemapGroup === 'blog') {
      blogUrls.add(fullUrl);
    } else if (entry.sitemapGroup === 'glossary') {
      glossaryUrls.add(fullUrl);
    }
  }

  await fs.writeFile(CORE_SITEMAP, buildXml(coreUrls), 'utf8');
  await fs.writeFile(PROGRAMS_SITEMAP, buildXml(programUrls), 'utf8');
  await fs.writeFile(LOCATIONS_SITEMAP, buildXml(locationUrls), 'utf8');
  await fs.writeFile(BLOG_SITEMAP, buildXml(blogUrls), 'utf8');
  await fs.writeFile(GLOSSARY_SITEMAP, buildXml(glossaryUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-core.xml'), buildXml(coreUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-programs.xml'), buildXml(programUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-locations.xml'), buildXml(locationUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-blog.xml'), buildXml(blogUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-glossary.xml'), buildXml(glossaryUrls), 'utf8');

  const childSitemaps = [
    `${SITE}/sitemap-core.xml`,
    `${SITE}/sitemap-programs.xml`,
    `${SITE}/sitemap-locations.xml`,
    `${SITE}/sitemap-blog.xml`,
    `${SITE}/sitemap-glossary.xml`
  ];

  await fs.writeFile(MASTER_SITEMAP, buildIndexXml(childSitemaps), 'utf8');

  console.log(`DEV-201 complete: Generated sitemap.xml index and 5 child sitemaps:`);
  console.log(` - sitemap-core.xml (${coreUrls.size} URLs)`);
  console.log(` - sitemap-programs.xml (${programUrls.size} URLs)`);
  console.log(` - sitemap-locations.xml (${locationUrls.size} URLs)`);
  console.log(` - sitemap-blog.xml (${blogUrls.size} URLs)`);
  console.log(` - sitemap-glossary.xml (${glossaryUrls.size} URLs)`);
};

if (process.argv[1] && process.argv[1].endsWith('build-all-sitemaps.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
