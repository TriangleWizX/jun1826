import fs from 'node:fs';

const input = process.argv[2];
if (!input) {
  console.error('Usage: node scripts/academy-metrics-report.mjs <attendance-export.csv>');
  process.exit(2);
}

const rows = fs.readFileSync(input, 'utf8').trim().split(/\r?\n/).slice(1).filter(Boolean);
const counts = new Map();
for (const row of rows) {
  const fields = row.split(',').map((field) => field.replace(/^"|"$/g, '').replaceAll('""', '"'));
  const [sessionId, , , , , , , , , , status] = fields;
  if (sessionId && ['present', 'late'].includes(status)) counts.set(sessionId, (counts.get(sessionId) || 0) + 1);
}
const values = [...counts.values()].sort((a, b) => a - b);
const median = values.length ? (values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2) : null;
console.log(JSON.stringify({
  source: input,
  sessionsWithAttendance: values.length,
  medianClassSize: median,
  minimumObservationCount: 30,
  publicReady: values.length >= 30,
  note: 'Attendance export alone does not establish total delivered sessions; reconcile against the canonical class calendar.'
}, null, 2));
