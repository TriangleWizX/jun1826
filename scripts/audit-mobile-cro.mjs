import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('dist');
const outDir = path.resolve('reports/mobile-cro');
await fs.mkdir(outDir, { recursive: true });

// Minimal static server
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, 'http://local');
    let rel = decodeURI(reqUrl.pathname).slice(1) || 'index.html';
    let file = path.join(root, rel);

    try {
      const st = await fs.stat(file);
      if (st.isDirectory()) {
        rel = path.join(rel, 'index.html');
        file = path.join(root, rel);
      }
    } catch {
      if (!path.extname(rel)) {
        rel += '.html';
        file = path.join(root, rel);
      }
    }

    if (!file.startsWith(root + path.sep) && file !== root) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    const data = await fs.readFile(file);
    res.setHeader('Content-Type', mimeTypes[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;

const PAGES_TO_AUDIT = [
  { id: 'kids', name: 'Kids Program', path: '/bjj-classes/kids-tannersville-ny/' },
  { id: 'teens', name: 'Teens Program', path: '/bjj-classes/teens-tannersville-ny/' },
  { id: 'adults', name: 'Adults Program', path: '/bjj-classes/adults-tannersville-ny/' },
  { id: 'classes-hub', name: 'Classes Hub', path: '/bjj-classes/' },
  { id: 'free-intro', name: 'Free Intro Booking', path: '/free-bjj-intro-tannersville-ny/' },
  { id: 'home', name: 'Homepage (Funnel Entry)', path: '/' }
];

const VIEWPORTS = [
  { name: 'iPhone 12/13/14 (390x844)', width: 390, height: 844, scale: 3 },
  { name: 'iPhone SE (375x667)', width: 375, height: 667, scale: 2 }
];

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});

const auditResults = [];

for (const vp of VIEWPORTS) {
  for (const pageDef of PAGES_TO_AUDIT) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.scale,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    // Track network requests and payloads
    const requests = [];
    page.on('response', async (res) => {
      try {
        const req = res.request();
        const url = req.url();
        const type = req.resourceType();
        const status = res.status();
        const headers = res.headers();
        let size = 0;
        try {
          const body = await res.body();
          size = body.length;
        } catch {}
        requests.push({ url, type, status, size });
      } catch {}
    });

    const pageUrl = `${baseUrl}${pageDef.path}`;
    const startNav = Date.now();
    await page.goto(pageUrl, { waitUntil: 'load', timeout: 15000 });
    const endNav = Date.now();
    await page.waitForTimeout(300);

    // Capture screenshot of the above-the-fold viewport
    const screenshotName = `${pageDef.id}-${vp.width}x${vp.height}.png`;
    const screenshotPath = path.join(outDir, screenshotName);
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: vp.width, height: vp.height }
    });

    // Evaluate performance and DOM timings
    const perfData = await page.evaluate(() => {
      const [nav] = performance.getEntriesByType('navigation');
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
      const fp = paintEntries.find(p => p.name === 'first-paint')?.startTime || 0;

      return {
        dns: nav ? Math.round(nav.domainLookupEnd - nav.domainLookupStart) : 0,
        tcp: nav ? Math.round(nav.connectEnd - nav.connectStart) : 0,
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : 0,
        download: nav ? Math.round(nav.responseEnd - nav.responseStart) : 0,
        domInteractive: nav ? Math.round(nav.domInteractive) : 0,
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : 0,
        loadComplete: nav ? Math.round(nav.loadEventEnd) : 0,
        fcp: Math.round(fcp),
        fp: Math.round(fp)
      };
    });

    // Evaluate Above-The-Fold Interactive Elements & Tap Targets
    const tapTargetAnalysis = await page.evaluate(({ vpWidth, vpHeight }) => {
      const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0' &&
          el.offsetParent !== null
        );
      };

      // Select all candidate interactive elements
      const candidates = Array.from(document.querySelectorAll(
        'a, button, input:not([type="hidden"]), select, textarea, [role="button"], summary, [tabindex="0"]'
      )).filter(isVisible);

      const atfElements = [];

      candidates.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Check if strictly or partially in the initial viewport
        if (
          rect.top < vpHeight &&
          rect.bottom > 0 &&
          rect.left < vpWidth &&
          rect.right > 0 &&
          rect.width > 0 &&
          rect.height > 0
        ) {
          const text = (el.innerText || el.textContent || el.getAttribute('aria-label') || el.value || '').trim().replace(/\s+/g, ' ');
          const tag = el.tagName.toLowerCase();
          const href = el.getAttribute('href') || '';
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize) || 0;
          const bg = style.backgroundColor;
          const color = style.color;

          // Check if element or center point is obscured by another element
          const cx = Math.max(1, Math.min(vpWidth - 1, rect.left + rect.width / 2));
          const cy = Math.max(1, Math.min(vpHeight - 1, rect.top + rect.height / 2));
          const topEl = document.elementFromPoint(cx, cy);
          const isObscured = topEl && !el.contains(topEl) && !topEl.contains(el);

          // Check if element is primary CTA
          const isPrimaryCta = (
            text.toLowerCase().includes('reserve free intro') ||
            text.toLowerCase().includes('reserve your free') ||
            text.toLowerCase().includes('book free intro') ||
            text.toLowerCase().includes('see first-visit times') ||
            el.classList.contains('btn-primary') ||
            el.classList.contains('ss-nav-cta')
          );

          atfElements.push({
            tag,
            id: el.id || '',
            className: typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join(' ') : '',
            text: text.slice(0, 50),
            href: href.slice(0, 60),
            rect: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom)
            },
            fontSize,
            isObscured,
            isPrimaryCta,
            meetsApple44: rect.width >= 44 && rect.height >= 44,
            meetsWcag24: rect.width >= 24 && rect.height >= 24
          });
        }
      });

      // Compute pairwise nearest neighbor distance to check for tight clustering (< 8px spacing)
      const clusters = [];
      for (let i = 0; i < atfElements.length; i++) {
        let minDistance = Infinity;
        let nearestIdx = -1;
        const a = atfElements[i].rect;
        for (let j = 0; j < atfElements.length; j++) {
          if (i === j) continue;
          const b = atfElements[j].rect;
          // Calculate Euclidean gap between bounding boxes
          const dx = Math.max(0, Math.max(a.x - (b.x + b.width), b.x - (a.x + a.width)));
          const dy = Math.max(0, Math.max(a.y - (b.y + b.height), b.y - (a.y + a.height)));
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDistance) {
            minDistance = dist;
            nearestIdx = j;
          }
        }
        atfElements[i].nearestNeighborDist = Math.round(minDistance);
        if (minDistance < 8 && nearestIdx !== -1) {
          clusters.push({
            el1: atfElements[i].text || atfElements[i].tag,
            el2: atfElements[nearestIdx].text || atfElements[nearestIdx].tag,
            dist: Math.round(minDistance)
          });
        }
      }

      // Check hero CTA specific metrics
      const heroPrimary = atfElements.find(e => e.isPrimaryCta && !e.className.includes('ss-nav-cta'));
      const navCta = atfElements.find(e => e.className.includes('ss-nav-cta') || e.id === 'nav-cta');

      return {
        totalAtfTargets: atfElements.length,
        failingApple44: atfElements.filter(e => !e.meetsApple44),
        failingWcag24: atfElements.filter(e => !e.meetsWcag24),
        tightSpacingClusters: clusters,
        allTargets: atfElements,
        heroPrimaryCta: heroPrimary || null,
        navCta: navCta || null,
        hasPrimaryAboveFold: Boolean(heroPrimary || navCta)
      };
    }, { vpWidth: vp.width, vpHeight: vp.height });

    // Aggregate resource payload stats
    const payloadStats = {
      totalRequests: requests.length,
      totalBytes: requests.reduce((acc, r) => acc + r.size, 0),
      byType: {}
    };

    requests.forEach((r) => {
      const t = r.type || 'other';
      if (!payloadStats.byType[t]) {
        payloadStats.byType[t] = { count: 0, bytes: 0 };
      }
      payloadStats.byType[t].count++;
      payloadStats.byType[t].bytes += r.size;
    });

    auditResults.push({
      page: pageDef.name,
      pageId: pageDef.id,
      path: pageDef.path,
      viewport: vp.name,
      viewportWidth: vp.width,
      viewportHeight: vp.height,
      loadTimeMs: endNav - startNav,
      perfData,
      payloadStats,
      tapTargetAnalysis,
      screenshot: screenshotName
    });

    await context.close();
  }
}

await browser.close();
server.close();

// Write results JSON
const reportPath = path.join(outDir, 'mobile-cro-audit-results.json');
await fs.writeFile(reportPath, JSON.stringify(auditResults, null, 2));

console.log(`Mobile CRO & Funnel Review Audit complete! Results saved to ${reportPath}`);
