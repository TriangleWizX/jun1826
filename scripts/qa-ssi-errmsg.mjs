import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ALLOWED_EXTENSIONS = new Set(['.html', '.shtml']);
const SSI_CONFIG_RE = /<!--#config\s+([^>]+?)-->/g;
const ERRMSG_RE = /\berrmsg\s*=\s*"([^"]*)"/i;

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

const main = async () => {
  const files = await walk(ROOT);
  const failures = [];
  let configCount = 0;
  let errmsgCount = 0;

  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
    let match;
    while ((match = SSI_CONFIG_RE.exec(html)) !== null) {
      configCount += 1;
      const directive = match[1];
      const errmsgMatch = directive.match(ERRMSG_RE);
      if (!errmsgMatch) continue;
      errmsgCount += 1;
      const value = errmsgMatch[1];
      if (value !== '') {
        failures.push(`${rel(file)}: disallowed SSI config errmsg="${value}" (must be empty string or removed)`);
      }
    }
  }

  if (failures.length) {
    console.error('qa-ssi-errmsg failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log(`qa-ssi-errmsg passed (${configCount} config directives, ${errmsgCount} errmsg directives).`);
};

main().catch((error) => {
  console.error(`qa-ssi-errmsg failed: ${error.message}`);
  process.exit(1);
});
