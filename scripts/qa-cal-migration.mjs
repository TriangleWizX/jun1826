import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

// Follow the generated site's actual script/style dependencies, including dynamic
// local script loaders. Old, unreferenced fingerprint files are not runtime code.
const dist = path.resolve('dist');
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
  if (item.name.startsWith('.') || item.name === 'deprecated') return [];
  const file = path.join(dir, item.name);
  return item.isDirectory() ? walk(file) : [file];
});
const pages = walk(dist).filter((file) => file.endsWith('.html') && !file.includes('/assets/'));
const queue = [...pages];
const active = new Set();
const failures = [];
const missingStyles = new Set();
while (queue.length) {
  const file = queue.pop();
  if (active.has(file)) continue;
  active.add(file);
  const text = fs.readFileSync(file, 'utf8');
  const executable = file.endsWith('.html') ? text.replace(/<!--[\s\S]*?-->/g, '') : text;
  if (/(?:https?:)?\/\/(?:assets\.)?calendly\.com|Calendly\.init(?:Inline|Popup)Widget|bjj-goal-mapping-session/i.test(executable)) failures.push(path.relative(dist, file));
  for (const match of text.matchAll(/["'`]((?:\/(?:js|assets)\/)[^"'`\s<>]+?\.(?:js|css))(?:[?#][^"'`\s<>]*)?["'`]/g)) {
    const dependency = path.join(dist, match[1]);
    if (fs.existsSync(dependency)) queue.push(dependency);
    else if (dependency.endsWith('.css')) missingStyles.add(match[1]);
    else failures.push(`Missing dependency: ${match[1]}`);
  }
}
if (missingStyles.size) console.warn('Existing site CSS gaps (separate from scheduler migration):', [...missingStyles]);
assert.deepEqual(failures, [], 'Active generated dependencies must not load Calendly');
const html = fs.readFileSync(path.join(dist, 'free-bjj-intro-tannersville-ny/index.html'), 'utf8');
assert.match(html, /https:\/\/senseisandy\.com\/free-bjj-intro-tannersville-ny/);
for (const marker of ['pb-step-1', 'pb-step-2', 'pb-step-3', 'booking-reachout-banner', 'booking-faq-title', 'location-parking-title', '/waiver']) assert.ok(html.includes(marker), `Preserve ${marker}`);
assert.ok(html.includes('Sandy will reach out!'), 'Must include Sandy will reach out! banner');
assert.ok(html.includes('sensei-sandy.webp'), 'Must include optimized sensei-sandy image');
assert.doesNotMatch(html, /data-cal-link=/, 'The inline mount must not also act as a Cal popup trigger');

const executablePath = process.env.CHROME_PATH || (fs.existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/google-chrome');
const browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox', '--disable-crash-reporter', '--disable-dev-shm-usage'] });
try {
  const page = await browser.newPage();
  let failLoader = true;
  await page.route('**/*', (route) => route.request().url() === 'https://app.cal.com/embed/embed.js' && !failLoader
    ? route.fulfill({ contentType: 'text/javascript', body: '/* Controlled scheduler fixture; no remote requests. */' })
    : route.abort());
  await page.setContent(html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, ''));
  await page.evaluate(() => {
    window.__events = [];
    window.__calls = [];
    window.__listeners = [];
    window.SS_TRACK_EVENT = (name, payload) => window.__events.push({ name, payload });
    const api = (action, config) => {
      window.__calls.push({ action, config });
      if (action === 'on') window.__listeners.push(config);
      if (action === 'off') window.__listeners = window.__listeners.filter((entry) => entry !== config);
      if (action === 'inline') document.querySelector(config.elementOrSelector).appendChild(document.createElement('iframe'));
    };
    window.Cal = () => {};
    window.Cal.ns = { 'first-visit': api };
    window.__emit = (action, data = {}) => window.__listeners.filter((entry) => entry.action === action).forEach((entry) => entry.callback({ detail: { data, type: action, namespace: 'first-visit' } }));
  });
  await page.addScriptTag({ content: fs.readFileSync('js/progressive-booking.js', 'utf8') });
  await page.locator('[data-profile="adult-beginner"]').click();
  await page.locator('[data-retry-calendar]').waitFor();
  assert.equal(await page.locator('#pb-step-3').isVisible(), false);
  failLoader = false;
  await page.locator('[data-retry-calendar]').click();
  await page.locator('#first-visit-calendar iframe').waitFor();
  await page.evaluate(() => window.__emit('linkReady'));
  assert.equal(await page.locator('[data-calendar-status]').isVisible(), false);
  const calls = await page.evaluate(() => window.__calls);
  const inline = calls.find((entry) => entry.action === 'inline').config;
  assert.equal(inline.calLink, 'senseisandy/first-visit');
  assert.equal(inline.config.useSlotsViewOnSmallScreen, true);
  assert.equal(inline.config.layout, 'month_view');
  assert.equal(inline.config.theme, 'light');
  assert.equal(inline.config.audience_lane, 'adult-beginner');
  const ui = calls.find((entry) => entry.action === 'ui').config;
  assert.equal(ui.hideEventTypeDetails, true);
  assert.equal(ui.cssVarsPerTheme.light['cal-brand'], '#292929');
  await page.locator('[data-back-to="1"]').click();
  await page.locator('[data-profile="family"]').click();
  await page.locator('#first-visit-calendar iframe').waitFor();
  assert.equal(await page.evaluate(() => window.__listeners.length), 3, 'Remount must unsubscribe old listeners');
  await page.evaluate(() => {
    window.dispatchEvent(new MessageEvent('message', { origin: 'https://cal.com.attacker.invalid', data: { type: 'CAL:bookingSuccessful', payload: { booking: { uid: 'forged' } } } }));
    window.__emit('bookingSuccessfulV2', { uid: 'fixture', status: 'PENDING', paymentRequired: false });
  });
  assert.equal(await page.locator('#pb-step-3').isVisible(), false, 'Pending requests must not become confirmed bookings');
  await page.evaluate(() => {
    window.__emit('bookingSuccessfulV2', { uid: 'fixture', status: 'ACCEPTED', paymentRequired: false, email: 'fixture@example.invalid' });
    window.__emit('bookingSuccessfulV2', { uid: 'fixture', status: 'ACCEPTED', paymentRequired: false });
  });
  assert.equal(await page.locator('#pb-step-3').isVisible(), true);
  assert.equal(await page.locator('#booking-reachout-banner').isVisible(), true);
  assert.match(await page.locator('#booking-reachout-banner').innerText(), /Sandy will reach out!/);
  const events = await page.evaluate(() => window.__events);
  for (const name of ['calendly_scheduled', 'booking_complete', 'booking_completed', 'book_intro_submit']) assert.equal(events.filter((entry) => entry.name === name).length, 1, `${name} must fire once`);
  assert.ok(!JSON.stringify(events).includes('fixture'), 'Do not send booking identifiers or attendee data to analytics');
  console.log(`Cal migration QA passed: ${pages.length} generated pages, ${active.size - pages.length} active dependencies; loader recovery, Cal config, lane remount, confirmation, conversion deduplication, and reach-out banner.`);
} finally {
  await browser.close();
}
