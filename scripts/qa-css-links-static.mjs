import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, writeCsv } from './url-qa-lib.mjs';

const DEFAULT_REPORT = 'crawl-reports/css-links-static.csv';
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
const RAW_SS_CSS_PATTERNS = [
  /href\s*=\s*["']\/assets\/css\/ss\.css(?:\?[^"']*)?["']/gi
];

const MIGRATED_CORE_FILES = new Set([
  'index.html',
  'schedule.html',
  'kids.html',
  'teens.html',
  'teen-jiu-jitsu-tannersville-ny.html',
  'adult-bjj.html',
  'adults.html',
  'student-hub.html',
  'options-pricing.html',
  'private-lessons.html',
  'near/template.html'
]);

const isMigratedCoreFile = (relPath) =>
  MIGRATED_CORE_FILES.has(relPath) ||
  /^near\/[^/]+\/index\.html$/.test(relPath) ||
  /^bjj-glossary(?:\/[^/]+)?\/index\.html$/.test(relPath);

const LEGACY_CORE_CSS_PATTERNS = [
  [/href\s*=\s*["']\/assets\/css\/ss\.min\.css(?:\?[^"']*)?["']/gi, 'legacy_ss_min_css_reference'],
  [/href\s*=\s*["']\/assets\/css\/bjj-glossary\.min\.css(?:\?[^"']*)?["']/gi, 'legacy_glossary_min_css_reference'],
  [/href\s*=\s*["']\/assets\/css\/evidence\.min\.css(?:\?[^"']*)?["']/gi, 'legacy_evidence_css_reference'],
  [/href\s*=\s*["']\/assets\/css\/cro\.css(?:\?[^"']*)?["']/gi, 'legacy_cro_css_reference']
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

const findViolationsInContent = (content, relPath) => {
  const violations = [];
  for (const pattern of RAW_SS_CSS_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      violations.push({
        matched: String(match[0] || '').trim(),
        expected: '/assets/css/ss.min.css?v=20260223',
        error: 'raw_ss_css_reference'
      });
    }
  }

  if (!isMigratedCoreFile(relPath)) return violations;

  for (const [pattern, error] of LEGACY_CORE_CSS_PATTERNS) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      violations.push({
        matched: String(match[0] || '').trim(),
        expected: '/assets/css/global.css + /assets/css/components.css + /assets/css/pages/[page].css',
        error
      });
    }
  }
  return violations;
};

const main = async () => {
  const { report } = parseArgs();
  const files = await iterCandidateFiles();
  const rows = [];

  for (const relPath of files) {
    const fullPath = path.join(ROOT, relPath);
    const content = await fs.readFile(fullPath, 'utf8');
    const violations = findViolationsInContent(content, relPath);

    for (const violation of violations) {
      rows.push([
        relPath,
        violation.matched,
        violation.expected,
        violation.error
      ]);
    }
  }

  rows.sort((a, b) => `${a[0]}|${a[1]}`.localeCompare(`${b[0]}|${b[1]}`));

  await writeCsv({
    path: report,
    headers: ['source', 'matched_snippet', 'expected_reference', 'error'],
    rows
  });

  if (rows.length > 0) {
    console.error(`qa-css-links-static failed with ${rows.length} issue(s).`);
    for (const row of rows.slice(0, 40)) {
      console.error(`- ${row[0]} :: ${row[1]}`);
    }
    if (rows.length > 40) {
      console.error(`... ${rows.length - 40} more issue(s)`);
    }
    console.error(`Report: ${report}`);
    process.exit(1);
  }

  console.log(`qa-css-links-static passed. Report written to ${report}`);
};

main().catch((error) => {
  console.error(`qa-css-links-static failed: ${error.message}`);
  process.exit(1);
});
