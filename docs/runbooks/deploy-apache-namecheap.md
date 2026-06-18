# Runbook: Deploy on Apache (Namecheap)

## When To Use

Use for production deploys to SenseiSandy.com.

## Preconditions

- Local QA checks pass.
- Any URL changes include redirect updates.
- Any indexable page changes include sitemap updates.
- Backups prepared for `.htaccess` and sitemap files.
- In Namecheap cPanel `Domains`, `Force HTTPS Redirect` is `Off` for `senseisandy.com` and `www.senseisandy.com` when `.htaccess` handles canonicalization.
- Canonical host QA is deploy-blocking via `scripts/predeploy.sh` (`scripts/qa-canonical-host-live.sh`).
- Shared SSI include files under `/_includes/` are part of the deploy payload, including `/_includes/analytics-head.html`.
- Asset hash parity is deploy-blocking via `scripts/predeploy.sh` (`npm run build:assets` + `npm run qa:assets:canon`).
- URL contract remains aligned with:
  - `docs/url-contract.md`
  - `config/url-contract.json`
  - `config/legacy-redirects.json`

## Steps

1. Review files in current release diff.
2. Run QA:
   ```bash
   npm run build:assets
   npm run qa:assets:canon
   npm run qa:all
   ```
   Deploy-blocking canonical host checks:
   ```bash
   bash scripts/qa-canonical-host-live.sh
   ```
   Deploy-blocking SSI analytics include check:
   ```bash
   npm run qa:analytics:live
   ```
   If URL behavior changed, also run:
   ```bash
   npm run qa:redirects
   npm run qa:blog:slash:live
   ```
3. In cPanel `Domains`, confirm `Force HTTPS Redirect` is `Off` for both `senseisandy.com` and `www.senseisandy.com`.
4. Upload/deploy updated files to hosting.
   - Do not skip underscore-prefixed directories during upload.
   - Confirm `/_includes/analytics-head.html` exists on server and remains readable (`0644` typical on shared Apache hosting).
5. Confirm `.htaccess`, `robots.txt`, `sitemap.xml`, and core pages are in place.
   - `sitemap.xml` must be sitemap index format.
   - `pages-sitemap.xml` and `video-sitemap.xml` must exist.
   - Route parity check for Hunter comparison page:
     ```bash
     ls -la | grep -i martial-arts-hunter-ny
     grep -n "martial-arts-hunter-ny" .htaccess
     ```
6. Run post-deploy checks:
   - homepage, schedule, pricing, contact, booking path
   - 301 behavior for changed URLs
   - sitemap index + child sitemap accessibility
   - Hunter route behavior:
     ```bash
     for u in \
       https://senseisandy.com/martial-arts-hunter-ny \
       https://senseisandy.com/martial-arts-hunter-ny/ \
       https://senseisandy.com/martial-arts-hunter-ny.html; do
       echo "=== $u"
       curl -sSI "$u" | sed -n '1,8p'
     done
     ```
     Expected:
     - `/martial-arts-hunter-ny` -> `200`
     - `/martial-arts-hunter-ny/` -> `301` to clean URL
     - `/martial-arts-hunter-ny.html` -> `301` to clean URL
   - one-hop canonicalization checks:
     ```bash
     curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://senseisandy.com/
     curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' https://www.senseisandy.com/
     curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/
     ```
     Expected for all three: `https://senseisandy.com/ 1`
   - blog slash policy baseline/parity:
     ```bash
     npm run qa:blog:slash:live
     ```
     Expected: pass with no trailing-slash drift in live template parity report.
   - SSI + analytics include parity:
     ```bash
     npm run qa:analytics:live
     ```
     Expected: both `/options-pricing` and `/adult-bjj` pass with no SSI directive error text and GA include present.
   - hashed JS runtime asset availability (`HTTP 200` expected for each):
     ```bash
     for u in \
       https://senseisandy.com/js/glossary-filters.73c583.js \
       https://senseisandy.com/assets/js/ss-evidence-accordion.c9619a.js \
       https://senseisandy.com/js/voice-faq-accordion.2b6c27.js \
       https://senseisandy.com/js/book-free-intro-bridge.15e842.js?v=20260522 \
       https://senseisandy.com/js/videos-hub-filters.4b8913.js; do
       echo "=== $u"
       curl -sSI "$u" | sed -n '1,8p'
     done
     ```

## Tawk.to Chat Launch Checklist

Dashboard setup (Tawk admin):
- Pre-chat fields: `Name`, `Phone`, `Kids or Teens or Adults`, `Message`.
- Offline message text: `Leave your name + phone, we reply fast. Or text (917) 736-8649.`
- Enable Widget Scheduler for your business hours so offline flow appears outside staffed windows.
- Enable Lead Capture form trigger for unattended/hesitation states.
- Set mobile app agent status to `Online` or `Away` before traffic windows.

Code/runtime policy in this repo:
- Widget is loaded globally from shared footer includes.
- Visibility is allowlist-only for high-intent pages:
  - `/schedule`
  - `/kids`
  - `/teens`
  - `/adult-bjj`
  - `/anti-bully`
  - `/contact`
- Other pages keep the widget hidden by default.

2-minute QA:
1. Open a high-intent page in an incognito window (`/schedule` recommended) and confirm widget appears.
2. Send a test message and verify it lands in Tawk Inbox.
3. Reply from mobile app and confirm delivery.
4. Open a non-money page (for example `/blog`) and confirm widget is hidden.
5. Temporarily switch scheduler to offline and confirm offline form/message appears.

## Known Bad Symptom

- Redirect chain observed: `http://www.senseisandy.com/` -> `https://www.senseisandy.com/` -> `https://senseisandy.com/`.
- Typical cause: cPanel `Force HTTPS Redirect` is enabled for one or both domains, creating a host-preserving HTTPS hop before `.htaccess` can canonicalize to non-`www`.
- Fix: keep cPanel force-HTTPS toggles `Off` for both hosts and let `.htaccess` enforce HTTPS + non-`www` in one rule.

## Canonical Check Pass/Fail Examples

Pass examples:
```bash
$ curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/
https://senseisandy.com/ 1
$ curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' https://www.senseisandy.com/
https://senseisandy.com/ 1
```

Fail example (chain still present):
```bash
$ curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/
https://senseisandy.com/ 2
```

## Rollback Plan

1. Restore previous deploy files.
2. Restore previous `.htaccess` and sitemap files (`sitemap.xml`, `pages-sitemap.xml`, `video-sitemap.xml`).
3. Re-validate key routes and status codes.

## Verification Checklist

- Site returns 200 on core routes.
- Redirects return 301 without chains/loops.
- `http://www.senseisandy.com/` resolves to `https://senseisandy.com/` in one hop.
- Sitemap index loads and references expected child sitemaps.
- Child sitemaps load and contain expected canonical URLs.
- Conversion flow (book intro/contact) still works.

## Reference

Full ops doc: `docs/ops/apache-namecheap.md`
