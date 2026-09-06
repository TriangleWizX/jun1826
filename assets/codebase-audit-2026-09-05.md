# Codebase audit — September 5, 2026

Repository: Sensei Sandy BJJ website (`senseisandy.com`).

This report consolidates the diagnostic evidence collected in this conversation. Findings describe the inspected local worktree and selected live HTTP checks; they are not a guarantee that every page or interaction works. No fixes or deployment were performed. Build and QA commands regenerated local output and some audit reports.

## Priority findings

### 1. Asset fingerprint validation fails after the ordinary build

**Priority: High — release integrity.**

`npm run qa:assets:fingerprint` reported 401 issues. Examples included missing generated targets for glossary CSS, homepage CSS, and a hero image; stale target bytes; generated HTML requiring rewrites; and a stale `src/assets/data/asset-hash-manifest.json`. The additive check also failed.

This proves the inspected build output did not satisfy the fingerprint contract. It does not establish that all flagged assets are missing in production. The documented predeployment script performs asset generation, so an ordinary build is not equivalent to a completed release build.

Recommended action: verify the complete asset-generation sequence in an isolated build and ensure the final deployable output passes parity checks before upload.

### 2. Funnel QA crashes and stops the aggregate suite

**Priority: High — booking verification gap.**

`npm run qa:funnel` failed with:

```text
Cannot set properties of undefined (setting 'ssFunnelEvents')
```

The failure also occurred during `qa:all`, after the build and internal-link inventory. Because subsequent commands are connected with `&&`, those later stages did not run in that aggregate invocation.

The exact undefined object and root cause were not established by a captured stack trace. Earlier descriptions that definitively attributed this to a specific missing mock object were too strong. This is a confirmed test execution failure, not proof that production booking is broken.

Recommended action: capture the stack, reconcile the browser mock with runtime requirements, and exercise the actual booking interaction. Independent checks can run as separate CI jobs to expose multiple failures while still failing the overall gate.

### 3. Live redirect checks disagree with local policy

**Priority: High — routing reconciliation.**

One completed `npm run qa:redirects` invocation reported 177 issues even though the local `.htaccess` redirect block was synchronized with configuration. Examples:

- `/6weekgrandslam` returned 200 instead of redirecting to `/options-pricing`.
- `/adult` and `/adults` exceeded the one-hop contract via `/adult-bjj`.
- `/summer` returned 404 in the captured run.
- Numerous video routes ended at `/@SenseiSandyBJJ` instead of the configured watch-page destination.

These are observed disagreements with the test's expected policy. Some may reflect obsolete expectations or intentional production routing; establish the intended destinations before changing redirects. Later broad statements that all redirects passed were incorrect.

The two legacy blog URLs flagged by the orphan checker were separately verified as working 301 redirects: `/blog/bio-ginastica-mobility/` and `/blog/onteora-park-summer-activities-catskills/`.

## QA implementation and contract problems

| Check | Observed failure | Interpretation and next action |
| --- | --- | --- |
| `qa:index-surfaces` | `scripts/qa-index-surfaces.mjs:40` rejects `Reserve Your Free First Visit` along with retired terms. | The rendered Intro page contained four instances of that CTA and none of the other tested retired terms. Reconcile the assertion with current copy policy; the failure alone does not establish retired-offer leakage. |
| `qa:footer` | Requires exact `<a href="/nearby-towns">Choose Lane</a>` markup at `scripts/qa-footer.mjs:55`. | The inspected root footer contains `/nearby-towns` links with different labels. Test routing and accessible naming against the current footer. Earlier reporting incorrectly said the test required “Choose class.” |
| `qa:sticky-overlap` | Static fallback requires `.ss-mobile-actions` in the root navigation file and fails. | CSS references to other sticky classes do not prove the replacement control exists or works. Inspect the rendered mobile control and overlap before classifying this as merely stale QA. |
| `qa:homepage:synthesis` | Expected `Tannersville, NY · Kids · Teens · Adults` was absent from the tested HTML. | Confirmed contract mismatch; copy regression versus outdated expectation remains unresolved. |
| `qa:media:manifest` | `MODULE_NOT_FOUND` for `scripts/qa-media-manifest.mjs`. | Package script points to a missing implementation. Restore the intended check or remove the obsolete command. |
| `qa:links:descriptive-text` | Missing `assets/senseisandy.com_links_with_non-descriptive_anchor_text_20260814.csv`. | Check depends on an unavailable dated fixture. Document/provide its input or derive it from a current crawl. |
| `qa:ssi` | Leak checker cannot resolve local `/athlete-cross-training`. | Build output for this route exists under `dist/athlete-cross-training/index.html`; inspect the check's source-root assumptions. Other SSI subchecks passed. |
| `qa:orphans` | Flags two legacy blog routes as unreachable intended pages. | Both have configured, live 301 redirects. Reconcile the intended-page inventory with redirect policy. |

## Build, release, and CI observations

- `npm run build` generates site HTML and materializes SSI fragments; sitemap generation is a separate command.
- `scripts/predeploy.sh` **does** run sitemap generation and asset generation. Earlier claims that the release workflow entirely omitted sitemap generation were overstated.
- A sitemap index may retain its timestamp legitimately when its child-sitemap list is unchanged. The August 5 timestamp alone does **not** establish stale sitemap coverage. A successful local-versus-live content comparison was not completed.
- `docs/runbooks/sitemaps.md` describes a page/blog/video sitemap arrangement, while current `sitemaps:*` commands invoke the builder for five core/program/location/blog/glossary children. This documentation mismatch can misdirect release verification.
- `.github/workflows/seo-qa.yml` invokes `qa:all` and then the live sitemap redirect guard. The inspected workflow uses Node 20; local checks used Node 24.12.0. Local results are not a verified CI run.
- Several independent contracts are absent from the aggregate command, including footer, sticky overlap, index surfaces, volatile facts, and first-visit checks. Assign checks to appropriate CI or release jobs based on their purpose.
- The earlier “33 of 104” coverage count used substring matching and ignored nested commands. It is **not** a reliable count of executed coverage. For example, asset and SSI checks can execute transitively. Remote backup cleanup should not be added to CI merely because its name starts with `qa:`.
- Fail-fast behavior is normal and does not create a false green result: the aggregate run failed. Its limitation here is incomplete diagnostics after the first failure.

## Checks with passing evidence

The recorded runs passed the ordinary build, JavaScript syntax checks in `js`, `scripts`, and `tools`, static links and link existence, internal-link inventory, SEO checks for 263 canonical URLs and five child sitemaps, schema contracts, CSS links and route bundles, lazy-loading checks, blocked external-reference checks, first-visit and terminology contracts, health/promotion claims, FAQ, blog linkout rules, skip-link and duplicate-navigation checks, volatile-facts checks, `git diff --check`, and installed top-level dependency resolution.

These passes have limited scopes. In particular:

- CSS route-bundle success does not override failed fingerprint parity.
- Sitemap overlap checked three files; that does not prove coverage of the current five-child sitemap architecture.
- Navigation runs included missing-asset diagnostics and a static fallback. They do not establish a fully styled browser pass.
- Earlier image-QA success statements lack an unambiguous captured completion result in this record and should not be treated as verified here.
- `qa:funnel` did not pass; separate first-visit/terminology contract success is not a substitute.

## Remaining verification limits

- Full mobile/desktop interaction, booking submission, accessibility, and sticky overlap were not established by the captured browser evidence.
- Lighthouse performance QA exited with code 2 because Lighthouse was unavailable through the attempted path.
- Live Node fetch checks encountered network failures; later curl requests encountered DNS failures. These failures do not prove production downtime.
- Dependency vulnerability auditing failed. Successful `npm ls` establishes installed dependency resolution, not absence of vulnerabilities. The npm log-write warning alone does not establish the audit failure's root cause.
- `qa:repo:clean` encountered `spawnSync git EPERM`; direct status and diff checks succeeded.
- The limited secret-pattern scan is not a comprehensive security audit or proof that no secrets exist.

## Recommended order

1. Resolve fingerprint parity on final generated output and reconcile the observed live redirect mismatches.
2. Diagnose the funnel crash and verify the actual booking interaction.
3. Restore missing QA implementations/inputs and reconcile outdated content assertions with current requirements.
4. Verify mobile navigation, sticky controls, and performance with a working browser harness.
5. Align sitemap documentation and CI/release coverage with the actual generation pipeline; compare live child-sitemap contents before claiming deployment drift.

At the last worktree check, modified files were four audit reports (`crawl-reports/internal-links-inventory.csv`, `crawl-reports/orphan-reachability.csv`, `crawl-reports/town-url-inventory.csv`, and `reports/image-qa.json`) plus untracked `.serena/`. Some report changes predated this audit. This Markdown report is the only file intentionally authored for the user's export request. It has not been published or deployed.
