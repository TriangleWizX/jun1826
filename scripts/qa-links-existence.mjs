import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  iterHtmlFiles,
  isSkippableHref,
  loadJson,
  parseAnchorHrefs,
  resolveHref,
  readHtmlWithSsi,
  writeCsv
} from './url-qa-lib.mjs';

const DEFAULT_REPORT = 'crawl-reports/links-existence.csv';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = { report: DEFAULT_REPORT };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--report') {
      out.report = args[i + 1] || out.report;
      i += 1;
    }
  }

  return out;
};

const CUSTOM_INTERNAL_REWRITES = {
  '/calendar/private-4pm.ics': '/assets/calendar/private-lessons-4pm.ics',
  '/calendar/youth-5pm.ics': '/assets/calendar/youth-class-5pm.ics',
  '/calendar/adult-6pm.ics': '/assets/calendar/adult-class-6pm.ics',
  '/calendar/saturday.ics': '/assets/calendar/saturday-block.ics'
};

const loadPolicy = async () => {
  const [contract, legacy] = await Promise.all([
    loadJson('config/url-contract.json'),
    loadJson('config/legacy-redirects.json')
  ]);

  const redirects = legacy && typeof legacy.redirects === 'object' ? legacy.redirects : {};
  const legacySet = new Set(Object.keys(redirects));

  return { contract, legacySet };
};

const checkExists = async (normalizedPath) => {
  let decoded = decodeURIComponent(normalizedPath);
  if (CUSTOM_INTERNAL_REWRITES[decoded]) {
    decoded = CUSTOM_INTERNAL_REWRITES[decoded];
  }

  // 1. Direct file check (e.g. /robots.txt -> robots.txt, /assets/images/logo.png -> assets/images/logo.png)
  const pathDirect = path.join(ROOT, decoded);
  try {
    const statDirect = await fs.stat(pathDirect);
    if (statDirect.isFile()) return true;
  } catch {}

  // 2. Hybrid location routing (e.g. /adult-bjj -> adult-bjj.html)
  // Only apply if there is no file extension (to avoid checking /images/logo.png.html)
  if (!path.extname(decoded)) {
    const pathHtml = path.join(ROOT, `${decoded}.html`);
    try {
      const statHtml = await fs.stat(pathHtml);
      if (statHtml.isFile()) return true;
    } catch {}

    // 3. Directory index check (e.g. /bjj-glossary/ankle-lock -> bjj-glossary/ankle-lock/index.html)
    const pathIndex = path.join(ROOT, decoded, 'index.html');
    try {
      const statIndex = await fs.stat(pathIndex);
      if (statIndex.isFile()) return true;
    } catch {}
  }

  return false;
};

const main = async () => {
  const { report } = parseArgs();
  const { contract, legacySet } = await loadPolicy();
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');

  if (!canonicalOrigin) {
    throw new Error('config/url-contract.json is missing canonicalOrigin.');
  }

  const files = await iterHtmlFiles(ROOT);
  const violations = new Map();

  const addViolation = ({ url, source, error }) => {
    const key = `${error}|${url}`;
    const existing = violations.get(key) || {
      sources: new Set()
    };
    existing.sources.add(source);
    violations.set(key, existing);
  };

  for (const relPath of files) {
    const html = await readHtmlWithSsi(relPath);

    for (const href of parseAnchorHrefs(html)) {
      if (isSkippableHref(href)) continue;

      const resolved = resolveHref({
        href,
        sourceRelPath: relPath,
        baseOrigin: canonicalOrigin,
        contract
      });
      if (!resolved) continue;

      // Only check internal links
      if (!resolved.isInternal) continue;

      const targetPath = resolved.normalizedPath;
      const exists = await checkExists(targetPath);

      if (!exists && !legacySet.has(targetPath)) {
        addViolation({
          url: resolved.canonicalAbsoluteUrl,
          source: relPath,
          error: 'broken_internal_link_404'
        });
      }
    }
  }

  const rows = [];
  for (const [key, value] of violations.entries()) {
    const [error, url] = key.split('|');
    const sourceList = [...value.sources].sort();
    
    for (const src of sourceList) {
      rows.push([
        url,
        '404',
        '', // location
        String(value.sources.size),
        src,
        error
      ]);
    }
  }

  // Sort rows for stable output
  rows.sort((a, b) => `${a[4]}|${a[0]}`.localeCompare(`${b[4]}|${b[0]}`));

  await writeCsv({
    path: report,
    headers: ['url', 'status_code', 'location', 'source_count', 'sample_source', 'error'],
    rows
  });

  if (rows.length) {
    console.error(`qa-links-existence failed with ${rows.length} broken link instance(s).`);
    for (const row of rows.slice(0, 30)) {
      console.error(`- BROKEN LINK: ${row[0]} found in ${row[4]}`);
    }
    if (rows.length > 30) {
      console.error(`... ${rows.length - 30} more broken link instance(s)`);
    }
    process.exit(1);
  }

  console.log(`qa-links-existence passed. Report written to ${report}`);
};

main().catch((error) => {
  console.error(`qa-links-existence failed: ${error.message}`);
  process.exit(1);
});
