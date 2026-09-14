import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const loop = /(?:Map → Adapt → Resist → Observe → Adjust|Problem|Principle|Resistance|Adaptation|Watch → Practice → Check → Adjust)/i;
const checks = [
  ['How Class Works', read('dist/how-class-works.html'), [
    loop,
    /(?:live opponent who has a real job|coached resistance|work with a partner at a safe pace)/i,
    /(?:fixed technique list|how sandy coaches beginners|technique)/i,
    /(?:Make the problem legible|Problem:|Know what your partner is stopping)/i,
    /(?:Watch before supplying|Coach the person|Sandy changes the partner)/i,
    /(?:Change one useful variable|Adaptation:|Change the task when the first answer fails)/i,
    /(?:Adapt\. Test\. Notice\.|Short positional rounds|coached resistance at the right pace)/i,
    /(?:Direct instruction remains available|coached training|coaching during the round)/i,
    /(?:Failure is information|not failure|useful information|fails|mistake)/i
  ]],
  ['Report Card', read('dist/report-card.html'), [
    loop,
    /(?:next problem can be chosen from evidence|use what happened in class to choose the next problem|Problem tested)/i,
    /(?:Problem tested|problem-tested)/i,
    /(?:Name the problem, not a technique count|Skills, not grades|Write down the problem)/i,
    /(?:Record the student, problem, conditions, observed behavior, and next constraint|Write down the problem, what happened, and what to try next)/i,
    /(?:failed attempt is information|useful information, not failure|Progress is information, not pass or fail)/i
  ]],
  ['Goal Mapping', read('dist/free-bjj-intro-tannersville-ny/index.html'), [
    /(?:map gives the first coached problem|what problem you are working on|goals|first visit)/i,
    /(?:under resistance|skill-based resistance)/i
  ]],
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
if (/fixed technique list.{0,100}(?:required|everyone|must)/i.test(checks.map(([, html]) => html).join('\n'))) failures.push('logos: fixed technique checklist treated as required');
if (!/appropriate resistance|coached resistance|safe resistance/i.test(read('dist/how-class-works.html'))) failures.push('How Class Works: resistance evidence missing');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('SSBJJ logos QA passed.');
