import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');
const CUSTOM_NEAR_SLUGS = new Set(['windham-ny']);

const errors = [];

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasInternalLink = (html, target) =>
  new RegExp(`href=["']${escapeRegExp(target)}(?:["'#?]|/)`, 'i').test(html);

const countMatches = (html, pattern) => {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
};

const countSiblingNearLinks = (html, ownSlug = '') => {
  const links = new Set();
  const ownPath = `/near/${ownSlug}`;
  const re = /href=["'](\/near\/[^"'#?]+)(?:["'#?]|\/)/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const href = match[1];
    if (href !== ownPath) links.add(href);
  }
  return links.size;
};

const validateLocalLinkContract = (relPath, html, ownSlug) => {
  assert(/class="ss-near-breadcrumbs"/i.test(html), `${relPath}: missing visible breadcrumb navigation.`);
  assert(hasInternalLink(html, '/nearby-towns'), `${relPath}: missing parent hub link to /nearby-towns.`);
  assert(countSiblingNearLinks(html, ownSlug) >= 2, `${relPath}: expected at least two sibling /near/ links.`);
  assert(hasInternalLink(html, '/kids'), `${relPath}: missing internal link to /kids.`);
  assert(hasInternalLink(html, '/teen-jiu-jitsu-tannersville-ny'), `${relPath}: missing internal link to /teen-jiu-jitsu-tannersville-ny.`);
  assert(hasInternalLink(html, '/adult-bjj'), `${relPath}: missing internal link to /adult-bjj.`);
  assert(hasInternalLink(html, '/schedule'), `${relPath}: missing internal link to /schedule.`);
  assert(hasInternalLink(html, '/directions'), `${relPath}: missing internal link to /directions.`);
};

const validateCustomWindhamPage = (relPath, html) => {
  assert(/<title>Brazilian Jiu-Jitsu Near Windham NY \| Sensei Sandy BJJ<\/title>/i.test(html), `${relPath}: incorrect custom title.`);
  assert(/<meta name="description" content="Beginner-friendly Brazilian Jiu-Jitsu near Windham NY for kids, teens, adults, and families\. Train minutes away in Tannersville with a Free Intro\.">/i.test(html), `${relPath}: incorrect custom meta description.`);
  assert(/<link rel="canonical" href="https:\/\/senseisandy\.com\/near\/windham-ny">/i.test(html), `${relPath}: incorrect custom canonical.`);
  assert(/https:\/\/senseisandy\.com\/near\/windham-ny#webpage/i.test(html), `${relPath}: missing WebPage schema id.`);
  assert(/https:\/\/senseisandy\.com\/near\/windham-ny#faq/i.test(html), `${relPath}: missing FAQ schema id.`);
  assert(/<!--#include virtual="\/_includes\/local-business-schema\.jsonld\.html" -->/i.test(html), `${relPath}: missing shared LocalBusiness schema include.`);
  assert(countMatches(html, /href="\/book-free-intro"/gi) >= 2, `${relPath}: expected at least 2 Windham intro CTAs.`);
  assert(/\/assets\/images\/413\/673065954-1200\.b8604c\.webp/i.test(html), `${relPath}: missing approved replacement studio image asset.`);
  validateLocalLinkContract(relPath, html, 'windham-ny');
};

const validateCustomWindhamMountainClubPage = async () => {
  const relPath = path.join('near', 'windham-mountain-club', 'index.html');
  const html = await fs.readFile(path.join(ROOT, relPath), 'utf8');
  validateLocalLinkContract(relPath, html, 'windham-mountain-club');
};

const run = async () => {
  const towns = await readJson(CONFIG_PATH);

  for (const town of towns) {
    if (String(town.status || '').toLowerCase() !== 'live') continue;

    const relPath = path.join('near', town.slug, 'index.html');
    const fullPath = path.join(ROOT, relPath);
    const html = await fs.readFile(fullPath, 'utf8');

    if (CUSTOM_NEAR_SLUGS.has(String(town.slug || '').trim())) {
      validateCustomWindhamPage(relPath, html);
      continue;
    }

    const townLabel = `${town.town}, NY`;
    const townNamePattern = new RegExp(escapeRegExp(town.town), 'gi');

    assert(!/\[(Town|slug|X|Road|Angle|HeroSubhead|LandmarkLine|LandmarkActivity)\]/.test(html), `${relPath}: unresolved template token found.`);
    assert(/Why families from/i.test(html), `${relPath}: missing town-choice section.`);
    assert(/What the trip actually looks like from/i.test(html), `${relPath}: missing trip framing section.`);
    assert(/Questions parents from/i.test(html), `${relPath}: missing objection section.`);
    assert(/Local proof/i.test(html), `${relPath}: missing local proof section.`);
    assert(/Best fit for/i.test(html), `${relPath}: missing best-fit section.`);
    assert(/Local facts \(sources\)/i.test(html), `${relPath}: missing local-facts accordion.`);
    assert(/Next step from/i.test(html), `${relPath}: missing quiet CTA section.`);
    assert(!/Fast next step|Quick answers|Ready to start/i.test(html), `${relPath}: legacy repeated CTA ladder still present.`);

    assert(/straight-line distance/i.test(html), `${relPath}: missing straight-line distance label.`);
    assert(/computed from 2020 u\.s\. census gazetteer representative coordinates/i.test(html), `${relPath}: missing Gazetteer method disclosure.`);
    assert(html.toLowerCase().includes(String(town.main_route || '').toLowerCase()), `${relPath}: missing town-specific route text.`);
    assert(countMatches(html, townNamePattern) >= 4, `${relPath}: weak town-specific copy density.`);
    const sourceLinkCount = countMatches(html, /rel="noopener noreferrer">Verified source<\/a>/gi);
    assert(sourceLinkCount >= 3, `${relPath}: expected at least 3 verified source links, found ${sourceLinkCount}.`);

    assert(/google\.com\/maps\/dir\/\?api=1/i.test(html), `${relPath}: missing directions/map link.`);
    const introCtaCount = countMatches(html, /href="\/book-free-intro"/gi);
    assert(introCtaCount >= 2, `${relPath}: expected at least 2 intro CTA links, found ${introCtaCount}.`);
    assert(/<section class="near-hero[\s\S]*?href="\/book-free-intro"/i.test(html), `${relPath}: hero section missing intro CTA.`);
    assert(/Next step from[\s\S]*?href="\/book-free-intro"/i.test(html), `${relPath}: quiet CTA section missing intro CTA.`);

    assert(hasInternalLink(html, '/schedule'), `${relPath}: missing internal link to /schedule.`);
    assert(hasInternalLink(html, '/options-pricing'), `${relPath}: missing internal link to /options-pricing.`);
    assert(hasInternalLink(html, '/contact'), `${relPath}: missing internal link to /contact.`);
    validateLocalLinkContract(relPath, html, town.slug);

    assert(html.includes(townLabel), `${relPath}: schema/content missing town-specific area label (${townLabel}).`);
  }

  await validateCustomWindhamMountainClubPage();

  if (errors.length) {
    for (const error of errors) {
      console.error(`NEAR QA FAIL: ${error}`);
    }
    process.exit(1);
  }

  console.log('Near-page quality QA passed.');
};

run().catch((error) => {
  console.error(`NEAR QA FAIL: ${error.message}`);
  process.exit(1);
});
