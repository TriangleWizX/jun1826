import fs from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';

const LEGAL_EXEMPT_FILES = new Set([
  'waiver.html',
  'guarantee-terms.html',
]);

// Stop-slop terms & phrases (case-insensitive checks)
const THROAT_CLEARING = [
  "here's the thing",
  "here's what",
  "here's this",
  "here's that",
  "here's why",
  "the uncomfortable truth is",
  "it turns out",
  "the real",
  "let me be clear",
  "the truth is,",
  "i'll say it again",
  "i'm going to be honest",
  "can we talk about",
  "here's what i find",
  "here's the problem"
];

const EMPHASIS_CRUTCHES = [
  "full stop",
  "let that sink in",
  "this matters because",
  "make no mistake",
  "here's why that matters"
];

const JARGON = [
  "navigate",
  "unpack",
  "lean into",
  "landscape",
  "game-changer",
  "double down",
  "deep dive",
  "take a step back",
  "moving forward",
  "circle back",
  "on the same page"
];

const ADVERBS = [
  "really",
  "just",
  "literally",
  "genuinely",
  "honestly",
  "simply",
  "actually",
  "deeply",
  "truly",
  "fundamentally",
  "inherently",
  "inevitably",
  "interestingly",
  "importantly",
  "crucially"
];

const FILLER_PHRASES = [
  "at its core",
  "in today's",
  "it's worth noting",
  "at the end of the day",
  "when it comes to",
  "in a world where",
  "the reality is"
];

const META_COMMENTARY = [
  "plot twist:",
  "spoiler:",
  "you already know this, but",
  "but that's another post",
  "feature, not a bug",
  "dressed up as",
  "the rest of this",
  "let me walk you through",
  "in this section",
  "as we'll see",
  "i want to explore"
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const decode = (value) => value.replace(/&(nbsp|amp|lt|gt|quot|apos|mdash|rsquo|lsquo|rdquo|ldquo);|&#(x[0-9a-f]+|\d+);/gi,
  (whole, named, numeric) => {
    if (numeric) {
      const code = numeric[0].toLowerCase() === 'x' ? parseInt(numeric.slice(1), 16) : Number(numeric);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }[named.toLowerCase()];
  });
const blank = (value) => value.replace(/[^\n]/g, ' ');
const normalize = (value) => decode(value).replace(/\s+/g, ' ').trim();
const styleGroups = [
  [THROAT_CLEARING, 'throat-clearing'], [EMPHASIS_CRUTCHES, 'emphasis'],
  [JARGON, 'jargon'], [ADVERBS, 'adverb'], [FILLER_PHRASES, 'filler'], [META_COMMENTARY, 'meta-commentary']
];
const rules = [
  { id: 'generic-definition', severity: 'error', pattern: /\bis a common BJJ term used in class to describe a key position, movement, or concept\b/gi },
  { id: 'zero-injury-promise', severity: 'error', pattern: /\b(?:0%|zero percent)\s+injur(?:y|ies)\b/gi },
  { id: 'duplicate-program-phrase', severity: 'error', pattern: /\b12-week\s+12-week\b/gi },
  { id: 'broken-more-than', severity: 'error', pattern: /\b(?:are more than looking|are more than for advanced)\b/gi },
  { id: 'em-dash', severity: 'review', pattern: /—/g },
  { id: 'binary-contrast', severity: 'review', pattern: /\b(?:not just|not only|it(?:'|’)s not|isn(?:'|’)t just)\b/gi },
  ...styleGroups.flatMap(([words, category]) => words.map((word) => ({
    id: `${category}:${word}`, severity: 'review', pattern: new RegExp(`\\b${escapeRegex(word)}(?=\\W|$)`, 'gi')
  })))
];

// Source text extraction, not a rendering engine. Keep surface labels so a reviewer
// can distinguish templates, metadata and schema from visible page copy.
export function extractCopy(source) {
  const segments = [];
  const exceptions = [];
  const incomplete = [];
  const lineAt = (offset) => source.slice(0, offset).split('\n').length;
  const add = (text, offset, surface) => {
    const clean = normalize(text);
    if (clean && !/\{[{%]/.test(clean)) segments.push({ text: clean, line: lineAt(offset), surface });
  };
  let html = source.replace(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/, (whole, matter) => {
    for (const match of matter.matchAll(/^(title|description|summary):\s*(.*)$/gm)) {
      let value = match[2];
      if (/^[>|][-+]?\s*$/.test(value)) {
        value = matter.slice(match.index + match[0].length).match(/^(?:\r?\n[ \t]+[^\n]*)*/)?.[0] || '';
      }
      add(value.replace(/^['"]|['"]$/g, ''), whole.indexOf(matter) + match.index, 'front-matter');
    }
    return blank(whole);
  });
  html = html.replace(/<!--[\s\S]*?-->/g, blank);
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi, (whole, attrs, body, offset) => {
    if (/\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs)) {
      if (/\{[{%]|<!--#/.test(body)) {
        incomplete.push({ line: lineAt(offset), reason: 'templated JSON-LD; inspect generated output' });
      } else {
        try {
          const visit = (node) => {
            if (!node || typeof node !== 'object') return;
            if (node['@type'] === 'Review') {
              exceptions.push({ line: lineAt(offset), reason: 'quoted review schema' });
              return;
            }
            for (const [key, value] of Object.entries(node)) {
              if (typeof value === 'string' && ['text', 'description', 'headline', 'name'].includes(key)) add(value, offset, 'json-ld');
              else if (typeof value === 'object') visit(value);
            }
          };
          visit(JSON.parse(body));
        } catch {
          incomplete.push({ line: lineAt(offset), reason: 'unparsed JSON-LD; inspect this script' });
        }
      }
    }
    return blank(whole);
  });
  html = html.replace(/<(style|svg|pre|code)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, blank);
  html = html.replace(/<(blockquote|q)\b[^>]*>[\s\S]*?<\/\1\s*>|<([a-z][\w-]*)\b[^>]*class\s*=\s*["'][^"']*\b(?:quote-text|ss-card__quote|testimonial-quote)\b[^"']*["'][^>]*>[\s\S]*?<\/\2\s*>/gi, (whole, ...args) => {
    exceptions.push({ line: lineAt(args.at(-2)), reason: 'attributed/marked quotation; preserve original wording' });
    return blank(whole);
  });
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...match[0].matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((m) => [m[1].toLowerCase(), m[3]]));
    if (/^(?:description|og:(?:description|title)|twitter:(?:description|title))$/.test(attrs.name || attrs.property || '')) add(attrs.content || '', match.index, 'metadata');
  }
  // Keep inline emphasis within a sentence; end segments at block boundaries.
  let buffer = '', start = 0;
  const flush = () => { add(buffer, start, 'text'); buffer = ''; };
  for (const match of html.matchAll(/<[^>]*>|[^<]+/g)) {
    if (match[0].startsWith('<')) {
      if (/^<\/?(?:p|h[1-6]|div|section|article|li|ul|ol|details|summary|br|head|body|title)\b/i.test(match[0])) flush();
    } else {
      if (!buffer.trim()) start = match.index;
      buffer += match[0];
    }
  }
  flush();
  return { segments, exceptions, incomplete };
}

export function auditCopy(source) {
  const { segments, exceptions, incomplete } = extractCopy(source);
  const findings = [];
  for (const segment of segments) {
    for (const rule of rules) {
      const matches = [...segment.text.matchAll(rule.pattern)];
      if (matches.length) findings.push({ ...segment, rule: rule.id, severity: rule.severity, matches: matches.length });
    }
  }
  return { findings, exceptions, incomplete, segments: segments.length };
}

export async function auditTree(input) {
  const root = path.resolve(input);
  if (!(await fs.stat(root)).isDirectory()) throw new Error(`Input is not a directory: ${root}`);
  const files = [], skipped = [];
  const walk = async (dir) => {
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isSymbolicLink()) { skipped.push({ file: relative, reason: 'symlink' }); continue; }
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || ['node_modules', 'assets', 'downloads', 'images'].includes(entry.name)) {
          skipped.push({ file: relative, reason: 'non-prose directory' });
        } else await walk(absolute);
      } else if (/\.(html|njk|md)$/.test(entry.name)) {
        if (LEGAL_EXEMPT_FILES.has(relative)) skipped.push({ file: relative, reason: 'legal copy' });
        else files.push(relative);
      }
    }
  };
  await walk(root);
  if (!files.length) throw new Error(`No prose files found in ${root}`);
  const findings = [], exceptions = [], incomplete = [];
  let segments = 0;
  for (const file of files) {
    const result = auditCopy(await fs.readFile(path.join(root, file), 'utf8'));
    segments += result.segments;
    findings.push(...result.findings.map((item) => ({ file, ...item })));
    exceptions.push(...result.exceptions.map((item) => ({ file, ...item })));
    incomplete.push(...result.incomplete.map((item) => ({ file, ...item })));
  }
  return { input: root, inspected: files.length, files, segments, skipped, exceptions, incomplete, findings,
    errors: findings.filter((item) => item.severity === 'error').length,
    review: findings.filter((item) => item.severity === 'review').length };
}

async function run() {
  const { values } = parseArgs({ options: {
    input: { type: 'string', default: 'src' }, strict: { type: 'boolean', default: false },
    json: { type: 'boolean', default: false }, help: { type: 'boolean', default: false }
  } });
  if (values.help) {
    console.log('Usage: node scripts/qa-stop-slop.mjs [--input src|dist|DIRECTORY] [--strict] [--json]\nDefault: advisory source audit, including partials and non-indexed pages.\nExit 0: scan completed; review candidates may remain. Exit 1: --strict found error patterns. Exit 2: input/execution error or incomplete extraction in --strict mode.');
    return;
  }
  const report = await auditTree(values.input);
  report.mode = values.strict ? 'strict error-pattern gate' : 'advisory';
  if (values.json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Stop-slop ${report.mode}: ${report.input}\nInspected ${report.inspected} files / ${report.segments} segments; skipped ${report.skipped.length} paths; preserved ${report.exceptions.length} quotations; incomplete ${report.incomplete.length} surfaces.`);
    for (const item of report.findings) console.log(`${item.file}:${item.line} [${item.severity}/${item.surface}] ${item.rule}: ${item.text.slice(0, 220)}`);
    for (const item of report.incomplete) console.log(`${item.file}:${item.line} [incomplete] ${item.reason}`);
    console.log(`Scan completed: ${report.errors} error-pattern findings, ${report.review} review candidates. This is not editorial or factual approval.`);
  }
  process.exitCode = values.strict ? (report.incomplete.length ? 2 : report.errors ? 1 : 0) : 0;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  run().catch((error) => { console.error(`Stop-slop audit failed: ${error.message}`); process.exitCode = 2; });
}
