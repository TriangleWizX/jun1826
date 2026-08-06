import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const SITE = 'https://senseisandy.com';
const TODAY = new Date().toISOString().slice(0, 10);

const URL_REGISTRY_PATH = path.join(ROOT, 'data', 'url-registry.json');
const BUSINESS_DATA_PATH = path.join(ROOT, 'data', 'business-data.json');
const MASTER_EXPORT_PATH = path.join(ROOT, 'crawl-reports', 'master-crawl-export.json');
const LEGACY_REDIRECTS_PATH = path.join(ROOT, 'config', 'legacy-redirects.json');
const TOWN_CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');
const GLOSSARY_TERMS_PATH = path.join(ROOT, 'data', 'glossary-terms.json');

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const normalizePath = (p) => {
  if (!p) return '/';
  let pathname = String(p).trim().split('?')[0].split('#')[0];
  if (!pathname) return '/';
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/+/g, '/');
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  return pathname || '/';
};

const EXCLUDED_DIRS = new Set([
  'assets',
  'partials',
  'archive',
  '_archive',
  '_drafts',
  'tmp',
  'scratch',
  'crawl-reports',
  'docs',
  'scripts',
  'tools',
  '_includes',
  'api',
  'node_modules',
  '.git',
  'playwright-report'
]);

const EXCLUDED_FILES = new Set([
  '404.html',
  'nav-include.html',
  'footer-include.html',
  'footer-include-no-proof.html',
  'footer-partner.html',
  'free-intro-promise.html',
  'cta-header.html',
  'cta-footer.html',
  'cta-row.html',
  'cta-hero.html',
  'cta-decision.html',
  'cta-primary.html',
  'offer-block.html',
  'pricing-module.html',
  'pricing-module-fragment.html',
  'schedule-block.html',
  'bjj-videos.html',
  'site-shell.html',
  'lane-picker.html',
  'my-promise-full.html',
  'my-promise-short.html',
  'safety-promise.html'
]);

const NOINDEX_ROUTES = new Set([
  '/annual-track',
  '/waiver',
  '/scribners-thank-you',
  '/scribners-staff-reset-pass'
]);

const TIER_C_TOWNS = new Set([
  'acra-ny', 'ashland-ny', 'boiceville-ny', 'coxsackie-ny', 'durham-ny',
  'elka-park-ny', 'gilboa-ny', 'grand-gorge-ny', 'greenville-ny', 'lanesville-ny',
  'leeds-ny', 'lexington-ny', 'maplecrest-ny', 'olive-ny', 'prattsville-ny',
  'purling-ny', 'round-top-ny', 'roxbury-ny', 'saugerties-ny', 'schoharie-ny',
  'shandaken-ny', 'shokan-ny', 'stamford-ny'
]);

const parseMetaDirectives = (html, name) => {
  const directives = [];
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const nameMatch = tag.match(/\bname\s*=\s*["']?([^"'\s>]+)["']?/i);
    if (!nameMatch || String(nameMatch[1]).toLowerCase() !== name) continue;
    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (!contentMatch) continue;
    directives.push(
      ...contentMatch[1]
        .toLowerCase()
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    );
  }
  return directives;
};

const hasNoindexTag = (html) => {
  const robots = parseMetaDirectives(html, 'robots');
  const googlebot = parseMetaDirectives(html, 'googlebot');
  return [...robots, ...googlebot].some((t) => t === 'noindex' || t === 'none');
};

const extractCanonicalHref = (html) => {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const relMatch = tag.match(/\brel\s*=\s*["']([^"']*)["']/i);
    if (!relMatch || relMatch[1].toLowerCase().trim() !== 'canonical') continue;
    const hrefMatch = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1].trim();
  }
  return '';
};

const extractTitle = (html) => {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : '';
};

const extractMetaDescription = (html) => {
  const directives = parseMetaDirectives(html, 'description');
  const m = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  return m ? m[1].trim() : (directives[0] || '');
};

const extractH1 = (html) => {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return '';
  return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
};

const countWords = (html) => {
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                  .replace(/<style[\s\S]*?<\/style>/gi, '')
                  .replace(/<!--[\s\S]*?-->/g, '')
                  .replace(/<[^>]+>/g, ' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const walkHtmlFiles = async (dir, relBase = '') => {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.posix.join(relBase, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      out.push(...(await walkHtmlFiles(path.join(dir, entry.name), rel)));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    if (EXCLUDED_FILES.has(rel) || EXCLUDED_FILES.has(entry.name)) continue;
    out.push(rel);
  }
  return out;
};

const fileToPath = (relFile) => {
  const rel = relFile.replace(/\\/g, '/').replace(/^\.?\//, '');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return normalizePath(`/${rel.slice(0, -'/index.html'.length)}`);
  if (rel.endsWith('.html')) return normalizePath(`/${rel.slice(0, -'.html'.length)}`);
  return normalizePath(`/${rel}`);
};

const getPageType = (pathname) => {
  if (pathname === '/' || pathname === '/free-bjj-intro-tannersville-ny' || pathname === '/options-pricing' || pathname === '/schedule' || pathname === '/bjj-tannersville-ny-directions' || pathname === '/contact' || pathname === '/how-class-works' || pathname === '/jiu-jitsu-safety-tannersville-ny' || pathname === '/success-stories' || pathname === '/bio' || pathname === '/sensei-studio' || pathname === '/bjj-faqs' || pathname === '/show-up-kit' || pathname === '/parent-resources' || pathname === '/school-families-jiu-jitsu' || pathname === '/law-enforcement-bjj' || pathname === '/tactical-longevity' || pathname === '/friday-night-fanatics' || pathname === '/black-belt-track' || pathname === '/nervous-first-timers' || pathname === '/bjj-stretches' || pathname === '/holiday-schedule' || pathname === '/samurai-break' || pathname === '/sensei-jiu-jitsu' || pathname === '/phoenicia-diner' || pathname === '/scribners-jiu-jitsu' || pathname === '/scribners' || pathname === '/partners-hospitality-hunter-windham' || pathname === '/partners-wellness-pt-referrals' || pathname === '/report-card' || pathname === '/rural-bjj-catskills') {
    return 'core';
  }
  if (pathname === '/guarantee-terms') return 'policy';
  if (pathname === '/waiver' || pathname === '/scribners-thank-you' || pathname === '/scribners-staff-reset-pass') return 'conversion';
  if (pathname === '/summer-academy' || pathname === '/summer-jiu-jitsu-tannersville') return 'campaign';
  if (pathname === '/programs' || pathname === '/bjj-classes' || pathname.startsWith('/bjj-classes/kids-') || pathname.startsWith('/bjj-classes/teens-') || pathname.startsWith('/bjj-classes/adults-') || pathname === '/kids' || pathname === '/adult-bjj' || pathname === '/teen-jiu-jitsu-tannersville-ny' || pathname === '/private-lessons' || pathname === '/bully-proof-jiu-jitsu-tannersville-ny' || pathname === '/martial-arts-hunter-ny') {
    return 'program';
  }
  if (pathname === '/nearby-towns' || pathname.startsWith('/bjj-classes/') || pathname.startsWith('/near/')) {
    return 'location';
  }
  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    return 'blog';
  }
  if (pathname === '/bjj-glossary' || pathname.startsWith('/bjj-glossary/')) {
    return 'glossary';
  }
  return 'core';
};

const getSitemapGroup = (pathname, pageType, isIndexable) => {
  if (!isIndexable) return null;
  if (pageType === 'core' || pageType === 'policy' || pageType === 'campaign') return 'core';
  if (pageType === 'program') return 'programs';
  if (pageType === 'location') return 'locations';
  if (pageType === 'blog') return 'blog';
  if (pageType === 'glossary') return 'glossary';
  return 'core';
};

export const main = async () => {
  const legacyConfig = await readJson(LEGACY_REDIRECTS_PATH);
  const redirects = legacyConfig?.redirects || {};
  const townConfig = await readJson(TOWN_CONFIG_PATH);
  const glossaryTerms = await readJson(GLOSSARY_TERMS_PATH);
  const relFiles = await walkHtmlFiles(ROOT);

  const registry = [];
  const masterExport = [];
  const seenPaths = new Set();

  for (const relFile of relFiles) {
    const routePath = fileToPath(relFile);
    if (seenPaths.has(routePath)) continue;
    seenPaths.add(routePath);

    const absPath = path.join(ROOT, relFile);
    const html = await fs.readFile(absPath, 'utf8');

    const title = extractTitle(html);
    const metaDescription = extractMetaDescription(html);
    const h1 = extractH1(html);
    const canonicalHref = extractCanonicalHref(html);
    const wordCount = countWords(html);

    let isIndexable = !hasNoindexTag(html);
    if (NOINDEX_ROUTES.has(routePath)) {
      isIndexable = false;
    }

    // Check town status
    const slugMatch = routePath.match(/^\/(?:bjj-classes|near)\/([a-z0-9-]+-ny)$/);
    if (slugMatch) {
      const townSlug = slugMatch[1];
      if (TIER_C_TOWNS.has(townSlug)) {
        isIndexable = false;
      }
    }

    const pageType = getPageType(routePath);
    let status = isIndexable ? 'active' : (TIER_C_TOWNS.has(routePath.replace(/^\/(?:bjj-classes|near)\//, '')) ? 'pending-rewrite' : 'active');
    if (NOINDEX_ROUTES.has(routePath)) status = 'private';

    const canonicalPath = canonicalHref ? (canonicalHref.startsWith('http') ? new URL(canonicalHref).pathname : canonicalHref) : routePath;
    const sitemapGroup = getSitemapGroup(routePath, pageType, isIndexable);

    const registryEntry = {
      path: routePath,
      pageType,
      status,
      indexable: isIndexable,
      canonicalPath: normalizePath(canonicalPath),
      sitemapGroup,
      navigationGroup: pageType,
      lastSignificantUpdate: TODAY,
      redirectTarget: null
    };
    registry.push(registryEntry);

    const hash = crypto.createHash('md5').update(html).digest('hex');

    masterExport.push({
      url: `${SITE}${routePath}`,
      path: routePath,
      statusCode: 200,
      redirectChain: [],
      title,
      metaDescription,
      h1,
      robotsDirective: isIndexable ? 'index,follow' : 'noindex,follow',
      canonical: `${SITE}${normalizePath(canonicalPath)}`,
      wordCount,
      pageType,
      sitemapInclusion: Boolean(sitemapGroup),
      sitemapGroup,
      lastModified: TODAY,
      contentHash: hash,
      nearDuplicatePercentage: 0
    });
  }

  // Add redirect entries from legacy-redirects
  for (const [sourcePath, targetPath] of Object.entries(redirects)) {
    const normSource = normalizePath(sourcePath);
    const normTarget = normalizePath(targetPath);
    if (!seenPaths.has(normSource)) {
      seenPaths.add(normSource);
      registry.push({
        path: normSource,
        pageType: 'archive',
        status: 'redirect',
        indexable: false,
        canonicalPath: normTarget,
        sitemapGroup: null,
        navigationGroup: null,
        lastSignificantUpdate: TODAY,
        redirectTarget: normTarget
      });

      masterExport.push({
        url: `${SITE}${normSource}`,
        path: normSource,
        statusCode: 301,
        redirectChain: [normTarget],
        title: '',
        metaDescription: '',
        h1: '',
        robotsDirective: 'noindex,follow',
        canonical: `${SITE}${normTarget}`,
        wordCount: 0,
        pageType: 'archive',
        sitemapInclusion: false,
        sitemapGroup: null,
        lastModified: TODAY,
        contentHash: '',
        nearDuplicatePercentage: 0
      });
    }
  }

  // Write outputs
  await fs.mkdir(path.dirname(URL_REGISTRY_PATH), { recursive: true });
  await fs.mkdir(path.dirname(MASTER_EXPORT_PATH), { recursive: true });

  await fs.writeFile(URL_REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf8');
  await fs.writeFile(MASTER_EXPORT_PATH, JSON.stringify(masterExport, null, 2), 'utf8');

  console.log(`DEV-200 complete: Created ${URL_REGISTRY_PATH} (${registry.length} routes) and ${MASTER_EXPORT_PATH} (${masterExport.length} URLs).`);
};

if (process.argv[1] && process.argv[1].endsWith('build-crawl-source-of-truth.mjs')) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
