#!/usr/bin/env node
// Build only the free-intro page's CSS from fresh rendered HTML, including Apache SSI.
// Other routes retain their existing stylesheet ownership and ordering.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PurgeCSS } from 'purgecss';
import * as sass from 'sass';
import { RUNTIME_SAFELIST } from './build-route-styles.mjs';

const root = path.resolve('dist');
const inside = (file) => file.startsWith(root + path.sep);
async function localFile(href) {
  if (!href.startsWith('/') || href.startsWith('//')) throw new Error(`Expected local CSS: ${href}`);
  const file = await fs.realpath(path.resolve(root, '.' + href.split(/[?#]/)[0]));
  if (!inside(file)) throw new Error(`Asset outside build: ${href}`);
  return file;
}
async function expandHtml(file, seen = new Set()) {
  if (seen.has(file) || seen.size > 12) throw new Error('Free Intro SSI cycle/depth');
  let html = await fs.readFile(file, 'utf8');
  for (const match of [...html.matchAll(/<!--#include\s+virtual=["']([^"']+)["']\s*-->/g)]) {
    html = html.replace(match[0], await expandHtml(await localFile(match[1]), new Set([...seen, file])));
  }
  return html;
}
async function expandCss(file, seen = new Set()) {
  if (seen.has(file)) throw new Error('Free Intro CSS import cycle');
  let css = await fs.readFile(file, 'utf8');
  for (const match of [...css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g)]) {
    const href = match[1];
    if (/^(https?:|\/\/)/.test(href)) throw new Error('Free Intro CSS must remain local');
    const target = href.startsWith('/') ? await localFile(href) : await fs.realpath(path.resolve(path.dirname(file), href));
    if (!inside(target)) throw new Error('CSS import outside build');
    css = css.replace(match[0], await expandCss(target, new Set([...seen, file])));
  }
  // Fingerprinting already rewrites canonical CSS URLs to root-relative paths.
  for (const match of css.matchAll(/url\(([^)]+)\)/gi)) {
    const href = match[1].trim().replace(/^["']|["']$/g, '');
    if (!/^(\/|data:|https?:|#)/.test(href)) throw new Error(`Unresolved relative URL in ${file}`);
  }
  return css;
}

const freeIntroPage = path.join(root, 'free-bjj-intro-tannersville-ny', 'index.html');
let html = await fs.readFile(freeIntroPage, 'utf8');
if (/\/assets\/css\/pages\/free-intro-delivery\.[a-f0-9]{12}\.css/.test(html) || /id="free-intro-delivery-inline"/.test(html)) {
  throw new Error('Run on a fresh production build');
}
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((m) => [m[1], m[2]]));
const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => ({ tag: m[0], ...attrs(m[0]) }));
const owned = links.filter((l) => l.rel === 'stylesheet' && (
  /\/assets\/css\/fonts\.min[.]/.test(l.href) ||
  /\/assets\/css\/bootstrap-icons-local[.]/.test(l.href) ||
  /\/assets\/css\/site-shell\.min[.]/.test(l.href) ||
  /\/assets\/css\/pages\/book-free-intro[.]/.test(l.href)
));
if (owned.length !== 4) throw new Error(`Expected four free-intro stylesheet inputs, got ${owned.length}`);

const expanded = await expandHtml(freeIntroPage);
const scriptContent = [];
for (const match of expanded.matchAll(/<script\b[^>]*\bsrc=["'](\/[^"']+)["'][^>]*>/gi)) {
  try {
    scriptContent.push({ raw: await fs.readFile(await localFile(match[1]), 'utf8'), extension: 'js' });
  } catch (_) {}
}

const inlineStyles = [];
html = html.replace(/<style\b(?![^>]*\bid=["']free-intro-delivery-inline["'])[^>]*>([\s\S]*?)<\/style>/gi, (match, content) => {
  inlineStyles.push(content);
  return '';
});

const cssParts = [
  ...await Promise.all(owned.map(async (l) => expandCss(await localFile(l.href)))),
  ...inlineStyles
];
const results = await new PurgeCSS().purge({
  content: [{ raw: expanded, extension: 'html' }, ...scriptContent],
  css: [{ raw: cssParts.join('\n') }],
  safelist: [
    ...RUNTIME_SAFELIST,
    /:where/,
    /^ss-/,
    /^pb-/,
    /^page-book-intro/,
    /^editorial-/,
    /^adult-/,
    /^child-/,
    /^teen-/,
    /^family-/,
    /^bezel-/,
    /^card/,
    /^choice-/,
    /^requested-/,
    /^btn-/,
    /^bi-/,
    /^nav-/,
    /^navbar-/,
    /^dropdown/,
    /^collapse/,
    /^collapsing/,
    'show',
    'active',
    'open',
    'is-visible',
    'is-observed',
    'is-ready',
    'hidden',
    'text-danger',
    'text-muted',
    'text-dark',
    'fw-bold',
    'fw-semibold',
    'fst-italic',
    'bg-white',
    'bg-light',
    'border-0',
    'rounded-3',
    'shadow-sm',
    'shadow-lg'
  ],
  fontFace: false,
  keyframes: false,
  variables: false,
});
if (results.length !== 1 || !results[0].css) throw new Error('Missing free-intro CSS result');
let css = sass.compileString(results[0].css, { style: 'compressed', syntax: 'css', charset: false }).css + '\n';

const digest = createHash('sha256').update(css).digest('hex').slice(0, 12);
const href = `/assets/css/pages/free-intro-delivery.${digest}.css`;
const deliveryDir = path.join(root, 'assets', 'css', 'pages');
for (const entry of await fs.readdir(deliveryDir)) {
  if (/^free-intro-delivery\.[a-f0-9]{12}\.css$/.test(entry)) {
    await fs.unlink(path.join(deliveryDir, entry));
  }
}
await fs.writeFile(path.join(root, href), css);

// Inline critical delivery stylesheet directly into document head to eliminate
// render-blocking stylesheet network chain and accelerate LCP.
html = html.replace(owned[0].tag, `<style id="free-intro-delivery-inline">${css.trim()}</style>`);
for (const l of owned.slice(1)) html = html.replace(l.tag, '');

// Tokens have been inlined from site-shell's import, so its preload is redundant.
for (const l of links.filter((l) => l.rel === 'preload' && l.as === 'style' && /^\/tokens[.]/.test(l.href))) {
  html = html.replace(l.tag, '');
}

await fs.writeFile(freeIntroPage, html);
console.log(`Free Intro CSS: ${Buffer.byteLength(cssParts.join('\n'))} -> ${Buffer.byteLength(css)} bytes (${href})`);
