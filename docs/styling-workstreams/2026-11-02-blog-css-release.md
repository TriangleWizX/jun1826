# Blog CSS release — 2026-11-02

## Scope and approval

Apply only the Blog typography and category-pill fixes authorized by the [2026-10-25 styling plan](../mobile-desktop-styling-plan-2026-10-25.md#blog). The CSS source changes are: article metadata, featured labels and CTA, search feedback, card badge/read time, schedule mini-row text to 14px; `.ss-pill` minimum height to 44px; and the targeted prose-link rule `.page-blog .ss-prose a:not(.btn)`. The unapproved rail-link, card-link, and alert-layout edits are excluded.

## Safe generated output

The clean build passed, but 18 production article files contain materialized page content that the clean candidate does not contain. A direct clean-page upload would remove that live content. An approved read-only SFTP snapshot captured the 33 affected article/tag pages and the Blog hub. For each file, only the contents of its existing `style#article-delivery-inline` element were replaced with the clean candidate CSS. The opening and closing tags and every byte outside that style body were preserved. All 34 routes have exactly one such block, and all 34 pass the outside-CSS byte comparison.

The exact route hashes and byte counts are in [the SFTP merge evidence](evidence/2026-11-02-blog-css-live-snapshot.json). The shared replacement CSS SHA-256 is `e895c3ed0081e1418cadbda6b7fb66ffde6a5e14d2ded647be5c38741908852f`. Before upload, re-read the routes and stop if any non-CSS bytes differ from this reviewed snapshot.

## Local verification

- `npm run build` passed in the isolated checkout.
- Isolated local browser checks at 390px and 1440px passed for `/blog/` and a representative article: HTTP 200, no horizontal overflow, and no page errors. All inspected Blog hub labels and card text measured at least 14px; category pills measured 44px high. The representative prose links remained 16px.
- Mobile and desktop screenshots were visually reviewed from isolated browser contexts. All off-origin requests were blocked.
- `git diff --cached --check` reports 68 trailing-whitespace lines in the Blog hub snapshot. All 68 are after the replacement style body and byte-identical to the live snapshot; they are retained to preserve production markup.
- No form submission or external side effect was triggered. Lighthouse/PageSpeed, site-wide contrast, and keyboard acceptance remain owner-run checks.

## Deployment gate

Deploy exactly the 34 paths listed in the evidence file from this committed generated output using the verified-backup procedure. Verify the exact dry-run path set, then compare fresh SFTP and HTTP bytes with the committed files and run live mobile/desktop browser checks. Keep the release incomplete until those checks pass.
