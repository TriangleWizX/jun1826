import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');

const errors = [];

const readJson = async (filePath) => { try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch(e) { return []; } };

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
  const ownPathNear = `/near/${ownSlug}`;
  const ownPathBjj = `/bjj-classes/${ownSlug}`;
  const re = /href=["'](\/(?:near|bjj-classes)\/[^"'#?]+)(?:["'#?]|\/)/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const href = match[1];
    if (href !== ownPathNear && href !== ownPathBjj) links.add(href);
  }
  return links.size;
};

const validateLocalLinkContract = (relPath, html, ownSlug) => {
  assert(/class="ss-near-breadcrumbs"/i.test(html), `${relPath}: missing visible breadcrumb navigation.`);
  assert(hasInternalLink(html, '/nearby-towns'), `${relPath}: missing parent hub link to /nearby-towns.`);
  assert(countSiblingNearLinks(html, ownSlug) >= 2, `${relPath}: expected at least two sibling links.`);
  assert(hasInternalLink(html, '/kids') || hasInternalLink(html, '/bjj-classes/kids-tannersville-ny'), `${relPath}: missing internal link to /kids.`);
  assert(hasInternalLink(html, '/teen-jiu-jitsu-tannersville-ny') || hasInternalLink(html, '/bjj-classes/teens-tannersville-ny'), `${relPath}: missing internal link to /teen-jiu-jitsu-tannersville-ny.`);
  assert(hasInternalLink(html, '/adult-bjj') || hasInternalLink(html, '/bjj-classes/adults-tannersville-ny'), `${relPath}: missing internal link to /adult-bjj.`);
  assert(hasInternalLink(html, '/schedule'), `${relPath}: missing internal link to /schedule.`);
  assert(hasInternalLink(html, '/directions') || hasInternalLink(html, '/bjj-tannersville-ny-directions'), `${relPath}: missing internal link to /directions.`);
};

const validateNearPage = (relPath, html, town) => {
  const canonical = `https://senseisandy.com/near/${town.slug}`;
  assert(new RegExp(`<title>BJJ near ${escapeRegExp(town.town)}, NY \\| Sensei Sandy<\\/title>`, 'i').test(html), `${relPath}: incorrect title.`);
  assert(html.includes(`<link href="${canonical}" rel="canonical"`) || html.includes(`<link rel="canonical" href="${canonical}"`), `${relPath}: incorrect canonical.`);
  assert(html.includes(`${canonical}#webpage`), `${relPath}: missing WebPage schema id.`);
  assert(html.includes(`${canonical}#faq`), `${relPath}: missing FAQ schema id.`);
  assert(countMatches(html, /"@type": "FAQPage"/gi) === 1, `${relPath}: expected one current FAQ schema block.`);
  assert(countMatches(html, /<h1\b/gi) === 1, `${relPath}: expected one H1.`);
  assert(new RegExp(`<h1[^>]*>Try BJJ near ${escapeRegExp(town.town)}, NY<\\/h1>`, 'i').test(html), `${relPath}: missing town-specific first-class headline.`);
  assert(/Plan your first visit/i.test(html), `${relPath}: missing first-visit steps.`);
  assert(/Find the studio from/i.test(html), `${relPath}: missing local route section.`);
  assert(/google\.com\/maps\/dir\/\?api=1/i.test(html), `${relPath}: missing map link from the town.`);
  assert(/Questions about your first class/i.test(html), `${relPath}: missing first-class questions.`);
  assert(/A local fact/i.test(html) && /Read the source/i.test(html), `${relPath}: missing sourced local fact.`);
  assert(countMatches(html, /href="\/free-bjj-intro-tannersville-ny#booking-flow"/gi) >= 2, `${relPath}: expected hero and final Free Intro CTAs.`);
  assert(!/\b\d{1,2}:\d{2}\s*(?:AM|PM)?\b|straight-line distance|drive minutes|capped at \d+/i.test(html), `${relPath}: contains a fixed time, inferred distance, or unsupported cap.`);
  assert(countMatches(html, new RegExp(escapeRegExp(town.town), 'gi')) >= 4, `${relPath}: weak town-specific copy density.`);
  assert(hasInternalLink(html, '/schedule'), `${relPath}: missing current schedule link.`);
  assert(hasInternalLink(html, '/options-pricing'), `${relPath}: missing current plans link.`);
  assert(hasInternalLink(html, '/contact'), `${relPath}: missing contact link.`);
  validateLocalLinkContract(relPath, html, town.slug);
};

const run = async () => {
  const towns = await readJson(CONFIG_PATH);

  for (const town of towns) {
    if (String(town.status || '').toLowerCase() !== 'live') continue;

    const relPath = path.join('near', town.slug, 'index.html');
    const fullPath = path.join(ROOT, relPath);
    const html = await fs.readFile(fullPath, 'utf8');

    assert(!/\[(Town|slug|X|Road|Angle|HeroSubhead|LandmarkLine|LandmarkActivity|MapsUrl|SmsHref|LocalFact)\]/.test(html), `${relPath}: unresolved template token found.`);
    validateNearPage(relPath, html, town);
  }

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
