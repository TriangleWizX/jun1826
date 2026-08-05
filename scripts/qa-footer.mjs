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
    'href="/free-bjj-intro-tannersville-ny#booking-flow"',
    'href="/schedule"',
    'href="/nearby-towns"',
    'href="/blog"',
    'href="/bjj-glossary"',
    'href="/bjj-faqs"',
    'href="/bjj-classes/tannersville-ny"',
    'href="/bjj-classes/hunter-ny"',
    'href="/bjj-classes/windham-ny"',
    'href="/bjj-classes/haines-falls-ny"',
    'href="/bjj-tannersville-ny-directions"',
    'href="/contact"',
    'href="tel:+19177368649"',
    'sms:+19177368649',
    'href="mailto:me@senseisandy.com"'
  ];

  requiredFooterLinks.forEach((link) => {
    ensure(footerHtml.includes(link), `footer-include.html missing ${link}`);
  });
  ensure(
    footerHtml.includes('<a href="/nearby-towns">Choose Lane</a>'),
    'Choose Lane must use the canonical /nearby-towns route.'
  );


  ensure(count(footerHtml, 'data-footer-group="primary"') === 1, 'Expected one primary footer group.');
  ensure(count(footerHtml, 'data-footer-group="secondary"') === 6, 'Expected six secondary footer groups.');

  const requiredFooterGroups = [
    'Start Here',
    'Programs',
    'Studio',
    'Nearby',
    'Learn',
    'Friends of the Academy'
  ];
  requiredFooterGroups.forEach((label) => {
    ensure(footerHtml.includes(`<h3>${label}</h3>`), `footer-include.html missing ${label} group.`);
  });

  const includePages = [
    'near/template.html',
    ...await listNearPages()
  ];

  for (const relPath of includePages) {
    const html = await read(relPath);
    ensure(count(html, CTA_INCLUDE) === 1, `${relPath} should include exactly one shared final CTA include.`);
  }



  console.log('qa-footer passed.');
};

main().catch((error) => {
  console.error(`qa-footer failed: ${error.message}`);
  process.exit(1);
});
