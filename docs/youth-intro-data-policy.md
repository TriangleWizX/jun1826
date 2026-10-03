# Youth Intro Data Policy

Youth-intro records are operational lead data, not analytics data. Access is limited to the protected ops API and the noindex admin panel. Accommodation and participation notes are stored only in the operational database and are never sent to analytics or placed in URLs.

Records are retained for 24 months after the last recorded follow-up or enrollment decision, then deleted unless a documented legal, accounting, or active-member need requires a longer period. Test records must use clearly labeled test data and can be removed through the protected youth-intro record deletion endpoint.

Message consent stores the timestamp and the exact consent-text version. The October 2 plain-language form sends `youth-intro-v2-2026-10-02`: “Sandy may send me texts or emails about this visit. I can opt out at any time.” Older forms that omit the version retain `youth-intro-v1`; historical rows and database defaults remain unchanged. Future consent-copy changes require another version. Consent and opt-out rights remain the same.
