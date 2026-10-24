import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'dist');
const out = path.resolve(process.argv[2] || 'docs/ws29/runs/phase2-shell');
const routes = process.argv[3] === '--pricing' ? ['/options-pricing'] : ['--home', '--breakpoint'].includes(process.argv[3]) ? ['/'] : [
  '/', '/visit', '/free-bjj-intro-tannersville-ny',
  '/options-pricing', '/programs', '/bjj-classes/kids-tannersville-ny'
];
const widths = ['--home', '--pricing'].includes(process.argv[3]) ? [360] : process.argv[3] === '--breakpoint' ? [767, 768] : [360, 390, 430, 1280];
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2'
};

async function materialize(file, parents = []) {
  if (parents.includes(file)) throw new Error(`SSI cycle: ${file}`);
  let html = await fs.readFile(file, 'utf8');
  const includes = [...html.matchAll(/<!--\s*#include\s+(virtual|file)=["']([^"']+)["']\s*-->/g)];
  for (const include of includes) {
    const target = include[1] === 'virtual'
      ? path.resolve(dist, `.${include[2]}`)
      : path.resolve(path.dirname(file), include[2]);
    if (!target.startsWith(`${dist}${path.sep}`)) throw new Error(`SSI path escaped dist: ${target}`);
    html = html.replace(include[0], await materialize(target, [...parents, file]));
  }
  return html;
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const base = path.resolve(dist, `.${pathname}`);
    if (!(base === dist || base.startsWith(`${dist}${path.sep}`))) throw new Error('Path escaped dist');
    for (const candidate of [base, path.join(base, 'index.html'), `${base}.html`]) {
      let stat;
      try { stat = await fs.stat(candidate); } catch { continue; }
      if (!stat.isFile()) continue;
      res.setHeader('Content-Type', mime[path.extname(candidate)] || 'application/octet-stream');
      res.end(path.extname(candidate) === '.html' ? await materialize(candidate) : await fs.readFile(candidate));
      return;
    }
    res.writeHead(404).end('Not found');
  } catch (error) {
    console.error(error);
    res.writeHead(500).end('Error');
  }
});

await fs.mkdir(out, { recursive: true });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome', headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const records = [];
const failures = [];
const describe = () => {
  const visible = element => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' &&
      style.visibility !== 'hidden' && style.opacity !== '0';
  };
  const item = element => {
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return {
      text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 80),
      href: element.getAttribute('href'), visible: visible(element),
      width: rect.width, height: rect.height, x: rect.x, y: rect.y
    };
  };
  const bar = document.querySelector('.ss-mobile-actionbar');
  const menu = document.getElementById('ssMainNav');
  return {
    bodyClass: document.body.className,
    scrollWidth: document.scrollingElement.scrollWidth,
    viewport: document.querySelector('meta[name=viewport]')?.content,
    headerHeight: document.querySelector('.ss-site-header')?.getBoundingClientRect().height,
    brand: item(document.querySelector('.ss-brand')),
    headerText: item(document.querySelector('.ss-mobile-header-text')),
    menuButton: item(document.querySelector('.ss-menu-button')),
    reviewStrip: item(document.querySelector('.ss-nav-trust')),
    headerBooking: item(document.querySelector('.ss-nav-cta')),
    menuOpen: menu?.classList.contains('show'),
    menuLinks: [...(menu?.querySelectorAll('a[href]') || [])].filter(visible).map(item),
    current: [...(menu?.querySelectorAll('[aria-current="page"]') || [])].filter(visible).map(item),
    dropdownToggleVisible: [...(menu?.querySelectorAll('.dropdown-toggle') || [])].some(visible),
    dropdownLinksVisible: [...(menu?.querySelectorAll('.dropdown-item') || [])].filter(visible).length,
    dropdownStyles: [...(menu?.querySelectorAll('.dropdown-menu') || [])].map(element => ({
      className: element.className,
      display: getComputedStyle(element).display,
      visibility: getComputedStyle(element).visibility,
      opacity: getComputedStyle(element).opacity,
      height: element.getBoundingClientRect().height,
      parentDisplay: getComputedStyle(element.parentElement).display
    })),
    bar: item(bar),
    barStyle: bar ? {
      className: bar.className,
      display: getComputedStyle(bar).display,
      opacity: getComputedStyle(bar).opacity,
      visibility: getComputedStyle(bar).visibility
    } : null,
    barLinks: [...(bar?.querySelectorAll('a') || [])].filter(visible).map(item),
    duplicateBarsVisible: [...document.querySelectorAll('.ss-mobile-sticky-cta, .mobile-sticky-cta, .ss-mobile-sticky-action')].filter(visible).length,
    footerVisible: visible(document.querySelector('footer')),
    submitVisible: [...document.querySelectorAll('main form button[type="submit"], main form input[type="submit"]')].some(visible)
  };
};

try {
  for (const route of routes) {
    const slug = route === '/' ? 'home' : route.slice(1).replaceAll('/', '--');
    for (const width of widths) {
      const mobile = width < 768;
      const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: mobile, hasTouch: mobile });
      await context.route('**/*', request => new URL(request.request().url()).origin === origin ? request.continue() : request.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(350);
      const initial = await page.evaluate(describe);
      await page.screenshot({ path: path.join(out, `${slug}-${width}-top.png`) });

      let menu = null;
      let footer = null;
      let form = null;
      if (mobile) {
        await page.locator('.ss-menu-button').click();
        await page.waitForTimeout(100);
        menu = await page.evaluate(describe);
        await page.screenshot({ path: path.join(out, `${slug}-${width}-menu.png`) });
        await page.locator('.ss-menu-button').click();
        await page.locator('footer').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        footer = await page.evaluate(describe);
        const submit = page.locator('main form button[type="submit"]:visible, main form input[type="submit"]:visible').first();
        if (await submit.count()) {
          await submit.scrollIntoViewIfNeeded();
          await page.waitForTimeout(100);
          form = await page.evaluate(describe);
        }
      }
      const record = { route, width, status: response?.status(), initial, menu, footer, form, errors };
      records.push(record);
      if (record.status !== 200 || errors.length || initial.scrollWidth > width) failures.push({ route, width, reason: 'navigation, script, or overflow' });
      if (mobile) {
        if (!initial.headerText?.visible || !initial.menuButton?.visible || initial.reviewStrip?.visible || initial.headerBooking?.visible) failures.push({ route, width, reason: 'mobile header' });
        if (!menu?.menuOpen || menu.dropdownToggleVisible || !menu.dropdownLinksVisible || menu.menuLinks.some(link => link.width < 44 || link.height < 44)) failures.push({ route, width, reason: 'mobile menu' });
        if (route === '/' || route === '/visit' || route === '/free-bjj-intro-tannersville-ny' || route === '/options-pricing' || route === '/programs') {
          if (initial.barLinks.map(link => link.text).join('|') !== 'Text Sandy|Reserve Free Intro' || initial.duplicateBarsVisible || menu.bar?.visible || footer.bar?.visible || form?.bar?.visible) failures.push({ route, width, reason: 'funnel bar' });
        }
      } else if (initial.headerText?.visible || initial.bar?.visible) failures.push({ route, width, reason: 'desktop visibility' });
      await context.close();
    }
  }
  await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({ records, failures }, null, 2) + '\n');
  console.log(JSON.stringify({ captures: records.length, failures }));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
