# WS-25: Free-intro page says it once

The visit FAQ now renders `freeIntro.publicCopy.visitFaqAnswer` instead of the
full `overview`. The original overview and supporting text remain unchanged.
The full overview appears once, under “Your first visit, step by step”.

The prechange live page lacked the closing instance of the canonical offer
sentences described in the brief. The owner approved adding those exact sentences
to closing copy. `publicCopy.closingOffer` renders after the existing waiver note
at the end of the Adults section. This is the only additional copy change.

## Repetition inventory

Inventory covers rendered main content, including closed FAQ answers and booking
panels that appear after a visitor chooses a path. Hidden alternatives are listed
because they remain part of the rendered page.

| Block | Locations and count | Disposition |
| --- | --- | --- |
| Full 15-minute-visit overview | Step-by-step intro and visit FAQ before this change | FAQ replaced; overview now appears once in intro |
| Adult training paragraph, beginning “Meet Sandy for 15 minutes. Talk about your goals.” and ending “Sandy confirms the class before you train.” | Adult booking arrival plan; “Adults: choose how to start” (2) | Unchanged |
| Youth paragraph, beginning “Kids and teens meet Sandy, then try a free first class.” | “Plan your visit”; “Your child’s visit and class” booking panels (2) | Unchanged |
| Studio address paragraph | Three booking-path Location panels; “Find us and park” (4) | Unchanged |
| Clothing guidance, beginning “For a visit, wear your day clothes.” | Adult arrival plan adds “Bring water.”; Adults section uses the exact block; closed “What do I wear?” FAQ adds the youth class-plan sentence (3 contextual occurrences) | Unchanged; intentional guidance in different contexts |
| Canonical free-visit/free-class sentences | Step-by-step overview and owner-approved closing paragraph (2) | Preserved in intro; missing closing instance added with owner approval |

The clothing occurrences are contextual repeats rather than three identical
whole paragraphs. No other paragraph was rewritten in this workstream.

## Verification

The required `qa:volatile-facts`, `test:ads`, `validate`, and `qa:schedule` gates
passed on the final source. Independent source review checked every existing
JSON value and the exact template changes against the prechange worktree.
Local isolated mobile and desktop checks confirm the approved FAQ verbatim,
the full overview once, and the canonical sentences in both required locations.

No booking links, CSS, schema, overview, supportingText, or other existing data
values changed. Production verification is recorded separately after deployment.
