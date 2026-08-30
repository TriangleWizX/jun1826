import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const home = read('dist/index.html');
const intro = read('dist/free-bjj-intro-tannersville-ny/index.html');
const parent = read('dist/core-culture-parent-guide.html');
const report = read('dist/report-card.html');
const failures = [];
for (const phrase of ['Seen. Tested. Becoming.', 'problem you can enter', 'genuinely trying', 'clear next attempt']) if (!home.toLowerCase().includes(phrase.toLowerCase())) failures.push(`homepage: missing "${phrase}"`);
for (const phrase of ['treated like a beginner, not an inconvenience', 'appropriate partner', 'right pace']) if (!intro.toLowerCase().includes(phrase.toLowerCase())) failures.push(`Free First Visit: missing "${phrase}"`);
for (const phrase of ['hard moments small enough to work through safely', 'notice what your child can handle now', 'Try again after losing a round']) if (!parent.toLowerCase().includes(phrase.toLowerCase())) failures.push(`Parent Guide: missing "${phrase}"`);
for (const phrase of ['specific observation', 'next constraint', 'failed attempt is information']) if (!report.toLowerCase().includes(phrase.toLowerCase())) failures.push(`Report Card: missing "${phrase}"`);
if (/guaranteed success|no resistance|avoid(?:ing)? difficult partners/i.test(home + intro)) failures.push('pathos: challenge was softened into avoidance');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Pathos experience QA passed.');
