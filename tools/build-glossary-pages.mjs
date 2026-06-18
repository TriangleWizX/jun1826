import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'data', 'glossary-terms.json');
const OUTPUT_ROOT = path.join(ROOT, 'bjj-glossary');
const LEGACY_REDIRECTS_PATH = path.join(ROOT, 'config', 'legacy-redirects.json');
const ASSETS_DATA_ROOT = path.join(ROOT, 'assets', 'data');
const CANONICAL_ORIGIN = 'https://senseisandy.com';
const CSS_VERSION = '20260420';
const ANALYTICS_HEAD_INCLUDE = '  <!--#include virtual="/_includes/analytics-head.html" -->';
const GLOSSARY_FILTERS_SRC = '/js/glossary-filters.js';

const CATEGORY_LABELS = Object.freeze({
  positions: 'Positions',
  submissions: 'Submissions',
  movements: 'Movements',
  basics: 'Basics',
  'gi-no-gi': 'Gi / No-Gi'
});

const LEVEL_LABELS = Object.freeze({
  beginner: 'Best for beginners',
  intermediate: 'Intermediate ideas'
});

const CONTEXT_LABELS = Object.freeze({
  gi: 'Gi',
  nogi: 'No-Gi',
  standing: 'Standing',
  ground: 'Ground',
  kids: 'Kids',
  adults: 'Adults',
  'wrestling-crossovers': 'Wrestling Crossovers',
  'self-defense': 'Self Defense'
});

const SEARCHABLE_CONTEXT_KEYS = new Set(Object.keys(CONTEXT_LABELS));

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const slugify = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const normalizeSearchText = (value = '') => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s-]/g, ' ')
  .replace(/\bno\s+gi\b/g, 'nogi')
  .replace(/\bno-gi\b/g, 'nogi')
  .replace(/\br\.n\.c\b/g, 'rnc')
  .replace(/\s+/g, ' ')
  .trim();

const canonicalUrlFor = (slug = '') => slug ? `${CANONICAL_ORIGIN}/bjj-glossary/${slug}` : `${CANONICAL_ORIGIN}/bjj-glossary`;
const glossaryPathFor = (slug = '') => slug ? `/bjj-glossary/${slug}` : '/bjj-glossary';
const alphaLetter = (term) => String(term || '').trim().charAt(0).toUpperCase();
const hashedAssetPath = async (assetPath) => {
  const relPath = assetPath.replace(/^\/+/, '');
  const absPath = path.join(ROOT, relPath);
  const ext = path.extname(absPath);
  const base = path.basename(absPath, ext);
  const hash = crypto.createHash('md5').update(await fs.readFile(absPath)).digest('hex').slice(0, 6);
  return `${path.posix.dirname(assetPath)}/${base}.${hash}${ext}`.replace('//', '/');
};

const parseListFromLegacyString = (value, fallback = []) => {
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  if (!value || typeof value !== 'string') return fallback;
  const bits = value
    .split(/\.|;|,|\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
  return bits.length ? bits : fallback;
};

const normalizeSlugList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
};

const normalizeStringList = (value) => {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
};

const seoTitle = (term) => `${term} in BJJ: Definition, Class Meaning, Related Terms | Sensei Sandy`;
const seoDescription = (term) => {
  const base = `Learn what ${String(term).toLowerCase()} means in BJJ, why beginners hear it in class, and how Sensei Sandy BJJ teaches it safely in Tannersville NY.`;
  return `${base}${base.length >= 136 ? ' Examples.' : ' Beginner examples.'}`;
};
const fitSeoDescription = (value) => {
  let description = String(value || '').replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
  if (!description) return description;

  if (description.length > 155) {
    const clipped = description.slice(0, 154);
    description = clipped.slice(0, clipped.lastIndexOf(' ')).replace(/[.,;:!?-]+$/g, '');
    return `${description}.`;
  }

  if (description.length >= 140) return description;

  const additions = [
    ' Beginner examples.',
    ' Local class examples.',
    ' Plain-English examples.',
    ' First-class examples.'
  ];

  for (const addition of additions) {
    const candidate = `${description}${addition}`;
    if (candidate.length >= 140 && candidate.length <= 155) return candidate;
  }

  while (description.length < 140 && `${description} Examples.`.length <= 155) {
    description = `${description} Examples.`;
  }
  return description;
};

const ensureArrayMin = (arr, min, fillerFactory) => {
  const next = Array.isArray(arr) ? arr.filter(Boolean) : [];
  let i = 0;
  while (next.length < min) {
    next.push(fillerFactory(i));
    i += 1;
  }
  return next;
};

const inferContexts = (raw, normalizedCategory = '') => {
  if (Array.isArray(raw.contexts) && raw.contexts.length) return raw.contexts;
  const set = new Set(['adults']);
  if (normalizedCategory === 'gi-no-gi') {
    set.add('gi');
    set.add('nogi');
  }
  if (['positions', 'submissions', 'basics'].includes(normalizedCategory)) set.add('ground');
  if (normalizedCategory === 'movements') set.add('standing');
  if (/self defense|self-defense/i.test(`${raw.term || ""} ${raw.summary || ""}`)) set.add('self-defense');
  return [...set];
};

const normalizeTerm = (raw) => {
  const slug = String(raw.slug || raw.id || '').trim();
  const term = String(raw.term || raw.displayTerm || slug).trim();
  const summary = String(raw.summary || raw.shortDefinition || '').trim();
  const definition = String(raw.definition || raw.heroSummary || raw.whyItMatters || summary).trim();
  const beginnerTranslation = String(raw.beginnerTranslation || '').trim();
  const whatItDoes = parseListFromLegacyString(raw.whatItDoes, [String(raw.whatItDoes || '').trim()].filter(Boolean));
  const whereYouHearIt = parseListFromLegacyString(raw.whereYouHearIt || raw.whereYouSeeIt, [String(raw.whereYouSeeIt || '').trim()].filter(Boolean));
  const firstDay = normalizeStringList(raw.firstDay || []);
  const related = normalizeSlugList(raw.related || raw.relatedTerms || []);
  const bestNext = normalizeSlugList(raw.bestNext || raw.sidebarRelatedSlugs || related.slice(0, 4));
  const aliases = normalizeStringList(raw.aliases || raw.searchAliases || []);
  const redirectFrom = normalizeStringList(raw.redirectFrom || []);
  const faqRaw = Array.isArray(raw.faq) ? raw.faq : [];
  const faq = faqRaw
    .map((item) => ({
      q: String(item?.q || item?.question || '').trim(),
      a: String(item?.a || item?.answer || '').trim()
    }))
    .filter((item) => item.q && item.a);

  const relationshipGroups = raw.relationships && typeof raw.relationships === 'object' ? raw.relationships : {};
  const relationshipFallback = normalizeSlugList(raw.related || raw.relatedTerms || []);
  const relationships = {
    learnBefore: normalizeSlugList(relationshipGroups.learnBefore),
    usuallyNext: normalizeSlugList(relationshipGroups.usuallyNext),
    confusedWith: normalizeSlugList(relationshipGroups.confusedWith),
    parentConcept: String(relationshipGroups.parentConcept || '').trim(),
    siblings: normalizeSlugList(relationshipGroups.siblings),
    counters: normalizeSlugList(relationshipGroups.counters),
    followUps: normalizeSlugList(relationshipGroups.followUps)
  };
  if (!relationships.learnBefore.length) relationships.learnBefore = relationshipFallback.slice(0, 3);
  if (!relationships.usuallyNext.length) relationships.usuallyNext = relationshipFallback.slice(0, 3);
  if (!relationships.confusedWith.length) relationships.confusedWith = relationshipFallback.slice(0, 3);

  const media = raw.media && typeof raw.media === 'object' ? {
    type: String(raw.media.type || 'video').trim(),
    src: String(raw.media.src || '').trim(),
    poster: String(raw.media.poster || '').trim(),
    caption: String(raw.media.caption || '').trim(),
    watchFor: String(raw.media.watchFor || '').trim()
  } : null;

  const category = String(raw.category || '').trim();
  const contexts = inferContexts(raw, category)
    .map((value) => String(value).trim().toLowerCase())
    .filter((value) => SEARCHABLE_CONTEXT_KEYS.has(value));

  const normalized = {
    id: slug,
    slug,
    term,
    displayTerm: String(raw.displayTerm || term).trim(),
    category,
    categoryLabel: CATEGORY_LABELS[category] || String(raw.categoryLabel || '').trim(),
    level: String(raw.level || '').trim(),
    levelLabel: LEVEL_LABELS[String(raw.level || '').trim()] || String(raw.levelLabel || '').trim(),
    summary,
    definition,
    beginnerTranslation,
    firstDay,
    whatItDoes,
    whereYouHearIt,
    commonMistake: String(raw.commonMistake || `A common mistake with ${term.toLowerCase()} is using it passively instead of with structure and timing.`).trim(),
    related,
    bestNext,
    aliases,
    redirectFrom,
    contexts,
    isCommon: Boolean(raw.isCommon),
    isFoundational: Boolean(raw.isFoundational),
    createdAt: String(raw.createdAt || '').trim(),
    updatedAt: String(raw.updatedAt || '').trim(),
    coachCue: String(raw.coachCue || `Coach cue: Stay calm and keep your structure while working ${term.toLowerCase()}.`).trim(),
    safetyNote: String(raw.safetyNote || `Safety note: Move with control and communicate early while training ${term.toLowerCase()}.`).trim(),
    h1: String(raw.h1 || raw.termPageH1 || term).trim(),
    whyItMatters: String(raw.whyItMatters || raw.definition || '').trim(),
    whatBeginnersShouldKnow: String(raw.whatBeginnersShouldKnow || raw.commonMistake || '').trim(),
    commonClassPhrases: normalizeStringList(raw.commonClassPhrases || []),
    termCta: String(raw.termCta || raw.cta || '').trim(),
    media,
    relationships,
    faq,
    seo: {
      title: String(raw?.seo?.title || raw.metaTitle || seoTitle(term)).trim(),
      description: fitSeoDescription(raw?.seo?.description || raw.metaDescription || seoDescription(term))
    }
  };

  normalized.whatItDoes = ensureArrayMin(normalized.whatItDoes, 3, (i) => {
    if (i === 0) return `Builds control and clearer decisions during ${term.toLowerCase()}.`;
    if (i === 1) return `Improves timing and structure for safer training.`;
    return `Connects to other common BJJ terms you hear in class.`;
  }).map((v) => String(v).trim()).filter(Boolean);

  normalized.whereYouHearIt = ensureArrayMin(normalized.whereYouHearIt, 3, (i) => {
    if (i === 0) return `${term} in drills`;
    if (i === 1) return `${term} during positional rounds`;
    return `${term} during live training`;
  }).map((v) => String(v).trim()).filter(Boolean);

  if (!normalized.media) {
    normalized.media = {
      type: 'video',
      src: '',
      poster: '',
      caption: `${term} example`,
      watchFor: `Watch for how ${term.toLowerCase()} is controlled before speed or force.`
    };
  } else {
    if (!normalized.media.type) normalized.media.type = 'video';
    if (!normalized.media.caption) normalized.media.caption = `${term} example`;
    if (!normalized.media.watchFor) normalized.media.watchFor = `Watch for how ${term.toLowerCase()} is controlled before speed or force.`;
  }

  normalized.firstDay = ensureArrayMin(normalized.firstDay, 3, (i) => {
    const source = [...normalized.whatItDoes, ...normalized.whereYouHearIt]
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    if (source[i]) return source[i];
    if (i === 0) return `${term} helps beginners recognize what is happening before they feel overwhelmed.`;
    if (i === 1) return `You may hear ${term.toLowerCase()} in early drills, positional work, or safety reminders.`;
    return `Knowing ${term.toLowerCase()} gives you a calmer way to ask questions and reset safely.`;
  }).map((v) => String(v).trim()).filter(Boolean);

  normalized.faq = ensureArrayMin(normalized.faq, 2, (i) => ({
    q: i === 0 ? `What does ${term.toLowerCase()} mean in BJJ?` : `How should beginners train ${term.toLowerCase()} safely?`,
    a: i === 0
      ? `${term} means ${normalized.definition.charAt(0).toLowerCase()}${normalized.definition.slice(1)}`
      : normalized.safetyNote.replace(/^Safety note:\s*/i, '') + ' ' + normalized.beginnerTranslation
  }));

  if (!normalized.categoryLabel) normalized.categoryLabel = CATEGORY_LABELS[normalized.category] || normalized.category;
  if (!normalized.levelLabel) normalized.levelLabel = LEVEL_LABELS[normalized.level] || normalized.level;
  if (!normalized.commonClassPhrases.length) normalized.commonClassPhrases = normalized.whereYouHearIt.slice(0, 5);
  if (!normalized.termCta) normalized.termCta = 'Glossary terms make more sense once you feel them on the mat.';

  return normalized;
};

const loadTerms = async () => JSON.parse(await fs.readFile(DATA_PATH, 'utf8')).map(normalizeTerm);

const validateTerms = (terms) => {
  if (!Array.isArray(terms) || !terms.length) throw new Error('Glossary data is empty.');

  const slugSet = new Set();
  for (const term of terms) {
    slugSet.add(term.slug);
  }

  for (const term of terms) {
    for (const relatedSlug of term.related) {
      if (!slugSet.has(relatedSlug)) console.warn(`Glossary term "${term.slug}" references missing related term "${relatedSlug}".`);
    }
  }
};

const renderLayout = ({ title, description, canonicalUrl, bodyClass = 'page-glossary', extraHead = '', body, scripts = [] }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${CANONICAL_ORIGIN}/assets/images/hero.webp">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="/assets/css/global.css" />
  <link rel="stylesheet" href="/assets/css/components.css" />
  <link rel="stylesheet" href="/assets/css/pages/glossary.css" />
${ANALYTICS_HEAD_INCLUDE}
${extraHead}
  <!--#include virtual="/_includes/local-business-schema.jsonld.html" -->
</head>
<body class="${escapeHtml(bodyClass)}" data-glossary-theme-root>
<!--#include virtual="/nav-include.html" -->
${body}
<!--#include virtual="/cta-footer.html" -->
<!--#include virtual="/footer-include.html" -->
${scripts.map((src) => `<script src="${src}" defer></script>`).join('\n')}
</body>
</html>
`;

const renderHubSchema = (terms) => {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTermSet',
        '@id': `${canonicalUrlFor()}#set`,
        name: 'Sensei Sandy BJJ Glossary',
        url: canonicalUrlFor(),
        description: 'A beginner-friendly glossary of Brazilian Jiu-Jitsu terms in plain English.',
        hasDefinedTerm: terms.slice(0, 8).map((term) => ({
          '@type': 'DefinedTerm',
          name: term.term,
          url: canonicalUrlFor(term.slug),
          description: term.summary
        }))
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrlFor()}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${CANONICAL_ORIGIN}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'BJJ Glossary',
            item: canonicalUrlFor()
          }
        ]
      }
    ]
  };
  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
};

const renderTermSchema = (term, relatedTerms) => {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        name: term.term,
        description: term.summary,
        termCode: term.slug,
        url: canonicalUrlFor(term.slug),
        inDefinedTermSet: canonicalUrlFor(),
        mainEntityOfPage: canonicalUrlFor(term.slug)
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrlFor(term.slug)}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${CANONICAL_ORIGIN}/`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'BJJ Glossary',
            item: canonicalUrlFor()
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: term.displayTerm,
            item: canonicalUrlFor(term.slug)
          }
        ]
      }
    ]
  };

  if (term.faq && term.faq.length > 0) {
    graph['@graph'].push({
      '@type': 'FAQPage',
      'mainEntity': term.faq.map(item => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.a
        }
      }))
    });
  }

  return `<script type="application/ld+json">\n${JSON.stringify(graph, null, 2)}\n</script>`;
};

const renderIndexCard = (term, termMap) => {
  const relatedThree = (term.related || []).slice(0, 3).map((slug) => termMap.get(slug)).filter(Boolean);
  const searchBlob = normalizeSearchText([
    term.term,
    term.displayTerm,
    term.summary,
    term.coachCue,
    ...(term.aliases || []),
    ...(term.redirectFrom || []),
    ...(term.faq || []).flatMap((item) => [item.q, item.a])
  ].join(' '));

  const pills = [
    term.categoryLabel,
    term.isCommon ? 'Common' : '',
    term.isFoundational ? 'Foundational' : ''
  ].filter(Boolean);

  return `<article class="term-card ss-glossary-term-card glossary-card" data-glossary-card data-category="${escapeHtml(term.category)}" data-level="${escapeHtml(term.level)}" data-letter="${escapeHtml(alphaLetter(term.term))}" data-contexts="${escapeHtml(term.contexts.join(','))}" data-common="${term.isCommon ? '1' : '0'}" data-foundational="${term.isFoundational ? '1' : '0'}" data-search="${escapeHtml(searchBlob)}" data-slug="${escapeHtml(term.slug)}">
  <div class="glossary-card-meta term-card__meta ss-glossary-term-tag">
    ${pills.map((pill) => `<span class="glossary-pill">${escapeHtml(pill)}</span>`).join('\n')}
  </div>
  <h3 class="term-card__title ss-glossary-term-title"><a data-term-link href="${escapeHtml(glossaryPathFor(term.slug))}">${escapeHtml(term.displayTerm)}</a></h3>
  <p class="term-card__summary ss-glossary-term-def">${escapeHtml(term.summary)}</p>
  <div class="glossary-related" aria-label="Related terms">
    <span>Related:</span>
    ${relatedThree.map((related) => `<a href="${escapeHtml(glossaryPathFor(related.slug))}">${escapeHtml(related.displayTerm || related.term)}</a>`).join('\n')}
  </div>
  <a class="term-card__cta ss-glossary-term-cta glossary-card-cta" data-term-link href="${escapeHtml(glossaryPathFor(term.slug))}">Learn the term →</a>
</article>`;
};

const renderBuyerPathsSection = () => `<section class="ss-glossary-paths glossary-surface--dark">
  <div class="ss-paths-inner">
    <div class="ss-paths-header">
      <p class="ss-paths-eyebrow">Beginner BJJ Glossary</p>
      <h2>Pick a learning path.</h2>
      <p>
        Start with the group of terms that matches what you want to understand first.
      </p>
    </div>

    <div class="ss-path-grid">
      <article class="ss-path-card" data-path="parent">
        <h3>Position Map</h3>
        <p>Learn where you are: guard, mount, back control, turtle, and side control.</p>
        <a class="ss-path-link" href="/bjj-glossary/guard">Start with Guard</a>
      </article>

      <article class="ss-path-card" data-path="adult-beginner">
        <h3>Movement Map</h3>
        <p>Learn how to move: shrimp, bridge, technical stand up, and guard recovery.</p>
        <a class="ss-path-link" href="/bjj-glossary/shrimp">Start with Shrimp</a>
      </article>

      <article class="ss-path-card" data-path="sparring-nerves">
        <h3>Control Map</h3>
        <p>Learn how to stay connected: grip, frame, underhook, seatbelt, and body lock.</p>
        <a class="ss-path-link" href="/bjj-glossary/grip">Start with Grip</a>
      </article>

      <article class="ss-path-card" data-path="self-defense">
        <h3>Safety Map</h3>
        <p>Learn the safety language: tap, reset, partner care, and controlled rounds.</p>
        <a class="ss-path-link" href="/bjj-faqs">Start with Safety</a>
        <div class="ss-path-chips" aria-label="Safety glossary shortcuts">
          <a href="/bjj-glossary/safety">Safety</a>
          <a href="/bjj-glossary/beginner-lane">Beginner Lane</a>
          <a href="/bjj-glossary/bully-proof">Bully Proof</a>
        </div>
      </article>
    </div>
  </div>
</section>`;

const renderHubPage = (terms, termMap, glossaryFiltersScript) => {
  const cards = terms.map((term) => renderIndexCard(term, termMap)).join('\n');

  const body = `<main class="glossary-index page-glossary glossary-page ss-main" id="glossary-index" role="main">
  <section class="glossary-hero" aria-labelledby="glossary-title">
    <div class="glossary-shell glossary-hero-grid">
      <div class="glossary-hero-copy">
        <p class="glossary-eyebrow">Beginner-friendly BJJ glossary</p>
        <h1 id="glossary-title">Brazilian Jiu Jitsu Terms in Plain English</h1>
        <p>New to BJJ? Start with the words you will hear on day one, then visit for a calm, beginner-friendly intro in Tannersville.</p>
        <div class="glossary-hero-actions" aria-label="Glossary actions">
          <a class="glossary-btn glossary-btn-primary" href="#first-class-starter-pack">Start with 7 Day-One Words</a>
          <a class="glossary-btn glossary-btn-secondary" href="#glossary-q">Search term</a>
          <a class="glossary-btn glossary-btn-primary" href="/book-free-intro">Reserve Free Intro</a>
          <a class="glossary-btn glossary-btn-secondary" href="#glossary-a-z">Browse A to Z</a>
        </div>
      </div>

      <aside class="glossary-visit-card" aria-label="First visit reassurance">
        <h2>Your first visit is not a fight.</h2>
        <ul>
          <li>Tour the room</li>
          <li>Learn how to tap</li>
          <li>Understand safety</li>
          <li>Start calmly</li>
        </ul>
        <a class="glossary-btn glossary-btn-primary" href="/book-free-intro">Reserve Free Intro</a>
      </aside>
    </div>
  </section>

  <section class="glossary-shell glossary-start-path" id="first-class-starter-pack" aria-labelledby="starter-pack-title">
    <div class="glossary-section-header">
      <div>
        <p class="glossary-eyebrow">Start here</p>
        <h2 id="starter-pack-title">7 Words You’ll Hear On Day One</h2>
      </div>
      <p>These are the words that help a beginner feel safer, calmer, and less lost during a first class.</p>
    </div>

    <div class="day-one-grid" aria-label="First class glossary terms">
      <a class="day-one-card" href="/bjj-glossary/tap">
        <span class="num">01</span>
        <h3>Tap</h3>
        <p>The safe way to say stop.</p>
      </a>

      <a class="day-one-card" href="/bjj-glossary/guard">
        <span class="num">02</span>
        <h3>Guard</h3>
        <p>Use your legs to stay safe from bottom.</p>
      </a>

      <a class="day-one-card" href="/bjj-glossary/frame">
        <span class="num">03</span>
        <h3>Frame</h3>
        <p>Make space with strong body shape.</p>
      </a>

      <a class="day-one-card" href="/bjj-glossary/hip-escape">
        <span class="num">04</span>
        <h3>Shrimp / Hip Escape</h3>
        <p>Move your hips away to make room.</p>
      </a>

      <a class="day-one-card" href="/bjj-glossary/mount">
        <span class="num">05</span>
        <h3>Mount</h3>
        <p>A top position beginners hear early.</p>
      </a>

      <a class="day-one-card" href="/bjj-glossary/side-control">
        <span class="num">06</span>
        <h3>Side Control</h3>
        <p>A common top control position from the side.</p>
      </a>

      <a class="day-one-card" href="/bjj-glossary/control">
        <span class="num">07</span>
        <h3>Control</h3>
        <p>The big idea behind safe Jiu-Jitsu.</p>
      </a>
    </div>

    <div class="glossary-start-cta">
      <p>You do not need every term today. Start with these seven.</p>
      <a class="glossary-btn glossary-btn-primary" href="/book-free-intro">Book Free Intro</a>
    </div>
  </section>

  <section class="ss-page-feed" aria-label="BJJ glossary learning path">
    <article class="ss-community-post">
      <header class="ss-community-post-header">
        <div class="ss-community-avatar" aria-hidden="true">ABC</div>
        <div class="ss-community-post-meta">
          <span class="ss-community-author">Sensei Sandy BJJ Glossary</span>
          <span class="ss-community-context">Learn the words before class</span>
        </div>
      </header>

      <div class="ss-community-post-body">
        <span class="ss-community-label">Day-one language</span>
        <h2>Learn the words you will hear before you step on the mat.</h2>
        <p>
          Start with plain-English explanations for tap, guard, mount, side control, frames, shrimp, and connection.
        </p>
      </div>

      <div class="ss-community-post-actions">
        <a class="ss-community-pill ss-primary" href="/book-free-intro" data-cta-target="intro" data-cta-src="glossary-learning-card" data-cta-placement="learning_card" data-cta-tier="primary" data-cta-lane="mixed">Reserve Free Intro</a>
        <a class="ss-community-pill" href="/student-hub#weekly-focus" data-cta-src="glossary-learning-card" data-cta-placement="learning_card" data-cta-tier="secondary" data-cta-lane="mixed">This Week&rsquo;s Focus</a>
        <a class="ss-community-pill" href="/student-hub" data-cta-src="glossary-learning-card" data-cta-placement="learning_card" data-cta-tier="tertiary" data-cta-lane="mixed">Visit Student Hub</a>
      </div>
    </article>
  </section>

  <section class="glossary-shell glossary-next-steps glossary-surface--dark" aria-label="Glossary next steps">
    <div class="glossary-start-cta">
      <p class="mb-3">Ready to see the words in class?</p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <a class="glossary-btn glossary-btn-primary" href="/book-free-intro">Reserve Free Intro</a>
        <a class="glossary-btn glossary-btn-secondary" href="/schedule">See the class schedule</a>
        <a class="glossary-btn glossary-btn-secondary" href="/adult-bjj">Adult beginner Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/kids">Kids Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/teen-jiu-jitsu-tannersville-ny">Teen Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/private-lessons">Private BJJ lessons</a>
      </div>
    </div>
  </section>

  <section class="glossary-shell" id="glossary-a-z">
    <section class="glossary-filter-panel glossary-controls" id="glossary-controls" aria-labelledby="glossary-filter-title">
      <form id="glossary-filter-form" action="#" method="get" onsubmit="return false;">
        <div class="glossary-filter-header">
          <label id="glossary-filter-title" for="glossary-q">Find a BJJ term</label>
          <div class="glossary-utility-links" aria-label="Glossary utilities">
            <button type="button" id="surprise-me-inline">Surprise me</button>
            <button type="button" id="surprise-me-az">Random term</button>
            <button type="button" id="copy-state-link">Copy filtered link</button>
            <label for="glossary-theme" class="visually-hidden">Theme</label>
            <select id="glossary-theme" aria-label="Theme">
              <option value="auto">Theme</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <input id="glossary-q" class="glossary-search" name="q" type="search" data-glossary-search="" autocomplete="off" placeholder="Search terms...">

        <div class="glossary-secondary-paths">
          ${renderBuyerPathsSection()}
        </div>

        <details class="glossary-advanced-filters">
          <summary>More filters</summary>

          <fieldset>
            <legend>Popular filters</legend>
            <div class="glossary-chip-row ss-glossary-filter-chips" role="group" aria-label="Popular filters">
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-level="beginner" aria-pressed="false">Beginner</button>
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-common="common" aria-pressed="false">Common</button>
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-category="positions" aria-pressed="false">Positions</button>
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-category="submissions" aria-pressed="false">Submissions</button>
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-category="movements" aria-pressed="false">Movements</button>
            </div>
          </fieldset>

          <fieldset>
            <legend>Browse by letter</legend>
            <nav class="glossary-alpha-row glossary-az ss-glossary-az-nav" id="glossary-az-rail" aria-label="Browse by letter">
              ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => `<a class="glossary-alpha" href="#" data-letter-link="${letter}" aria-pressed="false">${letter}</a>`).join('\n')}
            </nav>
          </fieldset>

          <fieldset>
            <legend>Filter by category</legend>
            <div class="glossary-chip-row ss-glossary-filter-chips" role="group" aria-label="Filter by category">
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-category="all" aria-pressed="true">All categories</button>
              ${Object.entries(CATEGORY_LABELS).map(([value, label]) => `<button class="glossary-chip ss-glossary-chip" type="button" data-filter-category="${value}" aria-pressed="false">${label}</button>`).join('\n')}
            </div>
          </fieldset>

          <fieldset>
            <legend>Filter by level</legend>
            <div class="glossary-chip-row ss-glossary-filter-chips" role="group" aria-label="Filter by level">
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-level="all" aria-pressed="true">All levels</button>
              ${Object.entries(LEVEL_LABELS).map(([value, label]) => `<button class="glossary-chip ss-glossary-chip" type="button" data-filter-level="${value}" aria-pressed="false">${label}</button>`).join('\n')}
            </div>
          </fieldset>

          <fieldset>
            <legend>Filter by context</legend>
            <div class="glossary-chip-row ss-glossary-filter-chips" role="group" aria-label="Filter by context">
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-context="all" aria-pressed="true">All contexts</button>
              ${Object.entries(CONTEXT_LABELS).map(([value, label]) => `<button class="glossary-chip ss-glossary-chip" type="button" data-filter-context="${value}" aria-pressed="false">${label}</button>`).join('\n')}
            </div>
          </fieldset>

          <fieldset>
            <legend>Quick filters</legend>
            <div class="glossary-chip-row ss-glossary-filter-chips" role="group" aria-label="Quick filters">
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-common="all" aria-pressed="true">All terms</button>
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-common="common" aria-pressed="false">Common</button>
              <button class="glossary-chip ss-glossary-chip" type="button" data-filter-common="foundational" aria-pressed="false">Foundational</button>
            </div>
          </fieldset>
        </details>

        <div class="glossary-results-header" aria-live="polite">
          <p><span id="result-count" data-glossary-results="">${terms.length}</span> terms found</p>
          <button type="button" id="reset-filters">Reset</button>
        </div>
      </form>
    </section>

    <section class="glossary-results" id="glossary-results" aria-label="BJJ glossary terms">
      <div class="ss-glossary-term-grid glossary-grid">${cards}</div>
    </section>

    <section class="glossary-empty hidden" id="glossary-empty" hidden>
      <h2>No matching terms yet</h2>
      <p>Try a broader search or reset the filters.</p>
    </section>
  </section>

  </section>
</main>`;

  return renderLayout({
    title: 'BJJ Glossary for Beginners | Sensei Sandy BJJ',
    description: 'Learn beginner Brazilian Jiu-Jitsu terms with plain-English definitions, safety cues, related concepts, and class examples from Sensei Sandy BJJ.',
    canonicalUrl: canonicalUrlFor(),
    bodyClass: 'page-glossary page-bjj-glossary bjj-glossary-page ss-page ss-page-glossary ss-has-community-bg ss-has-community-cards ss-has-sticky-actions',
    extraHead: renderHubSchema(terms),
    body,
    scripts: [glossaryFiltersScript]
  });
};

const renderRelationshipLinks = (slugs, termMap) =>
  slugs
    .map((slug) => termMap.get(slug))
    .filter(Boolean)
    .map((item) => `<li><a href="${escapeHtml(glossaryPathFor(item.slug))}">${escapeHtml(item.displayTerm)}</a></li>`)
    .join('\n');

const renderTermNextStep = () => `
<section class="ss-term-next-step" aria-labelledby="term-next-step-title">
  <div class="container">
    <p class="ss-eyebrow">Train the word</p>
    <h2 id="term-next-step-title">Want to feel this in class?</h2>
    <p>
      Start with a guided Free Intro. We’ll show you the room, explain the safety rules, and help you choose the right class lane.
    </p>

    <div class="ss-link-grid">
      <a href="/bjj-glossary">Browse the Beginner Glossary</a>
      <a href="/student-hub">See This Week’s Focus</a>
      <a href="/schedule">View Class Schedule</a>
      <a href="/book-free-intro">Reserve Free Intro</a>
    </div>

    <div class="ss-inline-actions">
      <a class="btn btn-primary" href="/book-free-intro">Reserve Free Intro</a>
      <a class="btn btn-outline-primary" href="/schedule">View Schedule</a>
    </div>
  </div>
</section>
`;

const renderReviewsSection = () => `<section id="reviews" class="glossary-card glossary-term-section glossary-term-reviews">
    <h2>What local families say</h2>
    <div class="glossary-term-review-grid">
      <figure class="glossary-card glossary-term-review-card">
        <blockquote>A calm and structured environment. My kids look forward to every class.</blockquote>
        <figcaption>★★★★★ Jared Goodrich</figcaption>
      </figure>
      <figure class="glossary-card glossary-term-review-card">
        <blockquote>Class at Sensei Sandy BJJ has become such a large part of my family’s routine.</blockquote>
        <figcaption>★★★★★ Jessie Moriarty</figcaption>
      </figure>
    </div>
  </section>`;

const renderTermPage = (term, termMap, glossaryFiltersScript) => {
  const relatedTerms = (term.related || []).map((slug) => termMap.get(slug)).filter(Boolean);
  const bestNextTags = (term.bestNext || []).slice(0, 3).map((slug) => termMap.get(slug)).filter(Boolean).map((item) => `<span class="term-pill">${escapeHtml(item.displayTerm)}</span>`).join('\n');
  const bestNextLinks = (term.bestNext || []).slice(0, 4).map((slug) => termMap.get(slug)).filter(Boolean);
  const learnBeforeLinks = renderRelationshipLinks(term.relationships.learnBefore, termMap);
  const usuallyNextLinks = renderRelationshipLinks(term.relationships.usuallyNext, termMap);
  const confusedWithLinks = renderRelationshipLinks(term.relationships.confusedWith, termMap);

  const navJson = JSON.stringify({
    currentSlug: term.slug,
    indexSrc: '/assets/data/glossary-search.json'
  }).replace(/<\//g, '<\\/');

  const body = `<main class="glossary-term page-glossary-term glossary-page ss-main term-page-parity" id="glossary-term" role="main">
  <nav class="breadcrumbs ss-glossary-breadcrumbs glossary-term-breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <a href="/bjj-glossary">BJJ Glossary</a>
    <span aria-current="page">${escapeHtml(term.displayTerm)}</span>
  </nav>

  <div class="term-return glossary-term-return button-row">
    <a id="back-to-results" href="/bjj-glossary">Back to results</a>
    <button type="button" class="btn btn-sm btn-outline-secondary" id="copy-term-link">Copy term link</button>
  </div>

  <header class="term-hero glossary-hero glossary-card ss-glossary-term-hero">
    <p class="term-meta glossary-hero__eyebrow">${escapeHtml(term.categoryLabel)} · ${escapeHtml(term.levelLabel)}</p>
    <h1 class="glossary-hero__title">${escapeHtml(term.h1)}</h1>
    <p class="term-summary glossary-hero__lede">${escapeHtml(term.summary)}</p>
    <div class="term-tags chip-list">
      <span class="term-pill">${term.level === 'beginner' ? 'Foundational concept' : 'Intermediate concept'}</span>
      <span class="term-pill">${escapeHtml(term.categoryLabel)}</span>
      ${term.isCommon ? '<span class="term-pill">Common</span>' : ''}
      ${term.isFoundational ? '<span class="term-pill">Start here</span>' : ''}
      ${bestNextTags || '<span class="term-pill">Connected glossary term</span>'}
    </div>
  </header>

  <section id="definition" class="glossary-card glossary-term-section">
    <h2>Quick definition</h2>
    <p>${escapeHtml(term.summary)}</p>
  </section>

  <section id="beginner-translation" class="glossary-card glossary-term-section">
    <h2>Beginner translation</h2>
    <p>${escapeHtml(term.beginnerTranslation)}</p>
  </section>

  <section id="why-it-matters" class="glossary-card glossary-term-section">
    <h2>Why it matters</h2>
    <p>${escapeHtml(term.whyItMatters)}</p>
  </section>

  <section id="beginners-should-know" class="glossary-card glossary-term-section">
    <h2>What beginners should know</h2>
    <p>${escapeHtml(term.whatBeginnersShouldKnow)}</p>
  </section>

  <section id="common-class-phrases" class="glossary-card glossary-term-section">
    <h2>Common class phrases</h2>
    <ul class="glossary-term-check-list">${term.commonClassPhrases.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n')}</ul>
  </section>

  <section id="safety-cue" class="glossary-card glossary-term-section ss-safety-cue">
    <h2>Beginner Safety Cue</h2>
    <p><strong>Safety cue:</strong> ${escapeHtml(term.safetyNote.replace(/^Safety note:\s*/i, ''))}</p>
  </section>

  <section id="related-terms" class="panel glossary-card glossary-term-section">
    <h2>Related terms</h2>
    <p>This glossary works like a connected map. After this term, these are the most useful next pages:</p>
    <div class="related-grid ss-glossary-term-grid glossary-term-related-grid">${relatedTerms.map(t => `<a class="related-card ss-glossary-rich-related-card" href="${escapeHtml(glossaryPathFor(t.slug))}">
      <h3>${escapeHtml(t.displayTerm)}</h3>
      <p>${escapeHtml(t.summary)}</p>
      <span>Read more →</span>
    </a>`).join('\n')}</div>
    <div class="glossary-term-best-next">
      <h3>Best next glossary pages</h3>
      <ul>${bestNextLinks.map((item) => `<li><a href="${escapeHtml(glossaryPathFor(item.slug))}">${escapeHtml(item.displayTerm)}</a></li>`).join('\n') || '<li><a href="/bjj-glossary">Browse all terms</a></li>'}</ul>
      <p><a href="/bjj-glossary" id="back-to-glossary-main">Back to glossary</a></p>
    </div>
    <div class="glossary-term-relationship-map">
      <h3>Relationship map</h3>
      <div class="relationship-grid glossary-term-relationship-grid">
        <section class="glossary-card"><h4>Learn this before</h4><ul>${learnBeforeLinks || '<li>Core fundamentals first</li>'}</ul></section>
        <section class="glossary-card"><h4>Usually comes next</h4><ul>${usuallyNextLinks || '<li>Build from this position with control</li>'}</ul></section>
        <section class="glossary-card"><h4>Often confused with</h4><ul>${confusedWithLinks || '<li>Nearby terms with different goals</li>'}</ul></section>
      </div>
    </div>
  </section>

  ${renderTermNextStep()}

  <section id="faq" class="glossary-card glossary-term-section">
    <h2>FAQ</h2>
    <div class="glossary-term-faq-list">
      ${term.faq.map((item) => `<details class="glossary-card"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('\n')}
    </div>
  </section>

  ${renderReviewsSection()}

  <nav class="term-pagination glossary-term-pagination button-row" aria-label="Glossary navigation">
    <a id="prev-term" href="#" hidden>Previous term</a>
    <a id="back-term-results" href="/bjj-glossary">Back to results</a>
    <a id="next-term" href="#" hidden>Next term</a>
  </nav>

  <script id="glossary-term-nav-data" type="application/json">${navJson}</script>
</main>`;

  return renderLayout({
    title: term.seo.title,
    description: term.seo.description,
    canonicalUrl: canonicalUrlFor(term.slug),
    bodyClass: 'page-glossary-term page-glossary-term-rich page-bjj-glossary bjj-glossary-page',
    extraHead: renderTermSchema(term, relatedTerms),
    body,
    scripts: [glossaryFiltersScript]
  });
};

const renderUpdatesPage = (terms, glossaryFiltersScript) => {
  const now = new Date();
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const newlyAdded = terms
    .filter((t) => t.createdAt)
    .filter((t) => new Date(t.createdAt) >= monthAgo)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, 20);
  const beginnerCount = terms.filter((t) => t.level === 'beginner').length;
  const mediaCount = terms.filter((t) => t.media && t.media.src).length;
  const aliasCount = terms.filter((t) => Array.isArray(t.aliases) && t.aliases.length > 0).length;
  const commonCount = terms.filter((t) => t.isCommon).length;
  const foundationalCount = terms.filter((t) => t.isFoundational).length;
  const updatedTerms = terms
    .filter((t) => t.updatedAt)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 6);
  const priorityTerms = terms
    .filter((t) => t.isFoundational || t.level === 'beginner')
    .slice(0, 6)
    .map((t) => `<li><a href="/bjj-glossary/${escapeHtml(t.slug)}">${escapeHtml(t.displayTerm)}</a> helps new students make sense of class language faster.</li>`)
    .join('\n');
  const updatedRows = updatedTerms.length
    ? updatedTerms.map((t) => `<li><a href="/bjj-glossary/${escapeHtml(t.slug)}">${escapeHtml(t.displayTerm)}</a> refined on ${escapeHtml(t.updatedAt)}.</li>`).join('\n')
    : '<li>Fresh edits are folded into the next glossary build as terms are clarified.</li>';
  const newlyAddedRows = newlyAdded.length
    ? newlyAdded.map((t) => `<li><a href="/bjj-glossary/${escapeHtml(t.slug)}">${escapeHtml(t.displayTerm)}</a> added ${escapeHtml(t.createdAt)}.</li>`).join('\n')
    : '<li>No newly added terms in the last 30 days.</li>';

  const body = `<main class="ss-main glossary-page" id="glossary-updates" role="main">
  <section class="ss-section">
    <div class="container ss-container">
      <div class="glossary-card glossary-hero">
        <p class="glossary-eyebrow">Glossary maintenance</p>
        <h1>BJJ Glossary Updates</h1>
        <p>This page explains how the Sensei Sandy BJJ glossary grows, what has changed recently, and how beginners can use it before class. The update log exists so families, first-timers, and returning students can see that the glossary is being maintained as a real teaching tool, not left as a thin index page.</p>
        <p>Most visitors should still start at <a href="/bjj-glossary">the main glossary</a>. This page is for anyone who wants the quick state of coverage, recent additions, and the current editorial priorities behind the terms students hear on the mats.</p>
      </div>
    </div>
  </section>

  <section class="ss-section">
    <div class="container ss-container">
      <div class="glossary-card glossary-surface--light">
        <div class="glossary-section-header">
          <h2>What changed recently</h2>
          <p>The live counts below show the glossary is actively expanding, while the term list shows where the newest coverage is landing.</p>
        </div>
        <div class="ss-path-grid">
          <article class="glossary-card">
            <h3>Total coverage</h3>
            <p>${terms.length} terms are currently indexed in the beginner glossary.</p>
          </article>
          <article class="glossary-card">
            <h3>Beginner focus</h3>
            <p>${beginnerCount} terms are labeled for beginners and ${foundationalCount} are marked as start-here concepts.</p>
          </article>
          <article class="glossary-card">
            <h3>Teaching support</h3>
            <p>${mediaCount} terms include media support and ${aliasCount} include alternate phrasing students may hear in class.</p>
          </article>
          <article class="glossary-card">
            <h3>Common language</h3>
            <p>${commonCount} entries are tagged as especially common vocabulary for regular class use.</p>
          </article>
        </div>
        <div class="ss-path-grid">
          <article class="glossary-card">
            <h3>Newly added in the last 30 days</h3>
            <ul>${newlyAddedRows}</ul>
          </article>
          <article class="glossary-card">
            <h3>Recently refined terms</h3>
            <ul>${updatedRows}</ul>
          </article>
        </div>
      </div>
    </div>
  </section>

  <section class="ss-section">
    <div class="container ss-container">
      <div class="ss-path-grid">
        <article class="glossary-card glossary-surface--light">
          <h2>How terms are chosen</h2>
          <p>The glossary is built around terms a new student is likely to hear in class, during drilling, or while reviewing a video after class. Priority goes to words that reduce confusion fast: safety language, major positions, common movements, and simple submission names that show up early.</p>
          <p>That means the glossary is not trying to become an encyclopedia of every niche variation. It is trying to make local beginner class language clearer, especially for adults starting from zero, parents checking whether a class feels safe, and kids or teens hearing a new term for the first time.</p>
        </article>
        <article class="glossary-card glossary-surface--light">
          <h2>Current priorities</h2>
          <p>The main editorial goal is still practical coverage: terms that help a student walk into class calmer, recognize the coach cue sooner, and ask a better question after the rep.</p>
          <ul>${priorityTerms}</ul>
        </article>
      </div>
    </div>
  </section>

  <section class="ss-section">
    <div class="container ss-container">
      <div class="ss-path-grid">
        <article class="glossary-card glossary-surface--light">
          <h2>How to use the glossary before class</h2>
          <p>Keep it short. Pick two or three words you expect to hear, read the quick definition, and then stop. A glossary should lower uncertainty before class, not turn into homework that makes the first visit feel heavier.</p>
          <p>For brand-new adults, terms like <a href="/bjj-glossary/base">base</a>, <a href="/bjj-glossary/posture">posture</a>, <a href="/bjj-glossary/frame">frame</a>, and <a href="/bjj-glossary/tap">tap</a> usually do more good than chasing advanced technique names. For kids and teens, the useful words are often even simpler: stop, reset, balance, stand up safely, and protect your partner.</p>
        </article>
        <article class="glossary-card glossary-surface--light">
          <h2>Helpful next pages</h2>
          <p>Use the glossary together with the rest of the site so the language connects back to an actual class decision.</p>
          <div class="ss-link-grid">
            <a href="/bjj-glossary">Browse the full glossary</a>
            <a href="/bjj-videos">Watch the video library</a>
            <a href="/student-hub">See this week&apos;s class focus</a>
            <a href="/schedule">Check the class schedule</a>
            <a href="/adult-bjj">Adults program details</a>
            <a href="/kids">Kids program details</a>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="ss-section">
    <div class="container ss-container">
      <div class="glossary-card glossary-surface--light">
        <div class="glossary-section-header">
          <h2>FAQ</h2>
          <p>Short answers for the most common questions about what this update page is for and how the glossary is maintained.</p>
        </div>
        <div class="glossary-term-faq-list">
          <details class="glossary-card">
            <summary>Why publish an updates page for a glossary?</summary>
            <p>Because the glossary changes over time. This page gives students and parents a quick way to see that coverage is improving, beginner terms are being clarified, and new class language is not being dropped into the site without context.</p>
          </details>
          <details class="glossary-card">
            <summary>Is the glossary only for complete beginners?</summary>
            <p>No. Beginners benefit the most, but returning students, parents, and experienced grapplers visiting a new gym can all use it to match local phrasing with familiar concepts.</p>
          </details>
          <details class="glossary-card">
            <summary>How often is this page updated?</summary>
            <p>Whenever the glossary build runs after term edits. The counts and recent-term lists are generated from the same source data as the live glossary pages.</p>
          </details>
          <details class="glossary-card">
            <summary>What should I do if a term I heard in class is missing?</summary>
            <p>Start with the closest related term in the glossary, then ask in class how the coach is using the word. Many terms have aliases, and some new entries are added only after the team sees repeated beginner confusion around the same phrase.</p>
          </details>
        </div>
      </div>
    </div>
  </main>`;

  return renderLayout({
    title: 'BJJ Glossary Updates | Sensei Sandy BJJ',
    description: 'Track recent Sensei Sandy BJJ glossary additions, updated beginner terms, coverage notes, and new plain-English class examples for students.',
    canonicalUrl: `${canonicalUrlFor()}/updates`,
    bodyClass: 'page-glossary page-glossary-updates page-bjj-glossary bjj-glossary-page',
    body,
    scripts: [glossaryFiltersScript]
  });
};

const syncGlossaryRedirects = async (terms) => {
  try {
    const config = JSON.parse(await fs.readFile(LEGACY_REDIRECTS_PATH, 'utf8'));
    const redirects = config.redirects && typeof config.redirects === 'object' ? config.redirects : {};

    for (const term of terms) {
      const target = `/bjj-glossary/${term.slug}`;
      for (const sourceRaw of term.redirectFrom || []) {
        const sourceSlug = slugify(sourceRaw);
        if (!sourceSlug || sourceSlug === term.slug) continue;
        redirects[`/bjj-glossary/${sourceSlug}`] = target;
      }
    }

    config.redirects = Object.fromEntries(Object.entries(redirects).sort((a, b) => a[0].localeCompare(b[0])));
    await fs.writeFile(LEGACY_REDIRECTS_PATH, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  } catch (e) {
    console.warn('Could not sync redirects:', e.message);
  }
};

const writeStaticIntegrationAssets = async (terms) => {
  const searchIndex = terms.map((term) => ({
    slug: term.slug,
    term: term.displayTerm,
    summary: term.summary,
    category: term.category,
    level: term.level,
    letter: alphaLetter(term.term),
    contexts: term.contexts,
    common: term.isCommon,
    foundational: term.isFoundational,
    isCommon: term.isCommon,
    isFoundational: term.isFoundational,
    aliases: term.aliases,
    redirectFrom: term.redirectFrom,
    searchText: normalizeSearchText([
      term.term,
      term.displayTerm,
      term.summary,
      term.coachCue,
      ...(term.aliases || []),
      ...(term.redirectFrom || []),
      ...(term.faq || []).flatMap((faq) => [faq.q, faq.a])
    ].join(' '))
  }));

  await fs.mkdir(ASSETS_DATA_ROOT, { recursive: true });
  await fs.writeFile(path.join(ASSETS_DATA_ROOT, 'glossary-search.json'), `${JSON.stringify(searchIndex, null, 2)}\n`, 'utf8');
};

const main = async () => {
  const terms = await loadTerms();
  validateTerms(terms);

  const sortedTerms = [...terms].sort((a, b) => a.displayTerm.localeCompare(b.displayTerm));
  const termMap = new Map(sortedTerms.map((term) => [term.slug, term]));
  const glossaryFiltersScript = await hashedAssetPath(GLOSSARY_FILTERS_SRC);

  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  await fs.writeFile(path.join(OUTPUT_ROOT, 'index.html'), renderHubPage(sortedTerms, termMap, glossaryFiltersScript), 'utf8');

  for (const term of sortedTerms) {
    const termDir = path.join(OUTPUT_ROOT, term.slug);
    await fs.mkdir(termDir, { recursive: true });
    await fs.writeFile(path.join(termDir, 'index.html'), renderTermPage(term, termMap, glossaryFiltersScript), 'utf8');
  }

  const updatesDir = path.join(OUTPUT_ROOT, 'updates');
  await fs.mkdir(updatesDir, { recursive: true });
  await fs.writeFile(path.join(updatesDir, 'index.html'), renderUpdatesPage(sortedTerms, glossaryFiltersScript), 'utf8');

  await writeStaticIntegrationAssets(sortedTerms);
  await syncGlossaryRedirects(sortedTerms);

  console.log(`Generated glossary hub plus ${sortedTerms.length} term pages.`);
};

main();
