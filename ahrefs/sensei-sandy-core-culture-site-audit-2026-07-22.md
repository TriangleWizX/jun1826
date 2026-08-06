# Sensei Sandy BJJ Core Culture Website Audit

**Audit date:** July 22, 2026  
**Scope:** Live `senseisandy.com` page and blog sitemaps, with manual review of enrollment, pricing, schedule, program, partner, visitor, concierge, and campaign pages.

## Executive finding

The main customer journey is close to the intended model: the homepage, current schedule, Free Intro, core age-group pages, FAQ, law-enforcement page, and Elite Concierge page all present a calm, coached small-group experience. The commercial source of truth is not yet reliable, however. The public pricing page and machine-readable pricing file still publish legacy offers, different pass expirations, and conflicting annual prices. Several indexable campaign pages also compete with Core Culture by advertising unlimited access, one- and two-day rhythms, or separate first-month offers.

The fastest repair is to make one policy source authoritative, correct the two pricing surfaces first, retire the obsolete Confidence Protocol, then remove independent offer definitions from supporting pages.

## Core Culture source-of-truth model

| Element | Approved public rule |
|---|---|
| Local first term | 12-week Core Culture enrollment |
| Weekly rhythm | Three recurring home-class reservations per week; up to 36 scheduled classes |
| Rescheduling | By text, only when an appropriate open seat and partner fit are available |
| Youth | $550 for 12 weeks |
| Adult | $715 for 12 weeks |
| Community-Service Adult | $600 for 12 weeks; teachers, healthcare, law enforcement, veterans, firefighters, EMS, and other first responders |
| First-enrollment equipment | One academy gi for first-time Core Culture enrollment |
| Fit guarantee | Attend at least four classes in the first 30 days; request within 30 days; first Core term only |
| Annual renewal after first term | Youth $2,100; Adult $2,650; Community-Service Adult $2,250 |
| Visitors | Day Pass $35; Vacation Week $99 for up to three classes in seven days; 10-Class Pack $300/6 months; 20-Class Pack $550/12 months |
| Capacity | Classes capped at 12; no plan overrides the cap |

## Prioritized findings

### P0 — Correct public commercial facts before sending more traffic

1. **`/options-pricing` is the largest source of customer-facing conflict.**
   - Still offers Youth and Adult 2x-weekly Core Culture.
   - Still offers a Community Youth rate.
   - Says Core includes “up to 24 or 36” classes instead of one three-class rhythm.
   - Publishes multiple household combinations as if they are standing products.
   - Publishes Youth and Community 4-Week Flex options.
   - Gives class-pack expirations of 90 and 180 days.
   - Says Annual Track starts at $1,980 instead of publishing the current renewal prices.
   - **Action:** Replace the page with one first-term table, one visitor table, a short after-first-term section, and a manual “ask about household coordination” note. Remove 2x Core, Community Youth, 4-Week Flex, and the household price maze unless they remain formally approved products.

2. **`/pricing.md` conflicts with both the pricing page and the approved model.**
   - Youth annual is $1,980 instead of $2,100.
   - Community-Service Adult annual is $2,280 instead of $2,250.
   - Vacation Week promises unlimited training instead of up to three classes.
   - The 10-Class Pack is valid for 12 months instead of six.
   - “Full access” language can imply unlimited use.
   - **Action:** Generate this file from the same policy object used by the visible pricing page. Change “full access” to “the same three recurring home-class reservations and open-seat rescheduling.” State that the gi is included with first-time enrollment.

3. **`/blog/confidence-protocol` is an obsolete competing front-door offer.**
   - Advertises a $150, no-contract, 30-day program for kids, teens, and adults.
   - Promises unlimited training, a separate seven-day guarantee, a private onboarding audit, and a premium gi.
   - It is indexable, self-canonical, linked from the blog archive, and its offer language remains in blog metadata.
   - **Action:** 301 redirect to `/free-bjj-intro-tannersville-ny` or `/options-pricing`; remove it from the blog index and sitemap; purge its offer card/metadata from the blog build.

4. **Global CTA destinations are inconsistent.**
   - Many page headers send “Reserve Your Free Intro” directly to Calendly while body CTAs use the internal Free Intro page.
   - **Action:** Route every global CTA to `/free-bjj-intro-tannersville-ny`, which explains Goal Mapping and the reserved first class before opening the calendar.

### P1 — Remove access-model contradictions and live schedule errors

5. **`/parent-resources` presents once-, twice-, and three-times-weekly attendance as selectable local program rhythms.**
   - **Action:** Replace that section with “why three planned classes work,” explain home-class reservations and open-seat rescheduling, and direct families who cannot sustain the rhythm to discuss fit during the Free Intro. Do not imply a standing 1x or 2x Core product.

6. **`/schedule` and `/blog` still advertise Thursday 6:30 AM private coaching.**
   - The current private windows are Tuesday 6:30 AM and Wednesday/Friday mid-morning, by request.
   - **Action:** Remove Thursday from the schedule and blog class-picker. Keep private coaching visually separate from group access.

7. **`/black-belt-concierge` contains legacy Core and price language.**
   - Comparison table says Adult Core is “2–3 planned classes/week.”
   - Conversion policy values group classes at a $30 day-pass rate rather than $35.
   - Uses “standard membership” and “family training” language rather than the current enrollment structure.
   - **Action:** Change Core to exactly three planned classes; update the day-pass reference; use “Core Culture enrollment/renewal”; keep this page separate from Elite Concierge and outside the normal first-term decision.

8. **`/scribners-jiu-jitsu` gives partner staff old class times.**
   - Front-desk copy says Kids 4 PM / Teens 5 PM / Adults 6 PM.
   - **Action:** Change to Youth + Teen 5 PM and Adult 6 PM, with Saturday Adult No-Gi at 10:30 AM. Replace “small-group class” with “small-group class.”

9. **`/friday-night-fanatics` can create a second local trial path.**
   - Current students are correctly told the class counts as a regular session, but a $99 four-Friday pass is positioned for local families seeking a trial rhythm.
   - **Action:** Restrict the four-Friday pass to visiting/partner-school students, or remove it. Local first-time families should use Free Intro → Core Culture. Replace “active membership” with “active enrollment.”

10. **`/summer-jiu-jitsu-tannersville` is a dated standalone cohort competing with Core Culture.**
    - It advertises Tue/Thu 8:00 AM, 4–6 weeks, $249/$279, and separate sibling pricing.
    - **Action:** During the current cohort, change the CTA to “cohort in progress / join the next waitlist” and remove it from global program navigation. After August 6, 2026, 301 redirect to the Kids page unless a new dated cohort has been approved. Never present it as an evergreen alternative to Core.

### P2 — Consolidate duplicate and legacy program pages

11. **`/sensei-bully` and `/bully-proof-jiu-jitsu-tannersville-ny` are near-duplicate, self-canonical, indexable pages.**
    - **Action:** Keep `/bully-proof-jiu-jitsu-tannersville-ny` as the supporting anti-bullying intent page and 301 `/sensei-bully` to it. Link the retained page to canonical Kids and Teens pages rather than restating tuition or access.

12. **`/programs`, `/after-school`, `/bjj-classes/tannersville-ny`, and the three age-group pages overlap without a strict information hierarchy.**
    - **Action:** Preserve them only with distinct jobs:
      - `/programs`: audience router, no prices or alternate frequencies.
      - `/after-school`: parent-intent landing page, no separate offer.
      - `/bjj-classes/tannersville-ny`: local logistics/location page.
      - `/bjj-classes/kids-tannersville-ny`, `/teens-tannersville-ny`, `/adults-tannersville-ny`: canonical program pages.
    - Add a compact identical Core Culture block to the three canonical program pages, sourced from the central policy data. Supporting pages should link to it rather than define their own offer.

13. **`/catskills-home-base` is useful but should be the only visitor front door.**
    - **Action:** Keep it separate from local Core enrollment, remove “small-group” terminology, show the exact visitor limits, add it to the sitemap after finalization, and make `/options-pricing` link to it instead of duplicating a long visitor explanation.

14. **Legacy “small-group” terminology remains on `/nearby-towns`, `/report-card`, `/student-hub`, `/scribners`, and `/scribners-jiu-jitsu`.**
    - **Action:** Run a global replacement audit for customer-facing “small-group” references and use “coach-led small-group class.” Preserve true one-on-one work as “private coaching.”

## Information architecture after cleanup

| Page type | Owns | Must not own |
|---|---|---|
| `/options-pricing` | Public prices, terms, visitor limits, after-first-term options | Curriculum essays, local SEO copy |
| `/pricing.md` | Machine-readable mirror of the exact same facts | Independent prices or offer wording |
| `/schedule` | Current class times, private windows, rescheduling mechanics | Alternate tuition options |
| Age-group program pages | Audience fit, outcomes, schedule preview, compact Core summary | Custom frequencies or separate discounts |
| `/programs` | Routing to age group, private, community-service, visitor paths | Detailed pricing tables |
| `/catskills-home-base` | Visitors and seasonal families | Local first-term alternatives |
| Campaign/intent pages | One audience problem and CTA into the canonical path | Independent products, guarantees, or class-access promises |

## Implementation sequence

### Release 1 — Commercial truth

- Create one structured `offerPolicy` data object for prices, terms, class counts, guarantee, and visitor expirations.
- Render `/options-pricing`, `/pricing.md`, core program summary blocks, and pricing structured data from that object.
- Redirect Confidence Protocol.
- Standardize every Free Intro CTA.
- Deploy and verify desktop/mobile page copy plus rendered source.

### Release 2 — Access and schedule

- Rewrite Parent Resources frequency section.
- Remove Thursday private window from Schedule and Blog.
- Correct Black Belt Concierge and Scribner’s partner copy.
- Constrain Friday Night Fanatics and the live summer cohort.

### Release 3 — Consolidation

- Redirect `/sensei-bully`.
- Give Programs, After-School, Tannersville, and age-group pages distinct roles.
- Centralize visitor information under Catskills Home Base.
- Replace legacy “small-group” terminology across public pages.
- Update sitemap, canonicals, internal links, breadcrumbs, schema, and blog cards.

## Release acceptance checks

- Searching the rendered site for `2x weekly`, `up to 24`, `Community youth`, `Unlimited Training`, `$1,980`, `$2,280`, `$30 day-pass`, and `Thursday 6:30 AM` returns no active local-enrollment promises.
- Searching for `small-group` returns only intentionally retained historical quotations, if any.
- The visible pricing page and `pricing.md` match field-for-field.
- Every local first-time CTA resolves to the internal Free Intro flow.
- Every local Core page states exactly three recurring home classes, up to 36 classes, and capacity/partner-fit rescheduling.
- Vacation Week always says “up to three classes in seven days.”
- 10-Class Pack always says six months; 20-Class Pack always says 12 months.
- Annual prices appear only as Youth $2,100, Adult $2,650, and Community-Service Adult $2,250, and only after the first term.
- Retired URLs return a single-hop 301 to the selected canonical destination.
- Updated sitemap contains only canonical, indexable pages; campaign pages do not compete with core program pages for offer terms.

## Pages already substantially aligned

The homepage, Free Intro page, FAQ, Kids, Teens, Adults, Law Enforcement, and Elite Concierge pages already support the intended calm, coach-led model. They need consistency and centralization work, not wholesale rewrites. The current schedule also correctly presents the main youth/adult group times and the three-home-class Core Culture rule; its main correction is the extra Thursday private window.
