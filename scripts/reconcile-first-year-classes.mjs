import fs from 'node:fs';

const [sessionsPath, startAt, endAt] = process.argv.slice(2);
if (!sessionsPath || !startAt || !endAt) {
  console.error('Usage: node scripts/reconcile-first-year-classes.mjs <sessions.json> <start-ISO> <end-ISO>');
  process.exit(2);
}

const parsed = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
const sessions = Array.isArray(parsed) ? parsed : parsed.sessions;
if (!Array.isArray(sessions)) throw new Error('sessions JSON must be an array or an object with a sessions array');

const windowed = sessions.filter((session) => {
  const start = String(session.start_at ?? session.startAt ?? '');
  const canceled = session.canceled === true || String(session.status ?? '').toLowerCase() === 'canceled';
  return start >= startAt && start <= endAt && !canceled;
});
const ids = new Set(windowed.map((session) => session.id).filter(Boolean));
const result = {
  target: 293,
  period: {start: startAt, end: endAt},
  calendarSessions: windowed.length,
  duplicateSessionIds: windowed.length - ids.size,
  reconciled: windowed.length === 293 && ids.size === 293,
  publicReady: windowed.length === 293 && ids.size === 293,
  note: 'Do not publish until the calendar count and attendance-ledger evidence are both reviewed and dated.'
};
console.log(JSON.stringify(result, null, 2));
if (!result.reconciled) process.exitCode = 1;
