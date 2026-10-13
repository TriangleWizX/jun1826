import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const scheduleHtml = fs.readFileSync(path.join(root, 'dist/schedule/index.html'), 'utf8');
const bookingHtml = fs.readFileSync(path.join(root, 'dist/free-bjj-intro-tannersville-ny/index.html'), 'utf8');
const calendarScript = fs.readFileSync(path.join(root, 'src/assets/js/schedule-month-calendar.js'), 'utf8');
const bookingScript = fs.readFileSync(path.join(root, 'js/progressive-booking.js'), 'utf8');
const calendarCss = fs.readFileSync(path.join(root, 'src/assets/css/pages/schedule-month-calendar.css'), 'utf8');
const localParts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
const localValue = (type) => Number(localParts.find((part) => part.type === type).value);
const target = new Date(Date.UTC(localValue('year'), localValue('month') - 1, localValue('day') + 1));
while ([0, 6].includes(target.getUTCDay())) target.setUTCDate(target.getUTCDate() + 1);
const targetDate = target.toISOString().slice(0, 10);
const executable = process.env.CHROME_PATH || (fs.existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/google-chrome');
const browser = await chromium.launch({ executablePath: executable, headless: true, args: ['--no-sandbox', '--disable-crash-reporter', '--disable-dev-shm-usage'] });

try {
  const schedulePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await schedulePage.setContent(scheduleHtml.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, ''));
  await schedulePage.addStyleTag({ content: calendarCss });
  await schedulePage.addScriptTag({ content: calendarScript });
  let targetButton = schedulePage.locator(`[data-calendar-date="${targetDate}"]`);
  for (let monthShift = 0; !(await targetButton.count()) && monthShift < 2; monthShift++) {
    await schedulePage.locator('[data-calendar-next]').click();
    targetButton = schedulePage.locator(`[data-calendar-date="${targetDate}"]`);
  }
  await targetButton.click();
  const classLinks = schedulePage.locator(`td:has([data-calendar-date="${targetDate}"]) .ss-date-class-link`);
  assert.equal(await classLinks.count(), 2, 'Each regular class on the selected date must be directly clickable');
  const links = await classLinks.evaluateAll((elements) => elements.map((element) => ({ href: element.href, height: element.getBoundingClientRect().height })));
  const youthLink = new URL(links.find((link) => new URL(link.href, 'https://senseisandy.com').searchParams.get('lane') === 'youth').href, 'https://senseisandy.com');
  const adultLink = new URL(links.find((link) => new URL(link.href, 'https://senseisandy.com').searchParams.get('lane') === 'adult').href, 'https://senseisandy.com');
  for (const url of [youthLink, adultLink]) {
    assert.equal(url.searchParams.get('class_date'), targetDate);
    assert.ok(url.searchParams.get('class_time'));
    assert.ok(url.searchParams.get('class'));
  }
  assert.ok(links.every((link) => link.height >= 40), 'Mobile class links must have practical tap targets');

  const bookingPage = await browser.newPage();
  await bookingPage.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('https://booking.test/')) return route.fulfill({ contentType: 'text/html', body: bookingHtml });
    if (url === 'https://app.cal.com/embed/embed.js') return route.fulfill({ contentType: 'text/javascript', body: '/* Controlled Cal embed fixture */' });
    return route.abort();
  });
  await bookingPage.goto(`${youthLink.href.replace('https://senseisandy.com', 'https://booking.test')}`);
  await bookingPage.evaluate(() => {
    window.__calCalls = [];
    const api = (action, config) => window.__calCalls.push({ action, config });
    window.Cal = () => {};
    window.Cal.ns = { 'first-visit': api };
  });
  await bookingPage.addScriptTag({ content: bookingScript });
  await bookingPage.locator('[data-choice-status]').waitFor({ state: 'visible' });
  assert.match(await bookingPage.locator('[data-choice-status]').innerText(), /Choose Child or Teen/);
  await bookingPage.locator('[data-profile="child"]').click();
  await bookingPage.locator('[data-calendar-context]').waitFor();
  await bookingPage.waitForFunction(() => window.__calCalls.some((entry) => entry.action === 'inline'));
  const inline = await bookingPage.evaluate(() => window.__calCalls.find((entry) => entry.action === 'inline'));
  assert.equal(inline.config.config.audience_lane, 'child');
  const expectedClassDate = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(target);
  assert.ok(inline.config.config.notes.includes(`${expectedClassDate} at 5:00 PM`));
  assert.match(await bookingPage.locator('[data-calendar-context]').innerText(), /Requested class: Kids and teens/);
  console.log('Schedule booking handoff QA passed: mobile class links carry lane/date/time, youth choice remains explicit, and Cal receives the requested class in notes.');
} finally {
  await browser.close();
}
