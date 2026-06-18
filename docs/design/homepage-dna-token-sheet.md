# Homepage DNA Token Sheet

## Purpose
This file is the sitewide source of truth for the Sensei Sandy homepage design language.
All subpages should use the same tokens and component patterns instead of custom one-off styling.

## Core Tokens

```css
:root {
  --ss-orange: #E05500;
  --ss-teal: #289FA1;
  --ss-bg: #FBFAF8;
  --ss-text: #1F1712;
  --ss-muted: #4F433C;
  --ss-border: rgba(54, 43, 36, 0.14);
  --ss-radius: 18px;
  --ss-shell-max: 1100px;
  --ss-shell-pad: clamp(1rem, 2.4vw, 1.25rem);
}
```

## Type Scale
- `H1`: `2.2rem` to `3rem`
- `H2`: `1.6rem` to `2.2rem`
- `H3`: `1.2rem` to `1.6rem`
- `Body`: `1rem`
- `Small`: `0.88rem` to `0.95rem`

## Spacing Rhythm
- Base: `8px`
- Steps: `8, 16, 24, 32, 48, 64, 96`
- Standard section: `.ss-section`
- Tight section: `.ss-section--tight`

## Button System
- Primary: `.ss-btn--primary`
- Secondary: `.ss-btn--secondary`
- Ghost: `.ss-btn--ghost`

Each major page should keep CTA rhythm:
1. Hero CTA
2. Mid-page CTA
3. Final CTA section

## Shared Shell
- Global header + utility links from `nav-include.html`
- Global lane chips strip from `lane-picker.html` (included by `nav-include.html`)
- Global footer from `footer-include.html` (Simple Footer)

## Component Kit
- `HeroPrimary`: homepage hero (`index.html`)
- `HeroSecondary`: `cta-hero.html`
- `LanePickerChips`: `lane-picker.html`
- `ProofBar`: `partials/proof-strip.html`, `cta-decision.html`
- `ProgramCards`: lane card grids on program pages
- `Map + Address + Parking`: `partials/location-and-reviews.html`
- `FAQAccordion`: `.ss-accordion` + `.ss-faq`
- `FinalCTASection`: `cta-footer.html`

## Universal Subpage Blueprint
1. Hero
2. What this is
3. Who it is for
4. How it works
5. Social proof
6. Program cards or schedule preview
7. FAQ
8. Final CTA + contact
