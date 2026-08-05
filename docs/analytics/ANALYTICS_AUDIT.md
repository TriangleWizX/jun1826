# Analytics Audit & Tag Implementation — SenseiSandy.com

## Audit Overview
A sitewide audit was conducted to inspect all tracking tags, Google Tag Manager (GTM) containers, Google Analytics (GA4) measurement IDs, and event handlers.

## Audit Findings
1. **GTM Container**: Standardized GTM container `GTM-T82Z7Q8D` loaded in `<head>` and `<body>` via centralized `head-metadata.njk` and `header.njk`.
2. **GA4 Measurement ID**: Standardized single GA4 measurement ID `G-03GTSG5ECF` loaded via GTM / `gtag.js`.
3. **Duplicate Tag Risk**: Legacy duplicate inline `gtag()` declarations in preview/partial fragments consolidated into central `analytics-events.js` module.
4. **PII Safety Verification**: Zero form input values (names, phones, emails, guardian info, free-text goals) are transmitted to `dataLayer` or GA4.
5. **Local Development Exclusion**: Analytics initialization is disabled in local development / preview environments (`localhost` / `127.0.0.1`) unless `window.SS_ENABLE_ANALYTICS = true` is explicitly declared.

## Approved Tag Architecture
```text
Website
 → Single GTM Container (GTM-T82Z7Q8D)
   → GA4 Property (G-03GTSG5ECF)
     → Custom Events (free_intro_click, form_start, generate_lead, phone_click, email_click, visitor_option_click, private_coaching_click)
```
