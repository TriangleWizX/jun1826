const DEFAULT_SITEMAP_URL = 'https://senseisandy.com/sitemap.xml';
const MAX_TIMEOUT_MS = 15000;

const args = process.argv.slice(2);

const getArgValue = (name) => {
  const direct = args.find((arg) => arg.startsWith(`${name}=`));
  if (direct) return direct.slice(name.length + 1);
  const index = args.findIndex((arg) => arg === name);
  if (index >= 0) return args[index + 1] || '';
  return '';
};

const sitemapUrlArg = getArgValue('--sitemap-url').trim();
const rootSitemapUrl = sitemapUrlArg || DEFAULT_SITEMAP_URL;

const ensureAbsoluteHttpUrl = (raw, label) => {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`${label} is not a valid URL: ${raw}`);
  }
  if (!/^https?:$/i.test(parsed.protocol)) {
    throw new Error(`${label} must use http(s): ${raw}`);
  }
  return parsed.toString();
};

const fetchText = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'senseisandy-qa-sitemap-live-redirects/1.0' }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
};

const extractLocs = (xml, parentUrl) => {
  const locs = [];
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null) {
    const raw = String(match[1] || '').trim();
    if (!raw) continue;
    try {
      locs.push(new URL(raw, parentUrl).toString());
    } catch {
      throw new Error(`Invalid <loc> in sitemap ${parentUrl}: ${raw}`);
    }
  }
  return locs;
};

const getSitemapType = (xml) => {
  if (/<sitemapindex\b/i.test(xml)) return 'sitemapindex';
  if (/<urlset\b/i.test(xml)) return 'urlset';
  return 'unknown';
};

const collectUrlsetUrls = async (sitemapUrl, visited = new Set()) => {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  const xml = await fetchText(sitemapUrl);
  const type = getSitemapType(xml);
  const locs = extractLocs(xml, sitemapUrl);

  if (type === 'sitemapindex') {
    const children = [];
    for (const childLoc of locs) {
      children.push(...(await collectUrlsetUrls(childLoc, visited)));
    }
    return children;
  }

  if (type === 'urlset') return locs;
  throw new Error(`Unsupported sitemap type at ${sitemapUrl}`);
};

const requestNoFollow = async (url, method) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'user-agent': 'senseisandy-qa-sitemap-live-redirects/1.0' }
    });
  } finally {
    clearTimeout(timeout);
  }
};

const getStatus = async (url) => {
  const headRes = await requestNoFollow(url, 'HEAD');
  if (headRes.status === 405 || headRes.status === 501) {
    const getRes = await requestNoFollow(url, 'GET');
    return getRes;
  }
  return headRes;
};

const main = async () => {
  const validatedRoot = ensureAbsoluteHttpUrl(rootSitemapUrl, '--sitemap-url');
  const urls = [...new Set(await collectUrlsetUrls(validatedRoot))].sort((a, b) => a.localeCompare(b));

  if (urls.length === 0) {
    throw new Error(`No URLs discovered from sitemap tree: ${validatedRoot}`);
  }

  const redirectFindings = [];
  const requestErrors = [];

  for (const url of urls) {
    try {
      const res = await getStatus(url);
      if (res.status >= 300 && res.status < 400) {
        redirectFindings.push({
          source: url,
          status: res.status,
          location: res.headers.get('location') || ''
        });
      }
    } catch (error) {
      requestErrors.push(`${url} -> ${error.message}`);
    }
  }

  console.log(`Checked ${urls.length} sitemap URLs from ${validatedRoot}`);

  if (redirectFindings.length > 0) {
    console.error(`Found ${redirectFindings.length} redirecting sitemap URL(s):`);
    for (const finding of redirectFindings) {
      console.error(`- ${finding.source} -> [${finding.status}] ${finding.location || '(missing Location header)'}`);
    }
  }

  if (requestErrors.length > 0) {
    console.error(`Encountered ${requestErrors.length} request error(s):`);
    for (const line of requestErrors) {
      console.error(`- ${line}`);
    }
  }

  if (redirectFindings.length > 0 || requestErrors.length > 0) {
    process.exit(1);
  }

  console.log('OK: no 3xx redirects found in sitemap URLs.');
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
