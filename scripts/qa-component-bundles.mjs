import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  BUNDLES,
  buildBundleCss,
  filterCss,
} from '../tools/build-component-bundles.mjs';
import {
  CSS_BUNDLE_REGISTRY,
  resolveWorkspacePath,
  validateCssBundleRegistry,
} from '../tools/css-bundle-registry.mjs';
import { minifyCss } from '../tools/minify-css.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const fixture = [
  '/* page token in a comment: .page-home */',
  '.shared { order: 1; content: "} ; {"; }',
  '.page-home .home-only { order: 2; }',
  '.page-other .other-only { order: 3; }',
  '.page-home .home-or-contact, .page-contact .home-or-contact { order: 4; }',
  '.page-home .mixed, .shared-mixed { order: 5; }',
  '[data-label=", .page-home"] .attribute-only { order: 6; }',
  '/* .page-home */ .comment-only { order: 7; }',
  '\\.page-home .escaped-dot { order: 8; }',
  '.\\70 age-home .escaped-home { order: 9; }',
  '.ss-page-feed .feed-only { order: 10; }',
  ':is(.page-home, .inside-functional-comma) .functional { order: 11; }',
  ':where(.page-home, .page-contact) .functional-scoped { order: 11.1; }',
  'body:not(.page-home):not(.page-contact) .negative-page-guards { order: 11.2; }',
  '@media (min-width: 1px) {',
  '  @supports (display: grid) {',
  '    @container card (min-width: 1px) {',
  '      @layer components {',
  '        .page-home .nested-home { order: 12; }',
  '      }',
  '    }',
  '  }',
  '}',
  '@media print {',
  '  @supports (display: block) {',
  '    /* an otherwise empty wrapper */',
  '    .page-other .empty-shell { order: 13; }',
  '  }',
  '}',
  '@media speech { .shared-in-media { order: 14; } }',
  '@media tty { ; /* empty statements */ ; }',
  '@layer reset, components;',
  '@keyframes page-home-pulse { from { opacity: 0; } to { opacity: 1; } }',
  '@font-face { font-family: "page-home-{font}"; src: url("data:font/x,{}"); }',
  '@property --page-home-size { syntax: "<length>"; initial-value: 1px; inherits: false; }',
  '@scope (.scope-root) { .page-other .inside-special { order: 15; } }',
  '',
].join('\n');

const fixturePageTokens = ['page-home', 'page-other', 'page-contact'];
const core = filterCss(fixture, [], fixturePageTokens);
const home = filterCss(fixture, ['page-home'], fixturePageTokens);
const other = filterCss(fixture, ['page-other'], fixturePageTokens);
const contact = filterCss(fixture, ['page-contact'], fixturePageTokens);

assert.match(core, /\.shared \{ order: 1;/);
assert.match(core, /\.shared-mixed \{ order: 5;/);
assert.match(core, /attribute-only \{ order: 6;/);
assert.match(core, /comment-only \{ order: 7;/);
assert.match(core, /escaped-dot \{ order: 8;/);
assert.doesNotMatch(core, /home-only \{ order: 2;/);
assert.doesNotMatch(core, /other-only \{ order: 3;/);
assert.doesNotMatch(core, /home-or-contact[^}]+order: 4;/);
assert.doesNotMatch(core, /escaped-home \{ order: 9;/);
assert.match(core, /feed-only \{ order: 10;/);
assert.match(core, /functional \{ order: 11;/);
assert.doesNotMatch(core, /functional-scoped \{ order: 11\.1;/);
assert.match(core, /negative-page-guards \{ order: 11\.2;/);
assert.doesNotMatch(core, /nested-home \{ order: 12;/);
assert.doesNotMatch(core, /empty-shell \{ order: 13;/);
assert.doesNotMatch(core, /@media print/);
assert.match(core, /@media speech \{ \.shared-in-media \{ order: 14;/);
assert.doesNotMatch(core, /@media tty/);
assert.match(core, /@layer reset, components;/);
assert.match(core, /@keyframes page-home-pulse/);
assert.match(core, /@font-face/);
assert.match(core, /@property --page-home-size/);
assert.match(core, /inside-special \{ order: 15;/);

assert.match(home, /home-only \{ order: 2;/);
assert.match(home, /home-or-contact[^}]+order: 4;/);
assert.match(home, /escaped-home \{ order: 9;/);
assert.match(home, /functional \{ order: 11;/);
assert.match(home, /functional-scoped \{ order: 11\.1;/);
assert.match(home, /negative-page-guards \{ order: 11\.2;/);
assert.match(home, /nested-home \{ order: 12;/);
assert.match(home, /@media \(min-width: 1px\)/);
assert.doesNotMatch(home, /other-only \{ order: 3;/);

assert.match(other, /other-only \{ order: 3;/);
assert.doesNotMatch(other, /home-or-contact[^}]+order: 4;/);
assert.match(other, /empty-shell \{ order: 13;/);
assert.match(other, /@media print/);
assert.doesNotMatch(other, /home-only \{ order: 2;/);
assert.match(other, /functional \{ order: 11;/);
assert.doesNotMatch(other, /functional-scoped \{ order: 11\.1;/);
assert.match(other, /negative-page-guards \{ order: 11\.2;/);
assert.match(contact, /home-or-contact[^}]+order: 4;/);
assert.match(contact, /functional-scoped \{ order: 11\.1;/);

assert.ok(core.indexOf('order: 1') < core.indexOf('order: 5'));
assert.ok(core.indexOf('order: 5') < core.indexOf('order: 6'));

const generatedA = buildBundleCss(fixture, { name: 'home', pageTokens: ['page-home'] });
const generatedB = buildBundleCss(fixture, { name: 'home', pageTokens: ['page-home'] });
assert.equal(generatedA, generatedB);
assert.match(generatedA, /^\/\* Generated by tools\/build-component-bundles\.mjs/);
assert.throws(() => filterCss('.broken { color: red;'), /Unclosed "\{"/);
assert.throws(() => filterCss('.broken:not(.page-home { color: red; }'), /Unclosed "\("/);
assert.equal(
  minifyCss('.quoted { content: "/* keep */"; note: \'escaped \\\' /* keep too */\'; /* drop */ }'),
  '.quoted { content: "/* keep */"; note: \'escaped \\\' /* keep too */\'; }'
);
assert.equal(
  minifyCss('@media (max-width: 40rem) { @supports (display: grid) { .x { display: grid; } } }'),
  '@media (max-width: 40rem) { @supports (display: grid) { .x { display: grid; } } }'
);
assert.equal(
  minifyCss('.scope :is(.a, .b) .child, .scope [data-state="open"] { color: red; }'),
  '.scope :is(.a, .b) .child, .scope [data-state="open"] { color: red; }'
);

const productionSource = await fs.readFile(path.join(ROOT, 'assets/css/components.css'), 'utf8');
for (const bundle of BUNDLES) {
  const expected = buildBundleCss(productionSource, bundle);
  const outputPath = resolveWorkspacePath(bundle.canonicalPath);
  const minifiedPath = resolveWorkspacePath(bundle.minifiedPath);
  assert.equal(await fs.readFile(outputPath, 'utf8'), expected);
  assert.equal(await fs.readFile(minifiedPath, 'utf8'), minifyCss(expected));
  assert.equal(bundle.manifestKey, `/${bundle.minifiedPath}`);
  assert.equal(filterCss(expected, bundle.pageTokens), expected);
}

const escapedCanonical = JSON.parse(JSON.stringify(CSS_BUNDLE_REGISTRY));
escapedCanonical.bundles[0].canonicalPath = 'assets/css/bundles/../escaped.css';
assert.throws(
  () => validateCssBundleRegistry(escapedCanonical, 'escaped canonical fixture'),
  /normalized workspace-relative path|directly inside assets\/css\/bundles/
);

const escapedMinified = JSON.parse(JSON.stringify(CSS_BUNDLE_REGISTRY));
escapedMinified.bundles[0].minifiedPath = 'assets/css/escaped.min.css';
escapedMinified.bundles[0].manifestKey = '/assets/css/escaped.min.css';
assert.throws(
  () => validateCssBundleRegistry(escapedMinified, 'escaped minified fixture'),
  /directly inside assets\/css\/bundles/
);

const driftedCanonical = JSON.parse(JSON.stringify(CSS_BUNDLE_REGISTRY));
driftedCanonical.bundles[0].canonicalPath = 'assets/css/bundles/components-renamed.css';
assert.throws(
  () => validateCssBundleRegistry(driftedCanonical, 'drifted canonical fixture'),
  /canonicalPath must be assets\/css\/bundles\/components-core\.css/
);

const driftedSource = JSON.parse(JSON.stringify(CSS_BUNDLE_REGISTRY));
driftedSource.sourcePath = 'assets/css/other-components.css';
assert.throws(
  () => validateCssBundleRegistry(driftedSource, 'drifted source fixture'),
  /sourcePath must be assets\/css\/components\.css/
);

console.log(
  `Component bundle QA passed (${BUNDLES.length} deterministic canonical/minified bundles).`
);
