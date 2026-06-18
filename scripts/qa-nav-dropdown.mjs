import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, readHtmlWithSsi } from './url-qa-lib.mjs';

const CHROME_BIN = process.env.CHROME_BIN || 'chromium';
const DESKTOP_VIEWPORT = { width: 1366, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 900 };
const pages = [
  { label: 'home', relPath: 'index.html' },
  { label: 'schedule', relPath: 'schedule.html' },
  { label: 'glossary', relPath: 'bjj-glossary/index.html' },
  { label: 'adults', relPath: 'adult-bjj.html' },
  { label: 'sensei-studio', relPath: 'sensei-studio.html' },
  { label: 'faqs', relPath: 'bjj-faqs.html' }
];

const expectedDesktopTopLevelItems = [
  'Kids',
  'Teens',
  'Adults',
  'Schedule',
  'About'
];

const expectedMobileMenuItems = [
  'Start Here',
  'Kids',
  'Teens',
  'Adults',
  'Schedule',
  'Text Sandy'
];

const expectedAboutMenuItems = [
  'Bio',
  'Pricing',
  'Show-Up Kit',
  'Studio Tour',
  'Directions',
  'Nearby Towns',
  'BJJ Classes'
];

const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};

const contentTypeFor = (filePath) => {
  switch (path.extname(filePath).toLowerCase()) {
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.json':
    case '.webmanifest':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.avif':
      return 'image/avif';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'text/html; charset=utf-8';
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

const decodeEntities = (value = '') =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const shellEscape = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

const navProbe = `
<script>
  (function initNavProbe() {
    function textList(selector) {
      return Array.prototype.map.call(document.querySelectorAll(selector), function (el) {
        return el.textContent.replace(/\\s+/g, ' ').trim();
      }).filter(Boolean);
    }

    function visibleText(selector) {
      return Array.prototype.map.call(document.querySelectorAll(selector), function (el) {
        return {
          text: el.textContent.replace(/\\s+/g, ' ').trim(),
          visible: el.getClientRects().length > 0
        };
      }).filter(function (item) {
        return item.visible;
      }).map(function (item) {
        return item.text;
      });
    }

    function wait(ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    }

    function dropdownSnapshot(button, menu) {
      if (!button || !menu) return { found: false };

      var firstLink = menu.querySelector('.dropdown-item');
      var menuStyle = window.getComputedStyle(menu);
      var linkStyle = firstLink ? window.getComputedStyle(firstLink) : null;

      return {
        found: true,
        shown: menu.classList.contains('show'),
        ariaExpanded: button.getAttribute('aria-expanded'),
        display: menuStyle.display,
        firstLinkClickable: Boolean(firstLink && linkStyle && linkStyle.pointerEvents !== 'none')
      };
    }

    async function runNavProbe() {
      var aboutButton = document.querySelector('#aboutDropdownToggle');
      var aboutMenu = document.querySelector('#aboutDropdownMenu');
      var beforeOpen = dropdownSnapshot(aboutButton, aboutMenu);

      if (aboutButton) {
        aboutButton.click();
        await wait(420);
      }

      var afterOpen = dropdownSnapshot(aboutButton, aboutMenu);
      var payload = {
        topLevelItems: visibleText('#ssMainNav > .navbar-nav > .nav-item > .nav-link, #ssMainNav > .navbar-nav > .nav-item > button.nav-link'),
        topbarSeparatorVisibleText: visibleText('.ss-topbar-dot'),
        topbarText: visibleText('.ss-topbar-inner *'),
        aboutDropdown: {
          found: Boolean(aboutButton && aboutMenu),
          hasBootstrapDropdown: Boolean(window.bootstrap && window.bootstrap.Dropdown),
          menuItems: textList('#aboutDropdownMenu .dropdown-item'),
          beforeOpen: beforeOpen,
          afterOpen: afterOpen
        }
      };

      var pre = document.createElement('pre');
      pre.id = 'nav-dropdown-results';
      pre.textContent = JSON.stringify(payload);
      document.body.appendChild(pre);
    }

    if (document.readyState !== 'complete') {
      window.addEventListener('load', runNavProbe);
    } else {
      runNavProbe();
    }
  })();
</script>`;

const mobileNavProbe = `
<script>
  (function initMobileNavProbe() {
    async function runMobileNavProbe() {
      var button = document.querySelector('.navbar-toggler[data-bs-target="#ssMainNav"]');
      var menu = document.querySelector('#ssMainNav');
      var menuLink = menu && menu.querySelector('a.nav-link');
      var reserve = document.querySelector('.ss-mobile-reserve');
      var wait = function (ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); };
      var visibleText = function (selector) {
        return Array.prototype.map.call(document.querySelectorAll(selector), function (el) {
          return {
            text: el.textContent.replace(/\\s+/g, ' ').trim(),
            visible: el.getClientRects().length > 0
          };
        }).filter(function (item) {
          return item.visible;
        }).map(function (item) {
          return item.text;
        });
      };
      var snapshot = function () {
        if (!button || !menu) return { found: false };
        var style = window.getComputedStyle(menu);
        return {
          found: true,
          shown: menu.classList.contains('show'),
          ariaExpanded: button.getAttribute('aria-expanded'),
          display: style.display,
          menuLinkClickable: Boolean(menuLink && window.getComputedStyle(menuLink).pointerEvents !== 'none'),
          reserveVisible: Boolean(reserve && window.getComputedStyle(reserve).display !== 'none'),
          reserveText: reserve ? reserve.textContent.replace(/\\s+/g, ' ').trim() : '',
          menuButtonText: button.textContent.replace(/\\s+/g, ' ').trim(),
          menuItems: visibleText('#ssMainNav > .navbar-nav > .nav-item > .nav-link'),
          topbarSeparatorVisibleText: visibleText('.ss-topbar-dot')
        };
      };

      var initial = snapshot();
      if (button) button.click();
      await wait(420);
      var afterOpen = snapshot();

      if (button) button.click();
      await wait(420);
      var afterSecondClick = snapshot();

      var payload = { initial: initial, afterOpen: afterOpen, afterSecondClick: afterSecondClick };
      var pre = document.createElement('pre');
      pre.id = 'mobile-nav-results';
      pre.textContent = JSON.stringify(payload);
      document.body.appendChild(pre);
    }

    if (document.readyState !== 'complete') {
      window.addEventListener('load', runMobileNavProbe);
    } else {
      runMobileNavProbe();
    }
  })();
</script>`;

const injectProbe = (html, probe) => {
  if (html.includes('</body>')) return html.replace('</body>', `${probe}\n</body>`);
  return `${html}\n${probe}`;
};

const startServer = () => new Promise((resolve, reject) => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/__nav-dropdown-check') {
        const relPath = url.searchParams.get('page');
        ensure(pages.some((page) => page.relPath === relPath), `Unsupported nav test page "${relPath}".`);
        const html = await readHtmlWithSsi(relPath);
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(injectProbe(html, navProbe));
        return;
      }

      if (url.pathname === '/__mobile-nav-check') {
        const html = await readHtmlWithSsi('index.html');
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(injectProbe(html, mobileNavProbe));
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

const runChromium = (url, viewport = DESKTOP_VIEWPORT) => new Promise((resolve, reject) => {
  const chromiumArgs = [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--window-size=${viewport.width},${viewport.height}`,
    '--virtual-time-budget=8000',
    '--dump-dom',
    url
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
  const match = html.match(/<pre id="nav-dropdown-results">([\s\S]*?)<\/pre>/);
  if (!match) {
    throw new Error(`Could not find nav payload. Output starts:\n${html.slice(0, 1200)}`);
  }
  return JSON.parse(decodeEntities(match[1]));
};

const extractMobileResult = (html) => {
  const match = html.match(/<pre id="mobile-nav-results">([\s\S]*?)<\/pre>/);
  if (!match) {
    throw new Error(`Could not find mobile nav payload. Output starts:\n${html.slice(0, 1200)}`);
  }
  return JSON.parse(decodeEntities(match[1]));
};

const assertDesktop = (snapshot, label) => {
  ensure(
    JSON.stringify(snapshot.topLevelItems) === JSON.stringify(expectedDesktopTopLevelItems),
    `${label}: desktop top-level nav order changed unexpectedly (${JSON.stringify(snapshot.topLevelItems)}).`
  );
  ensure(!snapshot.topLevelItems.includes('Glossary'), `${label}: desktop top nav should not include Glossary.`);
  ensure(snapshot.topbarSeparatorVisibleText.every((value) => value === '•'), `${label}: topbar separator glyphs changed unexpectedly (${JSON.stringify(snapshot.topbarSeparatorVisibleText)}).`);
  const deduped = new Set(snapshot.topLevelItems);
  ensure(deduped.size === snapshot.topLevelItems.length, `${label}: duplicate visible desktop nav labels detected (${JSON.stringify(snapshot.topLevelItems)}).`);

  const aboutDropdown = snapshot.aboutDropdown || {};
  const beforeOpen = aboutDropdown.beforeOpen || {};
  const afterOpen = aboutDropdown.afterOpen || {};

  ensure(aboutDropdown.found === true, `${label}: About dropdown markup was not found.`);
  ensure(aboutDropdown.hasBootstrapDropdown === true, `${label}: Bootstrap Dropdown API was not available.`);
  ensure(
    JSON.stringify(aboutDropdown.menuItems) === JSON.stringify(expectedAboutMenuItems),
    `${label}: About dropdown menu items changed unexpectedly (${JSON.stringify(aboutDropdown.menuItems)}).`
  );
  ensure(beforeOpen.shown === false, `${label}: About dropdown should start closed.`);
  ensure(beforeOpen.ariaExpanded === 'false', `${label}: About dropdown aria-expanded should start false.`);
  ensure(afterOpen.shown === true, `${label}: About dropdown did not open after click.`);
  ensure(afterOpen.ariaExpanded === 'true', `${label}: About dropdown aria-expanded did not update after click.`);
  ensure(afterOpen.display !== 'none', `${label}: About dropdown menu should be laid out after click.`);
  ensure(afterOpen.firstLinkClickable === true, `${label}: About dropdown links should be clickable after click.`);
};

const assertMobileClosed = (snapshot, label) => {
  ensure(snapshot.found, `${label}: mobile nav markup was not found.`);
  ensure(snapshot.shown === false, `${label}: mobile nav should be closed.`);
  ensure(snapshot.ariaExpanded === 'false', `${label}: aria-expanded should be false.`);
};

const assertMobileOpen = (snapshot, label) => {
  ensure(snapshot.found, `${label}: mobile nav markup was not found.`);
  ensure(snapshot.shown === true, `${label}: mobile nav should be open.`);
  ensure(snapshot.ariaExpanded === 'true', `${label}: aria-expanded should be true.`);
  ensure(snapshot.display !== 'none', `${label}: mobile nav should be laid out.`);
  ensure(snapshot.menuLinkClickable === true, `${label}: mobile nav links should be clickable.`);
  ensure(snapshot.reserveVisible === false, `${label}: mobile Reserve CTA should not be visible.`);
  ensure(snapshot.menuButtonText === 'Menu', `${label}: mobile menu button text should be "Menu".`);
  ensure(
    JSON.stringify(snapshot.menuItems) === JSON.stringify(expectedMobileMenuItems),
    `${label}: mobile menu order changed unexpectedly (${JSON.stringify(snapshot.menuItems)}).`
  );
  ensure(!snapshot.menuItems.includes('Reserve Free Intro'), `${label}: mobile menu should not duplicate Reserve Free Intro.`);
  ensure(!snapshot.menuItems.includes('Glossary'), `${label}: mobile top nav should not include Glossary.`);
  ensure(snapshot.topbarSeparatorVisibleText.every((value) => value === '•'), `${label}: topbar separator glyphs changed unexpectedly (${JSON.stringify(snapshot.topbarSeparatorVisibleText)}).`);
  const deduped = new Set(snapshot.menuItems);
  ensure(deduped.size === snapshot.menuItems.length, `${label}: duplicate visible mobile nav labels detected (${JSON.stringify(snapshot.menuItems)}).`);
};

const runStaticAudit = async (reason) => {
  console.warn(`Browser nav audit unavailable (${reason}). Running static nav contract audit.`);
  const [navHtml, componentsCss] = await Promise.all([
    fs.readFile(path.join(ROOT, 'nav-include.html'), 'utf8'),
    fs.readFile(path.join(ROOT, 'assets/css/components.css'), 'utf8')
  ]);

  ensure(navHtml.includes('>Start Here<'), 'Shared nav is missing Start Here.');
  ensure(navHtml.includes('href="sms:+19177368649">Text Sandy</a>'), 'Shared nav is missing Text Sandy.');
  ensure(!/data-ss-dropdown(-toggle|-menu)?/.test(navHtml), 'Shared nav should not include custom dropdown hooks.');
  ensure(!navHtml.includes('function initProgramsDropdown'), 'Shared nav should not include legacy dropdown controller.');
  ensure(/id="aboutDropdownToggle"[^>]*data-bs-toggle="dropdown"/.test(navHtml), 'Shared nav About toggle must use Bootstrap dropdown markup.');
  ensure(navHtml.includes('window.bootstrap && window.bootstrap.Dropdown'), 'Shared Bootstrap loader must check window.bootstrap.Dropdown.');
  expectedAboutMenuItems.forEach((item) => {
    ensure(navHtml.includes(`>${item}<`), `Shared About dropdown is missing ${item}.`);
  });
  ensure(!navHtml.includes('>Glossary<'), 'Shared nav should not include Glossary in top nav.');
  ensure(!componentsCss.includes('Universal Dropdown Menu Fix'), 'Shared component CSS still contains the legacy universal dropdown override.');
  console.log('Static nav contract audit passed.');
};

const shouldFallbackToStaticAudit = (error) =>
  /listen EPERM|spawn .* ENOENT|snap-confine/i.test(String(error?.message || error));

let server;

try {
  const started = await startServer();
  server = started.server;
  const failures = [];

  for (const page of pages) {
    const url = `http://127.0.0.1:${started.port}/__nav-dropdown-check?page=${encodeURIComponent(page.relPath)}`;
    const html = await runChromium(url);
    const result = extractResult(html);

    try {
      assertDesktop(result, `${page.label}/desktop`);
      console.log(`Checked ${page.label} desktop nav.`);
    } catch (error) {
      failures.push(error.message);
    }
  }

  try {
    const url = `http://127.0.0.1:${started.port}/__mobile-nav-check`;
    const html = await runChromium(url, MOBILE_VIEWPORT);
    const result = extractMobileResult(html);
    assertMobileClosed(result.initial, 'home/mobile/initial');
    assertMobileOpen(result.afterOpen, 'home/mobile/afterOpen');
    assertMobileClosed(result.afterSecondClick, 'home/mobile/afterSecondClick');
    console.log('Checked home mobile toggle.');
  } catch (error) {
    failures.push(error.message);
  }

  if (failures.length) {
    console.error('Nav contract failures:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('qa-nav-dropdown passed.');
} catch (error) {
  if (shouldFallbackToStaticAudit(error)) {
    await runStaticAudit(error.message);
  } else {
    console.error(`qa-nav-dropdown failed: ${error.message}`);
    process.exitCode = 1;
  }
} finally {
  if (server) server.close();
}
