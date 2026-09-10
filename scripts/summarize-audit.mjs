import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './url-qa-lib.mjs';

async function summarize() {
  const rawBrowser = await fs.readFile(path.join(ROOT, 'ui-audit-findings.json'), 'utf8');
  const browserFindings = JSON.parse(rawBrowser);

  const rawStatic = await fs.readFile(path.join(ROOT, 'ui-audit-static.json'), 'utf8');
  const staticFindings = JSON.parse(rawStatic);

  console.log(`Total Browser Audit Records: ${browserFindings.length}`);

  const byCategory = {};
  const byPage = {};
  const byViewport = {};
  const mobileVsDesktop = { mobile: 0, desktop: 0 };

  for (const f of browserFindings) {
    const catKey = `${f.category} -> ${f.subcategory || 'General'}`;
    byCategory[catKey] = (byCategory[catKey] || 0) + 1;

    byPage[f.page] = (byPage[f.page] || 0) + 1;
    byViewport[f.viewport] = (byViewport[f.viewport] || 0) + 1;

    if (f.isMobile) mobileVsDesktop.mobile++;
    else mobileVsDesktop.desktop++;
  }

  console.log('\n--- Findings by Category ---');
  console.dir(byCategory);

  console.log('\n--- Findings by Viewport ---');
  console.dir(byViewport);

  console.log('\n--- Findings Mobile vs Desktop ---');
  console.dir(mobileVsDesktop);

  // Group unique issues with details
  const uniqueIssuesMap = new Map();

  for (const f of browserFindings) {
    const key = `${f.category}|${f.subcategory}|${f.issue}`;
    if (!uniqueIssuesMap.has(key)) {
      uniqueIssuesMap.set(key, {
        category: f.category,
        subcategory: f.subcategory,
        severity: f.severity,
        issue: f.issue,
        affectedPages: new Set(),
        affectedViewports: new Set(),
        samples: []
      });
    }
    const item = uniqueIssuesMap.get(key);
    item.affectedPages.add(f.page);
    item.affectedViewports.add(f.viewport);
    if (item.samples.length < 5) {
      if (f.culprits) item.samples.push({ type: 'culprits', page: f.page, vp: f.viewport, data: f.culprits });
      if (f.blocked) item.samples.push({ type: 'blocked', page: f.page, vp: f.viewport, data: f.blocked });
      if (f.elements) item.samples.push({ type: 'elements', page: f.page, vp: f.viewport, data: f.elements });
      if (f.containers) item.samples.push({ type: 'containers', page: f.page, vp: f.viewport, data: f.containers });
      if (f.targets) item.samples.push({ type: 'targets', page: f.page, vp: f.viewport, data: f.targets });
    }
  }

  const uniqueSummary = [];
  for (const [key, item] of uniqueIssuesMap.entries()) {
    uniqueSummary.push({
      category: item.category,
      subcategory: item.subcategory,
      severity: item.severity,
      issue: item.issue,
      pageCount: item.affectedPages.size,
      pages: Array.from(item.affectedPages),
      viewportCount: item.affectedViewports.size,
      viewports: Array.from(item.affectedViewports),
      samples: item.samples
    });
  }

  await fs.writeFile(path.join(ROOT, 'audit-summary.json'), JSON.stringify(uniqueSummary, null, 2));
  console.log(`\nWritten ${uniqueSummary.length} unique issue patterns to audit-summary.json`);
}

summarize().catch(console.error);
