# Thursday youth and teen Gi schedule update

User-approved schedule update: Thursday's 5:00 PM youth and teen small-group class has changed from No-Gi to Gi.

Canonical sources and data feeds:
- `src/_data/schedule.json`: Thursday youth slot updated to `thursday-youth-teen-gi` (`format: "Gi"`).
- `data/schedule.js`: Youth group class days updated so Thursday maps to the Gi slot with Tuesday; auto-generated components (`schedule-compact.html`, `schedule-full.html`, `schedule-studio-bento.html`) rebuilt via `tools/build-schedule.mjs`.
- `src/assets/data/schedule.json` and `src/assets/data/ssot-schedule.json`: Thursday 17:00 entry updated to Gi.
- `src/assets/js/schedule-data.js`: Thursday youth entry format set to Gi.
- `src/schedule.html`: Thursday slot badge and slot name updated to Gi.
- `src/_includes/schedule-master.html`: Thursday day note updated to `Gi`, youth slot to `Youth + Teen · Gi`.
- `src/partials/voice-faq-schedule.html`: Updated youth schedule description to No-Gi Monday/Wednesday and Gi Tuesday/Thursday/Friday.
- `src/blog/index.html`: Schedule teaser updated to list Thursday under Gi for youth.
- `src/_data/fall-practice-control.json`: Updated format notes to include Thursday Gi.
- `src/bjj-classes/*/index.html`: 22 town landing pages updated to reflect No-Gi Monday and Wednesday, and Gi Tuesday, Thursday, and Friday.

Validation:
- `npm run qa:schedule`: Automated schedule audit passed with zero banned strings.
- `npm run qa:volatile-facts`: Volatile operational fact audit passed across 1100 files.
- `npm run qa:unified`: All 15 tests passed across Structural, Link & Route, Contract & Governance, and Performance & Media suites.
- `npm run qa:cal-migration`: 482 generated pages and 75 dependencies passed.
- `npm run qa:evidence-funnel` & `npm run qa:evidence-page`: Evidence funnel and page records passed.
- `npm run test:ads`: 35 tests passed.
- `tmp/calendar-check.mjs`: Playwright browser suite passed across desktop (1440px), mobile (390px), small mobile (320px), and no-JS fallback.

Deployment scope:
- Primary schedule files: `schedule/index.html`, `schedule.html`, `assets/data/schedule.json`, `assets/data/ssot-schedule.json`, `assets/js/schedule-data.js`.
- Rollback recommendation: revert commit to restore Thursday youth No-Gi configuration and rebuild `dist`.
