import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TEMPLATE_PATH = path.join(ROOT, 'near', 'template.html');
const CONFIG_PATH = path.join(ROOT, 'near', 'town-config.json');
const LEGACY_REDIRECTS_PATH = path.join(ROOT, 'config', 'legacy-redirects.json');
const FAST_FACTS_PATH = path.join(ROOT, 'data', 'near-fast-facts.json');
const DECISION_CONTENT_PATH = path.join(ROOT, 'data', 'near-decision-content.json');
const PROVENANCE_PATH = path.join(ROOT, 'data', 'location-provenance.json');
const CONTACT_PATH = path.join(ROOT, 'src', '_data', 'contact.json');
const OUTPUT_ROOT = path.join(ROOT, 'near');
const SRC_TEMPLATE_PATH = path.join(ROOT, 'src', 'near', 'template.html');
const SRC_OUTPUT_ROOT = path.join(ROOT, 'src', 'near');

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

const NEAR_LOCAL_FACTS = Object.freeze({
  'hunter-ny': { entity: 'hunter_town', index: 2, text: 'Hunter Mountain has 67 trails.' },
  'haines-falls-ny': { entity: 'haines_falls', index: 3, text: 'Kaaterskill Falls drops 260 feet.' },
  'windham-ny': { entity: 'windham_town', index: 2, text: 'Windham Mountain has 54 trails.' },
  'palenville-ny': { entity: 'palenville', index: 0, text: '2024 estimate: 870 people.' },
  'cairo-ny': { entity: 'cairo_town', index: 1, text: 'Cairo had 6,641 people in a 2024 estimate.' },
  'catskill-ny': { entity: 'catskill_town', index: 1, text: 'Catskill had 11,195 people in a 2024 estimate.' }
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
      <li><a href="/nearby-towns">All BJJ class towns</a></li>
${neighborItems}
     </ul>
    </section>
    <section class="ss-local-route-group" aria-label="First class links">
     <h3>Choose your first class</h3>
     <ul>
      <li><a href="/bjj-classes/kids-tannersville-ny">Kids Jiu-Jitsu</a></li>
      <li><a href="/bjj-classes/teens-tannersville-ny">Teen Jiu-Jitsu</a></li>
      <li><a href="/bjj-classes/adults-tannersville-ny">Adult BJJ</a></li>
      <li><a href="/bjj-tannersville-ny-directions">Directions to the studio</a></li>
     </ul>
    </section>
   </div>
  </div>
 </section>`;
};

const buildCanonicalUrl = (slug) => `https://senseisandy.com/near/${slug}`;

const buildNearSchema = (canonicalUrl, townName, title, description, objections = []) => {
  const mainEntity = objections.slice(0, 3).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }));

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        'url': canonicalUrl,
        'name': title,
        'description': description,
        'isPartOf': {
          '@id': 'https://senseisandy.com/#website'
        },
        'about': {
          '@id': 'https://senseisandy.com/#business'
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://senseisandy.com/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Nearby Towns',
            'item': 'https://senseisandy.com/nearby-towns'
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': `${townName}, NY`,
            'item': canonicalUrl
          }
        ]
      },
      {
        '@type': 'FAQPage',
        '@id': `${canonicalUrl}#faq`,
        'url': canonicalUrl,
        'mainEntity': mainEntity
      }
    ]
  };

  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
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

const renderLocalFact = (slug, factsById) => {
  const selection = NEAR_LOCAL_FACTS[slug];
  const fact = selection && factsById[selection.entity]?.facts?.[selection.index];
  if (!selection || !fact) throw new Error(`Missing sourced local fact for ${slug}`);
  return `<p>${escapeHtml(selection.text)} <a href="${escapeHtml(fact.source_url)}" rel="noopener noreferrer" target="_blank">Read the source</a>.</p>`;
};

const defaultDecisionCopy = (town) => ({
  hero_headline: `Try BJJ near ${town.town}, NY`,
  hero_subhead: 'Visit the studio in Tannersville. Meet Sandy and ask about a first class.',
  hero_for_line: `For adults and parents of kids or teens from ${town.town}.`,
  primary_cta_label: 'Reserve Free Intro',
  objections: [
    {
      question: 'What happens on my first visit?',
      answer: 'Meet Sandy. See the room. Talk about a class that fits.'
    },
    {
      question: 'Which class should I try?',
      answer: 'See the current schedule. Text Sandy if you want help.'
    },
    {
      question: 'Can my child or teen start?',
      answer: 'Read the kids or teen page, then ask Sandy what fits.'
    }
  ],
  quiet_cta_line: 'Meet Sandy, see the room, and ask about your first class.'
});

const generate = async () => {
  const [template, srcTemplate, towns, legacyRedirectConfig, factsById, decisionBySlug, provenance, contact] = await Promise.all([
    fs.readFile(TEMPLATE_PATH, 'utf8'),
    fs.readFile(SRC_TEMPLATE_PATH, 'utf8'),
    readJson(CONFIG_PATH),
    readJson(LEGACY_REDIRECTS_PATH),
    readJson(FAST_FACTS_PATH),
    readJson(DECISION_CONTENT_PATH),
    readJson(PROVENANCE_PATH),
    readJson(CONTACT_PATH)
  ]);

  const legacyRedirects = legacyRedirectConfig && typeof legacyRedirectConfig.redirects === 'object'
    ? legacyRedirectConfig.redirects
    : {};
  const legacyNearRedirects = new Map(
    Object.entries(legacyRedirects).filter(([sourcePath]) => sourcePath.startsWith('/near/'))
  );

  const townByName = new Map(towns.map((town) => [town.town, town]));
  const liveTowns = towns.filter((town) => normalizeStatus(town.status) === 'live');
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
    const srcAliasDir = path.join(SRC_OUTPUT_ROOT, slug);
    await fs.rm(srcAliasDir, { recursive: true, force: true });
    removedAliasDirs += 1;
  }

  let generatedCount = 0;

  for (const town of liveTowns) {
    const profile = provenance.primary?.[town.slug];
    const safeTown = profile
      ? {
          ...town,
          route_verified: profile.route?.verified !== false,
          recommendations_verified: profile.recommendedFirstClasses?.verified !== false,
          main_route: profile.route?.verified === false ? '' : town.main_route,
          drive_minutes: profile.driveTime?.verified === false ? null : town.drive_minutes
        }
      : { ...town, route_verified: true, recommendations_verified: true };
    const canonicalUrl = buildCanonicalUrl(town.slug);

    const decision = {
      ...defaultDecisionCopy(safeTown),
      ...(decisionBySlug[town.slug] || {})
    };

    const replacements = {
      '[Town]': town.town,
      '[slug]': town.slug,
      '[MetaTitle]': decision.meta_title || `Brazilian Jiu-Jitsu Near ${town.town}, NY | Sensei Sandy`,
      '[MetaDescription]':
        decision.meta_description ||
        `Brazilian Jiu-Jitsu near ${town.town} NY for families and adults who want calm beginner coaching, clear class lanes, and a Free First Visit in Tannersville.`,
      '[HeroHeadline]': decision.hero_headline,
      '[HeroSubhead]': decision.hero_subhead,
      '[HeroForLine]': decision.hero_for_line,
      '[PrimaryCtaLabel]': decision.primary_cta_label,
      '[SmsHref]': escapeHtml(contact.smsHref),
      '[MapsUrl]': escapeHtml(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(`${town.town}, NY`)}&destination=${encodeURIComponent('6045 Main Street, Tannersville, NY 12485')}&travelmode=driving`),
      '[ObjectionItems]': renderObjections(decision.objections),
      '[LocalFact]': renderLocalFact(town.slug, factsById),
      '[LocalLinkModule]': renderLocalLinkModule({
        town,
        towns,
        townByName,
        legacyNearRedirects
      }),
      '[QuietCtaLine]': decision.quiet_cta_line,
      '[JsonLdSchema]': buildNearSchema(
        canonicalUrl,
        town.town,
        decision.meta_title || `Brazilian Jiu-Jitsu Near ${town.town}, NY | Sensei Sandy`,
        decision.meta_description || `Brazilian Jiu-Jitsu near ${town.town} NY for families and adults who want calm beginner coaching, clear class lanes, and a Free First Visit in Tannersville.`,
        decision.objections
      )
    };

    const srcHtml = replaceAll(srcTemplate, replacements).replace(/[\t ]+$/gm, '');
    const srcBody = srcHtml.replace(/^---[\s\S]*?---\s*/, '');
    const html = replaceAll(template, { ...replacements, '[MainContent]': srcBody }).replace(/[\t ]+$/gm, '');
    const outputDir = path.join(OUTPUT_ROOT, town.slug);
    const outputPath = path.join(outputDir, 'index.html');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, html);

    const srcOutputDir = path.join(SRC_OUTPUT_ROOT, town.slug);
    const srcOutputPath = path.join(srcOutputDir, 'index.html');
    await fs.mkdir(srcOutputDir, { recursive: true });
    await fs.writeFile(srcOutputPath, srcHtml);

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
