import { test, expect } from '@playwright/test';
import { getSitemapUrls } from './sitemap-parser.js';

const urls = getSitemapUrls();

test.describe('Structured Data Validation (AEO Engine)', () => {
  for (const url of urls) {
    test(`Schema checks for ${url}`, async ({ page }) => {
      await page.goto(url);
      
      const schemaTags = await page.locator('script[type="application/ld+json"]').all();
      const schemas = [];
      
      for (const tag of schemaTags) {
         try {
             const text = await tag.innerText();
             schemas.push(JSON.parse(text));
         } catch (e) {
             expect(true, `Invalid JSON-LD on ${url}`).toBe(false);
         }
      }

      // We might have an array of schemas or multiple script tags. Flatten.
      const flattenedSchemas = schemas.flatMap(s => {
          if (s['@graph']) return s['@graph'];
          if (Array.isArray(s)) return s;
          return [s];
      });

      // 1. Entity Precision: LocalBusiness
      const localBusinesses = flattenedSchemas.filter(s => s['@type'] === 'LocalBusiness' || s['@type'] === 'SportsActivityLocation' || s['@type'] === 'HealthAndBeautyBusiness');
      for (const business of localBusinesses) {
          // Assert name exists
          expect(business.name, `LocalBusiness missing name on ${url}`).toBeTruthy();
          
          // Assert address is Tannersville perfectly formed
          if (business.address) {
              expect(business.address.addressLocality, `LocalBusiness locality must be Tannersville on ${url}`).toMatch(/Tannersville/i);
              expect(business.address.postalCode, `LocalBusiness missing postal code on ${url}`).toBeTruthy();
              expect(business.address.streetAddress, `LocalBusiness missing street address on ${url}`).toBeTruthy();
          } else {
              // Not hard-failing if no address provided, but if provided it must be valid.
              // Actually, user said: "ensure the Tannersville address... perfectly formed"
              // If LocalBusiness is present, it should have the address.
              expect(business.address, `LocalBusiness missing address object on ${url}`).toBeTruthy();
          }

          if (business.geo) {
              expect(business.geo.latitude, `LocalBusiness missing latitude on ${url}`).toBeTruthy();
              expect(business.geo.longitude, `LocalBusiness missing longitude on ${url}`).toBeTruthy();
          }
      }

      // 2. Navigation Nodes: BreadcrumbList
      const breadcrumbs = flattenedSchemas.filter(s => s['@type'] === 'BreadcrumbList');
      for (const breadcrumb of breadcrumbs) {
          expect(breadcrumb.itemListElement, `BreadcrumbList missing itemListElement on ${url}`).toBeTruthy();
          const items = breadcrumb.itemListElement;
          
          // Structural match: The last item should match the current URL roughly
          if (items.length > 0) {
              const lastItemUrl = items[items.length - 1].item;
              if (lastItemUrl) {
                  // E.g. 'https://senseisandy.com/kids' should end with '/kids'
                  const urlObj = new URL(lastItemUrl);
                  let expectedPath = url === '/' ? '/' : url;
                  if (expectedPath !== '/' && expectedPath.endsWith('/')) expectedPath = expectedPath.slice(0, -1);
                  expect(urlObj.pathname).toBe(expectedPath);
              }
          }
      }

      // 3. FAQ Synchronization
      const faqs = flattenedSchemas.filter(s => s['@type'] === 'FAQPage');
      for (const faq of faqs) {
          expect(faq.mainEntity, `FAQPage missing mainEntity on ${url}`).toBeTruthy();
          const bodyText = await page.locator('body').innerText();
          const lowerBodyText = bodyText.replace(/\s+/g, ' ').toLowerCase();

          for (const qa of faq.mainEntity) {
              if (qa['@type'] === 'Question') {
                  const questionText = qa.name.replace(/\s+/g, ' ').toLowerCase();
                  const answerText = qa.acceptedAnswer?.text?.replace(/(<([^>]+)>)/gi, "").replace(/\s+/g, ' ').toLowerCase() || '';

                  // Expect visible text to contain the question and answer
                  expect(lowerBodyText, `FAQ Schema promise unfulfilled on ${url}: Question "${qa.name}" not found in visible text.`).toContain(questionText);
                  if (answerText) {
                      expect(lowerBodyText, `FAQ Schema promise unfulfilled on ${url}: Answer "${qa.acceptedAnswer.text}" not found in visible text.`).toContain(answerText);
                  }
              }
          }
      }
    });
  }
});
