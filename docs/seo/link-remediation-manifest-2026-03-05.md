# Link Remediation Manifest (2026-03-05)

## Scope

- Targeted file set only.
- Source: 39-row redirect audit supplied by user.

## Policy

- Internal links must point directly to canonical paths (no legacy/slash redirect sources).
- External links in known redirecting patterns must be direct when durable canonical targets exist.
- IBJJF signed S3 final URLs are never used (ephemeral).

## Mappings Applied

1. `https://www.nata.org/sites/default/files/FluidReplacementsForAthletes.pdf`
   -> `https://www.nata.org/sites/default/files/2025-08/FluidReplacementsForAthletes.pdf`
2. `https://www.iwuf.org/en/sport-wushu/competitive-wushu/sanda`
   -> `https://www.iwuf.org/en/sport-wushu/competitive-wushu/sanda/`
3. `https://link.springer.com/content/pdf/10.1007/s40894-025-00271-5.pdf?utm_source=chatgpt.com`
   -> `https://link.springer.com/article/10.1007/s40894-025-00271-5`
4. `https://ibjjf.com/rails/active_storage/blobs/redirect/.../20251220_IBJJF_Graduacao_EN.pdf`
   -> `https://ibjjf.com/graduation-system`
5. `https://ibjjf.com/rails/active_storage/blobs/redirect/.../graduation-system-monthly.pdf`
   -> `https://ibjjf.com/graduation-system`
6. `https://ibjjf.com/rails/active_storage/blobs/redirect/.../graduation-system-quarterly.pdf`
   -> `https://ibjjf.com/graduation-system`
7. `https://ibjjf.com/rails/active_storage/blobs/redirect/.../graduation-system-triannual.pdf`
   -> `https://ibjjf.com/graduation-system`
8. `https://ibjjf.com/rails/active_storage/blobs/redirect/.../2025_InfoPoster_Belts_EN.pdf`
   -> `https://ibjjf.com/graduation-system`
9. `https://ibjjf.com/rails/active_storage/blobs/redirect/.../2024JUN_IBJJF_Rules_EN.pdf`
   -> `https://ibjjf.com/books-videos`

## 39-Row Audit Status Summary

- `resolved_in_source_already`: all internal rows from the provided list (`/videos`, `/contact`, `/options-pricing`, `/near/*`, `/bjj-faqs`) were already canonical in current repo source.
- `requires_content_edit`: all redirecting external links in the targeted pages were updated per mappings above.
- `requires_deploy_parity_check`: rows where crawl output showed old internal redirects despite current source already canonical; validate live-vs-source during deploy QA.

## Touched Content Files

- `schedule.html`
- `bio.html`
- `blog/bjj-promotions-how-often/index.html`
- `blog/kids-teens-bjj-belts-ranks-stripes-promotions/index.html`
- `blog/gain-points-system/index.html`
- `blog/sanda-vs-jiu-jitsu/index.html`
- `blog/bjj-black-belt-degree-time/index.html`
- `blog/water-before-training-how-much-when/index.html`

## Closure Addendum (2026-03-05)

- Closure evidence doc: `docs/seo/external-3xx-closure-evidence-2026-03-05.md`
- Rows covered in closure package: 1-12 (all rows provided in the external 3xx subset for this remediation pass).
- Baseline gates:
  - `npm run -s qa:links:static` passed.
  - `npm run -s qa:blog:linkout:rules` passed.
- Live parity across affected pages confirms canonical replacement targets present and legacy redirect-source URLs absent.
- Redirect behavior evidence captured for first hop:
  - IBJJF blob URLs -> `302` to temporary signed S3 URLs (ephemeral).
  - Springer PDF URL -> `303` to Springer auth gateway.
  - NATA legacy PDF -> `301` to canonical 2025-08 path.
  - IWUF non-slash URL -> `301` to trailing-slash canonical.

## Recrawl Package Status

- Crawler-ready note and URL list included in:
  - `docs/seo/external-3xx-closure-evidence-2026-03-05.md`
- Recommended recrawl targets:
  - `https://senseisandy.com/schedule`
  - `https://senseisandy.com/bio`
  - `https://senseisandy.com/blog/bjj-promotions-how-often`
  - `https://senseisandy.com/blog/gain-points-system`
  - `https://senseisandy.com/blog/bjj-black-belt-degree-time`
  - `https://senseisandy.com/blog/water-before-training-how-much-when`
  - `https://senseisandy.com/blog/sanda-vs-jiu-jitsu`
