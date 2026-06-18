import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CTA_INCLUDE = '<!--#include virtual="/cta-footer.html" -->';

const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};

const read = async (relPath) => fs.readFile(path.join(ROOT, relPath), 'utf8');
const count = (text, needle) => text.split(needle).length - 1;

const listNearPages = async () => {
  const nearRoot = path.join(ROOT, 'near');
  const entries = await fs.readdir(nearRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => `near/${entry.name}/index.html`);
};

const listGlossaryTermPages = async () => {
  const glossaryRoot = path.join(ROOT, 'bjj-glossary');
  const entries = await fs.readdir(glossaryRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== 'updates')
    .map((entry) => `bjj-glossary/${entry.name}/index.html`);
};

const main = async () => {
  const footerHtml = await read('footer-include.html');

  const requiredFooterLinks = [
    'href="/book-free-intro"',
    'href="/schedule"',
    'href="/show-up-kit"',
    'href="/options-pricing"',
    'href="/kids"',
    'href="/teen-jiu-jitsu-tannersville-ny"',
    'href="/adult-bjj"',
    'href="/private-lessons"',
    'href="/near/hunter-ny"',
    'href="/near/windham-ny"',
    'href="/near/haines-falls-ny"',
    'href="/near/woodstock-ny"',
    'href="/bjj-glossary"',
    'href="/bjj-videos"',
    'href="/blog"',
    'href="/bjj-faqs"',
    'href="/nearby-towns"',
    'href="/bio"',
    'href="/sensei-jiu-jitsu"',
    'href="/directions"',
    'href="/contact"',
    'href="tel:+19177368649"',
    'href="sms:+19177368649"',
    'href="mailto:me@senseisandy.com"'
  ];

  requiredFooterLinks.forEach((link) => {
    ensure(footerHtml.includes(link), `footer-include.html missing ${link}`);
  });

  ensure(count(footerHtml, 'class="ss-mobile-actionbar"') === 1, 'Expected exactly one shared mobile action bar.');
  const mobileActionBarMatch = footerHtml.match(/<nav class="ss-mobile-actionbar"[^>]*>([\s\S]*?)<\/nav>/);
  ensure(mobileActionBarMatch, 'Expected shared mobile action bar markup.');
  const mobileActionBarHtml = mobileActionBarMatch[1];
  const mobileActionLinks = [...mobileActionBarHtml.matchAll(/<a\b([^>]*)>([^<]+)<\/a>/g)]
    .map((match) => ({
      attrs: match[1],
      label: match[2].trim()
    }));
  const mobileActionLabels = mobileActionLinks.map((link) => link.label);
  ensure(
    JSON.stringify(mobileActionLabels) === JSON.stringify(['Reserve Free Intro', 'Text Sandy First']),
    'Expected shared mobile action bar labels to be Reserve Free Intro, Text Sandy First in order.'
  );
  const mobileActionHrefs = mobileActionLinks.map((link) => link.attrs.match(/href="([^"]+)"/)?.[1] || '');
  ensure(
    JSON.stringify(mobileActionHrefs) === JSON.stringify(['/book-free-intro', 'sms:+19177368649']),
    'Expected shared mobile action bar destinations to be intro, SMS in order.'
  );
  ensure(
    mobileActionLinks[0]?.attrs.includes('class="ss-action-primary"')
      && mobileActionLinks.slice(1).every((link) => !link.attrs.includes('ss-action-primary')),
    'Expected only Reserve Free Intro to be primary in the shared mobile action bar.'
  );
  ensure(!mobileActionBarHtml.includes('Pricing'), 'Shared mobile action bar must not include Pricing.');
  ensure(count(footerHtml, 'data-footer-group="primary"') === 1, 'Expected one primary footer group.');
  ensure(count(footerHtml, 'data-footer-group="secondary"') === 4, 'Expected four secondary footer groups.');

  const includePages = [
    'index.html',
    'student-hub.html',
    'bjj-glossary/index.html',
    'catskills-jiu-jitsu.html',
    'martial-arts-hunter-ny.html',
    'jiu-jitsu-safety-tannersville-ny.html',
    'kids.html',
    'adult-bjj.html',
    'teen-jiu-jitsu-tannersville-ny.html',
    'near/template.html',
    ...await listNearPages()
  ];

  for (const relPath of includePages) {
    const html = await read(relPath);
    ensure(count(html, CTA_INCLUDE) === 1, `${relPath} should include exactly one shared final CTA include.`);
  }

  for (const relPath of await listGlossaryTermPages()) {
    const html = await read(relPath);
    ensure(count(html, CTA_INCLUDE) === 1, `${relPath} should include exactly one shared final CTA include.`);
  }

  console.log('qa-footer passed.');
};

main().catch((error) => {
  console.error(`qa-footer failed: ${error.message}`);
  process.exit(1);
});
