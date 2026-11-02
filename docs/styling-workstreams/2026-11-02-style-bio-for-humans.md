# Style Bio for Humans — 2026-11-02

## Goal and Context

Redesign and style the Sensei Sandy Bio page (`/bio`) for real humans — beginners, parents, and returning adults. Elevate the page from generic, corporate bootstrap boxes into an authentic, warm, and inspiring editorial profile that showcases Sandy's vulnerability, hospitality roots, mountain dedication, lineage, and beginner-first coaching philosophy.

## Persona & Framework Framework

- **Role:** Task-specific ordinary agent (specializing in human-centered editorial frontend design and copywriting).
- **Master INSTRUCTIONS Asset:** `INSTRUCTIONS - CONTENT`, UUID `6e94db8f-e23d-4387-8cc6-bac209e890aa`.
- **Design Guidance:** Grounded in `.agents/skills/design-taste-frontend/SKILL.md` (Anti-Slop frontend design, editorial typography, asymmetric variance, tactile warmth).
  - **Design Read:** "Personal coach biography and studio founder story for parents and adult beginners, with a warm, authentic editorial language, leaning toward human-centered typography, organic layout variance, rich personal storytelling, and tactile warmth."
  - **Dials:** VARIANCE: 7 (Asymmetric layouts, milestone timeline, archival photo framing, pull-quote vignette), MOTION: 3 (Subtle interactive elevations), DENSITY: 3 (Spacious, breathable reading measure).

## Architectural & Visual Enhancements

### 1. Section 1: Hero (`#hero`)
- **Editorial Eyebrow:** Replaced raw uppercase text with `.bio-kicker` (`SANDY JOSÉ NÚÑEZ · BLACK BELT COACH · TANNERSVILLE, NY`).
- **Display Typography:** Typeset in `Instrument Serif` (`I'm Sandy Nunez. I coach jiu-jitsu in Tannersville.`).
- **Story Lead:** Honest, authentic voice explaining his journey from an out-of-shape beginner to coaching 14 classes a week with calm, cooperative learning.
- **Trust Chips:** Added three tactile reassurance pills below CTAs:
  - `<span class="bio-trust-chip"><i class="bi bi-shield-check"></i> Coached, not tested</span>`
  - `<span class="bio-trust-chip"><i class="bi bi-people"></i> Beginners welcome</span>`
  - `<span class="bio-trust-chip"><i class="bi bi-geo-alt"></i> 6045 Main St, 2nd Floor</span>`
- **Portrait Presentation:** Wrapped in `.bio-portrait-wrap` with subtle radius (`1.25rem`), warm border, ambient drop shadow, and a frosted glass credential badge: *"Sandy José Núñez · First-Degree Black Belt · Head Coach"*.

### 2. Section 2: Verified Credentials (`#credentials`)
- Replaced 4 plain bootstrap boxes with `.bio-credential-card`:
  - Deep pine icon medallions (`.bio-credential-icon`).
  - Uppercase category tags (`.bio-credential-tag`: "Black Belt", "Since 2010", "Leadership", "Personal Care").
  - Clear, human-friendly proof for parents and adult beginners.

### 3. Section 3: Origin Story (`#origin-story`)
- Converted a flat wall of text into a dynamic two-column editorial layout:
  - **Left column:** The human narrative detailing the fear of stepping inside, calling from the car, training 2-3 times daily, working as an NYC bartender, winning cocktail competitions, and discovering hospitality.
  - **Right column:** A vertical training milestone card (`.bio-timeline-card`) highlighting key chapters from State College (2010), Manhattan (2011), Brooklyn program leadership, and the Catskills studio.

### 4. Section 4: Lineage & Mentorship (`#chronology`)
- **Lineage Chain Card:** Added `.bio-lineage-chain` showing the unbroken martial progression:
  `Kano Jigoro` &rarr; `Mitsuyo Maeda` &rarr; `Carlos Gracie Jr.` &rarr; `Roberto Maia` &rarr; `Josh Griffiths` &rarr; `Sandy José Núñez`.
- **Mentorship Story:** Preserved verified training history under Professor Josh Griffiths at Clockwork Jiu-Jitsu in NYC.
- **Archival Photo Framing:** Encased the promotion photograph in `.bio-archival-frame` with warm paper border and refined typography caption.

### 5. Section 5: Mountain Roots & Academy Origin (`#academy-origin`)
- Highlights life in East Jewett, family ties to Prattsville, and teaching neighbors on lawns and garage mats ("taught wherever the mats fit").
- **Reverse Classroom Vignette:** Highlight card (`.bio-vignette`) celebrating how kids teach balance and finesse while adults bring focus and life perspective.

### 6. Section 6: Philosophy & Mat Culture (`#coaching-doctrine`)
- Preserved core doctrine: "In our room, every student is coached, not tested."
- 4 tactile tenet cards for *Jita Kyoei* (Mutual Welfare & Shared Progress).
- **Terrified Beginners Pull-Quote:** Created a prominent editorial card (`.bio-pullquote`) with a decorative quotation mark, warm typography, and coach avatar/signoff.
- Preserved inbound link to `/how-class-works`.

### 7. Section 7: Closing Invitation (`#closing-cta`)
- Card with warm gradient accent border, clean headline, reassurance bullet items ("No martial arts experience needed", "Wear comfortable workout clothes", "Reschedule anytime by text"), and prominent primary/secondary CTAs.

### 8. Buttons & Mobile Accessibility
- Styled dedicated button classes (`.btn`, `.btn-primary`, `.btn-outline-secondary`) scoped to `body.page-bio` with guaranteed touch target heights >= 48px.
- Preserved the fixed mobile floating sticky bar for thumb-driven conversion.

## Verification & Checks

1. **Automated Governance Checks:**
   - `npm run qa:volatile-facts`: Passed (578 files checked).
   - `npm run qa:unified`: Passed (15/15 tests across Structural, Link & Route, Contract & Governance, Performance & Media suites).
2. **Build and Delivery Pipeline:**
   - `tools/minify-css.mjs`: Generated `src/assets/css/pages/bio.min.css` (28,991 bytes).
   - `tools/fingerprint-assets.cjs`: Generated asset manifest mapping.
   - `tools/build-bio-delivery-styles.mjs`: Combined stylesheets into `bio-delivery.7a263b4c8c99.css` (95,055 bytes).
3. **Multi-Viewport Headless Browser Testing:**
   - **320×720 (Narrow Mobile):** Status 200, horizontal overflow: false (scrollWidth 320px == innerWidth 320px), 0 page errors.
   - **375×667 (Standard Mobile):** Status 200, horizontal overflow: false, 0 page errors.
   - **390×844 (Modern Phone):** Status 200, horizontal overflow: false, 0 page errors.
   - **1440×1000 (Desktop):** Status 200, horizontal overflow: false, 0 page errors, primary button in fold.
   - Captured full-page screenshots to `/tmp/bio-styled-proof/`.

## Files Touched
- `src/bio.html`
- `src/assets/css/pages/bio.css`
- `src/assets/css/pages/bio.min.css`
- `src/assets/data/asset-hash-manifest.json`
- `dist/bio.html`
- `docs/styling-workstreams/2026-11-02-style-bio-for-humans.md`
