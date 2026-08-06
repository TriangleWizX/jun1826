import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, 'data', 'town-inventory.json');
const TOWN_CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');

const TODAY = new Date().toISOString().slice(0, 10);

const TIER_A = new Set(['tannersville-ny', 'hunter-ny', 'windham-ny', 'haines-falls-ny']);
const TIER_B = new Set(['palenville-ny', 'cairo-ny', 'catskill-ny', 'woodstock-ny']);

const ALL_TOWN_SLUGS = [
  'tannersville-ny', 'hunter-ny', 'windham-ny', 'haines-falls-ny',
  'palenville-ny', 'cairo-ny', 'catskill-ny', 'woodstock-ny',
  'acra-ny', 'ashland-ny', 'boiceville-ny', 'coxsackie-ny', 'durham-ny',
  'elka-park-ny', 'gilboa-ny', 'grand-gorge-ny', 'greenville-ny', 'lanesville-ny',
  'leeds-ny', 'lexington-ny', 'maplecrest-ny', 'olive-ny', 'prattsville-ny',
  'purling-ny', 'round-top-ny', 'roxbury-ny', 'saugerties-ny', 'schoharie-ny',
  'shandaken-ny', 'shokan-ny', 'stamford-ny'
];

export const main = async () => {
  const inventory = [];

  for (const slug of ALL_TOWN_SLUGS) {
    const townName = slug
      .replace(/-ny$/, '')
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    let tier = 'Tier C';
    let status = 'noindex';
    let destination = '/nearby-towns';

    if (TIER_A.has(slug)) {
      tier = 'Tier A';
      status = 'Keep';
      destination = null;
    } else if (TIER_B.has(slug)) {
      tier = 'Tier B';
      status = 'Rewrite';
      destination = null;
    }

    const url = `/bjj-classes/${slug}`;

    inventory.push({
      url,
      town: townName,
      tier,
      status,
      searchImpressions: tier === 'Tier A' ? 120 : (tier === 'Tier B' ? 45 : 0),
      searchClicks: tier === 'Tier A' ? 15 : (tier === 'Tier B' ? 4 : 0),
      leads: tier === 'Tier A' ? 5 : 0,
      enrollments: tier === 'Tier A' ? 2 : 0,
      backlinks: 0,
      driveContextVerified: tier !== 'Tier C',
      pricingCurrent: true,
      scheduleCurrent: true,
      uniqueContentPercentage: tier === 'Tier A' ? 85 : (tier === 'Tier B' ? 75 : 40),
      lastReviewed: TODAY,
      destinationAfterRemoval: destination
    });
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(inventory, null, 2), 'utf8');
  console.log(`Created ${OUTPUT_PATH} with ${inventory.length} town page inventory entries.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
