#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const jsDir = path.join(root, 'dist', 'js');
const canonicalName = fs.readdirSync(jsDir).find((name) => /^glossary-filters\.[0-9a-f]{6}\.js$/.test(name));
const source = path.join(jsDir, canonicalName || 'glossary-filters.<hash>.js');
const target = path.join(root, 'dist', 'js', 'glossary-filters.min.82cb36.js');

if (!fs.existsSync(source)) {
  throw new Error(`Canonical glossary asset is missing: ${source}`);
}

fs.copyFileSync(source, target);
