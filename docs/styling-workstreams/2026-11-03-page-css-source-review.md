# Page and CSS Source Review

This review covers the 28 `src/` paths changed in `stash@{0}` compared with its parent: 13 CSS files and 15 page/template files. It is a recommendation sheet only. The stash and site files have not been changed.

Persona routing found no suitable Indranet persona for this accessibility/frontend review, so this uses an ordinary static-site review lens.

Reply with `1 approve, 2 deny...`. Recommended choices: **deny 6 and 13; approve the rest.**

## CSS paths

1. **`src/assets/css/contact-vip.css` — APPROVE.** Makes the primary contact action at least 44px tall for easier tapping.
2. **`src/assets/css/cro.css` — APPROVE.** Gives Programs side-card links 44px tap height and spacing.
3. **`src/assets/css/faqs.css` — APPROVE.** Raises several small labels and lineage details to 14px and makes the FAQ action control at least 44px tall.
4. **`src/assets/css/global.css` — APPROVE.** Gives `.btn-tactical` a 44px minimum height.
5. **`src/assets/css/hyphen-weekend.css` — APPROVE.** Adds 44px header/form targets, a visible-on-focus skip link style, and reduced-motion friendly label sizing on this campaign page.
6. **`src/assets/css/mobile-foundation.css` — DENY.** Adds reduced-motion and sticky-action-bar focus rules, but also removes the site-wide 16px minimum text rule. That broad removal can make existing small copy smaller across many pages. Split the useful additions from this removal before adopting it.
7. **`src/assets/css/pages/core-culture-parent-guide.css` — APPROVE.** Adds consistent 44px CTA targets, focus styling, and wrapping for the parent guide actions.
8. **`src/assets/css/pages/options-pricing-highend.css` — APPROVE.** Adds mobile link/disclosure tap heights and fixes narrow-screen wrapping for adult coaching price rows.
9. **`src/assets/css/pages/shiney-ticket.css` — APPROVE.** Raises small ticket labels and helper text to 14px.
10. **`src/assets/css/pages/source-record.css` — APPROVE.** Adds a 44px minimum height to the source-record action.
11. **`src/assets/css/partner-pages.css` — APPROVE.** Enlarges the partner icon target from 40px to 44px.
12. **`src/assets/css/site-shell.css` — DENY.** Adds roughly 140 lines of broad shared rules across navigation, forms, breadcrumbs, badges, cards, and buttons. The mobile selectors affect many page types and include 14px text rules. Split into page-scoped changes with viewport evidence before accepting this bundle.
13. **`src/assets/css/styles.css` — APPROVE.** Disables several CTA animations when reduced motion is requested.

## Page and template paths

14. **`src/birthday-parties.html` — APPROVE.** Adds the shared consent-label class to an existing, already associated checkbox label.
15. **`src/bring-a-friend.html` — APPROVE.** Adds the shared consent-label class to the existing friend-permission label.
16. **`src/camp-clinics.html` — APPROVE.** Makes testimonial scrolling use instant movement when reduced motion is preferred.
17. **`src/core-culture-parent-guide.html` — APPROVE.** Loads the page-specific stylesheet that is also in this stash.
18. **`src/daily-checkin.html` — APPROVE.** Gives progress-navigation links a 44px minimum height.
19. **`src/deer-mountain-inn.html` — APPROVE.** Adds the shared consent-label class to an existing text-consent label.
20. **`src/front-headlock-series/index.html` — APPROVE.** Gives the existing Free Intro link a 44px mobile target.
21. **`src/hyphen-weekend.html` — APPROVE.** Adds a skip link and a focusable main-content target.
22. **`src/phoenicia-diner.html` — APPROVE.** Adds the shared consent-label class to an existing text-consent label.
23. **`src/practice-vault.njk` — APPROVE.** Associates the affected form labels with their controls using matching `for` and `id` values.
24. **`src/report-card.html` — APPROVE.** Replaces simulated stripe buttons with native buttons, pressed states, focus indication, and 44px targets; also makes action and progress controls easier to tap.
25. **`src/scribners.html` — APPROVE.** Associates the affected form labels with their inputs.
26. **`src/tactical-longevity.html` — APPROVE.** Associates form labels with controls and keeps the sticky CTA from covering visible page controls.
27. **`src/waiver.html` — APPROVE.** Associates existing waiver form labels with controls and adds the shared consent-label class. The reviewed edits change markup associations, not waiver wording.
28. **`src/weekly-audit.html` — APPROVE.** Adds a skip link, focusable main target, and 44px progress-navigation targets.

## Verification boundary

These recommendations are based on the stash diff and source inspection. No build, visual review, browser interaction, or Lighthouse run was performed for this sheet. The broader `site-shell.css` and `mobile-foundation.css` changes are the main items to keep separate from the page-scoped accessibility fixes.
