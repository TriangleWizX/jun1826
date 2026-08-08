#!/usr/bin/env node
/** Deletes only byte-identical legacy assets after an inventory allowlist check. */
import fs from 'node:fs/promises';
import path from 'node:path';
const ROOT = process.cwd();
const apply = process.argv.includes('--apply');
const inventoryPath = path.join(ROOT, 'docs/performance/asset-inventory.json');
const main = async () => {
  const inventory = JSON.parse(await fs.readFile(inventoryPath, 'utf8'));
  if (!Array.isArray(inventory.exactLegacyCopies) || !Array.isArray(inventory.removableLegacyDuplicates) || !Array.isArray(inventory.legacyOnly)) throw new Error('Inventory is incomplete.');
  const legacyRoot = path.join(ROOT, 'assets');
  const allowlist = [...new Set([...inventory.exactLegacyCopies, ...inventory.removableLegacyDuplicates])];
  if (!apply) return console.log(`Verified allowlist: ${allowlist.length} unreferenced byte-identical legacy files; ${inventory.legacyOnly.length} legacy-only files will be retained. Re-run with --apply to remove only the allowlist.`);
  for (const relative of allowlist) {
    const target = path.join(legacyRoot, relative);
    if (!target.startsWith(`${legacyRoot}${path.sep}`)) throw new Error(`Unsafe removal target: ${relative}`);
    await fs.unlink(target);
  }
  // Empty directories are removed bottom-up; no non-empty directory is touched.
  const prune = async (dir) => {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) if (entry.isDirectory()) await prune(path.join(dir, entry.name));
    if ((await fs.readdir(dir)).length === 0) await fs.rmdir(dir);
  };
  await prune(legacyRoot);
  console.log(`Removed ${allowlist.length} allowlisted legacy asset files; retained ${inventory.legacyOnly.length} legacy-only file(s) for manual classification.`);
};
main().catch((error) => { console.error(`asset migration failed: ${error.message}`); process.exitCode = 1; });
