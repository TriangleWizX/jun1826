import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const manifestPath = path.join(ROOT, 'src/assets/data/media-manifest.json');
const reportPath = path.join(ROOT, 'crawl-reports/media-reference-audit.json');
const scanRoots = ['src', 'assets', 'js', 'scripts', 'tools'];
const extensions = new Set(['.html', '.njk', '.css', '.js', '.mjs', '.cjs', '.json']);

async function filesUnder(relative) {
  const full = path.join(ROOT, relative);
  const entries = await fs.readdir(full, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') result.push(...await filesUnder(child));
    else if (entry.isFile() && extensions.has(path.extname(entry.name))) result.push(child);
  }
  return result;
}

const normalize = (value) => String(value).replace(/^\/+/, '').replaceAll('\\', '/');

const main = async () => {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.groups)) throw new Error('media manifest must contain groups[]');
  const files = (await Promise.all(scanRoots.map(filesUnder))).flat();
  const contents = await Promise.all(files.map(async (file) => [file, await fs.readFile(path.join(ROOT, file), 'utf8')]));
  const groups = manifest.groups.map((group) => {
    const members = [group.canonical_source, ...(group.fingerprinted_outputs || []), ...(group.dated_aliases || [])].map(normalize);
    const references = contents.filter(([, content]) => members.some((member) => content.includes(member))).map(([file]) => file);
    return { group_id: group.group_id, reference_status: references.length ? 'referenced' : 'unreferenced', references };
  });
  await fs.writeFile(reportPath, `${JSON.stringify({ generated_at: new Date().toISOString(), groups }, null, 2)}\n`);
  console.log(`qa-media-manifest passed (${groups.length} groups; report=${path.relative(ROOT, reportPath)})`);
};

main().catch((error) => { console.error(`qa-media-manifest failed: ${error.message}`); process.exitCode = 1; });
