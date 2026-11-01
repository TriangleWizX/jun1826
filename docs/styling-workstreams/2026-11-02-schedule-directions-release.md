# Schedule directions and youth-link release — 2026-11-02

**Status: deployed and live-verified.** This closes one Schedule release slice in the active dirty-worktree goal. It does not reconcile or release the remaining dirty tree.

## Persona & Expert Framework

- The contextual `persona_quick.py --plan --json` selection returned `no_suitable_persona` for this accessibility and frontend release task. The coordinator used the ordinary specialist fallback **Scoped Schedule Release Coordinator**; no catalog persona adoption is claimed.
- The plan selected ready **Instructions - CODE**, UUID `25a8fe8a-c164-4e8e-8236-3a6585bfa165`, source `assets/indranet-prompt-exporter/exports/index.json`. Its full source was reviewed earlier in this goal. Applied methods: inspect exact source and generated output, keep the release path narrow, run focused checks, and verify the deployed page separately.
- An independent read-only review used the ordinary fallback **Schedule Link Hit-Area Release Auditor** with the same instructions. It confirmed that the old route could not be used as output proof, the unrelated dirty Schedule hunk must stay out, and a fresh committed-source build plus exact route mapping was required.

## Workstream contract

`SCHEDULE-DIRECTIONS-RELEASE-20261102` covered the committed Schedule directions target and youth-link changes. The build used a clean detached worktree at `a5533a5d`; it did not use or alter the root `dist/` tree. The dirty `src/schedule.html` contact-card/video-session hunk was excluded.

The deployed page includes the already committed 44px `.ss-schedule-target` rule, the Kids/Teens links after the class time, removal of the duplicate standalone Kids/Teens card links, and the matching calendar link labels. The final route references `schedule-month-calendar.js?v=20261031-class-page-links-inline-youth`. The live JS file already matched the clean build byte-for-byte, so the deploy payload did not include it.

## Build and local checks

- `npm run build` passed in the clean candidate. The generated route SHA-256 was `d6cb1f07db90c041fc9a595ff9ebee00c1493fd9ef293daf287b8b091bf38efa`.
- `npm run qa:schedule` passed. `npm run qa:volatile-facts` passed across 578 files.
- Commit `24bb09b` updates the Schedule handoff QA for the mobile date-card UI and keeps an already-expanded date open while inspecting it. `npm run qa:schedule-booking` passed against the clean output using that committed QA script; it checked lane/date/time and the mocked Cal notes without submitting a real form.
- Isolated headless browser checks at 320×720, 390×844, and 1440×1000 returned HTTP 200, no horizontal overflow, and no page errors. The three scoped Schedule target links measured 44px, 44px, and 51.8px on phones, and 44px each at desktop.
- A focused 390px runtime check confirmed five weekly rows place `Kids` and `Teens` links after the time, the next-class card renders both audience links, the Free Intro link carries the youth lane/date/time, and there are no old separate “Kids classes” or “Teen classes” links.
- Two earlier handoff-QA attempts exposed stale locators: the committed version counted both hidden desktop and visible mobile calendar controls; the mobile-aware version toggled closed a date that was already expanded. The committed correction addresses those causes without relaxing the assertions.

Local screenshots and JSON are in [the evidence folder](evidence/2026-11-02/schedule-directions-release/).

## Deployment and live verification

- The deploy mapper dry run with `--commit 95c48890 --only schedule/index.html` listed exactly one file: `schedule/index.html`.
- The deploy helper verified one existing valid backup and no invalid or cleanup candidates, then created a fresh rollback archive at `/home/sensdapt/senseisandy-predeploy-20261101T123003Z.tar.gz` (`14,578` files).
- Upload completed for `schedule/index.html` at `132,177` bytes.
- A fresh live fetch returned HTTP 200. The server expands SSI outside `<main>`, so the whole response is larger than the build file; the extracted `<main>` matched the candidate byte-for-byte (32,294 bytes; SHA-256 `b9c14f601063e46a2f363482a85e0a6034ef0f202a6c42fe05d93f869c798c44`). The versioned live calendar JS SHA-256 matched the clean build: `9fbe94b59c1aeac5a860fc05227cdaec0475f47b4ff7134a21fd59598d753540`.
- Live headless checks at 390px and 1440px returned HTTP 200 with no overflow, page errors, or failed requests. The inline 44px target rule is present; the five youth rows carry Kids/Teens links after the time; the duplicate standalone labels are absent.

## Preserved scope and remaining work

The main checkout’s dirty `dist/` and unrelated dirty source paths remain intact. No generated file was copied into or staged from root `dist/`. Keyboard acceptance, site-wide contrast, Lighthouse, and PageSpeed were not run. The broader dirty-worktree reconciliation and release goal remains active.
