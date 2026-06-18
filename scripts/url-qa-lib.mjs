import fs from 'node:fs/promises';
import path from 'node:path';

export const ROOT = process.cwd();

const SKIP_DIRS = new Set(['.git', '.vscode', '.tmb', '_includes', 'node_modules', 'tmp']);
const SSI_INCLUDE_RE = /<!--#include\s+virtual=(["'])(.*?)\1\s*-->/gi;

export const normalizePath = (value) => {
  if (!value) return '/';
  let pathname = String(value).trim();
  if (!pathname) return '/';
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/+/g, '/');
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  return pathname || '/';
};

export const filePathToWebPath = (relPath) => {
  const normalized = String(relPath).replace(/\\/g, '/');
  if (normalized === 'index.html') return '/';
  if (normalized.endsWith('/index.html')) {
    const dir = normalized.slice(0, -'/index.html'.length);
    return normalizePath(dir);
  }
  if (normalized.endsWith('.html')) {
    return normalizePath(normalized.slice(0, -'.html'.length));
  }
  return '/';
};

const shouldSkipDir = (dirPath) => {
  const parts = dirPath.split(path.sep);
  return parts.some((part) => SKIP_DIRS.has(part));
};

export const iterHtmlFiles = async (startDir = ROOT) => {
  const files = [];

  const walk = async (dir) => {
    if (shouldSkipDir(path.relative(ROOT, dir))) return;
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
      files.push(path.relative(ROOT, full));
    }
  };

  await walk(startDir);
  return files;
};

const normalizeIncludeTarget = (virtualPath = '') => {
  const clean = String(virtualPath || '').trim();
  if (!clean.startsWith('/')) return '';
  return clean.replace(/^\/+/, '');
};

export const expandSsiIncludes = async (html, {
  root = ROOT,
  stack = []
} = {}) => {
  const source = String(html || '');
  const matches = [...source.matchAll(SSI_INCLUDE_RE)];
  if (!matches.length) return source;

  let output = source;
  for (const match of matches) {
    const directive = match[0];
    const includeTarget = normalizeIncludeTarget(match[2]);
    if (!includeTarget) continue;

    const includePath = path.join(root, includeTarget);
    const normalizedIncludePath = path.normalize(includePath);
    if (!normalizedIncludePath.startsWith(path.normalize(root))) continue;
    if (stack.includes(normalizedIncludePath)) continue;

    let includeHtml = '';
    try {
      includeHtml = await fs.readFile(normalizedIncludePath, 'utf8');
    } catch {
      continue;
    }

    const expanded = await expandSsiIncludes(includeHtml, {
      root,
      stack: [...stack, normalizedIncludePath]
    });
    output = output.replace(directive, expanded);
  }

  return output;
};

export const readHtmlWithSsi = async (relPath, { root = ROOT } = {}) => {
  const fullPath = path.join(root, relPath);
  const html = await fs.readFile(fullPath, 'utf8');
  return expandSsiIncludes(html, {
    root,
    stack: [path.normalize(fullPath)]
  });
};

export const parseAnchorHrefs = (html) => {
  const hrefs = [];
  const htmlWithoutScripts = String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  const anchorRegex = /<a\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  let match;

  while ((match = anchorRegex.exec(htmlWithoutScripts)) !== null) {
    const raw = match[2] ?? match[3] ?? match[4] ?? '';
    hrefs.push(raw.trim());
  }

  return hrefs;
};

export const isSkippableHref = (href) => {
  if (!href) return true;
  const lower = href.toLowerCase();
  return (
    lower.startsWith('#')
    || lower.startsWith('mailto:')
    || lower.startsWith('tel:')
    || lower.startsWith('sms:')
    || lower.startsWith('javascript:')
    || lower.startsWith('data:')
  );
};

export const getCanonicalAndInternalHosts = (contract) => {
  const canonicalHost = String(contract.canonicalHost || '').trim().toLowerCase();
  const internalHosts = new Set([canonicalHost, `www.${canonicalHost}`].filter(Boolean));
  return { canonicalHost, internalHosts };
};

export const resolveHref = ({
  href,
  sourceRelPath,
  baseOrigin,
  contract,
  internalHostsOverride = null
}) => {
  const sourceWebPath = filePathToWebPath(sourceRelPath);
  const sourceUrl = new URL(sourceWebPath, `${baseOrigin}/`);

  let parsed;
  try {
    parsed = new URL(href, sourceUrl);
  } catch {
    return null;
  }

  const { canonicalHost, internalHosts } = getCanonicalAndInternalHosts(contract);
  const effectiveInternalHosts = internalHostsOverride instanceof Set && internalHostsOverride.size
    ? internalHostsOverride
    : internalHosts;
  const host = parsed.hostname.toLowerCase();
  const isAbsolute = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(href) || href.startsWith('//');
  const isInternalHost = effectiveInternalHosts.has(host) || (!parsed.hostname && host === canonicalHost);
  const isInternal = isInternalHost && (parsed.protocol === 'http:' || parsed.protocol === 'https:');

  const rawPathname = parsed.pathname || '/';
  const normalizedPath = normalizePath(rawPathname);
  const trailingSlash = rawPathname.length > 1 && rawPathname.endsWith('/');

  return {
    href,
    sourceRelPath,
    isAbsolute,
    isInternal,
    isInternalHost,
    url: parsed,
    normalizedPath,
    trailingSlash,
    absoluteUrl: `${parsed.origin}${parsed.pathname}${parsed.search}${parsed.hash}`,
    canonicalAbsoluteUrl: `${baseOrigin}${normalizedPath}${parsed.search}`
  };
};

export const loadJson = async (relPath) => {
  const raw = await fs.readFile(path.join(ROOT, relPath), 'utf8');
  return JSON.parse(raw);
};

export const csvEscape = (value) => {
  const raw = value == null ? '' : String(value);
  if (!/[",\n\r]/.test(raw)) return raw;
  return `"${raw.replace(/"/g, '""')}"`;
};

export const writeCsv = async ({ path: relPath, headers, rows }) => {
  const lines = [];
  lines.push(headers.map(csvEscape).join(','));
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  await fs.mkdir(path.dirname(path.join(ROOT, relPath)), { recursive: true });
  await fs.writeFile(path.join(ROOT, relPath), `${lines.join('\n')}\n`);
};

export const normalizeUrlForCompare = (urlValue) => {
  const parsed = new URL(urlValue);
  const pathname = normalizePath(parsed.pathname || '/');
  const search = parsed.search || '';
  return `${parsed.protocol}//${parsed.host}${pathname}${search}`;
};

export const normalizePathForCompare = (value) => normalizePath(value || '/');
