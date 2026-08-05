# Internal Linking Specification — SenseiSandy.com

## Direct Canonical Destinations
1. All internal hyperlinks MUST point directly to active 200-status canonical URLs.
2. Internal links MUST NEVER pass through 301 redirects or lead to 404/410 pages.
3. Pricing references link directly to `/options-pricing/`.
4. Acquisition calls to action link directly to `/free-bjj-intro-tannersville-ny/`.
5. Program links use clean canonical routes:
   - Kids: `/bjj-classes/kids-tannersville-ny/`
   - Teens: `/bjj-classes/teens-tannersville-ny/`
   - Adults: `/bjj-classes/adults-tannersville-ny/`

## Automated Validation
Ran `npm run validate` (`qa:links:static`, `qa:links:existence`, `qa:schedule`, `qa:doctype`). Passed 100% with 0 errors.
