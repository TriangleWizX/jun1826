# Blog implementation report

Eight interview-based articles are implemented locally: four new pages and four refreshed pages. All eight rendered article bodies meet the requested Grade 3 maximum and exceed 2,000 visible characters. No commit or deployment was requested or performed.

## Pages and reading checks

The article score includes the rendered headline, byline, headings, prose, link labels, and article CTAs. The page score also includes shared site text. Both use the repository Flesch–Kincaid checker with `--max-grade 3`; all banned-language results are empty. Scores are a reading-level estimate, supported by editorial review.

| Source page | Change | Article grade | Full-page grade | Article characters |
| --- | --- | ---: | ---: | ---: |
| [Kids BJJ Near Hunter: Who Will My Child Train With?](../../../src/blog/kids-bjj-training-partners/index.html) | new | 1.92 | 1.63 | 2,279 |
| [What Kids Learn in BJJ Partner Practice](../../../src/blog/what-kids-learn-in-bjj/index.html) | new | 2.27 | 1.86 | 2,257 |
| [Teen Self-Defense in Greene County: What We Practice](../../../src/blog/teen-confidence-deescalation-jiu-jitsu/index.html) | refresh | 2.46 | 2.05 | 2,479 |
| [Can Parents and Kids Train BJJ Together?](../../../src/blog/family-martial-arts-catskills/index.html) | refresh | 2.92 | 2.48 | 2,454 |
| [BJJ for Older Adults: Move, Learn, and Meet People](../../../src/blog/bjj-beginners-over-40-catskills/index.html) | refresh | 1.72 | 1.56 | 2,241 |
| [Private BJJ Lessons: Bring One Goal](../../../src/blog/private-bjj-lessons-adults-catskills/index.html) | refresh | 2.66 | 2.33 | 2,359 |
| [More Time to Try: How I Teach BJJ](../../../src/blog/how-sandy-teaches-bjj/index.html) | new | 2.71 | 2.21 | 2,210 |
| [Why I Teach Jiu-Jitsu on the Mountain](../../../src/blog/bjj-on-the-mountain/index.html) | new | 2.74 | 2.33 | 2,362 |

Exact rendered hashes and results are in [implementation-qa.json](implementation-qa.json). URL mappings and draft provenance are in [implementation-manifest.json](implementation-manifest.json).

## Scope

- Eight `src/blog/<slug>/index.html` files use the existing article layout and styles, with a single H1, byline, updated date, primary CTA, related reading, metadata, self-canonical, and BlogPosting schema.
- `src/blog/index.html` lists all eight, retains search/category filters, and reports 70 guides.
- `data/url-registry.json` registers the four new pages and reconciles refreshed pages for active/indexable blog sitemap entries.
- The build updates tracked `dist/blog/bjj-beginners-over-40-catskills/index.html` and `dist/sitemap-blog.xml`. Other article output is present in the generated site but ignored by Git under the existing repository rules.
- Documentation records the implementation and QA. No CSS, JavaScript, dependency, booking contract, price, or schedule change was needed.
- The incidental generated asset-manifest removal was restored. The pre-existing edits to `src/_data/evidence-records.json` and `src/sources/research/records.njk` retain their saved SHA-256 hashes.

## Verification

- `npm test`: passed, including the site build, evidence checks, 15 unified tests, Cal migration QA, and 35 Ad Studio tests. The Ad Studio existing-output error line is an expected negative test; the suite exits successfully.
- `npm run qa:volatile-facts`: passed, 1,122 files checked.
- Final browser QA: all eight pages at 390×844 and 1440×1000. No horizontal overflow, page script errors, or missing local resources. Each primary CTA was visible above the fold, at least 44px in each dimension, and programmatically focusable. Sample phone and desktop screenshots were visually inspected. This is a basic accessibility check, not a full audit.
- The 70-card directory passes search and category checks for all eight articles at both widths.
- All article internal links and referenced fragment IDs resolve in local output. Eight unique titles/descriptions, self-canonicals, one H1/main, parseable BlogPosting data, indexable registry status, and sitemap inclusion were checked.
- Read-only SEO and evidence reviewers found no material blockers in the final source.
- `git diff --check`: passed after removing three introduced whitespace-only lines.

## Test environment and limits

The first test attempt reached browser QA but was blocked by the sandbox. An elevated retry hit the fingerprint tool's existing guard because generated `dist/404.html` changed after its preflight read. A subsequent sequential elevated run passed without changing the guard or build tooling; the transient cause was not established.

The suite reports an existing site-wide CSS gap for a fingerprinted Bootstrap Icons stylesheet. Targeted browser QA of these articles requested no missing local resources. Browser QA used installed Google Chrome with external requests blocked. No external URLs, Instagram footage, live pages, or production behavior were verified. First-person claims remain grounded in Sandy's interview, not independent authentication.

## Persona and editorial framework

The implementation selector had no suitable ready coordinator role, so the coordinator used a disclosed ordinary web implementation specialist fallback. Read-only reviewers reused their fully inspected source assets:

- Solon the SEO Sage, `2d52210b-edae-48f2-b5a5-095e3dd4c523`, `assets/indranet-prompt-exporter/exports/Solon-the-SEO-Sage/versions/v2.0.0/prompt.json`: page ownership, local intent, canonicals, and navigation.
- Universal Analyzer-Improver, `65808004-23a5-42ae-babe-1dbe85bfd1cf`, `assets/indranet-prompt-exporter/exports/Universal-Analyzer-Improver/versions/v2.2.0/prompt.json`: claim fidelity, implications, private-service boundaries, and youth participation rules.
- INSTRUCTIONS - CONTENT, `6e94db8f-e23d-4387-8cc6-bac209e890aa`: fact extraction, audience question, coherent body and next step, simple language. Full source was inspected in the prior work and reused.
- Anything-Enhancer - OptiMax, `4a702064-50b8-4fbb-875c-2f3600c8d6dc`, `assets/indranet-prompt-exporter/exports/Anything-Enhancer---OptiMax/versions/v1.0.0/prompt.json`: full text recovered during implementation; no attachments. Applied concrete movement detail, warmth, bounded anecdote, and clear feedback.

Copywriting, Stop-Slop, and copy-readability-audit skills informed the work. The user's Grade 3 maximum overrides weaker generic thresholds. The four-rubric review includes plain active prose, grounded conversion flow, realistic class detail, and a format check: social Reel timing, tags, and reach rules do not apply to these articles. Reviewers had empty write contracts; only the coordinator edited files.

## Release boundary

Local implementation and validation are complete. A future release should use the explicit page/index/sitemap payload and preserve unrelated work. Rollback should restore only this campaign's source, registry entries, blog cards, and corresponding generated pages; it should not reset the full worktree.
