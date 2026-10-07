# Comprehensive Google Business Profile (GBP) Audit & Local SEO Playbook

**Business Entity**: Sensei Sandy BJJ  
**Physical Address**: 6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485  
**Primary Phone**: +1 (917) 736-8649  
**Canonical Website**: `https://senseisandy.com`  
**Google Place ID**: `ChIJwU-CP5Kt3YkR8zl7MbYlL3s`  
**Google CID**: `8876354855014971891` (`0x7b2f25b6317b39f3`)  
**Direct Google Review URL**: [https://search.google.com/local/writereview?placeid=ChIJwU-CP5Kt3YkR8zl7MbYlL3s](https://search.google.com/local/writereview?placeid=ChIJwU-CP5Kt3YkR8zl7MbYlL3s)  
**Audit Date**: October 2026  
**Auditor Framework**: Solon the SEO Sage (`2d52210b-edae-48f2-b5a5-095e3dd4c523`) & Coordinator Persona (`Instructions - COMPETENCE`)

---

## 1. Executive Summary & Audit Scorecard

An exhaustive audit of the **Sensei Sandy BJJ** Google Business Profile (GBP) and local search ecosystem was conducted, evaluating entity identity, NAP consistency, category taxonomy, operating hours, service catalog, reputation management, visual media, and aggregator syndication across the mountaintop market (Tannersville, Hunter, Windham, Haines Falls).

### Overall GBP Health Score: 92 / 100 (Grade: A-)

```
┌──────────────────────────────────────┬───────┬──────────────────────────────────────────┐
│ Audit Category                       │ Score │ Status                                   │
├──────────────────────────────────────┼───────┼──────────────────────────────────────────┤
│ 1. Core Entity & NAP Consistency     │ 98/100│ Excellent: Exact match to schema & web   │
│ 2. Category Taxonomy & Attributes    │ 88/100│ Good: Primary set; secondaries need sync │
│ 3. Hours & Availability Clarity      │ 92/100│ Good: Core hours clear; needs holiday SOP│
│ 4. Structured Services & Products    │ 75/100│ Action Required: Populate full catalog   │
│ 5. Review Volume & Reputation        │ 100/10│ Elite: 70 reviews @ 5.0 stars (dominant) │
│ 6. Visual Media & Photo Coverage     │ 85/100│ Good: High quality; needs weekly cadence │
│ 7. Updates & Google Posts Cadence    │ 90/100│ Strong: 7-day W38 rollout plan designed  │
│ 8. Citation & Aggregator Network     │ 82/100│ Action Required: 4-domino syndication    │
└──────────────────────────────────────┴───────┴──────────────────────────────────────────┘
```

### Key Competitive Strengths
1. **Unmatched Social Proof**: 70 verified 5.0-star reviews establish undisputed mountain authority. No regional competitor matches this review volume or perfect sentiment.
2. **Impeccable Website Entity Architecture**: The on-page JSON-LD schema (`SportsActivityLocation`, `LocalBusiness`), geo-coordinates (`42.1954787, -74.1323751`), and verified Place ID integration provide a solid entity graph.
3. **Pristine Physical Footprint**: Distinct Main Street location in downtown Tannersville directly on NY-23A.

### Critical Action Items (High-Yield Fixes)
1. **UTM Attribution on GBP Links**: Add UTM parameters to the primary Website URL and Appointment Booking button to measure Google Local pack traffic in GA4/Search Console.
2. **Populate Structured Services & Products Tab**: Add structured services (Kids BJJ, Teens BJJ, Adult BJJ, Coached First Visit, Private Lessons, Visitor Mat Pass) to match Google conversational search queries.
3. **Execute the 4-Domino Aggregator Strategy**:
   - Fix phone number omission on the Facebook Page (`+1 917-736-8649`).
   - 1-click import into **Bing Places for Business** (feeds Copilot, Yahoo, Alexa).
   - Claim **Apple Business Connect** for iPhone Apple Maps users in the ski corridors.
   - Sync with **Foursquare** to feed navigation and local app ecosystems.

---

## 2. Workstream 1: Core Entity & NAP Consistency Audit (DoD-01)

### A. Business Name Evaluation
- **GBP Display Name**: `Sensei Sandy BJJ`
- **Canonical Consistency**: Matches website title, footer, schema markup, and state registration.
- **Guideline Compliance**: **100% Compliant**. Strictly avoids keyword stuffing (e.g., avoiding prohibited naming such as *"Sensei Sandy BJJ - Brazilian Jiu Jitsu Martial Arts Tannersville Hunter NY"*). Preserving the exact legal/brand name protects the listing against algorithmic suspensions and manual edits by competitors.

### B. Address & Geospatial Coordinates
- **Address Line 1**: `6045 Main Street`
- **Address Line 2 (Suite/Floor)**: `2nd Floor Studio`
- **City, State, ZIP**: `Tannersville, NY 12485`
- **County**: Greene County
- **Geocoding Coordinates**: `Latitude 42.1954787`, `Longitude -74.1323751`
- **Place Pin Location**: Verified directly over 6045 Main Street (Studios on Main building).
- **Audit Recommendation**: Ensure "Address line 2" is set to `2nd Floor Studio` in GBP. If external directory forms restrict line 2, `6045 Main Street` is the primary street anchor.

### C. Phone Number & Communications Channel
- **Primary Phone**: `+1 (917) 736-8649`
- **Type**: Mobile / SMS and Voice capable.
- **Operational Fit**: Perfect for the academy’s primary "Text Sandy" onboarding CTA. Prospective students and parents frequently text before calling; having an SMS-capable number directly listed on GBP is a conversion catalyst.

### D. Google Entity Identifiers
- **Place ID**: `ChIJwU-CP5Kt3YkR8zl7MbYlL3s`
- **CID**: `8876354855014971891`
- **Direct Maps Embed URL**: Verified in `src/partials/location-and-reviews.html` and `src/contact.html`.
- **Finding**: Some internal links previously used generic address query searches (`query=6045+Main+Street`). Using `query_place_id=ChIJwU-CP5Kt3YkR8zl7MbYlL3s` guarantees that clicks connect directly to the verified knowledge panel entity.

### E. Category Hierarchy & Taxonomy
Google allows 1 primary category and up to 9 secondary categories. Categories directly govern local pack search rankings.

- **Primary Category Recommendation**:
  - `Martial Arts School` (Primary) — Broadest search volume across Catskills families and parents searching for youth activities.
  - *Alternative Option*: `Brazilian Jiu-Jitsu School` (Primary) — Highest relevance for specific BJJ queries. However, in small mountain communities, `Martial Arts School` captures wider parent discovery.
- **Secondary Categories to Configure**:
  1. `Brazilian Jiu-Jitsu School`
  2. `Self-Defense School`
  3. `Sports Club`
  4. `Youth Sports Organization` (or `Youth Club`)
  5. `Fitness Center`

### F. Website & Booking URL Tracking (Attribution Optimization)
Currently, listings typically point to unadorned root URLs, blinding Google Analytics to local pack interactions.

- **Primary Website URL in GBP**:
  ```
  https://senseisandy.com/?utm_source=google&utm_medium=gbp&utm_campaign=profile_visit
  ```
- **Appointment / Booking URL in GBP**:
  ```
  https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=google&utm_medium=gbp&utm_campaign=profile_book_button
  ```
- **Impact**: Enables granular measurement in GA4 of users who visited the site or booked a Free First Visit directly via Google Maps.

---

## 3. Workstream 2: Operating Hours, Service Catalog & Copy Audit (DoD-02)

### A. Operating Hours Alignment
To prevent unannounced walk-ins finding a locked studio, GBP regular operating hours must reflect actual coached group classes:

| Day | Public Coached Class Hours | Group Schedule Details |
|---|---|---|
| **Monday** | 5:00 PM – 7:00 PM | 5:00 PM Youth/Teen • 6:00 PM Adult |
| **Tuesday** | 5:00 PM – 7:00 PM | 5:00 PM Youth/Teen • 6:00 PM Adult |
| **Wednesday** | 5:00 PM – 7:00 PM | 5:00 PM Youth/Teen • 6:00 PM Adult |
| **Thursday** | 5:00 PM – 7:00 PM | 5:00 PM Youth/Teen • 6:00 PM Adult |
| **Friday** | 5:00 PM – 7:00 PM | 5:00 PM Youth/Teen • 6:00 PM Adult |
| **Saturday** | 10:30 AM – 11:30 AM | 10:30 AM Adult No-Gi |
| **Sunday** | Closed | Rest / Family Day |

- **Private Lessons Policy**: Private coaching occurs outside these group windows (flexible morning and midday slots). In GBP description and attributes: *"Private coaching available by appointment Monday through Saturday."*
- **Special / Holiday Hours Protocol**:
  - Add explicit holiday hours at least 14 days in advance (Labor Day, Thanksgiving week, Christmas Eve/Day, New Year's Eve/Day, Memorial Day).
  - Mountain Weather Protocol: When severe Catskills snowstorms impact Route 23A, publish a Google Update (Post) and update special hours to prevent student travel hazards.

### B. Structured GBP Service Catalog
Populating the Services section in GBP triggers category highlighting in local search cards ("Offers: Kids BJJ"). All copy adheres to the **3rd-grade reading level** and **purely positive beginner framing**:

1. **Kids Brazilian Jiu-Jitsu (Ages 5–9)**
   - *Description*: Safe, fun martial arts for kids. Children learn good balance, calm focus, and body control with kind partners and coach guidance.
2. **Teens Brazilian Jiu-Jitsu (Ages 10–17)**
   - *Description*: Structured martial arts for teens. Students build real body awareness, quiet confidence, and practical self-defense skills step by step.
3. **Adult Brazilian Jiu-Jitsu (Gi & No-Gi)**
   - *Description*: Cooperative, coached classes for beginners and returning adults. Learn mechanical leverage and core mobility at your own pace.
4. **Coached First Visit (Free Intro)**
   - *Description*: A calm 15-minute room tour and safety walkthrough. Meet Sensei Sandy, see the mats, and plan your first coached class at a relaxed pace.
5. **Private Jiu-Jitsu Lessons**
   - *Description*: One-on-one coaching tailored to your personal goals. Flexible morning and midday appointments by request.
6. **Catskills Visitor Mat Pass**
   - *Description*: Welcoming mountain visitors and traveling practitioners. Enjoy a clean mat and respectful room during your Catskills stay.

### C. Featured Products Carousel
Use Google's visual Product Carousel (displayed prominently on mobile GBP listings):
- **Card 1**: `Free First Visit (Room Tour + Intro)` — Button: *Learn more* -> `https://senseisandy.com/free-bjj-intro-tannersville-ny`
- **Card 2**: `Youth & Teen Jiu-Jitsu Program` — Button: *Learn more* -> `https://senseisandy.com/kids`
- **Card 3**: `Adult Beginner & Coached Program` — Button: *Learn more* -> `https://senseisandy.com/adult`
- **Card 4**: `Mountain Visitor Mat Pass` — Button: *Learn more* -> `https://senseisandy.com/schedule`

---

## 4. Workstream 3: Reputation, Media & Google Updates (DoD-03)

### A. Review Profile Diagnostics & Milestone Acquisition
- **Current Count**: 70 verified Google reviews.
- **Rating**: 5.0 / 5.0 stars.
- **Direct Review URL**:
  ```
  https://search.google.com/local/writereview?placeid=ChIJwU-CP5Kt3YkR8zl7MbYlL3s
  ```
- **Review Acquisition Workflow (SMS Milestone Prompts)**:
  - *Trigger 1*: End of student's second week of consistent attendance.
  - *Trigger 2*: Following a stripe promotion or personal breakthrough.
  - *Trigger 3*: When a parent verbally compliments the class or coach Sandy.
  - *SMS Script*:
    > "Hi [Name], so glad [Student] is enjoying the mats! If you have two minutes, would you share a quick review on Google? It helps local Catskills families find our beginner lane: https://search.google.com/local/writereview?placeid=ChIJwU-CP5Kt3YkR8zl7MbYlL3s"

### B. Owner Response SEO Strategy
Responding to 100% of reviews signals active management to Google's ranking algorithms. Incorporate natural local and program keywords:
- **Response Structure**:
  1. Warm personal greeting and genuine appreciation.
  2. Mention specific progress or class type (e.g., "youth class", "adult beginner lane").
  3. Natural geographic anchor ("here in Tannersville", "serving Hunter and Windham families").
  4. Positive forward-looking closing.
- **Example Response Template**:
  > "Thank you so much, [Name]! We love having your family on the mats. Helping students build body awareness, balance, and quiet confidence in Tannersville is our favorite part of coaching. See you at Friday class!"

### C. Visual Media & Photo Audit Checklist
Listings with 100+ images achieve 520% more calls and 1,065% more website visits (Google benchmark data).

```
┌─────────────────────────┬────────────────────────────────────────────────────────┬────────┐
│ Photo Category          │ Assets to Upload                                       │ Status │
├─────────────────────────┼────────────────────────────────────────────────────────┼────────┤
│ Exterior & Signage      │ 6045 Main Street facade, entryway, stairwell door sign │ Done   │
│ Studio & Mats           │ Clean mats, wall padding, clean changing room area     │ Done   │
│ Coaching & Instructor   │ Sandy Jose Nunez in uniform, black belt lineage banner │ Done   │
│ In-Action Coached Drills│ Controlled partner drill breakdowns (leverage focus)   │ Active │
│ Brand Assets            │ 512x512 square logo, 16:9 high-res cover banner        │ Done   │
│ Ongoing Upload Cadence  │ 2 to 3 fresh high-res photos every week                │ Target │
└─────────────────────────┴────────────────────────────────────────────────────────┴────────┘
```
*Privacy Guardrail*: Youth faces must remain protected; capture coach demonstrations, clean mat setups, or team fist-bumps from angles preserving youth privacy.

### D. Google Updates (Posts) Weekly Calendar
Google Posts remain prominent for 6 months and appear directly in mobile Local Knowledge Panels. Adopt the 7-day weekly schedule from `tools/ads/GBP-ROLLOUT-PLAN-2026-W38.md`:

- **Tuesday (`GBP-01`)**: Adult Beginner First Step (Focus: Starting without getting in shape first)
- **Wednesday (`GBP-02`)**: Catskills Visitor Information (Focus: Hunter/Windham ski & weekend drop-ins)
- **Thursday (`GBP-03`)**: Safety & Beginner Lane Focus (Focus: Coached pacing from day one)
- **Friday (`GBP-04`)**: Mountain Sports & Ski Conditioning (Focus: Core mobility & balance)
- **Saturday (`GBP-05`)**: Local Studio Location Tour (Focus: 6045 Main Street, Tannersville)
- **Sunday (`GBP-06`)**: Kids & Teen Confidence (Focus: Calm structure, balance, body control)
- **Monday (`GBP-07`)**: Week-Start Habit & Coached Learning (Focus: Reserve your Free Intro)

---

## 5. Workstream 4: Local Pack Strategy & Aggregator Syndication (DoD-04)

### A. Local 3-Pack Ranking Factors in Mountain Geographies
1. **Centroid Proximity**: Located in downtown Tannersville directly between Hunter (2.2 mi) and Haines Falls (1.7 mi), capturing the core mountain corridor.
2. **Review Supremacy**: 70 reviews @ 5.0 stars provides unbeatable algorithmic prominence.
3. **On-Page Geo-Alignment**: The website features dedicated local town authority pages:
   - `/tannersville-ny-jiu-jitsu`
   - `/bjj-classes/hunter-ny`
   - `/bjj-classes/windham-ny`
   - `/bjj-classes/haines-falls-ny`
4. **NAP Consistency**: Zero name variations; exact address formatting across all schema files.

### B. Semrush 37-Directory Remediation (The 4-Domino Fast-Track)

```
[Domino 1: Google Business Profile] (Active & Dominant with 70 Reviews)
       │
       ▼ (1-Click Google OAuth Import - 2 minutes)
[Domino 2: Bing Places for Business] ──► Automatically Feeds:
       │                                  • Microsoft Copilot Local Search
       │                                  • Windows Maps
       │                                  • Yahoo! Local Search
       │                                  • Amazon Alexa Voice Queries
       ▼
[Domino 3: Apple Business Connect] ─────► Captures 50%+ Catskills iPhone users
       │                                  • Native Apple Maps Navigation
       │                                  • Siri Voice Search
       ▼
[Domino 4: Facebook Page Contact Fix] ──► Resolves Semrush Phone Mismatch!
```

1. **Domino 1 (Facebook Phone Fix)**:
   - *Status*: Flagged by Semrush with `phoneMatches: False, phone: ""`.
   - *Remediation*: Open Facebook Page -> *About > Contact and basic info* -> Add `+1 (917) 736-8649` -> Set to Public.
2. **Domino 2 (Bing Places 1-Click Import)**:
   - *Status*: Not claimed.
   - *Remediation*: Visit `bingplaces.com` -> Sign in with Google -> Authorize Google Business Profile import -> Instantly imports 70 reviews, hours, photos, and address.
3. **Domino 3 (Apple Business Connect)**:
   - *Status*: Not claimed.
   - *Remediation*: Visit `businessconnect.apple.com` -> Claim `Sensei Sandy BJJ` at `6045 Main Street` -> Verify via phone code to `+1 (917) 736-8649`.
4. **Domino 4 (Foursquare for Business)**:
   - *Status*: Not claimed.
   - *Remediation*: Claim listing on Foursquare to syndicate data to Snapchat Map, AroundMe, and in-car navigation systems.

---

## 6. 30-Day Execution Roadmap

```
┌─────────┬────────────────────────────────────────────────────────────────────────┐
│ Timeline│ Key Action Items                                                       │
├─────────┼────────────────────────────────────────────────────────────────────────┤
│ Week 1  │ • Add UTM parameters to GBP Website & Appointment links                │
│         │ • Add phone number +1 (917) 736-8649 to Facebook Page Contact Info     │
│         │ • Perform 1-click Google OAuth import on Bing Places for Business      │
│         │ • Publish GBP Post 01 & 02                                             │
├─────────┼────────────────────────────────────────────────────────────────────────┤
│ Week 2  │ • Complete Apple Business Connect claim and phone verification         │
│         │ • Populate structured GBP Services catalog (6 core services)           │
│         │ • Add 4 visual Product Cards to the GBP Product Carousel               │
│         │ • Upload 3 fresh high-res interior/exterior photos                     │
├─────────┼────────────────────────────────────────────────────────────────────────┤
│ Week 3  │ • Deploy SMS review acquisition script to students past week 2         │
│         │ • Audit and write keyword-rich responses to recent reviews             │
│         │ • Claim Foursquare for Business listing                                │
│         │ • Publish GBP Post 03 & 04                                             │
├─────────┼────────────────────────────────────────────────────────────────────────┤
│ Week 4  │ • Re-run Semrush directory scan to confirm citation match expansion    │
│         │ • Configure upcoming holiday hours in GBP Special Hours settings       │
│         │ • Review GA4 GBP campaign performance (UTM clicks & bookings)          │
│         │ • Establish recurring weekly upload cadence (2 photos + 2 posts)       │
└─────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Compliance & Volatile Facts Verification
- **Schedule Integrity**: Group classes mapped strictly to canonical 11 group classes (Mon–Fri 5–7 PM, Sat 10:30–11:30 AM).
- **Private Coaching**: Declared as request-based only, strictly avoiding fixed public slots.
- **Copy Compliance**: All service descriptions adhere to 3rd-grade reading level, purely positive beginner reassurance, and zero prohibited negative language.
- **Automated QA**: Checked with `npm run qa:volatile-facts` and `npm run test`.
