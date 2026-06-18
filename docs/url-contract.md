# URL Contract

This contract defines canonical URL behavior for SenseiSandy.com.
Treat it as a public interface: links, canonicals, sitemaps, and redirects must follow these rules.

## Canonical Rules

1. HTTPS only.
2. Canonical host only: `senseisandy.com` (no `www`).
3. No trailing slash on non-root pages.
4. One canonical path per concept; legacy aliases are redirect-only.
5. `og:url` must appear exactly once and match the canonical URL string exactly.
6. `og:image` must appear exactly once and use an absolute `https://` URL.
7. Near alias routes are redirect-only and must not be generated as local pages.
8. `near/town-config.json` status contract:
   - `live`: generated near page
   - `alias`: mapping-only entry (no generated `near/<slug>/index.html`)
9. Internal links must point directly to canonical URLs (not redirecting slash variants).
10. Canonical URLs must resolve directly as `200` URLs (canonical targets must not redirect).

## Examples

1. Correct: `https://senseisandy.com/` | Incorrect: `http://senseisandy.com/`
2. Correct: `https://senseisandy.com/schedule` | Incorrect: `https://www.senseisandy.com/schedule`
3. Correct: `https://senseisandy.com/blog` | Incorrect: `https://senseisandy.com/blog/`
4. Correct: `https://senseisandy.com/adult-bjj` | Incorrect: `https://senseisandy.com/adults`
5. Correct: `https://senseisandy.com/options-pricing` | Incorrect: `https://senseisandy.com/options`
6. Correct: `https://senseisandy.com/bjj-videos` | Incorrect: `https://senseisandy.com/videos`
7. Correct: `https://senseisandy.com/teen-jiu-jitsu-tannersville-ny` | Incorrect: `https://senseisandy.com/teens`
8. Correct: `https://senseisandy.com/jiu-jitsu-safety-tannersville-ny` | Incorrect: `https://senseisandy.com/safety`
9. Correct: `https://senseisandy.com/near/catskill-ny` | Incorrect: `https://senseisandy.com/catskill-ny-jiu-jitsu`
10. Correct: `https://senseisandy.com/near/east-jewett-ny` | Incorrect: `https://senseisandy.com/near/jewett-ny`
11. Correct sitemap loc: `https://senseisandy.com/book-free-intro` | Incorrect sitemap loc: `https://senseisandy.com/book-free-intro/`
12. Correct canonical tag: `<link rel="canonical" href="https://senseisandy.com/programs">` | Incorrect canonical tag: `<link rel="canonical" href="https://www.senseisandy.com/programs/">`
13. Correct OG URL: `<meta property="og:url" content="https://senseisandy.com/blog">` | Incorrect OG URL: `<meta property="og:url" content="https://senseisandy.com/blog/">`
14. Correct OG image: `<meta property="og:image" content="https://senseisandy.com/assets/images/hero.webp">` | Incorrect OG image: `<meta property="og:image" content="/assets/images/hero.webp">`
15. Correct internal link: `<a href="/blog/takedown-defense">` | Incorrect internal link: `<a href="/blog/takedown-defense/">`
16. Correct internal link: `[Seated Guard Basics](/blog/seated-guard-basics)` | Incorrect internal link: `[Seated Guard Basics](/blog/seated-guard-basics/)`

## Source Of Truth

- Contract config: `config/url-contract.json`
- Legacy redirect map: `config/legacy-redirects.json`
- Near generation config: `near/town-config.json`
- Redirect QA: `scripts/qa-redirects.mjs`
- Static canonical-link QA: `scripts/qa-links-static.mjs`
- Live internal-link QA: `scripts/qa-links-live.mjs`
- Live blog slash/parity QA: `scripts/qa-blog-slash-live.mjs`
- Static blog canonical-link QA: `scripts/qa-blog-links-canonical-static.mjs`
