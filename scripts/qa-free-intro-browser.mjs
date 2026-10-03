// Local rendered-page and youth-consent checks. Every request is fulfilled or
// blocked here; this test cannot send a lead or contact a scheduling provider.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const dist = path.resolve('dist');
const origin = 'https://intro.test';
const output = process.env.INTRO_QA_OUTPUT || '/tmp/free-intro-browser';
fs.mkdirSync(output, { recursive: true });
function resolveFile(urlPath) {
  const base = path.join(dist, decodeURIComponent(urlPath));
  if (!base.startsWith(dist + path.sep) && base !== dist) return null;
  return [base, path.join(base, 'index.html'), base + '.html'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
}
function html(file, seen = new Set()) {
  assert.ok(!seen.has(file), `SSI cycle: ${file}`);
  const visited = new Set([...seen, file]);
  return fs.readFileSync(file, 'utf8').replace(/<!--#include\s+virtual="([^"]+)"\s*-->/g, (_, include) => {
    const target = resolveFile(include);
    assert.ok(target, `Missing SSI: ${include}`);
    return html(target, visited);
  });
}
const browser = await chromium.launch({
  executablePath: fs.existsSync(chromium.executablePath()) ? chromium.executablePath() : '/usr/bin/google-chrome',
  headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const report = { pages: [], missingAssets: [], externalRequestsBlocked: 0, youthConsent: {} };
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  let submitted;
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) { report.externalRequestsBlocked++; return route.abort(); }
    if (url.pathname === '/api/youth-intro/availability') return route.fulfill({ json: { availability: [{classId: 'test-monday-youth', day: 'Monday', startTime: '17:00', status: 'Available'}] } });
    if (url.pathname === '/api/leads') {
      submitted = route.request().postDataJSON();
      return route.fulfill({ status: 201, json: { ok: true } });
    }
    if (url.pathname.startsWith('/api/')) return route.fulfill({ status: 200, json: {} });
    const file = resolveFile(url.pathname);
    if (!file) {
      report.missingAssets.push(url.pathname);
      return route.fulfill({ status: 404, body: '' });
    }
    if (file.endsWith('.html')) return route.fulfill({ contentType: 'text/html', body: html(file) });
    return route.fulfill({ path: file });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const routes = ['/free-bjj-intro-tannersville-ny', '/free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny', '/show-up-kit', '/bjj-classes/adults-tannersville-ny', '/near/windham-ny'];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
      await page.locator('main').first().waitFor();
      const metrics = await page.evaluate(() => ({
        width: innerWidth, scroll: document.documentElement.scrollWidth,
        h1: document.querySelector('h1')?.textContent.trim(),
        title: document.title, canonical: document.querySelector('link[rel="canonical"]')?.href,
        description: document.querySelector('meta[name="description"]')?.content,
        ctas: [...document.querySelectorAll('main a, main button')].filter(n => /free first visit|Text Sandy/i.test(n.textContent) && n.getBoundingClientRect().height > 0).length,
        imagesMissingAlt: [...document.querySelectorAll('main img')].filter(n => !n.hasAttribute('alt')).length,
        fieldsMissingLabel: [...document.querySelectorAll('main input:not([type="hidden"]), main select, main textarea')].filter(n => !n.labels?.length && !n.getAttribute('aria-label')).map(n => n.name)
      }));
      assert.ok(metrics.scroll <= width + 1, `Overflow: ${route} at ${width}`);
      assert.ok(metrics.h1 && metrics.title && metrics.canonical && metrics.description, `SEO fields: ${route}`);
      assert.ok(metrics.ctas > 0, `Visible CTA: ${route}`);
      assert.equal(metrics.imagesMissingAlt, 0, `Image alt: ${route}`);
      assert.deepEqual(metrics.fieldsMissingLabel, [], `Form labels: ${route}`);
      report.pages.push({ route, width, ...metrics });
      if (route === routes[0] || route === routes[1]) await page.screenshot({ path: path.join(output, `${route.slice(1)}-${width}.png`), fullPage: true });
    }
  }
  await page.goto(origin + routes[1]);
  await page.evaluate(() => {
    sessionStorage.setItem('youthIntroData', JSON.stringify({ consent_text_version: 'youth-intro-v1' }));
    sessionStorage.removeItem('youthIntroStep');
  });
  await page.reload();
  assert.equal(await page.locator('[name="consent_text_version"]').inputValue(), 'youth-intro-v2-2026-10-02');
  await page.selectOption('#studentType', 'first_time');
  for (const [id, value] of Object.entries({guardianName: 'Test Parent', studentName: 'Test Child', studentAge: '8', town: 'Tannersville'})) await page.fill('#' + id, value);
  await page.click('#yi-next');
  await page.fill('#email', 'fixture@example.invalid');
  await page.fill('#mobile', '9175550100');
  await page.check('#messageConsent');
  await page.click('#yi-next');
  await page.click('#yi-next');
  await page.fill('#preferredDate', '2026-10-05');
  await page.locator('#classChoice option[value="test-monday-youth"]').waitFor({ state: 'attached' });
  await page.check('#onsite'); await page.check('#arrival');
  await page.click('#yi-next');
  await page.selectOption('#mediaChoice', 'No media');
  await page.check('#reschedule');
  await page.locator('#youth-intro-form button[type="submit"]').click();
  await page.locator('#yi-success').waitFor({ state: 'visible' });
  assert.equal(submitted.consent_text_version, 'youth-intro-v2-2026-10-02');
  assert.equal(submitted.funnel, 'youth_intro');
  assert.equal(submitted.mediaChoice, 'No media');
  assert.match(await page.locator('#yi-success').innerText(), /Wait for his reply before you leave/);
  report.youthConsent = { savedV1CannotReplaceCurrentVersion: true, submittedVersion: submitted.consent_text_version, submissionMocked: true, confirmationPending: true };
  report.pageErrors = [...new Set(errors)];
  assert.deepEqual(report.pageErrors, []);
  report.missingAssets = [...new Set(report.missingAssets)];
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(`Intro browser QA passed: ${report.pages.length} rendered views; labels, metadata, overflow, visible CTAs; restored consent version and mocked youth request. Report: ${output}/report.json`);
} finally { await browser.close(); }
