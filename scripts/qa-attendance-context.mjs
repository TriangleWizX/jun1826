import fs from 'node:fs';

const context = JSON.parse(fs.readFileSync('src/_data/attendance-context.json', 'utf8'));
const required = ['schoolStatus', 'localEvent', 'weather', 'academyStatus', 'attendance'];
const missing = required.filter((field) => !(field in context.fields));
if (missing.length || context.reviewCadence !== 'monthly') {
  console.error(`Attendance context QA failed: ${missing.join(', ') || 'monthly review cadence missing'}`);
  process.exit(1);
}
console.log('Attendance context QA passed: school, event, weather, academy status, attendance, and monthly review are defined.');
