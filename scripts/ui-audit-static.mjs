import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT, iterHtmlFiles } from './url-qa-lib.mjs';

async function runStaticAudit() {
  const htmlFiles = await iterHtmlFiles('dist');
  console.log(`Analyzing ${htmlFiles.length} HTML files...`);

  const inlineStyles = [];
  const flexGridIssues = [];
  const zIndexUsages = [];
  const hiddenAttrs = [];

  for (const relPath of htmlFiles) {
    const filePath = path.join(ROOT, 'dist', relPath);
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    // 1. Inline Style Inspection
    const styleAttrMatches = [...content.matchAll(/style\s*=\s*["']([^"']+)["']/gi)];
    for (const match of styleAttrMatches) {
      const styleVal = match[1];
      if (/width:\s*\d+px|margin:\s*-\d+|padding:\s*0\b|z-index:\s*\d{3,}/i.test(styleVal)) {
        inlineStyles.push({
          file: relPath,
          style: styleVal
        });
      }
    }

    // 2. HTML [hidden] attribute check
    const hiddenMatches = [...content.matchAll(/<[^>]+hidden[^>]*>/gi)];
    for (const match of hiddenMatches) {
      const snippet = match[0];
      if (/class=["'][^"']*\b(d-flex|d-grid|d-block|ss-flex|flex)\b[^"']*["']/i.test(snippet)) {
        hiddenAttrs.push({
          file: relPath,
          snippet
        });
      }
    }
  }

  console.log(`Found ${inlineStyles.length} high-risk inline styles`);
  console.log(`Found ${hiddenAttrs.length} HTML [hidden] vs CSS display class conflicts`);

  const report = {
    inlineStyles: inlineStyles.slice(0, 30),
    hiddenAttrs: hiddenAttrs.slice(0, 30)
  };

  await fs.writeFile(path.join(ROOT, 'ui-audit-static.json'), JSON.stringify(report, null, 2));
}

runStaticAudit().catch(console.error);
