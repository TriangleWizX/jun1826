# Automated XML Sitemap Specification — SenseiSandy.com

## Overview
`/sitemap.xml` is compiled dynamically during every Eleventy build via template `src/sitemap.xml.njk`.

## Inclusion & Exclusion Criteria
- **Included**: Active, 200-status, indexable canonical URLs with domain origin `https://senseisandy.com`.
- **Excluded**:
  - Redirect sources
  - `noindex, follow` pages (e.g. `/free-bjj-intro-tannersville-ny/confirmation/`)
  - 404 / 410 pages
  - Archived material (`_archive/`)
  - Duplicate URLs

## Robots Reference
`robots.txt` specifies:
```text
Sitemap: https://senseisandy.com/sitemap.xml
```
