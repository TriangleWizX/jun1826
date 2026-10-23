import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Keep public-page inspection independent of a signed-in browser and CDP daemon.
const [target, outputArg] = process.argv.slice(2);
if (!target || process.argv.length > 4) {
  console.error('Usage: node tools/browser-proof.mjs <http(s)-url> [output-directory]');
  process.exit(1);
}
const url = new URL(target);
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
  throw new Error('Use an HTTP(S) URL without embedded credentials.');
}
const output = path.resolve(outputArg || '/tmp/browser-proof');
const configured = process.env.CHROME_PATH;
if (configured && !existsSync(configured)) throw new Error('CHROME_PATH does not exist.');
const executablePath = configured || [chromium.executablePath(), '/usr/bin/google-chrome', '/usr/bin/chromium']
  .find(candidate => existsSync(candidate));
if (!executablePath) throw new Error('No installed browser found. Set CHROME_PATH to an existing browser.');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath, headless: true,
  args: ['--no-sandbox', '--disable-crash-reporter', '--disable-dev-shm-usage'] });
try {
  for (const [name, viewport] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 1000 }]]) {
    const context = await browser.newContext({ viewport, isMobile: name === 'mobile', hasTouch: name === 'mobile' });
    try {
      const page = await context.newPage();
      const pageErrors = [];
      const requestFailures = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText }));
      const response = await page.goto(url.href, { waitUntil: 'load', timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      const evidence = await page.evaluate(() => {
        const visible = element => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== 'hidden';
        };
        return {
          title: document.title,
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          description: document.querySelector('meta[name="description"]')?.content,
          robots: document.querySelector('meta[name="robots"]')?.content,
          h1: [...document.querySelectorAll('h1')].map(element => element.textContent.trim()),
          viewport: { width: innerWidth, height: innerHeight },
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          text: document.body.innerText,
          actions: [...document.querySelectorAll('a,button')].filter(visible).map(element => {
            const box = element.getBoundingClientRect();
            return { text: element.textContent.trim(), label: element.getAttribute('aria-label'),
              href: element.getAttribute('href'), width: box.width, height: box.height,
              inViewport: box.top >= 0 && box.bottom <= innerHeight };
          }),
          jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(element => element.textContent),
        };
      });
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true });
      await writeFile(path.join(output, `${name}.html`), await page.content());
      await writeFile(path.join(output, `${name}.json`), JSON.stringify({ requestedUrl: url.href,
        finalUrl: page.url(), status: response?.status(), ...evidence, pageErrors, requestFailures }, null, 2));
      console.log(JSON.stringify({ viewport: name, status: response?.status(),
        horizontalOverflow: evidence.horizontalOverflow, pageErrors: pageErrors.length, output }));
      if (!response?.ok()) process.exitCode = 1;
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
