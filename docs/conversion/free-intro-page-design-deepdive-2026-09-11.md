<!-- Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 -->

# Free First Visit page — design and conversion deep-dive

**Route:** `/free-bjj-intro-tannersville-ny`  
**Purpose:** recommendation-only brief for future work with the Taste, Hallmark, and Impeccable skills  
**Pass boundary:** this document proposes enhancements only. It does not edit page copy, CSS, JavaScript, routes, booking URLs, offer rules, prices, schedules, analytics, or generated output.

## Design read

Reading this as: a trust-first local landing page with a functional booking workbench, for first-time adults, parents, teens, and returning students, using the existing Catskills Studio language: warm, editorial, tactile, calm, and operationally clear.

Recommended dials for future visual work:

- `DESIGN_VARIANCE: 5` — enough asymmetry to feel authored, restrained enough for a safety-sensitive first visit.
- `MOTION_INTENSITY: 2` — state-change motion only; the booking task must remain still and legible.
- `VISUAL_DENSITY: 4` — a complete argument, but with one dominant action surface.
- Impeccable mode: **Persuade**, with **Operate** discipline inside the scheduler and confirmation states.
- Hallmark genre: **editorial**, expressed through the existing Catskills Studio system rather than a new theme.

## Executive diagnosis

The page has the right underlying promise: a visitor is not being asked to “join a gym” or perform a workout immediately; they are being guided through a coached first-visit decision. The strongest opportunity is to make that promise the page’s visible organizing principle.

At present, the local source combines a strong split composition with too many parallel explanation layers on the left: a subtitle, a lane note, two step cards, four safety chips, a reassurance paragraph, a three-item ordered list, and a room image. The right side then introduces a second hierarchy for the booking flow. The result risks making a simple decision feel like a long form before the visitor has chosen a lane.

The desired future state is a single calm sequence:

`understand the visit → choose who is starting → choose a time → know what happens next`

The booking surface should feel like the page’s instrument panel. Supporting proof should clarify that instrument, not compete with it.

## Evidence and evidence boundaries

### Local source evidence

- The route title is “Plan Your Free First Visit | Sensei Sandy BJJ.”
- The hero promise is “Plan Your Free First Visit.”
- The page explains a 15-minute visit in normal clothes, no workout required, a room tour, goal discussion, and a coached first class afterward.
- The booking flow asks “Who’s starting?” before showing the time-selection state.
- Lanes include adult, child/teen, more than one person, community-service rates, and “Not sure? Get help choosing.”
- The route links to `/schedule`, Text Sandy, `/waiver`, and a preparation form.
- The local page uses the existing Double-Bezel / Workbench visual vocabulary and the studio image has dimensions and descriptive alt text.

### Published-page evidence

The approved live fetch on 2026-09-11 returned approximately 60 KB of HTML. Its visible response contained concatenated or malformed fragments around the subtitle, step content, headings, attributes, and links. This is not treated as proof of the intended local design; it is proof that source-to-generated-to-published authority must be reconciled before a visual redesign is judged complete.

### Not established by this brief

- Calendar inventory or appointment availability.
- Successful booking fulfillment, staff confirmation, attendance, or enrollment.
- Analytics receipt or attribution correctness.
- Search ranking, conversion lift, or business outcome.
- A browser screenshot comparison at all required widths.

## Visitor job and decision model

The page should answer one question at a time:

1. **What am I reserving?** A short, coached first visit to understand fit and plan the first class.
2. **Is this appropriate for me?** Adult, child/teen, more than one person, or help choosing.
3. **What will happen when I arrive?** Normal clothes, room tour, safety and goals, then a first-class plan.
4. **Can I make it work?** Select a time, inspect the current schedule, or text Sandy.
5. **What do I do after booking?** Follow the confirmation and waiver/preparation instructions.

Future layout and copy decisions should be evaluated against this sequence. A section that does not reduce one of these uncertainties should be shortened, demoted, or removed from the first-visit path.

## Recommended information architecture

This is the preferred enhancement direction, not an implementation specification yet.

### 1. Compact orientation header

Keep the real site masthead and its single visible `Reserve Free Intro` intent. Avoid adding a second promotional banner or a page-specific nav system. The route should feel like a focused continuation of the site, not an isolated microsite.

### 2. Split first viewport: promise + choice

Use the existing Split Studio / Workbench family, but make the booking choice the visual endpoint of the first viewport.

**Left column:**

- One short eyebrow identifying the Free First Visit.
- A two-line maximum headline describing the visit outcome.
- One compact reassurance line: normal clothes, no workout required, coached next step.
- One proof object only: either a small “what happens” sequence or the room image, not both at full emphasis.

**Right column:**

- A clear task label such as “Choose who is starting.”
- Three primary choices with unmistakable hierarchy.
- Youth age choices revealed only after selecting the youth branch.
- A quiet help path beneath the primary choices.

The first viewport should allow a visitor to understand the offer and select a lane without scanning the entire left column.

### 3. Focused “what the visit includes” proof band

After the first choice surface, use a horizontal or vertical sequence with three factual moments: meet Sandy, see the room and discuss goals, plan the coached first class. Keep it visibly subordinate to the booking control. Do not repeat the same sequence as cards, chips, and an ordered list.

### 4. Time-selection state as a dedicated workbench

When a lane is selected, the page should transition into a focused state rather than append another long page section. Retain the current schedule link and Text Sandy fallback, but place them as clearly secondary escape hatches around the scheduler.

The third-party calendar needs a visibly reserved task area with a stable height contract. The recent viewport audit already identifies the inline iframe height issue as a P0 implementation concern; this brief treats that as a prerequisite for future visual evaluation, not as a fix delivered here.

### 5. Confirmation state as a show-up kit

The confirmation should prioritize date/time authority, location, clothing, what happens next, waiver, and rescheduling by text. The user should not need to interpret internal terms or find the next action among general marketing content. Keep the preparation form available, but present it as a clear follow-on task.

## Conversion enhancements to consider

### Highest impact

- **Reduce competing explanation layers before lane selection.** The current left column explains the visit in several formats. Consolidation should lower cognitive load and make the lane choice feel safe and immediate.
- **Make the first-visit distinction explicit at the point of action.** Visitors should never confuse the scheduled 15-minute planning visit with the coached first class.
- **Put reassurance beside the decision, not only above or below it.** “Normal clothes,” “no workout required,” and the coached-learning framing belong adjacent to the choice/time task.
- **Give “not sure” a human, low-pressure route.** Keep it secondary, but make it feel like an intentional alternative for parents and uncertain beginners rather than an afterthought.
- **Use one proof surface near the first action.** The clean room image, safety walkthrough, or a specific attributed proof item can establish trust; multiple decorative proof systems dilute attention.

### Medium impact

- **Clarify audience branches without turning the page into a pricing selector.** Adult, child/teen, and multiple-person paths should be the first decision. Community-service qualification should remain available but not interrupt the primary choice hierarchy.
- **Show local confidence at the right moment.** Tannersville and nearby Catskills relevance should support arrival confidence, especially near the schedule/location decision, without making the hero keyword-heavy.
- **Keep the schedule authority visible but subordinate.** `/schedule` should answer “can I make this work?” without becoming a competing booking system.
- **Make the state change narratable.** After selection, the heading and live region should tell the visitor what changed: who is starting, what appointment they are choosing, and what will happen afterward.

### Testable hypotheses

- A shorter first viewport with the lane selector visible will increase progression to time selection compared with a fully expanded reassurance column.
- A factual three-step visit sequence will reduce uncertainty more effectively than four safety chips plus a repeated ordered list.
- “Reserve a Free First Visit” or the existing approved primary intent may outperform generic “Choose your time” language when tested at the moment of commitment; this requires measurement and must preserve the booking contract.
- The room image near the first decision may improve confidence, but only if it does not push the interactive choice below the first mobile viewport.

These are hypotheses, not claims of expected lift.

## Visual direction for Taste / Hallmark / Impeccable

### Preserve

- Warm paper, forest anchor, ink text, and quiet hairlines.
- The Catskills Studio Double-Bezel enclosure for functional surfaces.
- Upright display typography and Lexend-like readable UI typography from the incumbent system.
- Real room photography with descriptive alt text and intrinsic dimensions.
- One authored asymmetry: editorial promise on one side, operational task on the other.

### Enhance

- Reduce card count and let whitespace, rules, and sequence carry more hierarchy.
- Make the right-side workbench visually heavier than the explanatory copy, because it is the page’s completion surface.
- Use the green accent sparingly for action and confirmed state, not for every badge or reassurance element.
- Replace repeated “card-in-card” explanation with one deliberate proof composition.
- Keep interactive labels single-line at 320, 375, 414, 768, and 1440 px.
- Use motion only for disclosure and state transition; no ornamental reveal cascade, parallax, hover lift across the scheduler, or `transition: all`.

### Avoid

- A centered generic hero followed by three equal feature cards.
- Aggressive martial-arts imagery, fight language, or urgency framing.
- New gradients, glass panels, floating pills, or a second visual theme.
- Invented reviews, counts, guarantees, availability, or local claims.
- Making the community-service lane or private lessons compete with the main audience choice.
- Treating the third-party calendar as a decorative embed; it is the task surface.

## CSS direction

Future CSS work should remain within the existing route stylesheet and token system unless a documented shared component need emerges.

- Treat the route as mobile-first and content-driven, with a single-column task flow below the existing booking breakpoint.
- Define the split grid with protected `minmax(0, 1fr)` tracks and prevent image/content overflow.
- Give the booking workbench, injected iframe, and state transitions explicit sizing contracts.
- Keep the hero compact enough that the main lane choice is visible early on mobile.
- Preserve the site’s named spacing, radius, color, focus, and motion tokens; do not introduce page-local hex/font improvisation.
- Ensure focus, active, disabled, loading, error, and success states are visually explicit for the lane buttons, youth disclosure, back action, links, scheduler status, and preparation form.
- Keep form labels above fields, helper/error text below fields, and no placeholder-as-label behavior.
- Protect the root from horizontal overflow with the established `overflow-x: clip` contract.
- Treat visual weight as a hierarchy problem before adding shadows or decorative surfaces.

## JavaScript direction

Future JavaScript work should preserve the existing progressive-booking contract and focus on state clarity.

- Keep one completion/navigation owner for the booking lifecycle.
- Preserve provider URL, lane/profile mapping, offer entitlement, analytics identifiers/events, confirmation behavior, and Text Sandy fallback.
- Make each state transition update heading, current-choice text, visibility, `aria-hidden`, focus placement, and live status coherently.
- On youth disclosure, return focus predictably and expose the expanded/collapsed state to assistive technology.
- On scheduler load, expose loading and error states without trapping the visitor; retain the schedule and text fallbacks.
- On booking completion, move the visitor to the show-up kit and keep the provider’s date/time as the authority.
- Avoid animation that changes layout dimensions or scroll position unexpectedly.
- Test the full path at keyboard, reduced motion, narrow mobile, tablet inline, and desktop inline conditions.

## Acceptance criteria for a future implementation pass

- The first viewport communicates the 15-minute Free First Visit, its immediate benefit, and the primary lane choice.
- There is one dominant conversion intent and one clear secondary human-help path.
- The visit explanation appears once in a memorable, scannable sequence.
- The scheduler is visibly usable at tablet and desktop widths and does not become a nested-scroll trap.
- No clickable label wraps at 320, 375, 414, 768, or 1440 px.
- Adult, youth, multiple-person, not-sure, back, schedule, text, provider, confirmation, waiver, and preparation paths remain distinct and testable.
- Mobile and desktop layout, CTA visibility, accessibility basics, internal links, SEO metadata, and image layout protection are verified separately.
- Source HTML, generated output, deployable assets, and live HTML are reconciled before claims about the published page are made.
- Local QA, browser interaction QA, live HTTP/body evidence, provider/fulfillment evidence, analytics receipt, and business results are reported as separate evidence classes.

## Recommended next pass

Create a page-specific implementation specification from this brief with exact section ownership, copy inventory, component/state map, and a source-to-generated-output verification plan. Only after that specification is approved should CSS or JavaScript behavior be changed.

