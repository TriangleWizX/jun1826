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
  const searchBlob = normalizeSearchText([term.term, term.displayTerm, term.summary, ...(term.aliases || []), ...(term.redirectFrom || [])].join(' '));

  const pills = [term.categoryLabel, term.isFoundational ? 'Start here' : ''].filter(Boolean);

  return `<article class="term-card ss-glossary-term-card glossary-card" data-glossary-card data-category="${escapeHtml(term.category)}" data-level="${escapeHtml(term.level)}" data-letter="${escapeHtml(alphaLetter(term.term))}" data-contexts="${escapeHtml(term.contexts.join(','))}" data-common="${term.isCommon ? '1' : '0'}" data-foundational="${term.isFoundational ? '1' : '0'}" data-search="${escapeHtml(searchBlob)}" data-slug="${escapeHtml(term.slug)}">
  <div class="glossary-card-meta term-card__meta ss-glossary-term-tag">
    ${pills.map((pill) => `<span class="glossary-pill">${escapeHtml(pill)}</span>`).join('\n')}
  </div>
  <h3 class="term-card__title ss-glossary-term-title"><a data-term-link href="${escapeHtml(glossaryPathFor(term.slug))}">${escapeHtml(term.displayTerm)}</a></h3>
  <p class="term-card__summary ss-glossary-term-def">${escapeHtml(term.beginnerTranslation || term.summary)}</p>
  <a class="term-card__cta ss-glossary-term-cta glossary-card-cta" data-term-link href="${escapeHtml(glossaryPathFor(term.slug))}">Read this term</a>
</article>`;
};

const renderDirectoryItem = (term) => {
  const contexts = (term.contexts || []).join(',');
  return `<button type="button" class="glossary-directory-item" role="option" data-slug="${escapeHtml(term.slug)}" data-category="${escapeHtml(term.category)}" data-level="${escapeHtml(term.level)}" data-letter="${escapeHtml(alphaLetter(term.term))}" data-common="${term.isCommon ? '1' : '0'}" data-foundational="${term.isFoundational ? '1' : '0'}" data-contexts="${escapeHtml(contexts)}" aria-selected="false"><span class="dir-item-top"><span class="dir-item-title">${escapeHtml(term.displayTerm)}.</span><span class="dir-item-badge">${escapeHtml(term.categoryLabel)}.</span></span></button>`;
};

const renderReaderCard = (term, termMap) => {
  if (!term) return '';
  const related = (term.related || []).slice(0, 3).map((slug) => termMap.get(slug)).filter(Boolean);
  return `<div class="reader-card-inner">
  <div class="reader-header"><p class="reader-pill reader-pill-cat">${escapeHtml(term.categoryLabel)}</p><h2 class="reader-title" id="reader-title">${escapeHtml(term.displayTerm)}</h2></div>
  <div class="reader-body">
    <p class="reader-text reader-text-lead" id="reader-summary">${escapeHtml(term.summary)}</p>
    ${term.beginnerTranslation ? `<p class="callout-text" id="reader-translation">${escapeHtml(term.beginnerTranslation)}</p>` : ''}
    ${term.safetyNote ? `<p class="safety-text" id="reader-safety">${escapeHtml(term.safetyNote)}</p>` : ''}
    ${related.length ? `<h3>More terms</h3><ul id="reader-related-chips">${related.map((item) => `<li><button type="button" data-slug="${escapeHtml(item.slug)}">${escapeHtml(item.displayTerm)}</button></li>`).join('')}</ul>` : ''}
    <div class="reader-nav-actions"><button type="button" id="reader-prev-btn" title="Previous term">Prev</button><button type="button" id="reader-next-btn" title="Next term">Next</button><button type="button" id="reader-copy-btn">Copy link</button><a id="reader-standalone-link" href="${escapeHtml(glossaryPathFor(term.slug))}">Read this term</a></div>
    <div class="reader-cta-actions"><a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Free Intro</a><a class="glossary-btn glossary-btn-secondary" href="/schedule">See times</a></div>
  </div></div>`;
};

const renderBuyerPathsSection = () => `<section class="ss-glossary-paths glossary-surface--dark" aria-labelledby="glossary-paths-title">
  <div class="ss-paths-inner">
    <div class="ss-paths-header">
      <p class="ss-paths-eyebrow">Start with your class</p>
      <h2 id="glossary-paths-title">Pick a term to learn.</h2>
      <p>Choose a short list. Open a word to read more.</p>
    </div>

    <div class="ss-path-grid">
      <article class="ss-path-card" data-path="parent">
        <h3>For kids and parents</h3><p>Start with safety and class words.</p>
        <a class="ss-path-link" href="/bjj-glossary/bully-proof">Read youth terms</a>
        <div class="ss-path-chips" aria-label="Parent glossary shortcuts">
          <a href="/bjj-glossary/bully-proof">Bully Proof</a>
          <a href="/bjj-glossary/safety">Safety First</a>
          <a href="/bjj-glossary/beginner-lane">Beginner Lane</a>
        </div>
      </article>

      <article class="ss-path-card" data-path="adult-beginner">
        <h3>For new adults</h3><p>Learn words for key positions.</p>
        <a class="ss-path-link" href="/bjj-glossary/guard">Learn guard</a>
        <div class="ss-path-chips" aria-label="Adult beginner shortcuts">
          <a href="/bjj-glossary/guard">Guard</a>
          <a href="/bjj-glossary/mount">Mount</a>
          <a href="/bjj-glossary/side-control">Side Control</a>
        </div>
      </article>

      <article class="ss-path-card" data-path="sparring-nerves">
        <h3>For teens</h3><p>Learn how to move with care.</p>
        <a class="ss-path-link" href="/bjj-glossary/grip">Learn grip</a>
        <div class="ss-path-chips" aria-label="Control shortcuts">
          <a href="/bjj-glossary/grip">Grip</a>
          <a href="/bjj-glossary/frame">Frame</a>
          <a href="/bjj-glossary/underhook">Underhook</a>
        </div>
      </article>

      <article class="ss-path-card" data-path="self-defense">
        <h3>For all new students</h3><p>Learn the tap and class rules.</p>
        <a class="ss-path-link" href="/bjj-faqs">Read common questions</a>
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
    <p>Read a word. Watch how it works. Try it in class with Sandy. Ask for help as you learn.</p>
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
      <p>Meet Sandy. See the room and learn the rules. Ask which class fits your week. Sandy guides your first class at your pace.</p>
      <a class="step-link" href="/free-bjj-intro-tannersville-ny">Reserve Free First Visit &rarr;</a>
    </article>

    <article class="glossary-flywheel-step">
      <span class="step-num">Step 03</span>
      <h3>12-Week Core Culture</h3>
      <p>See the class plans and what each includes. Ask Sandy which plan fits you.</p>
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
  const directoryItems = terms.filter((term) => term.isFoundational).slice(0, 8).map(renderDirectoryItem).join('\n');
  const initialTerm = termMap.get('tap') || terms[0];
  const initialReaderHtml = renderReaderCard(initialTerm, termMap);
  const searchIndex = buildSearchIndex(terms);

  const body = `<main class="glossary-index page-glossary glossary-page ss-main ss-infil-style" id="glossary-index" role="main">
  <!-- 1. Compact Hero -->
  <section class="glossary-hero" aria-labelledby="glossary-title">
    <div class="glossary-shell glossary-hero-compact">
      <div class="glossary-hero-copy">
        <p class="glossary-eyebrow">Sensei Sandy BJJ &middot; Plain-English Mat Dictionary</p>
        <h1 id="glossary-title">Brazilian Jiu Jitsu Terms in Plain English</h1>
        <p class="glossary-lead">Learn the words you hear in BJJ. BJJ is a way to grapple. You learn to move with a partner. Start with these plain guides.</p>
        <div class="glossary-day-one-strip" aria-label="Day One Essential Terms">
          <span class="day-one-label">Day 1 Essentials:</span>
          <div class="day-one-chips">
            <button type="button" class="day-one-chip" data-quick-term="tap">The Tap</button>
            <button type="button" class="day-one-chip" data-quick-term="guard">Guard</button>
            <button type="button" class="day-one-chip" data-quick-term="frame">Frame</button>
            <button type="button" class="day-one-chip" data-quick-term="shrimp">Shrimp</button>
            <button type="button" class="day-one-chip" data-quick-term="mount">Mount</button>
            <button type="button" class="day-one-chip" data-quick-term="side-control">Side Control</button>
            <button type="button" class="day-one-chip" data-quick-term="base">Base</button>
            <button type="button" class="day-one-chip" data-quick-term="safety">Safety</button>
          </div>
        </div>
      </div>

      <aside class="glossary-hero-cta-card" aria-label="First class reassurance">
        <h3>First Class Walkthrough</h3>
        <p>Tour the studio, learn the safe tap &amp; reset, understand cooperative partner safety, and start calmly at your pace.</p>
        <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Free First Visit</a>
      </aside>
    </div>
  </section>

  <!-- 2. Audience paths and interactive glossary -->
  ${renderBuyerPathsSection()}
  <section class="glossary-shell glossary-app-section" id="glossary-app" aria-label="Interactive BJJ Glossary">
    <form id="glossary-filter-form" role="search">
    <!-- Command Toolbar -->
    <div class="glossary-command-bar" id="glossary-controls">
      <div class="glossary-search-row">
        <div class="glossary-search-wrapper">
          <span class="glossary-search-icon" aria-hidden="true">&cir;</span>
          <input id="glossary-q" class="glossary-search-input" name="q" type="search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="Search 141 terms by name, Japanese alias, or concept... (Press '/' to focus)" aria-label="Search BJJ terms">
          <button type="button" id="glossary-search-clear" class="glossary-clear-btn" aria-label="Clear search" hidden>&times;</button>
          <kbd class="glossary-kbd-hint" aria-hidden="true">/</kbd>
        </div>
        <div class="glossary-actions-group">
          <button type="button" id="surprise-me-inline" class="glossary-btn glossary-btn-action" title="Pick a random term">
            <span class="btn-icon">&#127922;</span> Random Term
          </button>
          <button type="button" id="copy-state-link" class="glossary-btn glossary-btn-action" title="Copy link to current term">
            <span class="btn-icon">&#128279;</span> Copy Link
          </button>
          <select id="glossary-theme" class="glossary-theme-select" aria-label="Color theme" hidden>
            <option value="light">Theme: Light</option>
          </select>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <fieldset><legend>Filter by category</legend><div class="glossary-filter-categories" role="group" aria-label="Filter by category">
        <button class="glossary-category-pill is-active" type="button" data-filter-category="all" aria-pressed="true">All (${terms.length})</button>
        <button class="glossary-category-pill" type="button" data-filter-common="foundational" aria-pressed="false">&#127775; Day 1 Foundational</button>
        <button class="glossary-category-pill" type="button" data-filter-category="positions" aria-pressed="false">Positions</button>
        <button class="glossary-category-pill" type="button" data-filter-category="submissions" aria-pressed="false">Submissions</button>
        <button class="glossary-category-pill" type="button" data-filter-category="movements" aria-pressed="false">Movements</button>
        <button class="glossary-category-pill" type="button" data-filter-category="basics" aria-pressed="false">Basics</button>
        <button class="glossary-category-pill" type="button" data-filter-category="gi-no-gi" aria-pressed="false">Gi / No-Gi</button>
        <button class="glossary-category-pill" type="button" data-filter-context="kids" aria-pressed="false">Youth / Bully-Proof</button>
      </div></fieldset>
      <fieldset><legend>Filter by level</legend>
        <button class="glossary-category-pill" type="button" data-filter-level="all" aria-pressed="true">All levels</button>
        <button class="glossary-category-pill" type="button" data-filter-level="beginner" aria-pressed="false">Beginner</button>
        <button class="glossary-category-pill" type="button" data-filter-level="intermediate" aria-pressed="false">More terms</button>
      </fieldset>
      <fieldset><legend>Filter by class</legend>
        <button class="glossary-category-pill" type="button" data-filter-context="kids" aria-pressed="false">Kids</button>
        <button class="glossary-category-pill" type="button" data-filter-context="adults" aria-pressed="false">Adults</button>
        <button class="glossary-category-pill" type="button" data-filter-context="gi" aria-pressed="false">Gi</button>
        <button class="glossary-category-pill" type="button" data-filter-context="nogi" aria-pressed="false">No-Gi</button>
      </fieldset>
      <fieldset><legend>Show</legend>
        <button class="glossary-category-pill" type="button" data-filter-common="common" aria-pressed="false">Common terms</button>
        <button class="glossary-category-pill" type="button" data-filter-common="foundational" aria-pressed="false">First terms</button>
      </fieldset>
      <!-- A-Z Alphabet Quick Jump -->
      <div class="glossary-az-bar" aria-label="Browse by first letter">
        <span class="glossary-az-label">A&ndash;Z:</span>
        <div class="glossary-az-scroll" id="glossary-az-rail">
          <button type="button" id="surprise-me-az" class="glossary-az-letter" aria-label="Pick a random term">Random</button>
          ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => `<button type="button" class="glossary-az-letter" data-letter-link="${l}" aria-label="Jump to letter ${l}">${l}</button>`).join('')}
        </div>
      </div>

      <!-- Results Count Bar -->
      <div class="glossary-status-row" aria-live="polite">
        <div class="glossary-count-text">
          Showing <strong id="result-count" data-glossary-results="">${terms.length}</strong> terms
        </div>
        <button type="button" id="reset-filters" class="glossary-reset-btn" hidden>Reset filters</button>
      </div>
    </form>

    <!-- Master-Detail Split Grid Layout -->
    <div class="glossary-split-layout">
      <!-- Left Column: Term Directory List -->
      <aside class="glossary-directory-column" aria-label="Glossary Directory">
        <div class="glossary-directory-header">
          <span class="directory-heading">Term Directory</span>
          <span class="directory-count" id="directory-count">${terms.length} terms</span>
        </div>
        <div class="glossary-directory-list" id="glossary-directory" role="listbox" aria-label="Select a term to view">
          ${directoryItems}
        </div>
        <div class="glossary-empty-state" id="glossary-empty" hidden>
          <div class="empty-icon">&#128269;</div>
          <h3>No matching terms found</h3>
          <p>Try searching for a different move, alias, or reset your filters.</p>
          <button type="button" class="glossary-btn glossary-btn-secondary" id="empty-reset-btn">Reset All Filters</button>
        </div>
      </aside>

      <!-- Right Column: Active Term Reader Showcase -->
      <section class="glossary-reader-column" id="glossary-reader" aria-live="polite" aria-label="Term Details">
        <article class="glossary-reader-card" id="glossary-active-card">
          ${initialReaderHtml}
        </article>
      </section>
    </div>

    <!-- Full Semantic Fallback Stream for SEO & Crawlers (Hidden when JS is enabled) -->
    <div class="glossary-fallback-stream" id="glossary-fallback-stream" aria-hidden="true">
      <div class="ss-glossary-term-grid glossary-grid">${cards}</div>
    </div>
  </section>

  <!-- 3. Day 1 Starter Pack (Visual Cards) -->
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
      <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Free Intro</a>
    </div>
  </section>

  <!-- 5. Learning Flywheel -->
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

  <!-- 6. Next Steps -->
  <section class="glossary-shell glossary-next-steps glossary-surface--dark" aria-label="Glossary next steps">
    <div class="glossary-start-cta">
      <p class="mb-3">Ready to see the words in class?</p>
      <div class="d-flex flex-wrap justify-content-center gap-2">
        <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Free Intro</a>
        <a class="glossary-btn glossary-btn-secondary" href="/schedule">See the class schedule</a>
        <a class="glossary-btn glossary-btn-secondary" href="/bjj-classes/adults-tannersville-ny">Adult beginner Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/bjj-classes/kids-tannersville-ny">Kids Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/bjj-classes/teens-tannersville-ny">Teen Jiu-Jitsu</a>
        <a class="glossary-btn glossary-btn-secondary" href="/private-lessons">Private BJJ lessons</a>
      </div>
    </div>
  </section>

  <!-- Toast Container -->
  <div id="glossary-toast" class="glossary-toast" role="status" aria-live="polite">Link copied to clipboard!</div>

  <!-- Embedded Data for 0ms Hydration -->
  <script id="glossary-data" type="application/json">
${JSON.stringify(searchIndex)}
  </script>
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
    <h2 id="term-next-step-title">Want to try ${escapeHtml(term ? term.displayTerm.toLowerCase() : 'this')} in class?</h2>
    <p>
      Meet Sandy for a free visit. See the room. Learn the rules.
    </p>

    ${vaultBanner}

    <div class="ss-link-grid">
      <a href="/bjj-glossary">Browse Beginner Glossary</a>
      <span>Async Practice Vault companion coming soon</span>
      <a href="/schedule">View Class Schedule</a>
      <a href="/free-bjj-intro-tannersville-ny">Reserve Coached First Visit</a>
    </div>

    <div class="ss-inline-actions mt-3">
      <a class="glossary-btn glossary-btn-primary" href="/free-bjj-intro-tannersville-ny">Reserve Free Intro</a>
      <a class="glossary-btn glossary-btn-secondary" href="/options-pricing">See Options &amp; Pricing</a>
    </div>
  </div>
</section>
`;
};

const renderReviewsSection = () => `<section id="reviews" class="glossary-card glossary-term-section glossary-term-reviews">
  <h2>Local reviews</h2>
  <p><a href="/success-stories">Read local reviews</a></p>
</section>`;

const renderTermPage = (term, termMap, glossaryFiltersScript) => {
  const relatedTerms = (term.related || []).map((slug) => termMap.get(slug)).filter(Boolean);
  const simpleCategory = ({ movements: 'Moves', positions: 'Positions', submissions: 'Moves', basics: 'Basics', 'gi-no-gi': 'Gi and No-Gi' })[term.category] || 'BJJ';
  const navJson = JSON.stringify({ currentSlug: term.slug, indexSrc: '/assets/data/glossary-search.json' }).replace(/<\//g, '<\\/');
  const short = (value, fallback) => String(value || fallback).split(/(?<=[.!?])\s+/)[0].trim();
  const phrases = (term.commonClassPhrases || []).slice(0, 2);
  const simpleFirstSentence = (value, fallback) => {
    const first = short(value, fallback);
    const words = first.split(/\s+/);
    return words.length > 12 ? `${words.slice(0, 8).join(' ')}.` : first;
  };
  const faq = (term.faq || []).slice(0, 2);
  const body = `<main class="glossary-term page-glossary-term glossary-page ss-main term-page-parity" id="glossary-term" role="main">
  <nav class="breadcrumbs ss-glossary-breadcrumbs glossary-term-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><a href="/bjj-glossary">BJJ Glossary</a><span aria-current="page">${escapeHtml(term.displayTerm)}</span></nav>
  <div class="term-return glossary-term-return button-row"><a id="back-to-results" href="/bjj-glossary">Back to results</a><a id="open-interactive-dictionary" href="/bjj-glossary?t=${escapeHtml(term.slug)}">Open the glossary</a><button type="button" id="copy-term-link">Copy term link</button></div>
  <header class="term-hero glossary-hero glossary-card ss-glossary-term-hero"><p class="term-meta">${escapeHtml(simpleCategory)} · ${escapeHtml(term.level === 'beginner' ? 'Beginner' : 'More terms')}</p><h1 class="glossary-hero__title">${escapeHtml(term.h1)}</h1></header>
  <section id="definition" class="glossary-card glossary-term-section"><h2>Quick meaning</h2><p>${escapeHtml(short(term.summary, term.term))}</p></section>
  <section id="beginner-translation" class="glossary-card glossary-term-section"><h2>In plain words</h2><p>${escapeHtml(short(term.beginnerTranslation, `Ask your coach to show ${term.term}.`))}</p></section>
  <section id="why-it-matters" class="glossary-card glossary-term-section"><h2>Why it helps</h2><p>${escapeHtml(term.whyItMatters || 'It helps you learn this move.')}</p></section>
  <section id="beginners-should-know" class="glossary-card glossary-term-section"><h2>Start here</h2><p>${escapeHtml(term.whatBeginnersShouldKnow || 'Ask your coach to show you.')}</p></section>
  <section id="common-class-phrases" class="glossary-card glossary-term-section"><h2>Coach says</h2><ul>${phrases.map((phrase) => `<li>${escapeHtml(short(phrase, 'Ask your coach.'))}</li>`).join('') || '<li>Ask your coach.</li>'}</ul></section>
  <section id="safety-cue" class="glossary-card glossary-term-section ss-safety-cue"><h2>Stay safe</h2><p>${escapeHtml(simpleFirstSentence(term.safetyNote, 'Move with care. Ask your coach.'))}</p></section>
  <section id="related-terms" class="glossary-card glossary-term-section"><h2>Related links</h2><h3>More terms</h3><ul>${relatedTerms.map((item) => `<li><a href="${escapeHtml(glossaryPathFor(item.slug))}">${escapeHtml(item.displayTerm)}</a></li>`).join('')}</ul><a href="/bjj-glossary">Browse all terms</a></section>
  <section class="ss-term-next-step glossary-card glossary-surface--dark"><h2>Want to try it?</h2><a href="/free-bjj-intro-tannersville-ny">Reserve Free Intro</a> <a href="/schedule">See times</a></section>
  <section id="faq" class="glossary-card glossary-term-section"><h2>FAQ</h2>${faq.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')}</section>
  ${renderReviewsSection()}
  <nav class="term-pagination glossary-term-pagination button-row" aria-label="Glossary navigation"><a id="prev-term" href="/bjj-glossary" hidden>Previous term</a><a id="back-term-results" href="/bjj-glossary">Back to results</a><a id="next-term" href="/bjj-glossary" hidden>Next term</a></nav>
  <script id="glossary-term-nav-data" type="application/json">${navJson}</script>
</main>`;
  return renderLayout({ title: term.seo.title, description: term.seo.description, canonicalUrl: canonicalUrlFor(term.slug), componentBundleName: 'glossary-term', bodyClass: 'page-glossary-term page-glossary-term-rich page-bjj-glossary bjj-glossary-page', extraHead: renderTermSchema(term, relatedTerms), body, scripts: [glossaryFiltersScript] });
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
    .map((t) => `<li><a href="/bjj-glossary/${escapeHtml(t.slug)}">${escapeHtml(t.displayTerm)}</a></li>`)
    .join('\n');
  const updatedRows = updatedTerms.length
    ? updatedTerms.map((t) => `<li><a href="/bjj-glossary/${escapeHtml(t.slug)}">${escapeHtml(t.displayTerm)}</a> refined on ${escapeHtml(t.updatedAt)}.</li>`).join('\n')
    : '<li>Fresh edits show up in the next glossary build.</li>';
  const newlyAddedRows = newlyAdded.length
    ? newlyAdded.map((t) => `<li><a href="/bjj-glossary/${escapeHtml(t.slug)}">${escapeHtml(t.displayTerm)}</a> added ${escapeHtml(t.createdAt)}.</li>`).join('\n')
    : '<li>No new terms in the last 30 days.</li>';

  const body = `<main class="ss-main glossary-page" id="glossary-updates" role="main">
  <section class="ss-section">
    <div class="container ss-container">
      <div class="glossary-card glossary-hero">
        <p class="glossary-eyebrow">Glossary maintenance</p>
        <h1>BJJ Glossary Updates</h1>
        <p>See what changed in this glossary. Find new words and tips for class.</p>
        <p>New to BJJ? Start with <a href="/bjj-glossary">the full glossary</a>.</p>
      </div>
    </div>
  </section>

  <section class="ss-section">
    <div class="container ss-container">
      <div class="glossary-card glossary-surface--light">
        <div class="glossary-section-header">
          <h2>What changed recently</h2>
          <p>These counts show what the glossary covers.</p>
        </div>
        <div class="ss-path-grid">
          <article class="glossary-card">
            <h3>Total coverage</h3>
            <p>${terms.length} terms in the glossary.</p>
          </article>
          <article class="glossary-card">
            <h3>Beginner focus</h3>
            <p>${beginnerCount} terms for new students. ${foundationalCount} are marked “Start here.”</p>
          </article>
          <article class="glossary-card">
            <h3>Teaching support</h3>
            <p>${mediaCount} terms have media. ${aliasCount} list other words you may hear.</p>
          </article>
          <article class="glossary-card">
            <h3>Common language</h3>
            <p>${commonCount} words are common in class.</p>
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
          <p>We add words you may hear in class or see in a video. We start with safety words, key spots, and moves you may learn first.</p>
          <p>This is a guide to class words. It is not a list of every BJJ move. It can help adults, kids, teens, and parents learn what a word means.</p>
        </article>
        <article class="glossary-card glossary-surface--light">
          <h2>Current priorities</h2>
          <p>We add words that help you follow a coach and ask questions.</p>
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
          <p>Pick two or three words to read. Then get set for class.</p>
          <p>Start with <a href="/bjj-glossary/base">base</a>, <a href="/bjj-glossary/posture">posture</a>, <a href="/bjj-glossary/frame">frame</a>, and <a href="/bjj-glossary/tap">tap</a>. Kids and teens can learn to reset, find their balance, stand up, and care for a partner.</p>
        </article>
        <article class="glossary-card glossary-surface--light">
          <h2>Helpful next pages</h2>
          <p>Use these links to learn more or plan a class.</p>
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
            <p>Quick answers about this page and the glossary.</p>
        </div>
        <div class="glossary-term-faq-list">
          <details class="glossary-card">
            <summary>Why does this page list changes?</summary>
            <p>So you can see what words we add or change.</p>
          </details>
          <details class="glossary-card">
            <summary>Is this only for new students?</summary>
            <p>No. Students and parents can use it to learn class words.</p>
          </details>
          <details class="glossary-card">
            <summary>How often is this page updated?</summary>
            <p>When we change a term and build the site. The counts use the same data as the glossary.</p>
          </details>
          <details class="glossary-card">
            <summary>What if a class word is missing?</summary>
            <p>Read a close term, then ask your coach what the word means. We may add words that students ask about often.</p>
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

const buildSearchIndex = (terms) => terms.map((term) => {
  const vaultMatch = VAULT_CURRICULUM_MAP.get(term.slug);
  return {
    slug: term.slug,
    term: term.displayTerm || term.term,
    rawTerm: term.term,
    category: term.category,
    categoryLabel: term.categoryLabel || CATEGORY_LABELS[term.category] || term.category,
    level: term.level,
    levelLabel: term.levelLabel || LEVEL_LABELS[term.level] || term.level,
    letter: alphaLetter(term.term),
    contexts: term.contexts || [],
    common: term.isCommon,
    foundational: term.isFoundational,
    isCommon: term.isCommon,
    isFoundational: term.isFoundational,
    summary: term.summary,
    definition: term.definition,
    beginnerTranslation: term.beginnerTranslation,
    whyItMatters: term.whyItMatters,
    whatBeginnersShouldKnow: term.whatBeginnersShouldKnow,
    commonMistake: term.commonMistake,
    coachCue: term.coachCue,
    safetyNote: term.safetyNote,
    commonClassPhrases: term.commonClassPhrases || [],
    aliases: term.aliases || [],
    redirectFrom: term.redirectFrom || [],
    related: term.related || [],
    curriculum: vaultMatch ? { week: vaultMatch.week, title: vaultMatch.title, track: vaultMatch.track } : null,
    searchText: normalizeSearchText([
      term.term,
      term.displayTerm,
      term.summary,
      term.definition,
      term.beginnerTranslation,
      term.whyItMatters,
      term.coachCue,
      ...(term.aliases || []),
      ...(term.redirectFrom || []),
      ...(term.faq || []).flatMap((faq) => [faq.q, faq.a])
    ].join(' '))
  };
});

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
