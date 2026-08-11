# P1 audit cleanup release note

This release keeps website class start times and booking routes unchanged.

GBP hours are a separate operational field: they describe when the business is publicly reachable or appointments/private coaching may be available. The website schedule describes class start times. Do not update GBP hours from the website schedule until the owner confirms the actual public access and private-coaching windows.

The wellness/PT source remains available for owner/source verification, but the Eleventy build now removes its provider testimonial block and rewrites injury/rehabilitation-adjacent wording from the published route. Do not present BJJ as rehabilitation or medically appropriate for a client without confirmation from that client’s licensed provider.

The URL registry already marks long-tail town pages such as Saugerties and Prattsville as non-indexable pending rewrite. The shared metadata policy now honors that flag for pending-rewrite entries, so those routes publish `noindex, follow` and remain excluded from the location sitemap until their content is substantively rewritten or a redirect is approved.

Release 5 validation also found stale `/near/woodstock-ny` links after that route was retired. Shared footer and town-hub references now point to the existing `/nearby-towns` hub; the full Release 5 validator passes with zero warnings.

The validated `dist` release was deployed on 2026-08-11 after removing two explicitly approved older predeploy archives to clear the remote quota. Production smoke checks returned 200 for Schedule, Free Intro, and Pricing; the homepage title, legacy 301 redirects, town noindex policy, wellness copy cleanup, HSTS, and referrer policy were verified live.

The pending town decision is now a rewrite path: 23 town sources received town-neutral/local-route copy cleanup while retaining their town-specific arrival and class context. They remain `noindex, follow` pending a later substantive content review, rather than being redirected or removed.
