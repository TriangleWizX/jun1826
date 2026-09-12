import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { readHtmlWithSsi } from './url-qa-lib.mjs';

const isLive = process.argv.includes('--live');
const root = path.resolve('dist');

let server = null;
let baseUrl = '';

if (isLive) {
  baseUrl = 'https://senseisandy.com';
} else {
  // Obtain current availability fixture from live API if possible, with fallback
  let liveAvailFixture = {
    status: 'available',
    timeframe: 'week',
    timeframeLabel: 'this coming week',
    availableSlotCount: 26,
    nextAvailableLabel: 'Mon, Sep 14',
    nextAvailableDaySpots: 8,
    nextAvailableDayLabel: 'Mon, Sep 14',
    spotsPerDayRange: '4–10',
    spotsPerDayLabel: '4–10 spots left each day'
  };

  try {
    const res = await fetch('https://senseisandy.com/api/first-visit-availability', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      liveAvailFixture = await res.json();
    }
  } catch (_) {}

  server = createServer(async (req, res) => {
    try {
      const parsed = new URL(req.url, 'http://local');
      if (parsed.pathname === '/api/first-visit-availability') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(liveAvailFixture));
      }
      let rel = decodeURI(parsed.pathname).slice(1) || 'index.html';
      let file = path.join(root, rel);
      try {
        if ((await fs.stat(file)).isDirectory()) {
          rel += '/index.html';
          file = path.join(root, rel);
        }
      } catch {
        if (!path.extname(rel)) {
          rel += '.html';
          file = path.join(root, rel);
        }
      }
      const html = rel.endsWith('.html');
      res.setHeader('Content-Type', html ? 'text/html' : ({
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.webp': 'image/webp'
      }[path.extname(rel)] || 'application/octet-stream'));
      res.end(html ? await readHtmlWithSsi(rel, { root }) : await fs.readFile(file));
    } catch {
      res.statusCode = 404;
      res.end('missing');
    }
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

const evidenceDir = path.resolve('tmp/home-cro-verification');
await fs.mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox']
});

const desktopViewports = [
  { width: 992, height: 768 },
  { width: 1024, height: 768 },
  { width: 1100, height: 768 },
  { width: 1200, height: 768 },
  { width: 1280, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
];

const mobileGuards = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
];

const results = {
  mode: isLive ? 'live' : 'local',
  baseUrl,
  desktop: [],
  mobile: [],
  failures: []
};

try {
  // 1. Desktop tests
  for (const vp of desktopViewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    // Wait for availability text to be populated with real dynamic content
    await page.waitForSelector('.ss-avail-text');
    await page.waitForFunction(() => {
      const txt = document.querySelector('.ss-avail-text')?.textContent || '';
      return (txt.includes('openings left') || txt.includes('opening left')) && !txt.includes('Check available times');
    }, { timeout: 7000 }).catch(() => {});

    const measurements = await page.evaluate(() => {
      const getTextNodeRects = (element) => {
        if (!element) return [];
        const rects = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (!node.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (r.width > 0 && r.height > 0) {
              rects.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height, text: node.textContent.trim() });
            }
          }
        }
        return rects;
      };

      const topbar = document.querySelector('.ss-topbar');
      const leftEl = document.querySelector('.ss-topbar-left');
      const locEl = document.querySelector('.ss-topbar-location');
      const highlightEl = document.querySelector('.ss-topbar-highlight');
      const centerEl = document.querySelector('.ss-topbar-center');
      const availTextEl = document.querySelector('.ss-avail-text');
      const rightEl = document.querySelector('.ss-topbar-right');
      const smsEl = document.querySelector('.ss-topbar-sms');

      const leftBox = leftEl?.getBoundingClientRect();
      const locBox = locEl?.getBoundingClientRect();
      const highlightBox = highlightEl?.getBoundingClientRect();
      const centerBox = centerEl?.getBoundingClientRect();
      const availBox = availTextEl?.getBoundingClientRect();
      const rightBox = rightEl?.getBoundingClientRect();
      const smsBox = smsEl?.getBoundingClientRect();
      const topbarBox = topbar?.getBoundingClientRect();

      const leftTextRects = getTextNodeRects(leftEl);
      const availTextRects = getTextNodeRects(availTextEl);
      const rightTextRects = getTextNodeRects(rightEl);

      const maxLeftTextRight = leftTextRects.length ? Math.max(...leftTextRects.map(r => r.right)) : (locBox?.right || 0);
      const minAvailTextLeft = availTextRects.length ? Math.min(...availTextRects.map(r => r.left)) : (availBox?.left || 0);
      const maxAvailTextRight = availTextRects.length ? Math.max(...availTextRects.map(r => r.right)) : (availBox?.right || 0);
      const minRightTextLeft = rightTextRects.length ? Math.min(...rightTextRects.map(r => r.left)) : (smsBox?.left || window.innerWidth);

      const overlapLeft = maxLeftTextRight > minAvailTextLeft;
      const overlapRight = maxAvailTextRight > minRightTextLeft;
      const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;

      return {
        availContent: availTextEl?.textContent.trim(),
        topbarHeight: topbarBox?.height,
        leftBox: { left: leftBox?.left, right: leftBox?.right, width: leftBox?.width },
        locBox: { left: locBox?.left, right: locBox?.right, width: locBox?.width },
        centerBox: { left: centerBox?.left, right: centerBox?.right, width: centerBox?.width },
        availBox: { left: availBox?.left, right: availBox?.right, width: availBox?.width },
        rightBox: { left: rightBox?.left, right: rightBox?.right, width: rightBox?.width },
        smsBox: { left: smsBox?.left, right: smsBox?.right, width: smsBox?.width },
        maxLeftTextRight,
        minAvailTextLeft,
        maxAvailTextRight,
        minRightTextLeft,
        overlapLeft,
        overlapRight,
        horizontalOverflow,
        leftOverlapGap: minAvailTextLeft - maxLeftTextRight,
        rightOverlapGap: minRightTextLeft - maxAvailTextRight
      };
    });

    if (measurements.overlapLeft) {
      results.failures.push(`Overlap on left at ${vp.width}px: leftMaxX=${measurements.maxLeftTextRight} > availMinX=${measurements.minAvailTextLeft}`);
    }
    if (measurements.overlapRight) {
      results.failures.push(`Overlap on right at ${vp.width}px: availMaxX=${measurements.maxAvailTextRight} > rightMinX=${measurements.minRightTextLeft}`);
    }
    if (measurements.horizontalOverflow) {
      results.failures.push(`Horizontal overflow at ${vp.width}px`);
    }

    const availLinkInfo = await page.evaluate(() => {
      const el = document.querySelector('.ss-topbar-availability');
      return {
        tagName: el?.tagName,
        href: el?.getAttribute('href') || el?.href || ''
      };
    });
    if (availLinkInfo.tagName !== 'A') {
      results.failures.push(`.ss-topbar-availability is not an <a> tag at ${vp.width}px (got ${availLinkInfo.tagName})`);
    }
    if (!availLinkInfo.href.includes('/free-bjj-intro-tannersville-ny#booking-flow')) {
      results.failures.push(`.ss-topbar-availability href does not direct to cal booking flow at ${vp.width}px (href=${availLinkInfo.href})`);
    }

    if (vp.width === 1366) {
      const topbarLoc = page.locator('.ss-topbar');
      if (await topbarLoc.isVisible()) {
        await topbarLoc.screenshot({ path: path.join(evidenceDir, '1366-topbar.png') });
      }
      await page.screenshot({ path: path.join(evidenceDir, '1366-desktop.png'), fullPage: false });
    }

    results.desktop.push({ viewport: vp, measurements });
    await page.close();
  }

  // 2. Mobile guards
  for (const vp of mobileGuards) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const guardData = await page.evaluate(() => {
      const topbar = document.querySelector('.ss-topbar');
      const topbarVisible = topbar ? getComputedStyle(topbar).display !== 'none' : false;
      const menuBtn = document.querySelector('.ss-menu-button');
      const menuBox = menuBtn?.getBoundingClientRect();
      const cta = document.querySelector('.ss-nav-cta--persistent, #hero-primary-cta');
      const ctaBox = cta?.getBoundingClientRect();
      const horizontalOverflow = document.documentElement.scrollWidth > window.innerWidth;
      return {
        topbarHidden: !topbarVisible,
        menuBtnTarget: { width: menuBox?.width, height: menuBox?.height },
        ctaVisible: !!ctaBox && ctaBox.width > 0,
        horizontalOverflow
      };
    });

    if (guardData.horizontalOverflow) {
      results.failures.push(`Mobile horizontal overflow at ${vp.width}px`);
    }
    if (guardData.menuBtnTarget.width < 44 || guardData.menuBtnTarget.height < 44) {
      results.failures.push(`Menu button tap target too small at ${vp.width}px`);
    }

    const mobileAvailInfo = await page.evaluate(() => {
      const el = document.querySelector('.ss-hero-mobile-avail');
      return {
        tagName: el?.tagName,
        href: el?.getAttribute('href') || el?.href || ''
      };
    });
    if (mobileAvailInfo.tagName && mobileAvailInfo.tagName !== 'A') {
      results.failures.push(`.ss-hero-mobile-avail is not an <a> tag at ${vp.width}px`);
    }
    if (mobileAvailInfo.href && !mobileAvailInfo.href.includes('/free-bjj-intro-tannersville-ny#booking-flow')) {
      results.failures.push(`.ss-hero-mobile-avail href does not direct to cal booking flow at ${vp.width}px`);
    }

    results.mobile.push({ viewport: vp, guardData });
    await page.close();
  }

  // 3. Navigation interaction guard (at 1366px desktop and 390px mobile)
  for (const width of [390, 1366]) {
    const page = await browser.newPage({ viewport: { width, height: 768 } });
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    const menuBtn = page.locator('.ss-menu-button');
    await menuBtn.click();
    await page.waitForTimeout(200);
    const expanded = await menuBtn.getAttribute('aria-expanded') === 'true';
    if (!expanded) {
      results.failures.push(`Menu failed to expand on click at ${width}px`);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const closed = await menuBtn.getAttribute('aria-expanded') === 'false';
    if (!closed) {
      results.failures.push(`Menu failed to close on Escape at ${width}px`);
    }
    await page.close();
  }
} finally {
  await browser.close();
  if (server) server.close();
}

const summaryPath = path.join(evidenceDir, isLive ? 'live-desktop-topbar-results.json' : 'local-desktop-topbar-results.json');
await fs.writeFile(summaryPath, JSON.stringify(results, null, 2));

console.log(`QA topbar results (${results.mode}): ${results.failures.length} failures.`);
if (results.failures.length > 0) {
  console.error('Failures:\n' + results.failures.join('\n'));
  process.exit(1);
} else {
  console.log('All desktop viewports and mobile guards passed!');
}
