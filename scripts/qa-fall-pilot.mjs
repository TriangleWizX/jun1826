import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const errors = [];
const control = JSON.parse(read('src/_data/fall-practice-control.json'));
const schedule = JSON.parse(read('src/_data/schedule.json'));
const holiday = read('src/holiday-schedule.html');
const schedulePage = read('src/schedule.html');
const homepage = read('src/index.html');
const reset = read('src/fall-practice-reset.html');
const booking = read('src/free-bjj-intro-tannersville-ny/index.html');
const bookingJs = read('js/progressive-booking.js');

const requireText = (content, text, label) => {
  if (!content.includes(text)) errors.push(`${label}: missing ${text}`);
};

if (control.schoolBegins !== 'Thursday, September 3, 2026') errors.push('Control sheet school date drifted.');
if (control.september4 !== 'Regular school and academy day; Youth Gi 5 PM and Adult Gi 6 PM') errors.push('Control sheet September 4 decision drifted.');
if (control.fullFallSchedule !== 'Monday, September 14, 2026') errors.push('Control sheet full-schedule date drifted.');
if (control.october12 !== 'Regular academy schedule; Columbus/Indigenous Peoples’ Day is treated as a minor holiday for this rollout') errors.push('October 12 decision is missing or changed.');
if (schedule.pilot?.placementStartDate !== '2026-09-08' || schedule.pilot?.effectiveDate !== '2026-09-14' || schedule.pilot?.measurementEndDate !== '2026-10-23' || schedule.pilot?.reviewDate !== '2026-10-26') errors.push('Canonical pilot dates drifted.');

for (const [content, terms, label] of [
  [holiday, ['First Day of School', 'Regular Friday academy schedule: Youth Gi at 5:00 PM and Adult Gi at 6:00 PM.', 'Fall Placement Week', 'Full Fall Practice Schedule', 'October 26'], 'Holiday page'],
  [schedulePage, ['Fall placement begins September 8', 'full fall practice schedule begins Monday, September 14', 'Class times remain unchanged', 'Fall Placement Begins Tuesday, September 8'], 'Schedule page'],
  [reset, ['School starts September 3', 'placement begins September 8', 'full weekly format begins September 14'], 'Fall reset'],
  [homepage, ['Build a fall routine they can keep', 'See the Fall Schedule', 'Book a Free Intro'], 'Homepage'],
  [booking, ['Which 5 PM days usually work?', 'Which adult class days usually work?', 'preferred_days'], 'Booking page'],
  [bookingJs, ['preferred_days', 'adultPreferredDaysFieldset'], 'Booking script']
]) for (const term of terms) requireText(content, term, label);

if (/August 31|Aug\. 31/i.test([holiday, schedulePage, reset, homepage].join('\n'))) errors.push('Stale August 31 copy remains on a public fall surface.');
const sept4Start = holiday.indexOf('Friday, Sept. 4');
const sept4Block = sept4Start >= 0 ? holiday.slice(sept4Start, sept4Start + 500) : '';
if (/conditional|school holiday|10:30 AM/i.test(sept4Block)) errors.push('September 4 still has conditional/holiday treatment.');
if (!holiday.includes('official Hunter-Tannersville CSD 2026–27 calendar')) errors.push('Official school-calendar link is missing.');

if (errors.length) {
  console.error(`Fall pilot QA failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):`);
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log('Fall pilot QA passed: control dates and public transition surfaces are synchronized.');
