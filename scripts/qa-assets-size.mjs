#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
const ROOT = process.cwd();
const beforePath = path.join(ROOT, 'docs/performance/asset-inventory.before.json');
const afterPath = path.join(ROOT, 'docs/performance/asset-inventory.json');
const read = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const main = async () => {
  const [before, after] = await Promise.all([read(beforePath), read(afterPath)]);
  const errors = [];
  const operationalReference = (reference) => !/^docs\/performance\/asset-inventory[^/]*\.json$/i.test(reference);
  const legacyDuplicateIsOperational = (group) => group.paths
    .filter((item) => item.startsWith('assets/'))
    .some((item) => after.legacyAssets.find((asset) => `assets/${asset.path}` === item)?.references.some(operationalReference));
  if (after.duplicateGroups.some((group) => group.paths.some((item) => item.startsWith('src/assets/')) && legacyDuplicateIsOperational(group))) {
    errors.push('duplicate published bytes remain in the legacy asset tree');
  }
  if (after.assets.some((asset) => asset.bytes > 25 * 1024 * 1024 && /\.(?:png|jpe?g|webp|avif|mp4)$/i.test(asset.path))) errors.push('a reachable media file exceeds the 25 MiB budget');
  if (after.totals['src/assets'].bytes > before.totals['src/assets'].bytes) errors.push('canonical published asset bytes increased');
  if (errors.length) throw new Error(`qa:assets:size failed:\n- ${errors.join('\n- ')}`);
  console.log(`qa:assets:size passed (legacy ${before.totals.assets.bytes} -> ${after.totals.assets.bytes} bytes; canonical ${after.totals['src/assets'].bytes} bytes; ${after.legacyOnly.length} legacy-only file(s) retained for classification).`);
};
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
