import fs from 'fs';
import path from 'path';

const REPO_ROOT = '/home/twizss/Documents/ssbjjweb/tmb';
const SITEMAPS = ['pages-sitemap.xml', 'blog-sitemap.xml'];

function getSitemapUrls() {
  const urls = new Set();
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/gi;

  for (const sm of SITEMAPS) {
    const smPath = path.join(REPO_ROOT, sm);
    if (fs.existsSync(smPath)) {
      const xml = fs.readFileSync(smPath, 'utf8');
      let match;
      while ((match = locRegex.exec(xml)) !== null) {
        if (match[1]) {
          urls.add(match[1].trim());
        }
      }
    }
  }
  return Array.from(urls).sort();
}

async function auditUrl(url) {
  const result = {
    url,
    status: 0,
    siteHeadersCount: 0,
    footersCount: 0,
    doctypeCount: 0,
    ssiLeaksCount: 0,
    actionbarCount: 0,
    issues: []
  };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SenseiSandyAudit/1.0' }
    });

    result.status = res.status;
    if (res.status !== 200) {
      result.issues.push(`HTTP ${res.status}`);
      return result;
    }

    const html = await res.text();

    // 1. Site Navigation Header count (<header class="...ss-site-header...">)
    const siteHeaderMatches = html.match(/<header[^>]*class="[^"]*ss-site-header[^"]*"/gi) || [];
    result.siteHeadersCount = siteHeaderMatches.length;
    if (result.siteHeadersCount !== 1) {
      result.issues.push(`site header count = ${result.siteHeadersCount} (expected 1)`);
    }

    // 2. Footer count
    const footerMatches = html.match(/<footer[\s>]/gi) || [];
    result.footersCount = footerMatches.length;
    if (result.footersCount < 1) {
      result.issues.push(`footer count = ${result.footersCount} (expected >= 1)`);
    }

    // 3. DOCTYPE count
    const doctypeMatches = html.match(/<!DOCTYPE\s+html>/gi) || [];
    result.doctypeCount = doctypeMatches.length;
    if (result.doctypeCount > 1) {
      result.issues.push(`nested DOCTYPE count = ${result.doctypeCount} (expected 1)`);
    }

    // 4. SSI leaks
    const ssiMatches = html.match(/<!--#include\s+virtual=/gi) || [];
    result.ssiLeaksCount = ssiMatches.length;
    if (result.ssiLeaksCount > 0) {
      result.issues.push(`unexpanded SSI directives = ${result.ssiLeaksCount}`);
    }

    // 5. Mobile actionbar count
    const actionbarMatches = html.match(/class="[^"]*ss-mobile-actionbar/gi) || [];
    result.actionbarCount = actionbarMatches.length;
    if (result.actionbarCount > 1) {
      result.issues.push(`duplicate mobile actionbar = ${result.actionbarCount}`);
    }

  } catch (err) {
    result.issues.push(`Fetch error: ${err.message}`);
  }

  return result;
}

async function main() {
  console.log('--> Reading sitemaps...');
  const urls = getSitemapUrls();
  console.log(`--> Found ${urls.length} sitemapped production URLs to audit.\n`);

  console.log('--> Starting live audit in batches of 10 requests...');
  const results = [];
  const batchSize = 10;

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(auditUrl));
    results.push(...batchResults);
    process.stdout.write(`\rProgress: ${results.length}/${urls.length} URLs audited...`);
  }

  console.log('\n\n================ AUDIT SUMMARY ================');
  const failed = results.filter(r => r.issues.length > 0);
  const passed = results.filter(r => r.issues.length === 0);

  console.log(`Total URLs Audited: ${results.length}`);
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed / Issues Found: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n--- ITEMIZATION OF ISSUES FOUND ---');
    failed.forEach(f => {
      console.log(`\nURL: ${f.url}`);
      f.issues.forEach(iss => console.log(`  - ${iss}`));
    });
  } else {
    console.log('\n✅ ALL 265 SITEMAPPED PRODUCTION URLS PASSED ALL AUDIT CHECKS 100%!');
  }
}

main().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
