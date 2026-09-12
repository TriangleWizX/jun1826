# Homepage desktop availability overlap audit

## Observation

At the live homepage on 2026-09-12, the desktop availability message rendered as:

`First visits available this coming week · 4–10 spots left each day · Next opening: Mon, Sep 14`

The message visually overlapped the left toolbar group:

`Catskills Studio • 6045 Main Street, Tannersville`

The overlap is reproducible in the desktop toolbar screenshot at 1366×768. The live availability response returned HTTP 200 and supplied `spotsPerDayRange: "4–10"` and `nextAvailableLabel: "Mon, Sep 14"`.

## Cause

The shared toolbar uses a three-child flex row: left identity, centered availability, and right SMS. The left and right flex items have `min-width: 0`, while their child labels are `white-space: nowrap`. When the availability message grows and the row constrains the left item, the parent shrinks but the address text continues painting at its intrinsic width. The computed parent rectangles appear separated, but the overflowing child text crosses into the center slot.

This is a confirmed layout defect, not a conversion measurement. The affected owner is the shared toolbar stylesheet (`src/assets/css/site-shell.css`) and its generated bundle.

## Scoped remedy

- Reserve the left and right toolbar groups with `flex: 0 0 auto`.
- Give the center availability slot `flex: 1 1 auto; min-width: 0`.
- Allow the availability message to wrap inside the remaining center width.
- Preserve the existing message, endpoint, event names, SMS link, address, and mobile toolbar behavior.

## Acceptance

- At 992, 1024, 1100, 1200, 1280, and 1366px, the identity text and availability text occupy non-overlapping rectangles.
- The availability text may wrap, but no text is clipped or painted over the identity or SMS group.
- At mobile widths, the existing mobile availability cue remains unchanged.
- No horizontal overflow, navigation regression, or change to the availability payload occurs.

