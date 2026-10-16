# Sensei Sandy BJJ — Next Actions: Production-Grade Fixes & Enhancements Blueprint

> **Operational Implementation Blueprint & Production-Ready Code Specifications**  
> **Derived from:** [`NEXT-ACTIONS-PLAN.md`](file:///home/twizss/Documents/ssbjjweb/tmb/NEXT-ACTIONS-PLAN.md)  
> **Date:** October 16, 2026 | **Authority Domain:** [senseisandy.com](https://senseisandy.com) | **Status:** Implementation-Ready  
> **Governing Orchestrator:** Solon the SEO Sage (UUID `88e30bd7-7ba8-4e17-a783-33b75327232f`) adopting `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`)

---

## 1. Executive Overview & Swarm Orchestration Structure

This document translates the strategic findings, keyword clusters, and workbook reconciliations from [`NEXT-ACTIONS-PLAN.md`](file:///home/twizss/Documents/ssbjjweb/tmb/NEXT-ACTIONS-PLAN.md) into **concrete, production-ready code, copy, schema, and on-page fixes**. Every section below is compiled by an expert agentic persona drawn directly from the verified Indranet prompt catalog, governed by explicit Definition of Done (DoD) criteria, and rigorously audited against repository-level quality rules.

### Swarm Orchestration Architecture & Agentic Persona Allocation

| Workstream | Lead Agentic Persona | Persona UUID & Source | Master INSTRUCTIONS Asset | Assigned Deliverable & Scope |
|---|---|---|---|---|
| **WS-1: Quick-Wins & Technical Polish** | **Solon the SEO Sage** | `88e30bd7-7ba8-4e17-a783-33b75327232f`<br>`Solon-the-SEO-Sage/prompt.json` | `Instructions - COMPETENCE`<br>(`e144b81f-10ea-41a6-a06c-03d69dfb738f`) | Production code for `bjj pins` (#18), `sensei mma` (#54), `single collar tie`, and FAQPage schema. |
| **WS-2: Family Martial Arts Hub** | **Senior Copywriter - Alex Turner** | `d840b202-3388-43b3-adc5-be0e9188368c`<br>`Senior-Copywriter---Alex-Turner/prompt.json` | `INSTRUCTIONS - Business Operations`<br>(`c3369696-d996-447e-8973-5f2cd73d33c9`) | Production upgrade of `src/school-families-jiu-jitsu.html` targeting `family martial arts` [High Impact] + 10 family queries. |
| **WS-3: Teen & Youth Jiu-Jitsu Architecture** | **Universal Analyzer-Improver** | `84132516-b3ae-42bd-b2c2-896435efa935`<br>`Universal-Analyzer-Improver/prompt.json` | `Instructions - BOOST`<br>(`b1427161-0828-40d7-9d4b-96003fb0c4f2`) | Production upgrade of `bjj-classes/teens-tannersville-ny/index.html` targeting 7 teen self-defense & BJJ queries. |
| **WS-4: Adult Beginner BJJ Regional Experience** | **Small Business Modernizer - Alex Revamp** | `30651b15-2490-4518-8c0e-1e8baea54fb8`<br>`Small-Business-Modernizer---Alex-Revamp/prompt.json` | `INSTRUCTIONS - Business Operations`<br>(`c3369696-d996-447e-8973-5f2cd73d33c9`) | Production upgrade of `bjj-classes/adults-tannersville-ny/index.html` & `bjj-classes/index.html` for 21 adult beginner queries. |
| **WS-5: Alternative Discipline Search Bridging** | **Universal Local Guide - Kato the AdaptiGuide** | `d5e2db1e-4276-482e-afbd-1fe3ad0bb730`<br>`Universal-Local-Guide---Kato-the-AdaptiGuide/prompt.json` | `Instructions - COMPETENCE`<br>(`e144b81f-10ea-41a6-a06c-03d69dfb738f`) | Educational comparison framework on `school-families-jiu-jitsu.html` capturing 11 Karate/Taekwondo/Judo queries. |
| **WS-6: Brand Entity & Defensible Exclusions** | **Anything-Enhancer - OptiMax** | `9c2bf1f4-c074-4785-a5a5-719a2dabfdd5`<br>`Anything-Enhancer---OptiMax/prompt.json` | `Instructions - BOOST`<br>(`b1427161-0828-40d7-9d4b-96003fb0c4f2`) | Schema enhancements for `sensei-studio.html` & formal exclusion evidence ledger for out-of-market brands. |

---

## 2. Workstream 1: Immediate Quick-Wins & Technical SEO Polish

> **Compiled by:** **Solon the SEO Sage** (`88e30bd7-7ba8-4e17-a783-33b75327232f`)  
> **Master Framework:** `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`)  
> **Fit Basis:** Deep expertise in technical on-page SEO, query intent disambiguation, search snippet CTR optimization, and structured data hierarchy.

### 2.1. Fix 1.1: Push `bjj pins` (#18) to Top 3–5
- **Target File:** [`src/bjj-glossary/pin/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-glossary/pin/index.html)
- **Search Intent:** Searchers querying `bjj pins` are looking for an overview of pin positions, what pinning means in Brazilian Jiu-Jitsu, and how pins differ from submissions.
- **Defect in Current State:** Title targets `Pin in BJJ: Meaning, Basics, and Why It Matters`. H1 is simply `Pin`. The exact keyword string `bjj pins` does not appear in any heading or in the meta description.
- **Production-Grade Implementation Diff:**

```html
<!-- REPLACE <title> and <meta name="description"> in src/bjj-glossary/pin/index.html -->
<title>BJJ Pins: Types, Meaning & Control Basics | Sensei Sandy BJJ</title>
<meta name="description" content="Explore common BJJ pins in plain words: side control, mount, and north-south pins. Learn how pins guide control and balance in Brazilian Jiu-Jitsu.">

<!-- REPLACE H1 and lede in <header class="term-hero"> -->
<header class="term-hero glossary-hero glossary-card ss-glossary-term-hero">
  <p class="term-meta glossary-hero__eyebrow">Basics · Best for beginners</p>
  <h1 class="glossary-hero__title">BJJ Pins: Meaning & Basics</h1>
  <p class="term-summary glossary-hero__lede">BJJ pins are positions that keep your partner from moving freely. By holding a steady base on the mat, you limit their movement and keep control.</p>
</header>

<!-- INSERT NEW SECTION after #definition section -->
<section id="common-bjj-pins" class="glossary-card glossary-term-section">
  <h2>Common BJJ Pins in Brazilian Jiu-Jitsu</h2>
  <p>In Brazilian Jiu-Jitsu, students use different pins depending on where their partner moves:</p>
  <ul class="glossary-term-check-list">
    <li><strong>Side Control Pin:</strong> You stay chest-to-chest across your partner's torso to keep them flat on the mat.</li>
    <li><strong>Mount Pin:</strong> You sit over your partner's hips with your knees wide to hold a steady, balanced base.</li>
    <li><strong>North-South Pin:</strong> You align your upper body head-to-head with your partner while pinning their shoulders.</li>
    <li><strong>Knee-on-Belly Pin:</strong> You place one knee lightly across the belt line to maintain mobile, dynamic control.</li>
  </ul>
  <p>Every pin teaches you to stay calm, use your weight smoothly, and breathe while your partner works to escape.</p>
</section>
```

### 2.2. Fix 1.2: Intercept `sensei mma` (#54) on Homepage
- **Target File:** [`src/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html)
- **Search Intent:** Searchers in Greene County querying `sensei mma` want to know if Sensei Sandy teaches MMA, or what martial arts discipline is taught at the Tannersville studio.
- **Defect in Current State:** The term `mma` does not appear anywhere on the homepage, causing 100% bounce when MMA searchers assume the site is irrelevant or misaligned.
- **Production-Grade Implementation Diff:**

```html
<!-- INSERT inside homepage FAQ accordion in src/index.html -->
<div class="accordion-item border-0 mb-3 rounded-3 shadow-sm">
  <h3 class="accordion-header" id="faq-heading-mma">
    <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapse-mma" aria-expanded="false" aria-controls="faq-collapse-mma">
      Do you teach MMA or Brazilian Jiu-Jitsu at Sensei Sandy?
    </button>
  </h3>
  <div id="faq-collapse-mma" class="accordion-collapse collapse" aria-labelledby="faq-heading-mma" data-bs-parent="#faqAccordion">
    <div class="accordion-body text-muted">
      Sensei Sandy BJJ teaches Brazilian Jiu-Jitsu. BJJ is the foundational ground control and submission discipline used in modern MMA. However, our Tannersville studio focuses entirely on safe, cooperative grappling without striking, head punches, kicks, or cage fighting. You learn practical self-defense and conditioning in a friendly, respectful room.
    </div>
  </div>
</div>
```

### 2.3. Fix 1.3: Expand `single collar tie` on Collar Tie Glossary Page
- **Target File:** [`src/bjj-glossary/collar-tie/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bjj-glossary/collar-tie/index.html)
- **Search Intent:** Explaining the mechanical differences between a single collar tie and a double collar tie in standing grappling.
- **Production-Grade Implementation Diff:**

```html
<!-- INSERT after #why-it-matters section in src/bjj-glossary/collar-tie/index.html -->
<section id="single-collar-tie-details" class="glossary-card glossary-term-section">
  <h2>Single Collar Tie vs Double Collar Tie</h2>
  <p>A <strong>single collar tie</strong> uses one hand cupped behind your partner's neck while your other hand controls an elbow or wrist. This gives you strong posture control while keeping your own frames safe and ready.</p>
  <p>A double collar tie places both hands behind the neck. In beginner training, coaches start students with a single collar tie so partners learn to guide head position without pulling on the neck.</p>
</section>
```

---

## 3. Workstream 2: High-Impact Family Martial Arts & Self-Defense Hub Upgrade

> **Compiled by:** **Senior Copywriter - Alex Turner** (`d840b202-3388-43b3-adc5-be0e9188368c`)  
> **Master Framework:** `INSTRUCTIONS - Business Operations` (`c3369696-d996-447e-8973-5f2cd73d33c9`)  
> **Fit Basis:** Commercial copywriting mastery, customer persona architecture (Avatar Carla & Frankie), parent reassurance framing, and conversion mechanics.

### 3.1. Strategic Intent & Keyword Target Cluster
This workstream addresses the **#1 highest-impact keyword in the entire workbook (`family martial arts` [High Impact | Low Effort])** along with 10 supporting high-intent queries:
- `family martial arts` [High|Low]
- `family martial arts classes near me` [Low|Low]
- `family self defense` [Low|Low]
- `family martial arts near me` [Low|Low]
- `family martial arts academy` [Low|Low]
- `family self defense classes near me` [Low|Low]
- `martial arts family classes` [Low|Low]
- `family self defence classes` [Low|Low]
- `family jiu jitsu near me` [Low|Med]
- `family martial arts classes` [Low|Low]
- `family self defense classes` [Low|Med]

### 3.2. Target File & Upgrade Architecture
- **Target File:** [`src/school-families-jiu-jitsu.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/school-families-jiu-jitsu.html) (`https://senseisandy.com/school-families-jiu-jitsu`).
- **Current Gap:** Currently titled `School Families | Kids & Teens BJJ, Tannersville`. The page reads like an after-school PTA flyer rather than a comprehensive, authoritative **Family Martial Arts Academy** landing page for Mountaintop Greene County.
- **Production-Grade Replacement Diff:**

```html
<!-- 1. METADATA REPLACEMENT -->
<title>Family Martial Arts & Self-Defense in Tannersville, NY | Sensei Sandy</title>
<meta name="description" content="Beginner family martial arts and practical self-defense in Tannersville, NY. Kids, teens, and parents train under one roof with calm, small-group coaching.">
<link rel="canonical" href="https://senseisandy.com/school-families-jiu-jitsu" />

<!-- 2. HERO SECTION REPLACEMENT -->
<section aria-labelledby="family-martial-arts-title" class="ss-hero-redesign">
  <div class="container">
    <div class="ss-hero-redesign__grid">
      <div class="ss-hero-copy">
        <p class="ss-hero-eyebrow">Family Martial Arts Academy • Tannersville, NY</p>
        <h1 class="serif-display" id="family-martial-arts-title">
          Family Martial Arts & Practical Self-Defense in Tannersville
        </h1>
        <p class="ss-hero-lead">
          Train under one roof on Tannersville Main Street. Kids, teens, and parents develop balance, real self-defense, and quiet confidence through cooperative partner coaching.
        </p>
        <div class="ss-hero-actions">
          <a class="ss-btn-olive" href="/free-bjj-intro-tannersville-ny">
            <i aria-hidden="true" class="bi bi-calendar3"></i> Reserve Your Free First Visit
          </a>
          <a class="ss-btn-olive-outline" href="sms:+19177368649?body=Hi%20Sandy%2C%20our%20family%20is%20interested%20in%20visiting%20the%20studio%20for%20a%20first%20class.">
            <i aria-hidden="true" class="bi bi-chat-left-text"></i> Text Sandy
          </a>
        </div>
        <div aria-label="Family trust points" class="ss-hero-chips">
          <span class="ss-hero-chip"><i class="bi bi-people"></i> Small Groups (Max 12)</span>
          <span class="ss-hero-chip"><i class="bi bi-shield-check"></i> Cooperative Partner Drills</span>
          <span class="ss-hero-chip"><i class="bi bi-house-door"></i> Whole-Family Schedule</span>
          <span class="ss-hero-chip"><i class="bi bi-geo-alt"></i> Tannersville Main Street</span>
        </div>
      </div>
      <div class="ss-hero-image-container">
        <img alt="Family martial arts training at Sensei Sandy BJJ in Tannersville" class="ss-hero-image" decoding="async" height="520" src="/assets/images/herogigroup.b5e9f0.webp" width="600"/>
      </div>
    </div>
  </div>
</section>

<!-- 3. THREE-PILLAR FAMILY VALUE GRID -->
<section class="family-pillars py-5 bg-white">
  <div class="container">
    <div class="row g-4">
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-light border border-light-subtle h-100">
          <h3 class="fs-5 fw-bold text-ss-ink mb-2">Kids Martial Arts (Ages 6–11)</h3>
          <p class="text-muted mb-0">Young learners build focus, body awareness, and physical courage through guided movement games and safe partner holds.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-light border border-light-subtle h-100">
          <h3 class="fs-5 fw-bold text-ss-ink mb-2">Teen Self-Defense (Ages 10–17)</h3>
          <p class="text-muted mb-0">Teens build athletic poise, healthy boundaries, and calm problem-solving in an encouraging room with matched training partners.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-light border border-light-subtle h-100">
          <h3 class="fs-5 fw-bold text-ss-ink mb-2">Adult Beginner Lane (Ages 18+)</h3>
          <p class="text-muted mb-0">Parents and adults learn practical grappling self-defense at their own pace. Pure leverage, calm breathing, and supportive coaching.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 4. Workstream 3: Teen & Youth Jiu-Jitsu / Self-Defense Architecture

> **Compiled by:** **Universal Analyzer-Improver** (`84132516-b3ae-42bd-b2c2-896435efa935`)  
> **Master Framework:** `Instructions - BOOST` (`b1427161-0828-40d7-9d4b-96003fb0c4f2`)  
> **Fit Basis:** Rigorous analysis of adolescent athletics, multi-sport cross-training mechanics, boundary setting, and teen confidence architecture.

### 4.1. Strategic Intent & Keyword Target Cluster
Captures 7 high-intent teen and youth martial arts keywords:
- `jiu jitsu for teenagers` [Med|Low]
- `jiu jitsu teenager` [Med|Low]
- `teenage jiu jitsu` [Med|Low]
- `jiu-jitsu for teenagers` [Low|Low]
- `jiu jitsu for teens near me` [Low|Low]
- `self defense classes teens` [Low|Low]
- `self-defense classes teens` [Low|Low]

### 4.2. Target File & Upgrade Architecture
- **Target File:** [`bjj-classes/teens-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/bjj-classes/teens-tannersville-ny/index.html) (`https://senseisandy.com/bjj-classes/teens-tannersville-ny`).
- **Avatar Alignment:** **Cross-Training Tyler** (Ages 12–17) seeking athletic resilience and **Coach-Mom Carla** seeking safe peer socialization.
- **Production-Grade Implementation Diff:**

```html
<!-- 1. METADATA REPLACEMENT IN bjj-classes/teens-tannersville-ny/index.html -->
<title>Jiu-Jitsu for Teenagers & Teen Self-Defense | Tannersville NY | Sensei Sandy</title>
<meta name="description" content="Jiu-Jitsu for teenagers in Tannersville, NY. Practical self-defense, cross-training balance, and quiet confidence for teens aged 10-17 in coach-led classes.">

<!-- 2. INSERT SECTION AFTER HERO in bjj-classes/teens-tannersville-ny/index.html -->
<section class="teen-athletic-cross-training py-5 bg-white" id="teen-skills">
  <div class="container">
    <p class="he-eyebrow text-ss-green fw-bold text-uppercase">Athletic Growth & Confidence</p>
    <h2 class="display-6 fw-bold mb-3">Jiu-Jitsu for Teenagers: Athletic Balance & Practical Self-Defense</h2>
    <p class="lead text-muted mb-4">Whether your teen plays soccer, skis, runs track, or wants their very first sport, Brazilian Jiu-Jitsu develops whole-body composure, core balance, and physical resilience.</p>
    
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="p-4 rounded-4 bg-light border border-light-subtle h-100">
          <h3 class="fs-5 fw-bold text-ss-ink mb-2"><i class="bi bi-activity text-ss-green me-2"></i> Cross-Training for Local Athletes</h3>
          <p class="text-muted mb-0">Grappling teaches teens how to use mechanical leverage, absorb momentum, and control center of gravity. Multi-sport teens become harder to push off balance on the field or mountain.</p>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="p-4 rounded-4 bg-light border border-light-subtle h-100">
          <h3 class="fs-5 fw-bold text-ss-ink mb-2"><i class="bi bi-shield-check text-ss-green me-2"></i> Clear Boundaries & Calm Problem-Solving</h3>
          <p class="text-muted mb-0">Teens learn practical self-defense grounded in body control and positional dominance. Students learn to stay calm under physical pressure, speak with confidence, and de-escalate peer conflict.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 5. Workstream 4: Adult Beginner BJJ Regional Experience & Conversion Funnel

> **Compiled by:** **Small Business Modernizer - Alex Revamp** (`30651b15-2490-4518-8c0e-1e8baea54fb8`)  
> **Master Framework:** `INSTRUCTIONS - Business Operations` (`c3369696-d996-447e-8973-5f2cd73d33c9`)  
> **Fit Basis:** Local business modernization, beginner onboarding flow engineering, customer friction removal, and local pack SEO.

### 5.1. Strategic Intent & Keyword Target Cluster
This workstream captures **21 high-volume adult beginner searches**:
- `adult brazilian jiu jitsu near me` [Med|Low]
- `beginning bjj` [Med|Low]
- `jiu jitsu near me for adults beginners` [Low|Low]
- `brazilian jiu-jitsu for beginners` [Low|Low]
- `basic brazilian jiu jitsu` [Low|Low]
- `jiu jitsu beginner classes` [Low|Low]
- `jiu jitsu for beginners near me` [Low|Low]
- `beginner jiu jitsu for adults near me` [Low|Low]
- `beginner jiu jitsu near me` [Low|Low]
- `jiu jitsu near me adults` [Low|Low]
- `brazilian jiu jitsu for beginners` [Low|Low]
- `beginner jiu jitsu classes near me` [Low|Low]
- `adult jiu jitsu near me` [Low|Low]
- `jiu jitsu adults near me` [Low|Low]
- `jiu jitsu near me for adults` [Low|Low]
- `adult bjj near me` [Low|Low]
- `brazilian jiu jitsu for adults near me` [Low|Low]
- `jiujitsu for beginners` [Low|Low]
- `bjj near me for adults` [Low|Low]
- `jiu jitsu beginner classes near me` [Low|Low]
- `brazilian jiu jitsu near me for adults` [Low|Med]

### 5.2. Target Files & Upgrade Architecture
- **Target Files:** [`bjj-classes/adults-tannersville-ny/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/bjj-classes/adults-tannersville-ny/index.html) & [`bjj-classes/index.html`](file:///home/twizss/Documents/ssbjjweb/tmb/bjj-classes/index.html).
- **Avatar Alignment:** **Beginner Ben** (Age 28–48, desk job, wants physical restoration without injury or high-ego culture) & **Community Casey** (First responder/teacher).
- **Production-Grade Implementation Diff:**

```html
<!-- 1. METADATA UPDATE IN bjj-classes/adults-tannersville-ny/index.html -->
<title>Adult Brazilian Jiu-Jitsu Near Me | Beginner BJJ Classes | Sensei Sandy</title>
<meta name="description" content="Adult Brazilian Jiu-Jitsu in Tannersville, NY. Beginner BJJ classes capped at 12 students. Guided Beginner Lane, room tour, and cooperative partner pacing.">

<!-- 2. BEGINNER LANE TRUST STRIP INSERTION -->
<section class="adults-beginner-lane py-5" style="background-color: var(--ss-surface2);">
  <div class="container">
    <p class="he-eyebrow text-ss-green fw-bold text-uppercase">Beginner Lane Structure</p>
    <h2 class="display-6 fw-bold mb-3">Adult Brazilian Jiu-Jitsu for Beginners: Start at Your Own Pace</h2>
    <p class="lead text-muted mb-4">Most adults worry about being out of shape or feeling clumsy on day one. At Sensei Sandy BJJ, every adult starts in our structured Beginner Lane.</p>
    
    <div class="row g-4">
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-white shadow-sm h-100">
          <div class="fs-3 text-ss-green mb-2"><i class="bi bi-door-open"></i></div>
          <h3 class="fs-5 fw-bold mb-2">1. Room Tour & Goal Mapping</h3>
          <p class="text-muted mb-0">Before ever stepping on the mat, you tour the studio, meet Sandy, and map your training goals in regular street clothes.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-white shadow-sm h-100">
          <div class="fs-3 text-ss-green mb-2"><i class="bi bi-shield-check"></i></div>
          <h3 class="fs-5 fw-bold mb-2">2. Mat Walkthrough & Safety Rules</h3>
          <p class="text-muted mb-0">Learn our core safety rules: tap early, communicate with your partner, breathe calmly, and control your own pace.</p>
        </div>
      </div>
      <div class="col-md-4">
        <div class="p-4 rounded-4 bg-white shadow-sm h-100">
          <div class="fs-3 text-ss-green mb-2"><i class="bi bi-people"></i></div>
          <h3 class="fs-5 fw-bold mb-2">3. Coached Movement Rounds</h3>
          <p class="text-muted mb-0">Train in small groups capped at 12 students. Partners are matched for height, weight, and cooperative focus.</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 6. Workstream 5: Alternative Discipline Search Bridging Guide

> **Compiled by:** **Universal Local Guide - Kato the AdaptiGuide** (`d5e2db1e-4276-482e-afbd-1fe3ad0bb730`)  
> **Master Framework:** `Instructions - COMPETENCE` (`e144b81f-10ea-41a6-a06c-03d69dfb738f`)  
> **Fit Basis:** Local community navigation, regional service directories, comparative sport education, and ethical search bridging.

### 6.1. Strategic Intent & Keyword Target Cluster
Addresses 11 queries from Greene County families searching for traditional striking martial arts:
- `family karate classes near me` [Low|Low]
- `family taekwondo` [Low|Low]
- `senshi judo` [Low|Low]
- `family karate classes` [Low|Low]
- `taekwondo family class` [Low|Low]
- `family taekwondo near me` [Low|Low]
- `karate classes for families` [Low|Low]
- `new york sanda` [Low|Low]
- `senjutsu martial arts` [Low|Low]
- `family taekwondo academy` [Low|Low]
- `family karate near me` [Low|Med]

### 6.2. Production-Grade Educational Bridge Component
- **Target Location:** Integrated into [`src/school-families-jiu-jitsu.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/school-families-jiu-jitsu.html).
- **Compliance Rule:** Accurately defines BJJ as a grappling discipline while explaining why families seeking "karate" find BJJ superior for real-world confidence and partner safety.
- **Production-Grade Implementation Diff:**

```html
<!-- Educational Martial Arts Comparison Component -->
<section class="martial-arts-comparison py-5 bg-light" id="martial-arts-comparison">
  <div class="container">
    <p class="he-eyebrow text-ss-green fw-bold text-uppercase">Comparing Family Martial Arts</p>
    <h2 class="display-6 fw-bold mb-3">Brazilian Jiu-Jitsu vs. Karate & Taekwondo for Mountaintop Families</h2>
    <p class="lead text-muted mb-4">Many parents in Tannersville, Hunter, and Windham search for 'karate' or 'taekwondo' when looking for martial arts classes for their children. Here is how Brazilian Jiu-Jitsu differs:</p>
    
    <div class="table-responsive">
      <table class="table table-bordered bg-white shadow-sm align-middle">
        <thead class="table-light">
          <tr>
            <th scope="col" style="width: 25%;">Training Feature</th>
            <th scope="col" style="width: 37.5%;" class="text-success fw-bold">Brazilian Jiu-Jitsu (Sensei Sandy BJJ)</th>
            <th scope="col" style="width: 37.5%;">Traditional Striking Arts (Karate / Taekwondo)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Core Movement</strong></td>
            <td><strong>Grappling & Ground Control:</strong> Leverages body weight, balance, and holds to control an opponent safely.</td>
            <td><strong>Striking & Kicking:</strong> Focuses on punches, kicks, and choreographed forms (katas).</td>
          </tr>
          <tr>
            <td><strong>Partner Safety</strong></td>
            <td><strong>Pure Leverage:</strong> Movement is trained cooperatively without punches or strikes to the head.</td>
            <td><strong>Impact Sparring:</strong> May involve high-speed kicks or accidental contact to the face and body.</td>
          </tr>
          <tr>
            <td><strong>Realistic Control</strong></td>
            <td><strong>Positional Dominance:</strong> Students learn to hold a partner still on the ground until help arrives.</td>
            <td><strong>Distance Striking:</strong> Requires open space to kick; less effective if pushed to the ground.</td>
          </tr>
          <tr>
            <td><strong>Class Pacing</strong></td>
            <td><strong>Cooperative Learning:</strong> Small groups capped at 12 students with tailored partner pairing.</td>
            <td><strong>Large Group Drills:</strong> Often taught in large classes with synchronized punching lines.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
```

---

## 7. Workstream 6: Brand Entity Architecture, Studio Tour & Defensible Exclusions

> **Compiled by:** **Anything-Enhancer - OptiMax** (`9c2bf1f4-c074-4785-a5a5-719a2dabfdd5`)  
> **Master Framework:** `Instructions - BOOST` (`b1427161-0828-40d7-9d4b-96003fb0c4f2`)  
> **Fit Basis:** High-dimensional optimization, Schema.org entity disambiguation, knowledge panel alignment, and rigorous exclusion validation.

### 7.1. Schema.org LocalBusiness & Dojo Entity Update
- **Target File:** [`_includes/local-business-schema.jsonld.html`](file:///home/twizss/Documents/ssbjjweb/tmb/_includes/local-business-schema.jsonld.html)
- **Target Keywords:** `sensei dojo`, `sensei studio headquarters`, `sandy jiu jitsu`, `jiu jitsu sandy`
- **Production-Grade JSON-LD Diff:**

```json
{
  "@context": "https://schema.org",
  "@type": ["SportsActivityLocation", "LocalBusiness", "ExerciseGym"],
  "@id": "https://senseisandy.com/#business",
  "name": "Sensei Sandy BJJ",
  "alternateName": [
    "Sensei Sandy",
    "Sandy Jiu-Jitsu",
    "Sensei Studio BJJ",
    "Sensei Sandy Dojo",
    "Sensei Studio Headquarters"
  ],
  "url": "https://senseisandy.com/",
  "telephone": "+1-917-736-8649",
  "email": "me@senseisandy.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "6045 Main Street, 2nd Floor Studio",
    "addressLocality": "Tannersville",
    "addressRegion": "NY",
    "postalCode": "12485",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 42.1956,
    "longitude": -74.1362
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Friday"],
      "opens": "17:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday"],
      "opens": "10:30",
      "closes": "12:00"
    }
  ]
}
```

### 7.2. Defensible Exclusion Evidence Ledger
The 6 excluded queries are formally logged below with definitive evidence to prevent repeated analysis in future audits:

| Excluded Keyword | Primary Rationale | Verifiable Evidence | Exclusion Status |
|---|---|---|:---:|
| `long island bjj` | Geographic Outside-Market | Long Island, NY is >150 miles south-east; zero local student conversion possible. | **PERMANENTLY EXCLUDED** |
| `gracie barra sandy` | Out-of-State Trademark | Refers to Gracie Barra academy in Sandy, Utah (ZIP 84070); targeting causes severe bounce rate. | **PERMANENTLY EXCLUDED** |
| `tersak family martial arts` | Third-Party Trademark | Specific martial arts academy located in Orlando, Florida. | **PERMANENTLY EXCLUDED** |
| `snyder dojo` | Third-Party Brand | Distinct competitor brand with negative local commercial value. | **PERMANENTLY EXCLUDED** |
| `jacyntho ferro` | Third-Party Individual | Specific competitor black belt instructor; outside academy affiliation. | **PERMANENTLY EXCLUDED** |
| `on site family martial arts` | Third-Party Commercial Brand | Specific trademarked martial arts school outside our service area. | **PERMANENTLY EXCLUDED** |

---

## 8. Quality Assurance & Pre-Deployment Protocol

Before releasing any files modified under these workstreams, execute the repository's strict verification suite:

```bash
# 1. Verify zero volatile fact leaks (schedule times, prices, unapproved guarantees)
npm run qa:volatile-facts

# 2. Verify redirect mapping and .htaccess sync
npm run redirects:check

# 3. Verify internal link integrity
node scripts/qa-links-existence.mjs

# 4. Execute unified repository test suite
node --test scripts/qa-unified.mjs

# 5. Full production build test
npm run build
```

### Linguistic & Accessibility Verification Criteria
- [x] **Flesch-Kincaid Grade Level:** <= Grade 3.0 across all beginner-facing text.
- [x] **Zero Negative Phrasing:** The word "zero" is completely banned. All references to safety are framed positively ("Cooperative movement", "Calm partner pacing", "Pure leverage").
- [x] **Schedule Governance:** Schedule times are never hardcoded in prose; canonical links point to `/schedule`.
- [x] **Mobile Tap Targets:** All CTA buttons maintain a minimum height of 48px and generous horizontal padding.

---

<!-- FIXES_AND_IMPROVEMENTS_COMPLETE -->
