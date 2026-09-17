import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIR = path.join(ROOT, 'dist');
const VALID_DOCTYPE = '<!DOCTYPE html>';
const VALID_DOCTYPE_RE = /^<!doctype html>$/i;
const FULL_DOCUMENT_RE = /<html\b/i;
const PAGE_EXTENSIONS = new Set(['.html', '.shtml']);

const rel = (filePath) => path.relative(ROOT, filePath).replaceAll(path.sep, '/');

const walkHtmlFiles = async (dir) => {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['partials', 'snippets', 'assets', '.venv'].includes(entry.name)) continue;
      files.push(...await walkHtmlFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (PAGE_EXTENSIONS.has(ext)) {
        files.push(fullPath);
      }
    }
  }
  return files;
};

const main = async () => {
  const files = await walkHtmlFiles(TARGET_DIR);
  // Also check top-level root HTML files if any exist
  const rootEntries = await fs.readdir(ROOT, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile() && PAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.join(ROOT, entry.name));
    }
  }

  const failures = [];
  let checkedCount = 0;

  for (const fullPath of files) {
    const source = await fs.readFile(fullPath, 'utf8');
    if (!FULL_DOCUMENT_RE.test(source)) continue;

    checkedCount += 1;
    const firstLine = source.split(/\r?\n/, 1)[0].trim();

    if (!VALID_DOCTYPE_RE.test(firstLine)) {
      failures.push(`${rel(fullPath)}: first line must be a valid HTML5 doctype such as ${VALID_DOCTYPE} (found: ${firstLine.slice(0, 60)})`);
    }
  }

  if (failures.length) {
    console.error('qa-doctype failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`qa-doctype passed (${checkedCount} HTML documents checked in dist and root).`);
};

main().catch((error) => {
  console.error(`qa-doctype failed: ${error.message}`);
  process.exit(1);
});
