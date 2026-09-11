# Calendly viewport audit — 2026-09-11

## Scope and decision

This audit covers the Progressive Booking scheduler on `/free-bjj-intro-tannersville-ny` at 375px, 768px, and 1440px. Its single job is to let a first-time student or parent select a fitting Goal Mapping time with no ambiguity about the visit or the next step.

The route uses the existing Catskills Studio functional-workbench system. The calendar is the task surface, so it receives the available vertical space; the path, reassurance, schedule link, and text fallback remain above it.

## Evidence

Live browser measurement after selecting the adult lane:

| Viewport | Calendar transport | Available width | Measured iframe height | Result |
| --- | --- | ---: | ---: | --- |
| 375 × 812 | Provider popup entry | 343px | n/a | No horizontal overflow; primary entry is 44px tall. |
| 768 × 1024 | Inline iframe | 707px | 150px | Blocking: only a thin slice of the provider UI is visible. |
| 1440 × 1000 | Inline iframe | 691px | 150px | Blocking: the scheduler cannot be used in place. |

At 375px, the persistent local CTA wraps to two lines. It remains operable, but it adds height to an already constrained viewport and conflicts with the page's single-line-affordance rule.

## Findings

1. **P0 — inline calendar has no height contract.** The page creates `#calendly-embed-onsite`, but its route CSS gives neither it nor its injected iframe a usable minimum height. Calendly therefore renders at its default 150px iframe height.
2. **P2 — mobile persistent CTA loses its compact shape.** The visible label is longer than the 375px action width, producing a two-line button.
3. **P3 — hover animation is overly broad for the scheduling bezel.** The existing route globally applies `transition: all` to a shell that contains the third-party task surface. The repair confines widget treatment to non-layout properties and disables the visual lift for the calendar shell.

## Implementation contract

- Keep the 768px desktop/tablet decision point: below it, use the provider popup; at and above it, use the inline widget.
- Reserve `clamp(42rem, 72dvh, 54rem)` for the inline task surface. This gives Calendly at least 672px, enough to show its calendar and time list without a nested scroll trap, but caps at 864px on large displays.
- Make the widget and injected iframe block-level and 100% wide so no baseline gap or intrinsic iframe default shrinks the surface.
- At mobile widths, keep the local entry button full-width and single-line. Remove the persistent bottom CTA once the visitor reaches the calendar or confirmation state so it cannot cover the provider task surface.
- Keep the existing provider URL, lane mapping, event handling, analytics, confirmation owner, and booking copy unchanged.

## Closure criteria

- Browser measurement at 768px and 1440px shows an inline iframe at least 672px tall.
- 320px, 375px, 414px, 768px, and 1440px have no horizontal overflow.
- The 375px primary mobile action is at least 44px tall and remains one line.
- The provider popup opens from mobile and the inline widget loads on desktop without JavaScript errors.
- Funnel, first-visit, volatile-fact, build, CSS-route, and CSS-minification checks pass.

## Evidence boundary

These checks establish layout and interaction readiness only. They do not establish calendar inventory, booking fulfillment, follow-up delivery, attendance, or analytics receipt.
