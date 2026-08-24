import fs from 'node:fs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const page = read('src/how-class-works.html');
const doctrine = read('src/partials/teaching-doctrine.html');

const required = [
  '45 minutes', '60-minute reserved window', 'Position:', 'Problem:',
  'Principle:', 'Options:', 'Resistance:', 'Adaptation:',
  'One selected partner', 'One safety rule', 'One useful movement',
  'One scoring target', 'Teach the idea. Coach the person.'
];
for (const value of required) {
  if (!page.includes(value)) throw new Error(`missing canonical content: ${value}`);
}
for (const [term, definition] of [
  ['ADAPT', 'Teaching fits the learner.'],
  ['TEST', 'Learning survives safe resistance.'],
  ['EXPRESS', 'Skill becomes personal.']
]) {
  if (!doctrine.includes(term) || !doctrine.includes(definition)) {
    throw new Error(`canonical doctrine mismatch: ${term}`);
  }
}

const inbound = [
  'src/bjj-classes/kids-tannersville-ny/index.html',
  'src/bjj-classes/teens-tannersville-ny/index.html',
  'src/bjj-classes/adults-tannersville-ny/index.html',
  'src/options-pricing.html',
  'src/bio.html'
];
for (const file of inbound) {
  if (!read(file).includes('href="/how-class-works"')) {
    throw new Error(`missing methodology link: ${file}`);
  }
}

console.log(`how-class-works canonical QA passed (${required.length} content assertions, ${inbound.length} inbound links)`);
