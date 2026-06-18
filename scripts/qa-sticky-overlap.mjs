import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readHtmlWithSsi } from './url-qa-lib.mjs';

const CHROME_BIN = process.env.CHROME_BIN || 'chromium';
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const pages = [
  { label: 'form', relPath: 'contact.html' },
  { label: 'gallery', relPath: 'show-up-kit.html' },
  { label: 'footer-cta', relPath: 'options-pricing.html' },
  { label: 'schedule', relPath: 'schedule.html' },
  { label: 'home', relPath: 'index.html' }
];

const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};

const probeScript = `
<script>
(function initStickyProbe() {
  function visible(el) {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function run() {
    const fixedBottom = Array.from(document.querySelectorAll('body *')).filter((el) => {
      if (!visible(el)) return false;
      const style = getComputedStyle(el);
      if (style.position !== 'fixed') return false;
      const r = el.getBoundingClientRect();
      return r.height >= 32 && r.width >= 160 && r.bottom > (window.innerHeight - 10) && r.top < window.innerHeight;
    });

    const fixedTop = fixedBottom.length
      ? Math.min.apply(null, fixedBottom.map((el) => el.getBoundingClientRect().top))
      : window.innerHeight;

    const controls = Array.from(document.querySelectorAll('a,button,input,select,textarea,[role="button"],[tabindex]')).filter((el) => {
      if (!visible(el)) return false;
      if (fixedBottom.some((bar) => bar.contains(el))) return false;
      const r = el.getBoundingClientRect();
      return r.bottom > fixedTop && r.top < window.innerHeight && r.width >= 24 && r.height >= 24;
    });

    const overlaps = controls.slice(0, 80).map((el) => {
      const r = el.getBoundingClientRect();
      const x = Math.max(1, Math.min(window.innerWidth - 1, r.left + (r.width / 2)));
      const y = Math.max(1, Math.min(window.innerHeight - 1, r.bottom - 2));
      const topEl = document.elementFromPoint(x, y);
      if (!topEl || el.contains(topEl) || topEl.contains(el)) return null;
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        blockedBy: topEl.tagName.toLowerCase(),
        y: Math.round(y)
      };
    }).filter(Boolean);

    const payload = {
      fixedBars: fixedBottom.length,
      fixedTop: Math.round(fixedTop),
      fixedElements: fixedBottom.map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id,
        class: el.className,
        top: el.getBoundingClientRect().top,
        bottom: el.getBoundingClientRect().bottom
      })),
      overlaps: overlaps
    };

    const pre = document.createElement('pre');
    pre.id = 'sticky-overlap-results';
    pre.textContent = JSON.stringify(payload);
    document.body.appendChild(pre);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
</script>`;

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
    default: return 'text/html; charset=utf-8';
  }
};

const resolveRequestPath = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const safePath = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
  let filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) return null;

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    if (!path.extname(filePath)) {
      const indexPath = path.join(filePath, 'index.html');
      try {
        await fs.stat(indexPath);
        filePath = indexPath;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  return filePath.startsWith(ROOT) ? filePath : null;
};

const injectProbe = (html) => html.includes('</body>') ? html.replace('</body>', `${probeScript}\n</body>`) : `${html}\n${probeScript}`;

const startServer = () => new Promise((resolve, reject) => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/__sticky-overlap-check') {
        const relPath = url.searchParams.get('page');
        ensure(pages.some((page) => page.relPath === relPath), `Unsupported sticky test page "${relPath}".`);
        const html = await readHtmlWithSsi(relPath);
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(injectProbe(html));
        return;
      }

      const filePath = await resolveRequestPath(url.pathname);
      if (!filePath) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found');
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

  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    resolve({ server, port: address.port });
  });
});

const shellEscape = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

const runChromium = (url) => new Promise((resolve, reject) => {
  const chromiumArgs = [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    `--window-size=${MOBILE_VIEWPORT.width},${MOBILE_VIEWPORT.height}`,
    '--virtual-time-budget=8000', '--dump-dom', url
  ];
  const command = [CHROME_BIN, ...chromiumArgs].map(shellEscape).join(' ');
  const child = spawn('script', ['-q', '-c', command, '/dev/null'], { stdio: ['ignore', 'pipe', 'pipe'] });

  let stdout = '';
  let stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', (chunk) => { stdout += chunk; });
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0) {
      reject(new Error(`${CHROME_BIN} exited ${code}\n${stderr}`));
      return;
    }
    resolve(stdout);
  });
});

const extractResult = (html) => {
  const match = html.match(/<pre id="sticky-overlap-results">([\s\S]*?)<\/pre>/);
  if (!match) throw new Error(`Could not find sticky overlap payload. Output starts:\n${html.slice(0, 1200)}`);
  return JSON.parse(match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
};

const shouldFallback = (error) => /listen EPERM|spawn .* ENOENT|snap-confine/i.test(String(error?.message || error));

const runStaticAudit = async (reason) => {
  console.warn(`Browser sticky overlap audit unavailable (${reason}). Running static sticky contract audit.`);
  const [navHtml, globalCss] = await Promise.all([
    fs.readFile(path.join(ROOT, 'nav-include.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'assets/css/global.css'), 'utf8')
  ]);

  ensure(navHtml.includes('.ss-mobile-actions'), 'nav-include.html: expected mobile sticky actions class missing.');
  ensure(/env\(safe-area-inset-bottom\)/.test(navHtml) || /env\(safe-area-inset-bottom\)/.test(globalCss), 'safe-area-inset-bottom guard missing from sticky/footer styles.');
  ensure(/padding-bottom:\s*76px/.test(navHtml) || /padding-bottom:\s*calc\(76px \+ env\(safe-area-inset-bottom\)\)/.test(globalCss), 'body bottom padding guard for sticky controls missing.');
  console.log('Static sticky overlap contract audit passed.');
};

let server;

try {
  const started = await startServer();
  server = started.server;
  const failures = [];

  for (const page of pages) {
    const url = `http://127.0.0.1:${started.port}/__sticky-overlap-check?page=${encodeURIComponent(page.relPath)}`;
    const html = await runChromium(url);
    const result = extractResult(html);
    if (result.overlaps.length) {
      console.log('Result payload for', page.relPath, ':', JSON.stringify(result, null, 2));
      failures.push(`${page.relPath}: ${result.overlaps.length} bottom-overlap candidate(s): ${JSON.stringify(result.overlaps.slice(0, 3))}`);
    }
    console.log(`Checked ${page.label}.`);
  }

  if (failures.length) {
    console.error('qa-sticky-overlap failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('qa-sticky-overlap passed.');
} catch (error) {
  if (shouldFallback(error)) {
    await runStaticAudit(error.message);
  } else {
    console.error(`qa-sticky-overlap failed: ${error.message}`);
    process.exitCode = 1;
  }
} finally {
  if (server) server.close();
}
