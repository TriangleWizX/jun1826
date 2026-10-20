#!/usr/bin/env node
// Build optimized delivery CSS for all blog article pages from fresh rendered HTML, including Apache SSI.
// Eliminates render-blocking stylesheets (blog, fonts.min, bootstrap-icons-local, routes/site, site-shell, tokens)
// and inlines critical delivery stylesheet directly into document head.

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
  if (seen.has(file) || seen.size > 12) throw new Error('Blog SSI cycle/depth');
  let html = await fs.readFile(file, 'utf8');
  for (const match of [...html.matchAll(/<!--#include\s+virtual=["']([^"']+)["']\s*-->/g)]) {
    html = html.replace(match[0], await expandHtml(await localFile(match[1]), new Set([...seen, file])));
  }
  return html;
}

async function expandCss(file, seen = new Set()) {
  if (seen.has(file)) throw new Error('Blog CSS import cycle');
  let css = await fs.readFile(file, 'utf8');
  for (const match of [...css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g)]) {
    const href = match[1];
    if (/^(https?:|\/\/)/.test(href)) throw new Error('Blog CSS must remain local');
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

const blogDir = path.join(root, 'blog');

async function getBlogHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await getBlogHtmlFiles(full));
    } else if (entry.isFile() && entry.name === 'index.html') {
      results.push(full);
    }
  }
  return results;
}

const blogPages = await getBlogHtmlFiles(blogDir);
if (blogPages.length === 0) {
  throw new Error('No blog pages found in dist/blog');
}

const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)].map((m) => [m[1], m[2]]));

// Identify owned stylesheets from an article page
const sampleFile = path.join(blogDir, 'hunter-elementary-tuesday-drop-off-bjj', 'index.html');
const sampleHtml = await fs.readFile(sampleFile, 'utf8');
if (/\/assets\/css\/pages\/article-delivery\.[a-f0-9]{12}\.css/.test(sampleHtml) || /id="article-delivery-inline"/.test(sampleHtml)) {
  throw new Error('Run on a fresh production build');
}

const sampleLinks = [...sampleHtml.matchAll(/<link\b[^>]*>/gi)].map((m) => ({ tag: m[0], ...attrs(m[0]) }));
const sampleOwned = sampleLinks.filter((l) => l.rel === 'stylesheet' && (
  /\/assets\/css\/fonts\.min[.]/.test(l.href) ||
  /\/assets\/css\/bootstrap-icons-local[.]/.test(l.href) ||
  /\/assets\/css\/site-shell\.min[.]/.test(l.href) ||
  /\/assets\/css\/routes\/site-[a-f0-9]{12}\.min\.css/.test(l.href) ||
  /\/assets\/css\/blog[.]/.test(l.href)
));

// Deduplicate hrefs in sampleOwned
const uniqueOwnedHrefs = [...new Set(sampleOwned.map((l) => l.href))];
if (uniqueOwnedHrefs.length < 4) {
  throw new Error(`Expected at least 4 blog stylesheet inputs, got ${uniqueOwnedHrefs.length}`);
}

// Gather content from all blog pages to purge accurately
let expandedAllHtml = '';
const scriptContent = [];
const scriptSeen = new Set();

for (const page of blogPages) {
  const expanded = await expandHtml(page);
  expandedAllHtml += expanded + '\n';

  for (const match of expanded.matchAll(/<script\b[^>]*\bsrc=["'](\/[^"']+)["'][^>]*>/gi)) {
    const src = match[1];
    if (!scriptSeen.has(src)) {
      scriptSeen.add(src);
      try {
        scriptContent.push({ raw: await fs.readFile(await localFile(src), 'utf8'), extension: 'js' });
      } catch (_) {}
    }
  }
}

const cssParts = await Promise.all(uniqueOwnedHrefs.map(async (href) => expandCss(await localFile(href))));

const results = await new PurgeCSS().purge({
  content: [{ raw: expandedAllHtml, extension: 'html' }, ...scriptContent],
  css: [{ raw: cssParts.join('\n') }],
  safelist: [
    ...RUNTIME_SAFELIST,
    /:where/,
    /^ss-/,
    /^is-/,
    /^page-/,
    /^blog-/,
    /^hero-/,
    /^hero__/,
    /^video-/,
    /^btn-/,
    /^bi-/,
    /^nav-/,
    /^navbar-/,
    /^dropdown/,
    /^collapse/,
    /^collapsing/,
    /^badge/,
    /^table/,
    /^border/,
    /^text-/,
    /^bg-/,
    /^fw-/,
    /^fs-/,
    /^display-/,
    /^ratio/,
    'show',
    'active',
    'open',
    'container',
    'lead',
    'blockquote',
    'img-fluid',
    'rounded',
    'rounded-pill',
    'w-100',
    'd-flex',
    'flex-wrap',
    'gap-2',
    'small',
    'ps-3'
  ],
  fontFace: false,
  keyframes: false,
  variables: false,
});

if (results.length !== 1 || !results[0].css) throw new Error('Missing article CSS result');
let css = sass.compileString(results[0].css, { style: 'compressed', syntax: 'css', charset: false }).css + '\n';

// Prune unreferenced CSS variable declarations to reduce unused CSS payload safely
const varRegex = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
const usedVars = new Set();
for (const m of expandedAllHtml.matchAll(varRegex)) usedVars.add(m[1]);
for (const m of css.matchAll(varRegex)) usedVars.add(m[1]);
css = css.replace(/(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g, (match, varName) => {
  return usedVars.has(varName) ? match : '';
});

const digest = createHash('sha256').update(css).digest('hex').slice(0, 12);
const href = `/assets/css/pages/article-delivery.${digest}.css`;
const deliveryDir = path.join(root, 'assets', 'css', 'pages');
await fs.mkdir(deliveryDir, { recursive: true });
for (const entry of await fs.readdir(deliveryDir)) {
  if (/^article-delivery\.[a-f0-9]{12}\.css$/.test(entry)) {
    await fs.unlink(path.join(deliveryDir, entry));
  }
}
await fs.writeFile(path.join(root, href), css);

// Inline critical delivery stylesheet directly into each blog document head to eliminate
// render-blocking stylesheet network chain and eliminate layout shifts.
let modifiedCount = 0;
for (const page of blogPages) {
  let html = await fs.readFile(page, 'utf8');
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => ({ tag: m[0], ...attrs(m[0]) }));
  const owned = links.filter((l) => l.rel === 'stylesheet' && (
    /\/assets\/css\/fonts\.min[.]/.test(l.href) ||
    /\/assets\/css\/bootstrap-icons-local[.]/.test(l.href) ||
    /\/assets\/css\/site-shell\.min[.]/.test(l.href) ||
    /\/assets\/css\/routes\/site-[a-f0-9]{12}\.min\.css/.test(l.href) ||
    /\/assets\/css\/blog[.]/.test(l.href)
  ));

  if (owned.length > 0) {
    html = html.replace(owned[0].tag, `<style id="article-delivery-inline">${css.trim()}</style>`);
    for (const l of owned.slice(1)) {
      html = html.replace(l.tag, '');
    }
    // Remove redundant tokens.css preload since tokens are already inlined
    for (const l of links.filter((l) => l.rel === 'preload' && l.as === 'style' && /^\/tokens[.]/.test(l.href))) {
      html = html.replace(l.tag, '');
    }
    await fs.writeFile(page, html);
    modifiedCount++;
  }
}

console.log(`Article CSS: ${Buffer.byteLength(cssParts.join('\n'))} -> ${Buffer.byteLength(css)} bytes (${href}) across ${modifiedCount} pages`);
