import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SKIP_DIRS = new Set([
  '.git',
  'node_modules',
  'tmp',
  '.codex',
  '.codegraph',
  '.claude',
  '.agents',
  '.antigravitycli'
]);
const SKIP_PATH_PARTS = [
  `${path.sep}tools${path.sep}`,
  `${path.sep}bjj-glossary${path.sep}`,
  `${path.sep}docs${path.sep}`
];
const SKIP_FILES = new Set([
  'footer-include-no-proof.html'
]);
const FILE_EXTENSIONS = new Set(['.html', '.json', '.js', '.mjs', '.md', '.sh', '.txt']);
const CHECKS = [
  { label: '5:30 PM', pattern: /5:30 PM/g },
  { label: 'Before Work BJJ', pattern: /Before Work BJJ/g },
  { label: 'Morning BJJ', pattern: /Morning BJJ/g },
  { label: 'Saturday 10:00 AM', pattern: /Saturday[^.\n]{0,24}10:00 AM/g }
];

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }
    if (!FILE_EXTENSIONS.has(path.extname(entry.name))) continue;
    files.push(fullPath);
  }

  return files;
};

const lineNumberAt = (text, index) => text.slice(0, index).split('\n').length;

const main = async () => {
  const files = await walk(ROOT);
  const findings = [];

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (SKIP_FILES.has(rel)) continue;
    if (SKIP_PATH_PARTS.some((segment) => file.includes(segment))) continue;
    const text = await fs.readFile(file, 'utf8');
    for (const check of CHECKS) {
      check.pattern.lastIndex = 0;
      let match;
      while ((match = check.pattern.exec(text))) {
        findings.push(`${rel}:${lineNumberAt(text, match.index)} ${check.label}`);
      }
    }
  }

  if (!findings.length) {
    console.log('Schedule literal QA passed.');
    return;
  }

  console.error('Stale schedule literals found:');
  for (const finding of findings) console.error(finding);
  process.exitCode = 1;
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
