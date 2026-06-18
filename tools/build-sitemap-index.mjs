import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outPath = path.join(root, 'sitemap.xml');
const sitemaps = [
  'https://senseisandy.com/pages-sitemap.xml',
  'https://senseisandy.com/blog-sitemap.xml',
  'https://senseisandy.com/video-sitemap.xml'
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemaps[0]}</loc>
  </sitemap>
  <sitemap>
    <loc>${sitemaps[1]}</loc>
  </sitemap>
  <sitemap>
    <loc>${sitemaps[2]}</loc>
  </sitemap>
</sitemapindex>
`;

let existing = '';
try {
  existing = await fs.readFile(outPath, 'utf8');
} catch {
  existing = '';
}

if (existing.trim() === xml.trim()) {
  console.log(`sitemap index unchanged (${outPath})`);
} else {
  await fs.writeFile(outPath, xml, 'utf8');
  console.log(`Wrote ${outPath}`);
}
