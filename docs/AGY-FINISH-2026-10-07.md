# AGY completion and release audit

Status: in progress; commit and deployment authorized by user.

## Persona & Expert Framework

Coordinator: Dr. Ada Turing, 937a02cd-470a-4211-b880-b05bdf8bf585; full versioned source assets/indranet-prompt-exporter/exports/AI-SuperExpert-Agent-Specialist---Dr.-Ada-Turing/versions/v4.0.0/prompt.json. Instructions - COMPETENCE, e144b81f-10ea-41a6-a06c-03d69dfb738f, complete text read from exports/index.json. Selector abstained on combined task; host selected versioned project-lead methods: requirements, risk assessment, independent verification, and bounded integration. Assets have no attachments.

Content workers: Alex Turner, a9519f7d-8247-4bee-9075-72420110c5bf, versioned source; INSTRUCTIONS - CONTENT, 6e94db8f-e23d-4387-8cc6-bac209e890aa, index.json complete text. Apply audience fit, clear next steps, factual review, revision, and mobile accessibility. Instruction export status partial reflects missing notes; full text and attachment list available. Each worker verifies adoption separately.

Rubrics: Stop-Slop >=40/50; source-grounded Universal Analyzer-Improver; Anything-Enhancer warmth constrained by actual evidence; reach matrix applies only to social distribution, which this release does not include. Full versioned rubric sources read; no attachments. User grade-3 rule supersedes looser skill thresholds.

## Workstream contracts

1. DOD-COPY: finish all 55 existing blog rewrites outside seven new guides. Write paths restricted to assigned src/blog HTML. Preserve topics, sources, links, analytics, and booking URLs; remove unsupported facts and punctuation gaming.
2. DOD-CLUSTER: finish seven new commercial/youth guides. Exact owner-reported anecdotes, anonymous youth, request-based private booking, canonical rates, positive accessible prose. Write paths limited to seven routes.
3. DOD-INTEGRATION: read-only independent audit of blog hub, pillars, registry, sitemaps, readability measurement, and release mapping. Coordinator owns any resulting integration/tool changes.
4. DOD-RELEASE: coordinator independently reviews changes, runs relevant local QA/build/tests and browser checks, commits exact scoped files, dry-runs exact payload, uploads authorized release, and verifies live routes/content separately.

## Constraints

Both original attachments must be read; current worktree is authority. Initial baseline saved in /tmp/agy-initial.patch and /tmp/agy-initial-paths.json. Preserve Android edit walkthrough and scratch_categorized.json. No unrelated cleanup or broad deployment. Existing 07b5ac13 implementation/deploy claims require current evidence. Network checks require elevated path first.

## Completion evidence

Pending per-route readability and claim audit, source diff inspection, integrations, test/build outputs, responsive browser evidence, exact commit/payload, upload verification, live HTTP/semantic checks, rollback evidence.

### Current verified progress

Seven new guide sources independently reviewed: unsupported scenes, travel estimates, private price range, promised safety/outcomes removed; owner-reported anecdotes preserved with anonymous attribution. Corrected source readability grades 1.95–2.68, all banned scans clean. Hidden CSS/script/comment/template text excluded; layout containers no longer inflate sentence count; optional --max-grade gate fails unreadable fixture and visible-word fixture excludes hidden content. Syntax check passed. Initial volatile-facts QA passed 1,084 files (final rerun pending).

Release audit: all seven routes registered, indexed, in hub and appropriate pillars. Two older canonical public guides lack hub cards; two other directory omissions are duplicates/unpublished. Mapper aliases beginner-friendly source to public canonical output; any HTML edit discovers six sitemaps; --only filters discovered candidates. Historical --commit selects filenames but current dist bytes, so prior AGY rollback command does not restore historical content. Rollback must use verified preupload bytes or isolated historical build.

### Source integration review

Hub now includes two missing canonical guides and65 cards, matching its label. Guide descriptions and both pillar cross-link sections align with corrected narrative provenance and request-based booking. Seven inline Text Sandy event links restored after worker rewrite. Cost guide retains transparent rate and session length from canonical pricing templates, including single-session and six-pack prices. No hardcoded price added.

Live baseline (approved elevated curl): youth stories route200 at expected final URL. Existing live page still contains unsupported teasing-ended and gym-coach-arrived claims, old6033 address and invented drilling scene. Final release must prove these removed, alongside new anonymous coach-account markers.

Readability measurement fixtures now prove hidden text exclusion, grade-threshold failure, encoded-apostrophe banned-term detection, and decimal-table values not adding sentences. Source grading remains a heuristic; final rendered editorial copy and manual content review are separate gates. Telephone actions use canonical contact.phoneHref templates in seven guides, and inline Text Sandy tracking is retained.

Verified rollback snapshot: /tmp/agy-predeploy-20261007T181216Z.tar.gz captures all71 intended public release paths. Each downloaded file was compared with a second SFTP read, archived, then checked against its recorded SHA256. Scope is the affected public files, not a full-site backup. Manifest and archive digest are in /tmp/agy-snapshot-result.json and snapshot manifest.json. Snapshot does not grant deletion/cleanup authority.


Final local validation: all 62 articles pass the repaired grade gate (maximum 2.976), with no banned words. Four readability regression tests pass. npm test passes (build, unified QA, Cal migration QA, 35 Ad Studio tests); volatile-fact QA passes across 1,084 files and schedule QA passes. The existing bootstrap icon stylesheet warning is outside this release. Responsive verification covers 65 routes at 390 and 1440 pixels; final results are recorded separately. Unrelated user drafts remain untouched.

Screenshot review found green text on green inline primary buttons. The articles now use the existing Bootstrap text-white utility. A focused browser assertion checks the computed CTA text color. The release remains 71 public files; no shared CSS or dependency changes are needed.

Final responsive QA passes: 130 checks across 65 routes at 390/1440 pixels, including primary CTA text color, metadata, canonicals, overflow, local links, and page errors. Mobile and desktop screenshots were inspected. Browser reports and screenshots: /tmp/agy-browser-qa/. Official movement source returned HTTP 200. Production byte and route verification follows the scoped upload.

## Production release evidence

Release commit: `81bf6be74059618c40aabda9f2d80c2cc83e13cf`. The unfiltered mapper was inspected and the exact filtered dry run matched all 71 approved public paths. Upload completed with exit 0, 71 uploads, and no backup cleanup. `--reuse-existing-backup` bypassed remote backup creation/cleanup; the independently verified scoped snapshot supplies rollback evidence.

Production verification passed: 71/71 SFTP files match final local bytes and 71/71 HTTP/content checks pass, including final URLs, page metadata, sitemap bytes, and corrected youth-story markers. Evidence: `/tmp/agy-upload.log`, `/tmp/agy-unfiltered-dry-run.log`, `/tmp/agy-exact-dry-run.log`, `/tmp/agy-live-verification/remote-bytes.json`, and `/tmp/agy-live-verification/http-content.json`.

Rollback: restore the 71 paths from `/tmp/agy-predeploy-20261007T181216Z.tar.gz` using its manifest and verified file hashes, then repeat HTTP and byte checks. This restores pre-release bytes. `deploy-release.py --commit OLD` is not a rollback because it still uploads current dist bytes. The snapshot is scoped, not a full-site backup.

Live browser checks identified two shared dependencies: `/tokens.40ed4d.css` was missing, and the navigation fallback called undefined `mobile()`. Add the existing token asset and define the mobile breakpoint helper in the navigation source. The final release adds only these two public dependency paths to the original 71. Build and focused navigation QA pass. Dependency rollback bytes and absence markers are recorded in `/tmp/agy-dependency-predeploy/`.
