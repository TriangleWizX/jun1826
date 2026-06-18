import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SSI_INCLUDE_RE = /<!--#include\s+virtual="([^"]+)"\s*-->/g;

const REQUIRED = {
  'index.html': [
    '/nav-include.html',
    '/footer-include.html'
  ]
};

const FORBIDDEN = {
  'index.html': [
    '/partials/nearby-areas-links.html'
  ],
  'footer-include.html': [
    '/cta-footer.html',
    '/partials/location-and-reviews.html'
  ]
};

const toFsPath = (virtualPath) => path.join(ROOT, virtualPath.replace(/^\/+/, ''));

const parseIncludes = (text) => {
  const includes = [];
  let match;
  while ((match = SSI_INCLUDE_RE.exec(text)) !== null) {
    includes.push({
      virtual: match[1],
      index: match.index
    });
  }
  return includes;
};

const lineOfIndex = (text, index) => text.slice(0, index).split('\n').length;

const main = async () => {
  const failures = [];

  for (const [file, requiredPaths] of Object.entries(REQUIRED)) {
    const full = path.join(ROOT, file);
    const html = await fs.readFile(full, 'utf8');
    const includes = parseIncludes(html);
    const includeMap = new Map(includes.map((i) => [i.virtual, i]));

    let prevIndex = -1;
    for (const required of requiredPaths) {
      const found = includeMap.get(required);
      if (!found) {
        failures.push(`${file}: missing required include virtual="${required}"`);
        continue;
      }
      if (found.index < prevIndex) {
        failures.push(`${file}: include order violation for virtual="${required}"`);
      }
      prevIndex = found.index;

      const target = toFsPath(required);
      try {
        await fs.access(target);
      } catch {
        failures.push(`${file}: include target missing for virtual="${required}"`);
      }
    }
  }

  for (const [file, forbiddenPaths] of Object.entries(FORBIDDEN)) {
    const full = path.join(ROOT, file);
    const html = await fs.readFile(full, 'utf8');
    const includes = parseIncludes(html);
    const includeSet = new Set(includes.map((i) => i.virtual));

    for (const forbidden of forbiddenPaths) {
      if (includeSet.has(forbidden)) {
        failures.push(`${file}: forbidden include virtual="${forbidden}"`);
      }
    }
  }

  if (failures.length) {
    console.error('qa-ssi-homepage-chain failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  const indexHtml = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
  const includes = parseIncludes(indexHtml);
  const lines = includes.map((i) => `${i.virtual} @ line ${lineOfIndex(indexHtml, i.index)}`);
  console.log('qa-ssi-homepage-chain passed.');
  console.log(`index.html first-level include order: ${lines.join(' -> ')}`);
};

main().catch((error) => {
  console.error(`qa-ssi-homepage-chain failed: ${error.message}`);
  process.exit(1);
});
