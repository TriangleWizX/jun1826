# Sensei Sandy BJJ Google Business Profile audit

**Scope:** repository-grounded GBP handoff. This document does not claim access to, or publication in, the live Google Business Profile.

**Audit date:** 2026-10-09  
**Authority rule:** current canonical data and current page source outrank older audits, drafts, generated `dist/`, and inferred live state.

## Executive finding

The repository supports a credible, locally relevant GBP for Sensei Sandy BJJ, but it does not prove the current live profile is complete or accurate. The highest-risk issue is stale evidence in the existing GBP materials: the older audit states 70 reviews at 5.0, calls coordinates and media “verified,” and gives a 92/100 score, while the current website says “60+ Reviews” and the current account handoff says no GBP edits, claims, imports, posts, or submissions were performed. Those claims must not be used as current GBP facts.

**Repo-grounded readiness:** good foundation, live profile unverified.  
**Recommended status:** hold publication until the owner checks the live listing field by field.

## Confirmed from the current repository

| GBP field | Current source-backed value | Evidence |
|---|---|---|
| Business name | Sensei Sandy BJJ | `src/_data/business.json:2`; schema `src/_includes/components/structured-data.njk:7-14` |
| Address | 6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485, US | `src/_data/business.json:7-14`; `src/_data/contact.json:7-8` |
| Phone | +1 (917) 736-8649 | `src/_data/business.json:18-23`; `src/_data/contact.json:2-3` |
| Website | https://senseisandy.com/ | `src/index.html:3-5`; schema `src/_includes/components/structured-data.njk:9-14` |
| Description basis | Beginner-friendly Brazilian Jiu-Jitsu studio in Tannersville serving kids, teens, adults, and Catskills mountain-area families | `src/_data/business.json:5` |
| Entry offer | 15-minute Free First Visit; first class free; adult same-day training is optional and coach-confirmed | `src/_data/free-intro.json:2-15` |
| Public programs | Kids/youth, teens, adults; visitor and private-coaching offers also exist | `src/_data/offers.json:2-54`, `src/_data/offers.json:56-132` |
| Service area language | Tannersville, Hunter, Windham, Haines Falls, Phoenicia, Catskills | `src/_data/business.json:26-27` |
| Maps entity link | Place ID `ChIJwU-CP5Kt3YkR8zl7MbYlL3s` appears in map links and embed | `src/contact.html:161-167` |
| Structured data | `SportsActivityLocation` + `LocalBusiness`, name, phone, address, and sameAs links | `src/_includes/components/structured-data.njk:4-15` |
| Schema QA | Passed current LocalBusiness and related schema contracts | `node scripts/qa-schema.mjs` on 2026-10-09 |
| Current group schedule | Mon–Fri youth/teen 5:00 PM and adult 6:00 PM; Sat adult no-gi 10:30 AM; private coaching by request | `src/_data/schedule.json:30-142` |

## Live or account facts not proven by the repo

These require an authenticated GBP inspection or native public evidence:

- Current profile name, primary category, secondary categories, attributes, service list, products, and description.
- Current hours, special hours, holiday hours, and whether hours represent staffed/class windows or appointment-only availability.
- Current review count, average rating, owner responses, Q&A, photos, cover image, and profile completeness.
- Whether the Place ID belongs to the claimed/managed listing today, despite its appearance in site links.
- Whether website and appointment links currently contain approved UTM parameters.
- Any Google Posts, their publication dates, calls to action, or live URLs.
- Ownership, verification, suspension, duplicate-listing, and account-access status.
- Rankings, calls, direction requests, website visits, bookings, competitor comparisons, or “dominant” local-pack performance.

## Corrections to the existing GBP materials

1. **Remove the 92/100 score and “verified” language.** `docs/seo/GBP-AUDIT-2026.md:15-39` presents a live-style scorecard without current live evidence.
2. **Do not use 70 reviews / 5.0 stars as current.** The old audit states this at `docs/seo/GBP-AUDIT-2026.md:29,36-38,154-160`, while current homepage copy says `5.0 Google Rating · 60+ Reviews` at `src/index.html:69`.
3. **Reconcile coordinates before changing any listing.** The old audit gives `42.1954787, -74.1323751` at `docs/seo/GBP-AUDIT-2026.md:59-66`; `src/_data/business.json:15-17` has `42.1934, -74.1352`; schema uses the former at `src/_includes/local-business-schema.jsonld.html:31-34`. The repo therefore contains a coordinate conflict, not proof of a verified pin.
4. **Use existing route destinations.** The old audit proposes `/kids` and `/adult` at `docs/seo/GBP-AUDIT-2026.md:143-148`, but those source routes are absent. Use `/bjj-classes/kids-tannersville-ny/`, `/bjj-classes/teens-tannersville-ny/`, `/bjj-classes/adults-tannersville-ny/`, `/free-bjj-intro-tannersville-ny#booking-flow`, or `/schedule` after checking the final public URL.
5. **Do not treat the post calendar as published.** The rollout file labels every slot “Planned” and every live URL “Pending publication” at `tools/ads/GBP-ROLLOUT-PLAN-2026-W38.md:84-94`.
6. **Do not claim directory propagation.** The account handoff says no claims/imports/submissions were performed and calls ownership and publication dependencies at `docs/handoff/GBP-ACCOUNT-CHANGES-2026-10-06.md:1-3,33-45`.

## Recommended GBP field packet, pending owner review

- **Name:** Sensei Sandy BJJ. Do not add city, keyword, or service text to the name.
- **Address:** 6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485. Confirm how Google displays the floor/suite field.
- **Phone:** +1 (917) 736-8649.
- **Website:** use the canonical homepage. If UTMs are adopted, first approve one convention; the existing handoff notes that its convention conflicts with the older audit (`docs/handoff/GBP-ACCOUNT-CHANGES-2026-10-06.md:5-21`).
- **Appointment URL:** `/free-bjj-intro-tannersville-ny#booking-flow`, preserving the Free First Visit and not promising a class seat or same-day training.
- **Description:** draft from `business.description` and `free-intro.publicCopy.overview`; do not add unsupported review, ranking, safety-guarantee, availability, or outcome claims.
- **Services:** Kids/youth BJJ, Teen BJJ, Adult BJJ, Free First Visit, and Private Coaching are repo-supported. Add visitor/drop-in services only after confirming the current schedule and eligibility in the live profile workflow.
- **Hours:** derive from `schedule.json` immediately before entry. Because the schedule is operational and seasonal, do not copy a static old table without owner confirmation.
- **Photos:** the repo contains exterior, entrance, mats, waiting area, changing area, and studio assets, but asset presence is not proof of permission, freshness, or GBP upload. Protect youth privacy and confirm photo rights.

## Priority action list

| Priority | Action | Proof required |
|---|---|---|
| P0 | Open the live listing and reconcile name, address/pin, phone, website, appointment URL, categories, hours, and review count against current authority files | Owner screenshot/export plus public URL checks |
| P0 | Resolve the coordinate conflict between business data and schema before any pin or directory update | Confirmed primary map/address source and updated repo authority if needed |
| P1 | Replace invalid proposed product URLs with existing canonical routes | Final URL returns 200 and matches the intended audience |
| P1 | Review services and description for only current, supported claims | Saved native GBP fields and copy approval |
| P1 | Audit photos, permissions, alt/context, and youth privacy before upload | Native upload evidence and permission record |
| P2 | Publish posts only when each post has an approved asset, current operational facts, canonical CTA, and live public post URL | Placement register with native public URLs |
| P2 | Measure GBP website/appointment traffic only after the UTM convention is approved and saved | Analytics test visit with preserved query parameters |

## Bottom line

The repository can support a strong GBP handoff, but it cannot certify the current profile, review reputation, categories, hours, photos, posts, or ranking performance. The next safe step is a read-and-record live profile inspection using the P0 checklist. No repository or account mutation is required to complete this audit.
