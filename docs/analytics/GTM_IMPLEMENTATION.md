# GTM & Analytics Implementation Guide — SenseiSandy.com

## GTM Container & GA4 Setup
- GTM Container ID: `GTM-T82Z7Q8D`
- GA4 Measurement ID: `G-03GTSG5ECF`

## Client Event Pipeline
`analytics-events.js` intercepts custom data attributes (`data-analytics-event="..."`) and pushes standardized payloads to `window.dataLayer`:
- `free_intro_click`
- `form_start`
- `generate_lead`
- `phone_click`
- `email_click`
- `visitor_option_click`
- `private_coaching_click`

## Local Testing
In local development environments (`localhost` / `127.0.0.1`), analytics calls log to console without polluting GA4 unless `window.SS_ENABLE_ANALYTICS = true` is set.
