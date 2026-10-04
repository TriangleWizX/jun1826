import fs from 'node:fs';

const raw = fs.readFileSync(process.argv[2], 'utf8');
const textWithoutFrontmatter = raw.replace(/^\s*---[\s\S]*?---\s*/, '');

// Convert block closings to period space to avoid joining distinct elements into huge sentences
const cleanText = textWithoutFrontmatter
  .replace(/<\/(li|p|h[1-6]|div|section|article|aside|nav|header|footer)>/gi, '. ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
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

console.log(`Words: ${totalWords}`);
console.log(`Sentences: ${totalSentences}`);
console.log(`Avg words per sentence: ${wordsPerSentence.toFixed(2)}`);
console.log(`Avg syllables per word: ${syllablesPerWord.toFixed(2)}`);
console.log(`Flesch-Kincaid Grade Level: ${fkgl.toFixed(2)}`);

const bannedWords = ['zero', 'without', '\\bno\\b(?!-gi)', 'stop', "don't", 'do not', "won't", 'never', 'injury', 'injuries', 'hurt', 'pain', 'roughhousing', 'muscling', 'ego'];
const bannedFound = [];
for (const bw of bannedWords) {
  const re = new RegExp(bw, 'gi');
  const matches = cleanText.match(re);
  if (matches) {
    bannedFound.push(`${bw}: ${matches.length}`);
  }
}
console.log(`Banned words found:`, bannedFound.length ? bannedFound : 'NONE');
