# Blog current-source route and generated-output audit — 2026-11-01

## Scope and method

- Candidate source: clean detached worktree at `535e5aae`; candidate release commit: `71f1278e`.
- Fresh `npm run build` completed successfully in the isolated worktree. The main checkout `dist/` was not used.
- The current mapper produced exactly 99 paths: 90 HTML outputs and 9 CSS outputs. All 99 were fetched from production using read-only HTTP GETs; no forms or links were activated.
- Route paths were mapped from `.../index.html` to their public directory URL. Production redirects were followed. HTML comparison checks status, title, description, canonical, H1, visible-text similarity (excluding nav/footer/script/style), and referenced asset set. CSS comparison is byte-for-byte. Similarity is a screening measure; any mismatch is reported, not treated as proof of equivalence.
- Result capture completed in 32.1 seconds.

## Summary

- Public fetch: all 99 mapped URLs completed; 97 returned HTTP 200 and two candidate-only CSS fingerprints returned HTTP 404. The second hash pass also completed all 99 requests with no network errors.
- HTML mismatch categories (90 routes): title differs on 2, description on 2, canonical on 1, and H1 on 2; these overlap. Normalized visible text is below 0.995 similarity on 90/90 routes. Asset-reference sets differ on 90/90 routes, including production-only logo/header references absent from the clean candidate output.
- CSS: 6/9 files matched candidate bytes exactly.
- Blog route inline `:focus-visible` rule: candidate 87/87, production 85/87.
- The production responses for the two CSS 404s are not candidate CSS bytes. They are candidate-only new fingerprints not yet present at those URLs.
- No mapped HTML output is proven safe to replace. The differences in text, metadata, and asset references cannot be caused by the CSS rules alone.

## CSS results

| Mapped output | HTTP | Candidate bytes | Production bytes | Exact | Production SHA-256 | Badge wrap rule | Focus rule |
| --- | ---: | ---: | ---: | --- | --- | --- | --- |
| `assets/css/blog.cc6577.css` | 404 | 39272 | 1251 | False | `4c13d452dd5d49671bd93ca32f2b4f85c78e39b6ab0ad1f38d98ed267f8fd896` | False | False |
| `assets/css/blog.css` | 200 | 39272 | 39064 | False | `edd6cee081ac48ce4ba9e7f89ff8e67086588d4c5043c32bbc7ebfcae291b25f` | False | True |
| `assets/css/blog.min.css` | 200 | 34525 | 34525 | True | `e11073b7d97f4e8911875fafb0d1e5d7f6d52e684c0f558ea9c3327d45eca4a0` | False | True |
| `assets/css/pages/adults-delivery.b64270844d52.css` | 200 | 11879 | 11879 | True | `b64270844d52e5ba438909a61f51c1003e007897d35dc738ee564d5411209022` | False | False |
| `assets/css/pages/article-delivery.d7324c9b8349.css` | 404 | 108843 | 1251 | False | `4c13d452dd5d49671bd93ca32f2b4f85c78e39b6ab0ad1f38d98ed267f8fd896` | False | False |
| `assets/css/pages/kids-delivery.21fed56d05d6.css` | 200 | 91191 | 91191 | True | `21fed56d05d6d11ea52ce9819c1625c98b5d93d633bd2b105557ef4f9f705a24` | False | False |
| `assets/css/pages/teens-delivery.767b2c0c453d.css` | 200 | 12045 | 12045 | True | `767b2c0c453d64e5f32ae51fc65461f79d9557e2cf0067817c1a4968cf9a460a` | False | False |
| `assets/css/routes/site-adults-delivery.d027512ba43b.css` | 200 | 33955 | 33955 | True | `d027512ba43b0cb6be02562bb6889b833780b1346fafb808e9b0e4daa088e7b9` | False | False |
| `assets/css/routes/site-teens-delivery.d70b69057bb2.css` | 200 | 33759 | 33759 | True | `d70b69057bb2263f1dbee8f444ab21313abcdef3231e0e3973e174b50ba56bd0` | False | False |

## Per-route HTML matrix

| Mapped output | HTTP | Title | Description | Canonical | H1 | Text similarity | Asset refs | Inline badge rule | Inline focus rule |
| --- | ---: | --- | --- | --- | --- | ---: | --- | --- | --- |
| `bjj-classes/adults-tannersville-ny/index.html` | 200 | True | True | True | True | 0.951 | False | False/False | False/False |
| `bjj-classes/kids-tannersville-ny/index.html` | 200 | True | True | True | True | 0.951 | False | False/False | False/False |
| `bjj-classes/teens-tannersville-ny/index.html` | 200 | True | True | True | True | 0.973 | False | False/False | False/False |
| `blog/adult-brazilian-jiu-jitsu-near-me-tannersville/index.html` | 200 | True | True | True | True | 0.961 | False | False/False | True/True |
| `blog/after-school-jiu-jitsu-calm-routine-catskills/index.html` | 200 | True | True | True | True | 0.821 | False | False/False | True/True |
| `blog/after-school-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.888 | False | False/False | True/True |
| `blog/basic-jiu-jitsu-terms/index.html` | 200 | True | True | True | True | 0.952 | False | False/False | True/True |
| `blog/beginner-friendly-bjj-tannersville/index.html` | 200 | True | True | True | True | 0.945 | False | False/False | True/True |
| `blog/beginners-guide-bjj-human-chess/index.html` | 200 | True | True | True | True | 0.961 | False | False/False | True/True |
| `blog/bio-switch-nervous-system/index.html` | 200 | True | True | True | True | 0.911 | False | False/False | True/True |
| `blog/bioginastica-movement-no-gi/index.html` | 200 | True | True | True | True | 0.903 | False | False/False | True/True |
| `blog/bjj-36-techniques/index.html` | 200 | True | True | True | True | 0.936 | False | False/False | True/True |
| `blog/bjj-beginners-over-40-catskills/index.html` | 200 | True | True | True | True | 0.937 | False | False/False | True/True |
| `blog/bjj-belts-stripes-promotions/index.html` | 200 | True | True | True | True | 0.937 | False | False/False | True/True |
| `blog/bjj-black-belt-degree-time/index.html` | 200 | True | True | True | True | 0.925 | False | False/False | True/True |
| `blog/bjj-on-the-mountain/index.html` | 200 | True | True | True | True | 0.940 | False | False/False | True/True |
| `blog/bjj-promotions-how-often/index.html` | 200 | True | True | True | True | 0.937 | False | False/False | True/True |
| `blog/bjj-schedule-windham-ny/index.html` | 200 | False | False | False | False | 0.126 | False | False/False | True/False |
| `blog/bjj-sensei/index.html` | 200 | True | True | True | True | 0.962 | False | False/False | True/True |
| `blog/bjj-vs-karate-for-kids-catskills/index.html` | 200 | True | True | True | True | 0.938 | False | False/False | True/True |
| `blog/bjj-vs-taekwondo-family-martial-arts/index.html` | 200 | True | True | True | True | 0.932 | False | False/False | True/True |
| `blog/bully-proof-jiu-jitsu-stories-catskills/index.html` | 200 | True | True | True | True | 0.950 | False | False/False | True/True |
| `blog/bully-proof-martial-arts-tannersville/index.html` | 200 | True | True | True | True | 0.958 | False | False/False | True/True |
| `blog/busy-parent-guide-to-family-martial-arts/index.html` | 200 | True | True | True | True | 0.965 | False | False/False | True/True |
| `blog/cairo-ny-bjj-specialist/index.html` | 200 | True | True | True | True | 0.929 | False | False/False | True/True |
| `blog/can-you-beat-sensei-without-a-black-belt/index.html` | 200 | True | True | True | True | 0.957 | False | False/False | True/True |
| `blog/catskills-gym-alternative-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.961 | False | False/False | True/True |
| `blog/confidence-protocol/index.html` | 200 | False | False | True | False | 0.069 | False | False/False | True/False |
| `blog/cost-of-private-bjj-lessons-catskills/index.html` | 200 | True | True | True | True | 0.940 | False | False/False | True/True |
| `blog/desk-worker-bjj-guide-mobility-core-calm/index.html` | 200 | True | True | True | True | 0.964 | False | False/False | True/True |
| `blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html` | 200 | True | True | True | True | 0.952 | False | False/False | True/True |
| `blog/family-friendly-bjj-near-tannersville/index.html` | 200 | True | True | True | True | 0.966 | False | False/False | True/True |
| `blog/family-martial-arts-catskills/index.html` | 200 | True | True | True | True | 0.942 | False | False/False | True/True |
| `blog/gain-points-system/index.html` | 200 | True | True | True | True | 0.947 | False | False/False | True/True |
| `blog/gi-bjj-windham-ny/index.html` | 200 | True | True | True | True | 0.911 | False | False/False | True/True |
| `blog/gi-vs-no-gi-bjj-cheat-code/index.html` | 200 | True | True | True | True | 0.981 | False | False/False | True/True |
| `blog/growth-over-gold-bjj-mindset/index.html` | 200 | True | True | True | True | 0.952 | False | False/False | True/True |
| `blog/how-sandy-teaches-bjj/index.html` | 200 | True | True | True | True | 0.936 | False | False/False | True/True |
| `blog/how-to-fall-safely-bjj-breakfalls/index.html` | 200 | True | True | True | True | 0.967 | False | False/False | True/True |
| `blog/how-to-pick-a-bjj-school-in-the-catskills/index.html` | 200 | True | True | True | True | 0.980 | False | False/False | True/True |
| `blog/hunter-elementary-tuesday-drop-off-bjj/index.html` | 200 | True | True | True | True | 0.967 | False | False/False | True/True |
| `blog/index.html` | 200 | True | True | True | True | 0.988 | False | False/False | True/True |
| `blog/jiu-jitsu-for-teenagers-catskills/index.html` | 200 | True | True | True | True | 0.964 | False | False/False | True/True |
| `blog/jiu-jitsu-near-hunter-mountain/index.html` | 200 | True | True | True | True | 0.912 | False | False/False | True/True |
| `blog/jiu-jitsu-near-windham-mountain-club-ski-families/index.html` | 200 | True | True | True | True | 0.870 | False | False/False | True/True |
| `blog/jiu-jitsu-near-windham-mountain-club/index.html` | 200 | True | True | True | True | 0.945 | False | False/False | True/True |
| `blog/jiu-jitsu-windham-ny/index.html` | 200 | True | True | True | True | 0.919 | False | False/False | True/True |
| `blog/kids-bjj-training-partners/index.html` | 200 | True | True | True | True | 0.938 | False | False/False | True/True |
| `blog/kids-jiu-jitsu-windham-ny/index.html` | 200 | True | True | True | True | 0.929 | False | False/False | True/True |
| `blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.872 | False | False/False | True/True |
| `blog/kids-martial-arts-haines-falls/index.html` | 200 | True | True | True | True | 0.949 | False | False/False | True/True |
| `blog/kids-teens-bjj-belts-ranks-stripes-promotions/index.html` | 200 | True | True | True | True | 0.945 | False | False/False | True/True |
| `blog/kinetic-chess-onteora-park/index.html` | 200 | True | True | True | True | 0.892 | False | False/False | True/True |
| `blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.873 | False | False/False | True/True |
| `blog/neck-cranks-bjj-longevity-guide/index.html` | 200 | True | True | True | True | 0.899 | False | False/False | True/True |
| `blog/no-gi-windham-ny/index.html` | 200 | True | True | True | True | 0.904 | False | False/False | True/True |
| `blog/private-bjj-coaching-catskills-visitors/index.html` | 200 | True | True | True | True | 0.934 | False | False/False | True/True |
| `blog/private-bjj-lessons-adults-catskills/index.html` | 200 | True | True | True | True | 0.940 | False | False/False | True/True |
| `blog/private-bjj-lessons-kids-tannersville/index.html` | 200 | True | True | True | True | 0.979 | False | False/False | True/True |
| `blog/private-jiu-jitsu-lessons-windham-ny/index.html` | 200 | True | True | True | True | 0.915 | False | False/False | True/True |
| `blog/private-self-defense-coaching-tannersville/index.html` | 200 | True | True | True | True | 0.938 | False | False/False | True/True |
| `blog/safe-bjj-mma-training-tannersville/index.html` | 200 | True | True | True | True | 0.968 | False | False/False | True/True |
| `blog/safe-martial-arts-beginners-catskills/index.html` | 200 | True | True | True | True | 0.925 | False | False/False | True/True |
| `blog/safe-self-defense-kids-positional-control/index.html` | 200 | True | True | True | True | 0.940 | False | False/False | True/True |
| `blog/sanda-vs-jiu-jitsu-for-mma/index.html` | 200 | True | True | True | True | 0.969 | False | False/False | True/True |
| `blog/sanda-vs-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.983 | False | False/False | True/True |
| `blog/schedule-sensei-reset-protocol/index.html` | 200 | True | True | True | True | 0.973 | False | False/False | True/True |
| `blog/schedule-sensei-weekly-template/index.html` | 200 | True | True | True | True | 0.958 | False | False/False | True/True |
| `blog/schedule-sensei/index.html` | 200 | True | True | True | True | 0.850 | False | False/False | True/True |
| `blog/seated-guard-basics/index.html` | 200 | True | True | True | True | 0.968 | False | False/False | True/True |
| `blog/sensei-mma-bjj/index.html` | 200 | True | True | True | True | 0.969 | False | False/False | True/True |
| `blog/sensei-rules/index.html` | 200 | True | True | True | True | 0.975 | False | False/False | True/True |
| `blog/snow-day-protocol-bjj-home-dojo/index.html` | 200 | True | True | True | True | 0.960 | False | False/False | True/True |
| `blog/spring-fling-is-here/index.html` | 200 | True | True | True | True | 0.880 | False | False/False | True/True |
| `blog/starting-bjj-over-30-over-40-catskills/index.html` | 200 | True | True | True | True | 0.965 | False | False/False | True/True |
| `blog/tags/adult-bjj/index.html` | 200 | True | True | True | True | 0.826 | False | False/False | True/True |
| `blog/tags/starting-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.953 | False | False/False | True/True |
| `blog/tags/youth/index.html` | 200 | True | True | True | True | 0.954 | False | False/False | True/True |
| `blog/takedown-defense/index.html` | 200 | True | True | True | True | 0.966 | False | False/False | True/True |
| `blog/tannersville-bjj-tuesday/index.html` | 200 | True | True | True | True | 0.918 | False | False/False | True/True |
| `blog/teen-boundary-setting-conflict-deescalation/index.html` | 200 | True | True | True | True | 0.967 | False | False/False | True/True |
| `blog/teen-confidence-deescalation-jiu-jitsu/index.html` | 200 | True | True | True | True | 0.943 | False | False/False | True/True |
| `blog/teen-jiu-jitsu-hunter-ny/index.html` | 200 | True | True | True | True | 0.911 | False | False/False | True/True |
| `blog/things-to-do-near-hunter-ny-private-bjj-coaching/index.html` | 200 | True | True | True | True | 0.923 | False | False/False | True/True |
| `blog/water-before-training-how-much-when/index.html` | 200 | True | True | True | True | 0.971 | False | False/False | True/True |
| `blog/what-does-sensei-mean-in-bjj/index.html` | 200 | True | True | True | True | 0.923 | False | False/False | True/True |
| `blog/what-is-sanda-sanshou/index.html` | 200 | True | True | True | True | 0.963 | False | False/False | True/True |
| `blog/what-kids-learn-in-bjj/index.html` | 200 | True | True | True | True | 0.937 | False | False/False | True/True |
| `blog/why-high-school-athletes-train-bjj-tannersville/index.html` | 200 | True | True | True | True | 0.968 | False | False/False | True/True |
| `blog/wrestle-ups-scramble/index.html` | 200 | True | True | True | True | 0.936 | False | False/False | True/True |

## Route-level differences

### `bjj-classes/adults-tannersville-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.951; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `bjj-classes/kids-tannersville-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.951; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `bjj-classes/teens-tannersville-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.973; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/adult-brazilian-jiu-jitsu-near-me-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.961; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/after-school-jiu-jitsu-calm-routine-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.821; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/after-school-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.888; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/basic-jiu-jitsu-terms/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.952; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/beginner-friendly-bjj-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.945; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/beginners-guide-bjj-human-chess/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.961; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bio-switch-nervous-system/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.911; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bioginastica-movement-no-gi/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.903; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-36-techniques/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.936; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-beginners-over-40-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.937; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-belts-stripes-promotions/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.937; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-black-belt-degree-time/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.925; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-on-the-mountain/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.940; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-promotions-how-often/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.937; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-schedule-windham-ny/index.html`
- HTTP 200; title equal=False; description equal=False; canonical equal=False; H1 equal=False; visible-text similarity=0.126; asset refs equal=False.
- title candidate: `BJJ Schedule Near Windham NY \| Class Times in Tannersville`; production: `BJJ Classes Near Windham, NY \| Sensei Sandy BJJ`.
- description candidate: `Find the current BJJ class schedule near Windham, NY in Tannersville, then choose a youth, teen, adult, or Saturday No-Gi starting point.`; production: `BJJ classes near Windham, NY. 14 minutes down Route 296. Training for Windham Mountain Club ski families, weekend visitors, kids, teens, and adults.`.
- canonical candidate: `https://senseisandy.com/blog/bjj-schedule-windham-ny`; production: `https://senseisandy.com/bjj-classes/windham-ny`.
- H1 candidate: `BJJ Schedule Near Windham, NY: Find the Right Class Time`; production: `Can you plan a first BJJ class from Windham?`.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/css/bootstrap-icons-local.6444e2.css, /assets/css/fonts.min.5ee9a4.css, /assets/css/routes/site-18ac9c2704ce.min.css, /assets/css/site-shell.min.7f177f.css, /assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-sensei/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.962; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-vs-karate-for-kids-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.938; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bjj-vs-taekwondo-family-martial-arts/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.932; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bully-proof-jiu-jitsu-stories-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.950; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/bully-proof-martial-arts-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.958; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/busy-parent-guide-to-family-martial-arts/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.965; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/cairo-ny-bjj-specialist/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.929; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/can-you-beat-sensei-without-a-black-belt/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.957; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/catskills-gym-alternative-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.961; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/confidence-protocol/index.html`
- HTTP 200; title equal=False; description equal=False; canonical equal=True; H1 equal=False; visible-text similarity=0.069; asset refs equal=False.
- title candidate: `Sensei Sandy BJJ Free First Visit`; production: `Free First BJJ Visit in Tannersville \| Sensei Sandy`.
- description candidate: `Learn the basics and how the term fits a calm, beginner-friendly first class.`; production: `Book a free 15-minute visit with Sandy in Tannersville. See the room, talk about your goals, and plan a first class. Adults may train that day or later...`.
- H1 candidate: ``; production: `Start calm. Train smart.`.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/images/sensei-sandy.281b5d.jpg, /assets/images/sensei-sandy.webp, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-480.avif 480w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-768.avif 768w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-1024.avif 1024w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-1440.avif 1440w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-480.webp 480w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-768.webp 768w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-1024.webp 1024w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-1440.webp 1440w, /assets/images/studio/sensei-sandy-bjj-mat-space-and-viewing-area-768.cd4feb.webp, /assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/cost-of-private-bjj-lessons-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.940; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/desk-worker-bjj-guide-mobility-core-calm/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.964; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.952; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/family-friendly-bjj-near-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.966; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/family-martial-arts-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.942; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/gain-points-system/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.947; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/gi-bjj-windham-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.911; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/gi-vs-no-gi-bjj-cheat-code/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.981; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/growth-over-gold-bjj-mindset/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.952; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/how-sandy-teaches-bjj/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.936; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/how-to-fall-safely-bjj-breakfalls/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.967; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/how-to-pick-a-bjj-school-in-the-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.980; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/hunter-elementary-tuesday-drop-off-bjj/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.967; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.988; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/jiu-jitsu-for-teenagers-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.964; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/jiu-jitsu-near-hunter-mountain/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.912; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/jiu-jitsu-near-windham-mountain-club-ski-families/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.870; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/jiu-jitsu-near-windham-mountain-club/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.945; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/jiu-jitsu-windham-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.919; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/kids-bjj-training-partners/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.938; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/kids-jiu-jitsu-windham-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.929; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.872; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/kids-martial-arts-haines-falls/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.949; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/kids-teens-bjj-belts-ranks-stripes-promotions/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.945; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/kinetic-chess-onteora-park/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.892; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.873; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/neck-cranks-bjj-longevity-guide/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.899; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/no-gi-windham-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.904; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/private-bjj-coaching-catskills-visitors/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.934; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/private-bjj-lessons-adults-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.940; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/private-bjj-lessons-kids-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.979; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/private-jiu-jitsu-lessons-windham-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.915; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/private-self-defense-coaching-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.938; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/safe-bjj-mma-training-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.968; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/safe-martial-arts-beginners-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.925; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/safe-self-defense-kids-positional-control/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.940; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/sanda-vs-jiu-jitsu-for-mma/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.969; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/sanda-vs-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.983; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/schedule-sensei-reset-protocol/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.973; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/schedule-sensei-weekly-template/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.958; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/schedule-sensei/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.850; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/seated-guard-basics/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.968; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/sensei-mma-bjj/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.969; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/sensei-rules/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.975; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/snow-day-protocol-bjj-home-dojo/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.960; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/spring-fling-is-here/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.880; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/starting-bjj-over-30-over-40-catskills/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.965; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/tags/adult-bjj/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.826; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/tags/starting-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.953; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/tags/youth/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.954; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/takedown-defense/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.966; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/tannersville-bjj-tuesday/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.918; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/teen-boundary-setting-conflict-deescalation/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.967; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/teen-confidence-deescalation-jiu-jitsu/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.943; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/teen-jiu-jitsu-hunter-ny/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.911; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/things-to-do-near-hunter-ny-private-bjj-coaching/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.923; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/water-before-training-how-much-when/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.971; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/what-does-sensei-mean-in-bjj/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.923; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/what-is-sanda-sanshou/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.963; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/what-kids-learn-in-bjj/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.937; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/why-high-school-athletes-train-bjj-tannersville/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.968; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.
### `blog/wrestle-ups-scramble/index.html`
- HTTP 200; title equal=True; description equal=True; canonical equal=True; H1 equal=True; visible-text similarity=0.936; asset refs equal=False.
- Candidate-only asset refs: `none`.
- Production-only asset refs: `/assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp 128w, /assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png 64w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png 96w, /assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png 128w, /assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png`.

## Non-200 candidate output URLs

- `assets/css/blog.cc6577.css`: HTTP 404. This is the newly generated candidate fingerprint; the public response is not CSS.
- `assets/css/pages/article-delivery.d7324c9b8349.css`: HTTP 404. This is the newly generated candidate fingerprint; the public response is not CSS.
- No request timed out or failed at the network layer. All 99 mapped URLs were covered.

## Release disposition

**Hold the 99-file release candidate; no safe payload subset is proven.** All 90 HTML candidates differ from production in visible text and asset references, and some differ in title, description, canonical, or H1. Replacing those routes would overwrite current live output, including production-only logo/header references. The six exact CSS matches do not need upload; the three different CSS outputs cannot be treated as an independent safe payload until current page consumers and generated references are reconciled. This audit does not authorize deployment.

### Intended fix evidence

- Candidate source rules: `.page-blog .hero__inner > .badge` and `.page-blog .btn:focus-visible` in the committed Blog CSS change.
- Candidate `assets/css/blog.css` contains both rules; the live file is 208 bytes smaller, contains the focus rule, and does not contain the badge-wrap rule. Candidate `assets/css/blog.min.css` matches live exactly and contains the focus rule but not the badge-wrap rule.
- Candidate `assets/css/blog.cc6577.css` contains both rules but is a new fingerprint returning 404. Candidate `assets/css/pages/article-delivery.d7324c9b8349.css` is also a new fingerprint returning 404; route outputs contain the focus rule inline on 87/87 candidates.
- Live Blog HTML contains the inline focus rule on 85/87 routes. It is absent on `blog/bjj-schedule-windham-ny/` and `blog/confidence-protocol/`.
- The per-route visible-text, metadata, and asset-reference differences are independent of CSS declarations and are not attributable solely to the committed CSS fixes. The raw response hashes and statuses for all 99 mapped URLs are recorded below.

### Exclusions

- No deployment, Lighthouse/PageSpeed, keyboard acceptance, site-wide contrast review, or browser-driven interaction. Browser-use doctor found no running Chrome/daemon in the parent session.

## Raw candidate and production response hashes

The response hash is the exact body returned for the mapped URL. For a 404 candidate fingerprint, it is the 404 response body hash, not a stylesheet hash.

| Mapped output | HTTP | Final URL | Candidate SHA-256 | Response SHA-256 | Note |
| --- | ---: | --- | --- | --- | --- |
| `assets/css/blog.cc6577.css` | 404 | `https://senseisandy.com/assets/css/blog.cc6577.css` | `dab909e972fc375839b3546bb3eb0f04ed9afe8b58336fc97a521f7545241a3c` | `4c13d452dd5d49671bd93ca32f2b4f85c78e39b6ab0ad1f38d98ed267f8fd896` | — |
| `assets/css/blog.css` | 200 | `https://senseisandy.com/assets/css/blog.css` | `dab909e972fc375839b3546bb3eb0f04ed9afe8b58336fc97a521f7545241a3c` | `edd6cee081ac48ce4ba9e7f89ff8e67086588d4c5043c32bbc7ebfcae291b25f` | — |
| `assets/css/blog.min.css` | 200 | `https://senseisandy.com/assets/css/blog.min.css` | `e11073b7d97f4e8911875fafb0d1e5d7f6d52e684c0f558ea9c3327d45eca4a0` | `e11073b7d97f4e8911875fafb0d1e5d7f6d52e684c0f558ea9c3327d45eca4a0` | — |
| `assets/css/pages/adults-delivery.b64270844d52.css` | 200 | `https://senseisandy.com/assets/css/pages/adults-delivery.b64270844d52.css` | `b64270844d52e5ba438909a61f51c1003e007897d35dc738ee564d5411209022` | `b64270844d52e5ba438909a61f51c1003e007897d35dc738ee564d5411209022` | — |
| `assets/css/pages/article-delivery.d7324c9b8349.css` | 404 | `https://senseisandy.com/assets/css/pages/article-delivery.d7324c9b8349.css` | `d7324c9b8349b634cb05c89b153504e1ab33c39eefc1ab93e2ad2f761830f04d` | `4c13d452dd5d49671bd93ca32f2b4f85c78e39b6ab0ad1f38d98ed267f8fd896` | — |
| `assets/css/pages/kids-delivery.21fed56d05d6.css` | 200 | `https://senseisandy.com/assets/css/pages/kids-delivery.21fed56d05d6.css` | `21fed56d05d6d11ea52ce9819c1625c98b5d93d633bd2b105557ef4f9f705a24` | `21fed56d05d6d11ea52ce9819c1625c98b5d93d633bd2b105557ef4f9f705a24` | — |
| `assets/css/pages/teens-delivery.767b2c0c453d.css` | 200 | `https://senseisandy.com/assets/css/pages/teens-delivery.767b2c0c453d.css` | `767b2c0c453d64e5f32ae51fc65461f79d9557e2cf0067817c1a4968cf9a460a` | `767b2c0c453d64e5f32ae51fc65461f79d9557e2cf0067817c1a4968cf9a460a` | — |
| `assets/css/routes/site-adults-delivery.d027512ba43b.css` | 200 | `https://senseisandy.com/assets/css/routes/site-adults-delivery.d027512ba43b.css` | `d027512ba43b0cb6be02562bb6889b833780b1346fafb808e9b0e4daa088e7b9` | `d027512ba43b0cb6be02562bb6889b833780b1346fafb808e9b0e4daa088e7b9` | — |
| `assets/css/routes/site-teens-delivery.d70b69057bb2.css` | 200 | `https://senseisandy.com/assets/css/routes/site-teens-delivery.d70b69057bb2.css` | `d70b69057bb2263f1dbee8f444ab21313abcdef3231e0e3973e174b50ba56bd0` | `d70b69057bb2263f1dbee8f444ab21313abcdef3231e0e3973e174b50ba56bd0` | — |
| `bjj-classes/adults-tannersville-ny/index.html` | 200 | `https://senseisandy.com/bjj-classes/adults-tannersville-ny` | `39467a4666983addebc12afae2000ce8ab960b35ee51b638128d46dc17a4512f` | `0555704129ffa1fd4a7959a45c94fb1113b3b6afeeb54ba52402bd3872cf01b7` | — |
| `bjj-classes/kids-tannersville-ny/index.html` | 200 | `https://senseisandy.com/bjj-classes/kids-tannersville-ny` | `815c8f0a5209bc9adb03bd2913c002330daf31210881948befb315055a3a2c25` | `5d727957a9010b80f17cf8897f6186ad093bf91720c95c31c6f579e285723bd1` | — |
| `bjj-classes/teens-tannersville-ny/index.html` | 200 | `https://senseisandy.com/bjj-classes/teens-tannersville-ny` | `38387aeb89040613c6086f0962138cd75c0466c61bf37157929bfb4d3c1baf15` | `0195eea2af8ccc484eb6c4f4148cf3e6e5e4bdd29484124c1b1b9787b1f148d8` | — |
| `blog/adult-brazilian-jiu-jitsu-near-me-tannersville/index.html` | 200 | `https://senseisandy.com/blog/adult-brazilian-jiu-jitsu-near-me-tannersville` | `cf78ca1c73367f1bb149fd6efe2352e9a27f585d0f32f1d40db9d781a58fea9b` | `b5e06b15bef3429355ae80004537b1dab02bc70e46dc9bfd6123b8829de8bd6b` | — |
| `blog/after-school-jiu-jitsu-calm-routine-catskills/index.html` | 200 | `https://senseisandy.com/blog/after-school-jiu-jitsu-calm-routine-catskills` | `a988293035de9585214df54aa03bdd3de4c4c148afdedfc298f5d3953d7a0fea` | `c734bfd425bd0b51c9affe09db5e2498054f7b848efe5d9afafb86053fb17693` | — |
| `blog/after-school-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/after-school-jiu-jitsu` | `7700ad5f641186a5d4164d2a539c04b71e33a75b1037980a185adae0cc5b3bc4` | `1b1b25e237e59fe444feb7f88f92b1ccbdf7386e78629b8514c738f0068eaf5d` | — |
| `blog/basic-jiu-jitsu-terms/index.html` | 200 | `https://senseisandy.com/blog/basic-jiu-jitsu-terms` | `baeb7b5c1de3fec0d420013ed54e9cdda215ca619ff70942bd69d78d6f472c33` | `cfd586435089f2ac1b6aaf941a9d120cb73583e1f56e1e94924456f89d46f310` | — |
| `blog/beginner-friendly-bjj-tannersville/index.html` | 200 | `https://senseisandy.com/blog/beginner-friendly-bjj-tannersville` | `a6f55d2b24512e108b4167815cab147cb7ff9e03551a692da3c142fed3b93a99` | `74d9096374009ef32e40332a400f39458720d0bab76f30de7f8bfad48293bea5` | — |
| `blog/beginners-guide-bjj-human-chess/index.html` | 200 | `https://senseisandy.com/blog/beginners-guide-bjj-human-chess` | `e79005548fbab4efe567788554934ec2e37195e5f77546a4351b4eb8a434c7b4` | `2ac73d3089af021ee0cb5c5b8c1d4d9258faf53a5e1a258f06375b7e829b21c1` | — |
| `blog/bio-switch-nervous-system/index.html` | 200 | `https://senseisandy.com/blog/bio-switch-nervous-system` | `be3753615494d0fc8920db08f0353cc8217eaa87543ff07a47e701bacaab3cf5` | `bcea0abbd8db644d0e7ff3060b232a00920e04470d90be0b785f14acf51f5673` | — |
| `blog/bioginastica-movement-no-gi/index.html` | 200 | `https://senseisandy.com/blog/bioginastica-movement-no-gi` | `bf11c38eaa2de599a1835f27d54078ab570d6fd3b7fb9046947d7d2cbdaf299d` | `484bb3a0afaab25ab735b7a6a8e2b2e0692972116050020cf3ae564c1be54192` | — |
| `blog/bjj-36-techniques/index.html` | 200 | `https://senseisandy.com/blog/bjj-36-techniques` | `a6fe23e907304faf5f216baf9bf4ddde2b967f808c09f97499c0cf823e8e4db5` | `b7a73dd48b7e6b7434c922c05a2d7f755e84240580756dcabe1efe78d59baa29` | — |
| `blog/bjj-beginners-over-40-catskills/index.html` | 200 | `https://senseisandy.com/blog/bjj-beginners-over-40-catskills` | `97c86d9a6eb2b860fec509b003291d37a958821766f57ad1960ee39f3b55e404` | `a817f5cebfc474846d5182687c30b95454754a0ccceab29ed87d7f11e1c15406` | — |
| `blog/bjj-belts-stripes-promotions/index.html` | 200 | `https://senseisandy.com/blog/bjj-belts-stripes-promotions` | `3b0d7aac4f6fb9375b786e157db4a3584fc4783891340d7581dd5ac124eab3b4` | `3a10d35b7050f97da26f02f4934299bd62948ee6c806554bc0449ed9cef8664b` | — |
| `blog/bjj-black-belt-degree-time/index.html` | 200 | `https://senseisandy.com/blog/bjj-black-belt-degree-time` | `a11dcf58120970028d6ff7496af18015042df9beb94c0ad984c0ea17209f1e3f` | `9b0776d27e75c627cc39c21501ec958f988fde5ebc20936a5b2f293c337be2a4` | — |
| `blog/bjj-on-the-mountain/index.html` | 200 | `https://senseisandy.com/blog/bjj-on-the-mountain` | `caa802897758025e4641a36940e38d8d9522945b1fccf0088e5dfb7557b530b3` | `4804e1172ce6ec914da8be499928a64d8432b110145e137d3ecf8f14062eaf2f` | — |
| `blog/bjj-promotions-how-often/index.html` | 200 | `https://senseisandy.com/blog/bjj-promotions-how-often` | `e3cf907453954aba0269189eea11cb683ae0ca5a5cbb0ff6869210271f021a60` | `e5cc9b62f8a445fbfda21dddaf65c3cc0b3bc746ca6cee5fd692db00811bf11c` | — |
| `blog/bjj-schedule-windham-ny/index.html` | 200 | `https://senseisandy.com/bjj-classes/windham-ny` | `d9cec347cc7e1c6d0746976efbf89f3e2a337fff8d58f1b2d18a3321f5f75ffc` | `ea7e6bda42278ac31147478bc823cca6900da7e572cf45454b519ca7b7ce71dc` | — |
| `blog/bjj-sensei/index.html` | 200 | `https://senseisandy.com/blog/bjj-sensei` | `8c00fa7d60b64146ff1e40623be04e471cbf353f3ca91176a1f90b0da90a4069` | `576bebfdbea2023d1b6279594c349dd5a3434c5c3ff497a1a3645718312ac9ee` | — |
| `blog/bjj-vs-karate-for-kids-catskills/index.html` | 200 | `https://senseisandy.com/blog/bjj-vs-karate-for-kids-catskills` | `bad48bfc6f14f5250403eade9ce70c1da870d226b9bce67e417b998ea3a07a25` | `1c935842d85d8976dc4ffc40379082a67daf6132aa26969e9e1b829ca83c23ff` | — |
| `blog/bjj-vs-taekwondo-family-martial-arts/index.html` | 200 | `https://senseisandy.com/blog/bjj-vs-taekwondo-family-martial-arts` | `b3345d73a47e8396b7b7e7f3d6930a7170ae0960e1c355f7479192ac7cc72ff7` | `73d0f4f65edb4ed8244d82ce56bfd4b7d54bfda96124501400d6c2b99e6c7b83` | — |
| `blog/bully-proof-jiu-jitsu-stories-catskills/index.html` | 200 | `https://senseisandy.com/blog/bully-proof-jiu-jitsu-stories-catskills` | `9b0163cd0ae3c8aec347a19e533c539f450df2e37e5a776a11f5fbc4bac00e3f` | `aca8b44768cd33f0530c02a0a02ffff3c86ddb2284b59e14b5313e3d995cdde3` | — |
| `blog/bully-proof-martial-arts-tannersville/index.html` | 200 | `https://senseisandy.com/blog/bully-proof-martial-arts-tannersville` | `77aac4acbf08d54745fc3823fe743b35f83c2c2ba9f932e11f646ca0e903bbc0` | `c8a1c47e85fa43e2f530cb45bcd5e4639871fa430024337b388bea45c6630dcc` | — |
| `blog/busy-parent-guide-to-family-martial-arts/index.html` | 200 | `https://senseisandy.com/blog/busy-parent-guide-to-family-martial-arts` | `e142b747692823ee83f2ae8a7488235a3984ae1730e5c1ccdac0befd2d5c9aaf` | `8ab7cf1c9b39b5abd953e329eacc084f025245947e21370091ef4cbd4e3bf4c2` | — |
| `blog/cairo-ny-bjj-specialist/index.html` | 200 | `https://senseisandy.com/blog/cairo-ny-bjj-specialist` | `c4a357586a3da551dc3e4c141a2ac4986e7ef1ad382b2be19eb7ad9bebbed534` | `4414b94c20b76e74ab73f3e1be3e2032a4b2ba76121e5a47675d9713492c399b` | — |
| `blog/can-you-beat-sensei-without-a-black-belt/index.html` | 200 | `https://senseisandy.com/blog/can-you-beat-sensei-without-a-black-belt` | `456158fb82f4a9889b0ea9dd6d57b6b7c7d360f8491ceb8561864fe05f82e5ec` | `953d55a78472e4910595b053c5c3844ab33f41f57c2511ed093b7a047063b264` | — |
| `blog/catskills-gym-alternative-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/catskills-gym-alternative-jiu-jitsu` | `9e0efd90efa7b0761988370f9be2c7d903bafc5ca12766f39a3c64b1b52e5273` | `07f086b95299789d3098c5b10c2e53224bda195c8ab85c804a65e8206ec08416` | — |
| `blog/confidence-protocol/index.html` | 200 | `https://senseisandy.com/free-bjj-intro-tannersville-ny` | `de68e66061fca0fb6cdc0b12a4ed70cfe45f2158cc3d922aede6cf4659e1a7fa` | `b9fb9964732437d4f2d5f6ef8e47765367ac969882c5daa440e5e91e2a7bdaca` | — |
| `blog/cost-of-private-bjj-lessons-catskills/index.html` | 200 | `https://senseisandy.com/blog/cost-of-private-bjj-lessons-catskills` | `260e8ed0caeed0f996b70f7c417030b3e79137244dc7afa1d1a2ff00953dba72` | `61d30cc6f2b3506cddcb351efeb548bc2c4277c3c9211964f56b284d55c3433d` | — |
| `blog/desk-worker-bjj-guide-mobility-core-calm/index.html` | 200 | `https://senseisandy.com/blog/desk-worker-bjj-guide-mobility-core-calm` | `73e46af7ad02b6ab26bcf804ccd345380ae4f8c9ed5f51a662c74d05169d0a1f` | `b56237f3232fa67cd16ed7ed9fcc81d99b1db3eb38483b9baf313cf7d6fd528c` | — |
| `blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html` | 200 | `https://senseisandy.com/blog/exactly-what-happens-first-bjj-class-minute-by-minute` | `56ac5506206334a5a004d3d3c108a779c405535f7345d03e93902407903ca62d` | `6945e31e99c0dac188f713425b6bcd136f3c9debd477f654314c3c02c2a5225d` | — |
| `blog/family-friendly-bjj-near-tannersville/index.html` | 200 | `https://senseisandy.com/blog/family-friendly-bjj-near-tannersville` | `c8084584f6f5b462811c167b77330cfe85111ba6bd6689c4de86ab7d3ac3824f` | `bef161486bf3c6bf9eb8bf68f868fe7944ecc2a2203cfc20b5c911523d5b3dd5` | — |
| `blog/family-martial-arts-catskills/index.html` | 200 | `https://senseisandy.com/blog/family-martial-arts-catskills` | `b2385785f6254d9be407e879aff003d5262b94739fe4ae02ecffc9ee441765ef` | `5bb60c8d5acd1ee5c70ec6bd001be49817b20315f80e07f4a5c60963f0267c13` | — |
| `blog/gain-points-system/index.html` | 200 | `https://senseisandy.com/blog/gain-points-system` | `7fb8863517172c9249cc3a25f9887a83508996b0e902c4109a14d14d458304f0` | `431b26d87d68017d351d18e60a7ad5c35d451ee0eff4fb0dbd76c197fe5ece93` | — |
| `blog/gi-bjj-windham-ny/index.html` | 200 | `https://senseisandy.com/blog/gi-bjj-windham-ny` | `6120366f8af3507033f8079d57c9cf72aacfc5debd76e6512d3076d55f804578` | `8d23b758967f54e986ab2587ba2e0930a67e30bd47104f6867cdc88e93165fc8` | — |
| `blog/gi-vs-no-gi-bjj-cheat-code/index.html` | 200 | `https://senseisandy.com/blog/gi-vs-no-gi-bjj-cheat-code` | `de664f4e5341aefd1850f951ceca703744d2563166508d52bbe342f9483461d1` | `da0950cf39dec4aee6dd721cfe1f26bca03ff219a7fc47f4aa699f4afff3909b` | — |
| `blog/growth-over-gold-bjj-mindset/index.html` | 200 | `https://senseisandy.com/blog/growth-over-gold-bjj-mindset` | `e61083ace8a8c7a30615c724eb04affa6322dd03ec92de926266245b20ecb714` | `d10f717b8f8826759c6338a372ae4a9c7e46ed8b207b704b525e559e9df87893` | — |
| `blog/how-sandy-teaches-bjj/index.html` | 200 | `https://senseisandy.com/blog/how-sandy-teaches-bjj` | `436ac029b90c2b6714e305d0061583aa8975291034d071e73129785c1ebc782b` | `d279a6523375035176de0bb23ca401ade6be23a6aa58b0e5ac7dd446e84ede7d` | — |
| `blog/how-to-fall-safely-bjj-breakfalls/index.html` | 200 | `https://senseisandy.com/blog/how-to-fall-safely-bjj-breakfalls` | `011e9b21445e3faf21a6fcf9f8a01cc69a2478f0fe7816d64c63c398e3dbfa08` | `0806982fae3ad1fe930dac6142f2094981760c5cd88bc61b6435cda858a28495` | — |
| `blog/how-to-pick-a-bjj-school-in-the-catskills/index.html` | 200 | `https://senseisandy.com/blog/how-to-pick-a-bjj-school-in-the-catskills` | `36c3855e4e1fb9380dd305035fc68a48d44aa7357a6d7561cb02546c5dcd6e3c` | `55979a07a371361e5fbb43fb27a82185db555612db9e2d9c71a573a9282810d8` | — |
| `blog/hunter-elementary-tuesday-drop-off-bjj/index.html` | 200 | `https://senseisandy.com/blog/hunter-elementary-tuesday-drop-off-bjj` | `7dea098e96759ab1438ce43fafafb602394a1de04833993fa4b7da31cd13a37e` | `5d9ac32fd4e95b0ac1ca598536899394aa9d480fa77c16841dcfa6cff11bbbf0` | — |
| `blog/index.html` | 200 | `https://senseisandy.com/blog` | `4ca4eaaf096d560fd4484ceb1f4b57655036ef7523dbb0a03fe389b8c6cb7071` | `9ec3f2a5c1fb57dfe48d98a5575d640e4d5a4bef968a522221287c0496c478e2` | — |
| `blog/jiu-jitsu-for-teenagers-catskills/index.html` | 200 | `https://senseisandy.com/blog/jiu-jitsu-for-teenagers-catskills` | `d34e0a128793c3af476d0181596ab5a2b5a62a42c1e66f64c6967efd91d671cb` | `f39abe6ac829f7baee065b8cdd0724e61c49db19ea30bb106bead5196b66d042` | — |
| `blog/jiu-jitsu-near-hunter-mountain/index.html` | 200 | `https://senseisandy.com/blog/jiu-jitsu-near-hunter-mountain` | `e5e9521db0a7460d2b2c40b075cca692070dbae7a27822ce0e01d43d16bfb041` | `08131e772e0df4f0a17d1287b539ff074459fc86d491c528eb2b7f3170985496` | — |
| `blog/jiu-jitsu-near-windham-mountain-club-ski-families/index.html` | 200 | `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club-ski-families` | `0913064bfc047a116626e4a9f9bb23594c188b038c9c1013d18c3f305b956f6a` | `f9f8b4fc7c336bb49c05b2de0e71717c034967734edd6c087ec092d002caeb6b` | — |
| `blog/jiu-jitsu-near-windham-mountain-club/index.html` | 200 | `https://senseisandy.com/blog/jiu-jitsu-near-windham-mountain-club` | `4712de2cbb2496ea9caf397e1440cff39e44948d1ef34e1c3e43f8f199c95184` | `6393ff54d83d8e9b5027fd267ed4c8ed6de15f1cc16fff0908a0149bc67eda50` | — |
| `blog/jiu-jitsu-windham-ny/index.html` | 200 | `https://senseisandy.com/blog/jiu-jitsu-windham-ny` | `a2a1067dc694ac501467a8792ee0c8a544442a315173776c1a033754503763c4` | `b4e2dd14087fcf9bedec77761882cbb2364ff8218a7821ce9e5d13c313a41545` | — |
| `blog/kids-bjj-training-partners/index.html` | 200 | `https://senseisandy.com/blog/kids-bjj-training-partners` | `83690aba3139e3747b985f8e31cc47d85e86a2b7c5d4594999e812a2ede03584` | `04f520baa5544d6b86045b0962bee268b7c3a7ed1cb975c7e887aadd24abdf9a` | — |
| `blog/kids-jiu-jitsu-windham-ny/index.html` | 200 | `https://senseisandy.com/blog/kids-jiu-jitsu-windham-ny` | `2b5852d3e7c9c656788eb03e43f9bc9a6b52469cedb34048f3bc15e178dd9d44` | `8a2bd5cb0497d0db2242b853d655ad345bc3dd48d8b916f63d3e5e3ba0fed576` | — |
| `blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu` | `8213b392a842ec786923e4e146dc75115de3b1cef3ce2a54a108cfc5c4b698a4` | `a7c515218684ff05f8e41620b6e773512f2f4299250ce19d0c8fa96da511da6e` | — |
| `blog/kids-martial-arts-haines-falls/index.html` | 200 | `https://senseisandy.com/blog/kids-martial-arts-haines-falls` | `b3ab0099102cf375c7f8105679f8db928cfd04d7cf464a31dc7b87ecabdb0a43` | `f2371ad473c1c15822c48422dabe2abf0fa78bc23d3476784af61afbb4b1bfff` | — |
| `blog/kids-teens-bjj-belts-ranks-stripes-promotions/index.html` | 200 | `https://senseisandy.com/blog/kids-teens-bjj-belts-ranks-stripes-promotions` | `ccc13a21aeda2f622c1db3b6b53801486436d3aff97e9072a67c3ed82bae9de7` | `5ed4fd6bfc0bef493222f42e22f7814c592b22bd217b7536d1aecb9217c7370d` | — |
| `blog/kinetic-chess-onteora-park/index.html` | 200 | `https://senseisandy.com/blog/kinetic-chess-onteora-park` | `1bea80a5b8d2e06790195f618fcbbe2ff36686fdc14c6a9fc72372fa807531d5` | `9d0a7bb66573a3d58f7eef895c29609dbb248faef602d9b25ee9acee34759350` | — |
| `blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu` | `791a4273428c63985437747186e76dcd2aec14d345f8385147e253237e812c6a` | `021bf7d8743f324cd5d3e817ba06edeeb4d89682eaa3d05befcd002f2ff982a2` | — |
| `blog/neck-cranks-bjj-longevity-guide/index.html` | 200 | `https://senseisandy.com/blog/neck-cranks-bjj-longevity-guide` | `05ff4951590787e68f6409f4c3ba04ce77087b37d5d275594f06f2a2c622d5c9` | `ead07f47f81a75721d2100310c65426a72d563c573b5241a6a81fd65298ef569` | — |
| `blog/no-gi-windham-ny/index.html` | 200 | `https://senseisandy.com/blog/no-gi-windham-ny` | `4ac358aaf1489e835e0ffafd9cb2e3933e45ad9b3bd5ec886413d16178d58a8b` | `81f9e757ad1b76d91110a183bac7986f6e1cd7ffcc16b03df0f8811acdbea8e4` | — |
| `blog/private-bjj-coaching-catskills-visitors/index.html` | 200 | `https://senseisandy.com/blog/private-bjj-coaching-catskills-visitors` | `a71cd71aa46ca721f3d2ba033942212cb9c80e308a115479f815dcf86940ee61` | `449b1d232dc5ad318f56b0a631d8aa04971884abf104f1bddd23a8d73f97d212` | — |
| `blog/private-bjj-lessons-adults-catskills/index.html` | 200 | `https://senseisandy.com/blog/private-bjj-lessons-adults-catskills` | `cf0616ac96143f804fd927f55001821e863cc62951bc3267d486d8ad3aeee438` | `47dfe283334fe4f7cb24bdc293fb26148e79f97f81d15cd80ef99c0ecc0d0fc6` | — |
| `blog/private-bjj-lessons-kids-tannersville/index.html` | 200 | `https://senseisandy.com/blog/private-bjj-lessons-kids-tannersville` | `9b03ccb9d6ea3012b10fa3f0700df9a30a450b69c9e7b022b0162d887672a86e` | `fbb6de13a3110089d96a622cdb0911d8907546afbb950f3c3e6d89391151fa30` | — |
| `blog/private-jiu-jitsu-lessons-windham-ny/index.html` | 200 | `https://senseisandy.com/blog/private-jiu-jitsu-lessons-windham-ny` | `8a544e17837eb695421d2ac9c16a91222a35fc4886af39367170bcfc959df8e1` | `c3eb1836c61aae95ac698334e3a2fdccab266fa2f03468e8ab48d8ce2369a6a6` | — |
| `blog/private-self-defense-coaching-tannersville/index.html` | 200 | `https://senseisandy.com/blog/private-self-defense-coaching-tannersville` | `3b2bf1e19cc0b83b811311ce30acf55d346f8e4bb5e7469c4af0fc7960845333` | `35d81698256c4c745eadab490d8ce23f0bd80ec99e5ac6787c4e24cc40e9d0e5` | — |
| `blog/safe-bjj-mma-training-tannersville/index.html` | 200 | `https://senseisandy.com/blog/safe-bjj-mma-training-tannersville` | `9b4f54f6f7805986c64370325bce9e70a25c9a08367a3c39b71ce23c110c73c6` | `66ba77b4cbd797300a3094eb3b880568ef7fcaf29695de3b0740b9f27c6c35a0` | — |
| `blog/safe-martial-arts-beginners-catskills/index.html` | 200 | `https://senseisandy.com/blog/safe-martial-arts-beginners-catskills` | `a41bc9bfe7d0a15ab0145647fe150d3845d94c7e8672121b32f1bf6b1c4a98f7` | `6e689fcbe1379a82c1062e5a8a5c5050ae496b78fa09e00f808ea4db4c494e98` | — |
| `blog/safe-self-defense-kids-positional-control/index.html` | 200 | `https://senseisandy.com/blog/safe-self-defense-kids-positional-control` | `9cc1e0d33bc90f51bd936fa85c36fb54aad957b453400a70df4c0f126125bc10` | `c4481838b0b6c67eac4cb1a1e62e4f60077ccc1f652e156f4cc0cf20d8672df6` | — |
| `blog/sanda-vs-jiu-jitsu-for-mma/index.html` | 200 | `https://senseisandy.com/blog/sanda-vs-jiu-jitsu-for-mma` | `266e77f1bc6a19e501d2d096ef6a4f153a2ae608d84b8ae97d7a4210f090d20c` | `6a26d32c13535ca8fcdbbc4b55715f0dcf67d4a4269aa3780f386c500b2ef155` | — |
| `blog/sanda-vs-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/sanda-vs-jiu-jitsu` | `f6755cb81dc3a49f16807f48805d77f2ad16730a46a8e0530b4f33e0b11f862b` | `4855c2556be7ab7f35befb4f668d3e16d5b138fe34716572f264c90b165cd914` | — |
| `blog/schedule-sensei-reset-protocol/index.html` | 200 | `https://senseisandy.com/blog/schedule-sensei-reset-protocol` | `888514f58d7a64d3a87e3aa624b5e299c6deb294deb005f6cb39de493b0bbbe0` | `280a9160c70b5fe4fcb4444abf9abae87402d416f8513ec6f646977a5b80140d` | — |
| `blog/schedule-sensei-weekly-template/index.html` | 200 | `https://senseisandy.com/blog/schedule-sensei-weekly-template` | `5e0f173cc96306b07d4f755ccd444566f191eab59af5f14b543124e021061884` | `21e4d2da846bd754aea5adafc9211b514850ab31753cbea9c4bd11d9759d5c8e` | — |
| `blog/schedule-sensei/index.html` | 200 | `https://senseisandy.com/blog/schedule-sensei` | `806e4290dd87ec5f0b90d09800484b0aa17ad2804ee22c86368102a73f3da670` | `33c5b2ce9782cf6eac1961664deb335e69e0d276657718ba4162e3e4aaa0da89` | — |
| `blog/seated-guard-basics/index.html` | 200 | `https://senseisandy.com/blog/seated-guard-basics` | `73ee817e3b1178c81bbb23defae740d1456e9f91bc2d145f2c2e6fa78222dfc3` | `7fc73ad4ce49452db456d73938d6e457e725595a00ae0f66393d79142d96e0f9` | — |
| `blog/sensei-mma-bjj/index.html` | 200 | `https://senseisandy.com/blog/sensei-mma-bjj` | `f9b44233c443a46d688eaae43296846fe4997558d76f6006e70711893dd324d6` | `23d0b139776e4fcae3d65e1da81ce0ec9f6b1bbadd8b742562574a2d6ee96e97` | — |
| `blog/sensei-rules/index.html` | 200 | `https://senseisandy.com/blog/sensei-rules` | `53aad9f5f50c1cb4c2e83dde3f349d8b04711b5a61cff6e3565ad6f28278e0e7` | `1624e591fbfb88b0e63745de03717a21f03ceb3b7961bf86d67581712b33638f` | — |
| `blog/snow-day-protocol-bjj-home-dojo/index.html` | 200 | `https://senseisandy.com/blog/snow-day-protocol-bjj-home-dojo` | `f6f71d7460260393ec094d9e831613feb73b420f0d8ec7338b31cfd42b095f8d` | `c74ed0d01867d0bee9a2dfd1af8dadde55c5afcd5f98d212279da74c29cadae3` | — |
| `blog/spring-fling-is-here/index.html` | 200 | `https://senseisandy.com/blog/spring-fling-is-here` | `0590a97e6b6430b411f842fe4e2fba654c1ab8093241feca8c765fcac41d8a52` | `4baeaea11977f844007961c22ac8e97530a5dc24218cf6ff7bfe6e271e993c9b` | — |
| `blog/starting-bjj-over-30-over-40-catskills/index.html` | 200 | `https://senseisandy.com/blog/starting-bjj-over-30-over-40-catskills` | `bf848aeac18182c7b265c44d285438a0cc319a49d281238693c5fce57e591c8d` | `b52bb78a013132a9d037d02486f97db33260102bdcc4cfd5e4aa1d228d6c7906` | — |
| `blog/tags/adult-bjj/index.html` | 200 | `https://senseisandy.com/blog/tags/adult-bjj` | `310e2e1ccbc3f8331d86414fa7c7e408c45c4938ddedaeede9dafd6813fd93ea` | `06df221afdc308f37787fb8c2e8f0e3cf529ad272dec5f71afc19d87c96039e0` | — |
| `blog/tags/starting-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/tags/starting-jiu-jitsu` | `0f50d8d6c3118d3ed0d4088d21d184d629e54a9c82b66b34eac02062ce41aa4e` | `004ec46512f5ef31245c8724c2073eb82ba21dbc0ba6500fb3e89585ac30c3ce` | — |
| `blog/tags/youth/index.html` | 200 | `https://senseisandy.com/blog/tags/youth` | `7f1876e68f2fe0291414000c2082585f0117630a1a114d7a3d995ab5211b304a` | `a3f8ec4c6df9a8445083a946eb791e4c35a2481a705386c8e59b75c18646378f` | — |
| `blog/takedown-defense/index.html` | 200 | `https://senseisandy.com/blog/takedown-defense` | `dcce15b884f075878e9841d0e374bccd8d0c327789ac1592cb2713213aca4b0a` | `d068caa39f81549a01efcd951251af62b493369880d84124ae2f257da26f0f68` | — |
| `blog/tannersville-bjj-tuesday/index.html` | 200 | `https://senseisandy.com/blog/tannersville-bjj-tuesday` | `0d4ecfe89a6ccbe530652467a1ed47fc0223c8b5cbd85be450646cd9e224337d` | `c3777bf05896d563c31151786c1f6b0886aede6b87679819c920705bb985d252` | — |
| `blog/teen-boundary-setting-conflict-deescalation/index.html` | 200 | `https://senseisandy.com/blog/teen-boundary-setting-conflict-deescalation` | `5f4709e117dd97d62b98e01de5bc066c83cea247564bacac5242cbc6636b1c1a` | `ba51326ab57729d5a8fabd27d45c6c3e1b43ce59daf675e22b5c230f4d53e82d` | — |
| `blog/teen-confidence-deescalation-jiu-jitsu/index.html` | 200 | `https://senseisandy.com/blog/teen-confidence-deescalation-jiu-jitsu` | `165988ffa4a04489c14663c84ab197abb9ad14deca26f4e99df3700ba44df885` | `0825a51cec010f6d5aee479be45bcda8f7dd40388c48055289a8a42af6f219a5` | — |
| `blog/teen-jiu-jitsu-hunter-ny/index.html` | 200 | `https://senseisandy.com/blog/teen-jiu-jitsu-hunter-ny` | `dc110aff0cb0e2e09c1fb8a6fe0adc8f853319b401a90d02744fa25b35e89885` | `dd1a38d5502a51515b9aa411606f3f3281359367edeba5cf1b3c9811eea0db61` | — |
| `blog/things-to-do-near-hunter-ny-private-bjj-coaching/index.html` | 200 | `https://senseisandy.com/blog/things-to-do-near-hunter-ny-private-bjj-coaching` | `7893efb5b94058904e23bd840136f9edc68d35da1300f9d0b82e05212497f11b` | `591ffe181245a164c699994ac880f573537a103487288344923e99f5be681ff0` | — |
| `blog/water-before-training-how-much-when/index.html` | 200 | `https://senseisandy.com/blog/water-before-training-how-much-when` | `e17ee5a52de8f436039241c44ea641006e361f3be6e4be8f0feba026fcd107d7` | `e50c8eba616d21400ee510e48c1d8e226ffc476a83d455799b97bce39ffd7c4c` | — |
| `blog/what-does-sensei-mean-in-bjj/index.html` | 200 | `https://senseisandy.com/blog/what-does-sensei-mean-in-bjj` | `e9218ff3fd143cf80cf716f490b7e663e912bb9dc89e53b0b51c91dacee896f1` | `c951aee3cb3c9343d0b6a2e05b4c91e529345b997ead5cde61aa45ca26b32568` | — |
| `blog/what-is-sanda-sanshou/index.html` | 200 | `https://senseisandy.com/blog/what-is-sanda-sanshou` | `a9b1368d60b7ee155b774180c381fba440db33bf754d674f23b14bd4da5084bb` | `41c2d8700ceb6e22492b4cd63c9725929fd983c47680ea2cfb7103b89f534dbe` | — |
| `blog/what-kids-learn-in-bjj/index.html` | 200 | `https://senseisandy.com/blog/what-kids-learn-in-bjj` | `f3edbd6b7df1cf2dbba4a9c87cab8f7b3afe835e44922f328ebd5703e5ecc962` | `b70b0faae05e5ba23be1cd3f6fb24ede8c3a33978628297baf806788d9c03db0` | — |
| `blog/why-high-school-athletes-train-bjj-tannersville/index.html` | 200 | `https://senseisandy.com/blog/why-high-school-athletes-train-bjj-tannersville` | `df0f0531faafaa2c7968a45f11eebd10d93435725a2f0ee6a219de758d9f6d51` | `7cd581042553aebe3851d230a13bf710cc2cab3b16eac6bc83de5ea32f26c21d` | — |
| `blog/wrestle-ups-scramble/index.html` | 200 | `https://senseisandy.com/blog/wrestle-ups-scramble` | `dabb03674cfa645ba4eabe4e71d05278a510dc26539fa56b2684a708e59d3a2c` | `8ba5e83d894cff6e8e10577414d479754b067f1585c2271d142fff78e251b864` | — |

Hash pass: 99/99 responses completed in 19.7s; fetch errors: 0.
