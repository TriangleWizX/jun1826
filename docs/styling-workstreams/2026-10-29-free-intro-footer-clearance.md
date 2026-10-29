# Free Intro sticky CTA footer clearance

Date: 2026-10-29
DoD: prevent the page-specific Free Intro sticky CTA from covering footer content while preserving its top-of-page behavior and the shared action bar.

## Change

- Reused the shared footer observer in `src/_includes/components/footer.njk` to set `is-footer-visible` on the Free Intro page CTA when the footer enters the existing observer boundary.
- Reused the same state in the shared no-`IntersectionObserver` fallback through its existing scroll/resize updates.
- Added a Free Intro page-owned rule in `src/assets/css/pages/book-free-intro.css` to hide that CTA at the phone breakpoint when the footer is visible. Regenerated `book-free-intro.min.css` with the repository CSS minifier.
- The first isolated candidate used a separate observer in the page file. Review showed the existing shared observer already owns this state, so the integrated implementation is smaller and avoids a duplicate observer. No candidate page script was applied.

## Verification

An isolated Eleventy 3.1.6 build rendered the current source; only the temporary output was changed. The test used Firefox on localhost and blocked all off-origin requests. It did not submit forms.

| Width | At page top | At footer | Overlap |
|---:|---|---|---|
| 320px | CTA visible | CTA hidden | No |
| 390px | CTA visible | CTA hidden | No |
| 767px | Existing CTA hidden state preserved | CTA hidden | No |
| 768, 991, 992, 1440px | Existing CTA hidden state preserved | Existing hidden state preserved | No |

With `IntersectionObserver` removed in a separate 390px run, the existing scroll/resize fallback also set `is-footer-visible` and hid the CTA. The shared `.ss-mobile-actionbar` matched its prior state across the tested widths. All tested routes returned HTTP 200; there were no page JavaScript exceptions, failed requests, or off-origin requests. Firefox logged font sanitizer messages for local font files in the static preview; those do not affect the measured CTA geometry.

The minified CSS pair check passed for Kids, Teens, and Free Intro. `git diff --check` passed on all changed source/CSS pairs. The main `dist/` was not written. This was an isolated Eleventy output check, not the complete fingerprinted production build or a live deployment.

## Evidence

- [Integrated responsive and fallback measurements](evidence/2026-10-29/free-intro-footer/integrated-results.json)
- [Worker candidate report](evidence/2026-10-29/free-intro-footer/candidate-report.md) and [candidate patch](evidence/2026-10-29/free-intro-footer/candidate.patch) are retained for provenance; the candidate is not the implementation that was integrated.
- Original source hashes before integration: Free Intro page `src/free-bjj-intro-tannersville-ny/index.html` `9eaf0edafadd02a45c69bea50aa736b504085a1aba5d2736dbc46481e6f89362`; footer component `src/_includes/components/footer.njk` `ea71e96c490074e2a110fdbe48d65ccde2bd7963fe8f0dc135f7529780baeb34`.

## Remaining release gates

The full fingerprinted build and exact deploy-path mapping must still be reviewed with the rest of the styling release. No Lighthouse or PageSpeed check was run.

## Production CSS and resize-boundary review — 2026-10-29

An independent release/accessibility audit found a missed state boundary in the earlier implementation: the shared footer observer measured the shared action bar, which is hidden on Free Intro, while the separate page CTA is 66px tall. The prior preview covered the page top and footer end but not the point where the footer first entered the CTA's covered area. A second production-build check found PurgeCSS removed the new `.is-footer-visible` rule because the production builder consumes `book-free-intro.min.css` and the runtime class was not explicitly safelisted.

The isolated candidate from clean `c10d13a9` now:

- Measures the page CTA's rendered height while the CTA is hidden, then restores its prior classes.
- Uses the larger of the shared-bar and page-CTA heights as the footer observer's bottom clearance.
- Recreates the footer observer when the viewport crosses the 768px phone breakpoint, so a page loaded at tablet/desktop width receives the correct phone clearance after resize.
- Shows the page CTA while the mobile Free Intro funnel is active and hides it before footer content enters the CTA region.
- Preserves the already-shipped 180px short-viewport behavior and adds `is-footer-visible` to the builder's runtime safelist.

The candidate changed only `src/_includes/components/footer.njk`, `src/assets/css/pages/book-free-intro.css`, its generated minified pair, and `tools/build-free-intro-styles.mjs`. The main worktree has other dirty hunks in these files; the release candidate was built from clean `c10d13a9` plus only the reviewed changes.

### Verification

- `npm run build` passed in the isolated candidate. It generated the Free Intro page with an inline delivery stylesheet containing both the 180px rule and `.ss-mobile-sticky-cta.is-footer-visible { display: none !important; }`.
- `node tools/minify-css.mjs --check` passed for all 53 source/target pairs.
- `npm run qa:volatile-facts` passed with 577 files checked.
- Browser-use 0.1.13 connected to dedicated headless Chrome 151 on a unique local CDP port. The preview served only the isolated build, and off-origin HTTPS requests were blocked.

| State | Browser result |
|---|---|
| Loaded at 780px, then resized to 390×844 | CTA observer remeasured; CTA rendered at 66px |
| 390×844, scrollY 4780, footer top 931px | CTA remained visible; 66px height |
| 390×844, scrollY 4820, footer top 891px | `is-footer-visible` applied; CTA computed `display:none` |
| 320×640 | CTA rendered at 66px; document had no horizontal overflow |
| 1440×900 | CTA remained hidden; document had no horizontal overflow |

Rendered screenshots are retained in `evidence/2026-10-29/free-intro-footer-production/`. The final isolated generated page SHA-256 was `f40c2263eda3ce3a17713207f44b1301c1718ce5b0ebed30d584c4dc0dfcf5b2`. Its inline stylesheet was 48,215 bytes; the builder's generated delivery CSS file is not linked by the HTML because the CSS is inlined. The deploy dry run therefore must select only `free-bjj-intro-tannersville-ny/index.html`.

### Persona and method record

- Coordinator role: ordinary responsive CSS/release specialist fallback. The selector returned no suitable persona. The ranked static-site-generator prompt describes generating Markdown sites; the Jinja Template Titan entry links to a prompt UUID absent from the export, so neither was claimed as adopted.
- Coordinator instructions: `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, source `assets/indranet-prompt-exporter/exports/index.json`; readiness `ready`, no attachments. The complete available text was reviewed. Applied observation, risk assessment, evidence checks, and iterative problem solving; its generic wording is not treated as specialized CSS guidance.
- Independent read-only workstream: Free Intro footer obstruction/release QA auditor. The worker rejected the static-site-generator candidate as a fit and used an ordinary specialist fallback. It reviewed `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, from the same index; attachments `none`. It identified the 66px observer-boundary gap and the need to restore the 180px rule.
- Applied `design-taste-frontend` audit-first guidance from `/home/twizss/.codex/skills/design-taste-frontend/SKILL.md`: preserve the existing CSS/Bootstrap system, keep the adjustment route-scoped, and inspect rendered phone and desktop states. Applied `browser-use` from `/home/twizss/.codex/skills/browser-use/SKILL.md` with a dedicated profile and local preview; no recording or signed-in user profile was used.

No Lighthouse/PageSpeed, keyboard-route, site-wide contrast, physical-device, spoken AT, or owner acceptance was performed. Keyboard behavior remains shelved for the owner SOP.

## Release closeout review — 2026-10-29

The focused commit and live release were **not performed**. The isolated candidate directory recorded in the workspace inventory no longer contains a usable source snapshot: `src/_includes/components/footer.njk` is a single compressed line, and the directory has no `.git` metadata. Its size grew to 1.7 GiB, including a 180 MiB browser profile. No browser or preview process and no open-file holder remained. The candidate workspace was removed after retaining this report and the four production screenshots in `evidence/2026-10-29/free-intro-footer-production/`.

The current shared-tree diff is not a safe substitute. Its `footer.njk` delta combines Free Intro footer clearance with a broad action-target overlap detector that affects shared mobile action-bar behavior. Its page stylesheet also combines the clearance selector with unrelated typography, focus, request-form layout/validation, and short-viewport changes. The minified pair and generated `dist/` are broadly dirty. A clean commit and exact one-route deploy payload cannot be reconstructed from those mixed changes without isolating and re-verifying the shared behavior.

Release status: **locally verified behavior; source integration and production deployment remain unverified**. Do not claim the sticky CTA footer fix is live. A future release needs an independently reviewed narrow patch, a fresh isolated production build from the accepted source, exact `free-bjj-intro-tannersville-ny/index.html` payload proof, and live verification.
