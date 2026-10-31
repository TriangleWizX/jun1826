# Schedule focus indicator recheck — 2026-10-30

## Production baseline before fix

- Route: `https://senseisandy.com/schedule/`
- Browser: isolated Chrome 151.0.7922.137 through Browser Use 0.1.13 and loopback CDP.
- Zoom: Chrome native Page Zoom at 200% in the task-owned temporary profile; `devicePixelRatio=2`, `visualViewport.scale=1`, CSS viewport 756×406.
- Input: browser-generated Tab to “Reserve Free First Visit”, then PageDown. No link was activated and no form was submitted.
- Before PageDown, the CTA bounds were y=321–383. PageDown moved `scrollY` from 0 to 313 and kept the same element at y=8–70 with `:focus-visible` true.
- The focused CTA computed `outline` as `rgb(251, 250, 248) none 3px` and `box-shadow` as `none`. The screenshot shows the CTA in view without a distinct focus ring.
- Baseline screenshot: [schedule-focus-after-pagedown-before-fix.png](schedule-focus-after-pagedown-before-fix.png).

## Source diagnosis and correction

The clean source [schedule.css](../../../../../src/assets/css/pages/schedule.css) contains a complete `:focus-visible` outline rule for the Schedule hero CTA. It is valid CSS and should produce a solid outline. The production browser nevertheless reported `outline-style: none` for the focused CTA at this zoom and viewport. The earlier diagnosis that a color-only outline shorthand caused the failure was incorrect.

The focused CTA rule now adds a paper-colored shadow ring outside the existing dark outline. This gives the CTA a second visible focus edge if another rule suppresses the outline style. It changes only this Schedule hero CTA focus state.

## Local built-candidate verification

- Build: `npm run build` completed successfully in `/tmp/keyboard-schedule-focus-200-20261030/` from clean base `4b499b7` plus the focused CSS patch. The generated Schedule CSS is inlined into `dist/schedule/index.html`.
- Generated route SHA-256: `ffb4b9137f0f67b9e6256cf87d6ff055fdac747559251ab440946b35d743e40f`.
- Browser: Browser Use 0.1.13 attached to task-owned headless Chrome through loopback CDP; off-origin DNS resolution was blocked.
- Viewport: 756×406 CSS px, DPR 2, `visualViewport.scale=1`. This emulates the production geometry and is not native browser zoom.
- Generated input: Tab reached the CTA at tab stop 1; PageDown reached the document and moved `scrollY` from 0 to 232 while keeping the same link focused and `:focus-visible` true.
- After PageDown, the CTA bounds were x=234, y=7.73, width=273.03, height=50 CSS px. Computed outline was `rgb(33, 29, 24) solid 3px`; computed box shadow was `rgb(251, 250, 248) 0px 0px 0px 5px`.
- The mobile action bar began at y=330, with no overlap. Document scroll width was 741px against a 756px viewport.
- Candidate screenshot: [schedule-focus-after-pagedown-after-fix-local.png](schedule-focus-after-pagedown-after-fix-local.png).

## Post-deployment verification

Pending exact deploy mapping, deployment, and production browser recheck at native 200%. Record the deployed response/hash, browser/version, native zoom, viewport, generated keys, resulting focus and geometry, computed outline and shadow, sticky-bar overlap, and screenshot here.
