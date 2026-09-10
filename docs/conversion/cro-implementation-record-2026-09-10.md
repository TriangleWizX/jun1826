# CRO clarity implementation record

Date: 2026-09-10

Status: implemented locally; release evidence is recorded after verification and deployment.

## Decisions

- Keep `Reserve Your Free First Visit` as the visible primary action and retain the current booking URL, internal `goal-mapping` identifiers, lane values, and Formspree delivery.
- Treat form submission as a visit request. Sandy confirms the visit before arrival.
- Keep adult and youth preparation distinct. Family confirmation retains both instructions.
- Keep current reservations, packs, community-service eligibility, continuation products, and indexation. CRO-09 remains deferred because it changes entitlement policy.
- Use canonical pricing data and do not add urgency, discounts, or availability promises.

## Link and vocabulary inventory

| Source/component | Route | Previous issue | Audience and destination | Implemented treatment | Verification |
| --- | --- | --- | --- | --- | --- |
| `src/partials/home-conversion-shell.html` | `/` | Mixed Plan / Reserve / Start With verbs | New prospects; homepage builder | One primary label and a short confirmation explanation | Rendered CTA and form journey |
| `src/programs.html` | `/programs.html` | Seasonal route before the main promise; Goal Mapping SMS copy | Audience routes and booking | Audience fit first; seasonal links in secondary context; visit-request SMS | Static links and rendered hierarchy |
| Program conversion partials | Kids, Teens, Adults | Mixed hero labels | Lane-specific booking | One visible label with lane values preserved | Route-specific CTA checks |
| Pricing sources | `/options-pricing.html`, `/options-pricing/` | Different first-visit promise and fragments | Prospects, visitors, members | Beginner-first hierarchy, scoped guarantee, canonical prices, compatibility anchors | Output comparison and policy QA |
| `src/assets/js/funnel-events.js` | Shared shell | Homepage absent from shared form selector | Measurement | Shared enrichment and one producer per start/submit stage | Behavioral browser QA |
| Confirmation template | Receipt route | Malformed source and stale context risk | Submitted prospects | Recent validated context, generic fallback, family guidance | Storage scenarios and browser QA |

## Measurement and rollback

Technical readiness requires one `lead_form_started` and one `first_visit_submitted` event per form instance with lane and campaign context. Receipt-page arrival remains `booking_confirmed`; staff confirmation remains `visit_confirmed`. The browser does not infer attendance, purchase, or activation.

Rollback immediately if the main action breaks, a lane receives the wrong preparation, lead delivery is lost, personal data enters analytics, or a commercial condition is broadened. Restore only the files in the release manifest and redeploy their prior generated outputs.

Conversion impact is not claimed at release. Compare complete cohorts only when usable baseline and follow-up data exist; record schedule transitions and campaign changes as confounders.
