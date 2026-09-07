# Sensei Sandy BJJ — Positioning Alignment Codebase Affordance Audit

**Repository:** Sensei Sandy BJJ (`https://senseisandy.com`)  
**Evaluation Date:** September 2026  
**Auditor:** Antigravity AI Engine (using `.agents/skills/stop-slop/SKILL.md`)  
**Scope:** Architecture, routes, templates, components, styles, copy, and SEO affordance for the "Calm Under Pressure" family martial arts positioning system.

---

# Executive Diagnosis

* The existing codebase already contains the core headline "Get Better at Handling Hard Things" on the homepage ([`src/partials/home-conversion-shell.html:L62`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L62)) and provides a 4-choice audience selector that includes families.
* The biggest contradiction is the isolation of adult training from youth funnels: youth pages completely omit adult classes, and the booking confirmation script explicitly removes adult information when a parent reserves a youth intro ([`src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L52`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk#L52)).
* The strongest operational affordance is the weekday schedule: youth classes meet at 5:00 PM and adult classes meet at 6:00 PM every Monday, Tuesday, Wednesday, and Friday ([`src/schedule.html:L57-100`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html#L57-100)), giving families an adjacent training routine in one location.
* The easiest win is a content-only alignment pass across hero eyebrows, page kickers, and schedule headers to position the academy around composure under pressure rather than generic martial arts keywords.
* The largest implementation risk is build-time content stripping in `eleventy.config.js` ([`eleventy.config.js:L159-190`](file:///home/twizss/Documents/ssbjjweb/tmb/eleventy.config.js#L159-190)), which currently empties out section content on `/how-class-works` and removes culture sections on program pages.
* No new frameworks, dependencies, components, or routes are required; existing templates and CSS classes support ninety-five percent of the target positioning through content, asset, and recomposition adjustments.

---

# Current Site Model

```text
Framework:
  Static Site Generator: Eleventy (@11ty/eleventy v3.1.6)
  Config: eleventy.config.js
  Input: src/
  Output: dist/
  Post-build step: node tools/materialize-ssi-fragments.mjs

Routing:
  Web server: Apache / LiteSpeed with clean URL rewrites (.htaccess)
  Page routes: directory-based index.html and root-level .html files
  URL authority: data/url-registry.json validated by scripts/qa-seo-eleventy.mjs
  Redirects: config/legacy-redirects.json synced to .htaccess via tools/sync-htaccess-legacy-redirects.mjs

Content:
  Source files: src/**/*.html and src/**/*.njk with YAML front-matter
  Shared data: src/_data/ (schedule.json, contact.json, faqs.json) and data/url-registry.json
  SSI includes: nav-include.html, footer-include.html, src/partials/

Components:
  Layouts: src/_includes/layouts/ (base.njk, home.njk, program.njk, schedule.njk, pricing.njk, free-intro.njk)
  Macros: src/_includes/components/ (academy-fact.njk, footer.njk, structured-data.njk)
  Conversion shells: src/partials/home-conversion-shell.html, program-conversion-kids.html, program-conversion-teens.html, program-conversion-adults.html
  Social proof: src/partials/reviews-village.html, src/success-stories.html

Styling:
  Core framework: Bootstrap 5.3.3 localized with custom properties in src/tokens.css
  Palette tokens: --ss-green (#116A42), --ss-teal (#289FA1), --ss-ink (#362B24), --ss-bg (#FBFAF8), --ss-surface2 (#F4F1ED)
  Page bundles: assets/css/pages/home.min.css, kids.css, schedule.css, options-pricing-highend.css
  Enforcement: scripts/qa-css-budget.mjs

Booking:
  Onsite intake: Formspree endpoint via {{ contact.formspreeEndpoint }}
  Widget architecture: multi-step vanilla JS wizards on homepage (src/partials/home-conversion-shell.html) and intro route (src/free-bjj-intro-tannersville-ny/index.html)
  Direct fallback: SMS link to sms:+19177368649 with pre-filled text
  Confirmation route: src/free-bjj-intro-tannersville-ny/confirmation/index.njk

Analytics:
  Header hook: <!--#include virtual="/_includes/analytics-head.html" -->
  Tracking attributes: data-analytics-event, data-cta-label, data-cta-location, data-goal-mapping
  Conversion firing: deduplicated sessionStorage lead event on confirmation route

SEO:
  Head tags: single-source control in src/_includes/layouts/base.njk
  Structured data: JSON-LD for SportsActivityLocation, LocalBusiness, FAQPage via structured-data.njk
  Sitemaps: split XML sitemaps generated via tools/build-all-sitemaps.mjs
  Indexation: automated noindex injection from data/url-registry.json
```

---

# Current Positioning vs Desired Positioning

| Dimension | Current State | Desired State | Gap & Affordance |
| :--- | :--- | :--- | :--- |
| **Core Category** | Brazilian Jiu-Jitsu martial arts academy with separate children and adult programs. | Family training ground for becoming calmer and more capable under pressure. | Shift category lead from mechanism (BJJ) to transformation (calm under pressure). Affordance: A1 (Copy). |
| **Parent Promise** | Structured after-school martial arts with safety rules, partner care, and good coaching. | Help children build confidence and persistence by handling hard problems safely. | Clarify the emotional transition from frustration to self-trust. Affordance: A1 (Copy). |
| **Family Identity** | Separate classes listed independently under Programs (Kids BJJ, Teens BJJ, Adult BJJ). | "One family. One training ground." Kids, teens, and parents training within one cohesive academy. | Connect program pages with shared family values and routine convenience. Affordance: A3/A4 (Recompose/Extend). |
| **Parent Involvement** | Parents watch from the viewing area as spectators. | Parents watch first, build trust, and realize they can train too ("Your kid doesn't have to be the only one getting stronger"). | Add adult beginner bridges to youth pages and booking confirmation. Affordance: A1/A4 (Copy/Extend). |
| **Mechanism Presentation** | Positional games, open skills, constraints, and resistance described before parent reassurance. | Vacation outcome first (composure, self-trust), followed by training reasons to believe (matched partners, coach nearby). | Reorder section hierarchy: Outcome -> Reason to believe -> Mechanism -> Offer -> CTA. Affordance: A3 (Recomposition). |
| **Teen Positioning** | Teens share the 5:00 PM youth class; copy emphasizes sports cross-training. | "A hard problem worth getting good at." Serious physical competence bridging to adult mastery. | Elevate teen autonomy and link teen training to adult skill progression. Affordance: A1 (Copy). |
| **Adult Positioning** | Adult beginner fitness, practical self-defense, and community service discounts. | "Feel capable again." Sustainable practice for parents and former athletes without intimidation. | Soften masculine, competitor visual cues; showcase everyday adults and parents on the mats. Affordance: A2 (Content + Media). |

---

# Affordance Summary

```text
A0 Already Aligned:               3 components / sections
A1 Copy-Only Alignment:           18 pages / components
A2 Content + Asset Swap:          5 components / media blocks
A3 Component Recomposition:       6 templates / layouts
A4 Small Component Extension:     4 components / widgets
A5 New Component Needed:          0 components
A6 Architecture Issue:            2 build / config rules
```

**Total evaluated surfaces:** 38 touchpoints across 18 core routes and partials.  
Ninety-five percent of positioning goals can be achieved within A0 through A4, without creating new components or pages.

---

# Route-by-Route Audit

### 1. Homepage (`/`)
* **Audience:** Local parents, adult beginners, Mountaintop families.
* **Current job:** Introduces the school, explains class levels, and captures first visits through a 3-step form.
* **Current primary message:** "Get Better at Handling Hard Things. Small-group Jiu-Jitsu for kids, teens and adults." ([`src/partials/home-conversion-shell.html:L62`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L62))
* **Desired job:** Establish SSBJJ as the Catskills family training ground for building calm under pressure.
* **What already works:** The headline is strong and outcome-led; the 3-step interactive planner includes "Our family" as a primary choice ([`src/partials/home-conversion-shell.html:L68`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L68)); the proof counter shows 294 classes delivered.
* **What conflicts:** The eyebrow leads with category keywords ("JIU-JITSU · TANNERSVILLE, NY · KIDS · TEENS · ADULTS"); the family value section at line 212 of `src/index.html` is hidden with `hidden` ([`src/index.html:L212`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L212)); the hero image focuses on small children rolling.
* **Affordance:** A3 (Recomposition) + A1 (Copy).
* **Recommended minimum change:**
  1. Change eyebrow to: "CALM UNDER PRESSURE · TANNERSVILLE, NY".
  2. Unhide the family value block ([`src/index.html:L212-225`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L212-225)) with headline: "Good Training for Them. A Better Routine for You."
  3. Update subhead to: "A Catskills training ground for kids, teens, and adults learning to stay calm, solve problems with a partner, and handle hard situations."
* **Evidence:** [`src/partials/home-conversion-shell.html:L60-92`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L60-92), [`src/index.html:L77-109`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L77-109).

### 2. Kids Program Page (`/bjj-classes/kids-tannersville-ny`)
* **Audience:** Parents of children ages 5–9 seeking confidence, discipline, or screen alternatives.
* **Current job:** Explains class skills and invites parents to book a free intro.
* **Current primary message:** "A Place to Practice Doing Hard Things." ([`src/partials/program-conversion-kids.html:L3`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-kids.html#L3))
* **Desired job:** Reassure parents that children learn self-trust and composure through safe, coached resistance.
* **What already works:** Clear focus on partner care, coach oversight, and parent observation; avoids martial arts hyperbole.
* **What conflicts:** Total absence of adult training context. A parent reading this page has no idea adult classes follow immediately at 6:00 PM.
* **Affordance:** A4 (Extension) + A1 (Copy).
* **Recommended minimum change:** Add a cross-sell bridge callout below class highlights: "Parents train here too. While kids train at 5:00 PM, adult classes start at 6:00 PM. Your child does not have to be the only one getting stronger."
* **Evidence:** [`src/partials/program-conversion-kids.html:L1-9`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-kids.html#L1-9).

### 3. Teens Program Page (`/bjj-classes/teens-tannersville-ny`)
* **Audience:** Teens ages 10–17 and their parents.
* **Current job:** Positions teen training as sports cross-training and grappling conditioning.
* **Current primary message:** "Get Harder to Move. Harder to Rattle." ([`src/partials/program-conversion-teens.html:L3`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-teens.html#L3))
* **Desired job:** Validate the teen desire for genuine capability and autonomy under pressure.
* **What already works:** Respectful, non-infantilizing tone; highlights balance, grip fighting, body control, and scrambling.
* **What conflicts:** Contains an em-dash flagged by stop-slop rules ([`program-conversion-teens.html:L3`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-teens.html#L3)); does not show the progression from teen competence to adult training.
* **Affordance:** A1 (Copy).
* **Recommended minimum change:**
  1. Remove em-dash: "Practice balance, control, scrambling, and decisions against real resistance, with a starting pace that fits the student."
  2. Add progression note: "Teens build real competence here, with a direct path into our adult classes as their skills grow."
* **Evidence:** [`src/partials/program-conversion-teens.html:L1-11`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-teens.html#L1-11).

### 4. Adults Program Page (`/bjj-classes/adults-tannersville-ny`)
* **Audience:** Adults 18+, local parents, former athletes, community service workers.
* **Current job:** Encourages beginner adults to book a 15-minute intro without needing prior fitness.
* **Current primary message:** "Feel Capable Again. You do not need to get in shape first." ([`src/partials/program-conversion-adults.html:L3`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-adults.html#L3))
* **Desired job:** Help adults, including parents, see Jiu-Jitsu as a sustainable personal practice for physical capability and mental calm.
* **What already works:** Excellent beginner reassurance ("You will not be expected to know what you are doing before you start"); clear 15-minute first visit policy in normal clothes without a workout.
* **What conflicts:** The primary photo (`community-320.6d7bac.webp`) is low resolution, small, and depicts only athletic men. No copy speaks to parents whose children are already enrolled.
* **Affordance:** A2 (Content + Media) + A1 (Copy).
* **Recommended minimum change:**
  1. Replace `community-320.6d7bac.webp` with a high-resolution photograph showing a welcoming group of adult men and women on the mats with Sandy.
  2. Add a parent callout: "Many of our adult students started because their kids joined first. You spend the week managing schedules for everyone else; take one hour on the mats for yourself."
* **Evidence:** [`src/partials/program-conversion-adults.html:L1-10`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-adults.html#L1-10).

### 5. School Families Landing Page (`/school-families-jiu-jitsu`)
* **Audience:** Local elementary, middle, and high school parents in Tannersville, Hunter, and Windham.
* **Current job:** Community partner bridge for school families.
* **Current primary message:** "A calm first Jiu-Jitsu visit for kids, teens, and parents." ([`src/school-families-jiu-jitsu.html:L18`](file:///home/twizss/Documents/ssbjjweb/tmb/src/school-families-jiu-jitsu.html#L18))
* **Desired job:** Connect school-day friction (frustration, peer stress, homework fatigue) to afternoon composure training.
* **What already works:** Already features three audience cards: "Kids + Teens", "Adults", and "School / PTA Partner" ([`src/school-families-jiu-jitsu.html:L58-88`](file:///home/twizss/Documents/ssbjjweb/tmb/src/school-families-jiu-jitsu.html#L58-88)).
* **What conflicts:** Hidden under `/community-partners` breadcrumb; hero copy is generic.
* **Affordance:** A1 (Copy).
* **Recommended minimum change:** Sharpen headline: "Help Them Reset After School. A Calm Training Ground for Mountaintop Families."
* **Evidence:** [`src/school-families-jiu-jitsu.html:L12-88`](file:///home/twizss/Documents/ssbjjweb/tmb/src/school-families-jiu-jitsu.html#L12-88).

### 6. Programs Hub (`/programs`)
* **Audience:** Prospects comparing training options.
* **Current job:** Lists all programs (Kids, Teens, Adults, Private Coaching, Visitor Passes, Birthday Parties).
* **Current primary message:** "Brazilian Jiu-Jitsu Programs in Tannersville, NY" ([`src/programs.html:L16`](file:///home/twizss/Documents/ssbjjweb/tmb/src/programs.html#L16))
* **Desired job:** Present the academy as one training ecosystem: Kids -> Teens -> Adults.
* **What already works:** 3-column primary cards for Kids (5–9), Teens (10–17), and Adults (18+) ([`src/programs.html:L43-98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/programs.html#L43-98)); operational note clarifying that kids and teens share the 5 PM youth format with individual partner matching.
* **What conflicts:** Leads with martial arts mechanism title rather than family ecosystem outcome.
* **Affordance:** A1 (Copy).
* **Recommended minimum change:** Update H1 to: "One Family. One Training Ground. Programs for Kids, Teens, and Adults in Tannersville."
* **Evidence:** [`src/programs.html:L15-98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/programs.html#L15-98).

### 7. Schedule Authority (`/schedule`)
* **Audience:** Prospective and current families evaluating logistics.
* **Current job:** Shows weekly class times and holiday closures.
* **Current primary message:** "Current and Fall Schedule" ([`src/schedule.html:L19`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html#L19))
* **Desired job:** Prove the convenience of family training times and reduce scheduling uncertainty.
* **What already works:** Day-by-day calendar cards clearly showing 5:00 PM Youth and 6:00 PM Adults on Monday, Tuesday, Wednesday, and Friday ([`src/schedule.html:L57-100`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html#L57-100)).
* **What conflicts:** Does not explicitly market the back-to-back family schedule benefit; visitor notice links compete visually with primary enrollment CTAs.
* **Affordance:** A4 (Extension) + A1 (Copy).
* **Recommended minimum change:** Add a family schedule highlight banner above the calendar: "Family Training Routine: Youth at 5:00 PM, Adults at 6:00 PM every training day. Drive once, train together, and build a consistent family habit."
* **Evidence:** [`src/schedule.html:L15-105`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html#L15-105).

### 8. Free Intro Booking Funnel (`/free-bjj-intro-tannersville-ny`)
* **Audience:** High-intent prospects ready to schedule a first visit.
* **Current job:** 2-step profile selection and calendar booking form.
* **Current primary message:** "Plan Your Free First Visit. We'll help you choose the right class, partner, and starting pace." ([`src/free-bjj-intro-tannersville-ny/index.html:L28-32`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html#L28-32))
* **Desired job:** Capture first visits with clear expectations for both children and adults.
* **What already works:** Reassures beginners that no experience is required; clarifies that adult first visits are a 15-minute consultation in normal clothes.
* **What conflicts:** Profile buttons include "Child age 5–9", "Teen age 10–17", "Adult beginner", "Community-service adult", and "Not sure—help me choose", but omit the "Our family" button that exists on the homepage ([`src/free-bjj-intro-tannersville-ny/index.html:L80-167`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html#L80-167)).
* **Affordance:** A4 (Extension).
* **Recommended minimum change:** Add the "Our family" profile button to Step 1: "Family (Youth + Adult) - Plan a shared family start."
* **Evidence:** [`src/free-bjj-intro-tannersville-ny/index.html:L75-170`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html#L75-170).

### 9. Booking Confirmation Page (`/free-bjj-intro-tannersville-ny/confirmation/`)
* **Audience:** Prospects who just reserved a Free First Visit.
* **Current job:** Confirms receipt and tells students what happens next.
* **Current primary message:** "We Received Your Free First Visit Request!" ([`src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L16`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk#L16))
* **Desired job:** Confirm the child's visit and plant the seed for parent participation without adding friction.
* **What already works:** Clear, calm next steps; address and contact details prominently displayed.
* **What conflicts:** Script line 52 deliberately removes adult instructions for youth bookings: `if (["child", "teen"].includes(details?.profile)) document.querySelector("[data-confirmation-adult]")?.remove();` ([`src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L52`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk#L52)).
* **Affordance:** A4 (Extension) + A1 (Copy).
* **Recommended minimum change:** Replace the deletion logic with a dedicated parent callout card: "Parents train here too. While your child trains at 5:00 PM, adult classes start at 6:00 PM. Mention to Sandy during your child's visit if you want to try an adult class."
* **Evidence:** [`src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L21-59`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk#L21-59).

### 10. Options & Pricing Page (`/options-pricing`)
* **Audience:** Families and adults evaluating investment and terms.
* **Current job:** Details the 12-week program, tuition rates, visitor passes, and guarantees.
* **Current primary message:** "Clear pricing. A calm first step." ([`src/options-pricing.html:L26`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html#L26))
* **Desired job:** Connect financial investment to durable family growth and skill development.
* **What already works:** Upfront pricing ($550 youth, $715 adult for 12 weeks) ([`src/options-pricing.html:L31`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html#L31)); 30-Day Training Fit Guarantee clearly stated.
* **What conflicts:** Copy focuses heavily on mechanisms ("3 planned classes each week", "Uniform included") rather than the vacation outcome; family multi-student options are not summarized upfront.
* **Affordance:** A1 (Copy).
* **Recommended minimum change:** Add value outcome phrasing to the 12-week core blocks: "Twelve weeks to build a routine that stays calm under pressure, solves problems with a partner, and creates real physical confidence." Add a clear family note: "Multiple students in one household? Text Sandy for family coordination and pricing."
* **Evidence:** [`src/options-pricing.html:L21-105`](file:///home/twizss/Documents/ssbjjweb/tmb/src/options-pricing.html#L21-105).

### 11. How Class Works (`/how-class-works`)
* **Audience:** Skeptical parents and cautious adult beginners.
* **Current job:** Explains class timeline, partner safety, and open-skill training.
* **Current primary message:** "Train with structure. How Class Works." ([`src/how-class-works.html:L13-14`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html#L13-L14))
* **Desired job:** Remove intimidation by demonstrating that every drill is coached, partner resistance is gradual, and safety is strictly enforced.
* **What already works:** "Class at a glance" lists clear steps: warm up, chest-to-chest game, chest-to-back game, guard game, short rounds, review ([`src/how-class-works.html:L15`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html#L15)).
* **What conflicts:** Architecture defect A6: `eleventy.config.js:L166-171` strips out sections with IDs `class-breakdown`, `guided-practice`, and `what-parents-expect`, leaving broken table-of-contents links and large blank sections in the generated output (`dist/how-class-works.html`).
* **Affordance:** A6 (Architecture Fix in Eleventy config) + A1 (Copy).
* **Recommended minimum change:** Update `eleventy.config.js` to preserve the parent reassurance and safety sections on `/how-class-works.html`.
* **Evidence:** [`src/how-class-works.html:L1-100`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html#L1-100), [`dist/how-class-works.html:L95-135`](file:///home/twizss/Documents/ssbjjweb/tmb/dist/how-class-works.html#L95-135), [`eleventy.config.js:L166-171`](file:///home/twizss/Documents/ssbjjweb/tmb/eleventy.config.js#L166-171).

### 12. Parent Resources / Hub (`/parent-resources`)
* **Audience:** Mountaintop parents considering martial arts or seeking advice for a child who struggles.
* **Current job:** In-depth guide addressing parent fears, first visits, developmental stages, and progress tracking.
* **Current primary message:** "Parent Resources for Kids and Teens Jiu-Jitsu in Tannersville, NY" ([`src/parent-resources.html:L20`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L20))
* **Desired job:** Position the academy as a trusted partner helping parents raise resilient, composed kids.
* **What already works:** Exceptional developmental table (Recognize, Protect, Solve, Adapt, Express) ([`src/parent-resources.html:L56-66`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L56-66)); directly answers "Why parents look for Jiu-Jitsu" (confidence, screen reduction, energy direction) ([`src/parent-resources.html:L72-78`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L72-78)).
* **What conflicts:** Contains adverbs ("actually looks like"), binary contrasts ("not just a room full of kids"), and em-dashes flagged by stop-slop rules ([`src/parent-resources.html:L53, L83, L218`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L53)).
* **Affordance:** A1 (Copy cleanup via stop-slop).
* **Recommended minimum change:** Remove stop-slop tells: replace "What progress actually looks like" with "What progress looks like in class"; replace "A good youth class is not just a room full of kids rolling around" with "A structured youth class requires an active coach, clear tasks, and strict rules for safety and partner care."
* **Evidence:** [`src/parent-resources.html:L53-92`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L53-92).

### 13. Bully-Proof Page (`/bully-proof-jiu-jitsu-tannersville-ny`)
* **Audience:** Parents worried about school conflict, peer pressure, or bullying.
* **Current job:** Explains practical boundary setting and defensive grappling.
* **Current primary message:** "Sensei Bully Proof & Bully-Proof Jiu-Jitsu for Kids & Teens" ([`src/bully-proof-jiu-jitsu-tannersville-ny.html:L15`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bully-proof-jiu-jitsu-tannersville-ny.html#L15))
* **Desired job:** Offer a calm, realistic plan for children to handle aggression without making reckless violence-proof guarantees.
* **What already works:** Excellent grounding: "When a kid feels picked on, they do not need hype. They need a plan." ([`src/bully-proof-jiu-jitsu-tannersville-ny.html:L72`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bully-proof-jiu-jitsu-tannersville-ny.html#L72)); emphasizes speaking up, creating space, and involving adults before physical contact.
* **What conflicts:** Title tag and H1 are repetitive ("Sensei Bully Proof & Bully-Proof Jiu-Jitsu"); relies on negative contrasts.
* **Affordance:** A1 (Copy).
* **Recommended minimum change:** Streamline title to: "Bully-Proof Jiu-Jitsu for Kids & Teens in Tannersville, NY". Ensure all copy emphasizes composure and safety options.
* **Evidence:** [`src/bully-proof-jiu-jitsu-tannersville-ny.html:L10-79`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bully-proof-jiu-jitsu-tannersville-ny.html#L10-79).

### 14. Success Stories (`/success-stories`)
* **Audience:** Prospective students and parents seeking social proof.
* **Current job:** Categorizes real student reviews by question (nervous beginners, safety, culture, families).
* **Current primary message:** "Real students. Specific experiences." ([`src/success-stories.html:L15`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html#L15))
* **Desired job:** Validate that everyday people and families become calmer and more capable at SSBJJ.
* **What already works:** 100% authentic Google reviews from Roberto Noel-Berman, Kelly Chan, Adam Mastropaolo, Jared Goodrich, Caroline Cosgrove, and Jessie Moriarty ([`src/success-stories.html:L41-55`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html#L41-55)).
* **What conflicts:** Section title uses adverb "What people actually noticed" ([`src/success-stories.html:L39`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html#L39)); lacks outcome tag headers on quotes.
* **Affordance:** A1 (Copy).
* **Recommended minimum change:** Change section title to "What students and families noticed in the room." Add bold outcome badges to each review: **Nervous Beginner Made Comfortable**, **Safe Partner Care**, **Family Routine**.
* **Evidence:** [`src/success-stories.html:L12-58`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html#L12-58).

---

# Family + Adult Visibility Audit

### Detailed Findings Against Avatars

#### 1. Avatar A: The Parent Who Watches
* **Current journey:** A parent books for their child, brings them to class, and sits in the spectator area. During this journey, the website never prompts them about adult training.
* **Website gap:** `src/bjj-classes/kids-tannersville-ny` contains zero mention of adults. When booking completes, `src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L52` actively removes adult information from the confirmation view!
* **Affordance fix:** Extend the confirmation page template and youth program partial with a "Parents Train Too" card.
* **Fix copy (Stop-Slop compliant):**  
  > **Your kid does not have to be the only one getting stronger.**  
  > Many adult students started by watching from the sidelines. Youth classes run at 5:00 PM; adult classes begin at 6:00 PM. Ask Sandy during your child's first visit how you can try a class in our adult beginner lane.

#### 2. Avatar B: Adult Beginner / Former Athlete
* **Current journey:** Finds `/bjj-classes/adults-tannersville-ny`. Reads "Feel Capable Again. You do not need to get in shape first."
* **Website gap:** The text is supportive, but the accompanying image (`community-320.6d7bac.webp`) is low resolution, small, and shows only competitive men grappling.
* **Affordance fix:** Swap the asset for a photo of diverse adult students smiling with Sandy after practice. Keep the 15-minute consultation reassurance in normal clothes.

#### 3. Avatar C: Mom Who Wants Something For Herself
* **Current journey:** Looking for personal fitness and mental space outside parenting.
* **Website gap:** Imagery across adult surfaces lacks female representation. Male-coded terminology ("combat pioneer", "grappler", "scrappers") dominates secondary articles.
* **Affordance fix:** Surface Kelly Chan's verified review prominently on the adult page: *"As a smaller grappler, I felt safe and welcomed."* Add explicit copy: *"Our adult class includes working parents, teachers, and professionals who want a focused, safe workout without big egos."*

#### 4. Avatar D: Dad Looking For Shared Ground
* **Current journey:** Wants a meaningful shared pursuit with his child beyond chauffeuring and screens.
* **Website gap:** The site treats youth and adult classes as completely separate products.
* **Affordance fix:** Add a family connection block to `/programs` and `/schedule`:
* **Fix copy (Stop-Slop compliant):**  
  > **One family. One training ground.**  
  > Training gives parents and children a shared language. You both learn balance, problem solving, and composure under pressure. You understand the work because you do the work.

#### 5. Avatar E: Teen Seeking Competence
* **Current journey:** Arrives at `/bjj-classes/teens-tannersville-ny`.
* **Website gap:** The headline "Get Harder to Move. Harder to Rattle" works well, but the page does not show the progression from teen practice to adult training.
* **Affordance fix:** Frame teen training as the gateway to adult mastery: *"A hard problem worth getting good at. Build balance, leverage, and composure that stay with you into adulthood."*

#### 6. Avatar F: Whole Household ("We Train")
* **Current journey:** Multi-member families seeking a healthy Catskills lifestyle.
* **Website gap:** No clear explanation of family schedule synergy or family billing coordination.
* **Affordance fix:** Highlight the 5:00 PM / 6:00 PM adjacent schedule blocks on `/schedule` and `/options-pricing`.

---

# Emotional Messaging Audit

### Transformation Matrix

```text
AUDIENCE: PARENT / MOM
Current State:
  Child gets frustrated quickly, quits when an activity becomes difficult, or spends hours on screens.
Mechanism:
  Small-group classes, coach nearby, carefully matched partners, clear boundary rules, repeat attempts.
Desired State:
  Child resets calmly after a mistake, tries again without melting down, and builds genuine self-trust.
Headline Candidate:
  Help them get better at handling hard things.

AUDIENCE: TEEN
Current State:
  Bored with childish activities, self-conscious around peers, seeking status through real capability.
Mechanism:
  Live grappling resistance, positional problem solving, joint-safe boundaries, no punching or kicking.
Desired State:
  Physically capable, grounded, unbothered by pressure, possessing skills peers respect.
Headline Candidate:
  A hard problem worth getting good at.

AUDIENCE: ADULT BEGINNER / PARENT
Current State:
  Stiff, out of shape, tired of standard gyms, worried about injury or looking foolish.
Mechanism:
  15-minute consultation in everyday clothes, dedicated beginner partner pairing, controlled round pacing.
Desired State:
  Stronger, more mobile, mentally focused, physically capable of handling challenges.
Headline Candidate:
  Feel capable again. Start where you are.

AUDIENCE: WHOLE HOUSEHOLD
Current State:
  Family life consists of passive entertainment, logistics, and separate fragmented activities.
Mechanism:
  Adjacent 5:00 PM youth and 6:00 PM adult class schedule on Monday, Tuesday, Wednesday, and Friday.
Desired State:
  A shared physical discipline where parents and children understand the same challenges.
Headline Candidate:
  One family. One training ground.
```

---

# Competitive Content Audit

SSBJJ does not criticize other martial arts. It explains differences in training focus so families can make an informed choice.

### 1. Existing Mentions in Codebase
* `src/after-school.html:L16`: Uses "After-School Martial Arts & Jiu-Jitsu". Captures general martial arts search intent.
* `src/blog/bjj-sensei/index.html:L74`: Mentions Judo, Karate, and Aikido in the context of defining the Japanese word *Sensei*.
* `src/sensei-jiu-jitsu.html:L114-350`: Details the historical development of Judo under Kanō Jigorō and its transmission through Mitsuyo Maeda to Brazilian Jiu-Jitsu.
* `src/_includes/components/structured-data.njk:L39`: Structured FAQ Schema answering "Is Brazilian Jiu-Jitsu a martial art?" and "Where can beginners find martial arts classes near Windham, NY?".

### 2. Reframing Guidance (Training Emphasis Framework)

| Comparison Discipline | Traditional Focus | SSBJJ Distinct Training Focus | Stop-Slop Outcome Reframing |
| :--- | :--- | :--- | :--- |
| **Karate** | Kata, forms, striking drills, formal belt progression. | Solving live physical problems against a partner who is actively solving one too. | "Students test movements directly with a resisting partner instead of rehearsing forms against the air." |
| **Taekwondo** | High kicks, athletic board breaking, Olympic sparring. | Close-range balance, ground control, and composure under pressure. | "Training emphasizes leverage, control, and balance at close quarters without punching or kicking." |
| **Kung Fu** | Traditional choreography, movement sets, historical weapons. | Immediate feedback from a live partner during controlled positional games. | "Students receive immediate feedback from a partner to see if an answer works." |
| **Aikido** | Joint manipulation, circular redirects, compliant falling. | Practicing calm decision making while a partner actively tries to counter. | "Students practice staying calm while their partner is actively trying to solve an opposing problem." |
| **Judo** | High-amplitude throws, upright grips, Olympic contest speed. | Extended ground-based decision making in a small-group family environment. | "We share Judo's commitment to balance and leverage, with an emphasis on ground control, extended problem solving, and patient pacing for beginners." |

---

# Component Reuse Plan

| Existing Component | File Path | Current Use | Repositioning Reuse | Affordance | Required Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `home-conversion-shell` | `src/partials/home-conversion-shell.html` | Hero title, interactive 3-step visit planner, schedule preview. | Front-door expression of "Calm Under Pressure" and family routines. | A1 | Update eyebrow, subhead, and argument card copy. |
| `ss-home-lane-grid` | `src/index.html:L77-109` | Bento cards linking to Kids, Teens, and Adults pages. | Visual continuum demonstrating the three stages of family training. | A1 | Update body copy on cards to reflect the progression of composure and skill. |
| `ss-home-double-win` | `src/index.html:L212-239` | Hidden family section ("Good Training for Them. A Better Routine for You."). | Core family proof section showing benefits for children and parents. | A3 | Remove `hidden` attribute; verify responsive spacing. |
| `program-conversion-kids` | `src/partials/program-conversion-kids.html` | Hero and highlights for kids aged 5–9. | Youth vacation page; sells self-trust and composure. | A4 | Add a "Parents Train Too" callout card at the base of the page. |
| `program-conversion-adults` | `src/partials/program-conversion-adults.html` | Hero, beginner lane, and community pricing for adults. | Reassurance page for parents, adult beginners, and former athletes. | A2 | Replace low-resolution men-only photo with a welcoming adult class image. |
| `reviews-village` | `src/partials/reviews-village.html` | Social proof card grid. | Categorized proof demonstrating calm, safety, and family routine. | A1 | Add explicit outcome badges above quotes (**Safe Partner Care**, **Family Routine**). |
| `ss-calendar-bezel` | `src/schedule.html:L54-105` | Day cards displaying class hours. | Proof of family convenience (Youth at 5 PM, Adults at 6 PM). | A4 | Add a top banner highlighting the back-to-back family routine. |
| `pb-step-1` (Profile Picker) | `src/free-bjj-intro-tannersville-ny/index.html:L75-170` | Profile selection buttons on dedicated intro route. | Capture family interest during booking. | A4 | Add an "Our family" profile card matching the homepage builder. |
| `confirmation-card` | `src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L21-34` | Post-booking appointment instructions. | High-trust cross-sell for parents who watch. | A4 | Replace adult deletion logic with a "Parents Train Too" card. |

---

# SEO Impact

### 1. KEEP (Do Not Touch)
* **Target category keywords:** "Brazilian Jiu-Jitsu", "BJJ", "kids martial arts", "martial arts for kids", "adult BJJ", "self-defense".
* **Geographic anchors:** "Tannersville", "Hunter", "Windham", "Haines Falls", "Catskills".
* **URL paths:** All existing canonical URLs (`/`, `/bjj-classes/kids-tannersville-ny`, `/bjj-classes/teens-tannersville-ny`, `/bjj-classes/adults-tannersville-ny`, `/schedule`, `/options-pricing`, `/free-bjj-intro-tannersville-ny`).
* **Structured Data:** JSON-LD in `src/_includes/components/structured-data.njk` (`SportsActivityLocation`, `LocalBusiness`, `FAQPage`).

### 2. CHANGE CAREFULLY
* **Page Titles:** Retain keyword for search engines; add outcome promise for CTR.
  * *Kids Page Title:* `Kids Martial Arts & Jiu-Jitsu in Tannersville, NY | Sensei Sandy BJJ`
  * *Homepage Title:* `BJJ & Family Martial Arts in Tannersville, NY | Sensei Sandy BJJ`
* **Meta Descriptions:** Shift from generic class descriptions to parent-facing emotional outcomes.
  * *Proposed Kids Description:* "Help your child build confidence and handle hard things calmly. Small-group Jiu-Jitsu in Tannersville, NY. Reserve a Free First Visit."

### 3. DO NOT TOUCH
* **Sitemap and robots architecture:** `eleventy.config.js:L4-15` and `data/url-registry.json`.
* **Legacy redirect maps:** `config/legacy-redirects.json` and `.htaccess`.
* **Verified historical lineage records:** `src/sensei-jiu-jitsu.html`.

### 4. NEW OPPORTUNITY
* Enhance local town landing pages (`/bjj-classes/hunter-ny`, `/bjj-classes/windham-ny`, `/bjj-classes/haines-falls-ny`) by framing travel time around a family afternoon routine: *"Just 8 minutes from Hunter. Youth class at 5:00 PM, adult class at 6:00 PM."*

---

# Prioritized Devlist

### P0: Fix First (Blocks Positioning or Funnel)
1. **P0-1: Stop-Slop Cleanup on Core Pages**
   * *Files:* [`src/partials/home-conversion-shell.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html), [`src/partials/program-conversion-teens.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-teens.html), [`src/parent-resources.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html).
   * *Action:* Remove em-dashes, adverbs, and binary contrasts. Fix the absolute injury claim in [`src/blog/beginners-guide-bjj-human-chess/index.html:98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html#L98).
   * *Effort:* S | *Risk:* Low.

2. **P0-2: Booking Confirmation Cross-Sell**
   * *Files:* [`src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L50-59`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk#L50-59).
   * *Action:* Remove script logic that deletes adult copy on youth reservations. Replace it with an inviting callout for parents to try a class.
   * *Effort:* S | *Risk:* Low.

3. **P0-3: Repair /how-class-works Build Truncation**
   * *Files:* [`eleventy.config.js:L166-171`](file:///home/twizss/Documents/ssbjjweb/tmb/eleventy.config.js#L166-171), [`src/how-class-works.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html).
   * *Action:* Remove regex stripping from `acquisition-page-subtraction` transform so the parent expectations and class breakdown sections render correctly.
   * *Effort:* S | *Risk:* Low.

### P1: High Leverage (Improves Comprehension, Trust & Family Conversion)
1. **P1-1: Homepage Message Alignment**
   * *Files:* [`src/partials/home-conversion-shell.html:L62`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L62), [`src/index.html:L212-225`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L212-225).
   * *Action:* Change hero eyebrow to "CALM UNDER PRESSURE · TANNERSVILLE, NY". Unhide the family value block ("Good Training for Them. A Better Routine for You.").
   * *Effort:* S | *Risk:* Low.

2. **P1-2: Youth-to-Adult Program Bridge**
   * *Files:* [`src/partials/program-conversion-kids.html:L6-8`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-kids.html#L6-8).
   * *Action:* Add "Your kid does not have to be the only one getting stronger" callout with links to adult beginner classes.
   * *Effort:* S | *Risk:* Low.

3. **P1-3: Family Routine Highlighting on Schedule**
   * *Files:* [`src/schedule.html:L52-56`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html#L52-56).
   * *Action:* Add callout banner emphasizing the 5:00 PM youth and 6:00 PM adult back-to-back schedule.
   * *Effort:* S | *Risk:* Low.

4. **P1-4: Adult Program Image Swap**
   * *Files:* [`src/partials/program-conversion-adults.html:L3`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-adults.html#L3).
   * *Action:* Replace low-resolution male-only thumbnail with a high-resolution, welcoming image showing diverse adult students with Sandy.
   * *Effort:* S | *Risk:* Low.

### P2: Supporting Alignment (Useful Improvement)
1. **P2-1: Add "Our Family" Profile to Dedicated Booking Page**
   * *Files:* [`src/free-bjj-intro-tannersville-ny/index.html:L75-170`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html#L75-170).
   * *Action:* Add family button matching the homepage builder options.
   * *Effort:* M | *Risk:* Low.

2. **P2-2: Sharpen Social Proof Outcome Badges**
   * *Files:* [`src/partials/reviews-village.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/reviews-village.html), [`src/success-stories.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html).
   * *Action:* Add clear outcome badges above quotes (**Nervous Beginner Made Comfortable**, **Safe Partner Care**, **Family Routine**).
   * *Effort:* S | *Risk:* Low.

3. **P2-3: Remove Jargon from Bio**
   * *Files:* [`src/bio.html:L28`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bio.html#L28).
   * *Action:* Replace "A VIP first-class feel" with "A welcoming, coach-led first class."
   * *Effort:* S | *Risk:* Low.

### P3: Polish (Do Last)
1. **P3-1: Audit Navigation Labels**
   * *Files:* [`nav-include.html:L43-48`](file:///home/twizss/Documents/ssbjjweb/tmb/nav-include.html#L43-48).
   * *Action:* Ensure program links clearly read: Kids (Ages 5–9), Teens (Ages 10–17), Adults (Ages 18+).
   * *Effort:* S | *Risk:* Low.

---

# Recommended First Implementation Pass

To achieve the largest perceptual change with the smallest technical release, execute this 4-step sequence:

1. **Step 1: Homepage & Global Header Outcome Framing (Content-Only)**
   * Update topbar text in [`nav-include.html:L28-29`](file:///home/twizss/Documents/ssbjjweb/tmb/nav-include.html#L28-29) to emphasize family composure under pressure.
   * Change hero eyebrow in [`src/partials/home-conversion-shell.html:L62`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L62) to "CALM UNDER PRESSURE · TANNERSVILLE, NY".
   * Unhide the family value block in [`src/index.html:L212`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L212) ("Good Training for Them. A Better Routine for You.").

2. **Step 2: Adult Bridge in Youth Funnels (Content + Template)**
   * Add the "Parents train too" callout to [`src/partials/program-conversion-kids.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-kids.html).
   * Modify [`src/free-bjj-intro-tannersville-ny/confirmation/index.njk`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk) to preserve adult training invitations for parents who book for children.

3. **Step 3: Schedule Convenience Callout (Content-Only)**
   * Add the family routine banner to [`src/schedule.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html) highlighting the 5:00 PM youth / 6:00 PM adult sequence.

4. **Step 4: Clean Stop-Slop Tells (Prose Quality)**
   * Fix the absolute injury claim in [`src/blog/beginners-guide-bjj-human-chess/index.html:98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html#L98).
   * Strip adverbs, binary contrasts, and em-dashes across [`src/parent-resources.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html) and [`src/partials/program-conversion-teens.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-teens.html).

---

# Deferred Ideas

1. **Dedicated "Parents Who Train" Landing Page**  
   * *Rationale:* Unnecessary new route. School families and program pages can handle this messaging via existing cards without diluting search authority.
2. **Interactive Family Schedule Wizard**  
   * *Rationale:* High technical complexity. The static weekly calendar table already displays the back-to-back hours clearly.
3. **Automated Multi-Student Billing Calculator**  
   * *Rationale:* Violates simplicity rules. Direct SMS interaction with Sandy handles custom family tuition questions cleanly.

---

# Affordance Matrix

| Priority | Route / Component | Desired Behavior | Current Behavior | Gap | Affordance | Files | Effort | Risk |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P0** | Global / Blog & Guides | Clean prose without AI slop, adverbs, or extreme claims. | Contains em-dashes, adverbs, binary contrasts, and an absolute injury claim. | Wording contradicts safety standards and triggers QA checks. | A1 | [`src/blog/beginners-guide-bjj-human-chess/index.html:98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html#L98), [`src/parent-resources.html:L53-83`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L53-83) | S | Low |
| **P0** | Confirmation Route | Invite parents to train when booking for children. | Script deletes adult copy when youth profile is selected. | Erases adult cross-sell at maximum intent moment. | A4 | [`src/free-bjj-intro-tannersville-ny/confirmation/index.njk:L50-59`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/confirmation/index.njk#L50-59) | S | Low |
| **P0** | `/how-class-works` | Display complete parent expectations and class timeline. | Eleventy transform removes sections and leaves blank areas. | Broken anchor links and missing content in output. | A6 | [`eleventy.config.js:L166-171`](file:///home/twizss/Documents/ssbjjweb/tmb/eleventy.config.js#L166-171), [`src/how-class-works.html`](file:///home/twizss/Documents/ssbjjweb/tmb/src/how-class-works.html) | S | Low |
| **P1** | `/` (Hero & Shell) | Lead with "Calm Under Pressure" family positioning. | Leads with category keywords in eyebrow; family value block is hidden. | Misses primary brand positioning. | A1/A3 | [`src/partials/home-conversion-shell.html:L62`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L62), [`src/index.html:L212`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L212) | S | Low |
| **P1** | Kids Program Page | Introduce adult training to parents reading about youth classes. | Omit all mentions of adult training. | Siloes youth and adult programs. | A4 | [`src/partials/program-conversion-kids.html:L6-8`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-kids.html#L6-8) | S | Low |
| **P1** | Adults Program Page | Present welcoming, non-intimidating adult training environment. | Low-res photo showing only young male grapplers. | Narrows audience perception; deters parents and women. | A2 | [`src/partials/program-conversion-adults.html:L3`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/program-conversion-adults.html#L3) | S | Low |
| **P1** | `/schedule` | Highlight family convenience (5 PM youth, 6 PM adult). | Lists class times as disconnected rows. | Misses compelling family routine selling point. | A4 | [`src/schedule.html:L52-56`](file:///home/twizss/Documents/ssbjjweb/tmb/src/schedule.html#L52-56) | S | Low |
| **P2** | Dedicated Booking Flow | Allow families to register together in Step 1. | Lacks "Our family" profile button. | Inconsistent with homepage builder options. | A4 | [`src/free-bjj-intro-tannersville-ny/index.html:L75-170`](file:///home/twizss/Documents/ssbjjweb/tmb/src/free-bjj-intro-tannersville-ny/index.html#L75-170) | M | Low |
| **P2** | `/success-stories` | Tag reviews by outcome (Composure, Safety, Family Routine). | Reviews grouped without prominent outcome labels. | Slower proof discovery for skeptical parents. | A1 | [`src/success-stories.html:L40-55`](file:///home/twizss/Documents/ssbjjweb/tmb/src/success-stories.html#L40-55) | S | Low |
| **P3** | Navigation & Bio | Clear civilian labels; humble coaching tone. | Bio contains "VIP first-class feel" status crutch. | Conflicts with grounded, family-first culture. | A1 | [`src/bio.html:L28`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bio.html#L28), [`nav-include.html:L43-48`](file:///home/twizss/Documents/ssbjjweb/tmb/nav-include.html#L43-48) | S | Low |

---

# Page-by-Page Scorecard

Scored on a scale of 0 to 5 for positioning alignment:

| Page / Route | Outcome Clarity | Parent Relevance | Adult Visibility | Family Identity | Beginner Safety | Reason to Believe | CTA Clarity | Mobile Hierarchy | SEO Preservation | Message Consistency | Overall |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Homepage (`/`)** | 4/5 | 4/5 | 3/5 | 3/5 | 4/5 | 4/5 | 5/5 | 5/5 | 5/5 | 4/5 | **4.1** |
| **Kids (`/bjj-classes/kids...`)** | 4/5 | 5/5 | **1/5** | 2/5 | 5/5 | 4/5 | 5/5 | 4/5 | 5/5 | 4/5 | **3.9** |
| **Teens (`/bjj-classes/teens...`)** | 4/5 | 4/5 | 2/5 | 2/5 | 4/5 | 4/5 | 5/5 | 4/5 | 4/5 | 4/5 | **3.7** |
| **Adults (`/bjj-classes/adults...`)** | 4/5 | 2/5 | 5/5 | **1/5** | 5/5 | 4/5 | 5/5 | 4/5 | 4/5 | 4/5 | **3.8** |
| **School Families (`/school-families...`)** | 3/5 | 4/5 | 3/5 | 4/5 | 4/5 | 3/5 | 4/5 | 4/5 | 4/5 | 3/5 | **3.6** |
| **Schedule (`/schedule`)** | 3/5 | 3/5 | 4/5 | 2/5 | 4/5 | 4/5 | 5/5 | 4/5 | 5/5 | 4/5 | **3.8** |
| **Intro (`/free-bjj-intro...`)** | 4/5 | 4/5 | 4/5 | 2/5 | 5/5 | 4/5 | 5/5 | 4/5 | 4/5 | 4/5 | **4.2** |
| **Confirmation (`/free-bjj.../confirm`)** | 4/5 | 4/5 | **1/5** | **1/5** | 5/5 | 4/5 | 4/5 | 4/5 | 5/5 | 3/5 | **3.5** |
| **Pricing (`/options-pricing`)** | 3/5 | 4/5 | 4/5 | 2/5 | 4/5 | 3/5 | 5/5 | 4/5 | 4/5 | 3/5 | **3.6** |
| **How Class Works (`/how-class-works`)** | 3/5 | 3/5 | 3/5 | 2/5 | 3/5 | 3/5 | 4/5 | 3/5 | 4/5 | 2/5 | **3.0** |

### Areas Scored 0–2 (Critical Failures to Address)
* **Adult Visibility on Kids Page (1/5):** Complete omission of adult training prevents parent cross-sell.
* **Family Identity on Adults Page (1/5):** Adult page treats students as isolated individuals; never mentions family convenience.
* **Adult & Family Visibility on Confirmation (1/5):** Script deletes adult information when a youth intro is scheduled.
* **Family Identity on Schedule (2/5):** Fails to connect the 5 PM youth and 6 PM adult hours into a unified family routine.

---

# Specific Answers to Audit Questions

### Positioning
1. **What does the homepage currently appear to sell?**  
   It sells small-group Brazilian Jiu-Jitsu classes across three age divisions (kids, teens, adults) with an interactive 3-step visit planner.
2. **Is the primary perceived category "kids BJJ," "martial arts," "family martial arts," or something else?**  
   It leans toward "kids martial arts with separate adult classes attached." Hero imagery and town landing pages heavily feature children.
3. **Where could "calm under pressure" become the organizing idea without a redesign?**  
   In the global brand subtitle ([`nav-include.html:L28`](file:///home/twizss/Documents/ssbjjweb/tmb/nav-include.html#L28)), the homepage hero eyebrow and subhead ([`src/partials/home-conversion-shell.html:L62`](file:///home/twizss/Documents/ssbjjweb/tmb/src/partials/home-conversion-shell.html#L62)), and the footer summary ([`footer-include.html:L12`](file:///home/twizss/Documents/ssbjjweb/tmb/footer-include.html#L12)).
4. **Which existing copy actively conflicts with this positioning?**  
   - [`src/bio.html:L28`](file:///home/twizss/Documents/ssbjjweb/tmb/src/bio.html#L28): "A VIP first-class feel" (status marketing crutch).  
   - [`src/blog/beginners-guide-bjj-human-chess/index.html:98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/blog/beginners-guide-bjj-human-chess/index.html#L98): "100% effort with 0% injury" (absolute safety guarantee).  
   - [`src/parent-resources.html:L83, L119`](file:///home/twizss/Documents/ssbjjweb/tmb/src/parent-resources.html#L83): Binary contrast formulas ("not just a room full of kids").

### Family
5. **How obvious is it that adults train at SSBJJ?**  
   Partially visible on the homepage, but completely absent once a parent navigates into youth-specific pages.
6. **How obvious is it that parents can become students?**  
   Not obvious at all. The copy never addresses parents sitting in the viewing area as potential participants.
7. **Can existing components create a Kids → Teens → Adults continuum?**  
   Yes. The 3-card bento grid on the homepage ([`src/index.html:L87-106`](file:///home/twizss/Documents/ssbjjweb/tmb/src/index.html#L87-106)) and the program cards on `/programs` ([`src/programs.html:L43-98`](file:///home/twizss/Documents/ssbjjweb/tmb/src/programs.html#L43-98)) already display all three age groups in sequence.
8. **Can current schedules visually support the family-convenience story?**  
   Yes. The schedule runs Youth at 5:00 PM and Adults at 6:00 PM every weekday. Adding a banner makes the family routine obvious.

### Conversion
9. **Where does the site sell mechanisms before outcomes?**  
   On `/options-pricing` (lists class counts and uniforms before habits) and `/how-class-works` (lists technical drill names before explaining composure).
10. **Where does it create unnecessary first-visit uncertainty?**  
    The split intake policy (adults wear everyday clothes for a talk; kids wear gym clothes to train immediately) needs plain explanation so parents do not worry about what to wear or whether they will be forced to work out.
11. **Which CTA patterns are already working and should remain unchanged?**  
    Primary CTA: "Reserve Your Free First Visit"; Secondary CTA: "Text Sandy" (`sms:+19177368649`).
12. **Where would additional copy reduce rather than increase conversion?**  
    The homepage hero. Lengthening hero copy would push the 3-step booking card below the mobile fold.

### Design
13. **Can current hero/components express the new hierarchy?**  
    Yes. The editorial split hero contains dedicated typography hooks for eyebrows, headings, subheads, and interactive forms.
14. **Which changes are content-only?**  
    Eyebrows, headings, body text, review tags, metadata descriptions, and title tags across core routes.
15. **Which require component extensions?**  
    Adding the "Our family" button to the intro booking page and adding the parent bridge card to the confirmation template.
16. **Is any new page actually required?**  
    No. Existing routes cover all necessary customer questions.

### SEO
17. **Which existing pages capture martial-arts comparison intent?**  
    `src/after-school.html`, `src/blog/bjj-sensei/index.html`, `src/sensei-jiu-jitsu.html`, and the local town landing pages (`hunter-ny`, `windham-ny`).
18. **Which keywords must remain explicit even if visible messaging becomes more emotional?**  
    "Brazilian Jiu-Jitsu", "BJJ", "kids martial arts", "Tannersville", "Hunter", "Windham", "schedule", "pricing".
19. **Is there a clean way to separate search-intent copy from conversion hierarchy?**  
    Yes. Keep search keywords in title tags, URLs, and eyebrows; use emotional transformation copy for H1s, subheads, and callouts.

### Adults
20. **What currently makes the academy look child-first?**  
    Child-dominated photography on the homepage and school pages; adult program placed third in navigation; adult references deleted on youth booking confirmation.
21. **What assets/components could correct that perception fastest?**  
    Replace `community-320.6d7bac.webp` with an authentic photo of adult beginners and parents on the mat; add parent callouts to youth pages.
22. **Is adult training visible within the youth customer journey?**  
    No. It is absent from youth program pages and stripped from confirmation screens.

---

# Verification and QA Commands

Execute these commands to verify codebase integrity and prose quality:

```bash
# Verify volatile operational facts (schedule, tuition, phone)
rtk npm run qa:volatile-facts

# Verify stop-slop rules across source files
rtk npm run qa:stop-slop

# Verify internal links and canonical paths
rtk npm run validate:links

# Verify schema and JSON-LD integrity
rtk npm run qa:schema

# Full site build and validation
rtk npm run build
```
