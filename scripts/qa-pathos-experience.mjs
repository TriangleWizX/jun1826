import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => {
  const p = path.join(root, file);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  const alt = path.join(root, file.replace(/\.html$/, '/index.html'));
  if (fs.existsSync(alt)) return fs.readFileSync(alt, 'utf8');
  return fs.readFileSync(p, 'utf8');
};
const home = read('dist/index.html');
const intro = read('dist/free-bjj-intro-tannersville-ny/index.html');
const parent = read('dist/core-culture-parent-guide.html');
const report = read('dist/report-card.html');
const failures = [];

const checkPhrases = (label, html, phraseList) => {
  for (const item of phraseList) {
    if (item instanceof RegExp) {
      if (!item.test(html)) failures.push(`${label}: missing pattern ${item}`);
    } else {
      if (!html.toLowerCase().includes(item.toLowerCase())) failures.push(`${label}: missing "${item}"`);
    }
  }
};

checkPhrases('homepage', home, [
  /(?:Seen\. Tested\. Becoming|Learn clear skills with a partner|skills)/i,
  /(?:problem you can enter|safe pace|partner)/i,
  /(?:genuinely trying|Try again|Keep Going|Listen)/i,
  /(?:clear next attempt|Start With the Right Class|next)/i
]);

checkPhrases('Free First Visit', intro, [
  /(?:treated like a beginner, not an inconvenience|first-visit guide|Plan Your Free First Visit|normal clothes)/i,
  /(?:appropriate partner|training partner|matched partner|partner)/i,
  'right pace'
]);

checkPhrases('Parent Guide', parent, [
  /(?:hard moments small enough to work through safely|struggle with the problem|hard rounds? teach)/i,
  /(?:notice what your child can handle now|notice what your child|Signs of progress)/i,
  /(?:Try again after losing a round|try again)/i
]);

checkPhrases('Report Card', report, [
  /(?:specific observation|Write three short notes|notes give context|Observation context)/i,
  /(?:next constraint|what to try next|what comes next)/i,
  /(?:failed attempt is information|information, not failure|useful information)/i
]);

if (/guaranteed success|no resistance|avoid(?:ing)? difficult partners/i.test(home + intro)) failures.push('pathos: challenge was softened into avoidance');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Pathos experience QA passed.');
