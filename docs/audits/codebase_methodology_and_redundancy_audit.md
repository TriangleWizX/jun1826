# Comprehensive Codebase Audit: Instructional Methodology & Page-Job Redundancies

**Project:** `https://senseisandy.com` (`tmb`)  
**Audit Date:** September 2026  
**Auditor:** Antigravity AI Pair Programmer  
**Scope:** Complete inventory of 485 HTML and Nunjucks templates in `src/`  
**Governing Standards:**  
1. `AGENTS.md` Single-Job Architecture & Conversion Policy  
2. `stop-slop` Linguistic & Editorial Guidelines (`.agents/skills/stop-slop`)  
3. Volatile Operational Facts Precedence Rule  

---

## 1. Executive Summary & Audit Methodology

### 1.1 The Core Problem
Over successive iterations, feature rollouts, and seasonal campaigns, the `senseisandy.com` repository accumulated substantial content drift. Multiple pages were drafted to solve narrow tactical problems (e.g., fall back-to-school routines, hospitality shift worker passes, separate parent guides, SSI test fragments) without retiring obsolete prototypes or anchoring each user query to a single canonical URL.

This architectural bloat directly violates the central tenet of `AGENTS.md`:
> **"Each page should answer one main question."**  
> *"Avoid: Duplicate hero sections, duplicate schedule blocks, private lessons competing with Kids, Teens, and Adults as the first user choice, generic martial arts copy, and repeating the same CTA/card/button styles across many files."*

Furthermore, several pages display severe **"AI-slop"** characteristics:
- Mechanical find-and-replace bugs (e.g., `"Free First Visitduction"`, `"12-week program Parent Guide"`, `"regular class timees"`).
- Runtime client-side monkey-patching (DOM TreeWalkers rewriting broken phrases in user browsers).
- Throat-clearing and binary contrast formulas (`"not just a workout, but..."`, `"It’s not X. It’s Y."`).
- Proliferation of empty SSI stub files exposed as crawlable production endpoints with blank titles, empty descriptions, and non-functional breadcrumb schemas.
- Editorial violations of the **Volatile Operational Facts** rule (hardcoding tuition figures like `$2,100`, `$2,650`, `$550`, `$715`, and specific historical calendar dates).

### 1.2 Canonical Page Job Architecture (The Authority Map)
To resolve ambiguities, all audit evaluations in this report measure candidate pages against the canonical owners established in `AGENTS.md`:

| User Job / Query | Canonical Owner URL | Primary Role & Question Answered |
| :--- | :--- | :--- |
| **Site Entry & Class Discovery** | `/` (`src/index.html`) | *"Which first class fits me?"* Directs to Kids, Teens, Adults. |
| **Schedule & Weekly Planning** | `/schedule` (`src/schedule.html`) | *"Can I make this work this week?"* Real-time schedule authority. |
| **Kids BJJ Fit & Safety** | `/bjj-classes/kids-tannersville-ny` | *"Is this safe and good for my child?"* Core youth program hub. |
| **Teens BJJ Fit & Culture** | `/bjj-classes/teens-tannersville-ny` | *"Will my teen feel confident and accepted?"* Teen program hub. |
| **Adults BJJ Beginner Access** | `/bjj-classes/adults-tannersville-ny` | *"Can I start even if I am out of shape?"* Adult beginner hub. |
| **Instructional Methodology** | `/how-class-works` (`src/how-class-works.html`) | *"What is the 45-minute class structure and teaching system?"* |
| **Free First Visit Booking** | `/free-bjj-intro-tannersville-ny` | *"How do I book my first visit?"* Single booking flow engine. |
| **Tuition, Pricing & Tiers** | `/options-pricing` (`src/options-pricing.html`) | *"What are the tuition rates and membership tiers?"* Pricing authority. |
| **Guarantee & Terms** | `/guarantee-terms` (`src/guarantee-terms.html`) | *"What are the terms of the 30-Day Training Fit Guarantee?"* |
| **Lineage & Instructor Trust** | `/sensei-jiu-jitsu` / `/bio` | *"Who is teaching and what is their legitimate lineage?"* |
| **Social Proof & Reviews** | `/success-stories` (`src/success-stories.html`) | *"What have real parents and adult beginners experienced?"* |
| **Student Progress Assessment** | `/report-card` (`src/report-card.html`) | *"How do we track student skill growth?"* Progress tool. |

---

## 2. Cluster-by-Cluster Redundancy Analysis

We have isolated **7 high-severity problem clusters** comprising **28 redundant, duplicated, or zombie files**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       REDUNDANCY AUDIT TAXONOMY                             │
├────────────────────────────────┬────────────────────────────────────────────┤
│ Cluster A: SSI Promise Stubs   │ 6 Orphaned partials rendering as empty URLs│
│ Cluster B: Youth Reset Funnels │ 4 Competing pages cannibalizing Kids BJJ   │
│ Cluster C: Parent & Culture    │ 4 Overlapping methodology & review pages   │
│ Cluster D: Safety & First-Time │ 3 Splintered safety & onboarding guides    │
│ Cluster E: Tactical Twin Clone │ 2 Identical 500-line law enforcement pages │
│ Cluster F: Hospitality Passes  │ 7 Find-and-replace hotel employee passes   │
│ Cluster G: Monoliths & Zombies │ 6 Orphaned test pages, redirects & essays  │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

### Cluster A: SSI Orphan Promise Stubs (6 Zombie Pages)

#### Problem Summary
These six templates were originally developed as Server-Side Include (SSI) candidates or test partials. Instead of remaining in `_includes/`, they were committed to `src/` with `permalink: "/*.html"` and `layout: layouts/base.njk`. Consequently, Eleventy compiles them into crawlable, public web pages in `dist/`.

Each page contains 25–64 words of total text, empty titles, empty meta descriptions, and non-functional structured data referencing non-existent breadcrumbs.

```
src/
├── core-promise-full.html      (32 words, title: "Sensei Sandy BJJ Full Promise")
├── core-promise-short.html     (47 words, title: "Sensei Sandy BJJ Core Promise")
├── my-promise-full.html        (25 words, title: "")
├── my-promise-short.html       (25 words, title: "")
├── safety-promise.html         (25 words, title: "")
└── after-booking-promise.html  (64 words, title: "After Booking Promise | Sensei Sandy BJJ")
```

#### Detailed File Citations & Redundancy Evidence

##### 1. `src/my-promise-full.html` & `src/my-promise-short.html`
- **Path:** [`src/my-promise-full.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/my-promise-full.html), [`src/my-promise-short.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/my-promise-short.html)
- **Size:** 1,702 bytes & 1,661 bytes | **Word Count:** 25 words each
- **Frontmatter:**
  ```yaml
  ---
  layout: layouts/base.njk
  title: ""
  description: ""
  canonicalUrl: ""
  bodyClass: "ss-page"
  permalink: "/my-promise-full.html"
  ---
  ```
- **Visible Body Content:**
  ```html
  <main class="ss-main" id="main-content" role="main">
    <div class="container py-5">
      <h2 class="h4 fw-bold">My Promise</h2>
      <p class="mb-0">Beginner class, complete small-group class expectations, reschedule by text.</p>
    </div>
  </main>
  ```
- **Redundancy & Defect:** Has no H1, blank title, blank description, blank canonical, and identical 14-word body text. It duplicates the promise statement on [`/how-class-works`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html).

##### 2. `src/core-promise-full.html` & `src/core-promise-short.html`
- **Path:** [`src/core-promise-full.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/core-promise-full.html), [`src/core-promise-short.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/core-promise-short.html)
- **Size:** 1,766 bytes & 1,781 bytes | **Word Count:** 32–47 words
- **Frontmatter:**
  ```yaml
  title: "Sensei Sandy BJJ Core Promise"
  description: ""
  robots: "noindex, follow"
  canonicalUrl: "/core-promise-short"
  ```
- **Visible Body Content:**
  ```html
  <p class="lead mb-3">Free First Visit = quick tour + safety walkthrough + first small-group class plan.</p>
  <p class="mb-0">Beginner class keeps day one calm. Reschedule by text anytime.</p>
  ```
- **Redundancy & Defect:** Orphaned snippet. Dilutes brand authority and leaks unstyled fragments into `dist/`.

##### 3. `src/safety-promise.html`
- **Path:** [`src/safety-promise.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/safety-promise.html)
- **Size:** 1,430 bytes | **Word Count:** 25 words
- **Frontmatter:** Blank `title: ""`, blank `canonicalUrl: ""`.
- **Visible Body Content:**
  ```html
  <p class="lead mb-0">Beginner class = complete small-group class expectations paced to skill level.</p>
  ```
- **Redundancy & Defect:** Pure test fragment compiled into standalone HTML.

##### 4. `src/after-booking-promise.html`
- **Path:** [`src/after-booking-promise.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/after-booking-promise.html)
- **Size:** 2,300 bytes | **Word Count:** 64 words
- **Frontmatter:** `robots: "noindex, follow"`, `description: ""`.
- **Visible Body Content:** A 3-step numbered list (Confirmation, Waiver link, Arrival info) that duplicates the confirmation modal inside `/free-bjj-intro-tannersville-ny` and `/show-up-kit`.

#### Stop-Slop & Linguistic Analysis
- **Throat-Clearing & Stubs:** The pages exist solely as isolated assertions with zero contextual scaffolding, zero navigational orientation, and zero user utility.
- **Dead Schema:** Each stub attempts to declare a `@type: "BreadcrumbList"` JSON-LD schema linking back to a non-existent parent structure.

#### Remediation Architecture
- **Action:** **PRUNE & 301 REDIRECT.**
- Delete all 6 source files from `src/`.
- Add 301 redirects in `.htaccess`:
  - `/core-promise-full`, `/core-promise-short`, `/my-promise-full`, `/my-promise-short`, `/safety-promise` $\rightarrow$ `https://senseisandy.com/how-class-works`
  - `/after-booking-promise` $\rightarrow$ `https://senseisandy.com/free-bjj-intro-tannersville-ny`

---

### Cluster B: Youth After-School & Fall Reset Fragmentation (4 Competing Pages)

#### Problem Summary
Four distinct pages compete directly against the primary youth authority page: [`/bjj-classes/kids-tannersville-ny`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-classes/kids-tannersville-ny/index.html). Each page attempts to target parents seeking after-school activities, resulting in severe keyword cannibalization, fractured inbound links, outdated promotional dates, and mechanical text corruption.

```
                    ┌────────────────────────────────────────┐
                    │ CANONICAL YOUTH AUTHORITY              │
                    │ /bjj-classes/kids-tannersville-ny      │
                    └───────────────────┬────────────────────┘
                                        │
             CANIBALIZES & COMPETES WITH 4 FRAGMENTED PAGES:
    ┌───────────────────┬───────────────┴───┬───────────────────┐
    ▼                   ▼                   ▼                   ▼
/after-school.html  /school-families... /fall-practice-reset /back-to-school...
(723 words)         (543 words)         (287 words)         (454 lines)
```

#### Detailed File Citations & Redundancy Evidence

##### 1. `src/back-to-school-bjj-tannersville/index.html`
- **Path:** [`src/back-to-school-bjj-tannersville/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/back-to-school-bjj-tannersville/index.html)
- **H1:** *"Give Your Child One Weekly Practice They Can Grow Into."*
- **Canonical:** `https://senseisandy.com/back-to-school-bjj-tannersville`
- **Redundancy:** Duplicates the curriculum explanation, coach intro, and 5:00 PM schedule blocks from the Kids page.
- **Stop-Slop Artifacts & Mechanical Replacement Errors:**
  - **Line 31:** Contains an egregious find-and-replace corruption:
    > *"Start with a **Free First Visitduction**, then choose a regular class time that fits your family’s fall routine."*  
    *(A regex global replace of `"Intro"` $\rightarrow$ `"Free First Visit"` blindly mangled `"Introduction"` into `"Free First Visitduction"`).*
  - **Line 27:** Hardcodes expired promotional dates:
    > *"Fall Placement Week Sept 8–12 • Full Fall Schedule Sept 14 • Tannersville, NY"*
  - **Line 60:** Awkward automated token substitution:
    > *"Fall 12-week program Schedule"* (mangled from "Core Schedule").

##### 2. `src/after-school.html`
- **Path:** [`src/after-school.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/after-school.html)
- **H1:** *"After-School Martial Arts & Jiu-Jitsu in Tannersville, NY"*
- **Canonical:** `https://senseisandy.com/after-school`
- **Word Count:** 723 words
- **Redundancy:**
  - Duplicates the youth schedule grid (Mon/Tue/Wed/Fri 5:00 PM).
  - Duplicates the exact section from the homepage:
    > *"You won’t have to guess whether they’re progressing."*
  - Re-explains what happens during class (movement games, partner matching, coached resistance), which is already owned by `/how-class-works`.

##### 3. `src/school-families-jiu-jitsu.html`
- **Path:** [`src/school-families-jiu-jitsu.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/school-families-jiu-jitsu.html)
- **H1:** *"Help Them Reset After School. A Calm Training Ground for Mountaintop Families."*
- **Canonical:** `https://senseisandy.com/school-families-jiu-jitsu`
- **Word Count:** 543 words
- **Redundancy:** A near-identical duplicate of `after-school.html`. Targets Hunter-Tannersville and Windham school district families with the same reassurance bullets: "calm after-school transition", "no chaotic games", "respect and partner safety".

##### 4. `src/fall-practice-reset.html`
- **Path:** [`src/fall-practice-reset.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/fall-practice-reset.html)
- **H1:** *"Build a Fall Routine They Can Keep."*
- **Canonical:** `https://senseisandy.com/fall-practice-reset`
- **Word Count:** 287 words
- **Redundancy & Volatile Facts Violation:**
  - Hardcodes tuition: *"12-Week Program — Youth Track — $550"*.
  - Repeats class schedule: *"4 afternoons each week at 5:00 PM"*.
  - Fails AGENTS.md single-job rule: It is an orphaned promotional landing page that acts as an incomplete pricing and schedule duplicate.

#### Stop-Slop & Linguistic Critique
- **Binary Contrasts:**
  - `after-school.html`: *"Not wild energy or aimless games, but structured partner challenges."*
  - `school-families-jiu-jitsu.html`: *"It is not just about burning off energy, it is about learning composure."*
- **Filler & Adverb Density:** Heavy use of *"simply"*, *"actually"*, and *"truly"* across all four pages to justify their existence.
- **Fragmented User Journey:** A parent searching for youth classes encounters four separate URLs offering slightly varied booking angles rather than a single authoritative Kids Program page.

#### Remediation Architecture
- **Canonical Consolidation:** `/bjj-classes/kids-tannersville-ny` remains the single youth authority. Add an "After-School Routine & Schedule" anchor section to `/bjj-classes/kids-tannersville-ny#after-school`.
- **301 Redirects:**
  - `/after-school` $\rightarrow$ `https://senseisandy.com/bjj-classes/kids-tannersville-ny`
  - `/school-families-jiu-jitsu` $\rightarrow$ `https://senseisandy.com/bjj-classes/kids-tannersville-ny`
  - `/fall-practice-reset` $\rightarrow$ `https://senseisandy.com/bjj-classes/kids-tannersville-ny`
  - `/back-to-school-bjj-tannersville` $\rightarrow$ `https://senseisandy.com/bjj-classes/kids-tannersville-ny`

---

### Cluster C: Instructional Methodology, Parent Guides, Rules & Review (4 Competing Pages)

#### Problem Summary
The codebase contains extreme fragmentation regarding **how coaching is conducted, academy rules, and parent expectations**. While [`/how-class-works`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html) is the canonical owner of instructional methodology and [`/report-card`](file:///home/twizss/Documents/ssbjjweb/tmb/src/report-card.html) is the canonical student assessment tool, four large supplemental pages duplicate, compete with, and contradict these authorities.

```
Canonical Methodology: /how-class-works ◄───┐
                                            ├── DUPLICATES & SPLINTERS
Canonical Progress:    /report-card     ◄───┤
                                            │
├── core-culture-parent-guide.html (22.9KB, 1,799 words)
├── parent-resources.html          (27.6KB, 3,448 words)
├── core-culture-review.html       ( 8.5KB,   503 words - Contains dynamic JS string replacement)
└── class-rules.html               ( 6.9KB,   517 words)
```

#### Detailed File Citations & Redundancy Evidence

##### 1. `src/core-culture-parent-guide.html` vs. `src/parent-resources.html`
- **Paths:** [`src/core-culture-parent-guide.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/core-culture-parent-guide.html) (22.9KB) & [`src/parent-resources.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html) (27.6KB)
- **Content Overlap:** Over 5,200 words combined across two pages that both serve current enrolled families and inquiring parents.
  - Both define the *"Three standards for the room"* (Listen, Keep Going, Be Good to Your Partner).
  - Both provide identical parking and arrival instructions (6045 Main St, back lot).
  - Both provide identical clothing and gi hygiene guidelines.
  - Both provide identical advice for nervous children vs. high-energy children.
- **Stop-Slop Substitution Glitch in `core-culture-parent-guide.html`:**
  - Title and H1: `"12-week program Parent Guide | Sensei Sandy BJJ"`.  
    *(Mangled from "Core Culture Parent Guide", leaving an ungrammatical lowercase phrase as the page title).*

##### 2. `src/core-culture-review.html`
- **Path:** [`src/core-culture-review.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/core-culture-review.html)
- **Title / H1:** *"12-Week Program Review"*
- **Self-Confessed Redundancy:**
  - Line 39 explicitly concedes that this page is redundant:
    > `<p class="text-muted">Use the existing <a href="/report-card">Progress Report Card</a> rather than creating a second assessment.</p>`
- **Egregious Runtime JavaScript Hack (Lines 10–18):**
  Instead of fixing source copy, this page loads client-side script to rewrite text after the DOM renders:
  ```html
  <script>
  document.addEventListener('DOMContentLoaded', () => {
    const replacements = [
      ['12-week program Review', '12-Week Program Review'],
      ['Renew 12-week program', 'Another 12-Week Program'],
      ['After 12-week program term', 'After 12-Week Program']
    ];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => replacements.forEach(([from, to]) => { 
      node.nodeValue = node.nodeValue.replaceAll(from, to); 
    }));
  });
  </script>
  ```
- **Typographical Error:** Line 53 contains: `"Which regular class timees were easiest to maintain?"` (`timees`).

##### 3. `src/class-rules.html`
- **Path:** [`src/class-rules.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/class-rules.html)
- **Size:** 6,882 bytes | **Word Count:** 517 words
- **Content:** Outlines "Five Safety Rules", "Partner Safety", "Respect and Behavior", and "Cleanliness and Health".
- **Redundancy:** Every single rule on this page is already stated in the "Safety Standards" section of [`/how-class-works`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html#safety) and the membership onboarding packet.

#### Stop-Slop & Linguistic Critique
- **Throat-Clearing & Preachiness:** `core-culture-parent-guide.html` indulges in philosophical lecturing (*"Your child does not need every hard moment removed. They need hard moments small enough to work through safely"*), repeating paragraphs that already appear in `/how-class-works` under *"Why We Teach This Way"*.
- **Em-Dashes and Double Negatives:** Abundant use of em-dashes and *"not only... but also"* constructions throughout parent guides.

#### Remediation Architecture
- **Consolidation:**
  - Merge the unique parental guidance elements of `core-culture-parent-guide.html` into `src/parent-resources.html`.
  - Retire `src/core-culture-parent-guide.html` and 301-redirect it to `/parent-resources`.
  - Retire `src/core-culture-review.html` and 301-redirect it to `/report-card`.
  - Retire `src/class-rules.html` and 301-redirect it to `/how-class-works#rules`.

---

### Cluster D: Safety Walkthroughs & Nervous First-Timer Splintering (3 Competing Pages)

#### Problem Summary
Beginner safety and first-class expectations are fractured across four competing pages:
1. `/how-class-works` (Canonical methodology & safety standards)
2. `/jiu-jitsu-safety-tannersville-ny` (A separate 22KB safety-only landing page)
3. `/nervous-first-timers` (A 5.5KB guide duplicating the 3-step intro cards)
4. `/show-up-kit` (A 19.6KB preparation checklist duplicating the booking confirmation)

```
        /how-class-works (Instructional Methodology Authority)
               ▲
               │ SPLINTERS SAFETY INTO SEPARATE PAGES:
    ┌──────────┴────────────────────────┬────────────────────────┐
    ▼                                   ▼                        ▼
/jiu-jitsu-safety...             /nervous-first-timers        /show-up-kit
(22.4KB - 987 words)             (5.5KB - 475 words)          (19.6KB - 856 words)
```

#### Detailed File Citations & Redundancy Evidence

##### 1. `src/jiu-jitsu-safety-tannersville-ny.html`
- **Path:** [`src/jiu-jitsu-safety-tannersville-ny.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/jiu-jitsu-safety-tannersville-ny.html)
- **H1:** *"Safe, Beginner-Friendly Jiu Jitsu in Tannersville NY"*
- **Canonical:** `https://senseisandy.com/jiu-jitsu-safety-tannersville-ny`
- **Redundancy:**
  - Re-states the 3-step first visit process (Tour $\rightarrow$ Safety walkthrough $\rightarrow$ First class plan).
  - Re-states the Clean Mat Policy verbatim from `/class-rules` and `/how-class-works`.
  - Re-states the "Sensei Bully Policy" and partner pairing standards from `/how-class-works`.
  - Dilutes search equity from `/how-class-works`, which is specifically designed to answer the query *"Is this safe and how does class run?"*

##### 2. `src/nervous-first-timers.html`
- **Path:** [`src/nervous-first-timers.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/nervous-first-timers.html)
- **H1:** *"A calm first class for first-timers"*
- **Canonical:** `https://senseisandy.com/nervous-first-timers`
- **Redundancy:** This page is an exact verbatim copy of the 3-card layout that previously cluttered `/bio`:
  - Card 1: *Meet the room and see where everything is.*
  - Card 2: *Learn the safety rules before any partner contact.*
  - Card 3: *Start slow with guided movement games.*
  It contains no unique information not already present on `/how-class-works` and `/free-bjj-intro-tannersville-ny`.

##### 3. `src/show-up-kit.html`
- **Path:** [`src/show-up-kit.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/show-up-kit.html)
- **H1:** *"Your First Visit, Then Your First Class"*
- **Canonical:** `https://senseisandy.com/show-up-kit`
- **Redundancy:** Competes with both `/free-bjj-intro-tannersville-ny` (the booking page) and `/how-class-works`. It walks through arrival, parking, clothing, waiver, and what happens when you step through the door. This content belongs either in the post-booking confirmation flow or as a section within `/how-class-works`.

#### Stop-Slop & Linguistic Critique
- **Formulaic Reassurance Slogans:** Heavy reliance on slogans like *"Calm beginner-friendly martial arts means more than a soft slogan"* repeated across three different files.
- **Binary Contrasts:** *"Not about fighting or proving yourself, but about learning how to move safely."*

#### Remediation Architecture
- **Consolidation:**
  - Strengthen `/how-class-works#safety` to be the undisputed single authority for class safety.
  - Redirect `/jiu-jitsu-safety-tannersville-ny` $\rightarrow$ `https://senseisandy.com/how-class-works#safety`.
  - Redirect `/nervous-first-timers` $\rightarrow$ `https://senseisandy.com/how-class-works`.
  - Keep `/show-up-kit` as a designated post-booking checklist utility (linking directly from Calendly confirmation/SMS), but strip any duplicate promotional sales copy so it does not compete with `/how-class-works`.

---

### Cluster E: Tactical & Law Enforcement Clone Twins (2 Near-Identical Pages)

#### Problem Summary
[`src/law-enforcement-bjj.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/law-enforcement-bjj.html) and [`src/tactical-longevity.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/tactical-longevity.html) are **near-identical 500+ line twin files**. 

In fact, `tactical-longevity.html` explicitly designates `law-enforcement-bjj` as its canonical URL in its frontmatter, yet exists as an independent, fully rendered 25KB page in `dist/`!

```
src/law-enforcement-bjj.html (29.4KB - 1,217 words)
        │
        ├── EXACT MIRROR CLONE (Layout, H1, H2s, Text, Pilot Framework)
        ▼
src/tactical-longevity.html  (25.0KB - 1,115 words)
canonicalUrl: "https://senseisandy.com/law-enforcement-bjj"  <── CONFLICT!
```

#### Detailed File Citations & Redundancy Evidence

| Attribute | `src/law-enforcement-bjj.html` | `src/tactical-longevity.html` |
| :--- | :--- | :--- |
| **File Size** | 29,371 bytes | 25,035 bytes |
| **H1 Heading** | *"Tactical Longevity for People Who Carry Responsibility"* | *"Tactical Longevity for People Who Carry Responsibility"* (Identical) |
| **Canonical URL** | `https://senseisandy.com/law-enforcement-bjj` | `https://senseisandy.com/law-enforcement-bjj` |
| **Layout Template** | `layouts/base.njk` (`page-partner page-tactical`) | `layouts/base.njk` (`page-partner page-tactical`) |
| **Core Sections** | Two Ways to Start, Foundations, Pilot Framework, Community Rate | Two Ways to Start, Foundations, Pilot Framework, Community Rate |
| **Testimonial** | Phillip Johansen, Veteran Practitioner | Phillip Johansen, Veteran Practitioner |

- **Verbatim Duplication Snippet (Both Files):**
  ```html
  <h1 class="hero-title display-5 fw-bold text-white mb-3">
    Tactical Longevity for People Who Carry Responsibility
  </h1>
  <p class="hero-subtitle lead text-white-50 mb-4">
    Brazilian Jiu-Jitsu for law enforcement, corrections, firefighters, EMS, 
    and first responders near Hunter and Windham.
  </p>
  ```
- **Only Difference:** `law-enforcement-bjj.html` includes an extra agency outreach form (`#coworker-referral`), while `tactical-longevity.html` is an unpruned earlier branch cut.

#### Stop-Slop & Linguistic Critique
- Pure copy duplication resulting in wasted build time, duplicate asset requests, and split indexing signals.

#### Remediation Architecture
- **Action:** **DELETE `src/tactical-longevity.html`.**
- Add 301 redirect in `.htaccess`:
  - `/tactical-longevity` $\rightarrow$ `https://senseisandy.com/law-enforcement-bjj`
- Single source of truth remains: `src/law-enforcement-bjj.html`.

---

### Cluster F: Hospitality Staff & Catskills Visitor Pass Duplication (7 Overlapping Pages)

#### Problem Summary
Seven separate pages cover hospitality partnerships, staff wellness passes, and guest referral kits for Catskills resorts. Three of these pages (`scribners.html`, `deer-mountain-inn.html`, and `phoenicia-diner.html`) are **programmatic find-and-replace duplicates** of the same underlying sales template.

Furthermore, conflicting pass pricing exists across files (some state $99 for 30 days, others declare request-based perks).

```
src/
├── scribners.html                           (22.3KB - $99 for 30 days)
│     ├── Cloned as: deer-mountain-inn.html  (20.7KB - $99 for 30 days)
│     └── Cloned as: phoenicia-diner.html    (20.6KB - $99 for 30 days)
├── scribners-staff-reset-pass.html          ( 4.1KB - unpriced variant)
├── scribners-thank-you.html                 ( 5.6KB - isolated confirmation)
├── scribners-jiu-jitsu.html                 (14.4KB - guest referral kit)
└── partners-hospitality-hunter-windham.html (14.3KB - canonical partner overview)
```

#### Detailed File Citations & Redundancy Evidence

##### 1. Boilerplate Hotel Cloning: `scribners.html` vs. `deer-mountain-inn.html` vs. `phoenicia-diner.html`
- **Evidence:** Comparing the hero and card blocks across all three files:
  - `scribners.html` (Lines 579–580):  
    `<h2>$99 for your first 30 days</h2>`  
    `<h2>$600 for 12 weeks</h2>`  
    `Built for Scribner’s team members who want a healthy reset.`
  - `deer-mountain-inn.html` (Lines 652–655):  
    `<h2>$99 for your first 30 days</h2>`  
    `<h2>$600 for 12 weeks</h2>`  
    `Built for Deer Mountain Inn team members who want a healthy reset.`
  - `phoenicia-diner.html` (Lines 673–676):  
    `<h2>$99 for your first 30 days</h2>`  
    `<h2>$600 for 12 weeks</h2>`  
    `Built for Phoenicia Diner team members who want a healthy reset.`
- **Volatile Operational Facts Violation:** Hardcoding `$99` and `$600` inside three static editorial pages violates the rule against embedding pricing outside `/options-pricing`.
- **Duplicate Styles:** Each file declares identical inline styles and classes (`ss-scribners-page`, `ss-deer-mountain-inn-page`, `ss-phoenicia-diner-page`) repeating the same CSS definitions.

##### 2. `scribners.html` vs. `scribners-staff-reset-pass.html`
- `scribners-staff-reset-pass.html` is a stripped-down 4KB version of `scribners.html` with no pricing, creating internal conflict over which URL Scribner’s employees should visit.

#### Stop-Slop & Linguistic Critique
- **Mechanical Entity Replacement:** The text was generated once and duplicated with string replacement of partner names, violating quality guidelines for unique, high-intent web content.
- **Fragmented Authority:** Catskills resort guests and staff are presented with fragmented entry points instead of a clear, coherent partner program.

#### Remediation Architecture
- **Consolidation:**
  - Keep [`/partners-hospitality-hunter-windham`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partners-hospitality-hunter-windham.html) as the primary B2B hospitality partner landing page.
  - Consolidate hotel staff reset passes into a single dynamic template or unified pass landing page (`/hospitality-reset-pass?partner=scribners`), or maintain only Scribner's as the pilot partner and redirect unlaunched clones (`deer-mountain-inn`, `phoenicia-diner`) until formal commercial agreements exist.
  - 301 Redirect `scribners-staff-reset-pass.html` $\rightarrow$ `/scribners`.

---

### Cluster G: Monolithic Hubs, Hardcoded Tuition & Abandoned Redirect Stubs (6 Miscellaneous Redundancies)

#### Problem Summary
This cluster contains high-risk pages that violate core site rules, duplicate existing pricing hubs, or represent abandoned developer prototypes.

```
src/
├── programs.html               (17.3KB - Monolithic directory competing with Homepage)
├── annual-track.html           ( 8.3KB - Hardcoded tuition violating volatile facts)
├── samurai-break.html          ( 7.5KB - 428-word generic essay with 0 CTAs)
├── reviews-village.html        (13.5KB - noindex script fragment duplicating /success-stories)
├── clean.html                  ( 1.8KB - Orphaned developer test page using error.njk)
├── videos.html & bjj-videos.html (Duplicate blank shells with client-side JS redirects to /)
└── .vscode/curriculum/index.html (Rogue redirect to 404 URL in .vscode)
```

#### Detailed File Citations & Redundancy Evidence

##### 1. `src/programs.html`
- **Path:** [`src/programs.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/programs.html) (17.3KB, 1,216 words)
- **H1:** *"One Family. One Training Ground. Programs for Kids, Teens, and Adults in Tannersville."*
- **The Redundancy:** Competes directly with the Homepage (`src/index.html`). The Homepage's singular job is: *"Which first class fits me?"* `programs.html` repeats this exact directory function, listing Kids, Teens, Adults, Law Enforcement, Private Lessons, Visitor Passes, and Birthday Parties in a giant competing index.
- **AGENTS.md Violation:** *"Avoid: Private lessons competing with Kids, Teens, and Adults as the first user choice."* (Line 715 lists Private Lessons alongside core programs).

##### 2. `src/annual-track.html`
- **Path:** [`src/annual-track.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/annual-track.html) (8.3KB, 436 words)
- **H1:** *"Annual Track"*
- **Severe Volatile Facts & QA Violations:**
  - **Hardcoded Tuition (Line 23):**  
    `Youth $2,100 · Adult $2,650 · Community-Service $2,250`
  - **Hardcoded Term Pricing (Line 117):**  
    `Youth $550 / Adult $715`
  - **Mechanical Typo (Lines 18 & 43):**  
    `"three recurring regular class timees per week"` (`timees`)  
    `"Lock in your regular class timees"` (`timees`)
  - **Broken Target Link (Line 31):**  
    `<a class="btn btn-primary btn-lg" href="/core-culture-review">See the 12-Week Program Review</a>`  
    *(Links directly to the broken tree-walker script page).*
- **The Redundancy:** [`/options-pricing`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html) already has a dedicated "Annual Track" tier explanation. Having a separate standalone page with hardcoded prices creates high desynchronization risk whenever academy rates adjust.

##### 3. `src/samurai-break.html`
- **Path:** [`src/samurai-break.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/samurai-break.html) (7.5KB, 428 words)
- **H1:** *"Samurai Break: Quiet Power Time-Out"*
- **The Redundancy & Policy Violations:**
  - **Zero CTAs:** The page contains no links to booking, no phone number, no link to `/schedule`, and no link to youth classes.
  - **Generic Martial Arts Tropes:** Directly violates `AGENTS.md` (*"Avoid: Generic martial arts copy"*). Uses repetitive tropes: *"Samurai spine"*, *"quiet Samurai"*, *"Samurai breathing"*, *"Samurai focus"*.
  - **Truncated Metadata:** Description cuts off mid-sentence:  
    `"Simple breathing, posture, and focus skills.  Train with."`

##### 4. `src/reviews-village.html`
- **Path:** [`src/reviews-village.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/reviews-village.html) (13.5KB)
- **Frontmatter:** `robots: "noindex, follow"`, `canonicalUrl: "/reviews-village"`.
- **The Redundancy:** Contains no H1 heading. Contains 250+ lines of client-side JavaScript that renders review cards dynamically. It completely duplicates the job of [`src/success-stories.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html) (the canonical reviews authority).

##### 5. `src/clean.html`
- **Path:** [`src/clean.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/clean.html) (1.8KB)
- **Frontmatter:** `layout: layouts/error.njk`, `title: "Clean Lane | Sensei Sandy BJJ"`, `canonicalUrl: ""`.
- **The Redundancy:** An abandoned prototype using the error layout that renders a generic test hero into `dist/clean.html`.

##### 6. `src/videos.html` & `src/bjj-videos.html`
- **Paths:** [`src/videos.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/videos.html) & [`src/bjj-videos.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-videos.html)
- **Defect:** Both files wrap an entire nested `<html lang="en">` document inside `layout: layouts/base.njk`, resulting in invalid HTML syntax, and execute an immediate client-side redirect:
  ```html
  <script>window.location.href = "/";</script>
  ```
- Compiles into production build rather than relying on HTTP-level 301 redirects in `.htaccess`.

##### 7. `src/.vscode/curriculum/index.html`
- **Path:** [`src/.vscode/curriculum/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/.vscode/curriculum/index.html)
- **Defect:** A rogue file placed inside `src/.vscode/`. Because it is under `src/`, Eleventy processes it into `dist/.vscode/curriculum/index.html`. It contains a `<script>window.location.href = '/curriculum.html';</script>`, which redirects users to a **non-existent 404 URL** (`/curriculum.html` does not exist).

---

## 3. Global Stop-Slop & Linguistic Pattern Analysis

Our scan through the lens of the `stop-slop` skill and `qa-stop-slop.mjs` revealed several systematic editorial flaws recurring across the redundant pages:

### 3.1 Mechanical Find-and-Replace Residue
When terms were updated across the codebase, global find-and-replace passes created syntactic errors:
1. `"Free First Visitduction"` (found in `src/back-to-school-bjj-tannersville/index.html` line 31, caused by replacing `Intro` $\rightarrow$ `Free First Visit` within `Introduction`).
2. `"12-week program Parent Guide"` (found in `src/core-culture-parent-guide.html` line 3, caused by replacing `Core` $\rightarrow$ `12-week program`).
3. `"regular class timees"` (found in `src/annual-track.html` lines 18 & 43, caused by replacing `slot` or `time` $\rightarrow$ `regular class time`).
4. `"make-up class: Request replacement classes"` (found in `src/annual-track.html` line 92).

### 3.2 Throat-Clearing Openers & Slogan Fatigue
Redundant pages frequently spend 2–3 paragraphs clearing their throat before providing useful information:
- *"Starting Jiu-Jitsu for the first time can feel overwhelming..."*
- *"School schedules change. Kids still need a place to move..."*
- *"Calm beginner-friendly martial arts means more than a soft slogan..."*

On a high-converting local site, these phrases waste user attention. The canonical pages (`/how-class-works`, `/bjj-classes/*`) state the facts directly.

### 3.3 Binary Contrasts & False Drama
The redundant pages heavily rely on "not this, but that" contrast constructions:
- *"It’s not wild energy, it’s structured composure."*
- *"Not about fighting, but about safe problem-solving."*
- *"Not just a workout, but physical chess."*

`stop-slop` guidelines advise eliminating binary contrasts: state what something *is* without framing it against a hypothetical strawman.

### 3.4 Em-Dash Overuse
The codebase contains over 135 em-dashes (`—`), particularly in card headers and meta descriptions. Replacing em-dashes with clean periods, commas, or parentheses makes prose punchier and prevents typical AI-assisted cadence.

---

## 4. Master Remediation Plan & 301 Redirect Architecture

To restore a clean, high-authority information architecture, all 28 identified problematic files should be pruned or consolidated according to the master routing table below.

### 4.1 Master Routing & Remediation Table

| Source File Path in `src/` | Current URL | Action | Target Destination URL | Reason |
| :--- | :--- | :--- | :--- | :--- |
| `core-promise-full.html` | `/core-promise-full` | **Prune & Redirect** | `/how-class-works` | Orphaned SSI stub |
| `core-promise-short.html` | `/core-promise-short` | **Prune & Redirect** | `/how-class-works` | Orphaned SSI stub |
| `my-promise-full.html` | `/my-promise-full` | **Prune & Redirect** | `/how-class-works` | Blank metadata orphan |
| `my-promise-short.html` | `/my-promise-short` | **Prune & Redirect** | `/how-class-works` | Blank metadata orphan |
| `safety-promise.html` | `/safety-promise` | **Prune & Redirect** | `/how-class-works#safety` | Blank metadata orphan |
| `after-booking-promise.html` | `/after-booking-promise` | **Prune & Redirect** | `/free-bjj-intro-tannersville-ny` | Orphaned booking stub |
| `after-school.html` | `/after-school` | **Consolidate & Redirect** | `/bjj-classes/kids-tannersville-ny` | Cannibalizes Kids program |
| `school-families-jiu-jitsu.html` | `/school-families-jiu-jitsu` | **Consolidate & Redirect** | `/bjj-classes/kids-tannersville-ny` | Cannibalizes Kids program |
| `fall-practice-reset.html` | `/fall-practice-reset` | **Prune & Redirect** | `/bjj-classes/kids-tannersville-ny` | Expired campaign & hardcoded rates |
| `back-to-school-bjj-tannersville/index.html` | `/back-to-school-bjj-tannersville` | **Prune & Redirect** | `/bjj-classes/kids-tannersville-ny` | Corrupted copy & expired dates |
| `core-culture-parent-guide.html` | `/core-culture-parent-guide` | **Merge & Redirect** | `/parent-resources` | Duplicate parent guide |
| `core-culture-review.html` | `/core-culture-review` | **Prune & Redirect** | `/report-card` | JS tree-walker slop |
| `class-rules.html` | `/class-rules` | **Merge & Redirect** | `/how-class-works#rules` | Duplicate rule listing |
| `jiu-jitsu-safety-tannersville-ny.html` | `/jiu-jitsu-safety-tannersville-ny` | **Consolidate & Redirect** | `/how-class-works#safety` | Splinters safety authority |
| `nervous-first-timers.html` | `/nervous-first-timers` | **Prune & Redirect** | `/how-class-works` | Duplicate 3-card layout |
| `tactical-longevity.html` | `/tactical-longevity` | **Delete & Redirect** | `/law-enforcement-bjj` | 100% clone twin |
| `scribners-staff-reset-pass.html` | `/scribners-staff-reset-pass` | **Consolidate & Redirect** | `/scribners` | Duplicate employee pass |
| `scribners-thank-you.html` | `/scribners-thank-you` | **Retain or Embed** | Internal Flow | Clean up inline styling |
| `deer-mountain-inn.html` | `/deer-mountain-inn` | **Review / Redirect** | `/partners-hospitality-hunter-windham` | Unlaunched hotel clone |
| `phoenicia-diner.html` | `/phoenicia-diner` | **Review / Redirect** | `/partners-hospitality-hunter-windham` | Unlaunched restaurant clone |
| `programs.html` | `/programs` | **Refocus or Redirect** | `/` | Monolith competing with Home |
| `annual-track.html` | `/annual-track` | **Consolidate & Redirect** | `/options-pricing#annual-track` | Hardcoded volatile facts & typos |
| `samurai-break.html` | `/samurai-break` | **Prune & Redirect** | `/parent-resources` | Generic martial arts copy, 0 CTAs |
| `reviews-village.html` | `/reviews-village` | **Delete** | `/success-stories` | Noindex script-heavy fragment |
| `clean.html` | `/clean` | **Delete** | 410 Gone / None | Abandoned test stub |
| `videos.html` | `/videos` | **Replace with 301** | `/` | Blank shell with JS redirect |
| `bjj-videos.html` | `/bjj-videos` | **Replace with 301** | `/` | Blank shell with JS redirect |
| `.vscode/curriculum/index.html` | `/.vscode/curriculum/` | **Delete immediately** | None | Rogue build leak to 404 URL |

---

## 5. Phased Execution Checklist

### Phase 1: Dead Stub Removal & Rogue File Cleanup
- [ ] Delete `src/.vscode/curriculum/index.html` from repository.
- [ ] Delete orphaned test stubs: `src/clean.html`, `src/videos.html`, `src/bjj-videos.html`, and `src/reviews-village.html`.
- [ ] Delete the 6 SSI orphan promise stubs (`src/core-promise-full.html`, `src/core-promise-short.html`, `src/my-promise-full.html`, `src/my-promise-short.html`, `src/safety-promise.html`, `src/after-booking-promise.html`).
- [ ] Add corresponding 301 redirects to `.htaccess` and run `npm run qa:redirects`.

### Phase 2: Resolving Twin Clones & Direct Duplicates
- [ ] Delete `src/tactical-longevity.html` and verify `src/law-enforcement-bjj.html` remains the sole canonical authority.
- [ ] Delete `src/scribners-staff-reset-pass.html` and consolidate any missing details into `src/scribners.html`.
- [ ] Add 301 redirect for `/tactical-longevity` $\rightarrow$ `/law-enforcement-bjj`.

### Phase 3: Youth Funnel & Parent Resource Consolidation
- [ ] Verify that [`/bjj-classes/kids-tannersville-ny`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-classes/kids-tannersville-ny/index.html) has a clean, evergreen "After-School Routine & Mounting Confidence" section with no hardcoded calendar dates.
- [ ] Delete `src/after-school.html`, `src/school-families-jiu-jitsu.html`, `src/fall-practice-reset.html`, and `src/back-to-school-bjj-tannersville/index.html`.
- [ ] Add 301 redirects to `/bjj-classes/kids-tannersville-ny`.
- [ ] Consolidate unique behavioral guidance from `core-culture-parent-guide.html` into `parent-resources.html`. Delete `core-culture-parent-guide.html` and redirect.
- [ ] Delete `core-culture-review.html` and redirect to `/report-card`.

### Phase 4: Safety & Pricing Integrity
- [ ] Ensure [`/how-class-works`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html) contains the complete safety guarantee and rule set.
- [ ] Delete `src/jiu-jitsu-safety-tannersville-ny.html`, `src/nervous-first-timers.html`, and `src/class-rules.html`, pointing their 301 redirects to `/how-class-works`.
- [ ] Confirm [`/options-pricing`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html) is the sole authority on the Annual Track. Delete `src/annual-track.html` and 301-redirect to `/options-pricing`.
- [ ] Run `npm run qa:volatile-facts` to verify zero hardcoded prices or dates remain.

---
<!-- GOAL_COMPLETE -->
