# Ranking improvement plan — September 6, 2026

## Approved release — published September 6, 2026

The user approved deployment. All six reviewed additions were published through insertion-only patches against freshly downloaded production files. Whole local build files were not uploaded because all six differed from production. Every existing production byte was preserved around the additions; title, complete head, H1 and script comparisons passed before upload. No shared assets, redirects, archive files or remote deletions were included. No git commit was created.

Backups, prepared payloads, diffs, source and remote SHA-256 hashes, and verification results are retained in `artifacts/ranking-release-2026-09-06/`. `manifest.json` maps files in order to `0.before.html` through `5.before.html` (rollback copies) and corresponding `.after.html` files. Each uploaded file was reread over SFTP and matched its expected SHA-256. The Hunter file matched its pre-release SHA-256 after publication.

Public verification: all six routes returned HTTP 200 and contained their new content. Hunter and five linked destinations also returned HTTP 200. Live Chromium checks at 390×844 and 1440×900 passed on all six pages: no horizontal overflow, one H1 and main landmark, expected canonicals, and booking links present. These checks do not constitute a full accessibility audit or a form-submission test.

Rollback: first compare the current remote hash with the manifest's `after` hash to avoid overwriting subsequent work, then atomically restore the corresponding `.before.html` backup to its exact manifest path and verify the restored `before` hash. Restore only the affected page if a problem is isolated. The live Hunter page must remain untouched.

The dated work log below describes earlier local stages; its pending-deployment notes are superseded by this release record. Ranking gains and retention of all 27 position-1 terms remain unverified until comparable post-release desktop/mobile exports are available. Review around September 20 and October 4, allowing for crawl timing; no automatic monitoring job has been scheduled.

## Evidence and limits

Inputs: `assets/position-tracking-report-desktop-2026-09-06.csv` and `assets/position-tracking-report-mobile-2026-09-06.csv`. Each contains 55 terms. The initial comparison found 27 terms at position 1 on both devices and 28 below position 1 or unreported. A dash means no reported position, not position zero. Reported volume zero does not prove no local demand. The exports do not establish why a position changed, actual conversions, or competing results.

The SEO-audit and keyword-clustering workflows favor matching search intent to existing pages. CRO guidance favors useful first-visit information and a clear next step. No new keyword landing pages are justified by these exports alone.

## Non-position-1 query decisions

| Queries | Desktop/mobile baseline | Page and action |
| --- | --- | --- |
| beginner friendly bjj tannersville | 2 / 2 | Contact: clarify beginner questions and next steps; retain contact purpose. |
| adult jiu jitsu windham ny | 2 / 2 | Existing Windham article: expand adult first-visit guidance below existing youth sections. |
| brazilian jiu jitsu windham ny | 3 / 3 | Same Windham article; describe service near Windham, with training in Tannersville. |
| teen self defense tannersville ny | 2 / 2 | Bully-proof page: explain boundaries, help, controlled escapes and limitations below the hero. |
| after school martial arts tannersville | 24 / 23 | Contact currently ranks. Add a descriptive link to the existing `/after-school` page; inspect indexation and inlinks before further changes. |
| bjj sensei | 5 / 5 | Homepage ranks; review informational `/blog/bjj-sensei` and entity page overlap before altering homepage. |
| sandy jiu jitsu; sensei jiu jitsu | 6 / 6 each | Homepage ranks; retain business identity and review links to instructor evidence. |
| jiu jitsu sandy | 10 / 10 | Homepage ranks; ambiguous geographic/entity query. Avoid forcing repeated reversed wording into copy. |
| sensei studio bjj | 6 / 6 | Existing `/sensei-studio`; review studio identity and useful visitor details. |
| jiu jitsu sensei | 14 / 14 | Existing `/sensei-jiu-jitsu`; review instructional intent versus instructor-lineage purpose. |
| sensei studios | 22 / 23 | Homepage ranks; ambiguous navigation. Confirm SERP identity before changing target page. |
| sensei studio | 30 / 31 | Homepage ranks despite dedicated studio page. Investigate query intent and indexation; no redirect justified. |
| sanders jiu jitsu | 48 / 51 | Possible other entity; defer targeting pending evidence of relevance. |
| sardinha brazilian jiu jitsu; sardinha bjj | 51 / 48 each | Possible other entity; do not add unverified affiliation or competitor copy. |
| sindalu | 55 / 52 | Unclear relevance; validate intent before targeting. |
| jacyntho ferro | — / 22 | Instructor-lineage page ranks on mobile. Review historical sourcing before adding material; no unsupported lineage claims. |
| brazilian jiu jitsu near woodstock ny | — / — | Potential nearby-local intent; inspect existing Woodstock coverage and travel usefulness before considering new content. |
| senjutsu martial arts; new york sanda; senshi judo | — / — | Different entity or discipline likely; defer unless research establishes relevant informational intent. |
| sensei studio headquarters; sensei dojo | — / — | Ambiguous navigation; research identity before targeting. |
| sd brazilian jiu jitsu nyc; snyder dojo; gracie barra sandy; long island bjj | — / — | Other entities or distant geography likely; no truthful local-service case established. |

## Protection and completion requirements

- Preserve existing URLs, canonical/indexation policy, titles, H1s, program links and conversion controls on pages holding #1 queries. For Windham, retain kids and teens sections while expanding adult guidance.
- Review every changed page at mobile and desktop widths for hierarchy, CTA access, focus and overflow. Build and SEO scripts do not prove rendered usability.
- Build generated output and check links, metadata and volatile facts. Existing `validate:html` invokes a doctype check; it is not a comprehensive HTML validator.
- Keep unrelated worktree changes separate. No commit or deployment is authorized by this plan.
- Before release, record the exact changed paths and a rollback patch/commit. After an authorized release, verify live content and links.
- Compare later exports from the same tracking campaign, geography, devices and keyword set. Check all 27 protected #1 terms separately on each device, plus the targeted terms. Investigate any losses with the ranking URL and Search Console evidence before attributing them to these edits.
- Review at roughly two and four weeks after release, allowing for crawl timing. Do not treat local QA as evidence of ranking gains or a guarantee that #1 positions will persist.

## Current implementation

Windham adult guidance, teen self-defense guidance and a contextual contact-to-after-school link are implemented locally. Broader page-intent research, browser checks, release approval and post-release ranking evidence remain outstanding. This document records hypotheses and work remaining; it does not claim the ranking objective is achieved.

Additional existing-page changes: `/sensei-jiu-jitsu` now links to the BJJ-sensei explainer and studio; `/blog/bjj-sensei` links back to instructor lineage and the studio. These clarify the relationship between informational, instructor and studio content. The Woodstock location page now links directly to schedule and directions and states that training is in Tannersville. No new pages, metadata rewrites or redirects were introduced. Build, SEO, static links, volatile-fact checks and diff checks passed after these additions. These latest three pages still need rendered verification.

### Local browser evidence

Chromium loaded generated contact, bully-proof and Windham pages at 390×844 and 1440×900. Each had one main landmark and one H1, the expected canonical, and no horizontal overflow. Primary booking links were present. The first desktop Windham booking link is inline text (20px measured height), so this does not certify all links as large tap targets. External HTTPS requests were blocked; external embeds, third-party scripts and production behavior were not verified. A simple local file server was used, so extensionless-route navigation still needs the normal site server or production to verify. These are DOM measurements, not a complete visual or accessibility audit.

### Protected-query source audit and Hunter release gate

The CSVs contain 54 position-1 observations: 27 distinct terms across 16 distinct URLs. Of the 14 URLs directly resolved to source paths, 12 source files match HEAD. The other two, Windham and bully-proof, retain their title, description, canonicalUrl, permalink, H1 and all pre-existing href destinations. The `/blog/martial-arts-windham-ny` permalink resolves to `src/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu/index.html`, also unchanged. This protects specific source properties; it does not establish that shared assets or production pages are unchanged.

The remaining URL, `/martial-arts-hunter-ny`, has no active source page. `_archive/martial-arts-hunter-ny.html` exists, but Eleventy excludes `_archive/**`. `src/.htaccess` still rewrites the route to `/martial-arts-hunter-ny.html`. An approved live check returned HTTP 200, title `Martial Arts Hunter NY | Beginner BJJ Near Hunter Mountain`, self-canonical `https://senseisandy.com/martial-arts-hunter-ny`, and H1 `Martial Arts Near Hunter NY for Beginners and Families`.

The archived copy canonicalizes to `/nearby-towns`, unlike production. Do not publish that archived copy or delete the live Hunter file during this SEO release. Reconcile its source from verified live bytes and inspect the historical consolidation decision before any future full release. Scoped additions to the three edited pages do not require changing Hunter. Live HTTP and metadata alone do not prove its complete content or current ranking.

### Reviewable release scope

Final local scope is six source pages: `src/contact.html`, `src/bully-proof-jiu-jitsu-tannersville-ny.html`, `src/blog/jiu-jitsu-windham-ny/index.html`, `src/sensei-jiu-jitsu.html`, `src/blog/bjj-sensei/index.html`, and `src/bjj-classes/woodstock-ny/index.html`. Their generated output paths are identical with `src/` replaced by `dist/`. This report is documentation, not a production payload. Exclude pre-existing CSS, QA-script, crawl-report and image-report changes from any release of this patch.

The final instructor, BJJ-sensei and Woodstock pages were also loaded in Chromium at 390×844 and 1440×900: no horizontal overflow, one H1 and main landmark each, expected canonicals, and rendered new links. Thus all six pages have local DOM/layout measurements. External HTTPS remained blocked; this is not a production or comprehensive accessibility test.

Release remains pending explicit authorization. Preserve the live Hunter file and do not deploy archive content or deletions. Capture pre-release remote bytes of the six destinations for rollback before uploading; do not substitute old HEAD output for a production backup. Compare the release payload against production before upload to account for source/production drift. Later comparable desktop/mobile exports are required to prove improved rankings and retention of the 27 protected terms. No local test can prove that outcome.
