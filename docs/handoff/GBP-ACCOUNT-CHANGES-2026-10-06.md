# Proposed account changes

Status: prepared for review; no profile edits, claims, imports, posts, or submissions performed. No GBP, Bing Places, Apple Business Connect, or Foursquare account-management tool is exposed in this session. Account ownership/access and publication authorization remain dependencies.

## GBP destinations

The handoff and GBP audit use different UTM conventions. These proposed values follow the handoff: `utm_source=google_business_profile`, `utm_medium=organic`, `utm_campaign=gbp_listing`. Confirm this convention against reporting before saving profile edits; do not silently mix it with the audit's `google` / `gbp` convention.

Website field:

```text
https://senseisandy.com/?utm_source=google_business_profile&utm_medium=organic&utm_campaign=gbp_listing
```

Appointment field:

```text
https://senseisandy.com/free-bjj-intro-tannersville-ny?utm_source=google_business_profile&utm_medium=organic&utm_campaign=gbp_listing#booking-flow
```

The appointment destination retains the canonical first-visit route and booking anchor used by `business.json`, `lifecycle.json`, `programs.json`, and `offers.json`. It leaves audience selection to the visitor and preserves the site's booking/attribution flow. It does not reserve a group-class slot or promise same-day training.

## Identity snapshot

From `src/_data/contact.json`:

- Phone: `+1 (917) 736-8649`.
- Address line: `6045 Main Street, 2nd Floor`.
- City/state/ZIP: `Tannersville, NY 12485`.

The handoff's former address added “Studio”; that word is absent from the current contact authority. Recheck canonical values immediately before editing accounts. Keep the existing verified account display name unless primary evidence supports a change.

## Execution and evidence requirements

| Account task | Required before mutation | Evidence after completion |
| --- | --- | --- |
| GBP website/appointment URLs | Authenticated owner access, existing URL screenshots, reviewed UTM convention, publication authorization | Saved field values and public destinations; confirm query preservation and booking anchor |
| Facebook phone | Existing Page identity and current phone verified; authorized Page editor | Native field screenshot and public Page evidence showing the canonical phone |
| Bing Places import | Existing listing/duplicates checked; owner access and import authorization | Native listing ID, verification state, published identity fields |
| Apple Business Connect claim | Existing listing/duplicates checked; owner verification requirements met | Native place ID and claim/verification state; public identity fields once published |
| Foursquare update/claim | Existing venue/duplicates checked; supported ownership/update path established | Native venue ID and saved/published state |

Record draft, submitted, pending verification, and published states separately. An import or claim submission does not prove publication or propagation to other products. The draft audit's review count, score, competitor claims, and syndication promises remain unverified.

Service catalog descriptions and the seven-day post plan require their own factual/copy review and account publication approval. This link/identity packet does not constitute approval of those materials.
