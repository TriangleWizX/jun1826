import fs from 'node:fs';
import path from 'node:path';

const routes = [
  'dist/index.html',
  'dist/schedule/index.html',
  'dist/options-pricing/index.html',
  'dist/contact.html',
  'dist/free-bjj-intro-tannersville-ny/index.html',
  'dist/free-bjj-intro-tannersville-ny/confirmation/index.html',
  'dist/fall-practice-reset/index.html',
  'dist/holiday-schedule.html'
];
const forbidden = [
  /\bvisit\s+visit\b/gi,
  /\bclass\s+class\b/gi,
  /\bprogram\s+program\b/gi,
  /\b12-week\s+12-week\b/gi,
  /^\s*[1-9]\.\s+[1-9]\./gmi
];
const errors = [];
for (const file of routes) {
  if (!fs.existsSync(file)) { errors.push(`${file}: missing`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) if (pattern.test(text)) errors.push(`${file}: ${pattern}`);
}
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Copy integrity passed: ${routes.length} acquisition routes checked.`);
