# Above-the-fold remediation status

Status: Remediated, built, and locally verified across all 7 target routes; ready for review / handoff.

The opportunities audit evaluated the above-the-fold decision area on 7 key conversion and reassurance pages against the homepage benchmark. All identified opportunities have been resolved in canonical `src/` templates and component stylesheets.

## Source and styling changes

- **Pricing (`/options-pricing`)**:
  - Replaced redundant signals and repetitive first-visit claims with a concise pricing overview in both `src/options-pricing.html` and `src/options-pricing.njk`.
  - Clarified weekly training allowance to canonical policy ("up to three appropriate classes each week, with regular class times reserved, a first qualifying uniform, and progress feedback").
  - Linked directly to inclusion comparison (`#start`) and text inquiry fallback.
  - Dynamically bound price points from `pricing.json` in the `.njk` template (`{{ pricing.coreCulture.youth.displayPrice }}`, `{{ pricing.coreCulture.adult.displayPrice }}`).
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss` for layout utilities.

- **Schedule (`/schedule`)**:
  - Removed four repeated first-time booking banners from inside individual day cards (Tuesday, Wednesday, Friday, Saturday) to eliminate mobile visual noise.
  - Preserved page-level reservation route and current operational dates.
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss`.

- **FAQs (`/bjj-faqs`)**:
  - Opening lede now offers direct navigation paths to `/options-pricing` (pricing), `/bjj-classes` (age groups), and `/show-up-kit` (what to wear / dress for training).
  - Repaired malformed accessible label on primary CTA (`aria-label="Reserve your Free First Visit in Tannersville"`).
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss`.

- **Contact (`/contact`)**:
  - Separated text from phone call: primary button is dedicated to "Text Sandy" (`sms:...`), with telephone link for calling Sandy and schedule link.
  - Set `loading="eager"` on hero image to ensure immediate visual proof.
  - Updated hero eyebrow and lead text to clarify contact reasons (questions on starting, kids' classes, accessibility, private coaching).
  - Adjusted CSS (`src/assets/css/contact-vip.css`) so on mobile devices the copy and action row precede the photo.
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss`.

- **Show-Up Kit (`/show-up-kit`)**:
  - Clarified visitor state: kicker updated to "Show-Up Kit · For your reserved visit".
  - Provided unbooked visitors with a direct "Reserve Free Intro" path while directing booked visitors to their booking confirmation for arrival time and clothing instructions.
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss`.

- **Directions (`/bjj-tannersville-ny-directions`)**:
  - Exposed map access ("Open Google Maps") and unbooked visitor reservation path ("Reserve Free Intro") immediately in the opening paragraph.
  - Bound address dynamically via `{{ business.address.street }}` adhering to volatile-facts rules.
  - Aligned arrival instructions to refer to confirmation-specific arrival times.
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss`.

- **Private Coaching (`/private-lessons`)**:
  - Replaced misleading instant online booking CTA with SMS inquiry ("Ask About Private Availability — {{ pricing.visitorAndSupport.privateCoachingSingle.displayPrice }}"), accurately explaining that private coaching is request-based.
  - Removed duplicate CTA button in hero.
  - Subordinated group training route without competing visual noise.
  - Linked route stylesheet `/assets/css/routes/site-18ac9c2704ce.min.css` in `extraCss`.

- **Shared Styles & Manifests**:
  - Built and verified route bundles (`npm run styles:routes`), minified CSS (`npm run styles:min`), and regenerated all output via `npm run build`.

## Verification results

All local static and headless browser checks pass cleanly:
1. `scripts/qa-above-fold.mjs` (Playwright across 28 route/viewport combinations: 375px, 390px, 768px, 1366px):
   - 0 horizontal scroll/overflow
   - All 7 routes have visible primary CTAs above the fold on all viewports
   - Valid headings, canonical tags, and meta descriptions verified
2. `npm run qa:volatile-facts`: PASSED (1056 files checked)
3. `npm run qa:schedule`: PASSED (No banned strings)
4. `npm run qa:links:static`: PASSED
5. `npm run qa:links:existence`: PASSED
6. `npm run qa:doctype`: PASSED (76 top-level HTML documents)
7. `npm run qa:css:links`: PASSED
8. `npm run qa:css:routes`: PASSED (104 routes, 3 bundles)
9. `npm run qa:css:design-contract`: PASSED (strict < 20480 gzip bytes)
10. `npm run qa:seo`: PASSED (5 child sitemaps, 280 canonical URLs)
11. `npm run qa:nav`: PASSED (desktop and mobile navigation across all required surfaces)
12. `npm run qa:schema`: PASSED
13. `npm run validate:release5`: PASSED (0 warnings)
14. `npm run qa:desktop:topbar`: PASSED (0 failures)
15. `npm run qa:sticky-overlap`: PASSED

