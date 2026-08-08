#!/usr/bin/env node
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FINGERPRINTER = path.join(ROOT, 'tools/fingerprint-assets.cjs');

const md5 = (value) => crypto.createHash('md5').update(value).digest('hex').slice(0, 6);
const write = (root, rel, value) => {
  if (fingerprintFixtureMode) fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
  const full = path.join(root, fixtureRel(rel));
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, value);
};
let fingerprintFixtureMode = false;
// Keep the fixture's logical references readable, but map each contract-owned
// input/output explicitly. This mirrors fingerprint-assets.cjs: source assets
// live under src, emitted pages and hashes under dist.
const fixtureRel = (rel) => {
  if (!fingerprintFixtureMode) return rel;
  if (rel === 'sensei-sandy-logo-global.css') return path.join('src', 'tokens.css');
  if (rel.startsWith('sensei-sandy-logo-global.')) return path.join('dist', rel.replace('sensei-sandy-logo-global', 'tokens'));
  if (rel.endsWith('.html')) return path.join('dist', rel);
  if (/^(?:assets|js|images)\/.*\.[0-9a-f]{6}\.[^.]+$/i.test(rel)) return path.join('dist', rel);
  if (rel === 'assets' || rel.startsWith('assets/')) return path.join('src', rel);
  return rel;
};
const fixtureWrite = (root, rel, value) => write(root, rel, value);
const fixtureRead = (root, rel) => fs.readFileSync(path.join(root, fixtureRel(rel)), 'utf8');
const read = (root, rel) => fs.readFileSync(path.join(root, fixtureRel(rel)), 'utf8');
const runNode = (cwd, script, args = [], expectedStatus = 0, envOverrides = {}) => {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
    env: {
      ...Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('RTK_'))),
      ...envOverrides
    }
  });
  if (result.error) throw result.error;
  const output = `${result.stdout}${result.stderr}`;
  assert.equal(
    result.status,
    expectedStatus,
    `Unexpected exit for node ${script} ${args.join(' ')}\n${output}`
  );
  if (script === FINGERPRINTER && args.length === 0) console.error(output);
  return output;
};
const snapshot = (root) => {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const bytes = entry.isSymbolicLink()
          ? Buffer.from(`symlink:${fs.readlinkSync(full)}`)
          : fs.readFileSync(full);
        const stat = fs.lstatSync(full);
        files.push({
          hash: crypto.createHash('sha256').update(bytes).digest('hex'),
          kind: entry.isSymbolicLink() ? 'symlink' : 'file',
          mtimeMs: stat.mtimeMs,
          rel: path.relative(root, full).split(path.sep).join('/'),
          size: stat.size
        });
      }
    }
  };
  walk(root);
  return files;
};

const exerciseFingerprinter = (fixture) => {
  fingerprintFixtureMode = true;
  for (const rel of ['src/assets', 'dist/assets/css', 'dist/assets/images', 'dist/assets/icons/bootstrap', 'dist/images', 'dist/js']) {
    fs.mkdirSync(path.join(fixture, rel), { recursive: true });
  }
  const picBytes = Buffer.from('picture bytes\n');
  const logoBytes = Buffer.from('<svg id="logo"/>\n');
  const appBytes = Buffer.from('globalThis.fixture = true;\n');
  const unusedBytes = Buffer.from('unused asset\n');
  const inactiveBytes = Buffer.from('inactive asset\n');
  const picHash = md5(picBytes);
  const logoHash = md5(logoBytes);
  const appHash = md5(appBytes);
  const unusedHash = md5(unusedBytes);
  const inactiveHash = md5(inactiveBytes);

  write(fixture, 'assets/images/pic.png', picBytes);
  write(fixture, 'assets/images/logo.svg', logoBytes);
  write(fixture, 'assets/images/picture.png', 'unmanaged canonical\n');
  write(fixture, 'assets/images/unused.png', unusedBytes);
  write(fixture, 'assets/images/inactive.png', inactiveBytes);
  write(fixture, 'assets/images/pic.aaaaaa.png', 'old managed sibling\n');
  write(fixture, 'assets/images/picture.bbbbbb.png', 'must survive clean\n');
  write(fixture, 'assets/images/orphan.cccccc.png', 'must survive clean\n');
  write(fixture, 'assets/icons/bootstrap/check.svg', '<svg id="pinned"/>\n');
  write(fixture, 'assets/icons/bootstrap/check.aaaaaa.svg', 'pinned family must survive\n');
  write(fixture, 'js/app.js', appBytes);

  const nestedSource = `.nested { background: url('../images/pic.png?v=1#nested'); }\n`;
  const nestedExpected = `.nested { background: url('/assets/images/pic.${picHash}.png?v=1#nested'); }\n`;
  const nestedHash = md5(Buffer.from(nestedExpected));
  const mainSource = [
    '@import "./nested.css?theme=1#top";',
    '@import url("/css/unused.css?legacy=1#sheet");',
    '.hero { background: url("../images/pic.png?v=1#hero"); }',
    ".brand { mask: url('/assets/images/logo.svg#mark'); }",
    '.pin { mask: url("../icons/bootstrap/check.svg#pin"); }',
    ''
  ].join('\n');
  const mainExpected = [
    `@import "/assets/css/nested.${nestedHash}.css?theme=1#top";`,
    '@import url("/css/unused.css?legacy=1#sheet");',
    `.hero { background: url("/assets/images/pic.${picHash}.png?v=1#hero"); }`,
    `.brand { mask: url('/assets/images/logo.${logoHash}.svg#mark'); }`,
    '.pin { mask: url("../icons/bootstrap/check.svg#pin"); }',
    ''
  ].join('\n');
  const mainHash = md5(Buffer.from(mainExpected));
  const rootCssSource = '.root-logo { background: url("./assets/images/logo.svg?root=1#logo"); }\n';
  const rootCssExpected = `.root-logo { background: url("/assets/images/logo.${logoHash}.svg?root=1#logo"); }\n`;
  const rootCssHash = md5(Buffer.from(rootCssExpected));

  write(fixture, 'assets/css/nested.css', nestedSource);
  write(fixture, 'assets/css/main.css', mainSource);
  write(fixture, 'assets/css/unused-allowed.css', '.unused { background: url("../images/unused.png"); }\n');
  write(fixture, 'sensei-sandy-logo-global.css', rootCssSource);
  write(fixture, 'css/unused.css', '.unused { background: url("../assets/images/unused.png"); }\n');
  write(fixture, 'assets/css/main.aaaaaa.css', 'old managed css sibling\n');
  write(fixture, 'assets/css/domain.aaaaaa.css', 'unmanaged css family\n');
  // Correct target names with stale bytes exercise overwrite, not just creation.
  write(fixture, `assets/images/pic.${picHash}.png`, 'stale target bytes\n');
  write(fixture, `assets/css/nested.${nestedHash}.css`, 'stale nested target\n');
  write(fixture, `assets/css/main.${mainHash}.css`, 'stale main target\n');

  const htmlSource = [
    '<!doctype html>',
    `<link rel="stylesheet" href='assets/css/main.css?theme=summer#top'>`,
    `<link rel='stylesheet' href="tokens.css?root=1#sheet">`,
    `<link rel="stylesheet" href="/css/unused.css?legacy=1#keep">`,
    `<img src="/assets/images/logo.svg?size=2#brand" alt="">`,
    `<script src='js/app.js?v=7#boot'></script>`,
    `<img src='/assets/icons/bootstrap/check.svg#pinned' alt="">`,
    `<!-- <img src="assets/images/inactive.png?comment=1#keep" alt=""> -->`,
    `<noscript><img src="assets/images/inactive.png?noscript=1#keep" alt=""></noscript>`,
    `<template><img src="assets/images/inactive.png?template=1#keep" alt=""></template>`,
    `<script>const ignored = "src='assets/images/inactive.png?script=1#keep'";</script>`,
    ''
  ].join('\n');
  write(fixture, 'index.html', htmlSource);
  const nestedHtmlSource = [
    '<!doctype html>',
    `<link rel='stylesheet' href="../assets/css/main.css?nested=1#sheet">`,
    `<script src="../js/app.js?nested=1#boot"></script>`,
    ''
  ].join('\n');
  write(fixture, 'pages/index.html', nestedHtmlSource);
  write(fixture, 'research/index.html', nestedHtmlSource);

  const excludedHtml = '<link rel="stylesheet" href="/assets/css/main.css?excluded=1#keep">' +
    '<link rel="stylesheet" href="/css/unused.css">\n';
  const excludedHtmlPaths = [
    '_archive/page.html',
    '_drafts/page.html',
    '.vscode/page.html',
    'archive/page.html',
    'retired/page.html',
    'scratch/page.html',
    'tmp/page.html',
    '_includes/deprecated/page.html',
    'section/retired/page.html',
    'section/_archive/page.html',
    'section/_drafts/page.html'
  ];
  for (const rel of excludedHtmlPaths) write(fixture, rel, excludedHtml);

  const beforeFailedCheck = snapshot(fixture);
  const failedCheck = runNode(fixture, FINGERPRINTER, ['--check'], 1);
  assert.match(failedCheck, /Stale target bytes/);
  assert.match(failedCheck, /Missing target/);
  assert.match(failedCheck, /HTML rewrite required: (?:dist\/)?index\.html/);
  assert.match(failedCheck, /Missing manifest/);
  assert.match(failedCheck, /Stale managed sibling/);
  assert.deepEqual(snapshot(fixture), beforeFailedCheck, '--check changed fixture state');

  const failedAdditiveCheck = runNode(fixture, FINGERPRINTER, ['--check-additive'], 1);
  assert.match(failedAdditiveCheck, /Stale target bytes/);
  assert.match(failedAdditiveCheck, /Missing target/);
  assert.match(failedAdditiveCheck, /HTML rewrite required: (?:dist\/)?index\.html/);
  assert.match(failedAdditiveCheck, /Missing manifest/);
  assert.doesNotMatch(failedAdditiveCheck, /Stale managed sibling/);
  assert.deepEqual(snapshot(fixture), beforeFailedCheck, '--check-additive changed fixture state');

  const incompatible = runNode(fixture, FINGERPRINTER, ['--check', '--clean'], 1);
  assert.match(incompatible, /cannot be used together/);
  assert.deepEqual(snapshot(fixture), beforeFailedCheck, 'incompatible flags changed fixture state');
  const unknown = runNode(fixture, FINGERPRINTER, ['--wat'], 1);
  assert.match(unknown, /Unknown argument/);
  assert.deepEqual(snapshot(fixture), beforeFailedCheck, 'unknown flag changed fixture state');

  const staleTargetInode = fs.statSync(path.join(fixture, fixtureRel(`assets/css/main.${mainHash}.css`))).ino;
  const staleHtmlInode = fs.statSync(path.join(fixture, fixtureRel('index.html'))).ino;
  write(fixture, 'assets/data/asset-hash-manifest.json', '{"stale":true}\n');
  const staleManifestInode = fs.statSync(path.join(fixture, fixtureRel('assets/data/asset-hash-manifest.json'))).ino;
  runNode(fixture, FINGERPRINTER);
  assert.ok(fs.statSync(path.join(fixture, fixtureRel(`assets/css/main.${mainHash}.css`))).ino);
  assert.notEqual(fs.statSync(path.join(fixture, fixtureRel('index.html'))).ino, staleHtmlInode);
  assert.notEqual(
    fs.statSync(path.join(fixture, fixtureRel('assets/data/asset-hash-manifest.json'))).ino,
    staleManifestInode
  );
  assert.equal(
    snapshot(fixture).some(({ rel }) => rel.includes('.fingerprint-tmp-')),
    false,
    'atomic staging file leaked into the fixture'
  );
  assert.equal(fixtureRead(fixture, 'assets/css/main.css'), mainSource, 'canonical main CSS changed');
  assert.equal(fixtureRead(fixture, 'assets/css/nested.css'), nestedSource, 'canonical nested CSS changed');
  assert.equal(fixtureRead(fixture, 'sensei-sandy-logo-global.css'), rootCssSource, 'canonical root CSS changed');
  assert.equal(fixtureRead(fixture, `assets/css/main.${mainHash}.css`), mainExpected);
  assert.equal(fixtureRead(fixture, `assets/css/nested.${nestedHash}.css`), nestedExpected);
  assert.equal(fixtureRead(fixture, `sensei-sandy-logo-global.${rootCssHash}.css`), rootCssExpected);
  assert.deepEqual(fs.readFileSync(path.join(fixture, fixtureRel(`assets/images/pic.${picHash}.png`))), picBytes);
  assert.equal(md5(fs.readFileSync(path.join(fixture, fixtureRel(`assets/css/main.${mainHash}.css`)))), mainHash);

  const htmlExpected = [
    '<!doctype html>',
    `<link rel="stylesheet" href='/assets/css/main.${mainHash}.css?theme=summer#top'>`,
    `<link rel='stylesheet' href="/tokens.${rootCssHash}.css?root=1#sheet">`,
    `<link rel="stylesheet" href="/css/unused.css?legacy=1#keep">`,
    `<img src="/assets/images/logo.${logoHash}.svg?size=2#brand" alt="">`,
    `<script src='/js/app.${appHash}.js?v=7#boot'></script>`,
    `<img src='/assets/icons/bootstrap/check.svg#pinned' alt="">`,
    `<!-- <img src="assets/images/inactive.png?comment=1#keep" alt=""> -->`,
    `<noscript><img src="assets/images/inactive.png?noscript=1#keep" alt=""></noscript>`,
    `<template><img src="assets/images/inactive.png?template=1#keep" alt=""></template>`,
    `<script>const ignored = "src='assets/images/inactive.png?script=1#keep'";</script>`,
    ''
  ].join('\n');
  assert.equal(read(fixture, 'index.html'), htmlExpected, 'HTML quote/suffix rewrite mismatch');
  const nestedHtmlExpected = [
    '<!doctype html>',
    `<link rel='stylesheet' href="/assets/css/main.${mainHash}.css?nested=1#sheet">`,
    `<script src="/js/app.${appHash}.js?nested=1#boot"></script>`,
    ''
  ].join('\n');
  assert.equal(read(fixture, 'pages/index.html'), nestedHtmlExpected, 'nested HTML rewrite mismatch');
  assert.equal(
    read(fixture, 'research/index.html'),
    nestedHtmlExpected,
    'public research HTML rewrite mismatch'
  );
  for (const rel of excludedHtmlPaths) {
    assert.equal(read(fixture, rel), excludedHtml, `excluded HTML changed: ${rel}`);
  }

  const manifestText = read(fixture, 'assets/data/asset-hash-manifest.json');
  const manifest = JSON.parse(manifestText);
  const manifestKeys = Object.keys(manifest.assets);
  assert.equal(manifest.generatedAt, undefined, 'manifest contains a nondeterministic timestamp');
  assert.deepEqual(manifestKeys, [
    '/js/app.js',
    '/assets/css/main.css',
    '/assets/css/nested.css',
    '/assets/images/logo.svg',
    '/assets/images/pic.png',
    '/tokens.css'
  ], 'manifest keys are not deterministic');
  assert.equal(manifest.assets['/assets/css/main.css'], `/assets/css/main.${mainHash}.css`);
  assert.equal(manifest.assets['/assets/css/nested.css'], `/assets/css/nested.${nestedHash}.css`);
  assert.equal(manifest.assets['/tokens.css'], `/tokens.${rootCssHash}.css`);
  assert.equal(manifest.assets['/assets/images/pic.png'], `/assets/images/pic.${picHash}.png`);
  assert.equal(manifest.assets['/assets/icons/bootstrap/check.svg'], undefined, 'pinned icon was managed');
  assert.equal(manifest.assets['/css/unused.css'], undefined, 'unused root css tree was managed');
  assert.equal(manifest.assets['/assets/images/unused.png'], undefined, 'excluded CSS leaf was managed');
  assert.equal(manifest.assets['/assets/css/unused-allowed.css'], undefined, 'unused allowed CSS was managed');
  assert.equal(manifest.assets['/assets/images/inactive.png'], undefined, 'inactive HTML asset was managed');
  assert.equal(fs.existsSync(path.join(fixture, `assets/images/unused.${unusedHash}.png`)), false);
  assert.equal(fs.existsSync(path.join(fixture, `assets/images/inactive.${inactiveHash}.png`)), false);

  const beforeAdditiveCheck = snapshot(fixture);
  const additiveCheck = runNode(fixture, FINGERPRINTER, ['--check-additive']);
  assert.match(additiveCheck, /additive check passed/);
  assert.match(additiveCheck, /retained 2 stale managed sibling\(s\)/);
  assert.deepEqual(snapshot(fixture), beforeAdditiveCheck, 'passing --check-additive changed fixture state');

  runNode(fixture, FINGERPRINTER, ['--clean']);
  assert.equal(fs.existsSync(path.join(fixture, fixtureRel('assets/images/pic.aaaaaa.png'))), false);
  assert.equal(fs.existsSync(path.join(fixture, fixtureRel('assets/css/main.aaaaaa.css'))), false);
  assert.equal(fs.existsSync(path.join(fixture, fixtureRel('assets/images/picture.bbbbbb.png'))), true);
  assert.equal(fs.existsSync(path.join(fixture, fixtureRel('assets/images/orphan.cccccc.png'))), true);
  assert.equal(fs.existsSync(path.join(fixture, fixtureRel('assets/css/domain.aaaaaa.css'))), true);
  assert.equal(fs.existsSync(path.join(fixture, fixtureRel('assets/icons/bootstrap/check.aaaaaa.svg'))), true);

  const stableSnapshot = snapshot(fixture);
  const stableManifest = read(fixture, 'assets/data/asset-hash-manifest.json');
  const secondClean = runNode(fixture, FINGERPRINTER, ['--clean']);
  assert.match(secondClean, /0 target file\(s\) written/);
  assert.match(secondClean, /HTML files rewritten: 0/);
  assert.match(secondClean, /Removed old hashed assets: 0/);
  assert.equal(read(fixture, 'assets/data/asset-hash-manifest.json'), stableManifest);
  assert.deepEqual(snapshot(fixture), stableSnapshot, 'identical clean run was not idempotent');

  const beforePassingCheck = snapshot(fixture);
  assert.match(runNode(fixture, FINGERPRINTER, ['--check']), /check passed/);
  assert.deepEqual(snapshot(fixture), beforePassingCheck, 'passing --check changed fixture state');
};

const assertFailureWithoutMutation = (fixture, args, pattern) => {
  const before = snapshot(fixture);
  const output = runNode(fixture, FINGERPRINTER, args, 1);
  assert.match(output, pattern);
  assert.deepEqual(snapshot(fixture), before, `failed ${args.join(' ')} run mutated the fixture`);
  return output;
};

const exerciseFailureAtomicityAndSymlinks = (tempRoot) => {
  const hashedOnly = path.join(tempRoot, 'hashed-only');
  write(hashedOnly, 'assets/images/only.abcdef.png', 'generated-only input\n');
  write(hashedOnly, 'index.html', '<img src="assets/images/only.abcdef.png" alt="">\n');
  assertFailureWithoutMutation(hashedOnly, [], /Hashed-only asset reference/);
  assert.equal(fs.existsSync(path.join(hashedOnly, 'assets/data/asset-hash-manifest.json')), false);

  const cycle = path.join(tempRoot, 'cycle');
  const cyclePic = Buffer.from('cycle picture\n');
  write(cycle, 'assets/images/pic.png', cyclePic);
  write(cycle, 'assets/css/a.css', [
    '@import "./b.css?from=a#cycle";',
    '.a { background: url("../images/pic.png"); }',
    ''
  ].join('\n'));
  write(cycle, 'assets/css/b.css', '@import "./a.css?from=b#cycle";\n');
  write(cycle, 'index.html', '<link rel="stylesheet" href="assets/css/a.css">\n');
  assertFailureWithoutMutation(cycle, [], /Circular CSS dependency/);
  assert.equal(fs.existsSync(path.join(cycle, `assets/images/pic.${md5(cyclePic)}.png`)), false);
  assert.equal(fs.existsSync(path.join(cycle, 'assets/data/asset-hash-manifest.json')), false);

  const freshness = path.join(tempRoot, 'html-freshness');
  const freshnessBytes = Buffer.from('freshness picture\n');
  const freshnessHtml = '<img src="assets/images/pic.png" alt="">\n';
  const concurrentHtml = '<p>concurrent edit</p>\n';
  write(freshness, 'assets/images/pic.png', freshnessBytes);
  write(freshness, 'index.html', freshnessHtml);
  const hookPath = path.join(freshness, '.freshness-hook.cjs');
  write(freshness, '.freshness-hook.cjs', [
    "const fs = require('fs');",
    "const path = require('path');",
    'const originalRead = fs.readFileSync.bind(fs);',
    'const originalWrite = fs.writeFileSync.bind(fs);',
    'const target = path.resolve(process.env.FRESHNESS_TARGET);',
    'let changed = false;',
    'fs.readFileSync = function patchedRead(file, ...args) {',
    '  const value = originalRead(file, ...args);',
    '  if (!changed && path.resolve(String(file)) === target) {',
    '    changed = true;',
    `    originalWrite(target, ${JSON.stringify(concurrentHtml)}, 'utf8');`,
    '  }',
    '  return value;',
    '};',
    ''
  ].join('\n'));
  const freshnessOutput = runNode(freshness, FINGERPRINTER, [], 1, {
    FRESHNESS_TARGET: path.join(freshness, 'index.html'),
    NODE_OPTIONS: `--require=${hookPath}`
  });
  assert.match(freshnessOutput, /Active HTML changed after preflight/);
  assert.equal(read(freshness, 'index.html'), concurrentHtml);
  assert.equal(fs.existsSync(path.join(freshness, `assets/images/pic.${md5(freshnessBytes)}.png`)), false);
  assert.equal(fs.existsSync(path.join(freshness, 'assets/data/asset-hash-manifest.json')), false);

  const sourceFreshness = path.join(tempRoot, 'source-freshness');
  const sourceFreshnessCss = '.fresh { background: url("../images/pic.png"); }\n';
  const concurrentCss = '.fresh { color: red; }\n';
  const sourceFreshnessPic = Buffer.from('source freshness picture\n');
  const concurrentPic = 'concurrent picture edit\n';
  write(sourceFreshness, 'assets/css/main.css', sourceFreshnessCss);
  write(sourceFreshness, 'assets/images/pic.png', sourceFreshnessPic);
  write(sourceFreshness, 'index.html', '<link rel="stylesheet" href="assets/css/main.css">\n');
  const sourceHookPath = path.join(sourceFreshness, '.source-freshness-hook.cjs');
  write(sourceFreshness, '.source-freshness-hook.cjs', [
    "const fs = require('fs');",
    "const path = require('path');",
    'const originalRead = fs.readFileSync.bind(fs);',
    'const originalWrite = fs.writeFileSync.bind(fs);',
    'const replacements = new Map(Object.entries(JSON.parse(process.env.SOURCE_FRESHNESS_REPLACEMENTS)));',
    'const changed = new Set();',
    'fs.readFileSync = function patchedRead(file, ...args) {',
    '  const value = originalRead(file, ...args);',
    '  const resolved = path.resolve(String(file));',
    '  if (replacements.has(resolved) && !changed.has(resolved)) {',
    '    changed.add(resolved);',
    "    originalWrite(resolved, replacements.get(resolved), 'utf8');",
    '  }',
    '  return value;',
    '};',
    ''
  ].join('\n'));
  const sourceFreshnessOutput = runNode(sourceFreshness, FINGERPRINTER, [], 1, {
    NODE_OPTIONS: `--require=${sourceHookPath}`,
    SOURCE_FRESHNESS_REPLACEMENTS: JSON.stringify({
      [path.join(sourceFreshness, 'assets/css/main.css')]: concurrentCss,
      [path.join(sourceFreshness, 'assets/images/pic.png')]: concurrentPic
    })
  });
  assert.match(sourceFreshnessOutput, /Canonical source changed after preflight/);
  assert.equal(read(sourceFreshness, 'assets/css/main.css'), concurrentCss);
  assert.equal(read(sourceFreshness, 'assets/images/pic.png'), concurrentPic);
  assert.equal(
    fs.readdirSync(path.join(sourceFreshness, 'assets/css')).some((name) => /\.[0-9a-f]{6}\.css$/.test(name)),
    false
  );
  assert.equal(
    fs.readdirSync(path.join(sourceFreshness, 'assets/images')).some((name) => /\.[0-9a-f]{6}\.png$/.test(name)),
    false
  );
  assert.equal(fs.existsSync(path.join(sourceFreshness, 'assets/data/asset-hash-manifest.json')), false);

  const tempCollision = path.join(tempRoot, 'temp-collision');
  const collisionBytes = Buffer.from('collision picture\n');
  write(tempCollision, 'assets/images/pic.png', collisionBytes);
  write(tempCollision, 'index.html', '<img src="assets/images/pic.png" alt="">\n');
  const collisionHookPath = path.join(tempCollision, '.temp-collision-hook.cjs');
  write(tempCollision, '.temp-collision-hook.cjs', [
    "const fs = require('fs');",
    "const path = require('path');",
    'const originalOpen = fs.openSync.bind(fs);',
    'const originalWrite = fs.writeSync.bind(fs);',
    'const originalClose = fs.closeSync.bind(fs);',
    'let collided = false;',
    'fs.openSync = function patchedOpen(file, flags, mode) {',
    "  if (!collided && flags === 'wx' && path.basename(String(file)).includes('.fingerprint-tmp-')) {",
    '    collided = true;',
    "    const descriptor = originalOpen(file, 'wx', 0o600);",
    "    originalWrite(descriptor, Buffer.from('pre-existing collision\\n'));",
    '    originalClose(descriptor);',
    '  }',
    '  return originalOpen(file, flags, mode);',
    '};',
    ''
  ].join('\n'));
  const collisionOutput = runNode(tempCollision, FINGERPRINTER, [], 1, {
    NODE_OPTIONS: `--require=${collisionHookPath}`
  });
  assert.match(collisionOutput, /EEXIST/);
  const collisionFiles = fs.readdirSync(path.join(tempCollision, 'assets/images'))
    .filter((name) => name.includes('.fingerprint-tmp-'));
  assert.equal(collisionFiles.length, 1, 'pre-existing staging collision was removed');
  assert.equal(read(tempCollision, `assets/images/${collisionFiles[0]}`), 'pre-existing collision\n');
  assert.equal(fs.existsSync(path.join(tempCollision, `assets/images/pic.${md5(collisionBytes)}.png`)), false);
  assert.equal(read(tempCollision, 'index.html'), '<img src="assets/images/pic.png" alt="">\n');
  assert.equal(fs.existsSync(path.join(tempCollision, 'assets/data/asset-hash-manifest.json')), false);

  const sourceLink = path.join(tempRoot, 'source-link');
  const outsideSource = path.join(tempRoot, 'outside-source.png');
  write(tempRoot, 'outside-source.png', 'outside source\n');
  fs.mkdirSync(path.join(sourceLink, 'assets/images'), { recursive: true });
  fs.symlinkSync(outsideSource, path.join(sourceLink, 'assets/images/link.png'));
  write(sourceLink, 'index.html', '<img src="assets/images/link.png" alt="">\n');
  assertFailureWithoutMutation(sourceLink, [], /symlink/);

  const parentLink = path.join(tempRoot, 'parent-link');
  const outsideParent = path.join(tempRoot, 'outside-parent');
  write(outsideParent, 'pic.png', 'outside parent source\n');
  fs.mkdirSync(path.join(parentLink, 'assets'), { recursive: true });
  fs.symlinkSync(outsideParent, path.join(parentLink, 'assets/images'));
  write(parentLink, 'index.html', '<img src="assets/images/pic.png" alt="">\n');
  assertFailureWithoutMutation(parentLink, [], /symlink/);

  const missingParentLink = path.join(tempRoot, 'missing-parent-link');
  const outsideMissingParent = path.join(tempRoot, 'outside-missing-parent');
  fs.mkdirSync(outsideMissingParent, { recursive: true });
  fs.mkdirSync(path.join(missingParentLink, 'assets'), { recursive: true });
  fs.symlinkSync(outsideMissingParent, path.join(missingParentLink, 'assets/images'));
  write(missingParentLink, 'index.html', '<img src="assets/images/missing.png" alt="">\n');
  assertFailureWithoutMutation(missingParentLink, [], /symlink/);

  const targetLink = path.join(tempRoot, 'target-link');
  const targetBytes = Buffer.from('target source\n');
  write(targetLink, 'assets/images/pic.png', targetBytes);
  write(targetLink, 'index.html', '<img src="assets/images/pic.png" alt="">\n');
  const outsideTarget = path.join(tempRoot, 'outside-target.png');
  write(tempRoot, 'outside-target.png', 'outside target sentinel\n');
  fs.symlinkSync(outsideTarget, path.join(targetLink, `assets/images/pic.${md5(targetBytes)}.png`));
  assertFailureWithoutMutation(targetLink, [], /Fingerprint target is a symlink/);
  assert.equal(fs.readFileSync(outsideTarget, 'utf8'), 'outside target sentinel\n');

  const manifestParentLink = path.join(tempRoot, 'manifest-parent-link');
  const manifestBytes = Buffer.from('manifest source\n');
  write(manifestParentLink, 'assets/images/pic.png', manifestBytes);
  write(manifestParentLink, 'index.html', '<img src="assets/images/pic.png" alt="">\n');
  const outsideData = path.join(tempRoot, 'outside-data');
  fs.mkdirSync(outsideData, { recursive: true });
  fs.symlinkSync(outsideData, path.join(manifestParentLink, 'assets/data'));
  assertFailureWithoutMutation(manifestParentLink, [], /Asset manifest uses a symlinked parent/);
  assert.equal(fs.existsSync(path.join(manifestParentLink, `assets/images/pic.${md5(manifestBytes)}.png`)), false);

  const cleanupLink = path.join(tempRoot, 'cleanup-link');
  const cleanupBytes = Buffer.from('cleanup source\n');
  write(cleanupLink, 'assets/images/pic.png', cleanupBytes);
  write(cleanupLink, 'index.html', '<img src="assets/images/pic.png" alt="">\n');
  runNode(cleanupLink, FINGERPRINTER);
  const outsideCleanup = path.join(tempRoot, 'outside-cleanup.png');
  write(tempRoot, 'outside-cleanup.png', 'outside cleanup sentinel\n');
  fs.symlinkSync(outsideCleanup, path.join(cleanupLink, 'assets/images/pic.aaaaaa.png'));
  assertFailureWithoutMutation(cleanupLink, ['--clean'], /Managed fingerprint sibling is a symlink/);
  assert.equal(fs.readFileSync(outsideCleanup, 'utf8'), 'outside cleanup sentinel\n');
};

const copyQaRuntime = (qaFixture) => {
  const copies = [
    ['scripts/qa-css-assets.mjs', 'scripts/qa-css-assets.mjs'],
    ['scripts/url-qa-lib.mjs', 'scripts/url-qa-lib.mjs'],
    ['scripts/lib/sitemap-utils.mjs', 'scripts/lib/sitemap-utils.mjs'],
    ['tools/vendor/bootstrap-5.3.3.min.css', 'tools/vendor/bootstrap-5.3.3.min.css']
  ];
  for (const [source, target] of copies) {
    write(qaFixture, target, fs.readFileSync(path.join(ROOT, source)));
  }
};

const writeQaManifestAndHtml = (qaFixture, targetHash, extraAssets = {}) => {
  write(qaFixture, 'assets/data/asset-hash-manifest.json', `${JSON.stringify({ assets: {
    '/assets/css/main.css': `/assets/css/main.${targetHash}.css`,
    ...extraAssets
  } }, null, 2)}\n`);
  write(qaFixture, 'index.html', `<link rel="stylesheet" href="/assets/css/main.${targetHash}.css">\n`);
};

const exerciseCssQa = (qaFixture) => {
  copyQaRuntime(qaFixture);
  write(qaFixture, 'config/url-contract.json', `${JSON.stringify({ canonicalOrigin: 'https://fixture.test' })}\n`);
  fs.mkdirSync(path.join(qaFixture, 'assets/icons/bootstrap'), { recursive: true });
  write(qaFixture, 'sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url><loc>https://fixture.test/</loc></url>',
    '</urlset>',
    ''
  ].join('\n'));

  const qaPic = Buffer.from('qa picture\n');
  const qaPicHash = md5(qaPic);
  write(qaFixture, 'assets/images/pic.png', qaPic);
  write(qaFixture, `assets/images/pic.${qaPicHash}.png`, qaPic);
  const childCss = '.child{color:green}\n';
  const childHash = md5(Buffer.from(childCss));
  write(qaFixture, 'assets/css/child.css', childCss);
  write(qaFixture, `assets/css/child.${childHash}.css`, childCss);
  const sourceCss = [
    '@import "./child.css?theme=1#child";',
    'body{background:url( "../images/pic.png?v=1#hero" )}',
    ''
  ].join('\n');
  const targetCss = [
    `@import "./child.${childHash}.css?theme=1#child";`,
    `body{background:url( "../images/pic.${qaPicHash}.png?v=1#hero" )}`,
    ''
  ].join('\n');
  const targetHash = md5(Buffer.from(targetCss));
  write(qaFixture, 'assets/css/main.css', sourceCss);
  write(qaFixture, `assets/css/main.${targetHash}.css`, targetCss);
  writeQaManifestAndHtml(qaFixture, targetHash, {
    '/assets/css/child.css': `/assets/css/child.${childHash}.css`,
    '/assets/images/pic.png': `/assets/images/pic.${qaPicHash}.png`
  });
  const inactiveStyleBait = Array.from({ length: 1200 }, (_, index) => {
    const token = crypto.createHash('sha256').update(`inactive-style-${index}`).digest('hex');
    return `.inactive-${index.toString(36)}{--fixture:${token}}`;
  }).join('');
  assert.ok(gzipSync(Buffer.from(inactiveStyleBait)).length > 1024, 'inline-style bait is below the QA budget');
  write(qaFixture, 'index.html', [
    `<link rel="stylesheet" href="/assets/css/main.${targetHash}.css">`,
    `<!-- <link rel="stylesheet" href="/assets/css/comment-missing.css"><i class="bi-comment-ghost"></i><style>${inactiveStyleBait}</style> -->`,
    `<noscript><link rel="stylesheet" href="/assets/css/noscript-missing.css"><i class="bi-noscript-ghost"></i><style>${inactiveStyleBait}</style></noscript>`,
    `<template><link rel="stylesheet" href="/assets/css/template-missing.css"><i class="bi-template-ghost"></i><style>${inactiveStyleBait}</style></template>`,
    `<script class="bi-script-tag-ghost">const html = '<link rel="stylesheet" href="/assets/css/script-missing.css"><i class="bi-script-body-ghost"></i><style>${inactiveStyleBait}</style>';</script>`,
    ''
  ].join('\n'));
  const qaScript = path.join(qaFixture, 'scripts/qa-css-assets.mjs');
  assert.match(runNode(qaFixture, qaScript, ['--no-budget', '--top=1']), /qa-css-assets passed/);
  assert.match(runNode(qaFixture, qaScript, ['--budget-kb=1', '--top=1']), /qa-css-assets passed/);

  const hashDriftLeaf = Buffer.from('leaf hash drift\n');
  write(qaFixture, 'assets/js/hash-drift.js', hashDriftLeaf);
  write(qaFixture, 'assets/js/hash-drift.000000.js', hashDriftLeaf);
  const contentSourceLeaf = Buffer.from('canonical leaf\n');
  const contentTargetLeaf = Buffer.from('changed leaf\n');
  const contentTargetHash = md5(contentTargetLeaf);
  write(qaFixture, 'assets/images/content.png', contentSourceLeaf);
  write(qaFixture, `assets/images/content.${contentTargetHash}.png`, contentTargetLeaf);
  write(qaFixture, 'assets/js/family.js', 'family source\n');
  writeQaManifestAndHtml(qaFixture, targetHash, {
    '/assets/css/child.css': `/assets/css/child.${childHash}.css`,
    '/assets/images/pic.png': `/assets/images/pic.${qaPicHash}.png`,
    '/assets/js/hash-drift.js': '/assets/js/hash-drift.000000.js',
    '/assets/images/content.png': `/assets/images/content.${contentTargetHash}.png`,
    '/assets/images/missing.png': '/assets/images/missing.abcdef.png',
    '/assets/js/family.js': '/assets/elsewhere/family.abcdef.js'
  });
  const leafManifestFailure = runNode(qaFixture, qaScript, ['--no-budget', '--top=1'], 1);
  assert.match(leafManifestFailure, /manifest_asset_family_mismatch/);
  assert.match(leafManifestFailure, /manifest_file_missing/);
  assert.match(leafManifestFailure, /manifest_hash_drift/);
  assert.match(leafManifestFailure, /manifest_content_drift/);

  const missingTargetCss = 'body{background:url("../images/missing.123456.png?x#y")}\n';
  const missingTargetHash = md5(Buffer.from(missingTargetCss));
  write(qaFixture, `assets/css/main.${missingTargetHash}.css`, missingTargetCss);
  writeQaManifestAndHtml(qaFixture, missingTargetHash, {
    '/assets/images/pic.png': `/assets/images/pic.${qaPicHash}.png`
  });
  assert.match(
    runNode(qaFixture, qaScript, ['--no-budget', '--top=1'], 1),
    /manifest_css_local_url_missing/
  );

  const arbitraryDriftTarget = [
    `@import "./child.${childHash}.css?theme=1#child";`,
    `body{background:url( "../images/pic.${qaPicHash}.png?v=1#hero" );color:blue}`,
    ''
  ].join('\n');
  const arbitraryDriftHash = md5(Buffer.from(arbitraryDriftTarget));
  write(qaFixture, 'assets/css/main.css', sourceCss);
  write(qaFixture, `assets/css/main.${arbitraryDriftHash}.css`, arbitraryDriftTarget);
  writeQaManifestAndHtml(qaFixture, arbitraryDriftHash, {
    '/assets/css/child.css': `/assets/css/child.${childHash}.css`,
    '/assets/images/pic.png': `/assets/images/pic.${qaPicHash}.png`
  });
  assert.match(
    runNode(qaFixture, qaScript, ['--no-budget', '--top=1'], 1),
    /manifest_content_drift/
  );

  const noTransformSource = 'body{color:red}\n';
  const noTransformTarget = 'body{color:blue}\n';
  const noTransformHash = md5(Buffer.from(noTransformTarget));
  write(qaFixture, 'assets/css/main.css', noTransformSource);
  write(qaFixture, `assets/css/main.${noTransformHash}.css`, noTransformTarget);
  writeQaManifestAndHtml(qaFixture, noTransformHash);
  assert.match(
    runNode(qaFixture, qaScript, ['--no-budget', '--top=1'], 1),
    /manifest_content_drift/
  );

  const escapingCss = 'body{background:url("..%2f..%2f..%2foutside.png?x#y")}\n';
  const escapingHash = md5(Buffer.from(escapingCss));
  write(qaFixture, 'assets/css/main.css', escapingCss);
  write(qaFixture, `assets/css/main.${escapingHash}.css`, escapingCss);
  writeQaManifestAndHtml(qaFixture, escapingHash);
  assert.match(
    runNode(qaFixture, qaScript, ['--no-budget', '--top=1'], 1),
    /manifest_css_local_url_missing/
  );

  // A sitemapped route symlink must not be followed outside the QA root.
  const outsideRoute = path.join(path.dirname(qaFixture), 'outside-route.html');
  fs.writeFileSync(outsideRoute, '<p>outside route</p>\n');
  fs.symlinkSync(outsideRoute, path.join(qaFixture, 'escape.html'));
  write(qaFixture, 'sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <url><loc>https://fixture.test/</loc></url>',
    '  <url><loc>https://fixture.test/escape.html</loc></url>',
    '</urlset>',
    ''
  ].join('\n'));
  assert.match(
    runNode(qaFixture, qaScript, ['--no-budget', '--top=1'], 1),
    /sitemap_html_missing/
  );
};

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-fingerprint-assets-'));
try {
  exerciseFingerprinter(path.join(tempRoot, 'fingerprinter'));
  exerciseFailureAtomicityAndSymlinks(tempRoot);
  exerciseCssQa(path.join(tempRoot, 'css-qa'));
  console.log('qa-fingerprint-assets passed.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
