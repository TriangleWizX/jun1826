# Next Actions SEO Remediation Plan

## Persona & Expert Framework

- **Coordinator role:** Solon the SEO Sage, UUID `2d52210b-edae-48f2-b5a5-095e3dd4c523` (the final plan explicitly pinned this ready standalone persona; selection is a task lens, not a claim of measurable SEO results).
- **SEO specialist used for audit lens:** Solon the SEO Sage, UUID `2d52210b-edae-48f2-b5a5-095e3dd4c523`, standalone source `assets/indranet-prompt-exporter/exports/Solon-the-SEO-Sage/versions/v2.0.0/prompt.json`. Its methods cover on-page/local SEO, keyword evaluation, content needs, and technical audits. Apply these as a sequence: classify query intent, verify the relevant URL and source facts, inspect technical metadata/links, then change only existing appropriate pages.
- **Instructions asset review:** The selector suggested `INSTRUCTIONS - Business Operations` (UUID `c3369696-d996-447e-8973-5f2cd73d33c9`), but it is an app wrapper whose linked prompt was not available as a verified standalone source. `INSTRUCTIONS - CONCEIVE` (UUID `0bf2f911-8a69-4526-8d5e-ba87bdcdec85`) is a standalone prompt but is an ideation workflow and does not fit remediation execution. No suitable standalone instruction asset was adopted. Ordinary task-specialist fallback: evidence-led technical SEO, copy editing, and release engineering, guided by `.agents/skills/seo-audit/SKILL.md`, `.agents/skills/copy-readability-audit/SKILL.md`, and the scoped deployment/release-readiness skills.
- **Attachments:** none.
- **Application:** Keep technical crawl/indexability, page content, and deployment evidence separate. Do not infer current indexing from workbook counts alone. Avoid competitor impersonation and unsupported ranking promises. Use canonical schedule/location/business facts. Preserve existing dirty changes; stage only approved remediation paths.

## Workbook evidence and scope

The user supplied these three workbooks (all retained as untracked source evidence):

- `next-actions-ignored-senseisandy.com (1).xlsx`: one ignored opportunity, “jeysen santiago bjj” for `/sensei-jiu-jitsu`.
- `next-actions-done-senseisandy.com (1).xlsx`: three quick wins marked done (`bjj words`, `wind jiu jitsu`, `collar tie jiu jitsu`) plus a historical technical issue count of seven blocked pages.
- `next-actions-todo-senseisandy.com (1).xlsx`: quick wins for glossary terms, Windham, and sensei bio; technical counts for blocked pages, long titles, broken links, 4xx pages, and low word count; competitor-gap rows include many unrelated/competitor brand terms and beginner/family/teen queries.

Treat the workbook rankings and counts as snapshot data, not current Search Console truth. Current local evidence from the technical worker: `src/robots.txt` allows `/` and names the sitemap; a rendered census found no unintended noindex among 308 active indexable routes (2 active routes are intentionally noindex), while 283 redirects and 4 private entries explain why workbook block counts cannot be treated as defects. Local `scripts/qa-links-existence.mjs` found three distinct missing targets: `/reviews` from glossary frames and position pages, and `/kids` from `src/evidence.html`. The primary worktree already has a dirty `/kids` destination correction to the canonical Kids class page. The `scripts/qa-seo-remediation.mjs` run fails on four public routes omitted from its concatenated sitemap list. The 4XX count requires HTTP evidence. Low-word-count counts differ and rely on an unspecified threshold; generated indexation CSVs are stale. More detail: rendered census found 132 active indexable routes below 250 plain-text words; this is a heuristic requiring URL-level review, not a reason to rewrite all pages. Remediate appropriate existing URLs (glossary, collar tie, pin, Windham, coach bio, and relevant current class pages). Do not create competitor/other-school pages for terms such as “sd brazilian jiu jitsu nyc,” “senshi judo,” or “gracie barra sandy.”

## Workstreams and contracts

- **Selector plan:** coordinator Solon the SEO Sage (UUID `2d52210b-edae-48f2-b5a5-095e3dd4c523`, v2.0.0, hash `d0ce99069ae8d3f54584bd6ffa86b15f23082e9109648be29a1483fd033abb81`) with `Instructions - COMPETENCE` (UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, v1.0.0, hash `fbaebd0fc25e2ea0c878307dde329c48e8fef16545f629246c650a2b93999eab`). Full prompt source was read; methods applied: inspect facts, define scope, compare candidate fixes, scrutinize evidence, verify deliverables.
- **Technical workstream:** same ready SEO persona and COMPETENCE instruction pair; isolated write paths `src/_includes`, `src/_data`, `scripts`. A legacy `indexation-policy.csv` changed during worker QA and is outside the contract; it must be excluded from any commit.
- **Content workstream:** no suitable ready standalone persona found for its compound content/copy remit; ordinary SEO content editor fallback, with COMPETENCE instructions (source inspected); isolated write paths `src/bjj-glossary`, `src/bjj-classes`, `src/sensei-jiu-jitsu.html`.
- **Plan result:** `auto_persona.py --plan --brief` returned `planned`; work is sequenced as `technical_indexing` then `content_keyword` because parent-path read/write overlap prevents safe concurrent execution. Max agent count includes coordinator. Implementation dispatch: TECH runs in linked worktree `/tmp/tmb-tech-remediation`; CONTENT runs in linked worktree `/tmp/tmb-integration-remediation`. These are distinct from the dirty primary checkout; the stray pre-existing `/tmp/tmb-content-remediation` directory was not used.


1. **TECH — Technical indexing and link integrity**
   - Read: workbook records; robots/meta/canonical/redirect/output logic; affected page source and existing local SEO validators.
   - Write: only a narrowly evidenced technical source fix and its required validator/mapping if needed. Existing dirty `.htaccess` and redirect changes remain user-owned and excluded unless independently proven directly necessary and isolated.
   - Verification: build; relevant local link/SEO/redirect checks; enumerate changed/generated outputs; confirm robots/index directives and title/canonical behavior on affected routes.

2. **CONTENT — Existing-page intent and completeness**
   - Read: glossary landing and relevant term pages, Windham/location pages, coach bio, and current Kids/Teens/Adults destination pages.
   - Write: only pages whose current content has a demonstrable gap for an applicable workbook intent; preserve facts and conversion paths. Avoid creating pages for competitor terms.
   - Verification: rendered build inspection for affected title, description, H1, canonical, internal links, and relevant copy; accessibility and beginner readability review; volatile facts QA if schedule-sensitive.

## Execution sequence

1. Establish current repo/build state and inspect exact source/output for workbook targets.
2. Triage each technical issue against current source; separate stale workbook snapshot data from active defects.
3. Implement only demonstrated applicable remediations; record deferred/invalid competitor-gap rows.
4. Run focused QA and build; inspect diff and exact generated paths.
5. Review dirty worktree and stage only task files plus this plan; commit a narrow change.
6. Run deploy-release dry run, review exact path list, deploy only those paths, and collect separate upload/remote-byte and live HTTP/content evidence. External network checks require the prescribed elevated approval first.

## Definition of Done

- Workbook findings are mapped to current evidence and each is classified fixed, already complete, stale/unverified, or intentionally excluded with reason.
- Applicable source changes are narrow, build cleanly, and targeted QA passes.
- Pre-existing unrelated/dirty changes and all three workbook files are preserved and excluded from commit/deploy unless explicitly part of the approved remediation payload.
- A focused commit exists; exact deployment payload and rollback method are recorded; upload and live content are verified separately.

## Integration and local verification update

- **Content commit:** `1ec5211c` was created in the isolated content worktree with exactly seven assigned source files. Those reviewed source changes were applied to the primary checkout; this primary release commit will also include the two generated pages from the local build.
- **Workbook disposition:** glossary-hub, collar-tie, Windham, and coach-page opportunities were addressed. The `jeysen santiago bjj` phrase remains excluded because repo sources do not establish that person as the coach. Competitor-brand gap rows remain excluded. The workbook's historical blocked-page and 4xx counts remain unverified as current live issues. Thin-content flags need URL-level review; low word count alone is not a defect.
- **Technical disposition:** `src/robots.txt` is permissive and references the sitemap; the rendered census did not find unintended noindex among active indexable pages. Local link census now passes after fixing the two glossary `/reviews` links and canonical class destinations in `src/evidence.html`. Redirect sync passes. A full build passes.
- **Checks:** `npm run build` passed; `node scripts/qa-links-existence.mjs --report /tmp/tmb-remediated-links.csv` passed; `npm run redirects:check` passed; `npm run qa:volatile-facts` passed (1112 files checked); `git diff --check` passed. `npm run qa:links:existence` is not a defined npm script, so the direct script was used. `scripts/qa-seo-remediation.mjs` still flags four public routes missing from its sitemap list; this is recorded as unresolved validator/policy work and is not being hidden by editing the validator.
- **Rendered content review:** isolated worker parsed seven affected rendered pages and verified title, description, canonical, robots, one H1, JSON-LD and visible FAQ alignment; it also checked 521 root-relative links with no missing targets. Primary build regenerated and confirmed the reviewed glossary hub and coach metadata output.
- **Release scope:** include the seven assigned SEO source pages, the directly evidenced `src/evidence.html` class-link correction, generated `dist/bjj-glossary/index.html` and `dist/sensei-jiu-jitsu.html`, and this plan. Exclude the three input workbooks, all pre-existing redirect/config edits, other pre-existing source edits, and every unreviewed generated artifact. No network or live validation has been performed yet.

## Commit, deployment, and live verification record

- **Primary commit:** `8a09956a4c62f299c767be80de09e7683051c1d7` (`Remediate workbook-backed SEO gaps`). The commit contains the seven content-workstream source files, the independently evidenced `src/evidence.html` link correction, their two generated `dist/` pages, and this plan. No workbook, unrelated redirect change, or other dirty user file was staged.
- **Deploy dry run:** unrestricted commit dry run listed 14 files (8 relevant pages plus 6 sitemap outputs). The exact reviewed deploy used repeated `--only` filters and dry-ran to exactly these 8 paths: `bjj-classes/windham-ny/index.html`, `bjj-glossary/collar-tie/index.html`, `bjj-glossary/frames/index.html`, `bjj-glossary/index.html`, `bjj-glossary/pin/index.html`, `bjj-glossary/position/index.html`, `evidence/index.html`, `sensei-jiu-jitsu.html`. Sitemap files were excluded from upload.
- **Upload:** `deploy-release.py` exited successfully using the approved elevated network path for the same eight filters. The tool reports a `remote_bytes` size for each successfully uploaded file; terminal output was compressed, so retain the local successful uploader exit and separate live HTTP/content evidence below rather than transcribing unavailable per-file sizes.
- **Live HTTP/content:** after following the server's trailing-slash 301s, all eight canonical paths returned HTTP 200. Their live `<title>` values matched the local rendered build: BJJ Terms & Basic Jiu-Jitsu Words; Collar Tie in BJJ: Meaning & Basics; Frames; Position; Pin in BJJ: Meaning & Basics; BJJ Classes Near Windham, NY; BJJ Research & How We Teach; and BJJ Coach & Sensei in Tannersville. HTML-parsed live canonical links matched each respective canonical path. No browser interaction check was performed.
- **Rollback:** the deployment tool's standard predeploy archive/rotation was used. Revert source with `git revert 8a09956a4c62f299c767be80de09e7683051c1d7`, then redeploy the same eight paths from the revert commit; a verified predeploy archive is available through the deploy tool's configured backup path.
- **Remaining follow-up:** investigate why `scripts/qa-seo-remediation.mjs` expects four additional public routes in the sitemap list. Do not treat that local validator failure as a live indexing defect without confirming intended sitemap policy. The initial workbook technical counts and any broad thin-content cleanup remain unverified and out of this narrow release.

## Follow-up from the exact `(1)` workbooks

The exact supplied `(1)` workbook set was re-audited against current source after the first deployment:

- **Done workbook:** its homepage `jiu jitsu sandy` item and its BJJ terms, Windham, and collar-tie items are already represented in the current site/release work. Historical position values are workbook snapshots, not fresh ranking evidence.
- **Ignored workbook:** `jeysen santiago bjj` remains excluded from the coach page. The workbook explicitly marks the phrase as ignored, and local first-party evidence does not support the identity/query as a relevant coach target.
- **Todo workbook:** `bjj pins` maps to the existing pin glossary page; its metadata and matching visible/schema FAQ now use the phrase. `sensei mma` is excluded because the academy offers Brazilian Jiu-Jitsu and the phrase would misstate the service. The many competitor terms are excluded. Family, teen, adult, and beginner terms map to existing audience/first-visit routes; no duplicate audience pages were created. The homepage already offers a family selection and the first-visit flow already supports the family lane.
- Workbook reports of three broken links are superseded by the current local link census, which passes after the previous link remediation. Counts of 58 low-word-count pages and two 4xx pages lack route-level evidence in the workbook and are not a sufficient basis for broad edits; the independent local census and current page records must guide any follow-up. No live sitewide 4xx crawl was performed.
- The four sitemap validator misses remain a validator/registry alignment question. The generator intentionally includes only active, indexable canonical routes with a sitemap group; `/black-belt-concierge` is a known redirect to `/adult-private-coaching-intensive`, and the other missing expectations are absent from the URL registry. No sitemap change was warranted by these workbook rows.

### Pin quick-win release

- Source change: `src/bjj-glossary/pin/index.html` now targets “BJJ pins” in title and description and uses “What are common BJJ pins?” in both visible FAQ and FAQ schema.
- Local verification: full `npm run build` passed; rendered title, description, canonical, robots, visible FAQ, and FAQ schema were inspected; `node scripts/qa-links-existence.mjs --report /tmp/tmb-remediation-links-after-pin.csv`, `npm run redirects:check`, `npm run qa:volatile-facts`, and `git diff --check` passed. The incremental Eleventy-only invocation failed during template initialization, so full build was used.
- Commit, exact payload, upload, remote-byte output, and live status/title/canonical checks for this follow-up remain to be recorded below.
