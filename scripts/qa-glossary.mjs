import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, loadJson } from './url-qa-lib.mjs';

const DATA_PATH = 'data/glossary-terms.json';
const HUB_PATH = 'bjj-glossary/index.html';
const BASE_DIR = path.join(ROOT, 'bjj-glossary');
const LEGACY_REDIRECTS_PATH = 'config/legacy-redirects.json';
const SEARCH_JSON_PATH = 'assets/data/glossary-search.json';
const TERM_MAP_JSON_PATH = 'assets/data/glossary-term-map.json';
const TERM_NAV_INLINE_TOTAL_MAX_BYTES = 200000;

const CATEGORY_SET = new Set(['positions', 'submissions', 'movements', 'basics', 'gi-no-gi']);
const LEVEL_SET = new Set(['beginner', 'intermediate']);
const CONTEXT_SET = new Set(['gi', 'nogi', 'standing', 'ground', 'kids', 'adults', 'wrestling-crossovers', 'self-defense']);
const RELATIONSHIP_ARRAY_KEYS = ['learnBefore', 'usuallyNext', 'confusedWith', 'siblings', 'counters', 'followUps'];
const EN_TERM_PAGE_EXPECTATIONS = {
  tap: {
    h1: 'What tap means in Brazilian Jiu Jitsu',
    title: 'Tap in BJJ | What Tapping Means in Brazilian Jiu Jitsu',
    description: 'Learn what tapping means in Brazilian Jiu Jitsu. Beginner-friendly explanation of how to tap, why it matters, and why tapping keeps training safe.',
    related: ['armbar', 'triangle', 'submission', 'safety', 'beginner-lane']
  },
  guard: {
    h1: 'What guard means in Brazilian Jiu Jitsu',
    title: 'Guard in BJJ | What Guard Means in Brazilian Jiu Jitsu',
    description: 'Learn what guard means in Brazilian Jiu Jitsu. Beginner-friendly explanation of guard, why it matters, common types, and related BJJ terms.',
    related: ['closed-guard', 'half-guard', 'frame', 'shrimp', 'sweep', 'triangle']
  },
  mount: {
    h1: 'What mount means in Brazilian Jiu Jitsu',
    title: 'Mount in BJJ | What Mount Means in Brazilian Jiu Jitsu',
    description: 'Learn what mount means in Brazilian Jiu Jitsu. Beginner-friendly explanation of the mount position, why it matters, and how students learn to stay safe.',
    related: ['bridge', 'frame', 'side-control', 'armbar', 'tap']
  },
  'side-control': {
    h1: 'What side control means in Brazilian Jiu Jitsu',
    title: 'Side Control in BJJ | Meaning and Basics for Beginners',
    description: 'Learn what side control means in Brazilian Jiu Jitsu. Beginner-friendly explanation of side control, pressure, frames, and escapes.',
    related: ['frame', 'shrimp', 'guard', 'mount', 'underhook']
  },
  'closed-guard': {
    h1: 'What closed guard means in Brazilian Jiu Jitsu',
    title: 'Closed Guard in BJJ | Meaning and Basics for Beginners',
    description: 'Learn what closed guard means in Brazilian Jiu Jitsu. Beginner-friendly explanation of closed guard, posture, grips, sweeps, and submissions.',
    related: ['guard', 'armbar', 'triangle', 'sweep', 'posture']
  },
  frame: {
    h1: 'What a frame means in Brazilian Jiu Jitsu',
    title: 'Frame in BJJ | What Frames Mean in Brazilian Jiu Jitsu',
    description: 'Learn what frames mean in Brazilian Jiu Jitsu. Beginner-friendly explanation of how frames create space, protect you, and help escapes.',
    related: ['side-control', 'shrimp', 'guard', 'mount', 'hip-escape']
  },
  shrimp: {
    h1: 'What shrimp means in Brazilian Jiu Jitsu',
    title: 'Shrimp in BJJ | Hip Escape Meaning and Beginner Basics',
    description: 'Learn what shrimp means in Brazilian Jiu Jitsu. Beginner-friendly explanation of the hip escape movement and why it helps guard recovery and escapes.',
    related: ['frame', 'guard', 'side-control', 'hip-escape', 'guard-recovery']
  },
  sweep: {
    h1: 'What a sweep means in Brazilian Jiu Jitsu',
    title: 'Sweep in BJJ | What Sweeps Mean in Brazilian Jiu Jitsu',
    description: 'Learn what a sweep means in Brazilian Jiu Jitsu. Beginner-friendly explanation of how sweeps reverse position from bottom to top.',
    related: ['guard', 'closed-guard', 'frame', 'mount', 'base']
  },
  armbar: {
    h1: 'What an armbar means in Brazilian Jiu Jitsu',
    title: 'Armbar in BJJ | What an Armbar Means in Brazilian Jiu Jitsu',
    description: 'Learn what an armbar means in Brazilian Jiu Jitsu. Beginner-friendly explanation of the armbar submission, safety, tapping, and common positions.',
    related: ['tap', 'guard', 'closed-guard', 'mount', 'triangle']
  },
  triangle: {
    h1: 'What a triangle means in Brazilian Jiu Jitsu',
    title: 'Triangle in BJJ | Triangle Choke Meaning and Basics',
    description: 'Learn what a triangle means in Brazilian Jiu Jitsu. Beginner-friendly explanation of the triangle choke, how it works, safety, and related BJJ terms.',
    related: ['tap', 'guard', 'closed-guard', 'armbar', 'submission']
  }
};

const ensure = (condition, message) => {
  if (!condition) throw new Error(message);
};

const readFile = (relPath) => fs.readFile(path.join(ROOT, relPath), 'utf8');

const normalizeSearchText = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\bno\s+gi\b/g, 'nogi')
  .replace(/\bno-gi\b/g, 'nogi')
  .replace(/\br\.n\.c\b/g, 'rnc')
  .replace(/\s+/g, ' ')
  .trim();

const slugify = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const escapeRegExp = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const assertOrdered = (html, needles, label) => {
  let cursor = -1;
  for (const needle of needles) {
    const index = html.indexOf(needle);
    ensure(index !== -1, `${label} missing ${needle}.`);
    ensure(index > cursor, `${label} has ${needle} out of order.`);
    cursor = index;
  }
};

const main = async () => {
  const terms = await loadJson(DATA_PATH);
  ensure(Array.isArray(terms) && terms.length > 0, `Expected at least one glossary term in ${DATA_PATH}.`);

  const requiredFields = [
    'id', 'slug', 'term', 'displayTerm', 'category', 'categoryLabel', 'level', 'levelLabel',
    'summary', 'definition', 'beginnerTranslation', 'commonMistake', 'coachCue', 'safetyNote'
  ];

  const slugs = new Set();
  const redirectUnion = new Set();
  let totalInlineNavBytes = 0;
  for (const term of terms) {
    for (const field of requiredFields) {
      ensure(String(term?.[field] || '').trim(), `Missing required field "${field}" for glossary term "${term?.slug || 'unknown'}".`);
    }
    ensure(CATEGORY_SET.has(term.category), `Invalid glossary category "${term.category}" for "${term.slug}".`);
    ensure(LEVEL_SET.has(term.level), `Invalid glossary level "${term.level}" for "${term.slug}".`);
    ensure(Array.isArray(term.contexts) && term.contexts.length > 0, `${term.slug} must define at least one context.`);
    for (const context of term.contexts) ensure(CONTEXT_SET.has(context), `${term.slug} has invalid context "${context}".`);
    ensure(typeof term.isCommon === 'boolean', `${term.slug} isCommon must be boolean.`);
    ensure(typeof term.isFoundational === 'boolean', `${term.slug} isFoundational must be boolean.`);
    ensure(Array.isArray(term.redirectFrom), `${term.slug} redirectFrom must be an array.`);

    ensure(Array.isArray(term.whatItDoes) && term.whatItDoes.length >= 3, `${term.slug} must define at least 3 whatItDoes items.`);
    ensure(Array.isArray(term.whereYouHearIt) && term.whereYouHearIt.length >= 1, `${term.slug} must define whereYouHearIt items.`);
    ensure(Array.isArray(term.related) && term.related.length >= 3, `${term.slug} must define at least 3 related terms.`);
    ensure(Array.isArray(term.faq) && term.faq.length >= 2, `${term.slug} must define at least 2 faq items.`);
    if (term.relationships != null) {
      ensure(term.relationships && typeof term.relationships === 'object', `${term.slug} relationships must be an object when present.`);
      for (const key of RELATIONSHIP_ARRAY_KEYS) {
        if (term.relationships[key] != null) {
          ensure(Array.isArray(term.relationships[key]), `${term.slug} relationships.${key} must be an array.`);
        }
      }
    }

    ensure(!slugs.has(term.slug), `Duplicate glossary slug "${term.slug}".`);
    slugs.add(term.slug);
    ensure(!redirectUnion.has(term.slug), `Slug collision in redirect union "${term.slug}".`);
    redirectUnion.add(term.slug);
    for (const rf of term.redirectFrom) {
      const rfs = slugify(rf);
      ensure(Boolean(rfs), `${term.slug} has empty redirectFrom value.`);
      ensure(!redirectUnion.has(rfs), `Redirect collision on "${rfs}".`);
      redirectUnion.add(rfs);
    }
  }

  for (const term of terms) {
    for (const related of term.related) {
      ensure(slugs.has(related), `${term.slug} references missing related term "${related}".`);
      ensure(related !== term.slug, `${term.slug} cannot self-reference in related.`);
    }
  }

  const hubHtml = await readFile(HUB_PATH);
  ensure(hubHtml.includes('id="glossary-filter-form"'), 'Glossary hub missing filter form.');
  ensure(hubHtml.includes('id="glossary-q"'), 'Glossary hub missing search input.');
  ensure(hubHtml.includes('data-filter-category='), 'Glossary hub missing category chips.');
  ensure(hubHtml.includes('data-filter-level='), 'Glossary hub missing level chips.');
  ensure(hubHtml.includes('data-filter-context='), 'Glossary hub missing context chips.');
  ensure(hubHtml.includes('data-filter-common='), 'Glossary hub missing common/foundational chips.');
  ensure(hubHtml.includes('id="surprise-me-inline"'), 'Glossary hub missing random button in controls.');
  ensure(hubHtml.includes('id="surprise-me-az"'), 'Glossary hub missing random button in A-Z rail.');
  ensure(hubHtml.includes('id="glossary-theme"'), 'Glossary hub missing theme control.');
  ensure(hubHtml.includes('id="copy-state-link"'), 'Glossary hub missing copy state link action.');
  const buyerPathMatch = hubHtml.match(/<section class="[^"]*\bss-glossary-paths\b[^"]*"/);
  ensure(Boolean(buyerPathMatch), 'Glossary hub missing buyer path section.');
  ensure(hubHtml.includes('class="ss-paths-inner"'), 'Glossary hub missing buyer path inner wrapper.');
  ensure(hubHtml.includes('class="ss-paths-header"'), 'Glossary hub missing buyer path header.');
  ensure(hubHtml.includes('class="ss-path-grid"'), 'Glossary hub missing buyer path grid.');
  ensure(!hubHtml.includes('<div class="container">\n    <div class="text-center mb-5">'), 'Glossary buyer path section still uses legacy Bootstrap wrapper.');
  ensure(hubHtml.includes('data-path="parent"'), 'Glossary hub missing parent buyer path.');
  ensure(hubHtml.includes('data-path="adult-beginner"'), 'Glossary hub missing adult beginner buyer path.');
  ensure(hubHtml.includes('data-path="sparring-nerves"'), 'Glossary hub missing sparring nerves buyer path.');
  ensure(hubHtml.includes('data-path="self-defense"'), 'Glossary hub missing self-defense buyer path.');
  ensure(buyerPathMatch.index < hubHtml.indexOf('<legend>Filter by category</legend>'), 'Buyer path section must appear before category filters.');

  for (const term of terms) {
    const termPath = path.join(BASE_DIR, term.slug, 'index.html');
    const termHtml = await fs.readFile(termPath, 'utf8');
    const termLabel = `${term.slug} term page`;

    ensure(termHtml.includes(`href="https://senseisandy.com/bjj-glossary/${term.slug}"`), `Canonical missing for ${term.slug}.`);
    ensure(termHtml.includes(`"url": "https://senseisandy.com/bjj-glossary/${term.slug}"`), `${term.slug} schema must use canonical url.`);
    ensure(termHtml.includes(`"mainEntityOfPage": "https://senseisandy.com/bjj-glossary/${term.slug}"`), `${term.slug} schema must use canonical mainEntityOfPage.`);
    ensure(new RegExp(`<h1\\b[^>]*>${escapeRegExp(term.h1 || term.displayTerm)}</h1>`).test(termHtml), `${term.slug} must use configured H1.`);
    ensure(termHtml.includes('id="back-to-results"'), `${term.slug} missing back-to-results link.`);
    ensure(termHtml.includes('id="copy-term-link"'), `${term.slug} missing copy-term-link action.`);
    ensure(termHtml.includes('id="prev-term"'), `${term.slug} missing prev-term link.`);
    ensure(termHtml.includes('id="next-term"'), `${term.slug} missing next-term link.`);
    ensure(termHtml.includes('id="glossary-term-nav-data"'), `${term.slug} missing term nav payload.`);
    const navPayloadMatch = termHtml.match(/<script id="glossary-term-nav-data" type="application\/json">([\s\S]*?)<\/script>/);
    ensure(Boolean(navPayloadMatch), `${term.slug} missing inline nav JSON body.`);
    const navPayload = String(navPayloadMatch[1] || '').trim();
    totalInlineNavBytes += Buffer.byteLength(navPayload, 'utf8');
    ensure(!navPayload.includes('"terms":['), `${term.slug} still embeds full inline nav terms payload.`);

    assertOrdered(termHtml, [
      'id="definition"',
      'id="beginner-translation"',
      'id="why-it-matters"',
      'id="beginners-should-know"',
      'id="common-class-phrases"',
      'id="safety-cue"',
      'id="related-terms"',
      'class="ss-term-next-step"',
      'id="faq"',
      'id="reviews"'
    ], termLabel);

    for (const oldHeading of [
      '<h2>What it does</h2>',
      '<h2>When you hear it in class</h2>',
      '<h2>See it</h2>',
      '<h2>Best next glossary pages</h2>',
      '<h2>Relationship map</h2>'
    ]) {
      ensure(!termHtml.includes(oldHeading), `${term.slug} still includes old heading ${oldHeading}.`);
    }

    ensure(termHtml.includes('<h2>Quick definition</h2>'), `${term.slug} missing Quick definition heading.`);
    ensure(termHtml.includes('<h2>Beginner translation</h2>'), `${term.slug} missing Beginner translation heading.`);
    ensure(termHtml.includes('<h2>Why it matters</h2>'), `${term.slug} missing Why it matters heading.`);
    ensure(termHtml.includes('<h2>What beginners should know</h2>'), `${term.slug} missing beginner knowledge heading.`);
    ensure(termHtml.includes('<h2>Common class phrases</h2>'), `${term.slug} missing common class phrases heading.`);
    ensure(termHtml.includes('<h2>Related terms</h2>'), `${term.slug} missing related terms heading.`);
    ensure(termHtml.includes('Want to feel this in class?'), `${term.slug} missing shared CTA heading.`);
    ensure(termHtml.includes('href="/book-free-intro"'), `${term.slug} missing Reserve Free Intro CTA.`);
    ensure(termHtml.includes('href="/schedule"'), `${term.slug} missing See Schedule CTA.`);
    ensure(termHtml.includes('<h2>FAQ</h2>'), `${term.slug} missing FAQ heading.`);
    ensure(termHtml.includes('<h2>What local families say</h2>'), `${term.slug} missing reviews heading.`);
    ensure(termHtml.indexOf('id="related-terms"') < termHtml.indexOf('<h3>Relationship map</h3>'), `${term.slug} relationship map must sit inside related terms flow.`);
  }

  for (const [slug, expected] of Object.entries(EN_TERM_PAGE_EXPECTATIONS)) {
    const term = terms.find((item) => item.slug === slug);
    ensure(Boolean(term), `Expected ${slug} glossary term.`);
    ensure(term.h1 === expected.h1, `${slug} data has unexpected h1.`);
    ensure(term.seo?.title === expected.title, `${slug} data has unexpected SEO title.`);
    ensure(term.seo?.description.startsWith(expected.description), `${slug} data has unexpected meta description prefix.`);
    ensure(JSON.stringify(term.related) === JSON.stringify(expected.related), `${slug} related map does not match EN-TERM-PAGES 10.`);

    const termHtml = await fs.readFile(path.join(BASE_DIR, slug, 'index.html'), 'utf8');
    ensure(termHtml.includes(`<title>${expected.title}</title>`), `${slug} page missing requested title.`);
    ensure(
      new RegExp(`<meta name="description" content="${escapeRegExp(expected.description)}[^"]*">`).test(termHtml),
      `${slug} page missing normalized meta description.`
    );
    ensure(termHtml.includes(`<h1 class="glossary-hero__title">${expected.h1}</h1>`), `${slug} page missing requested H1.`);
    for (const relatedSlug of expected.related) {
      ensure(termHtml.includes(`href="/bjj-glossary/${relatedSlug}"`), `${slug} missing related card link to ${relatedSlug}.`);
    }
  }

  const guardHtml = await fs.readFile(path.join(BASE_DIR, 'guard', 'index.html'), 'utf8');
  ensure(guardHtml.includes('Guard teaches smaller students how to stay safe, slow things down, and work back to a better position.'), 'Guard missing supplied why-it-matters copy.');
  ensure(guardHtml.includes('Guard is not just holding on. Good guard uses movement, distance, frames, grips, and timing.'), 'Guard missing supplied beginner copy.');

  const tapHtml = await fs.readFile(path.join(BASE_DIR, 'tap', 'index.html'), 'utf8');
  ensure(tapHtml.includes('Tapping means, “Stop. I am done.” You can tap with your hand, your foot, or your voice.'), 'Tap missing supplied beginner translation.');
  ensure(tapHtml.includes('The tap is one of the most important safety tools in Jiu Jitsu.'), 'Tap missing supplied why-it-matters copy.');
  ensure(tapHtml.includes('Tap means stop. You can tap your partner, tap the mat, or say'), 'Tap missing safety FAQ answer.');
  ensure(tapHtml.includes('Early taps build trust and protect both training partners.'), 'Tap missing beginner tap FAQ answer.');

  const updatesHtml = await readFile('bjj-glossary/updates/index.html');
  const updatesMetricsBlockMatch = updatesHtml.match(/<h2>What changed recently<\/h2>[\s\S]*?<div class="ss-path-grid">([\s\S]*?)<\/div>/);
  ensure(Boolean(updatesMetricsBlockMatch), 'Updates page missing recent metrics block.');
  const updatesMetricsBlock = updatesMetricsBlockMatch[1];
  ensure(updatesMetricsBlock.includes('Total coverage'), 'Updates page missing total coverage metric.');
  ensure(updatesMetricsBlock.includes('Beginner focus'), 'Updates page missing beginner focus metric.');
  ensure(updatesMetricsBlock.includes('Teaching support'), 'Updates page missing teaching support metric.');
  ensure(updatesMetricsBlock.includes('Common language'), 'Updates page missing common language metric.');
  ensure(new RegExp(`\\b${terms.length}\\s+terms\\b`).test(updatesMetricsBlock), `Updates page missing total terms count (${terms.length}) in metrics.`);

  const searchJson = await loadJson(SEARCH_JSON_PATH);
  const termMapJson = await loadJson(TERM_MAP_JSON_PATH);
  ensure(Array.isArray(searchJson) && searchJson.length === terms.length, 'glossary-search.json missing terms.');
  ensure(totalInlineNavBytes <= TERM_NAV_INLINE_TOTAL_MAX_BYTES, `Inline term nav payload too large (${totalInlineNavBytes} bytes).`);
  ensure(termMapJson && typeof termMapJson === 'object', 'glossary-term-map.json must be an object map.');

  const guard = searchJson.find((t) => t.slug === 'guard');
  ensure(Boolean(guard), 'Expected guard in glossary-search index.');
  for (const key of ['slug', 'term', 'category', 'level', 'contexts', 'aliases', 'redirectFrom', 'common', 'foundational', 'searchText']) {
    ensure(Object.prototype.hasOwnProperty.call(guard, key), `guard missing ${key} in glossary-search index.`);
  }
  ensure(typeof guard.searchText === 'string' && guard.searchText.length > 0, 'guard missing normalized searchText.');
  ensure(typeof guard.common === 'boolean', 'guard common flag must be boolean in glossary-search index.');
  ensure(typeof guard.foundational === 'boolean', 'guard foundational flag must be boolean in glossary-search index.');

  for (const slug of ['safety', 'beginner-lane', 'bully-proof']) {
    ensure(slugs.has(slug), `Expected ${slug} glossary term.`);
    ensure(hubHtml.includes(`href="/bjj-glossary/${slug}"`), `Expected ${slug} path chip link on glossary hub.`);
  }

  const rnc = searchJson.find((t) => t.slug === 'rear-naked-choke');
  ensure(Boolean(rnc), 'Expected rear-naked-choke term for alias behavior checks.');
  ensure((rnc.aliases || []).some((a) => normalizeSearchText(a) === 'rnc'), 'Expected rear-naked-choke alias to include rnc.');

  const armbar = searchJson.find((t) => t.slug === 'armbar');
  ensure(Boolean(armbar), 'Expected armbar in glossary-search index.');
  ensure((armbar.aliases || []).some((a) => normalizeSearchText(a) === 'juji gatame'), 'Expected armbar aliases to include juji gatame.');

  const bridgeAndRollTarget = termMapJson['bridge-and-roll'];
  ensure(Boolean(bridgeAndRollTarget), 'Expected bridge-and-roll alias mapping in glossary-term-map.');

  const redirectsConfig = await loadJson(LEGACY_REDIRECTS_PATH);
  ensure(redirectsConfig && redirectsConfig.redirects && typeof redirectsConfig.redirects === 'object', 'legacy redirects must be object map.');
  ensure(redirectsConfig.redirects['/bjj-glossary/rnc'] === '/bjj-glossary/rear-naked-choke', 'Expected /bjj-glossary/rnc redirect.');
  ensure(redirectsConfig.redirects['/bjj-glossary/juji-gatame'] === '/bjj-glossary/armbar', 'Expected /bjj-glossary/juji-gatame redirect.');

  console.log(`qa-glossary passed (${terms.length} terms validated).`);
};

main().catch((error) => {
  console.error(`qa-glossary failed: ${error.message}`);
  process.exit(1);
});
