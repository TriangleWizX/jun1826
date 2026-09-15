# Firehouse insights integrated into SSBJJ Ad Studio

September 14, 2026. Read this before the earlier strategy files. Source: the supplied 48-page Firehouse Marketing.pdf. Page numbers below refer to PDF pages. This is a workshop of concepts and proposals, not campaign-performance evidence. The studio remains an offline scaffold, not an installed website integration.

## The operating decision

Use class experience to supply marketing: real question → useful answer → visible proof → appropriate next step → attendance and retention feedback. Keep the six buyer routes and Ian's experience lens. Retain 100–200-image capacity, but generate only what can be reviewed and used. A new format is not a new hypothesis.

## What the workshop changes

| Source insight | SSBJJ adaptation | Where it enters the workflow |
|---|---|---|
| Question, quick answer, deeper answer, source (pp. 22–27, 47–48) | Beginner Questions: take the concern seriously; answer without calling the prospect wrong | Six new question-led concepts; series filter; optional organic carousel outline |
| Personal coach voice (p. 24) | Sandy explains one actual part of starting | Capture list and proof field, not borrowed Firehouse biographies |
| Why I BJJ (p. 29) | Why I Started / Why I Stayed: real words from willing students | Interview backlog; quotes require source and permission before use |
| Student recognition (pp. 30, 32) | A small win: trying again, finding an escape, helping a partner | Ian influences youth visuals; private recognition first, public sharing optional |
| Intro content (p. 30) | Show the room, arrival, clothing and what happens next | Pre-visit follow-up, FAQ, standalone ad |
| Distinct new and experienced audiences (pp. 29–37) | Preserve Wendy's visitor path and persona-specific offers | Existing route tests retained |
| Why people stay/leave (pp. 40–42) | Record missed expected sessions, ask what changed, offer a realistic return | Follow-up briefs and weekly retention review |
| Partnerships and local activity (pp. 3, 31, 33) | Test one local referral source with a distinct source code | Backlog; no automatic free passes or outbound messages |
| Capture daily activity (p. 39) | Capture one useful, permitted moment without interrupting coaching | Small weekly capture budget, reusable proof library |

## Weekly workflow: Sandy owns the decisions

1. **Monday, 15 minutes:** check actual class openings, bookings, attended visits and missed expected sessions. Choose the bottleneck: too few suitable inquiries, missed visits, poor fit, or students not returning. Keep visitors separate from membership prospects.
2. **After two classes, 5 minutes each:** record one anonymized question and one observable small win. If someone can take an authorized photo without distracting the coach, capture it. Do not stop teaching to satisfy a content quota.
3. **Tuesday, 15 minutes:** select one Carla question and one Ben question, or the most relevant buyer if capacity says otherwise. Record the answer, proof needed and next step in workflow-input.json. Mark invented starter questions as hypotheses until heard from real prospects.
4. **Wednesday, 20 minutes:** generate the brief and render selected series. For paid static ads, put question, answer and CTA in the same image. A viewer must not need another card to understand the offer. An organic carousel can use four cards, but that is a manual editorial outline; the renderer does not export linked carousels.
5. **Before release:** review actual photo suitability, exact claims, logo contrast, mobile text and destination. Keep one relevant control. Use a small test set that budget and local reach can support. No mandatory number of active ads.
6. **Friday, 20 minutes:** compare completed visits and enrollments by buyer/offer and consistent attribution window. Record return attendance separately. Ask what objections persist. Keep, revise, retire or mark inconclusive. Feed recurring operational problems back into delivery.

These time budgets are starting limits, not measured requirements. Existing followups.json contains manual event briefs, not a running CRM. Two missed expected sessions is a proposed review trigger: closures, planned absences and the person's actual schedule must be excluded. Do not run a fixed sequence over a personal reply.

## Production commands

Run from the studio folder:

```bash
python workflow.py --output weekly-brief.md
python ads.py plan --count 12 --personas carla ben --series first_visit beginner_questions
python ads.py render --count 12 --personas carla ben --series first_visit beginner_questions --week 2026-W38-questions
python -m unittest test_planning.py test_workflow.py
```

Rendering still requires curated, approved assets. Each selected concept has two layouts and three sizes. The two-persona example is two concepts and 12 exports. The full bank is now 42 concepts; default persona weights remain the same. `--series` filters the bank before allocation. Requesting more exports than the filtered bank supports fails rather than padding. The brief generator refuses to overwrite an existing brief: choose a new output name for another week.

New manifest columns: series_id, lifecycle_stage, source_ref, proof_needed. These make review requirements visible; they do not automatically verify evidence. Existing creative IDs remain based on visual content and route, so metadata-only changes do not invalidate them. All generated images remain drafts.

## Series to build from genuine evidence

| Series | Main audience | Required material | Next step |
|---|---|---|---|
| Beginner Questions | Carla, Ben, Tyler, Casey | A question and a verified operational answer | Their existing first-visit path |
| Why I Started / Stayed | Carla, Ben | Exact student words, source, permitted photo and use | Appropriate buyer path |
| Small Wins | Ian through guardian | A specific observable moment; permission if public | Recognition first; optional parent inquiry |
| Your First Visit | Carla, Ben, Frankie | Accurate arrival and class sequence | Confirm or book visit |
| Back on the Mat | Existing students | Their stated obstacle and actual available next step | Personal return conversation |
| Visiting the Catskills | Wendy | Current visitor options and confirmed availability | Visitor booking |

Only question-led acquisition concepts were added to the renderer. Testimonial, recognition and return content stays in the editorial workflow until the actual evidence exists. No fabricated quotes or assumed outcomes fill those gaps.

## Requirements audit: four questions

| Requirement | What does that mean? | How do you know? | So what? | Why care / decision and return condition |
|---|---|---|---|---|
| Call objections B.S. | Frame a concern as something to debunk | Workshop's creative premise, not SSBJJ conversion data | Can make an anxious beginner feel dismissed | Default to respectful questions; reconsider sharper tone only for a clearly suitable audience and evidence of useful response |
| Always use four slides | Force one sequence on every placement | Workshop template | Standalone ads may be incomplete | Delete as universal rule; restore for topics that need a carousel |
| Always end with shout-outs | Send readers to other accounts | Workshop asserts distribution benefits without results | Can displace the relevant next step | Cite sources when needed; test collaborations separately; no algorithm guarantee |
| Every promotion needs a discount | Lower price to create a reason to act | Workshop brainstorms, no margin or retention evidence | Can attract mismatched demand and add complexity | Default to existing offers; pilot only after defining costs, eligibility, capacity and success criteria |
| Capture everything | Turn every class into production | More-content suggestion | Competes with supervision and comfort | Delete; capture useful moments selectively; expand only if delivery and permissions support it |
| Celebrate only the best student | Weekly recognition becomes a competition | One workshop idea | Can overlook beginner effort and belonging | Recognize specific progress privately; public series only when participants want it |
| Two classes are the minimum to improve | Treat frequency as a universal threshold | Workshop assertion | Can discourage people with limited schedules | Use actual program expectations; avoid universal progress thresholds |
| Returners need cheaper training | Assume price caused absence | No individual evidence | Does not resolve timing, fit or confidence | Ask first; price pilot only when price is the demonstrated barrier |

## Items parked, not activated

Referral discounts, free vacation drop-ins, free parents, exchange passes, rank-based discounts, scholarships, raffles, new workshops, student-led classes and additional open mats remain proposals. The PDF's Outpost dates, fees and Firehouse staff descriptions are historical source content, not SSBJJ facts. Do not import them into offers.

Reject unsupported blanket safety and street-fight claims from the workshop rather than softening them into new promises. The spoof street-fighting/bolo copy and placeholder handles are not usable testimonials or sources. Keep real photos and the original SSBJJ logo; do not transplant the large watermark behind text. The inspected workshop template shows why text and logo need separate clear space.

Do not advertise injury rehabilitation. A returning student's health-related situation needs a personal discussion outside this marketing generator. Support belonging without promising clinical outcomes or inventing a modified-training product.

## Measurement and implementation boundaries

For acquisition, use spend / completed visits and spend / enrollments. Show-up rate = completed / booked; close rate = enrolled / completed. Use undefined for a zero denominator. Count people consistently, deduplicate repeated bookings, and use matured cohorts. Visitor success is paid attended visits, not Core enrollment. Return success is resumed attendance among contacted eligible returners, not new-member acquisition. Recognition success begins with the student's experience; likes are secondary.

Log experiment ID, control concept, challenger concept, buyer, offer, dates, one changed variable, spend, booked/completed visits, enrollments, revenue collected, attribution limits and decision. No results were provided; no performance lift is claimed. Unknown attribution stays unknown. Do not send names, phone numbers or health notes into the creative manifest.

Repository handoff: read its AGENTS.md; place the offline studio under its tools directory; preserve source assets and IDs; connect attribution only after checking the actual booking implementation. The website, booking system, CRM and ad accounts were not modified by this update.
