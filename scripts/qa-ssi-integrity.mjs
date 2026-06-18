import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ALLOWED_EXTENSIONS = new Set(['.html', '.shtml']);
const SSI_INCLUDE_RE = /<!--#include\s+([^>]+?)-->/g;
const ATTR_RE = /\b(file|virtual)\s*=\s*"([^"]+)"/g;

const walk = async (dir) => {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
      continue;
    }
    if (ALLOWED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
};

const rel = (filePath) => path.relative(ROOT, filePath).replaceAll(path.sep, '/');

const resolveVirtualTarget = async (target) => {
  const base = target.startsWith('/') ? target.slice(1) : target;
  const candidates = [
    base,
    `${base}.html`,
    `${base}.shtml`,
    path.join(base, 'index.html'),
    path.join(base, 'index.shtml'),
  ];

  for (const candidate of candidates) {
    const fullPath = path.join(ROOT, candidate);
    try {
      await fs.access(fullPath);
      return fullPath;
    } catch {
      // Continue through common clean-URL SSI target variants.
    }
  }

  return null;
};

const main = async () => {
  const files = await walk(ROOT);
  const failures = [];
  let includeCount = 0;

  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
    let match;
    while ((match = SSI_INCLUDE_RE.exec(html)) !== null) {
      includeCount += 1;
      const directive = match[1];
      let hasTarget = false;
      let attrMatch;
      while ((attrMatch = ATTR_RE.exec(directive)) !== null) {
        hasTarget = true;
        const kind = attrMatch[1];
        const target = attrMatch[2];

        if (kind === 'file') {
          failures.push(`${rel(file)}: disallowed SSI include file="${target}" (use virtual="/...")`);
          continue;
        }

        if (!target.startsWith('/')) {
          failures.push(`${rel(file)}: include virtual="${target}" must be root-relative`);
          continue;
        }

        const fsTarget = await resolveVirtualTarget(target);
        if (!fsTarget) {
          failures.push(`${rel(file)}: include target missing for virtual="${target}"`);
        }
      }

      if (!hasTarget) {
        failures.push(`${rel(file)}: malformed SSI include directive (missing file= or virtual= target)`);
      }
    }
  }

  if (failures.length) {
    console.error('qa-ssi-integrity failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`qa-ssi-integrity passed (${includeCount} include directives across ${files.length} files).`);
};

main().catch((error) => {
  console.error(`qa-ssi-integrity failed: ${error.message}`);
  process.exit(1);
});
