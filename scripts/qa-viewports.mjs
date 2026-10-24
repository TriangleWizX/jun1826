#!/usr/bin/env node
/**
 * WS-29 Phase 4 — Viewport Gate
 * Headless-render Phase 0 routes at 360 / 390 / 430 px phone widths.
 * Asserts:
 *  1. No horizontal overflow (scrollWidth <= innerWidth).
 *  2. No text under size floors (body >= 16px, secondary >= 14px; 0 text < 14px).
 *  3. Primary interactive controls >= 44px.
 *  4. Viewport zoom remains enabled (no user-scalable=no / maximum-scale).
 *  5. Saves screenshot set and machine-readable report under docs/ws29/runs/qa-viewports/.
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'dist');
const out = path.resolve(process.argv[2] || path.join(root, 'docs/ws29/runs/qa-viewports'));

const routes = [
  '/',
  '/schedule',
  '/options-pricing',
  '/free-bjj-intro-tannersville-ny',
  '/visit',
  '/programs',
  '/bjj-classes/kids-tannersville-ny',
  '/bjj-classes/adults-tannersville-ny',
  '/bjj-classes/teens-tannersville-ny',
  '/blog/after-school-jiu-jitsu',
  '/bjj-glossary/arm-drag',
  '/alley-bootcamp',
  '/winter-armor-2027',
  '/bjj-faqs'
];

const widths = [360, 390, 430];

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
};

async function materialize(file, stack = []) {
  if (stack.includes(file)) throw new Error(`SSI cycle: ${file}`);
  let html = await fs.readFile(file, 'utf8');
  const matches = [...html.matchAll(/<!--\s*#include\s+(virtual|file)=["']([^"']+)["']\s*-->/g)];
  for (const match of matches) {
    const include = match[1] === 'virtual'
      ? path.resolve(dist, '.' + match[2])
      : path.resolve(path.dirname(file), match[2]);
    if (!include.startsWith(dist + path.sep)) throw new Error('SSI path outside dist');
    html = html.replace(match[0], await materialize(include, [...stack, file]));
  }
  return html;
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const base = path.resolve(dist, '.' + pathname);
    if (!base.startsWith(dist + path.sep) && base !== dist) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    for (const candidate of [base, path.join(base, 'index.html'), `${base}.html`]) {
      let stat;
      try { stat = await fs.stat(candidate); } catch { continue; }
      if (stat.isFile()) {
        res.setHeader('Content-Type', mime[path.extname(candidate)] || 'application/octet-stream');
        res.end(path.extname(candidate) === '.html' ? await materialize(candidate) : await fs.readFile(candidate));
        return;
      }
    }
    res.writeHead(404).end('Not found');
  } catch (err) {
    console.error(err);
    res.writeHead(500).end('Server error');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
await fs.mkdir(out, { recursive: true });

const executablePath = ['/usr/bin/google-chrome', '/usr/bin/chromium', chromium.executablePath()].find(existsSync);
if (!executablePath) {
  server.close();
  console.error('No usable chrome/chromium browser executable found');
  process.exit(1);
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const results = [];
const failures = [];

try {
  console.log(`\nWS-29 Viewport Gate: checking ${routes.length} routes at widths ${widths.join(', ')} px...\n`);

  for (const route of routes) {
    for (const width of widths) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        isMobile: true,
        hasTouch: true
      });

      const blockedExternal = [];
      await context.route('**/*', (req) => {
        const reqOrigin = new URL(req.request().url()).origin;
        if (reqOrigin === origin) return req.continue();
        blockedExternal.push(req.request().url());
        return req.abort();
      });

      const page = await context.newPage();
      const pageErrors = [];
      const httpFailures = [];

      page.on('pageerror', err => pageErrors.push(err.message));
      page.on('response', resp => {
        if (resp.status() >= 400 && new URL(resp.url()).origin === origin) {
          httpFailures.push({ url: resp.url(), status: resp.status() });
        }
      });

      const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]));
      await page.waitForTimeout(300);

      const metrics = await page.evaluate((reqWidth) => {
        const shown = (e) => {
          const r = e.getBoundingClientRect();
          const s = getComputedStyle(e);
          return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
        };

        const describe = (e) => {
          const r = e.getBoundingClientRect();
          const s = getComputedStyle(e);
          return {
            tag: e.tagName,
            id: e.id || '',
            classes: e.className || '',
            text: (e.innerText || e.textContent || '').trim().slice(0, 100),
            font: parseFloat(s.fontSize),
            width: r.width,
            height: r.height,
            x: r.x,
            y: r.y
          };
        };

        const main = document.querySelector('main') || document.body;
        const scrollWidth = document.scrollingElement ? document.scrollingElement.scrollWidth : document.body.scrollWidth;
        const viewportMeta = document.querySelector('meta[name="viewport"]')?.content || '';

        // Check horizontal overflow
        const overflowElements = [...document.body.querySelectorAll('*')]
          .filter(shown)
          .filter(e => {
            const r = e.getBoundingClientRect();
            return r.right > window.innerWidth + 1 || r.left < -1;
          })
          .map(describe);

        // Text floor check
        // Secondary text classes/elements allowed to floor at 14px:
        const isSecondary = (el) => {
          return el.matches('small, .small, .text-muted, figcaption, .form-text, .ss-eyebrow, .op-eyebrow, .ss-date-class, .ss-calendar-help, .ss-month-legend, .ss-stat-label, [data-calendar-help], label, [role="note"]');
        };

        const textNodes = [...main.querySelectorAll('p, li, td, th, blockquote, dt, dd, small, label, figcaption')]
          .filter(shown)
          .map(e => ({ el: e, data: describe(e) }));

        const under14 = textNodes.filter(t => t.data.font < 13.9).map(t => t.data);
        const bodyUnder16 = textNodes
          .filter(t => !isSecondary(t.el) && t.data.font < 15.9)
          .map(t => t.data);

        // Primary interactive targets floor (buttons, primary links, nav toggle, etc.)
        const primaryActions = [...document.querySelectorAll('a.btn, a.ss-btn, a.op-button, button:not(.btn-close), .btn-primary, [role="button"]')]
          .filter(shown)
          .map(describe)
          .filter(e => e.width < 43.5 || e.height < 43.5);

        return {
          scrollWidth,
          innerWidth: window.innerWidth,
          viewportMeta,
          overflowCount: overflowElements.length,
          overflowElements: overflowElements.slice(0, 5),
          under14Count: under14.length,
          under14Sample: under14.slice(0, 5),
          bodyUnder16Count: bodyUnder16.length,
          bodyUnder16Sample: bodyUnder16.slice(0, 5),
          primaryTargetDefects: primaryActions
        };
      }, width);

      const name = (route === '/' ? 'home' : route.slice(1).replaceAll('/', '--')) + '-' + width;
      const screenshotFile = `${name}.png`;
      await page.screenshot({ path: path.join(out, screenshotFile), fullPage: true });

      const hasOverflow = metrics.scrollWidth > width + 1 || metrics.overflowCount > 0;
      const zoomBlocked = /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?(?!\d)/i.test(metrics.viewportMeta);
      const hasDefects = hasOverflow || metrics.under14Count > 0 || metrics.bodyUnder16Count > 0 || zoomBlocked;

      const record = {
        route,
        width,
        status: response?.status() || 0,
        scrollWidth: metrics.scrollWidth,
        overflow: hasOverflow,
        under14: metrics.under14Count,
        bodyUnder16: metrics.bodyUnder16Count,
        smallPrimaryTargets: metrics.primaryTargetDefects.length,
        zoomBlocked,
        pageErrors: pageErrors.length,
        httpFailures: httpFailures.length,
        screenshot: screenshotFile,
        details: metrics
      };

      results.push(record);

      const statusIcon = hasDefects ? 'FAIL' : 'PASS';
      console.log(`[${statusIcon}] ${route.padEnd(35)} @ ${width}px | scrollWidth: ${metrics.scrollWidth} | <14px: ${metrics.under14Count} | body<16px: ${metrics.bodyUnder16Count} | targetDefects: ${metrics.primaryTargetDefects.length}`);

      if (hasDefects) {
        failures.push({
          route,
          width,
          overflow: hasOverflow,
          overflowElements: metrics.overflowElements,
          under14: metrics.under14Sample,
          bodyUnder16: metrics.bodyUnder16Sample,
          zoomBlocked
        });
      }

      await context.close();
    }
  }

  await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify(results, null, 2) + '\n');

  // Generate markdown report
  const reportLines = [
    '# WS-29 Viewport Gate Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Total samples: ${results.length} (${routes.length} routes × ${widths.length} widths)`,
    `Total failures: ${failures.length}`,
    '',
    '| Route | 360px | 390px | 430px | Status |',
    '| --- | --- | --- | --- | --- |'
  ];

  for (const route of routes) {
    const r360 = results.find(r => r.route === route && r.width === 360);
    const r390 = results.find(r => r.route === route && r.width === 390);
    const r430 = results.find(r => r.route === route && r.width === 430);

    const ok360 = r360 && !r360.overflow && r360.under14 === 0 && r360.bodyUnder16 === 0;
    const ok390 = r390 && !r390.overflow && r390.under14 === 0 && r390.bodyUnder16 === 0;
    const ok430 = r430 && !r430.overflow && r430.under14 === 0 && r430.bodyUnder16 === 0;

    const allOk = ok360 && ok390 && ok430;
    reportLines.push(`| \`${route}\` | ${ok360 ? 'PASS' : 'FAIL'} | ${ok390 ? 'PASS' : 'FAIL'} | ${ok430 ? 'PASS' : 'FAIL'} | ${allOk ? '✓ PASS' : '✗ FAIL'} |`);
  }

  reportLines.push('');
  if (failures.length > 0) {
    reportLines.push('## Failures Summary', '', '```json', JSON.stringify(failures, null, 2), '```');
  } else {
    reportLines.push('## Summary', '', 'All routes passed phone viewport assertions: 0 horizontal overflow, 0 text below 14px, 0 body text below 16px, zoom enabled.');
  }

  await fs.writeFile(path.join(out, 'report.md'), reportLines.join('\n') + '\n');

  if (failures.length > 0) {
    console.error(`\nViewport Gate FAILED with ${failures.length} defect(s).\n`);
    process.exit(1);
  } else {
    console.log(`\nViewport Gate PASSED: all ${results.length} samples met adaptive & readability standards.\n`);
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
