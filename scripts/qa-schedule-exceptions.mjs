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

if (exceptions.exceptions.find((item) => item.date === '2026-09-07')?.status !== 'special') {
  errors.push('Canonical September 7 exception is not a special event.');
}
if (!pages.includes('September 7') || !/Labor Day.*(Games|Open Mat)|September 7.*(Games|Open Mat)/i.test(pages)) {
  errors.push('Public schedule surfaces do not state the September 7 special event.');
}
if (!/September 7[^.]{0,180}(5:00 PM|6:00 PM)/i.test(pages)) errors.push('September 7 special-event times are missing.');
if (!pages.includes('Saturday, September 5') && !pages.includes('Saturday Adult No-Gi')) {
  errors.push('Saturday September 5 state is not explicit.');
}
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}
console.log('Schedule exception QA passed: September 7 special event and September 5 Adult No-Gi are explicit.');
