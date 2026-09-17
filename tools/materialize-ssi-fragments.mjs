import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'src');
const outputRoot = path.join(root, 'dist');

const stripFrontMatter = (value) => value.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

const copyFragmentTree = async (relativeDir) => {
  const sourceDir = path.join(sourceRoot, relativeDir);
  const outputDir = path.join(outputRoot, relativeDir);
  let entries;
  try {
    entries = await fs.readdir(sourceDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  await fs.mkdir(outputDir, { recursive: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const outputPath = path.join(outputDir, entry.name);
    if (entry.isDirectory()) {
      await copyFragmentTree(path.join(relativeDir, entry.name));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const source = await fs.readFile(sourcePath, 'utf8');
    await fs.writeFile(outputPath, stripFrontMatter(source));
  }
};

// Remove stale nested fragment pages before materializing the canonical SSI tree.
// This prevents an old Eleventy page (for example /partials/booking-router/)
// from surviving an additive deployment beside the fragment file.
await fs.rm(path.join(outputRoot, 'partials'), { recursive: true, force: true });
await copyFragmentTree('partials');

// These legacy-named root files are also consumed as SSI fragments.
const ctaSource = await fs.readFile(path.join(sourceRoot, 'partials', 'cta-footer.html'), 'utf8');
await fs.writeFile(path.join(outputRoot, 'cta-footer.html'), stripFrontMatter(ctaSource));
const navSource = await fs.readFile(path.join(sourceRoot, 'partials', 'nav-include.html'), 'utf8');
await fs.writeFile(path.join(outputRoot, 'nav-include.html'), stripFrontMatter(navSource));
const footerSource = await fs.readFile(path.join(sourceRoot, 'partials', 'footer-include.html'), 'utf8');
await fs.writeFile(path.join(outputRoot, 'footer-include.html'), stripFrontMatter(footerSource));

// Only root-level SSI include sources are published as deployable fragments.
const includeDir = path.join(sourceRoot, '_includes');
const outputIncludeDir = path.join(outputRoot, '_includes');
const includeEntries = await fs.readdir(includeDir, { withFileTypes: true });
await fs.mkdir(outputIncludeDir, { recursive: true });
for (const entry of includeEntries) {
  if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
  const source = await fs.readFile(path.join(includeDir, entry.name), 'utf8');
  await fs.writeFile(path.join(outputIncludeDir, entry.name), stripFrontMatter(source));
}
