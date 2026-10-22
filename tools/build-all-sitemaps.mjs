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
const RESEARCH_SITEMAP = path.join(ROOT, 'sitemap-research.xml');
const DIST_DIR = path.join(ROOT, 'dist');
const PREVIOUS_SITEMAPS = [
  'sitemap-core.xml',
  'sitemap-programs.xml',
  'sitemap-locations.xml',
  'sitemap-blog.xml',
  'sitemap-glossary.xml',
  'sitemap-research.xml'
];
const SRC_SITEMAP_DIR = path.join(ROOT, 'src');
const normalizePath = (value) => String(value || '/').replace(/\/$/, '') || '/';

const escapeXml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const readPreviousLastmods = async () => {
  const lastmods = new Map();
  for (const sitemap of PREVIOUS_SITEMAPS) {
    let xml;
    try {
      xml = await fs.readFile(path.join(DIST_DIR, sitemap), 'utf8');
    } catch {
      continue;
    }

    const blocks = xml.match(/<url\b[^>]*>[\s\S]*?<\/url>/gi) || [];
    for (const block of blocks) {
      const loc = block.match(/<loc>\s*([^<]+)\s*<\/loc>/i)?.[1]?.trim();
      const lastmod = block.match(/<lastmod>\s*(\d{4}-\d{2}-\d{2})\s*<\/lastmod>/i)?.[1];
      if (loc && lastmod) lastmods.set(loc, lastmod);
    }
  }
  return lastmods;
};

const buildXml = (urls, priorLastmods, registryByUrl) => {
  const sorted = [...urls].sort((a, b) => a.localeCompare(b));
  const rows = sorted.map((u) => {
    const priorLastmod = priorLastmods.get(u);
    const significantUpdate = registryByUrl.get(u)?.lastSignificantUpdate || '';
    const lastmod = !priorLastmod || significantUpdate > priorLastmod ? TODAY : priorLastmod;
    return [
      '  <url>',
      `    <loc>${escapeXml(u)}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
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
  const priorLastmods = await readPreviousLastmods();
  const registryByUrl = new Map();

  const coreUrls = new Set();
  const programUrls = new Set();
  const locationUrls = new Set();
  const blogUrls = new Set();
  const glossaryUrls = new Set();
  const researchUrls = new Set();

  for (const entry of registry) {
    if (!entry.indexable || entry.status !== 'active' || entry.redirectTarget ||
        (entry.canonicalPath && normalizePath(entry.canonicalPath) !== normalizePath(entry.path))) {
      continue;
    }

    // Private/editor/tooling paths must never become public sitemap URLs.
    if (/^\/?(?:\.venv|\.tmb|\.vscode|node_modules|\.git)(?:\/|$)/i.test(entry.path || '')) {
      continue;
    }

    const fullUrl = entry.path === '/' ? `${SITE}/` : `${SITE}${entry.path}`;
    registryByUrl.set(fullUrl, entry);

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
    } else if (entry.sitemapGroup === 'research') {
      researchUrls.add(fullUrl);
    }
  }

  const xmlFor = (urls) => buildXml(urls, priorLastmods, registryByUrl);
  await fs.writeFile(CORE_SITEMAP, xmlFor(coreUrls), 'utf8');
  await fs.writeFile(PROGRAMS_SITEMAP, xmlFor(programUrls), 'utf8');
  await fs.writeFile(LOCATIONS_SITEMAP, xmlFor(locationUrls), 'utf8');
  await fs.writeFile(BLOG_SITEMAP, xmlFor(blogUrls), 'utf8');
  await fs.writeFile(GLOSSARY_SITEMAP, xmlFor(glossaryUrls), 'utf8');
  await fs.writeFile(RESEARCH_SITEMAP, xmlFor(researchUrls), 'utf8');
  await fs.writeFile(path.join(ROOT, 'blog-sitemap.xml'), xmlFor(blogUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-core.xml'), xmlFor(coreUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-programs.xml'), xmlFor(programUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-locations.xml'), xmlFor(locationUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-blog.xml'), xmlFor(blogUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-glossary.xml'), xmlFor(glossaryUrls), 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap-research.xml'), xmlFor(researchUrls), 'utf8');

  const childSitemaps = [
    `${SITE}/sitemap-core.xml`,
    `${SITE}/sitemap-programs.xml`,
    `${SITE}/sitemap-locations.xml`,
    `${SITE}/sitemap-blog.xml`,
    `${SITE}/sitemap-glossary.xml`,
    `${SITE}/sitemap-research.xml`
  ];

  const indexXml = buildIndexXml(childSitemaps);
  await fs.writeFile(MASTER_SITEMAP, indexXml, 'utf8');
  await fs.writeFile(path.join(SRC_SITEMAP_DIR, 'sitemap.xml'), indexXml, 'utf8');

  console.log(`DEV-201 complete: Generated sitemap.xml index and 6 child sitemaps:`);
  console.log(` - sitemap-core.xml (${coreUrls.size} URLs)`);
  console.log(` - sitemap-programs.xml (${programUrls.size} URLs)`);
  console.log(` - sitemap-locations.xml (${locationUrls.size} URLs)`);
  console.log(` - sitemap-blog.xml (${blogUrls.size} URLs)`);
  console.log(` - sitemap-glossary.xml (${glossaryUrls.size} URLs)`);
  console.log(` - sitemap-research.xml (${researchUrls.size} URLs)`);
};

if (process.argv[1] && process.argv[1].endsWith('build-all-sitemaps.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
