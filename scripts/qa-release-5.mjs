import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const failures = [];
const warnings = [];
const primaryOutputs = new Set([
  "index.html",
  "free-bjj-intro-tannersville-ny/index.html",
  "free-bjj-intro-tannersville-ny/confirmation/index.html",
  "options-pricing/index.html",
  "schedule/index.html",
  "bjj-classes/kids-tannersville-ny/index.html",
  "bjj-classes/teens-tannersville-ny/index.html",
  "bjj-classes/adults-tannersville-ny/index.html",
  "private-lessons.html",
  "visitor.html",
  "bjj-classes/tannersville-ny/index.html",
  "bjj-classes/hunter-ny/index.html",
  "bjj-classes/windham-ny/index.html",
  "bjj-classes/haines-falls-ny/index.html",
  "404.html",
]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}

function fail(check, file, message) {
  failures.push(`[${check}] ${path.relative(root, file || dist)}: ${message}`);
}

function relative(file) {
  return path.relative(dist, file).replaceAll(path.sep, "/");
}

const files = walk(dist);
const htmlFiles = files.filter((file) => {
  if (!file.endsWith(".html") || file.includes(`${path.sep}.venv${path.sep}`)) return false;
  const rel = path.relative(dist, file).replaceAll(path.sep, "/");
  if (!primaryOutputs.has(rel)) return false;
  if (/^(?:assets|partials|snippets|sources|admin|_drafts|\.tmb|\.vscode)\//i.test(rel)) return false;
  if (/^(?:site-shell|pricing-module(?:-fragment)?|reviews-village)\.html$/i.test(rel)) return false;
  const source = fs.readFileSync(file, "utf8");
  return /<!doctype\s+html|<html\b/i.test(source) && /rel=["']canonical["']/i.test(source);
});
const htmlRoutes = new Set(htmlFiles.map(relative));
const routeExists = (href) => {
  const clean = href.split(/[?#]/, 1)[0].replace(/^\/+/, "");
  if (!clean || clean === ".") return true;
  const candidates = [
    path.join(dist, clean),
    path.join(dist, clean, "index.html"),
    path.join(dist, `${clean}.html`),
  ];
  return candidates.some((candidate) => fs.existsSync(candidate));
};

if (!fs.existsSync(dist)) fail("output", dist, "generated output directory is missing");
if (!htmlFiles.length) fail("output", dist, "no generated HTML files found");

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  const rel = relative(file);
  const lang = source.match(/<html\b[^>]*\blang=["']([^"']+)["']/i);
  const titles = [...source.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const h1s = [...source.matchAll(/<h1\b/gi)];
  const mains = [...source.matchAll(/<main\b/gi)];
  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (!lang) fail("html", file, "missing html lang attribute");
  if (titles.length !== 1 || !titles[0][1].trim()) fail("metadata", file, "missing or duplicate title");
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(source)) fail("html", file, "missing viewport declaration");
  if (h1s.length !== 1) fail("headings", file, `expected exactly one H1, found ${h1s.length}`);
  if (mains.length !== 1) fail("landmarks", file, `expected exactly one main landmark, found ${mains.length}`);
  for (const id of new Set(duplicateIds)) fail("html", file, `duplicate id: ${id}`);

  for (const match of source.matchAll(/<(?:a|area)\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|sms:|#|javascript:|data:)/i.test(href)) continue;
    if (/^(?:file:|https?:\/\/(?:localhost|127\.0\.0\.1)|[A-Za-z]:[\\/]|\/\.\.\/)/i.test(href)) {
      fail("links", file, `forbidden local or staging link: ${href}`);
    } else if (!routeExists(href)) {
      fail("links", file, `missing internal target: ${href}`);
    }
  }
}

for (const file of files.filter((file) => /\.(html|css|js|json|xml|txt)$/i.test(file))) {
  const source = fs.readFileSync(file, "utf8");
  if (/(?:^|[\\/])_archive(?:[\\/]|$)/i.test(path.relative(dist, file)) || /_archive\//i.test(source)) {
    fail("archive", file, "archive content or path leaked into generated output");
  }
  if (/(?:BEGIN PRIVATE KEY|password\s*[:=]|api[_-]?key\s*[:=]|private[_-]?key\s*[:=]|ftp password)/i.test(source)) {
    fail("secrets", file, "possible credential or private-key pattern found");
  }
}

const sitemapFiles = files.filter((file) => path.basename(file).endsWith("sitemap.xml"));
for (const file of sitemapFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const loc of source.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
    const url = loc[1].trim();
    if (!url.startsWith("https://senseisandy.com/")) fail("sitemap", file, `wrong hostname or protocol: ${url}`);
    if (/confirmation|_archive|\.html(?:\/|$)/i.test(url)) fail("sitemap", file, `disallowed URL: ${url}`);
  }
}

const assetRefs = htmlFiles;
for (const file of assetRefs) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/(?:src|href|url)=["'(]?\/?([^"')?# ]+\.(?:css|js|png|jpe?g|webp|avif|svg|ico|woff2?))["') ]?/gi)) {
    const asset = match[1];
    if (/^(?:https?:|data:)/i.test(asset)) continue;
    const target = path.join(dist, asset);
    if (!fs.existsSync(target)) warnings.push(`[assets] ${path.relative(root, file)}: referenced asset not found: ${asset}`);
  }
}

if (warnings.length) console.warn(warnings.join("\n"));
if (failures.length) {
  console.error(`Release 5 validation failed (${failures.length} blocking issue${failures.length === 1 ? "" : "s"}):`);
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Release 5 validation passed: ${htmlFiles.length} HTML files, ${files.length} generated files, ${warnings.length} warnings.`);
}
