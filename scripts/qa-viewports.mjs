#!/usr/bin/env node
/**
 * WS-29 Phase 4 — Viewport Gate
 * Headless-render representative page families across phone, breakpoint,
 * tablet, and desktop viewports.
 * Asserts:
 *  1. No horizontal overflow (scrollWidth <= innerWidth).
 *  2. No text under size floors (body >= 16px, secondary >= 14px; 0 text < 14px).
 *  3. Primary interactive controls >= 44px on phones.
 *  4. Viewport zoom remains enabled (no user-scalable=no / maximum-scale).
 *  5. Saves screenshot set and machine-readable report under docs/ws29/runs/qa-viewports/.
 * Keyboard-focus acceptance is reserved for the owner-run SOP.
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

// Long-tail page-family sentinels complement the full phone and responsive
// matrices above. Each gets a narrow-phone, common-phone, and desktop pass.
const specialtyRoutes = [
  '/near/hunter-ny',
  '/sources/research/ecological-dynamic-learning-review-2026',
  '/sources/local/htc-soccer-2026',
  '/free-bjj-intro-tannersville-ny/confirmation',
  '/student-hub',
  '/daily-checkin',
  '/weekly-audit',
  '/report-card',
  '/waiver',
  '/blog',
  '/blog/tags/youth',
  '/bjj-glossary/updates',
  '/bjj-glossary/kimura',
  '/contact',
  '/parent-resources',
  '/adult-private-coaching-intensive',
  '/holiday-schedule',
  '/birthday-parties',
  '/partners-hospitality-hunter-windham',
  '/nearby-towns',
  '/athlete-cross-training',
  '/athlete-cross-training/evidence',
  '/bio',
  '/bjj-butterfly-guard',
  '/bjj-classes',
  '/bjj-classes/acra-ny',
  '/bjj-classes/beginner-lane',
  '/bjj-classes/family-martial-arts-catskills',
  '/bjj-classes/tannersville-ny',
  '/bjj-glossary',
  '/bjj-glossary/drilling',
  '/bjj-stretches',
  '/bjj-tannersville-ny-directions',
  '/blog/bjj-sensei',
  '/blog/exactly-what-happens-first-bjj-class-minute-by-minute',
  '/bring-a-friend',
  '/bully-proof-jiu-jitsu-tannersville-ny',
  '/camp-clinics',
  '/catskills-home-base',
  '/community-partners',
  '/evidence',
  '/family-jiu-jitsu',
  '/friday-night-fanatics',
  '/giveaway-rules',
  '/guarantee-terms',
  '/halloween-spooktacular',
  '/instagram',
  '/jiu-jitsu-safety-tannersville-ny',
  '/law-enforcement-bjj',
  '/members/winter-training-plan',
  '/partners-wellness-pt-referrals',
  '/private-lessons',
  '/rural-bjj-catskills',
  '/scribners-jiu-jitsu',
  '/sensei-studio',
  '/show-up-kit',
  '/sources',
  '/sources/clockwork-bjj-instructors',
  '/success-stories',
  '/white-belt-foundations',
  '/blog/bjj-schedule-windham-ny',
  '/everyday-jiu-jitsu-training',
  '/hyphen-weekend',
  '/inclusion',
  '/nervous-first-timers',
  '/scribners-staff-reset-pass',
  '/spring-armor-drop',
  '/summer-academy',
  '/videos',
  '/winter-rank-drop',
  '/womens-jiu-jitsu-tannersville',
  '/deer-mountain-inn',
  '/scribners',
  '/phoenicia-diner',
  '/front-headlock-series',
  '/free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny',
  '/members/holiday-routine',
  '/sources/cdc-physical-activity',
  '/sources/marietta-police-bjj',
  '/sources/kenny-florian',
  '/sources/gracie-academy',
  '/sources/kodokan-etiquette'
];
const allRoutes = [...routes, ...specialtyRoutes];

// Every route receives the phone matrix. Shared-shell and major journey
// routes also receive breakpoint, tablet, and desktop regression captures.
const phoneViewports = [
  { width: 320, height: 720 },
  { width: 360, height: 640 },
  { width: 360, height: 900 },
  { width: 390, height: 844 },
  { width: 430, height: 932 }
];
const specialtyViewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 1440, height: 900 }
];
const responsiveRoutes = new Set([
  '/', '/schedule', '/options-pricing', '/free-bjj-intro-tannersville-ny',
  '/visit', '/programs', '/bjj-classes/kids-tannersville-ny',
  '/bjj-classes/adults-tannersville-ny', '/bjj-classes/teens-tannersville-ny'
]);
const responsiveViewports = [
  639, 640, 641, 767, 768, 769, 820, 991, 992, 993,
  1024, 1099, 1100, 1101, 1280, 1440
].map(width => ({ width, height: 900 }));
const availabilityOrigin = 'https://senseisandy.com';
const availabilityProxyDiagnostics = [];

function makeAvailabilityProxyDiagnostic({ method, startedAt, upstreamStatus, error }) {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    method,
    elapsedMs: Math.max(0, Math.round(performance.now() - startedAt)),
    upstreamStatus: Number.isInteger(upstreamStatus) ? upstreamStatus : null
  };
  if (error) {
    diagnostic.errorName = typeof error.name === 'string' ? error.name : 'Error';
  }
  return diagnostic;
}

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
    const requestUrl = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(requestUrl.pathname);
    if (req.method !== 'GET') {
      res.writeHead(405, { Allow: 'GET' }).end('Method Not Allowed');
      return;
    }
    if (pathname === '/api/first-visit-availability') {
      const startedAt = performance.now();
      let upstreamStatus = null;
      const upstreamUrl = new URL(pathname, availabilityOrigin);
      const date = requestUrl.searchParams.get('date');
      if (date !== null) upstreamUrl.searchParams.set('date', date);
      try {
        const upstream = await fetch(upstreamUrl, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(5000),
          redirect: 'error'
        });
        upstreamStatus = upstream.status;
        const body = await upstream.arrayBuffer();
        res.writeHead(upstream.status, {
          'Content-Type': upstream.headers.get('content-type') || 'application/json',
          'Cache-Control': 'no-store'
        }).end(Buffer.from(body));
        availabilityProxyDiagnostics.push(makeAvailabilityProxyDiagnostic({
          method: req.method,
          startedAt,
          upstreamStatus
        }));
      } catch (error) {
        availabilityProxyDiagnostics.push(makeAvailabilityProxyDiagnostic({
          method: req.method,
          startedAt,
          upstreamStatus,
          error
        }));
        throw error;
      }
      return;
    }
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
    console.error('Preview server request failed:', err?.name || 'Error');
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

function sampleViewports(route) {
  if (specialtyRoutes.includes(route)) return specialtyViewports;
  const viewports = [...phoneViewports];
  if (responsiveRoutes.has(route)) viewports.push(...responsiveViewports);
  return viewports;
}

try {
  const totalSamples = allRoutes.reduce((count, route) => count + sampleViewports(route).length, 0);
  console.log(`\nWS-29 Viewport Gate: checking ${allRoutes.length} routes across ${totalSamples} phone, breakpoint, tablet, and desktop samples...\n`);

  for (const route of allRoutes) {
    for (const viewport of sampleViewports(route)) {
      const { width, height } = viewport;
      const context = await browser.newContext({
        viewport: { width, height },
        isMobile: width < 768,
        hasTouch: width < 768
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
      const requestFailures = [];
      const expectedPreviewApiLimitations = [];

      page.on('pageerror', err => pageErrors.push(err.message));
      page.on('response', resp => {
        if (resp.status() >= 400 && new URL(resp.url()).origin === origin) {
          const url = new URL(resp.url());
          const failure = { url: resp.url(), status: resp.status() };
          // The static preview has no PHP attendance backend. Keep this exact
          // GET 404 visible as an integration limitation without proxying the
          // real endpoint, which returns student attendance records.
          if (route === '/daily-checkin' && url.pathname === '/api/attendance'
            && resp.request().method() === 'GET' && resp.status() === 404) {
            expectedPreviewApiLimitations.push({
              ...failure,
              method: 'GET',
              reason: 'PHP attendance API is unavailable in the static preview; run a separate authorized integration check.'
            });
          } else {
            httpFailures.push(failure);
          }
        }
      });
      page.on('requestfailed', req => {
        if (new URL(req.url()).origin === origin) {
          requestFailures.push({ url: req.url(), error: req.failure()?.errorText || 'unknown' });
        }
      });

      const response = await page.goto(origin + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]));
      await page.waitForTimeout(300);
      const metrics = await page.evaluate((reqWidth) => {
        const shown = (e) => {
          if (e.closest('[aria-hidden="true"]')) return false;
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
            minHeight: s.minHeight,
            maxWidth: s.maxWidth,
            display: s.display,
            whiteSpace: s.whiteSpace,
            overflowWrap: s.overflowWrap,
            width: r.width,
            height: r.height,
            x: r.x,
            y: r.y
          };
        };

        const main = document.querySelector('main') || document.body;
        const scrollWidth = document.scrollingElement ? document.scrollingElement.scrollWidth : document.body.scrollWidth;
        const viewportMeta = document.querySelector('meta[name="viewport"]')?.content || '';
        const viewportWidth = window.innerWidth;

        // Check horizontal overflow
        const overflowElements = [...document.body.querySelectorAll('*')]
          .filter(shown)
          .filter(e => {
            const r = e.getBoundingClientRect();
            return r.right > window.innerWidth + 1 || r.left < -1;
          })
          .map(describe);

        // Keep element-box overflow as diagnostic context. Full-width wrappers
        // and transformed AABBs can extend beyond the viewport while all
        // painted text and controls remain inside it.
        const actionableSelector = 'a[href], area[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])';
        const visibleActionableOverflows = [...document.body.querySelectorAll(actionableSelector)]
          .filter(shown)
          .map(element => ({ element, data: describe(element), rect: element.getBoundingClientRect() }))
        .filter(({ element, rect }) => {
          if (rect.left >= -1 && rect.right <= viewportWidth + 1) return false;

          // Ignore controls fully clipped by a closed off-canvas scrollport,
          // while still flagging any control with a visible clipped portion.
          let visibleLeft = Math.max(0, rect.left);
          let visibleRight = Math.min(viewportWidth, rect.right);
          for (let ancestor = element.parentElement; ancestor && ancestor !== document.body && ancestor !== document.documentElement; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (!/(auto|scroll|hidden|clip)/.test(style.overflowX)) continue;
            const box = ancestor.getBoundingClientRect();
            const clipLeft = box.left + ancestor.clientLeft;
            const clipRight = clipLeft + ancestor.clientWidth;
            visibleLeft = Math.max(visibleLeft, clipLeft);
            visibleRight = Math.min(visibleRight, clipRight);
            if (visibleRight <= visibleLeft + 1) return false;
          }
          return visibleRight > visibleLeft + 1;
        })
          .map(({ element, data }) => ({
            ...data,
            ancestors: [...function* (el) { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) yield a; }(element)].slice(0, 5).map(a => ({ tag: a.tagName, classes: typeof a.className === 'string' ? a.className : '', x: a.getBoundingClientRect().x, width: a.getBoundingClientRect().width, display: getComputedStyle(a).display, flex: getComputedStyle(a).flex, overflowX: getComputedStyle(a).overflowX }))
          }));

        // Measure actual rendered text fragments instead of each ancestor's
        // border box. This catches clipped glyph runs without flagging a wide
        // transparent wrapper or the empty corners of a rotated card.
        const visibleTextOverflows = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let textNode;
        while ((textNode = walker.nextNode())) {
          if (!textNode.nodeValue.trim()) continue;
          const element = textNode.parentElement;
          if (!element || element.closest('script, style, noscript, template')) continue;
          if (element.closest('[aria-hidden="true"]')) continue;
          if (element.closest('.visually-hidden, .visually-hidden-focusable:not(:focus):not(:focus-within)')) continue;
          let painted = true;
          for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
            const style = getComputedStyle(ancestor);
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) {
              painted = false;
              break;
            }
          }
          if (!painted) continue;

          const range = document.createRange();
          range.selectNodeContents(textNode);
          for (const rect of range.getClientRects()) {
            const clippedByScrollport = [...function* (el) {
              for (let ancestor = el.parentElement; ancestor && ancestor !== document.body && ancestor !== document.documentElement; ancestor = ancestor.parentElement) yield ancestor;
            }(element)].some(ancestor => {
              const style = getComputedStyle(ancestor);
              if (!/(auto|scroll|hidden|clip)/.test(style.overflowX)) return false;
              const box = ancestor.getBoundingClientRect();
              const clipLeft = box.left + ancestor.clientLeft;
              const clipRight = clipLeft + ancestor.clientWidth;
              return rect.right <= clipLeft || rect.left >= clipRight;
            });
            if (clippedByScrollport) continue;
            if (rect.width <= 0 || rect.height <= 0 || (rect.left >= -1 && rect.right <= viewportWidth + 1)) continue;
            visibleTextOverflows.push({
              tag: element.tagName,
              id: element.id || '',
              classes: element.className || '',
              text: textNode.nodeValue.trim().slice(0, 100),
              x: rect.x,
              right: rect.right,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              font: getComputedStyle(element).fontSize,
              maxWidth: getComputedStyle(element).maxWidth,
              whiteSpace: getComputedStyle(element).whiteSpace,
              overflowWrap: getComputedStyle(element).overflowWrap,
              ancestors: [...function* (el) { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) yield a; }(element)].slice(0, 4).map(a => ({ tag: a.tagName, classes: typeof a.className === 'string' ? a.className : '', x: a.getBoundingClientRect().x, width: a.getBoundingClientRect().width, overflowX: getComputedStyle(a).overflowX, display: getComputedStyle(a).display }))
            });
          }
        }

        // Text floor check
        // Secondary text classes/elements allowed to floor at 14px:
        const isSecondary = (el) => {
      return el.matches('small, .small, .text-muted, figcaption, .form-text, .ss-eyebrow, .he-eyebrow, .op-eyebrow, .ss-date-class, .ss-calendar-help, .ss-month-legend, .ss-stat-label, .ss-breadcrumbs-list li, [data-calendar-help], label, [role="note"], .hw-eyebrow, .hw-microcopy, .hw-offer-location, .hw-nightlife-note, .hw-nightlife-card > p:not(.hw-price-kicker), .hw-price-kicker, .hw-note, .hw-error, .hw-summary dt, .hw-summary dd, .hw-review dt, .hw-review dd, .hw-progress, .hw-summary-status, .hw-header p, .winter-kicker, .winter-products');
        };

        const textNodes = [...main.querySelectorAll('p, li, td, th, blockquote, dt, dd, small, label, figcaption')]
          .filter(shown)
          .map(e => ({ el: e, data: describe(e) }));

        const under14 = textNodes.filter(t => t.data.font < 13.9).map(t => t.data);
        const bodyUnder16 = textNodes
          .filter(t => !isSecondary(t.el) && t.data.font < 15.9)
          .map(t => t.data);

        // Primary interactive targets floor (buttons, primary links, nav toggle, etc.)
        const isInlineProseAction = (element) => {
          if (!element.matches('a[href]')) return false;
          if (element.matches('.btn, .ss-btn, .op-button, [role="button"], [role="link"], .ss-home-parent-guide-link')) return false;
          if (element.closest('nav, [role="navigation"], .breadcrumb, .ss-breadcrumbs-list, .ss-article-rail')) return false;
          for (let parent = element.parentElement, depth = 0; parent && depth < 5; parent = parent.parentElement, depth++) {
            if (parent.matches('nav, [role="navigation"], ul, ol, menu, .ss-rail-links, .ss-inline-cta__actions')) return false;
            if (!parent.matches('p, blockquote, td, th, dd, figcaption, label, li, span, div, .consent-copy, .terms-copy')) continue;
            const siblingText = [...parent.childNodes].some(node => node !== element
              && node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
            const siblingElementText = [...parent.children].some(child => child !== element && child.textContent.trim());
            if (siblingText || siblingElementText) return true;
          }
          return false;
        };
        const standaloneActionSelector = 'a[href], area[href], button:not(.btn-close), input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"]';
        const actionableTargetInventory = [...document.querySelectorAll(standaloneActionSelector)]
          .filter(shown)
          .filter(element => !element.closest('.ss-skip-link, .visually-hidden-focusable:not(:focus):not(:focus-within)'))
          .map(element => ({ ...describe(element), context: isInlineProseAction(element) ? 'inline-prose' : (element.closest('nav, [role="navigation"], .breadcrumb, .ss-breadcrumbs-list, ul, ol, menu') ? 'navigation-or-list' : 'standalone'), primary: element.matches('.btn, .ss-btn, .op-button, .ss-home-parent-guide-link, [role="button"]') || element.matches('[data-cta-tier="primary"]') || element.closest('.ss-inline-cta__actions') !== null, computedFlex: getComputedStyle(element).flex, computedMinWidth: getComputedStyle(element).minWidth, ancestors: [...function* (el) { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) yield a; }(element)].slice(0, 5).map(a => ({ tag: a.tagName, classes: typeof a.className === 'string' ? a.className : '', x: a.getBoundingClientRect().x, width: a.getBoundingClientRect().width, display: getComputedStyle(a).display, flex: getComputedStyle(a).flex, overflowX: getComputedStyle(a).overflowX })) }))
          .filter(e => e.width < 43.5 || e.height < 43.5);
        const primaryActions = actionableTargetInventory.filter(e => e.primary);
        const secondarySmallTargets = actionableTargetInventory.filter(e => !e.primary && (e.width < 43.5 || e.height < 43.5));

        return {
          scrollWidth,
          innerWidth: window.innerWidth,
          viewportMeta,
          overflowCount: overflowElements.length,
          overflowElements: overflowElements.slice(0, 5),
          visibleActionableOverflowCount: visibleActionableOverflows.length,
          visibleActionableOverflows: visibleActionableOverflows.slice(0, 10),
          visibleTextOverflowCount: visibleTextOverflows.length,
          visibleTextOverflows: visibleTextOverflows.slice(0, 10),
          under14Count: under14.length,
          under14Sample: under14.slice(0, 5),
          bodyUnder16Count: bodyUnder16.length,
          bodyUnder16Sample: bodyUnder16.slice(0, 5),
          actionableTargetInventory,
          primaryTargetDefects: primaryActions,
          secondarySmallTargetCount: secondarySmallTargets.length,
          secondarySmallTargets: secondarySmallTargets.slice(0, 30)
        };
      }, width);

      const name = (route === '/' ? 'home' : route.slice(1).replaceAll('/', '--')) + '-' + width + 'x' + height;
      const screenshotFile = `${name}.png`;
      await page.screenshot({ path: path.join(out, screenshotFile), fullPage: true });

      const pageScrollOverflow = metrics.scrollWidth > metrics.innerWidth + 1;
      const hasOverflow = pageScrollOverflow || metrics.visibleActionableOverflowCount > 0 || metrics.visibleTextOverflowCount > 0;
      const zoomBlocked = /user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?(?!\d)/i.test(metrics.viewportMeta);
      const phoneTextDefects = width < 768 && (metrics.under14Count > 0 || metrics.bodyUnder16Count > 0);
      const phoneTargetDefects = width < 768 && metrics.primaryTargetDefects.length > 0;
      const routeFailure = !response || !response.ok();
      const hasDefects = routeFailure || hasOverflow || phoneTextDefects || phoneTargetDefects || zoomBlocked || pageErrors.length > 0 || httpFailures.length > 0 || requestFailures.length > 0;
      const failureReasons = [
        ...(routeFailure ? [`route response ${response?.status() || 'missing'}`] : []),
        ...(pageScrollOverflow ? ['page horizontal scrolling'] : []),
        ...(metrics.visibleActionableOverflowCount ? ['visible actionable control outside viewport'] : []),
        ...(metrics.visibleTextOverflowCount ? ['visible text outside viewport'] : []),
        ...(width < 768 && metrics.under14Count > 0 ? ['text below 14px'] : []),
        ...(width < 768 && metrics.bodyUnder16Count > 0 ? ['body text below 16px'] : []),
        ...(phoneTargetDefects ? ['primary target below 44px'] : []),
        ...(zoomBlocked ? ['viewport zoom disabled'] : []),
        ...(pageErrors.length ? ['page JavaScript errors'] : []),
        ...(httpFailures.length ? ['unexpected HTTP error responses'] : []),
        ...(requestFailures.length ? ['failed local requests'] : [])
      ];

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
        unexpectedHttpFailures: httpFailures,
        expectedPreviewApiLimitations,
        requestFailures,
        blockedExternal: blockedExternal.length,
        pass: !hasDefects,
        failureReasons,
        screenshot: screenshotFile,
        details: metrics
      };

      results.push(record);

      const statusIcon = hasDefects ? 'FAIL' : 'PASS';
      console.log(`[${statusIcon}] ${route.padEnd(35)} @ ${width}x${height} | scrollWidth: ${metrics.scrollWidth} | <14px: ${metrics.under14Count} | body<16px: ${metrics.bodyUnder16Count} | targetDefects: ${metrics.primaryTargetDefects.length} | errors: ${pageErrors.length + httpFailures.length + requestFailures.length}`);

      if (hasDefects) {
        failures.push({
          route,
          width,
          overflow: hasOverflow,
          pageScrollOverflow,
          visibleActionableOverflows: metrics.visibleActionableOverflows,
          visibleTextOverflows: metrics.visibleTextOverflows,
          overflowElements: metrics.overflowElements,
          under14: metrics.under14Sample,
          bodyUnder16: metrics.bodyUnder16Sample,
          primaryTargetDefects: metrics.primaryTargetDefects,
          zoomBlocked,
          status: response?.status() || 0,
          pageErrors,
          httpFailures,
          requestFailures,
          failureReasons
        });
      }

      await context.close();
    }
  }

  await fs.writeFile(path.join(out, 'availability-proxy-diagnostics.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    requestCount: availabilityProxyDiagnostics.length,
    requests: availabilityProxyDiagnostics
  }, null, 2) + '\n');
  await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify(results, null, 2) + '\n');

  // Generate markdown report
  const reportLines = [
    '# WS-29 Viewport Gate Report',
    '',
    `Generated: ${new Date().toISOString()}`,
  `Total samples: ${results.length} (${phoneViewports.length} phone viewports on ${routes.length} core routes; ${specialtyViewports.length} widths on ${specialtyRoutes.length} additional page-family routes; ${responsiveViewports.length} more responsive widths on ${responsiveRoutes.size} core routes)`,
    `Total failures: ${failures.length}`,
  `Passing samples: ${results.filter(r => r.pass).length}`,
  `Expected static-preview API limitations: ${results.reduce((count, result) => count + result.expectedPreviewApiLimitations.length, 0)} (listed separately; not proof of production integration)`,
    '',
    '| Route | Samples | Passing | Status |',
    '| --- | ---: | ---: | --- |'
  ];

  for (const route of allRoutes) {
    const routeResults = results.filter(r => r.route === route);
    const passing = routeResults.filter(r => r.pass).length;
    reportLines.push(`| \`${route}\` | ${routeResults.length} | ${passing} | ${passing === routeResults.length ? '✓ PASS' : '✗ FAIL'} |`);
  }

  reportLines.push('');
  if (failures.length > 0) {
    reportLines.push('## Failures Summary', '', '```json', JSON.stringify(failures, null, 2), '```');
  } else {
    reportLines.push('## Summary', '', 'All samples passed the shared visual and dependency verdict. Expected static-preview API limitations are listed separately and do not prove production integration.');
  }

  const expectedPreviewApiLimitations = results.flatMap(result => result.expectedPreviewApiLimitations.map(item => ({ route: result.route, width: result.width, ...item })));
  if (expectedPreviewApiLimitations.length > 0) {
    reportLines.push(
      '',
      '## Expected static-preview API limitations',
      '',
      'These local-preview responses are recorded separately from defects. The attendance API is not proxied because it can return student attendance records. A separate authorized integration check is required.',
      '',
      '```json',
      JSON.stringify(expectedPreviewApiLimitations, null, 2),
      '```'
    );
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
