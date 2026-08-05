# Sensei Sandy BJJ — Offer Strategy Audit & Implementation Plan

**Authoritative Source:** `docs/product-offer-strategy.md`  
**Audit Date:** July 2026  
**Repository:** Sensei Sandy BJJ (`https://senseisandy.com`)

---

## Phase 1: Repository Discovery Findings

### 1. Technical Stack & Build Pipeline
- **Core Technology:** HTML5, Vanilla CSS / SASS, JavaScript (ES6 modules), Bootstrap 5.3.3, Bootstrap Icons.
- **Runtime Environment:** Node.js (v18+) for asset processing, component bundles, and sitemap generation; Python 3 for build orchestration (`scripts/build.py`).
- **Build Scripts:**
  - `python3 scripts/build.py` — Orchestrates page generation, sitemaps, icons, CSS minification, route styling, asset fingerprinting, and preflight validation.
  - `npm run qa:all` — Executes comprehensive QA checks (schedule, funnel, static links, existence links, CSS, icons, SSI, SEO, schema, lazy-loading, glossary).
  - `npm run redirects:sync` — Syncs `config/legacy-redirects.json` into `.htaccess`.

### 2. Routing, Redirects & URL Mapping
- **Routing Engine:** Apache `.htaccess` rules combined with clean URL folder structures (e.g., `free-bjj-intro-tannersville-ny/index.html` serving `https://senseisandy.com/free-bjj-intro-tannersville-ny`).
- **Legacy Redirects:** Managed via `config/legacy-redirects.json` and compiled into `.htaccess` via `tools/sync-htaccess-legacy-redirects.mjs`.
- **Primary Funnel Destinations:**
  - Free Intro / Goal Mapping: `/free-bjj-intro-tannersville-ny` (canonical entry for `/free-intro`)
  - Kids Core Culture: `/bjj-classes/kids-tannersville-ny`
  - Teens Core Culture: `/bjj-classes/teens-tannersville-ny`
  - Adults Core Culture: `/bjj-classes/adults-tannersville-ny`
  - Community Service: `/community-service-bjj` (or `/law-enforcement-bjj`)
  - Visitor Passes: `/visitor-passes` (or `/options-pricing#visitors`)
  - Private Coaching: `/private-coaching` (mapped from `/private-lessons`)
  - Keyholder Upgrade: `/keyholder` (mapped from `/options-pricing#keyholder`)
  - Annual Track: `/annual-track` (or `/options-pricing#annual`)

### 3. Data Architecture & Centralization Status
- **Central Pricing Data:** `content/offers.json` serves as the authoritative JSON data source containing Core Culture term lengths, class caps, fit guarantees, prices, annual track pricing, visitor pass rates, class pack rules, concierge limits, and private coaching rates.
- **JS Configuration:** `js/site-config.js` and `js/content-config.js` supply client-side offer variables and canonical URLs.
- **Duplication & Hard-Coding Issues:** Hard-coded pricing and legacy terms exist across `options-pricing.html`, `pricing-module-fragment.html`, `programs.html`, `law-enforcement-bjj.html`, `elite-concierge.html`, and several blog/town landing pages.

### 4. Navigation & Component Architecture
- **Header Navigation:** `nav-include.html` handles sitewide navigation.
- **Footer Navigation:** `footer-include.html` and `footer-include-no-proof.html`.
- **CTA Partial Components:** `partials/simple-cta.html`, `partials/conversion-rail.html`, `partials/popular-paths.html`, `partials/booking-router.html`, `cta-hero.html`, `cta-row.html`.

### 5. Search Indexing, Metadata & Sitemap Systems
- **Sitemap Builders:** `tools/build-page-blog-sitemaps.mjs` and `tools/build-sitemap-index.mjs`.
- **Robots Directives:** Standard `robots.txt` and page-level `<meta name="robots" content="...">` directives.
- **Canonicals:** Enforced on every page using `<link rel="canonical" href="...">`.
- **Structured Data:** Generated JSON-LD schemas checked via `scripts/qa-schema.mjs`.

### 6. Validation & Testing Framework
- **Automated Validation:**
  - `scripts/validate_offers.py` — Validates offer constraints, prices, and concierge limits.
  - `scripts/validate_retired_language.py` — Enforces banned legacy terms (`Annual Track`, `Small-Group Classes`, `three planned home classes per week`, etc.).
  - `scripts/qa-funnel.mjs` — Verifies conversion funnel events, booking URLs, and mobile sticky CTAs.
  - `scripts/qa-seo.mjs` & `scripts/qa-schema.mjs` — Validates SEO tags, canonicals, noindex rules, and JSON-LD schema.

---

## Phase 2: Sitewide Offer Audit

### Audit Summary Table

| File | Route | Current offer | Current CTA | Required offer | Required CTA | Search treatment | Problem | Action | Risk | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `index.html` | `/` | Free Intro, Christmas in July, Core Culture | Reserve Free Intro / Book Goal Mapping | Free Intro → Goal Mapping Visit → Core Culture | Reserve Your Free Intro | Index | Christmas in July banner active until July 31, 2026; needs controlled August 1 expiration handling | Standardize CTAs; ensure Core Culture is presented as sole 12-week first-term option | Low | Ready |
| `free-bjj-intro-tannersville-ny/index.html` | `/free-bjj-intro-tannersville-ny` | Free Intro / Goal Mapping | Reserve Free Intro | Free Intro → Goal Mapping Visit | Reserve Your Free Intro | Index | Mentions legacy term "Goal Mapping Visit"; missing page-local mobile sticky CTA element expected by QA funnel script | Update terminology to "Goal Mapping Visit"; fix mobile sticky CTA container | Funnel | Ready |
| `bjj-classes/kids-tannersville-ny/index.html` | `/bjj-classes/kids-tannersville-ny` | Youth Core Culture ($550) | Reserve Free Intro | Youth Core Culture ($550) | Reserve Your Free Intro | Index | Clean primary funnel | Standardize CTAs and verify prices from `content/offers.json` | Low | Ready |
| `bjj-classes/teens-tannersville-ny/index.html` | `/bjj-classes/teens-tannersville-ny` | Teen Core Culture ($550) | Reserve Free Intro | Teen Core Culture ($550) | Reserve Your Free Intro | Index | Clean primary funnel | Standardize CTAs and verify price alignment | Low | Ready |
| `bjj-classes/adults-tannersville-ny/index.html` | `/bjj-classes/adults-tannersville-ny` | Adult Core Culture ($715) | Reserve Free Intro | Adult Core Culture ($715) | Reserve Your Free Intro | Index | Clean primary funnel | Standardize CTAs and confirm Core Culture terms (3 planned home classes/week) | Low | Ready |
| `law-enforcement-bjj.html` | `/law-enforcement-bjj` | Law Enforcement Program / Community Service ($600) | Claim $600 Service Rate | Community-Service Core Culture ($600) | Check Eligibility | Index | Uses CTA "Claim $600 Service Rate" instead of approved "Check Eligibility"; mentions legacy terms | Update CTAs to "Check Eligibility" / "Request an Agency Conversation"; replace legacy terms | Form | Ready |
| `options-pricing.html` | `/options-pricing` | Core Culture, Annual Track, Class Packs, Keyholder, Concierge | Various | Core Culture (Primary), Day Pass/Vacation (Secondary), Packs/Keyholder/Annual (Restricted/Member) | Reserve Your Free Intro / Request a Visitor Pass / Schedule Your Renewal Review | Index | Publicly displays 10-Class & 20-Class Packs and Keyholder pricing in comparison table; competes with Core Culture | Restrict Class Pack promotion; ensure Keyholder and Annual Track are clearly marked qualification-only; update CTAs | Revenue | Ready |
| `programs.html` | `/programs` | Core Culture, Class Packs, Goal Mapping | Reserve Your Free Intro | Core Culture | Reserve Your Free Intro | Index | Promotes Class Packs and uses legacy CTA "Reserve Your Free Intro" | Remove Class Pack public comparison; update CTAs to "Reserve Your Free Intro" | Funnel | Ready |
| `private-lessons.html` | `/private-lessons` | Private Coaching ($195) | Request Private Coaching | Private Coaching ($195) | Request Private Coaching | Index | Secondary offer; check for obsolete Concierge references | Ensure secondary positioning relative to Core Culture | Low | Ready |
| `elite-concierge.html` | `/elite-concierge` | Elite Concierge ($1,050) | Request Information | Concierge (On Hold) | Request Information | Noindex | Active public page describing pilot enrollment ($1,050) while strategy puts Concierge on hold | Apply `noindex, follow`; remove from primary navigation; remove unverified pricing details | Low | Ready |
| `annual-track.html` | `/annual-track` | Annual Track ($2,100 / $2,650 / $2,250) | Schedule Renewal Review | Annual Track (Qualification required) | Schedule Your Renewal Review | Noindex | Ensure noindex meta directive is present; update CTAs | Add `noindex, follow` tag if missing; update CTAs | Indexing | Ready |
| `christmas-in-july-bjj-tannersville/index.html` | `/christmas-in-july-bjj-tannersville` | Christmas in July Campaign | Reserve Free Intro | Christmas in July (Expiring July 31, 2026) | Reserve Your Free Intro | Index until Aug 1, 2026, then Redirect to `/free-bjj-intro-tannersville-ny` | Campaign active until July 31, 2026; requires expiration procedure for Aug 1, 2026 | Document expiration procedure in checklist; prepare redirect rule | Indexing | Ready |
| `nav-include.html` | Sitewide Header | Navigation links | N/A | Approved primary & secondary nav | Approved CTAs | N/A | Check that restricted class packs and Concierge do not appear in primary navigation | Clean nav links to show only Primary (Free Intro, Core Culture) and Secondary (Visitor Pass, Private Coaching) | Navigation | Ready |

---

## Phase 3: Prioritized Implementation Plan

### Priority 1: Revenue and Funnel Clarity
1. **Centralize Offer Data (`content/offers.json`):**
   - Extend `content/offers.json` to include the full schema: `id`, `name`, `audience`, `price`, `priceDisplay`, `term`, `primaryCta`, `eligibility`, `status`, `visibilityLevel`, `searchTreatment`, `destinationUrl`, `replacementUrl`, `expirationDate`, and `notes`.
   - Maintain top-level backward compatibility for `scripts/validate_offers.py`.
2. **Primary Funnel Alignment:**
   - Enforce **Free Intro → Goal Mapping Visit → Core Culture** as the sole primary public path.
   - Standardize primary CTA to `Reserve Your Free Intro` across homepage, program pages, nav, and partials.
   - Clarify Core Culture terms: 12-week term, 3 planned home classes/week (up to 36 scheduled classes), partner matching, progress tracking, text-based rescheduling, 1 academy gi for first-time enrollment, 30-day fit guarantee (after 4 classes). Eliminate all "unlimited access" claims.
3. **Restrict Non-Primary Offers:**
   - Remove 10-Class Pack ($300) and 20-Class Pack ($550) from public comparison tables that compete with Core Culture on `options-pricing.html` and `programs.html`.
   - Restrict Class Packs to `/visitor-class-packs` (or `/options-pricing#visitors`) with CTA `Contact the Academy` and `noindex` treatment.
   - Keep Visitor Passes (Day Pass $35, Vacation Week $99) secondary under `/visitor-passes` with CTA `Request a Visitor Pass`.
   - Maintain Private Coaching ($195) as secondary under `/private-coaching` (or `/private-lessons.html`) with CTA `Request Private Coaching`.
   - Restrict Keyholder Upgrade ($225 / $940 / $825) and Annual Track ($2,100 / $2,650 / $2,250) to qualification-only with `noindex` search treatment.
   - Place Concierge on hold: set `noindex` on `elite-concierge.html`, remove from primary navigation, and ensure CTA is `Request Information`.

### Priority 2: Website Architecture & Routing
1. **URL Alignment & Redirects:**
   - Ensure clean canonical destinations:
     - Free Intro: `/free-bjj-intro-tannersville-ny` (with `/free-intro` redirecting to it)
     - Youth Core Culture: `/bjj-classes/kids-tannersville-ny`
     - Teen Core Culture: `/bjj-classes/teens-tannersville-ny`
     - Adult Core Culture: `/bjj-classes/adults-tannersville-ny`
     - Community Service: `/community-service-bjj` (or `/law-enforcement-bjj`)
     - Visitor Passes: `/visitor-passes`
     - Private Coaching: `/private-coaching`
   - Add redirect in `config/legacy-redirects.json` for `6-Week Test Drive` (`/6-week-test-drive`, `/6weekgrandslam`) → `/free-bjj-intro-tannersville-ny`.
2. **Indexing & Metadata Controls:**
   - Add `<meta name="robots" content="noindex, follow">` to restricted/premium pages (`annual-track.html`, `elite-concierge.html`, `visitor-class-packs`).
   - Exclude `noindex` and redirected pages from sitemaps (`tools/build-page-blog-sitemaps.mjs`).
3. **Campaign Expiration (Christmas in July):**
   - Keep active through July 31, 2026.
   - Create `docs/christmas-in-july-expiration-checklist.md` detailing August 1, 2026 tasks: banner removal, nav removal, redirect rule to `/free-bjj-intro-tannersville-ny`, and CTA update to `Reserve Your Free Intro`.

### Priority 3: Terminology & CTA Standardization
1. **Sitewide Terminology Replacement:**
   - `Semi-private` → `Small-group`
   - `Core Culture` → `Core Culture`
   - `Free trial` / `Trial class` → `Free Intro`
   - `Annual Track` → `Annual Track`
   - `Unlimited access` → `Three planned home classes per week`
   - `Goal Mapping Visit` / `Goal Mapping Visit` → `Goal Mapping Visit`
   - `Local-student drop-in` → `Free Intro`
   - `Drop-in` (standard public) → `Day Pass`
   - Paid offer names: `Youth Core Culture`, `Adult Core Culture`
2. **CTA Standardization:**
   - Primary: `Reserve Your Free Intro`
   - Goal Mapping: `Book Your Goal Mapping Visit`
   - Visitor Pass: `Request a Visitor Pass`
   - Private Coaching: `Request Private Coaching`
   - Annual Renewal: `Schedule Your Renewal Review`
   - Community Service: `Check Eligibility`
   - Partnerships: `Discuss a Partnership`
3. **Structured Data & Schema Alignment:**
   - Ensure JSON-LD schema matches visible copy and `content/offers.json` values.
4. **Validation & Testing:**
   - Run `python3 scripts/validate_offers.py` and `python3 scripts/validate_retired_language.py`.
   - Run `npm run qa:all` to ensure zero regressions in sitemaps, links, schema, and funnel tests.
