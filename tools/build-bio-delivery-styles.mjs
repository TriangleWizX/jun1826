#!/usr/bin/env node
// Combine Bio's page, route, and mobile-foundation stylesheets. Keep the
// page-specific mobile fix separate so malformed Bio CSS cannot block it.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve('dist');
const htmlPath = path.join(root, 'bio.html');
const pageHrefPattern = /^\/assets\/css\/pages\/bio\.min\.[a-f0-9]{6}\.css$/;
const routeHrefPattern = /^\/assets\/css\/routes\/site-[a-f0-9]{12}\.min\.css$/;
const mobileHrefPattern = /^\/assets\/css\/mobile-foundation\.[a-f0-9]{6}\.css$/;
const mobileFixHrefPattern = /^\/assets\/css\/pages\/bio-mobile-fixes\.[a-f0-9]{6}\.css$/;
const deliveryPattern = /^\/assets\/css\/pages\/bio-delivery\.[a-f0-9]{12}\.css$/;

function localFile(href) {
  if (!href.startsWith('/') || href.startsWith('//') || /[?#]/.test(href)) {
    throw new Error(`Expected a clean root-relative asset URL: ${href}`);
  }
  const file = path.resolve(root, `.${href}`);
  if (!file.startsWith(`${root}${path.sep}`)) throw new Error(`Asset escapes dist: ${href}`);
  return file;
}

function stylesheetLinks(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => {
    const tag = match[0];
    const rel = tag.match(/\brel=["']([^"']*)["']/i)?.[1];
    const href = tag.match(/\bhref=["']([^"']*)["']/i)?.[1];
    const media = tag.match(/\bmedia=["']([^"']*)["']/i)?.[1];
    return { tag, index: match.index, rel, href, media };
  }).filter((link) => link.rel?.toLowerCase().split(/\s+/).includes('stylesheet'));
}

const htmlOriginal = await fs.readFile(htmlPath, 'utf8');
const links = stylesheetLinks(htmlOriginal);
if (links.length !== 7) {
  throw new Error(`Expected exactly seven Bio stylesheet links before migration, got ${links.length}.`);
}
if (links.some((link) => deliveryPattern.test(link.href || ''))) {
  throw new Error('Bio delivery stylesheet already present; run on a fresh production build.');
}
const pageLinks = links.filter((link) => pageHrefPattern.test(link.href || ''));
const routeLinks = links.filter((link) => routeHrefPattern.test(link.href || ''));
const mobileLinks = links.filter((link) => mobileHrefPattern.test(link.href || ''));
const mobileFixLinks = links.filter((link) => mobileFixHrefPattern.test(link.href || ''));
if (pageLinks.length !== 1 || routeLinks.length !== 1 || mobileLinks.length !== 1 || mobileFixLinks.length !== 1 ||
    !(pageLinks[0].index < routeLinks[0].index && routeLinks[0].index < mobileFixLinks[0].index && mobileFixLinks[0].index < mobileLinks[0].index)) {
  throw new Error('Expected one Bio page, route, and mobile-fix stylesheet before mobile-foundation.');
}

const pageLink = pageLinks[0];
const routeLink = routeLinks[0];
const mobileLink = mobileLinks[0];
const mobileFixLink = mobileFixLinks[0];
const selectedLinks = [pageLink, routeLink, mobileLink];
if ([...selectedLinks, mobileFixLink].some((link) => link.media !== undefined)) {
  throw new Error('Bio delivery inputs with media attributes are unsupported.');
}
const selectedTags = new Set([...selectedLinks, mobileFixLink].map((link) => link.tag));
const orderedStyles = links.filter((link) => link.index >= pageLink.index && link.index <= mobileLink.index);
if (orderedStyles.some((link) => !selectedTags.has(link.tag))) {
  throw new Error('An unrelated stylesheet falls between Bio delivery inputs.');
}
if (links.some((link) => link.index > mobileLink.index)) {
  throw new Error('A stylesheet follows mobile-foundation; Bio delivery cannot safely move it.');
}
const pageCss = await fs.readFile(localFile(pageLink.href), 'utf8');
const routeCss = await fs.readFile(localFile(routeLink.href), 'utf8');
const mobileCss = await fs.readFile(localFile(mobileLink.href), 'utf8');
const mobileFixCss = await fs.readFile(localFile(mobileFixLink.href), 'utf8');

// The current fingerprinted files use root-relative/data/remote/hash URLs only.
// Keep that invariant explicit because a new stylesheet URL changes the base
// directory for relative CSS URLs.
for (const [href, css] of [
  [pageLink.href, pageCss],
  [routeLink.href, routeCss],
  [mobileLink.href, mobileCss],
  [mobileFixLink.href, mobileFixCss],
]) {
  for (const match of css.matchAll(/url\(([^)]*)\)/gi)) {
    const url = match[1].trim().replace(/^["']|["']$/g, '');
    if (!/^(\/|data:|https?:|#)/i.test(url)) {
      throw new Error(`Relative CSS URL in ${href} would change meaning in the combined asset: ${url}`);
    }
  }
  if (/@import\b/i.test(css)) throw new Error(`Unexpected CSS import in ${href}`);
}

// Preserve the existing page, route, and mobile-foundation order. The Bio
// mobile fix stays a separate final link in HTML so it parses after bad CSS.
const combinedCss = [pageCss, routeCss, mobileCss]
  .map((css) => css.trim())
  .join('\n') + '\n';
const digest = createHash('sha256').update(combinedCss).digest('hex').slice(0, 12);
const outputHref = `/assets/css/pages/bio-delivery.${digest}.css`;
const outputPath = localFile(outputHref);

let html = htmlOriginal.replace(pageLink.tag, `<link rel="stylesheet" href="${outputHref}">`);
html = html.replace(routeLink.tag, '');
html = html.replace(mobileLink.tag, '');
const outputLinks = stylesheetLinks(html);
if (outputLinks.length !== 5 ||
    outputLinks.filter((link) => link.href === outputHref).length !== 1 ||
    outputLinks.filter((link) => link.href === mobileFixLink.href).length !== 1 ||
    outputLinks.some((link) => [pageLink.href, routeLink.href, mobileLink.href].includes(link.href)) ||
    outputLinks.some((link) => link.index > outputLinks.find((item) => item.href === mobileFixLink.href).index)) {
  throw new Error(`Expected five stylesheet links with final Bio delivery and mobile-fix links, got ${outputLinks.length}.`);
}

await fs.writeFile(outputPath, combinedCss);
await fs.writeFile(htmlPath, html);
console.log(`Bio styles: ${selectedLinks.map((link) => link.href).join(' -> ')}`);
console.log(`Bio source bytes: ${[pageCss, routeCss, mobileCss].map((css) => Buffer.byteLength(css)).join(' + ')}`);
console.log(`Bio delivery: ${outputHref} (${Buffer.byteLength(combinedCss)} B)`);
console.log(`Bio mobile fix remains separate: ${mobileFixLink.href} (${Buffer.byteLength(mobileFixCss)} B)`);
