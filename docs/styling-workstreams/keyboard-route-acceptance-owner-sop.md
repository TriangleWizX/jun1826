# Owner SOP: Keyboard acceptance for Sensei Sandy pages

**Purpose:** Manually verify keyboard access after the responsive styling release. This procedure covers visible focus, shared navigation, Schedule controls, page-specific controls, and sticky actions. It does not include Lighthouse, PageSpeed, site-wide contrast, screen-reader speech, or testing on a physical phone or tablet.

**Owner-run target:** Production keyboard changes from commits `d689e37`, `b359bf9`, `8fa2cf7`, `9e451b9`, and `6da8cc6` were deployed and browser-verified on 2026-10-30. The final 200% Schedule PageDown result is recorded in [the acceptance report](evidence/2026-10-30/keyboard-sop-full/acceptance-report.md) and [the focused recheck](evidence/2026-10-30/keyboard-sop-full/schedule-focus-recheck.md). The owner accepts browser-generated keyboard input instead of physical keyboard input for this SOP; physical HID testing is out of scope. Keep the pointer untouched and use keyboard events only for navigation and activation. Record the tester, date, browser, route, viewport, zoom, and each result below.

## Set up

1. Test the deployed release after the deployment URL is confirmed. If testing a preview, use a current-source preview and record its URL and build/commit. Do not treat old `dist/` output as current-source proof.
2. Use desktop Chrome or Firefox with owner-approved browser-generated keyboard input. Physical keyboard input is not required. Keep the pointer untouched during each pass. Start at 100% zoom; repeat the reflow-sensitive checks at 200%.
3. Open DevTools only if needed to record viewport dimensions. For breakpoint checks, set the CSS viewport to **767px, 768px, and 769px**. This is browser viewport sizing, not native zoom.
4. Do not send real booking, contact, or availability submissions. Stop before any action that would transmit data or create an external side effect.
5. Record browser/version, date, environment, release identifier, viewport width, zoom, and tester.

## Shared navigation pass

Run this pass on the Home page, Free Intro page, Schedule page, one Kids or Teens page, one Adults page, one glossary page, one blog article, one pricing page, one visitor/location page, and one form page if present in the release.

For each page:

1. Reload, then press **Tab** once. Confirm the skip link becomes visible and receives focus. Press **Enter** and confirm focus/reading position reaches the main content.
2. Reload and use **Tab** and **Shift+Tab** through the header. Confirm the focus indicator remains visible, follows a sensible order, and never becomes trapped.
3. If the mobile menu is available at the chosen width, focus its toggle and press **Enter** or **Space**. Confirm it opens, its expanded state is conveyed in the UI, and focus moves into the menu. Press **Tab** through links, then **Escape**. Confirm the menu closes and focus returns to the toggle.
4. At desktop width, keyboard-open and close the Classes dropdown. Confirm its links can be reached with **Tab** and the menu does not close before a link can be activated.
5. Tab to the primary action and confirm the focused link/button text and destination are clear. Do not activate a booking or external submission.
6. Continue to the footer. Confirm every footer link and action can receive visible focus and can be activated with **Enter** or **Space** as appropriate.

## Schedule keyboard pass

At **767px, 768px, and 769px** CSS viewport widths:

1. Open `/schedule/` and keyboard-tab to the date selector. Record the focused date and the selected date state.
2. Press **ArrowLeft/ArrowRight** and confirm focus moves one day. Press **ArrowUp/ArrowDown** and confirm focus moves one week.
3. Press **Home/End** and confirm focus moves to the first/last day of the displayed week.
4. Press **PageUp/PageDown** and confirm the calendar moves a month while focus remains on a valid date.
5. At the mobile layout, use **Enter** or **Space** on a date and confirm its class details expand/collapse and the selected day remains clear.
6. Repeat across each breakpoint transition without using the pointer. Confirm focus stays on the corresponding date or a clear fallback date when the layout changes.
7. If a key does something different, record the exact width, focused date, key, resulting focus, visible state, and screenshot. Do not infer a failure solely from a changed grid layout.

## Sticky action and form focus pass

1. On Free Intro and other pages with a sticky action, keyboard through the page until a control near the bottom is focused.
2. Scroll with **PageDown** while keeping keyboard-only interaction. Confirm the focused control is not covered by a sticky action bar and its focus indicator stays visible.
3. Move focus into the footer. Confirm page-specific and shared sticky actions hide or move so they do not cover footer links.
4. At **200% native browser zoom**, repeat on Home, Schedule, Free Intro, and Visit. Use the browser's zoom menu/shortcut; confirm the CSS viewport narrows as expected. Check no horizontal page scrolling is needed to reach the main action or focused control.
5. For forms, tab through labels, inputs, choices, and buttons. Confirm each field has a visible label and focus state. Do not submit a live form. If a safe local test form is supplied, record that environment before testing validation.

## Record results

Copy this table for each route and test pass:

| Route | Width / zoom | Check | Pass / fail / not applicable | Evidence or exact failure | Follow-up owner |
| --- | --- | --- | --- | --- | --- |
| `/visit` | Native 200%; 503×341 CSS px, DPR 2.5 | Generated Tab to Alley Bootcamp link; generated Tab to footer Text Sandy action, then PageDown, ArrowUp ×8, ArrowDown ×2, PageUp; confirm visible focus and sticky clearance | Pass for Visit sticky-bar clearance; PageDown visibility passed separately on Home and Schedule | Commit `2462f0c9`, Chrome 151.0.7922.137. Alley link y=160.66–180.66, bar top 277.6. Footer link y=257.63–324.10 with visible 2px green outline and 4px shadow; bar top 341.6 and hidden. `visualViewport.scale=1`; no horizontal overflow; HTTP 200 with both listeners present. This row records sticky clearance at the captured states; separate PageDown focus-visibility evidence is in `evidence/2026-10-30/keyboard-sop-full/acceptance-report.md`. No form or outbound action activated. | Coordinator |

For failures, include a screenshot with the focused element visible, browser and release details, exact key sequence, and expected versus observed focus/state. Do not include student/customer information in screenshots.

## Acceptance and reporting

- Mark a check **pass** only when the keyboard action, visible focus, and resulting state are all observed.
- Mark unavailable or unsafe actions **not tested** and explain why; do not count them as passes.
- Report route coverage separately from shared-component coverage. A successful sample does not establish that every page route passed.
- Send the completed results to the site owner with the release identifier and unresolved failures. This manual procedure does not establish screen-reader conformance, site-wide contrast compliance, or PageSpeed/Lighthouse performance.
