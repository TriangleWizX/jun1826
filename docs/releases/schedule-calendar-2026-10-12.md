# Schedule calendar release

The schedule now shows class times and names within a Sunday-first month calendar. On small screens, date buttons show counts and the selected date shows full class details. The weekly schedule stays open when JavaScript is unavailable.

The renderer reads escaped canonical schedule JSON. It handles dated women's sessions, closures, and special events before recurring classes. Dates use UTC civil arithmetic; today is derived in New York time. No new schedule facts were added.

Checks: isolated Eleventy build, schedule QA, volatile-fact QA, installed Chrome at 1440, 390, and 320 pixels. Exercised November 7 and 28, Thanksgiving closure and open mat, month/year boundaries, arrow and PageDown keys, today navigation, no-JavaScript fallback, page errors, and horizontal overflow. Reviewed desktop and phone screenshots.

Release allowlist: schedule/index.html, schedule.html, assets/js/schedule-month-calendar.js, assets/css/pages/schedule-month-calendar.css. CSS and JS URLs carry a release query to refresh cached assets.

Rollback: revert the release commit and deploy the same four paths from a fresh build. Preserve unrelated work and the existing .htaccess edit.
