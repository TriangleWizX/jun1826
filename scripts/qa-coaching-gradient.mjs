import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [
  ['how-class-works', read('dist/how-class-works.html'), ['More Skill Means More Choices', 'removes prompts', 'student to recognize', 'safety, partner matching']],
  ['report-card', read('dist/report-card.html'), ['What is beginning to become yours?', 'Prompt dependence is context', 'Recognize', 'Protect', 'Solve', 'Adapt', 'Express']],
  ['kids lane', read('dist/bjj-classes/kids-tannersville-ny/index.html'), ['try their own answer before asking for one']],
  ['teens lane', read('dist/bjj-classes/teens-tannersville-ny/index.html'), ['Recognize it. Choose. Adjust. Make it yours.']],
  ['adults lane', read('dist/bjj-classes/adults-tannersville-ny/index.html'), ['principles you can use without waiting for instructions']],
  ['parent guide', read('dist/core-culture-parent-guide.html'), ['carrying their own bag', 'appropriately sized problem']],
  ['footer', read('dist/footer-include-no-proof.html'), ['when to give you more room to solve it', 'You will not disappear into the room']]
];

const failures = [];
for (const [label, html, phrases] of checks) {
  for (const phrase of phrases) if (!html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`${label}: missing "${phrase}"`);
}

const report = read('dist/report-card.html');
const axes = ['Recognize', 'Protect', 'Solve', 'Adapt', 'Express'];
if (axes.some((axis) => (report.match(new RegExp(`<h3>${axis}</h3>`, 'g')) || []).length !== 1)) failures.push('report-card: development axes must remain exactly once each');
if (/independence.{0,40}(percent|%|score)|coachability.{0,40}(percent|%|score)/i.test(report)) failures.push('report-card: independence/coachability metric detected');
if (/macho|toughness ritual|fight language/i.test(checks.map(([, html]) => html).join('\n'))) failures.push('coaching surfaces: disallowed macho language detected');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Coaching gradient QA passed (${checks.length} rendered surfaces).`);
