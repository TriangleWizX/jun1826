# Full-page customer copy rewrite run

**Started:** 2026-10-08
**Goal:** Rewrite every active public customer page as a complete reading path, check the rendered result, then commit and deploy the scoped release.

## Persona and method

- **Persona selection:** `persona_quick.py --plan` returned `no_suitable_persona`. The project selector source and exported prompt files are absent from this checkout, so no prompt was adopted. The Business Operations record returned by the selector is an app introduction with a linked prompt UUID, not the prompt itself; that source could not be read. Use an ordinary copy and content specialist fallback.
- **Instructions:** No INSTRUCTIONS asset was adopted because the full source was unavailable. Apply the loaded `copywriting`, `copy-readability-audit`, and `browser-use` skill methods: one audience and visitor question per page; a clear page argument from promise to proof, process, next step, and final CTA; short, direct wording; rendered-page review.
- **Copy target:** Raw Flesch–Kincaid grade 3 or lower for the full visible page text and each independent customer copy block, using the repository checker. Preserve exact testimonials, citations, legal terms, safety steps, consent, privacy, technical BJJ meanings, and research caveats. Rewrite those passages only when their meaning stays exact; record any required passage that prevents an unqualified grade-three result.
- **Copy review:** Review facts, page intent, reading flow, and plain language. Do not claim conversion lift or publication from local checks.

## Route scope

The source of route scope is the active public portion of `data/url-registry.json`, cross-checked against the generated sitemaps. There are 308 public routes: 63 core, 7 program, 15 location, 154 glossary, 67 blog, 1 policy, and 1 campaign page. This includes active customer pages omitted from the sitemap, including the Free First Visit confirmation page. Exclude staff-only `/admin/`, QA `/artifacts/`, code snippet routes, and the unexpanded location template. Preserve current index/noindex and canonical behavior.

Each route needs a recorded visitor question, primary audience, authoring source, and required facts before copy changes. Shared layout, navigation, footer, and generated glossary content are counted in the rendered page checks, while their copy is changed at its owning source.

## Required checks for each page family

1. Name the visitor question and primary audience.
2. Inventory all rendered visible text, including shared layout, dynamic states, form labels, links, captions, and metadata. Keep quotes and required policy/research terms exact.
3. Rewrite the complete visible path: headline, reassurance, proof, process, canonical schedule or offer reference, FAQ/objection help, related links, and final CTA.
4. Pull prices, times, contact details, ages, eligibility, offer terms, and locations from canonical data or link to their authority.
5. Build, then check full rendered text at the raw grade-three threshold; check metadata, headings, structured data, internal links, accessibility basics, mobile layout, desktop layout, and CTA visibility.
6. Resolve or retain a visible hold wherever authoritative facts conflict. A copy pass does not resolve a policy conflict.

## Current holds

- Guarantee scope and remedy conflict in the guarantee and pricing sources.
- Holiday and special-event dates, terms, and refund rules conflict.
- Hospitality travel-time and visit-duration claims need reconciliation.
- Research claims keep their source, population, numbers, and caveats. Do not rewrite direct testimonials.

## Progress

| Page family / route | Visitor question | Primary audience | Status |
|---|---|---|---|
| Homepage `/` | Which first class can I or my family try, and how do we start? | First-time adults and parents choosing a class for a child or teen | Main page content rewritten; shared layout and final route checks pending. Earlier mobile output was checked; rebuild and recheck after subsequent source changes. |
| Teen program `/bjj-classes/teens-tannersville-ny` | Will my teen feel welcome, learn safely, and know what to expect? | Parents and teens ages 10–17 considering a first class | Main conversion content revised; schedule and visit-duration conflicts removed from prose, guarantee terms linked pending source resolution. Rendered HTML grade 2.78 after build. Shared layout, metadata/links/schema review, and desktop/mobile recheck pending. |
| Kids program `/bjj-classes/kids-tannersville-ny` | Is this a safe, clear first class for my child? | Parents of children ages 5–9 | Main conversion content revised; stale weekday and visit-duration claims removed, age and term length linked to canonical data, guarantee terms linked pending source resolution. Rebuild and full rendered/readability/layout checks pending. |
| Remaining active public routes | Record one visitor question per route during inventory | Record the primary audience per route during inventory | Not yet fully inventoried, rewritten, or verified. |

The earlier 85-fixture implementation remains uncommitted and is the starting source state for this run. Do not restore or overwrite those changes. No commit or deployment has occurred.
