# Separate Remediation Review

Reply with `1 approve, 2 deny...` to choose. This review does not apply the stash or alter the working tree.

## Review basis

- Reviewed `stash@{1}` (`92e19c4`, “Preserve remaining remediation WIP and workbook exports”) against current `HEAD` (`1a1885aa`) and repository sources.
- The stash has eight tracked website paths and three workbook exports in its third parent. The workbooks are not site files; keep them outside any commit or deployment.
- No suitable Indranet persona was identified during routing. This uses an ordinary static-site redirect and content review lens.
- No stash was applied. Existing checkout changes remain untouched.

## Approve or deny

1. **Kids and family redirects — APPROVE the mapping changes.** The legacy Kids URLs resolve to the current `/bjj-classes/kids-tannersville-ny` route. The school-family redirect also goes there. The target matches the current program canonical URL. Applies to the corresponding entries in `.htaccess`, `src/.htaccess`, and `config/legacy-redirects.json`.

2. **Samurai Break redirects — APPROVE the mapping changes.** Both old spellings route to `/parent-resources`, matching the current disposition target. Applies to the same three redirect files.

3. **Old video-library redirects changed to the homepage — DENY.** The stash changes `/tannersville-bjj-video-library` and five old video URLs from `/bjj-videos` to `/`. This discards the more relevant video-library destination. Keep the existing `/bjj-videos` target unless a replacement destination is chosen deliberately. Applies to the same three redirect files.

4. **Blog card “Plan BJJ from Windham” — APPROVE.** The card and its action both point to `/bjj-classes/windham-ny`, which matches the current Windham canonical route. File: `src/blog/index.html`.

5. **Community partner links — DENY pending a better mapping.** The Deer Mountain Inn and Phoenicia Diner cards both change to the same general hospitality-partners page. The School Families card changes to Kids. The family target is relevant, but grouping two distinct businesses into the same general page loses their more specific existing destinations. File: `src/community-partners.html`.

6. **Annual Track links in student pages — APPROVE.** The check-in, report card, and weekly audit links change to `/options-pricing#annual-track`. The current options-pricing source contains that exact anchor. Files: `src/daily-checkin.html`, `src/report-card.html`, and `src/weekly-audit.html`.

## Workbook exports

The stash’s third parent contains these exports. **Do not commit or deploy them**; they are review/workbook artifacts:

- `next-actions-done-senseisandy.com (1).xlsx` — 18,740 bytes
- `next-actions-ignored-senseisandy.com (1).xlsx` — 18,127 bytes
- `next-actions-todo-senseisandy.com (1).xlsx` — 35,377 bytes

## Suggested reply

`1 approve, 2 approve, 3 deny, 4 approve, 5 deny, 6 approve`

After approval, the redirect files will need a selective edit so approved and denied redirect changes can be separated cleanly. This sheet itself makes no changes to those files.
