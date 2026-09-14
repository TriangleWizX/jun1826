import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => {
  const p = path.join(root, 'dist', file);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  const alt = path.join(root, 'dist', file.replace(/\.html$/, ''), 'index.html');
  if (fs.existsSync(alt)) return fs.readFileSync(alt, 'utf8');
  return fs.readFileSync(p, 'utf8');
};
const safety = read('jiu-jitsu-safety-tannersville-ny.html');
const classWorks = read('how-class-works.html');
const parent = read('core-culture-parent-guide.html');

assert.match(safety, /(?:Safe Enough to Train Honestly|Our Safety Promise|coached pacing)/i);
assert.match(safety, /(?:scaling resistance so students can solve real problems|coached through movement, partner work, and intensity|coached resistance)/i);
assert.match(safety, /(?:not left alone to figure out live rounds|Beginners are not left to figure it out)/i);
assert.match(safety, /(?:appropriate partners and active coaching|partner matching|safe contact)/i);
assert.match(safety, /Training partners are teammates, not targets/);

assert.match(classWorks, /Your Partner Makes the Lesson Real/);
assert.match(classWorks, /resistance makes the problem honest/);
assert.match(classWorks, /keep the round productive/);

assert.match(parent, /(?:Productive struggle is not unmanaged struggle|struggle with the problem)/i);
assert.match(parent, /(?:Safe partner → real problem → mistake → reset → new decision|solve hard problems with a partner|partner)/i);
assert.match(parent, /(?:stay engaged long enough to find one|work through the problem|think and act under pressure)/i);

for (const html of [safety, classWorks, parent]) {
  assert.doesNotMatch(html, /hardcore|toughness theater|fight simulation/i);
}

console.log('Safety-learning QA passed: safety is paired with real, coached resistance and productive struggle.');
