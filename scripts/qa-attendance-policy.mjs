import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const files = {
  pricing: read('src/options-pricing.html') + read('src/options-pricing.njk'),
  parent: read('src/core-culture-parent-guide.html'),
  tannersville: read('src/bjj-classes/tannersville-ny/index.html'),
  teens: read('src/bjj-classes/teens-tannersville-ny/index.html'),
  reportCard: read('src/report-card.html')
};
const failures = [];
const assert = (condition, message) => { if (!condition) failures.push(message); };
const has = (key, pattern) => pattern.test(files[key]);

assert(has('pricing', /three planned weekly home-class reservations/i) || has('pricing', /three recurring home classes per week/i), 'pricing: three planned home classes are missing');
assert(has('pricing', /12 weeks/i), 'pricing: 12-week term rationale is missing');
assert(has('pricing', /up to 36 (?:scheduled opportunities|scheduled classes|coached small-group classes)/i), 'pricing: up-to-36 scheduled-opportunity language is missing');
assert(has('pricing', /open-seat rescheduling by text/i), 'pricing: open-seat rescheduling policy is missing');
assert(has('pricing', /space and a suitable partner|room capacity and suitable partner fit/i), 'pricing: capacity and partner-fit limitation is missing');
assert(!has('pricing', /3x weekly\s*[·.]\s*recommended/i), 'pricing: stale 3x-weekly recommended label remains');

assert(has('parent', /dependable partner groups/i), 'Parent Guide: partner-group rationale is missing');
assert(has('parent', /appropriate level of resistance|right level of resistance/i), 'Parent Guide: resistance-planning rationale is missing');
assert(has('parent', /ordinary reluctance|ordinary friction/i), 'Parent Guide: ordinary reluctance distinction is missing');
assert(has('parent', /pain, illness, fear, a safety concern, or persistent distress/i), 'Parent Guide: safety and distress override is missing');
assert(has('parent', /reluctance keeps returning|repeated fear or distress/i), 'Parent Guide: repeated-distress escalation is missing');
assert(!has('parent', /avoid negotiating attendance|bring your child unless/i), 'Parent Guide: binary/coercive attendance language remains');

assert(!has('tannersville', /indoor weekly discipline/i), 'Tannersville: Indoor weekly discipline remains');
assert(has('tannersville', /indoor.*weekly practice/i), 'Tannersville: weekly practice replacement is missing');
assert(has('teens', /recurring training schedule gives teens a place to practice/i), 'Teen page: in-academy routine explanation is missing');
assert(!has('teens', /school discipline|study habits|makes teens responsible/i), 'Teen page: unsupported school-discipline transfer remains');
assert(has('reportCard', /not from attendance, one repetition/i), 'Report Card: attendance exclusion is missing');
assert(!/attendance\s*(?:score|state)|attendance.*promotion|promotion.*attendance|perfect-attendance|classes until stripe/i.test(files.reportCard + files.parent), 'Assessment: attendance is connected mechanically to evaluation or promotion');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Attendance policy QA passed: pricing, parent guidance, teen/town copy, and assessment exclusions verified.');
