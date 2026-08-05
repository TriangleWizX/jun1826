# Sitewide Migration Checklist

## 1. Create the new Calendly event

Create `BJJ Goal Mapping Visit`, confirm the final public URL, and update
`CALENDLY_URL` in `goal-mapping.js` if the slug differs.

## 2. Install the shared launcher

Upload:

- `goal-mapping.js` to `/assets/js/goal-mapping.js`
- `goal-mapping.css` to `/assets/css/goal-mapping.css`

Add this once before `</body>` on every HTML page:

```html
<script src="/assets/js/goal-mapping.js" defer></script>
```

Add this inside `<head>` if you use the optional styles:

```html
<link rel="stylesheet" href="/assets/css/goal-mapping.css">
```

The launcher also catches current `data-calendly` links, existing Sensei Sandy
Calendly URLs, and links to `/free-bjj-intro-tannersville-ny`. That makes the transition work
before every old CTA has been rewritten.

## 3. Change the global CTA hierarchy

Use:

- **Primary:** Reserve Free Intro
- **Compact nav/mobile:** Start Here
- **Supporting line:** 15 minutes. Meet Sandy. Leave with your recommended class
  and weekly plan.
- **Secondary CTA:** Text Sandy

Retire these as primary labels:

- Reserve Free Intro
- Book Your First Class
- Claim Your Free Class
- Try a Class
- Save My Spot

## 4. Replace the homepage form and always-loaded calendar

Remove the homepage lead form and the calendar that loads below it. Replace
both with the single `homepage start section` in `cta-snippets.html`.

The calendar should load only after a CTA click. This keeps the page focused,
reduces duplicate choices, and makes the scheduling action feel like the next
step instead of a separate third step.

## 5. Rebuild `/free-bjj-intro-tannersville-ny`

Keep the URL temporarily for backlinks and search equity, but change:

- Page title: `BJJ Goal Mapping Visit | Sensei Sandy BJJ`
- H1: `Your First Step Toward Consistent Training`
- Intro: `Meet Sandy for 15 minutes. Map your goal, schedule, and best starting
  lane before choosing your first class.`
- Primary CTA: `Reserve Free Intro`

Remove the class-booking form and the always-loaded scheduling section.

Later, consider a permanent redirect from `/free-bjj-intro-tannersville-ny` to
`/goal-mapping-session` after internal links, search listings, and campaigns
have been updated.

## 6. Rewrite first-visit sections

Use this sequence everywhere:

1. Meet Sandy
2. Share the result you want
3. Map a realistic weekly rhythm
4. Choose the right first class together
5. Begin with skill-based resistance activities at the right pace

Do not position the 15-minute appointment as a medical screen. Use
`movement-readiness check`, `mobility considerations`, or `training
considerations`.

## 7. Update metadata and structured data

Replace offers named `Free Introductory BJJ Class` with:

- Offer/service name: `Complimentary BJJ Goal Mapping Visit`
- Price: `0`
- Duration: `PT15M`
- URL: the new on-site page or Calendly event URL

Update page descriptions that promise a free first class.

## 8. Tracking

The supplied script sends this GA4 event after a completed embedded booking:

- Event: `goal_mapping_booked`
- Category: `lead`
- Label: current page title

Track these conversion steps:

1. CTA click
2. Calendly loaded
3. Session booked
4. Session attended
5. First class scheduled
6. 12-week track started

## 9. QA

Test on:

- iPhone-sized screen
- Android-sized screen
- Desktop Chrome
- Safari
- Slow connection
- JavaScript disabled

Confirm:

- Every primary CTA opens the popup
- Hosted Calendly link works as a fallback
- Escape closes the popup
- Focus returns correctly
- No CTA uses `href="#"`
- No page shows an always-loaded duplicate calendar
- UTM fields identify the page and CTA source
