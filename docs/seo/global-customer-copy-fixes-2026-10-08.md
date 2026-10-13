# Global customer-facing copy fixes

**Date:** October 8, 2026  
**Input:** [SEO and marketing gaps](global-seo-marketing-opportunities-2026-10-08.md)  
**Status:** Copy-fix specification. Website source, booking behavior, and production are unchanged.

## What this delivers

85 exact replacement blocks, each checked at **Flesch–Kincaid grade 3 or below** with the repository checker. The highest raw score is **2.890000000000004**. All 85 blocks pass its banned-term check. These are scoped replacements and site-wide implementation rules, not complete rewrites or readability certification of every page. Technical notes in this document are for the implementer and are outside the public-copy score.

Use the text fences as the proposed public text. The source, current phrase, and bounds identify where each block belongs. Multiple lines may belong in separate existing headings, paragraphs, or controls; preserve that mapping. Scores here cover each complete block. Individual slots and final assembled pages still need checking after integration. Negative scores are formula artifacts, not literal grade-level claims.

## Correct the audit baseline first

- Home source includes disabled `{% if false %}` content. Score the rendered active home shell, not dormant markup.
- Adult program copy comes from a shared include. A short wrapper score does not measure its visible page.
- Pricing copy is owned by `src/options-pricing.njk`; do not fix the short legacy HTML file instead.
- A score displayed as 3.00 can still fail: the earlier result was 3.001942 before rounding and had a banned-term failure. Compare raw scores with 3.
- The cited 290-page sitemap/SEO check does not certify schema consistency or page readability.
- Current `data/url-registry.json` has 627 records: 323 active, 271 redirect, 10 private, and 23 pending-rewrite. These are local registry records, not verified live pages. The older CSV counts are not current route authority.
- Existing keyword ranks, response-speed claims, and prevalence claims lack fresh evidence. Remove unsupported prose; do not turn it into a new marketing claim.

## Audit-to-fix map

| Audit item | Copy action | Completion limit |
|---|---|---|
| COPY-01 | Apply the bounded replacements below, then review all visible text by page family | Block checks are complete; full-page checks await implementation |
| SEO-03 | Give each town page its own useful trip/class answer | New town openers alone do not resolve duplicate intent |
| SEO-05 | M01–M10 supply distinct descriptions; retain accurate title topic and brand | Check final emitted title, description, social tags, and canonical |
| SEO-06 | Change visible FAQ answers and their schema from the same fact source | Schema and live-page consistency remain implementation checks |
| MKT-03 | Match each page to parent, teen, adult, visitor, or continuing-student intent | Search demand and rank changes remain unknown |
| MKT-04 | Clarify visit choices, waiting, retry, and success states | Wording does not establish booking success or attendance |
| SEO-01/02/04; MKT-01/02 | Track checker repairs, redirects, old-page evidence, and attribution separately | These technical/data gaps are not solved by copy |

## Source ownership and global coverage

| Surface | Authoring owner / action |
|---|---|
| Home | `src/index.html` front matter; active body in `src/partials/home-conversion-shell.html` |
| Navigation and footer | `src/partials/nav-include.html`, `footer-include.html`; preserve link targets, IDs, and focus behavior |
| Shared teaching and CTAs | `src/partials/teaching-doctrine.html`, `booking-router.html`, `acquisition-editorial-rail.html`; inspect `_includes/partials` wrappers before editing |
| Kids, teens, adults | `src/partials/program-conversion-*.html`; route front matter under `src/bjj-classes/` owns metadata |
| Prices and offers | `src/options-pricing.njk` with `src/_data/pricing.json` and `offers.json`; retain data-driven amounts and qualifications |
| Visit and booking states | `src/free-bjj-intro-tannersville-ny/index.html`, `js/progressive-booking.js`, `src/_data/free-intro.json`; preserve state gates |
| Schedule and contact | `src/schedule.html`, `src/contact.html`, canonical schedule/contact data; keep short current labels and simplify surrounding prose |
| Town pages | Both `src/near/` and `src/bjj-classes/` town families, especially Hunter and Windham; retain distinct local purpose and canonical route |
| Glossary | `data/glossary-terms.json` and `tools/build-glossary-pages.mjs`; identify generated ownership before changing `src/bjj-glossary/`; update definition, search summary, and schema together |
| Blog and videos | Blog index cards and each article body, video captions/descriptions and active video routes; `src/bjj-videos.html` is a redirect stub, not a new hub target |
| Parent, preparation, safety | Parent guide/resources, nervous-first-timers, show-up-kit, class-rules, safety, inclusion, waiver; simplify intros while retaining substantive rules |
| Secondary offers | Parties, after-school, private lessons, athlete cross-training, visitors, seasonal offers, referrals, hospitality/wellness and first-responder pages; preserve each eligibility boundary |
| Member pages | Student hub and other customer-facing noindex pages still need plain copy; privacy and indexing status stay unchanged |
| Research | `src/evidence.html`, `src/research/`, `src/sources/`; retain original population, study type, numerical result, source, and caveat |
| Hidden or auxiliary text | Each actual error/loading/success state, form label, alt text, ARIA label, FAQ answer, metadata/social description, and search card |

Family-wide rules: short sentences; one idea per paragraph; concrete verbs; explain a needed BJJ term on first use. Keep official program names and accurate search topics. Use descriptive links with their existing destination. Avoid invented benefits, urgency, travel times, staffing, inventory, or response deadlines. Do not replace useful local detail with the same generic paragraph everywhere.

For the audit's Hunter/Windham class pages, follow C01–C04 for the opening and trip-planning language after comparing the actual slot; do not blindly duplicate the town-page opener. Keep the schedule page focused on finding a class, with one clear link to current times. On first-responder and other audience offers, remove the checker's banned sales language while retaining qualification terms. Each remaining article, glossary definition, offer, and FAQ requires its own exact-copy fixture before publication; the samples below are not blanket approval.

## Facts and explicit holds

1. **First visit:** Use the canonical name **Free First Visit** and CTA **Reserve Your Free First Visit**. Adults start with a 15-minute visit; training that day or later is elective, Sandy confirms the class, and the first class is free. Waiver, consent, and partner fit remain required.
2. **Youth:** Keep the separate youth visit/class flow and parent/guardian stay requirement. Kids 5–9, teens 10–17. The youth-specific 60–75-minute plan and 20-minute arrival rule must not leak into adult visit copy. Send the youth waiver before Sandy confirms the class.
3. **Schedule and contact:** Render canonical data or link to `/schedule`. Private coaching is by request. Do not paste the dated schedule, address, phone, or price into new editorial text.
4. **Plans:** The first paid term is 12 weeks with one, two, or three planned classes per week. Uniforms belong to first paid enrollment. Preserve space, partner-fit, video-access, continuation, expiry, and age limits. Visitor passes require advance request and confirmation; flex packs are adults 18+ and retain expiry.
5. **Annual payments:** Preserve completion prerequisites, two cards on file, the full-year obligation, pay-upfront or 12-payment choices, and each payment's due date. A plain summary does not replace exact totals or terms.
6. **HOLD: guarantee.** `src/guarantee-terms.html:48` says every new student, with exclusions at lines 84–95; `src/options-pricing.njk:434–442` has narrower scope, four classes/30 days, a request deadline, a four-week extension, and exclusions. Reconcile the authority before releasing G17, F26, or detailed guarantee edits. Do not invent a remedy or silently broaden eligibility.
7. **HOLD: holidays and special events.** Reconcile dated/conditional contradictions before releasing C12–C15 or M09. Preserve specific dates, minimum signups, makeup deadlines, cancellation/refund rules, and applicable term type. C15 introduces the full rules; it does not replace them.
8. **Research and risk:** Keep the exact Marietta 48%/53%/23% outcome meanings and their source; do not combine them or imply causation. Missing reporting is not proof a study procedure never occurred. Retain study-specific caveats, medical/safety/legal terms, and necessary words such as “not” and “cannot.” Never rewrite a testimonial under its author's name.
9. **Partner offers:** G25 requires duration/travel-claim reconciliation in the surrounding page. G26 describes coaching, not healthcare or a clinical referral promise.

## Persona & Expert Framework

- **Role:** Senior Copywriter Alex Turner, UUID `a9519f7d-8247-4bee-9075-72420110c5bf`; full versioned source: `assets/indranet-prompt-exporter/exports/Senior-Copywriter---Alex-Turner/versions/v1.0.0/prompt.json`. Applied audience fit, clear benefit language, concise structure, and specific next steps.
- **Instructions:** INSTRUCTIONS - CONTENT, UUID `6e94db8f-e23d-4387-8cc6-bac209e890aa`; full asset in `assets/indranet-prompt-exporter/exports/index.json`. Applied audience/context review, fact checking, clear actions, and consistent style. Metadata readiness is partial because notes are absent; no attachments were required. This is not an unqualified selector-ready claim.
- **Review sources:** Universal Analyzer-Improver v2.2.0, UUID `65808004-23a5-42ae-babe-1dbe85bfd1cf`, under `exports/Universal-Analyzer-Improver/versions/v2.2.0/prompt.json`; Anything-Enhancer / OptiMax v1.0.0, UUID `4a702064-50b8-4fbb-875c-2f3600c8d6dc`, under `exports/Anything-Enhancer---OptiMax/versions/v1.0.0/prompt.json`. Full sources were read during this work. Applied factual intent, reduced friction, natural warmth, and realistic coached movement.
- **Skills:** copywriting, copy-readability-audit, stop-slop, plus the SEO/content/CRO context from the input audit. The user's grade-three ceiling overrides looser skill thresholds.
- **Worker fit:** Editorial and funnel source reviews used ordinary specialists after poor persona matches; no adoption of an app introduction is claimed. Parent review corrected task ownership, paid-uniform timing, youth language, research uncertainty, and booking-state scope.
- **Four-rubric review:** Stop-Slop editorial review; Analyzer factual/intent review; OptiMax warmth/movement review; Meta reach/distribution rubric marked not applicable to this website draft. No numeric reach score, publication proof, or fabricated conversion uplift. The checker banned-term pass is not proof of a full 40/50 human Stop-Slop score; formal release review remains in the acceptance gate.

## Implementation order

1. Resolve the factual holds and confirm current canonical data. Preserve unrelated work and record the exact changed-file scope.
2. Apply shared navigation, footer, teaching, and CTA text once at their authoring owners.
3. Apply core funnel, pricing, and audience-specific visit text. Keep the current booking links, query parameters, analytics names, waiver sequence, and state behavior.
4. Apply editorial, town, metadata, and secondary-page fixes. Keep town value and article intent specific.
5. Review research/policy summaries alongside their complete source terms. Update visible FAQ and corresponding structured data together.
6. Check each public slot/state and the assembled page, then mobile/desktop presentation and source facts. Publication is a separate release action.

## Exact replacement blocks

Source line numbers are snapshot anchors. Locate the current phrase and inspect surrounding markup before applying a replacement. Blocks marked HOLD remain drafts until their fact conflict is resolved.

### Shared and supporting pages

#### G01 — Shared teaching words

**Source:** [src/partials/teaching-doctrine.html:4](../../src/partials/teaching-doctrine.html)  
**Current anchor:** ADAPT. TEST. EXPRESS. / Learning survives safe resistance.  
**Replace/retain bounds:** Replace the three abstract steps and their one-line claims.  
**Raw grade:** `-0.1388888888888875`; banned terms: none.

```text
Learn at your pace.
Sandy sets a task that fits you.
Try it with a partner.
Your partner moves as you try.
Sandy guides the pace and the rules.
Find a way that works for you.
```

#### G03 — Visit planning steps

**Source:** [src/partials/booking-router.html:9](../../src/partials/booking-router.html)  
**Current anchor:** Map the weekly rhythm / Compare your real schedule  
**Replace/retain bounds:** Replace step headings and explanations, retaining the canonical visit overview.  
**Raw grade:** `-0.2524193548387075`; banned terms: none.

```text
Tell Sandy your goal.
Share what you want to learn.
Find a class time.
Tell Sandy which days suit you.
Plan your first visit.
Sandy helps you choose your next step.
```

#### G04 — Parent guide skill summary

**Source:** [src/core-culture-parent-guide.html](../../src/core-culture-parent-guide.html)  
**Current anchor:** Your child learns to move, think, communicate, recover from mistakes, and keep working under resistance.  
**Replace/retain bounds:** Replace the opening skill explanation; retain the progress criteria.  
**Raw grade:** `0.28857142857143003`; banned terms: none.

```text
Your child learns to move and think.
They learn to work with a partner.
They try, make mistakes, and try again.
Sandy sets a task that fits them.
He helps them take the next step.
```

#### G05 — Coach page lead

**Source:** [src/sensei-jiu-jitsu.html](../../src/sensei-jiu-jitsu.html)  
**Current anchor:** calm, structured room built for beginners  
**Replace/retain bounds:** Replace hero supporting copy only; keep names and sourced belt history intact.  
**Raw grade:** `0.8712499999999999`; banned terms: none.

```text
Meet Sandy.
He teaches jiu-jitsu in Tannersville.
Kids, teens, and adults can start here.
He shows you each step.
Ask for help or take a break.
Start with a Free First Visit.
```

#### G06 — Studio page lead

**Source:** [src/sensei-studio.html](../../src/sensei-studio.html)  
**Current anchor:** martial arts dojo and studio headquarters  
**Replace/retain bounds:** Replace hero lead; preserve the building name and verified address.  
**Raw grade:** `0.8712499999999999`; banned terms: none.

```text
See the room. Meet Sandy.
Our studio is in Studios on Main.
Walk upstairs to the second floor.
See the mats and ask your questions.
Sandy helps you plan your first class.
```

#### G07 — Private coaching lead

**Source:** [src/private-lessons.html](../../src/private-lessons.html)  
**Current anchor:** One-on-one coaching for a specific skill or a supported start.  
**Replace/retain bounds:** Replace hero supporting copy, keeping current price output and request-based booking.  
**Raw grade:** `-0.7944444444444443`; banned terms: none.

```text
Work with Sandy one on one.
Tell him who will train.
Share a skill you want to learn.
Ask which times may fit.
Sandy checks the fit and dates first.
Then you can book your class.
```

#### G08 — Private lesson flow

**Source:** [src/private-lessons.html](../../src/private-lessons.html)  
**Current anchor:** Movement Read / Focused Coaching / Optional Solo Practice  
**Replace/retain bounds:** Replace five explanatory step blocks.  
**Raw grade:** `-0.7631428571428565`; banned terms: none.

```text
Share your goal.
Sandy watches how you move.
Work on one skill with him.
Ask for drills to try on your own.
Plan the next step with Sandy.
```

#### G09 — Nervous first-timer lead

**Source:** [src/nervous-first-timers.html](../../src/nervous-first-timers.html)  
**Current anchor:** Your first small-group class is a guided learning experience.  
**Replace/retain bounds:** Replace the long What happens paragraph; retain adult and youth entry distinctions.  
**Raw grade:** `0.15058064516129122`; banned terms: none.

```text
See the room before you train.
Meet Sandy and ask your questions.
He shows you how to tap.
He picks your task and partner.
You can ask for help or rest.
```

#### G10 — Safety page lead

**Source:** [src/jiu-jitsu-safety-tannersville-ny.html](../../src/jiu-jitsu-safety-tannersville-ny.html)  
**Current anchor:** coached resistance at the right pace  
**Replace/retain bounds:** Replace the hero lead; preserve safety rules, risk information and waiver text.  
**Raw grade:** `-0.09682352941176475`; banned terms: none.

```text
Learn the class rules with Sandy.
He shows you how to tap.
He picks a task and partner for you.
You can ask for help or rest.
Sandy guides the pace as you train.
```

#### G11 — Preparation guide lead

**Source:** [src/show-up-kit.html](../../src/show-up-kit.html)  
**Current anchor:** Your first visit is a clear conversation.  
**Replace/retain bounds:** Replace the short Show up calm explanation; keep the arrival and gear checklist.  
**Raw grade:** `0.560384615384617`; banned terms: none.

```text
Meet Sandy for your first visit.
See the room and share your goals.
Follow the time he sends you.
For a visit, wear your day clothes.
To train, bring clean sports clothes.
Follow the class plan Sandy sends you.
```

#### G12 — Parent hub local introduction

**Source:** [src/parent-resources.html](../../src/parent-resources.html)  
**Current anchor:** We teach calm, technical Brazilian Jiu-Jitsu.  
**Replace/retain bounds:** Replace the short local introduction; keep linked guides and parent-specific rules.  
**Raw grade:** `0.21430303030303044`; banned terms: none.

```text
Plan your child’s first visit.
Ask Sandy what to wear and bring.
Share what helps your child feel at ease.
Kids and teens learn with a partner.
Sandy sets the task and pace.
```

#### G15 — Visitor request rule

**Source:** [src/_data/pricing.json:visitorAndSupport](../../src/_data/pricing.json)  
**Current anchor:** available space and suitable partner fit required  
**Replace/retain bounds:** Use on visitor pass cards while preserving each distinct price, visit count, age rule and expiry.  
**Raw grade:** `0.5166666666666693`; banned terms: none.

```text
Ask for a class before you come.
Sandy checks the space and partner fit.
He confirms your class first.
Each pass has its own terms.
See what your pass includes.
```

#### G16 — Continuing student plans

**Source:** [src/options-pricing.njk](../../src/options-pricing.njk)  
**Current anchor:** Continuation only  
**Replace/retain bounds:** Use as plan introduction; keep exact exclusions, completion prerequisites and benefit lists next to each offer.  
**Raw grade:** `0.6650862068965537`; banned terms: none.

```text
These plans are for students who stay on.
First, finish a Core Culture term.
Ask Sandy which plan fits your next step.
Read the full terms for each plan.
```

#### G17 — Guarantee teaser — HOLD

**Source:** [src/options-pricing.njk:434](../../src/options-pricing.njk)  
**Current anchor:** complete request process, extension terms, and exclusions  
**Replace/retain bounds:** Teaser only. Must sit beside exact eligibility and exclusions. Do not replace the policy with this summary. Guarantee page and price page conflict on scope and remedy. Final detailed policy wording is held for source reconciliation.  
**Raw grade:** `2.073205128205128`; banned terms: none.

```text
Some first-term plans include this offer.
Attend at least four classes in 30 days.
Text Sandy within those first 30 days.
Read the full terms before you join.
They show which plans qualify.
They explain each step and the refund rules.
```

#### G19 — Access and inclusion lead

**Source:** [src/inclusion.html](../../src/inclusion.html)  
**Current anchor:** conduct, accommodation, and reporting standards  
**Replace/retain bounds:** Plain summary above full policy. Preserve protected groups, accommodation process and reporting rights verbatim pending policy review.  
**Raw grade:** `2.024750000000001`; banned terms: none.

```text
You deserve respect in class.
Talk with Sandy about what helps you learn.
Ask about the room before you come.
Tell Sandy if you have a concern.
Read the class rules below.
```

#### G20 — Generic learning-page next step

**Source:** [src/partials/acquisition-editorial-rail.html](../../src/partials/acquisition-editorial-rail.html)  
**Current anchor:** Thinking about starting?  
**Replace/retain bounds:** Replace rail lead only; keep first-visit overview and CTA supplied by canonical data.  
**Raw grade:** `0.10653846153846303`; banned terms: none.

```text
Try what you learn with Sandy.
Start with a Free First Visit.
See the room and share your goals.
Sandy helps you plan your first class.
```

#### G21 — Lost-page help

**Source:** [src/404.html](../../src/404.html)  
**Current anchor:** Let’s Get You Back on the Mat  
**Replace/retain bounds:** Replace help copy; keep the 404 status and current working links.  
**Raw grade:** `-0.07789473684210435`; banned terms: none.

```text
This page may have moved.
Find class times or plan your first visit.
Text Sandy if you need help.
```

#### G22 — Class rules introduction

**Source:** [src/class-rules.html](../../src/class-rules.html)  
**Current anchor:** partner-safety, respect, cleanliness, and health rules  
**Replace/retain bounds:** Intro only. Preserve every safety rule, health restriction, report route and emergency instruction.  
**Raw grade:** `1.9916666666666707`; banned terms: none.

```text
Read the rules before you train.
Treat each partner with care.
Ask Sandy to explain a rule.
Parents can read the family guide too.
```

#### G23 — Waiver instructions

**Source:** [src/waiver.html](../../src/waiver.html)  
**Current anchor:** contact + emergency info  
**Replace/retain bounds:** Replace step-one instruction only. Keep legal terms, required labels, consent, signature and youth/adult sequencing intact.  
**Raw grade:** `2.608285714285717`; banned terms: none.

```text
Add your name and contact details.
Name a person we can call in an emergency.
Read the waiver. Ask Sandy about any part.
Sign it before you train.
```

#### G24 — Member hub introduction

**Source:** [src/student-hub.html](../../src/student-hub.html)  
**Current anchor:** arrive feeling prepared  
**Replace/retain bounds:** Replace hub lead, including noindex member surfaces. Keep actual schedule and dated training focus.  
**Raw grade:** `-0.4429999999999996`; banned terms: none.

```text
Get set for class.
Check today’s times.
Read this week’s class task.
Bring water and clean class clothes.
Ask Sandy if you need help.
```

#### G25 — Hospitality partner lead

**Source:** [src/partners-hospitality-hunter-windham.html](../../src/partners-hospitality-hunter-windham.html)  
**Current anchor:** a safe, beginner-friendly Jiu-Jitsu experience  
**Replace/retain bounds:** Replace hero description only. Retain the separate guest and staff actions. Reconcile duration and travel-time claims before publication.  
**Raw grade:** `1.9514999999999993`; banned terms: none.

```text
Help your guests try BJJ.
They can meet Sandy in Tannersville.
Ask about a class during their stay.
Sandy confirms the fit and time first.
```

#### G26 — Wellness partner lead

**Source:** [src/partners-wellness-pt-referrals.html](../../src/partners-wellness-pt-referrals.html)  
**Current anchor:** With Complete Ease for Your Staff  
**Replace/retain bounds:** Replace hero supporting copy. Preserve scope as sport and coaching, not healthcare. Retain qualified screening and provider roles.  
**Raw grade:** `0.37443548387096826`; banned terms: none.

```text
Share a local BJJ class with your clients.
They can ask Sandy how to start.
He guides the class and sets the pace.
Send them the link to a free visit.
```

#### G27 — General FAQ lead

**Source:** [src/bjj-faqs.html](../../src/bjj-faqs.html)  
**Current anchor:** Questions Before Your First Small-Group BJJ Class?  
**Replace/retain bounds:** Replace page lead only. Each answer must keep the right audience, offer facts and linked authority.  
**Raw grade:** `1.7518181818181837`; banned terms: none.

```text
Have a question about BJJ?
Read about class times, prices, and what to wear.
Ask Sandy for help with your first visit.
```

#### G28 — Athlete class explanation

**Source:** [src/athlete-cross-training.html](../../src/athlete-cross-training.html)  
**Current anchor:** positional games, coached resistance  
**Replace/retain bounds:** Replace What happens during class paragraph only. Preserve fit decisions, age boundaries and actual training content.  
**Raw grade:** `-0.347307692307691`; banned terms: none.

```text
Warm up with help from your coach.
Learn how to fall and stand.
Try a task with a partner.
Sandy guides the pace as you learn.
```

### Core funnel and booking

#### F01 — F01

**Source:** [src/partials/nav-include.html:16,35,79,90](../../src/partials/nav-include.html)  
**Current anchor:** Check available times; A family training ground in Tannersville, NY; Programs; The Experience  
**Replace/retain bounds:** Use each line for its matching text slot. Keep every link and ID.  
**Raw grade:** `-1.6366666666666667`; banned terms: none.

```text
See times.
BJJ for kids, teens, and adults.
Classes.
Your first class.
```

#### F02 — F02

**Source:** [src/partials/footer-include.html:12](../../src/partials/footer-include.html)  
**Current anchor:** Calm, technical Jiu-Jitsu where every student is seen, guided, and supported. You will not disappear into the room.  
**Replace/retain bounds:** Keep contact facts and review quotes intact.  
**Raw grade:** `-0.9724999999999984`; banned terms: none.

```text
Learn BJJ at your pace. Sandy shows you each step. Ask for help as you learn.
```

#### F03 — F03

**Source:** [src/partials/home-conversion-shell.html:668](../../src/partials/home-conversion-shell.html)  
**Current anchor:** See the room, learn the safety flow, and choose the right next step.  
**Replace/retain bounds:** Keep current simple hero and current adult first-visit rules.  
**Raw grade:** `-2.4899999999999984`; banned terms: none.

```text
See the room. Learn the rules. Plan your first class.
```

#### F04 — F04

**Source:** [src/partials/home-conversion-shell.html:760](../../src/partials/home-conversion-shell.html)  
**Current anchor:** To reserve directly, open the reservation calendar  
**Replace/retain bounds:** Anchor See visit times to current calendar; Text Sandy to current SMS link.  
**Raw grade:** `1.468076923076925`; banned terms: none.

```text
Pick a time for your free visit. See visit times or text Sandy.
```

#### F05 — F05

**Source:** [src/partials/program-conversion-adults.html:56,62,69,70](../../src/partials/program-conversion-adults.html)  
**Current anchor:** Build balance, stamina, and strength through coached practice.; Safety and posture basics.; Movement and controlled practice.  
**Replace/retain bounds:** Separate heading and body slots; avoid a guaranteed fitness outcome.  
**Raw grade:** `-0.2666666666666657`; banned terms: none.

```text
Build skill at your own pace.
Learn how to move.
Try each move with a partner.
Sandy sets a task. Your partner moves as you try. Sandy guides the pace.
```

#### F06 — F06

**Source:** [src/partials/program-conversion-adults.html:92](../../src/partials/program-conversion-adults.html)  
**Current anchor:** Meet Sandy, see the room, review safety, and talk through your schedule and goals.  
**Replace/retain bounds:** First visit remains required before adult class.  
**Raw grade:** `-0.7541666666666664`; banned terms: none.

```text
Meet Sandy. See the room. Learn the rules. Talk about your goals and class times.
```

#### F07 — F07

**Source:** [src/partials/program-conversion-adults.html:103,104,131,132](../../src/partials/program-conversion-adults.html)  
**Current anchor:** First-Enrollment Uniform.; Adults receive a new uniform with their first term enrollment.; Class Recommendation.  
**Replace/retain bounds:** Gear belongs to first paid enrollment, never the free visit.  
**Raw grade:** `0.09958620689655362`; banned terms: none.

```text
Gear for your first paid term.
Your first paid term comes with a uniform.
Find your class.
Sandy helps you choose a class. Talk about your goals and pace.
```

#### F08 — F08

**Source:** [src/partials/program-conversion-adults.html:149](../../src/partials/program-conversion-adults.html)  
**Current anchor:** Many of our adult students started because their kids joined first. You spend the week driving kids around. Take one hour on the mats to build strength, mobility, and focus in a friendly room.  
**Replace/retain bounds:** Removes unsupported prevalence claim and broad outcome promise.  
**Raw grade:** `-1.1845714285714273`; banned terms: none.

```text
A class for you.
Does your child train here? You can try a class too. Meet Sandy and share your goals. Pick a class that fits your week.
```

#### F09 — F09

**Source:** [src/partials/program-conversion-kids.html:2](../../src/partials/program-conversion-kids.html)  
**Current anchor:** Your child meets Sandy, sees the room, and tries a coached class. A parent or guardian stays on-site. Sandy confirms the class and gear.  
**Replace/retain bounds:** Youth class is part of its own plan; retain age 5–9.  
**Raw grade:** `1.1357258064516138`; banned terms: none.

```text
Your child meets Sandy and sees the room. Then they try a class with his help. A parent or guardian stays on site. Sandy confirms the class and what to wear.
```

#### F10 — F10

**Source:** [src/partials/program-conversion-teens.html:2](../../src/partials/program-conversion-teens.html)  
**Current anchor:** Your teen meets Sandy, sees the room, and tries a coached class. A parent or guardian stays on-site. Sandy confirms the class and what to wear.  
**Replace/retain bounds:** Retain teen age 10–17 and guardian requirement.  
**Raw grade:** `1.1357258064516138`; banned terms: none.

```text
Your teen meets Sandy and sees the room. Then they try a class with his help. A parent or guardian stays on site. Sandy confirms the class and what to wear.
```

#### F11 — F11

**Source:** [src/partials/program-conversion-kids.html:28,29](../../src/partials/program-conversion-kids.html); [src/partials/program-conversion-teens.html:28,29](../../src/partials/program-conversion-teens.html)  
**Current anchor:** A steady 12-week rhythm for your child.; Teens practice balance, body control, safe partner work, and smart problem-solving.  
**Replace/retain bounds:** Shared structure; child or teen context remains in hero.  
**Raw grade:** `-1.1923076923076916`; banned terms: none.

```text
Your first 12 weeks.
Learn to move and work with a partner. Sandy guides each class. Try a task. Learn the rules. Build skill as you train.
```

#### F12 — F12

**Source:** [src/partials/program-conversion-kids.html:44-48](../../src/partials/program-conversion-kids.html); [src/partials/program-conversion-teens.html:57](../../src/partials/program-conversion-teens.html)  
**Current anchor:** Thoughtful partner matching and skill tracking.; The total depends on weekly class frequency.  
**Replace/retain bounds:** Use child for the kids page and teen for the teens page. Keep data-driven prices, the first-paid-term restriction and video-access limits. Each line maps to the matching existing list item.  
**Raw grade:** `1.4685714285714297`; banned terms: none.

```text
Sandy helps each child find a partner.
Sandy checks what they learn.
Your first paid term comes with a uniform.
Use the class videos under your plan terms.
At week 12, talk about what comes next.
Your price depends on classes each week.
```

#### F13 — F13

**Source:** [src/partials/program-conversion-teens.html:77,78,90,91](../../src/partials/program-conversion-teens.html)  
**Current anchor:** Practice, adjust, and review what comes next.; They learn positions, test solutions against resistance, and build real skill.  
**Replace/retain bounds:** Retains partner resistance through concrete task language; does not promise only passive drills.  
**Raw grade:** `-0.4429999999999996`; banned terms: none.

```text
Learn a step. Try it in class.
Sandy sets a task. Your partner moves as you try. Sandy helps you learn as you go.
```

#### F14 — F14

**Source:** [src/contact.html:24,47](../../src/contact.html)  
**Current anchor:** We answer questions fast and help you pick the right class.; Text is the fastest way to get answers.  
**Replace/retain bounds:** Drops unverified response-speed claim; current phone/address remain data-owned.  
**Raw grade:** `1.1700000000000017`; banned terms: none.

```text
Ask about classes for kids, teens, or adults. Text Sandy with your questions. He can help you choose a class.
```

#### F15 — F15

**Source:** [src/contact.html:181,182](../../src/contact.html)  
**Current anchor:** Most students start after school, evenings, or Saturday morning.  
**Replace/retain bounds:** Use /schedule; avoids unverified student-prevalence and copied timing claims.  
**Raw grade:** `0.6790909090909132`; banned terms: none.

```text
Find a class time that fits.
See class times for kids, teens, and adults. Text Sandy for help with your first visit.
```

#### F16 — F16

**Source:** [src/options-pricing.njk:19,54,68,69,128,130](../../src/options-pricing.njk)  
**Current anchor:** Find your weekly training rhythm.; Annual continuation pricing; A planned training rhythm for your first term.  
**Replace/retain bounds:** Keep price cells and scope qualifiers; this replaces prose only, not totals.  
**Raw grade:** `0.3158578431372554`; banned terms: none.

```text
Pick your class plan.
Start with a Free First Visit.
Choose one, two, or three classes each week. Sandy confirms the class times and fit. Your first term lasts 12 weeks.
Year plans for your next term.
Finish a Core Culture term first. Then meet with Sandy to review your next plan.
```

#### F17 — F17

**Source:** [src/options-pricing.njk:140](../../src/options-pricing.njk)  
**Current anchor:** A 12-week first term with coached classes, partner matching, progress tracking, a first-enrollment uniform, and the Async Practice Vault under the current offer terms.  
**Replace/retain bounds:** Keep official plan name outside this plain explanation; no change to video access duration.  
**Raw grade:** `0.20959459459459495`; banned terms: none.

```text
Train for 12 weeks with Sandy. He helps you find a partner. He checks your skills as you learn. Your first paid term comes with a uniform. Your plan has class videos too. Read the full plan terms.
```

#### F18 — F18

**Source:** [src/_data/pricing.json: productPolicy.annualPayment.publicCopy](../../src/_data/pricing.json)  
**Current anchor:** Keep two cards on file to use the annual rate. Pay in full before the year starts, or pay in 12 monthly installments. Both choices cover a 12-month commitment. Monthly installments are due before each month of training.  
**Replace/retain bounds:** Use only for annual policy. Retains term length, both payment modes, due dates and two-card rule.  
**Raw grade:** `1.0095135135135145`; banned terms: none.

```text
Keep two cards on file for a year plan. You agree to a full year. Pay in full before the year starts. Or split the cost into 12 monthly payments. Each is due before that month of class.
```

#### F19 — F19

**Source:** [src/options-pricing.njk:86](../../src/options-pricing.njk)  
**Current anchor:** The final payment adjusts cents so all 12 payments equal the annual total.  
**Replace/retain bounds:** Retain exact installment table and annual total.  
**Raw grade:** `0.9132352941176478`; banned terms: none.

```text
The last payment may change by a few cents. All 12 payments add up to your year price.
```

#### F20 — F20

**Source:** [src/free-bjj-intro-tannersville-ny/index.html:114-117](../../src/free-bjj-intro-tannersville-ny/index.html)  
**Current anchor:** Youth visit and class plan; Plan 60–75 minutes. Arrive 20 minutes before class. Wear clean sports clothes or the gear Sandy asks for.  
**Replace/retain bounds:** Youth-only timing; never apply to adult 15-minute visit. Preserve visitPreparation waiver specifics. Keep this on the youth flow only; retain the current waiver link and actual confirmation order.  
**Raw grade:** `1.40849816849817`; banned terms: none.

```text
Your child’s visit and class.
Plan for 60 to 75 minutes. Come 20 minutes before class. Bring clean sports clothes or the gear Sandy names. A parent or guardian stays with your child. Send the waiver first. Sandy then confirms the class.
```

#### F21 — F21

**Source:** [js/progressive-booking.js:154](../../js/progressive-booking.js)  
**Current anchor:** Try dates again or open new tab. Text Sandy for help.  
**Replace/retain bounds:** Failure state only; not a booking confirmation.  
**Raw grade:** `1.2399999999999984`; banned terms: none.

```text
Try the visit times again. Or open them in a new tab. Text Sandy for help.
```

#### F22 — F22

**Source:** [js/progressive-booking.js:160](../../js/progressive-booking.js)  
**Current anchor:** Retry calendar  
**Replace/retain bounds:** Button keeps existing retry action.  
**Raw grade:** `2.890000000000004`; banned terms: none.

```text
Try again.
```

#### F23 — F23

**Source:** [js/progressive-booking.js:174](../../js/progressive-booking.js)  
**Current anchor:** Visit times are on the way.  
**Replace/retain bounds:** Loading state only. This is a clarity edit; the existing sentence has no spelling or grammar error.  
**Raw grade:** `0.7199999999999989`; banned terms: none.

```text
Please wait. We are loading your visit times.
```

#### F24 — F24

**Source:** [src/free-bjj-intro-tannersville-ny/index.html:95](../../src/free-bjj-intro-tannersville-ny/index.html)  
**Current anchor:** Your Free First Visit is booked.; Check the date and time in your booking note.  
**Replace/retain bounds:** KEEP with small clarity edit. Show only after real booking proof; wording cannot fix event trust.  
**Raw grade:** `0.7083333333333321`; banned terms: none.

```text
Your Free First Visit is booked.
Check your booking note for the date and time.
```

#### F26 — F26 — HOLD

**Source:** [src/partials/program-conversion-kids.html:60](../../src/partials/program-conversion-kids.html)  
**Current anchor:** Easy rescheduling by text.; Eligible for the 30-Day Training Fit Guarantee under current terms.  
**Replace/retain bounds:** Keep official 30-Day Training Fit Guarantee name in linked heading. Detailed eligibility remains in terms.  
**Raw grade:** `1.5`; banned terms: none.

```text
Need to change class times? Text Sandy.
Your first paid term may qualify for our guarantee. Read the full terms to see what applies.
```

### Editorial, local pages, and evidence

#### C01 — Hunter town opener

**Source:** [src/near/hunter-ny/index.html:26](../../src/near/hunter-ny/index.html)  
**Current anchor:** “coach-led beginner structure”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.7199999999999989`; banned terms: none.

```text
Coming from Hunter? Meet Sandy in Tannersville. See the room. Learn the class rules. Ask which class fits your week.
```

#### C02 — Windham town opener

**Source:** [src/near/windham-ny/index.html:100](../../src/near/windham-ny/index.html)  
**Current anchor:** “the useful question is more than what is closest”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-1.1923076923076916`; banned terms: none.

```text
Live near Windham? Come meet Sandy. See the mats and learn the rules. Check class times. Plan your trip. Choose a class that fits your week.
```

#### C03 — Haines Falls town opener

**Source:** [src/near/haines-falls-ny/index.html:26](../../src/near/haines-falls-ny/index.html)  
**Current anchor:** “structured, beginner-safe option”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.07000000000000028`; banned terms: none.

```text
Live in Haines Falls? Try BJJ in Tannersville. Meet Sandy and see the room. Ask how your child can start.
```

#### C04 — Town class and route summary

**Source:** [src/near/hunter-ny/index.html:105](../../src/near/hunter-ny/index.html)  
**Current anchor:** “morning private lessons are available”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.03590909090908845`; banned terms: none.

```text
Check the class times before you drive. Ask Sandy which class fits. Want time with just the coach? Text Sandy to ask.
```

#### C05 — Glossary hub intro

**Source:** [src/bjj-glossary/index.html:135](../../src/bjj-glossary/index.html)  
**Current anchor:** “Brazilian Jiu Jitsu vocabulary”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.8804999999999978`; banned terms: none.

```text
Learn the words you hear in BJJ. BJJ is a way to grapple. You learn to move with a partner. Start with these plain guides.
```

#### C06 — Glossary learning path

**Source:** [src/bjj-glossary/index.html:3566](../../src/bjj-glossary/index.html)  
**Current anchor:** “one seamless learning journey”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-1.316447368421052`; banned terms: none.

```text
Read a word. Watch how it works. Try it in class with Sandy. Ask for help as you learn.
```

#### C07 — Glossary plan link

**Source:** [src/bjj-glossary/index.html:3587](../../src/bjj-glossary/index.html)  
**Current anchor:** “36 coached classes”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.6257142857142846`; banned terms: none.

```text
See the class plans and what each includes. Ask Sandy which plan fits you.
```

#### C08 — Glossary base definition

**Source:** [src/bjj-glossary/index.html:282](../../src/bjj-glossary/index.html)  
**Current anchor:** “structure and balance that keep you stable”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.07833333333333137`; banned terms: none.

```text
Base means how you hold your balance. A strong base helps you stay in place.
```

#### C09 — Glossary beginner path

**Source:** [src/bjj-glossary/index.html:289](../../src/bjj-glossary/index.html)  
**Current anchor:** “partner expectations”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.5214130434782618`; banned terms: none.

```text
New to class? Sandy shows you the rules. You learn how to move with care. You work with a partner at your pace.
```

#### C10 — Blog guide CTA

**Source:** [src/blog/index.html:1379](../../src/blog/index.html)  
**Current anchor:** “map your goal”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.06833333333333158`; banned terms: none.

```text
Meet Sandy. See the room and ask questions. Talk about your goals. Then choose a class that fits.
```

#### C11 — Blog private lesson card

**Source:** [src/blog/index.html:933](../../src/blog/index.html)  
**Current anchor:** “Morning hours to meet your goals”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.1388888888888875`; banned terms: none.

```text
Want to learn with just Sandy? Ask what times are open. Choose a time that fits your week.
```

#### C12 — Holiday intro — HOLD

**Source:** [src/holiday-schedule.html:17](../../src/holiday-schedule.html)  
**Current anchor:** “holiday closures, short-session days”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.06380952380952642`; banned terms: none.

```text
See when we hold class on school breaks. Check dates here before you come. Text Sandy to check your class time.
```

#### C13 — Holiday school note — HOLD

**Source:** [src/holiday-schedule.html:161](../../src/holiday-schedule.html)  
**Current anchor:** “Academy decisions may differ from school closures”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.560384615384617`; banned terms: none.

```text
School and gym dates can differ. Check the gym plan here before class.
```

#### C14 — Holiday term note — HOLD

**Source:** [src/holiday-schedule.html:162](../../src/holiday-schedule.html)  
**Current anchor:** “12 instructional weeks”.  
**Replace/retain bounds:** Use only where the applicable plan has 12 instructional weeks. Keep dated closures and all makeup rules; confirm date conflicts before publication.  
**Raw grade:** `-0.5999999999999996`; banned terms: none.

```text
Your term has 12 weeks of classes. Planned gym breaks keep those weeks whole. Check here for changes due to weather.
```

#### C15 — Holiday special rule — HOLD

**Source:** [src/holiday-schedule.html:283](../../src/holiday-schedule.html)  
**Current anchor:** “advance sign-up”.  
**Replace/retain bounds:** Intro above the exact thresholds, not a replacement for them. Keep each event minimum, deadline, eligibility and cancellation/refund rule visible.  
**Raw grade:** `1.1642105263157916`; banned terms: none.

```text
Sign up first for each special class. Each class needs enough guests to run. Sandy texts you to confirm.
```

#### C16 — Party lead response

**Source:** [src/birthday-parties.html:325](../../src/birthday-parties.html)  
**Current anchor:** “texts you back right away”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.5166666666666693`; banned terms: none.

```text
Sandy checks your dates. He texts you to help plan your party.
```

#### C17 — Party class activity

**Source:** [src/birthday-parties.html:100](../../src/birthday-parties.html)  
**Current anchor:** “body control, and teamwork”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.8049999999999997`; banned terms: none.

```text
Kids try simple moves with a partner. They learn to balance and work as a team.
```

#### C18 — After-school hero detail

**Source:** [src/after-school.html:430](../../src/after-school.html)  
**Current anchor:** “A Scheduled Martial Arts Small-Group Class With a Clear First Step”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.5166666666666693`; banned terms: none.

```text
Plan your child’s first class. Meet Sandy and see the room. A parent or guardian stays for class.
```

#### C19 — After-school focus and self-control

**Source:** [src/after-school.html:459](../../src/after-school.html)  
**Current anchor:** “following steps, and staying with a task”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.07789473684210435`; banned terms: none.

```text
Kids listen and follow each step. They try one task at a time. They learn to move with care.
```

#### C21 — Evidence study intro

**Source:** [src/evidence.html:39](../../src/evidence.html)  
**Current anchor:** “studies do not agree on every test”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `0.5011851851851858`; banned terms: none.

```text
Some studies look at BJJ. Some look at other sports. The results differ. These studies can help us plan. Each child may learn in their own way.
```

#### C22 — Evidence class example scope

**Source:** [src/evidence.html:88](../../src/evidence.html)  
**Current anchor:** “studies above did not test these exact games”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.00999999999999801`; banned terms: none.

```text
These games show how we teach. The studies looked at other tasks. Our class games still need their own tests.
```

#### C23 — Evidence limits

**Source:** [src/evidence.html:107](../../src/evidence.html)  
**Current anchor:** “BJJ is not a cure”.  
**Replace/retain bounds:** Replace the cited limitation summary only; keep the original study-specific caveats and citations.  
**Raw grade:** `1.014230769230771`; banned terms: none.

```text
BJJ is a sport, not a cure. Results can vary for each child. These studies cannot rank BJJ above all sports. Come see how we teach.
```

#### C24 — Marietta report scope

**Source:** [src/research/marietta-police-bjj-case-summary.html:39](../../src/research/marietta-police-bjj-case-summary.html)  
**Current anchor:** “department-reported comparisons”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `1.985000000000003`; banned terms: none.

```text
The police shared these results. The report does not say how staff were put in groups. We cannot tell if BJJ caused the change. Other teams may get different results. The report leaves out group sizes and tests of chance.
```

#### C25 — Marietta missing data

**Source:** [src/research/marietta-police-bjj-case-summary.html:62](../../src/research/marietta-police-bjj-case-summary.html)  
**Current anchor:** “participant count, incident counts, statistical tests, exposure rates”.  
**Replace/retain bounds:** Plain lead above the full missing-data list. Keep participant counts, incidents, exposure rates, statistical tests and baseline group differences in the underlying evidence record.  
**Raw grade:** `1.0750649350649368`; banned terms: none.

```text
Some facts are missing from the report. How many staff took part? How often did each group use force? How many cases were there? How did the groups differ at the start? Was the gap due to chance? The report leaves these questions open.
```

#### C26 — Marietta local scope

**Source:** [src/research/marietta-police-bjj-case-summary.html:70](../../src/research/marietta-police-bjj-case-summary.html)  
**Current anchor:** “does not measure our classes”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `1.2154545454545485`; banned terms: none.

```text
This report is about one police team. It did not test our classes. It cannot tell us what our classes would change.
```

#### C27 — Police research CTA

**Source:** [src/research/law-enforcement-bjj-evidence.html:111](../../src/research/law-enforcement-bjj-evidence.html)  
**Current anchor:** “recurring grappling pilot program”.  
**Replace/retain bounds:** Replace only the cited passage; retain page facts and linked sources.  
**Raw grade:** `-0.00999999999999801`; banned terms: none.

```text
Want to plan BJJ for your team? Talk with Sandy about your goals. Share your rules and class needs first.
```

### Search and social descriptions

#### M01 — Home search description

**Source:** [src/index.html:4](../../src/index.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.0075000000000003`; banned terms: none.

```text
Learn BJJ in Tannersville. Kids, teens, and adults can start here. Meet Sandy for a Free First Visit. Find a class that fits your week.
```

#### M02 — Kids search description

**Source:** [src/bjj-classes/kids-tannersville-ny/index.html:4](../../src/bjj-classes/kids-tannersville-ny/index.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.9017592592592614`; banned terms: none.

```text
Kids learn BJJ with Sandy in Tannersville. See the room and try a class. A parent or guardian stays. Sandy confirms the class and what to wear.
```

#### M03 — Teens search description

**Source:** [src/bjj-classes/teens-tannersville-ny/index.html:4](../../src/bjj-classes/teens-tannersville-ny/index.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.9219230769230755`; banned terms: none.

```text
Teens learn BJJ with Sandy in Tannersville. Try a class at your pace. A parent or guardian stays. Sandy confirms the class and what to wear.
```

#### M04 — Adults search description

**Source:** [src/bjj-classes/adults-tannersville-ny/index.html:4](../../src/bjj-classes/adults-tannersville-ny/index.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.3752592592592627`; banned terms: none.

```text
Start BJJ in Tannersville. Meet Sandy for a free visit. Choose to train that day or later. Sandy confirms the class first. Your first class is free.
```

#### M05 — Prices search description

**Source:** [src/options-pricing.njk:4](../../src/options-pricing.njk)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.0177173913043518`; banned terms: none.

```text
See BJJ class plans in Tannersville. Start with a Free First Visit. Compare prices and terms. Ask Sandy which plan fits your week.
```

#### M06 — Schedule search description

**Source:** [src/schedule.html:4](../../src/schedule.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.0177173913043518`; banned terms: none.

```text
See BJJ class times in Tannersville. Find times for kids, teens, and adults. Check the plan before you come. Text Sandy for help.
```

#### M07 — Contact search description

**Source:** [src/contact.html:4](../../src/contact.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `2.7716666666666683`; banned terms: none.

```text
Text, call, or email Sandy in Tannersville. Ask about BJJ for kids, teens, and adults. Get help with class times and your first visit.
```

#### M08 — Glossary search description

**Source:** [src/bjj-glossary/index.html:4](../../src/bjj-glossary/index.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `0.04384615384615387`; banned terms: none.

```text
Learn the words you hear in BJJ. Read plain guides to grips, moves, and class rules. Ask Sandy how to try a skill at your pace.
```

#### M09 — Holiday search description — HOLD

**Source:** [src/holiday-schedule.html:4](../../src/holiday-schedule.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.7652173913043505`; banned terms: none.

```text
Check BJJ class dates for school breaks and holidays in Tannersville. See days with a change. Text Sandy to check your class time.
```

#### M10 — Blog search description

**Source:** [src/blog/index.html:4](../../src/blog/index.html)  
**Current anchor:** Existing page description in front matter.  
**Replace/retain bounds:** Replace the search description and matching social description. Keep the title topic, brand and canonical URL. Check the final emitted description for template padding or clipping.  
**Raw grade:** `1.3480000000000025`; banned terms: none.

```text
Read BJJ guides from Sensei Sandy. Learn class words and plan your first visit. Find tips for kids, teens, and adults who want to start.
```

## Verification and acceptance criteria

### Completed for this document

- All 85 exact public-copy fences were checked separately with `tools/readability-check.mjs`, `--json --max-grade 3`; no rounding was used for pass/fail.
- Every referenced replacement source path exists locally. Current phrases and line numbers are application anchors, not claims of live-page verification.
- Parent review checked audience distinctions, paid gear, source ownership, uncertainty, and replacement bounds. Policy/date holds are explicit.
- No website implementation, build, browser, live HTTP, deployment, booking, or conversion result is claimed.

### Required when implementing

- **DOD-01:** Every changed text slot has a clear owner and one matching replacement; generated glossary/search/schema output stays in sync.
- **DOD-02:** Each exact public block, each independent error/loading/success state, and final visible page text pass raw grade ≤3 and banned-term checks. Do not pad short labels or average hidden/dormant copy to force a pass. Review names, technical terms, and verbatim legal/quoted passages explicitly; unresolved failures prevent an unqualified whole-page pass.
- **DOD-03:** Prices, schedule, contact, ages, visit sequence, paid gear, eligibility, and research claims match their canonical sources. Guarantee and holiday conflicts are resolved before affected copy is published.
- **DOD-04:** Check the public copy aloud for clarity and complete meaning. Finish the formal four-rubric release review, recording applicable results and exceptions. Retain accurate caveats even where a positive-framing rule would otherwise remove them.
- **DOD-05:** Check mobile and desktop layout, heading order, visible CTA, tap targets, contrast/focus, meaningful alt text, form labels, and screen-reader state messages. Keep primary actions above the fold where the existing layout supports them.
- **DOD-06:** Check links and canonical paths, final title/meta/social descriptions, and FAQ/schema agreement. Confirm the configured current QA commands before running them; the input audit identified stale script names.
- **DOD-07:** When implementation validation is authorized, run focused volatile-fact/schedule/link/booking checks and the applicable build. Real confirmation requires accepted booking evidence; hidden success markup is not evidence. Keep local, live, publication, and measured-outcome evidence separate.

### Reproduce the copy check

Extract only the `text` fences, one per file. Run this command for each file:

```sh
node tools/readability-check.mjs /tmp/copy-block.txt --json --max-grade 3
```

Keep raw JSON results and exit status. A score of 3.001942 fails even if a display rounds it to 3.00. These checks measure a reading formula and a word list; they do not establish comprehension or conversion improvement.
