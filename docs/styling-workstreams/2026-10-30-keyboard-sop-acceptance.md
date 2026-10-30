# Keyboard acceptance SOP — 2026-10-30

## Outcome

The keyboard SOP was run against production, the Free Intro sticky-action overlap was fixed, and the updated route passed a post-deployment keyboard check at the same CSS viewport and device-pixel ratio measured during the native 200% zoom run.

The production keyboard check has now also passed with actual Chrome 200% page zoom. Physical HID keyboard hardware and screen-reader speech were not tested.

## Production coverage

| SOP area | Result | Evidence / limits |
| --- | --- | --- |
| Shared navigation across nine route cohorts | Pass | Skip link, main-content focus, visible focus, traversal order, footer links, and wrap checked. |
| Mobile menu | Pass | Enter/Space, expanded state, focus entry, Escape, and focus return checked. |
| Desktop Classes menu | Pass | All four class links exposed; Escape returned focus to Classes. |
| Schedule at 767, 768, and 769 CSS px | Pass | Arrow keys, Home/End, PageUp/PageDown, Enter/Space, and selected-date focus checked across breakpoints. |
| Free Intro form | Pass | Labels, fields, choices, and submit control received visible focus. No form submitted. |
| Footer actions | Pass | Internal link Enter behavior checked. External contact and booking actions were not activated. |
| 200% reflow / sticky-action clearance | Pass | Headed production Chrome at actual 200% page zoom; all six initial Tab stops had visible focus, both Free Intro CTAs stayed in view, the booking and hero Text Sandy links cleared the sticky action by 11.84px and 11.96px, and no horizontal overflow occurred. |

The original production run found that the hero `Text Sandy` link could be covered by the fixed mobile action. The CSS scroll-padding rule alone did not fix the browser's Tab scroll position.

## Correction

The Free Intro route now listens for keyboard Tab focus. On this page, it checks whether the focused control is above the visible sticky action. If the control would be obscured or clipped, it scrolls the control into the safe viewport area. Pointer interaction is unchanged.

The route also retains this page-scoped CSS rule:

```css
@media (max-width: 767.98px) {
  html:has(body.page-book-intro) {
    scroll-padding-block-end: calc(var(--space-2xl) + var(--space-sm));
  }
}
```

The live route uses inline delivery CSS and links `mobile-foundation.114422.css`; it does not link the standalone `free-intro-delivery.f79608e60361.css` asset. The standalone CSS asset was not needed for this correction.

## Production finding and verification

Before the handler, production Tab traversal reached the hero `Text Sandy` link with bounds y=343.95…392.23 while the visible sticky CTA began at y=285.33. Focus was visible, but the link was obscured.

A production DOM trial of the proposed handler moved the link above the CTA. The rebuilt local candidate then passed the same keyboard sequence before release.

The focused fix was committed as `3ce8a79` and deployed with an exact one-file payload:

- `free-bjj-intro-tannersville-ny/index.html`

The deployment helper reused the verified backup `/home/sensdapt/senseisandy-predeploy-20261030T045832Z.tar.gz` and reported `remote_bytes=97147`. The shared dirty `dist/` tree was not overwritten.

The post-deployment production route returned HTTP 200 with the expected title and the inline handler present. The response body was 146,125 bytes after server-side SSI expansion.

At 452 × 351 CSS pixels and DPR 2.5, Playwright sent Tab key events through this sequence: skip link, logo, header Text Sandy, Menu, Book your free visit, then hero Text Sandy. Neither the SMS nor booking link was activated.

The final focused link had `:focus-visible=true`, bounds y=224.73…273.41, and the sticky CTA began at y=285.33. The link had 11.92px clearance, did not overlap the CTA, and the page had no horizontal overflow or browser errors.

Evidence:

- Screenshot: [free-intro-production-handler-200-focus.png](evidence/2026-10-30/keyboard-sop/free-intro-production-handler-200-focus.png)
- Measurements and release receipt: [free-intro-production-handler-200-focus.json](evidence/2026-10-30/keyboard-sop/free-intro-production-handler-200-focus.json)
- Local rebuilt-candidate screenshot: [free-intro-local-handler-200-focus.png](evidence/2026-10-30/keyboard-sop/free-intro-local-handler-200-focus.png)

## Scope limits

The earlier viewport-equivalent run is retained as separate evidence; native browser-zoom evidence is recorded above.

This SOP did not cover physical HID keyboard hardware, screen-reader speech, site-wide contrast compliance, Lighthouse/PageSpeed, or live form, booking, SMS, email, or availability actions. Those checks remain owner-reserved or untested.

## Follow-up: Schedule details and PageDown — 2026-10-30

The deployed Schedule route initially lacked the mobile calendar container and stylesheet declared by source, so the newly released script raised a null-container error. Commits `d689e37` and `b359bf9` corrected the cache reference and restored only the missing source-backed route dependencies. The dirty generated Schedule file was preserved byte-for-byte during both scoped deploys.

After the correction, production Playwright verification passed at 767 CSS px: Enter expanded a date's class details; Space collapsed and re-expanded them; focus remained on the same date through 767 → 768 → 769 → 767. The deployed Schedule route, calendar script, and calendar stylesheet each returned HTTP 200, and the browser reported no page errors.

The distinct sticky-action PageDown check also passed on production Free Intro at 390×844 CSS px. Keyboard Tab navigation focused the form input at Tab stop 18. PageDown kept visible focus, moved the input from y=721.98–765.98 to y=205.98–249.98, and produced no overlap with the sticky action. No form was submitted.

This follow-up used browser-generated key events. The owner accepts browser-generated keyboard input instead of physical keyboard input for this SOP, so physical HID testing is out of scope. Lighthouse/PageSpeed was not run.

## Visit shared sticky-action focus follow-up — 2026-10-30

Added a `focusin` recheck to the shared mobile action-bar visibility logic. Both the IntersectionObserver path and its fallback schedule the existing overlap check only for `:focus-visible` targets. No pointer-triggered behavior changed.

Local candidate verification used headed Chrome through Browser Use with generated Tab input at a 451×323 CSS viewport, DPR 2.5, and `visualViewport.scale=1`. The Tab stop immediately before the previously affected “Here week? Start morning Alley Bootcamp” link was focused, then a generated Tab moved focus to that link. The link finished at y=278–298 with `:focus-visible=true`; the sticky bar was hidden and did not overlap the link. This is local candidate evidence, not production verification.

Deployment is pending. The full build output for Visit includes unrelated uncommitted source changes, and the public HTTP response expands server-side includes. I did not commit or deploy that generated route because it could publish unrelated changes or freeze dynamic includes. Keep the shared fix and release artifact reviewable, then deploy only after producing the exact source-backed route payload.
