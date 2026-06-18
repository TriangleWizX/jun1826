import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TEMPLATE_PATH = path.join(ROOT, 'near', 'template.html');
const CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');
const LEGACY_REDIRECTS_PATH = path.join(ROOT, 'config', 'legacy-redirects.json');
const FAST_FACTS_PATH = path.join(ROOT, 'data', 'near-fast-facts.json');
const DECISION_CONTENT_PATH = path.join(ROOT, 'data', 'near-decision-content.json');
const OUTPUT_ROOT = path.join(ROOT, 'near');
const CUSTOM_NEAR_SLUGS = new Set(['windham-ny']);

const readJson = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf8'));

const normalizeStatus = (value = '') => String(value).trim().toLowerCase();

const slugify = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const replaceAll = (source, map) => {
  let output = source;
  Object.entries(map).forEach(([token, value]) => {
    const safe = value == null ? '' : String(value);
    output = output.replace(new RegExp(escapeRegExp(token), 'g'), safe);
  });
  return output;
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const STRAIGHT_LINE_MILES = Object.freeze({
  'hunter-ny': '2.2',
  'windham-ny': '9.6',
  'woodstock-ny': '9.7',
  'haines-falls-ny': '1.7',
  'phoenicia-ny': '13.5',
  'cairo-ny': '11.7',
  'catskill-ny': '13.5',
  'palenville-ny': '8.5'
});

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

const buildTownPath = (townByName, label, legacyNearRedirects) => {
  const exact = townByName.get(label);
  const fallbackSlug = slugify(label).replace(/-ny$/, '') + '-ny';
  const rawPath = exact?.slug ? `/near/${exact.slug}` : `/near/${fallbackSlug}`;
  return legacyNearRedirects.get(rawPath) || rawPath;
};

const buildNeighborCandidates = ({ town, towns, townByName, legacyNearRedirects }) => {
  const liveTownBySlug = new Map(
    towns
      .filter((item) => normalizeStatus(item.status) === 'live')
      .map((item) => [String(item.slug || '').trim(), item])
      .filter(([slug]) => Boolean(slug))
  );
  const candidates = [];
  const seen = new Set([`/near/${town.slug}`]);

  const pushPath = (label) => {
    const pathValue = buildTownPath(townByName, label, legacyNearRedirects);
    const slug = pathValue.replace(/^\/near\//, '');
    const linkedTown = liveTownBySlug.get(slug);
    if (!pathValue.startsWith('/near/') || !linkedTown || seen.has(pathValue)) return;
    seen.add(pathValue);
    candidates.push({
      path: pathValue,
      label: `${linkedTown.town}, NY`
    });
  };

  for (const label of Array.isArray(town.neighbors) ? town.neighbors : []) {
    pushPath(label);
  }

  for (const fallback of towns
    .filter((item) => normalizeStatus(item.status) === 'live' && item.slug !== town.slug)
    .sort((a, b) => Number(a.drive_minutes || 999) - Number(b.drive_minutes || 999))) {
    pushPath(fallback.town);
    if (candidates.length >= 3) break;
  }

  return candidates.slice(0, 3);
};

const renderLocalLinkModule = ({ town, towns, townByName, legacyNearRedirects }) => {
  const neighbors = buildNeighborCandidates({ town, towns, townByName, legacyNearRedirects });
  const neighborItems = neighbors
    .map((item) => `      <li><a href="${item.path}">Jiu-Jitsu near ${item.label}</a></li>`)
    .join('\n');

  return `<section class="near-section ss-section ss-local-route-links" aria-label="Local route links">
  <div class="container ss-container">
   <p class="ss-eyebrow">Keep exploring</p>
   <h2>More local Jiu-Jitsu routes near Tannersville</h2>
   <div class="ss-local-route-grid">
    <section class="ss-local-route-group" aria-label="Nearby town links">
     <h3>Nearby towns</h3>
     <ul>
      <li><a href="/nearby-towns">All nearby towns</a></li>
${neighborItems}
     </ul>
    </section>
    <section class="ss-local-route-group" aria-label="First class links">
     <h3>Choose your first class</h3>
     <ul>
      <li><a href="/kids">Kids Jiu-Jitsu</a></li>
      <li><a href="/teen-jiu-jitsu-tannersville-ny">Teen Jiu-Jitsu</a></li>
      <li><a href="/adult-bjj">Adult BJJ</a></li>
      <li><a href="/schedule">Class schedule</a></li>
      <li><a href="/directions">Directions to the studio</a></li>
     </ul>
    </section>
   </div>
  </div>
 </section>`;
};

const buildCanonicalUrl = (slug) => `https://senseisandy.com/near/${slug}`;

const buildFaqSchema = (canonicalUrl, objections = []) => {
  const mainEntity = objections.slice(0, 3).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }));

  return `<script type="application/ld+json">\n${JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      url: canonicalUrl,
      mainEntity
    },
    null,
    2
  )}\n</script>`;
};

const renderBulletList = (items = []) =>
  `<ul>\n${items.map((item) => ` <li>${escapeHtml(item)}</li>`).join('\n')}\n</ul>`;

const renderObjections = (objections = []) =>
  objections
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="mb-3">\n <h3 class="h5 mb-2">${escapeHtml(item.question)}</h3>\n <p class="mb-0">${escapeHtml(item.answer)}</p>\n</article>`
    )
    .join('\n');

const renderProofItems = (items = []) =>
  items
    .slice(0, 3)
    .map(
      (item) =>
        `<article class="mb-3">\n <h3 class="h5 mb-1">${escapeHtml(item.title)}</h3>\n <p class="mb-0">${escapeHtml(item.text)}</p>\n</article>`
    )
    .join('\n');

const renderLocalFacts = (factsEntities = []) => {
  if (!factsEntities.length) {
    return '<p class="mb-0">No local facts published for this page yet.</p>';
  }

  return factsEntities
    .map((entity) => {
      const facts = Array.isArray(entity.facts) ? entity.facts : [];
      const factItems = facts
        .map(
          (fact) =>
            `<li class="mb-3">\n <p class="mb-1">&ldquo;${escapeHtml(fact.quote)}&rdquo;</p>\n <p class="small text-muted mb-0"><strong>Source:</strong> ${escapeHtml(fact.source_name)}. <a href="${escapeHtml(fact.source_url)}" target="_blank" rel="noopener noreferrer">Verified source</a></p>\n</li>`
        )
        .join('\n');

      return `<article class="mb-4">\n <h3 class="h5 mb-2">${escapeHtml(entity.title)}</h3>\n <ul class="list-unstyled mb-0">\n${factItems}\n </ul>\n</article>`;
    })
    .join('\n');
};

const defaultDecisionCopy = (town) => ({
  hero_headline: `Brazilian Jiu-Jitsu for ${town.town} families who want structured beginner progress without chaotic class culture`,
  hero_subhead: `A practical route from ${town.town} to a calm, coach-led room in Tannersville.`,
  hero_for_line: `Built for families and adults who want skill-based training with clear first-class support.`,
  travel_one_liner: `Most families use ${town.main_route} and treat this as a planned weekly anchor.`,
  why_choose: [
    `The route from ${town.town} is familiar, which makes weeknight planning easier.`,
    'Classes run in clear lanes with coached pacing for true beginners.',
    'One room, consistent coaching, and a first-visit process that stays low pressure.'
  ],
  trip_story: `For ${town.town} families, this is usually a planned trip rather than a last-minute stop. The payoff is predictable instruction and a calmer room experience.`,
  first_cadence:
    'Start with the 5:00 PM Youth Class or the 6:00 PM Adult Class once a week, keep Wednesday No-Gi as the flexible second option, and use adult morning options Tuesday/Thursday at 6:30 AM, Wednesday/Friday at 10:00 AM, and Saturday at 10:30 AM when mornings fit better.',
  objections: [
    {
      question: `Is this realistic from ${town.town} on school nights?`,
      answer: 'Most families start with one fixed weekday lane and keep the timing consistent.'
    },
    {
      question: 'Will beginners be overwhelmed on day one?',
      answer: 'No. Day one is controlled, coach-led, and beginner-paced with a skill-first first class.'
    },
    {
      question: 'Can we test fit before committing long term?',
      answer: 'Yes. Start with a single Free Intro and decide next steps after you see the room.'
    }
  ],
  proof_items: [
    {
      title: 'Civic proof',
      text: `${town.town} is served by a documented town/school footprint that supports family routine planning.`
    },
    {
      title: 'Landmark proof',
      text: 'Local landmarks and seasonal patterns shape schedules, which is why this page focuses on reliable indoor structure.'
    },
    {
      title: 'Routine proof',
      text: 'Private lessons at 4:00 PM, Youth Class at 5:00 PM, Adult Class at 6:00 PM, Wednesday No-Gi, and the Saturday No-Gi block gives families a predictable weekly flow.'
    }
  ],
  best_fit: 'Best for families and adult beginners who value coaching quality, clear structure, and low-pressure onboarding.',
  primary_cta_label: 'Reserve Free Intro',
  quiet_cta_line: `If you are comparing options from ${town.town}, start with one intro class before committing to a full weekly plan.`
});

const generate = async () => {
  const [template, towns, legacyRedirectConfig, factsById, decisionBySlug] = await Promise.all([
    fs.readFile(TEMPLATE_PATH, 'utf8'),
    readJson(CONFIG_PATH),
    readJson(LEGACY_REDIRECTS_PATH),
    readJson(FAST_FACTS_PATH),
    readJson(DECISION_CONTENT_PATH)
  ]);

  const legacyRedirects = legacyRedirectConfig && typeof legacyRedirectConfig.redirects === 'object'
    ? legacyRedirectConfig.redirects
    : {};
  const legacyNearRedirects = new Map(
    Object.entries(legacyRedirects).filter(([sourcePath]) => sourcePath.startsWith('/near/'))
  );

  const townByName = new Map(towns.map((town) => [town.town, town]));
  const liveTowns = towns.filter(
    (town) => normalizeStatus(town.status) === 'live' && !CUSTOM_NEAR_SLUGS.has(String(town.slug || '').trim())
  );
  const liveSlugs = new Set(liveTowns.map((town) => town.slug));
  const aliasSlugs = new Set(
    [
      ...towns
        .filter((town) => normalizeStatus(town.status) === 'alias')
        .map((town) => town.slug),
      ...[...legacyNearRedirects.keys()]
        .map((sourcePath) => sourcePath.replace(/^\/near\//, ''))
        .filter(Boolean)
    ]
  );

  let removedAliasDirs = 0;
  for (const slug of aliasSlugs) {
    if (liveSlugs.has(slug)) continue;
    const aliasDir = path.join(OUTPUT_ROOT, slug);
    await fs.rm(aliasDir, { recursive: true, force: true });
    removedAliasDirs += 1;
  }

  let generatedCount = 0;

  for (const town of liveTowns) {
    const canonicalUrl = buildCanonicalUrl(town.slug);
    const fallbackMiles = Math.max(1, Math.round((Number(town.drive_minutes) || 10) * 0.45 * 10) / 10);
    const straightLineMiles = STRAIGHT_LINE_MILES[town.slug] || String(fallbackMiles);
    const factsEntities = (NEAR_FACTS_MAP[town.slug] || []).map((id) => factsById[id]).filter(Boolean);

    const decision = {
      ...defaultDecisionCopy(town),
      ...(decisionBySlug[town.slug] || {})
    };

    const replacements = {
      '[Town]': town.town,
      '[slug]': town.slug,
      '[Road]': town.main_route || '',
      '[DistanceMiles]': straightLineMiles,
      '[MetaTitle]': decision.meta_title || `Brazilian Jiu-Jitsu Near ${town.town}, NY | Sensei Sandy`,
      '[MetaDescription]':
        decision.meta_description ||
        `Brazilian Jiu-Jitsu near ${town.town} NY for families and adults who want calm beginner coaching, clear class lanes, and a Free Intro in Tannersville.`,
      '[HeroHeadline]': decision.hero_headline,
      '[HeroSubhead]': decision.hero_subhead,
      '[HeroForLine]': decision.hero_for_line,
      '[TravelOneLiner]': decision.travel_one_liner,
      '[PrimaryCtaLabel]': decision.primary_cta_label,
      '[ChooseBullets]': renderBulletList(decision.why_choose),
      '[TripStory]': decision.trip_story,
      '[FirstCadence]': decision.first_cadence,
      '[ObjectionItems]': renderObjections(decision.objections),
      '[ProofItems]': renderProofItems(decision.proof_items),
      '[BestFit]': decision.best_fit,
      '[LocalFactsItems]': renderLocalFacts(factsEntities),
      '[LocalLinkModule]': renderLocalLinkModule({
        town,
        towns,
        townByName,
        legacyNearRedirects
      }),
      '[QuietCtaLine]': decision.quiet_cta_line,
      '[FaqSchema]': buildFaqSchema(canonicalUrl, decision.objections)
    };

    const html = replaceAll(template, replacements);

    const outputDir = path.join(OUTPUT_ROOT, town.slug);
    const outputPath = path.join(outputDir, 'index.html');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, html);
    generatedCount += 1;
  }

  console.log(
    `Generated ${generatedCount} near-town pages and removed ${removedAliasDirs} alias directories from near/town-config.json`
  );
};

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
