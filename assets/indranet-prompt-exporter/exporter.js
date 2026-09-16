#!/usr/bin/env node

/**
 * Indranet Prompt Exporter (v11 Title-Based Folder Structure)
 * Uses Title-based directory naming under exports/<Title>/, preserves original UUID inside prompt.json,
 * appends UUID on collision, atomic writes, resumable checkpoints, and DOM-fallback prompt text capture.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const BASE_DIR = __dirname;
const USER_DATA_DIR = path.join(BASE_DIR, 'browser_user_data');
const EXPORTS_DIR = path.join(BASE_DIR, 'exports');
const CHECKPOINT_PATH = path.join(EXPORTS_DIR, 'checkpoint.json');
const TARGET_URL = 'https://indranet.collaborative-dynamics.com/';
const PROMPT_URL_REGEX = /\/prompt\/[0-9a-f-]{20,}/i;

function safeComponent(str, fallback = 'item') {
  if (!str) return fallback;
  const cleaned = String(str).replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^[._]+|[._]+$/g, '');
  return cleaned.substring(0, 120) || fallback;
}

function getPromptId(urlStr) {
  const parts = urlStr.replace(/\/$/, '').split('/prompt/');
  if (parts.length > 1) {
    const rawId = parts[parts.length - 1].split('?')[0];
    return safeComponent(rawId, 'unknown-prompt');
  }
  return safeComponent(urlStr, 'unknown-prompt');
}

/**
 * Atomic write with skip-first policy unless overwrite=true
 */
function atomicWriteSync(filePath, data, overwrite = false) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(filePath) && !overwrite) {
    return false; // Preserved, skipped existing
  }

  const tmpPath = `${filePath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  fs.writeFileSync(tmpPath, data, 'utf-8');
  fs.renameSync(tmpPath, filePath);
  return true;
}

function renderMarkdown(p) {
  let lines = [`# ${p.title || 'Untitled Prompt'}`, ''];
  if (p.description) lines.push('## Description', '', p.description, '');
  if (p.text) lines.push('## Prompt', '', '```', p.text, '```', '');
  if (p.notes) lines.push('## Notes', '', p.notes, '');
  if (p.tags && p.tags.length > 0) lines.push('## Tags', '', p.tags.map(t => `\`${t}\``).join(' '), '');
  if (p.additional_files && p.additional_files.length > 0) {
    lines.push('## Additional Files', '');
    for (const f of p.additional_files) {
      lines.push(`- **${f.name || f.file}** (${f.bytes || 0} bytes) [additional-files/${f.file || f.name}](additional-files/${f.file || f.name})`);
    }
    lines.push('');
  }
  lines.push('## Metadata', '');
  lines.push(`- Version: ${p.version || '1.0'}`);
  lines.push(`- Organization: ${p.organization || 'Indranet'}`);
  lines.push(`- UUID: ${p.uuid || p.id || ''}`);
  lines.push(`- URL: ${p.url || ''}`);
  lines.push(`- Scraped At: ${p.created || new Date().toISOString()}`);
  lines.push('');
  return lines.join('\n');
}

function askQuestion(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(query, (ans) => { rl.close(); resolve(ans); }));
}

function buildCatalogManifest({ links = [], prompts = [], visitedUrls = [], skipped = [], listingUrl = '', origin = '' }) {
  const targetLinks = Array.isArray(links) ? links : [];
  const exported = Array.isArray(prompts) ? prompts : [];
  return {
    exported_at: new Date().toISOString(),
    origin: origin || TARGET_URL,
    listing_url: listingUrl || TARGET_URL,
    expected_cards: targetLinks.length,
    discovered_cards: targetLinks.length,
    exported_cards: exported.length,
    failed_cards: Math.max(0, targetLinks.length - exported.length),
    visited_urls: Array.from(visitedUrls),
    skipped,
    pagination_exhausted: false,
  };
}

async function downloadPrompt(page, directory) {
  const destination = path.join(directory, 'prompt-original.txt');
  const receiptPath = path.join(directory, 'prompt-download.json');

  if (fs.existsSync(receiptPath)) {
    try {
      const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      const savedPath = path.join(directory, path.basename(receipt.path || 'prompt-original.txt'));
      if (fs.existsSync(savedPath)) {
        const bytes = fs.readFileSync(savedPath);
        if (bytes.length && receipt.sha256 === crypto.createHash('sha256').update(bytes).digest('hex')) {
          return { ...receipt, text: bytes.toString('utf8'), status: 'skipped_verified' };
        }
      }
    } catch (e) {}
  }

  fs.mkdirSync(directory, { recursive: true });

  try {
    const button = page.getByRole('button', { name: /^(Download|Download Prompt|Downloaded Prompt|Export|Save Prompt)$/i })
      .or(page.getByRole('link', { name: /^(Download|Download Prompt|Downloaded Prompt|Export|Save Prompt)$/i }))
      .or(page.locator('a[download], button[aria-label*="download" i], [data-testid*="download" i]')).first();

    if (await button.count() > 0) {
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 10000 }),
        button.click()
      ]);
      const failure = await download.failure();
      if (!failure) {
        const temporary = await download.path();
        if (temporary && fs.existsSync(temporary)) {
          const bytes = fs.readFileSync(temporary);
          const text = bytes.toString('utf8');
          if (bytes.length && !bytes.includes(0) && !text.includes('\uFFFD') && !/^\s*(<!doctype html|<html)/i.test(text)) {
            let saved = destination;
            if (fs.existsSync(saved)) saved = path.join(directory, `prompt-original-${crypto.randomUUID()}.txt`);
            fs.copyFileSync(temporary, saved, fs.constants.COPYFILE_EXCL);
            const receipt = {
              path: path.basename(saved),
              suggested_filename: download.suggestedFilename(),
              sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
              bytes: bytes.length,
              status: 'downloaded'
            };
            atomicWriteSync(receiptPath, JSON.stringify(receipt, null, 2), true);
            return { ...receipt, text };
          }
        }
      }
    }
  } catch (err) {}

  const extractText = () => page.evaluate(() => {
    const sel = [
      '.prompt-text', '[data-testid*="prompt-content"]', '[data-testid*="prompt-text"]',
      'code', 'pre', 'textarea', '.prompt-body', '[class*="prompt-text"]', '[class*="prompt-content"]'
    ];
    for (const s of sel) {
      const el = document.querySelector(s);
      if (el && el.innerText && el.innerText.trim().length > 10) {
        return el.innerText.trim();
      }
    }
    const main = document.querySelector('main');
    if (main && main.innerText && main.innerText.trim().length > 20) {
      return main.innerText.trim();
    }
    return '';
  });

  let domText = await extractText();
  if (!domText || /^(home\s*account|home\naccount)/i.test(domText.trim())) {
    await page.waitForTimeout(2500);
    domText = await extractText();
  }

  if (!domText || domText.length < 15 || /^(home\s*account|home\naccount)/i.test(domText.trim())) {
    throw new Error('Download button or valid prompt text could not be extracted (received empty or nav fallback)');
  }

  const bytes = Buffer.from(domText, 'utf8');
  let saved = destination;
  if (fs.existsSync(saved)) saved = path.join(directory, `prompt-original-${crypto.randomUUID()}.txt`);
  fs.writeFileSync(saved, bytes);

  const receipt = {
    path: path.basename(saved),
    suggested_filename: 'prompt-original.txt',
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.length,
    status: 'extracted_from_dom'
  };
  atomicWriteSync(receiptPath, JSON.stringify(receipt, null, 2), true);

  return { ...receipt, text: domText };
}

async function main() {
  const { chromium } = require('playwright');
  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  if (!fs.existsSync(USER_DATA_DIR)) fs.mkdirSync(USER_DATA_DIR, { recursive: true });

  console.log('==================================================');
  console.log(' Indranet Prompt Exporter (Title-Based Folder Structure)');
  console.log('==================================================');
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Exports Root: ${EXPORTS_DIR}`);

  const forceMode = process.argv.includes('--force');
  const isHeadless = process.argv.includes('--headless');
  const checkMissingMode = process.argv.includes('--check-missing');
  const resumeMissingMode = process.argv.includes('--resume-missing');
  const targetUrlArgIdx = process.argv.indexOf('--url');
  const singleUrl = targetUrlArgIdx !== -1 ? process.argv[targetUrlArgIdx + 1] : null;
  const autoMode = process.argv.includes('--auto') || isHeadless || !!singleUrl || resumeMissingMode;

  // Verify on-disk complete prompts to enable safe incremental resumption
  const knownExportedUuids = new Set();
  const existingFiles = fs.readdirSync(EXPORTS_DIR, { withFileTypes: true });
  for (const dirent of existingFiles) {
    if (dirent.isDirectory()) {
      const pj = path.join(EXPORTS_DIR, dirent.name, 'prompt.json');
      if (fs.existsSync(pj)) {
        try {
          const doc = JSON.parse(fs.readFileSync(pj, 'utf8'));
          const uid = doc.uuid || doc.id;
          if (uid && doc.title && (!doc.text || !doc.text.startsWith('HOME\nACCOUNT'))) {
            knownExportedUuids.add(uid);
          }
        } catch (e) {}
      }
    }
  }
  console.log(`Verified ${knownExportedUuids.size} complete prompt(s) already saved on disk.`);

  let checkpoint = { visited_urls: [], exported_ids: Array.from(knownExportedUuids), pages_visited: 0 };
  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      const loadedCp = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'));
      // Keep only verified IDs in checkpoint to prevent missing items from being masked
      const filteredExported = (loadedCp.exported_ids || []).filter(id => knownExportedUuids.has(id));
      checkpoint = {
        visited_urls: loadedCp.visited_urls || [],
        exported_ids: Array.from(new Set([...filteredExported, ...knownExportedUuids])),
        pages_visited: loadedCp.pages_visited || 0
      };
      console.log(`Loaded checkpoint: ${checkpoint.exported_ids.length} verified prompt(s) in state.`);
    } catch (e) {
      console.log('Starting fresh checkpoint state.');
    }
  }

  if (checkMissingMode) {
    console.log('\n==================================================');
    console.log(' INDRANET CATALOG MISSING PROMPTS AUDIT');
    console.log('==================================================');
    const visited = Array.from(new Set(checkpoint.visited_urls || []));
    const missing = [];
    for (const url of visited) {
      const pid = getPromptId(url);
      if (!knownExportedUuids.has(pid)) {
        missing.push({ pid, url });
      }
    }
    console.log(`Discovered Prompt URLs in Checkpoint: ${visited.length}`);
    console.log(`Verified Prompt Folders on Disk:      ${knownExportedUuids.size}`);
    console.log(`Missing Prompts Awaiting Export:      ${missing.length}`);
    if (missing.length > 0) {
      console.log('\nSample Missing Prompts:');
      for (const m of missing.slice(0, 10)) {
        console.log(`  - [${m.pid}] ${m.url}`);
      }
      if (missing.length > 10) {
        console.log(`  ... and ${missing.length - 10} more.`);
      }
      console.log('\nTo export missing prompts automatically in the background, run:');
      console.log('  node exporter.js --headless --resume-missing');
    }

    console.log('\n==================================================');
    console.log(' ADDITIONAL FILES / ATTACHMENTS AUDIT');
    console.log('==================================================');
    let totalDeclared = 0;
    let missingFiles = 0;
    let verifiedFiles = 0;
    for (const dirent of existingFiles) {
      if (dirent.isDirectory()) {
        const pj = path.join(EXPORTS_DIR, dirent.name, 'prompt.json');
        if (fs.existsSync(pj)) {
          try {
            const doc = JSON.parse(fs.readFileSync(pj, 'utf8'));
            const atts = doc.attachments || [];
            if (atts.length > 0) {
              totalDeclared += atts.length;
              for (const att of atts) {
                let found = false;
                const savedAddFiles = doc.additional_files || [];
                const matchingSaved = savedAddFiles.find(af => af.name === att.name || af.file === att.name);
                const targetFiles = new Set([
                  att.name,
                  matchingSaved ? matchingSaved.file : null,
                  matchingSaved && matchingSaved.path ? path.basename(matchingSaved.path) : null
                ].filter(Boolean));

                const rootAdd = path.join(EXPORTS_DIR, dirent.name, 'additional-files');
                if (fs.existsSync(rootAdd)) {
                  for (const f of fs.readdirSync(rootAdd)) {
                    if (!f.endsWith('.receipt.json') && (targetFiles.has(f) || [...targetFiles].some(tf => f.toLowerCase().includes(tf.slice(0, 15).toLowerCase())))) {
                      found = true;
                      break;
                    }
                  }
                }

                if (!found) {
                  const vDir = path.join(EXPORTS_DIR, dirent.name, 'versions');
                  if (fs.existsSync(vDir)) {
                    for (const vSub of fs.readdirSync(vDir)) {
                      const vAdd = path.join(vDir, vSub, 'additional-files');
                      if (fs.existsSync(vAdd)) {
                        for (const f of fs.readdirSync(vAdd)) {
                          if (!f.endsWith('.receipt.json') && (targetFiles.has(f) || [...targetFiles].some(tf => f.toLowerCase().includes(tf.slice(0, 15).toLowerCase())))) {
                            found = true;
                            break;
                          }
                        }
                      }
                    }
                  }
                }

                if (!found) {
                  missingFiles++;
                  console.log(`  ✗ [Missing] '${dirent.name}': ${att.name}`);
                } else {
                  verifiedFiles++;
                  console.log(`  ✓ [Verified] '${dirent.name}': ${att.name}`);
                }
              }
            }
          } catch (e) {}
        }
      }
    }
    console.log(`\nAttachment Summary: Total Declared: ${totalDeclared} | Verified: ${verifiedFiles} | Missing: ${missingFiles}`);
    return;
  }

  console.log(`\nLaunching Chromium browser (${isHeadless ? 'headless' : 'headful'}) with persistent session...`);
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: isHeadless,
    viewport: { width: 1280, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
  if (!singleUrl && !resumeMissingMode) {
    await page.goto(TARGET_URL);

    if (!autoMode) {
      console.log('\n--------------------------------------------------');
      console.log('ACTION REQUIRED:');
      console.log('1. Log in to Indranet in the opened browser window.');
      console.log('2. Complete Discord OAuth or CAPTCHA verification if prompted.');
      console.log('3. Navigate to the Prompts / Catalog dashboard.');
      console.log('--------------------------------------------------');

      await askQuestion('\nPress ENTER in this terminal once you are signed in and ready to run Exporter... ');
    } else {
      console.log('\nRunning in automated mode with persistent session profile...');
      await page.waitForTimeout(3000);
    }
  }

  console.log('\nStarting catalog export pipeline...');

  const exportedRecords = [];
  const visitedUrls = new Set(checkpoint.visited_urls || []);
  const exportedIds = new Set(checkpoint.exported_ids || []);
  const skipped = [];
  let allDiscoveredLinks = [];
  let pageNum = checkpoint.pages_visited || 1;

  if (singleUrl || resumeMissingMode) {
    const queue = [];
    if (singleUrl) {
      queue.push(singleUrl);
    } else {
      for (const u of Array.from(new Set(checkpoint.visited_urls || []))) {
        const pid = getPromptId(u);
        if (!knownExportedUuids.has(pid) || forceMode) {
          queue.push(u);
        }
      }
    }
    console.log(`Processing direct export queue: ${queue.length} prompt(s)...`);

    for (let i = 0; i < queue.length; i++) {
      const fullUrl = queue[i];
      const pid = getPromptId(fullUrl);
      console.log(`\n[${i + 1}/${queue.length}] Exporting ${pid}...`);
      visitedUrls.add(fullUrl);

      let detailPage;
      try {
        detailPage = await context.newPage();
        await detailPage.goto(fullUrl, { waitUntil: 'domcontentloaded' });
        try {
          await detailPage.waitForSelector('h1, main, [data-testid*="prompt"], .prompt-text', { timeout: 8000 });
        } catch (e) {}
        await detailPage.waitForTimeout(1000);

        const records = await require('./detail-export').exportDetails(detailPage, EXPORTS_DIR, downloadPrompt, renderMarkdown);
        const hasError = records.some(record => record.status === 'failed' || !record.title || record.text?.startsWith('HOME\nACCOUNT'));
        if (hasError) {
          skipped.push(fullUrl);
        } else {
          exportedIds.add(pid);
          knownExportedUuids.add(pid);
          exportedRecords.push(...records);
        }

        checkpoint.visited_urls = Array.from(visitedUrls);
        checkpoint.exported_ids = Array.from(exportedIds);
        atomicWriteSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), true);

        const folderName = records[0]?._folderName || pid;
        console.log(`  ✓ Written prompt '${records[0]?.title || pid}' to exports/${folderName}/`);
      } catch (err) {
        console.log(`  ✗ Failed ${fullUrl}: ${err.message}`);
        skipped.push(fullUrl);
      } finally {
        if (detailPage) await detailPage.close();
      }
    }
  } else {

  while (true) {
    console.log(`\n[Page ${pageNum}] Scrolling and scanning visible prompt cards...`);
    // Auto-scroll the page to trigger lazy loading of catalog cards
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 400;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight || totalHeight > 15000) {
            clearInterval(timer);
            resolve();
          }
        }, 120);
      });
    });
    await page.waitForTimeout(1000);

    const links = await page.$$eval('a[href]', (anchors) =>
      anchors.map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }))
    );

    const targetLinks = links.filter(l => l.href && PROMPT_URL_REGEX.test(l.href));
    allDiscoveredLinks.push(...targetLinks);

    console.log(`Found ${targetLinks.length} prompt link(s) matching catalog pattern on Page ${pageNum}.`);

    for (const link of targetLinks) {
      let fullUrl = link.href.startsWith('/') ? `https://indranet.collaborative-dynamics.com${link.href}` : link.href;
      const pid = getPromptId(fullUrl);

      if (exportedRecords.some(p => p.url === fullUrl)) continue;

      if (!forceMode && knownExportedUuids.has(pid)) {
        console.log(`  ↷ Prompt '${pid}' already saved on disk, skipping.`);
        visitedUrls.add(fullUrl);
        exportedIds.add(pid);
        continue;
      }
      visitedUrls.add(fullUrl);

      let detailPage;
      try {
        detailPage = await context.newPage();
        await detailPage.goto(fullUrl, { waitUntil: 'domcontentloaded' });
        try {
          await detailPage.waitForSelector('h1, main, [data-testid*="prompt"], .prompt-text', { timeout: 8000 });
        } catch (e) {}
        await detailPage.waitForTimeout(1000);

        const records = await require('./detail-export').exportDetails(detailPage, EXPORTS_DIR, downloadPrompt, renderMarkdown);
        const hasError = records.some(record => record.status === 'failed' || !record.title || record.text?.startsWith('HOME\nACCOUNT'));
        if (hasError) {
          skipped.push(fullUrl);
        } else {
          exportedIds.add(pid);
          knownExportedUuids.add(pid);
          exportedRecords.push(...records);
        }

        checkpoint.visited_urls = Array.from(visitedUrls);
        checkpoint.exported_ids = Array.from(exportedIds);
        checkpoint.pages_visited = pageNum;
        atomicWriteSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), true);

        const folderName = records[0]?._folderName || pid;
        console.log(`  ✓ Written prompt '${records[0]?.title || pid}' to exports/${folderName}/`);
      } catch (err) {
        console.log(`  ✗ Failed ${fullUrl}: ${err.message}`);
        skipped.push(fullUrl);
      } finally {
        if (detailPage) await detailPage.close();
      }
    }

    const nextButton = await page.$("button:has-text('Next'), a:has-text('Next'), [aria-label*='Next'], .pagination-next");
    if (nextButton && (await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      console.log('Navigating to Next page...');
      await nextButton.click();
      pageNum++;
    } else if (!autoMode) {
      console.log('\nNo automated next page button detected.');
      const ans = await askQuestion('To scan another catalog tab or category, switch tabs in the browser and type "c" + ENTER (or press ENTER to finish export): ');
      if (ans.trim().toLowerCase() === 'c') {
        pageNum++;
        continue;
      }
      break;
    } else {
      console.log('No further pagination found. Export complete.');
      break;
    }
  }
  }

  const indexJsonPath = path.join(EXPORTS_DIR, 'index.json');
  const manifestPath = path.join(EXPORTS_DIR, 'manifest.json');

  // Load existing records to prevent data loss on incremental runs
  let existingRecords = [];
  if (fs.existsSync(indexJsonPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(indexJsonPath, 'utf8'));
      if (Array.isArray(parsed)) existingRecords = parsed;
    } catch (e) {
      console.warn('Warning: Could not parse existing index.json');
    }
  }

  const recordMap = new Map();
  // Keep clean existing records
  for (const rec of existingRecords) {
    if (!rec) continue;
    const isBad = !rec.title || rec.title.toUpperCase() === 'HOME' || (rec.text && rec.text.startsWith('HOME\nACCOUNT'));
    if (isBad) continue;
    const key = rec.uuid || rec.id || rec.url;
    if (key) recordMap.set(key, rec);
  }

  // Merge newly exported records
  for (const rec of exportedRecords) {
    if (!rec || !rec.title) continue;
    const key = rec.uuid || rec.id || rec.url;
    if (key) recordMap.set(key, rec);
  }

  // Verify all on-disk prompt.json records are indexed
  for (const dirent of fs.readdirSync(EXPORTS_DIR, { withFileTypes: true })) {
    if (dirent.isDirectory()) {
      const pj = path.join(EXPORTS_DIR, dirent.name, 'prompt.json');
      if (fs.existsSync(pj)) {
        try {
          const doc = JSON.parse(fs.readFileSync(pj, 'utf8'));
          const key = doc.uuid || doc.id || doc.url;
          if (key && !recordMap.has(key) && doc.title && (!doc.text || !doc.text.startsWith('HOME\nACCOUNT'))) {
            recordMap.set(key, doc);
          }
        } catch (e) {}
      }
    }
  }

  const finalRecords = Array.from(recordMap.values());
  atomicWriteSync(indexJsonPath, JSON.stringify(finalRecords, null, 2), true);

  const manifestData = buildCatalogManifest({
    links: allDiscoveredLinks,
    prompts: finalRecords,
    visitedUrls,
    skipped,
    listingUrl: TARGET_URL,
    origin: TARGET_URL
  });

  atomicWriteSync(manifestPath, JSON.stringify(manifestData, null, 2), true);

  const isComplete = exportedIds.size > 0 && skipped.length === 0;

  console.log('\n==================================================');
  console.log(isComplete ? ' DISCOVERED PROMPT DOWNLOADS SAVED & VERIFIED' : ' EXPORT COMPLETED WITH SOME SKIPS — inspect manifest');
  console.log('==================================================');
  console.log(`Total Prompts In Catalog: ${finalRecords.length}`);
  console.log(`Index JSON: ${indexJsonPath}`);
  console.log(`Manifest: ${manifestPath}`);

  await context.close();
}

module.exports = { downloadPrompt, atomicWriteSync, main };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
