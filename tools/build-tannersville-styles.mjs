#!/usr/bin/env node
// Build only the Tannersville location page's CSS from fresh rendered HTML, including Apache SSI.
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
  if (seen.has(file) || seen.size > 12) throw new Error('Tannersville SSI cycle/depth');
  let html = await fs.readFile(file, 'utf8');
  for (const match of [...html.matchAll(/<!--#include\s+virtual=["']([^"']+)["']\s*-->/g)]) {
    html = html.replace(match[0], await expandHtml(await localFile(match[1]), new Set([...seen, file])));
  }
  return html;
}
async function expandCss(file, seen = new Set()) {
  if (seen.has(file)) throw new Error('Tannersville CSS import cycle');
  let css = await fs.readFile(file, 'utf8');
  for (const match of [...css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g)]) {
    const href = match[1];
    if (/^(https?:|\/\/)/.test(href)) throw new Error('Tannersville CSS must remain local');
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

const tannersvillePage = path.join(root, 'bjj-classes', 'tannersville-ny', 'index.html');
let html = await fs.readFile(tannersvillePage, 'utf8');
if (/\/assets\/css\/pages\/tannersville-delivery\.[a-f0-9]{12}\.css/.test(html) || /id="tannersville-delivery-inline"/.test(html)) {
  throw new Error('Run on a fresh production build');
}
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((m) => [m[1], m[2]]));
const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => ({ tag: m[0], ...attrs(m[0]) }));
const owned = links.filter((l) => l.rel === 'stylesheet' && (
  /\/assets\/css\/fonts\.min[.]/.test(l.href) ||
  /\/assets\/css\/bootstrap-icons-local[.]/.test(l.href) ||
  /\/assets\/css\/site-shell\.min[.]/.test(l.href) ||
  /\/assets\/css\/routes\/site-[a-f0-9]{12}\.min\.css/.test(l.href) ||
  /\/assets\/css\/pages\/tannersville\.min[.]/.test(l.href) ||
  /\/assets\/css\/pages\/tannersville\.css/.test(l.href)
));
if (owned.length !== 5) throw new Error(`Expected five tannersville stylesheet inputs, got ${owned.length}`);

const expanded = await expandHtml(tannersvillePage);
const scriptContent = [];
for (const match of expanded.matchAll(/<script\b[^>]*\bsrc=["'](\/[^"']+)["'][^>]*>/gi)) {
  try {
    scriptContent.push({ raw: await fs.readFile(await localFile(match[1]), 'utf8'), extension: 'js' });
  } catch (_) {}
}

const usedIcons = new Set(['bi']);
const cleanExpanded = expanded.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
for (const m of cleanExpanded.matchAll(/\bclass=["'][^"']*?\b(bi-[a-zA-Z0-9_-]+)\b/g)) {
  usedIcons.add(m[1]);
}
for (const s of scriptContent) {
  for (const m of s.raw.matchAll(/\b(bi-[a-zA-Z0-9_-]+)\b/g)) {
    usedIcons.add(m[1]);
  }
}

const cssParts = await Promise.all(owned.map(async (l) => expandCss(await localFile(l.href))));
const results = await new PurgeCSS().purge({
  content: [{ raw: expanded, extension: 'html' }, ...scriptContent],
  css: [{ raw: cssParts.join('\n') }],
  safelist: [
    ...RUNTIME_SAFELIST,
    ...usedIcons,
    /^ss-/,
    /^page-tannersville/,
    /^db-card/,
    /^step-/,
    /^lead-/,
    /^btn-/,
    /^bento-/,
    /^schedule-/,
    /^nav-/,
    /^navbar-/,
    /^dropdown/,
    /^collapse/,
    /^collapsing/,
    'show',
    'active',
    'open',
    'mixed',
    'is-visible',
    'is-observed',
    'reveal-on-scroll',
    'revealed'
  ],
  fontFace: false,
  keyframes: false,
  variables: false,
});
if (results.length !== 1 || !results[0].css) throw new Error('Missing tannersville CSS result');
let css = sass.compileString(results[0].css, { style: 'compressed', syntax: 'css', charset: false }).css + '\n';

// Prune unreferenced CSS variable declarations to reduce unused CSS payload safely
const varRegex = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
const usedVars = new Set();
for (const m of expanded.matchAll(varRegex)) usedVars.add(m[1]);
for (const m of css.matchAll(varRegex)) usedVars.add(m[1]);
css = css.replace(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g, (match, varName) => {
  return usedVars.has(varName) ? match : '';
});

const digest = createHash('sha256').update(css).digest('hex').slice(0, 12);
const href = `/assets/css/pages/tannersville-delivery.${digest}.css`;
const deliveryDir = path.join(root, 'assets', 'css', 'pages');
for (const entry of await fs.readdir(deliveryDir)) {
  if (/^tannersville-delivery\.[a-f0-9]{12}\.css$/.test(entry)) {
    await fs.unlink(path.join(deliveryDir, entry));
  }
}
await fs.writeFile(path.join(root, href), css);

// Inline critical delivery stylesheet directly into document head to eliminate
// render-blocking stylesheet network chain and accelerate LCP.
html = html.replace(owned[0].tag, `<style id="tannersville-delivery-inline">${css.trim()}</style>`);
for (const l of owned.slice(1)) html = html.replace(l.tag, '');

// Tokens have been inlined from site-shell's import, so its preload is redundant.
for (const l of links.filter((l) => l.rel === 'preload' && l.as === 'style' && /^\/tokens[.]/.test(l.href))) {
  html = html.replace(l.tag, '');
}

await fs.writeFile(tannersvillePage, html);
console.log(`Tannersville CSS: ${Buffer.byteLength(cssParts.join('\n'))} -> ${Buffer.byteLength(css)} bytes (${href})`);
