import fs from 'node:fs/promises';
import path from 'node:path';
import { readSitemapTree } from './lib/sitemap-utils.mjs';

const ROOT = process.cwd();
const ROOT_SITEMAP = 'sitemap.xml';
const CORE_FILES = [
  'index.html',
  'contact.html',
  'schedule.html',
  'videos/index.html'
];

const EXPECTED = {
  id: 'https://senseisandy.com/#localbusiness',
  telephone: '+1-917-736-8649',
  email: 'me@senseisandy.com',
  streetAddress: '6045 Main Street, 2nd Floor Studio',
  addressLocality: 'Tannersville',
  addressRegion: 'NY',
  postalCode: '12485',
  sameAs: [
    'https://www.instagram.com/senseisandybjj/',
    'https://www.facebook.com/p/Sensei-Sandy-BJJ-61579362991950/',
    'https://www.youtube.com/@SenseiSandyBJJ'
  ]
};
const CORE_FILE_EXPECTATIONS = {
  'index.html': {
    id: 'https://senseisandy.com/#localbusiness',
    telephone: '+1-917-736-8649',
    email: 'me@senseisandy.com',
    streetAddress: '6045 Main St, 2nd Floor',
    addressLocality: 'Tannersville',
    addressRegion: 'NY',
    postalCode: '12485',
    sameAs: []
  }
};
const NEAR_EXPECTED_QUESTIONS = [
  'Can I start Brazilian Jiu-Jitsu as a complete beginner?',
  'Is this striking or grappling?',
  'Can I start with private lessons first?'
];
const NEAR_EXPECTED_QUESTIONS_BY_PATH = {
  'near/haines-falls-ny/index.html': [
    'Is this actually close enough for a tired after-school child?',
    'My child already does camps and mountain activities. Is this too much?',
    'Will the first class feel supervised and controlled?'
  ],
  'near/hunter-ny/index.html': [
    'Is this close enough to stay easy on school nights?',
    'Will my child get thrown into hard rounds right away?',
    'Can this still work during ski season and busy weekends?'
  ],
  'near/windham-ny/index.html': [
    'Where can beginners find martial arts classes near Windham, NY?',
    'Can martial arts near Windham fit a real school-night routine?',
    'What is the best first class for beginners coming from Windham?',
    'Do I need experience before trying a martial arts class near Windham?',
    'Is Brazilian Jiu-Jitsu a martial art?',
    'What age groups can start from Windham?',
    'What does a realistic school-night start look like from Windham?',
    'Is this page also for families in Hensonville, Maplecrest, East Windham, and Brooksburg?',
    'Is Sensei Sandy BJJ close enough to Windham Mountain Club to be practical?',
    'What should I wear to a first martial arts class if I am coming from Windham?',
    'Do I need a gi or uniform to start?',
    'Can I start with No-Gi if that feels easier?',
    'What if I am nervous about the first class?',
    'Do beginners from Windham have to compete?'
  ],
  'near/palenville-ny/index.html': [
    'Is this too much driving for a first activity?',
    'Can siblings or different ages make one trip work?',
    'Can we start without pressure to commit immediately?'
  ],
  'near/cairo-ny/index.html': [
    'Is this worth driving to twice a week?',
    'Can siblings or different ages fit one trip?',
    'What makes this better than a generic closer option?'
  ],
  'near/catskill-ny/index.html': [
    'Why go to Tannersville instead of staying closer to Catskill?',
    'Will my kid get lost in class size or intensity?',
    'Can we test this without committing blindly?'
  ],
  'near/phoenicia-ny/index.html': [
    'What do we do when weather flips or the week gets messy?',
    'Is this too far for a first activity?',
    'Can my child try this without pressure?'
  ],
  'near/woodstock-ny/index.html': [
    'Why drive to Tannersville if something might be closer?',
    'Is this a meathead gym or safe for true beginners?',
    'Can adults train for skill and community without fight culture?'
  ]
};
const TARGET_SCHEMA_FILES = [
  'sensei-jiu-jitsu.html',
  'blog/catskills-gym-alternative-jiu-jitsu/index.html'
];
const TARGET_BLOG_PATH = 'blog/catskills-gym-alternative-jiu-jitsu/index.html';
const SCHEDULE_PATH = 'schedule.html';
const EAST_JEWETT_PATH = 'near/east-jewett-ny/index.html';
const CANONICAL_LOCALBUSINESS_ID = 'https://senseisandy.com/#localbusiness';
const SERVICE_PROVIDER_REQUIRED_FILES = [
  'book-free-intro/index.html',
  'catskill-ny-jiu-jitsu.html',
  'hunter-ny-jiu-jitsu.html',
  'cairo-ny-jiu-jitsu.html'
];
const STRICT_URL_FIELDS = new Set(['url', '@id', 'item', 'image', 'logo']);
const DISALLOWED_TYPES = new Set(['MartialArtsSchool']);
const ISO_8601_WITH_TZ_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const errors = [];
const normalizeStatus = (value = '') => String(value).trim().toLowerCase();

const extractJsonLdBlocks = (html) => {
  const blocks = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Skip invalid JSON-LD blocks; they will be surfaced by schema tooling separately.
    }
  }
  return blocks;
};

const collectObjects = (node, out = []) => {
  if (Array.isArray(node)) {
    for (const item of node) collectObjects(item, out);
    return out;
  }
  if (node && typeof node === 'object') {
    out.push(node);
    for (const value of Object.values(node)) {
      if (value && typeof value === 'object') collectObjects(value, out);
    }
  }
  return out;
};

const hasType = (obj, expectedType) => {
  const value = obj?.['@type'];
  if (!value) return false;
  if (typeof value === 'string') return value === expectedType;
  if (Array.isArray(value)) return value.includes(expectedType);
  return false;
};

const getTypes = (obj) => {
  const value = obj?.['@type'];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
  return [];
};

const isLocalBusiness = (value) => {
  if (!value) return false;
  if (typeof value === 'string') return value === 'LocalBusiness' || value === 'SportsActivityLocation';
  if (Array.isArray(value)) return value.some((item) => isLocalBusiness(item));
  return false;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\/.+/i.test(String(value || '').trim());
const isIso8601WithTimezone = (value) => ISO_8601_WITH_TZ_REGEX.test(String(value || '').trim());
const normalizeText = (value) => String(value || '')
  .replace(/[\u2018\u2019]/g, '\'')
  .replace(/[\u201c\u201d]/g, '"')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const ensure = (condition, message) => {
  if (!condition) errors.push(message);
};

const normalizePathname = (pathname) => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
};

const fileExists = async (relPath) => {
  try {
    await fs.access(path.join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
};

const SSI_INCLUDE_REGEX = /<!--#include\s+virtual="([^"]+)"\s*-->/gi;

const resolveSsiIncludes = async (html, relPath, seen = new Set()) => {
  const cacheKey = path.posix.normalize(relPath);
  if (seen.has(cacheKey)) {
    throw new Error(`SSI include cycle detected while reading ${relPath}.`);
  }

  const nextSeen = new Set(seen);
  nextSeen.add(cacheKey);

  let output = html;
  const includeRegex = new RegExp(SSI_INCLUDE_REGEX.source, 'gi');
  let match;

  while ((match = includeRegex.exec(html)) !== null) {
    const includeTarget = match[1];
    const normalized = includeTarget.startsWith('/')
      ? includeTarget.slice(1)
      : path.posix.join(path.posix.dirname(relPath), includeTarget);
    const includeRelPath = path.posix.normalize(normalized);

    const candidates = [
      includeRelPath,
      `${includeRelPath}.html`,
      `${includeRelPath}.shtml`,
      path.posix.join(includeRelPath, 'index.html'),
      path.posix.join(includeRelPath, 'index.shtml')
    ];

    let includeHtml = null;
    let resolvedRelPath = null;
    for (const cand of candidates) {
      try {
        includeHtml = await fs.readFile(path.join(ROOT, cand), 'utf8');
        resolvedRelPath = cand;
        break;
      } catch {
        // continue
      }
    }

    if (includeHtml === null) {
      throw new Error(`SSI include target "${includeTarget}" (resolved candidates) could not be resolved from "${relPath}".`);
    }

    const expandedInclude = await resolveSsiIncludes(includeHtml, resolvedRelPath, nextSeen);
    output = output.replace(match[0], expandedInclude);
  }

  return output;
};

const resolveUrlToFile = async (urlString) => {
  const url = new URL(urlString);
  const pathname = normalizePathname(url.pathname);
  const slug = pathname.replace(/^\/+/, '');
  const candidates = [];

  if (pathname === '/') {
    candidates.push('index.html');
  } else {
    candidates.push(`${slug}.html`);
    candidates.push(path.join(slug, 'index.html'));
    if (slug.endsWith('.html')) candidates.push(slug);
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  throw new Error(`No local file found for URL ${urlString} (tried: ${candidates.join(', ')})`);
};

const getSitemapRelFiles = async () => {
  const relFiles = new Set();
  const contract = JSON.parse(await fs.readFile(path.join(ROOT, 'config', 'url-contract.json'), 'utf8'));
  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  if (!canonicalOrigin) {
    throw new Error('config/url-contract.json must define canonicalOrigin.');
  }

  const { urls } = await readSitemapTree({
    rootDir: ROOT,
    sitemapPath: ROOT_SITEMAP,
    canonicalOrigin
  });

  for (const rawUrl of urls) {
    const relFile = await resolveUrlToFile(rawUrl);
    relFiles.add(relFile);
  }

  return relFiles;
};

const getLiveNearFiles = async () => {
  const towns = JSON.parse(await fs.readFile(path.join(ROOT, 'near', 'town-config.json'), 'utf8'));
  const liveFiles = [];
  for (const town of towns) {
    if (normalizeStatus(town.status) !== 'live') continue;
    const relPath = path.join('near', town.slug, 'index.html');
    if (await fileExists(relPath)) liveFiles.push(relPath);
  }
  return liveFiles;
};

const readHtml = async (relPath) => {
  const html = await fs.readFile(path.join(ROOT, relPath), 'utf8');
  return resolveSsiIncludes(html, relPath);
};

const readSchemaObjects = async (relPath) => {
  const html = await readHtml(relPath);
  const blocks = extractJsonLdBlocks(html);
  return collectObjects(blocks);
};

const validateBreadcrumbList = (node, relPath) => {
  const list = node?.itemListElement;
  ensure(Array.isArray(list), `${relPath}: BreadcrumbList missing itemListElement array.`);
  if (!Array.isArray(list)) return;

  list.forEach((item, index) => {
    const label = `${relPath}: BreadcrumbList item ${index + 1}`;
    ensure(item && typeof item === 'object', `${label} is not an object.`);
    if (!item || typeof item !== 'object') return;
    ensure(Number.isFinite(Number(item.position)), `${label} is missing a numeric position.`);
    ensure(String(item.name || '').trim().length > 0, `${label} is missing name.`);
    ensure(typeof item.item === 'string' && isAbsoluteHttpUrl(item.item), `${label} must use an absolute item URL.`);
  });
};

const validateCoreLocalBusiness = async () => {
  for (const relPath of CORE_FILES) {
    const expected = CORE_FILE_EXPECTATIONS[relPath] || EXPECTED;
    const objects = await readSchemaObjects(relPath);
    const localBusiness = objects.find((obj) => isLocalBusiness(obj['@type']) && obj['@id'] === expected.id);

    ensure(Boolean(localBusiness), `${relPath}: missing canonical LocalBusiness object with @id ${expected.id}.`);
    if (!localBusiness) continue;

    ensure(localBusiness.telephone === expected.telephone, `${relPath}: telephone mismatch for canonical LocalBusiness.`);
    ensure(localBusiness.email === expected.email, `${relPath}: email mismatch for canonical LocalBusiness.`);

    const address = localBusiness.address || {};
    ensure(address.streetAddress === expected.streetAddress, `${relPath}: streetAddress mismatch for canonical LocalBusiness.`);
    ensure(address.addressLocality === expected.addressLocality, `${relPath}: addressLocality mismatch for canonical LocalBusiness.`);
    ensure(address.addressRegion === expected.addressRegion, `${relPath}: addressRegion mismatch for canonical LocalBusiness.`);
    ensure(address.postalCode === expected.postalCode, `${relPath}: postalCode mismatch for canonical LocalBusiness.`);

    const sameAs = Array.isArray(localBusiness.sameAs) ? localBusiness.sameAs : [];
    for (const expectedUrl of expected.sameAs) {
      ensure(sameAs.includes(expectedUrl), `${relPath}: sameAs is missing ${expectedUrl}.`);
    }
  }
};

const validateBookIntroRoot = async () => {
  const relPath = 'book-free-intro/index.html';
  const objects = await readSchemaObjects(relPath);
  const faqCount = objects.filter((obj) => hasType(obj, 'FAQPage')).length;
  ensure(faqCount === 0, `${relPath}: root book intro must not include FAQPage schema.`);
};

const validateSitemapBreadcrumbs = async () => {
  const relFiles = await getSitemapRelFiles();

  for (const relPath of relFiles) {
    const objects = await readSchemaObjects(relPath);
    const breadcrumbs = objects.filter((obj) => hasType(obj, 'BreadcrumbList'));
    for (const breadcrumb of breadcrumbs) {
      validateBreadcrumbList(breadcrumb, relPath);
    }
  }
};

const validateBlogPostingImages = async () => {
  const blogRoot = path.join(ROOT, 'blog');
  const entries = await fs.readdir(blogRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const relPath = path.join('blog', entry.name, 'index.html');
    if (!(await fileExists(relPath))) continue;

    const objects = await readSchemaObjects(relPath);
    const posts = objects.filter((obj) => hasType(obj, 'BlogPosting') || hasType(obj, 'Article'));
    for (const post of posts) {
      const image = post.image;
      const label = `${relPath}: ${post['@type'] || 'Article'} image`;

      if (typeof image === 'string') {
        ensure(isAbsoluteHttpUrl(image), `${label} must be an absolute URL.`);
        continue;
      }

      if (Array.isArray(image)) {
        ensure(image.length > 0, `${label} array is empty.`);
        image.forEach((value, index) => {
          if (typeof value === 'string') {
            ensure(isAbsoluteHttpUrl(value), `${label}[${index}] must be an absolute URL.`);
          } else if (value && typeof value === 'object') {
            ensure(isAbsoluteHttpUrl(value.url), `${label}[${index}].url must be an absolute URL.`);
          } else {
            ensure(false, `${label}[${index}] has unsupported type.`);
          }
        });
        continue;
      }

      if (image && typeof image === 'object') {
        ensure(isAbsoluteHttpUrl(image.url), `${label}.url must be an absolute URL.`);
        continue;
      }

      ensure(false, `${label} is missing.`);
    }
  }
};

const validateNearTownSchemas = async () => {
  const towns = JSON.parse(await fs.readFile(path.join(ROOT, 'near', 'town-config.json'), 'utf8'));

  for (const town of towns) {
    const relPath = path.join('near', town.slug, 'index.html');
    const status = String(town.status || '').trim().toLowerCase();
    const isLive = status === 'live';
    const isAlias = status === 'alias';

    ensure(isLive || isAlias, `${relPath}: status "${town.status || ''}" is invalid. Use "live" or "alias".`);
    if (!isLive && !isAlias) continue;

    const exists = await fileExists(relPath);
    if (isAlias) {
      ensure(!exists, `${relPath}: alias town must not have a generated near page.`);
      continue;
    }

    ensure(exists, `${relPath}: generated near page is missing.`);
    if (!exists) continue;

    const objects = await readSchemaObjects(relPath);
    const faqPages = objects.filter((obj) => hasType(obj, 'FAQPage'));
    const breadcrumbs = objects.filter((obj) => hasType(obj, 'BreadcrumbList'));
    const expectedRichCount = 1;

    ensure(faqPages.length === expectedRichCount, `${relPath}: expected ${expectedRichCount} FAQPage object(s), found ${faqPages.length}.`);
    ensure(breadcrumbs.length === expectedRichCount, `${relPath}: expected ${expectedRichCount} BreadcrumbList object(s), found ${breadcrumbs.length}.`);

    if (faqPages.length === 0) continue;

    const mainEntity = faqPages[0].mainEntity;
    ensure(Array.isArray(mainEntity), `${relPath}: FAQPage mainEntity must be an array.`);
    if (!Array.isArray(mainEntity)) continue;

    const expectedQuestions = NEAR_EXPECTED_QUESTIONS_BY_PATH[relPath] || NEAR_EXPECTED_QUESTIONS;
    const questionNames = mainEntity.map((item) => String(item?.name || ''));
    ensure(
      JSON.stringify(questionNames) === JSON.stringify(expectedQuestions),
      `${relPath}: near FAQ questions do not match expected visible FAQ prompts.`
    );

    mainEntity.forEach((item, index) => {
      const label = `${relPath}: FAQ mainEntity[${index}]`;
      ensure(item?.['@type'] === 'Question', `${label} must use @type Question.`);
      ensure(typeof item?.acceptedAnswer === 'object' && item.acceptedAnswer !== null, `${label} missing acceptedAnswer object.`);
      ensure(item?.acceptedAnswer?.['@type'] === 'Answer', `${label} acceptedAnswer must use @type Answer.`);
      ensure(String(item?.acceptedAnswer?.text || '').trim().length > 0, `${label} acceptedAnswer.text is missing.`);
    });

    if (breadcrumbs[0]) validateBreadcrumbList(breadcrumbs[0], relPath);
  }
};

const validateSchemaUrlValue = (value, label) => {
  if (typeof value !== 'string') return;
  const trimmed = value.trim();
  if (!trimmed) return;
  ensure(!trimmed.startsWith('/'), `${label} must be absolute (found relative path).`);
  ensure(isAbsoluteHttpUrl(trimmed), `${label} must be an absolute URL.`);
};

const validateObjectUrlFields = (node, relPath, trail = 'root') => {
  if (Array.isArray(node)) {
    node.forEach((item, index) => validateObjectUrlFields(item, relPath, `${trail}[${index}]`));
    return;
  }
  if (!node || typeof node !== 'object') return;

  for (const [key, value] of Object.entries(node)) {
    const fieldPath = `${relPath}: ${trail}.${key}`;
    if (key === 'sameAs') {
      if (typeof value === 'string') {
        validateSchemaUrlValue(value, fieldPath);
      } else {
        ensure(Array.isArray(value), `${fieldPath} must be an absolute URL or array of absolute URLs.`);
      }
      if (Array.isArray(value)) {
        value.forEach((entry, index) => validateSchemaUrlValue(entry, `${fieldPath}[${index}]`));
      }
    } else if (STRICT_URL_FIELDS.has(key)) {
      if (Array.isArray(value)) {
        value.forEach((entry, index) => validateSchemaUrlValue(entry, `${fieldPath}[${index}]`));
      } else if (value && typeof value === 'object' && typeof value.url === 'string') {
        validateSchemaUrlValue(value.url, `${fieldPath}.url`);
      } else {
        validateSchemaUrlValue(value, fieldPath);
      }
    }

    if (value && typeof value === 'object') {
      validateObjectUrlFields(value, relPath, `${trail}.${key}`);
    }
  }
};

const validateAbsoluteSchemaUrls = async () => {
  const relFiles = new Set([
    ...SERVICE_PROVIDER_REQUIRED_FILES,
    ...(await getLiveNearFiles())
  ]);
  for (const relPath of relFiles) {
    const objects = await readSchemaObjects(relPath);
    objects.forEach((obj, index) => validateObjectUrlFields(obj, relPath, `schema[${index}]`));
  }
};

const validateLocalBusinessUniqueness = async () => {
  const relFiles = new Set([
    SCHEDULE_PATH,
    TARGET_BLOG_PATH,
    EAST_JEWETT_PATH,
    ...SERVICE_PROVIDER_REQUIRED_FILES,
    ...(await getLiveNearFiles())
  ]);

  for (const relPath of relFiles) {
    const objects = await readSchemaObjects(relPath);
    const businesses = objects.filter((obj) => isLocalBusiness(obj?.['@type']));
    if (!businesses.length) continue;

    const canonical = businesses.filter((obj) => obj?.['@id'] === CANONICAL_LOCALBUSINESS_ID);
    ensure(canonical.length === 1, `${relPath}: expected exactly one LocalBusiness with @id ${CANONICAL_LOCALBUSINESS_ID}.`);
    ensure(businesses.length === 1, `${relPath}: expected exactly one LocalBusiness/SportsActivityLocation object to avoid duplicates.`);
  }
};

const validateScheduleEvents = async () => {
  const objects = await readSchemaObjects(SCHEDULE_PATH);
  const events = objects.filter((obj) => hasType(obj, 'Event'));
  ensure(events.length > 0, `${SCHEDULE_PATH}: expected at least one Event object.`);
  if (!events.length) return;

  const now = new Date();
  const maxHorizon = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);

  for (const [index, event] of events.entries()) {
    const label = `${SCHEDULE_PATH}: Event[${index}]`;
    ensure(typeof event.startDate === 'string', `${label} must include startDate.`);
    ensure(typeof event.endDate === 'string', `${label} must include endDate.`);
    ensure(isIso8601WithTimezone(event.startDate), `${label} startDate must be ISO 8601 with timezone.`);
    ensure(isIso8601WithTimezone(event.endDate), `${label} endDate must be ISO 8601 with timezone.`);
    ensure(!event.startTime, `${label} must not use startTime without startDate.`);
    ensure(
      (event.location && typeof event.location === 'object') || (event.location && typeof event.location === 'string'),
      `${label} must include location.`
    );
    ensure(
      event?.organizer?.['@id'] === CANONICAL_LOCALBUSINESS_ID,
      `${label} organizer must reference ${CANONICAL_LOCALBUSINESS_ID}.`
    );

    const startDate = new Date(event.startDate);
    ensure(!Number.isNaN(startDate.getTime()), `${label} startDate is not parseable.`);
    if (!Number.isNaN(startDate.getTime())) {
      ensure(startDate > now, `${label} startDate must be in the future.`);
      ensure(startDate <= maxHorizon, `${label} startDate must be within 29 days.`);
    }
  }
};

const validateServiceProviderReferences = async () => {
  for (const relPath of SERVICE_PROVIDER_REQUIRED_FILES) {
    const objects = await readSchemaObjects(relPath);
    const services = objects.filter((obj) => hasType(obj, 'Service'));
    ensure(services.length >= 1, `${relPath}: expected at least one Service object.`);
    for (const service of services) {
      ensure(
        service?.provider?.['@id'] === CANONICAL_LOCALBUSINESS_ID,
        `${relPath}: Service.provider must reference ${CANONICAL_LOCALBUSINESS_ID}.`
      );
    }
  }
};

const validateOfferPrices = async () => {
  const relFiles = new Set([
    ...SERVICE_PROVIDER_REQUIRED_FILES,
    ...(await getLiveNearFiles())
  ]);
  for (const relPath of relFiles) {
    const objects = await readSchemaObjects(relPath);
    const offers = objects.filter((obj) => hasType(obj, 'Offer'));
    for (const offer of offers) {
      if (offer.price == null) continue;
      const price = String(offer.price).trim();
      ensure(/^\d+(?:\.\d+)?$/.test(price), `${relPath}: Offer.price must be numeric-like (found "${price}").`);
    }
  }
};

const validateDisallowedTypesOnTargets = async () => {
  for (const relPath of TARGET_SCHEMA_FILES) {
    const objects = await readSchemaObjects(relPath);
    for (const obj of objects) {
      for (const schemaType of getTypes(obj)) {
        ensure(!DISALLOWED_TYPES.has(schemaType), `${relPath}: disallowed schema type "${schemaType}" was found.`);
      }
    }
  }
};

const validateTargetBusinessObjects = async () => {
  for (const relPath of TARGET_SCHEMA_FILES) {
    const objects = await readSchemaObjects(relPath);
    const businessCandidates = objects.filter((obj) => obj?.['@id'] === CANONICAL_LOCALBUSINESS_ID);
    const business = businessCandidates.find((obj) => getTypes(obj).length > 0) || businessCandidates[0];
    ensure(Boolean(business), `${relPath}: missing business object with @id ${CANONICAL_LOCALBUSINESS_ID}.`);
    if (!business) continue;

    ensure(hasType(business, 'SportsActivityLocation'), `${relPath}: business object must include SportsActivityLocation type.`);
    ensure(hasType(business, 'LocalBusiness'), `${relPath}: business object must include LocalBusiness type.`);

    const sameAs = Array.isArray(business.sameAs) ? business.sameAs : [];
    ensure(sameAs.length > 0, `${relPath}: business object sameAs must be a non-empty array.`);
    for (const sameAsUrl of sameAs) {
      ensure(isAbsoluteHttpUrl(sameAsUrl), `${relPath}: business sameAs must use absolute URLs.`);
    }
  }
};

const validateTargetBlogPosting = async () => {
  const objects = await readSchemaObjects(TARGET_BLOG_PATH);
  const posts = objects.filter((obj) => hasType(obj, 'BlogPosting'));
  ensure(posts.length === 1, `${TARGET_BLOG_PATH}: expected exactly 1 BlogPosting object, found ${posts.length}.`);
  if (posts.length !== 1) return;

  const post = posts[0];
  const image = post.image;
  const label = `${TARGET_BLOG_PATH}: BlogPosting`;

  ensure(Array.isArray(image), `${label} image must be an array.`);
  if (Array.isArray(image)) {
    ensure(image.length > 0, `${label} image array must not be empty.`);
    image.forEach((value, index) => {
      ensure(typeof value === 'string', `${label} image[${index}] must be a string URL.`);
      ensure(isAbsoluteHttpUrl(value), `${label} image[${index}] must be an absolute URL.`);
    });
  }

  ensure(isIso8601WithTimezone(post.datePublished), `${label} datePublished must be ISO 8601 with timezone.`);
  ensure(isIso8601WithTimezone(post.dateModified), `${label} dateModified must be ISO 8601 with timezone.`);
  ensure(
    post?.publisher?.['@id'] === CANONICAL_LOCALBUSINESS_ID,
    `${label} publisher must reference ${CANONICAL_LOCALBUSINESS_ID}.`
  );
};

const run = async () => {
  await validateCoreLocalBusiness();
  await validateBookIntroRoot();
  await validateSitemapBreadcrumbs();
  await validateBlogPostingImages();
  await validateNearTownSchemas();
  await validateDisallowedTypesOnTargets();
  await validateTargetBusinessObjects();
  await validateTargetBlogPosting();
  await validateAbsoluteSchemaUrls();
  await validateLocalBusinessUniqueness();
  await validateScheduleEvents();
  await validateServiceProviderReferences();
  await validateOfferPrices();

  if (errors.length) {
    for (const error of errors) console.error(`SCHEMA QA FAIL: ${error}`);
    process.exit(1);
  }

  console.log('Schema QA passed for LocalBusiness, FAQ, BreadcrumbList, BlogPosting, and target-page schema contracts.');
};

run().catch((error) => {
  console.error(`SCHEMA QA FAIL: ${error.message}`);
  process.exit(1);
});
