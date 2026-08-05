# Analytics Privacy & PII Protection Checklist — SenseiSandy.com

## Privacy Directives
- [x] No personal names (prospect, student, guardian) are passed to `dataLayer` or GA4.
- [x] No phone numbers or email addresses are passed to `dataLayer` or GA4.
- [x] No free-text goal responses, experience text, or custom messages are passed to `dataLayer` or GA4.
- [x] Form submission parameters sent to analytics contain only non-personal metadata (`form_id`, `form_location`, `page_type`, `program_interest`).
- [x] Confirmation page URL does not include personal parameters in query strings.
- [x] Local development environment disables production analytics by default.
