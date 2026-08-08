# Release 5 Local Evidence

Run date: 2026-08-08 (America/New_York)
Release candidate: commit `e438742`

## Baseline

- `git diff --check`: PASS
- `npm run build`: PASS
- `npm run validate:release5`: PASS — 12 HTML files, 2,031 generated files, 0 warnings
- Baseline commit: `e438742`, 158 files

## Bounded QA

PASS: schedule, funnel, static links, doctype, SSI integrity/leaks/homepage chain,
Eleventy SEO, lazy loading, hashed-JS parity, CSS links, and sticky-overlap checks.

Known local exceptions remain fail-closed:

- `qa:links:existence` and `qa:redirects` were not allowed to complete within the bounded run and remain unverified.

## Live read-only probes

At 2026-08-08, `https://senseisandy.com/` returned HTTP 200, `/free-bjj-intro-tannersville-ny/` returned the expected HTTP 301 to the slashless route, and `/sitemap.xml` and `/robots.txt` returned HTTP 200. These probes do not establish deployment provenance, browser behavior, form submission, analytics deduplication, or Search Console submission.
