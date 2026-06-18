import fs from 'node:fs/promises';
import path from 'node:path';
import { readSitemapTree } from './lib/sitemap-utils.mjs';

const ROOT = process.cwd();
const CANONICAL_HOST = 'senseisandy.com';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
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

// Helper to resolve URL to local file path
const fileExists = async (relPath) => {
  try {
    await fs.access(path.join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
};

const resolveUrlToFile = async (urlString) => {
  const url = new URL(urlString);
  let pathname = url.pathname || '/';
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  const slug = pathname.replace(/^\/+/, '');
  const candidates = [];

  if (pathname === '/') {
    candidates.push('index.html');
  } else {
    candidates.push(`${slug}.html`);
    candidates.push(path.join(slug, 'index.html'));
    if (slug.endsWith('.html')) candidates.push(slug);
  }

  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
};

// Strip HTML tags to get pure visible text
function cleanHtmlToText(html) {
  html = html.replace(/<p class="video-card-title">[\s\S]*?<\/p>/gi, " " );
  // Remove script and style elements entirely
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Replace HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Strip all other tags, replacing them with spaces to preserve word boundaries
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode basic HTML entities
  text = text.replace(/&nbsp;/gi, ' ')
             .replace(/&amp;/gi, '&')
             .replace(/&lt;/gi, '<')
             .replace(/&gt;/gi, '>')
             .replace(/&quot;/gi, '"')
             .replace(/&#39;/gi, "'");

  // Normalize spaces
  text = text.replace(/\s+/g, ' ');
  return text;
}

async function run() {
  console.log('Starting stop-slop audit...');
  
  const sitemapData = await readSitemapTree({
    rootDir: ROOT,
    sitemapPath: 'sitemap.xml',
    canonicalOrigin: CANONICAL_ORIGIN
  });

  const results = {};
  let totalViolations = 0;

  for (const url of sitemapData.urls) {
    const relFile = await resolveUrlToFile(url);
    if (!relFile) continue;
    if (LEGAL_EXEMPT_FILES.has(relFile)) continue;

    const html = await fs.readFile(path.join(ROOT, relFile), 'utf8');
    const text = cleanHtmlToText(html);

    const violations = [];

    // Check for em-dashes
    if (html.includes('—') || html.includes('&mdash;')) {
      violations.push({ category: 'Style', pattern: 'Em-dash (—)', matches: 1 });
    }

    // Function to run substring matches
    const checkList = (list, categoryName) => {
      for (const term of list) {
        // Simple case-insensitive match on clean text
        // Use word boundaries where applicable to prevent matching substrings of other words
        const escaped = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          violations.push({
            category: categoryName,
            pattern: term,
            matches: matches.length
          });
        }
      }
    };

    checkList(THROAT_CLEARING, 'Throat-Clearing');
    checkList(EMPHASIS_CRUTCHES, 'Emphasis Crutch');
    checkList(JARGON, 'Business Jargon');
    checkList(ADVERBS, 'Adverb');
    checkList(FILLER_PHRASES, 'Filler Phrase');
    checkList(META_COMMENTARY, 'Meta-Commentary');

    // Binary contrasts
    const binaryContrastRegexes = [
      /\bnot because\b.*\bbecause\b/i,
      /\bisn't the problem\b.*\bis\b/i,
      /\bnot only\b.*\bbut also\b/i,
      /\bit's not\b.*\bit's\b/i
    ];
    for (const regex of binaryContrastRegexes) {
      if (regex.test(text)) {
        violations.push({
          category: 'Binary Contrast',
          pattern: regex.toString(),
          matches: 1
        });
      }
    }

    if (violations.length > 0) {
      results[relFile] = violations;
      totalViolations += violations.reduce((acc, v) => acc + v.matches, 0);
    }
  }

  // Print results
  console.log('\n--- AUDIT RESULTS ---');
  if (Object.keys(results).length === 0) {
    console.log('Clean! No stop-slop violations found.');
  } else {
    for (const [file, violations] of Object.entries(results)) {
      console.log(`\nFile: ${file}`);
      for (const v of violations) {
        console.log(`  [${v.category}] "${v.pattern}" - found ${v.matches} time(s)`);
      }
    }
    console.log(`\nTotal violations: ${totalViolations}`);
  }
}

run().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
