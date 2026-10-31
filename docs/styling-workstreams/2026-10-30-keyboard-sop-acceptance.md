# Keyboard acceptance SOP — 2026-10-30

## Outcome

The keyboard SOP was run against production, the Free Intro sticky-action overlap was fixed, and the updated route passed a post-deployment keyboard check at the same CSS viewport and device-pixel ratio measured during the native 200% zoom run.

The production keyboard check has now also passed with actual Chrome 200% page zoom. Physical HID keyboard hardware and screen-reader speech were not tested.

## Production coverage

| SOP area | Result | Evidence / limits |
| --- | --- | --- |
| Shared navigation across ten route cohorts | Pass | Skip link, main-content focus, visible focus, traversal order, footer links, and wrap checked. |
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

The fix was committed as `2462f0c9` and deployed on 2026-10-30 as an exact one-file payload, `visit/index.html` (`remote_bytes=179254`). The deployment used the current production Visit document as its baseline and added only the two focus-triggered checks. Live HTTP verification returned 200 with both listeners present.

Post-deploy Browser Use verification used headed Chrome 151.0.7922.137 at actual native 200% page zoom, confirmed by DPR 2.5 and `visualViewport.scale=1`. The viewport was 503×341 CSS px. Generated Tab focused the previously affected “Here week? Start morning Alley Bootcamp” link at y=160.66–180.66 with `:focus-visible=true`; the sticky bar began at y=277.6 and remained visible. Generated Tab also focused “Text Sandy to Book Your Visit”; the bar hid while the link was out of view. Generated PageDown, ArrowUp ×8, ArrowDown ×2, and PageUp brought the still-focused link fully into view at y=257.63–324.10. Its 2px green outline and 4px shadow remained visible; the bar began at y=341.6 and stayed hidden. Neither control overlapped the bar, and document scroll width was 496px versus a 503px viewport. No form or outbound action was activated. This verifies Visit post-deployment at native 200%; Home, Schedule, and Free Intro retain their separately recorded keyboard evidence.


## Follow-up: Schedule hero focus ring at native 200% — 2026-10-30

A route-specific production recheck found the Schedule hero CTA had `outline-style: none` after PageDown at native 200% zoom, even though the source outline rule was complete. Commit `6da8cc6` added a paper-colored shadow ring and mapped `src/assets/css/pages/schedule.css` to the generated Schedule aliases. The exact release payload was `schedule.html` and `schedule/index.html`; the release reused the newest verified existing rollback archive.

After deployment, Browser Use 0.1.13 with Chrome 151 at native 200% Page Zoom (756×406 CSS px, DPR 2, visual scale 1) sent Tab ×5 then PageDown. The same CTA remained visibly focused at y=7.75–57.75 after scrollY moved from 53.5 to 326. Its 3px dark outline and 5px paper-colored shadow remained visible. There was no sticky-bar overlap or horizontal overflow. Both route aliases returned HTTP 200 with the new declaration. Detailed response hashes and screenshot are in `evidence/2026-10-30/keyboard-sop-full/schedule-focus-recheck.md`. No link, form, or external action was activated.

## Final Schedule date keyboard recheck — 2026-10-30

Production Browser Use generated Tab focused the selected Schedule date at 767 CSS px and Chrome scrolled it into view. The same date kept visible focus through native 767 → 768 → 769 → 767 breakpoint changes. PageDown moved the calendar to November; PageUp returned it to October with focus still visible. No link or form was activated. See the [production trace](evidence/2026-10-30/keyboard-sop-full/schedule-tab-focus-visible-production.json) and [screenshot](evidence/2026-10-30/keyboard-sop-full/schedule-tab-focus-visible-production.png).
