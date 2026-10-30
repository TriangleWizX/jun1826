# Screen-reader speech acceptance — final results

## Production checks

Checks used task-owned Google Chrome at 390×844 and Orca 46.1. Evidence is Orca's logged speech output, not independent listening. No form was submitted and no booking, SMS, email, or availability action was activated.

| Area | Result | Observed speech and matching state |
| --- | --- | --- |
| Navigation | Pass | Tab to Menu: “Open menu collapsed push button.” Enter: “Close menu expanded push button,” then “Home link.” The settled navigation was visible, `aria-expanded=true`, and focus was on Home. Escape: “Open menu collapsed push button.” The menu closed, `aria-expanded=false`, and focus returned to Menu. |
| Schedule | Pass for the tested date change | With Friday, October 30 selected, ArrowRight selected Saturday, October 31. Orca said: “Saturday, October 31, 2026. 10:30–11:30 AM Adult No-Gi. 5:00–8:00 PM Halloween Spooktacular · Meet Sasquatch toggle button expanded.” The selected button and visible details matched. |
| Free Intro form | Focused Orca retest passed | After the fix, one field-level `reportValidity()` call produced one “Please fill out this field.” Orca speech output. The name field remained `aria-invalid="true"`, referenced its inline message through `aria-describedby`, and the form was not submitted. |

## Fix and release evidence

The request form associates each inline validation message with its field using `aria-describedby` and sets `aria-invalid`. The field error no longer has live-region semantics, removing the extra announcement path that overlapped with native field validation. One post-release Orca retest produced one error announcement for one `reportValidity()` call.

- Commits: `b654b4d4`, `cea4afa`, and the Orca fix `84554b7`.
- Each dry run resolved to one payload path: `js/progressive-booking.js`.
- The fix upload reported `remote_bytes=22220`.
- A cache-busted production read returned HTTP 200 and 22,220 bytes with SHA-256 `c8e1d7619caddbf7dfc147a1c7a7db1966ec2b4d66d631a880f4c78b45c4bd7e`, matching local generated output. The live-region markers are absent and `aria-describedby` support remains.
- Orca 46.1 debug output recorded one “Please fill out this field.” utterance after one field-level `reportValidity()` call on production. The browser DOM confirmed the form was not submitted.
- `node --check js/progressive-booking.js` passed. An isolated Eleventy output was built outside the main generated tree and used for the local Orca check.
- Deployment cleanup rotated a further older predeploy archive (1,130,771,252 bytes), as recorded in the evidence JSON.

Navigation and Schedule speech matched browser state in the earlier focused acceptance check. This retest covers one Free Intro validation call; it is not a complete screen-reader audit.
