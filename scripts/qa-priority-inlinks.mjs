import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  iterHtmlFiles,
  isSkippableHref,
  loadJson,
  readHtmlWithSsi,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const REPORT_PATH = 'crawl-reports/priority-inlinks.csv';
const POLICY_PATH = 'data/internal-link-clusters.json';

const parseAnchorTags = (html) => {
  const tags = [];
  const clean = String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const re = /<a\b[^>]*>/gi;
  let m;
  while ((m = re.exec(clean)) !== null) tags.push(m[0]);
  return tags;
};

const parseAttrs = (tag) => {
  const attrs = {};
  const re = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(tag)) !== null) {
    const key = String(m[1] || '').toLowerCase();
    attrs[key] = (m[3] ?? m[4] ?? m[5] ?? '').trim();
  }
  return attrs;
};

const main = async () => {
  const [contract, policy] = await Promise.all([
    loadJson('config/url-contract.json'),
    loadJson(POLICY_PATH)
  ]);

  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  const targets = Array.isArray(policy.priorityTargets) ? policy.priorityTargets : [];
  if (!canonicalOrigin) throw new Error('config/url-contract.json is missing canonicalOrigin.');
  if (!targets.length) throw new Error(`${POLICY_PATH} has no priorityTargets.`);

  const targetMap = new Map();
  for (const row of targets) {
    const pathValue = String(row.path || '').trim();
    const minInlinks = Number(row.minInlinks || 0);
    if (!pathValue || !Number.isFinite(minInlinks) || minInlinks <= 0) continue;
    targetMap.set(pathValue, { minInlinks, inlinks: 0, sources: new Set() });
  }

  const htmlFiles = await iterHtmlFiles(ROOT);

  for (const relPath of htmlFiles) {
    const html = await readHtmlWithSsi(relPath);
    for (const tag of parseAnchorTags(html)) {
      const attrs = parseAttrs(tag);
      const href = String(attrs.href || '').trim();
      if (!href || isSkippableHref(href)) continue;

      const relTokens = String(attrs.rel || '').toLowerCase().split(/\s+/).filter(Boolean);
      if (relTokens.includes('nofollow')) continue;

      const resolved = resolveHref({
        href,
        sourceRelPath: relPath,
        baseOrigin: canonicalOrigin,
        contract
      });
      if (!resolved || !resolved.isInternal) continue;

      const rec = targetMap.get(resolved.normalizedPath);
      if (!rec) continue;
      rec.inlinks += 1;
      rec.sources.add(relPath);
    }
  }

  const rows = [];
  const failures = [];
  for (const [targetPath, rec] of targetMap.entries()) {
    const ok = rec.inlinks >= rec.minInlinks;
    if (!ok) failures.push(`${targetPath} (${rec.inlinks}/${rec.minInlinks})`);
    rows.push([
      `${canonicalOrigin}${targetPath}`,
      String(rec.inlinks),
      String(rec.minInlinks),
      String(rec.sources.size),
      [...rec.sources].slice(0, 6).join('|'),
      ok ? 'pass' : 'fail'
    ]);
  }

  await writeCsv({
    path: REPORT_PATH,
    headers: ['url', 'inlink_count', 'min_required', 'source_count', 'sample_sources', 'status'],
    rows: rows.sort((a, b) => a[0].localeCompare(b[0]))
  });

  if (failures.length) {
    console.error(`qa-priority-inlinks failed with ${failures.length} URL(s) below threshold.`);
    for (const item of failures) console.error(`- ${item}`);
    process.exit(1);
  }

  console.log(`qa-priority-inlinks passed (${rows.length} priority URLs checked).`);
};

main().catch((error) => {
  console.error(`qa-priority-inlinks failed: ${error.message}`);
  process.exit(1);
});
