#!/usr/bin/env node
/** Read-only asset inventory. It is the allowlist input for asset migration. */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, 'src', 'assets');
const LEGACY = path.join(ROOT, 'assets');
const PUBLISHED = path.join(ROOT, 'dist', 'assets');
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value] = arg.replace(/^--/, '').split('=', 2);
  return [key, value || true];
}));
const posix = (value) => value.split(path.sep).join('/');
const sha256 = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

const walk = async (base) => {
  const files = [];
  const visit = async (dir) => {
    let entries = [];
    try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Inventory refuses symlink: ${posix(path.relative(ROOT, full))}`);
      if (entry.isDirectory()) await visit(full);
      else if (entry.isFile()) files.push(full);
    }
  };
  await visit(base);
  return files;
};
const references = async () => {
  const found = new Map();
  const skip = new Set(['.git', 'node_modules', 'dist', 'assets', 'tmp']);
  const files = [];
  const visit = async (dir) => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && !skip.has(entry.name)) await visit(path.join(dir, entry.name));
      else if (entry.isFile() && /\.(?:html?|njk|css|js|json|xml|md)$/i.test(entry.name)) files.push(path.join(dir, entry.name));
    }
  };
  await visit(ROOT);
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8').catch(() => '');
    for (const match of text.matchAll(/(?:^|["'(=\s])\/?assets\/([^?#"')\s]+)/g)) {
      const key = match[1];
      const list = found.get(key) || [];
      list.push(posix(path.relative(ROOT, file)));
      found.set(key, list);
    }
  }
  return found;
};
const main = async () => {
  const [sourceFiles, legacyFiles, publishedFiles, refs] = await Promise.all([walk(SOURCE), walk(LEGACY), walk(PUBLISHED), references()]);
  const byTree = async (root, files) => Promise.all(files.map(async (file) => {
    const bytes = await fs.readFile(file);
    const relative = posix(path.relative(root, file));
    return { path: relative, bytes: bytes.length, sha256: sha256(bytes), references: refs.get(relative) || [] };
  }));
  const [source, legacy, published] = await Promise.all([byTree(SOURCE, sourceFiles), byTree(LEGACY, legacyFiles), byTree(PUBLISHED, publishedFiles)]);
  const sourceMap = new Map(source.map((row) => [row.path, row]));
  const legacyMap = new Map(legacy.map((row) => [row.path, row]));
  const duplicateGroups = [...new Map([...source, ...legacy].map((row) => [row.sha256, []])).entries()];
  for (const row of source) duplicateGroups.find(([hash]) => hash === row.sha256)[1].push(`src/assets/${row.path}`);
  for (const row of legacy) duplicateGroups.find(([hash]) => hash === row.sha256)[1].push(`assets/${row.path}`);
  const sourceHashes = new Set(source.map((row) => row.sha256));
  const exactLegacyCopies = legacy.filter((row) => sourceMap.get(row.path)?.sha256 === row.sha256).map((row) => row.path);
  const removableLegacyDuplicates = legacy.filter((row) => sourceHashes.has(row.sha256) && !(refs.get(row.path) || []).length).map((row) => row.path);
  const data = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    owner: 'src/assets',
    totals: Object.fromEntries([['src/assets', source], ['assets', legacy], ['dist/assets', published]].map(([name, rows]) => [name, { files: rows.length, bytes: rows.reduce((sum, row) => sum + row.bytes, 0) }])),
    exactLegacyCopies,
    removableLegacyDuplicates,
    sourceOnly: source.filter((row) => !legacyMap.has(row.path)).map((row) => row.path),
    legacyOnly: legacy.filter((row) => !sourceMap.has(row.path)).map((row) => row.path),
    duplicateGroups: duplicateGroups.filter(([, paths]) => paths.length > 1).map(([sha256, paths]) => ({ sha256, paths })),
    assets: source.map((row) => ({ ...row, publicUrl: `/assets/${row.path}`, generatedOwner: /^(?:css\/(?:routes|bundles)\/|data\/(?:asset-hash|route-style-))/.test(row.path) })),
    legacyAssets: legacy.map((row) => ({ ...row, references: refs.get(row.path) || [] })),
  };
  const markdown = `# Asset inventory\n\nGenerated: ${data.generatedAt}\n\n| Tree | Files | Bytes |\n| --- | ---: | ---: |\n${Object.entries(data.totals).map(([name, total]) => `| ${name} | ${total.files} | ${total.bytes} |`).join('\n')}\n\n- Exact legacy copies eligible for removal: ${exactLegacyCopies.length}\n- Source-only files: ${data.sourceOnly.length}\n- Legacy-only files: ${data.legacyOnly.length}\n- Duplicate byte groups: ${data.duplicateGroups.length}\n`;
  if (args.json) await fs.writeFile(path.resolve(ROOT, args.json), `${JSON.stringify(data, null, 2)}\n`);
  if (args.markdown) await fs.writeFile(path.resolve(ROOT, args.markdown), markdown);
  if (!args.json && !args.markdown) process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
};
main().catch((error) => { console.error(`assets:inventory failed: ${error.message}`); process.exitCode = 1; });
