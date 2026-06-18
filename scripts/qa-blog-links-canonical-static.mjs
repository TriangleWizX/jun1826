import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, writeCsv } from './url-qa-lib.mjs';

const DEFAULT_REPORT = 'crawl-reports/blog-links-canonical-static.csv';
const FILE_EXTENSIONS = new Set(['.html', '.md', '.mdx', '.njk', '.liquid', '.txt']);
const SKIP_DIRS = new Set([
  '.git',
  '.github',
  '.vscode',
  '.tmb',
  'node_modules',
  'crawl-reports',
  'tmp',
  'docs',
  'scripts',
  'tools',
  'config',
  'archive'
]);
const DEFAULT_ALLOWLIST = new Set([
  'scripts/qa-blog-slash-live.mjs'
]);

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    report: DEFAULT_REPORT,
    allowlist: new Set(DEFAULT_ALLOWLIST)
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--report') {
      out.report = args[i + 1] || out.report;
      i += 1;
      continue;
    }
    if (arg === '--allowlist') {
      const raw = String(args[i + 1] || '').trim();
      if (raw) {
        for (const item of raw.split(',')) {
          const normalized = item.trim().replace(/\\/g, '/');
          if (normalized) out.allowlist.add(normalized);
        }
      }
      i += 1;
    }
  }

  return out;
};

const shouldSkipDir = (dirPath) => {
  const parts = dirPath.split(path.sep);
  return parts.some((part) => SKIP_DIRS.has(part));
};

const iterCandidateFiles = async () => {
  const files = [];

  const walk = async (dir) => {
    if (shouldSkipDir(path.relative(ROOT, dir))) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!FILE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
      files.push(path.relative(ROOT, full).replace(/\\/g, '/'));
    }
  };

  await walk(ROOT);
  return files;
};

const toCanonical = (matchedUrl) => {
  const noHash = String(matchedUrl).split('#')[0];
  const qIndex = noHash.indexOf('?');
  const pathname = qIndex >= 0 ? noHash.slice(0, qIndex) : noHash;
  const search = qIndex >= 0 ? noHash.slice(qIndex) : '';
  const canonicalPathname = pathname.replace(/\/+$/, '') || '/';
  return `${canonicalPathname}${search}`;
};

const findViolationsInContent = (content) => {
  const violations = [];
  const patterns = [
    /href\s*=\s*["'](\/blog\/[^"'?#]+\/)([?#][^"']*)?["']/gi,
    /href\s*=\s*["'](https:\/\/senseisandy\.com\/blog\/[^"'?#]+\/)([?#][^"']*)?["']/gi,
    /\]\((\/blog\/[^)\s?#]+\/)([?#][^)]*)?\)/gi,
    /\]\((https:\/\/senseisandy\.com\/blog\/[^)\s?#]+\/)([?#][^)]*)?\)/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const raw = `${match[1]}${match[2] || ''}`;
      violations.push({
        raw,
        canonical: toCanonical(raw)
      });
    }
  }

  return violations;
};

const main = async () => {
  const { report, allowlist } = parseArgs();
  const files = await iterCandidateFiles();
  const rows = [];

  for (const relPath of files) {
    if (allowlist.has(relPath)) continue;
    const fullPath = path.join(ROOT, relPath);
    const content = await fs.readFile(fullPath, 'utf8');
    const violations = findViolationsInContent(content);

    for (const violation of violations) {
      rows.push([
        relPath,
        violation.raw,
        violation.canonical,
        'blog_trailing_slash_internal_link'
      ]);
    }
  }

  rows.sort((a, b) => `${a[0]}|${a[1]}`.localeCompare(`${b[0]}|${b[1]}`));

  await writeCsv({
    path: report,
    headers: ['source', 'matched_url', 'expected_canonical', 'error'],
    rows
  });

  if (rows.length > 0) {
    console.error(`qa-blog-links-canonical-static failed with ${rows.length} issue(s).`);
    for (const row of rows.slice(0, 40)) {
      console.error(`- ${row[0]} :: ${row[1]} -> ${row[2]}`);
    }
    if (rows.length > 40) {
      console.error(`... ${rows.length - 40} more issue(s)`);
    }
    console.error(`Report: ${report}`);
    process.exit(1);
  }

  console.log(`qa-blog-links-canonical-static passed. Report written to ${report}`);
};

main().catch((error) => {
  console.error(`qa-blog-links-canonical-static failed: ${error.message}`);
  process.exit(1);
});
