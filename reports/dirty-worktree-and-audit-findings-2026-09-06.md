# Sensei Sandy BJJ — Comprehensive Worktree, JS/CSS & Stop-Slop Audit Report

**Date:** September 6, 2026  
**Repository:** `https://senseisandy.com` (`TriangleWizX/jun1826`)  
**Git Branch:** `blackbeltbartender/hyphen-weekend-v1`  
**Audit Scope:** Dirty Worktree Analysis, Global JavaScript & CSS Technical Audit, and Comprehensive Stop-Slop Skill Audit.

---

## Executive Summary

This report provides an exhaustive, step-by-step deep dive into the current state of the repository. It analyzes the **137 modified files and 12 untracked assets** in the dirty worktree, documents technical findings from a **global audit of JavaScript and CSS assets**, and presents a **comprehensive audit using the `stop-slop` skill framework** across the site's editorial prose, metadata, templates, and automated tooling.

### Key Takeaways
1. **Dirty Worktree State:** The worktree contains significant refactoring and infrastructure upgrades. Key updates include an enhanced [`qa-stop-slop.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.mjs) script with structured CLI flags, a new unit test suite ([`qa-stop-slop.test.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.test.mjs)), a complete FAQ synchronization tool ([`build-glossary-pages.mjs --sync-faqs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-glossary-pages.mjs)), updated fingerprinted route style manifests, and synchronized FAQ answers across 71 glossary term surfaces.
2. **Global JS/CSS Audit:**
   - **CSS Budget & Component Bundles:** Route CSS budgets passed cleanly across 262 routes (< 50 KB gzip, largest route `/bio` at 42.4 KB, homepage at 18.2 KB). Component CSS bundles are fully optimized.
   - **CSS Asset Manifest Drift (`qa-css-assets` failure):** 10 hard issues were identified, including 5 manifest content drift errors (e.g., `components-core.min.ef5eb3.css`), 4 missing local image URLs referenced in CSS (e.g., `spring-armor-drop-48hr.webp`), 1 hash drift error (`high-end-near.21e42b.css`), and 2 unmeasured external stylesheets (Calendly widget & Google Fonts).
   - **QA Script Bug Identified in `qa-images.mjs`:** A logic error in [`scripts/qa-images.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-images.mjs#L34) evaluates valid decorative `alt=""` image tags as missing `alt` attributes (`!attr(tag, 'alt')`), producing **385 false-positive blocking failures**.
3. **Stop-Slop Skill Audit:**
   - **15 Detailed Findings (SS-01 through SS-15):** Highlights critical copy issues including an absolute injury promise ("0% injury"), 71 generic non-defining glossary answers, awkward "more than looking" phrasing, binary contrast chains, duplicated program metadata ("12-week 12-week"), and dramatic hyperbole ("gravity is undefeated").
   - **Surface Scoring (Rubric 1–10 on 5 Dimensions):** The Blog/Editorial section (**32/50**) and Camp & Clinics page (**31/50**) scored below the 35/50 quality threshold and require editorial revision. The Homepage (**43/50**) and Location pages (**38/50**) demonstrate strong directness and authenticity.

---

## 1. Dirty Worktree Deep Dive

### 1.1 Branch & Status Summary
- **Current Branch:** `blackbeltbartender/hyphen-weekend-v1`
- **Total Modified Files:** 137 files (`1,470` insertions, `938` deletions)
- **Total Untracked Files/Directories:** 12 items

```
Modified File Summary:
 - Core Build Tools & Scripts: 8 files
 - CSS Assets & Route Manifests: 9 files
 - Glossary Terms & Data: 72 files
 - Blog Articles: 13 files
 - Location / Nearby Pages: 7 files
 - HTML Templates & Miscellaneous: 28 files
```

---

### 1.2 Categorized Inventory of Modified Files

#### A. Core Tooling, Scripts & Infrastructure Updates
1. [`scripts/qa-stop-slop.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.mjs#L1-L295) (`+295 / -140` lines):
   - Overhauled from a simple regex print script into a full-featured surface-aware audit tool.
   - Added support for front-matter YAML extraction, `<meta>` descriptions, inline body prose, and `<script type="application/ld+json">` JSON-LD parsing.
   - Implemented rule severity tiers (`error` vs. `review`), CLI arguments (`--input`, `--strict`, `--json`), and exception preservation for legitimate technical terms (e.g., "leverage") and blockquotes.
2. [`tools/build-glossary-pages.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-glossary-pages.mjs#L1-L1250) (`+88 / -9` lines):
   - Added the `--sync-faqs` CLI command flag and `syncFaqs()` sync function.
   - Updated `ASSETS_DATA_ROOT` target to `src/assets/data`.
   - Synchronized definition FAQs between visible `<details>` accordion elements and embedded `FAQPage` JSON-LD schemas across 71 glossary term pages.
   - Preserves custom layout structures, search index data, and redirect configurations.
3. [`eleventy.config.js`](file:///home/twizss/Documents/ssbjjweb/tmb/eleventy.config.js#L1-L150) (`+14 / -3` lines):
   - Updated Eleventy build configuration and asset pipeline watch rules.
4. [`package.json`](file:///home/twizss/Documents/ssbjjweb/tmb/package.json#L1-L167) (`+5` lines):
   - Registered 5 new npm scripts:
     - `qa:stop-slop`: `node scripts/qa-stop-slop.mjs`
     - `qa:stop-slop:strict`: `node scripts/qa-stop-slop.mjs --input dist --strict`
     - `qa:stop-slop:test`: `node --test scripts/qa-stop-slop.test.mjs`
     - `glossary:sync-faqs`: `node tools/build-glossary-pages.mjs --sync-faqs`
     - `qa:glossary:definitions`: `node scripts/qa-glossary-definitions.mjs`
5. [`scripts/qa-footer.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-footer.mjs), [`scripts/qa-funnel.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-funnel.mjs), [`scripts/qa-glossary.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-glossary.mjs), [`scripts/qa-homepage-synthesis.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-homepage-synthesis.mjs):
   - Updated QA validation thresholds to match new template layouts and footer structures.

#### B. CSS Assets & Route Manifests
1. [`src/assets/data/route-style-manifest.json`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/data/route-style-manifest.json#L1-L600) (`+588 / -588` lines):
   - Regenerated fingerprint hash mappings for 262 route-specific stylesheets.
2. `src/assets/css/bundles/`:
   - Updated pre-compiled CSS component bundles: `components-booking.min.css`, `components-core.min.css`, `components-home.min.css`, `components-programs.min.css`, `components-schedule.min.css`.
3. `src/assets/css/routes/`:
   - Updated fingerprinted route stylesheets `site-a4f623220fac.css`, `site-a4f623220fac.min.css`, `site-fe9c349a57b9.css`, `site-fe9c349a57b9.min.css`.

#### C. Glossary Terms & Search Data
- [`src/assets/data/glossary-search.json`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/data/glossary-search.json) (`+142 / -142` lines): Re-indexed search summaries to match term definitions.
- `src/bjj-glossary/*` (71 term pages): Updated visible FAQ text and JSON-LD answers to eliminate generic boilerplate ("Guard Pass is a common BJJ term used in class...").

#### D. Blog Articles & Location Pages
- `src/blog/` (13 articles modified):
  - Corrected formatting, updated canonical metadata, and fixed broken phrasing in:
    - [`beginners-guide-bjj-human-chess/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html)
    - [`bjj-belts-stripes-promotions/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/bjj-belts-stripes-promotions/index.html)
    - [`bjj-sensei/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/bjj-sensei/index.html)
    - [`catskills-gym-alternative-jiu-jitsu/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/catskills-gym-alternative-jiu-jitsu/index.html)
    - [`how-to-fall-safely-bjj-breakfalls/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/how-to-fall-safely-bjj-breakfalls/index.html)
    - [`jiu-jitsu-near-hunter-mountain/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/jiu-jitsu-near-hunter-mountain/index.html)
    - [`jiu-jitsu-near-windham-mountain-club/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/jiu-jitsu-near-windham-mountain-club/index.html)
    - [`jiu-jitsu-windham-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/jiu-jitsu-windham-ny/index.html)
    - [`kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html)
    - [`private-jiu-jitsu-lessons-windham-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/private-jiu-jitsu-lessons-windham-ny/index.html)
    - [`teen-jiu-jitsu-hunter-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/teen-jiu-jitsu-hunter-ny/index.html)
    - [`wrestle-ups-scramble/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/wrestle-ups-scramble/index.html)
- `src/near/` (6 location pages modified):
  - Synchronized location metadata and regional headings across `cairo-ny`, `catskill-ny`, `haines-falls-ny`, `hunter-ny`, `palenville-ny`, `template.html`.

---

### 1.3 Audit of Untracked Files & Artifacts

| Untracked Path | Type | Description / Purpose | Action Recommended |
| :--- | :--- | :--- | :--- |
| `.serena/` | Directory | Local IDE/tooling state. | Add to `.gitignore` if transient. |
| `artifacts/` | Directory | Local build and test artifacts. | Add to `.gitignore`. |
| [`assets/codebase-audit-2026-09-05.md`](file:///home/twizss/Documents/ssbjjweb/tmb/assets/codebase-audit-2026-09-05.md) | File | Historical codebase audit report (Sep 5, 2026). | Keep as historical doc. |
| [`assets/codebase-audit-results-2026-09-05.md`](file:///home/twizss/Documents/ssbjjweb/tmb/assets/codebase-audit-results-2026-09-05.md) | File | Historical audit results log. | Keep as historical doc. |
| [`assets/position-tracking-report-desktop-2026-09-06.csv`](file:///home/twizss/Documents/ssbjjweb/tmb/assets/position-tracking-report-desktop-2026-09-06.csv) | File | Rank tracking CSV data for Desktop search positions. | Move to `reports/data/`. |
| [`assets/position-tracking-report-mobile-2026-09-06.csv`](file:///home/twizss/Documents/ssbjjweb/tmb/assets/position-tracking-report-mobile-2026-09-06.csv) | File | Rank tracking CSV data for Mobile search positions. | Move to `reports/data/`. |
| [`crawl-reports/media-reference-audit.json`](file:///home/twizss/Documents/ssbjjweb/tmb/crawl-reports/media-reference-audit.json) | File | Output from `qa-media-manifest.mjs` auditing media asset links. | Commit or include in build reports. |
| [`reports/ranking-plan-2026-09-06.md`](file:///home/twizss/Documents/ssbjjweb/tmb/reports/ranking-plan-2026-09-06.md) | File | Strategic SEO ranking execution plan. | Retain in repository documentation. |
| [`reports/stop-slop-audit-2026-09-06.md`](file:///home/twizss/Documents/ssbjjweb/tmb/reports/stop-slop-audit-2026-09-06.md) | File | Core stop-slop audit report documenting Findings SS-01 to SS-15. | Retain as primary audit artifact. |
| [`scripts/qa-glossary-definitions.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-glossary-definitions.mjs) | File | Validation script ensuring 141 terms have matching definitions. | Keep & track in `package.json`. |
| [`scripts/qa-media-manifest.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-media-manifest.mjs) | File | Script auditing media references across source HTML/CSS. | Keep & track in `package.json`. |
| [`scripts/qa-stop-slop.test.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.test.mjs) | File | Node test suite (`node --test`) for `qa-stop-slop.mjs` (4/4 passing). | Keep & track in `package.json`. |

---

## 2. Global JavaScript & CSS Audit Findings

A comprehensive scan of JavaScript scripts, CSS stylesheets, route bundles, and performance contracts was conducted across the codebase.

```
+-----------------------------------------------------------------------+
|                         GLOBAL JS/CSS AUDIT SUMMARY                   |
+-----------------------------------+-----------------------------------+
| Metric / Check                    | Result                            |
+-----------------------------------+-----------------------------------+
| Route CSS Budget (< 50KB gzip)    | PASS (262 routes compliant)       |
| Component CSS Bundles             | PASS (13 deterministic bundles)   |
| JS Fingerprinting & Parity        | PASS (883 refs across 1,516 HTML) |
| CSS Asset Manifest (`qa-css-assets`)| FAIL (10 Hard Issues)             |
| Image QA Script (`qa-images.mjs`) | FAIL (385 False-Positive Issues)  |
| Definition of Done Release Gate   | PARTIAL (2 PASS, 19 Blocked/Pending)|
+-----------------------------------+-----------------------------------+
```

---

### 2.1 JavaScript Technical Audit

#### Findings & Observations:
1. **QA Script Bug in `scripts/qa-images.mjs` (385 False Positives):**
   - **Issue:** The image validation script [`scripts/qa-images.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-images.mjs#L34) line 34 uses `!attr(tag, 'alt')` to detect missing alt attributes.
   - **Root Cause:** Line 8 defines `attr(tag, name)` as returning `''` when an attribute value is empty (`alt=""`). In JavaScript, `!""` evaluates to `true`.
   - **Impact:** Every decorative image using valid HTML accessibility syntax `alt=""` (such as the footer brand logo `<img src="..." alt="" width="28" height="28" />` across 385 pages) is incorrectly reported as a blocking missing-alt error.
   - **Fix:** Update line 34 in `scripts/qa-images.mjs` to check whether the attribute exists in the tag string rather than relying on falsiness:
     ```js
     const hasAlt = /\balt\s*=\s*/i.test(tag);
     if (!hasAlt && !/role\s*=\s*["']presentation/i.test(tag)) failures.push(...);
     ```

2. **JS Fingerprinting & Asset Parity:**
   - [`scripts/qa-hashed-js-parity.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-hashed-js-parity.mjs) passed cleanly across 1,516 HTML files and 883 hashed script references.
   - JS component bundles (`glossary-filters.mjs`, `headroom.js`, mobile navigation scripts) are properly modularized into 13 deterministic bundles.

3. **Runtime Execution & Defensive Guardrails:**
   - Interactive components (e.g., search filtering on `/bjj-glossary/`) utilize client-side JavaScript that gracefully degrades if `glossary-search.json` fails to load.
   - No `console.log` leftovers were found in production-bound JS bundles.

---

### 2.2 CSS Technical Audit

#### A. Route CSS Budget & Compression
- **Limit:** `< 51,200 bytes` (50 KB) gzipped CSS per route.
- **Status:** **PASS** across all 262 routes.
- **Top 5 Largest CSS Payloads (gzipped):**
  1. `/bio`: 42.4 KB local CSS (19.5 KB gzipped)
  2. `/holiday-schedule`: 42.4 KB local CSS (19.5 KB gzipped)
  3. `/success-stories`: 25.2 KB local CSS (11.8 KB gzipped)
  4. `/`: 18.2 KB local CSS (8.4 KB gzipped)
  5. `/bjj-classes/kids-tannersville-ny`: 17.6 KB local CSS (8.1 KB gzipped)

#### B. Component CSS Bundles
- Verified 13 canonical minified CSS component bundles (`components-core.min.css`, `components-home.min.css`, `components-schedule.min.css`, `components-booking.min.css`, `components-programs.min.css`). Total source size `361.3 KB` reduced to `57.8 KB` gzip across the system.

#### C. CSS Asset Manifest Audit (`qa-css-assets` Failure Analysis)
Running `node scripts/qa-css-assets.mjs` revealed **10 hard blocking issues**:

1. **Manifest Content Drift (5 Issues):**
   - `/assets/css/bjj-glossary.5cefb7.css` does not match the manifest-driven output of `bjj-glossary.css`.
   - `/assets/css/bundles/components-core.min.ef5eb3.css` does not match `components-core.min.css`.
   - `/assets/css/high-end-near.21e42b.css` does not match `high-end-near.css`.
2. **Missing Image References inside Minified CSS (4 Issues):**
   - `/assets/css/bundles/components-core.min.ef5eb3.css` references missing image `/assets/images/spring-armor-drop-48hr.webp`.
   - `/assets/css/pages/home.min.b8c36f.css` references missing images `/assets/images/herogigroup-mobile.webp` and `/assets/images/action3-mobile.webp`.
3. **Manifest Hash Drift (1 Issue):**
   - `/assets/css/high-end-near.21e42b.css` hash has drifted and should be updated to `.bdbf10.css` in `route-style-manifest.json`.
4. **Unfingerprinted Stylesheet References (1,048 Warnings):**
   - HTML source files directly link to un-fingerprinted stylesheets (e.g. `<link rel="stylesheet" href="/tokens.css">` instead of `/tokens.9e9129.css` and `/assets/css/fonts.min.css` instead of `/assets/css/fonts.min.dea01e.css`).
5. **Render-Blocking External Stylesheets (2 Issues):**
   - `https://assets.calendly.com/assets/external/widget.css` loaded on `/free-bjj-intro-tannersville-ny`.
   - `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap` loaded on `/nearby-towns`.

---

## 3. Comprehensive Stop-Slop Skill Audit Findings

This audit evaluates the website's written prose against the standards defined in [`.agents/skills/stop-slop/SKILL.md`](file:///home/twizss/Documents/ssbjjweb/tmb/.agents/skills/stop-slop/SKILL.md), [ `references/phrases.md`](file:///home/twizss/Documents/ssbjjweb/tmb/.agents/skills/stop-slop/references/phrases.md), and [ `references/structures.md`](file:///home/twizss/Documents/ssbjjweb/tmb/.agents/skills/stop-slop/references/structures.md).

```
+-----------------------------------------------------------------------+
|                     STOP-SLOP AUDIT FINDINGS SUMMARY                  |
+---------+----------+--------------------------------------------------+
| ID      | Priority | Category / Description                           |
+---------+----------+--------------------------------------------------+
| SS-01   | P1       | Absolute Injury Claim ("0% injury")              |
| SS-02   | P1       | Generic Glossary FAQs (71 Non-Defining Surfaces) |
| SS-03   | P1       | Audit Tool Scanning Wrong Root Directory         |
| SS-04   | P2       | Audit Tool Exit Code & Strict Gate Defect        |
| SS-05   | P2       | Formulaic Phrasing ("more than looking for")     |
| SS-06   | P2       | Chained Binary Contrasts ("not X, but Y")        |
| SS-07   | P2       | Vague Self-Praise ("culture of excellence")      |
| SS-08   | P2       | Business Jargon & Testimonial Heading Mismatch   |
| SS-09   | P2       | Duplicated Program Phrase ("12-week 12-week")    |
| SS-10   | P2       | Syntax Error in Glossary CTA Sentence            |
| SS-11   | P3       | Passive Voice in Glossary Reassurance            |
| SS-12   | P3       | Fluffy Metaphors ("Start the Journey")           |
| SS-13   | P3       | Dramatic Hyperbole ("Gravity is undefeated")     |
| SS-14   | P2       | Unit Test Enforcing Fluffy Copy Contrast         |
| SS-15   | P3       | Stale Internal Documentation Guidance            |
+---------+----------+--------------------------------------------------+
```

---

### 3.1 Detailed Breakdown of Findings (SS-01 through SS-15)

#### SS-01 | Priority P1 | Absolute Injury Guarantee
- **File & Line:** [`src/blog/beginners-guide-bjj-human-chess/index.html:98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html#L98)
- **Offending Copy:** "...practice dangerous techniques at 100% effort with 0% injury."
- **Violation:** Manufactured emphasis, absolute extreme ("0%"), and unsupported promise.
- **Problem:** Tapping is a safety mechanism, but promising zero percent injury is legally unsafe and factually misleading.
- **Remediation:** Rewrite to emphasize controlled pacing and partner safety: "Practice techniques with real resistance while tapping safely to reset when caught."

#### SS-02 | Priority P1 | Generic Glossary Answers Fail to Define the Term
- **Files Affected:** 71 HTML files, `glossary-search.json`, and embedded `FAQPage` JSON-LD schemas.
- **Offending Copy:** "[Term] is a common BJJ term used in class to describe a key position, movement, or concept."
- **Violation:** Vague declarative, filler text, failure to provide direct information.
- **Problem:** Replacing the term name leaves an empty sentence that teaches nothing to the reader.
- **Remediation:** Executed via `npm run glossary:sync-faqs` (backed by [`tools/build-glossary-pages.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-glossary-pages.mjs)), populating specific definitions (e.g., "Guard Pass means advancing past your opponent's legs to establish dominant top control").

#### SS-03 | Priority P1 | Audit Checker Scanned Wrong Input Directory
- **File & Line:** [`scripts/qa-stop-slop.mjs:5`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.mjs#L5)
- **Violation:** Tooling scope gap.
- **Problem:** Previous version resolved files under root `dist/` rather than `src/`, missing source partials and non-sitemapped pages.
- **Remediation:** Upgraded [`scripts/qa-stop-slop.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.mjs) to target `src/` by default and added `--input` support.

#### SS-04 | Priority P2 | Checker Exit Contract & Gating Defect
- **File & Line:** [`scripts/qa-stop-slop.mjs:245`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-stop-slop.mjs#L245)
- **Violation:** Tooling exit code behavior.
- **Problem:** The script printed violations but exited `0`, allowing CI scripts to pass despite active defects.
- **Remediation:** Added `--strict` mode to exit `1` on confirmed error-level defects and exit `2` on parsing failures.

#### SS-05 | Priority P2 | Formulaic Phrasing ("More Than Looking For")
- **Files & Lines:**
  - [`src/blog/teen-jiu-jitsu-hunter-ny/index.html:28`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/teen-jiu-jitsu-hunter-ny/index.html#L28): "Most families are more than looking for activity."
  - [`src/blog/jiu-jitsu-near-hunter-mountain/index.html:38`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/jiu-jitsu-near-hunter-mountain/index.html#L38): "...are more than looking for 'a gym.'"
  - [`src/blog/private-jiu-jitsu-lessons-windham-ny/index.html:36`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/private-jiu-jitsu-lessons-windham-ny/index.html#L36): "Private sessions are more than for advanced students."
- **Violation:** Awkward grammar, telegraphing reframe.
- **Remediation:** State the desire directly: "Families want clear structure, experienced coaching, and a positive group environment."

#### SS-06 | Priority P2 | Chained Binary Contrasts
- **File & Line:** [`src/blog/jiu-jitsu-near-windham-mountain-club/index.html:25`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/jiu-jitsu-near-windham-mountain-club/index.html#L25)
- **Offending Copy:** "...the practical question is not whether... The question is whether... It is active, but it is not random. It is social, but it has rules."
- **Violation:** Binary contrast stack ("not X... but Y"), mechanical staccato rhythm.
- **Remediation:** Cut the rhetorical setup and describe the class directly.

#### SS-07 | Priority P2 | Vague Praise & Universal Outcome Promises
- **File & Line:** [`src/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html:63`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html#L63)
- **Offending Copy:** "...we take pride... ensure that every child feels secure... fostering a genuine love for movement... a culture of excellence that benefits the entire community."
- **Violation:** Throat-clearing, self-praise, vague abstractions ("culture of excellence"), extreme claims ("every child").
- **Remediation:** Focus on concrete coaching actions: "Coaches guide kids through structured partner games, matching students by size and experience."

#### SS-08 | Priority P2 | Business Jargon & Testimonial Heading Mismatch
- **File & Line:** [`src/camp-clinics.html:9`](file:///home/twizss/Documents/ssbjjweb/tmb/src/camp-clinics.html#L9)
- **Offending Copy:** "Seamless coordination and clear communication. Simple for you. Impactful for your camp." Heading: "What Camp Directors Say".
- **Violation:** Business jargon ("seamless"), manufactured punchlines, testimonial mismatch (quotes are from regular class parents, not camp directors).
- **Remediation:** Fix the heading to "What Local Families Say" and state coordination details simply.

#### SS-09 | Priority P2 | Duplicated Program Phrase in Meta Description
- **File & Line:** [`src/blog/catskills-gym-alternative-jiu-jitsu/index.html:4`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/catskills-gym-alternative-jiu-jitsu/index.html#L4)
- **Offending Copy:** "Start the 12-week 12-week program … Beginner Lane pa..."
- **Violation:** Stale text duplication and truncated sentence ending.
- **Remediation:** Fix metadata description to: "Explore a structured Catskills alternative to traditional gyms with beginner-friendly Jiu-Jitsu classes in Tannersville, NY."

#### SS-10 | Priority P2 | Syntax Error in Glossary CTA Sentence
- **Files & Lines:** [`src/bjj-glossary/bottom-position/index.html:9`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-glossary/bottom-position/index.html#L9) and [`src/bottom-position/index.html:9`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bottom-position/index.html#L9)
- **Offending Copy:** "Beginner class means calm coaching, skill-based resistance activities begin at the right pace from day one, and a simple first-class plan."
- **Violation:** Broken list grammar (inserting a full clause "activities begin..." inside a parallel noun list).
- **Remediation:** Split into two sentences: "Beginner classes feature calm coaching and a clear first-class plan. Skill-based resistance activities begin at an approachable pace from day one."

#### SS-11 | Priority P3 | Passive Voice in Glossary Reassurance
- **File & Line:** [`src/bjj-glossary/bottom-position/index.html:9`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-glossary/bottom-position/index.html#L9)
- **Offending Copy:** "Beginners are taught structure before intensity so bottom position feels less overwhelming and more readable."
- **Violation:** Passive voice ("are taught"), abstract buzzword ("readable").
- **Remediation:** "Sandy coaches beginners on basic frames and positioning before increasing intensity."

#### SS-12 | Priority P3 | Fluffy "Journey" Metaphors
- **Files Affected:** [`src/local-bjj-tournaments-for-parents.html:511`](file:///home/twizss/Documents/ssbjjweb/tmb/src/local-bjj-tournaments-for-parents.html#L511), [`src/blog/bjj-belts-stripes-promotions/index.html:221`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/bjj-belts-stripes-promotions/index.html#L221), [`src/sources/cdc-physical-activity/index.html:71`](file:///home/twizss/Documents/ssbjjweb/tmb/src/sources/cdc-physical-activity/index.html#L71).
- **Offending Copy:** "Start the Journey. We'll Guide the Rest.", "Ready to Start Your First Belt Journey?"
- **Violation:** Overused AI metaphor ("journey"), generic CTA setup.
- **Remediation:** Replace with action CTAs: "Reserve Your Free Intro Class", "View the Belt Progression Guide".

#### SS-13 | Priority P3 | Dramatic Hyperbole vs. Safety Instruction
- **Files Affected:** [`src/blog/how-to-fall-safely-bjj-breakfalls/index.html:47`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/how-to-fall-safely-bjj-breakfalls/index.html#L47), [`src/blog/wrestle-ups-scramble/index.html:48`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/wrestle-ups-scramble/index.html#L48).
- **Offending Copy:** "Gravity is undefeated", "the ground is waiting", "Getting up is more than a scramble. It is a weapon."
- **Violation:** Manufactured drama, false agency ("gravity is undefeated").
- **Remediation:** State the practical benefit: "Learning proper breakfalls prevents impact injuries when taking falls on the mat."

#### SS-14 | Priority P2 | Unit Test Enforcing Binary Contrast
- **File & Line:** [`scripts/qa-glossary.mjs:274`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-glossary.mjs#L274)
- **Violation:** Test assertion requires literal text: "Guard is not just holding on. Good guard uses movement..."
- **Problem:** Updating the copy to remove "not just" breaks unit tests.
- **Remediation:** Update test requirement to accept direct phrasing ("Guard uses movement, distance, frames, and grips to control space").

#### SS-15 | Priority P3 | Stale Documentation Guidance
- **File & Line:** [`docs/internal-catskills-gym-metadata.md:4`](file:///home/twizss/Documents/ssbjjweb/tmb/docs/internal-catskills-gym-metadata.md#L4)
- **Offending Copy:** "Ready for capability, not just equipment?" (contains old pricing and outdated program structure).
- **Violation:** Historical doc drift.
- **Remediation:** Mark doc as historical reference or update to point to canonical data sources.

---

### 3.2 Quantitative Evaluation & Surface Scoring

Each core site surface was evaluated using the 5-dimension rubric (1–10 per dimension, 50 total points):

```
+-----------------------------------------------------------------------------------+
|                           STOP-SLOP QUALITY RUBRIC SCORES                         |
+----------------------+------------+--------+-------+--------------+---------+-----+
| Surface              | Directness | Rhythm | Trust | Authenticity | Density | Total|
+----------------------+------------+--------+-------+--------------+---------+-----+
| Homepage (/)         | 9          | 8      | 9     | 9            | 8       | 43  |
| Glossary Terms       | 7          | 7      | 8     | 7            | 7       | 36  |
| Youth / Kids Pages   | 8          | 8      | 8     | 8            | 8       | 40  |
| Location Pages       | 8          | 7      | 8     | 8            | 7       | 38  |
| Blog / Editorial     | 6          | 6      | 7     | 7            | 6       | 32* |
| Camp & Clinics Page  | 6          | 6      | 6     | 7            | 6       | 31* |
+----------------------+------------+--------+-------+--------------+---------+-----+
 * Scores below 35/50 require mandatory editorial revision before release.
```

---

## 4. Actionable Step-by-Step Remediation Plan

To resolve all findings from this deep dive audit, execute the following steps in sequence:

### Step 1: Fix Image QA Script False Positives (`qa-images.mjs`)
- Update [`scripts/qa-images.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-images.mjs#L34) line 34 to test for attribute existence rather than string falsiness so that valid `alt=""` decorative tags pass validation.

### Step 2: Resolve CSS Asset & Manifest Drift
1. Re-run route style builder: `npm run styles:routes`
2. Sync component bundles: `npm run components:build`
3. Verify CSS budget and asset fingerprinting: `npm run qa:css:assets`

### Step 3: Execute Editorial Copy Remediation
1. **SS-01:** Remove "0% injury" claim in [`beginners-guide-bjj-human-chess/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html).
2. **SS-02:** Re-run `npm run glossary:sync-faqs` to ensure all 71 term pages have synchronized definition FAQs.
3. **SS-05, SS-06, SS-07:** Rephrase "more than looking for", binary contrast chains, and vague praise across blog files.
4. **SS-08 & SS-09:** Correct camp testimonial heading and fix duplicated meta description in `catskills-gym-alternative-jiu-jitsu`.
5. **SS-10:** Fix broken CTA list syntax in [`src/bjj-glossary/bottom-position/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-glossary/bottom-position/index.html).

### Step 4: Run Verification Suite
Run the full verification suite before committing:
```bash
npm run qa:stop-slop:test
npm run qa:stop-slop:strict
npm run qa:css:budget
npm run qa:css:assets
npm run build
```

---
*Report compiled autonomously by Antigravity AI Assistant.*
