import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseArgs } from 'node:util';

import { CSS_BUNDLE_REGISTRY } from './css-bundle-registry.mjs';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'data', 'glossary-terms.json');
const OUTPUT_ROOT = path.join(ROOT, 'src', 'bjj-glossary');
const LEGACY_REDIRECTS_PATH = path.join(ROOT, 'config', 'legacy-redirects.json');
const ASSETS_DATA_ROOT = path.join(ROOT, 'src', 'assets', 'data');
const CANONICAL_ORIGIN = 'https://senseisandy.com';
const CSS_VERSION = '20260420';
const ANALYTICS_HEAD_INCLUDE = '  <!--#include virtual="/_includes/analytics-head.html" -->';
const GLOSSARY_FILTERS_SRC = '/js/glossary-filters.min.js';
const COMPONENT_BUNDLE_HREFS = new Map(
  CSS_BUNDLE_REGISTRY.bundles.map((bundle) => [bundle.name, bundle.manifestKey])
);

const componentBundleHref = (bundleName) => {
  const href = COMPONENT_BUNDLE_HREFS.get(bundleName);
  if (!href) throw new Error(`Unknown component bundle: ${bundleName}`);
  return href;
};

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
      ? normalized.summary
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

const renderLayout = ({ title, description, canonicalUrl, componentBundleName, bodyClass = 'page-glossary', extraHead = '', body, scripts = [] }) => `<!DOCTYPE html>
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
  <link rel="preload" href="/assets/fonts/lexend/lexend-latin-variable.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/bootstrap-site.min.css" />
  <link rel="stylesheet" href="/assets/css/global.min.css" />
  <link rel="stylesheet" href="${escapeHtml(componentBundleHref(componentBundleName))}" />
  <link rel="stylesheet" href="/assets/css/pages/glossary.min.css" />
${ANALYTICS_HEAD_INCLUDE}
${extraHead}
  <!--#include virtual="/_includes/local-business-schema.jsonld.html" -->
  <link rel="stylesheet" href="/assets/css/fonts.min.css">
  <link rel="stylesheet" href="/assets/css/site-shell.min.css">
  <link rel="stylesheet" href="/assets/css/bootstrap-icons-local.css">
</head>
<body class="${escapeHtml(bodyClass)}" data-glossary-theme-root>
${body}
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
        '@type': 'WebPage',
        '@id': `${canonicalUrlFor()}#webpage`,
        url: canonicalUrlFor(),
        name: 'BJJ Glossary | Sensei Sandy BJJ',
        description: 'A beginner-friendly glossary of Brazilian Jiu-Jitsu terms in plain English.',
        about: {
          '@id': 'https://senseisandy.com/#business'
        }
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
        '@type': 'WebPage',
        '@id': `${canonicalUrlFor(term.slug)}#webpage`,
        url: canonicalUrlFor(term.slug),
        name: `${term.displayTerm} | BJJ Glossary | Sensei Sandy BJJ`,
        description: term.summary,
        about: {
          '@id': 'https://senseisandy.com/#business'
        }
      },
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
      <h2>Pick your beginner learning path.</h2>
      <p>
        Every family member and new student starts at their own pace. Select your path to explore essential mat vocabulary.
      </p>
    </div>

    <div class="ss-path-grid">
      <article class="ss-path-card" data-path="parent">
        <h3>Parents &amp; Kids (Coach-Mom Carla &amp; Independent Ian)</h3>
        <p>Cooperative youth movement, positive room structure, and personal space confidence.</p>
        <a class="ss-path-link" href="/bjj-glossary/bully-proof">Explore Youth Terms &rarr;</a>
        <div class="ss-path-chips" aria-label="Parent glossary shortcuts">
          <a href="/bjj-glossary/bully-proof">Bully Proof</a>
          <a href="/bjj-glossary/safety">Safety First</a>
          <a href="/bjj-glossary/beginner-lane">Beginner Lane</a>
        </div>
      </article>

      <article class="ss-path-card" data-path="adult-beginner">
        <h3>Adult Beginners (Beginner Ben &amp; Community Casey)</h3>
        <p>Calm position mapping, mechanical leverage, and step-by-step cooperative drills.</p>
        <a class="ss-path-link" href="/bjj-glossary/guard">Explore Adult Foundations &rarr;</a>
        <div class="ss-path-chips" aria-label="Adult beginner shortcuts">
          <a href="/bjj-glossary/guard">Guard</a>
          <a href="/bjj-glossary/mount">Mount</a>
          <a href="/bjj-glossary/side-control">Side Control</a>
        </div>
      </article>

      <article class="ss-path-card" data-path="sparring-nerves">
        <h3>Teens &amp; Control (Cross-Training Tyler)</h3>
        <p>Dynamic movement geometry, connection control, and calm partner pacing.</p>
        <a class="ss-path-link" href="/bjj-glossary/grip">Explore Control Terms &rarr;</a>
        <div class="ss-path-chips" aria-label="Control shortcuts">
          <a href="/bjj-glossary/grip">Grip</a>
          <a href="/bjj-glossary/frame">Frame</a>
          <a href="/bjj-glossary/underhook">Underhook</a>
        </div>
      </article>

      <article class="ss-path-card" data-path="self-defense">
        <h3>Household &amp; Visitors (Family Frankie &amp; Weekend Wendy)</h3>
        <p>Flexible scheduling, clear safety expectations, and cooperative training under one roof.</p>
        <a class="ss-path-link" href="/bjj-faqs">Explore FAQs &amp; Safety &rarr;</a>
        <div class="ss-path-chips" aria-label="Safety glossary shortcuts">
          <a href="/bjj-glossary/safety">Safety</a>
          <a href="/bjj-glossary/beginner-lane">Beginner Lane</a>
          <a href="/bjj-glossary/tap">The Tap</a>
        </div>
      </article>
    </div>
  </div>
</section>`;

const VAULT_CURRICULUM_MAP = new Map([
  ['frame', { week: 'Week 1', title: 'Mountaintop Defensive Frame', track: 'Adult Track' }],
  ['frames', { week: 'Week 1', title: 'Mountaintop Defensive Frame', track: 'Adult Track' }],
  ['frame-recovery', { week: 'Week 1', title: 'Mountaintop Defensive Frame', track: 'Adult Track' }],
  ['base', { week: 'Week 1', title: 'Building Base & Structural Geometry', track: 'Adult & Youth Tracks' }],
  ['posture', { week: 'Week 2', title: 'Closed Guard Posture & Safe Ties', track: 'Adult Track' }],
  ['closed-guard', { week: 'Week 2', title: 'Closed Guard Posture & Inside Control', track: 'Adult Track' }],
  ['guard', { week: 'Week 2', title: 'Guard Fundamentals & Safe Distance', track: 'Adult & Youth Tracks' }],
  ['shrimp', { week: 'Week 3 & 4', title: 'Mechanical Hip Escape (Carpet Shrimp)', track: 'Adult & Youth Tracks' }],
  ['hip-escape', { week: 'Week 3 & 4', title: 'Mechanical Hip Escape (Carpet Shrimp)', track: 'Adult & Youth Tracks' }],
  ['guard-recovery', { week: 'Week 3', title: 'Restoring Guard with Hip Mobility', track: 'Adult Track' }],
  ['guard-retention', { week: 'Week 3', title: 'Restoring Guard with Hip Mobility', track: 'Adult Track' }],
  ['mount', { week: 'Week 4', title: 'Mount Survival & Mechanical Upa Bridge', track: 'Adult Track' }],
  ['upa-escape', { week: 'Week 4', title: 'Mechanical Upa Bridge & Roll', track: 'Adult Track' }],
  ['bridge', { week: 'Week 4', title: 'Glute Bridge & Hip Elevation', track: 'Adult & Youth Tracks' }],
  ['side-control', { week: 'Week 5', title: 'Side Control Defense & Elbow-Knee Wedge', track: 'Adult Track' }],
  ['elbow-knee-escape', { week: 'Week 5', title: 'The Elbow-Knee Wedge & Reguarding', track: 'Adult Track' }],
  ['underhook', { week: 'Week 5 & 8', title: 'Underhook Framing & Safe Recovery', track: 'Adult Track' }],
  ['guard-pass', { week: 'Week 6', title: 'Low-Pressure Guard Passing', track: 'Adult Track' }],
  ['knee-slice', { week: 'Week 6', title: 'Knee Slice Passing Geometry', track: 'Adult Track' }],
  ['back-control', { week: 'Week 7', title: 'Back Control Stability & Hand Fighting', track: 'Adult Track' }],
  ['seatbelt', { week: 'Week 7', title: 'Seatbelt Control & Harness Safety', track: 'Adult Track' }],
  ['rear-naked-choke', { week: 'Week 7', title: 'Back Position Finishes with Control', track: 'Adult Track' }],
  ['half-guard', { week: 'Week 8', title: 'Half-Guard Frame & Knee Shield', track: 'Adult Track' }],
  ['knee-shield', { week: 'Week 8', title: 'Knee Shield Distance Management', track: 'Adult Track' }],
  ['turtle', { week: 'Week 9', title: 'Turtle Defense & Safe Base Recovery', track: 'Adult Track' }],
  ['triangle-choke', { week: 'Week 10', title: 'Guard Control Triangle & Posture', track: 'Adult Track' }],
  ['triangle', { week: 'Week 10', title: 'Guard Control Triangle & Posture', track: 'Adult Track' }],
  ['kimura', { week: 'Week 11', title: 'Kimura Control Grip & Shoulder Safety', track: 'Adult Track' }],
  ['tap', { week: 'Core Safety', title: 'The Universal Tap & Safe Reset Protocol', track: 'All Tracks' }],
  ['safety', { week: 'Core Safety', title: 'Partner Care & Cooperative Pacing', track: 'All Tracks' }],
  ['beginner-lane', { week: 'Orientation', title: 'Beginner Lane & Coached Walkthrough', track: 'All Tracks' }],
  ['bully-proof', { week: 'Youth Track', title: 'Personal Space Bubble & De-escalation', track: 'Youth Track' }]
]);

const renderFlywheelGrandSlamSection = () => `<section class="glossary-shell glossary-flywheel-section" aria-label="Student Learning Flywheel & Grand Slam Offer">
  <div class="glossary-section-header">
    <div>
      <p class="glossary-eyebrow">The Sensei Sandy Learning Flywheel</p>
      <h2 id="flywheel-title">From Plain-English Vocabulary to Mat Confidence</h2>
    </div>
    <p>How our beginner glossary, video practice vault, and coached classes fit together into one seamless learning journey.</p>
  </div>

  <div class="glossary-flywheel-grid" aria-label="Three-step learning progression">
    <article class="glossary-flywheel-step">
      <span class="step-num">Step 01</span>
      <h3>Learn the Language</h3>
      <p>Demystify Brazilian Jiu-Jitsu terminology before stepping onto the mat. Plain-English definitions, coach cues, and safety guidelines give you clear understanding from day one.</p>
      <span class="step-asset">Free Day-One Glossary Blueprint</span>
    </article>

    <article class="glossary-flywheel-step">
      <span class="step-num">Step 02</span>
      <h3>Walk the Mats</h3>
      <p>Meet Sandy, tour our Tannersville studio, and experience cooperative partner drills. A coached, relaxed orientation where you ask questions and feel our calm pacing.</p>
      <a class="step-link" href="/free-bjj-intro-tannersville-ny">Reserve Free First Visit &rarr;</a>
    </article>

    <article class="glossary-flywheel-step">
      <span class="step-num">Step 03</span>
      <h3>12-Week Core Culture</h3>
      <p>Enroll in our foundational 12-week track: custom academy Gi &amp; white belt included, 36 coached classes, partner safety matching, and full Async Practice Vault access.</p>
      <a class="step-link" href="/options-pricing#start">Explore Grand Slam Stack &rarr;</a>
    </article>
  </div>

  <div class="glossary-vault-teaser">
    <div class="glossary-vault-teaser-copy">
      <span class="glossary-pill ss-primary">Included with Enrollment</span>
      <h3>Async Practice Vault Video Companion ($150 Value)</h3>
      <p>Every core position in this glossary is backed by 2-minute coached video breakdowns and home practice drills in our student portal.</p>
    </div>
    <div class="glossary-vault-teaser-actions">
      <span class="glossary-btn glossary-btn-secondary">Practice Vault companion — coming soon</span>
      <a class="glossary-btn glossary-btn-secondary" href="/options-pricing#start">View 12-Week Tuition Tracks</a>
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
          <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit</a>
          <a class="glossary-btn glossary-btn-secondary" href="#glossary-a-z">Browse A to Z</a>
        </div>
      </div>

      <aside class="glossary-visit-card" aria-label="First visit reassurance">
        <h2>Your first visit is a coached learning experience.</h2>
        <ul>
          <li>Tour the room</li>
          <li>Learn the safe tap &amp; reset</li>
          <li>Understand cooperative partner safety</li>
          <li>Start calmly at your own pace</li>
        </ul>
        <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit</a>
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
        <p>The safe way to reset.</p>
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
      <p>Begin with these seven foundational words for your first class.</p>
      <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit</a>
    </div>
  </section>

  ${renderFlywheelGrandSlamSection()}

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
        <a class="ss-community-pill ss-primary" href="/free-bjj-intro-tannersville-ny" data-cta-target="intro" data-cta-src="glossary-learning-card" data-cta-placement="learning_card" data-cta-tier="primary" data-cta-lane="mixed">Reserve Your Free First Visit</a>
        <a class="ss-community-pill" href="/student-hub#weekly-focus" data-cta-src="glossary-learning-card" data-cta-placement="learning_card" data-cta-tier="secondary" data-cta-lane="mixed">This Week&rsquo;s Focus</a>
        <a class="ss-community-pill" href="/student-hub" data-cta-src="glossary-learning-card" data-cta-placement="learning_card" data-cta-tier="tertiary" data-cta-lane="mixed">Visit Student Hub</a>
      </div>
    </article>
  </section>

  <section class="glossary-shell glossary-next-steps glossary-surface--dark" aria-label="Glossary next steps">
    <div class="glossary-start-cta">
      <p class="mb-3">Ready to see the words in class?</p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit</a>
        <a class="glossary-btn glossary-btn-secondary" href="/schedule">See the class schedule</a>
        <a class="glossary-btn glossary-btn-secondary" href="/bjj-classes/adults-tannersville-ny">Adult beginner Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/bjj-classes/kids-tannersville-ny">Kids Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/bjj-classes/teens-tannersville-ny">Teen Jiu-Jitsu</a>
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
              ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => `<a class="glossary-alpha" href="/bjj-glossary" data-letter-link="${letter}" aria-pressed="false">${letter}</a>`).join('\n')}
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
    componentBundleName: 'glossary-hub',
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

const renderTermNextStep = (term) => {
  const vaultMatch = term ? VAULT_CURRICULUM_MAP.get(term.slug) : null;
  const termName = term ? escapeHtml(term.displayTerm) : 'this concept';

  const vaultBanner = vaultMatch ? `
    <aside class="glossary-vault-feature-box p-3 mb-4 rounded-3 border bg-white text-dark shadow-sm" aria-label="Practice Vault Video Lesson">
      <div class="d-flex align-items-center gap-2 mb-2">
        <span class="glossary-pill ss-primary">Async Practice Vault &middot; ${escapeHtml(vaultMatch.week)}</span>
        <span class="glossary-pill">${escapeHtml(vaultMatch.track)}</span>
      </div>
      <h3 class="h5 fw-bold mb-1" style="color: var(--ss-ink, #362B24);">${termName} in the 12-Week Video Line</h3>
      <p class="small text-muted mb-3">Watch the 2-minute coached breakdown of <em>${escapeHtml(vaultMatch.title)}</em> and practice the home carpet drill in our student portal.</p>
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2 border-top">
        <span class="text-muted small">Included free with 12-Week Core Culture enrollment</span>
        <span class="glossary-btn glossary-btn-secondary">Vault lesson coming soon</span>
      </div>
    </aside>
  ` : '';

  return `
<section class="ss-term-next-step glossary-card glossary-surface--dark" aria-labelledby="term-next-step-title">
  <div class="container">
    <p class="ss-eyebrow">Train the word</p>
    <h2 id="term-next-step-title">Want to feel ${escapeHtml(term ? term.displayTerm.toLowerCase() : 'this')} in class?</h2>
    <p>
      Your first class is a coached learning experience. We will guide you through a calm room tour, explain the partner safety rules, and help you choose the right class lane.
    </p>

    ${vaultBanner}

    <div class="glossary-grandslam-banner p-3 mb-4 rounded-3 bg-white text-dark shadow-sm" aria-label="Grand Slam Tuition Offer">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
        <span class="glossary-pill ss-primary">Grand Slam Tuition Offer</span>
        <span class="small fw-semibold text-muted">5.1x Value Package</span>
      </div>
      <h3 class="h5 fw-bold mb-2" style="color: var(--ss-ink, #362B24);">12-Week Core Culture Immersion</h3>
      <p class="small text-muted mb-3">
        Includes your official custom academy Gi &amp; white belt ($120&ndash;$145 value), 36 coached classes, dedicated partner safety matching, full Async Practice Vault access ($150 value), Day-One Mat Vocabulary Blueprint ($47 value), and our 30-Day Training Fit Guarantee.
      </p>
      <div class="d-flex flex-wrap gap-2">
        <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Coached Free First Visit</a>
        <a class="glossary-btn glossary-btn-secondary" href="/options-pricing#start">Compare 12-Week Tuition Tracks</a>
      </div>
    </div>

    <div class="ss-link-grid">
      <a href="/bjj-glossary">Browse Beginner Glossary</a>
      <span>Async Practice Vault companion coming soon</span>
      <a href="/schedule">View Class Schedule</a>
      <a href="/free-bjj-intro-tannersville-ny">Reserve Coached First Visit</a>
    </div>

    <div class="ss-inline-actions mt-3">
      <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Your Free First Visit</a>
      <a class="glossary-btn glossary-btn-secondary" href="/options-pricing">See Options &amp; Pricing</a>
    </div>
  </div>
</section>
`;
};

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

  ${renderTermNextStep(term)}

  <section id="faq" class="glossary-card glossary-term-section">
    <h2>FAQ</h2>
    <div class="glossary-term-faq-list">
      ${term.faq.map((item) => `<details class="glossary-card"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('\n')}
    </div>
  </section>

  ${renderReviewsSection()}

  <nav class="term-pagination glossary-term-pagination button-row" aria-label="Glossary navigation">
    <a id="prev-term" href="/bjj-glossary" hidden>Previous term</a>
    <a id="back-term-results" href="/bjj-glossary">Back to results</a>
    <a id="next-term" href="/bjj-glossary" hidden>Next term</a>
  </nav>

  <script id="glossary-term-nav-data" type="application/json">${navJson}</script>
</main>`;

  return renderLayout({
    title: term.seo.title,
    description: term.seo.description,
    canonicalUrl: canonicalUrlFor(term.slug),
    componentBundleName: 'glossary-term',
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
          <p>That means the glossary is not trying to become an encyclopedia of every niche variation. It is trying to make local beginner class language clearer, especially for adults starting on day one, parents checking whether a class feels safe, and kids or teens hearing a new term for the first time.</p>
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
          <p>For brand-new adults, terms like <a href="/bjj-glossary/base">base</a>, <a href="/bjj-glossary/posture">posture</a>, <a href="/bjj-glossary/frame">frame</a>, and <a href="/bjj-glossary/tap">tap</a> usually do more good than chasing advanced technique names. For kids and teens, the useful words are often even simpler: reset, balance, stand up safely, and protect your partner.</p>
        </article>
        <article class="glossary-card glossary-surface--light">
          <h2>Helpful next pages</h2>
          <p>Use the glossary together with the rest of the site so the language connects back to an actual class decision.</p>
          <div class="ss-link-grid">
            <a href="/bjj-glossary">Browse the full glossary</a>
            <a href="https://www.youtube.com/@SenseiSandyBJJ">Watch the video library</a>
            <a href="/student-hub">See this week&apos;s class focus</a>
            <a href="/schedule">Check the class schedule</a>
            <a href="/bjj-classes/adults-tannersville-ny">Adults program details</a>
            <a href="/bjj-classes/kids-tannersville-ny">Kids program details</a>
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
            <p>Because the glossary changes over time. This page gives students and parents a quick way to see that coverage is improving, beginner terms are being clarified, and new class language is being introduced with clear local context.</p>
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
    componentBundleName: 'glossary-hub',
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

const buildSearchIndex = (terms) => terms.map((term) => ({
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

const writeStaticIntegrationAssets = async (terms) => {
  const searchIndex = buildSearchIndex(terms);

  await fs.mkdir(ASSETS_DATA_ROOT, { recursive: true });
  await fs.writeFile(path.join(ASSETS_DATA_ROOT, 'glossary-search.json'), `${JSON.stringify(searchIndex, null, 2)}\n`, 'utf8');
  const termMap = Object.fromEntries(terms.flatMap((term) => {
    const record = { slug: term.slug, aliases: term.aliases, redirectFrom: term.redirectFrom, canonical: glossaryPathFor(term.slug) };
    return [term.slug, ...term.aliases, ...term.redirectFrom].map((alias) => [slugify(alias), record]);
  }));
  await fs.writeFile(path.join(ASSETS_DATA_ROOT, 'glossary-term-map.json'), `${JSON.stringify(termMap, null, 2)}\n`, 'utf8');
};

// Sync definition FAQs backed by the term summary, without replacing custom FAQs.
const syncFaqs = async (terms) => {
  const pending = [];
  for (const term of terms) {
    const definitionQuestion = `What does ${term.term.toLowerCase()} mean in BJJ?`;
    if (!term.faq.some(({ q, a }) => q === definitionQuestion && a === term.summary)) continue;
    const file = path.join(OUTPUT_ROOT, term.slug, 'index.html');
    const original = await fs.readFile(file, 'utf8');
    const answers = new Map([[definitionQuestion, term.summary]]);
    const visible = new Set();
    const structured = new Set();
    let html = original.replace(/(<details\b[^>]*>\s*<summary>)([\s\S]*?)(<\/summary>\s*<p>)([\s\S]*?)(<\/p>\s*<\/details>)/g,
      (whole, start, question, middle, answer, end) => {
        const key = [...answers.keys()].find((q) => escapeHtml(q) === question);
        if (!key) return whole;
        visible.add(key);
        return `${start}${question}${middle}${escapeHtml(answers.get(key))}${end}`;
      });
    html = html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
      (whole, start, body, end) => {
        const graph = JSON.parse(body);
        let next = body;
        for (const node of graph['@graph'] || [graph]) {
          if (node['@type'] !== 'FAQPage') continue;
          for (const question of node.mainEntity || []) {
            if (!answers.has(question.name)) continue;
            structured.add(question.name);
            const oldAnswer = question.acceptedAnswer.text;
            const answer = answers.get(question.name);
            if (oldAnswer !== answer) {
              next = next.replace(JSON.stringify(oldAnswer), JSON.stringify(answer));
            }
          }
        }
        return `${start}${next}${end}`;
      });
    // Customized pages can have different FAQ questions. Only sync questions present
    // on both surfaces; fail before writing if a matching question loses its counterpart.
    for (const question of new Set([...visible, ...structured])) {
      if (!visible.has(question) || !structured.has(question)) {
        throw new Error(`${term.slug}: FAQ surface mismatch for ${question}`);
      }
    }
    if (!visible.has(definitionQuestion) || !structured.has(definitionQuestion)) {
      throw new Error(`${term.slug}: missing definition FAQ surface`);
    }
    if (html !== original) pending.push([file, html]);
  }
  const searchPath = path.join(ASSETS_DATA_ROOT, 'glossary-search.json');
  const searchIndex = buildSearchIndex(terms);
  const search = `${JSON.stringify(searchIndex, null, 2)}\n`;
  if (search !== await fs.readFile(searchPath, 'utf8')) pending.push([searchPath, search]);
  const hubPath = path.join(OUTPUT_ROOT, 'index.html');
  const hub = await fs.readFile(hubPath, 'utf8');
  const bySlug = new Map(searchIndex.map((term) => [term.slug, term.searchText]));
  const nextHub = hub.replace(/<article\b[^>]*\bdata-glossary-card\b[^>]*>/g, (tag) => {
    const slug = tag.match(/\bdata-slug="([^"]+)"/)?.[1];
    if (!bySlug.has(slug)) throw new Error(`Unknown glossary hub card: ${slug}`);
    if (!/\bdata-search="[^"]*"/.test(tag)) throw new Error(`Missing search text: ${slug}`);
    return tag.replace(/\bdata-search="[^"]*"/, `data-search="${escapeHtml(bySlug.get(slug))}"`);
  });
  if (nextHub !== hub) pending.push([hubPath, nextHub]);
  for (const [file, content] of pending) await fs.writeFile(file, content, 'utf8');
  console.log(`Synced glossary FAQs and search text: ${pending.length} changed files. Layouts and redirects preserved.`);
};

const main = async () => {
  const { values } = parseArgs({ options: { 'sync-faqs': { type: 'boolean', default: false } } });
  const terms = await loadTerms();
  validateTerms(terms);

  const sortedTerms = [...terms].sort((a, b) => a.displayTerm.localeCompare(b.displayTerm));
  if (values['sync-faqs']) return syncFaqs(sortedTerms);
  const termMap = new Map(sortedTerms.map((term) => [term.slug, term]));
  const glossaryFiltersScript = await hashedAssetPath(GLOSSARY_FILTERS_SRC);

  await fs.mkdir(OUTPUT_ROOT, { recursive: true });
  const writeGeneratedPage = async (filePath, html, metadata) => {
    const frontMatter = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
    await fs.writeFile(filePath, `---\n${frontMatter}\n---\n${html}`, 'utf8');
  };

  await writeGeneratedPage(path.join(OUTPUT_ROOT, 'index.html'), renderHubPage(sortedTerms, termMap, glossaryFiltersScript), {
    layout: 'layouts/base.njk',
    title: 'BJJ Glossary | Sensei Sandy BJJ',
    description: 'Plain-English BJJ glossary for beginners, parents, and students training at Sensei Sandy BJJ in Tannersville, NY.',
    canonicalUrl: 'https://senseisandy.com/bjj-glossary',
    bodyClass: 'page-glossary page-bjj-glossary bjj-glossary-page ss-page ss-page-glossary',
    permalink: '/bjj-glossary/index.html'
  });

  for (const term of sortedTerms) {
    const termDir = path.join(OUTPUT_ROOT, term.slug);
    await fs.mkdir(termDir, { recursive: true });
    await writeGeneratedPage(path.join(termDir, 'index.html'), renderTermPage(term, termMap, glossaryFiltersScript), {
      layout: 'layouts/base.njk',
      title: `${term.displayTerm} in BJJ: Meaning, Basics, and Why It Matters`,
      description: term.summary,
      canonicalUrl: `https://senseisandy.com/bjj-glossary/${term.slug}`,
      bodyClass: 'page-glossary-term page-glossary-term-rich page-bjj-glossary bjj-glossary-page',
      permalink: `/bjj-glossary/${term.slug}/index.html`
    });
  }

  const updatesDir = path.join(OUTPUT_ROOT, 'updates');
  await fs.mkdir(updatesDir, { recursive: true });
  await writeGeneratedPage(path.join(updatesDir, 'index.html'), renderUpdatesPage(sortedTerms, glossaryFiltersScript), {
    layout: 'layouts/base.njk',
    title: 'BJJ Glossary Updates | Sensei Sandy BJJ',
    description: 'Track recent Sensei Sandy BJJ glossary additions, updated beginner terms, coverage notes, and new plain-English class examples for students.',
    canonicalUrl: 'https://senseisandy.com/bjj-glossary/updates',
    bodyClass: 'page-glossary page-glossary-updates page-bjj-glossary bjj-glossary-page',
    permalink: '/bjj-glossary/updates/index.html'
  });

  await writeStaticIntegrationAssets(sortedTerms);
  await syncGlossaryRedirects(sortedTerms);

  console.log(`Generated glossary hub plus ${sortedTerms.length} term pages.`);
};

main();
