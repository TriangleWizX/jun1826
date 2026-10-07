import fs from 'node:fs';

const raw = fs.readFileSync(process.argv[2], 'utf8');
const textWithoutFrontmatter = raw.replace(/^\s*---[\s\S]*?---\s*/, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<(script|style|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
  .replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g, '');

// End readable blocks, not layout wrappers, to avoid artificial sentence counts.
const cleanText = textWithoutFrontmatter
  .replace(/<\/(li|p|h[1-6])>/gi, '. ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/&(rsquo|lsquo|apos);/gi, "'")
  .replace(/&(quot|ldquo|rdquo);/gi, '"')
  .replace(/&(mdash|ndash|rarr|larr|hellip|bull|copy|reg);/gi, ' ')
  .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, value) => {
    const code = value[0].toLowerCase() === 'x' ? parseInt(value.slice(1), 16) : Number(value);
    return code <= 0x10ffff ? String.fromCodePoint(code) : ' ';
  })
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201C\u201D]/g, '"')
  // Decimal values in tables are not sentence boundaries.
  .replace(/(\d)\.(?=\d)/g, '$1')
  .replace(/[^\w\s.!?'-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0 && /[a-zA-Z]/.test(s));
const words = cleanText.split(/\s+/).map(w => w.replace(/[^a-zA-Z]/g, '')).filter(w => w.length > 0);
const totalWords = words.length;
const totalSentences = sentences.length;
const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0);

const wordsPerSentence = totalWords / totalSentences;
const syllablesPerWord = totalSyllables / totalWords;
const fkgl = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

const jsonOutput = process.argv.includes('--json');
if (!jsonOutput) {
  console.log(`Words: ${totalWords}`);
  console.log(`Sentences: ${totalSentences}`);
  console.log(`Avg words per sentence: ${wordsPerSentence.toFixed(2)}`);
  console.log(`Avg syllables per word: ${syllablesPerWord.toFixed(2)}`);
  console.log(`Flesch-Kincaid Grade Level: ${fkgl.toFixed(2)}`);
}

const bannedWords = ['\\bzero\\b', '\\bwithout\\b', '\\bno\\b(?!-gi)', '\\bstop\\b', "\\bdon't\\b", '\\bdo not\\b', "\\bwon't\\b", '\\bnever\\b', '\\binjury\\b', '\\binjuries\\b', '\\bhurt\\b', '\\bpain\\b', '\\broughhousing\\b', '\\bmuscling\\b', '\\bego\\b'];
const bannedFound = [];
for (const bw of bannedWords) {
  const re = new RegExp(bw, 'gi');
  const matches = cleanText.match(re);
  if (matches) {
    bannedFound.push(`${bw}: ${matches.length}`);
  }
}
if (jsonOutput) console.log(JSON.stringify({ file: process.argv[2], words: totalWords, sentences: totalSentences, wordsPerSentence, syllablesPerWord, grade: fkgl, banned: bannedFound }));
else console.log(`Banned words found:`, bannedFound.length ? bannedFound : 'NONE');

// Optional release gate. This heuristic is supporting evidence, not a substitute
// for reviewing factual precision, natural prose, and the rendered page.
const gradeArg = process.argv.indexOf('--max-grade');
if (gradeArg !== -1) {
  const maximum = Number(process.argv[gradeArg + 1]);
  if (!Number.isFinite(maximum)) throw new Error('--max-grade requires a number');
  if (!totalWords || !totalSentences || fkgl > maximum || bannedFound.length) process.exitCode = 1;
}
