# Acquisition Attribution Specification — SenseiSandy.com

## Overview
Acquisition context (UTM parameters, landing page, referring URL, program interest) is preserved from entry through form submission using first-party `sessionStorage`.

## Captured Attribution Fields

| Field Name | Description | Storage Method |
| :--- | :--- | :--- |
| `first_utm_source` | Initial campaign traffic source | `sessionStorage` (First-touch) |
| `first_utm_medium` | Initial campaign medium (cpc, organic, social) | `sessionStorage` (First-touch) |
| `first_utm_campaign` | Initial campaign name | `sessionStorage` (First-touch) |
| `last_utm_source` | Most recent campaign traffic source | `sessionStorage` (Latest-touch) |
| `last_utm_medium` | Most recent campaign medium | `sessionStorage` (Latest-touch) |
| `last_utm_campaign` | Most recent campaign name | `sessionStorage` (Latest-touch) |
| `landing_page` | Initial page path entered | `sessionStorage` |
| `referring_page` | External referrer HTTP header | `sessionStorage` |
| `program_interest` | Inferred program interest (kids, teens, adults, general) | `sessionStorage` |

## Form Integration
Hidden form input fields are automatically populated immediately before Formspree submission:
```html
<input type="hidden" name="first_utm_source" id="attr-first-utm-source">
<input type="hidden" name="first_utm_medium" id="attr-first-utm-medium">
<input type="hidden" name="first_utm_campaign" id="attr-first-utm-campaign">
<input type="hidden" name="last_utm_source" id="attr-last-utm-source">
<input type="hidden" name="last_utm_medium" id="attr-last-utm-medium">
<input type="hidden" name="last_utm_campaign" id="attr-last-utm-campaign">
<input type="hidden" name="landing_page" id="attr-landing-page">
<input type="hidden" name="referring_page" id="attr-referring-page">
<input type="hidden" name="program_interest" id="attr-program-interest">
```
