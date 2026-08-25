import fs from 'node:fs';
import path from 'node:path';

const priorityRoutes = [
  'dist/index.html',
  'dist/schedule/index.html',
  'dist/options-pricing/index.html',
  'dist/contact.html',
  'dist/free-bjj-intro-tannersville-ny/index.html',
  'dist/free-bjj-intro-tannersville-ny/confirmation/index.html',
  'dist/fall-practice-reset/index.html',
  'dist/holiday-schedule.html'
];
const walk = (dir) => fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const routes = [...new Set([
  ...priorityRoutes,
  ...walk('dist').filter((file) => file.endsWith('.html') && !file.startsWith('dist/assets/'))
])];
const forbidden = [
  /\bvisit\s+visit\b/gi,
  /\bclass\s+class\b/gi,
  /\bprogram\s+program\b/gi,
  /\b12-week\s+12-week\b/gi,
  /\b12-week program\s+12-week program\b/gi,
  /\bCore Culture\b/gi,
  /\bGoal Mapping\b/gi,
  /\bacademy gi\b/gi,
  /\bChoose Lane\b/gi,
  /\bstarting lane\b/gi,
  /\bBeginner Lane\b/gi,
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
console.log(`Copy integrity passed: ${routes.length} visitor HTML files checked.`);
