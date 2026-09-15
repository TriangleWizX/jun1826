# Persona integration — September 14, 2026

The unit of creative planning is now a buying situation: persona + immediate question + proof + offer + next step. Age, gender, occupation and hobbies are context, not facts about everyone seeing an ad. Persona names are internal labels; never display them in public creative or infer them from someone's photo.

## What changed in the code

- personas.json contains all seven personas, their economic roles, objections, visual briefs, current offer paths, CTA, destination and follow-up IDs.
- concepts.json replaces 25 generic messages with 36 concepts: Carla 10, Ben 9, Tyler 5, Casey 4, Frankie 4, Wendy 4. Four Carla concepts explicitly carry Ian as an experience lens.
- The default planner selects 25 concepts with the 8:7:3:3:2:2 allocation below, then makes two layouts in three formats. Concept selection changes reproducibly with the week. This is an allocation of creative review effort, not recommended ad spend or seven separate ad sets.
- plan works without approved photos. render requires eligible assets. Optional asset persona_ids narrows an audience tag: adult alone can match Ben, Casey or Wendy, so use persona_ids when a photo supports only some situations. An omitted list imposes no additional restriction.
- CTA and destination are persona-specific. Wendy goes to the existing pricing/visitor options page. Others use the existing first-visit page. Distinct landing-page messages remain an integration brief, not new pages claimed to exist. A UTM does not select the child/adult tab automatically.
- The manifest includes persona, experience lens, offer, follow-up ID and CTA. Changed CTA/destination changes the creative ID.
- Small previews are now allowed. The previous 100-image minimum was an unnecessary requirement and has been deleted.

| Persona | Concepts in default run | Exports | Immediate ad job | Proof direction | Next action |
|---|---:|---:|---|---|---|
| Carla | 8 | 48 | Make a youth visit feel understandable and feasible | Coach supervising real partner play | Plan youth first visit |
| Ben | 7 | 42 | Make beginning feel manageable | Ordinary adults, coaching, starting pace | Plan adult first visit |
| Tyler | 3 | 18 | Make grappling relevant between seasons | Teen peers, balance/control tasks | Plan teen first visit |
| Casey | 3 | 18 | Connect local training with eligible service terms | Current eligibility and suitable times | Plan visit, verify qualification |
| Frankie | 2 | 12 | Test demand for a household routine | Accurate class arrangements | Plan visits for each person |
| Wendy | 2 | 12 | Help a traveler arrange an appropriate class | Visitor options, location, confirmed availability | See visitor options |
| Ian | Included in Carla | No separate quota | Show why a child wants to return | Games, small wins, familiar partners | Guardian remains the contact |

Carla and Ben receive 60% of exports because your supplied strategy prioritizes them. This is a starting hypothesis; there is no segment revenue analysis establishing the optimal share. A count of 200 is supported by the 216 possible combinations in the 36-concept bank. Nonmultiples of six end with a partial format set; the manifest makes that visible.

## Commands

```bash
python ads.py plan --count 150 --week 2026-W38
python ads.py render --count 150 --week 2026-W38
python ads.py render --count 6 --personas wendy --week wendy-preview
python ads.py render --count 12 --personas carla ben --week primary-preview
```

Run from this folder after installing requirements. The actual codebase is still not attached. Integrate the folder as an offline tool, not into the public browser bundle. No campaigns, page changes, messages, or recurring jobs are activated.

## Message-to-page-to-follow-up alignment

Each row is an implementation brief for the real site/CRM. The followups.json file is event-based drafting guidance, not an outbound messaging script. Confirmed appointment data must supply dates and times. Stop a sequence for replies, cancellations or opt-outs; do not keep sending three generic reminders after a reply. Follow up with the guardian for youth. Ian is not a recipient. Do not collect child contact details for this system.

| Persona | Landing-page message to develop | Useful next question | Outcome to measure |
|---|---|---|---|
| Carla | See the room, meet the coach, understand the youth first class | Which age and days fit? What did the child enjoy afterward? | Attended youth visits → enrollment; later attendance/renewal |
| Ben | Meet Sandy before the workout; see how starting works | Which visit time fits? What remains unclear? | Adult arrivals → coached-class attendance → enrollment |
| Tyler | Explore a challenge between seasons; clarify the actual commitment | What sport/season and times must it fit? | Teen arrivals → enrollment and attendance through the season |
| Casey | Explain qualified service pricing and real scheduling | What eligible category and available times apply? | Qualified arrivals → enrollments; actual schedule fit |
| Frankie | Explain whether family members attend separately or together | Who is starting, and what arrangement is actually useful? | Household inquiries → suitable visits → household enrollment |
| Wendy | Show visitor options, appropriate-class availability and location first | When are you visiting and what is your experience? | Confirmed paid visits and repeat visits; not Core conversion |

For homepage work, keep clear child/teen/adult choices and emphasize Carla/Ben. Test “Family Jiu-Jitsu” against an explicit “Jiu-jitsu for kids, teens and adults” control before making it the only headline. “Family” may signal warmth to some adults and a children's program to others. Do not let specialist campaigns force every segment into the hero.

## Apply the four questions to the persona model itself

| Requirement to question | What does that mean? | How do you know that? | So what? | Why do we care / reversible decision |
|---|---|---|---|---|
| Seven personas require seven funnels and ad sets | Seven research lenses become seven paid audiences and builds | The supplied model describes motivations, not validated traffic volumes | Can fragment a small local budget and duplicate pages | Keep six route configurations and one experience lens. Build separate pages only when different promises or results justify them. |
| Carla is always a mother of two aged 6–12 | Literal demographic qualification | Useful example; no supplied customer distribution establishes it | Excludes fathers, guardians and one-child households | Use parent/guardian-facing copy. Restore narrower creative only for a deliberate, supported campaign. |
| Ben is male, 28–48, and watches specific creators | Media habits become targeting requirements | These are plausible anecdotes, not measured conversion predictors | Can exclude capable prospects who share the same beginner concern | Test the beginner situation broadly. Keep gender/age stereotypes out of default copy. |
| Ian needs his own acquisition campaign | The retention influencer becomes the paying buyer | Parent/child roles are explicitly different | Misses the guardian decision and contact path | Delete the separate acquisition quota. Restore child-oriented formats for actual family viewing or in-studio use. |
| Tyler needs 2–3 trial sessions | A proposed entry sequence becomes a current offer | No verified public pilot terms supplied | Could promise free or flexible sessions that do not exist | Keep the current first-visit path. Restore after defining price, number, eligibility and booking operations. |
| Sport transfer can be promised | Grappling practice guarantees better football, skiing or other performance | No outcome evidence supplied | Overclaims what practice delivers | Name balance/control practice; test athlete relevance without guaranteed transfer. |
| Every community worker qualifies | A broad identity label becomes discount eligibility | Live page lists specific eligible categories | Misquotes terms and creates awkward follow-up | State “ask about eligibility.” Restore broader qualification only after actual pricing policy changes. |
| The fit guarantee applies to every segment | One reassurance line travels across all offers | Current pricing excludes community-service plans and visitor packs | Misleading expectations | No generic guarantee badge. Add only an offer-specific, reviewed treatment with accurate conditions. |
| Family means parents and children train together | Shared identity implies a simultaneous mixed-age class | Family intent does not establish the actual class format | The emotional promise may differ from delivery | Use household-routine copy now. Restore shared-class wording when the service and timetable support it. |
| Every prospect sees a 12-week plan first | Enrollment information must precede an initial inquiry | Wendy's job is a visit; beginner uncertainty may concern the first day | Adds irrelevant commitment friction | Match next step to situation; retain transparent terms on the destination. |
| Personas prove the strongest segment | Strategic priority is treated as financial evidence | No segmented revenue/cohort report supplied | Effort may follow a compelling story rather than demand | Tag outcomes, review monthly, and change weights using attendance, enrollments and capacity. |

Keep age-group eligibility distinct from persona ages: a 10- or 11-year-old can carry Ian's experience needs while belonging to the site's teen booking group. The script does not derive a booking class from persona names or story ages. Confirm actual age in the booking flow.

## Photography changes that matter

Carla should see supervision; Ian should see something worth doing. One real photo can serve both, but the distinction should guide selection. Use actual partner play, attentive coaching, effort and small successes. Ben needs a credible view of ordinary adult learning, not only champions. Tyler needs age-appropriate challenge. Casey does not need uniforms at work or invented occupational identity. Frankie needs honest evidence of the actual family arrangement. Wendy needs the room and appropriate training logistics.

The current asset inventory is only six homepage IMG sources. That is not enough to claim a diverse, persona-complete visual bank. Curate repository originals, add persona_ids, and use the briefs in personas.json. Do not mistake changing headlines over one room photo for full creative variety. All production asset approvals remain unapproved until their suitability is confirmed; test approvals must never persist.

## Learning loop

Choose one persona, one message contrast and a stable photo/layout control. Keep spend, delivery context and attribution window comparable where possible. Use attended visits as the early primary outcome for local enrollment; use paid visitor attendance for Wendy. Then measure appropriate enrollment and retention. Do not compare Wendy's membership conversion with Carla's or label a child “low value” from acquisition data.

Record creative_id, persona_id, offer_id and followup_id with aggregate outcomes. The manifest is only a join key; conversion events and booking attribution are not installed. UTMs must be preserved through the actual booking system before claiming source attribution. When samples are small, label results directional rather than declaring a winning persona.

## Live checks and boundaries

Checked September 14, 2026:
- https://senseisandy.com/free-bjj-intro-tannersville-ny — adult visit and youth arrival expectations remain different; the general opening copy still needs clearer audience qualification.
- https://senseisandy.com/options-pricing — visitor offers and service eligibility are listed; the community-service rate is outside the fit guarantee. Visitor access is subject to space and partner fit.

The Visitor Training navigation currently resolves to options-pricing. That is the verified destination used here; no new visitor-page slug has been invented. No live calendar availability was checked. Recheck destinations and offer terms before publication. Current data files deliberately avoid pricing and guarantee copy, so they cannot silently inherit changed terms from a stale snapshot.

## Validation completed

Five planning tests passed: default allocation, deterministic selection, visitor routing, 200 unique combinations, invalid requests and small previews. Rendered 36 draft images covering each buying persona in both layouts and all three sizes. Inspected a six-image visual sample and checked manifests for correct persona/visitor routing. Restored all asset approvals to their original false state. These checks establish scaffold behavior, not campaign effectiveness. Validation renders and cached assets are excluded from the package.
