import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { auditCopy, auditTree } from './qa-stop-slop.mjs';

test('finds defects in front matter, metadata, inline text and JSON-LD', () => {
  const result = auditCopy(`---
description: "Start the 12-week 12-week program"
---
<meta content="It is a game-changer" name="description">
<p>Practice with <strong>0%</strong> injury.</p>
<script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"acceptedAnswer":{"text":"Guard is a common BJJ term used in class to describe a key position, movement, or concept."}}]}</script>`);
  for (const [rule, surface] of [['duplicate-program-phrase', 'front-matter'], ['jargon:game-changer', 'metadata'], ['zero-injury-promise', 'text'], ['generic-definition', 'json-ld']]) {
    assert.ok(result.findings.some((item) => item.rule === rule && item.surface === surface), `${rule} on ${surface}`);
  }
});

test('preserves quotations and technical syntax without hiding nearby prose', () => {
  const result = auditCopy(`<style>.x { transform: translateX(1px); /* — */ }</style>
<script>const text = 'really — game-changer';</script>
<blockquote>It is really a game-changer.</blockquote>
<p class="quote-text">It is really a game-changer.</p>
<p>Use leverage to make space. Attend more than one class.</p>
<p>It is really a game-changer.</p>`);
  assert.equal(result.exceptions.length, 2);
  assert.equal(result.findings.filter((item) => item.rule === 'jargon:game-changer').length, 1);
  assert.equal(result.findings.filter((item) => item.severity === 'error').length, 0);
  assert.ok(!result.findings.some((item) => item.rule === 'em-dash'));
});

test('reports incomplete JSON-LD and handles folded descriptions', () => {
  const result = auditCopy('---\ndescription: >-\n  A 12-week 12-week program.\n---\n<script type="application/ld+json">{{ schema | dump }}</script><script type="application/ld+json">{broken}</script>');
  assert.equal(result.incomplete.length, 2);
  assert.ok(result.findings.some((item) => item.rule === 'duplicate-program-phrase'));
});

test('scans source partials and non-indexed pages, with explicit CLI exits', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'stop-slop-test-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const src = path.join(dir, 'src');
  await fs.mkdir(path.join(src, 'partials'), { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), '<p>Root copy has 0% injury.</p>');
  await fs.writeFile(path.join(src, 'index.html'), '<p>Coached partner practice.</p>');
  await fs.writeFile(path.join(src, 'private-page.html'), '<meta name="robots" content="noindex"><p>Learn with a coach.</p>');
  await fs.writeFile(path.join(src, 'partials', 'cta.html'), '<p>0% injury.</p>');
  await fs.writeFile(path.join(src, 'waiver.html'), '<p>0% injury.</p>');
  let result = await auditTree(src);
  assert.equal(result.inspected, 3);
  assert.equal(result.errors, 1);
  assert.equal(result.findings[0].file, 'partials/cta.html');
  assert.ok(result.skipped.some((item) => item.reason === 'legal copy'));
  const script = path.resolve('scripts/qa-stop-slop.mjs');
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: 'utf8' });
  assert.equal(run('--json').status, 0, 'default input is src, advisory');
  assert.equal(run('--strict').status, 1, 'confirmed pattern fails strict gate');
  await fs.writeFile(path.join(src, 'partials', 'cta.html'), '<p>It is really useful.</p>');
  assert.equal(run('--strict').status, 0, 'style candidate is not a confirmed defect');
  await fs.writeFile(path.join(src, 'partials', 'cta.html'), '<script type="application/ld+json">{bad}</script>');
  assert.equal(run('--strict').status, 2, 'incomplete extraction cannot pass strict');
  assert.equal(run('--input', path.join(dir, 'missing')).status, 2);
  await fs.mkdir(path.join(dir, 'empty'));
  assert.equal(run('--input', path.join(dir, 'empty')).status, 2);
  assert.equal(run('--unknown').status, 2);
});
