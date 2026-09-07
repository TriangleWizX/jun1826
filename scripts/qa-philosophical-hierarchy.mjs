import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [
  ['homepage', read('dist/index.html'), ['Seen. Tested. Becoming.', 'small groups', 'matched partners']],
  ['Free First Visit', read('dist/free-bjj-intro-tannersville-ny/index.html'), ['Goal Mapping', 'appropriate partner', 'skill-based resistance']],
  ['Kids', read('dist/bjj-classes/kids-tannersville-ny/index.html'), ['appropriate without making it fake', 'Safe enough to keep trying']],
  ['Teens', read('dist/bjj-classes/teens-tannersville-ny/index.html'), ['serious training without a sink-or-swim culture', 'gradually increasing resistance']],
  ['Adults', read('dist/bjj-classes/adults-tannersville-ny/index.html'), ['real resistance from the beginning—but not random resistance', 'Coach-controlled resistance rounds']],
  ['Pricing', read('dist/options-pricing.html'), ['structured training relationship, not anonymous access to a mat', 'progress feedback']],
  ['Bio', read('dist/bio.html'), ['taught wherever the mats fit', 'coached, not tested', 'Josh Griffiths at Clockwork']],
];
const failures = [];
for (const [label, html, phrases] of checks) for (const phrase of phrases) if (!html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`${label}: missing "${phrase}"`);
if (/Kawaishi|Haueter/i.test(read('dist/index.html'))) failures.push('homepage: internal influence names leaked into consumer-facing homepage');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Philosophical hierarchy QA passed.');
