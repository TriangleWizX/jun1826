# Free Intro form and layout workstream B

Date: 2026-10-29
DoD: release the Free Intro visit-request intro/form desktop layout and inline validation styling while preserving phone stacking, the committed Free Intro footer clearance, and unrelated shared action-bar behavior.

## Scope

Included:

- Wrap the visit-request heading and explanatory text in `.ss-visit-request-intro` so desktop can place the intro next to the form.
- At widths of 992px and above, render the intro in the left column and the form in the right column. Keep success/error messages across the available width.
- Style browser invalid states and dynamically inserted inline field errors for the request form.

Excluded:

- Shared `src/_includes/components/footer.njk` action-bar overlap detection.
- Lane-note typography, choice-card border, page-wide focus selector, and short-height sticky CTA rule. These were mixed into the previous CSS diff and are separate changes.
- Lighthouse/PageSpeed, keyboard behavior acceptance, and form submission.

## Persona and method record

- Coordinator: ordinary frontend implementation and release specialist fallback. The contextual selector returned `Science Historian and Communicator - James Burke` (UUID `93c24b08-9e39-4a28-9431-5d112146620c`), which is not a fit for CSS, HTML, or release engineering. The focused selector returned no suitable persona. No persona adoption is claimed.
- Master instructions: `Instructions - COMPETENCE`, UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`, source `assets/indranet-prompt-exporter/exports/index.json`; full available source reviewed, ready, no attachments. Applied observation, risk assessment, and independent evidence checks.
- Code instructions: `Instructions - CODE`, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, same source; full 1,500-character source reviewed, no attachments. Applied scoped implementation, build, and code review checks.
- Codebase graph MCP was unavailable (`Transport closed`); fallback source discovery used the repository shell and direct reads.

## Build and review evidence

- Built from clean committed `HEAD` (`d34b30fd`) plus only the two B source edits in `/tmp/free-intro-b-20261029`; no checkout or generated tree was copied from the dirty main worktree. The existing `node_modules` was symlinked.
- `npm run build` passed. Eleventy emitted 507 pages; the Free Intro inline delivery CSS was 49,308 bytes. The generated route contains the desktop two-column form rules, validation rules, and the committed 180px short-viewport rule.
- Isolated `git diff --check` passed. The source/minified CSS pair was generated in the isolated copy and copied back only for `book-free-intro.min.css`.
- `tools/browser-proof.mjs` passed at mobile and desktop viewports: both returned HTTP 200, no horizontal overflow, and no page errors.
- A repository-wide minifier was run once in the main checkout and refreshed registered minified CSS outputs from the checkout's current source CSS. Those generated outputs remain uncommitted and were excluded from this release; review them separately before any future commit. The minifier did not write the formatted CSS source files.
- Desktop screenshot review shows request intro left of the form; mobile screenshot review shows the intro and form stacked. No form data was submitted.
- Browser-use 0.1.13 was checked. The shared daemon was left untouched. A uniquely named daemon against a dedicated temporary headless Chromium endpoint loaded the local page. Programmatic `checkValidity()` did not expose inline error spans, so this interaction was inconclusive. The independent source audit confirmed the current runtime attaches invalid listeners and creates the error spans; prior same-day invalid-state evidence records native required state, first-invalid focus, and that invalid submit stayed local. No JS behavior changed in B.
- No Lighthouse/PageSpeed, keyboard acceptance, live network check, or production deployment has been performed yet.

## Release boundary

The main worktree has a broadly dirty `dist/` tree, including the Free Intro route. The release candidate must use only the generated `free-bjj-intro-tannersville-ny/index.html` from this isolated build. Preserve and hash the existing main-tree route before temporarily placing the release artifact for deployment, and restore it byte-for-byte after upload. Run the deploy helper dry-run with `--only free-bjj-intro-tannersville-ny/index.html` and verify the exact one-file payload before deployment.

The broad shared action-bar work remains excluded. Commit only the reviewed B source, minified pair, evidence report, and generated Free Intro route. Then verify the live route separately from local build evidence. Lighthouse/PageSpeed remain excluded by user instruction.

## Release and live evidence

- Commit: `59f0c062` (`fix(ui): improve Free Intro visit request form layout`), five files: Free Intro page source, page CSS and minified CSS, generated Free Intro route, and this report.
- Deploy helper dry-run selected exactly `free-bjj-intro-tannersville-ny/index.html`. Upload completed with `remote_bytes=89957`.
- The helper validated the remote predeploy archive and rotated one older verified archive (1,124,055,555 bytes). The predeploy archive remains available for rollback.
- After deployment, the saved dirty main-tree route was restored with the original SHA-256 `4c411840f22e0adda95e5f85f503eac25467a3f6c58fca94fe61c1979b7df55f` verified byte-for-byte.
- Live route returned HTTP 200 and includes the B layout and validation selectors. Isolated live browser proof passed at 390px and desktop width: no overflow and no page errors. Screenshot and JSON evidence: `evidence/2026-10-29/free-intro-form-layout-live/`.
- No form was submitted. Lighthouse/PageSpeed and keyboard acceptance were not run.

## Temporary workspace record

- Owner: coordinator; workstream: `FREE-INTRO-FORM-LAYOUT-B`.
- Path: `/tmp/free-intro-b-20261029/`; created 2026-10-29; purpose: clean-source isolated production build and responsive browser proof.
- Dependencies: shared `node_modules` symlink only; no copied virtual environment. Browser profile: `/tmp/free-intro-b-chrome-profile/`, dedicated temporary Chromium profile.
- Measured build workspace: 1.6 GiB. Closeout trigger: after independent review, release decision, and evidence preservation. Stop browser/server processes and remove these exact temp paths during closeout.
