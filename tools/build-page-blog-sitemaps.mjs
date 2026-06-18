import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://senseisandy.com";
const TODAY = new Date().toISOString().slice(0, 10);

const PAGES_SITEMAP = "pages-sitemap.xml";
const BLOG_SITEMAP = "blog-sitemap.xml";

const EXCLUDED_DIRS = new Set([
  "assets",
  "partials",
  "archive",
  "tmp",
  "crawl-reports",
  "docs",
  "scripts",
  "tools",
  "_includes",
  "api",
  "node_modules",
  ".git"
]);

const EXCLUDED_FILES = new Set([
  "404.html",
  "nav-include.html",
  "footer-include.html",
  "cta-header.html",
  "cta-footer.html",
  "cta-row.html",
  "cta-hero.html",
  "cta-decision.html",
  "cta-primary.html",
  "offer-block.html",
  "pricing-module.html",
  "pricing-module-fragment.html",
  "schedule-block.html"
]);

const VIDEO_HUB_PATHS = new Set([
  "/bjj-videos",
  "/videos/kids",
  "/videos/teens",
  "/videos/adults",
  "/videos/breakfalls",
  "/videos/takedowns",
  "/videos/guard-passing",
  "/videos/escapes",
  "/videos/submissions",
  "/videos/self-defense"
]);

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const normalizePathname = (pathname) => {
  const clean = String(pathname || "").split("?")[0].split("#")[0];
  if (!clean || clean === "/") return "/";
  return clean.replace(/\/+$/, "") || "/";
};

const toCanonicalPath = (relFile) => {
  const rel = relFile.replace(/\\/g, "/").replace(/^\.?\//, "");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return normalizePathname(`/${rel.slice(0, -"index.html".length)}`);
  if (rel.endsWith(".html")) return normalizePathname(`/${rel.slice(0, -".html".length)}`);
  return null;
};

const toLoc = (pathname) => (pathname === "/" ? SITE : `${SITE}${pathname}`);

const parseMetaDirectives = (html, name) => {
  const directives = [];
  const re = /<meta\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const nameMatch = tag.match(/\bname\s*=\s*["']?([^"'\s>]+)["']?/i);
    if (!nameMatch || String(nameMatch[1]).toLowerCase() !== name) continue;
    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (!contentMatch) continue;
    directives.push(
      ...contentMatch[1]
        .toLowerCase()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    );
  }
  return directives;
};

const hasNoindex = (html) => {
  const robots = parseMetaDirectives(html, "robots");
  const googlebot = parseMetaDirectives(html, "googlebot");
  return [...robots, ...googlebot].some((t) => t === "noindex" || t === "none");
};

const extractCanonicalHref = (html) => {
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const relMatch = tag.match(/\brel\s*=\s*["']([^"']*)["']/i);
    if (!relMatch || relMatch[1].toLowerCase().trim() !== "canonical") continue;
    const hrefMatch = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) return hrefMatch[1].trim();
  }
  return "";
};

const isIndexableCanonicalMatch = (html, expectedPath) => {
  if (hasNoindex(html)) return false;
  const href = extractCanonicalHref(html);
  if (!href) return false;
  let canonical;
  try {
    canonical = new URL(href);
  } catch {
    return false;
  }
  if (canonical.origin.toLowerCase() !== SITE.toLowerCase()) return false;
  return normalizePathname(canonical.pathname) === expectedPath;
};

const walkHtmlFiles = async (dir, relBase = "") => {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.posix.join(relBase, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      out.push(...(await walkHtmlFiles(path.join(dir, entry.name), rel)));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    if (EXCLUDED_FILES.has(rel) || EXCLUDED_FILES.has(entry.name)) continue;
    out.push(rel);
  }
  return out;
};

const parseExistingMetadata = async (sitemapFile) => {
  const map = new Map();
  try {
    const xml = await fs.readFile(path.join(ROOT, sitemapFile), "utf8");
    const urlBlocks = xml.match(/<url\b[^>]*>[\s\S]*?<\/url>/gi) || [];
    for (const block of urlBlocks) {
      const loc = (block.match(/<loc>\s*([^<]+)\s*<\/loc>/i) || [])[1]?.trim();
      if (!loc) continue;
      const lastmod = (block.match(/<lastmod>\s*([^<]+)\s*<\/lastmod>/i) || [])[1]?.trim();
      const priority = (block.match(/<priority>\s*([^<]+)\s*<\/priority>/i) || [])[1]?.trim();
      map.set(loc, { lastmod: lastmod || "", priority: priority || "" });
    }
  } catch {
    return map;
  }
  return map;
};

const buildXml = (locs, priorMap) => {
  const rows = locs.map((loc) => {
    const prior = priorMap.get(loc);
    const lastmod = prior?.lastmod || TODAY;
    const priority = prior?.priority || "";
    const lines = [
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${escapeXml(lastmod)}</lastmod>`
    ];
    if (priority) lines.push(`    <priority>${escapeXml(priority)}</priority>`);
    lines.push("  </url>");
    return lines.join("\n");
  });
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${rows.join("\n")}\n` +
    "</urlset>\n"
  );
};

const isVideoWatchPath = (pathname) => pathname.startsWith("/videos/") && !VIDEO_HUB_PATHS.has(pathname);
const isBlogPath = (pathname) => pathname === "/blog" || pathname.startsWith("/blog/");

const main = async () => {
  const relHtmlFiles = await walkHtmlFiles(ROOT);
  const paths = new Set();

  for (const relFile of relHtmlFiles) {
    const pagePath = toCanonicalPath(relFile);
    if (!pagePath) continue;
    if (pagePath === "/sitemap" || pagePath.endsWith("-sitemap")) continue;
    const abs = path.join(ROOT, relFile);
    const html = await fs.readFile(abs, "utf8");
    if (!isIndexableCanonicalMatch(html, pagePath)) continue;
    paths.add(pagePath);
  }

  const blogLocs = [...paths]
    .filter((p) => isBlogPath(p))
    .map(toLoc)
    .sort((a, b) => a.localeCompare(b));
  const pageLocs = [...paths]
    .filter((p) => !isBlogPath(p) && !isVideoWatchPath(p))
    .map(toLoc)
    .sort((a, b) => a.localeCompare(b));

  const [pagesMeta, blogMeta] = await Promise.all([
    parseExistingMetadata(PAGES_SITEMAP),
    parseExistingMetadata(BLOG_SITEMAP)
  ]);

  const pagesXml = buildXml(pageLocs, pagesMeta);
  const blogXml = buildXml(blogLocs, blogMeta);

  await fs.writeFile(path.join(ROOT, PAGES_SITEMAP), pagesXml, "utf8");
  await fs.writeFile(path.join(ROOT, BLOG_SITEMAP), blogXml, "utf8");

  console.log(`Wrote ${PAGES_SITEMAP} (${pageLocs.length} URLs)`);
  console.log(`Wrote ${BLOG_SITEMAP} (${blogLocs.length} URLs)`);
};

await main();
