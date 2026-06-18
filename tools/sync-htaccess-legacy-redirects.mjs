import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const HTACCESS_PATH = path.join(ROOT, ".htaccess");
const LEGACY_REDIRECTS_PATH = path.join(ROOT, "config", "legacy-redirects.json");
const URL_CONTRACT_PATH = path.join(ROOT, "config", "url-contract.json");

const BLOCK_START = "# BEGIN AUTO_LEGACY_REDIRECTS";
const BLOCK_END = "# END AUTO_LEGACY_REDIRECTS";
const MANUAL_EXCEPTION_MARKER = "MANUAL_LEGACY_EXCEPTION";

const USAGE = [
  "Usage:",
  "  node tools/sync-htaccess-legacy-redirects.mjs --write",
  "  node tools/sync-htaccess-legacy-redirects.mjs --check"
].join("\n");

const normalizePath = (value) => {
  if (!value) return "/";
  let pathname = String(value).trim();
  if (!pathname) return "/";
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/+/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  return pathname || "/";
};

const escapeRegex = (value) => String(value).replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");

const parseArgs = () => {
  const args = new Set(process.argv.slice(2));
  const write = args.has("--write");
  const check = args.has("--check");
  if ((write && check) || (!write && !check)) {
    throw new Error(`${USAGE}\n\nChoose exactly one of --write or --check.`);
  }
  return { write, check };
};

const loadJson = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
};

const buildManagedBlock = ({ canonicalOrigin, redirects }) => {
  const pairs = Object.entries(redirects)
    .map(([rawSource, rawTarget]) => [normalizePath(rawSource), normalizePath(rawTarget)])
    .sort((a, b) => a[0].localeCompare(b[0]));

  const rules = [];
  for (const [sourcePath, targetPath] of pairs) {
    if (!sourcePath || sourcePath === "/") continue;
    if (!targetPath) continue;

    const sourceNoLeadingSlash = sourcePath.slice(1);
    const sourcePattern = `^${escapeRegex(sourceNoLeadingSlash)}/?$`;
    const targetUrl = new URL(targetPath, `${canonicalOrigin}/`).toString();
    rules.push(`RewriteRule ${sourcePattern} ${targetUrl} [L,R=301,NE]`);
  }

  return [
    BLOCK_START,
    "# Managed by: npm run redirects:sync",
    "# Source of truth: config/legacy-redirects.json",
    "# Keep this block above internal /videos rewrites so aliases win over stale files.",
    ...rules,
    BLOCK_END
  ].join("\n");
};

const collectManagedPatterns = (redirects) => {
  return new Set(
    Object.keys(redirects)
      .map((rawSource) => normalizePath(rawSource))
      .filter((sourcePath) => sourcePath && sourcePath !== "/")
      .map((sourcePath) => `^${escapeRegex(sourcePath.slice(1))}/?$`)
  );
};

const validateNoManualManagedDuplicates = ({ htaccessText, managedPatterns }) => {
  const lines = htaccessText.split(/\r?\n/);
  let inManagedBlock = false;
  const duplicateManualRules = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.includes(BLOCK_START)) {
      inManagedBlock = true;
      continue;
    }
    if (line.includes(BLOCK_END)) {
      inManagedBlock = false;
      continue;
    }
    if (inManagedBlock) continue;

    const match = line.match(/^RewriteRule\s+(\S+)\s+/);
    if (!match) continue;

    const sourcePattern = match[1];
    if (!managedPatterns.has(sourcePattern)) continue;

    const hasExceptionMarker =
      (lines[index - 1] || "").includes(MANUAL_EXCEPTION_MARKER) ||
      (lines[index - 2] || "").includes(MANUAL_EXCEPTION_MARKER);

    if (!hasExceptionMarker) {
      duplicateManualRules.push({ line: index + 1, sourcePattern });
    }
  }

  if (duplicateManualRules.length > 0) {
    const details = duplicateManualRules
      .map((entry) => `  line ${entry.line}: ${entry.sourcePattern}`)
      .join("\n");
    throw new Error(
      [
        "Manual RewriteRule duplicates managed legacy aliases from config/legacy-redirects.json.",
        `Remove the manual rule or add a nearby '# ${MANUAL_EXCEPTION_MARKER}: <reason>' marker.`,
        details
      ].join("\n")
    );
  }
};

const replaceOrInsertManagedBlock = ({ htaccessText, blockText, canonicalOrigin }) => {
  const startIndex = htaccessText.indexOf(BLOCK_START);
  const endIndex = htaccessText.indexOf(BLOCK_END);

  if (startIndex >= 0 || endIndex >= 0) {
    if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
      throw new Error("Malformed .htaccess managed redirect markers.");
    }
    const endLineBreak = htaccessText.indexOf("\n", endIndex + BLOCK_END.length);
    const afterBlockIndex = endLineBreak >= 0 ? endLineBreak + 1 : htaccessText.length;
    return `${htaccessText.slice(0, startIndex)}${blockText}\n${htaccessText.slice(afterBlockIndex)}`;
  }

  const canonicalRuleLine = `RewriteRule ^ ${canonicalOrigin}%{REQUEST_URI} [L,R=301,NE]`;
  const anchorIndex = htaccessText.indexOf(canonicalRuleLine);
  if (anchorIndex < 0) {
    throw new Error(`Could not find canonical host rule anchor in .htaccess: ${canonicalRuleLine}`);
  }

  const anchorLineEnd = htaccessText.indexOf("\n", anchorIndex);
  const insertAt = anchorLineEnd >= 0 ? anchorLineEnd + 1 : htaccessText.length;
  const prefix = htaccessText.slice(0, insertAt);
  const suffix = htaccessText.slice(insertAt);
  const needsLeadingBlank = !prefix.endsWith("\n\n");
  const spacer = needsLeadingBlank ? "\n" : "";
  return `${prefix}${spacer}${blockText}\n\n${suffix}`;
};

const main = async () => {
  const { write, check } = parseArgs();

  const [contractConfig, legacyConfig, currentHtaccess] = await Promise.all([
    loadJson(URL_CONTRACT_PATH),
    loadJson(LEGACY_REDIRECTS_PATH),
    fs.readFile(HTACCESS_PATH, "utf8")
  ]);

  const canonicalOrigin = String(contractConfig.canonicalOrigin || "").replace(/\/$/, "");
  if (!canonicalOrigin) {
    throw new Error("config/url-contract.json must include canonicalOrigin.");
  }

  const redirects = legacyConfig && typeof legacyConfig.redirects === "object"
    ? legacyConfig.redirects
    : {};
  const managedPatterns = collectManagedPatterns(redirects);

  const blockText = buildManagedBlock({ canonicalOrigin, redirects });
  const desiredHtaccess = replaceOrInsertManagedBlock({
    htaccessText: currentHtaccess,
    blockText,
    canonicalOrigin
  });
  validateNoManualManagedDuplicates({ htaccessText: desiredHtaccess, managedPatterns });

  if (check) {
    if (desiredHtaccess !== currentHtaccess) {
      console.error(".htaccess legacy redirect block is out of sync.");
      console.error("Run: npm run redirects:sync");
      process.exit(1);
    }
    console.log("OK: .htaccess legacy redirect block is in sync.");
    return;
  }

  if (write) {
    if (desiredHtaccess !== currentHtaccess) {
      await fs.writeFile(HTACCESS_PATH, desiredHtaccess, "utf8");
      console.log("Updated .htaccess managed legacy redirect block.");
      return;
    }
    console.log(".htaccess managed legacy redirect block already up to date.");
  }
};

main().catch((error) => {
  console.error(`sync-htaccess-legacy-redirects failed: ${error.message}`);
  process.exit(1);
});
