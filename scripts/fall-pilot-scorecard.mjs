import fs from 'node:fs';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/fall-pilot-scorecard.mjs <attendance-export.csv>');
  process.exit(2);
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift()?.map((h) => h.trim()) || [];
  return rows.filter((r) => r.some(Boolean)).map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] || ''])));
}

const rows = parseCsv(fs.readFileSync(input, 'utf8'));
const valid = rows.filter((row) => ['present', 'late'].includes(String(row.attendance_status || '').toLowerCase()));
const sessions = new Map();
for (const row of valid) {
  const id = row.session_id;
  if (!id) continue;
  const date = String(row.session_start_at || '').slice(0, 10);
  const title = String(row.session_title || '').toLowerCase();
  const program = String(row.program_name || row.program_code || '').toLowerCase();
  const existing = sessions.get(id) || {
    id, date, title: row.session_title || '', program: row.program_name || row.program_code || '',
    attendance: 0, late: 0, audience: /adult/.test(`${title} ${program}`) ? 'adult' : 'youth',
    format: /no.?gi/.test(title) ? 'no-gi' : /gi/.test(title) ? 'gi' : 'unknown'
  };
  existing.attendance += 1;
  if (String(row.attendance_status).toLowerCase() === 'late') existing.late += 1;
  sessions.set(id, existing);
}

const all = [...sessions.values()].filter((session) => /^2026-/.test(session.date));
const median = (values) => {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const summarize = (label, items) => {
  const attendance = items.map((item) => item.attendance);
  const late = items.reduce((sum, item) => sum + item.late, 0);
  const attended = items.reduce((sum, item) => sum + item.attendance, 0);
  return {
    label,
    observedSessions: items.length,
    medianAttendance: median(attendance),
    fillRateAtCapacity12: attended && items.length ? Number((attended / (items.length * 12)).toFixed(4)) : null,
    lateArrivalRate: attended ? Number((late / attended).toFixed(4)) : null,
    dates: items.map((item) => item.date).sort()
  };
};
const monday = (session) => new Date(`${session.date}T12:00:00Z`).getUTCDay() === 1;
const before = all.filter((session) => session.date < '2026-09-14' && monday(session));
const pilot = all.filter((session) => session.date >= '2026-09-14' && session.date <= '2026-10-23' && monday(session));
const controls = all.filter((session) => session.date >= '2026-09-14' && session.date <= '2026-10-23' && !monday(session) && ['tuesday', 'friday'].some((day) => session.title.toLowerCase().includes(day)));

const output = {
  source: input,
  generatedAt: new Date().toISOString(),
  pilotWindow: { start: '2026-09-14', end: '2026-10-23', review: '2026-10-26' },
  capacity: 12,
  treatment: {
    class: 'Monday',
    before: summarize('Pre-pilot Mondays observed', before),
    during: summarize('Pilot Mondays observed', pilot)
  },
  controlClasses: summarize('Tuesday and Friday control classes observed', controls),
  dataQuality: {
    attendanceRowsUsed: valid.length,
    sessionsUsed: all.length,
    requiredPilotMondaysObserved: pilot.length >= 6,
    unavailableFields: [
      'reservations',
      'home-class assignments and adherence',
      'intro and Core Culture conversion',
      'athlete lead attribution',
      'stated schedule conflicts',
      'facility or staffing exceptions'
    ],
    note: 'Do not make the October 26 decision until unavailable fields are joined from the roster, booking ledger, and exception log.'
  }
};
console.log(JSON.stringify(output, null, 2));
