export const MAX_KEYWORD_CHARS = 60;
export const MAX_KEYWORD_TOKENS = 8;
export const MAX_KEYWORD_SLUG_LENGTH = MAX_KEYWORD_CHARS;

const FILLER_TOKENS = new Set([
  "a", "an", "the", "of", "to", "for", "with", "in", "on", "at", "by",
  "from", "and", "or",
  "video", "clip", "short", "shorts"
]);

const TITLE_META_TOKENS = new Set([
  "sensei", "sandy"
]);

export const normalizeVideoId = (videoId) => {
  return String(videoId || "")
    .replace(/_/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 11);
};

export const stripDiacritics = (input = "") => {
  return String(input)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const collapseDashes = (input = "") => {
  return String(input)
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const trimSlugAtDashBoundary = (input, maxLen = MAX_KEYWORD_CHARS) => {
  const value = String(input || "");
  if (!value || value.length <= maxLen) return value;

  const slice = value.slice(0, maxLen);
  const lastDash = slice.lastIndexOf("-");
  if (lastDash >= Math.floor(maxLen * 0.6)) {
    return slice.slice(0, lastDash);
  }
  return slice;
};

export const sanitizeKeywordPart = (raw, { source = "title" } = {}) => {
  if (!raw) return "";

  let value = stripDiacritics(String(raw))
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-");

  value = collapseDashes(value);
  if (!value) return "";

  let tokens = value.split("-").filter(Boolean);

  const filtered = tokens.filter((token) => !FILLER_TOKENS.has(token));
  if (filtered.length >= 2) {
    tokens = filtered;
  }

  if (source === "title") {
    const metaFiltered = tokens.filter((token) => !TITLE_META_TOKENS.has(token));
    if (metaFiltered.length >= 2) {
      tokens = metaFiltered;
    }
  }

  const seen = new Set();
  tokens = tokens.filter((token) => {
    if (seen.has(token)) return false;
    seen.add(token);
    return true;
  });

  tokens = tokens.slice(0, MAX_KEYWORD_TOKENS);
  value = collapseDashes(tokens.join("-"));
  value = trimSlugAtDashBoundary(value, MAX_KEYWORD_CHARS);
  return collapseDashes(value);
};

export const sanitizeKeywordSlug = (value) => {
  return sanitizeKeywordPart(value, { source: "title" });
};

export const trimKeywordSlug = (keywordSlug, maxLength = MAX_KEYWORD_SLUG_LENGTH) => {
  const slug = sanitizeKeywordPart(keywordSlug, { source: "title" });
  return collapseDashes(trimSlugAtDashBoundary(slug, maxLength));
};

export const buildVideoSlug = ({
  videoId,
  title,
  overrideSlug,
  maxKeywordLength = MAX_KEYWORD_SLUG_LENGTH
}) => {
  const slugId = normalizeVideoId(videoId);
  const stripTrailingId = (value) => {
    const suffix = `-${slugId}`;
    return value.endsWith(suffix) ? value.slice(0, -suffix.length) : value;
  };
  const overrideKeyword = stripTrailingId(
    collapseDashes(trimSlugAtDashBoundary(sanitizeKeywordPart(overrideSlug, { source: "override" }), maxKeywordLength))
  );
  const titleKeyword = stripTrailingId(
    collapseDashes(trimSlugAtDashBoundary(sanitizeKeywordPart(title, { source: "title" }), maxKeywordLength))
  );
  const keywordPart = overrideKeyword || titleKeyword || "video";
  const slug = `${keywordPart}-${slugId}`;
  const warning = overrideSlug && !overrideKeyword
    ? `override slug "${String(overrideSlug)}" is invalid after normalization; falling back to title-based keyword slug`
    : "";

  return {
    slug,
    slugId,
    keywordPart,
    warning
  };
};
