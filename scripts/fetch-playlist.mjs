import fs from "node:fs/promises";

const PLAYLIST_ID = "PLUuJkF3J8MUwKZlIv6ayAqEtiACWLPcE3";
const API_KEY = process.env.YOUTUBE_API_KEY;
const OVERRIDES_PATH = "assets/video-overrides.json";
const OUTPUT_PATH = "assets/data/videos.playlist.json";

if (!API_KEY) {
  console.error("Missing YOUTUBE_API_KEY env var");
  process.exit(1);
}

const loadOverrides = async () => {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const fetchPage = async (pageToken) => {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("playlistId", PLAYLIST_ID);
  url.searchParams.set("key", API_KEY);
  if (pageToken) url.searchParams.set("pageToken", pageToken);

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error: ${res.status} ${text}`);
  }
  return res.json();
};

const laneFromTitle = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("kid")) return "kids";
  if (t.includes("teen")) return "teens";
  if (t.includes("adult")) return "adults";
  if (t.includes("safety") || t.includes("beginner") || t.includes("intro")) return "safety";
  return "mixed";
};

const normalizeTags = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return [...new Set(value.map((tag) => String(tag).toLowerCase().trim()).filter(Boolean))];
  }
  return [...new Set(String(value).split(",").map((tag) => tag.toLowerCase().trim()).filter(Boolean))];
};

const pickThumb = (snippet = {}) => {
  const thumbSources = [
    snippet.thumbnails?.maxres?.url,
    snippet.thumbnails?.standard?.url,
    snippet.thumbnails?.high?.url,
    snippet.thumbnails?.medium?.url,
    snippet.thumbnails?.default?.url,
  ];
  return thumbSources.find(Boolean) || "";
};

const run = async () => {
  const overrides = await loadOverrides();
  let items = [];
  let token = null;
  do {
    const data = await fetchPage(token);
    const nodes = Array.isArray(data.items) ? data.items : [];
    for (const item of nodes) {
      const id = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const position = Number(item.snippet?.position);
      if (!id || Number.isNaN(position)) continue;
      items.push({ id, snippet: item.snippet, position });
    }
    token = data.nextPageToken || null;
  } while (token);

  items = items.sort((a, b) => a.position - b.position || a.id.localeCompare(b.id));

  const payload = {
    source: "playlist",
    playlistId: PLAYLIST_ID,
    playlistUrl: `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: items.map((item, index) => {
      const snippet = item.snippet || {};
      const title = snippet.title || "";
      const override = overrides[item.id] || {};
      const tags = normalizeTags(override.tags || []);
      const lane = override.lane || laneFromTitle(title);
      const published = snippet.publishedAt || "";
      return {
        id: item.id,
        title,
        thumb: pickThumb(snippet),
        lane,
        tags,
        archived: Boolean(override.archived),
        published,
        detail: override.detail || "",
        playlistIndex: index + 1,
      };
    }),
  };

  await fs.mkdir("assets/data", { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${payload.items.length} videos → ${OUTPUT_PATH}`);
};

run().catch((error) => {
  console.error("Failed to fetch playlist:", error);
  process.exitCode = 1;
});
