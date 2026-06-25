import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { getSitemapUrls } from './sitemap-parser.js';

const urls = getSitemapUrls();
const sharedDataPath = path.join(process.cwd(), 'tests', 'audit', '.seo-data.json');

test.describe('SEO Structural Audit - Per Page', () => {
  for (const url of urls) {
    test(`Structural checks for ${url}`, async ({ page, request }) => {
      const response = await page.goto(url);
      expect(response.status()).toBe(200);

      // Header Hierarchy: Exactly one <h1> tag exists per page object.
      await expect(page.locator('h1')).toHaveCount(1);

      // Canonical Enforcement
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
      if (canonical.startsWith('http')) {
        const canonicalUrl = new URL(canonical);
        let expectedPath = url;
        if (expectedPath !== '/' && expectedPath.endsWith('/')) {
            expectedPath = expectedPath.slice(0, -1);
        }
        expect(canonicalUrl.pathname).toBe(expectedPath);
      } else {
        expect(canonical).toBe(url);
      }

      // Link Hygiene: Assert 200 OK status for all internal href targets
      const links = await page.locator('a[href^="/"], a[href^="https://senseisandy.com"]').evaluateAll(els => els.map(el => el.getAttribute('href')));
      const uniqueLinks = new Set(links);
      
      for (const link of uniqueLinks) {
        // Strip hashes for validation
        const cleanLink = link.split('#')[0];
        if (!cleanLink || cleanLink === '/') continue;
        
        // Use request context to verify without navigating
        const linkRes = await request.get(cleanLink);
        // Assert 200 OK, forbidding 301/302 chains and 404s
        expect(linkRes.status()).toBe(200);
      }
      
      // Save Title and Meta Description for the uniqueness check
      const title = await page.title();
      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
      
      // Use a simple file-based lock/append for cross-worker state
      const data = { url, title, metaDesc };
      fs.appendFileSync(sharedDataPath, JSON.stringify(data) + '\n');
    });
  }
});

test.describe('SEO Structural Audit - Global', () => {
  test.afterAll(() => {
    if (fs.existsSync(sharedDataPath)) {
      fs.unlinkSync(sharedDataPath);
    }
  });

  test('Metadata Uniqueness', async () => {
    // This runs after the individual pages (or we can just do a fast static fetch here to be safe)
    // Actually, relying on other tests to finish is flaky in Playwright if fullyParallel is true.
    // Let's just do a fast fetch of all URLs in this single test for the uniqueness check.
    const titles = new Map();
    const descriptions = new Map();
    
    // We import request directly from playwright for a standalone fetch
    const { request } = require('@playwright/test');
    const apiRequestContext = await request.newContext({ baseURL: 'http://127.0.0.1:3000' });
    
    for (const url of urls) {
      const response = await apiRequestContext.get(url);
      const html = await response.text();
      
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : null;
      
      const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) 
                     || html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i);
      const desc = descMatch ? descMatch[1].trim() : null;
      
      if (title) {
        if (!titles.has(title)) titles.set(title, []);
        titles.get(title).push(url);
      }
      
      if (desc) {
        if (!descriptions.has(desc)) descriptions.set(desc, []);
        descriptions.get(desc).push(url);
      }
    }
    
    const duplicateTitles = Array.from(titles.entries()).filter(([_, urls]) => urls.length > 1);
    const duplicateDescs = Array.from(descriptions.entries()).filter(([_, urls]) => urls.length > 1);
    
    expect(duplicateTitles.length, `Duplicate titles found: ${JSON.stringify(duplicateTitles)}`).toBe(0);
    expect(duplicateDescs.length, `Duplicate meta descriptions found: ${JSON.stringify(duplicateDescs)}`).toBe(0);
  });
});
