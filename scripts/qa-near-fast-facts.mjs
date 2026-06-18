import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const FACTS_PATH = path.join(ROOT, 'data', 'near-fast-facts.json');
const TOWN_CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');

const NEAR_FACTS_MAP = Object.freeze({
  'hunter-ny': ['hunter_town'],
  'haines-falls-ny': ['haines_falls'],
  'east-jewett-ny': ['elka_park', 'onteora_park', 'east_jewett', 'jewett_town'],
  'windham-ny': ['windham_town'],
  'phoenicia-ny': ['phoenicia'],
  'palenville-ny': ['palenville'],
  'cairo-ny': ['cairo_town'],
  'catskill-ny': ['catskill_town'],
  'woodstock-ny': ['woodstock_town']
});

const HUB_ENTITY_IDS = [
  'catskills_hub',
  'tannersville',
  'hunter_town',
  'hunter_village',
  'cairo_town',
  'catskill_town',
  'elka_park',
  'onteora_park',
  'east_jewett',
  'palenville',
  'windham_town',
  'jewett_town',
  'phoenicia',
  'lexington_town',
  'woodstock_town',
  'windham_mountain_club'
];

const ALLOWED_HOST_SUFFIXES = [
  'census.gov',
  'ny.gov',
  'nps.gov',
  'censusreporter.org',
  'wikipedia.org',
  'huntermtn.com',
  'iloveny.com',
  'waterqualitydata.us',
  'waterdata.usgs.gov',
  'usgs.gov',
  'nces.ed.gov',
  'townofcairony.gov',
  'windhammountainclub.com',
  'villageofhunter.org',
  'tclf.org'
];

const PHASE1_PRIMARY_ENTITY_IDS = new Set([
  'tannersville',
  'hunter_town',
  'windham_town',
  'woodstock_town',
  'haines_falls',
  'windham_mountain_club'
]);

const PHASE1_PRIMARY_HOST_SUFFIXES = [
  'census.gov',
  'huntermtn.com',
  'windhammountainclub.com',
  'nces.ed.gov'
];

const errors = [];

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const hostAllowed = (hostname) =>
  ALLOWED_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));

const hostAllowedPrimary = (hostname) =>
  PHASE1_PRIMARY_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`));

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const validateEntity = (entityId, entity) => {
  assert(entity && typeof entity === 'object', `Missing entity object for ${entityId}.`);
  if (!entity || typeof entity !== 'object') return;

  assert(typeof entity.title === 'string' && entity.title.trim().length > 0, `${entityId}: title is required.`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(String(entity.last_verified || '')), `${entityId}: last_verified must be YYYY-MM-DD.`);
  assert(Array.isArray(entity.facts), `${entityId}: facts must be an array.`);
  if (!Array.isArray(entity.facts)) return;
  assert(entity.facts.length >= 3, `${entityId}: must include at least 3 facts.`);

  entity.facts.forEach((fact, index) => {
    const label = `${entityId}.facts[${index}]`;
    assert(fact && typeof fact === 'object', `${label}: fact must be an object.`);
    if (!fact || typeof fact !== 'object') return;

    assert(typeof fact.quote === 'string' && fact.quote.trim().length >= 10, `${label}: quote must be a short non-empty sentence.`);
    assert(typeof fact.source_name === 'string' && fact.source_name.trim().length > 0, `${label}: source_name is required.`);
    assert(typeof fact.source_url === 'string' && fact.source_url.startsWith('https://'), `${label}: source_url must be https://.`);
    if (PHASE1_PRIMARY_ENTITY_IDS.has(entityId)) {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(String(fact.last_verified || '')), `${label}: last_verified must be YYYY-MM-DD.`);
      assert(typeof fact.why_it_matters === 'string' && fact.why_it_matters.trim().length > 0, `${label}: why_it_matters is required.`);
    }

    if (typeof fact.source_url === 'string' && fact.source_url.startsWith('https://')) {
      let parsed;
      try {
        parsed = new URL(fact.source_url);
      } catch {
        assert(false, `${label}: source_url is not a valid URL.`);
        return;
      }
      assert(hostAllowed(parsed.hostname.toLowerCase()), `${label}: source host is not allowlisted (${parsed.hostname}).`);
      if (PHASE1_PRIMARY_ENTITY_IDS.has(entityId)) {
        assert(
          hostAllowedPrimary(parsed.hostname.toLowerCase()),
          `${label}: phase-1 entity requires primary source host (${parsed.hostname}).`
        );
      }
    }
  });
};

const run = async () => {
  const [factsById, townConfig] = await Promise.all([readJson(FACTS_PATH), readJson(TOWN_CONFIG_PATH)]);

  HUB_ENTITY_IDS.forEach((entityId) => {
    validateEntity(entityId, factsById[entityId]);
  });

  for (const [slug, entityIds] of Object.entries(NEAR_FACTS_MAP)) {
    entityIds.forEach((entityId) => {
      assert(Boolean(factsById[entityId]), `${slug}: mapped entity missing in data/near-fast-facts.json (${entityId}).`);
    });
  }

  const liveSlugs = townConfig
    .filter((town) => String(town?.status || '').toLowerCase() === 'live')
    .map((town) => String(town.slug || '').trim())
    .filter(Boolean);

  liveSlugs.forEach((slug) => {
    assert(Array.isArray(NEAR_FACTS_MAP[slug]) && NEAR_FACTS_MAP[slug].length > 0, `Missing facts mapping for live near slug: ${slug}.`);
  });

  if (errors.length) {
    errors.forEach((message) => console.error(`NEAR FAST FACTS QA FAIL: ${message}`));
    process.exit(1);
  }

  console.log('Near fast facts QA passed.');
};

run().catch((error) => {
  console.error(`NEAR FAST FACTS QA FAIL: ${error.message}`);
  process.exit(1);
});
