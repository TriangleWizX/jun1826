import { test, expect } from '@playwright/test';
import { getSitemapUrls } from './sitemap-parser.js';

const urls = getSitemapUrls();

test.describe('Asset Optimization (Visual rendering)', () => {
  for (const url of urls) {
    test(`Asset checks for ${url}`, async ({ page }) => {
      await page.goto(url);
      
      const images = await page.locator('img').all();
      
      for (const img of images) {
          const src = await img.getAttribute('src');
          if (!src) continue; // Skip images without src

          // Accessibility Anchors
          const alt = await img.getAttribute('alt');
          const role = await img.getAttribute('role');
          
          if (role === 'presentation' || role === 'none') {
              // Decorative images should have empty alt or omitted alt, but we don't strictly fail if it has alt text while being decorative unless that's a rule.
              // We just ensure if it's NOT presentation, it has an alt.
          } else {
              expect(alt, `Image ${src} missing or empty alt attribute on ${url}`).toBeTruthy();
              expect(alt.trim().length, `Image ${src} alt attribute is empty string on ${url}`).toBeGreaterThan(0);
          }

          // Layout Shift Prevention
          const width = await img.getAttribute('width');
          const height = await img.getAttribute('height');
          
          expect(width, `Image ${src} missing explicit width attribute on ${url} (CLS risk)`).not.toBeNull();
          expect(height, `Image ${src} missing explicit height attribute on ${url} (CLS risk)`).not.toBeNull();
      }
    });
  }
});
