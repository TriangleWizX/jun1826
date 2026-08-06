import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const TIER_A = new Set(['tannersville-ny', 'hunter-ny', 'windham-ny', 'haines-falls-ny']);
const TIER_B = new Set(['palenville-ny', 'cairo-ny', 'catskill-ny', 'woodstock-ny']);

const TIER_C = [
  'acra-ny', 'ashland-ny', 'boiceville-ny', 'coxsackie-ny', 'durham-ny',
  'elka-park-ny', 'gilboa-ny', 'grand-gorge-ny', 'greenville-ny', 'lanesville-ny',
  'leeds-ny', 'lexington-ny', 'maplecrest-ny', 'olive-ny', 'prattsville-ny',
  'purling-ny', 'round-top-ny', 'roxbury-ny', 'saugerties-ny', 'schoharie-ny',
  'shandaken-ny', 'shokan-ny', 'stamford-ny'
];

export const main = async () => {
  let updatedCount = 0;

  for (const slug of TIER_C) {
    const file = path.join(ROOT, 'bjj-classes', slug, 'index.html');
    try {
      let html = await fs.readFile(file, 'utf8');
      if (!html.includes('<meta name="robots" content="noindex">') && !html.includes('<meta name="robots" content="noindex, follow">')) {
        // Insert meta noindex right after <head>
        html = html.replace('<head>', '<head>\n<meta name="robots" content="noindex, follow">');
        await fs.writeFile(file, html, 'utf8');
        updatedCount++;
      }
    } catch {
      // File might not exist
    }
  }

  // Ensure Tier A and Tier B pages do NOT have noindex
  for (const slug of [...TIER_A, ...TIER_B]) {
    const file = path.join(ROOT, 'bjj-classes', slug, 'index.html');
    try {
      let html = await fs.readFile(file, 'utf8');
      if (html.includes('<meta name="robots" content="noindex">') || html.includes('<meta name="robots" content="noindex, follow">')) {
        html = html.replace(/<meta\s+name=["']robots["']\s+content=["']noindex[^"']*["']\s*\/?>\n?/gi, '');
        await fs.writeFile(file, html, 'utf8');
        updatedCount++;
      }
    } catch {
      // File might not exist
    }
  }

  console.log(`Verified town tiers indexing states. Updated ${updatedCount} files.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
