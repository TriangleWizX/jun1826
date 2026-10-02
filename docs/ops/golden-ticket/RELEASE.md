# Shiney Ticket website release

Date: October 2, 2026. Owner approved deployment in this conversation. Release is scoped to the Shiney Ticket and the global adult first-day policy.

## Result

The Bring a Friend page gives a member's guest four free classes in two weeks. Sandy activates the pass at the first attended class. That date is day one; the final date is start date plus 13 local calendar days. Each class needs Sandy's confirmation and space. The guest and referring friend plan the classes together; Sandy matches partners. The existing $35 reward keeps its eligibility, first cleared payment trigger, permitted uses, and exclusions.

Adults complete the required first visit. Then they may choose coach-confirmed training that day or a later class. First-day sparring and The Sandy Challenge are elective. The challenge uses a timed, coach-led round, Sandy's arms held at his sides with a belt, agreed rules, a verbal pause, and belt release when the round ends. Waiver, consent, and partner matching remain required. Youth keep their own combined visit/class workflow.

The page uses a personal member invite, a dark green ticket, warm paper tones, serif headings, and gold details. It claims no scarce places, secret access control, or measured performance. Page CSS stays local and uses existing fonts. The form endpoint and existing field contract stay in place. Source URL, card code, offer ID, class count, and activation event are carried with the request. The success state means request received. It does not start the pass or confirm a class. Staff maintain activation and attendance in private copies of the new blank logs.

## Source scope

- Authority: `src/_data/referrals.json`, `free-intro.json`, `freeIntro.js`, `offers.json`, `visit-preparation.json`.
- Design and form: `src/bring-a-friend.html`, `src/assets/css/pages/shiney-ticket.css`, asset manifest.
- Policy propagation: first-visit and confirmation pages, adult and local class pages, Programs, Pricing, Contact, How Class Works, Show-Up Kit, the shared first-visit process, and five conversion/booking partials.
- Tests: first-visit contract and terminology contract; the youth training check is retained.
- Offline kit: guide updates, new tracking URLs, ten QR files, two print sheets, activation and attendance log fields, repeatable renderer.
- Only the five tracked generated pages with task changes are staged with their source. Unrelated user work, private exports, ads, and package edits stay outside the release.

## Persona and expert framework

Contextual routing was completed before substantive implementation. No ready catalog role fit this full implementation and release, so an ordinary frontend and referral-operations specialist was disclosed. The read INSTRUCTIONS - CONTENT resource (`6e94db8f-e23d-4387-8cc6-bac209e890aa`, no required attachments) supplied source-based copy structure and plain-language revision. No unready role adoption is claimed.

The full Universal Analyzer-Improver source (`65808004-23a5-42ae-babe-1dbe85bfd1cf`, `assets/indranet-prompt-exporter/exports/Universal-Analyzer-Improver/versions/v2.2.0/prompt.json`) supplied fact checks, clear next steps, and friction review. The full Anything-Enhancer / OptiMax source (`4a702064-50b8-4fbb-875c-2f3600c8d6dc`, `assets/indranet-prompt-exporter/exports/Anything-Enhancer---OptiMax/versions/v1.0.0/prompt.json`) supplied the personal handoff and material styling within real offer limits. These sources are guidance, not permission or deployed assets.

## Copy review

1. Stop-Slop: editorial assessment 44/50 (directness 9, rhythm 8, trust 9, authenticity 9, density 9). Short active sentences, no invented proof or capacity, no em-dash copy. This is an editorial score, not audience testing.
2. Universal Analyzer: adult friend fit, one main request path, Tannersville context, source and card capture, plain activation terms, visible fallback, and canonical policy checks.
3. OptiMax: a familiar friend and a real card give the invite warmth. The design uses paper and ticket cues. Class pace and partner matching remain grounded in Sandy's plan.
4. Empirical Reach Matrix: this is a website and offline card. Reel durations, Meta posting windows, hashtag rules, lineage tags, and comment triggers do not apply. No new reach claim is made.

Offer and changed shared-policy paragraphs estimate at grade 3 or below, with a maximum changed shared estimate of 2.94. Proper names, address, and short labels are reviewed separately. See VERIFICATION.md for the method's limits and all check results.

## Checks and limits

Build, volatile facts, first-visit contract, terminology contract, unified checks, phone/desktop layout, controlled form states, and the controlled booking fixture pass. All ten PNG and PDF QR payloads match the new CSV URLs. No synthetic form was sent to the provider.

The full-site booking scan has a pre-existing missing script on Hyphen Weekend and old CSS references outside this payload. The checkout has no `qa:definition-of-done` script. These are recorded as existing gaps. Real inbox delivery, the new physical GT01 write/scan, manual guest activation, and referral outcomes remain to be proven.

## Payload and rollback

The exact deployment list is in `release-paths.json`. It includes 23 generated paths: 15 page representations, five shared partials, two CSS representations, and the asset manifest. The shared-component mapper can propose a sitewide release; use the exact list with repeatable `--only` arguments. Offline files and logs are excluded.

The 21 existing production paths were captured and hash-checked before upload; two CSS paths were new. That temporary snapshot was cleared at a tool-turn boundary. The retained full production archive is from August 22, 2026; gzip and required root members are verified, but it is older than later site changes and lacks two later partials. Routine rollback should restore the task source from the exact parent commit, build, and deploy only the same 23-path list. The prior versions of all 30 modified source/generated/test paths are saved in `.tmb/rollbacks/shiney-ticket-before-source.tar.gz`, with a SHA-256 manifest. Remove the newly added offer/alias/CSS references through a scoped revert in an isolated checkout; leave unused CSS on the server. The older full archive is an emergency recovery option, not the current site snapshot. Deployment used the verified-backup option and pruned no remote backups. Preserve unrelated user work.

## Deployment evidence

Deployed source commit `d2a551ae7dc21d3b816ce8183bd6136841a38686` on October 2, 2026. The unfiltered mapper proposed 675 files; the reviewed repeatable filters selected exactly 23. All 23 uploaded on the first attempt. Fresh SFTP reads match the local build byte for byte. All 28 HTTP routes passed, including the tagged extensionless and HTML Shiney Ticket routes, primary adult policy pages, confirmation, local class routes, and both Pricing representations. Both CSS files match over HTTP. Live Chrome at 375 × 900 and 1440 × 1000 verifies tracking, GT01/source prefill, one H1, loaded ticket style, CTA in view, form visibility, no horizontal overflow, and no page errors. Only site GET requests were allowed; no real forms or analytics sends were made. See `live-qa.json` for file hashes and route/browser evidence.
