#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const familyRoot = path.join(dist, 'bjj-classes');
const required = [
  /\/assets\/css\/site-shell(?:\.min)?(?:\.[a-f0-9]+)?\.css/,
  '/js/link-utils.min.js',
  '/js/analytics-events.min.js',
];
const failures = [];

if (!fs.existsSync(familyRoot)) failures.push('dist/bjj-classes is missing; build before running this QA');

const pages = fs.existsSync(familyRoot)
  ? fs.readdirSync(familyRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(familyRoot, entry.name, 'index.html'))
      .filter((file) => fs.existsSync(file))
  : [];

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  for (const asset of required) {
    const matched = asset instanceof RegExp ? asset.test(html) : html.includes(asset);
    if (!matched) failures.push(`${path.relative(root, file)}: missing ${asset}`);
  }
  const cssLinks = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/gi)].map((match) => match[1]);
  for (const href of cssLinks) {
    if (!href.startsWith('/assets/')) continue;
    const target = path.join(dist, href.slice(1));
    if (!fs.existsSync(target)) failures.push(`${path.relative(root, file)}: missing stylesheet ${href}`);
  }
}

const shell = path.join(dist, 'assets/css/site-shell.min.css');
if (!fs.existsSync(shell)) failures.push('dist/assets/css/site-shell.min.css is missing');
else {
  const css = fs.readFileSync(shell, 'utf8');
  for (const contract of ['max-inline-size: 100%', 'min-inline-size: 0', '.ss-main']) {
    if (!css.includes(contract)) failures.push(`site-shell.min.css: missing responsive image contract ${contract}`);
  }
}

if (pages.length !== 34) failures.push(`expected 34 BJJ-class pages, found ${pages.length}`);
if (failures.length) {
  console.error(`qa-class-family-contract failed (${failures.length} issue(s))`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`qa-class-family-contract passed (${pages.length} pages, shared CSS/scripts and stylesheet paths verified).`);
