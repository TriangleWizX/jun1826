# October 5 handoff claim audit

Audit date: 2026-10-05. Source snapshot: `3fd95ca5` on `main`.
Scope: audit `CODEX_HANDOFF_2026-10-05.md` and report gaps, as clarified by the user. This is an audit, not authorization to fix offers, change production, or deploy.
The findings below describe that audit snapshot. The remediation status after the user authorized fixes, commit, and deployment is appended in **Current remediation status**.

## Result

The handoff is useful historical context, but its blanket claims of complete verification, universal copy compliance, and complete implementation are not supported. Two customer-facing discrepancies are present in both local source and the sampled live law-enforcement page. A clean build also fails a required validation gate even though the existing generated output passes.

### 1. High: guarantee promise contradicts canonical eligibility

`src/_data/pricing.json:18-19`, under `productPolicy`, permits the guarantee for `coreCulture.youth` and `coreCulture.adult` and explicitly excludes `coreCulture.communityServiceAdult`. The Community Service offer in `src/law-enforcement-bjj.html:95` and `:417` promises the 30-Day Training Fit Guarantee. Workstream 1 repeats that promise. The live extensionless page returned HTTP 200 and contained three guarantee-name occurrences, including the same offer text.

Recommended correction: reconcile the page and handoff to the canonical eligibility rule. Any change to eligibility itself requires a business decision; an audit must not silently broaden it.

### 2. High: research percentages were relabeled as different outcomes

`src/law-enforcement-bjj.html:314,320` labels 48% and 53% as “Safer calls on shift” and “Safer holds in the field.” Its linked local case summary, `src/research/marietta-police-bjj-case-summary.html:28,32`, describes reductions in officer injuries and injuries to arrested people. Those are different measures. The sampled live page contains the same “safer calls” and “safer holds” wording.

Recommended correction: preserve the measured outcome, population, and comparison when simplifying the language. This audit compared the page with its linked local summary; it did not independently validate the original study or causal claims.

### 3. High: validation is not reproducible from the committed source alone

A `git archive HEAD` snapshot was extracted to `/tmp/tmb-handoff-audit-20261005/site`, using the existing installed `node_modules` through a symlink. No dependency installation or website-source edits were made.

- `npm run validate`: build succeeds, unified suite fails, so its chained Cal check is not reached.
- Running the unified file directly exposes the failure: **14/15 tests pass; `dist/sitemap-core.xml` is missing** (`scripts/qa-unified.mjs:201-212`).
- Running the same unified suite against the original checkout's existing `dist`: **15/15 pass**. That directory already contains `sitemap-core.xml`.
- Diagnostic execution of `node tools/build-all-sitemaps.mjs` in the isolated snapshot reports successful generation, but an immediate unified rerun still fails because the required file remains absent from `dist`. This command alone does not repair the documented build sequence.

The handoff should distinguish existing generated-state validation from a reproducible clean build. It should document and integrate the necessary sitemap generation/materialization order before claiming the prescribed sequence is sufficient.

### 4. Medium: readability assertion fails, and its checker has narrower coverage

`python3 scripts/qa-free-intro-copy.py` on the fresh build scanned 464 HTML files, measured 532 blocks / 346 unique blocks, and failed three blocks; stale-policy matches: 0.

| Built file / line | Estimated FK grade |
| --- | ---: |
| `friday-night-fanatics.html:384` | 5.23 |
| `nearby-towns.html:114` | 8.14 |
| `nearby-towns.html:176` | 6.75 |

The checker estimates readability rather than certifying comprehension. Its `CORE`, `PROSE`, marked-block, and policy selection logic (`scripts/qa-free-intro-copy.py:14-20,146-156`) does not score every heading, paragraph, and list across the site. Its failure criterion at line 206 is grade above 3, not the handoff's full banned-vocabulary list. Even a passing result would not establish the universal claims in sections 3 and 5.

### 5. Medium: several implementation descriptions do not match current source

- **Workstream 5 buttons:** `btn-premium` appears 38 times in `src/programs.html`, but zero times in each of the other six listed pages. For example, `src/success-stories.html:27,28,73` retains Bootstrap button classes. This contradicts the named-class conversion claim; it is not by itself proof of poor visual styling.
- **Workstream 8 topics:** `src/blog/index.html:85-88` uses First Class, Kids & Families, Adult Fitness, and Local & Schedule, not the six topics listed in the handoff.
- **Workstream 9 paths:** `src/bjj-glossary.html` and `src/assets/js/glossary-infil.js` do not exist. The implementation does exist: `tools/build-glossary-pages.mjs` generates `src/bjj-glossary/index.html`, which uses `/js/glossary-filters.min.js`; editable interaction source is `js/glossary-filters.js`. The generator's categories at lines 824-829 differ from the handoff. Hash input is supported, while the share action emits `?t=slug` (`js/glossary-filters.js:575`). These are documentation errors, not an absent glossary.

### 6. Medium: deployment guarantees and commands lack sufficient evidence

`scripts/deploy-release.py:147-165` uploads a temporary file and renames it for each file. This supports atomic replacement of individual files, not an atomic multi-file release or measured zero downtime. The handoff supplies neither an exact release payload nor per-release verification receipts or backup identifiers.

The bare deployment command defaults to `--commit HEAD` (`scripts/deploy-release.py:259`). HEAD is now the documentation commit, so the handoff's command does not reproduce the earlier collection of releases. Do not run it as a replay recipe. Deployment documentation needs the intended commit, exact payload, backup evidence, and post-deployment checks.

Current public responses are reported separately below. They do not prove when a release occurred, every file deployed, or whether historical backups and rollback procedures work.

### 7. Low: the “complete record” manifest is incomplete

All 54 listed hashes exist, match the listed author/committer dates, and are ancestors of HEAD/main. The interval contains six additional October 2 referral commits omitted from the manifest: `cb2063f9`, `05f4a1b5`, `0374d431`, `62fce625`, `b11b7d9c`, `d2a551ae`. Either add them or describe the manifest as selected highlights.

Section 6's command output and section 7's recommendations are collapsed into long lines. Restore structured commands and retain dated command results rather than a blanket “every suite passing” assertion. The structural suite has three tests; the 15-test total spans four suites.

## Workstream coverage

“Confirmed” here means the stated local implementation or specifically sampled HTTP behavior was observed. It does not imply all visual, behavioral, historical, or business-outcome claims passed.

| Handoff workstream | Confirmed evidence | Contradicted or still unverified |
| --- | --- | --- |
| 1. Law enforcement | Page/CSS, offer content, pilot form, statistics exist; live page HTTP 200 | Guarantee conflict; outcome relabeling; universal readability and form submission not established |
| 2. Directions | Page/CSS, arrival content, 140px image cap (`directions.css:1425`) | 375×667 above-fold result and zero layout shift require rendered measurements; drive-time accuracy and media provenance not independently verified |
| 3. Schedule | 11 active classes; Thursday youth No-Gi/adult Gi; canonical tests pass; planner at `src/schedule.html:159-289`; live Thursday marker | Planner usability and year-long behavioral benefit not measured; private coaching remains by request |
| 4. Tournaments | Families destination source; both legacy redirect forms in `.htaccess:150-151`; sampled extensionless route redirects correctly | Universal grade-3 copy and operational celebration promise not independently established |
| 5. Global harmonization | Seven named pages exist; programs contains premium button classes | Claimed named-class replacement across all seven contradicted; typography/rendered equivalence unverified |
| 6. Class hubs | All four named source paths exist | Grade, duplicate-section removal, tap targets, and whole booking-flow usability require broader inspection |
| 7. Contact | Page/CSS, `contact-vip-main`, map iframe and controls exist | Copy-address action, responsive rendering, and real-world drive times not tested |
| 8. Blog | Hub/CSS and intro links exist | Topic taxonomy differs; universal excerpt grade unverified |
| 9. Glossary | Generated hub/runtime, search/filter/reader/share code; live hub HTTP 200 | Named source paths and category list wrong; full interaction/accessibility behavior not exercised |
| 10. Retention | Three pages, cross-links, Day 4 controls exist | End-to-end saved-state progression and all positive-copy claims unverified |
| 11. Partners/media | All four named pages exist | “All synthetic imagery purged sitewide” and photo authenticity need a full asset/provenance inventory; filenames do not prove either |
| 12. Archive/navigation/VSL | Anatomy extensionless 301 confirmed live; VSL commit tracks eight files; Ad Studio/VSL directories absent from generated web output | No anatomy `.html`-specific redirect found in source; global logo behavior not browser-tested; VSL tracking does not prove filming or publication |

## Executed validation

| Check | Result | Scope / limitation |
| --- | --- | --- |
| Initial `git status --short` | Clean | At source snapshot above |
| Fresh `npm run validate` | FAIL | Build succeeds; unified test failure prevents chained Cal execution |
| Fresh `node scripts/qa-unified.mjs` | 14/15 PASS | Missing sitemap child in fresh dist |
| Existing-dist unified suite | 15/15 PASS | Depends on existing generated files |
| `npm run test:ads` | 35/35 PASS | Expected negative test emits an output-already-exists message; suite result is OK |
| `npm run qa:schedule` | PASS | Schedule audit coverage only |
| `npm run qa:volatile-facts` | PASS; 1,061 files | Checked after fresh build; handoff's 1,062 is historical, not reproduced |
| `python3 scripts/qa-free-intro-copy.py` | FAIL; 3 blocks | Coverage and estimates described above |
| `node scripts/qa-cal-migration.mjs` | PASS after approved escalation | 460 pages / 73 active dependencies; initial Chrome launch blocked by sandbox |
| Cal warning | Missing `/assets/css/bootstrap-icons-local.4f51bc.css` | Explicit pre-existing CSS warning, separate from scheduler test success |

The Cal suite reports loader recovery, configuration, lane remount, confirmation, conversion deduplication, and reach-out banner coverage. It is not a test of every page named in the handoff. Similarly, the unified link check uses a limited priority-route list, and its route-existence fallback includes `dist/index.html` (`scripts/qa-unified.mjs:118`), which can mask unresolved links. Its green result cannot establish all internal links work. Its logo test checks string presence rather than image dimensions.

## Current live evidence

These HTTPS checks ran through the approved elevated network path. Responses and headers were saved under `/tmp/tmb-handoff-audit-20261005/logs/`. No remote mutation or deployment occurred.

| Public route | Observed result |
| --- | --- |
| `/law-enforcement-bjj` | HTTP 200; guarantee and relabeled-statistic wording present |
| `/schedule` | HTTP 200; Thursday present |
| `/bjj-glossary` | HTTP 200; glossary-filters runtime reference present |
| `/local-bjj-tournaments-for-parents` | HTTP 301 → `https://senseisandy.com/local-bjj-tournaments-for-families` |
| `/bjj_anatomy_game` | HTTP 301 → `https://senseisandy.com/parent-resources` |

No full live route sweep, mobile/desktop screenshot audit, form submission, original-study verification, uptime measurement, or backup restoration was performed. Those claims remain unverified; sampled HTTP success does not replace them.

## Persona & expert framework

Contextual routing returned `no_suitable_persona`. The handoff's Rupert Giles UUID (`6d7a48dc-2e21-4b3b-86f8-daafdd8c5eb6`) was unavailable when checked. The selector surfaced COMPETENCE (`e144b81f-10ea-41a6-a06c-03d69dfb738f`) as an instruction candidate, but no full-source adoption is claimed. An ordinary release-audit specialist approach was disclosed and used; no attachments were required or loaded.

Bounded workstreams: coordinator owned isolated validation, sampled HTTPS checks, independent review, and this report; source-audit worker inspected workstreams 1–12 read-only; history-audit worker inspected manifest/deployment/offline isolation read-only. Workers wrote no files. Verification criteria: map each handoff section/workstream to current evidence, distinguish contradiction from missing proof, retain failed gates, and avoid treating test success as proof beyond its coverage.

## Follow-up order

1. Reconcile the live Community Service guarantee and study-outcome wording.
2. Make the documented validation sequence reproducible from a clean snapshot; resolve the missing CSS asset warning.
3. Address the measured copy failures and define a checker scope that matches any universal claim.
4. Correct the handoff's paths, categories, button-conversion scope, manifest completeness, and deployment wording.
5. Attach scoped release receipts and perform the specific remaining behavioral/visual/provenance checks before promoting unverified claims to verified.

At the time this audit was first delivered, no commit or deployment had been made. Its source snapshot and the original historical handoff were preserved. Supporting command evidence is in `CODEX_HANDOFF_2026-10-05_AUDIT_EVIDENCE/`; original audit response captures remain in `/tmp/tmb-handoff-audit-20261005/`.

## Current remediation status

The user later authorized fixing, committing, and deploying the key gaps. Before release:

- `src/law-enforcement-bjj.html` no longer promises the guarantee for the Community Service rate. The Marietta figures now use the measured injury outcomes and report comparison context.
- The normal build now generates sitemaps before Eleventy copies them. The deploy mapper now carries generated sitemap index/children with source-content releases.
- The three copy-check failures were corrected. The rebuilt copy audit measured 470 HTML files and 532 blocks: 0 blocks above grade 3 and 0 stale policy blocks.
- `npm run validate` passed after sitemap generation was integrated: unified suite 15/15; Cal migration QA 460 pages and 73 dependencies. The Cal suite still reports the existing missing Bootstrap Icons CSS warning.
- `npm run test:ads` passed 35 tests; `npm run qa:schedule` and `npm run qa:volatile-facts` passed.

The authorized source release was committed as `2557a603` and deployed with a nine-file `--only` filter: three corrected pages and six sitemap files. The unfiltered dry run was 163 files because the deploy tool's glossary-release condition also matched the deploy-script edit; the filter prevented that unrelated expansion. The deploy command exited 0. Remote backup QA found one valid archive, zero invalid archives, and zero cleanup candidates.

Post-release HTTPS checks returned 200 for the three changed pages, the sitemap index, and all five child sitemaps. The law-enforcement page now contains the corrected injury wording and omits the former “safer calls”, “safer holds”, and guarantee statements from its main content. Friday Night Fanatics and Nearby Towns return their replacement text. The sitemap index lists all children; the core sitemap contains law-enforcement and Friday Night Fanatics, and the locations sitemap contains Nearby Towns. Response hashes and concise marker checks are recorded in `CODEX_HANDOFF_2026-10-05_AUDIT_EVIDENCE/release-verification.json`.

The reviewed deploy payload passed route/content checks. Targeted local Chrome checks on the changed law-enforcement page passed at 375×667 and 1440×900: no horizontal overflow, one H1, canonical URL present, primary booking CTA visible, image alt text present, and no page errors. This does not establish full-site device coverage or measured production uptime.
