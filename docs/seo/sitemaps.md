# Sitemap Standards

## Purpose

Define what belongs in sitemap files and how updates are verified.

## Rules

- Include only canonical, indexable URLs.
- Exclude redirected, duplicate, noindex, and error URLs.
- Keep one canonical URL entry per live page.
- Use a sitemap index at `sitemap.xml` that references child sitemaps.
- Keep URL ownership exclusive across child sitemaps.
- `pages-sitemap.xml` owns canonical site pages, `/bjj-videos`, and `/videos/<category>` hub pages.
- `blog-sitemap.xml` owns canonical `/blog` and `/blog/*` URLs only.
- `video-sitemap.xml` owns `/videos/<watch-page>` URLs only.
- Keep video entries aligned with live video watch pages.

## Update Triggers

- New indexable page added.
- Page removed/deprecated.
- URL slug changed.
- Canonical target changed.
- Video watch page added/removed.
- Sitemap ownership change between page vs. video sitemaps.

## Proof

- Sitemap endpoint returns 200.
- Spot-check sitemap URLs for status 200.
- No URL appears in more than one child sitemap.
- Search Console shows sitemap accepted.

## Related

- Runbook: `docs/runbooks/sitemaps.md`
- Redirects: `docs/runbooks/redirects.md`
