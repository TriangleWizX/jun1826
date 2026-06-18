# Runbook: Sitemaps

## When To Use

Use after adding/removing indexable pages or changing canonical URLs.

## Preconditions

- Final URL set is confirmed.
- Redirect updates are already in place.
- URL contract is current in `docs/url-contract.md` and `config/url-contract.json`.
- Sitemap ownership rules are followed:
  - `sitemap.xml` is a sitemap index only.
  - `pages-sitemap.xml` owns canonical page URLs, `/bjj-videos`, and `/videos/<category>` hub pages.
  - `blog-sitemap.xml` owns canonical `/blog/*` URLs only.
  - `video-sitemap.xml` owns `/videos/<watch-page>` URLs only.
  - A URL must appear in exactly one child sitemap.

## Steps

1. Regenerate page/blog child sitemaps from repo HTML sources:
   ```bash
   npm run sitemaps:pages-blog
   ```
   Notes:
   - This generator is the primary source for `pages-sitemap.xml` and `blog-sitemap.xml`.
   - It enforces ownership: `/blog` and `/blog/*` only in `blog-sitemap.xml`.
2. Rebuild the video sitemap when watch pages change:
   ```bash
   npm run videos:sitemap
   ```
3. Run cross-sitemap overlap guard:
   ```bash
   npm run qa:sitemaps:overlap
   ```
4. Rebuild the sitemap index:
   ```bash
   npm run sitemaps:index
   ```
   Or run both in one step:
   ```bash
   npm run sitemaps:build
   ```
5. Run sitemap-aware QA:
   ```bash
   npm run qa:seo
   npm run qa:schema
   ```
   Optional live checks for redirected sitemap URLs:
   ```bash
   npm run qa:meta:live
   ```
   Quick static guard for trailing-slash `<loc>` values in child sitemaps:
   ```bash
   rg -n "<loc>https://senseisandy.com/.+/$" pages-sitemap.xml blog-sitemap.xml video-sitemap.xml
   ```
6. Confirm sitemap endpoints return 200:
   - `https://senseisandy.com/sitemap.xml`
   - `https://senseisandy.com/pages-sitemap.xml`
   - `https://senseisandy.com/blog-sitemap.xml`
   - `https://senseisandy.com/video-sitemap.xml`
   Useful status check format:
   ```bash
   for u in \
     https://senseisandy.com/sitemap.xml \
     https://senseisandy.com/pages-sitemap.xml \
     https://senseisandy.com/blog-sitemap.xml \
     https://senseisandy.com/video-sitemap.xml; do
     curl -sSI "$u" | sed -n '1p;/^location:/Ip'
   done
   ```
   For canonical no-slash verification on a suspect URL:
   ```bash
   curl -sSI https://senseisandy.com/blog/gi-vs-no-gi-bjj-cheat-code | sed -n '1p;/^location:/Ip'
   curl -sSI https://senseisandy.com/blog/gi-vs-no-gi-bjj-cheat-code/ | sed -n '1p;/^location:/Ip'
   ```
7. Confirm `robots.txt` lists only:
   - `Sitemap: https://senseisandy.com/sitemap.xml`
8. Deploy sitemap files.
9. Submit/refresh only the index in Google Search Console.

## Rollback Plan

1. Restore previous `sitemap.xml`, `pages-sitemap.xml`, `blog-sitemap.xml`, and `video-sitemap.xml`.
2. Redeploy and validate sitemap endpoints.

## Verification Checklist

- `https://senseisandy.com/sitemap.xml` returns 200.
- `https://senseisandy.com/pages-sitemap.xml` returns 200.
- `https://senseisandy.com/blog-sitemap.xml` returns 200.
- `https://senseisandy.com/video-sitemap.xml` returns 200.
- No redirected URLs in any child sitemap.
- No URL is duplicated across `pages-sitemap.xml`, `blog-sitemap.xml`, and `video-sitemap.xml`.
- `/blog/*` URLs are only in `blog-sitemap.xml`.
- `/bjj-videos` and `/videos/<category>` hub URLs are only in `pages-sitemap.xml`.
- `/videos/<watch-page>` URLs are only in `video-sitemap.xml`.

## Reference

Sitemap standards: `docs/seo/sitemaps.md`
