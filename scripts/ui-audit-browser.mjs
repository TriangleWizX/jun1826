import { createServer } from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import playwright from 'playwright';
import { ROOT, readHtmlWithSsi } from './url-qa-lib.mjs';

const CHROME_BIN = process.env.CHROME_BIN || '/snap/bin/chromium';

// Representative sample covering all distinct template types
const TEST_PAGES = [
  { name: 'Homepage', relPath: 'index.html' },
  { name: 'Schedule Page', relPath: 'schedule.html' },
  { name: 'Free Intro Landing', relPath: 'free-bjj-intro-tannersville-ny/index.html' },
  { name: 'Free Intro Kids', relPath: 'free-bjj-intro-tannersville-ny/kids/index.html' },
  { name: 'Free Intro Teens', relPath: 'free-bjj-intro-tannersville-ny/teens/index.html' },
  { name: 'Kids Program', relPath: 'bjj-classes/kids-tannersville-ny/index.html' },
  { name: 'Teens Program', relPath: 'bjj-classes/teens-tannersville-ny/index.html' },
  { name: 'Adults Program', relPath: 'bjj-classes/adults-tannersville-ny/index.html' },
  { name: 'Classes Index', relPath: 'bjj-classes/index.html' },
  { name: 'Options & Pricing', relPath: 'options-pricing.html' },
  { name: 'Contact & Booking Form', relPath: 'contact.html' },
  { name: 'Show Up Kit', relPath: 'show-up-kit.html' },
  { name: 'Student Hub', relPath: 'student-hub.html' },
  { name: 'School Families', relPath: 'school-families-jiu-jitsu.html' },
  { name: 'After School', relPath: 'after-school.html' },
  { name: 'Tactical Longevity', relPath: 'tactical-longevity.html' },
  { name: 'Summer Academy', relPath: 'summer-academy.html' },
  { name: 'Samurai Break', relPath: 'samurai-break.html' },
  { name: 'Scribners', relPath: 'scribners.html' },
  { name: 'Scribners Jiu-Jitsu', relPath: 'scribners-jiu-jitsu.html' },
  { name: 'Rural BJJ Catskills', relPath: 'rural-bjj-catskills.html' },
  { name: 'Reviews Village', relPath: 'reviews-village.html' },
  { name: 'Safety Promise', relPath: 'safety-promise.html' },
  { name: 'Success Stories', relPath: 'success-stories.html' },
  { name: 'Videos Hub', relPath: 'videos.html' },
  { name: 'Waiver', relPath: 'waiver.html' },
  { name: 'Wellness PT Referrals', relPath: 'partners-wellness-pt-referrals.html' },
  { name: 'Location Near Hunter', relPath: 'near/hunter-ny/index.html' },
  { name: 'Location Class Cairo', relPath: 'bjj-classes/cairo-ny/index.html' },
  { name: 'Blog Article', relPath: 'blog/beginner-friendly-bjj-tannersville/index.html' },
  { name: 'Blog Index', relPath: 'blog/index.html' },
  { name: 'Glossary Term', relPath: 'bjj-glossary/armbar/index.html' },
  { name: 'Glossary Index', relPath: 'bjj-glossary/index.html' },
  { name: 'BJJ Anatomy Quiz', relPath: 'bjj-anatomy-quiz.html' },
  { name: 'Athlete Cross-Training', relPath: 'athlete-cross-training/index.html' }
];

const VIEWPORTS = [
  // MOBILE VIEWPORTS FIRST
  { name: 'Mobile-360', width: 360, height: 740, isMobile: true },
  { name: 'Mobile-375', width: 375, height: 812, isMobile: true },
  { name: 'Mobile-390', width: 390, height: 844, isMobile: true },
  { name: 'Mobile-414', width: 414, height: 896, isMobile: true },
  // DESKTOP VIEWPORTS SECOND
  { name: 'Desktop-1024', width: 1024, height: 768, isMobile: false },
  { name: 'Desktop-1280', width: 1280, height: 800, isMobile: false },
  { name: 'Desktop-1440', width: 1440, height: 900, isMobile: false },
  { name: 'Desktop-1920', width: 1920, height: 1080, isMobile: false }
];

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
  } catch {
    filePath = path.join(ROOT, safePath);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      return null;
    }
  }
  return filePath;
};

const startServer = () => new Promise((resolve, reject) => {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname.startsWith('/__audit/')) {
        const relPath = url.pathname.replace('/__audit/', '');
        let html = '';
        try {
          html = await readHtmlWithSsi(`dist/${relPath}`);
        } catch {
          html = await readHtmlWithSsi(relPath);
        }
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

async function runAudit() {
  const { server, port } = await startServer();
  console.log(`Audit server running on http://127.0.0.1:${port}`);

  const browser = await playwright.chromium.launch({
    executablePath: CHROME_BIN,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });

  const auditReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`Auditing Viewport: ${vp.name} (${vp.width}x${vp.height})`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile
    });

    const page = await context.newPage();

    for (const pageItem of TEST_PAGES) {
      const jsErrors = [];
      page.on('pageerror', (err) => jsErrors.push(err.message));

      const targetUrl = `http://127.0.0.1:${port}/__audit/${pageItem.relPath}`;
      try {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
      } catch (err) {
        auditReport.push({
          page: pageItem.name,
          relPath: pageItem.relPath,
          viewport: vp.name,
          isMobile: vp.isMobile,
          category: 'Load Error',
          issue: `Failed to load page: ${err.message}`
        });
        continue;
      }

      const findings = await page.evaluate(({ vpWidth, vpHeight, isMobile }) => {
        const results = [];
        const body = document.body;
        const root = document.documentElement;
        if (!body) return results;

        // 1. Horizontal Overflow check
        const scrollW = Math.max(root.scrollWidth, body.scrollWidth);
        const clientW = root.clientWidth;
        if (scrollW > clientW + 1) {
          const overflowEls = [];
          const candidates = document.querySelectorAll('section, main, article, header, footer, div, table, iframe, img, svg, p, h1, h2, h3, .row, [class*="container"]');
          for (const el of candidates) {
            const r = el.getBoundingClientRect();
            if (r.right > clientW + 1.5 && r.width > 0) {
              const tag = el.tagName.toLowerCase();
              const id = el.id ? `#${el.id}` : '';
              const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
              overflowEls.push({
                selector: `${tag}${id}${cls}`,
                right: Math.round(r.right),
                width: Math.round(r.width),
                overflowPx: Math.round(r.right - clientW),
                textSnippet: (el.textContent || '').trim().slice(0, 40)
              });
            }
          }
          results.push({
            category: 'Layout',
            subcategory: 'Horizontal Overflow',
            severity: 'CRITICAL',
            issue: `Horizontal page overflow: scrollWidth (${scrollW}px) > clientWidth (${clientW}px) by +${scrollW - clientW}px`,
            culprits: overflowEls.slice(0, 4)
          });
        }

        // 2. Sticky Overlaps / Obscured Clickables
        const fixedBottom = Array.from(document.querySelectorAll('*')).filter((el) => {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
          if (style.position !== 'fixed' && style.position !== 'sticky') return false;
          const r = el.getBoundingClientRect();
          return r.height >= 30 && r.width >= 100 && r.bottom >= (vpHeight - 15) && r.top < vpHeight;
        });

        if (fixedBottom.length > 0) {
          const barTop = Math.min(...fixedBottom.map(el => el.getBoundingClientRect().top));
          const clickables = Array.from(document.querySelectorAll('a, button, input[type="submit"], input[type="button"], [role="button"]'));
          const blocked = [];
          for (const el of clickables) {
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            if (fixedBottom.some(bar => bar.contains(el))) continue;
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (r.bottom > barTop && r.top < vpHeight && r.top >= 0) {
              const cx = Math.max(1, Math.min(vpWidth - 1, r.left + r.width / 2));
              const cy = Math.max(1, Math.min(vpHeight - 1, r.top + r.height / 2));
              const topEl = document.elementFromPoint(cx, cy);
              if (topEl && !el.contains(topEl) && !topEl.contains(el)) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
                blocked.push({
                  selector: `${tag}${cls}`,
                  text: (el.textContent || el.value || '').trim().slice(0, 40),
                  blockedBy: topEl.tagName.toLowerCase() + (topEl.className && typeof topEl.className === 'string' ? `.${topEl.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '')
                });
              }
            }
          }
          if (blocked.length > 0) {
            results.push({
              category: 'Spacing',
              subcategory: 'Sticky Overlap / Obscured Link',
              severity: 'HIGH',
              issue: `Fixed sticky bar (top=${Math.round(barTop)}px) obscures ${blocked.length} clickable element(s)`,
              blocked: blocked.slice(0, 4)
            });
          }
        }

        // 3. Justification & Text Alignment Issues
        const justifiedEls = [];
        const centeredLongPars = [];
        const textNodes = document.querySelectorAll('p, li, h1, h2, h3, .lead');
        for (const el of textNodes) {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          if (style.textAlign === 'justify') {
            const tag = el.tagName.toLowerCase();
            const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
            justifiedEls.push({
              selector: `${tag}${cls}`,
              text: (el.textContent || '').trim().slice(0, 50)
            });
          }
          if (el.tagName === 'P' && style.textAlign === 'center') {
            const txt = (el.textContent || '').trim();
            const r = el.getBoundingClientRect();
            if (r.height > 55 && txt.length > 130) {
              const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
              centeredLongPars.push({
                selector: `p${cls}`,
                length: txt.length,
                text: txt.slice(0, 50)
              });
            }
          }
        }

        if (justifiedEls.length > 0) {
          results.push({
            category: 'Justification',
            subcategory: 'Text Justify Anti-Pattern',
            severity: 'MEDIUM',
            issue: `${justifiedEls.length} element(s) use 'text-align: justify' causing irregular line gaps`,
            elements: justifiedEls.slice(0, 4)
          });
        }

        if (centeredLongPars.length > 0) {
          results.push({
            category: 'Alignment',
            subcategory: 'Centered Multi-line Paragraph',
            severity: 'LOW',
            issue: `${centeredLongPars.length} multi-line paragraph(s) are center-aligned, degrading readability`,
            elements: centeredLongPars.slice(0, 3)
          });
        }

        // 4. Flex / Grid Container Mismatches
        const containers = document.querySelectorAll('.row, [class*="grid"], [class*="flex"], [class*="bento"], [class*="cards"]');
        const brokenContainers = [];
        for (const c of containers) {
          const style = getComputedStyle(c);
          if (style.display === 'none' || style.visibility === 'hidden') continue;

          if (style.display.includes('flex') && style.flexWrap === 'nowrap' && isMobile) {
            const children = Array.from(c.children).filter(ch => getComputedStyle(ch).display !== 'none');
            if (children.length > 2) {
              const rects = children.map(ch => ch.getBoundingClientRect());
              const minW = Math.min(...rects.map(r => r.width));
              if (minW < 65 && rects.some(r => r.right > vpWidth)) {
                const cls = c.className && typeof c.className === 'string' ? `.${c.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
                brokenContainers.push({
                  selector: `${c.tagName.toLowerCase()}${cls}`,
                  detail: `Flex nowrap on mobile forces compressed items (min-width: ${Math.round(minW)}px)`
                });
              }
            }
          }

          if (style.display.includes('grid')) {
            const cols = style.gridTemplateColumns;
            if (cols && cols.split(' ').length >= 3 && isMobile && vpWidth < 420) {
              const cls = c.className && typeof c.className === 'string' ? `.${c.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
              brokenContainers.push({
                selector: `${c.tagName.toLowerCase()}${cls}`,
                detail: `Grid column template '${cols}' forced on mobile width ${vpWidth}px`
              });
            }
          }
        }

        if (brokenContainers.length > 0) {
          results.push({
            category: 'Layout',
            subcategory: 'Flex/Grid Breakage',
            severity: 'HIGH',
            issue: `${brokenContainers.length} flex/grid container(s) exhibit layout breakage on viewport`,
            containers: brokenContainers.slice(0, 4)
          });
        }

        // 5. HTML [hidden] Attribute Override
        const hiddenEls = document.querySelectorAll('[hidden]');
        const hiddenConflicts = [];
        for (const el of hiddenEls) {
          const style = getComputedStyle(el);
          if (style.display !== 'none') {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
            hiddenConflicts.push({
              selector: `${tag}${id}${cls}`,
              display: style.display
            });
          }
        }

        if (hiddenConflicts.length > 0) {
          results.push({
            category: 'CSS/JS Conflict',
            subcategory: 'HTML [hidden] Attribute Overridden',
            severity: 'HIGH',
            issue: `${hiddenConflicts.length} element(s) with HTML [hidden] attribute overridden to display: ${hiddenConflicts[0].display}`,
            elements: hiddenConflicts
          });
        }

        // 6. Touch Targets < 36px on Mobile
        if (isMobile) {
          const smallTargets = [];
          const targets = document.querySelectorAll('a, button, input[type="submit"], input[type="button"], .ss-btn, .btn');
          for (const el of targets) {
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && (r.height < 36 || r.width < 36)) {
              const tag = el.tagName.toLowerCase();
              const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
              smallTargets.push({
                selector: `${tag}${cls}`,
                text: (el.textContent || el.value || '').trim().slice(0, 30),
                size: `${Math.round(r.width)}x${Math.round(r.height)}px`
              });
            }
          }

          if (smallTargets.length > 0) {
            results.push({
              category: 'Spacing',
              subcategory: 'Touch Target Under 36px',
              severity: 'MEDIUM',
              issue: `${smallTargets.length} interactive touch target(s) are under 36px height/width`,
              targets: smallTargets.slice(0, 4)
            });
          }
        }

        return results;
      }, { vpWidth: vp.width, vpHeight: vp.height, isMobile: vp.isMobile });

      if (jsErrors.length > 0) {
        auditReport.push({
          page: pageItem.name,
          relPath: pageItem.relPath,
          viewport: vp.name,
          isMobile: vp.isMobile,
          category: 'CSS/JS Conflict',
          subcategory: 'JavaScript Error',
          severity: 'HIGH',
          issue: `JavaScript error(s) logged on render: ${jsErrors.slice(0, 2).join('; ')}`
        });
      }

      for (const finding of findings) {
        auditReport.push({
          page: pageItem.name,
          relPath: pageItem.relPath,
          viewport: vp.name,
          isMobile: vp.isMobile,
          ...finding
        });
      }
    }

    await context.close();
  }

  await browser.close();
  server.close();

  await fs.writeFile(path.join(ROOT, 'ui-audit-findings.json'), JSON.stringify(auditReport, null, 2));
  console.log(`\nAudit completed! Total findings logged: ${auditReport.length}`);
}

runAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
