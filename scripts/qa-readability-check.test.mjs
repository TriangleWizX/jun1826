import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

function check(html, args = []) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-readability-'));
  const file = path.join(directory, 'fixture.html');
  try {
    fs.writeFileSync(file, html);
    const result = spawnSync(process.execPath, ['tools/readability-check.mjs', file, '--json', ...args], { encoding: 'utf8' });
    assert.equal(result.error, undefined);
    return { status: result.status, report: JSON.parse(result.stdout) };
  } finally {
    fs.rmSync(directory, { recursive: true });
  }
}

test('reads visible prose while excluding metadata, executable code, and templates', () => {
  const result = check('---\ntitle: Incomprehensibility\n---\n<style>incomprehensibility</style><script>never();</script><!-- without -->' +
    '<template>never</template><p>Kids train with care.</p><p>{{ pricing.value }} Read the plan.</p>');
  assert.equal(result.report.words, 7);
  assert.equal(result.report.sentences, 2);
  assert.deepEqual(result.report.banned, []);
});

test('decimal table values do not create sentence boundaries', () => {
  const decimal = check('<p>Read the sample. Drink 1.15 cups with care.</p>').report;
  const integer = check('<p>Read the sample. Drink 115 cups with care.</p>').report;
  assert.equal(decimal.sentences, 2);
  assert.equal(decimal.sentences, integer.sentences);
  assert.equal(decimal.grade, integer.grade);
});

test('encoded and curly apostrophes preserve contraction detection', () => {
  const result = check('<p>Don&rsquo;t rush. Don&#39;t rush. Don’t rush.</p>', ['--max-grade', '3']);
  assert.equal(result.status, 1);
  assert.ok(result.report.banned.some(value => value.includes("don't") && value.endsWith(': 3')));
});

test('grade gate fails difficult prose and passes simple prose', () => {
  assert.equal(check('<p>Institutional bureaucracies conceptualize incomprehensible methodological reconfigurations.</p>', ['--max-grade', '3']).status, 1);
  assert.equal(check('<p>Kids train with care. Read the plan.</p>', ['--max-grade', '3']).status, 0);
});
