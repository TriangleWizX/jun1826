# SEO + Trust Hardening Checklist

## Redirect and canonical checks (production)
```bash
curl -I https://senseisandy.com/bjj-videos
curl -I https://senseisandy.com/near/hunter-ny
curl -I https://senseisandy.com/bjj-faqs
curl -I https://senseisandy.com/adult-bjj
curl -I http://senseisandy.com/
curl -I https://www.senseisandy.com/
curl -I http://www.senseisandy.com/
curl -I https://senseisandy.com/adults
curl -I https://senseisandy.com/options
curl -I https://senseisandy.com/tannersville-bjj-video-library
curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' https://senseisandy.com/adults
curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://senseisandy.com/
curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' https://www.senseisandy.com/
curl -Ls -o /dev/null -w '%{url_effective} %{num_redirects}\n' http://www.senseisandy.com/
```

## Crawl surface checks
```bash
curl -I https://senseisandy.com/robots.txt
curl -I https://senseisandy.com/sitemap.xml
curl -I https://senseisandy.com/pages-sitemap.xml
curl -I https://senseisandy.com/video-sitemap.xml
```

## Live metadata checks
```bash
npm run qa:meta:live -- --base-url https://senseisandy.com
```

## Notes
- FAQ schema can remain for UX/helpfulness, but rich-result visibility should not be treated as a primary KPI.
- CSP is intentionally in `Report-Only` mode during tuning. Review logged violations for at least 7 days before enforcement.
- Before publishing new links, run `curl -I <url>` and verify authored targets resolve directly to `HTTP 200` (no 301/302/307 chains).
- Acceptance criteria: internal links resolve `200`, no redirecting authored targets, and no redirect chains.
