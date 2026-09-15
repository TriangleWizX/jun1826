# SSBJJ weekly static-ad scaffold

Built September 13, 2026. Standalone Python scaffold; the existing repository was not attached or modified. Move this folder into `tools/ads/` in the real repository after reading its AGENTS.md. It has no ad-platform integration, paid services, AI-image dependency, or automatic publishing.

## Firehouse workflow update (v3)

Start with **FIREHOUSE-WORKFLOW.md**. Adds six question-led concepts (42 total), series filtering, provenance/proof manifest fields, a weekly brief generator and retention feedback guidance. Existing routes and weights remain. The dated v1/v2 notes below are retained as history.

## Persona update (v2)

Start with **PERSONA-STRATEGY.md** for the current architecture and commands. It supersedes the original scaffold notes below where they differ: 36 concepts across six buying situations; Ian is an experience lens; 1–200 exports supported; default 150 weighted toward Carla and Ben; persona-specific CTAs/routes/follow-up guidance. The original requirements audit is retained as history.

## The decision

Build capacity for 100–200 exports. Do not adopt 100–200 new messages or active ads per week as the success metric. Default: 25 concepts × 2 layouts × 3 sizes = 150 PNGs. Those are 25 messages, 50 layout treatments, and 150 exports—not 150 independent hypotheses. Three sizes alone do not create three new ideas.

Initial recommendation: review all candidates in the gallery, select 3–5 concepts for a modest first test, and preserve a previous control. The correct active count depends on budget, local reach, enrollment capacity, and conversion volume, none of which has been verified for this week. There is no evidence supplied that this academy needs 150 weekly live ads.

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python ads.py discover --pages /
# Edit assets.json: approve suitable owned photos, set audiences, mark official logo role=logo.
python ads.py render --count 150 --week 2026-W38
```

Windows activation: `.venv\Scripts\activate`. Execute commands from this folder. Python 3.10+ recommended. Font and license included. Pin the installed Pillow version in the repository lockfile after integration.

`discover` reads IMG src attributes from explicit same-site pages, retains existing approvals, and records source/alt text. It deliberately is not a full website crawler. It does not extract CSS backgrounds, video frames, srcset originals, remote CDN assets, or JavaScript-only images. Add original repository assets through `local_path` when available. Prefer original photography over compressed web thumbnails. Hashed site URLs can change; rediscover after site deployments and curate replacements.

Asset audiences: `adult`, `parent`, `teen`, `family`, `local`, or `all`. Assign `all` only to a genuinely universal photo such as the room or exterior. Website presence is evidence of availability, not proof of permission for paid advertising. Existing owned studio/brand assets can be approved once; student photos need their actual permission status recorded. Do not infer ages or permissions from alt text. Every discovered asset starts unapproved. Add local_path relative to this folder to use a repository original; retain the URL as provenance.

Outputs: PNGs at 1080×1080, 1080×1350, 1080×1920; CSV manifest with creative/concept IDs, audience, hypothesis, source asset, destination UTM, and draft status; saved input snapshot; HTML review gallery. These are general production presets, not a claim that every placement accepts them or that every platform overlay is safe. Preview in the intended placement before release. Story UI margins need platform-specific adaptation.

Current renderer: two simple layouts, one original photo per concept, official logo with proportional sizing, yellow text on dark background, full-photo containment, no generated faces or photo alterations. Logo colors are preserved. Initial 25 headlines are a starting bank, not a claim of unlimited strategic variety. To reach 200, add at least 9 concepts (34×6=204 capacity); renderer selects 200 deterministically. It refuses artificial padding. Week changes select/order photos deterministically but do not invent new ideas. Add or retire concepts based on actual results.

The script checks text fit, input eligibility, low source resolution, duplicate pixel outputs, and existing output folders. A source/network/render failure stops the run; it may leave a partial output directory. Inspect and delete the failed run folder before retrying with the same name. Production follow-up: staging folder + atomic rename, retries, font-version hash in manifest, srcset support, richer templates, perceptual duplicate detection, and review/approved export separation. Exact duplicate checks are not perceptual quality assurance.

## Requirements to suspend, narrow, or test

These are recommendations for this ad system, not silent changes to academy policy or promises. Prior instructions about clothing and glass should not become global ad requirements. The default still respects the no-white preference; changing that requires an intentional design experiment.

| Existing requirement / assumption | What does that mean? | How do you know that? | So what? | Why do we care? / reversible decision |
|---|---|---|---|---|
| 100–200 ads every week | Files, concepts, or active campaigns? | No budget, fatigue, or conversion evidence supplied. | A file quota can produce cosmetic duplication and excess review. | Retain rendering capacity; delete mandatory weekly production quota. Restore when measured fatigue or distribution needs justify it. |
| Avoid white | No white backgrounds, text, logos, or even clothing in photos? | Earlier instructions express taste in specific design contexts, not conversion evidence. | A global ban can harm legibility or disqualify real class photos. | Keep dark/yellow default; suspend ban on white naturally present in authentic assets. Test lighter typography/background separately if desired. |
| Use all colors | Every brand color on each image? | Originated in marker/glass and rank-product work. | Unnecessary visual competition. | Delete per-ad all-colors requirement. Restore a full palette only for a rank-choice comparison where color carries information. |
| Minimal words always | A fixed character ceiling regardless of the objection? | Prior glass and apparel space constraints do not prove ad performance. | Can remove the fact that makes starting feel possible. | Replace with one message plus one supporting detail. Restore tighter limits when mobile reading suffers. |
| Sell outcomes, never process/features | No class details or explanation of the first visit? | A marketing heuristic, not a measured universal rule. | Anxious beginners may need to know what will happen. | Delete “never.” Test a concrete first-step detail against outcome copy. Restore outcome-only for audiences already familiar with class. |
| Prominent SenseiSandy.com everywhere | URL must be the largest element? | Useful for a pedestrian board; clicking a paid ad is different. | Uses space that could explain relevance. | Keep a readable brand/URL footer and tracked destination; test hierarchy. Restore largest URL for offline/nonclickable placements. |
| Mention every avatar and every benefit | One ad for children, teens, parents, adults, and visitors? | No supplied results establish this as necessary. | Message becomes vague; photos and promises can mismatch. | Delete. One audience per concept. Restore a broad family/local control as one deliberate treatment. |
| Every cold ad explains Core Culture / 12 weeks / 3× weekly | Prospects must understand enrollment before visiting? | Live site offers these terms; that does not establish the best ad sequence. | May ask for a commitment before trust develops. | Remove from default first-visit creative; retain terms on appropriate destinations. Test transparent pricing/commitment ads separately for lead quality. Do not change actual prices. |
| Everyone must complete Goal Mapping before any class | A fixed sequence for adults and youth? | Live page has different adult and youth expectations. | More steps may reduce arrival; some preparation may improve fit. | Do not change operations here. Candidate pilot: direct coached-class booking for an eligible group if Sandy can deliver it; measure attendance and enrollment, not bookings alone. |
| Every ad must be new | Winners expire each Monday? | No fatigue evidence supplied. | Loses controls and wastes creative work. | Delete. Keep productive controls; bring novelty back when frequency and declining outcomes support it. |
| Every ad needs a testimonial, stars, or a logo lockup | Trust requires all proof elements every time? | Site testimonials demonstrate available proof, not mandatory composition. | Clutter and repeated claims. | Logo stays modest by default; testimonials are a later template, using exact sourced text and attribution. Never invent aggregate star ratings. |
| Safety means guaranteed safety | Can training be called injury-proof or fear-free? | No such guarantee is supported. | Creates a promise coaching cannot ensure. | Keep concrete descriptions of partner matching and pace. Do not restore absolute safety promises. |
| Merch rules apply to academy enrollment ads | Every person must match a rank palette; clothing restrictions everywhere? | Earlier constraints were about rank-product mockups. | Blocks useful authentic photos and confuses offers. | Remove from enrollment pipeline. Restore only in an isolated merchandise campaign with its own destination. |

Keep: truthful current offers, real identity and logo, authentic photos, readable copy, suitable audience/photo pairings, precise testimonial attribution, and promises that match the destination. These are useful controls, not creative obstacles. No fabricated scarcity, progress guarantees, synthetic students, or stale prices.

## What the live site establishes—and what it does not

Sources inspected September 13, 2026:
- https://senseisandy.com/ — current homepage, brand, program positioning, linked assets.
- https://senseisandy.com/free-bjj-intro-tannersville-ny — first-visit details and booking path.

The adult flow describes a short introductory visit before scheduling class. Later youth instructions allow participation that day after early arrival and safety review. The top-level general introduction does not fully distinguish these experiences. Resolve this copy inconsistency in the real site before running “train today” messaging. The scaffold uses “free first visit” to avoid promising immediate training. It does not verify live calendar inventory, conversion tracking, or paid advertising rights.

Prices, fixed schedules, guarantees, rank promises, and review excerpts are intentionally not pulled automatically into the concept bank: making a site fact available does not make every placement or audience interpretation accurate. Introduce a dated offer record and audience-specific destination mapping before those campaigns. Current copy is suggested paraphrase, not verbatim testimonial material.

## Weekly operating loop

1. Check actual seats and availability by audience. Generate for the bottleneck you can serve. Current 20-student goal and 12-per-mat-hour cap are historical planning context, not verified present inventory.
2. Select a message question, e.g. “Does explaining the adult first visit increase completed arrivals?” Specify what changes and what stays constant.
3. Update concepts.json with a handful of meaningful ideas; keep winners and their IDs. Review photos once and whenever permissions or contents change.
4. Render 100–200 only when distribution/review needs it. Start the first production run at 150. Open review.html at full size and thumbnail size. Check faces, text, logo, audience, source quality, claim, and destination.
5. Select a small test set. Upload manually using the manifest destination. Production does not imply publication. Never split the entire budget across 150 files by default.
6. Join platform export and booking/enrollment records on creative_id/UTM. Track spend, impressions, landing sessions, leads, booked visits, attended visits, enrollments, and revenue collected. Keep source and attribution window consistent. Do not put student names or phone numbers in this manifest.
7. Calculate spend/attended visits and spend/enrollments, show-up = attended/booked, close rate = enrolled/attended. Use blank/undefined for zero denominators. Read CTR as diagnostic, not the winner metric. Small samples are uncertain; avoid claiming causality from a handful of conversions or unequal delivery.
8. Record which requirement was suspended, hypothesis, primary metric, test window, result, and restore condition. Reintroduce a rule only when results or operational needs warrant it. Retire low-value complexity.

Illustrative capacity arithmetic, not a forecast: 4 desired enrollments / (0.70 show-up × 0.40 close rate) ≈ 15 booked visits. Substitute actual rates. Required ad count is not derivable from that number alone. Optimize for attended visits and sustainable enrollments within available capacity.

## Repository integration handoff

Read AGENTS.md and inspect the actual stack before editing. Keep this renderer outside the website bundle. Use original repository assets and existing brand tokens where available; preserve logos. Add an optional `ads:discover` and `ads:render` command if this is a Node repository, calling the Python environment explicitly. Do not add runtime dependencies to the public website for an offline marketing tool.

First gate: run discover and curate real assets. Second: render 150 and inspect all six size/layout combinations plus long headlines. Third: check destination and UTMs in the real booking flow. Add preservation of attribution through bookings before claiming enrollment attribution. Integration needs the actual repository; this package does not claim it is already installed there.

Optional CI/manual workflow can run the renderer after integration, with artifact retention and a unique run name. No recurring task has been created. Do not enable scheduled weekly rendering until curated assets and concept maintenance have an owner. No ad spend or public posting is authorized by this scaffold.

## Validation performed

Completed a 150-image run with the discovered studio photograph and official logo as temporary validation inputs. Confirmed the run completed and visually inspected a six-image sample; added a yellow backing tile after identifying poor dark-logo contrast. Production approvals remain false. The test does not establish campaign performance, student-photo permission, platform acceptance, or repository integration. Test renders are omitted from the package.
