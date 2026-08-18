import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fnf = read('dist/friday-night-fanatics.html');
const parents = read('dist/parent-resources.html');
const tournament = read('dist/local-bjj-tournaments-for-parents.html');
const report = read('dist/report-card.html');
const failures = [];
const requireAll = (label, html, phrases) => phrases.forEach((phrase) => {
  if (!html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`${label}: missing "${phrase}"`);
});
requireAll('FNF', fnf, ['Change the partner, keep the care, and see what remains useful.', 'more controlled than a tournament', 'not only competition preparation']);
requireAll('Parent Resources', parents, ['tests Jiu-Jitsu in class', 'one optional source of information', 'changed partners, and controlled uncertainty']);
requireAll('Tournament Guide', tournament, ['optional testing environment', 'Does the student want this experience?', 'What would we like to learn, regardless of the result?']);
requireAll('Report Card', report, ['Observation context', 'Familiar partner', 'Unfamiliar partner', 'Context describes where behavior survived; it has no score or rank value.']);
if (/competition.{0,80}(?:higher|better|reliable|promotion|score|grade)/i.test(fnf + parents + tournament)) failures.push('competition: success or rank hierarchy detected');
if (/observation-context.*(?:score|rank)|context.*(?:score|rank).*observation-context/i.test(report)) failures.push('Report Card: context is treated as scored or ranked');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Testing-context QA passed.');
