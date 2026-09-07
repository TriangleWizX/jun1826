import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const loop = 'Map → Adapt → Resist → Observe → Adjust';
const checks = [
  ['How Class Works', read('dist/how-class-works.html'), [loop, 'live opponent who has a real job', 'fixed technique list', 'Make the problem legible', 'Watch before supplying', 'Change one useful variable', 'Adapt. Test. Notice.', 'Direct instruction remains available', 'Failure is information']],
  ['Report Card', read('dist/report-card.html'), [loop, 'next problem can be chosen from evidence', 'Problem tested', 'Name the problem, not a technique count', 'Record the student, problem, conditions, observed behavior, and next constraint', 'failed attempt is information']],
  ['Goal Mapping', read('dist/free-bjj-intro-tannersville-ny/index.html'), ['map gives the first coached problem', 'under resistance']],
];
const failures = [];
for (const [label, html, phrases] of checks) for (const phrase of phrases) if (!html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`${label}: missing "${phrase}"`);
if (/fixed technique list.{0,100}(?:required|everyone|must)/i.test(checks.map(([, html]) => html).join('\n'))) failures.push('logos: fixed technique checklist treated as required');
if (!/appropriate resistance|coached resistance/i.test(read('dist/how-class-works.html'))) failures.push('How Class Works: resistance evidence missing');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('SSBJJ logos QA passed.');
