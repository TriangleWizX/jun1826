# Codex Handoff & Session Architecture Record
**Repository**: `https://github.com/TriangleWizX/tmb` (`senseisandy.com`)  
**Timestamp**: 2026-10-05T08:20:00-04:00  
**Scope**: Complete record of engineering, design, copywriting, schedule expansion, and QA deployments executed between **Friday, October 2, 2026** and **Monday, October 5, 2026**.  
**Current Worktree Status**: Clean (`git status` reports 0 untracked files, 0 unstaged modifications, 0 staged uncommitted changes).

---

## 1. Persona & Expert Framework

- **Coordinator / Documentation Guardian**: `Knowledge Manager - Rupert Giles the Document Guardian` (`uuid: 6d7a48dc-2e21-4b3b-86f8-daafdd8c5eb6`)
- **Master INSTRUCTIONS Asset**: `Instructions - COMPETENCE` (`uuid: e144b81f-10ea-41a6-a06c-03d69dfb738f`)
- **Operating Framework**: Persona Studio & Auto Persona Tri-Tier Operating Model (`AGENTS.md`).
- **Core Standard**: High-transparency knowledge preservation, rigorous verification evidence, complete audit trails, and zero technical debt handoff to Codex.

---

## 2. Executive Summary & Production State

This record summarizes work reported as completed during the session series. The original deployment and test assertions did not include per-release payloads, backup identifiers, or retained command logs, so this document alone does not independently prove that every listed change was deployed or that every claimed gate passed. Corrections and current release evidence are recorded in §8.

### Production Snapshot
- **Live URL**: [https://senseisandy.com](https://senseisandy.com)
- **Primary Business Goal**: Help kids, teens, adults, families, and first responders confidently book a Free First Visit (`/free-bjj-intro-tannersville-ny`).
- **Studio Address**: `6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485`.
- **Contact / SMS**: `+1 (917) 736-8649` (`Text Sandy`).
- **Canonical Schedule**: 11 active weekly group classes (Mon–Fri 5:00 PM Youth/Teen, Mon–Fri 6:00 PM Adult Gi, Sat 10:30 AM Adult No-Gi) plus weekday morning private coaching by request.
- **Tech Stack**: Eleventy (`@11ty/eleventy` 3.1.6), Bootstrap 5.3.3, Bootstrap Icons, Sass, Playwright for visual regression, Vanilla JS, and custom atomic SFTP release scripts.

---

## 3. Workstreams & Key Implementations (Oct 2 – Oct 5, 2026)

### Workstream 1: Law Enforcement & Tactical Longevity VIP Treatment
- **Target File**: [`src/law-enforcement-bjj.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/law-enforcement-bjj.html)
- **Stylesheets**: [`src/assets/css/pages/law-enforcement.css`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/pages/law-enforcement.css), minified to [`law-enforcement.min.css`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/pages/law-enforcement.min.css). Added to [`tools/minify-css.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/minify-css.mjs).
- **Key Enhancements**:
  - Overhauled layout into VIP architecture with Sensei Sandy palette tokens (`--ss-green`, `--ss-surface`, `--ss-border`, `--ss-shadow-card`).
  - Hero card integrates authentic photo of Sensei Sandy coaching with controlled resistance (`/assets/images/sensei-sandy.6e2ade.webp`), Instrument Serif H1, and dual CTA buttons (`Reserve Free First Visit` and `Request a Team Pilot Proposal`).
  - Refactored two-path bento grid:
    1. *Train as an Individual*: Community Service Rate ($600 for 12 weeks), 3 classes/week, official gi included. This rate is excluded from the 30-Day Training Fit Guarantee under canonical pricing policy.
    2. *Train as a Team*: Private Agency Pilot (5–8 participants, shift-friendly scheduling, policy alignment, supervisor summary).
  - The cited Marietta Police Department 2020 report describes 48% fewer officer injuries during use-of-force incidents, 53% fewer injuries to people being arrested when force was required, and 23% less Taser use. These are department-reported comparison figures, not outcomes promised by Sensei Sandy BJJ.
  - Interactive FAQ accordion, Formspree agency pilot inquiry form, and Coworker Friend Pass section.
- **Commit**: `2200c1f9` | Deployed live to production.

---

### Workstream 2: Dedicated Directions & Parking Page Treatment
- **Target File**: [`src/bjj-tannersville-ny-directions.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-tannersville-ny-directions.html)
- **Stylesheets**: [`src/assets/css/pages/directions.css`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/pages/directions.css), minified to [`directions.min.css`](file:///home/twizss/Documents/ssbjjweb/tmb/src/assets/css/pages/directions.min.css).
- **Key Enhancements**:
  - Hero banner with real building exterior photo (`sensei-sandy-bjj-building-main-street.585fcc.webp`), Instrument Serif H1, and dual in-fold CTAs (`Reserve Free First Visit` and `Open in Google Maps`).
  - Mobile fold optimization: constrained hero image height (`max-height: 140px`) on 375x667 viewports, ensuring primary booking buttons are visible above the fold with zero layout shift.
  - 4 Arrival Fact Cards: Address, Free Street & Side Parking, 2nd Floor Entry, and Easy Rescheduling by Text.
  - Regional Proximity Matrix: Real mountain drive times (Hunter 6m, Haines Falls 4m, Windham 14m, Catskill 24m) and direct routes.
  - Interactive Google Maps card with responsive iframe and action overlays.
  - 7-Step Photo Walkthrough from Main Street to mat room with authentic local photos.
- **Commit**: `3bf3dfca` | Deployed live to production.

---

### Workstream 3: Thursday Schedule Expansion & Annual Habit Planner
- **Target Files**: [`src/_data/schedule.json`](file:///home/twizss/Documents/ssbjjweb/tmb/src/_data/schedule.json), [`data/schedule.js`](file:///home/twizss/Documents/ssbjjweb/tmb/data/schedule.js), [`src/schedule.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html), [`src/_includes/schedule-master.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/_includes/schedule-master.html).
- **Key Enhancements**:
  - Expanded group schedule from 9 classes to 11 active weekly classes by adding **Thursday evening classes**:
    - **Thursday 5:00 PM**: Youth/Teen (Ages 5–17, No-Gi)
    - **Thursday 6:00 PM**: Adult (Ages 18+, Gi)
  - Updated schedule matrix:
    - Monday: 5:00 PM Youth/Teen (No-Gi), 6:00 PM Adult (Gi)
    - Tuesday: 5:00 PM Youth/Teen (Gi), 6:00 PM Adult (Gi)
    - Wednesday: 5:00 PM Youth/Teen (No-Gi), 6:00 PM Adult (Gi)
    - Thursday: 5:00 PM Youth/Teen (No-Gi), 6:00 PM Adult (Gi)
    - Friday: 5:00 PM Youth/Teen (Gi), 6:00 PM Adult (Gi)
    - Saturday: 10:30 AM Adult (No-Gi)
    - Weekday mornings: Private lessons available by request.
  - Embedded "Three Classes a Week Habit Planner" directly into `/schedule` at a 3rd-grade reading level.
  - Synchronized across automated test suites (`qa:schedule`, `qa:volatile-facts`, `qa-unified.mjs`).
- **Commit**: `54f62aea` | Deployed live to production.

---

### Workstream 4: Tournament Page Family Experience Migration
- **Target Files**: `src/local-bjj-tournaments-for-families.html` (migrated from `local-bjj-tournaments-for-parents.html`), `tools/sync-htaccess-legacy-redirects.mjs`, `.htaccess`.
- **Key Enhancements**:
  - Migrated slug to `/local-bjj-tournaments-for-families` with a clean 301 redirect from the legacy URL.
  - Rewrote copy at a 3rd-grade reading level framing competition as an exciting, supportive family weekend ("sell the vacation, not the airplane").
  - Clear athletic objective: "It is our job to reach the top of the podium; it is our job to make sure no one else in the division did what they could to keep us from the top."
  - Sandy's post-match celebration promise: win or lose, short or long match, Sandy is ready with high-fives, fresh water, and burgers or ice cream after leaving the venue.
- **Commit**: `ab905571` | Deployed live to production.

---

### Workstream 5: Global Visual Harmonization & Button Standardization
- **Target Files**: `src/programs.html`, `src/how-class-works.html`, `src/private-lessons.html`, `src/bio.html`, `src/bjj-faqs.html`, `src/community-partners.html`, `src/success-stories.html`.
- **Key Enhancements**:
  - Introduced `.btn-premium btn-premium--primary` and `.btn-premium btn-premium--secondary` on `src/programs.html`. The other six listed pages retain existing button classes; they were not migrated to these classes in this workstream.
  - Upgraded headings to Instrument Serif and body text to Inter/Plus Jakarta Sans.
  - Copy updates were made across the seven pages. A universal third-grade reading-level result was not established by the recorded checks.
  - Synchronized asset hash manifest with newly minified CSS bundles.
- **Commit**: `bd82f641` | Deployed live to production.

---

### Workstream 6: Subpages & Class Hubs Overhaul
- **Target Files**: `src/bjj-classes/tannersville-ny/index.html`, `src/bjj-classes/kids-tannersville-ny/index.html`, `src/bjj-classes/teens-tannersville-ny/index.html`, `src/bjj-classes/adults-tannersville-ny/index.html`.
- **Key Enhancements**:
  - Harmonized class hub and subpages to 3rd-grade reading level.
  - Eliminated section duplication, fixed CTA mobile tap targets, and streamlined booking flows.
- **Commit**: `a40c88a5` | Deployed live to production.

---

### Workstream 7: Contact Page Human-Centered UX Overhaul
- **Target File**: `src/contact.html`, `src/assets/css/contact-vip.css`, `contact-vip.min.css`.
- **Key Enhancements**:
  - Engineered VIP contact experience (`.contact-vip-main`) with Instrument Serif typography and soft cream cards.
  - Responsive cards for SMS, Phone, Email, Address, and Studio Hours.
  - Full-width interactive Google Maps card with action buttons ("Open in Google Maps", "Copy Address") and live mountain drive times.
- **Commits**: `dd70f5bd`, `29933828` | Deployed live to production.

---

### Workstream 8: Blog Hub Humanization
- **Target File**: `src/blog/index.html`, `src/assets/css/blog.css`.
- **Key Enhancements**:
  - Overhauled blog hub with warm editorial typography and four topic filters: First Class, Kids & Families, Adult Fitness, and Local & Schedule.
  - Rewrote excerpts at a 3rd-grade reading level.
  - Integrated high-intent conversion banner leading to the Free First Visit flow.
- **Commit**: `357f3b6c` | Deployed live to production.

---

### Workstream 9: Infil-Style Interactive BJJ Glossary Engine
- **Target Files**: `src/bjj-glossary.html`, `src/assets/css/bjj-glossary.css`, `src/assets/js/glossary-infil.js`.
- **Key Enhancements**:
  - Transformed the static glossary into an interactive dictionary (inspired by Infil's FG Glossary). The generated hub is `src/bjj-glossary/index.html`; the generator is `tools/build-glossary-pages.mjs`, and the interaction source is `js/glossary-filters.js`.
  - Features real-time client-side search, category filters (Positions, Submissions, Movements, Basics, Gi / No-Gi, Youth / Bully-Proof), a term reader, and share links using `?t=slug`.
  - Harmonized palette to Sensei Sandy cream paper and forest green.
- **Commits**: `f238c686`, `c70e6efc`, `69179884` | Deployed live to production.

---

### Workstream 10: Student Retention & Progression Pipeline
- **Target Files**: `src/daily-checkin.html`, `src/weekly-audit.html`, `src/report-card.html`.
- **Key Enhancements**:
  - Connected checkin, audit, and report card into an integrated Day 4 ascension pipeline.
  - Added authentic coach photography avatars, eliminated negative/deficit terms, and added positive habit tracking.
- **Commits**: `1c869069`, `f06e782c` | Deployed live to production.

---

### Workstream 11: Partner Ecosystem & Authentic Local Media
- **Target Files**: `src/community-partners.html`, `src/partners-hospitality-hunter-windham.html`, `src/partners-wellness-pt-referrals.html`, `src/nearby-towns.html`.
- **Key Enhancements**:
  - Purged all synthetic AI and aggressive combat imagery sitewide.
  - Replaced with authentic verified photography of Sensei Sandy, studio classes, family Friday sessions, and local mountain landmarks.
  - Upgraded Nearby Towns directory with real drive times and route directions.
- **Commits**: `6793ef2f`, `87cd7d70`, `abae7961`, `a4d48526`, `7152d5f3`, `4fb40a54`, `d6cf2724` | Deployed live to production.

---

### Workstream 12: Content Archival & Global Navigation
- **Key Enhancements**:
  - Cleanly archived obsolete `bjj_anatomy_game.html` with permanent 301 redirect to `parent-resources` in `.htaccess`.
  - Global site header fix: ensured Sensei Sandy BJJ text and adjacent logo are globally clickable back to home (`01659666`).
  - Tracked and verified offline VSL production assets in `docs/ads/vsl-outcome-shoot-order-2026-10-03/` (`ec38ea2e`).

---

## 4. Git Commit History Manifest (Oct 2 – Oct 5, 2026)

| Hash | Date | Scope / Type | Description |
| :--- | :--- | :--- | :--- |
| `ec38ea2e` | 2026-10-05 | `docs(ads)` | Track vsl-outcome-shoot-order-2026-10-03 production assets |
| `2200c1f9` | 2026-10-05 | `feat(law-enforcement)` | Treat law-enforcement-bjj with 3rd-grade reading level, VIP design, and positive framing |
| `3bf3dfca` | 2026-10-05 | `feat(directions)` | Treat bjj-tannersville-ny-directions with 3rd-grade reading level, interactive map, arrival sequence |
| `54f62aea` | 2026-10-05 | `feat(schedule)` | Add Thursday evening classes, 11-class schedule model, and 3-class annual habit planner |
| `ab905571` | 2026-10-04 | `feat(tournaments)` | Migrate to local-bjj-tournaments-for-families with 3rd-grade reading level & podium goal |
| `bd82f641` | 2026-10-04 | `feat(global)` | Harmonize typography, buttons, and 3rd-grade reading level across global pages |
| `a40c88a5` | 2026-10-04 | `feat(classes)` | Overhaul bjj-classes tannersville and subpages to 3rd-grade reading level |
| `29933828` | 2026-10-04 | `fix(contact)` | Ensure google maps embed fills card with responsive header and action buttons |
| `dd70f5bd` | 2026-10-04 | `feat(contact)` | Overhaul contact page to 3rd-grade reading level and human-centered UX |
| `357f3b6c` | 2026-10-04 | `feat(blog)` | Overhaul blog hub to 3rd-grade reading level and human-centered design |
| `69179884` | 2026-10-04 | `feat(glossary)` | Unify bjj-glossary and term subpages with site-wide warm paper and green brand palette |
| `c70e6efc` | 2026-10-04 | `fix(glossary)` | Restore high contrast visibility and layout for community learning card and buttons |
| `f238c686` | 2026-10-04 | `feat(glossary)` | Overhaul BJJ glossary with Infil-style interactive dictionary, live search, and deep linking |
| `01659666` | 2026-10-04 | `feat(branding)` | Ensure Sensei Sandy BJJ text and adjacent logo are clickable to return to homepage globally |
| `1c869069` | 2026-10-04 | `feat(retention)` | Unify daily-checkin, weekly-audit, and report-card into Day 4 ascension pipeline |
| `f06e782c` | 2026-10-04 | `feat(report-card)` | Add authentic coach photo avatars, eliminate negative phrasing, align with beginner standards |
| `6793ef2f` | 2026-10-04 | `feat(community)` | Add authentic hero photography, 2-column hero grid, and clean categorized partner sections |
| `87cd7d70` | 2026-10-04 | `feat(hospitality)` | Replace AI imagery with authentic studio photography, fix ribbon layout, refine copy |
| `abae7961` | 2026-10-04 | `feat(wellness)` | Use homepage hero photo for provider toolkit background |
| `a4d48526` | 2026-10-04 | `feat(wellness)` | Replace synthetic AI imagery with verified authentic local photos and assets |
| `7152d5f3` | 2026-10-04 | `fix(wellness)` | Align partners-wellness-pt-referrals to approved mockup, clean typography, positive framing |
| `4fb40a54` | 2026-10-04 | `fix(ui)` | Harden visibility, H1 line wrapping, pill containers, and layout across nearby-towns |
| `d6cf2724` | 2026-10-04 | `fix(copy,ui)` | Orient nearby-towns for humans with drive times, local routes, parking details, and FAQs |
| `8f9cfc77` | 2026-10-04 | `fix(ui)` | Resolve hero content and CTA overlap on camp-clinics page |
| `adfbf1c4` | 2026-10-04 | `feat(archive)` | Archive bjj-anatomy-quiz globally with 301 redirect to parent-resources |
| `4ba31f86` | 2026-10-04 | `fix(schedule)` | Orient holiday schedule for humans from October 4 2026 with chronological upcoming dates |
| `eac71ef1` | 2026-10-04 | `fix(copy,ui)` | Eliminate section and content redundancies on bully-proof page |
| `3c6fda3e` | 2026-10-04 | `fix(ui)` | Restyle holiday-schedule hero with centered card and high-contrast typography |
| `99eef86a` | 2026-10-04 | `feat(ui,copy)` | Deepdive refactor of holiday-schedule with positive framing, mobile sticky bar |
| `a3d07657` | 2026-10-04 | `feat(ui,copy)` | Deepdive refactor of show-up-kit with typography, mobile sticky bar, zero bleed |
| `a0de6a89` | 2026-10-04 | `feat(ui,copy)` | Deepdive refactor of bjj-stretches with 3rd-grade reading level, dedicated styles |
| `06b27b92` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of bio page with dedicated styles, positive framing, mobile sticky bar |
| `bc82d259` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of bully-proof-jiu-jitsu page with dedicated styles, positive framing |
| `e64d5132` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of sensei-jiu-jitsu with dedicated styles, positive framing |
| `1c74cf58` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of blog/bjj-sensei with 3rd-grade reading level, positive framing |
| `89b0b9e3` | 2026-10-03 | `fix(ui)` | Center and structure teaching doctrine section on sensei-studio |
| `dcedb5ca` | 2026-10-03 | `chore(dist)` | Sync compiled dist/sensei-studio.html with source overhaul |
| `bf52f674` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of sensei-studio with 3rd-grade reading level, dedicated styles |
| `83a1e7eb` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of guarantee-terms with 3rd-grade reading level, dedicated styles |
| `e185a9e2` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of parent-resources with 3rd-grade reading level, positive framing |
| `4a3093f4` | 2026-10-03 | `feat(ui,copy)` | Deepdive refactor of friday-night-fanatics page with 3rd-grade reading level |
| `750ac046` | 2026-10-03 | `fix(ui)` | Prevent hero text overflow and horizontal bleed on birthday-parties page |
| `331af126` | 2026-10-03 | `chore(assets)` | Sync asset hash manifest with partner-pages minified bundle |
| `872eb914` | 2026-10-03 | `feat(copy)` | Rewrite camp clinics page for 3rd-grade reading level and positive framing |
| `2e7d0f79` | 2026-10-03 | `feat(copy)` | Rewrite birthday parties page for 3rd-grade reading level and positive framing |
| `9d1dca49` | 2026-10-03 | `feat(referrals)` | Rebrand Shiney Ticket to The Mountain Tap Card (MTP) with referring friend tracking |
| `bf32ada9` | 2026-10-03 | `fix(ui)` | Resolve global text centering, missing grid styles, and CTA button wrapping |
| `2fffef67` | 2026-10-02 | `fix(home)` | Fix homepage copy text alignment, grid layout, and CTA button wrapping |
| `adcd0be4` | 2026-10-02 | `feat(pricing)` | Anchor global monthly price ranges to 3x monthly pricing ($145-$195/mo) |
| `fd132287` | 2026-10-02 | `feat(pricing)` | Anchor global price ranges at highest 3x annual track down to lowest 1x monthly |
| `d91d2243` | 2026-10-02 | `fix(pricing)` | Reconcile adult 12-week 3x to $615 and harmonize pricing ladders |
| `c2544732` | 2026-10-02 | `docs(referrals)` | Record ST01 closeout deployment verification evidence |
| `55ce8304` | 2026-10-02 | `feat(referrals)` | Complete Shiney Ticket ST01 physical verification and mark pilot card ready |
| `cb2063f9` | 2026-10-02 | `docs(referrals)` | Record private Shiney Ticket pilot workbook setup |
| `05f4a1b5` | 2026-10-02 | `docs(referrals)` | Record live ST card-code release verification |
| `0374d431` | 2026-10-02 | `refactor(referrals)` | Rename Shiney Ticket card codes to ST |
| `62fce625` | 2026-10-02 | `docs(referrals)` | Record user-verified Shiney Ticket GT01 activation link |
| `b11b7d9c` | 2026-10-02 | `docs(referrals)` | Record Shiney Ticket live verification and rollback evidence |
| `d2a551ae` | 2026-10-02 | `feat(referrals)` | Launch Shiney Ticket four-class offer adult first-day choices |
| `3406ce4a` | 2026-10-02 | `refactor(copy)` | Refactor site copy to 3rd-grade reading level with positive beginner framing |

---

## 5. Standards, Governance & Architecture Rules

Codex should strictly observe the following repository rules during future sessions:

### 1. 3rd-Grade Reading Level & Positive Affirming Copy
- **Reading Level Ceiling**: Flesch-Kincaid Grade Level $\le 3.0$ on all customer-facing prose, headings, and lists.
- **Strictly Banned Deficit Vocabulary**:
  `zero`, `without`, `stop`, `don't`, `won't`, `never`, `hurt`, `pain`, `injury`, `injuries`, `roughhousing`, `muscling`, `ego`, `meathead`, and isolated `no` (except `No-Gi`).
- **Affirmative Substitutions**:
  - *"Zero live sparring on day one"* $\rightarrow$ *"Cooperative, coached movement from day one"*
  - *"Train without getting hurt"* $\rightarrow$ *"Learn martial arts at a calm, steady pace"*
  - *"No experience needed"* $\rightarrow$ *"Beginners welcome right where you are"*
- **Validation**: Audit with `python3 scripts/qa-free-intro-copy.py`.

### 2. Volatile Operational Facts
- **Never Hard-Code**: Do not hard-code schedule tables, private coaching hours, prices, addresses, or guarantee terms inside editorial pages.
- **Canonical Sources**:
  - Schedule: [`src/_data/schedule.json`](file:///home/twizss/Documents/ssbjjweb/tmb/src/_data/schedule.json) and [`data/schedule.js`](file:///home/twizss/Documents/ssbjjweb/tmb/data/schedule.js) (Public authority is `/schedule`).
  - Guarantee: `30-Day Training Fit Guarantee` linking to `/guarantee-terms`.
  - Address: `6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485`.
  - Phone: `+1 (917) 736-8649`.
- **Validation**: Run `npm run qa:volatile-facts` and `npm run qa:schedule`.

### 3. CSS Minification & Asset Fingerprinting Pipeline
- When introducing or updating page stylesheets in `src/assets/css/pages/`:
  1. Add source/minified paths to [`tools/minify-css.mjs`](file:///home/twizss/Documents/ssbjjweb/tmb/tools/minify-css.mjs).
  2. Run `node tools/minify-css.mjs`.
  3. Run `npm run build` (which runs `tools/fingerprint-assets.cjs` and writes to `src/assets/data/asset-hash-manifest.json`).

### 4. Scoped Deployment Pipeline
- [`scripts/deploy-release.py`](file:///home/twizss/Documents/ssbjjweb/tmb/scripts/deploy-release.py) writes each uploaded file to a temporary remote path and renames that file into place. This is a per-file replacement step; by itself it does not establish whole-release atomicity or zero downtime.
- Dry-run verification: `python3 scripts/deploy-release.py --dry-run`.
- Production deployment must use the reviewed commit and exact `--only` path set from its dry run; a bare command defaults to `HEAD` and does not reproduce a historical multi-commit release.
- Verify the release's remote backup and upload output, then check each affected live route and content marker. Keep the evidence with the release record.

---

## 6. Verification Evidence

The original session reported the following results. Command output was not retained with this handoff, so these are historical reported results rather than reproducible evidence:

```bash
# 1. Unified Structural, Route, Governance, and Performance Suite
$ npm run validate
▶ Structural Suite (15/15 passing)
▶ Link & Route Suite (passing)
▶ Contract & Governance Suite (passing)
▶ Performance & Media Suite (passing)
✔ Cal migration QA passed: 460 generated pages, 73 active dependencies

# 2. Ad Planning & Generator Test Suite
$ npm run test:ads
Ran 35 tests in 0.518s — OK

# 3. Volatile Operational Facts Check
$ npm run qa:volatile-facts
Volatile operational-fact QA passed (1,062 files checked).

# 4. Schedule Consistency Check
$ npm run qa:schedule
Running automated schedule audit... Schedule Audit Passed! No banned strings found.

# 5. Git Status Check
$ git status
On branch main
nothing to commit, working tree clean
```

---

## 7. Next Session Recommendations for Codex

1. **Maintain Zero-Debt Discipline**: Before starting new tasks, run `git status` to ensure a clean branch.
2. **Offline Ad Studio Tooling**: When producing static creatives in `tools/ads/`, adhere to `CANVA-STATIC-CREATIVE-WORKFLOW.md` and preserve masters. Keep `tools/ads/output/` and cache directories out of web distributions.
3. **Local SEO & Geo-Targeting**: Any new landing pages should naturally reference *Tannersville*, *Hunter*, *Windham*, *Haines Falls*, and *Catskills* without keyword stuffing.
4. **Lineage Tagging**: Capped at maximum once per week for `@clockworkbjj` on technical micro-clinics or tournament proof posts.

---
## 8. Post-handoff corrections and release record

This section is an append-only correction to the October 5 session record. See [`CODEX_HANDOFF_2026-10-05_AUDIT.md`](CODEX_HANDOFF_2026-10-05_AUDIT.md) and its evidence directory for the audit baseline, then replace the status below with verified commit, upload, backup, and live-route evidence after release.

- Community Service ($600 / 12 weeks) is excluded from the 30-Day Training Fit Guarantee under `src/_data/pricing.json`; the individual offer copy now says to ask Sandy about the first month and program fit.
- The Marietta figures now name the reported injury measures, retain the 2020 comparison context, and do not present the results as Sensei Sandy outcomes.
- `npm run build` now runs `npm run sitemaps:build` before Eleventy copies the generated sitemap files into `dist/`.
- The three above-grade blocks identified by `scripts/qa-free-intro-copy.py` were rewritten on Friday Night Fanatics and Nearby Towns.
- `scripts/deploy-release.py` now includes generated sitemap index/children when a source-content change is in the reviewed commit.
- Pre-deployment checks after these fixes: build and unified suite passed (15/15); Cal migration browser QA passed (460 pages, 73 active dependencies, with the existing Bootstrap Icons CSS warning); Ad Studio tests passed (35); schedule and volatile-fact QA passed; copy checker passed (470 HTML files, 0 grade failures, 0 stale blocks).
- Source release commit: `2557a603` (`fix(release): correct law enforcement claims and sitemap payloads`).
- Scoped deployment dry run listed exactly nine files: `law-enforcement-bjj.html`, `friday-night-fanatics.html`, `nearby-towns.html`, `sitemap.xml`, `sitemap-core.xml`, `sitemap-programs.xml`, `sitemap-locations.xml`, `sitemap-blog.xml`, `sitemap-glossary.xml`. The unfiltered preview would have included 163 files due to the deploy mapper's glossary rule; the exact `--only` filter constrained the upload.
- Deployment command exited 0. Follow-up remote backup QA found one valid archive, zero invalid archives, and zero cleanup candidates.
- Post-release HTTPS checks returned 200 for all nine deployed routes. The law-enforcement page contains both corrected injury measures and no old “safer calls”, “safer holds”, or guarantee claim in its main content. The Friday and Nearby Towns pages contain the corrected copy. The sitemap index lists all five children; the core child lists law-enforcement and Friday Night Fanatics, and the locations child lists Nearby Towns.
- Targeted local Chrome checks on the changed law-enforcement page passed at 375×667 and 1440×900: no horizontal overflow, one H1, canonical URL present, primary booking CTA visible, image alt text present, and no page errors. Full-site device coverage and measured production uptime remain unverified.

*Signed and sealed for Codex handoff by Knowledge Manager & Release Coordinator.*
