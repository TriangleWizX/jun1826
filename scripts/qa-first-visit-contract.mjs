import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const contract = JSON.parse(fs.readFileSync(path.join(root, 'src/_data/free-intro.json'), 'utf8'));
const failures = [];

function read(rel) {
  const candidates = [
    path.join(root, rel),
    path.join(root, 'src', 'partials', rel),
    path.join(dist, rel),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return fs.readFileSync(c, 'utf8');
  }
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

if (contract.generalPath?.firstStep !== '15-minute Goal Mapping visit') failures.push('general first step is not the 15-minute Goal Mapping visit');
if (contract.generalPath?.workoutRequired !== false) failures.push('general path allows a workout during Goal Mapping');
if (contract.generalPath?.normalClothes !== true) failures.push('general path does not require normal clothes');
if (contract.generalPath?.classSameVisit !== false) failures.push('general path combines class during the same visit');
if (!/schedules the coached first class afterward/i.test(contract.generalPath?.nextStep || '')) failures.push('general path does not schedule the coached first class afterward');
if (contract.youthCombinedPath?.classSameVisit !== true) failures.push('specialized youth path is not separately modeled');

const nav = read('nav-include.html');
for (const stale of ['Plan Your First Class', 'Continue to Schedule']) {
  if (nav.includes(stale)) failures.push(`stale modal phrase: ${stale}`);
}
if (!nav.includes('Plan Your First Visit')) failures.push('shared modal heading is missing');
if (!nav.includes('Thanks. Sandy will text or call to help choose your next step.')) failures.push('lead-only thank-you state is missing');

const candidates = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith('.html')) candidates.push(file);
  }
}
walk(dist);
let railCount = 0;
let includeCount = 0;
for (const file of candidates) {
  const html = fs.readFileSync(file, 'utf8');
  includeCount += (html.match(/<!--#include virtual="\/partials\/acquisition-editorial-rail\.html" -->/g) || []).length;
  const rails = html.match(/<aside[^>]*class="ss-article-rail"[\s\S]*?<\/aside>/gi) || [];
  for (const rail of rails) {
    railCount += 1;
    if (/Plan Your First Class|Free First Visit Class|Free First Visit Small-group class|learn the basics with calm instruction|href="\/student-hub"/i.test(rail)) {
      failures.push(`stale acquisition rail: ${path.relative(dist, file)}`);
    }
    for (const required of ['/how-class-works', '/schedule', '/show-up-kit', '/bjj-faqs', '/free-bjj-intro-tannersville-ny#booking-flow']) {
      if (!rail.includes(required)) failures.push(`missing ${required} in acquisition rail: ${path.relative(dist, file)}`);
    }
  }
}
const partial = fs.readFileSync(path.join(dist, 'partials/acquisition-editorial-rail.html'), 'utf8');
for (const required of ['Thinking about starting?', 'Free First Visit', 'How Class Works', '/schedule', '/show-up-kit', '/bjj-faqs', '/free-bjj-intro-tannersville-ny#booking-flow']) {
  if (!partial.includes(required)) failures.push(`shared acquisition partial missing ${required}`);
}
if (includeCount < 30) failures.push(`expected propagated acquisition includes, found ${includeCount}`);

const navDist = fs.readFileSync(path.join(dist, 'nav-include.html'), 'utf8');
if (navDist.includes('Plan Your First Class') || navDist.includes('Continue to Schedule')) failures.push('generated nav still contains stale modal copy');
if (!navDist.includes('Plan Your First Visit')) failures.push('generated nav missing normalized modal copy');

const protectedPaths = {
  'programs.html': ['Free First Visit', 'coached first class'],
  'how-class-works.html': ['Free First Visit', 'first class'],
  'bjj-classes/adults-tannersville-ny/index.html': ['Free First Visit'],
  'free-bjj-intro-tannersville-ny/index.html': ['Free First Visit', 'no workout is required']
};
for (const [rel, required] of Object.entries(protectedPaths)) {
  const html = fs.readFileSync(path.join(dist, rel), 'utf8');
  for (const phrase of required) if (!html.toLowerCase().includes(phrase.toLowerCase())) failures.push(`${rel} missing protected phrase: ${phrase}`);
}
for (const [rel, lane] of [['bjj-classes/kids-tannersville-ny/index.html', 'lane=kids'], ['bjj-classes/teens-tannersville-ny/index.html', 'lane=teens']]) {
  const html = fs.readFileSync(path.join(dist, rel), 'utf8');
  if (!html.includes(`/free-bjj-intro-tannersville-ny?${lane}`)) failures.push(`${rel} does not route to its specialized ${lane} intro flow`);
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`First-Visit Contract QA passed (${includeCount} propagated acquisition includes; shared partial checked).`);
