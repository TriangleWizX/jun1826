import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

function checkCanonicalSchedule() {
  const data = JSON.parse(fs.readFileSync(path.join(root, 'src', '_data', 'schedule.json'), 'utf8'));
  const activeGroupClasses = data.groupClasses.filter((entry) => entry.active);
  const expected = [
    ['Monday', 'Youth/Teen', '5:00 PM', 'No-Gi'],
    ['Monday', 'Adult', '6:00 PM', 'No-Gi'],
    ['Tuesday', 'Youth/Teen', '5:00 PM', 'Gi'],
    ['Tuesday', 'Adult', '6:00 PM', 'Gi'],
    ['Wednesday', 'Youth/Teen', '5:00 PM', 'No-Gi'],
    ['Wednesday', 'Adult', '6:00 PM', 'No-Gi'],
    ['Friday', 'Youth/Teen', '5:00 PM', 'Gi'],
    ['Friday', 'Adult', '6:00 PM', 'Gi'],
    ['Saturday', 'Adult', '10:30 AM', 'No-Gi']
  ];
  for (const [day, audience, time, format] of expected) {
    const match = activeGroupClasses.find((entry) => entry.day === day && entry.audience === audience);
    if (!match || match.time !== time || match.format !== format) {
      return [`Canonical schedule mismatch: ${day} ${audience} ${time} ${format}`];
    }
  }
  if (activeGroupClasses.length !== 9) return ['Canonical schedule must contain exactly nine recurring classes.'];
  const youth = activeGroupClasses.filter((entry) => entry.audience === 'Youth/Teen');
  const adults = activeGroupClasses.filter((entry) => entry.audience === 'Adult');
  if (youth.length !== 4 || youth.filter((entry) => entry.format === 'No-Gi').length !== 2 || youth.filter((entry) => entry.format === 'Gi').length !== 2) return ['Youth schedule ratio must be two No-Gi and two Gi.'];
  if (adults.length !== 5 || adults.filter((entry) => entry.format === 'No-Gi').length !== 3 || adults.filter((entry) => entry.format === 'Gi').length !== 2) return ['Adult schedule ratio must be three No-Gi and two Gi.'];
  if (data.pilot?.capacity !== 12 || data.groupClasses.find((entry) => entry.id === 'friday-youth-teen-gi-lab')?.publicLabel !== 'Friday Gi Lab') return ['Pilot capacity or Friday Gi Lab label is incorrect.'];

  const renderedSchedulePath = path.join(root, 'dist', 'schedule', 'index.html');
  if (fs.existsSync(renderedSchedulePath)) {
    const rendered = fs.readFileSync(renderedSchedulePath, 'utf8');
    const renderedRows = [
      ['Monday', 'Youth + Teen Small-Group Class · Ages 5–17 No-Gi', 'Adult Small-Group Class · No-Gi'],
      ['Tuesday', 'Youth + Teen Small-Group Class · Ages 5–17 Gi', 'Adult Small-Group Class · Gi'],
      ['Wednesday', 'Youth + Teen Small-Group Class · Ages 5–17 No-Gi', 'Adult Small-Group Class No-Gi'],
      ['Friday', 'Youth + Teen Small-Group Class · Ages 5–17 Gi', 'Adult Small-Group Class · Gi'],
      ['Saturday', 'Adult No-Gi', null]
    ];
    for (const [day, youthOrAdult, adult] of renderedRows) {
      if (!rendered.includes(day) || !rendered.includes(youthOrAdult) || (adult && !rendered.includes(adult))) {
        return [`Rendered schedule row is incomplete or contradictory: ${day}`];
      }
    }
  }

  const sharedPartial = fs.readFileSync(path.join(root, 'src', 'partials', 'current-schedule.html'), 'utf8');
  if (!sharedPartial.includes('Private coaching is scheduled separately by request.') || !sharedPartial.includes('href="/schedule"')) {
    return ['Shared schedule partial must describe private coaching by request and link to /schedule.'];
  }
  if (/\d{1,2}:\d{2} (?:AM|PM) Private/.test(sharedPartial)) {
    return ['Shared schedule partial must not publish private appointment times.'];
  }
  return [];
}

// Audit rules
const bannedStrings = [
  'Monday, Tuesday and Friday are Gi',
  'Monday, Tuesday, and Friday are Gi',
  'Gi-focused evening classes run Monday, Tuesday and Friday',
  'No-Gi runs Wednesday evening',
  "semi-private",
  "semi private",
  "Morning BJJ",
  "Before Work BJJ",
  "10:00 AM Private",
  "10:00 AM Morning",
  "Thursday Closed",
  "Classes are 45 minutes",
  "Saturday No-Gi Small-Group Class",
  "5:00 PM Youth Small-Group Class"
];

function checkFile(filePath) {
  let errors = [];
  const content = fs.readFileSync(filePath, 'utf8');
  for (const banned of bannedStrings) {
    if (content.includes(banned)) {
      errors.push(`Found banned string: "${banned}"`);
    }
  }
  return errors;
}

function scanDirectory(dir) {
  let allErrors = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', '.tmb', 'tmp', 'archive', 'tools', 'scripts', 'docs', '.claude'].includes(file)) {
        allErrors = allErrors.concat(scanDirectory(fullPath));
      }
    } else if (stat.isFile() && path.basename(fullPath) !== 'Purge stale schedule information.md' && (fullPath.endsWith('.html') || fullPath.endsWith('.md') || fullPath.endsWith('.js'))) {
      const errors = checkFile(fullPath);
      if (errors.length > 0) {
        allErrors.push(`File: ${fullPath.replace(root, '')}\n  - ` + errors.join('\n  - '));
      }
    }
  }
  return allErrors;
}

console.log('Running automated schedule audit...');
const errors = checkCanonicalSchedule().concat(scanDirectory(root));

if (errors.length > 0) {
  console.error('\nSchedule Audit Failed! The following files contain banned schedule strings:');
  console.error(errors.join('\n\n'));
  process.exit(1);
} else {
  console.log('Schedule Audit Passed! No banned strings found.');
  process.exit(0);
}
