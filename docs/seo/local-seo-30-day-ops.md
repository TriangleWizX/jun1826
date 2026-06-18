# 30-Day Local SEO Ops Tracker (Tannersville + Catskills)

## GBP Weekly Cadence

| Week | Primary Query Focus | GBP Post URL | Photos Uploaded | Q&A Added | Notes |
|---|---|---|---|---|---|
| Week 1 | jiu jitsu tannersville ny |  |  |  |  |
| Week 2 | kids jiu jitsu tannersville |  |  |  |  |
| Week 3 | teens jiu jitsu tannersville |  |  |  |  |
| Week 4 | hunter ny jiu jitsu / jiu jitsu catskills |  |  |  |  |

## GBP Services/Category Alignment

- Primary category: `Jiu Jitsu School` or closest equivalent in GBP.
- Secondary categories: `Martial Arts School`, youth/teens-relevant category if available.
- Services to keep active and named consistently:
  - `Brazilian Jiu-Jitsu`
  - `Kids BJJ`
  - `Teens BJJ`
  - `Beginner BJJ`
  - `Private Lessons`

## Citation and Calendar Distribution

| Target | Submission URL | Landing Page Used | Date Submitted | Status | Live URL | Renewal Cadence |
|---|---|---|---|---|---|---|
| Great Northern Catskills events |  | /catskills-jiu-jitsu |  |  |  | Monthly |
| Pure Catskills submit event |  | /catskills-jiu-jitsu |  |  |  | Monthly |
| Tannersville town events |  | /tannersville-ny-jiu-jitsu |  |  |  | Monthly |
| Patch local calendar |  | /tannersville-ny-jiu-jitsu |  |  |  | Monthly |

## Canonical NAP + Description Snippet

- Name: `Sensei Sandy BJJ`
- Phone: `+1 (917) 736-8649`
- Email: `me@senseisandy.com`
- Address: `6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485`
- URL: `https://senseisandy.com/tannersville-ny-jiu-jitsu`
- Description:
  `Beginner-friendly Brazilian Jiu-Jitsu in Tannersville, NY for kids, teens, and adults. Calm coaching, clear structure, and no-pressure first class onboarding.`

## Measurement Baseline and Weekly Checks

### Baseline Snapshot (Week 1)

- GSC query/page pairs for:
  - `jiu jitsu tannersville ny`
  - `bjj tannersville`
  - `kids jiu jitsu tannersville`
  - `teens jiu jitsu tannersville`
  - `jiu jitsu catskills`
  - `hunter ny jiu jitsu`
- GBP performance snapshot (calls, direction requests, profile views).
- Landing page baseline:
  - `/tannersville-ny-jiu-jitsu`
  - `/kids`
  - `/teens`
  - `/catskills-jiu-jitsu`
  - `/hunter-ny-jiu-jitsu`

### Weekly QA Commands

```bash
npm run qa:schema
npm run qa:seo
npm run qa:links-static
```

### Schedule Event Schema Guardrail

- When `schedule.html` Event JSON-LD dates are getting close to expiry, regenerate them before release:

```bash
npm run schedule:events:build
npm run qa:schema
```

- `qa:schema` should pass with `Event.startDate` values in the future and within the configured horizon window.

### Pass Criteria

- No schema validation errors.
- `/tannersville-ny-jiu-jitsu` retains inlinks from schedule/contact/kids/teens/catskills and blog pages.
- Query-to-primary mapping remains stable (reduced cannibalization in GSC).
