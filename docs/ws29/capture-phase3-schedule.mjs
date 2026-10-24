import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'dist');
const out = path.resolve(process.argv[2] || 'docs/ws29/runs/phase3-schedule');
const widths = [360, 390, 430, 640, 767, 768, 1280];
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };

async function materialize(file, parents = []) {
  if (parents.includes(file)) throw new Error(`SSI cycle: ${file}`);
  let html = await fs.readFile(file, 'utf8');
  const includes = [...html.matchAll(/<!--\s*#include\s+(virtual|file)=["']([^"']+)["']\s*-->/g)];
  for (const include of includes) {
    const target = include[1] === 'virtual' ? path.resolve(dist, `.${include[2]}`) : path.resolve(path.dirname(file), include[2]);
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
  } catch (error) { console.error(error); res.writeHead(500).end('Error'); }
});

await fs.mkdir(out, { recursive: true });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const records = [];
const failures = [];

try {
  for (const width of widths) {
    const phone = width < 768;
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: phone, hasTouch: phone });
    await context.route('**/*', request => new URL(request.request().url()).origin === origin ? request.continue() : request.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const response = await page.goto(`${origin}/schedule`, { waitUntil: 'load', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    const initial = await page.evaluate(() => {
      const root = document.querySelector('[data-month-calendar]');
      const table = root.querySelector('.ss-month-grid');
      const mobile = root.querySelector('[data-calendar-mobile-days]');
      const next = root.querySelector('[data-calendar-next-class]');
      const shown = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden'; };
      const rect = e => { const r = e.getBoundingClientRect(); return { width: r.width, height: r.height }; };
      const dateButtons = [...mobile.querySelectorAll('[data-calendar-date]')];
      const classRows = [...mobile.querySelectorAll('.ss-month-mobile-class')].filter(shown);
      const classText = classRows.flatMap(row => [...row.querySelectorAll('strong,span')]);
      const secondaryText = [...mobile.querySelectorAll('small')].filter(shown);
      const links = [...mobile.querySelectorAll('.ss-month-mobile-class a')].filter(shown);
      const date = next.querySelector('time');
      return {
        width: innerWidth, scrollWidth: document.scrollingElement.scrollWidth,
        viewport: document.querySelector('meta[name=viewport]')?.content || '',
        title: document.title, canonical: document.querySelector('link[rel=canonical]')?.href || '',
        h1: document.querySelector('h1')?.textContent.trim() || '',
        tableVisible: shown(table), selectedPanelVisible: shown(root.querySelector('.ss-selected-day')),
        mobileVisible: shown(mobile), mobileDays: dateButtons.length,
        expandedDays: mobile.querySelectorAll('.ss-month-mobile-classes:not([hidden])').length,
        selectedExpanded: mobile.querySelector('.ss-month-mobile-date[aria-pressed=true]')?.getAttribute('aria-expanded') || '',
        minMonthControlWidth: Math.min(...[...root.querySelectorAll('.ss-month-nav button')].map(e => rect(e).width)),
        month: root.querySelector('[data-calendar-month]').textContent.trim(),
        selected: mobile.querySelector('[aria-pressed=true]')?.dataset.calendarDate || '',
        selectedDesktop: table.querySelector('[aria-pressed=true]')?.dataset.calendarDate || '',
        nextVisible: shown(next), nextDate: date?.dateTime || '', nextText: next.textContent.trim(),
        nextBooking: next.querySelector('.ss-class-booking-link')?.getAttribute('href') || '',
        minDateHeight: Math.min(...dateButtons.map(e => rect(e).height)),
        minClassFont: Math.min(...classText.map(e => parseFloat(getComputedStyle(e).fontSize))),
        minSecondaryFont: secondaryText.length ? Math.min(...secondaryText.map(e => parseFloat(getComputedStyle(e).fontSize))) : null,
        minLinkHeight: links.length ? Math.min(...links.map(e => rect(e).height)) : null,
        bookingLinks: mobile.querySelectorAll('.ss-class-booking-link').length,
        programLinks: mobile.querySelectorAll('a:not(.ss-class-booking-link)').length
      };
    });
    await page.screenshot({ path: path.join(out, `schedule-${width}-top.png`) });
    await page.screenshot({ path: path.join(out, `schedule-${width}.png`), fullPage: true });
    const interaction = {};
    const activeSelector = phone ? '.ss-month-mobile-date[aria-pressed="true"]' : '.ss-month-date[aria-pressed="true"]';
    await page.locator(activeSelector).focus();
    await page.keyboard.press('ArrowRight');
    interaction.arrowDate = await page.locator(activeSelector).getAttribute('data-calendar-date');
    interaction.arrowFocus = await page.evaluate(() => document.activeElement?.getAttribute('data-calendar-date') || '');
    const originalMonth = initial.month;
    await page.locator('[data-calendar-next]').click();
    interaction.nextMonth = await page.locator('[data-calendar-month]').textContent();
    interaction.nextMonthDays = await page.locator('[data-calendar-mobile-days] [data-calendar-date]').count();
    await page.locator('[data-calendar-today]').click();
    interaction.returnMonth = await page.locator('[data-calendar-month]').textContent();
    const jump = page.locator('[data-calendar-jump]').first();
    if (await jump.count()) {
      interaction.jumpDate = await jump.getAttribute('data-calendar-jump');
      await jump.click();
      interaction.jumpFocusedDate = await page.evaluate(() => document.activeElement?.getAttribute('data-calendar-date') || '');
      interaction.jumpSelected = await page.locator(phone ? '.ss-month-mobile-date[aria-pressed="true"]' : '.ss-month-date[aria-pressed="true"]').getAttribute('data-calendar-date');
    }
    const record = { width, phone, status: response?.status(), initial, interaction, errors };
    records.push(record);
    if (record.status !== 200 || errors.length || initial.scrollWidth > width) failures.push({ width, reason: 'navigation, page error, or overflow' });
    if (phone && (initial.tableVisible || initial.selectedPanelVisible || !initial.mobileVisible || !initial.nextVisible || initial.mobileDays < 28 || initial.expandedDays !== 1 || initial.selectedExpanded !== 'true' || initial.minMonthControlWidth < 44 || initial.minDateHeight < 44 || initial.minClassFont < 16 || (initial.minSecondaryFont !== null && initial.minSecondaryFont < 14) || (initial.minLinkHeight !== null && initial.minLinkHeight < 44))) failures.push({ width, reason: 'phone card visibility or size' });
    if (!phone && (!initial.tableVisible || initial.mobileVisible || initial.nextVisible)) failures.push({ width, reason: 'desktop schedule layout' });
    if (!initial.nextDate || !initial.nextText || !interaction.arrowDate || interaction.arrowDate !== interaction.arrowFocus || interaction.nextMonth?.trim() === originalMonth || interaction.returnMonth?.trim() !== originalMonth) failures.push({ width, reason: 'next class or date navigation' });
    if (interaction.jumpDate && (interaction.jumpFocusedDate !== interaction.jumpDate || interaction.jumpSelected !== interaction.jumpDate)) failures.push({ width, reason: 'special date jump' });
    await context.close();
  }
  await fs.writeFile(path.join(out, 'summary.json'), JSON.stringify({ records, failures }, null, 2) + '\n');
  console.log(JSON.stringify({ captures: records.length, failures, phoneWidths: records.filter(r => r.phone).map(r => r.width) }));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
