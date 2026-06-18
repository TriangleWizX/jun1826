# Runbook: Redirects

## When To Use

Use when adding/removing/changing URLs or consolidating content.

## Preconditions

- Old URL list and destination URLs are finalized.
- Destination URLs are live and canonical.
- No conflicting rewrite rules in `.htaccess`.
- `config/legacy-redirects.json` is updated to match intended legacy -> canonical mappings.

## Steps

1. Update redirect source-of-truth:
   - `config/legacy-redirects.json`
2. Sync generated legacy redirect rules into `.htaccess`:
   ```bash
   npm run redirects:sync
   ```
3. Verify `.htaccess` managed redirect block is in sync:
   ```bash
   npm run redirects:check
   ```
4. Keep one canonical destination per retired URL.
5. For near-town aliases, keep redirect rules in place and mark alias rows as `status: "alias"` in `near/town-config.json` (alias pages are not generated).
6. Keep legacy town slugs (for example `/catskill-ny-jiu-jitsu`, `/hunter-ny-jiu-jitsu`, `/cairo-ny-jiu-jitsu`) as redirect-only.
7. Never use legacy redirect source URLs as canonicals or sitemap `<loc>` entries.
8. Run static policy checks:
   ```bash
   npm run qa:links:static
   ```
9. Validate internal links resolve directly on live (no redirect targets in authored links):
   ```bash
   npm run qa:links:live -- --base-url https://senseisandy.com
   ```
10. Validate redirects from the config map:
   ```bash
   npm run qa:redirects
   ```
11. Validate blog slash canonicalization and production/source parity:
   ```bash
   npm run qa:blog:slash:live
   ```
12. Validate source links point directly to canonical blog URLs (not slash redirects):
   ```bash
   npm run qa:blog:links:canonical
   ```
13. Validate public pages reference minified shared CSS (`ss.min.css`) and not raw `ss.css`:
   ```bash
   npm run qa:css:links
   ```
14. Validate priority internal inlink targets:
   ```bash
   npm run qa:priority:inlinks
   ```
15. Validate blog link-out rules for monitored posts:
   ```bash
   npm run qa:blog:linkout:rules
   ```
16. Deploy `.htaccess` with redirect changes.
17. Spot-check critical URLs if needed:
   ```bash
   curl -I https://senseisandy.com/old-path
   ```
18. Update sitemap to include only canonical URLs.

### Canonical Regression Suite (Near Pages)

Run this focused sequence to validate canonical/sitemap/redirect consistency for live `/near/*` pages:

```bash
npm run qa:seo
npm run qa:links:static
npm run qa:near
npm run qa:redirects
```

Notes:
- `qa:seo` is the canonical+sitemap enforcement gate.
- `qa:redirects` validates alias redirect behavior but may include unrelated failures that should be triaged separately.

## Redirect Correctness vs Direct-Link Correctness

- Redirect correctness means old/slash URLs return a `301` and resolve to canonical targets.
- Direct-link correctness means internal links already point at canonical targets, so crawlers do not discover canonical pages only through redirects.
- Ahrefs can report weak/no internal inlinks on a canonical URL when the source page links to a redirecting variant instead of linking directly to the final URL.

## Why Live Crawl Can Differ From Repo Source

When a crawl report disagrees with local source links, check deploy parity before editing broadly:

1. Confirm the crawler is hitting the current deploy (not a cached or older environment).
2. Verify generated artifacts/templates on server match current repo output.
3. Spot-check live HTML against local source for affected pages:
   ```bash
   curl -sS https://senseisandy.com/near/hunter-ny | rg -n "options-pricing|contact"
   curl -sS https://senseisandy.com/videos/4pm-kid-takedowns-tannersville-isrhsakxmco | rg -n "Back to all videos|/videos"
   ```
4. Re-run static QA locally (`npm run qa:links:static`) before and after deploy.
5. Re-run live QA (`npm run qa:links:live`) after deploy to catch stale output regressions.

## External Redirect-Source Closure Protocol

Use this protocol when a crawler flags external links that return `3xx` and source may already be remediated.

1. Confirm source state first:
   - `npm run qa:links:static`
   - `npm run qa:blog:linkout:rules`
2. Run targeted source grep against flagged redirect-source patterns in affected files.
3. Validate live parity for affected pages:
   - Fetch live HTML (`curl -sS https://senseisandy.com/<path>`)
   - Confirm canonical external targets are present.
   - Confirm legacy redirect-source URLs are absent.
4. Capture first-hop redirect evidence for each flagged legacy URL:
   - `curl -sS -D - -o /dev/null <legacy-url>`
   - Record status + `Location` + destination class.
5. Document closure in a dated evidence artifact under `docs/seo/`.
6. Provide a recrawl packet (rows covered, timestamps, affected URLs, evidence link).

### Required Evidence Fields

- Audit row IDs covered.
- Repo verification timestamp.
- Live parity verification timestamp.
- Command gate outcomes (`qa:links:static`, `qa:blog:linkout:rules`).
- Per-page parity result (`canonical present`, `legacy absent`).
- First-hop redirect table for each flagged legacy URL.

### Classification Rule: Source-Fixed vs Crawler-Stale

- `source_fixed`: repo source and live HTML both point to canonical targets and omit legacy redirect-source URLs.
- `crawler_stale_or_parity_issue`:
  - If source is fixed but live HTML still shows legacy URLs -> deploy parity issue.
  - If source and live are fixed but crawler still reports legacy rows -> stale crawl data; submit recrawl with evidence.

For the current blog slug checks:

```bash
curl -I https://senseisandy.com/blog/seated-guard-basics
curl -I https://senseisandy.com/blog/seated-guard-basics/
curl -I https://senseisandy.com/blog/takedown-defense
curl -I https://senseisandy.com/blog/takedown-defense/
```

Expected:

- Non-slash URL returns `200`.
- Slash URL returns `301` with `Location` set to the non-slash URL.

## Intermittent 502 Check (Blog Reliability)

Use this after deploy when a page has shown intermittent 5xx (for example `/blog/seated-guard-basics`):

```bash
for i in {1..20}; do curl -sS -o /dev/null -w '%{http_code} %{time_total}\n' https://senseisandy.com/blog/seated-guard-basics; done
for i in {1..20}; do curl -sS -o /dev/null -w '%{http_code} %{time_total}\n' https://senseisandy.com/blog/seated-guard-basics/; done
```

If any response is `5xx`:

```bash
curl -i https://senseisandy.com/blog/seated-guard-basics
curl -i https://senseisandy.com/blog/seated-guard-basics/
npm run qa:blog:slash:live
```

Then verify Apache/cPanel canonicalization settings per `docs/runbooks/deploy-apache-namecheap.md` (single-hop canonical redirects, no conflicting cPanel force-HTTPS hops).

## Rollback Plan

1. Restore previous `.htaccess`.
2. Restore previous `config/legacy-redirects.json` if changed.
3. Redeploy and re-check affected URLs.

## Verification Checklist

- Old URL returns `301` to expected new URL.
- Final URL returns `200`.
- No redirect loops/chains.
- All configured legacy redirects resolve in `<=1` hop.
- Navigation and internal links point to canonical URL.
- No generated files remain for alias near routes (for example `near/<alias-slug>/index.html`).
- No authored internal links target URLs returning `301`, `302`, or `307`.
