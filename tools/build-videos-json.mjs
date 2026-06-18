import fs from "node:fs/promises";
import path from "node:path";

const configPath = path.resolve("config", "videos.playlist.json");
const overridesPath = path.resolve("data", "video-overrides.json");
const outputPath = path.resolve("assets", "videos.json");

const loadConfig = async () => {
  try {
    const content = await fs.readFile(configPath, "utf8");
    return JSON.parse(content);
  } catch {
    throw new Error(`Missing config at ${configPath}.`);
  }
};

const loadOverrides = async () => {
  try {
    const content = await fs.readFile(overridesPath, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
};

const unescapeHtml = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");

const pick = (source, regex) => (source.match(regex)?.[1] || "").trim();

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "";
  const total = Number(seconds);
  if (Number.isNaN(total)) return "";
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const pad = (value) => String(value).padStart(2, "0");
  if (hours) return `${hours}:${pad(minutes)}:${pad(secs)}`;
  return `${minutes}:${pad(secs)}`;
};

const fetchPlaylist = async (playlistUrl) => {
  const res = await fetch(playlistUrl);
  if (!res.ok) throw new Error(`Playlist feed responded ${res.status}`);
  return res.text();
};

const buildItems = (xml, overrides) => {
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
  return entries
    .map((match, index) => {
      const entry = match[1];
      const videoId = pick(entry, /<yt:videoId>(.*?)<\/yt:videoId>/);
      if (!videoId) return null;
      const title = unescapeHtml(pick(entry, /<title>([\s\S]*?)<\/title>/));
      const published = pick(entry, /<published>(.*?)<\/published>/);
      const thumb =
        pick(entry, /<media:thumbnail[^>]*url="([^"]+)"/) ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const override = overrides[videoId] || {};
      return {
        id: videoId,
        title,
        thumb,
        duration: override.duration || "",
        lane: override.lane || "",
        tags: override.tags || [],
        published: published || "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        position: index + 1,
      };
    })
    .filter(Boolean);
};

const loadExistingOutput = async () => {
  try {
    const existing = await fs.readFile(outputPath, "utf8");
    return JSON.parse(existing);
  } catch {
    return null;
  }
};

const createStubPayload = (config) => ({
  source: "stub",
  playlistId: config.playlistId,
  playlistUrl: config.playlistUrl,
  generatedAt: new Date().toISOString(),
  items: [],
});

const writeOutput = async (payload) => {
  const json = JSON.stringify(payload, null, 2);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  let existing = "";
  try {
    existing = await fs.readFile(outputPath, "utf8");
  } catch {}
  if (existing.trim() === json.trim()) {
    console.log(`assets/videos.json unchanged (${payload.items.length} videos)`);
  } else {
    await fs.writeFile(outputPath, json, "utf8");
    console.log(`Wrote ${outputPath} (${payload.items.length} videos)`);
  }
};

const run = async () => {
  const config = await loadConfig();
  const overrides = await loadOverrides();
  const playlistUrl =
    config.playlistUrl ||
    `https://www.youtube.com/feeds/videos.xml?playlist_id=${config.playlistId}`;
  let xml;
  try {
    xml = await fetchPlaylist(playlistUrl);
  } catch (fetchError) {
    console.warn("Playlist fetch failed, falling back to cached data:", fetchError.message);
    const cached = await loadExistingOutput();
    if (cached && Array.isArray(cached.items) && cached.items.length) {
      console.log(`Using cached videos.json (${cached.items.length} items).`);
      return;
    }
    console.warn("No cached data found; writing stub payload.");
    await writeOutput(createStubPayload(config));
    return;
  }
  const items = buildItems(xml, overrides);
  if (!items.length) {
    throw new Error("Playlist feed returned zero videos.");
  }
  const payload = {
    source: "playlist",
    playlistId: config.playlistId,
    playlistUrl: playlistUrl,
    generatedAt: new Date().toISOString(),
    items,
  };
  await writeOutput(payload);
};

await run().catch((error) => {
  console.error("Failed to refresh videos.json:", error);
  process.exitCode = 1;
});
