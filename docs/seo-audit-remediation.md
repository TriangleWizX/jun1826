# SEO Audit Remediation

## Summary

This remediation inspected rendered Eleventy output and the URL registry for the specified indexing and metadata routes. Public class, program, partner, resource, editorial, and source pages are indexable and included in the appropriate sitemap. Student utilities remain `noindex, follow` and are excluded from XML sitemaps.

The final rendered head is owned by `src/_includes/components/head-metadata.njk`. Legacy embedded document shells in glossary/source content were stripped at the shared Eleventy transform so they cannot create duplicate descriptions or canonicals.

## Root Causes

- The URL registry marked several public routes `indexable: false`; the shared metadata system correctly emitted `noindex, follow` from that registry policy.
- Glossary and the Kodokan source pages contained nested legacy `<html><head>` shells inside `layouts/base.njk`, creating duplicate descriptions and canonicals in rendered HTML.
- `report-card` and `student-hub` use front-matter `robots: "noindex, follow"`; the regression check now parses both attribute orders used by the renderer.
- The Gi vs No-Gi article had an empty description front-matter value.
- `/bjj-classes/woodstock-ny` was restored as a source-owned public location route, with a shorter title, self-canonical, and locations sitemap membership.

## Indexing Decisions

| URL | Previous State | Classification | Action | Final State | Reason |
|---|---|---|---|---|---|
| `/bjj-classes` | noindex | PUBLIC_SEARCH_PAGE | remove registry noindex; add core sitemap membership | indexable | public class/location discovery hub |
| `/black-belt-concierge` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | public coaching offer |
| `/blog/bio-ginastica-mobility` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add blog sitemap membership | indexable | public editorial article |
| `/blog/onteora-park-summer-activities-catskills` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add blog sitemap membership | indexable | public local editorial article |
| `/community-partners` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | public partner discovery page |
| `/elite-concierge` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | public coaching offer |
| `/phoenicia-diner` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | public partner page |
| `/report-card` | noindex | PRIVATE_OR_UTILITY_PAGE | retain noindex; exclude from sitemap | noindex, follow | student-facing utility |
| `/school-families-jiu-jitsu` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | public family/program page |
| `/show-up-kit` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | useful public first-class resource |
| `/student-hub` | noindex | PRIVATE_OR_UTILITY_PAGE | retain noindex; exclude from sitemap | noindex, follow | student utility |
| `/summer-academy` | noindex | PUBLIC_SEARCH_PAGE | make indexable; add core sitemap membership | indexable | public seasonal program page |
| `/bjj-classes/woodstock-ny` | overlong production title; source route absent | PUBLIC_SEARCH_PAGE | restore the existing route in source, shorten title, use self-canonical, add to locations sitemap | indexable | verified search demand and Woodstock-to-Tannersville class discovery intent justify retaining the route |

## Metadata Findings

- Rendered glossary representatives (`/bjj-glossary`, `/bjj-glossary/armbar`, `/bjj-glossary/back-control`, `/bjj-glossary/butterfly-guard`, `/bjj-glossary/bridge`) now each contain exactly one description and one canonical.
- `/blog/gi-vs-no-gi-bjj-cheat-code` now has one unique description: “Gi vs. No-Gi BJJ explained for beginners: understand the key differences, what each class develops, and how to choose your starting point.”
- `/sources/kodokan-etiquette` is a short reference/source page, not a search landing page. Its maintained source context and internal glossary link are legitimate; no filler expansion or word-count gate was added.
- `/bjj-classes/woodstock-ny` now uses the title “Brazilian Jiu-Jitsu Near Woodstock, NY | Sensei Sandy BJJ” and is represented by the restored source route rather than a production-only legacy surface.
- Metadata ownership remains centralized in `head-metadata.njk`; the glossary/source cleanup is a shared output fix, not a page-by-page patch.

## False Positives

The scanner’s “multiple meta descriptions” warning is not valid when it counts viewport, robots, Twitter, or Open Graph tags. The rendered regression test counts only `meta[name="description"]`. Actual duplicate descriptions/canonicals caused by embedded document shells were fixed.

## Changes Made

- Updated indexability and sitemap groups in `data/url-registry.json` for confirmed public routes.
- Added the Gi vs No-Gi description in its source front matter.
- Added `scripts/qa-seo-remediation.mjs` and the `qa:seo:remediation` npm script.
- Added shared Eleventy cleanup for legacy embedded glossary/source document shells.
- Regenerated the XML sitemap set from the registry.
- Restored `src/bjj-classes/woodstock-ny/index.html` as the source-owned public route and included it in the locations sitemap.
- Preserved `report-card` and `student-hub` noindex directives.
- Did not change pricing, schedules, offers, business information, URLs, visual design, or unrelated functionality.

## Validation

- `npm run build` — passed.
- `npm run qa:seo:remediation` — passed for 13 public, 2 private, and 5 glossary routes.
- `npm run qa:seo` — passed.
- `npm run qa:schema` — passed.
- `npm run qa:links:static` — passed.
- `npm run validate:release5` — passed with 0 warnings.
- `npm run redirects:check` — passed.
- `git diff --check` — passed.
- Live route checks previously confirmed HTTPS, HSTS, canonical behavior, and key-route 200 responses; the rebuilt Woodstock route is pending this release’s production verification.

## Remaining Manual Review

- Review Search Console after sitemap/indexability changes.
- Run real-browser accessibility and Core Web Vitals checks when the browser harness is available.
