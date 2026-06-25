import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getSitemapUrls } from './sitemap-parser.js';

const urls = getSitemapUrls();
const testimonialsHashPath = path.join(process.cwd(), 'tests', 'audit', '.testimonials-data.json');

// Helper to hash strings
function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

test.describe('Editorial & Temporal Integrity - Per Page', () => {
  for (const url of urls) {
    test(`Integrity checks for ${url}`, async ({ page }) => {
      await page.goto(url);
      
      const bodyText = await page.locator('body').innerText();

      // Temporal Anomalies: 
      // Ensure "4:00 PM youth" or "4:00 PM kids" doesn't appear, since active is 5:00 PM.
      // E.g. "4:00 PM" near "Kids", "Youth", or "Teens"
      const lowerBodyText = bodyText.toLowerCase();
      // Only do deep check if we see "4:00" and ("kid" or "youth" or "teen")
      if (lowerBodyText.includes('4:00') && (lowerBodyText.includes('kid') || lowerBodyText.includes('youth') || lowerBodyText.includes('teen'))) {
         // Fails if "4:00 pm kids" or similar is found within a 50 character window.
         const anomalyRegex = /(4(?:[:\.]00)?\s*[pa]?\.?m\.?).{0,50}(kid|youth|teen)|(kid|youth|teen).{0,50}(4(?:[:\.]00)?\s*[pa]?\.?m\.?)/i;
         expect(bodyText, `Temporal anomaly found on ${url}: Outdated 4:00 PM time for youth/kids.`).not.toMatch(anomalyRegex);
      }

      // Environment Bleed: "lorem ipsum", "staging", "placeholder"
      expect(lowerBodyText, `Environment bleed: "lorem ipsum" found on ${url}`).not.toContain('lorem ipsum');
      // "test" is too common (e.g. "testimonial", "latest"), so we skip "test" as a bare string to avoid false positives.
      expect(lowerBodyText, `Environment bleed: "[staging]" or "staging-placeholder" found on ${url}`).not.toContain('[staging]');
      expect(lowerBodyText, `Environment bleed: "TODO:" found on ${url}`).not.toContain('todo:');

      // Age-Bracket Consistency
      // e.g., if page is /kids, /teens, we can check logic.
      if (url.includes('/kids')) {
         // Kids are usually e.g. 5-12. If it mentions 13-17, it's a contradiction.
         const teenRegex = /1[3-7]\s*(?:to|-)\s*1[3-9]\s*years/i;
         expect(bodyText, `Age bracket contradiction on kids page ${url}`).not.toMatch(teenRegex);
      } else if (url.includes('/teens')) {
         // Teens are 13-17. If it mentions 5-7, it's a contradiction.
         const littleKidsRegex = /5\s*(?:to|-)\s*7\s*years/i;
         expect(bodyText, `Age bracket contradiction on teens page ${url}`).not.toMatch(littleKidsRegex);
      }

      // Component Deduplication (Testimonials)
      // Extract testimonials (assuming standard class names like .testimonial, .review, blockquote)
      const testimonialEls = await page.locator('.testimonial, .review, blockquote').all();
      
      const pageTestimonialHashes = new Set();
      
      for (const el of testimonialEls) {
         const text = await el.innerText();
         const cleanText = text.trim();
         if (cleanText.length < 20) continue; // Skip too short blocks

         const hash = hashString(cleanText);
         
         // Assert no duplicate adjacent UI components on the SAME page
         expect(pageTestimonialHashes.has(hash), `Duplicate testimonial found ON PAGE ${url}: "${cleanText.substring(0, 50)}..."`).toBe(false);
         pageTestimonialHashes.add(hash);
         
         // Save to global file for cross-page check
         fs.appendFileSync(testimonialsHashPath, JSON.stringify({ url, text: cleanText, hash }) + '\n');
      }
    });
  }
});

test.describe('Editorial & Temporal Integrity - Global', () => {
  test.afterAll(() => {
    if (fs.existsSync(testimonialsHashPath)) {
      fs.unlinkSync(testimonialsHashPath);
    }
  });

  test('Component Deduplication Across Sitemap', () => {
    test.skip(!fs.existsSync(testimonialsHashPath), 'No testimonials found.');
    
    if (fs.existsSync(testimonialsHashPath)) {
        const lines = fs.readFileSync(testimonialsHashPath, 'utf-8').split('\n').filter(Boolean);
        const map = new Map();
        
        for (const line of lines) {
            const { url, text, hash } = JSON.parse(line);
            if (!map.has(hash)) {
                map.set(hash, []);
            }
            map.get(hash).push(url);
        }
        
        const duplicates = Array.from(map.entries()).filter(([_, urls]) => urls.length > 1);
        
        // Assert no duplicate strings sequence across neighboring pages
        expect(duplicates.length, `Duplicate testimonials found across pages: ${JSON.stringify(duplicates)}`).toBe(0);
    }
  });
});
