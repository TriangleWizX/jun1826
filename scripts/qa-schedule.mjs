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
    ['Monday', 'Adult', '6:00 PM', 'Gi'],
    ['Tuesday', 'Youth/Teen', '5:00 PM', 'Gi'],
    ['Tuesday', 'Adult', '6:00 PM', 'Gi'],
    ['Wednesday', 'Youth/Teen', '5:00 PM', 'No-Gi'],
    ['Wednesday', 'Adult', '6:00 PM', 'Gi'],
    ['Thursday', 'Youth/Teen', '5:00 PM', 'No-Gi'],
    ['Thursday', 'Adult', '6:00 PM', 'Gi'],
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
  if (activeGroupClasses.length !== 11) return ['Canonical schedule must contain exactly eleven recurring classes.'];
  const youth = activeGroupClasses.filter((entry) => entry.audience === 'Youth/Teen');
  const adults = activeGroupClasses.filter((entry) => entry.audience === 'Adult');
  if (youth.length !== 5 || youth.filter((entry) => entry.format === 'No-Gi').length !== 3 || youth.filter((entry) => entry.format === 'Gi').length !== 2) return ['Youth schedule ratio must be three No-Gi and two Gi.'];
  if (adults.length !== 6 || adults.filter((entry) => entry.format === 'No-Gi').length !== 1 || adults.filter((entry) => entry.format === 'Gi').length !== 5) return ['Adult schedule must have five weekday Gi classes and one Saturday No-Gi class.'];
  if (data.pilot?.capacity !== 12 || data.groupClasses.find((entry) => entry.id === 'friday-youth-teen-gi-lab')?.publicLabel !== 'Friday Gi Lab') return ['Pilot capacity or Friday Gi Lab label is incorrect.'];

  const expectedSlots = expected.map(([day, audience, time, format]) => ({ day, audience, time, format }));
  const normalize = (slots) => slots
    .map(({ day, audience, time, format }) => `${day}|${audience}|${time}|${format}`)
    .sort();
  const assertSameSlots = (label, slots) => {
    if (JSON.stringify(normalize(slots)) !== JSON.stringify(normalize(expectedSlots))) {
      return [`${label} schedule feed does not match src/_data/schedule.json.`];
    }
    return [];
  };

  const runtimeData = JSON.parse(fs.readFileSync(path.join(root, 'src', 'assets', 'data', 'schedule.json'), 'utf8'));
  const dayNames = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };
  const runtimeErrors = assertSameSlots('Runtime JSON', runtimeData.slots.filter((slot) => slot.active && slot.type === 'group').map((slot) => ({
    day: dayNames[slot.day],
    audience: slot.ageLane === 'youth' ? 'Youth/Teen' : 'Adult',
    time: `${slot.startTime} ${slot.startTime === '10:30' ? 'AM' : 'PM'}`,
    format: slot.giNoGi === 'no-gi' ? 'No-Gi' : 'Gi'
  })));
  if (runtimeErrors.length) return runtimeErrors;

  const ssotData = JSON.parse(fs.readFileSync(path.join(root, 'src', 'assets', 'data', 'ssot-schedule.json'), 'utf8'));
  const ssotErrors = assertSameSlots('SSOT export', ssotData.map((slot) => ({
    day: slot.day,
    audience: slot.audience === 'Youth + Teen' ? 'Youth/Teen' : slot.audience,
    time: slot.start_time,
    format: slot.gi_nogi
  })));
  if (ssotErrors.length) return ssotErrors;

  const legacySource = fs.readFileSync(path.join(root, 'data', 'schedule.js'), 'utf8')
    .replace('export const schedule =', '').replace(/;\s*$/, '').trim();
  const legacyData = new Function(`return ${legacySource}`)();
  const legacyErrors = assertSameSlots('Reusable component', legacyData.groupClasses.flatMap((slot) => slot.days.map((day) => ({
    day,
    audience: slot.audience === 'Youth + Teen' ? 'Youth/Teen' : slot.audience,
    time: slot.start,
    format: slot.format
  }))));
  if (legacyErrors.length) return legacyErrors;

  const assetSource = fs.readFileSync(path.join(root, 'src', 'assets', 'js', 'schedule-data.js'), 'utf8');
  const assetJson = assetSource.slice(assetSource.indexOf('=') + 1).trim().replace(/;\s*$/, '');
  const assetData = JSON.parse(assetJson);
  const assetErrors = assertSameSlots('Browser JS', assetData.groupClasses.flatMap((slot) => slot.days.map((day) => ({
    day,
    audience: slot.audience === 'Youth + Teen' ? 'Youth/Teen' : slot.audience,
    time: slot.start,
    format: slot.format
  }))));
  if (assetErrors.length) return assetErrors;

  const renderedSchedulePath = path.join(root, 'dist', 'schedule', 'index.html');
  if (fs.existsSync(renderedSchedulePath)) {
    const rendered = fs.readFileSync(renderedSchedulePath, 'utf8');
    const renderedRows = [
      ['Monday', '5:00–6:00 PM', 'Youth + Teen Small-Group Class · Ages 5–17 No-Gi', '6:00–7:00 PM', 'Adult Small-Group Class · Ages 18+ · Gi'],
      ['Tuesday', '5:00–6:00 PM', 'Youth + Teen Small-Group Class · Ages 5–17 Gi', '6:00–7:00 PM', 'Adult Small-Group Class · Ages 18+ · Gi'],
      ['Wednesday', '5:00–6:00 PM', 'Youth + Teen Small-Group Class · Ages 5–17 No-Gi', '6:00–7:00 PM', 'Adult Small-Group Class · Ages 18+ · Gi'],
      ['Thursday', '5:00–6:00 PM', 'Youth + Teen Small-Group Class · Ages 5–17 No-Gi', '6:00–7:00 PM', 'Adult Small-Group Class · Ages 18+ · Gi'],
      ['Friday', '5:00–6:00 PM', 'Youth + Teen Small-Group Class · Ages 5–17 Gi', '6:00–7:00 PM', 'Adult Small-Group Class · Ages 18+ · Gi'],
      ['Saturday', '10:30–11:30 AM', 'Adult No-Gi', null, null]
    ];
    for (const [day, youthTime, youthOrAdult, adultTime, adult] of renderedRows) {
      if (!rendered.includes(day) || !rendered.includes(youthOrAdult) || !rendered.includes(youthTime) || (adult && (!rendered.includes(adult) || !rendered.includes(adultTime)))) {
        return [`Rendered schedule row is incomplete or contradictory: ${day}`];
      }
    }
    if (rendered.includes('Current Schedule Through Saturday, September 5')) return ['Rendered page still contains an expired schedule block.'];
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
