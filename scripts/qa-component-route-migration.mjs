import assert from 'node:assert/strict';

import { CSS_BUNDLE_REGISTRY } from '../tools/css-bundle-registry.mjs';
import {
  EXPECTED_MANAGED_ROUTES,
  EXPECTED_ROUTE_COUNTS,
  applyHrefReplacements,
  classifyBodyClasses,
  classifyManagedStylesheetHref,
  extractBodyClasses,
  maskInactiveHtml,
  parseActiveStylesheetLinks,
  validateExpectedInventory,
} from '../tools/migrate-component-bundle-routes.mjs';

const bundleNames = new Set(CSS_BUNDLE_REGISTRY.bundles.map((bundle) => bundle.name));

assert.equal(classifyBodyClasses([], bundleNames), 'core');
assert.equal(classifyBodyClasses(['page-home'], bundleNames), 'home');
assert.equal(classifyBodyClasses(['page-home-mobile-layer'], bundleNames), 'core');
assert.equal(classifyBodyClasses(['page-programs'], bundleNames), 'programs');
assert.equal(classifyBodyClasses(['page-options-pricing'], bundleNames), 'pricing');
assert.equal(classifyBodyClasses(['page-student-hub'], bundleNames), 'student-hub');
assert.equal(classifyBodyClasses(['ss-page-student-hub'], bundleNames), 'student-hub');
assert.equal(
  classifyBodyClasses(['page-student-hub', 'ss-page-student-hub'], bundleNames),
  'student-hub'
);
assert.equal(
  classifyBodyClasses(['page-glossary', 'page-bjj-glossary'], bundleNames),
  'glossary-hub'
);
assert.equal(
  classifyBodyClasses(['page-glossary-term', 'page-bjj-glossary'], bundleNames),
  'glossary-term'
);
assert.equal(
  classifyBodyClasses(
    ['page-glossary', 'page-glossary-term', 'page-bjj-glossary'],
    bundleNames
  ),
  'glossary-term'
);
assert.throws(
  () => classifyBodyClasses(['page-glossary'], bundleNames),
  /requires exact classes page-glossary and page-bjj-glossary/
);
assert.throws(
  () => classifyBodyClasses(['page-bjj-glossary'], bundleNames),
  /requires exact classes page-glossary and page-bjj-glossary/
);
assert.throws(
  () => classifyBodyClasses(['page-glossary-term'], bundleNames),
  /requires exact class page-bjj-glossary/
);
assert.throws(
  () => classifyBodyClasses(
    ['page-glossary-term', 'page-bjj-glossary', 'page-programs'],
    bundleNames
  ),
  /Unrelated component-bundle body discriminants: glossary-term, programs/
);
assert.throws(
  () => classifyBodyClasses(['page-home', 'page-schedule'], bundleNames),
  /Unrelated component-bundle body discriminants: home, schedule/
);

const fixtureHtml = `<!doctype html>
<!-- <link rel="stylesheet" href="/assets/css/components.css"> -->
<html>
<head>
  <noscript><link rel="stylesheet" href="/assets/css/components.min.css"></noscript>
  <script>const fake = '<link rel="stylesheet" href="/assets/css/components.aaaaaa.css">';</script>
  <template><link rel="stylesheet" href="/assets/css/components.bbbbbb.css"></template>
  <link data-note="keep" href='/assets/css/components.min.abcdef.css' rel="preload stylesheet" as="style">
</head>
<body class="page-home page-home-mobile-layer"></body>
</html>`;

const maskedFixture = maskInactiveHtml(fixtureHtml);
assert.equal(maskedFixture.length, fixtureHtml.length);
assert.equal(parseActiveStylesheetLinks(fixtureHtml).length, 1);
const [fixtureLink] = parseActiveStylesheetLinks(fixtureHtml);
assert.equal(fixtureLink.href, '/assets/css/components.min.abcdef.css');
assert.equal(
  fixtureHtml.slice(fixtureLink.hrefStart, fixtureLink.hrefEnd),
  '/assets/css/components.min.abcdef.css'
);
assert.deepEqual(extractBodyClasses(fixtureHtml), ['page-home', 'page-home-mobile-layer']);

const replacementTarget = '/assets/css/bundles/components-home.min.css';
const replacedFixture = applyHrefReplacements(fixtureHtml, [{
  start: fixtureLink.hrefStart,
  end: fixtureLink.hrefEnd,
  oldValue: fixtureLink.rawHref,
  newValue: replacementTarget,
}]);
assert.equal(
  replacedFixture,
  fixtureHtml.slice(0, fixtureLink.hrefStart)
    + replacementTarget
    + fixtureHtml.slice(fixtureLink.hrefEnd)
);
assert.match(replacedFixture, /data-note="keep" href='\/assets\/css\/bundles\/components-home\.min\.css' rel="preload stylesheet"/);
assert.throws(
  () => applyHrefReplacements('abcdef', [
    { start: 1, end: 4, oldValue: 'bcd', newValue: 'x' },
    { start: 3, end: 5, oldValue: 'de', newValue: 'y' },
  ]),
  /ordered, non-overlapping, and in bounds/
);
assert.throws(
  () => applyHrefReplacements('abcdef', [
    { start: 1, end: 4, oldValue: 'WRONG', newValue: 'x' },
  ]),
  /source drift/
);
assert.throws(
  () => parseActiveStylesheetLinks(
    '<link rel="stylesheet" href="/a.css" href="/b.css"><body></body>'
  ),
  /duplicate href attributes/
);
assert.throws(() => extractBodyClasses('<html></html>'), /found 0/);
assert.throws(
  () => extractBodyClasses('<body></body><body></body>'),
  /found 2/
);

const correctTargets = new Map([
  ['/assets/css/bundles/components-home.min.css', 'home'],
]);
const knownBundlePaths = new Map([
  ...correctTargets,
  ['/assets/css/bundles/components-home.css', 'home'],
]);
const hrefContext = {
  routeUrl: 'https://senseisandy.com/',
  canonicalOrigin: 'https://senseisandy.com',
  correctTargets,
  knownBundlePaths,
};

for (const href of [
  '/assets/css/components.css',
  '/assets/css/components.min.css',
  '/assets/css/components.abcdef.css',
  '/assets/css/components.min.abcdef.css',
]) {
  assert.equal(classifyManagedStylesheetHref({ href, ...hrefContext }).kind, 'legacy');
}
assert.equal(
  classifyManagedStylesheetHref({
    href: '/assets/css/bundles/components-home.min.css',
    ...hrefContext,
  }).kind,
  'target'
);
assert.equal(
  classifyManagedStylesheetHref({
    href: '/assets/css/bundles/components-home.css',
    ...hrefContext,
  }).kind,
  'invalid-bundle-target'
);
assert.equal(
  classifyManagedStylesheetHref({
    href: 'https://cdn.example.com/assets/css/components.css',
    ...hrefContext,
  }).kind,
  'other'
);
assert.equal(
  classifyManagedStylesheetHref({
    href: '/assets/css/components-home.css',
    ...hrefContext,
  }).kind,
  'other'
);

const managedFixture = [];
for (const [bundleName, count] of Object.entries(EXPECTED_ROUTE_COUNTS)) {
  for (let index = 0; index < count; index += 1) {
    managedFixture.push({
      bundleName,
      htmlPath: `fixture/${bundleName}/${index}.html`,
      route: `/fixture/${bundleName}/${index}`,
      sitemapPath: 'pages-sitemap.xml',
    });
  }
}
assert.equal(managedFixture.length, EXPECTED_MANAGED_ROUTES);
const fixtureCounts = validateExpectedInventory(managedFixture);
assert.equal(fixtureCounts.byBundle['glossary-term'], 141);
assert.equal(fixtureCounts.bySitemap['pages-sitemap.xml'], 156);
assert.equal(fixtureCounts.bySitemap['blog-sitemap.xml'], 0);
assert.throws(
  () => validateExpectedInventory(managedFixture.slice(1)),
  /Managed component route count drift/
);

const blogDriftFixture = managedFixture.map((route, index) => (
  index === 0 ? { ...route, sitemapPath: 'blog-sitemap.xml' } : route
));
assert.throws(
  () => validateExpectedInventory(blogDriftFixture),
  /Managed route count drift for pages-sitemap\.xml/
);

const duplicateOwnerFixture = managedFixture.map((route, index) => (
  index === 1 ? { ...route, htmlPath: managedFixture[0].htmlPath } : route
));
assert.throws(
  () => validateExpectedInventory(duplicateOwnerFixture),
  /Multiple managed routes resolve to the same HTML owner/
);

console.log(
  `Component route migration QA passed (${EXPECTED_MANAGED_ROUTES}-route contract and exact href parser).`
);
