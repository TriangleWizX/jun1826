# Consistency Pass Notes

## Branch
- consistency-pass-cta-offer-location (created)

## Shared components / partials inventory
- nav / header: `nav-include.html`
- footer: `footer-include.html`
- CTA header bar: `cta-header.html`
- CTA hero block: `cta-hero.html`
- CTA decision block: `cta-decision.html`
- CTA footer block: `cta-footer.html`
- CTA row/button: `cta-row.html`, `cta-primary.html`
- Pricing / offer summary: `pricing-module-fragment.html`, `pricing-module.html`
- Schedule location switch (booking): `book-free-intro/index.html`
- JS config / CTA text: `js/site-config.js`, `js/cta-config.js`

## Baseline snapshot notes (no screenshots)
- `/` (index.html): hero CTA uses data-cta; lanes link to kids/teens/adults; footer tagline adult-only.
- `/start-here` -> redirects to `/book-free-intro` (book-free-intro/index.html): booking hero + location switch; no offer/schedule block yet.
- `/programs` (programs.html): lane cards + CTA; contains lane schedule copy per page.
- `/kids` (kids.html): hero uses CTA + mentions 4pm schedule; includes pricing module fragment.
- `/teens` (teens.html): hero uses CTA + lane schedule copy; includes pricing module fragment.
- `/adults` -> `/adult-bjj` (adult-bjj.html): hero uses CTA + lane schedule copy; includes pricing module fragment.
- `/schedule` (schedule.html): full schedule layout; meta referenced legacy location label.
- `/after-school-bjj` (after-school.html): hero CTA; schedule copy varies; no shared schedule block yet.
- `/contact` (contact.html): CTA hero/footer included; location copy references Tannersville / by appointment.
- `/faqs` (faqs.html): CTA blocks and general booking text.
- `/bio` (bio.html): meta + hero copy include legacy location label.
- `/near/*` (near/*/index.html): near templates use varied CTA wording and program naming; legacy near page exists.
