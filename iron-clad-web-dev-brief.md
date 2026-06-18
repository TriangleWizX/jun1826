# Iron-Clad Web Developer Brief

**Audience:** Senior Frontend Engineer + CRO Specialist  
**Tone:** Metric-driven. Exacting. No speculation.  
**Primary outcome:** Qualified Free Intro bookings (not casual clicks).
**Event map:** `analytics-event-map.md`

## 0) Definitions and Success Metrics

**Primary KPI:** `starter_plan_submit`  
**Secondary KPIs:** `admissions_call_booked`, `starter_plan_click` (top/inline/nav), `quiz_complete`  
**Quality KPI (lead filter):** `starter_plan_to_show_rate` (requires CRM alignment)

**Definition: “Free Intro”**
- User completes the Free Intro step (form submit or scheduler completion) and lands on a confirmation state.
- “Free Intro click” is not a conversion. It is an intent signal.

**Legacy mapping (transition)**
- `apply_click` → `starter_plan_click`
- `application_submit` → `starter_plan_submit`
- `application_to_show_rate` → `starter_plan_to_show_rate`

## 1) Core Web Vitals (Non-Negotiable)

**Targets (mobile-first):**
- **LCP:** < 2.0s
- **CLS:** 0.00 (zero layout shifting allowed)
- **FID:** < 100ms (track INP as the modern interaction metric)

**Measurement rules (required):**
- Test on mobile throttling equivalent to mid-tier Android + 4G.
- Run Lighthouse for each key landing page variant.
- Verify field data once deployed (RUM or Search Console CWV).

**Implementation constraints (required):**
- **Hero media:** explicit `width`/`height`, responsive `srcset`, modern format (AVIF/WebP), no late-loading swaps that change layout.
- **Fonts:** avoid layout shifts from font swaps. Prefer system font or preload a single font file with `font-display: swap` + fallback metrics.
- **No CLS from fixed bars:** any fixed top/bottom bars must reserve space (padding strategy) and must not “pop in” above content.
- **JS budget:** keep initial JS minimal. Defer non-critical scripts. Avoid blocking main thread on load.

## 2) Mobile Architecture (Thumb-Zone CTA, No Sticky Elements)

**Thumb-zone rule:**
- Primary CTA must be reachable by right thumb on typical mobile devices.
- If the page has a long scroll, maintain a persistent conversion affordance.

**No sticky elements (constraint):**
- Do not add sticky or fixed-position UI (no sticky headers, no sticky footers, no sticky CTAs).
- Keep conversion elements in the normal document flow.

**Thumb-zone execution (required):**
- Place the primary CTA above the fold on mobile.
- Repeat a primary CTA at the end of each major section (inline, not fixed).
- Use a short inline scarcity line near CTAs (example: “Only [X] spots left this month.”) sourced from the global config.

**State and data:**
- `spots_left` must be set from a single source of truth (config file or CMS value).
- All pages must show consistent counts and consistent month labels.

## 3) Quiz Logic (Conditional Branching)

**Purpose:** Segment intent before the CTA. Route users to the most resonant variant.

**Segmentation entry:**
- Step 1: **Are you an Adult or a Parent?** `[Adult] [Parent]`

**Branching rules (required):**
- If **Parent** selects **Bullying** → route to **Confidence** variant.
- If **Adult** selects **Stress Relief** → route to **Mental Clarity** variant.

**Routing implementation requirements:**
- Use a deterministic URL strategy so variants can be measured:
  - Preferred: `/confidence` and `/mental-clarity` pages, or
  - Acceptable: query param variants (example: `/6weekgrandslam?v=confidence`)
- Persist quiz selections in:
  - URL params (for attribution + shareability), and
  - `sessionStorage` (for continuity within the visit)

**Event instrumentation (required):**
- `quiz_start`
- `quiz_answer` (question_id + answer)
- `quiz_complete` (segment + primary_pain)
- `variant_view` (confidence | mental_clarity | default)
- `starter_plan_click` (location: top | inline | nav)
- `starter_plan_submit`
- `admissions_call_booked`

## 4) Tracking + Accessibility (A11y)

**WCAG 2.1 AA (required):**
- Color contrast meets AA for text and interactive components.
- Full keyboard navigation: visible focus states, logical tab order.
- ARIA labels for icon-only buttons and dynamic UI (quiz, fixed bars).
- Form errors must be announced and described, not just colored.

**Analytics requirements:**
- All conversion events must include:
  - `page_id`, `variant`, `audience_segment`, `spots_left`, `month_label`
- All Calendly (or scheduler) links must include UTMs:
  - `utm_source=website`
  - `utm_medium=calendly`
  - `utm_campaign={page_id}_{cta_type}`

## 5) Schema (JSON-LD)

**Inject JSON-LD on landing pages:**
- `EducationalOrganization` (business entity)
- `Event` (cohort start date)

**Minimum required fields:**
- Organization: `name`, `url`, `telephone`, `address`, `areaServed`
- Event: `name`, `startDate`, `eventAttendanceMode`, `eventStatus`, `location`, `offers`

**Validation:**
- Must pass Google Rich Results Test for the relevant schema types.

## 6) Acceptance Checklist (Ship Gate)

- LCP < 2.0s on mobile throttle for each variant
- CLS = 0.00 on mobile and desktop
- No sticky or fixed UI elements are introduced
- Quiz routes correctly (Adult/Parent) and preserves state via URL + sessionStorage
- All required events fire with required properties
- WCAG 2.1 AA pass on critical paths (quiz, Free Intro CTA, Free Intro flow)
- JSON-LD validates for `EducationalOrganization` and `Event`

## 7) How To Use This Brief (Execution)

**Kickoff inputs (required):**
- List the key pages to optimize (example: `/6weekgrandslam`, `/adult-bjj`, `/kids`, `/contact`).
- Confirm what counts as `starter_plan_submit` on this site (form submit, Calendly booked, or both).
- Confirm the single source of truth for `spots_left` and `month_label`.
- Decide whether variants are separate routes (`/confidence`, `/mental-clarity`) or query params.

**Build order (recommended):**
1. Implement thumb-zone CTA placement + inline CTA repeats (CLS gate).
2. Implement tracking events (so every change is measurable).
3. Implement quiz segmentation + routing (so variants can be tested).
4. Add schema (EducationalOrganization + Event).
5. Performance pass (hero media, fonts, JS budget) and validate CWV targets.

**Pre-deploy (required):**
- Run `scripts/predeploy.sh` to regenerate `assets/css/styles.min.css`.

## 8) Repo Mapping (This Codebase)

These are the existing hooks you should use instead of reinventing them:

- **Global config:** `js/site-config.js` defines `window.SENSEI_CONFIG` (`currentMonthLabel`, `newStudentSpots`, `grandSlamSpots`, `calendlyUrl`).
- **CTA hooks:** use `` and `` for Free Intro CTA links. Use `data-ss-cta-type` to label CTA intent for UTMs.
- **UTM strategy:** `js/site-config.js` already tags Calendly links with `utm_campaign={page_id}_{cta_type}`.
- **Scarcity copy:** any element with `[data-sensei-spots]` is automatically updated from config.
- **Footer UI:** `footer-include.html` contains footer navigation and quick links. Keep all footer elements non-sticky and in normal flow.
- **Audience hint:** several pages set `document.body.dataset.audience` and `nav-include.html` reflects it in “You’re viewing: …”.

## 9) Ticket Breakdown (Copy/Paste)

**Ticket A: Thumb-Zone CTAs (no sticky elements)**
- Ensure primary CTA is above the fold on mobile.
- Repeat a primary CTA inline at the end of major sections (hero, offer, FAQ, final CTA).
- Use `window.SENSEI_CONFIG.newStudentSpots` or `grandSlamSpots` as the source of truth for the scarcity line.
- Must not introduce CLS.

**Ticket B: Tracking**
- Instrument: `quiz_start`, `quiz_answer`, `quiz_complete`, `variant_view`, `starter_plan_click` (top/inline/nav), `starter_plan_submit`, `admissions_call_booked`.
- Each event includes: `page_id`, `variant`, `audience_segment`, `spots_left`, `month_label`.
- Validate that all Calendly links carry UTMs consistently.

**Ticket C: Segmentation Quiz + Routing**
- Add 2-step quiz: Segment (Adult/Parent) → Pain choice.
- Parent + Bullying routes to Confidence variant.
- Adult + Stress Relief routes to Mental Clarity variant.
- Persist state in URL params + `sessionStorage`.

**Ticket D: Schema**
- Add JSON-LD `EducationalOrganization` and `Event` (cohort start date) to landing pages.
- Validate in Rich Results Test and ensure it stays valid after deployment.

**Ticket E: Homepage Seasonal Promo Block (Summer)**
- Insert a compact seasonal promo block on `index.html` directly below hero trust bullets and above the “Take a Tour” section.
- Keep it as a promo extension of the existing calm, beginner-friendly homepage tone. Do not create a second hero.
- Required content structure:
  - Eyebrow: `Summer in Tannersville`
  - Headline: `Train This Summer at Sensei Sandy BJJ`
  - Body: `Beginner-friendly Brazilian Jiu Jitsu for kids, teens, adults, families, and Catskills visitors. Easy to start whether you live here full time, stay for the season, or are just in town for a week.`
  - Primary CTA: `See Summer Options` → `/summer-jiu-jitsu-tannersville`
  - Secondary CTA: `Book Your Intro` → `/schedule`
  - Optional chips: `Locals + visitors welcome`, `Private Lessons 4 • Youth Class 5 • Adults 6`, `Calm first class`
- UX constraints:
  - Keep section compact (no long paragraphs, no card grids, no autoplay media).
  - Match existing homepage visual language and CTA styling.
  - Mobile-first: headline within ~2 lines, stacked buttons, chips can wrap, generous tap targets.
  - No carousel/slider/extra nav links.
- Tracking:
  - Primary CTA event: `homepage_summer_promo_click`
  - Secondary CTA event: `homepage_summer_intro_click`
  - Optional view event: `homepage_summer_promo_view`
- Implementation note:
  - Build as reusable seasonal component/partial with copy props, CTA URL props, optional image prop, and simple on/off flag so it can be disabled post-summer without deleting markup.
