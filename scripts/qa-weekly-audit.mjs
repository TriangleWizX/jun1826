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
for (const label of ['Adult check-in', 'Youth check-in', 'Who is this for?', 'Student name', 'Week of', 'Skill', 'What I saw', 'What did I see?', 'Student words: What did you learn?', 'Where did we try it?', 'My next step', 'What will I help you try next?', 'What feels easier now?', 'Your check-in']) {
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
check(script.includes('Add the student’s words.'), 'validation must identify the student feedback field');
check(source.includes('I write what I saw. You tell me what you learned.'), 'coach voice intro missing');
check(source.includes('A grown-up can help write your words.'), 'youth help text must preserve student ownership');
check(source.includes('placeholder="I saw you…"'), 'coach observation stem missing');
check(source.includes('placeholder="I learned…"'), 'student feedback stem missing');
check(source.includes('placeholder="Next, I will help you…"'), 'coach next step stem missing');
check(source.includes('Student: What feels easier now?'), 'optional feedback must retain the student voice on print');
check(source.includes('Student: What feels easier now?</div><span class="receipt-rule">'), 'blank receipt must label the optional response as student feedback');
check(script.includes("'Youth check-in · Grown-up can help'"), 'youth receipt must explain that a grown-up can help');
for (const oldPrompt of ['What skill did you work on?', 'What did you try?', 'What did you say?']) {
  check(!source.includes(oldPrompt), `unclear old prompt remains: ${oldPrompt}`);
}
for (const skill of ['Get free when held down', 'Use legs to keep space', 'Finish with a safe hold']) {
  check(script.includes(skill), `plain skill name missing: ${skill}`);
}
check(script.includes('Position (start in one spot)') && script.includes('Live (move and choose)') && script.includes('Drill (repeat a move)'), 'practice choices need plain-language cues');
check(source.includes('☐ Game　☐ Set spot　☐ Other<br>☐ Choose moves　☐ Repeat move'), 'blank receipt must use short practice choices');
check(source.includes('.checkin-form { grid-row: 1; }'), 'mobile form must come before the preview');
check(source.includes('id="receipt-blank-type"'), 'blank receipt must keep an audience-aware header');
check(source.includes('id="receipt-blank-type">Adult check-in</div><div class="receipt-meta">Student name: ______________</div>'), 'blank receipt must keep its student and week lines separate from the audience label');
check(script.includes("$('receipt-blank-type').textContent = checkinTypeLabel();"), 'blank receipt audience label must update without replacing name and week lines');
check(!source.includes('<div class="receipt-footer">'), 'thermal receipt must fit its content on one page');
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
