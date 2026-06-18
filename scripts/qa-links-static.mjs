import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  iterHtmlFiles,
  isSkippableHref,
  loadJson,
  parseAnchorHrefs,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const DEFAULT_REPORT = 'crawl-reports/internal-links-3xx.csv';
const TRACKING_QUERY_KEYS = new Set(['src', 'ref', 'loc', 'gclid', 'fbclid', 'msclkid']);
const EXTERNAL_DIRECT_LINK_RULES = [
  {
    pattern: /^https:\/\/www\.nata\.org\/sites\/default\/files\/FluidReplacementsForAthletes\.pdf$/i,
    expected: 'https://www.nata.org/sites/default/files/2025-08/FluidReplacementsForAthletes.pdf'
  },
  {
    pattern: /^https:\/\/www\.iwuf\.org\/en\/sport-wushu\/competitive-wushu\/sanda$/i,
    expected: 'https://www.iwuf.org/en/sport-wushu/competitive-wushu/sanda/'
  },
  {
    pattern: /^https:\/\/link\.springer\.com\/content\/pdf\/10\.1007\/s40894-025-00271-5\.pdf(?:\?.*)?$/i,
    expected: 'https://link.springer.com/article/10.1007/s40894-025-00271-5'
  },
  {
    pattern: /^https:\/\/ibjjf\.com\/rails\/active_storage\/blobs\/redirect\//i,
    expected: 'https://ibjjf.com/graduation-system'
  },
  {
    pattern: /^https:\/\/waterdata\.usgs\.gov\/monitoring-location\/01362250\/?$/i,
    expected: 'https://waterdata.usgs.gov/monitoring-location/USGS-01362250/'
  }
];

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

const loadPolicy = async () => {
  const [contract, legacy] = await Promise.all([
    loadJson('config/url-contract.json'),
    loadJson('config/legacy-redirects.json')
  ]);

  const redirects = legacy && typeof legacy.redirects === 'object' ? legacy.redirects : {};
  const legacySet = new Set(Object.keys(redirects));

  const trailingAllowRaw = new Set(
    Array.isArray(contract.trailingSlashAllowlist)
      ? contract.trailingSlashAllowlist.map((value) => String(value || '').trim())
      : []
  );

  return { contract, redirects, legacySet, trailingAllowRaw };
};

const violationToRow = ({ key, value, canonicalOrigin }) => {
  const [error, url] = key.split('|');
  const location =
    error === 'legacy_redirect_source'
      ? value.expectedLocation
      : value.expectedLocation || '';

  return [
    url,
    'STATIC',
    location,
    String(value.sources.size),
    [...value.sources][0] || '',
    error
  ];
};

const hasInternalTrackingQuery = (url) => {
  if (!url || !url.searchParams) return false;
  for (const key of url.searchParams.keys()) {
    const normalized = String(key || '').toLowerCase();
    if (normalized.startsWith('utm_') || TRACKING_QUERY_KEYS.has(normalized)) {
      return true;
    }
  }
  return false;
};

const getQueryParamCount = (url) => {
  if (!url || !url.searchParams) return 0;
  let count = 0;
  for (const _ of url.searchParams.keys()) {
    count += 1;
  }
  return count;
};

const getExternalDirectLinkExpected = (urlValue) => {
  const normalized = String(urlValue || '').trim();
  for (const rule of EXTERNAL_DIRECT_LINK_RULES) {
    if (rule.pattern.test(normalized)) return rule.expected;
  }
  return '';
};

const main = async () => {
  const { report } = parseArgs();
  const { contract, redirects, legacySet, trailingAllowRaw } = await loadPolicy();
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');

  if (!canonicalOrigin) {
    throw new Error('config/url-contract.json is missing canonicalOrigin.');
  }

  const files = await iterHtmlFiles(ROOT);
  const violations = new Map();

  const addViolation = ({ error, url, source, expectedLocation = '' }) => {
    const key = `${error}|${url}`;
    const existing = violations.get(key) || {
      expectedLocation,
      sources: new Set()
    };
    existing.sources.add(source);
    if (expectedLocation && !existing.expectedLocation) {
      existing.expectedLocation = expectedLocation;
    }
    violations.set(key, existing);
  };

  for (const relPath of files) {
    const fullPath = path.join(ROOT, relPath);
    const html = await fs.readFile(fullPath, 'utf8');

    for (const href of parseAnchorHrefs(html)) {
      if (isSkippableHref(href)) continue;

      const resolved = resolveHref({
        href,
        sourceRelPath: relPath,
        baseOrigin: canonicalOrigin,
        contract
      });
      if (!resolved) continue;

      if (!resolved.isInternal) {
        const expectedExternal = getExternalDirectLinkExpected(
          `${resolved.url.origin}${resolved.url.pathname}${resolved.url.search}`
        );
        if (expectedExternal) {
          addViolation({
            error: 'external_redirect_source_must_be_direct',
            url: `${resolved.url.origin}${resolved.url.pathname}${resolved.url.search}`,
            source: relPath,
            expectedLocation: expectedExternal
          });
        }
        continue;
      }

      if (hasInternalTrackingQuery(resolved.url)) {
        addViolation({
          error: 'internal_tracking_params',
          url: `${canonicalOrigin}${resolved.url.pathname}${resolved.url.search}`,
          source: relPath,
          expectedLocation: `${canonicalOrigin}${resolved.normalizedPath}`
        });
      }

      if (getQueryParamCount(resolved.url) > 3) {
        addViolation({
          error: 'internal_query_param_count_exceeds_3',
          url: `${canonicalOrigin}${resolved.url.pathname}${resolved.url.search}`,
          source: relPath,
          expectedLocation: `${canonicalOrigin}${resolved.normalizedPath}`
        });
      }

      if (resolved.isAbsolute && resolved.url.origin !== canonicalOrigin) {
        addViolation({
          error: 'non_canonical_origin',
          url: `${resolved.url.origin}${resolved.url.pathname}${resolved.url.search}`,
          source: relPath,
          expectedLocation: `${canonicalOrigin}${resolved.normalizedPath}${resolved.url.search}`
        });
      }

      if (
        resolved.trailingSlash
        && resolved.normalizedPath !== '/'
        && !trailingAllowRaw.has(resolved.url.pathname)
        && !trailingAllowRaw.has(resolved.normalizedPath)
      ) {
        addViolation({
          error: 'trailing_slash_non_root',
          url: `${canonicalOrigin}${resolved.url.pathname}${resolved.url.search}`,
          source: relPath,
          expectedLocation: `${canonicalOrigin}${resolved.normalizedPath}${resolved.url.search}`
        });
      }

      if (legacySet.has(resolved.normalizedPath)) {
        addViolation({
          error: 'legacy_redirect_source',
          url: `${canonicalOrigin}${resolved.normalizedPath}`,
          source: relPath,
          expectedLocation: `${canonicalOrigin}${redirects[resolved.normalizedPath] || ''}`
        });
      }
    }
  }

  const rows = [...violations.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => violationToRow({ key, value, canonicalOrigin }));

  await writeCsv({
    path: report,
    headers: ['url', 'status_code', 'location', 'source_count', 'sample_source', 'error'],
    rows
  });

  if (rows.length) {
    console.error(`qa-links-static failed with ${rows.length} issue(s).`);
    for (const row of rows.slice(0, 30)) {
      console.error(`- ${row[5]} :: ${row[0]} (sample: ${row[4]})`);
    }
    if (rows.length > 30) {
      console.error(`... ${rows.length - 30} more issue(s)`);
    }
    process.exit(1);
  }

  console.log(`qa-links-static passed. Report written to ${report}`);
};

main().catch((error) => {
  console.error(`qa-links-static failed: ${error.message}`);
  process.exit(1);
});
