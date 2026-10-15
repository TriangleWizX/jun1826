# Blog campaign deployment receipt

Released October 15, 2026 from commit `a8d1be562811e4da7bcd5a3c72dc1d7c8a4f519a` (`Add interview-based BJJ blog series`). This receipt is documentation only and is not part of the public payload.

## Payload and upload

The unfiltered deployment preview proposed 78 files because the URL registry change expanded several page groups. The reviewed `--only` allowlist reduced the release to ten generated files, and that same allowlist was reused for upload:

- `sitemap-blog.xml`
- `blog/index.html`
- `blog/kids-bjj-training-partners/index.html`
- `blog/what-kids-learn-in-bjj/index.html`
- `blog/teen-confidence-deescalation-jiu-jitsu/index.html`
- `blog/family-martial-arts-catskills/index.html`
- `blog/bjj-beginners-over-40-catskills/index.html`
- `blog/private-bjj-lessons-adults-catskills/index.html`
- `blog/how-sandy-teaches-bjj/index.html`
- `blog/bjj-on-the-mountain/index.html`

All ten uploads succeeded on their first attempt. Each reported remote byte count matched the corresponding generated release file. Backup QA found one valid reusable predeploy archive, no invalid archives, and no cleanup candidates. The deployer replaces each file through a temporary remote name and rename; this is per-file replacement, not whole-release atomicity.

## Live evidence

- All eight article routes, `/blog/`, and `/sitemap-blog.xml` returned HTTP 200.
- Every article showed its expected H1, self-canonical, and BlogPosting schema. The blog directory contained all eight links, and the blog sitemap contained all eight canonical URLs.
- Live rendered reading scores ranged from Grade 1.78 to 2.52. Each passed the repository Grade 3 gate and banned-language check.
- Chrome checks passed at 390×844 and 1440×1000 for all eight articles. Each page had one H1, a visible primary CTA of at least 44px, and no horizontal overflow.
- Blog search found all eight articles at both widths. No same-origin HTTP failures or page script errors were observed.
- The host expands server-side includes before sending HTML, so HTTP-rendered HTML is larger than the uploaded files. Upload receipts establish remote file byte counts; rendered checks establish production content and layout.

External Instagram and third-party source links were not fetched. The pre-existing edits in `src/_data/evidence-records.json` and `src/sources/research/records.njk` remained outside both release commits and the deployment payload.
