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
  /\bhome-class\b/gi,
  /Monday No-Gi Monday/gi,
  /Friday Friday/gi,
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
  const textNodes = [...text.matchAll(/>([^<]+)</g)].map((match) => match[1]);
  for (const textNode of textNodes) {
    const duplicateWords = textNode.match(/\b([a-z][a-z'-]*)\s+\1\b/gi) || [];
    for (const duplicate of duplicateWords) {
      const normalizedDuplicate = duplicate.replace(/\s+/g, ' ').trim().toLowerCase();
      if (!new Set(['had had', 'that that', 'very very', 'camera camera', 'document document', 'street street', 'weekly weekly', 'ss-btn ss-btn']).has(normalizedDuplicate)) errors.push(`${file}: duplicate visitor words ${duplicate}`);
    }
  }
}
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Copy integrity passed: ${routes.length} visitor HTML files checked.`);
