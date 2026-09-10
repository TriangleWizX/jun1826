# CRO opportunities from the simplification framework

Date: 2026-09-09
Scope: audit only; no product, pricing, schedule, or production changes made
Primary conversion: a qualified local prospect reserves a Free First Visit and completes the next confirmed step.

## Executive conclusion

The pasted framework creates a strong CRO thesis: reduce the number of decisions a new local prospect must understand before trying the academy. The codebase already has a useful three-step booking builder, audience lanes, schedule-aware choices, and privacy-safe funnel events. The largest opportunity is therefore not a new funnel. It is removing competing language and offer choices around that funnel while preserving operational truth.

Recommended sequence:

1. Make the homepage and pricing page present one obvious local-beginner path.
2. Collapse or rename the public-facing Goal Mapping step inside the existing Free First Visit flow.
3. Remove reserved-seat/entitlement language from acquisition pages only after the owner approves the new product rule.
4. Demote packs, annual, keyholder, private, and visitor products from the beginner decision architecture.
5. Measure the existing funnel by audience lane before testing larger changes.

## Evidence and constraints

- `src/partials/home-conversion-shell.html:57-84` already presents the homepage hero, audience selector, schedule choice, contact fields, reassurance copy, proof, and schedule links.
- `src/partials/home-conversion-shell.html:64-78` shows a three-step form with name, phone, email, audience, and first-class selection. This is a good substrate for simplification; replacing it would add risk.
- `src/partials/home-conversion-shell.html:60` uses “Plan Your Free First Visit,” while the form submit at line 68 uses “Reserve Your Free First Visit.” Standardizing the primary label is a small clarity win.
- `src/programs.html:15-27` describes three audience cards, the first-visit process, a goal-mapping conversation, and the shared youth product. It also asks visitors to process several operational distinctions before booking.
- `src/programs.html:128-150` exposes private coaching, visitor access, and flexible class packs under “More Ways to Train.” These are legitimate products but compete for attention with the local beginner path.
- `src/programs.html:158-203` contains a hidden first-visit and shared-benefits section. Hidden content cannot do CRO work; if these objections matter, selected parts belong in the visible decision path.
- `src/options-pricing.html` is the public pricing destination and is built around multiple offer categories. The strategy document `docs/product-offer-strategy.md` explicitly classifies Core Culture as primary, visitor products as secondary, packs as restricted, and annual/keyholder as qualification-only.
- `src/how-class-works.html:17-51` and `docs/tree.md:217-229` use reserved-window, home-class, makeup, and missed-reservation language. This is a likely friction source if the intended product becomes “train up to three times per week” rather than contractual recurring seats.
- The existing funnel documentation and QA references in `docs/conversion/FREE_INTRO_FUNNEL.md`, `docs/analytics/funnel-tracking-plan.md`, and `scripts/qa-funnel.mjs` provide a measurement base. Do not create new KPIs during the proposed freeze; use the existing stages and lane fields.
- The worktree is already heavily modified and contains unrelated generated/source changes. Any implementation should be path-scoped and should not overwrite or clean those changes.

## Prioritized opportunities

### P0 — Make the primary decision unmistakable

**Hypothesis:** Cold local visitors convert more often when the homepage answers “what do I do next?” with one primary action instead of making them interpret the academy’s internal offer system.

**Current friction:** The homepage has a primary booking CTA, a schedule CTA, a four-choice audience selector, proof, and a schedule section above the rest of the argument. The promise is emotionally strong, but “Plan,” “Reserve,” “Free First Visit,” and “first class” are all used in the same surface.

**Opportunity:** Keep the existing builder, but make the visual and verbal hierarchy explicit: “Jiu-jitsu for kids, teens, and adults in Tannersville” → “Try your first visit free” → audience choice → confirmed next step. Keep schedule as a reassurance/secondary action.

**Smallest implementation:** Align hero, builder, and repeated homepage CTA labels to one approved primary CTA. Add one short sentence near the hero CTA explaining what happens after clicking. Avoid adding another funnel or modal.

**Guardrails:** Preserve lane query parameters, hidden attribution fields, Formspree fields, confirmation routing, and current schedule authority.

**Measure:** homepage CTA click → booking started → booking submitted, segmented by child/teen/adult/family; monitor form errors and completion, not just clicks.

### P0 — Collapse Goal Mapping as a public stage

**Hypothesis:** Naming an extra “Goal Mapping” stage increases perceived effort after a prospect has already agreed to try the academy.

**Current friction:** `src/programs.html:19-25` describes a first visit, goal mapping, tour, questions, and first-class selection. The pasted framework explicitly recommends performing goal discovery inside the Intro rather than presenting it as a separate decision.

**Opportunity:** Keep the staff conversation and internal qualification questions, but describe the visitor path as “Free First Visit → coached first class → decide if Core is a fit.” Use plain language such as “Sandy asks what you want from training and helps choose the right first class.”

**Smallest implementation:** Update visible acquisition copy and CTA labels only after the terminology/product owner approves the canonical name. Do not remove internal fields or tracking that support attribution and lane routing.

**Measure:** booking-start to submit rate; post-booking confirmation/show rate; qualitative “I knew what would happen” response in follow-up.

### P0 — Remove public competition from the pricing decision

**Hypothesis:** Showing every valid product to a new local prospect weakens the intended Free Intro → Core path and increases choice anxiety.

**Current friction:** The pricing page is a broad options catalog. The strategy document says Core Culture is primary, Day Pass/Vacation Week secondary, packs restricted, and Annual/Keyholder qualification-only. This is a direct architecture-versus-strategy opportunity.

**Opportunity:** Make the pricing page answer “What should a new local beginner choose?” first. Present Core for youth/teens and adults as the recommended next paid step after the Free Intro. Place visitor products in a clearly labeled visitor section. Move packs, annual, keyholder, and concierge behind qualification or member-context disclosures.

**Smallest implementation:** Reorder and label existing modules; do not delete operational products or change prices. Use the approved central offer source rather than manually duplicating prices.

**Gate:** owner approval of every price, eligibility rule, and customer-facing entitlement before publication.

**Measure:** pricing-page Free Intro CTA rate, clicks into secondary offers, booking completion, and qualified post-intro Core conversations.

### P1 — Replace reserved-seat language with a simpler entitlement, if approved

**Hypothesis:** “Reserved,” “home classes,” “makeup,” and “open seats” make a simple training benefit feel like an inventory contract.

**Current friction:** `src/how-class-works.html:17-51` describes a reserved 60-minute window; `docs/tree.md:217-229` describes weekly routines, missed reservations, and rescheduling constraints. This conflicts with the pasted model’s proposed “up to three times per week” entitlement.

**Opportunity:** After the operating model changes, acquisition pages should say what a student can do and how coaching helps them establish a usual routine. Keep capacity and rescheduling rules available where they answer a real question, not as the headline product concept.

**Smallest implementation:** First update the authoritative offer/entitlement policy; then synchronize pricing, program, FAQ, how-class-works, show-up, and confirmation copy. Run volatile-facts and product-lifecycle QA.

**Do not implement from this audit:** The pasted $550/$715 prices, 12-person threshold, or reservation removal are business decisions, not codebase facts to infer.

### P1 — Make the post-Intro choice a two-lane decision

**Hypothesis:** New prospects need to choose “youth/teen” or “adult,” then experience training; they do not need to compare the full catalog before trust exists.

**Current friction:** `src/programs.html:41-150` gives equal visual weight to core audience programs and several specialized products. The framework recommends four decisions ending in Core, with edge cases handled manually.

**Opportunity:** Keep Kids, Teens, and Adults as audience-fit pages, but give each one the same next-step architecture: fit → safety/beginner reassurance → schedule authority → Free First Visit. Use the pricing page for the Core explanation after the visitor understands fit.

**Measure:** program-page CTA rate and lane-specific booking completion; check that private/visitor traffic is not accidentally forced into the beginner funnel.

### P1 — Turn hidden objection content into selective visible reassurance

**Hypothesis:** Visitors will book more confidently when safety, first-class expectations, location, and “no payment/no commitment” appear at the moment of decision.

**Current friction:** `src/programs.html:158-276` contains useful first-visit, shared-benefit, schedule, and preparation content but marks the sections hidden. The homepage does expose some reassurance, but not all high-value objections.

**Opportunity:** Promote only the strongest three or four answers near the CTA: what happens, who it is for, what to wear/expect, and how confirmation works. Avoid restoring a long page or duplicating schedule systems.

**Measure:** CTA interaction, booking abandonment by step, mobile scroll depth if available, and support texts asking what happens next.

### P2 — Keep segmentation, remove catalog exposure

**Hypothesis:** Segmentation improves relevance; displaying every segment’s product is unnecessary cognitive load.

**Current friction:** The codebase supports family, youth, adult, community-service, visitor, private, annual, keyholder, and pack pathways. The framework specifically says packs should remain available for edge cases without becoming the local beginner journey.

**Opportunity:** Route by intent: local beginner to Free First Visit/Core; vacationing practitioner to visitor page; approved irregular visitor to staff-assisted pack; returning member to renewal review.

**Implementation:** Audit header/footer, programs, pricing, homepage, blog CTAs, and local landing pages for accidental equal-weight links. Preserve direct links and noindex rules for restricted products.

### P2 — Retire proprietary vocabulary at the first decision

**Hypothesis:** Internal labels help staff coordinate but can slow a cold visitor’s understanding.

**Current friction:** “Core Culture,” “Goal Mapping,” “Annual Track,” “Keyholder,” “home classes,” and similar terms appear across editorial and offer surfaces. Some are approved terminology; approval does not prove they belong above the fold.

**Opportunity:** Use descriptive language first (“12-week jiu-jitsu program,” “first visit,” “renewal review”), with official names as secondary labels where needed for contracts and continuity.

**Guardrail:** Do not run a blind sitewide replacement. The existing terminology contract and legacy-route rules must be reviewed phrase by phrase.

### P2 — Formalize a CRO measurement decision record

**Hypothesis:** Simplification can improve booking conversion while harming qualification, attendance, capacity, or close rate; one top-line conversion number is insufficient.

**Opportunity:** Use existing events and add a short decision record for each change: hypothesis, affected routes, primary metric, guardrail metrics, minimum observation window, and rollback condition. Keep the existing funnel stages; do not add reporting complexity during the freeze.

**Suggested guardrails:** show rate, first-class attendance, Core conversation rate, lane mix, reschedule/support volume, and class-capacity complaints.

## What not to implement from the pasted brief yet

- Do not hard-code or change the proposed $550 youth / $715 adult prices without owner approval and canonical-source reconciliation.
- Do not remove reservations or promise unlimited/open attendance without an approved entitlement policy and capacity evidence.
- Do not expose an unapproved “12-person cap” claim as a commercial promise merely because it appears in the brief.
- Do not create new funnels, class types, KPIs, forms, or reporting systems during the proposed freeze.
- Do not delete class-pack, visitor, private, annual, or keyholder pages; demote or qualify them according to approved offer policy.
- Do not rewrite the large set of currently modified generated/source files in this dirty worktree as part of a CRO audit.

## Recommended implementation order

1. Owner decision: public product/entitlement rule and canonical terminology.
2. Homepage CTA and message hierarchy, preserving the current builder and tracking.
3. Pricing page information architecture and qualification labels.
4. First-visit copy: public path simplified, staff goal discovery retained.
5. Program-page and FAQ synchronization.
6. Secondary-route/catalog link audit.
7. Focused mobile and desktop browser QA, then funnel and volatile-facts QA.
8. Observe existing funnel and guardrail metrics before attempting experiments.

## Verification checklist for a future implementation

- One primary Free First Visit CTA is visible above the fold on homepage, pricing, and program pages.
- Audience/lane routing remains correct for child, teen, adult, family, and community-service paths.
- Form submission, confirmation redirect, session storage, attribution fields, and analytics events remain intact.
- No public page makes an unapproved price, schedule, capacity, availability, guarantee, or entitlement claim.
- Core is visually primary; visitor products are secondary; restricted/member products are qualified.
- Mobile layout keeps the CTA and first meaningful reassurance visible without a large media or duplicate schedule block.
- Every changed route has correct title, description, canonical, robots treatment, H1, internal links, structured data, and image alt text.
- Run the relevant project QA, including build, funnel, volatile-facts, SEO, link, and diff checks.

## Audit limitation

The codebase-memory MCP graph service was unavailable during this pass (`Transport closed` on status/index calls). This audit therefore uses direct current-file and documentation evidence, with line references, and should be refreshed through the graph once the service is available before a broad refactor.
