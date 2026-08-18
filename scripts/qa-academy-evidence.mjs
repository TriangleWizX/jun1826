import fs from 'node:fs';

const metrics = JSON.parse(fs.readFileSync('src/_data/academy-metrics.json', 'utf8'));
const schedule = JSON.parse(fs.readFileSync('src/_data/schedule.json', 'utf8'));
const homepage = fs.readFileSync('src/index.html', 'utf8');
const reportCard = fs.readFileSync('src/report-card.html', 'utf8');
const active = schedule.groupClasses.filter((entry) => entry.active);
const errors = [];

if (active.length !== metrics.metrics['weekly-class-count'].value) errors.push('weekly class count does not match active schedule');
if (JSON.stringify(metrics.evidenceLayers) !== JSON.stringify(['external-research', 'first-party-operational', 'individual-observation'])) errors.push('evidence layers are not separated');
for (const [id, metric] of Object.entries(metrics.metrics)) {
  if (!metric.category || !metric.period || !metric.source || !metric.definition || !metric.aggregation) errors.push(`metric definition incomplete: ${id}`);
  if (metric.public && metric.value === null) errors.push(`public metric has no value: ${id}`);
}
const firstYear = metrics.metrics['first-year-class-count'];
if (!firstYear.public || firstYear.status !== 'verified' || firstYear.value !== 294) errors.push('verified first-year count is not published as 294');
if (firstYear.verification?.length !== 2 || !firstYear.verification.includes('attendance-ledger') || !firstYear.verification.includes('manual-class-calendar')) errors.push('first-year verification sources incomplete');
if (firstYear.reconciliation?.observedTotal !== firstYear.value || firstYear.reconciliation?.priorTrackedTotal !== 293) errors.push('first-year workbook reconciliation incomplete');
if (!homepage.includes('academyFact(294') || homepage.includes('293 classes')) errors.push('homepage first-year operational fact is incorrect');
const median = metrics.metrics['median-class-size'];
if (!median.public || median.value !== 3 || median.sampleSize < 30 || median.quartiles?.p25 !== 2 || median.quartiles?.p75 !== 5) errors.push('median class-size metric is incomplete');
if (!homepage.includes('academyFact(3, "median recorded students per class"')) errors.push('homepage median class-size fact is missing');
if (!homepage.includes('academyFact(9') || !homepage.includes('recurring classes each week') || !homepage.includes('current-service')) errors.push('homepage lacks current-service fact block');
if (!reportCard.includes('Observations reviewed') || !reportCard.includes('Contexts observed')) errors.push('report card lacks operational observation fields');
if (/attendance.{0,80}(rank|promotion|capabil)/i.test(reportCard)) errors.push('report card links attendance to capability or promotion');
if (!metrics.tracking.attendance.neverMapsTo.includes('rank') || !metrics.tracking.attendance.neverMapsTo.includes('capability')) errors.push('attendance safety boundary missing');

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Academy evidence QA passed (${active.length} active group classes; 5 public operational facts).`);
