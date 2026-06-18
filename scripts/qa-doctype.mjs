import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const VALID_DOCTYPE = '<!DOCTYPE html>';
const VALID_DOCTYPE_RE = /^<!doctype html>$/i;
const FULL_DOCUMENT_RE = /<html\b/i;
const PAGE_EXTENSIONS = new Set(['.html', '.shtml']);

const rel = (filePath) => path.relative(ROOT, filePath).replaceAll(path.sep, '/');

const isTopLevelPage = async (entry) => {
  if (!entry.isFile()) return false;

  const extension = path.extname(entry.name).toLowerCase();
  if (!PAGE_EXTENSIONS.has(extension)) return false;

  const fullPath = path.join(ROOT, entry.name);
  const source = await fs.readFile(fullPath, 'utf8');
  return FULL_DOCUMENT_RE.test(source);
};

const main = async () => {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });
  const failures = [];
  let checkedCount = 0;

  for (const entry of entries) {
    if (!(await isTopLevelPage(entry))) continue;

    const fullPath = path.join(ROOT, entry.name);
    const source = await fs.readFile(fullPath, 'utf8');
    const firstLine = source.split(/\r?\n/, 1)[0];

    checkedCount += 1;

    if (!VALID_DOCTYPE_RE.test(firstLine)) {
      failures.push(`${rel(fullPath)}: first line must be a valid HTML5 doctype such as ${VALID_DOCTYPE}`);
    }
  }

  if (failures.length) {
    console.error('qa-doctype failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`qa-doctype passed (${checkedCount} top-level HTML documents checked).`);
};

main().catch((error) => {
  console.error(`qa-doctype failed: ${error.message}`);
  process.exit(1);
});
