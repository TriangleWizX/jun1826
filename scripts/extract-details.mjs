import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from './url-qa-lib.mjs';

async function extractDetails() {
  const rawBrowser = await fs.readFile(path.join(ROOT, 'ui-audit-findings.json'), 'utf8');
  const browser = JSON.parse(rawBrowser);

  const rawStatic = await fs.readFile(path.join(ROOT, 'ui-audit-static.json'), 'utf8');
  const staticData = JSON.parse(rawStatic);

  console.log('=== CRITICAL & HIGH SEVERITY ISSUES ===\n');

  // 1. Horizontal Overflows
  const overflows = browser.filter(b => b.subcategory === 'Horizontal Overflow');
  console.log(`--- HORIZONTAL OVERFLOWS (${overflows.length} instances) ---`);
  const overflowByPage = {};
  for (const o of overflows) {
    if (!overflowByPage[o.page]) overflowByPage[o.page] = [];
    overflowByPage[o.page].push({ vp: o.viewport, issue: o.issue, culprits: o.culprits });
  }
  for (const [pg, items] of Object.entries(overflowByPage)) {
    console.log(`\nPage: ${pg}`);
    for (const it of items) {
      console.log(`  - Viewport: ${it.vp} | ${it.issue}`);
      if (it.culprits) {
        for (const c of it.culprits) {
          console.log(`      Culprit: ${c.selector} (width=${c.width}px, right=${c.right}px, overflow=${c.overflowPx}px) text="${c.textSnippet}"`);
        }
      }
    }
  }

  // 2. Sticky Overlaps
  const stickies = browser.filter(b => b.subcategory === 'Sticky Overlap / Obscured Link');
  console.log(`\n--- STICKY OVERLAPS (${stickies.length} instances) ---`);
  const stickyByPage = {};
  for (const s of stickies) {
    if (!stickyByPage[s.page]) stickyByPage[s.page] = [];
    stickyByPage[s.page].push({ vp: s.viewport, issue: s.issue, blocked: s.blocked });
  }
  for (const [pg, items] of Object.entries(stickyByPage)) {
    console.log(`\nPage: ${pg}`);
    for (const it of items) {
      console.log(`  - Viewport: ${it.vp} | ${it.issue}`);
      if (it.blocked) {
        for (const b of it.blocked) {
          console.log(`      Blocked: ${b.selector} ("${b.text}") blocked by ${b.blockedBy}`);
        }
      }
    }
  }

  // 3. Flex/Grid Breakages
  const flexGrids = browser.filter(b => b.subcategory === 'Flex/Grid Breakage');
  console.log(`\n--- FLEX/GRID BREAKAGES (${flexGrids.length} instances) ---`);
  for (const fg of flexGrids) {
    console.log(`\nPage: ${fg.page} | Viewport: ${fg.viewport}`);
    for (const c of fg.containers) {
      console.log(`  - ${c.selector}: ${c.detail}`);
    }
  }

  // 4. JS Errors
  const jsErrs = browser.filter(b => b.subcategory === 'JavaScript Error');
  console.log(`\n--- JAVASCRIPT ERRORS (${jsErrs.length} instances) ---`);
  for (const je of jsErrs) {
    console.log(`\nPage: ${je.page} | Viewport: ${je.viewport} | Issue: ${je.issue}`);
  }

  // 5. Touch Target Issues
  const touchTargets = browser.filter(b => b.subcategory === 'Touch Target Under 36px');
  console.log(`\n--- TOUCH TARGETS UNDER 36PX (${touchTargets.length} instances) ---`);
  const touchByPage = {};
  for (const tt of touchTargets) {
    if (!touchByPage[tt.page]) touchByPage[tt.page] = [];
    touchByPage[tt.page].push({ vp: tt.viewport, targets: tt.targets });
  }
  for (const [pg, items] of Object.entries(touchByPage)) {
    console.log(`\nPage: ${pg}`);
    for (const it of items) {
      console.log(`  - Viewport: ${it.vp}`);
      if (it.targets) {
        for (const t of it.targets) {
          console.log(`      Target: ${t.selector} ("${t.text}") size=${t.size}`);
        }
      }
    }
  }
}

extractDetails().catch(console.error);
