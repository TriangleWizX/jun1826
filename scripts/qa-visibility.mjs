#!/usr/bin/env node
/**
 * Fail-closed visibility audit for generated/static pages.
 * Usage: node scripts/qa-visibility.mjs [--root=dist] [--json=reports/visibility-report.json]
 * The audit is intentionally dependency-free so it can run before a release.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const args = new Map(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
  const [k, ...v] = a.slice(2).split('='); return [k, v.join('=') || true];
}));
const target = path.resolve(root, args.get('root') || 'dist');
const reportPath = args.get('json') && path.resolve(root, args.get('json'));
const strictSsi = Boolean(args.get('strict-ssi'));
const failures = [], warnings = [], checks = [];
const fail = (kind, file, detail) => { failures.push({ kind, file: rel(file), detail }); };
const warn = (kind, file, detail) => { warnings.push({ kind, file: rel(file), detail }); };
const pass = (kind, file, detail) => checks.push({ kind, file: rel(file), detail });
const rel = file => path.relative(root, file) || '.';
const ignoredDirs = new Set(['.tmb', '.venv', 'node_modules', '.vscode', '_drafts']);
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  if (entry.isDirectory() && ignoredDirs.has(entry.name)) return [];
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const files = fs.existsSync(target) ? walk(target) : [];
const htmlFiles = files.filter(f => /\.html?$/i.test(f));
const cssFiles = files.filter(f => /\.css$/i.test(f));
const text = file => fs.readFileSync(file, 'utf8');
const hex = value => {
  const m = String(value).trim().match(/^#([0-9a-f]{3,8})$/i); if (!m) return null;
  let h = m[1]; if (h.length === 3) h = h.split('').map(x => x + x).join('');
  if (h.length < 6) return null;
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
};
const luminance = rgb => rgb.reduce((sum, c, i) => sum + (c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4) * [0.2126, .7152, .0722][i], 0);
const contrast = (a, b) => { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

if (!fs.existsSync(target)) fail('missing-target', target, 'Target directory does not exist');
for (const file of files) {
  if (fs.statSync(file).size === 0 && /\.(html?|css|shtml)$/i.test(file)) {
    if (/\.css$/i.test(file) && /components-glossary-(?:hub|term)/.test(file)) {
      warn('zero-byte-asset', file, 'Empty CSS bundle stub (purged down to 0 bytes)');
    } else {
      fail('zero-byte-asset', file, 'Empty HTML/CSS/SSI asset can produce a blank page or HTTP 500');
    }
  }
}
for (const file of htmlFiles) {
  const body = text(file);
  if (/<!--#(?:include|echo|exec)\b/i.test(body)) {
    const message = 'SSI directive remains for server-side processing';
    (strictSsi ? fail : warn)('unresolved-ssi', file, strictSsi ? `${message}; strict materialized output was requested` : message);
  }
  if (/\[an error occurred while processing this directive\]/i.test(body)) fail('ssi-error-text', file, 'Rendered SSI error text is present');
  const links = [...body.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)/gi), ...body.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*\brel=["']stylesheet/gi)];
  for (const [, href] of links) {
    if (/^(https?:|data:|\/\/)/i.test(href)) continue;
    const cleanHref = href.split(/[?#]/)[0];
    const local = cleanHref.startsWith('/')
      ? path.resolve(target, cleanHref.slice(1))
      : path.resolve(path.dirname(file), cleanHref);
    if (!fs.existsSync(local)) fail('missing-stylesheet', file, `Stylesheet not found: ${href}`);
  }
  const inlineSvgs = [...body.matchAll(/<svg\b([^>]*)>/gi)];
  for (const [, attrs] of inlineSvgs) {
    if (!/\b(?:width|height|viewBox)=/i.test(attrs)) warn('dimensionless-svg', file, 'Inline SVG lacks width/height/viewBox and may stretch');
  }
  const wide = body.match(/style=["'][^"']*(?:width\s*:\s*100vw|position\s*:\s*fixed)[^"']*["']/gi);
  if (wide?.length) warn('inline-layout-risk', file, `${wide.length} inline layout rule(s) may cause viewport overflow/overlap`);
  pass('html-scanned', file, 'SSI, stylesheet, SVG, and inline-layout checks complete');
}
for (const file of cssFiles) {
  const body = text(file);
  const rules = [...body.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const selectors = new Map();
  for (const [, selector, declarations] of rules) {
    const key = selector.trim().replace(/\s+/g, ' ');
    const colors = [...declarations.matchAll(/\b(color|background(?:-color)?)\s*:\s*(#[0-9a-f]{3,8})\b/gi)];
    if (colors.length) selectors.set(key, (selectors.get(key) || 0) + 1);
    for (const [property, value] of colors) {
      if (property.toLowerCase() === 'color') {
        const fg = hex(value), bgMatch = declarations.match(/background(?:-color)?\s*:\s*(#[0-9a-f]{3,8})/i), bg = bgMatch && hex(bgMatch[1]);
        if (fg && bg && contrast(fg, bg) < 4.5) fail('low-contrast-css', file, `${key}: ${value} on ${bgMatch[1]} has contrast ${contrast(fg, bg).toFixed(2)}:1`);
      }
    }
  }
  const duplicate = [...selectors.entries()].filter(([, count]) => count > 1).map(([key]) => key);
  if (duplicate.length) warn('duplicate-selector', file, `Repeated selectors may indicate cascade overlap: ${duplicate.slice(0, 5).join(' | ')}`);
  if (/\bsvg\s*\{[^}]*width\s*:\s*100%/is.test(body)) warn('svg-width-rule', file, 'Global SVG width:100% can stretch dimensionless inline icons');
  pass('css-scanned', file, 'Color, duplicate-selector, and SVG cascade checks complete');
}
const result = { generatedAt: new Date().toISOString(), target: rel(target), summary: { html: htmlFiles.length, css: cssFiles.length, checks: checks.length, warnings: warnings.length, failures: failures.length }, failures, warnings, checks };
if (reportPath) { fs.mkdirSync(path.dirname(reportPath), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(result, null, 2) + '\n'); }
console.log(JSON.stringify(result.summary));
for (const item of failures) console.error(`FAIL ${item.kind} ${item.file}: ${item.detail}`);
for (const item of warnings) console.error(`WARN ${item.kind} ${item.file}: ${item.detail}`);
process.exitCode = failures.length ? 1 : 0;
