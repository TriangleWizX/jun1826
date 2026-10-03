import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import playwright from 'playwright';
import { ROOT, readHtmlWithSsi } from '../scripts/url-qa-lib.mjs';

const targetRel = process.argv[2];
if (!targetRel) {
  console.error("Usage: node tools/check-page-breakpoints.mjs <distRelPath>");
  process.exit(1);
}

const CHROME_BIN = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const BREAKPOINTS = [320, 360, 375, 390, 412, 480, 600, 768, 992, 1024, 1200, 1280, 1440];

const contentTypeFor = (filePath) => {
  switch (path.extname(filePath).toLowerCase()) {
    case '.css': return 'text/css; charset=utf-8';
    case '.js':
    case '.mjs': return 'text/javascript; charset=utf-8';
    case '.json': return 'application/json; charset=utf-8';
    case '.svg': return 'image/svg+xml';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    case '.woff2': return 'font/woff2';
    case '.woff': return 'font/woff';
    default: return 'text/html; charset=utf-8';
  }
};

const resolveRequestPath = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const safePath = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = path.join(ROOT, 'dist', safePath);

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    return filePath;
  } catch {
    filePath = path.join(ROOT, safePath);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
      return filePath;
    } catch {
      return null;
    }
  }
};

const startServer = () => new Promise((resolve) => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/target-test-page') {
        const html = await readHtmlWithSsi(path.join('dist', targetRel));
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      const filePath = await resolveRequestPath(url.pathname);
      if (!filePath) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found: ' + url.pathname);
        return;
      }

      const body = await fs.readFile(filePath);
      res.writeHead(200, { 'content-type': contentTypeFor(filePath) });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(error.stack || String(error));
    }
  });

  server.listen(0, '127.0.0.1', () => {
    resolve({ server, port: server.address().port });
  });
});

async function main() {
  const { server, port } = await startServer();
  const browser = await playwright.chromium.launch({
    executablePath: CHROME_BIN,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  let hasFailures = false;

  for (const width of BREAKPOINTS) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
      isMobile: width < 768,
      hasTouch: width < 768
    });
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${port}/target-test-page`, { waitUntil: 'networkidle' });

    const metrics = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const vw = window.innerWidth;
      const bodyWidth = document.body.scrollWidth;
      const stickyBar = document.querySelector('.ss-mobile-sticky, .mobile-sticky, [class*="-mobile-sticky"]');
      const stickyDisplay = stickyBar ? window.getComputedStyle(stickyBar).display : null;
      return {
        docWidth,
        bodyWidth,
        vw,
        hasOverflow: docWidth > vw,
        stickyPresent: !!stickyBar,
        stickyDisplay
      };
    });

    if (metrics.hasOverflow) {
      console.error(`[FAIL] ${width}px: docWidth=${metrics.docWidth} > vw=${metrics.vw}`);
      hasFailures = true;
    } else {
      console.log(`[PASS] ${width}px: docWidth=${metrics.docWidth}, vw=${metrics.vw}, sticky=${metrics.stickyPresent} (${metrics.stickyDisplay})`);
    }

    await context.close();
  }

  await browser.close();
  server.close();

  if (hasFailures) process.exit(1);
  console.log(`All 13 breakpoints passed for ${targetRel}!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
