# Dirty path approval sheet

Baseline: current committed `475d2bbb`. Review evidence: [overlay report](2026-11-02-dirty-source-overlay-map-plan.md), [exact output deltas](evidence/2026-11-02/dirty-source-overlay-map/output-delta.json), [input paths and hashes](evidence/2026-11-02/dirty-source-overlay-map/overlay-inputs.json). Route review: 33 HTML/Nunjucks paths. CSS review: 21 paths.

## Simple explanation

The source files are the recipes. `dist/` is the baked site. The broad source overlay changed 506 generated paths, but the committed deploy tool selects only 266. It misses 293 public outputs. This list is for choosing what to keep or review next; it does not approve a deployment.

For each source row, choose: **KEEP LOCAL** (leave as-is; do not release), **DROP** (restore that exact file to committed HEAD), or **REVIEW** (do a focused check before any release). Blank means keep local. The reviewers found no path clearly safe to delete. Nothing will be dropped or deployed from an empty choice. Source review does not prove rendered behavior.

## What the reviewers found

- **No obvious deletions.** The changes appear intentional; keep them local until you choose what should be checked or released.
- **Hold the sales-page group:** `src/sales-calculator.html`, `src/video-goal-session.html`, `src/welcome-primer.html`, plus links in `src/after-booking-promise.html`, `src/options-pricing.njk`, and `src/schedule.html`. Current issues are unapproved claims/pricing, missing booking details/video, or a page that promises a missing video.
- **Hold Student Hub data-dependent styling:** `src/assets/css/pages/student-hub-premium.css`; its weekly focus and YAM archive data remain shelved.
- **Hold Winter Rank Drop work:** `src/winter-rank-drop.html` and `src/assets/css/pages/winter-rank-drop.css` until the stale Winter content is reconciled.
- **Keep broad shared styling local for now:** `src/assets/css/site-shell.css` affects many routes; `src/assets/css/mobile-foundation.css` changes reduced-motion and keyboard-visible action-bar behavior.
- **Review `src/assets/data/asset-hash-manifest.json` with a clean build.** It changes many asset fingerprints and removes the Blog CSS mapping; verify all references before release.
- **One CSS output mapping gap:** `src/assets/css/pages/options-pricing-highend.css` changes but the deploy mapper omits its raw output. Do not release it through the current mapper.
- The helper edit in `tools/build-article-styles.mjs` only reorders an unchanged safelist entry; it appears behavior-neutral.

## Easy approval choices

You can answer with one or more numbers:

1. **Keep everything local** and make no source changes. Safest; all edits remain intact.
2. **Review the focused accessibility/UI group**: form labels/IDs, report-card button behavior, skip links, reduced motion, and 44px tap targets. This requests focused checks; it does not approve deployment.
3. **Review the content/render group**: Blog subtitle, Core Culture stylesheet link, glossary classes, research breadcrumb wrapping, nearby mobile wrapping, Visit badge color, and consent labels.
4. **Review named paths** by listing their row numbers.
5. **Drop named paths** by listing row numbers. Only those exact files will be restored; generated `dist/` files stay untouched.

Until you pick a review cohort, recommendation is **1: keep everything local**. The root `dist/` remains mixed and must not be deployed.

## Source and build inputs

These are the 54 inputs used in the isolated overlay: 53 dirty `src/` files and one build helper. The broad build did not attribute outputs to each input individually. The “why/hold” column summarizes known decisions only; other rows need a focused diff review.

| # | Path | State | Type | Why / hold | Your choice |
|---:|---|---|---|---|---|
| 1 | `src/_includes/components/form-free-intro.njk` | M | Page or template | Free Intro layout B is already released; inspect only the remaining kicker color edit. |  |
| 2 | `src/_includes/critical/free-intro.njk` | M | Page or template | Free Intro layout B is already released; compare this remaining diff before replay. |  |
| 3 | `src/after-booking-promise.html` | M | Page or template | Hold with the sales-page group: it points to a welcome video that is missing. |  |
| 4 | `src/assets/css/contact-vip.css` | M | CSS | Adds a 44px minimum control/link height; layout B was already released, so check whether this remaining change is needed. |  |
| 5 | `src/assets/css/cro.css` | M | CSS | Adds spacing and 44px targets to Programs side-card links. |  |
| 6 | `src/assets/css/faqs.css` | M | CSS | Raises several text sizes and target sizes; broad FAQ styling change. |  |
| 7 | `src/assets/css/global.css` | M | CSS | Makes `.btn-tactical` at least 44px tall across pages. |  |
| 8 | `src/assets/css/hyphen-weekend.css` | M | CSS | Adds/stylizes a large page section, tabs, cards, and 44px controls. |  |
| 9 | `src/assets/css/mobile-foundation.css` | M | CSS | Reduced-motion and keyboard-visible action-bar behavior changed; owner keyboard SOP is pending. |  |
| 10 | `src/assets/css/pages/core-culture-parent-guide.css` | M | CSS | Breadcrumb size, button layout, and 44px controls/focus ring changed. |  |
| 11 | `src/assets/css/pages/everyday-jiu-jitsu.min.css` | NEW | CSS | No source difference from baseline was found; no dirty change to approve. |  |
| 12 | `src/assets/css/pages/near.css` | M | CSS | Changes link color and narrow hero wrapping; held until the live canonical route is shown to use this CSS. |  |
| 13 | `src/assets/css/pages/options-pricing-highend.css` | M | CSS | Focus, wrapping, and target-size changes; mapper currently omits its output. |  |
| 14 | `src/assets/css/pages/shiney-ticket.css` | M | CSS | Campaign layout, text size, and form/button targets changed. |  |
| 15 | `src/assets/css/pages/source-record.css` | M | CSS | One control/link gains a 44px minimum height. |  |
| 16 | `src/assets/css/pages/spring-armor-drop.css` | M | CSS | Proof-section palette and supporting text size changed. |  |
| 17 | `src/assets/css/pages/student-hub-premium.css` | M | CSS | Shelved: weekly focus and YAM records await current approved data. |  |
| 18 | `src/assets/css/pages/winter-armor-2027.css` | M | CSS | Focus outlines and caption text size changed; release only if a current approved item uses it. |  |
| 19 | `src/assets/css/pages/winter-rank-drop.css` | M | CSS | Text floor, skip link, and mobile nav targets changed; Winter content is stale. |  |
| 20 | `src/assets/css/partner-pages.css` | M | CSS | One icon/button target becomes 44×44. |  |
| 21 | `src/assets/css/site-shell.css` | M | CSS | Broad site-wide wrapping, text size, and tap-target rules; review one small selector group at a time. |  |
| 22 | `src/assets/css/styles.css` | M | CSS | Turns off selected CTA animations when reduced motion is requested. |  |
| 23 | `src/assets/data/asset-hash-manifest.json` | M | Asset map | Many fingerprint additions/removals, including Blog CSS; validate against a clean build and references. |  |
| 24 | `src/birthday-parties.html` | M | Page or template | Adds the shared consent-label class to the form. |  |
| 25 | `src/bjj-glossary/choke/index.html` | M | Page or template | Adds body/ancestor styling classes. |  |
| 26 | `src/bjj-glossary/open-mat/index.html` | M | Page or template | Adds body/ancestor styling classes. |  |
| 27 | `src/blog/bjj-sensei/index.html` | M | Page or template | Changes subtitle from white to dark; verify against its rendered background. |  |
| 28 | `src/bring-a-friend.html` | M | Page or template | Adds the shared consent-label class to the form. |  |
| 29 | `src/camp-clinics.html` | M | Page or template | Adds reduced-motion handling for testimonial scrolling. |  |
| 30 | `src/core-culture-parent-guide.html` | M | Page or template | Adds a page stylesheet link; confirm generated asset and use. |  |
| 31 | `src/daily-checkin.html` | M | Page or template | Makes suite navigation links at least 44px tall. |  |
| 32 | `src/deer-mountain-inn.html` | M | Page or template | Adds the shared consent-label class to the form. |  |
| 33 | `src/footer-partner.html` | M | Page or template | Moves existing footer-link CSS into the page head; appears behavior-neutral. |  |
| 34 | `src/front-headlock-series/index.html` | M | Page or template | Gives the mobile CTA a 44px minimum height. |  |
| 35 | `src/hyphen-weekend.html` | M | Page or template | Adds skip link and main focus target; needs keyboard check. |  |
| 36 | `src/nervous-first-timers.html` | M | Page or template | Adds a CRO stylesheet link; confirm it is needed and loads. |  |
| 37 | `src/options-pricing.njk` | M | Page or template | Links to held calculator/video pages; hold with sales-page group. |  |
| 38 | `src/partials/nav-include.html` | M | Page or template | The requested Kids/Teens hotlinks are already released; review any remaining difference before replay. |  |
| 39 | `src/phoenicia-diner.html` | M | Page or template | Adds the shared consent-label class to the form. |  |
| 40 | `src/practice-vault.njk` | M | Page or template | Makes Adults/Youth tabs at least 44px tall. |  |
| 41 | `src/report-card.html` | M | Page or template | Converts stripe controls to stateful buttons; focused behavior check needed. |  |
| 42 | `src/rural-bjj-catskills.html` | M | Page or template | Adds mobile wrapping for the last card. |  |
| 43 | `src/sales-calculator.html` | NEW | Page or template | Held: claims/pricing not approved. |  |
| 44 | `src/schedule.html` | M | Page or template | The requested schedule-link change is already released; review any remaining difference before replay. |  |
| 45 | `src/scribners.html` | M | Page or template | Adds the shared consent-label class to the form. |  |
| 46 | `src/sources/research/records.njk` | M | Page or template | Wraps long breadcrumbs instead of clipping them. |  |
| 47 | `src/tactical-longevity.html` | M | Page or template | Adds form labels/IDs and consent-label class; check IDs and preserve form meaning. |  |
| 48 | `src/video-goal-session.html` | NEW | Page or template | Held: booking details and video are missing. |  |
| 49 | `src/visit/index.html` | M | Page or template | Changes a step badge from teal to green. |  |
| 50 | `src/waiver.html` | M | Page or template | Adds label/input links and consent-label class; check IDs are unique. |  |
| 51 | `src/weekly-audit.html` | M | Page or template | Adds skip link and larger suite-nav targets; check focus destination/offset. |  |
| 52 | `src/welcome-primer.html` | NEW | Page or template | Held: welcome video and public booking details are missing. |  |
| 53 | `src/winter-rank-drop.html` | M | Page or template | Standalone compiled page has local edits; hold until Winter content is reconciled. |  |
| 54 | `tools/build-article-styles.mjs` | M | Build helper | Reorders an unchanged Blog CSS safelist entry; appears to have no output effect. |  |

### Excluded source file

| Path | State | Reason |
|---|---|---|
| `src/assets/css/pages/law-enforcement.css.tmp` | NEW | Temporary `.tmp` file; excluded from the build overlay. Keep local unless you direct otherwise. |

## Deployment and QA tooling

| Path | State | What changed / how to decide |
|---|---|---|
| `scripts/deploy-release.py` | M | Modified mapper removes Winter Rank Drop and Show-Up Kit CSS mappings. Not used in the overlay; keep local until reviewed against the coverage gaps. |
| `package.json` | M | Adds QA commands; not a build input for this map. |
| `scripts/qa-cwv-lab.mjs` | M | QA/helper code only; not a public page payload. |
| `scripts/qa-faq-disclosures.mjs` | NEW | QA/helper code only; not a public page payload. |
| `scripts/qa-home-builder.mjs` | NEW | QA/helper code only; not a public page payload. |
| `scripts/qa-sticky-overlap.mjs` | M | QA/helper code only; not a public page payload. |
| `scripts/qa-viewports.mjs` | M | QA/helper code only; not a public page payload. |
| `scripts/qa-visibility.mjs` | M | QA/helper code only; not a public page payload. |
| `scripts/lib/visibility-contrast.mjs` | NEW | QA/helper code only; not a public page payload. |
| `tests/qa-visibility.test.mjs` | NEW | QA/helper code only; not a public page payload. |

## Mixed root generated files

These 81 paths are already dirty in the main checkout. Their source ownership is mixed. Do not upload or delete them individually; regenerate only after a source choice and exact mapping are approved.

| State | Root `dist/` path | Action |
|---|---|---|
| D | `dist/assets/css/pages/free-intro-delivery.f79608e60361.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/home.min.00f174.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/home.min.0117a0.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/home.min.139fb2.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/home.min.9b631c.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/schedule-month-calendar.1f6ad4.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/schedule-month-calendar.bac4fa.css` | HOLD: mixed generated output |
| M | `dist/assets/css/pages/schedule-month-calendar.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/schedule-month-calendar.d14fb2.css` | HOLD: mixed generated output |
| D | `dist/assets/css/pages/schedule.3f12ea.css` | HOLD: mixed generated output |
| M | `dist/assets/js/schedule-month-calendar.js` | HOLD: mixed generated output |
| M | `dist/bjj-classes/acra-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/adults-tannersville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/ashland-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/beginner-lane/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/boiceville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/coxsackie-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/durham-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/elka-park-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/gilboa-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/grand-gorge-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/greenville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/kids-tannersville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/lanesville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/leeds-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/lexington-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/maplecrest-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/olive-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/prattsville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/purling-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/round-top-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/roxbury-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/saugerties-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/schoharie-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/shandaken-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/shokan-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/stamford-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-classes/teens-tannersville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/bottom-position/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/collar-grip/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/hip-escape/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/open-guard-pass/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/waiter-sweep/index.html` | HOLD: mixed generated output |
| M | `dist/bjj-glossary/x-guard/index.html` | HOLD: mixed generated output |
| M | `dist/free-bjj-intro-tannersville-ny/confirmation/index.html` | HOLD: mixed generated output |
| M | `dist/free-bjj-intro-tannersville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/giveaway-rules.html` | HOLD: mixed generated output |
| M | `dist/index.html` | HOLD: mixed generated output |
| M | `dist/instagram/index.html` | HOLD: mixed generated output |
| M | `dist/local-bjj-tournaments-for-families.html` | HOLD: mixed generated output |
| M | `dist/nav-include.html` | HOLD: mixed generated output |
| M | `dist/near/cairo-ny/index.html` | HOLD: mixed generated output |
| M | `dist/near/catskill-ny/index.html` | HOLD: mixed generated output |
| M | `dist/near/haines-falls-ny/index.html` | HOLD: mixed generated output |
| M | `dist/near/hunter-ny/index.html` | HOLD: mixed generated output |
| M | `dist/near/palenville-ny/index.html` | HOLD: mixed generated output |
| M | `dist/near/windham-ny/index.html` | HOLD: mixed generated output |
| M | `dist/options-pricing.html` | HOLD: mixed generated output |
| M | `dist/options-pricing/index.html` | HOLD: mixed generated output |
| M | `dist/pricing-module-fragment.html` | HOLD: mixed generated output |
| D | `dist/schedule.html` | HOLD: mixed generated output |
| M | `dist/schedule/index.html` | HOLD: mixed generated output |
| M | `dist/sensei-jiu-jitsu.html` | HOLD: mixed generated output |
| M | `dist/sensei-studio.html` | HOLD: mixed generated output |
| M | `dist/sitemap-core.xml` | HOLD: mixed generated output |
| M | `dist/sitemap-glossary.xml` | HOLD: mixed generated output |
| M | `dist/sitemap-locations.xml` | HOLD: mixed generated output |
| M | `dist/sitemap-programs.xml` | HOLD: mixed generated output |
| M | `dist/sitemap-research.xml` | HOLD: mixed generated output |
| M | `dist/sources/cdc-physical-activity/index.html` | HOLD: mixed generated output |
| M | `dist/sources/clockwork-bjj-instructors/index.html` | HOLD: mixed generated output |
| M | `dist/sources/gracie-academy/index.html` | HOLD: mixed generated output |
| M | `dist/sources/index.html` | HOLD: mixed generated output |
| M | `dist/sources/kenny-florian/index.html` | HOLD: mixed generated output |
| M | `dist/sources/kodokan-etiquette/index.html` | HOLD: mixed generated output |
| M | `dist/sources/marietta-police-bjj/index.html` | HOLD: mixed generated output |
| M | `dist/student-hub.html` | HOLD: mixed generated output |
| M | `dist/tactical-longevity/index.html` | HOLD: mixed generated output |
| M | `dist/white-belt-foundations/index.html` | HOLD: mixed generated output |
| M | `dist/womens-jiu-jitsu-tannersville.html` | HOLD: mixed generated output |

## Isolated overlay output paths

Each row below is from the clean-baseline versus dirty-overlay build, not from the main root `dist/`. “Mapped” means the committed deploy tool includes that path in its broad dry-run; “Missing” means it omits it. Every row is held until the source cohort is narrowed and mapper coverage is repaired.

Overlay: **31 added, 24 removed, 451 changed**. Mapper: **266 paths**. Of the 328 omitted changes, 293 are deployable: 257 HTML routes, 35 CSS files, and one WebP.

<details><summary>506 generated paths changed in the overlay</summary>

| Build change | Generated path | Mapper | Review status |
|---|---|---|---|
| ADD | `dist/assets/css/cro.min.0d7a21.css` | Mapped | HOLD |
| ADD | `dist/assets/css/faqs.e82adc.css` | Mapped | HOLD |
| ADD | `dist/assets/css/hyphen-weekend.54cbe5.css` | Mapped | HOLD |
| ADD | `dist/assets/css/mobile-foundation.d8c863.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/article-delivery.942659b285a1.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/bio-delivery.2dd0cf671154.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/bjj-classes-delivery.d66db691e006.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/core-culture-parent-guide.ff16de.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/directions-delivery.1f8f14915bf1.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/everyday-jiu-jitsu.min.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/free-intro-delivery.b20528020ca9.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/glossary-delivery.74fc5fa5666e.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/home-delivery.51533cba8572.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/instagram-delivery.a3e89ed3c582.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/kids-delivery.5bce252e0a13.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/near.5c00d3.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/options-pricing-delivery.a03ffcf6b2aa.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/options-pricing-highend.cc17f8.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/schedule-delivery.b638bd44309e.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/shiney-ticket.20393e.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/source-record.07d3b1.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/spring-armor-drop.37e4f2.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/student-hub-premium.159dbc.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/tannersville-delivery.f89538be2095.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/visit-delivery.4cad1859b953.css` | Missing | HOLD |
| ADD | `dist/assets/css/pages/winter-armor-2027.827d06.css` | Mapped | HOLD |
| ADD | `dist/assets/css/pages/winter-rank-drop.50b5f8.css` | Mapped | HOLD |
| ADD | `dist/assets/images/studio/sensei-sandy-bjj-studio-lobby-entrance-1440.2392db.webp` | Missing | HOLD |
| ADD | `dist/sales-calculator/index.html` | Missing | HOLD |
| ADD | `dist/video-goal-session/index.html` | Missing | HOLD |
| ADD | `dist/welcome-primer/index.html` | Missing | HOLD |
| REMOVE | `dist/assets/css/faqs.87510f.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/hyphen-weekend.bdac9d.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/mobile-foundation.114422.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/article-delivery.d842e20b7729.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/bio-delivery.eea4bc64a2b1.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/bjj-classes-delivery.02a5cfce8520.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/directions-delivery.730242e947db.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/free-intro-delivery.9aaaa799a133.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/glossary-delivery.e1522fe54ce7.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/home-delivery.91b43abcf45f.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/instagram-delivery.2346668bedf2.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/kids-delivery.21fed56d05d6.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/near.ded2d3.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/options-pricing-delivery.206d5681eba4.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/options-pricing-highend.2c2d79.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/schedule-delivery.1cd1bea13549.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/shiney-ticket.d0acd0.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/source-record.d113af.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/spring-armor-drop.156726.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/student-hub-premium.66115b.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/tannersville-delivery.73647b4f33e1.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/visit-delivery.68516adf06a7.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/winter-armor-2027.3f3262.css` | Missing | HOLD |
| REMOVE | `dist/assets/css/pages/winter-rank-drop.cb1eca.css` | Missing | HOLD |
| CHANGE | `dist/404.html` | Missing | HOLD |
| CHANGE | `dist/about/index.html` | Missing | HOLD |
| CHANGE | `dist/admin/youth-intro.html` | Missing | HOLD |
| CHANGE | `dist/adult-private-coaching-intensive.html` | Missing | HOLD |
| CHANGE | `dist/after-booking-promise.html` | Missing | HOLD |
| CHANGE | `dist/alley-bootcamp/index.html` | Missing | HOLD |
| CHANGE | `dist/assets/css/contact-vip.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/cro.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/faqs.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/global.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/hyphen-weekend.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/mobile-foundation.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/core-culture-parent-guide.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/near.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/options-pricing-highend.css` | Missing | HOLD |
| CHANGE | `dist/assets/css/pages/shiney-ticket.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/source-record.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/spring-armor-drop.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/student-hub-premium.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/winter-armor-2027.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/pages/winter-rank-drop.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/partner-pages.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/site-shell.css` | Mapped | HOLD |
| CHANGE | `dist/assets/css/styles.css` | Mapped | HOLD |
| CHANGE | `dist/assets/data/asset-hash-manifest.json` | Mapped | HOLD |
| CHANGE | `dist/athlete-cross-training/evidence/index.html` | Missing | HOLD |
| CHANGE | `dist/athlete-cross-training/index.html` | Missing | HOLD |
| CHANGE | `dist/bio.html` | Missing | HOLD |
| CHANGE | `dist/birthday-parties.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-butterfly-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/acra-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/adults-tannersville-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-classes/ashland-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/beginner-lane/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/boiceville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/cairo-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/catskill-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/coxsackie-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/durham-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/elka-park-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/family-martial-arts-catskills/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/gilboa-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/grand-gorge-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/greenville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/haines-falls-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/hunter-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/index.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-classes/kids-tannersville-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-classes/lanesville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/leeds-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/lexington-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/maplecrest-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/olive-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/palenville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/phoenicia-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/prattsville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/purling-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/round-top-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/roxbury-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/saugerties-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/schoharie-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/shandaken-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/shokan-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/stamford-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/tannersville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/teens-tannersville-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-classes/windham-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-classes/woodstock-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-faqs.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/ankle-lock/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/ankle-pick/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/arm-drag/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/armbar/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/back-control/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/back-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/back-take/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/backstep-pass/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/base/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/beginner-lane/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/body-lock-pass/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/body-lock/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/bottom-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/bridge/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/bully-proof/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/butterfly-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/butterfly-hook/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/butterfly-sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/chest-to-back/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/chest-to-chest/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/choke/index.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-glossary/clinch/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/closed-guard-break/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/closed-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/collar-grip/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/collar-tie/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/control/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/cross-collar-choke/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/crossface-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/crossface-pressure/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/crossface/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/de-la-riva/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/dominant-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/double-leg-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/double-leg/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/drilling/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/elbow-knee-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/flower-sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/frame-recovery/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/frame/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/frames/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/front-headlock-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/front-headlock-series/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/front-headlock/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/gi/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/go-behind-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/go-behind/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/granby-roll/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/grip-fighting/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/grip/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/guard-pass/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/guard-pull/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/guard-recovery/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/guard-retention/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/guillotine/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/half-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/hand-fighting/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/head-line/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/head-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/heavy-hips/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/hip-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/hip-heist/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/hooks/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/how-to-tap/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/inside-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/inside-tie/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/inside-trip/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/inversion/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/jiu-jitsu/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/k-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/kimura/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/knee-cut/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/knee-line/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/knee-shield/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/knee-slide/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/lapel-grip/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/leg-drag/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/leg-entanglement/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/level-change/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/long-step/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/mat-return/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/mount-transition/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/mount/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/neutral-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/no-gi/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/north-south/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/off-balance/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/open-guard-pass/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/open-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/open-mat/index.html` | Mapped | HOLD |
| CHANGE | `dist/bjj-glossary/outside-trip/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/overhook/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/penetration-step/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/pin-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/pin/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/position-over-submission/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/posture-break/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/posture-recovery/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/posture/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/pressure/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/pummel/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/quarter-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/re-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/re-shot/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/rear-naked-choke/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/reverse-de-la-riva/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/roll/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/safety/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/scissor-sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/scramble/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/seatbelt-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/seatbelt/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/seated-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/shot-entry/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/shoulder-pressure/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/shrimp/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/sickle-sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/side-control/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/single-leg-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/single-leg/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/sleeve-grip/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/snap-down-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/snap-down/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/spin-behind/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/sprawl-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/sprawl/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/submission/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/sweep-single/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/takedown-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/takedown/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/tap/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/technical-stand-up/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/top-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/top-ride/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/torreando-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/torreando/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/transition/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/triangle/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/tripod-sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/turtle/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/underhook/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/upa-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/updates/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/waiter-sweep/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/whizzer-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/whizzer/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/windshield-wiper/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/wrestle-up/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/wrist-control/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/x-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-glossary/z-guard/index.html` | Missing | HOLD |
| CHANGE | `dist/bjj-stretches.html` | Missing | HOLD |
| CHANGE | `dist/bjj-tannersville-ny-directions.html` | Missing | HOLD |
| CHANGE | `dist/black-belt-concierge.html` | Missing | HOLD |
| CHANGE | `dist/blog/adult-brazilian-jiu-jitsu-near-me-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/after-school-jiu-jitsu-calm-routine-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/after-school-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/basic-jiu-jitsu-terms/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/beginner-friendly-bjj-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/beginners-guide-bjj-human-chess/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bio-switch-nervous-system/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bioginastica-movement-no-gi/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-36-techniques/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-beginners-over-40-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-belts-stripes-promotions/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-black-belt-degree-time/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-on-the-mountain/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-promotions-how-often/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-schedule-windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-sensei/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-vs-karate-for-kids-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bjj-vs-taekwondo-family-martial-arts/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bully-proof-jiu-jitsu-stories-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/bully-proof-martial-arts-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/busy-parent-guide-to-family-martial-arts/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/cairo-ny-bjj-specialist/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/can-you-beat-sensei-without-a-black-belt/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/catskills-gym-alternative-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/confidence-protocol/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/cost-of-private-bjj-lessons-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/desk-worker-bjj-guide-mobility-core-calm/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/exactly-what-happens-first-bjj-class-minute-by-minute/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/family-friendly-bjj-near-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/family-martial-arts-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/gain-points-system/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/gi-bjj-windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/gi-vs-no-gi-bjj-cheat-code/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/growth-over-gold-bjj-mindset/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/how-sandy-teaches-bjj/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/how-to-fall-safely-bjj-breakfalls/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/how-to-pick-a-bjj-school-in-the-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/hunter-elementary-tuesday-drop-off-bjj/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/jiu-jitsu-for-teenagers-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/jiu-jitsu-near-hunter-mountain/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/jiu-jitsu-near-windham-mountain-club-ski-families/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/jiu-jitsu-near-windham-mountain-club/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/jiu-jitsu-windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/kids-bjj-training-partners/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/kids-jiu-jitsu-windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/kids-martial-arts-haines-falls-beginner-friendly-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/kids-martial-arts-haines-falls/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/kids-teens-bjj-belts-ranks-stripes-promotions/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/kinetic-chess-onteora-park/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/martial-arts-windham-ny-why-families-pick-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/neck-cranks-bjj-longevity-guide/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/no-gi-windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/private-bjj-coaching-catskills-visitors/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/private-bjj-lessons-adults-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/private-bjj-lessons-kids-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/private-jiu-jitsu-lessons-windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/private-self-defense-coaching-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/safe-bjj-mma-training-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/safe-martial-arts-beginners-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/safe-self-defense-kids-positional-control/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/sanda-vs-jiu-jitsu-for-mma/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/sanda-vs-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/schedule-sensei-reset-protocol/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/schedule-sensei-weekly-template/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/schedule-sensei/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/seated-guard-basics/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/sensei-mma-bjj/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/sensei-rules/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/snow-day-protocol-bjj-home-dojo/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/spring-fling-is-here/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/starting-bjj-over-30-over-40-catskills/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/tags/adult-bjj/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/tags/starting-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/tags/youth/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/takedown-defense/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/tannersville-bjj-tuesday/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/teen-boundary-setting-conflict-deescalation/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/teen-confidence-deescalation-jiu-jitsu/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/teen-jiu-jitsu-hunter-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/things-to-do-near-hunter-ny-private-bjj-coaching/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/water-before-training-how-much-when/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/what-does-sensei-mean-in-bjj/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/what-is-sanda-sanshou/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/what-kids-learn-in-bjj/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/why-high-school-athletes-train-bjj-tannersville/index.html` | Mapped | HOLD |
| CHANGE | `dist/blog/wrestle-ups-scramble/index.html` | Mapped | HOLD |
| CHANGE | `dist/bottom-position/index.html` | Missing | HOLD |
| CHANGE | `dist/bring-a-friend.html` | Mapped | HOLD |
| CHANGE | `dist/bully-proof-jiu-jitsu-tannersville-ny.html` | Missing | HOLD |
| CHANGE | `dist/camp-clinics.html` | Mapped | HOLD |
| CHANGE | `dist/catskills-home-base.html` | Missing | HOLD |
| CHANGE | `dist/choke/index.html` | Missing | HOLD |
| CHANGE | `dist/class-rules.html` | Missing | HOLD |
| CHANGE | `dist/community-partners.html` | Missing | HOLD |
| CHANGE | `dist/confidence-protocol/index.html` | Missing | HOLD |
| CHANGE | `dist/contact.html` | Missing | HOLD |
| CHANGE | `dist/core-culture-parent-guide/index.html` | Missing | HOLD |
| CHANGE | `dist/cta-decision.html` | Missing | HOLD |
| CHANGE | `dist/cta-header.html` | Missing | HOLD |
| CHANGE | `dist/cta-hero.html` | Missing | HOLD |
| CHANGE | `dist/cta-primary.html` | Missing | HOLD |
| CHANGE | `dist/cta-row.html` | Missing | HOLD |
| CHANGE | `dist/daily-checkin.html` | Mapped | HOLD |
| CHANGE | `dist/deer-mountain-inn.html` | Mapped | HOLD |
| CHANGE | `dist/drilling/index.html` | Missing | HOLD |
| CHANGE | `dist/everyday-jiu-jitsu-training/index.html` | Mapped | HOLD |
| CHANGE | `dist/evidence/index.html` | Missing | HOLD |
| CHANGE | `dist/footer-include-no-proof.html` | Missing | HOLD |
| CHANGE | `dist/footer-partner.html` | Mapped | HOLD |
| CHANGE | `dist/frames/index.html` | Missing | HOLD |
| CHANGE | `dist/free-beginner-jiu-jitsu-intro-kids-teens-tannersville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/free-bjj-intro-tannersville-ny/adults/index.html` | Missing | HOLD |
| CHANGE | `dist/free-bjj-intro-tannersville-ny/confirmation/index.html` | Missing | HOLD |
| CHANGE | `dist/free-bjj-intro-tannersville-ny/index.html` | Missing | HOLD |
| CHANGE | `dist/free-bjj-intro-tannersville-ny/kids/index.html` | Missing | HOLD |
| CHANGE | `dist/free-bjj-intro-tannersville-ny/teens/index.html` | Missing | HOLD |
| CHANGE | `dist/friday-night-fanatics.html` | Missing | HOLD |
| CHANGE | `dist/front-headlock-escape/index.html` | Missing | HOLD |
| CHANGE | `dist/front-headlock-series/index.html` | Missing | HOLD |
| CHANGE | `dist/giveaway-rules.html` | Missing | HOLD |
| CHANGE | `dist/guarantee-terms.html` | Missing | HOLD |
| CHANGE | `dist/halloween-spooktacular.html` | Missing | HOLD |
| CHANGE | `dist/holiday-schedule.html` | Missing | HOLD |
| CHANGE | `dist/how-class-works.html` | Missing | HOLD |
| CHANGE | `dist/hyphen-weekend/index.html` | Mapped | HOLD |
| CHANGE | `dist/inclusion.html` | Missing | HOLD |
| CHANGE | `dist/index.html` | Missing | HOLD |
| CHANGE | `dist/instagram/index.html` | Missing | HOLD |
| CHANGE | `dist/jiu-jitsu-safety-tannersville-ny.html` | Missing | HOLD |
| CHANGE | `dist/jiu-jitsu-terms/index.html` | Missing | HOLD |
| CHANGE | `dist/lane-picker.html` | Missing | HOLD |
| CHANGE | `dist/law-enforcement-bjj.html` | Missing | HOLD |
| CHANGE | `dist/local-bjj-tournaments-for-families.html` | Missing | HOLD |
| CHANGE | `dist/local-bjj-tournaments-for-parents.html` | Missing | HOLD |
| CHANGE | `dist/members/holiday-routine/index.html` | Missing | HOLD |
| CHANGE | `dist/members/winter-training-plan/index.html` | Mapped | HOLD |
| CHANGE | `dist/nav-include.html` | Mapped | HOLD |
| CHANGE | `dist/near/cairo-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/near/catskill-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/near/haines-falls-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/near/hunter-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/near/palenville-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/near/windham-ny/index.html` | Mapped | HOLD |
| CHANGE | `dist/nearby-towns.html` | Mapped | HOLD |
| CHANGE | `dist/nervous-first-timers/index.html` | Missing | HOLD |
| CHANGE | `dist/open-mat/index.html` | Missing | HOLD |
| CHANGE | `dist/options-pricing.html` | Mapped | HOLD |
| CHANGE | `dist/options-pricing/index.html` | Mapped | HOLD |
| CHANGE | `dist/parent-resources.html` | Missing | HOLD |
| CHANGE | `dist/parents-guide-kids-bjj/index.html` | Missing | HOLD |
| CHANGE | `dist/partials/nav-include.html` | Mapped | HOLD |
| CHANGE | `dist/partners-hospitality-hunter-windham.html` | Missing | HOLD |
| CHANGE | `dist/partners-wellness-pt-referrals.html` | Missing | HOLD |
| CHANGE | `dist/phoenicia-diner.html` | Mapped | HOLD |
| CHANGE | `dist/position/index.html` | Missing | HOLD |
| CHANGE | `dist/practice-vault/index.html` | Missing | HOLD |
| CHANGE | `dist/pricing-module-fragment.html` | Missing | HOLD |
| CHANGE | `dist/pricing-module.html` | Missing | HOLD |
| CHANGE | `dist/private-lessons.html` | Missing | HOLD |
| CHANGE | `dist/programs.html` | Missing | HOLD |
| CHANGE | `dist/report-card.html` | Mapped | HOLD |
| CHANGE | `dist/research/law-enforcement-bjj-evidence.html` | Missing | HOLD |
| CHANGE | `dist/research/marietta-police-bjj-case-summary.html` | Missing | HOLD |
| CHANGE | `dist/roll/index.html` | Missing | HOLD |
| CHANGE | `dist/rural-bjj-catskills.html` | Mapped | HOLD |
| CHANGE | `dist/schedule/index.html` | Mapped | HOLD |
| CHANGE | `dist/scribners-jiu-jitsu.html` | Missing | HOLD |
| CHANGE | `dist/scribners-thank-you.html` | Missing | HOLD |
| CHANGE | `dist/scribners.html` | Mapped | HOLD |
| CHANGE | `dist/sensei-jiu-jitsu.html` | Missing | HOLD |
| CHANGE | `dist/sensei-studio.html` | Missing | HOLD |
| CHANGE | `dist/show-up-kit.html` | Missing | HOLD |
| CHANGE | `dist/site-shell.html` | Missing | HOLD |
| CHANGE | `dist/snap-down-defense/index.html` | Missing | HOLD |
| CHANGE | `dist/snippets/webp-picture.html` | Missing | HOLD |
| CHANGE | `dist/sources/cdc-physical-activity/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/clockwork-bjj-instructors/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/gracie-academy/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/kenny-florian/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/kodokan-etiquette/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/local/catskills-youth-theater-2026/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/local/htc-soccer-2026/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/local/hunter-mountain-2026-27/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/local/studios-main-pilates/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/marietta-police-bjj/index.html` | Missing | HOLD |
| CHANGE | `dist/sources/research/bjj-adult-fitness/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/bjj-ecological-dynamical-2026/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/bjj-injury-2025/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/bjj-injury-rates-review/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/bjj-mma-youth-development/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/bjj-school-rct/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/challenge-point-perspective-2026/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/combat-sports-injury-epidemiology-review/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/combat-sports-post-concussion-care/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/deliberate-practice-expertise/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/ecological-dynamic-learning-review-2026/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/exercise-cognition-neuroplasticity-review/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/games-based-teaching-review/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/greene-county-child-health-2024/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/greene-county-community-health-2022-2024/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/open-skill-youth-meta-analysis/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/pe-games-review-2026/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/pediatric-bjj-injury-review/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/rugby-ecological-dynamics-2026/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/youth-martial-arts-attention-rct/index.html` | Mapped | HOLD |
| CHANGE | `dist/sources/research/youth-sports-injury-prevention/index.html` | Mapped | HOLD |
| CHANGE | `dist/spring-armor-drop.html` | Missing | HOLD |
| CHANGE | `dist/student-hub.html` | Missing | HOLD |
| CHANGE | `dist/success-stories.html` | Missing | HOLD |
| CHANGE | `dist/summer-academy.html` | Missing | HOLD |
| CHANGE | `dist/sweep-single/index.html` | Missing | HOLD |
| CHANGE | `dist/tactical-longevity/index.html` | Missing | HOLD |
| CHANGE | `dist/updates/index.html` | Missing | HOLD |
| CHANGE | `dist/visit/index.html` | Mapped | HOLD |
| CHANGE | `dist/waiver.html` | Mapped | HOLD |
| CHANGE | `dist/weekly-audit.html` | Mapped | HOLD |
| CHANGE | `dist/what-is-a-jiu-jitsu-sensei/index.html` | Missing | HOLD |
| CHANGE | `dist/white-belt-foundations/index.html` | Missing | HOLD |
| CHANGE | `dist/winter-armor-2027/index.html` | Missing | HOLD |
| CHANGE | `dist/winter-rank-drop/index.html` | Mapped | HOLD |
| CHANGE | `dist/womens-jiu-jitsu-tannersville.html` | Missing | HOLD |

</details>

<details><summary>88 mapper paths with no generated-output change</summary>

| Mapper path | Review status |
|---|---|
| `assets/css/contact-vip.min.9a468e.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/contact-vip.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/cro.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/faqs.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/global.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/pages/adults-delivery.b64270844d52.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/pages/birthday-parties.d196fb.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/pages/everyday-jiu-jitsu.5f2c9f.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/pages/near.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/pages/teens-delivery.767b2c0c453d.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/partner-pages.min.845212.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/partner-pages.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/routes/site-adults-delivery.d027512ba43b.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/routes/site-teens-delivery.d70b69057bb2.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/site-shell.min.7f177f.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/site-shell.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/css/styles.min.css` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-1024.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-1024.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-128.6c12d5.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-128.976e70.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-128.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-128.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-256.35dfb6.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-256.905957.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-256.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-256.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-512.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-512.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-64.40d9db.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-64.6f668c.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-64.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-64.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-96.c54730.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-96.f24bf2.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-96.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo-96.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo.ac7ef1.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo.png` | Unchanged by both clean builds; no output delta. |
| `assets/img/brand/sensei-sandy-bjj-logo.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/Mitsuyo_Maeda_c1910.fdc1c8.jpg` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/Mitsuyo_Maeda_c1910.jpg` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/Portrait_of_late_Mr._Kano.d7c6f0.jpg` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/Portrait_of_late_Mr._Kano.jpg` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/carlos-gracie-jr.dc6bbd.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/carlos-gracie-jr.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/carlos-gracie.9ba5d5.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/carlos-gracie.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/helio-gracie.23b5ef.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/helio-gracie.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/josh-griffiths.e19274.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/josh-griffiths.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/kenny-florian-portrait.a7d6f1.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/kenny-florian-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/kenny-florian.cbd560.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/kenny-florian.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-carlos-gracie-jr-portrait.2a9f64.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-carlos-gracie-jr-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-carlos-gracie-sr-portrait.fbf38d.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-carlos-gracie-sr-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-helio-gracie-portrait.f9aa0e.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-helio-gracie-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-jigoro-kano-portrait.b587a7.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-jigoro-kano-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-josh-griffiths-portrait.c2c302.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-josh-griffiths-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-kenny-florian-portrait.b84c46.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-kenny-florian-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-mitsuyo-maeda-portrait.c8c2ab.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-mitsuyo-maeda-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-roberto-maia-portrait.e3a5cb.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-roberto-maia-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-sandy-jose-nunez-portrait.8070ab.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/lineage-sandy-jose-nunez-portrait.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/roberto-maia.4382e5.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/roberto-maia.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/sandy-jose-nunez.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/sandy-nunez-josh-griffiths-black-belt-promotion.6df9e7.webp` | Unchanged by both clean builds; no output delta. |
| `assets/img/lineage/sandy-nunez-josh-griffiths-black-belt-promotion.webp` | Unchanged by both clean builds; no output delta. |
| `pricing.md` | Unchanged by both clean builds; no output delta. |
| `schedule.html` | Schedule alias to the existing schedule index. |
| `sitemap-blog.xml` | Unchanged by both clean builds; no output delta. |
| `sitemap-core.xml` | Unchanged by both clean builds; no output delta. |
| `sitemap-glossary.xml` | Unchanged by both clean builds; no output delta. |
| `sitemap-locations.xml` | Unchanged by both clean builds; no output delta. |
| `sitemap-programs.xml` | Unchanged by both clean builds; no output delta. |
| `sitemap-research.xml` | Unchanged by both clean builds; no output delta. |
| `sitemap.xml` | Unchanged by both clean builds; no output delta. |

</details>

## Other local records

Docs, screenshots, scratch files, browser evidence, and the separate retained checkout are local records, not part of this release choice. They are preserved. The separate `/tmp/style-swarm-20261027-control` checkout has 51 unique source differences and remains untouched.

## Current recommendation

**KEEP all unchecked paths local.** Pick a small set of source paths for focused review. No deployment is safe while the committed mapper misses 293 public outputs from the broad overlay. After you choose a cohort, the next step is to fix and verify its exact route mapping, then prepare a narrow release for your final approval.
