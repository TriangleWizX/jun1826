import fs from "node:fs/promises";
import path from "node:path";
import { buildVideoSlug } from "./lib/video-slug.mjs";

const root = process.cwd();
const dataPath = path.join(root, "assets", "data", "videos.playlist.json");
const overridesPath = path.join(root, "assets", "video-overrides.json");
const outPath = path.join(root, "video-sitemap.xml");
const INCLUDE_VIDEO_WATCH_PAGES = false;

console.log(`[videos:sitemap] Input playlist: ${dataPath}`);
console.log(`[videos:sitemap] Input overrides: ${overridesPath}`);

const rawData = JSON.parse(await fs.readFile(dataPath, "utf8"));
const videos = Array.isArray(rawData) ? rawData : rawData.items || [];
let overrides = {};
try {
  overrides = JSON.parse(await fs.readFile(overridesPath, "utf8"));
} catch {
  overrides = {};
}

const escapeXml = (value) => {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

const buildDescription = (title) => {
  const safeTitle = title || "Sensei Sandy BJJ video";
  return `Sensei Sandy BJJ video: ${safeTitle}. Beginner-friendly coaching in Tannersville, NY with calm, technical instruction.`;
};

const isThinSessionLike = ({ title = "", seoTitle = "", slug = "" }) => {
  const haystack = `${title} ${seoTitle} ${slug}`.toLowerCase();
  return (
    /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(haystack)
    || /\b(?:4pm|5pm|6pm|session|preview|class\s+session)\b/.test(haystack)
    || /^\d{1,2}pm\b/.test(haystack)
  );
};

const entries = videos.map((video) => {
  if (!INCLUDE_VIDEO_WATCH_PAGES) return "";
  const videoId = video.videoId || video.id;
  if (!videoId) return "";
  const override = overrides?.[videoId] || {};
  if (override.archived || override.noindex) return "";
  const baseTitle = video.title || "Sensei Sandy BJJ video";
  const title = String(override.seoTitle || "").trim() || baseTitle;
  const customSlug = String(override.slug || "").trim();
  const slugData = buildVideoSlug({
    videoId,
    title: baseTitle,
    overrideSlug: customSlug
  });
  if (slugData.warning) {
    console.warn(`[video-sitemap] ${videoId}: ${slugData.warning}`);
  }
  const slug = slugData.slug;
  const shouldNoindex = Boolean(override.noindex) || isThinSessionLike({ title: baseTitle, seoTitle: title, slug });
  if (shouldNoindex) return "";
  const loc = `https://senseisandy.com/videos/${slug}`;
  const thumbnail = video.thumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const playerLoc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
  const description = String(override.metaDescription || "").trim() || buildDescription(baseTitle);
  const published = video.published || "";

  const dateLine = published
    ? `    <video:publication_date>${escapeXml(published)}</video:publication_date>\n`
    : "";

  return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <video:video>\n      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>\n      <video:title>${escapeXml(title)}</video:title>\n      <video:description>${escapeXml(description)}</video:description>\n      <video:player_loc allow_embed=\"yes\">${escapeXml(playerLoc)}</video:player_loc>\n${dateLine}    </video:video>\n  </url>`;
}).filter(Boolean);

const xml = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:video=\"http://www.google.com/schemas/sitemap-video/1.1\">\n${entries.join("\n")}\n</urlset>\n`;

await fs.writeFile(outPath, xml, "utf8");
console.log(`Wrote ${outPath} (${entries.length} videos)`);
