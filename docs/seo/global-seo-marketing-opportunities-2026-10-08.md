# SEO and Marketing Gaps

**Date:** Oct 8, 2026  
**Site:** Sensei Sandy BJJ, Tannersville, NY  
**Scope:** Site pages, site checks, page words, local search, and leads  
**Output:** Gaps only.

## Short read

The site has many town pages. Many checks pass. Main gaps: weak proof, hard words, and missing data on search visits that bring Free Intro leads.

Local checks show page and link gaps. They do not prove live pages have these gaps. Web checks could not reach the site. The repo has no search, rank, ad, or lead data.

## How to read this report

- **Seen:** The source or a local check shows the gap.
- **May be:** The source gives a sign, but live or user data is still needed.
- **Unknown:** Need more data.
- **Rank:** High, Mid, or Low by reach and fit with Free Intro bookings.

## Top gaps

| ID | Rank | Gap | Status |
|---|---|---|---|
| SEO-01 | High | Gaps in site-wide SEO checks | Seen |
| SEO-02 | High | Links to old or lost pages | Seen in local checks |
| MKT-01 | High | Learn which search visits lead to a Free Intro | Unknown |
| COPY-01 | High | Key page text above grade 3 | Seen by local score tool |
| SEO-03 | Mid | Each town page may lack its own value | May be; each page needs review |
| SEO-04 | Mid | Old pages may get search visits | Unknown |
| MKT-02 | Mid | Local page views and calls | Unknown |
| SEO-05 | Mid | Page names, blurbs, and share tags | Not fully checked |
| SEO-06 | Mid | Facts that search sites read | Not fully checked |
| MKT-03 | Mid | Match page topics to local needs | Data gap |
| MKT-04 | Mid | Free Intro path on phones | Live check needed |

## Search gaps

### SEO-01: Gaps in site-wide SEO checks

**Rank:** High  
**Status:** Seen

Some site checks do not match the files here.

- An old report lists `npm run qa:seo`. `package.json` lacks this task.
- `scripts/qa-seo.mjs` could not find the home page file it needs.
- `scripts/qa-schema.mjs` could not find a nav file used by a Free Intro page.
- The lost page and map checks could not find `pages-sitemap.xml`.
- The SEO CI file calls `npm run qa:all`. `package.json` lacks this task.
- `docs/seo/RELEASE_5_EVIDENCE.md` says live proof is still part done.

**Why this matters:** One pass cannot check all pages, maps, tags, or links.

**Need to learn:** Which checks fit and what pages are live.

### SEO-02: Links to old or lost pages

**Rank:** High  
**Status:** Seen in local checks

Two checks found bad links in local files.

- `node scripts/qa-index-surfaces.mjs` found seven links that go to paths that send people on: `/adults`, `/annual-track`, `/blog/bjj-schedule-windham-ny`, `/deer-mountain-inn`, `/phoenicia-diner`, `/school-families-jiu-jitsu`, and `/teens`.
- `node scripts/qa-links-existence.mjs` found four bad link cases. Two go to `/brazilian-jiu-jitsu-hunter-ny`. One goes to `/kids`. The Hunter link is in both source and built files.

**Why this matters:** People and search sites may take an extra step or hit a bad page.

**Need to learn:** Which links and old paths are live.

### SEO-03: Check each town page for its own value

**Rank:** Mid  
**Status:** May be; each page needs review

The URL list has 34 town pages and 464 rows. It marks 436 `keep` and 26 `merge`. Some towns have both `/near/...` and `/bjj-classes/...` pages. Hunter and Windham have more than one town page.

The site rule says each town page should give local help. The list counts pages. It does not show if each page adds a new answer.

**Why this matters:** Samey pages may vie for one search or help a family less.

**Need to learn:** Which pages get views, links, and leads. What does each town page add?

### SEO-04: Find old pages that get search visits

**Rank:** Mid  
**Status:** Unknown

The URL list marks 26 pages to join and two to send to a new path. An old key word file lists ranks 51 to 90. It names Semrush or Ubersuggest. It has no clear date or new rank proof.

**Why this matters:** Old pages may get links or visits. They may draw eyes from class and Free Intro pages.

**Need to learn:** Search visits and links for old pages. Which paths work?

### SEO-05: Check page names, blurbs, and share tags

**Rank:** Mid  
**Status:** Not fully checked

The site has a rule for page names and blurbs. The build check tests a few pages. It did not check live pages for a clear name, blurb, main heading, page link, or share image.

**Why this matters:** Weak or same page names may get few clicks. They may look alike in search or posts.

**Need to learn:** Check source and live pages. Mark old and private pages.

### SEO-06: Check all page data that search sites read

**Rank:** Mid  
**Status:** Not fully checked

The site checks facts, Q and A, page paths, blog posts, and deals. One build check passes for 290 pages. Some town pages have Q and A data. The checks do not show all data matches live page text.

**Why this matters:** Search sites read page facts to learn who the site helps and what pages say.

**Need to learn:** Do page facts match page text? Can Google read them live?

## Copy gaps

The local reading tool scores each file. Scores are a guide. They do not show if live pages read with ease.

### COPY-01: Make key page text easy to read

**Rank:** High  
**Status:** Seen by local score tool

The goal is grade 3 or lower. The scores below come from `tools/readability-check.mjs` on source files.

| Page | Score | Notes |
|---|---:|---|
| Home | 5.32 | One banned word found |
| Kids class | 6.33 | One banned word found |
| Teen class | 7.33 | Highest score in key class set |
| BJJ word guide home | 9.57 | Long page, long lines |
| Holiday time page | 8.45 | Time and class facts add load |
| Windham class page | 5.41 | Long page text |
| Hunter class page | 4.95 | One banned word found |
| Hunter town page | 5.16 | Long page text |
| Windham town page | 4.89 | 1,747 words in the scan |
| Blog home | 3.30 | Near the goal |
| Party page | 3.42 | Near the goal |
| After-school page | 3.78 | Near the goal |
| Contact page | 3.27 | Near the goal |
| Class time page | 3.22 | Near the goal |

The Free Intro page scored 1.25. The tool found one banned word there and two on the first responder page. The local copy skill lists the words.

**Why this matters:** Some people may need more time to learn what class fits and how to start.

**Need to learn:** Which words are hard on a phone, out loud, or for a screen reader.

## Marketing and data gaps

### MKT-01: Learn which search visits lead to a Free Intro

**Rank:** High  
**Status:** Unknown

The site tracks clicks, form starts, and sends by name. The plan counts a good form send as a lead. The repo has no report that links search words, pages, Free Intro clicks, and form sends.

**Why this matters:** The team cannot tell which page or search brings a lead.

**Need to learn:** Which pages get search visits? Which visits start a form? Which sends reach Sandy?

### MKT-02: Measure local page views and calls

**Rank:** Mid  
**Status:** Unknown

An old local list audit says Google page links may lack track tags. It has rank, review, and photo claims. This worktree has no new proof for them.

**Why this matters:** Local page views may lead to calls, map taps, or visits. Files do not show how many.

**Need to learn:** Views, web clicks, calls, map taps, and leads by source.

### MKT-03: Match page topics to local needs

**Rank:** Mid  
**Status:** Data gap

The site has blog posts, a BJJ word guide, town pages, and pages for guests and local groups. An old key word file lists search terms. No new report shows what people use now.

**Why this matters:** Page work should match what parents, adults, teens, and guests seek.

**Need to learn:** Search words, page views, links, and leads for each topic.

### MKT-04: Check the Free Intro path on phones

**Rank:** Mid  
**Status:** Live check needed

The site has Free Intro links on home, class, price, time, blog, and town pages. The repo has no phone test from search page to send.

**Why this matters:** A good page can lose a family if the next step is hard.

**Need to learn:** Does each key page show a clear first step? Does the form work on phones?

## Checks and limits

### Checks that passed

- Built-page SEO check: 5 child maps and 290 page links.
- Main page link check: 32 pages.
- Blog link rule check: 60 posts.
- SEO path check: 9 public, 3 private, and 5 word guide paths.
- Volatile fact check: 1,092 files.

### Checks that failed or could not run

- Full source SEO check: home file is missing.
- Page fact check: nav file is missing.
- Lost page and map checks: `pages-sitemap.xml` is missing.
- Live page check: web fetch failed. This does not show live page status.
- Search, rank, Google page, and lead data: not in the repo.

One link check wrote crawl files. Those files were put back. No page was fixed.

## SEO and marketing lens

- **SEO role:** Solon the SEO Sage, UUID `2d52210b-edae-48f2-b5a5-095e3dd4c523`, v2.0.0. The tool marked the match unclear. The full prompt was read. It covers page checks, local search, key words, content, links, and user data.
- **Marketing guide:** INSTRUCTIONS - Business Operations, UUID `c3369696-d996-447e-8973-5f2cd73d33c9`, marked ready. It links to another prompt UUID. That prompt was not in local files. It was not read.
- **Skills used:** `seo-audit`, `keyword-research`, `keyword-clustering`, `content-strategy`, `cro`, and `copy-readability-audit`.
- **Fit note:** The repo has no live search, rank, or ad data tool. These gaps stay unknown where proof is missing.
