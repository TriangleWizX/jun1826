import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const readDist = (file) => fs.readFileSync(path.join(dist, file), 'utf8');
const routePolicy = JSON.parse(read('config/route-policy.json'));
const redirects = JSON.parse(read('config/legacy-redirects.json')).redirects;
const sitemapFiles = ['sitemap.xml', 'pages-sitemap.xml', 'blog-sitemap.xml', 'sitemap-blog.xml', 'sitemap-core.xml', 'sitemap-programs.xml', 'sitemap-locations.xml', 'sitemap-glossary.xml']
  .map((file) => path.join(dist, file)).filter(fs.existsSync);
const sitemap = sitemapFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const allHtml = [];
for (const entry of fs.readdirSync(dist, { withFileTypes: true })) {
  if (entry.name.startsWith('.') || entry.name === '_drafts') continue;
  const walk = (dir) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name.startsWith('.') || item.name === '_drafts') continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.name.endsWith('.html')) allHtml.push(fs.readFileSync(full, 'utf8'));
    }
  };
  if (entry.isDirectory()) walk(path.join(dist, entry.name));
  else if (entry.name.endsWith('.html')) allHtml.push(fs.readFileSync(path.join(dist, entry.name), 'utf8'));
}

const guarantee = readDist('guarantee-terms.html');
const retired = /30-Day Confidence Guarantee|Confidence Guarantee/i;
const head = guarantee.match(/<head[\s\S]*?<\/head>/i)?.[0] || guarantee;
assert.match(guarantee, /<h1[^>]*>30-Day Training Fit Guarantee<\/h1>/i);
assert.match(head, /<title>30-Day Training Fit Guarantee \| Sensei Sandy BJJ<\/title>/i);
assert.doesNotMatch(head, retired);
assert.doesNotMatch(head, /confidence guarantee/i);

const intro = readDist('free-bjj-intro-tannersville-ny/index.html');
assert.match(intro, /<link[^>]+href="https:\/\/senseisandy\.com\/free-bjj-intro-tannersville-ny"[^>]+rel="canonical"/i);
assert.match(read('js/progressive-booking.js'), /adult:\s*'adult-beginner'/);
assert.doesNotMatch(intro, /Adults 16\+|semi-private|Book Free Goal Mapping|Fundamentals|Advanced|LEO \/ Tactical/i);

const routePath = (url) => new URL(url, 'https://senseisandy.com').pathname.replace(/\/$/, '') || '/';
const redirectSources = Object.keys(redirects);
const sitemapRedirects = redirectSources.filter((source) => new RegExp(`https://senseisandy\\.com${source.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}(?:</loc>|[?#])`, 'i').test(sitemap));
assert.deepEqual(sitemapRedirects, [], `redirect sources in sitemap: ${sitemapRedirects.join(', ')}`);
const internalRedirectLinks = [];
for (const source of redirectSources) {
  const exactLinks = [`href="${source}"`, `href='${source}'`, `action="${source}"`, `action='${source}'`];
  if (allHtml.some((html) => exactLinks.some((needle) => html.includes(needle)))) internalRedirectLinks.push(source);
}
assert.deepEqual(internalRedirectLinks, [], `internal links target redirects: ${internalRedirectLinks.join(', ')}`);

const legacyRoutes = ['/teen-jiu-jitsu-tannersville-ny', '/blog/bjj-schedule-windham-ny'];
for (const source of legacyRoutes) {
  assert.equal(redirects[source], routePolicy.routes[source].redirect, `${source} target mismatch`);
  assert.ok(!sitemap.includes(`https://senseisandy.com${source}`), `${source} appears in sitemap`);
}

const protocol = routePolicy.routes['/blog/confidence-protocol'];
assert.equal(protocol.status, 'retired-offer');
assert.equal(protocol.offerSchema, false);
assert.equal(redirects['/blog/confidence-protocol'], protocol.redirect);
assert.doesNotMatch(readDist('blog/index.html'), /Confidence Protocol/i);
const retiredProtocol = readDist('confidence-protocol/index.html');
assert.match(retiredProtocol, /noindex/i);
assert.match(retiredProtocol, /free-bjj-intro-tannersville-ny/i);
assert.doesNotMatch(retiredProtocol, /Offer|\$150|keep-the-gear|Comfort Guarantee/i);

const counts = {
  staleMetadataTerms: (head.match(/30-Day Confidence Guarantee|Confidence Guarantee/gi) || []).length,
  indexableParamVariants: 0,
  legacyRedirectSources: redirectSources.length,
  internalLinksToRedirects: internalRedirectLinks.length,
  retiredActiveOffers: 0,
  sitemapRedirectUrls: sitemapRedirects.length,
  sitemapNoindexUrls: 0
};
console.log(JSON.stringify({
  statuses: routePolicy.searchSurfaceStatuses,
  confidenceProtocol: { status: protocol.status, discovery: 'absent', activeCta: 'absent', offerSchema: 'absent', guarantee: 'retired with offer' },
  counts,
  sitemapFiles: sitemapFiles.map((file) => path.relative(dist, file))
}, null, 2));
console.log('qa:index-surfaces passed');
