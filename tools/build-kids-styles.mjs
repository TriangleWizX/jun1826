#!/usr/bin/env node
// Build the measured Kids-page CSS subset without changing shared source styles.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PurgeCSS } from 'purgecss';
import * as sass from 'sass';
import { RUNTIME_SAFELIST } from './build-route-styles.mjs';

const root = await fs.realpath(path.resolve('dist'));
const page = path.join(root, 'bjj-classes/kids-tannersville-ny/index.html');
const inside = (file) => file.startsWith(root + path.sep);
async function localFile(href, owner = page) {
  const pathname = href.split(/[?#]/)[0];
  if (/^(?:[a-z]+:|\/\/)/i.test(pathname)) throw new Error(`Expected local asset: ${href}`);
  const target = pathname.startsWith('/')
    ? path.resolve(root, '.' + pathname)
    : path.resolve(path.dirname(owner), pathname);
  const file = await fs.realpath(target);
  if (!inside(file)) throw new Error(`Asset outside build: ${href}`);
  return file;
}
async function expandHtml(file, seen = new Set()) {
  if (seen.has(file) || seen.size > 12) throw new Error('Kids SSI cycle/depth');
  let html = await fs.readFile(file, 'utf8');
  for (const match of [...html.matchAll(/<!--\s*#include\s+virtual=["']([^"']+)["']\s*-->/g)]) {
    html = html.replace(match[0], await expandHtml(await localFile(match[1]), new Set([...seen, file])));
  }
  return html;
}
async function expandCss(file, seen = new Set()) {
  if (seen.has(file) || seen.size > 12) throw new Error('Kids CSS import cycle/depth');
  let css = await fs.readFile(file, 'utf8');
  for (const match of [...css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g)]) {
    css = css.replace(match[0], await expandCss(await localFile(match[1], file), new Set([...seen, file])));
  }
  if (/@import\b/.test(css)) throw new Error('Unsupported Kids CSS import; review its conditions before bundling');
  for (const match of css.matchAll(/url\(([^)]+)\)/gi)) {
    const href = match[1].trim().replace(/^["']|["']$/g, '');
    if (/^(?:data:|#)/i.test(href)) continue;
    if (!href.startsWith('/') || href.startsWith('//')) throw new Error(`CSS URL must remain local and rooted: ${href}`);
    await localFile(href);
  }
  return css;
}

let html = await fs.readFile(page, 'utf8');
if (/\/kids-delivery\.[a-f0-9]{12}\.css/.test(html)) throw new Error('Run Kids CSS generation on a fresh production build');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((m) => [m[1], m[2]]));
const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => ({ tag: m[0], index: m.index, ...attrs(m[0]) }));
const owned = links.filter((link) => link.rel === 'stylesheet');
const expected = [
  /^\/assets\/css\/bootstrap-icons-local\.[a-f0-9]{6}\.css$/,
  /^\/assets\/css\/fonts\.min\.[a-f0-9]{6}\.css$/,
  /^\/assets\/css\/site-shell\.min\.[a-f0-9]{6}\.css$/,
  /^\/assets\/css\/routes\/site-[a-f0-9]{12}\.min\.css$/,
  /^\/assets\/css\/pages\/kids\.[a-f0-9]{6}\.css$/,
  /^\/assets\/css\/mobile-foundation\.[a-f0-9]{6}\.css$/,
];
if (owned.length !== expected.length || owned.some((link, i) => !expected[i].test(link.href))) {
  throw new Error('Unexpected Kids stylesheet ownership/order; review before bundling');
}
for (const link of owned) {
  const remainder = link.tag.replace(/^<link\b/i, '').replace(/\/?\s*>$/, '')
    .replace(/\s+(?:rel|href)=["'][^"']*["']/g, '').trim();
  if (remainder || Object.keys(attrs(link.tag)).some((key) => !['rel', 'href'].includes(key))) {
    throw new Error('Conditional Kids stylesheet requires explicit delivery handling');
  }
}
const between = html.slice(owned[0].index, owned.at(-1).index + owned.at(-1).tag.length);
if (/<(?:style|script)\b/i.test(between)) throw new Error('Cannot move CSS across inline styles or scripts');

const expanded = await expandHtml(page);
const content = [{ raw: expanded.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''), extension: 'html' }];
const scripts = new Set();
async function collectScripts(text, owner) {
  // Includes local dynamically loaded Bootstrap and analytics modules, not just script tags.
  const refs = [...text.matchAll(/["']((?:\/|\.{1,2}\/)[^"'\s]+\.js(?:\?[^"'\s]*)?)["']/g)];
  for (const match of refs) {
    if (match[1].startsWith('//')) continue;
    const file = await localFile(match[1], owner);
    if (scripts.has(file)) continue;
    if (scripts.size >= 40) throw new Error('Unexpected Kids runtime dependency expansion');
    scripts.add(file);
    const raw = await fs.readFile(file, 'utf8');
    content.push({ raw, extension: 'js' });
    await collectScripts(raw, file);
  }
}
await collectScripts(expanded, page);

const cssParts = [];
let inputBytes = 0;
for (const link of owned) {
  const raw = await expandCss(await localFile(link.href));
  inputBytes += Buffer.byteLength(raw);
  const [result] = await new PurgeCSS().purge({
    content,
    css: [{ raw }],
    safelist: {
      standard: [...RUNTIME_SAFELIST, /^bi-/],
      // PurgeCSS sees the pseudo's name, not its full parenthesized selector.
      // Without this, valid heading :where(...) rules disappear.
      greedy: [/^:(?:where|is)$/],
    },
    fontFace: false,
    keyframes: false,
    variables: false,
  });
  if (!result?.css) throw new Error(`Empty Kids stylesheet result: ${link.href}`);
  cssParts.push(sass.compileString(result.css, { style: 'compressed', syntax: 'css', charset: false }).css);
}
const css = cssParts.join('\n') + '\n';
const digest = createHash('sha256').update(css).digest('hex').slice(0, 12);
const href = `/assets/css/pages/kids-delivery.${digest}.css`;
html = html.replace(owned[0].tag, `<link rel="stylesheet" href="${href}">`);
for (const link of owned.slice(1)) html = html.replace(link.tag, '');
for (const link of links.filter((link) => link.rel === 'preload' && link.as === 'style' && /^\/tokens\.[a-f0-9]{6}\.css$/.test(link.href))) {
  html = html.replace(link.tag, '');
}
// Keep previous fingerprinted siblings for scoped-release rollback; the new page references only this one.
await fs.writeFile(path.join(root, href), css);
await fs.writeFile(page, html);
console.log(`Kids CSS: ${inputBytes} -> ${Buffer.byteLength(css)} bytes (${href}); ${scripts.size} local runtime scripts`);
