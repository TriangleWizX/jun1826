#!/usr/bin/env node
// Generate route-scoped Teens and Adults CSS from the current audience stylesheets.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PurgeCSS } from 'purgecss';
import * as sass from 'sass';
import { RUNTIME_SAFELIST } from './build-route-styles.mjs';

const project = path.resolve('.');
const root = await fs.realpath(path.join(project, 'dist'));
const pages = [
  { audience: 'teens', route: 'bjj-classes/teens-tannersville-ny/index.html' },
  { audience: 'adults', route: 'bjj-classes/adults-tannersville-ny/index.html' },
];
const inside = (file) => file.startsWith(root + path.sep);

async function localFile(href, owner) {
  const pathname = href.split(/[?#]/)[0];
  if (/^(?:[a-z]+:|\/\/)/i.test(pathname)) throw new Error(`Expected local audience asset: ${href}`);
  const target = pathname.startsWith('/')
    ? path.resolve(root, `.${pathname}`)
    : path.resolve(path.dirname(owner), pathname);
  const file = await fs.realpath(target);
  if (!inside(file)) throw new Error(`Audience asset outside build: ${href}`);
  return file;
}

async function expandHtml(file, seen = new Set()) {
  if (seen.has(file) || seen.size > 12) throw new Error('Audience SSI cycle/depth');
  let html = await fs.readFile(file, 'utf8');
  for (const match of [...html.matchAll(/<!--\s*#include\s+virtual=["']([^"']+)["']\s*-->/g)]) {
    const included = await localFile(match[1], file);
    html = html.replace(match[0], await expandHtml(included, new Set([...seen, file])));
  }
  return html;
}

async function expandCss(file, seen = new Set()) {
  if (seen.has(file) || seen.size > 12) throw new Error('Audience CSS import cycle/depth');
  let css = await fs.readFile(file, 'utf8');
  for (const match of [...css.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']\s*\)?\s*;/g)]) {
    const imported = await localFile(match[1], file);
    css = css.replace(match[0], await expandCss(imported, new Set([...seen, file])));
  }
  if (/@import\b/.test(css)) throw new Error(`Unsupported audience CSS import in ${file}`);
  return css;
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)=["']([^"']*)["']/g)]
    .map((match) => [match[1].toLowerCase(), match[2]]));
}

for (const { audience, route } of pages) {
  const page = path.join(root, route);
  let html = await fs.readFile(page, 'utf8');
  const linkTags = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => ({ tag: match[0], index: match.index }));
  const pageStyles = linkTags.filter(({ tag }) => {
    const attrs = attributes(tag);
    return attrs.rel === 'stylesheet' && new RegExp(`^/assets/css/pages/${audience}\\.[a-f0-9]{6}\\.css$`).test(attrs.href || '');
  });
  if (pageStyles.length !== 1) throw new Error(`Expected one fingerprinted ${audience} page stylesheet, found ${pageStyles.length}`);
  const owned = pageStyles[0];
  const attrs = attributes(owned.tag);
  const attrNames = [...owned.tag.matchAll(/\s([\w-]+)=["'][^"']*["']/g)].map((match) => match[1].toLowerCase());
  if (Object.keys(attrs).some((name) => !['rel', 'href'].includes(name)) || attrNames.length !== 2) {
    throw new Error(`Unexpected conditional ${audience} stylesheet link; review delivery handling`);
  }

  const expandedHtml = await expandHtml(page);
  const content = [{ raw: expandedHtml.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''), extension: 'html' }];
  const scripts = new Set();
  async function collectScripts(text, ownerFile) {
    const refs = [...text.matchAll(/["']((?:\/|\.{1,2}\/)[^"'\s]+\.js(?:\?[^"'\s]*)?)["']/g)];
    for (const match of refs) {
      const file = await localFile(match[1], ownerFile);
      if (scripts.has(file)) continue;
      if (scripts.size >= 40) throw new Error(`Unexpected ${audience} runtime dependency expansion`);
      scripts.add(file);
      const raw = await fs.readFile(file, 'utf8');
      content.push({ raw, extension: 'js' });
      await collectScripts(raw, file);
    }
  }
  await collectScripts(expandedHtml, page);

  const sourceCss = path.join(project, 'src/assets/css/pages', `${audience}.css`);
  const rawCss = await expandCss(sourceCss);
  const [result] = await new PurgeCSS().purge({
    content,
    css: [{ raw: rawCss }],
    safelist: {
      standard: [...RUNTIME_SAFELIST, /^bi-/],
      greedy: [/^:(?:where|is)$/],
    },
    fontFace: false,
    keyframes: false,
    variables: false,
  });
  if (!result?.css) throw new Error(`Empty ${audience} stylesheet result`);
  const css = `${sass.compileString(result.css, { style: 'compressed', syntax: 'css', charset: false }).css}\n`;
  const digest = createHash('sha256').update(css).digest('hex').slice(0, 12);
  const href = `/assets/css/pages/${audience}-delivery.${digest}.css`;
  const output = path.join(root, href);
  await fs.writeFile(output, css);
  html = html.replace(owned.tag, owned.tag.replace(attrs.href, href));

  // Keep the route stylesheet as its own request and in its existing cascade
  // position, but specialize the shared route bundle for these two pages.
  const routeLinks = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => ({ tag: match[0] }));
  const routeStyles = routeLinks.filter(({ tag }) => {
    const routeAttrs = attributes(tag);
    return routeAttrs.rel === 'stylesheet'
      && /^\/assets\/css\/routes\/site-[a-f0-9]{12}\.min\.css$/.test(routeAttrs.href || '');
  });
  if (routeStyles.length !== 1) {
    throw new Error(`Expected one shared ${audience} route stylesheet, found ${routeStyles.length}`);
  }
  const routeLink = routeStyles[0];
  const routeAttrs = attributes(routeLink.tag);
  const routeAttrNames = [...routeLink.tag.matchAll(/\s([\w-]+)=["'][^"']*["']/g)]
    .map((match) => match[1].toLowerCase());
  if (Object.keys(routeAttrs).some((name) => !['rel', 'href'].includes(name)) || routeAttrNames.length !== 2) {
    throw new Error(`Unexpected conditional ${audience} route stylesheet link; review delivery handling`);
  }
  const routeCssFile = await localFile(routeAttrs.href, page);
  const sharedRouteCss = await fs.readFile(routeCssFile, 'utf8');
  const [routeResult] = await new PurgeCSS().purge({
    content,
    css: [{ raw: sharedRouteCss }],
    safelist: [...RUNTIME_SAFELIST],
    fontFace: false,
    keyframes: false,
    variables: false,
  });
  if (!routeResult?.css) throw new Error(`Empty ${audience} route stylesheet result`);
  const routeCss = `${sass.compileString(routeResult.css, { style: 'compressed', syntax: 'css', charset: false }).css}\n`;
  const routeDigest = createHash('sha256').update(routeCss).digest('hex').slice(0, 12);
  const routeHref = `/assets/css/routes/site-${audience}-delivery.${routeDigest}.css`;
  await fs.writeFile(path.join(root, routeHref), routeCss);
  html = html.replace(routeLink.tag, routeLink.tag.replace(routeAttrs.href, routeHref));

  await fs.writeFile(page, html);
  console.log(`${audience} CSS: ${Buffer.byteLength(rawCss)} -> ${Buffer.byteLength(css)} bytes (${href}); ${scripts.size} local runtime scripts`);
  console.log(`${audience} route CSS: ${Buffer.byteLength(sharedRouteCss)} -> ${Buffer.byteLength(routeCss)} bytes (${routeHref})`);
}
