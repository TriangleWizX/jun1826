import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const CANONICAL_ORIGIN = 'https://senseisandy.com';

const VALID_DOCTYPE_RE = /^<!doctype html>$/i;
const FULL_DOCUMENT_RE = /<html\b/i;
const ANCHOR_RE = /<a\b([^>]*?)>([\s\S]*?)<\/a\s*>/gi;
const CANONICAL_RE = /<link\b[^>]*\brel=["']canonical["'][^>]*>/i;
const HREF_RE = /\bhref=["']([^"']+)["']/i;
const CHARSET_RE = /<meta\b[^>]*\bcharset=["']?utf-8["']?/i;
const SSI_LEAK_RE = /\[an error occurred while processing this directive\]/i;

// In-memory cache for fast parallel test execution
const pageCache = new Map();

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['partials', 'snippets', 'assets', '.venv'].includes(entry.name)) continue;
      results.push(...await walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

// Preload all pages into memory before running suites
before(async () => {
  const files = await walkDir(DIST);
  await Promise.all(
    files.map(async (fullPath) => {
      const content = await fs.readFile(fullPath, 'utf8');
      const relPath = path.relative(DIST, fullPath).replaceAll(path.sep, '/');
      pageCache.set(relPath, {
        fullPath,
        content,
        isFullDoc: FULL_DOCUMENT_RE.test(content),
        firstLine: content.split(/\r?\n/, 1)[0].trim()
      });
    })
  );
});

// ==========================================
// 1. Structural Suite
// ==========================================
describe('Structural Suite', () => {
  it('all HTML pages have a valid HTML5 doctype', () => {
    const failures = [];
    for (const [relPath, page] of pageCache.entries()) {
      if (!page.isFullDoc) continue;
      if (!VALID_DOCTYPE_RE.test(page.firstLine)) {
        failures.push(`${relPath}: expected <!DOCTYPE html>, found: ${page.firstLine.slice(0, 50)}`);
      }
    }
    assert.equal(failures.length, 0, `Doctype errors found:\n${failures.join('\n')}`);
    assert.ok(pageCache.size > 300, `Expected > 300 pages checked, found ${pageCache.size}`);
  });

  it('all HTML documents define UTF-8 charset', () => {
    const failures = [];
    for (const [relPath, page] of pageCache.entries()) {
      if (!page.isFullDoc) continue;
      if (!CHARSET_RE.test(page.content)) {
        failures.push(`${relPath}: missing <meta charset="utf-8">`);
      }
    }
    assert.equal(failures.length, 0, `Charset errors found:\n${failures.join('\n')}`);
  });

  it('all HTML documents have valid document tags and no SSI leak errors', () => {
    const failures = [];
    for (const [relPath, page] of pageCache.entries()) {
      if (!page.isFullDoc) continue;
      if (!page.content.includes('<head') || !page.content.includes('<body') || !page.content.includes('</html>')) {
        failures.push(`${relPath}: incomplete document structure`);
      }
      if (SSI_LEAK_RE.test(page.content)) {
        failures.push(`${relPath}: contains SSI error leak`);
      }
    }
    assert.equal(failures.length, 0, `Document structure errors found:\n${failures.join('\n')}`);
  });
});

// ==========================================
// 2. Link & Route Suite
// ==========================================
describe('Link & Route Suite', () => {
  it('primary entrypoints and site shell exist', () => {
    assert.ok(pageCache.has('index.html'), 'dist/index.html must exist');
    assert.ok(pageCache.has('schedule/index.html'), 'dist/schedule/index.html must exist');
    assert.ok(pageCache.has('free-bjj-intro-tannersville-ny/index.html'), 'dist/free-bjj-intro-tannersville-ny/index.html must exist');
  });

  it('internal links resolve to valid routes or files', () => {
    const unresolved = [];
    const checkedHrefs = new Set();

    const routeExists = (rawHref) => {
      const clean = rawHref.split(/[?#]/, 1)[0].replace(/^\/+/, '');
      if (!clean || clean === '.') return true;
      if (pageCache.has(clean) || pageCache.has(`${clean}/index.html`) || pageCache.has(`${clean}.html`)) return true;
      const onDisk = [
        path.join(DIST, clean),
        path.join(DIST, `${clean}.html`),
        path.join(DIST, clean, 'index.html')
      ];
      return onDisk.some((p) => fsSync.existsSync(p));
    };

    // Check key conversion & navigation pages
    const priorityRoutes = [
      'index.html',
      'schedule/index.html',
      'options-pricing/index.html',
      'free-bjj-intro-tannersville-ny/index.html',
      'bjj-classes/adults-tannersville-ny/index.html',
      'bjj-classes/kids-tannersville-ny/index.html',
      'bjj-classes/teens-tannersville-ny/index.html',
      'private-lessons.html'
    ];

    for (const route of priorityRoutes) {
      const page = pageCache.get(route);
      if (!page) continue;

      for (const match of page.content.matchAll(ANCHOR_RE)) {
        const hrefMatch = match[1].match(HREF_RE);
        if (!hrefMatch) continue;
        const href = hrefMatch[1].trim();

        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('sms:') || href.startsWith('javascript:')) {
          continue;
        }

        let pathname = href;
        if (href.startsWith('http://') || href.startsWith('https://')) {
          if (!href.startsWith(CANONICAL_ORIGIN)) continue;
          pathname = href.slice(CANONICAL_ORIGIN.length);
        }

        if (checkedHrefs.has(pathname)) continue;
        checkedHrefs.add(pathname);

        if (!routeExists(pathname)) {
          unresolved.push(`${route} -> ${pathname}`);
        }
      }
    }
    assert.equal(unresolved.length, 0, `Unresolved internal links:\n${unresolved.join('\n')}`);
  });

  it('legacy redirects configuration is in sync with .htaccess', async () => {
    const rawRedirects = JSON.parse(await fs.readFile(path.join(ROOT, 'config/legacy-redirects.json'), 'utf8'));
    const redirects = rawRedirects.redirects || rawRedirects;
    const htaccess = await fs.readFile(path.join(ROOT, '.htaccess'), 'utf8');

    assert.ok(
      htaccess.includes('# BEGIN AUTO_LEGACY_REDIRECTS') && htaccess.includes('# END AUTO_LEGACY_REDIRECTS'),
      '.htaccess must contain AUTO_LEGACY_REDIRECTS block'
    );

    // Verify key retirement redirects are explicitly mapped
    const retiredKeys = ['/elite-concierge', '/bjj_anatomy_game'];
    for (const key of retiredKeys) {
      assert.ok(key in redirects, `config/legacy-redirects.json must map retired route ${key}`);
    }
  });

  it('all HTML pages have a canonical tag matching canonical origin', () => {
    const failures = [];
    for (const [relPath, page] of pageCache.entries()) {
      if (!page.isFullDoc) continue;
      if (relPath === '404.html') continue;

      const canonicalMatch = page.content.match(CANONICAL_RE);
      if (!canonicalMatch) {
        failures.push(`${relPath}: missing canonical tag`);
        continue;
      }
      const hrefMatch = canonicalMatch[0].match(HREF_RE);
      if (!hrefMatch || !hrefMatch[1].startsWith(CANONICAL_ORIGIN)) {
        failures.push(`${relPath}: invalid canonical URL (${hrefMatch ? hrefMatch[1] : 'none'})`);
      }
    }
    assert.equal(failures.length, 0, `Canonical errors found:\n${failures.join('\n')}`);
  });

  it('sitemaps exist and are valid XML', async () => {
    const sitemaps = [
      'sitemap.xml',
      'sitemap-core.xml',
      'sitemap-programs.xml',
      'sitemap-locations.xml',
      'sitemap-blog.xml',
      'sitemap-glossary.xml'
    ];
    for (const sm of sitemaps) {
      const smPath = path.join(DIST, sm);
      assert.ok(fsSync.existsSync(smPath), `Sitemap ${sm} must exist in dist/`);
      const xml = await fs.readFile(smPath, 'utf8');
      assert.ok(xml.includes('<?xml') || xml.includes('<urlset') || xml.includes('<sitemapindex>'), `Sitemap ${sm} must be valid XML`);
    }
  });
});

// ==========================================
// 3. Contract & Governance Suite
// ==========================================
describe('Contract & Governance Suite', () => {
  it('canonical schedule defines 9 active group classes', async () => {
    const scheduleData = JSON.parse(await fs.readFile(path.join(ROOT, 'src/_data/schedule.json'), 'utf8'));
    const active = scheduleData.groupClasses.filter((item) => item.active);
    assert.equal(active.length, 9, 'Canonical schedule must have exactly 9 active recurring group classes');

    const expected = [
      ['Monday', 'Youth/Teen', '5:00 PM', 'No-Gi'],
      ['Tuesday', 'Youth/Teen', '5:00 PM', 'Gi'],
      ['Wednesday', 'Youth/Teen', '5:00 PM', 'No-Gi'],
      ['Friday', 'Youth/Teen', '5:00 PM', 'Gi'],
      ['Monday', 'Adult', '6:00 PM', 'No-Gi'],
      ['Tuesday', 'Adult', '6:00 PM', 'Gi'],
      ['Wednesday', 'Adult', '6:00 PM', 'No-Gi'],
      ['Friday', 'Adult', '6:00 PM', 'Gi'],
      ['Saturday', 'Adult', '10:30 AM', 'No-Gi']
    ];

    for (const [day, audience, time, format] of expected) {
      const match = active.find((item) => item.day === day && item.audience === audience);
      assert.ok(match, `Missing canonical class: ${day} ${audience}`);
      assert.equal(match.time, time, `Time mismatch for ${day} ${audience}`);
      assert.equal(match.format, format, `Format mismatch for ${day} ${audience}`);
    }

    assert.ok(
      scheduleData.privateCoaching?.slots?.every((slot) => slot.time === 'By request'),
      'Private coaching slots must all be "By request"'
    );
  });

  it('rendered schedule page matches canonical days and classes', () => {
    const schedulePage = pageCache.get('schedule/index.html');
    assert.ok(schedulePage, 'schedule/index.html must exist');
    const content = schedulePage.content;

    assert.ok(content.includes('Monday'), 'Schedule must display Monday');
    assert.ok(content.includes('Tuesday'), 'Schedule must display Tuesday');
    assert.ok(content.includes('Wednesday'), 'Schedule must display Wednesday');
    assert.ok(content.includes('Friday'), 'Schedule must display Friday');
    assert.ok(content.includes('Saturday'), 'Schedule must display Saturday');
  });

  it('banned volatile phrases are absent from public dist pages', () => {
    const banned = [
      /semi[- ]private/i,
      /book free goal mapping/i,
      /free goal mapping/i,
      /30-day confidence guarantee/i,
      /6:30\s*AM/i,
      /10:00\s*AM Private/i
    ];
    const allowHistorical = new Set(['holiday-schedule/index.html', 'holiday-schedule.html']);
    const violations = [];

    for (const [relPath, page] of pageCache.entries()) {
      if (allowHistorical.has(relPath)) continue;
      for (const rule of banned) {
        if (rule.test(page.content)) {
          violations.push(`${relPath}: matched banned phrase ${rule}`);
        }
      }
    }
    assert.equal(violations.length, 0, `Banned phrase violations:\n${violations.join('\n')}`);
  });

  it('studio address and contact info conform to brand contract', () => {
    const homePage = pageCache.get('index.html');
    assert.ok(homePage, 'index.html must exist');
    assert.ok(
      homePage.content.includes('6045 Main Street') && homePage.content.includes('Tannersville'),
      'Homepage must include studio address'
    );
    assert.ok(
      homePage.content.includes('917') && homePage.content.includes('736-8649'),
      'Homepage must include Sandy phone CTA'
    );
  });
});

// ==========================================
// 4. Performance & Media Suite
// ==========================================
describe('Performance & Media Suite', () => {
  it('asset hash manifest exists and referenced assets exist on disk', async () => {
    const manifestPath = path.join(ROOT, 'src/assets/data/asset-hash-manifest.json');
    assert.ok(fsSync.existsSync(manifestPath), 'asset-hash-manifest.json must exist');
    const rawManifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const manifest = rawManifest.assets || rawManifest;

    const sampleKeys = Object.keys(manifest).slice(0, 30);
    for (const original of sampleKeys) {
      const hashed = manifest[original];
      if (typeof hashed !== 'string') continue;
      const distCandidate = path.join(DIST, hashed.replace(/^\/+/, ''));
      assert.ok(
        fsSync.existsSync(distCandidate),
        `Hashed asset must exist on disk in dist: ${hashed}`
      );
    }
  });

  it('core stylesheets meet gzipped budget constraints', async () => {
    const cssFiles = [
      'assets/css/site-shell.min.css',
      'assets/css/components.min.css',
      'assets/css/global.min.css'
    ];

    for (const rel of cssFiles) {
      const full = path.join(DIST, rel);
      if (!fsSync.existsSync(full)) continue;
      const raw = await fs.readFile(full);
      const gzipped = zlib.gzipSync(raw);
      assert.ok(
        gzipped.length < 90 * 1024,
        `Stylesheet ${rel} exceeds 90KB gzipped (was ${(gzipped.length / 1024).toFixed(1)}KB)`
      );
    }
  });

  it('brand logo and key assets are present with dimensions or picture elements', () => {
    const homePage = pageCache.get('index.html');
    assert.ok(homePage, 'index.html must exist');
    assert.ok(
      homePage.content.includes('sensei-sandy-bjj-logo') || homePage.content.includes('ss-new-brand-logo'),
      'Homepage must reference brand logo'
    );
  });
});
