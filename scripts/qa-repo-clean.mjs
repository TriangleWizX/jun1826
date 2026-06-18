import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const LARGE_TMP_BYTES = 5 * 1024 * 1024;

const TRACKED_BLOCKLIST = [
  { re: /(^|\/)__pycache__(\/|$)/, reason: 'Python cache directory should not be tracked.' },
  { re: /\.pyc$/i, reason: 'Python bytecode should not be tracked.' },
  { re: /(^|\/)\.DS_Store$/i, reason: 'macOS Finder metadata should not be tracked.' },
  { re: /^tmp\/qa-[^/]+/i, reason: 'QA temp artifacts under tmp/qa-* should not be tracked.' },
  { re: /^tmp\/[^/]+\.(csv|html|png|jpg|jpeg|webp|log|json)$/i, reason: 'Top-level tmp report/media artifact should not be tracked.' }
];

const KNOWN_SOURCE_ROOTS = [
  'blog/',
  'near/',
  '_includes/',
  'assets/',
  'docs/',
  'tools/',
  'scripts/'
];

const listTrackedFiles = () => {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
  return out.split('\0').filter(Boolean);
};

const listUntracked = () => {
  const out = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
  return out
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.startsWith('?? '))
    .map((line) => line.slice(3));
};

const findTrackedViolations = (files) => {
  const violations = [];
  for (const file of files) {
    for (const rule of TRACKED_BLOCKLIST) {
      if (rule.re.test(file)) {
        violations.push({ file, reason: rule.reason });
      }
    }
  }
  return violations;
};

const listLargeTmpFiles = async () => {
  const tmpDir = path.join(ROOT, 'tmp');
  const large = [];
  let entries = [];

  try {
    entries = await fs.readdir(tmpDir, { withFileTypes: true });
  } catch {
    return large;
  }

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const rel = `tmp/${entry.name}`;
    const full = path.join(tmpDir, entry.name);
    const stat = await fs.stat(full);
    if (stat.size >= LARGE_TMP_BYTES) {
      large.push({ file: rel, size: stat.size });
    }
  }

  return large.sort((a, b) => b.size - a.size);
};

const formatBytes = (n) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = n;
  let idx = 0;
  while (v >= 1024 && idx < units.length - 1) {
    v /= 1024;
    idx += 1;
  }
  return `${v.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const main = async () => {
  const tracked = listTrackedFiles();
  const untracked = listUntracked();
  const trackedViolations = findTrackedViolations(tracked);
  const largeTmp = await listLargeTmpFiles();

  let hasFailure = false;

  console.log('qa-repo-clean report');
  console.log(`- tracked files scanned: ${tracked.length}`);
  console.log(`- untracked paths currently visible: ${untracked.length}`);
  console.log(`- known source roots allowlist: ${KNOWN_SOURCE_ROOTS.join(', ')}`);

  if (trackedViolations.length) {
    hasFailure = true;
    console.error(`\nFAIL: tracked artifact policy violations (${trackedViolations.length})`);
    for (const v of trackedViolations.slice(0, 50)) {
      console.error(`- ${v.file}: ${v.reason}`);
    }
    if (trackedViolations.length > 50) {
      console.error(`... ${trackedViolations.length - 50} more`);
    }
    console.error('Fix: git rm --cached <path> and ensure .gitignore covers this pattern.');
  } else {
    console.log('\nPASS: no blocked tracked artifacts found.');
  }

  if (largeTmp.length) {
    console.warn(`\nWARN: large files in tmp/ (${largeTmp.length})`);
    for (const item of largeTmp.slice(0, 30)) {
      console.warn(`- ${item.file} (${formatBytes(item.size)})`);
    }
    if (largeTmp.length > 30) {
      console.warn(`... ${largeTmp.length - 30} more`);
    }
    console.warn('Action: keep tmp files untracked; move durable assets into source directories only.');
  } else {
    console.log('\nPASS: no large tmp/ files detected.');
  }

  if (hasFailure) {
    process.exit(1);
  }
};

main().catch((error) => {
  console.error(`qa-repo-clean failed: ${error.message}`);
  process.exit(1);
});
