import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const errors = [];
const check = (ok, message) => {
  if (!ok) errors.push(message);
};

const source = read('src/daily-checkin.html');
const script = read('js/daily-checkin.js');

check(source.includes('title: "Daily Training Report | Sensei Sandy BJJ"'), 'title contract missing');
check(source.includes('canonicalUrl: "https://senseisandy.com/daily-checkin"'), 'canonical contract missing');
check(source.includes('robots: "noindex, follow"'), 'private route must be noindex, follow');

const requiredLabels = [
  'Student Name',
  'Class Date',
  'Main Skill Area',
  'What problem were they working on?',
  'What did you see them do?',
  'Where was this observed?',
  'Next time, try this.',
  'Send Parent Text (SMS)',
  'Copy Summary',
  'Save PDF / Print',
  'Next Student',
  'Live Report Slip'
];

for (const label of requiredLabels) {
  check(source.includes(label), `missing required label: ${label}`);
}

check(script.includes('window.print()'), 'Save PDF must invoke window.print');
check(script.includes('formatSmsMessage'), 'SMS formatting function missing');
check(script.includes("$('new-student').disabled = true"), 'reset button must begin disabled');
check(source.includes('/weekly-audit'), 'missing bridge link to weekly audit');
check(source.includes('/report-card'), 'missing bridge link to report card');
check(read('src/student-hub.html').includes('href="/daily-checkin"'), 'missing daily checkin link in student hub');

// Verify registry
const registry = JSON.parse(read('data/url-registry.json'));
const entry = registry.find((item) => item.path === '/daily-checkin');
check(entry !== undefined, 'missing url-registry.json entry for /daily-checkin');
check(entry?.indexable === false, 'registry must keep daily route non-indexable');
check(entry?.canonicalPath === '/daily-checkin', 'registry canonical path mismatch');

if (fs.existsSync('dist/daily-checkin.html')) {
  const output = read('dist/daily-checkin.html');
  check(output.includes('noindex, follow'), 'generated robots metadata missing in dist');
  check(!read('dist/sitemap.xml').includes('/daily-checkin'), 'daily route leaked into sitemap');
}

if (errors.length) {
  console.error(`QA: daily check-in FAILED (${errors.length})`);
  errors.forEach((e) => console.error(`- ${e}`));
  process.exit(1);
}

console.log('QA: daily check-in PASSED');
