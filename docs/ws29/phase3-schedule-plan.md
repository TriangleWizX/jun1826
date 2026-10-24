# WS-29 Phase 3a plan — Schedule on phones

**Scope:** `/schedule` only, in the isolated `/tmp/ws29-phase3-schedule` worktree at Phase 2 commit `8a42c09`. Later Phase 3 families, CI wiring, deployment, and production proof are separate.

## Persona & Expert Framework

The contextual selector returned `no_suitable_persona`, with frontend and accessibility uncovered. Its generic COMPETENCE instructions do not provide a schedule UI method, so no exported role or instruction asset is adopted. The working lens is an ordinary responsive frontend and accessibility specialist. The Codebase Memory graph identified the calendar functions; Context7 MDN guidance confirms `display: none` removes the desktop table from the phone accessibility tree when the card alternative is visible.

## Evidence and design

Phase 0 captures show the seven-column month grid at 360px has 28–34px date controls and tiny event text. `src/assets/js/schedule-month-calendar.js` already derives all dates, closures, and slots from canonical `schedule` data. The same `classes(date)` result can render a phone card list without copying times or maintaining a second schedule source. The current selected-day cards are legible but can show classes that have already passed today.

## Bounded change

1. Keep the desktop month table and its selected-day panel unchanged at 768px and above.
2. Render one phone-only, single-column month list, one card per date, with readable class rows and 44px date/booking controls. Hide the table and selected-day panel below 768px so there is one visible schedule system.
3. Share the existing month, special-event, closure, booking-link, and date-selection data path. Keep month arrows, This month, special-date jumps, keyboard date navigation, current/selected date semantics, section IDs, and booking destinations.
4. Put a compact next-upcoming-class summary before the phone list, derived from the same canonical slots. It adds only the requested UI label; times, names, and links remain data-driven.
5. Use the existing 640/768/992/1100 breakpoint spine. Change only `src/schedule.html`, `src/assets/js/schedule-month-calendar.js`, and `src/assets/css/pages/schedule-month-calendar.css`, plus Phase 3a plan/report/evidence under `docs/ws29/`.

## Definition of done

- At 360/390/430px and sampled intermediate widths, no horizontal page overflow or sub-14px visible schedule text; normal body/class information is at least 16px.
- The phone list shows one date card per day and real class data from the existing source. The next-class summary points to a future slot and remains readable at 100% scale.
- Calendar month controls, date jumps, keyboard movement, focus, selected/current states, and class booking links work in a rendered browser.
- The 1280px schedule layout and its semantic table remain as in the Phase 0 baseline, apart from time-dependent booking availability.
- Fresh isolated build and the ordered local gates pass; screenshots and machine-readable checks cover the affected page. Generated `dist/` and hash manifest stay out of the source commit.
