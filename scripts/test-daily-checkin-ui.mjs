import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('dist');
const outDir = path.resolve('tmp/daily-checkin-test');
await fs.mkdir(outDir, { recursive: true });

// Minimal local static server
const server = createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, 'http://local');
    if (reqUrl.pathname === '/api/attendance') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        ok: true,
        attendance: [
          {
            person_id: 'p1',
            first_name: 'Leo',
            last_name: 'Miller',
            phone: '+1 (917) 555-0144',
            session_title: 'Kids BJJ (5:00 PM)'
          },
          {
            person_id: 'p2',
            first_name: 'Maya',
            last_name: 'Rivera',
            phone: '+1 (917) 555-0188',
            session_title: 'Teens BJJ (5:00 PM)'
          }
        ]
      }));
      return;
    }

    let rel = decodeURI(reqUrl.pathname).slice(1) || 'index.html';
    let file = path.join(root, rel);
    try {
      if ((await fs.stat(file)).isDirectory()) {
        rel += '/index.html';
        file = path.join(root, rel);
      }
    } catch {
      if (!path.extname(rel)) {
        rel += '.html';
        file = path.join(root, rel);
      }
    }
    if (!file.startsWith(root + path.sep)) throw Error('Invalid path');

    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.png': 'image/png'
    };
    res.setHeader('Content-Type', mimeTypes[path.extname(rel)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch (err) {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/daily-checkin`;

console.log(`Testing Daily Check-In at: ${url}`);

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const results = [];

try {
  // Viewports to test
  const viewports = [
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-375', width: 375, height: 667 },
    { name: 'desktop-1366', width: 1366, height: 768 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Check tap target sizes on interactive elements
    const buttonHeights = await page.evaluate(() => {
      const controls = Array.from(document.querySelectorAll(
        '.daily-actions button, .daily-field input:not([type="radio"]), .daily-field select, .checkin-context'
      ));
      return controls.map((b) => ({
        tag: b.tagName,
        id: b.id || b.className,
        height: b.getBoundingClientRect().height
      }));
    });

    const smallTapTargets = buttonHeights.filter((b) => b.height < 40);
    if (smallTapTargets.length > 0) {
      console.warn(`[${vp.name}] Found ${smallTapTargets.length} controls below 40px height:`, smallTapTargets);
    }

    // Take baseline screenshot
    const screenshotPath = path.join(outDir, `${vp.name}-baseline.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Interactive form test on 390
    if (vp.name === 'mobile-390') {
      // 1. Auto-fill student via 1-tap roster chip
      const leoChip = page.locator('.roster-chip:has-text("Leo M.")');
      await leoChip.waitFor({ state: 'visible', timeout: 3000 });
      await leoChip.click();

      const studentVal = await page.inputValue('#student');
      const phoneVal = await page.inputValue('#parent-phone');
      if (studentVal !== 'Leo Miller') throw new Error(`Auto-fill student failed: ${studentVal}`);
      if (!phoneVal.includes('0144')) throw new Error(`Auto-fill phone failed: ${phoneVal}`);

      // 2. Select main skill
      await page.selectOption('#main-skill', 'pin_escapes');

      // 3. Click a quick problem chip
      const firstChip = page.locator('.checkin-chip').first();
      await firstChip.click();
      const problemVal = await page.inputValue('#problem');

      // 4. Fill observation and next step
      await page.fill('#observed-action', 'Stayed calm when flattened in side control, framed with both forearms, and recovered half guard.');
      await page.fill('#next-action', 'Bridge hips before turning to create more space.');
      await page.fill('#getting-easier', 'Breathing calmly and not panicking under heavy chest pressure.');

      // 5. Select context by clicking the touch-friendly label
      await page.locator('.checkin-context:has-text("Positional Round")').click();

      // 6. Verify preview reflects inputs
      const previewStudent = await page.textContent('#preview-student');
      const previewSkill = await page.textContent('#preview-skill');
      const previewProblem = await page.textContent('#preview-problem');
      const previewEasier = await page.textContent('#preview-easier');

      if (previewStudent !== 'Leo Miller') throw new Error(`Preview student mismatch: ${previewStudent}`);
      if (!previewSkill.includes('Getting out from bottom')) throw new Error(`Preview skill mismatch: ${previewSkill}`);
      if (previewProblem !== problemVal) throw new Error(`Preview problem mismatch: ${previewProblem}`);
      if (!previewEasier.includes('Breathing calmly')) throw new Error(`Preview easier mismatch: ${previewEasier}`);

      // 7. Click Copy Summary
      await page.click('#copy-summary');
      const saveStatus = await page.textContent('#save-status');
      console.log(`Copy summary status on mobile: "${saveStatus}"`);

      // 8. Take interactive filled screenshot
      const filledPath = path.join(outDir, `${vp.name}-filled.png`);
      await page.screenshot({ path: filledPath, fullPage: true });
    }

    results.push({
      viewport: vp.name,
      consoleErrors: consoleErrors.length,
      screenshot: `${vp.name}-baseline.png`
    });

    await page.close();
  }

  console.log('UI & Interaction Test Results:');
  console.table(results);
} finally {
  await browser.close();
  server.close();
}
