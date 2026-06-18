import { iterHtmlFiles, ROOT } from './url-qa-lib.mjs';
import fs from 'node:fs/promises';
import path from 'node:path';

const NAV_INCLUDE = '<!--#include virtual="/nav-include.html" -->';
const SKIP_LINK_RE = /class\s*=\s*(["'])[^"']*\bss-skip-link\b[^"']*\1/i;
const SKIP_DIR_PREFIXES = ['tmp/', '_includes/'];

const main = async () => {
  const files = await iterHtmlFiles();
  const failures = [];

  for (const relPath of files) {
    const normalized = relPath.replaceAll(path.sep, '/');
    if (SKIP_DIR_PREFIXES.some((prefix) => normalized.startsWith(prefix))) continue;

    const html = await fs.readFile(path.join(ROOT, relPath), 'utf8');
    if (!html.includes(NAV_INCLUDE)) continue;
    if (!SKIP_LINK_RE.test(html)) continue;

    failures.push(`${normalized}: contains local ss-skip-link and nav include; keep skip link only in nav-include.html`);
  }

  if (failures.length) {
    console.error('qa-skip-link-single-source failed:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log('qa-skip-link-single-source passed.');
};

main().catch((error) => {
  console.error(`qa-skip-link-single-source failed: ${error.message}`);
  process.exit(1);
});
