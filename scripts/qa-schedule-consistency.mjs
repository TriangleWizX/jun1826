import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

const assert = (condition, message) => {
  if (!condition) errors.push(message);
};

const read = (relPath) => fs.readFile(path.join(ROOT, relPath), 'utf8');
const SHARED_BLOCK = 'partials/schedule-consistency.html';

const hasSharedBlock = (html) =>
  html.includes('<!--#include virtual="/partials/schedule-consistency.html" -->');

const hasWeeklySummary = (html) =>
  /Wednesday (?:runs )?No-Gi|Wednesday No-Gi/i.test(html) &&
  /Saturday (?:runs )?No-Gi/i.test(html);

const hasStaleSplit = (html) =>
  /Kids 4:00 PM|Teens 5:00 PM|Start with the 4:00 PM class lane|Start with the 5:00 PM class lane/i.test(html);

const checkFile = async (relPath) => {
  const html = await read(relPath);
  assert(hasSharedBlock(html), `${relPath}: missing shared schedule consistency include.`);
  assert(!hasStaleSplit(html), `${relPath}: stale kids/teens timing split still present.`);
};

const run = async () => {
  const sharedBlockHtml = await read(SHARED_BLOCK);
  assert(hasWeeklySummary(sharedBlockHtml), `${SHARED_BLOCK}: missing Wednesday/Saturday schedule summary language.`);

  const blogDir = path.join(ROOT, 'blog');
  const blogEntries = await fs.readdir(blogDir, { withFileTypes: true });
  const blogPages = ['blog/index.html'];

  for (const entry of blogEntries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join('blog', entry.name, 'index.html');
    try {
      await fs.access(path.join(ROOT, candidate));
      blogPages.push(candidate);
    } catch {}
  }

  const nearDir = path.join(ROOT, 'near');
  const nearEntries = await fs.readdir(nearDir, { withFileTypes: true });
  const nearPages = ['nearby-towns.html'];

  for (const entry of nearEntries) {
    if (!entry.isDirectory()) continue;
    const candidate = path.join('near', entry.name, 'index.html');
    try {
      await fs.access(path.join(ROOT, candidate));
      nearPages.push(candidate);
    } catch {}
  }

  await Promise.all([...blogPages, ...nearPages].map(checkFile));

  if (errors.length) {
    for (const error of errors) console.error(`SCHEDULE QA FAIL: ${error}`);
    process.exit(1);
  }

  console.log('Schedule consistency QA passed.');
};

run().catch((error) => {
  console.error(`SCHEDULE QA FAIL: ${error.message}`);
  process.exit(1);
});
