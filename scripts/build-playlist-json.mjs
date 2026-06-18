import fs from "node:fs";

const PLAYLIST_ID = "PLUuJkF3J8MUwKZlIv6ayAqEtiACWLPcE3";
const INPUT_RAW = "playlist.raw.json";
const OUTPUT_FILE = `assets/videos-playlist-${PLAYLIST_ID}.json`;
const OVERRIDES_FILE = "assets/video-overrides.json";

const rawContent = fs.readFileSync(INPUT_RAW, "utf8");
const raw = JSON.parse(rawContent);
const entries = (Array.isArray(raw.entries) ? raw.entries : []).filter(Boolean);

const pickThumb = (entry) => {
  if (entry.thumbnail) return entry.thumbnail;
  if (Array.isArray(entry.thumbnails)) {
    const last = entry.thumbnails.at(-1);
    return (last && last.url) || entry.thumbnails[0]?.url;
  }
  return `https://i1.ytimg.com/vi/${entry.id}/hqdefault.jpg`;
};

const laneFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("kid")) return "kids";
  if (t.includes("teen")) return "teens";
  if (t.includes("adult")) return "adults";
  if (t.includes("safety") || t.includes("beginner") || t.includes("intro")) return "safety";
  return "mixed";
};

const toISO = (upload_date) => {
  if (!upload_date || upload_date.length !== 8) return "";
  const y = upload_date.slice(0, 4);
  const m = upload_date.slice(4, 6);
  const d = upload_date.slice(6, 8);
  return `${y}-${m}-${d}T00:00:00Z`;
};

let overrides = {};
try {
  overrides = JSON.parse(fs.readFileSync(OVERRIDES_FILE, "utf8"));
} catch {
  overrides = {};
}

const payload = {
  playlistId: PLAYLIST_ID,
  playlistUrl: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`,
  generatedAt: new Date().toISOString(),
  items: entries.map((entry, idx) => {
    const override = overrides[entry.id] || {};
    const tags = Array.isArray(override.tags) ? override.tags : [];
    return {
      id: entry.id,
      title: entry.title || "",
      thumb: pickThumb(entry),
      published: toISO(entry.upload_date),
      lane: override.lane || laneFromTitle(entry.title || ""),
      tags: tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean),
      detail: override.detail || "Playlist drop",
      playlistIndex: idx + 1
    };
  })
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf8");
console.log(`Wrote ${OUTPUT_FILE} (${payload.items.length} items)`);
