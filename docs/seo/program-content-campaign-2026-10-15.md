# Local BJJ program content campaign

Date: October 15, 2026  
Status: Campaign outline for editorial planning. Website edits, publication, and deployment are separate future work.

## Goal and audience

Help local parents, teens, and adults find the right class, understand what they will practice, and plan a first visit in Tannersville. Give private coaching a clear inquiry path while keeping kids, teens, and adult group classes easy to choose first.

Build around four pillars:

1. **Youth class fit:** age placement, coached movement, partner care, and what parents can watch.
2. **Adult beginner learning:** starting BJJ, what practice involves, and how a first visit works.
3. **Local access:** classes at the Tannersville studio for people coming from nearby towns.
4. **Focused private coaching:** who can inquire, what a session can address, and how to request a time.

The six supplied searches are intent hypotheses, not verified search-volume or ranking data. Priorities below reflect program fit, usefulness to a prospective student, and existing source material. Search Console, customer-question frequency, competitor gaps, budget, and editorial capacity remain unverified. An eight-week sequence is a suggested pace, not an agreed deadline.

## Current source evidence

| Source | What it supports | Editorial implication |
| --- | --- | --- |
| `src/_data/programs.json` | Kids ages 5–9; teens 10–17; adults 18+; canonical program destinations | Read current values during drafting. The marketing-context avatar ages differ and should not set enrollment ages. |
| `src/_data/business.json` | Tannersville studio; nearby service areas including Hunter, Windham, Haines Falls, and the Catskills | Explain where students travel to. Serving a town does not establish a branch there. Import address/contact data when needed. |
| `src/partials/program-conversion-kids.html` | Safe falling, posture, balance, listening, partner habits, parent presence | Expand concrete learning descriptions rather than promise behavior changes. |
| `src/partials/program-conversion-teens.html` | Basic movement, partner tasks, positional control, matched pacing, sport cross-training | Explain skills and class fit. Verify any additional self-defense curriculum with Sandy. |
| `src/partials/program-conversion-adults.html` | Safe movement, posture, coached drills, partner practice; adult visit and class choice | Make the learning path clearer for new and returning adults. |
| `src/private-lessons.html` | Basics, class questions, youth/adult inquiries, visitors; time and location confirmation | Private coaching is request-based. Confirm suitability and location per inquiry. |
| `src/bjj-classes/index.html` | Existing beginner hub and links to programs/towns | Expand this hub rather than create a competing beginner landing page. |
| `docs/seo/LOCATION_PAGE_POLICY.md` | Distinct local value required; fabricated travel claims and doorway pages excluded | Reuse relevant town pages. New town/age permutations need a distinct purpose and evidence. |
| `.agents/product-marketing.md` | Buyer priorities and recurring first-visit questions | Useful background; older metrics, operational claims, and competitor descriptions need fresh verification before reuse. |

The program routes include wrappers in `src/_includes/partials/`, which load the active copy in `src/partials/`. Much of the older program-page HTML sits inside `{% if false %}`. Draft against active partials and verify rendered output; editing disabled blocks will not expand visible descriptions.

Evidence here is from the current local worktree. The code graph transport was unavailable, so source inspection was used. Production content, keyword demand, and performance were not checked over the network.

## Search intent and destination map

Use each phrase where it reads naturally. One strong destination per main intent is preferable to many similar pages. These are editorial directions, not approved public copy.

| Supplied search | Primary destination | Placement and angle | Supporting FAQ |
| --- | --- | --- | --- |
| Brazilian Jiu-Jitsu classes in Tannersville, NY | `/bjj-classes/tannersville-ny` | Expand the local overview; describe the studio and link to each age group. Consider the phrase in the title or main heading when revising metadata. | Where are classes held in Tannersville? |
| Kids BJJ classes near Hunter, NY | `/bjj-classes/kids-tannersville-ny` | Add a short local-access section and link from `/bjj-classes/hunter-ny`. Say the class takes place in Tannersville. | Can families from Hunter join kids classes? |
| Beginner martial arts classes in the Catskills | `/bjj-classes` | Explain Brazilian Jiu-Jitsu as the martial art taught, beginner fit, age choices, and first-visit steps. Use the phrase in a relevant heading or opening description. | What do beginners learn in a BJJ class? |
| Adult Brazilian Jiu-Jitsu near me | `/bjj-classes/adults-tannersville-ny` | Address local adult intent through a clear Tannersville title, location section, directions, and useful learning details. Use natural geographic language rather than force “near me” into the H1. | Can I start BJJ as an adult beginner? |
| Teen self-defense classes in Greene County | `/bjj-classes/teens-tannersville-ny` | Add a bounded FAQ about how coached BJJ skills relate to self-defense. Describe classes in Tannersville within Greene County. Confirm curriculum before using the full phrase as a program heading. | What self-defense skills can teens practice in BJJ? |
| Private Brazilian Jiu-Jitsu coaching near Tannersville | `/private-lessons` | Expand who can inquire, examples of useful session goals, and the request process. Use the phrase in the description or relevant heading. | How do I request private BJJ coaching? |

The broad `/bjj-classes` hub owns program selection; the Tannersville page owns local access. Keep their titles, introductions, and FAQs distinct. Keep primary age pages focused on enrollment questions and articles focused on explaining a narrower topic.

## Program-page expansion briefs

Use a shared information order: who the class suits → what students practice → how coaching works → where class takes place → first visit → next action. Keep each description specific to its audience.

### Kids

- **Reader:** A parent choosing an activity for a child in the canonical kids age range, including families near Hunter.
- **Expand:** Balance, safe falling, posture, listening to a task, tapping/resetting, and care for a partner. Explain what these look like in a coached activity.
- **Class experience:** Parent/guardian stays on-site; Sandy guides tasks and partner selection. Keep progress descriptions observational.
- **Local access:** Tannersville studio; directions and current schedule links; Hunter context where helpful.
- **FAQs:** Which ages fit? What will my child try? Can I watch? Where do Hunter families travel for class?
- **Next action:** Preserve the current kids first-visit booking destination and lane parameter.

### Teens

- **Reader:** A parent and teen exploring a first class, including a teen who already plays a sport.
- **Expand:** Basic movement, balance, positional control, partner problem-solving, and tapping/resetting. Explain coached resistance in plain words.
- **Self-defense boundary:** Discuss practiced skills and judgment only where Sandy verifies the curriculum. Claims about de-escalation instruction, escapes, or real-world effectiveness need specific support; a keyword alone does not establish a course.
- **Local access:** Tannersville in Greene County; links for nearby families; parent/guardian presence and current schedule.
- **FAQs:** Are beginners welcome? What happens with a partner? How does BJJ relate to self-defense? Can this fit alongside another sport?
- **Next action:** Preserve the teen first-visit route and lane parameter.

### Adults

- **Reader:** An adult starting BJJ or returning to practice who wants to understand the room and learning process.
- **Expand:** Posture, safe movement, one clear drill, partner practice, asking questions, and choosing a next skill with Sandy.
- **First visit:** Preserve the distinction between meeting Sandy and choosing whether to train that day or on a later confirmed day. Avoid suggesting an adult must train during the visit.
- **Local access:** Tannersville studio and directions for nearby Catskills residents; link to current class times.
- **FAQs:** Can an adult beginner start? What do I practice first? What happens at the visit? How do I choose a class time?
- **Next action:** Use the existing adult first-visit flow; keep visitor and private options secondary.

### Private coaching

- **Reader:** A beginner with questions, a student working on one skill, a parent asking about youth coaching, or a visitor requesting a session.
- **Expand:** Share a goal → discuss fit → request a time/location → practice a focused task → ask about the next step. Avoid promising a fixed syllabus or result for every session.
- **Local access:** Tannersville directions are relevant; Sandy confirms the actual session location when arranging the booking.
- **FAQs:** Can beginners inquire? Can a parent request a youth session? What can we work on? How are time and location confirmed?
- **Next action:** Existing private inquiry/text path. A group Free Intro does not establish a free private lesson.

## Eight-week campaign sequence

The editor owns briefs and drafts; Sandy verifies curriculum and operational claims; the site maintainer handles rendered checks and any later release. These are proposed responsibilities, not assigned staff commitments.

| Week | Priority and deliverable | Type / buyer stage | Purpose and evidence | Links and conversion path |
| --- | --- | --- | --- | --- |
| 1 | P1: Expand the beginner hub and Tannersville overview | Searchable hub/local page; consideration | Answer which class fits and where it happens. Existing pages already cover the broad intent. | Hub → kids/teens/adults → current schedule and first-visit flow; town page → directions. |
| 2 | P1: Expand kids description and Hunter access section | Searchable program refresh; decision | Give parents concrete learning detail supported by active kids copy. Update Hunter page links rather than create another town/age landing page. | Hunter → kids → kids first visit; kids → directions and schedule. |
| 3 | P1: Expand adult beginner description and FAQs | Searchable program refresh; decision | Clarify partner practice and the adult visit choice using current adult copy. | Adults → how class works → adult first-visit flow. |
| 4 | P1: Expand teen description; review self-defense FAQ | Searchable program refresh; consideration/decision | Explain actual skills, youth fit, and local access. Curriculum confirmation gates stronger self-defense wording. | Teens → existing teen articles → teen first visit. |
| 5 | P2: Refresh `/blog/exactly-what-happens-first-bjj-class-minute-by-minute` | Searchable explainer; consideration | Existing first-class coverage makes a second general first-class article redundant. Distinguish adult and youth visits; validate any exact timing against canonical visit data. | Article → age pages, `/how-class-works`, first visit. |
| 6 | P2: Refresh teen article coverage | Searchable explainer; awareness/consideration | Inspect `/blog/jiu-jitsu-for-teenagers-catskills`, `/blog/teen-jiu-jitsu-hunter-ny`, and `/blog/teen-confidence-deescalation-jiu-jitsu`; choose one primary explainer after comparing scope. Improve bounded skill examples. | Primary explainer → teen program; supporting articles link with a distinct purpose. |
| 7 | P2: Expand private page and refresh `/blog/private-bjj-lessons-adults-catskills` | Searchable service page/explainer; decision | Help a reader form a useful session request. Existing private articles already cover several local variants. | Article → private page → current request path; secondary group-class option. |
| 8 | P3: New article brief: “What Kids Practice in a BJJ Partner Game” | Searchable narrow explainer; awareness | Show one coach-verified activity: task, movement, partner care, reset, and questions a parent can ask. Publish only if comparison with existing kids/self-defense articles shows distinct value. Otherwise expand the closest article. | Article → kids page → kids first visit; optional related link from family article. |

For the proposed new article, use `/blog/what-kids-practice-bjj-partner-game` only after checking the URL registry and content inventory. Obtain Sandy's activity description before drafting. Use an existing appropriate image or approved demonstration; private student information and identifiable youth media require appropriate permission.

## Existing article coverage to reuse

These source files exist; existence alone does not establish their quality, live status, or current indexability. Compare visible content before assigning a refresh or new URL.

- Beginner visit: `src/blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html`.
- Adult starting point: `src/blog/bjj-beginners-over-40-catskills/index.html`.
- Existing adult local search coverage: `src/blog/adult-brazilian-jiu-jitsu-near-me-tannersville/index.html`; review alongside the adult program page before expanding that intent.
- Teen topics: `src/blog/jiu-jitsu-for-teenagers-catskills/index.html`, `src/blog/teen-jiu-jitsu-hunter-ny/index.html`, and `src/blog/teen-confidence-deescalation-jiu-jitsu/index.html`.
- Kids skill coverage: `src/blog/safe-self-defense-kids-positional-control/index.html`.
- Family choice: `src/blog/family-martial-arts-catskills/index.html` and `src/blog/family-friendly-bjj-near-tannersville/index.html`.
- Private topics: `src/blog/private-bjj-lessons-adults-catskills/index.html`, `src/blog/private-bjj-lessons-kids-tannersville/index.html`, and `src/blog/private-bjj-coaching-catskills-visitors/index.html`.
- Hunter access: `src/blog/jiu-jitsu-near-hunter-mountain/index.html`; coordinate with the retained Hunter town page.

Do not remove, merge, redirect, or rename these as part of this outline. Any consolidation needs a separate content and URL review.

## Distribution and internal links

Use `/bjj-classes` as the program-choice hub. Age pages link to relevant explainers; explainers link back to their program page. Town pages guide readers to programs at the Tannersville studio. Every important page should have a clear next step plus useful schedule/directions links.

After each approved website update, optionally share one useful class detail on existing social channels or the business profile, with a link to the relevant page. Social captions use `Comment START` if a comment trigger is included. Prepare them separately through the four-rubric pipeline. Static creative production follows the approved Canva workflow. This outline does not authorize posting, outreach, or sending messages.

## Drafting and publication gates

1. **Facts:** Verify ages from programs data, location/contact from business data, visit details from `src/_data/free-intro.json`, and curriculum with Sandy. Link to `/schedule` and `/options-pricing` for current operational details. Avoid copying times, rates, guarantees, or entitlements into editorial prose.
2. **Useful copy:** Explain who, what, and where on every program page. Keep headings natural and questions specific. Use positive beginner framing, short words, and short sentences. Target Grade 3 or below on rendered customer copy. Titles in this document are directions, not tested release copy.
3. **Four rubrics before public release:** Stop-Slop (at least 40/50); Universal Analyzer-Improver (grounded intent, local relevance, friction and fact checks); Anything-Enhancer (clear, warm, realistic practice descriptions); Empirical Reach Matrix for any social adaptations. Load the required source assets during production and record results. The supplied six search phrases are not measured demand evidence.
4. **Technical SEO:** Review unique title/description, one useful H1, canonical, robots/indexability, internal links, image alt text, and accurate existing structured data. FAQs must be visible and useful; schema does not promise a rich result. New indexable URLs need a matching entry in `data/url-registry.json` before checking generated sitemaps.
5. **Rendered QA:** During later implementation, run the build, `npm run qa:volatile-facts`, and `node tools/readability-check.mjs <rendered-page> --json --max-grade 3`. Verify mobile and desktop layout, CTA visibility, keyboard/focus basics, headings, links, and preserved booking lane parameters. Run relevant existing link/program checks after inspecting their coverage.
6. **Release evidence:** A later authorized release should have an exact file scope and rollback path. Separate local checks, deployment evidence, and live verification. Live network checks require the workspace's elevated network approval. This outline makes no live or deployment claim.

## Measurement and review

Before publishing, record a 28-day baseline by destination page: Search Console impressions, clicks, CTR, and query themes where available. Inspect whether relevant analytics events actually fire before using them as metrics.

Track program-page visits, first-visit CTA clicks, booking starts, accepted completed bookings, and private inquiries separately. A CTA click is not a booking; a booking is not attendance. Keep student details out of campaign reports. Record unavailable measurements as unknown.

Review at roughly 28 and 56 days after publication. Compare the same pages and query groups with their baseline, note seasonality and other site changes, and avoid attributing all movement to copy. Use impressions to assess discovery, clicks/CTR to assess search presentation, and confirmed booking evidence to assess the next step. Do not set invented ranking or enrollment promises.

- Impressions grow but clicks stay flat: inspect query fit and title/description clarity.
- Readers visit but rarely use the next step: inspect program fit, CTA visibility, and visit explanation.
- Similar pages attract the same queries: compare intent and strengthen page ownership before proposing consolidation.
- Repeated family questions remain: use those questions to choose the next FAQ or narrow article.

## Persona & Expert Framework

- **Role:** Solon the SEO Sage, UUID `2d52210b-edae-48f2-b5a5-095e3dd4c523`; full source inspected at `assets/indranet-prompt-exporter/exports/Solon-the-SEO-Sage/versions/v2.0.0/prompt.json`. Export status complete; attachments empty. The selector was ambiguous. Host review found its local SEO, audience needs, content planning, keyword placement, and measurement methods appropriate to this bounded outline. Claims of guaranteed performance in its description are excluded.
- **Instruction candidate:** INSTRUCTIONS - Business Operations, app UUID `c3369696-d996-447e-8973-5f2cd73d33c9`, linked prompt UUID `671b3a64-c942-4f0f-b077-00d94e313595`. The returned app introduction is not the full instruction source. An exact linked prompt was not found in the local exports; adoption is unverified. Ordinary editorial planning and verification methods supply this capability.
- **Skillchain:** Repository content-strategy skill → current source inventory → intent/destination mapping → program briefs → release and measurement gates.
- **Applied methods:** Audience needs drive the program briefs; local intent drives destination ownership; existing article coverage constrains new URLs; observable behavior and booking evidence drive measurement.
- **Workstream contract:** Coordinator owns this Markdown file and final integration. Independent reviewer has read-only source access, no write paths, no network work; checks age/location accuracy, supported learning topics, overlap, and verification coverage. An ordinary editorial QA fallback is permitted where a suitable full persona/instruction source is unavailable. No worker code changes or shared write paths are required.

## Definition of Done for this outline

- DOD-1: All six requested searches have a destination and natural placement guidance.
- DOD-2: Kids, teens, adults, and private coaching each have who/what/where briefs.
- DOD-3: Campaign includes prioritized refreshes, a conditional new-content brief, publishing order, internal links, next steps, and measurement.
- DOD-4: Existing coverage, local claim boundaries, fact checks, readability, and future release gates are explicit.
- DOD-5: Source paths and campaign recommendations are reviewed independently; final file is checked locally. Completion means the Markdown outline is ready for review, not that website publication has occurred.
