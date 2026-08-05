# Confirmation Page Specification — SenseiSandy.com

## URL & Access
- Route: `/free-bjj-intro-tannersville-ny/confirmation/`
- Robots Meta: `noindex, follow`
- Sitemap Exclusion: Excluded from sitemap and navigation.

## Lead Event Deduplication
- Fires GA4 key event `generate_lead` ONLY once upon successful redirect.
- Uses `sessionStorage.setItem("ss_lead_fired", "true")` to prevent duplicate events on refresh or direct URL visits.
