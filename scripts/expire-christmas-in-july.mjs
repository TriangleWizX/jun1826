import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const expiry = new Date('2026-08-03T00:00:00-04:00');
const apply = process.argv.includes('--apply');
const force = process.argv.includes('--force');
const htmlFiles = [
  'index.html', 'options-pricing.html', 'holiday-schedule.html',
  'free-bjj-intro-tannersville-ny/index.html',
  'bjj-classes/kids-tannersville-ny/index.html',
  'bjj-classes/teens-tannersville-ny/index.html',
  'bjj-classes/adults-tannersville-ny/index.html',
  'catskills-home-base.html',
];
const campaignPattern = /christmas in july|christmas-in-july|through august 2/i;
const existing = htmlFiles.filter((file) => campaignPattern.test(fs.readFileSync(path.join(root, file), 'utf8')));
if (!apply) {
  console.log(`Christmas in July expiry: ${expiry.toISOString()}`);
  console.log(`Campaign surfaces detected: ${existing.length}`);
  existing.forEach((file) => console.log(`- ${file}`));
  console.log('Dry run only. Use --apply on or after the expiry date.');
  process.exit(0);
}
if (new Date() < expiry && !force) throw new Error(`Refusing to expire campaign before ${expiry.toISOString()}. Use --force only for a controlled test.`);
for (const file of existing) {
  const target = path.join(root, file);
  const cleaned = fs.readFileSync(target, 'utf8').split('\n').filter((line) => !campaignPattern.test(line)).join('\n');
  fs.writeFileSync(target, cleaned);
}
for (const sitemap of ['pages-sitemap.xml', 'sitemap-core.xml']) {
  const target = path.join(root, sitemap);
  if (!fs.existsSync(target)) continue;
  const cleaned = fs.readFileSync(target, 'utf8').replace(/\s*<url>\s*<loc>[^<]*christmas-in-july-bjj-tannersville[^<]*<\/loc>[\s\S]*?<\/url>/gi, '');
  fs.writeFileSync(target, cleaned);
}
const offersPath = path.join(root, 'content/offers.json');
if (fs.existsSync(offersPath)) {
  const offers = JSON.parse(fs.readFileSync(offersPath, 'utf8'));
  const campaignOffer = offers.offers?.find((offer) => offer.id === 'christmas-in-july');
  if (campaignOffer) {
    campaignOffer.status = 'archived';
    campaignOffer.visibilityLevel = 'archived';
    campaignOffer.searchTreatment = 'redirect';
    campaignOffer.destinationUrl = '/free-bjj-intro-tannersville-ny';
    campaignOffer.replacementUrl = '/free-bjj-intro-tannersville-ny';
    campaignOffer.notes = 'Promotional campaign expired August 2, 2026; redirects to /free-bjj-intro-tannersville-ny.';
  }
  fs.writeFileSync(offersPath, `${JSON.stringify(offers, null, 2)}\n`);
}
const businessDataPath = path.join(root, 'data/business-data.json');
if (fs.existsSync(businessDataPath)) {
  const businessData = JSON.parse(fs.readFileSync(businessDataPath, 'utf8'));
  const campaign = businessData.campaigns?.christmas_in_july;
  if (campaign) {
    campaign.active = false;
    campaign.banner_text = '';
  }
  fs.writeFileSync(businessDataPath, `${JSON.stringify(businessData, null, 2)}\n`);
}
const redirectsPath = path.join(root, 'config/legacy-redirects.json');
if (fs.existsSync(redirectsPath)) {
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf8'));
  redirects.redirects ||= {};
  redirects.redirects['/christmas-in-july-bjj-tannersville'] = '/free-bjj-intro-tannersville-ny';
  fs.writeFileSync(redirectsPath, `${JSON.stringify(redirects, null, 2)}\n`);
}
const campaignPage = path.join(root, 'christmas-in-july-bjj-tannersville/index.html');
if (fs.existsSync(campaignPage)) {
  let html = fs.readFileSync(campaignPage, 'utf8');
  html = html.replace(/<meta content="index, follow" name="robots"\s*\/>/i, '<meta content="noindex, nofollow" name="robots"/>');
  fs.writeFileSync(campaignPage, html);
}
console.log(`Expired Christmas in July campaign across ${existing.length} HTML surfaces and archived its sitemap/page state.`);
