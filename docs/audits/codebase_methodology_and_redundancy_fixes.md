# Surgical Remediation Blueprint & Implementation Runbook: Resolving Codebase Redundancies & Instructional Methodology Duplications

**Repository:** `https://senseisandy.com` (`tmb`)  
**Target Output Document:** `docs/audits/codebase_methodology_and_redundancy_fixes.md`  
**Reference Audit:** [`docs/audits/codebase_methodology_and_redundancy_audit.md`](file:///home/twizss/Documents/ssbjjweb/tmb/docs/audits/codebase_methodology_and_redundancy_audit.md)  
**Governing Standard:** `AGENTS.md` Single-Job Architecture, `stop-slop` guidelines, and Volatile Operational Facts Rule.

---

## 1. Executive Summary & Remediation Strategy

The audit completed in [`codebase_methodology_and_redundancy_audit.md`](file:///home/twizss/Documents/ssbjjweb/tmb/docs/audits/codebase_methodology_and_redundancy_audit.md) cataloged **28 redundant, duplicated, and zombie files** spanning **7 critical problem clusters**. 

These files dilute search engine crawl equity, fragment user conversion intent, violate single-responsibility page jobs, and harbor unmaintained operational facts (hardcoded tuition rates, expired seasonal dates, broken text replacements, and client-side DOM tree-walker hacks).

This document provides the **exhaustive, step-by-step technical implementation runbook** required to eliminate all 28 problematic files while preserving 100% link integrity, zero broken backlinks, valid sitemaps, and green CI/QA checks.

### 1.1 Summary of Changes Across the 7 Clusters

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               MASTER CLUSTER REMEDIATION MATRIX                                │
├───────────────────────────────┬───────┬──────────────────────┬─────────────────────────────────┤
│ Cluster                       │ Files │ Action               │ Canonical Target                │
├───────────────────────────────┼───────┼──────────────────────┼─────────────────────────────────┤
│ A: SSI Promise Stubs          │ 6     │ Delete + 301 Config  │ /how-class-works (or /free-bjj) │
│ B: Youth Reset Funnels        │ 4     │ Merge + Delete + 301 │ /bjj-classes/kids-tannersville  │
│ C: Parent & Culture Overlap   │ 4     │ Merge + Delete + 301 │ /parent-resources, /report-card │
│ D: Safety & Nervous Beginners │ 3     │ Consolidate + 301    │ /how-class-works#safety         │
│ E: Tactical Longevity Twin    │ 1     │ Delete + 301 Config  │ /law-enforcement-bjj            │
│ F: Hospitality Passes         │ 4     │ Consolidate + 301    │ /scribners, /partners-hospital  │
│ G: Monoliths & Zombies        │ 6     │ Delete / 301 Config  │ /options-pricing, /, /parent-res│
├───────────────────────────────┼───────┼──────────────────────┼─────────────────────────────────┤
│ Total                         │ 28    │ Clean architectural consolidation with 0 orphan residue│
└───────────────────────────────┴───────┴──────────────────────┴─────────────────────────────────┘
```

---

## 2. Global Repository Safety & Infrastructure Rules

Before executing any file deletion or modification, review and observe these 5 repository-specific architectural rules:

### Rule 1: Centralized Redirect Architecture (`config/legacy-redirects.json`)
- In this repository, **do not manually write redirect lines into `.htaccess`**.
- All 301 redirects must be entered into [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json).
- Run `npm run redirects:sync` (which executes `node tools/sync-htaccess-legacy-redirects.mjs --write`) to compile the rules into `.htaccess` between `# BEGIN AUTO_LEGACY_REDIRECTS` and `# END AUTO_LEGACY_REDIRECTS`.
- Verify with `npm run redirects:check` and `npm run qa:redirects`.

### Rule 2: Link Integrity & Zero Legacy Inbound Links (`npm run qa:links:static`)
- The static link verification script (`scripts/qa-links-static.mjs`) **fails immediately if any active page in `src/` links to a URL listed as a source in `legacy-redirects.json`**.
- **Requirement:** Whenever a file is deleted and added to `legacy-redirects.json`, **every internal link** pointing to that deleted file across all HTML, Nunjucks, and Markdown templates in `src/` must be simultaneously updated to the new canonical destination.

### Rule 3: Sitemap Generation & `url-registry.json`
- Sitemaps are compiled via `tools/build-all-sitemaps.mjs` using `data/url-registry.json`.
- When pages are pruned, update `data/url-registry.json` (or regenerate it via `npm run build:source-of-truth` / `node tools/build-crawl-source-of-truth.mjs`) to ensure deleted URLs are removed from indexable status and child sitemaps (`sitemap-core.xml`, `sitemap-programs.xml`).
- Running `npm run qa:orphans` confirms that no sitemap lists a URL lacking an active source file.

### Rule 4: Deploy & QA Whitelists (`deploy-release.py` & `qa-seo-remediation.mjs`)
- Several scripts have hardcoded path allowlists:
  1. [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) line 9: `ROOT_FILES` contains filenames like `tactical-longevity.html`, `after-school.html`, `core-promise-full.html`, `core-promise-short.html`, `after-booking-promise.html`, `reviews-village.html`, `phoenicia-diner.html`, `deer-mountain-inn.html`. When these files are deleted, prune their references from `ROOT_FILES` to prevent deployment errors.
  2. [`scripts/qa-seo-remediation.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-seo-remediation.mjs) line 8: `publicRoutes` includes `/phoenicia-diner` and `/school-families-jiu-jitsu`. If those routes are consolidated into redirects, update `scripts/qa-seo-remediation.mjs` so the test expects the correct active route list.
  3. [`tools/build-crawl-source-of-truth.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-crawl-source-of-truth.mjs) line 176: `getPageType` has explicit route mappings for `/tactical-longevity`, `/school-families-jiu-jitsu`, `/phoenicia-diner`, `/samurai-break`. Update this function to match pruned routes.

### Rule 5: Volatile Operational Facts Precedence
- Never carry over hardcoded prices (e.g., `$2,100`, `$2,650`, `$550`, `$715`) or hardcoded school term dates to canonical pages.
- Anchor all tuition references to [`/options-pricing`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html) and all schedule times to [`/schedule`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html).
- Run `npm run qa:volatile-facts` after any content edits.

---

## 3. Step-by-Step Cluster Implementation Specs

### Step 1: Cluster A — SSI Promise Stubs (6 Files)

#### Files to Delete
1. `src/core-promise-full.html`
2. `src/core-promise-short.html`
3. `src/my-promise-full.html`
4. `src/my-promise-short.html`
5. `src/safety-promise.html`
6. `src/after-booking-promise.html`

#### Inbound References & Dead Includes to Clean
- In `src/my-promise-full.html` and `src/core-promise-full.html`, remove any circular SSI comments (e.g. `<!--#include virtual="/core-promise-full.html" -->`).
- Check if any partial in `src/partials/` references these stubs. (Inspection confirmed 0 live content pages include these files; they were standalone prototypes).

#### Deployment & Whitelist Cleanup
- In [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) line 9 (`ROOT_FILES`), delete:
  - `'core-promise-full.html'`
  - `'core-promise-short.html'`
  - `'after-booking-promise.html'`

#### Redirect Configuration
Add the following entries to [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json) under `"redirects"`:
```json
"/core-promise-full": "/how-class-works",
"/core-promise-short": "/how-class-works",
"/my-promise-full": "/how-class-works",
"/my-promise-short": "/how-class-works",
"/safety-promise": "/how-class-works#safety",
"/after-booking-promise": "/free-bjj-intro-tannersville-ny"
```

---

### Step 2: Cluster E — Tactical Longevity Twin Clone (1 File)

#### Target Problem
`src/tactical-longevity.html` is an identical 500-line twin of `src/law-enforcement-bjj.html`. It has zero inbound links across content pages and merely duplicates the law enforcement / first responder program.

#### Files to Delete
1. `src/tactical-longevity.html`

#### Deployment & Whitelist Cleanup
- In [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) line 9 (`ROOT_FILES`), delete:
  - `'tactical-longevity.html'`
- In [`tools/build-crawl-source-of-truth.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-crawl-source-of-truth.mjs) line 176, remove:
  - `|| pathname === '/tactical-longevity'`

#### Redirect Configuration
Add to [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json):
```json
"/tactical-longevity": "/law-enforcement-bjj"
```

---

### Step 3: Cluster G — Monoliths, Redirect Shells & Rogue Files (6 Files)

#### 1. Rogue Build Leak: `src/.vscode/curriculum/index.html`
- **Action:** Delete immediately. It is an orphaned layout referencing non-existent stylesheets and leaking internal paths.

#### 2. Abandoned Test Shell: `src/clean.html`
- **Action:** Delete `src/clean.html`.
- **Action:** Since this URL was never published or linked, no public redirect is required (or redirect to `/`).

#### 3. Client-Side JS Redirect Stubs: `src/videos.html` & `src/bjj-videos.html`
- **Target Problem:** Both files contain only `<script>window.location.replace("/")</script>` and `<meta http-equiv="refresh" content="0;url=/">`. This is bad SEO practice; 301 server headers should handle this directly.
- **Action:** Delete `src/videos.html` and `src/bjj-videos.html`.
- **Redirect Configuration:** Add to `config/legacy-redirects.json`:
  ```json
  "/videos": "/",
  "/bjj-videos": "/"
  ```

#### 4. Orphaned Root Template: `src/reviews-village.html`
- **Target Problem:** A full root template with `robots: noindex` compiling to `/reviews-village.html`. Note: `src/partials/reviews-village.html` is the active SSI fragment and must be kept.
- **Action:** Delete `src/reviews-village.html`.
- **Deployment Cleanup:** In `scripts/deploy-release.py` line 9, remove `'reviews-village.html'` from `ROOT_FILES`.
- **Redirect Configuration:** Add to `config/legacy-redirects.json`:
  ```json
  "/reviews-village": "/success-stories"
  ```

#### 5. Hardcoded Pricing Fragment: `src/annual-track.html`
- **Target Problem:** Hardcodes `$2,100`, `$2,650`, `$550`, `$715`, has typos (`"regular class timees"`), and duplicates the Annual Track section of `options-pricing.html`.
- **Action:** Ensure [`src/options-pricing.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html) has `<div id="annual-track">` covering the annual continuation terms cleanly.
- **Action:** Delete `src/annual-track.html`.
- **Redirect Configuration:** Add to `config/legacy-redirects.json`:
  ```json
  "/annual-track": "/options-pricing#annual-track"
  ```

#### 6. Zero-CTA Essay: `src/samurai-break.html`
- **Target Problem:** Generic martial arts essay on "taking a break" without CTAs or local relevance.
- **Action:** Delete `src/samurai-break.html`.
- **Deployment & Whitelist Cleanup:** In `tools/build-crawl-source-of-truth.mjs` line 176, remove `|| pathname === '/samurai-break'`.
- **Redirect Configuration:** Add to `config/legacy-redirects.json`:
  ```json
  "/samurai-break": "/parent-resources"
  ```

---

### Step 4: Cluster B — Youth Reset Funnels (4 Files)

#### Files to Delete
1. `src/after-school.html`
2. `src/school-families-jiu-jitsu.html`
3. `src/fall-practice-reset.html`
4. `src/back-to-school-bjj-tannersville/index.html` (and remove directory `src/back-to-school-bjj-tannersville/`)

#### Content Consolidation into Canonical Hub
Ensure [`src/bjj-classes/kids-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-classes/kids-tannersville-ny/index.html) has an anchor `<section id="after-school">` with evergreen copy:
- Explain that classes fit the after-school transition (5:00 PM start, 45-minute structured focus, homework/dinner calm afterwards).
- State clearly that no martial arts experience is required.
- Do not hardcode school district start dates or tuition dollar amounts; link to `/options-pricing` for rates and `/schedule` for days.

#### Internal Links to Repoint (Must be done before adding redirects!)
Audit found the following files link to `/after-school` or `/school-families-jiu-jitsu`:
- `src/site-shell.html`: Update link `/after-school` $\rightarrow$ `/bjj-classes/kids-tannersville-ny#after-school`
- `src/contact.html`: Update link `/after-school` $\rightarrow$ `/bjj-classes/kids-tannersville-ny#after-school`
- `src/blog/beginner-friendly-bjj-tannersville.html`: Update link `/after-school` $\rightarrow$ `/bjj-classes/kids-tannersville-ny#after-school`
- `src/blog/bjj-routine-tannersville-hunter-windham.html`: Update link `/after-school` $\rightarrow$ `/bjj-classes/kids-tannersville-ny#after-school`
- `src/blog/parents-guide-bjj-classes-hunter-windham.html`: Update link `/school-families-jiu-jitsu` $\rightarrow$ `/bjj-classes/kids-tannersville-ny`

#### Deployment & Whitelist Updates
- In [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py):
  - Line 8: Remove `'back-to-school-bjj-tannersville/'` and `'fall-practice-reset/'` from `DEPLOYABLE_ROOTS`.
  - Line 9: Remove `'after-school.html'` from `ROOT_FILES`.
- In [`scripts/qa-seo-remediation.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-seo-remediation.mjs):
  - Line 8: Remove `'/school-families-jiu-jitsu'` from `publicRoutes`.
- In [`tools/build-crawl-source-of-truth.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-crawl-source-of-truth.mjs):
  - Line 176: Remove `|| pathname === '/school-families-jiu-jitsu'`.

#### Redirect Configuration
Add to [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json):
```json
"/after-school": "/bjj-classes/kids-tannersville-ny#after-school",
"/school-families-jiu-jitsu": "/bjj-classes/kids-tannersville-ny",
"/fall-practice-reset": "/bjj-classes/kids-tannersville-ny",
"/back-to-school-bjj-tannersville": "/bjj-classes/kids-tannersville-ny"
```

---

### Step 5: Cluster C — Parent Guides & Culture Rules (4 Files)

#### Files to Delete
1. `src/core-culture-parent-guide.html`
2. `src/core-culture-review.html`
3. `src/class-rules.html`

#### Content Consolidation
1. **Parent Resources Consolidation:**
   - Review [`src/parent-resources.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html).
   - Migrate any valuable parent coaching advice from `core-culture-parent-guide.html` (e.g. how to support a child during tough sessions, car ride home conversations) into `parent-resources.html`.
   - Ensure the copy follows `stop-slop` principles: eliminate mechanical phrases like `"12-week program Parent Guide"`.
2. **Class Rules Consolidation:**
   - Verify [`src/how-class-works.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html) has `<section id="rules">` listing mat rules, hygiene, bow-in etiquette, and spectator respect.
   - Clean up any duplicated rule text.
3. **Student Progress / Report Card:**
   - [`src/report-card.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/report-card.html) is the canonical progress tracking page.
   - Discard `core-culture-review.html` and its client-side DOM TreeWalker script monkey patch.

#### Internal Links to Repoint
- Check footer and navigation links for `/core-culture-parent-guide` and `/class-rules`:
  - `src/site-shell.html`: Re-point `/class-rules` $\rightarrow$ `/how-class-works#rules`.
  - `src/parent-resources.html`: Remove self-links to `/core-culture-parent-guide`.
  - `src/_includes/components/footer.njk` / `footer-include.html`: Ensure any parent resource links point to `/parent-resources` and `/how-class-works#rules`.

#### Deployment & Whitelist Updates
- In [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) line 9 (`ROOT_FILES`), delete:
  - `'core-culture-parent-guide.html'`
  - `'core-culture-review.html'`

#### Redirect Configuration
Add to [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json):
```json
"/core-culture-parent-guide": "/parent-resources",
"/core-culture-review": "/report-card",
"/class-rules": "/how-class-works#rules"
```

---

### Step 6: Cluster D — Safety & Nervous Beginners (3 Files)

#### Files to Delete
1. `src/jiu-jitsu-safety-tannersville-ny.html`
2. `src/nervous-first-timers.html`

#### File to Repurpose
3. `src/show-up-kit.html`:
   - Keep as a lightweight, clean post-booking confirmation checklist (what to wear, when to arrive, parking) accessible from the booking confirmation screen, but remove any duplicate program pitch copy.

#### Content Consolidation into `/how-class-works`
Ensure [`src/how-class-works.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html) contains:
- Section `<section id="safety">` detailing:
  - The 3-tap rule and immediate submission release.
  - Mat cleanliness and sanitization protocols.
  - Structured resistance: controlled pacing, no uncontrolled sparring for beginners.
  - The beginner lane concept: coaches guide first-timers through fundamentals before open drills.
- Clear, calm reassurance for nervous first-timers (addressing fear of getting hurt, feeling out of shape, or feeling like an outsider).

#### Internal Links to Repoint
- Search across `src/` for `/jiu-jitsu-safety-tannersville-ny` and `/nervous-first-timers`:
  - `src/site-shell.html`: Update link `/jiu-jitsu-safety-tannersville-ny` $\rightarrow$ `/how-class-works#safety`.
  - `src/bjj-classes/adults-tannersville-ny/index.html`: Update link to `/how-class-works#safety`.
  - `src/bjj-classes/kids-tannersville-ny/index.html`: Update link to `/how-class-works#safety`.

#### Deployment & Whitelist Updates
- In [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) line 9 (`ROOT_FILES`), delete:
  - `'jiu-jitsu-safety-tannersville-ny.html'`
- In [`tools/build-crawl-source-of-truth.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-crawl-source-of-truth.mjs) line 176:
  - Remove `|| pathname === '/jiu-jitsu-safety-tannersville-ny'` and `|| pathname === '/nervous-first-timers'`.

#### Redirect Configuration
Add to [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json):
```json
"/jiu-jitsu-safety-tannersville-ny": "/how-class-works#safety",
"/nervous-first-timers": "/how-class-works"
```

---

### Step 7: Cluster F — Hospitality Staff Passes (4 Files)

#### Target Problem
The codebase features multiple clone pages created by find-and-replace for local hotel and restaurant partners (`scribners-staff-reset-pass.html`, `deer-mountain-inn.html`, `phoenicia-diner.html`).
- `scribners.html` is an established, active local partnership page.
- `scribners-staff-reset-pass.html` is an identical duplicate with unverified inline CSS and inconsistent phone links.
- `deer-mountain-inn.html` and `phoenicia-diner.html` are unlaunched duplicate partner landing pages duplicating `partners-hospitality-hunter-windham.html`.

#### Files to Delete
1. `src/scribners-staff-reset-pass.html`
2. `src/deer-mountain-inn.html`
3. `src/phoenicia-diner.html`

#### Consolidation Actions
1. **Scribner's Hub:** Ensure [`src/scribners.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/scribners.html) cleanly serves Scribner's Catskill Lodge team members and guests with standard brand CSS and correct booking CTAs.
2. **Hospitality Partners Hub:** Maintain [`src/partners-hospitality-hunter-windham.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partners-hospitality-hunter-windham.html) as the single authority directory for area hotel and dining partnerships (including Deer Mountain Inn, Phoenicia Diner, Hunter Mountain staff).

#### Deployment & Whitelist Updates
- In [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) line 9 (`ROOT_FILES`), delete:
  - `'deer-mountain-inn.html'`
  - `'phoenicia-diner.html'`
- In [`scripts/qa-seo-remediation.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/qa-seo-remediation.mjs):
  - Line 8: Remove `'/phoenicia-diner'` from `publicRoutes`.
- In [`tools/build-crawl-source-of-truth.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/build-crawl-source-of-truth.mjs):
  - Line 176: Remove `|| pathname === '/phoenicia-diner'`.
  - Line 180: Remove `|| pathname === '/scribners-staff-reset-pass'`.

#### Redirect Configuration
Add to [`config/legacy-redirects.json`](file:///home/twizss/Documents/ssbjjweb/tmb/config/legacy-redirects.json):
```json
"/scribners-staff-reset-pass": "/scribners",
"/deer-mountain-inn": "/partners-hospitality-hunter-windham",
"/phoenicia-diner": "/partners-hospitality-hunter-windham"
```

---

## 4. Linguistic & Stop-Slop Sweep Specifications

When migrating or consolidating copy, apply the following strict cleanup rules based on `.agents/skills/stop-slop/SKILL.md`:

### 4.1 Eliminating Mechanical Replacement Residue
- Search across the entire codebase for `"Free First Visitduction"` and replace with `"Free First Visit"` or `"Introduction"`.
- Search for `"12-week program Parent Guide"` and replace with `"Parent Guide"`.
- Search for `"regular class timees"` and replace with `"regular class times"`.
- Strip out any runtime DOM TreeWalker scripts that attempt to patch text in browser memory.

### 4.2 Removing False Dichotomies & Drama
Replace binary opposition formulas with affirmative statements of fact:
- **Change:** *"It’s not wild fighting, it’s structured composure."*  
  **To:** *"Students practice techniques at a controlled, coach-led pace."*
- **Change:** *"Not just a workout, but physical chess."*  
  **To:** *"Classes develop balance, leverage, and practical body mechanics."*

### 4.3 Punctuation & Em-Dash Pruning
- Reduce overuse of em-dashes (`—`) across meta descriptions, headings, and bullet points. Replace with periods or commas to restore a natural, confident cadence.

---

## 5. Complete JSON Redirect Payload for `config/legacy-redirects.json`

To execute the 301 redirection phase, insert the following dictionary keys into `config/legacy-redirects.json` under `"redirects"`:

```json
{
  "/after-booking-promise": "/free-bjj-intro-tannersville-ny",
  "/after-school": "/bjj-classes/kids-tannersville-ny#after-school",
  "/annual-track": "/options-pricing#annual-track",
  "/back-to-school-bjj-tannersville": "/bjj-classes/kids-tannersville-ny",
  "/bjj-videos": "/",
  "/class-rules": "/how-class-works#rules",
  "/clean": "/",
  "/core-culture-parent-guide": "/parent-resources",
  "/core-culture-review": "/report-card",
  "/core-promise-full": "/how-class-works",
  "/core-promise-short": "/how-class-works",
  "/deer-mountain-inn": "/partners-hospitality-hunter-windham",
  "/fall-practice-reset": "/bjj-classes/kids-tannersville-ny",
  "/jiu-jitsu-safety-tannersville-ny": "/how-class-works#safety",
  "/my-promise-full": "/how-class-works",
  "/my-promise-short": "/how-class-works",
  "/nervous-first-timers": "/how-class-works",
  "/phoenicia-diner": "/partners-hospitality-hunter-windham",
  "/reviews-village": "/success-stories",
  "/safety-promise": "/how-class-works#safety",
  "/samurai-break": "/parent-resources",
  "/school-families-jiu-jitsu": "/bjj-classes/kids-tannersville-ny",
  "/scribners-staff-reset-pass": "/scribners",
  "/tactical-longevity": "/law-enforcement-bjj",
  "/videos": "/"
}
```

---

## 6. QA Verification & Validation Runbook

Following code modifications, file deletions, and redirect configuration, execute this exact sequence of validation commands to guarantee zero build, link, or SEO regressions.

### Phase 1: Redirect & Sitemap Synchronization
```bash
# 1. Synchronize legacy-redirects.json into .htaccess
npm run redirects:sync

# 2. Verify .htaccess contains all expected 301 rules
npm run redirects:check

# 3. Rebuild source of truth and crawl registry
npm run build:source-of-truth

# 4. Rebuild all sitemaps (ensures deleted pages drop from sitemaps)
node tools/build-all-sitemaps.mjs
```

### Phase 2: Build & Static Link Validation
```bash
# 5. Compile the Eleventy site and materialize SSI fragments
npm run build

# 6. Verify internal links and ensure NO active pages point to redirect sources
npm run qa:links:static

# 7. Verify all internal link destinations exist on disk in dist/
npm run qa:links:existence

# 8. Check for orphaned files and verify sitemap integrity
npm run qa:orphans
```

### Phase 3: SEO, Stop-Slop & Editorial Rule Verification
```bash
# 9. Verify SEO tags, single canonicals, and noindex constraints
npm run qa:seo:remediation

# 10. Verify zero hardcoded volatile operational facts (prices/schedules)
npm run qa:volatile-facts

# 11. Verify absence of AI slop, broken replacement phrases, and banned cliches
npm run qa:stop-slop

# 12. Run master project validation test suite
npm run validate
```

---

## 7. Rollback & Contingency Plan

If any unanticipated regression occurs during execution:
1. **Git State Restoration:** All changes should be made on the current git branch (`blackbeltbartender/hyphen-weekend-v1`). If needed, individual file deletions can be rolled back via `git checkout HEAD -- <path>`.
2. **Redirect Safety:** Because redirect rules reside in `config/legacy-redirects.json`, rolling back the JSON file and running `npm run redirects:sync` will immediately restore the prior `.htaccess` ruleset.
3. **Deployment Protection:** The production deployer (`scripts/deploy-release.py`) checks atomic tar backups and changed files. No live changes are deployed until `validate` passes 100% clean.

---
<!-- GOAL_COMPLETE -->
