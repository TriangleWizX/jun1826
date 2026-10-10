import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || 'dist');
if (!fs.existsSync(root)) {
  console.error('dist/ is missing. Build and materialize SSI fragments first.');
  process.exit(2);
}

function visibleText(html) {
  const text = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/gi, ' ')
    .replace(/<([a-z][\w:-]*)\b(?=[^>]*\bhidden(?:\s|=|>))[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<([a-z][\w:-]*)\b(?=[^>]*\baria-hidden\s*=\s*["']true["'])[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    // Add one boundary at each visible text block. Inline tags stay joined so
    // nested <strong>/<span>/<em> text is read once, not counted twice.
    .replace(/<br\b[^>]*\/?\s*>/gi, '. ')
    .replace(/<(address|article|aside|blockquote|caption|dd|details|div|dl|dt|figcaption|figure|footer|form|h[1-6]|header|li|main|nav|ol|p|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi, '. ')
    .replace(/<\/(address|article|aside|blockquote|caption|dd|details|div|dl|dt|figcaption|figure|footer|form|h[1-6]|header|li|main|nav|ol|p|section|summary|table|tbody|td|tfoot|th|thead|tr|ul)\s*>/gi, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, ' and ')
    .replace(/&(?:lt|gt|quot|#39);/gi, ' ')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&[a-z][\w#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text;
}

function syllables(word) {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  w = w.replace(/^y/, '');
  const groups = w.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

function fkgl(text) {
  const words = text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) ?? [];
  const sentences = text.split(/(?<=[.!?])\s+/).filter(part => /[A-Za-z]/.test(part)).length;
  if (!words.length || !sentences) return null;
  let syl = 0;
  for (const word of words) syl += syllables(word);
  return {
    score: 0.39 * (words.length / sentences) + 11.8 * (syl / words.length) - 15.59,
    words: words.length,
    sentences,
    syllables: syl
  };
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(file);
  }
}
walk(root);

function materialize(html, seen = new Set()) {
 const includePattern = /<!--#include\s+virtual=["']([^"']+)["']\s*-->/g;
 return html.replace(includePattern, (_match, virtualPath) => {
 const includeFile = path.join(root, virtualPath.replace(/^\/+/, ''));
 if (!fs.existsSync(includeFile) || seen.has(includeFile)) return ' ';
 const nextSeen = new Set(seen);
 nextSeen.add(includeFile);
 const fragment = fs.readFileSync(includeFile, 'utf8')
   .replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
 return materialize(fragment, nextSeen);
 });
}

const registry = JSON.parse(fs.readFileSync('data/url-registry.json', 'utf8'));
const activeRoutes = registry.filter(entry => entry.status === 'active' && entry.canonicalPath === entry.path && entry.canonicalPath && (entry.indexable === true || entry.path === '/free-bjj-intro-tannersville-ny/confirmation'));
const routeFiles = activeRoutes.map(entry => {
 const pathname = entry.canonicalPath.replace(/\.html$/, '');
 const candidate = path.join(root, pathname.replace(/^\/+/, ''), 'index.html');
 const flatCandidate = path.join(root, `${pathname.replace(/^\/+|\/$/g, '')}.html`);
 const file = fs.existsSync(candidate) ? candidate : flatCandidate;
 return { route: entry.path, file };
});
const routeFilter = process.argv.slice(3).find((arg) => arg.startsWith('/'));
const routes = routeFiles.filter(item => fs.existsSync(item.file) && (!routeFilter || item.route === routeFilter));

const rows = routes.map(({ route, file }) => {
 const html = materialize(fs.readFileSync(file, 'utf8'));
 const text = visibleText(html);
 if (process.argv.includes('--dump-text')) console.log(`VISIBLE_TEXT ${route}\n${text}`);
  const readability = fkgl(text);
  return {
    route,
    score: readability?.score ?? null,
    words: readability?.words ?? 0,
    sentences: readability?.sentences ?? 0,
    avg_words_per_sentence: readability ? readability.words / readability.sentences : null,
    avg_syllables_per_word: readability ? readability.syllables / readability.words : null,
    ...(process.argv.includes('--long-sentences') ? {
      long_sentences: text.split(/(?<=[.!?])\s+/)
        .filter(part => /[A-Za-z]/.test(part))
        .map(part => ({ text: part, words: part.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)?.length ?? 0 }))
        .filter(part => part.words > 9)
        .sort((a, b) => b.words - a.words)
        .slice(0, 60)
    } : {})
  };
}).sort((a, b) => (b.score ?? Infinity) - (a.score ?? Infinity));

const pass = rows.filter(row => row.score !== null && row.score <= 3).length;
const missing = rows.filter(row => row.score === null);
console.log(JSON.stringify({ target_fkgl_max: 3, target_scope: 'each complete rendered customer page with SSI fragments expanded', active_customer_route_count: activeRoutes.length, rendered_route_count: rows.length, missing_rendered_routes: routeFiles.filter(item => !fs.existsSync(item.file)).map(item => item.route), pass_count: pass, above_target_count: rows.length - pass - missing.length, missing_score_count: missing.length, highest: rows.slice(0, process.argv.includes('--all') ? rows.length : 50) }, null, 2));
process.exitCode = missing.length || pass !== rows.length ? 1 : 0;
