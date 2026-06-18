import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'data', 'internal-link-clusters.json');
const CLUSTER_TEMPLATE_PATH = path.join(ROOT, 'partials', 'blog-topic-cluster-links.html');
const RELATED_TEMPLATE_PATH = path.join(ROOT, 'partials', 'blog-related-posts.html');
const START_TRAINING_TEMPLATE_PATH = path.join(ROOT, 'partials', 'blog-start-training-links.html');
const HOME_PATH = path.join(ROOT, 'index.html');
const BLOG_HUB_PATH = path.join(ROOT, 'blog', 'index.html');

const BLOG_GLOB_PREFIX = path.join(ROOT, 'blog');

const MARKERS = {
  breadcrumbStart: '<!-- AUTO_BREADCRUMB_START -->',
  breadcrumbEnd: '<!-- AUTO_BREADCRUMB_END -->',
  startTrainingStart: '<!-- START_TRAINING_LINKS_START -->',
  startTrainingEnd: '<!-- START_TRAINING_LINKS_END -->',
  relatedStart: '<!-- RELATED_POSTS_START -->',
  relatedEnd: '<!-- RELATED_POSTS_END -->',
  clusterStart: '<!-- CLUSTER_LINKS_START -->',
  clusterEnd: '<!-- CLUSTER_LINKS_END -->',
  homeLatestStart: '<!-- HOME_RECENT_POSTS_START -->',
  homeLatestEnd: '<!-- HOME_RECENT_POSTS_END -->'
};

const REQUIRED_SERVICE_PATHS = ['/kids', '/teen-jiu-jitsu-tannersville-ny', '/adult-bjj', '/schedule'];
const REQUIRED_LOCATION_SUPPORT_POSTS = [
  '/blog/martial-arts-windham-ny',
  '/blog/kids-martial-arts-haines-falls'
];

const titleFromPath = (urlPath) => {
  const slug = String(urlPath || '').split('/').filter(Boolean).pop() || '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');
};

const toFilePath = (urlPath) => {
  const rel = String(urlPath || '').replace(/^\//, '');
  return path.join(ROOT, rel, 'index.html');
};

const stableVariant = (variants, key) => {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const seed = String(key || '')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return variants[seed % variants.length];
};

const labelForHref = ({ href, postPath, customAnchorVariants }) => {
  const variants = customAnchorVariants?.[href];
  return stableVariant(variants, `${postPath}::${href}`) || titleFromPath(href);
};

const injectOrReplaceByMarkers = ({ html, start, end, section }) => {
  if (html.includes(start) && html.includes(end)) {
    return html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), `${start}\n${section}\n${end}`);
  }

  const mainClose = '</main>';
  if (html.includes(mainClose)) {
    return html.replace(mainClose, `${start}\n${section}\n${end}\n${mainClose}`);
  }

  return `${html}\n${start}\n${section}\n${end}\n`;
};

const extractBodyTextTokens = (html) => {
  const stripped = String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .toLowerCase();
  return new Set(stripped.split(/[^a-z0-9]+/).filter((t) => t.length > 2));
};

const listBlogFiles = async () => {
  const out = [];
  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (entry.isFile() && entry.name === 'index.html') out.push(full);
    }
  };
  await walk(BLOG_GLOB_PREFIX);
  return out;
};

const toBlogPathFromFile = (filePath) => {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  return `/${rel.replace(/\/index\.html$/, '')}`;
};

const buildClusterSection = ({ clusterLabel, startHere, links, template, postPath, customAnchorVariants }) => {
  const linkItems = links
    .map((href) => {
      const label = labelForHref({ href, postPath, customAnchorVariants });
      return `        <li><a href="${href}">${label}</a></li>`;
    })
    .join('\n');

  return template
    .replace(/__CLUSTER_LABEL__/g, clusterLabel)
    .replace(/__START_HERE__/g, startHere)
    .replace(/__START_HERE_LABEL__/g, titleFromPath(startHere))
    .replace(/__LINK_ITEMS__/g, linkItems);
};

const buildRelatedSection = ({ template, related, postPath }) => {
  const merged = [
    ...related,
    ...REQUIRED_LOCATION_SUPPORT_POSTS.filter((href) => href !== postPath)
  ];
  const deduped = [...new Set(merged)].slice(0, 6);

  const linkItems = deduped
    .map((href) => `        <li><a href="${href}">${titleFromPath(href)}</a></li>`)
    .join('\n');
  return template.replace(/__RELATED_LINK_ITEMS__/g, linkItems);
};

const breadcrumbSection = (postPath) => {
  const title = titleFromPath(postPath);
  return [
    '<nav aria-label="Breadcrumb" class="mb-4">',
    '  <a href="/">Home</a> &rarr;',
    '  <a href="/blog">Blog</a> &rarr;',
    `  <span>${title}</span>`,
    '</nav>'
  ].join('\n');
};

const ensureBreadcrumbInArticle = (html, postPath) => {
  if (/aria-label="breadcrumb"/i.test(html) || /aria-label="Breadcrumb"/i.test(html)) return html;
  const start = MARKERS.breadcrumbStart;
  const end = MARKERS.breadcrumbEnd;
  const section = breadcrumbSection(postPath);

  if (html.includes('<article')) {
    return html.replace(/(<article\b[^>]*>)/i, `$1\n${start}\n${section}\n${end}\n`);
  }

  return injectOrReplaceByMarkers({ html, start, end, section });
};

const selectRelatedPosts = ({
  postPath,
  cluster,
  allPostPaths,
  allPostsSet,
  tokenMap,
  min = 2,
  max = 4
}) => {
  const clusterLinks = Array.isArray(cluster?.links) ? cluster.links : [];
  const primary = clusterLinks.filter((href) => href !== postPath && allPostsSet.has(href));
  const related = [...new Set(primary)].slice(0, max);
  if (related.length >= min) return related;

  const postTokens = tokenMap.get(postPath) || new Set();
  const scored = [];

  for (const candidate of allPostPaths) {
    if (candidate === postPath || related.includes(candidate)) continue;
    const tokens = tokenMap.get(candidate) || new Set();
    let overlap = 0;
    for (const t of postTokens) {
      if (tokens.has(t)) overlap += 1;
    }
    if (overlap > 0) scored.push({ candidate, overlap });
  }

  scored.sort((a, b) => b.overlap - a.overlap || a.candidate.localeCompare(b.candidate));
  for (const item of scored) {
    if (related.length >= max) break;
    related.push(item.candidate);
  }

  return related.slice(0, Math.max(min, max));
};

const extractBlogPostsFromHub = (hubHtml) => {
  const m = String(hubHtml).match(/const\s+BLOG_POSTS\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) return [];
  try {
    const posts = JSON.parse(m[1]);
    if (!Array.isArray(posts)) return [];
    return posts
      .flatMap((row) => Array.isArray(row?.ctas) ? row.ctas : [])
      .map((cta) => String(cta?.url || '').trim())
      .filter((url) => url.startsWith('/blog/'));
  } catch {
    return [];
  }
};

const buildHomeLatestSection = (paths) => {
  const rows = paths.slice(0, 3)
    .map((p) => `        <li><a href="${p}">${titleFromPath(p)}</a></li>`)
    .join('\n');

  return [
    '<section class="recent-posts py-4" aria-label="Latest from the blog">',
    '  <div class="container ss-container" style="max-width: 960px;">',
    '    <div class="border rounded-4 p-3 bg-light">',
    '      <h2 class="h5 mb-2">Latest from the Blog</h2>',
    '      <ul class="mb-0">',
    rows,
    '      </ul>',
    '    </div>',
    '  </div>',
    '</section>'
  ].join('\n');
};

const validateClusterRules = ({ clusters }) => {
  const errors = [];
  for (const [key, cluster] of Object.entries(clusters || {})) {
    const links = Array.isArray(cluster?.links) ? cluster.links.filter(Boolean) : [];
    const pillarTargets = Array.isArray(cluster?.pillarTargets) ? cluster.pillarTargets.filter(Boolean) : [];
    if (links.length < 2) {
      errors.push(`Cluster ${key} must define at least 2 sibling links.`);
    }
    if (pillarTargets.length < 1) {
      errors.push(`Cluster ${key} must define at least 1 pillar target.`);
    }
  }
  if (errors.length) throw new Error(errors.join(' '));
};

const main = async () => {
  const [cfg, clusterTemplate, relatedTemplate, startTrainingTemplate, blogHubHtml] = await Promise.all([
    fs.readFile(DATA_PATH, 'utf8').then((v) => JSON.parse(v)),
    fs.readFile(CLUSTER_TEMPLATE_PATH, 'utf8'),
    fs.readFile(RELATED_TEMPLATE_PATH, 'utf8'),
    fs.readFile(START_TRAINING_TEMPLATE_PATH, 'utf8'),
    fs.readFile(BLOG_HUB_PATH, 'utf8')
  ]);

  const postMap = cfg.postClusterMap || {};
  const clusters = cfg.clusters || {};
  const customAnchorVariants = cfg.customAnchorVariants || {};

  validateClusterRules({ clusters });

  const blogFiles = await listBlogFiles();
  const allPostPaths = blogFiles.map(toBlogPathFromFile).sort();
  const existingPostPaths = new Set(allPostPaths);
  const tokenMap = new Map();

  for (const fp of blogFiles) {
    const html = await fs.readFile(fp, 'utf8');
    tokenMap.set(toBlogPathFromFile(fp), extractBodyTextTokens(html));
  }

  let updated = 0;
  for (const postPath of [...existingPostPaths].sort()) {
    const clusterKey = postMap[postPath];
    const cluster = clusterKey ? clusters[clusterKey] : null;

    const filePath = toFilePath(postPath);
    let html;
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    const related = selectRelatedPosts({
      postPath,
      cluster,
      allPostPaths,
      allPostsSet: existingPostPaths,
      tokenMap,
      min: 2,
      max: 4
    });

    const relatedSection = buildRelatedSection({ template: relatedTemplate, related, postPath });

    let next = html;
    next = ensureBreadcrumbInArticle(next, postPath);
    next = injectOrReplaceByMarkers({
      html: next,
      start: MARKERS.startTrainingStart,
      end: MARKERS.startTrainingEnd,
      section: startTrainingTemplate
    });
    next = injectOrReplaceByMarkers({
      html: next,
      start: MARKERS.relatedStart,
      end: MARKERS.relatedEnd,
      section: relatedSection
    });

    if (cluster) {
      const startHere = String(cluster.startHere || '').trim();
      const clusterLinks = Array.from(new Set((cluster.links || []).filter((href) => href && href !== postPath))).slice(0, 5);
      if (startHere && clusterLinks.length >= 2) {
        const clusterSection = buildClusterSection({
          clusterLabel: String(cluster.label || 'Related Topic Links'),
          startHere,
          links: clusterLinks,
          template: clusterTemplate,
          postPath,
          customAnchorVariants
        });
        next = injectOrReplaceByMarkers({
          html: next,
          start: MARKERS.clusterStart,
          end: MARKERS.clusterEnd,
          section: clusterSection
        });
      }
    }

    if (next !== html) {
      await fs.writeFile(filePath, next, 'utf8');
      updated += 1;
    }
  }

  const hubPosts = extractBlogPostsFromHub(blogHubHtml);
  const uniqHubPosts = [...new Set(hubPosts)].filter((p) => existingPostPaths.has(p));
  if (uniqHubPosts.length >= 3) {
    const homeHtml = await fs.readFile(HOME_PATH, 'utf8');
    const homeSection = buildHomeLatestSection(uniqHubPosts);
    const homeNext = injectOrReplaceByMarkers({
      html: homeHtml,
      start: MARKERS.homeLatestStart,
      end: MARKERS.homeLatestEnd,
      section: homeSection
    });
    if (homeNext !== homeHtml) {
      await fs.writeFile(HOME_PATH, homeNext, 'utf8');
    }
  }

  console.log(`Updated ${updated} blog post(s) with internal linking blocks.`);
  console.log(`Service paths enforced in templates: ${REQUIRED_SERVICE_PATHS.join(', ')}`);
};

main().catch((error) => {
  console.error(`apply-blog-link-clusters failed: ${error.message}`);
  process.exit(1);
});
