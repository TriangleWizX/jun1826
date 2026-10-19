# External 3xx Closure Evidence (2026-10-18)

## Scope

- Audit rows covered: 11 external redirecting links identified during crawl audit on `senseisandy.com`.
- Affected public pages:
  - `https://senseisandy.com/bjj-classes/tannersville-ny`
  - `https://senseisandy.com/sources/research/bjj-school-rct`
  - `https://senseisandy.com/blog/water-before-training-how-much-when`
  - `https://senseisandy.com/sources/research/bjj-mma-youth-development`
  - `https://senseisandy.com/blog/schedule-sensei-weekly-template`
  - `https://senseisandy.com/blog/schedule-sensei-reset-protocol`
  - `https://senseisandy.com/sources/research/youth-martial-arts-attention-rct`
  - `https://senseisandy.com/sources/research/bjj-adult-fitness`
  - `https://senseisandy.com/blog/things-to-do-near-hunter-ny-private-bjj-coaching`
  - `https://senseisandy.com/blog/schedule-sensei`

## Canonical Targets Enforced

| Audit Target / Anchor | Legacy URL (Status) | Canonical Replacement URL | Rationale |
|---|---|---|---|
| `Studios on Main` | `https://hunterfoundation.org/venue/studios-on-main/` (307) | `/sensei-studio` | Hunter Foundation uses Sucuri Cloudproxy bot challenge (307); `/sensei-studio` is the canonical internal tour of Studios on Main at 6045 Main Street. |
| `Read the source (DOI: 10.1080/1612197X.2022.2109184)` | `https://doi.org/10.1080/1612197X.2022.2109184` (302) | `https://www.tandfonline.com/doi/full/10.1080/1612197X.2022.2109184` | Taylor & Francis direct article page bypasses DOI proxy 302. |
| `ACSM 2007 guide` | `https://doi.org/10.1249/MSS.0b013e31802ca597` (302) | `https://www.ovid.com/jnls/acsm-msse/abstract/10.1249/mss.0b013e31802ca597~exercise-and-fluid-replacement` | Resolves multi-hop Ovid redirect (302 -> 301) directly to canonical abstract page. |
| `Read the source (DOI: 10.1080/17461391.2019.1629180)` | `https://doi.org/10.1080/17461391.2019.1629180` (302) | `https://onlinelibrary.wiley.com/doi/10.1080/17461391.2019.1629180` | Wiley Online Library direct canonical target for European Journal of Sport Science article. |
| `Lally et al. (2010), habit automaticity timeline` (Weekly Template) | `https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674` (302) | `https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674?cookieSet=1` | Wiley session cookie redirect bypass via direct query parameter. |
| `Lally et al. (2010), habit automaticity timeline` (Reset Protocol) | `https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674` (302) | `https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674?cookieSet=1` | Wiley session cookie redirect bypass via direct query parameter. |
| `Read the source (DOI: 10.1037/dev0001307)` | `https://doi.org/10.1037/dev0001307` (302) | `https://doi.apa.org/doi/10.1037/dev0001307` | APA PsycNet direct canonical resolution. |
| `Read the source (DOI: 10.7752/jpes.2020.s5406)` | `https://doi.org/10.7752/jpes.2020.s5406` (302) | `https://efsupit.ro/images/stories/octombrie2020/Art%20406.pdf` | Direct HTTPS open-access PDF source for Journal of Physical Education and Sport (JPES) Art 406. |
| `Scribner's Experiences` | `https://www.scribnerslodge.com/experiences` (301) | `https://scribnerslodge.com/experiences/` | Canonical non-www domain with trailing slash. |
| `Lally et al. (2010), How are habits formed...` (Schedule Sensei) | `https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674` (302) | `https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674?cookieSet=1` | Wiley session cookie redirect bypass via direct query parameter. |
| `BJSM` | `https://doi.org/10.1136/bjsports-2015-094915` (302) | `https://bjsm.bmj.com/content/49/18/1164` | British Journal of Sports Medicine canonical direct article URL. |

## Source and Mirror File Mapping

- `src/bjj-classes/tannersville-ny/index.html` -> updated external Studios on Main link to internal `/sensei-studio`.
- `src/_data/evidence-records.json` -> updated evidence records for `bjj-school-rct`, `bjj-mma-youth-development`, `youth-martial-arts-attention-rct`, `bjj-adult-fitness`.
- `src/sources/research/bjj-school-rct/index.html` -> direct Taylor & Francis URL.
- `src/sources/research/youth-martial-arts-attention-rct/index.html` -> direct APA PsycNet URL.
- `src/sources/research/bjj-adult-fitness/index.html` -> direct HTTPS JPES PDF URL.
- `src/blog/water-before-training-how-much-when/index.html` and mirror `blog/water-before-training-how-much-when/index.html` -> Ovid and BJSM canonical URLs.
- `src/blog/schedule-sensei-weekly-template/index.html` and mirror `blog/schedule-sensei-weekly-template/index.html` -> Wiley `?cookieSet=1` URL.
- `src/blog/schedule-sensei-reset-protocol/index.html` and mirror `blog/schedule-sensei-reset-protocol/index.html` -> Wiley `?cookieSet=1` URL.
- `src/blog/schedule-sensei/index.html` and mirror `blog/schedule-sensei/index.html` -> Wiley `?cookieSet=1` URL.
- `src/blog/things-to-do-near-hunter-ny-private-bjj-coaching/index.html` -> Scribner's canonical trailing slash URL.

## Build and QA Verification

Timestamp: `2026-10-18 14:25 UTC`
- `npm run build`: Compiled 493 files into `dist/`.
- `npm run validate`:
  - `qa-evidence-funnel.mjs`: Pass
  - `qa-evidence-page-records.mjs`: Pass (all evidence record URLs verified valid HTTPS)
  - `node --test tests/structural.test.mjs`: Pass (15/15 structural tests passed)
  - `qa-cal-migration.mjs`: Pass
- `npm test`: Pass (Validation suite + 35 Ad Studio unit tests passed).

## Recrawl Note (for Search Console / Audit Crawler)

External 3xx remediation for the 11 audited links is complete across all repository sources, static mirrors, and distribution outputs as of `2026-10-18`.

Please request a recrawl of the following URLs:
1. `https://senseisandy.com/bjj-classes/tannersville-ny`
2. `https://senseisandy.com/sources/research/bjj-school-rct`
3. `https://senseisandy.com/blog/water-before-training-how-much-when`
4. `https://senseisandy.com/sources/research/bjj-mma-youth-development`
5. `https://senseisandy.com/blog/schedule-sensei-weekly-template`
6. `https://senseisandy.com/blog/schedule-sensei-reset-protocol`
7. `https://senseisandy.com/sources/research/youth-martial-arts-attention-rct`
8. `https://senseisandy.com/sources/research/bjj-adult-fitness`
9. `https://senseisandy.com/blog/things-to-do-near-hunter-ny-private-bjj-coaching`
10. `https://senseisandy.com/blog/schedule-sensei`
