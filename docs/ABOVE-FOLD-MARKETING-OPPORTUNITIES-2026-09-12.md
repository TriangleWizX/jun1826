# Above-the-Fold Marketing Opportunities

**Scope:** Pricing, schedule, FAQs, contact, Show-Up Kit, directions, and private lessons.  
**Benchmark:** the current homepage first-visit experience.  
**Purpose:** handoff for a later remediation pass. This is a findings-only audit: it identifies what can be improved and why; it does not prescribe fixes, replacement copy, or implementation.

## Reading this audit

“Above the fold” means the initial decision area before a typical visitor scrolls. Findings consider both mobile and desktop intent, but this is source and generated-markup evidence, not production analytics, session recording, or live browser proof.

The current homepage is the comparison point because its recent conversion work deliberately brings the primary booking action, text alternative, schedule access, local location cue, and beginner reassurance into the opening decision area. It also clearly routes cold visitors toward a Free First Visit before they have to understand the full offering.

The key question for every audited page is: **does the first viewport answer the visitor’s immediate question and make their appropriate next step unmistakable?**

## Cross-page opportunities

| Priority | Opportunity | Why it matters |
|---|---|---|
| High | Several utility and reassurance pages open as if the visitor has already reserved a visit. | Visitors arriving from search, navigation, or shared links may need to establish eligibility or make a reservation before preparation, parking, and arrival details become useful. |
| High | Some primary actions do not describe their immediate result accurately enough for a first-time visitor. | A visitor cannot reliably distinguish booking, submitting a lead, texting a question, opening a map, or beginning a private-coaching inquiry. |
| High | The pages do not consistently follow the homepage’s decision hierarchy. | The homepage provides one dominant Free First Visit route, a human fallback, and a research path; other openings introduce competing routes, ambiguous deep links, or post-booking tasks first. |
| Medium | Audience and visit-state cues differ page to page. | Parents, adults, visitors, current students, and people looking for private coaching can each infer a different first step from otherwise similar language. |
| Medium | The opening content contains current operational claims that need continued authority checks. | Schedule, prices, capacity, visit timing, and availability can become inaccurate even when their static markup remains valid. |

## Page findings

### Pricing — `/options-pricing`

**Opening job:** answer price and help a prospective student decide whether to start.

**What is already clear:** The hero names pricing, puts the Free First Visit first, exposes headline price points, and offers both a reservation route and schedule route.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| High | The opening repeats the same first-visit message while adding several separate pricing summaries. | The hero contains two nearly identical Free First Visit statements, a three-card quick-price row, a “3 planned classes each week” statement, and a three-item signals list. | The price answer is visible, but the visitor must decide which summary is the authoritative explanation of what the price covers. |
| High | The quick prices create a compressed price anchor without enough immediate context to compare the youth and adult offers confidently. | The cards show `$550` and `$715` as “First 12 weeks”; fuller membership detail is below the fold. | A visitor can see a number before understanding inclusion, reservation expectations, lane fit, or whether the price applies to their situation. |
| Medium | The “3 planned classes each week” claim is more definite than the documented offer authority. | The current homepage handoff records the canonical offer language as **up to** three appropriate classes, with recurring reservations. | A pricing claim can be interpreted as a fixed weekly entitlement when the authoritative policy is conditional. |
| Medium | The hero combines new-student, schedule-research, and path-selection decisions before it establishes a single price-reading path. | “Reserve Your Free First Visit,” “View Schedule,” and the later “What brings you here?” path menu all occur in the opening sequence. | A visitor seeking a direct answer to “what will this cost me?” can be diverted into multiple different decisions. |

### Schedule — `/schedule`

**Opening job:** let a visitor determine whether a class works in their week and then reserve an appropriate first visit.

**What is already clear:** The hero states the visitor’s scheduling question in plain language. The actual weekly schedule is beside the hero on desktop, and the page distinguishes first-time visitors, current students, visitors, and private-coaching inquiries.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| High | The dominant hero CTA is labeled as a reservation but links to an on-page lead-capture form rather than the established first-visit booking route. | “Reserve Your Free First Visit” points to `#ss-lead-capture-form-inline`; the homepage primary CTA routes to `/free-bjj-intro-tannersville-ny`. | A visitor may expect time selection or booking and instead encounter a different step later on the page. |
| High | First-time visitor actions are repeated inside each day card while current-student and visitor text competes in the same schedule field. | Each active day repeats “First-time local student? Reserve Your Free First Visit”; day cards also contain “Visitors: Text Before Attending,” while the top right begins with “Current Students: Need to reschedule?” | The schedule is informative, but the action hierarchy becomes difficult to scan, especially on a phone. |
| Medium | The hero promises an overview of “youth, adult, morning, and weekend lanes,” but the main grid does not present those categories with the same clarity. | Morning private coaching is described below the calendar as request-based; Saturday is adult-only by default; youth and teen treatment differs by day. | A visitor may form an expectation of a simple all-lane comparison before encountering the qualifying conditions. |
| Medium | The visible “Last updated: 2026-07” badge is stale relative to this audit date. | The schedule hero displays the month directly in its opening badges. | A dated operational page can create uncertainty about whether displayed times and availability remain current. |

### FAQs — `/bjj-faqs`

**Opening job:** reduce unanswered first-visit objections and route a ready visitor appropriately.

**What is already clear:** The hero is strongly aligned to first-time concerns: safety, age groups, pricing, clothing, and what a visit feels like. It includes a Free First Visit CTA, Text Sandy fallback, a studio image, and trust signals.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| Medium | The hero promises several different question categories before indicating which question is answered immediately. | The lede lists safety, age groups, pricing, “Dress for Training,” and first-visit expectations; the selector and expanded answers are lower on the page. | A visitor with one urgent question must scroll to learn whether the page will answer it. |
| Medium | “Dress for Training” reads like a branded or internal label without first-viewport explanation. | The phrase appears in the hero list alongside plain-language categories. | A newcomer may not know whether it means clothing, equipment, a required product, or a program. |
| Medium | The primary CTA’s accessible label contains a malformed phrase. | The button `aria-label` contains “Free First Visitductory.” | Screen-reader users receive a degraded version of an otherwise clear action. |
| Low | The visible trust cues are broad reassurances rather than direct answers to the highest-cost objections named in the lede. | The trust pills state beginner-friendly, grappling-only, clean mats, and calm coaching. | The page begins well, but a price- or age-focused visitor receives reassurance before a concrete answer. |

### Contact — `/contact`

**Opening job:** give a visitor a human route to resolve uncertainty or take the first step.

**What is already clear:** The opening says “Let’s Find the Right First Step,” includes Free First Visit and call/text actions, and frames the studio as beginner-friendly and community-focused.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| High | The hero’s second action combines calling and texting while its destination is SMS only. | The button label says “CALL OR TEXT”; its `href` uses `sms:`. | A person who prefers a phone call may select the action expecting a dialer and get an SMS composer instead. |
| Medium | The opening repeats the homepage’s first-visit pitch without first distinguishing why someone should use the contact page instead of booking directly. | The hero centers a Free First Visit CTA, then the details and message areas follow. | Visitors with a specific question, accessibility need, schedule conflict, or private inquiry have no immediate cue that this page is the appropriate route. |
| Medium | A first-viewport image is marked `loading="lazy"`. | The hero card image supports the opening composition but is lazy-loaded. | The visual proof may arrive after the copy and actions, weakening the intended first impression on slower mobile connections. |
| Low | The hero leads with broad brand claims before a specific contact promise. | “BEGINNER-FRIENDLY. COMMUNITY-FOCUSED. RESULTS THAT LAST.” precedes the H1. | A visitor arriving to solve a concrete contact question gets positioning before guidance about response, topic, or next step. |

### Show-Up Kit — `/show-up-kit`

**Opening job:** help a booked first-time visitor arrive prepared and calm.

**What is already clear:** This is the clearest post-booking experience in the group. It covers waiver, parking, clothing, arrival time, and first-class expectations; it also makes the waiver, map, and text routes visible immediately.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| High | The opening assumes a visit is already planned but does not establish that state or provide a visible reservation route. | The hero leads with “Your First Small-group class Is Simple,” then offers “Fill Out Waiver,” “Open Google Maps,” and “Text Sandy.” | A new visitor who reaches this page before booking can begin a waiver or navigation task without a confirmed visit. |
| Medium | The three equally prominent actions represent different stages of the journey. | Waiver is a preparation task, maps is an arrival task, and text is a support task. | A visitor must infer which action is appropriate before knowing whether they have completed the prerequisite step. |
| Medium | Arrival instructions differ from the directions page. | The Show-Up Kit says “Arrive 10 minutes early”; directions says “Arrive 5 to 10 minutes early.” | Two pages about the same visit create a small but avoidable preparation ambiguity. |
| Low | The heading uses an inconsistent capital “Is.” | “Your First Small-group class Is Simple.” | The page’s otherwise calm and polished first impression loses editorial consistency. |

### Directions — `/bjj-tannersville-ny-directions`

**Opening job:** get a confirmed visitor to the right building, parking area, entry, and support channel.

**What is already clear:** The address, second-floor instruction, parking guidance, entry guidance, rescheduling reassurance, map link, and text fallback are all visible early.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| High | The opening is also post-booking in substance, but it does not make that state explicit or offer a booking route. | The page starts “Plan Your Visit” and presents maps and arrival details; the calls to action are text and map only. | An unbooked search visitor can mistake logistics information for confirmation that they should arrive. |
| Medium | The first action is “Text Sandy,” while the map action with the clearest arrival utility appears later in the card. | The text link appears in the header; “Open Google Maps” appears after the four information cards. | A visitor trying to navigate may not find the fastest physical-navigation action at the point of need. |
| Medium | The text route is described differently in the header and the action group. | Header: “Text Sandy.” Later button: “Text Sandy If Lost.” | The earlier interaction is ambiguous about whether it is for arrival help, booking, or a general question. |
| Low | The page names an arrival window of “5 to 10 minutes early,” which differs from the Show-Up Kit’s fixed “10 minutes early.” | Both directions and Show-Up Kit present their arrival guidance above the fold. | A visitor who checks both pages receives inconsistent preparation guidance. |

### Private lessons — `/private-lessons`

**Opening job:** help someone evaluate and inquire about private coaching without drawing ordinary first-time students away from small-group classes.

**What is already clear:** The hero names private coaching, names Tannersville, gives a price, provides a text option, and includes a clearly subordinate group-training route.

| Priority | Improvement opportunity | Above-the-fold evidence | Visitor consequence |
|---|---|---|---|
| High | The primary private-booking CTA routes to the general Free First Visit flow. | “Book Tannersville Private — $195” links to `/free-bjj-intro-tannersville-ny`; its CTA data also identifies the lane as private. | A visitor expects a private-coaching booking path but lands on a generalized first-visit flow, creating a mismatch between the action promise and destination. |
| High | The private lesson’s request-based operating model is absent from the opening, despite appearing elsewhere on the schedule page. | The hero presents a price and a “Book” CTA; `/schedule` states private coaching is available by request and morning availability should be discussed by text. | A visitor can infer immediate, self-serve availability or a public appointment slot that the authority page does not establish. |
| Medium | The hero serves too many audiences with one private-coaching promise. | It names beginners, kids, adults, visitors, and current students in one sentence. | Each audience has different safety, scheduling, parental, and prior-experience questions; the opening does not establish which visitor is the intended private-coaching fit. |
| Low | The “Prefer Group Training?” route is subordinate visually but still repeats the same general first-visit destination as the private CTA. | Both primary private and tertiary group actions point to the Free First Visit page. | The page communicates two distinct choices yet collapses them to one immediate destination. |

## Handoff priorities

1. **Visitor-state clarity:** establish whether each page is for someone deciding to start, someone who has reserved, an active student, a visitor, or a private-coaching inquiry.
2. **Action-to-destination integrity:** review every above-the-fold CTA against what it promises, especially the schedule reservation and private-booking CTAs.
3. **Authority alignment:** reconcile the visible pricing frequency statement, schedule freshness badge, request-based private availability, and cross-page arrival-time wording with their canonical sources.
4. **Homepage hierarchy consistency:** use the homepage’s opening decision structure as the reference when evaluating primary action, human fallback, research route, beginner assurance, and mobile scanability.

## Evidence and verification

This audit used current source and generated page markup, the documented homepage conversion handoff, and the repository’s indexed code graph. It did not run production HTTP checks, use external analytics, create bookings, submit forms, or alter content.

Local checks passed on 2026-09-12:

- `npm run qa:links:static`
- `npm run qa:volatile-facts`
- `npm run qa:schedule`

Those checks validate static links and selected operational-fact and schedule rules. They do not prove real-device rendering, external provider behavior, visitor understanding, conversion impact, or live production parity.
