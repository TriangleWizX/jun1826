# Apache + Namecheap Ops

## Purpose

Document production hosting assumptions and safe deployment process for Apache on Namecheap.

## Environment Assumptions

- Hosting provider: Namecheap shared hosting (Apache)
- Rewrite rules: `.htaccess` in repo root
- Public root: account web root mapped to this project
- Primary crawl controls: `robots.txt`, `sitemap.xml` (index), `pages-sitemap.xml`, `video-sitemap.xml`
- Canonical redirect authority is `.htaccess`; cPanel `Force HTTPS Redirect` must stay `Off` for `senseisandy.com` and `www.senseisandy.com` to avoid redirect chains.
- Canonical host QA is deploy-blocking in this repo via `scripts/predeploy.sh` -> `scripts/qa-canonical-host-live.sh`.
- SSI include payload under `/_includes/` must be deployed intact; `/_includes/analytics-head.html` is required by many pages.

## Deploy Procedure

1. Confirm local QA:
   - `npm run qa:all`
   - `bash scripts/qa-canonical-host-live.sh` (deploy-blocking)
   - `bash scripts/qa-analytics-include-live.sh` (deploy-blocking for SSI analytics include parity)
   - if URL rules changed: `npm run redirects:sync`
   - if URL rules changed: `npm run redirects:check`
   - if URL rules changed: `npm run qa:redirects`
2. Confirm redirects and sitemap changes if URLs changed:
   - review `.htaccess`
   - review `config/url-contract.json` and `config/legacy-redirects.json`
   - review `sitemap.xml` (index)
   - review `pages-sitemap.xml`
   - review `video-sitemap.xml`
3. In cPanel `Domains`, confirm `Force HTTPS Redirect` is `Off` for both `senseisandy.com` and `www.senseisandy.com`.
4. Upload changed files to server (git pull or file sync, depending on hosting setup).
   - Ensure `_includes/` is not excluded as a hidden/system folder by the deploy method.
   - Confirm `/_includes/analytics-head.html` is present and readable by Apache (`0644` typical).
5. Confirm file permissions and timestamps on uploaded assets.
6. Purge/expire caches if host cache is enabled.
7. Validate production:
   - Homepage renders
   - Key conversion pages render
   - `robots.txt` and `sitemap.xml` return 200
   - `pages-sitemap.xml` and `video-sitemap.xml` return 200
   - No redirect loops
   - Canonical entrypoints are one hop:
     - `http://senseisandy.com/` -> `https://senseisandy.com/` (1 hop)
     - `https://www.senseisandy.com/` -> `https://senseisandy.com/` (1 hop)
     - `http://www.senseisandy.com/` -> `https://senseisandy.com/` (1 hop)

## Backup

Before deploy, keep at least:
- Latest `.htaccess` backup
- Latest sitemap backups: `sitemap.xml`, `pages-sitemap.xml`, `video-sitemap.xml`
- Database backup if API/data layer changed

## Verification Checklist

- `curl -I https://senseisandy.com/` returns 200
- Key paths return expected status codes
- New/changed redirects return 301 and resolve correctly
- `curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/` returns `https://senseisandy.com/ 1`
- Sitemap index is reachable and references expected child sitemaps
- Child sitemaps are reachable and include expected URLs

## Known Bad Symptom

- Redirect chain: `http://www.senseisandy.com/` -> `https://www.senseisandy.com/` -> `https://senseisandy.com/`.
- This indicates host/protocol canonicalization is split across layers instead of handled in one `.htaccess` hop.
- Most common fix is disabling cPanel `Force HTTPS Redirect` on both hosts so `.htaccess` remains canonical authority.

## Canonical Check Pass/Fail Examples

Pass examples:
```bash
$ curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://senseisandy.com/
https://senseisandy.com/ 1
$ curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/
https://senseisandy.com/ 1
```

Fail example:
```bash
$ curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/
https://senseisandy.com/ 2
```

## Rollback

1. Restore previous `.htaccess` and sitemap files (`sitemap.xml`, `pages-sitemap.xml`, `video-sitemap.xml`).
2. Restore previous changed HTML/CSS/JS files.
3. Re-run verification checklist.
