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
