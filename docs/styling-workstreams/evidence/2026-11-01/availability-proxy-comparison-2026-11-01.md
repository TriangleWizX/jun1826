# Availability proxy and viewport comparison — 2026-11-01

clean HEAD versus fresh build from 77 dirty production inputs; main dist was not used or changed by the candidate build.

## Results

| Candidate | Samples | Pass | Fail | Availability requests | Upstream results | Proxy errors |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| clean_head | 460 | 430 | 30 | 457 | 200: 457 | 0 |
| dirty_source | 460 | 445 | 15 | 456 | 200: 456 | 0 |

Dirty source passed 445/460 samples versus clean HEAD 430/460. Matching exact route, screenshot, and failure reason, 17 clean-HEAD failures did not recur; two new phone-width missing-hero-image failures appeared on the minute-by-minute blog route, and 13 failures are shared. Remaining dirty failures include Home and Videos primary targets and Bio text/viewport findings. All recorded availability upstream responses were HTTP 200.

## Dirty-source failures

- `/` at `home-320x720.png`: primary target below 44px
- `/` at `home-360x640.png`: primary target below 44px
- `/` at `home-360x900.png`: primary target below 44px
- `/` at `home-390x844.png`: primary target below 44px
- `/` at `home-430x932.png`: primary target below 44px
- `/` at `home-639x900.png`: primary target below 44px
- `/` at `home-640x900.png`: primary target below 44px
- `/` at `home-641x900.png`: primary target below 44px
- `/` at `home-767x900.png`: primary target below 44px
- `/bio` at `bio-320x720.png`: text below 14px, body text below 16px
- `/bio` at `bio-390x844.png`: visible text outside viewport, text below 14px, body text below 16px
- `/blog/exactly-what-happens-first-bjj-class-minute-by-minute` at `blog--exactly-what-happens-first-bjj-class-minute-by-minute-320x720.png`: unexpected HTTP error responses (HTTP 404 http://127.0.0.1:37707/assets/images/hero.89f093.webp)
- `/blog/exactly-what-happens-first-bjj-class-minute-by-minute` at `blog--exactly-what-happens-first-bjj-class-minute-by-minute-390x844.png`: unexpected HTTP error responses (HTTP 404 http://127.0.0.1:37707/assets/images/hero.89f093.webp)
- `/videos` at `videos-320x720.png`: primary target below 44px
- `/videos` at `videos-390x844.png`: primary target below 44px

The report and diagnostics capture request metadata only. They include no availability response bodies. Summary and diagnostics SHA-256 values are recorded in the JSON companion file.

## Release significance

This run validates the approved real-service GET proxy in the local viewport harness. It does not qualify the current mixed root `dist/` for production: the dirty candidate has two new missing-image failures and 15 failures overall. Fix and reverify the missing asset before considering a generated-site release. The baseline run passed 430/460; the dirty candidate passed 445/460, with 17 exact samples no longer failing, 13 failures shared, and 2 new failures.
