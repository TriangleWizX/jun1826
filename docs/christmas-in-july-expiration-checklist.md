# Christmas in July Campaign Expiration Checklist

**Campaign Expiration Date:** July 31, 2026, 23:59:59 EDT  
**Post-Campaign Transition Date:** August 1, 2026  
**Redirect Destination:** `https://senseisandy.com/free-bjj-intro-tannersville-ny`

---

## Overview

The Christmas in July promotional campaign remains active through **July 31, 2026**. Starting **August 1, 2026**, the campaign must be decommissioned sitewide, redirecting campaign traffic to the primary Free Intro entry point.

---

## August 1, 2026 Action Items

### 1. Web Files & Markup
- [ ] **`index.html`**
  - Remove promotional banner / note mentioning Christmas in July (`.home-seasonal-promo` or inline alert).
  - Replace any campaign-specific CTAs with canonical `Reserve Your Free Intro`.
- [ ] **`options-pricing.html`**
  - Remove the "Limited local pilot: Through August 2, up to ten qualified first-time local students..." alert box (around line 187).
  - Ensure all CTAs lead directly to `/free-bjj-intro-tannersville-ny#booking-flow`.
- [ ] **`partials/home-seasonal-promo.html`**
  - Empty or remove inclusion reference in `index.html`.
- [ ] **`christmas-in-july-bjj-tannersville/index.html`**
  - Page is decommissioned and replaced by 301 redirect rule in `.htaccess` / `config/legacy-redirects.json`.

### 2. Redirect & Sitemap Configuration
- [ ] **`config/legacy-redirects.json`**
  - Add entry: `"/christmas-in-july-bjj-tannersville": "/free-bjj-intro-tannersville-ny"`
- [ ] **Run Redirect Sync:**
  - Execute `npm run redirects:sync` to compile `.htaccess`.
- [ ] **Sitemap Update:**
  - Exclude `/christmas-in-july-bjj-tannersville` from `tools/build-page-blog-sitemaps.mjs` and rebuild sitemaps (`npm run sitemaps:build`).

### 3. Structured Data & Metadata
- [ ] Ensure JSON-LD event schema for seasonal promotion is removed from `index.html` and `options-pricing.html`.
- [ ] Verify `scripts/qa-schema.mjs` passes with zero references to retired campaign events.

### 4. Administrative & Promotional Integration
- [ ] Deactivate external promotional codes or Calendly campaign tags in administrative dashboards (Calendly / Payment gateway).
- [ ] Verify form submissions route to default Free Intro intake.

### 5. Verification Commands
Run the following build and QA commands post-decommissioning:
```bash
python3 scripts/validate_offers.py
python3 scripts/validate_retired_language.py
npm run redirects:check
npm run sitemaps:build
npm run qa:all
python3 scripts/build.py
```
