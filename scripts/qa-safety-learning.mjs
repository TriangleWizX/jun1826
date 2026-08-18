import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, 'dist', file), 'utf8');
const safety = read('jiu-jitsu-safety-tannersville-ny.html');
const classWorks = read('how-class-works.html');
const parent = read('core-culture-parent-guide.html');

assert.match(safety, /Safe Enough to Train Honestly/);
assert.match(safety, /scaling resistance so students can solve real problems/);
assert.match(safety, /not left alone to figure out live rounds/);
assert.match(safety, /appropriate partners and active coaching/);
assert.match(safety, /Training partners are teammates, not targets/);

assert.match(classWorks, /Your Partner Makes the Lesson Real/);
assert.match(classWorks, /resistance makes the problem honest/);
assert.match(classWorks, /keep the round productive/);

assert.match(parent, /Productive struggle is not unmanaged struggle/);
assert.match(parent, /Safe partner → real problem → mistake → reset → new decision/);
assert.match(parent, /stay engaged long enough to find one/);

for (const html of [safety, classWorks, parent]) {
  assert.doesNotMatch(html, /hardcore|toughness theater|fight simulation/i);
}

console.log('Safety-learning QA passed: safety is paired with real, coached resistance and productive struggle.');
