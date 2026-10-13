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
  const scheduleData = JSON.parse(await schedulePage.locator('[data-month-calendar]').getAttribute('data-schedule'));
  const findDateButton = async (date) => {
    let button = schedulePage.locator(`[data-calendar-date="${date}"]`);
    for (let monthShift = 0; !(await button.count()) && monthShift < 2; monthShift++) {
      await schedulePage.locator('[data-calendar-next]').click();
      button = schedulePage.locator(`[data-calendar-date="${date}"]`);
    }
    return button;
  };
  let youthLink;
  let adultLink;
  for (let offset = 1; offset <= 35; offset++) {
    const date = new Date(target);
    date.setUTCDate(target.getUTCDate() + offset - 1);
    const dateKey = date.toISOString().slice(0, 10);
    const button = await findDateButton(dateKey);
    assert.equal(await button.count(), 1, `Calendar must render ${dateKey}`);
    const closed = scheduleData.closures.some((item) => item.date === dateKey);
    const special = scheduleData.specialEvents.filter((item) => item.date === dateKey);
    const entries = closed ? [] : special.length ? special : [
      ...(dateKey >= scheduleData.season.effectiveDate ? scheduleData.groupClasses.filter((item) => item.active && item.dayOrder === date.getUTCDay()) : []),
      ...scheduleData.datedClasses.filter((item) => item.date === dateKey)
    ];
    const expected = entries.filter((item) => ['Adult', 'Women', 'Youth/Teen'].includes(item.audience) && item.time);
    const linksOnDay = await schedulePage.locator(`td:has([data-calendar-date="${dateKey}"]) .ss-date-class-link`).evaluateAll((elements) => elements.map((element) => ({ href: element.href, height: element.getBoundingClientRect().height })));
    assert.equal(linksOnDay.length, expected.length, `Each bookable class on ${dateKey} must have its own link`);
    for (const link of linksOnDay) {
      const url = new URL(link.href, 'https://senseisandy.com');
      assert.equal(url.searchParams.get('class_date'), dateKey);
      assert.ok(url.searchParams.get('class_time'));
      assert.ok(url.searchParams.get('class'));
      assert.ok(['adult', 'youth'].includes(url.searchParams.get('lane')));
    }
    if (dateKey === targetDate) {
      youthLink = new URL(linksOnDay.find((link) => new URL(link.href, 'https://senseisandy.com').searchParams.get('lane') === 'youth').href, 'https://senseisandy.com');
      adultLink = new URL(linksOnDay.find((link) => new URL(link.href, 'https://senseisandy.com').searchParams.get('lane') === 'adult').href, 'https://senseisandy.com');
      await button.click();
    }
  }
  assert.ok(youthLink && adultLink, 'Upcoming youth and adult classes must have separate links');
  assert.ok((await schedulePage.locator('.ss-date-class-link').evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height))).every((height) => height >= 40), 'Mobile class links must have practical tap targets');

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
