import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE = "https://senseisandy.com";
const SITEMAPS = ["pages-sitemap.xml", "blog-sitemap.xml", "video-sitemap.xml"];

const normalizePath = (pathname) => {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
};

const normalizeLoc = (raw) => {
  const u = new URL(String(raw || "").trim());
  if (u.origin.toLowerCase() !== SITE.toLowerCase()) {
    throw new Error(`Non-canonical sitemap URL: ${raw}`);
  }
  return `${SITE}${normalizePath(u.pathname)}`;
};

const parseLocs = (xml) => {
  const out = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
};

const main = async () => {
  const seen = new Map();
  const dupes = new Map();

  for (const file of SITEMAPS) {
    const xml = await fs.readFile(path.join(ROOT, file), "utf8");
    const locs = parseLocs(xml);
    for (const loc of locs) {
      const key = normalizeLoc(loc);
      if (!seen.has(key)) {
        seen.set(key, new Set([file]));
        continue;
      }
      const sources = seen.get(key);
      sources.add(file);
      dupes.set(key, new Set(sources));
    }
  }

  if (dupes.size > 0) {
    console.error(`Sitemap overlap detected (${dupes.size} URL(s)):`);
    for (const [url, sources] of dupes.entries()) {
      console.error(`- ${url}`);
      console.error(`  in: ${[...sources].sort().join(", ")}`);
    }
    process.exit(1);
  }

  console.log(`OK: no cross-sitemap duplicates across ${SITEMAPS.length} files`);
};

await main();
