# Codex Devlist: Refresh the Local BJJ Tournaments Parent Guide

Research date: 2026-08-31  
Target route: <https://senseisandy.com/local-bjj-tournaments-for-parents>  
Discovery source: <https://smoothcomp.com/en/events/upcoming>

## Outcome

Update the parent guide so it shows a small, current, verified set of BJJ and submission-grappling events that are realistically useful to Sensei Sandy families. Preserve Sandy's coaching position: competition is optional, and the page helps a parent decide whether a specific event is a good fit.

Do not turn this into a copy of Smoothcomp or a complete regional combat-sports calendar. The screenshots are discovery material. An event is publishable only after its sport, date, venue, youth divisions, rules, and registration status are verified on the exact event page.

## Definition of done

- No past event appears in the upcoming grid.
- Every visible event links to its exact event page, not a generic organizer home page or the generic Smoothcomp calendar.
- Judo-only tournaments, seminars, mixed-martial-arts scrimmages, and invitation-only showcases do not appear in the main BJJ grid.
- Every visible event has a wide thumbnail in the same general proportion as a Smoothcomp event banner, but uses an original Sensei Sandy template unless use of the organizer's banner is cleared.
- Dates and locations are stored as structured data, not embedded in card copy.
- Events render in the initial HTML. JavaScript may enhance filtering, but the cards and links must remain visible to crawlers and with JavaScript disabled.
- Parents see the exact date, city/state, verified audience, Gi/No-Gi availability, travel tier, a short coach note, `Official event details`, and `Ask Sandy`.
- The page says when the list was last checked.
- The existing filter controls work by keyboard and do not rely on color alone.

## P0 — Repair the live page before adding more events

1. Read the repository instructions and find the route implementation without assuming the framework.

   ```bash
   rg --files -g 'AGENTS.md' -g '!node_modules'
   rg -n "Local BJJ Tournaments Near Tannersville|Kids ROLLSTAR Rumbles|he-days-badge|Parent Competition Guide" . -g '!node_modules'
   ```

2. Inspect the route, its tournament data source, its card component, and the build/test commands before editing. Preserve global navigation, footer, lead form, SMS behavior, and unrelated pages.

3. Remove `Kids ROLLSTAR Rumbles | Summer 2026` from the upcoming grid. It occurred on August 29 and was still rendering as `Yesterday` on August 31.

4. Replace the five generic outbound links currently on the live page:

   | Current card | Replace generic link with exact event page |
   | --- | --- |
   | Tap Cancer Out 2026 Long Island BJJ Open | <https://smoothcomp.com/en/event/28604> |
   | Grappling Industries Brooklyn | <https://grapplingindustries.smoothcomp.com/en/event/26129> |
   | Newbreed Rahway Winter Championship | <https://newbreedbjj.smoothcomp.com/en/event/29888> |
   | Grappling Industries Connecticut | <https://grapplingindustries.smoothcomp.com/en/event/31437> |
   | FUJI BJJ Allentown Winter Championship | <https://fujibjj.smoothcomp.com/en/event/31176> |

5. Resolve the Grappling Industries Connecticut location conflict before publishing the updated card. The Smoothcomp calendar labels it `New Haven, Connecticut`; an indexed event-detail snippet lists `NYA Sports & Fitness, 4 Primrose St, Newtown, CT 06470`. Treat the venue address on the exact event page as authoritative, record the conflict, and do not guess.

6. Fix route-specific copy corruption:

   - `Realistic weight small-group class` → `Realistic weight class`
   - `View Small-group class Schedule` → `View Class Schedule`
   - `pressure-Free First Visit` → `pressure-free first visit`

7. Eliminate the crawler/render mismatch. The rendered browser page currently contains six cards, while crawler-visible page extraction omits the entire card grid. Render the event list at build/server time; keep client JavaScript only for filters and relative-date enhancement.

8. Replace the invisible full-card stretched link with two explicit, keyboard-focusable actions:

   - `Official event details ↗`
   - `Ask Sandy`

   Do not let a card-wide overlay interfere with the SMS action or create confusing focus order.

## P1 — Use a structured, fail-closed event model

Locate the existing tournament array and migrate it to a typed object or schema equivalent to this. Adapt names and file paths to the actual codebase.

```ts
type Tournament = {
  id: string;
  name: string;
  organizer: string;
  startDate: string;              // YYYY-MM-DD
  endDate?: string;               // YYYY-MM-DD; default to startDate
  timezone: "America/New_York";
  venueName?: string;
  streetAddress?: string;
  city: string;
  state: string;
  sourceUrl: string;              // exact /event/{id} URL
  sourceImageUrl?: string;        // research reference; not production hotlink
  thumbnailPath: string;          // local, site-owned image
  thumbnailAlt: string;
  sports: Array<"bjj-gi" | "bjj-nogi" | "submission-grappling">;
  audiences: Array<"kids" | "teens" | "adults">;
  matchFormat?: string;
  registrationDeadline?: string;
  rulesUrl?: string;
  weighInSummary?: string;
  refundSummary?: string;
  travelTier: "nearby" | "regional" | "travel-event";
  editorialTag: "best-first-conversation" | "family-friendly" | "serious-test" | "more-matches" | "watch-list" | "coach-review";
  coachNote: string;
  verificationStatus: "verified" | "needs-review" | "conflict";
  verifiedAt: string;             // YYYY-MM-DD
};
```

Rules:

- Hide `needs-review` and `conflict` records from production.
- Hide a record after the end of `endDate` in `America/New_York`.
- Sort visible events by `startDate`, then event name.
- Default to a six-month horizon. Put later 2027 dates in a collapsed `Later watch list`, not the main grid.
- Do not store or publish `days away` as content. Always render the exact date; calculate relative time from the current date only as optional secondary text.
- Do not infer `kids`, `teens`, `Gi`, `No-Gi`, round robin, guaranteed matches, prices, or refund terms from the organizer's reputation. Verify the specific event.
- A generic organizer URL fails validation. `sourceUrl` must contain the exact event ID.

## P1 — Research procedure for every candidate

For each seed link below:

1. Open the exact event page.
2. Record the official title, start/end date, venue name, full address, and registration deadline.
3. Confirm that this is BJJ or submission grappling—not judo, a seminar, MMA, or a general martial-arts event.
4. Confirm which of kids, teens, and adults can register.
5. Confirm Gi/No-Gi availability, division method, match length, format, weigh-in rules, uniform rules, bracket-edit deadline, refund/credit policy, and uncontested-division policy.
6. If the event page conflicts with the Smoothcomp calendar card, prefer the event-detail page and mark the record `conflict` until a human checks it.
7. Verify a realistic driving tier from 6045 Main Street, Tannersville, NY. Do not publish an exact drive time copied from a traffic-sensitive result; store a stable tier and an optional plain-language travel note.
8. Record `verifiedAt` and keep the exact source URL.
9. Ask Sandy to approve the editorial tag. Do not equate `kids division exists` with `good first tournament`.
10. If any required fact is unavailable, retain the event in research data with `needs-review`; do not show a half-verified card.

## P1 — Recommended publication queue

These are the strongest BJJ/grappling candidates from the screenshots. `Publish after verification` means the calendar-level title/date/location/link were found, not that all parent-relevant rules were verified.

| Date | Event | Calendar location | Proposed action | Official hotlink | Source banner reference |
| --- | --- | --- | --- | --- | --- |
| 2026-10-10 | NAGA Springfield Grappling Championship | Springfield; state missing in calendar card | Publish after venue, youth divisions, and rules are verified | [event](https://naga.smoothcomp.com/en/event/32991) | [banner](https://smoothcomp.com/pictures/t/9217303-1ta7/naga-springfield-grappling-championship-2026.jpg) |
| 2026-10-24 | Tap Cancer Out 2026 Long Island BJJ Open | Bethpage, NY | Keep; replace generic link and re-verify youth eligibility | [event](https://smoothcomp.com/en/event/28604) | [banner](https://smoothcomp.com/pictures/t/8232196-srkl/tap-cancer-out-2026-long-island-bjj-open.jpg) |
| 2026-10-25 | FUJI BJJ Middletown Fall Championship | Middletown, CT | Publish after rules/format check | [event](https://fujibjj.smoothcomp.com/en/event/33851) | [banner](https://smoothcomp.com/pictures/t/9244988-xsnx/fuji-bjj-middletown-fall-championship-2026.jpg) |
| 2026-11-08 | Warrior Grappling: Battle of Saratoga | Saratoga Springs, NY | Highest-priority new candidate because it is in the Capital Region; verify first-tournament fit before tagging | [event](https://smoothcomp.com/en/event/33073) | [banner](https://smoothcomp.com/pictures/t/9043903-yv44/battle-of-saratoga-2026.jpg) |
| 2026-11-14 | Grappling Industries Brooklyn | Brooklyn, NY | Keep; replace generic link; retain `more matches` only after format is verified | [event](https://grapplingindustries.smoothcomp.com/en/event/26129) | [banner](https://smoothcomp.com/pictures/t/6810446-g1r/grappling-industries-brooklyn-2026.jpg) |
| 2026-12-05 | NAGA Connecticut Grappling Championship | Newtown, CT | Publish after youth/rules check | [event](https://naga.smoothcomp.com/en/event/33333) | [banner](https://smoothcomp.com/pictures/t/9423397-7nmj/naga-connecticut-grappling-championship-2026.jpg) |
| 2026-12-05 | GOOD FIGHT: NY Winter Open | Hillburn, NY | Publish after format, ages, and registration deadline are verified | [event](https://goodfight.smoothcomp.com/en/event/34092) | [banner](https://smoothcomp.com/pictures/t/9326235-l7vd/good-fight-ny-winter-open-2026.jpg) |
| 2026-12-13 | NEWBREED Rahway Winter Championship | Rahway, NJ | Keep as regional winter watch; replace generic link | [event](https://newbreedbjj.smoothcomp.com/en/event/29888) | [banner](https://smoothcomp.com/pictures/t/8097245-aja8/newbreed-rahway-winter-championship-2026.jpg) |
| 2026-12-19 | Grappling Industries Connecticut | Calendar says New Haven, CT; event snippet says Newtown, CT | Keep hidden until location conflict is resolved; then replace generic link | [event](https://grapplingindustries.smoothcomp.com/en/event/31437) | [banner](https://smoothcomp.com/pictures/t/8440410-c848/grappling-industries-connecticut-2026.jpg) |
| 2026-12-19 | FUJI BJJ Allentown Winter Championship | Allentown, PA | Keep as travel/winter watch; replace generic link | [event](https://fujibjj.smoothcomp.com/en/event/31176) | [banner](https://smoothcomp.com/pictures/t/8336623-5mzs/fuji-bjj-allentown-winter-championship-2026.jpg) |

Do not label Warrior Grappling as `best first conversation` merely because it is closer. Proximity and beginner suitability are separate judgments.

## P2 — Regional travel candidates from the screenshots

Keep these out of the default grid until the nearer queue is complete. They can populate a collapsed `Regional travel` section after verification.

| Date | Event | Location | Initial disposition | Official hotlink | Source banner reference |
| --- | --- | --- | --- | --- | --- |
| 2026-09-05 | NEWBREED New Jersey Fall Championship 2026 | Metuchen, NJ | Too close to event date for a normal new listing; add only if registration and a specific student plan are confirmed | [event](https://newbreedbjj.smoothcomp.com/en/event/29883) | [banner](https://smoothcomp.com/pictures/t/8725464-8jws/newbreed-new-jersey-fall-championship-2026.jpg) |
| 2026-09-13 | Long Island TCG BJJ Open | West Hempstead, NY | Regional travel; verify divisions and deadline | [event](https://smoothcomp.com/en/event/34325) | [banner](https://smoothcomp.com/pictures/t/9390935-c5kj/long-island-tcg-bjj-open-2026.jpg) |
| 2026-09-19 | The Path Submission Series Showcase #11 | Doylestown, PA | Research only; likely a showcase rather than a normal open parent-facing tournament | [event](https://smoothcomp.com/en/event/33181) | [banner](https://smoothcomp.com/pictures/t/9101849-qfhw/championship-series-qualifier-1-2026.jpg) |
| 2026-09-26 | FUJI BJJ Pennsylvania State Championship | Allentown, PA | Regional travel | [event](https://fujibjj.smoothcomp.com/en/event/31024) | [banner](https://smoothcomp.com/pictures/t/8273843-3ung/fuji-bjj-pennsylvania-state-championship-2026.jpg) |
| 2026-10-03 | PRIDE 60 | West Hempstead, NY | Regional travel; verify open registration and youth divisions | [event](https://smoothcomp.com/en/event/32775) | [banner](https://smoothcomp.com/pictures/t/8926787-o0si/pride-60-2026.jpg) |
| 2026-10-24 | Heroes on the Mat 9: Staten Island | Staten Island, NY | Regional travel; verify who can register | [event](https://smoothcomp.com/en/event/33084) | [banner](https://smoothcomp.com/pictures/t/9023465-2egg/heroes-on-the-mat-9-staten-island-2026.jpg) |
| 2026-11-08 | NJBJJF Fall Championships 2026 | Hillsborough, NJ | Regional travel | [event](https://smoothcomp.com/en/event/34148) | [banner](https://smoothcomp.com/pictures/t/9409885-h4r3/njbjjf-fall-championships-2026.jpg) |
| 2026-11-21 | NAGA North American Grappling Championship | Hillsborough Township, NJ | Serious regional test; verify youth rules | [event](https://naga.smoothcomp.com/en/event/33326) | [banner](https://smoothcomp.com/pictures/t/9338805-f7nn/naga-north-american-grappling-championship-2026.jpg) |
| 2026-11-22 | Grappling Industries New Jersey | Rahway, NJ | Regional travel | [event](https://grapplingindustries.smoothcomp.com/en/event/24927) | [banner](https://smoothcomp.com/pictures/t/6414051-vwh5/grappling-industries-new-jersey-2026.jpg) |

## P2 — Later 2027 watch list

Do not crowd the 2026 parent decision with these. Store them for later verification and reveal only within the selected horizon.

| Date | Event | Location | Official hotlink | Source banner reference |
| --- | --- | --- | --- | --- |
| 2027-01-24 | FUJI BJJ New Jersey Winter Championship | Branchburg, NJ | [event](https://fujibjj.smoothcomp.com/en/event/34545) | [banner](https://smoothcomp.com/pictures/t/9458447-eji6/fuji-bjj-new-jersey-winter-championship-2027.jpg) |
| 2027-01-30 | Grappling Industries Syracuse | Syracuse, NY | [event](https://grapplingindustries.smoothcomp.com/en/event/34275) | [banner](https://smoothcomp.com/pictures/t/9371458-1w8y/grappling-industries-syracuse-2027.jpg) |
| 2027-02-07 | Grappling Industries New Jersey | Rahway, NJ | [event](https://grapplingindustries.smoothcomp.com/en/event/32785) | [banner](https://smoothcomp.com/pictures/t/8928533-jar0/grappling-industries-new-jersey-2027.jpg) |
| 2027-03-20 | Grappling Industries Connecticut | Newtown, CT | [event](https://grapplingindustries.smoothcomp.com/en/event/34319) | [banner](https://smoothcomp.com/pictures/t/9382666-gd6j/grappling-industries-connecticut-2027.jpg) |
| 2027-04-25 | Grappling Industries New Jersey | Rahway, NJ | [event](https://grapplingindustries.smoothcomp.com/en/event/32786) | [banner](https://smoothcomp.com/pictures/t/8928626-e9mb/grappling-industries-new-jersey-2027.jpg) |
| 2027-07-24 | Grappling Industries Syracuse | Syracuse, NY | [event](https://grapplingindustries.smoothcomp.com/en/event/34276) | [banner](https://smoothcomp.com/pictures/t/9371466-dct9/grappling-industries-syracuse-2027.jpg) |
| 2027-08-28 | Grappling Industries Connecticut | Newtown, CT | [event](https://grapplingindustries.smoothcomp.com/en/event/34320) | [banner](https://smoothcomp.com/pictures/t/9382682-upf8/grappling-industries-connecticut-2027.jpg) |
| 2027-10-17 | Grappling Industries New Jersey | Rahway, NJ | [event](https://grapplingindustries.smoothcomp.com/en/event/32787) | [banner](https://smoothcomp.com/pictures/t/8928635-sjrn/grappling-industries-new-jersey-2027.jpg) |
| 2027-11-20 | Grappling Industries Connecticut | Newtown, CT | [event](https://grapplingindustries.smoothcomp.com/en/event/34321) | [banner](https://smoothcomp.com/pictures/t/9382699-gfng/grappling-industries-connecticut-2027.jpg) |

The screenshots also show Grappling Industries New Hampshire events in Milford on 2026-11-07, 2027-02-21, 2027-05-22, 2027-08-21, and 2027-11-07. Treat these as long-distance research records, not local parent-guide cards, unless Sandy explicitly expands the radius.

## Do not add these screenshot items to the main BJJ grid

| Event | Reason | Source |
| --- | --- | --- |
| 2026 Morris Cup | Judo | <https://usajudo.smoothcomp.com/en/event/32035> |
| Danbury Judo Open | Judo | <https://smoothcomp.com/en/event/31707> |
| New York State Championships 2026 | Judo; not a BJJ state championship | <https://smoothcomp.com/en/event/32717> |
| 2026 Samurai Judo Championships | Judo | <https://allthingsjudo.smoothcomp.com/en/event/32714> |
| 2026 North American Judo Championships | Judo | <https://allthingsjudo.smoothcomp.com/en/event/27546> |
| 2027 Garden State Judo Classic | Judo | <https://allthingsjudo.smoothcomp.com/en/event/32084> |
| IJC Four Seasons Summer/Fall Cups | Judo imagery/organization; Summer date has passed; verify separately if a related-event section is ever wanted | <https://smoothcomp.com/en/event/31363>, <https://smoothcomp.com/en/event/33038> |
| Fabio Basile Olympic Champion Judo Seminar | Seminar, not tournament; judo | <https://smoothcomp.com/en/event/32954> |
| 2026 Princeton Judo Fall Invitational | Judo | <https://allthingsjudo.smoothcomp.com/en/event/28669> |
| 2026 Yonezuka Cup Memorial Championships | Judo | <https://allthingsjudo.smoothcomp.com/en/event/32711> |
| Princeton Judo Winter Invitational 2027 | Judo | <https://allthingsjudo.smoothcomp.com/en/event/30960> |
| Chinese Martial Arts Autumn Invitational | Not verified as BJJ | <https://smoothcomp.com/en/event/32494> |
| HCS Amateur Invitational 2026 | Not verified as BJJ | <https://smoothcomp.com/en/event/33914> |
| MDL Connecticut October 3rd | Banner describes a technical-sparring/semi-contact event, not a standard BJJ tournament | <https://mdl.smoothcomp.com/en/event/34357> |

If Sandy later wants judo cross-training opportunities, create a clearly separate `Judo and related grappling events` section or page. Do not mix them into a page whose title and parent promise say BJJ tournaments.

## P2 — Thumbnail system: Smoothcomp-like proportion, Sensei Sandy identity

The Smoothcomp cards use a wide banner close to 343 × 127 pixels, an aspect ratio of about 2.70:1. Reuse that spatial pattern, not Smoothcomp's branding.

Implementation:

1. Create a site-owned thumbnail at 686 × 254 pixels for each published event and export WebP plus an AVIF variant if the existing image pipeline supports it.
2. Render at 343 × 127 logical pixels with explicit `width` and `height` to prevent layout shift.
3. Use `object-fit: cover`, top-corner radii matching the card, and `loading="lazy"` below the first row.
4. Use a no-AI CSS/SVG template:

   - dark ink/teal or event-category gradient;
   - subtle mat-grid or grappling-line motif made from simple geometry;
   - organizer name as a small eyebrow;
   - event name in one or two high-contrast lines;
   - city/state and month/day as secondary text;
   - small text badge such as `GI + NO-GI`, `ROUND ROBIN`, or `YOUTH` only after that fact is verified.

5. Use at least two visual treatments so the grid does not become a wall of identical cards, but keep typography, spacing, and information order consistent.
6. Do not copy organizer logos or banner artwork without permission. The `sourceImageUrl` links in this devlist are research references. Do not hotlink them in production; remote images can change, break, track visitors, or create rights questions.
7. Alt-text pattern: `[Event name] tournament banner — [city], [state], [Month day, year]`.
8. If no thumbnail is ready, use the site-owned generic grappling banner. Never show a broken external image.

Suggested card order:

1. Thumbnail
2. Editorial tag
3. Event title
4. Exact date and verified location
5. Compact facts: audience, Gi/No-Gi, format, travel tier
6. Coach note, maximum about 160 characters
7. `Official event details ↗` and `Ask Sandy`

## P2 — Parent-facing interaction

- Replace `All` with `All upcoming`.
- Keep the existing coaching filters, but normalize the labels:
  - `Best first conversation`
  - `Family friendly`
  - `Serious test`
  - `More matches`
  - `Later watch list`
- Show a result count: `Showing 6 verified events`.
- Add `Last checked August 31, 2026` near the list, not inside every card.
- Do not preselect a `best` event for the parent. The page should prompt a conversation with Sandy.
- When a filter has no events, show: `No verified events in this group right now. Ask Sandy before registering elsewhere.`
- Preserve the registration checklist and tournament-bag content below the cards.

## P3 — Validation and tests

Add tests at the most appropriate level for the existing stack.

Data tests:

- All published event IDs are unique.
- All `sourceUrl` values use HTTPS and contain `/event/` plus a numeric ID.
- No published event is expired in `America/New_York`.
- `verified` events have a full city/state, at least one sport, at least one audience, `verifiedAt`, and a local thumbnail.
- Records with `needs-review` or `conflict` do not render.
- A thumbnail path resolves and has alt text.

UI tests:

- Default list is date-sorted.
- Each filter changes the visible count and supports keyboard activation.
- `Official event details` opens the exact external page with `rel="noopener noreferrer"`.
- `Ask Sandy` generates a correctly URL-encoded SMS body containing the event name.
- Mobile at 360–390 px has one column, no horizontal scroll, readable titles, and tap targets at least 44 px high.
- Desktop cards align without forcing equal title truncation that hides the event identity.
- Focus rings remain visible on filters and both actions.
- With JavaScript disabled, all verified cards and exact event links still appear.

Manual QA:

- Compare the live rendered grid with the structured data.
- Verify every outbound event URL after deployment.
- Verify date boundaries on the night before, day of, and day after an event.
- Confirm the Grappling Industries Connecticut venue conflict is resolved.
- Check that no judo-only event entered the BJJ filters.
- Confirm no remote Smoothcomp image is requested by the production page.
- Run the repository's existing tests, build, and link checker; report any pre-existing failure separately.

## Optional P3 — Structured event metadata

If the route already uses JSON-LD, add one `SportsEvent` object per visible verified event with `name`, `startDate`, `endDate`, `eventStatus`, `location`, and the exact official URL. Do not emit JSON-LD for hidden, conflicted, expired, or unverified records.

## Handoff summary for Codex

Start with the live regression, not the large event import:

1. Remove the expired Rollstar card.
2. repair the five generic outbound links;
3. resolve the Connecticut location conflict;
4. make the cards crawler-visible;
5. add the site-owned wide thumbnail component;
6. add and verify Warrior Grappling, NAGA Springfield, FUJI Middletown, NAGA Connecticut, and GOOD FIGHT NY;
7. keep long-distance, 2027, judo, seminar, and ambiguous events out of the default grid;
8. test expiration, exact links, filters, accessibility, and mobile layout.

Do not claim the work is complete until the deployed page is checked in a browser and every visible event link is opened successfully.
