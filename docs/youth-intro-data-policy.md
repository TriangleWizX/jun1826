# Youth Intro Data Policy

Youth-intro records are operational lead data, not analytics data. Access is limited to the protected ops API and the noindex admin panel. Accommodation and participation notes are stored only in the operational database and are never sent to analytics or placed in URLs.

Records are retained for 24 months after the last recorded follow-up or enrollment decision, then deleted unless a documented legal, accounting, or active-member need requires a longer period. Test records must use clearly labeled test data and can be removed through the protected youth-intro record deletion endpoint.

Message consent stores the consent timestamp and the exact consent-text version (`youth-intro-v1`). A future consent-copy change must use a new version value.
