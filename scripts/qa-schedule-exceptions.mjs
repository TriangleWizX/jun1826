import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const pages = [
  read('dist/index.html'),
  read('dist/schedule/index.html'),
  read('dist/holiday-schedule.html'),
  read('dist/after-school.html')
].join('\n');
const exceptions = JSON.parse(read('src/_data/schedule-exceptions.json'));
const errors = [];

if (exceptions.exceptions.find((item) => item.date === '2026-09-07')?.status !== 'closed') {
  errors.push('Canonical September 7 exception is not closed.');
}
if (!pages.includes('September 7') || !/closed.*September 7|September 7.*closed/i.test(pages)) {
  errors.push('Public schedule surfaces do not state the September 7 closure.');
}
if (/September 7[^.]{0,100}(open mat|regular class|5:00 PM youth|6:00 PM adults)/i.test(pages)) {
  errors.push('A public schedule surface still advertises open/regular classes on September 7.');
}
if (!pages.includes('Saturday, September 5') && !pages.includes('Saturday Adult No-Gi')) {
  errors.push('Saturday September 5 state is not explicit.');
}
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log('Schedule exception QA passed: September 7 is closed and September 5 is explicit.');
