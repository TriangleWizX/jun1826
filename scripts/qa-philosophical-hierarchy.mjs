import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [
  ['homepage', read('dist/index.html'), [/(?:Seen\. Tested\. Becoming|Learn clear skills with a partner|partner)/i, /(?:small groups?|small-group)/i]],
  ['Free First Visit', read('dist/free-bjj-intro-tannersville-ny/index.html'), [/(?:Goal Mapping|First Visit|first visit)/i, /(?:appropriate partner|training partner|matched partner|partner)/i, 'skill-based resistance']],
  ['Kids', read('dist/bjj-classes/kids-tannersville-ny/index.html'), [/(?:appropriate without making it fake|age-appropriate|thoughtfully matched partner)/i, /(?:Safe enough to keep trying|learn safely|safe falling)/i]],
  ['Teens', read('dist/bjj-classes/teens-tannersville-ny/index.html'), [/(?:serious training without a sink-or-swim culture|Reserve Free Intro|Athlete Cross-Training)/i, /(?:gradually increasing resistance|moves with resistance|safe resistance)/i]],
  ['Adults', read('dist/bjj-classes/adults-tannersville-ny/index.html'), [/(?:real resistance from the beginning|Controlled resistance|Useful skills for real resistance)/i, /(?:Coach-controlled resistance rounds|Coaching during the round|coached start)/i]],
  ['Pricing', read('dist/options-pricing.html'), [/(?:structured training relationship, not anonymous access to a mat|first-term programs include|12-week program)/i, 'progress feedback']],
  ['Bio', read('dist/bio.html'), ['taught wherever the mats fit', 'coached, not tested', 'Josh Griffiths at Clockwork']],
];
const failures = [];
for (const [label, html, phrases] of checks) {
  for (const phrase of phrases) {
    if (phrase instanceof RegExp) {
      if (!phrase.test(html)) failures.push(`${label}: missing pattern ${phrase}`);
    } else {
      if (!html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`${label}: missing "${phrase}"`);
    }
  }
}
if (/Kawaishi|Haueter/i.test(read('dist/index.html'))) failures.push('homepage: internal influence names leaked into consumer-facing homepage');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Philosophical hierarchy QA passed.');
