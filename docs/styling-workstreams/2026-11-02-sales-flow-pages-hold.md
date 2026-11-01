# Sales flow pages: route and claims review

**Date:** 2026-11-02

**Decision:** Hold these pages from commit and deployment. Preserve the local source and generated files until the offer details and video asset are confirmed.

## Scope and reviewers

This review covered the dirty schedule links and three local pages: `sales-calculator.html`, `video-goal-session.html`, and `welcome-primer.html`.

The contextual persona router did not identify a suitable specialist. Its Static Site Generator candidate was a partial Markdown-to-HTML prompt, which did not fit route-to-output auditing. The pricing query returned an ambiguous SEO-only Solon candidate, also a poor fit. The work used ordinary specialist fallbacks: **Static Route and Canonical Path Auditor** and **Pricing and Public Claim Evidence Auditor**. Both were read-only and paired with `Instructions - CODE` (UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`), whose full source had been reviewed in the active goal plan. No attachments were needed.

| DoD | Read scope | Write scope | Result |
| --- | --- | --- | --- |
| `SALES-ROUTE-MAP-20261102` | Three page front matters, schedule links, `.htaccess`, local output paths | None | Found mismatched canonical and emitted paths; exact source findings below. |
| `SALES-CLAIMS-FACTS-20261102` | Three pages, `src/_data/pricing.json`, `src/_data/offers.json`, `src/_data/academy-metrics.json`, related SOPs | None | Found unsupported or mismatched price, urgency, and video claims; no page is release-ready. |

## Route findings

- The schedule links to `/video-goal-session` and `/sales-calculator`.
- All three pages declare extensionless canonical URLs, but the two explicit permalinks emit `.html` files. The welcome primer also emits `welcome-primer.html`, not an extensionless directory route.
- Local files under `dist/` are ignored by `.gitignore`; they are not release evidence. No corresponding `dist/<route>/index.html` output was found.
- `.htaccess` disables `MultiViews` and has no rewrite rule for these three paths. The current source and output do not establish that the extensionless links resolve.
- The source permalinks were corrected locally to emit `/sales-calculator/index.html`, `/video-goal-session/index.html`, and `/welcome-primer/index.html`; the extensionless canonical URLs and schedule links were left intact.
- Eleventy 3.1.6 built to the registered temporary output directory. It wrote all three directory-index pages with the intended titles and extensionless canonical URLs. SHA-256: sales calculator `9db1840909603736798aa22e1441a6b192202f1a7f171a8d60bacba8a3ce2a50`; video session `70662cd3f3014f7dba589207bbf88330dc416f6794cd50379b44f0e96719af50`; welcome primer `0491e2bcffe51c60d3e2439744adac69147dd8daa9a15cfe11c345cef61de1ef`. The shared CSS reference also resolved in the isolated output. Root `dist/` was not used or changed.

## Claim findings

- `sales-calculator.html` includes `$120/mo`, `$144` described as a sprint, `$150` for private coaching, and `$140` for a uniform. The canonical pricing data has no `$120` or `$140` entry. `$144` is the eight-session Alley Bootcamp pass. `$150` is a youth monthly tier, while a private coaching single is `$195`.
- The pages use the 12-student class cap as urgency or scarcity language. `academy-metrics.json` defines 12 as the maximum planned class size and explicitly says this is a coaching constraint, not scarcity messaging.
- `welcome-primer.html` promises a three-minute studio video, but the page contains no video, iframe, or media source; it shows a play icon over an image.
- The three pages and related sales SOPs are untracked. Those SOPs document intended routes and copy, but do not establish owner approval for public prices, the video session offer, or urgency claims.

## Release decision and next evidence

Do not commit or deploy this cohort yet. Keep the dirty source and ignored `dist/` outputs intact. Before release, obtain authoritative confirmation of the public offer values and video-session booking path, and provide the promised video or revise that claim. The local route correction remains uncommitted with the page content. After the facts are cleared, inspect the exact route payload and verify the live routes after deployment.

No browser session, network check, or Lighthouse/PageSpeed check was run. The temporary Eleventy output was removed after route verification; it occupied about 520 MiB. No public payload was deployed.

## Follow-up production route check — 2026-11-01

Read-only GET checks confirmed that production does not serve any of the three pages: extensionless, trailing-slash, and `.html` variants for `/sales-calculator`, `/video-goal-session`, and `/welcome-primer` all returned HTTP 404 (1,251-byte responses). The public `/schedule` route returned HTTP 200 (167,923 bytes; SHA-256 `89fea808237c255b6ae851142f46664b9cb9e9fa5c48bf46f5e8897024dc9a41`). Its HTML contains no links to the video session or calculator pages and contains 10 links each to the Kids and Teens routes.

This confirms the held schedule links and pages are local-only. The route fix alone is insufficient to publish them: the public offer details and video-session booking path remain unverified, and the welcome page still promises a video asset that is absent. No files were uploaded and no source or generated output was changed by the live check. No Lighthouse, PageSpeed, or form submission was performed.
