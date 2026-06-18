# External 3xx Closure Evidence (2026-03-05)

## Scope

- Audit rows covered: 1-12 from the user-supplied external 3xx export.
- Affected public pages:
  - `https://senseisandy.com/schedule`
  - `https://senseisandy.com/bio`
  - `https://senseisandy.com/blog/bjj-promotions-how-often`
  - `https://senseisandy.com/blog/gain-points-system`
  - `https://senseisandy.com/blog/bjj-black-belt-degree-time`
  - `https://senseisandy.com/blog/water-before-training-how-much-when`
  - `https://senseisandy.com/blog/sanda-vs-jiu-jitsu`

## Canonical External Targets Enforced

- `https://ibjjf.com/graduation-system`
- `https://ibjjf.com/books-videos`
- `https://link.springer.com/article/10.1007/s40894-025-00271-5`
- `https://www.nata.org/sites/default/files/2025-08/FluidReplacementsForAthletes.pdf`
- `https://www.iwuf.org/en/sport-wushu/competitive-wushu/sanda/`

## Baseline Repo Evidence

Timestamp: `2026-03-05 16:24:33 UTC` (`2026-03-05 11:24:33 EST`)

- `npm run -s qa:links:static` -> pass
- `npm run -s qa:blog:linkout:rules` -> pass
- Targeted source grep over affected files for legacy patterns:
  - `ibjjf.com/rails/active_storage/blobs/redirect/`
  - `link.springer.com/content/pdf/10.1007/s40894-025-00271-5.pdf`
  - `www.nata.org/sites/default/files/FluidReplacementsForAthletes.pdf`
  - non-slash IWUF sanda URL
- Result: no matches in source for affected file set.

## Live Parity Verification (senseisandy.com)

Timestamp: `2026-03-05 16:24 UTC` (network-verified live fetch)

| Page | Canonical replacements found | Legacy patterns found |
|---|---|---|
| `/schedule` | `https://ibjjf.com/books-videos` | no |
| `/bio` | `https://ibjjf.com/graduation-system` | no |
| `/blog/bjj-promotions-how-often` | `https://ibjjf.com/graduation-system` | no |
| `/blog/gain-points-system` | `https://link.springer.com/article/10.1007/s40894-025-00271-5` | no |
| `/blog/bjj-black-belt-degree-time` | `https://ibjjf.com/graduation-system` | no |
| `/blog/water-before-training-how-much-when` | `https://www.nata.org/sites/default/files/2025-08/FluidReplacementsForAthletes.pdf` | no |
| `/blog/sanda-vs-jiu-jitsu` | `https://www.iwuf.org/en/sport-wushu/competitive-wushu/sanda/`, `https://ibjjf.com/graduation-system` | no |

## Redirect Behavior Capture (First Hop)

Timestamp: `2026-03-05 16:24 UTC`

| Legacy URL (from rows) | First hop status | First hop destination class | Notes |
|---|---|---|---|
| IBJJF rules blob (`2024JUN_IBJJF_Rules_EN.pdf`) | `302` | `temporary_signed_s3` | Redirects to time-limited `website-ibjjf-production.s3.amazonaws.com` URL. |
| IBJJF graduation blob (`20251220_IBJJF_Graduacao_EN.pdf`) | `302` | `temporary_signed_s3` | Time-limited signed URL. |
| IBJJF info poster blob (`2025_InfoPoster_Belts_EN.pdf`) | `302` | `temporary_signed_s3` | Time-limited signed URL. |
| IBJJF kids quarterly blob | `302` | `temporary_signed_s3` | Time-limited signed URL. |
| IBJJF kids monthly blob | `302` | `temporary_signed_s3` | Time-limited signed URL. |
| IBJJF kids triannual blob | `302` | `temporary_signed_s3` | Time-limited signed URL. |
| Springer content PDF URL (`utm_source=chatgpt.com`) | `303` | `auth_gateway` | Redirects to `idp.springer.com/authorize`. |
| NATA legacy PDF URL | `301` | `canonical_file_move` | Redirects to `/sites/default/files/2025-08/FluidReplacementsForAthletes.pdf`. |
| IWUF non-slash sanda URL | `301` | `canonical_slash` | Redirects to trailing slash variant. |

Policy note: IBJJF signed S3 destinations are ephemeral and are not valid direct-link targets for source content.

## Row Coverage Map (1-12)

- Rows 1, 5, 7, 9, 10, 11, 12: IBJJF blob URLs -> replaced with canonical `https://ibjjf.com/graduation-system` or `https://ibjjf.com/books-videos` in source.
- Row 2: IBJJF graduation blob on `/bio` -> replaced with `https://ibjjf.com/graduation-system`.
- Row 3: IBJJF graduation blob on `/blog/bjj-promotions-how-often` -> replaced with `https://ibjjf.com/graduation-system`.
- Row 4: Springer PDF URL -> replaced with `https://link.springer.com/article/10.1007/s40894-025-00271-5`.
- Row 6: NATA old PDF path -> replaced with `/sites/default/files/2025-08/FluidReplacementsForAthletes.pdf`.
- Row 8: IWUF non-slash URL -> replaced with trailing-slash canonical URL.

## Recrawl Package

### Recrawl Note (copy/paste)

External 3xx remediation for rows 1-12 is complete and live on `https://senseisandy.com` as of `2026-03-05 16:24 UTC`.

- Source validation: static QA passed; legacy redirect-source patterns absent in affected files.
- Live parity validation: affected pages contain canonical targets and do not contain legacy redirect-source URLs.
- Redirect evidence captured for legacy URLs (IBJJF signed-S3, Springer auth gateway, NATA canonical file move, IWUF slash canonicalization).

Please recrawl these pages:
- `https://senseisandy.com/schedule`
- `https://senseisandy.com/bio`
- `https://senseisandy.com/blog/bjj-promotions-how-often`
- `https://senseisandy.com/blog/gain-points-system`
- `https://senseisandy.com/blog/bjj-black-belt-degree-time`
- `https://senseisandy.com/blog/water-before-training-how-much-when`
- `https://senseisandy.com/blog/sanda-vs-jiu-jitsu`

## Post-Deploy Verification Gate

- `npm run -s qa:links:static` -> pass (post-implementation rerun).
- `npm run -s qa:blog:linkout:rules` -> pass (post-implementation rerun).
- Live parity checks (post-implementation rerun):
  - `/schedule|canonical_hits=1|legacy_hits=0`
  - `/bio|canonical_hits=2|legacy_hits=0`
  - `/blog/bjj-promotions-how-often|canonical_hits=4|legacy_hits=0`
  - `/blog/gain-points-system|canonical_hits=2|legacy_hits=0`
  - `/blog/bjj-black-belt-degree-time|canonical_hits=6|legacy_hits=0`
  - `/blog/water-before-training-how-much-when|canonical_hits=1|legacy_hits=0`
  - `/blog/sanda-vs-jiu-jitsu|canonical_hits=2|legacy_hits=0`

Final verification timestamp: `2026-03-05 16:33:34 UTC` (`2026-03-05 11:33:34 EST`).

## Robots Header Remediation (Video URLs)

Timestamp: `2026-03-05 17:43:35 UTC` (`2026-03-05 12:43:35 EST`)

### Change Summary

- Removed query-parameter noindex behavior from `.htaccess`:
  - deleted `NOINDEX_PARAMS` env assignment on tracking params (`utm_*`, `gclid`, `fbclid`, `msclkid`, `src`, `ref`, `loc`)
  - deleted `X-Robots-Tag: noindex, follow` header emission tied to `NOINDEX_PARAMS`
- Preserved existing noindex controls for intended non-index routes:
  - `NOINDEX` (`/near/template`, `/curriculum`)
  - `NOINDEX_TXN` (`/checkout`)
  - `FORCE_INDEX` overrides remain intact

### Repo Guardrail

- Added QA assertion in `scripts/qa-seo.mjs` to fail if query-parameter noindex header behavior (`NOINDEX_PARAMS`) is reintroduced.

### Verification Evidence

Commands run:

- `npm run -s qa:seo` -> pass
- `curl -sS -I https://senseisandy.com/videos/brazilian-jiu-jitsu-beginner-intro-wednesday-no-gi-rwevpph8aei`
- `curl -sS -I 'https://senseisandy.com/videos/brazilian-jiu-jitsu-beginner-intro-wednesday-no-gi-rwevpph8aei?utm_source=test'`

Observed header summary:

- Clean URL: `HTTP/2 200`; no `X-Robots-Tag` response header present.
- UTM URL: `HTTP/2 200`; no `X-Robots-Tag` response header present.

### Recrawl Note (Robots Issue)

Robots-header remediation is complete for tracked public video URLs as of `2026-03-05 17:43:35 UTC`.

- Clean and tracked variants for sampled `/videos/*` URL return `200` with no blocking `X-Robots-Tag`.
- Page-level robots meta on watch pages remains `index, follow`.
- Query-parameter noindex behavior has been removed and is now guarded in repo QA.

Please recrawl affected video URLs, including:

- `https://senseisandy.com/videos/brazilian-jiu-jitsu-beginner-intro-wednesday-no-gi-rwevpph8aei`
- `https://senseisandy.com/videos/brazilian-jiu-jitsu-teens-wednesday-no-gi-etzmjyzfgkk`
- `https://senseisandy.com/videos/friday-tannersville-kids-bjj-qf48jtbhjug`
- `https://senseisandy.com/videos/kids-teens-adult-brazilian-jiu-jitsu-friday-night-fmjtbqbn3fg`
- `https://senseisandy.com/videos/monday-tannersville-jiu-jitsu-vpcr667cyag`
- `https://senseisandy.com/videos/tuesday-tannersville-brazilian-jiu-jitsu-xxsca476zue`

## URL Heuristic Exception Record (/videos)

Superseded on 2026-05-06: the canonical video library moved from `/videos` to `/bjj-videos`; `/videos` now redirects to `/bjj-videos` while `/videos/<category>` and `/videos/<watch-page>` remain valid video paths.

Decision date: `2026-03-05`

- Affected URL: `https://senseisandy.com/videos`
- External tool symptom: "Poorly formatted URL for SEO" (keyword check failure)
- Decision: retain `/videos` as canonical (no migration to `/bjj-videos`)
- Scope: third-party heuristic flag handling only; not a crawl/indexability defect

### Validation checklist (completed)

- Canonical tag self-references: `https://senseisandy.com/videos`
- Robots meta remains indexable (`index, follow`)
- URL is present in `pages-sitemap.xml`
- Internal nav/footer links use `/videos`
- Redirect alias posture preserved (`/bjj-videos` -> `/videos` 301; legacy variants -> canonical targets)

### QA workflow update

- `scripts/qa-seo.mjs` now classifies this exact case as `accepted_exception` for:
  - `ubersuggest/seo_non_friendly_url.csv`
  - `ubersuggest/seo_friendly_url_characters_check.csv`
- Exception remains visible in output and does not fail QA.

### Re-evaluation triggers (8+ week threshold)

Revisit canonical slug migration only if one or more conditions hold for at least 9 consecutive weeks:

- Meaningful ranking/CTR underperformance on "bjj videos" query cluster versus baseline.
- Multiple independent data sources indicate URL semantics are materially limiting discovery.
- Full migration readiness exists (complete redirect/inlink/canonical/sitemap coverage plus monitoring window).

## URL Heuristic Exception Record (/teens)

Superseded on 2026-05-06: the canonical teen program moved from `/teens` to `/teen-jiu-jitsu-tannersville-ny`; `/teens` now redirects to the keyworded program slug.

Decision date: `2026-04-20`

- Affected URL: `https://senseisandy.com/teens`
- External tool symptom: "Poorly formatted URL for SEO" (keyword check failure)
- Decision: retain `/teens` as canonical (no migration to a keyword-expanded slug)
- Scope: third-party heuristic flag handling only; not a crawl/indexability defect

### Validation checklist (completed)

- Canonical tag self-references: `https://senseisandy.com/teens`
- Robots meta remains indexable (`index, follow`)
- URL is present in `pages-sitemap.xml`
- Internal nav/footer links use `/teens`
- Existing canonical URL architecture remains unchanged (no redirect/sitemap/inlink migration required)

### QA workflow update

- `scripts/qa-seo.mjs` now classifies this exact case as `accepted_exception` for:
  - `ubersuggest/seo_non_friendly_url.csv`
  - `ubersuggest/seo_friendly_url_characters_check.csv`
- Exception remains visible in output and does not fail QA.

### Re-evaluation triggers (8+ week threshold)

Revisit canonical slug migration only if one or more conditions hold for at least 8 consecutive weeks:

- Meaningful ranking/CTR underperformance on teen-intent query clusters versus baseline.
- Multiple independent data sources indicate URL semantics are materially limiting discovery.
- Full migration readiness exists (complete redirect/inlink/canonical/sitemap coverage plus monitoring window).
