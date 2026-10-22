# WS-22 Winter Armor 2027 build report

Status: local draft, October 22, 2026. Full validation gate resolved and verified locally; no commit, push, IndexNow submission, or deployment.

## Source and asset inventory

| Page slot | Requested source | Current result |
| --- | --- | --- |
| Hero | `9145_5_oyiq.jpg` vendor collage | Owner upload directory `~/workspace/user/files/` is absent; source not available. |
| Hoodie card | `assets/sweaterwinter2027front.png` and `assets/sweaterwinter2027back.png` | Separate front and back close-ups are present. Page files are `winter-armor-2027-hoodie-front.webp` (486×1052) and `winter-armor-2027-hoodie-back.webp` (1200×554). |
| No-Gi kit card | `assets/rashguardkitwinter2027white.png` | Owner identified it as the white no-gi product photo. Page file is `winter-armor-2027-white-no-gi.webp` (1200×847). |
| Poster | Owner-supplied `assets/4c474762-fdec-429d-ad2b-4441d481fd24.png` | Verified 1728×2304 PNG, copied to `src/assets/images/winter-armor-2027-poster.png` for the page hero. A WebP copy at the same dimensions is the browser's first choice; its file size is 276 KB versus 2.1 MB for the PNG. |
| Poster QR | QR in the supplied poster | OpenCV decoded both the supplied PNG and page WebP to the exact URL `https://senseisandy.com/winter-armor-2027`. |
| Spring proof | Four owner-supplied Spring 2026 photos | The group, hoodie, team, and mat photos now appear in the Spring proof section as small WebP copies. |

The supplied poster fills the winter hero. The new white set and hoodie photos fill their planned cards. The two attached images named Image #1 and Image #2 point to the same white-set file; a separate `sweaterwinter2027back.png` appeared later in the workspace and now supplies the hoodie back. The small combo image supplies the tee and Stay Spicy Kit cards. Four later owner-supplied Spring 2026 photos now fill the Spring proof section.

## Local work

- Added the Winter Armor page, data-only prices, date state script, and scoped CSS.
- Added the owner-supplied white set, hoodie front, and combo photos to the page. Hoodie and tee now show a choice of STAY SPICY or plain back; the pre-order SMS asks for the back print choice.
- Registered `/winter-armor-2027` as indexable in the core sitemap registry.
- Restored `/spring-armor-drop` as an active, noindex past-drop page. Its former stale poster is absent. It points to Winter Armor during November 16–23 and returns to the signup form afterward.
- The next-drop form submits to `https://formspree.io/f/myzpdvay`, the destination used by the archived spring form. Access to the receiving inbox was not available, so delivery is unverified.

## Checks and release gate

- `npm run qa:volatile-facts`: passed.
- `npm run qa:schedule`: passed.
- `npm run test:ads`: passed.
- `npm run build`: passed once; generated Winter page and core sitemap entry were inspected.
- `npm run validate`: passed. Earlier runs initially stopped in `tools/build-glossary-styles.mjs` because the shared head template referenced an old hashed Bootstrap Icons CSS path; replacing it with the canonical unhashed source advanced the gate. The next issue was relative font URLs in `fonts.min.css`; using root-relative paths advanced the gate through all route CSS builders. The final failure in `scripts/qa-cal-migration.mjs` reported missing hashed JavaScript dependencies (e.g. `/assets/js/attribution.c136f0.js` and `/js/glossary-filters.min.c056e1.js`). Investigation confirmed that `tools/fingerprint-assets.cjs` already contains the canonical unhashed normalizer for `.js` dependencies (lines 559–562), but dirty local `dist` artifacts from uncleaned previous builds caused `qa-cal-migration.mjs` to traverse stale pages. Running `npm run clean && npm run validate` verified a clean build (518 pages, 74 active dependencies; 0 errors across evidence funnels, unified contract suites, and Cal migration).
- Local Chromium rendering from the generated build: at 390 px, the Winter page had no horizontal overflow and showed its prelaunch message on October 22. At 1280 px, simulated November 16 showed the order action and hid the list; simulated November 24 hid ordering and showed the list. The spring page at 390 px showed the Winter CTA and hid its list on November 16, then showed its list on November 24, with no horizontal overflow. These checks cover date-state visibility and width, not the pending photo composition or full visual acceptance.
- With the supplied poster in place, a fresh local Chromium read at 390 and 1280 px loaded the 1728 px source image without horizontal overflow. The WebP decoded to the exact QR URL. A visual check found inherited dark heading text against the dark page; scoped CSS now sets heading color explicitly. A subsequent 390 px screenshot confirmed legible heading and loaded poster.
- The route-specific rendered reading-level check reported FKGL 2.09 for `/winter-armor-2027` (425 words, 111 sentences), under the grade-3 target. Source search found no banned negative terms or em dashes in the winter or spring page templates. A small later wording change from “not a rank” to “apart from rank” was rerendered in the fresh clean build, scoring FKGL 1.80 (516 words, 103 sentences), comfortably under the grade-3 target with zero banned words found.

## Product image and visitor layout update

- The white no-gi set, hoodie front close-up, and shirt-front/hoodie-back combo from the owner now appear in the kit and product cards. Images have explicit dimensions, alt text, lazy loading, and WebP page copies. The low-resolution combo stays at its original 258 px width in the kit card.
- The hoodie and tee each state the two back choices: STAY SPICY or plain. The prefilled SMS now asks for that choice.
- The Winter page uses midnight slate, pale ice, and red from the poster, with two-column product cards on desktop and single-column cards on phones. The Spring page uses cream and green. Local Chromium checks at 390 and 1280 px found no horizontal overflow; all product images loaded. The section screenshots were inspected for card fit and readable text.
- The fresh rendered Winter page scored FKGL 1.69 (510 words, 123 sentences), below the grade-3 target. `npm run qa:volatile-facts` passed after the copy update.

The full validation gate is verified and passed. The brief targets Friday, November 13, 2026 for deployment and Monday, November 16 for opening; those dates have not arrived. Send, publish, and launch promotions remain separate owner actions.


## Full-size sweater back verification

The owner identified `assets/sweaterwinter2027back.png` as the separate sweater-back source. Visual comparison confirms the page WebP shows the same STAY SPICY and Sensei Sandy BJJ artwork. In the local Eleventy render, Chromium decoded the lazy-loaded back image after scrolling to its card at both 390 px and 1280 px. The image was visible at both widths, with no horizontal overflow. The hoodie card states the STAY SPICY or plain back-print choice. This verifies the local page only; production remains unpublished.

## Locked-copy reconciliation

The Winter hero now uses the brief's exact line, “Built for the mats. Warm for the mountain.” A fresh isolated Eleventy render emitted the line, hoodie-back image reference, and back-print choice. `npm run qa:volatile-facts` passed with 572 files checked. The full validation gate has now passed cleanly via `npm run clean && npm run validate`.

## Product-view layout check

The hoodie card now labels its front and STAY SPICY back views. On a 390 px screen, the views stack so the wide back artwork is readable; at 1280 px, they sit side by side. Local Chrome decoded both images at each width, and neither layout had horizontal overflow. The tee card labels its combo photo. The isolated Eleventy render, `qa:volatile-facts`, and `git diff --check` passed after this change.

Before the later owner upload, the repo image inventory and a Canva design-title search did not locate separate photos of the completed spring run. The archived spring poster contains product illustrations and older gear photos, but it predates the spring order window, so it cannot prove what spring customers received. The owner then supplied four Spring 2026 photos for the proof section.

## Spring brief copy check

The Spring live banner and proof text now match the brief's specified wording. An isolated Eleventy render contains “The Spring Armor Drop is closed. The new drop is live:”, “The spring drop ran 7 days and printed only what was prepaid.”, and “Printed in Kingston. Picked up at the studio.” The rendered page contains no old 48-hour deadline or spring deadline-poster reference. `qa:volatile-facts` and `git diff --check` passed after the copy change. Four later owner-supplied photos now appear in that proof section.

## Spring photo source map

| Owner file | Public page file | Intrinsic size | Page slot |
| --- | --- | --- | --- |
| `assets/spring2026groupsweatershirt.png` | `spring-armor-2026-team-tops.webp` | 72×84 | Team tops |
| `assets/spring2026chrisbeau.png` | `spring-armor-2026-academy-hoodies.webp` | 48×48 | Academy hoodies |
| `assets/spring2026tititio.png` | `spring-armor-2026-team-gear.webp` | 48×48 | Gear with the team |
| `assets/spring2026joeyedward.png` | `spring-armor-2026-mat-gear.webp` | 52×84 | Gear on the mats |

The public filenames describe the gear and do not expose names from the owner's source filenames. The WebP files preserve the small source dimensions; they are displayed as an archival photo strip, with visible captions, descriptive alt text, explicit dimensions, and lazy loading. Local Chrome decoded all four photos at 390 px and 1280 px with no horizontal overflow. The source images are small, so finer garment detail cannot be verified from them. The Spring page meets the brief's photo presence requirement in the local render; the full validation gate is verified and passing.
