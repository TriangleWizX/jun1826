# Integrations

Document each external integration with this structure:

- What it connects to
- Data in/out
- Failure modes
- Cache/refresh cadence
- Security notes (keys, limits, scopes)
- Verification steps

## Priority Integrations To Document

- Scribner's / Turneo partner flow
- Google Maps embed and business reviews feed
- Booking flow (Calendly or active booking provider)

## Google Reviews CTA Guardrail

- Canonical CTA copy for review buttons: `Read all 84 Google reviews`
- Keep review-count labels globally consistent by running:
  - `rg -n "Read all\\s+[0-9]+\\s+Google reviews|103 Google reviews" *.html`
