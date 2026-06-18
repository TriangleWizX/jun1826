import fs from 'node:fs/promises';
import path from 'node:path';
import {
  ROOT,
  iterHtmlFiles,
  loadJson,
  resolveHref,
  writeCsv
} from './url-qa-lib.mjs';

const POLICY_PATH = 'data/blog-linking-policy.json';
const REPORT_PATH = 'crawl-reports/blog-linkout-rules.csv';

const toFilePath = (urlPath) => {
  const rel = String(urlPath || '').replace(/^\//, '');
  if (!rel) return path.join(ROOT, 'index.html');
  return path.join(ROOT, rel, 'index.html');
};

const parseAnchorTags = (html) => {
  const tags = [];
  const clean = String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const re = /<a\b[^>]*>/gi;
  let m;
  while ((m = re.exec(clean)) !== null) tags.push(m[0]);
  return tags;
};

const parseAttrs = (tag) => {
  const attrs = {};
  const re = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(tag)) !== null) {
    const key = String(m[1] || '').toLowerCase();
    attrs[key] = (m[3] ?? m[4] ?? m[5] ?? '').trim();
  }
  return attrs;
};

const main = async () => {
  const [contract, policy] = await Promise.all([
    loadJson('config/url-contract.json'),
    loadJson(POLICY_PATH)
  ]);

  const canonicalOrigin = String(contract.canonicalOrigin || '').replace(/\/$/, '');
  if (!canonicalOrigin) throw new Error('config/url-contract.json is missing canonicalOrigin.');

  const monitorAllBlogPosts = policy.monitorAllBlogPosts === true;
  const monitoredPosts = Array.isArray(policy.monitoredPosts) ? policy.monitoredPosts : [];

  const req = policy.requirements || {};
  const minLinksOut = Number(req.minLinksOut || 0);
  const minContextualBlogLinks = Number(req.minContextualBlogLinks || 0);
  const minMoneyPageLinks = Number(req.minMoneyPageLinks || 0);
  const minHubPageLinks = Number(req.minHubPageLinks || 0);
  const requireAllServiceLinks = req.requireAllServiceLinks === true;
  const requiredServicePages = new Set(Array.isArray(req.requiredServicePages) ? req.requiredServicePages.map((v) => String(v || '').trim()) : []);
  const requiredAutoBlocks = Array.isArray(req.requiredAutoBlocks) ? req.requiredAutoBlocks.map((v) => String(v || '').trim()).filter(Boolean) : [];
  const moneyPages = new Set(Array.isArray(policy.moneyPages) ? policy.moneyPages.map((v) => String(v || '').trim()) : []);
  const hubPages = new Set(Array.isArray(policy.hubPages) ? policy.hubPages.map((v) => String(v || '').trim()) : []);
  const pillarPages = new Set(Array.isArray(policy.pillarPages) ? policy.pillarPages.map((v) => String(v || '').trim()) : []);

  let scopePosts = monitoredPosts;
  if (monitorAllBlogPosts) {
    const files = await iterHtmlFiles(ROOT);
    scopePosts = files
      .filter((rel) => rel.startsWith('blog/') && rel.endsWith('/index.html') && rel !== 'blog/index.html')
      .map((rel) => `/${rel.replace(/\/index\.html$/, '')}`)
      .sort();
  }
  if (!scopePosts.length) throw new Error(`${POLICY_PATH} produced an empty monitored post scope.`);

  const rows = [];
  const failures = [];

  for (const postPath of scopePosts) {
    const filePath = toFilePath(postPath);
    let html = '';
    try {
      html = await fs.readFile(filePath, 'utf8');
    } catch {
      failures.push(`${postPath} (missing file)`);
      rows.push([`${canonicalOrigin}${postPath}`, '0', '0', '0', '0', '0', '0', 'missing_file', 'fail']);
      continue;
    }

    const blogLinks = new Set();
    const moneyLinks = new Set();
    const hubLinks = new Set();
    const serviceLinks = new Set();
    const pillarLinks = new Set();
    const allInternalLinks = new Set();

    for (const tag of parseAnchorTags(html)) {
      const attrs = parseAttrs(tag);
      const href = String(attrs.href || '').trim();
      if (!href) continue;

      const relTokens = String(attrs.rel || '').toLowerCase().split(/\s+/).filter(Boolean);
      if (relTokens.includes('nofollow')) continue;

      const resolved = resolveHref({
        href,
        sourceRelPath: path.relative(ROOT, filePath),
        baseOrigin: canonicalOrigin,
        contract
      });
      if (!resolved || !resolved.isInternal) continue;

      const target = resolved.normalizedPath;
      allInternalLinks.add(target);
      if (target.startsWith('/blog/') && target !== postPath) blogLinks.add(target);
      if (moneyPages.has(target)) moneyLinks.add(target);
      if (hubPages.has(target)) hubLinks.add(target);
      if (requiredServicePages.has(target)) serviceLinks.add(target);
      if (pillarPages.has(target)) pillarLinks.add(target);
    }

    const missingBlocks = requiredAutoBlocks.filter((marker) => !html.includes(marker));
    const pass = (
      allInternalLinks.size >= minLinksOut
      && blogLinks.size >= minContextualBlogLinks
      && moneyLinks.size >= minMoneyPageLinks
      && hubLinks.size >= minHubPageLinks
      && pillarLinks.size >= 1
      && missingBlocks.length === 0
      && (!requireAllServiceLinks || serviceLinks.size >= requiredServicePages.size)
    );

    rows.push([
      `${canonicalOrigin}${postPath}`,
      String(allInternalLinks.size),
      String(blogLinks.size),
      String(moneyLinks.size),
      String(hubLinks.size),
      String(serviceLinks.size),
      String(pillarLinks.size),
      [
        `internal:${[...allInternalLinks].slice(0, 5).join('|') || '-'}`,
        `blog:${[...blogLinks].slice(0, 5).join('|') || '-'}`,
        `money:${[...moneyLinks].slice(0, 3).join('|') || '-'}`,
        `hub:${[...hubLinks].slice(0, 3).join('|') || '-'}`,
        `service:${[...serviceLinks].slice(0, 5).join('|') || '-'}`,
        `pillar:${[...pillarLinks].slice(0, 5).join('|') || '-'}`,
        `missingBlocks:${missingBlocks.join('|') || '-'}`
      ].join(' '),
      pass ? 'pass' : 'fail'
    ]);

    if (!pass) {
      failures.push(
        `${postPath} (internal ${allInternalLinks.size}/${minLinksOut}, blog ${blogLinks.size}/${minContextualBlogLinks}, money ${moneyLinks.size}/${minMoneyPageLinks}, hub ${hubLinks.size}/${minHubPageLinks}, service ${serviceLinks.size}/${requiredServicePages.size || 0}, pillar ${pillarLinks.size}/1, missingMarkers ${missingBlocks.length})`
      );
    }
  }

  await writeCsv({
    path: REPORT_PATH,
    headers: ['url', 'internal_links', 'contextual_blog_links', 'money_page_links', 'hub_page_links', 'service_links', 'pillar_links', 'sample_targets', 'status'],
    rows
  });

  if (failures.length) {
    console.error(`qa-blog-linkout-rules failed with ${failures.length} URL(s).`);
    for (const item of failures) console.error(`- ${item}`);
    process.exit(1);
  }

  console.log(`qa-blog-linkout-rules passed (${rows.length} monitored post(s)).`);
};

main().catch((error) => {
  console.error(`qa-blog-linkout-rules failed: ${error.message}`);
  process.exit(1);
});
