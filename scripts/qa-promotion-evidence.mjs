import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const article = read('dist/blog/bjj-belts-stripes-promotions/index.html');
const parent = read('dist/core-culture-parent-guide.html');
const report = read('dist/report-card.html');
const required = [
  'Practice creates skill. Promotion recognizes skill. Rank makes progress visible.',
  'not a stripe currency',
  'Attendance is an opportunity to practice and be observed, not promotion currency.',
  'The Report Card helps organize observations; it does not calculate or award a belt.',
  'How will I know when my child is progressing?',
  'handling harder situations',
  'needing less prompting',
  'adapting when the first answer does not work'
];
const failures = required.filter((phrase) => !article.toLowerCase().includes(phrase.toLowerCase())).map((phrase) => `article: missing "${phrase}"`);
if (!parent.toLowerCase().includes('attendance creates more opportunities') || !parent.toLowerCase().includes('not a report card skill state')) failures.push('parent guide: attendance/skill distinction missing');
if (/report card.{0,80}(?:equals?|maps? directly|automatically awards?).{0,40}(belt|stripe)/i.test(article)) failures.push('article: mechanical Report Card-to-rank mapping detected');
if (/fastest way to earn stripes|earn stripes faster|rank up faster/i.test(article)) failures.push('article: rank-optimization FAQ language detected');
if (!['Recognize', 'Protect', 'Solve', 'Adapt', 'Express'].every((axis) => report.includes(`<h3>${axis}</h3>`))) failures.push('report-card: capability axes missing');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Promotion evidence QA passed.');
