import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const source = read('src/weekly-audit.html');
const output = read('dist/weekly-audit.html');
const script = read('js/weekly-audit.js');

check(source.includes('title: "Weekly Training Check-In | Sensei Sandy BJJ"'), 'title contract missing');
check(source.includes('canonicalUrl: "https://senseisandy.com/weekly-audit"'), 'canonical contract missing');
check(source.includes('robots: "noindex, follow"'), 'private route must noindex, follow');
for (const label of ['Adult check-in', 'Youth check-in', 'Name', 'Week of', 'Main skill', 'What skill did you work on?', 'What did you see?', 'Where did you try it?', 'What will you try next?', 'Live preview']) {
  check(source.includes(label), `missing required label: ${label}`);
}
for (const term of ['Letter', 'Ops API', 'fetch(', 'sessionStorage', 'Students trained', 'Help level', 'Save Student Note', 'History']) {
  check(!source.includes(term) && !script.includes(term), `unexpected workflow term remains: ${term}`);
}
check(source.includes('2.2in 5in'), '2.2 inch page size missing');
check(source.includes('width: 2.2in'), 'mobile preview must show the 2.2 inch receipt');
check(source.includes('data-preview-mode="receipt"'), 'mobile must start with the filled 2.2 inch preview');
check(source.includes('data-preview-mode="receipt-blank"] .receipt-fields'), 'blank form choice must update the mobile preview');
check(source.includes('value="receipt"') && source.includes('value="receipt-blank"'), 'filled and blank print modes missing');
check(!source.includes('value="letter"'), 'Letter print mode must be removed');
check(script.includes('window.print()'), 'print action must invoke window.print');
check(script.includes('document.body.dataset.printMode'), 'print mode must be reflected on the page');
check(script.includes("$('new-student').disabled = true"), 'new check-in button must start disabled');
check(output.includes('noindex, follow'), 'built route must remain noindex, follow');
check(!read('dist/sitemap.xml').includes('/weekly-audit'), 'private route must stay out of sitemap');
const registry = JSON.parse(read('data/url-registry.json'));
const entry = registry.find((item) => item.path === '/weekly-audit');
check(entry?.indexable === false, 'URL registry entry must remain non-indexable');
check(entry?.canonicalPath === '/weekly-audit', 'canonical path registry entry missing');

if (errors.length) {
  console.error(`QA: Weekly check-in FAILED (${errors.length})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('QA: Weekly check-in PASSED');
