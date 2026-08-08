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

await copyFragmentTree('partials');

// This legacy-named root file is also consumed as an SSI fragment.
const ctaSource = await fs.readFile(path.join(sourceRoot, 'cta-footer.html'), 'utf8');
await fs.writeFile(path.join(outputRoot, 'cta-footer.html'), stripFrontMatter(ctaSource));

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
