# Competitor Gaps Keyword Strategy & Content Architecture

**Grounded in**: `next-actions-todo-senseisandy.com.xlsx` (Sheet 2: *Competitor Gaps*)  
**Academy**: Sensei Sandy BJJ, Tannersville, NY  
**Domain Authority & Target URL**: `https://senseisandy.com`  
**Date**: October 2026  
**Auditor**: Solon the SEO Sage & Dennis Stratton PM  

---

## 1. Executive Summary

An audit of organic search queries from Semrush / Ubersuggest identified **15 competitor and entity gap keywords** where `senseisandy.com` currently ranks between positions #51 and #90.

Rather than random noise, these queries reveal four clear search clusters:
1. **Brand & Semantic Academy Variations** (users searching for Sensei Sandy, the Tannersville dojo, or Studios on Main with imperfect recall).
2. **NYC Lineage & Black Belt Network Searches** (Clockwork Jiu Jitsu lineage, affiliate coaches, and historical black belt promotions).
3. **Martial Discipline & Cross-Training Comparisons** (Sanda / Sanshou Chinese kickboxing vs. BJJ, Judo kuzushi mechanics).
4. **Metro New York & Regional Weekend Traveler Queries** (Downstate practitioners traveling between Long Island / NYC and the Mountaintop / Windham / Hunter).

This strategy maps each query to an authoritative target page, outlines the ranking mechanics, and defines on-page and internal linking actions to push these terms into top positions.

---

## 2. Keyword Inventory & Gap Analysis Matrix

| Keyword | Vol | Pos | Dif | Target URL | Intent Category | Primary Action |
| :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **sandy jiu jitsu** | 70 | 51 | 1 | `/sensei-jiu-jitsu` | Brand / Exact Coach | Exact match added to H1/profile bio |
| **sensei dojo** | 260 | 82 | 2 | `/sensei-studio` | Semantic Facility | Frontmatter title & studio description |
| **jiu jitsu sensei** | 90 | 77 | 14 | `/sensei-jiu-jitsu` | Coach Authority | Instructor bio integration |
| **sensei studios** | 40 | 88 | 0 | `/sensei-studio` | Facility / Building | "Studios on Main" building association |
| **sensei studio headquarters** | 30 | 84 | 0 | `/sensei-studio` | Facility / Building | Headquarter location phrasing added |
| **sensei studio** | 20 | 84 | 0 | `/sensei-studio` | Facility / Building | Page title & meta description |
| **new york sanda** | 50 | 88 | 28 | `/blog/what-is-sanda-sanshou` | Discipline Comparison | High-performing blog authority page |
| **senshi judo** | 170 | 86 | 14 | `/bjj-glossary/kuzushi` | Japanese Martial Arts | Connect Judo off-balancing to BJJ |
| **sd brazilian jiu jitsu nyc** | 260 | 86 | 16 | `/sensei-jiu-jitsu` | Downstate Lineage / NYC | NYC roots & lineage documentation |
| **gracie barra sandy** | 110 | 74 | 1 | `/sensei-jiu-jitsu` | Brand Entity Ambiguity | Clarify Sensei Sandy vs. GB Sandy (Utah) |
| **long island bjj** | 880 | 90 | 16 | `/bjj-glossary/snap-down` | Downstate Traveler | Cross-link glossary to vacation training |
| **snyder dojo** | 50 | 84 | 0 | `/sensei-studio` | Competitor Studio Query | Studio atmosphere & dojo culture match |
| **senjutsu martial arts** | 30 | 81 | 2 | `/sensei-studio` | Competitor Studio Query | Mountain martial arts intent capture |

---

## 3. Four Strategic Pillars

### Pillar 1: Brand & Semantic Academy Variations
**Keywords**: `sandy jiu jitsu` (#51), `sensei dojo` (#82), `jiu jitsu sensei` (#77), `sensei studios` (#88), `sensei studio headquarters` (#84), `sensei studio` (#84).

- **Root Cause**: Prospective students and parents frequently search for Sensei Sandy using conversational terms ("Sandy Jiu Jitsu", "the sensei dojo", "sensei studio in Tannersville"). Because our building is named *Studios on Main*, queries often blend "Sensei" and "Studios".
- **Implemented Optimization**:
  - `src/sensei-jiu-jitsu.html`: Added explicit profile text recognizing Sandy as the trusted *jiu jitsu sensei* and founder of *Sandy Jiu Jitsu*, operating inside the *sensei dojo* and *studio headquarters*.
  - `src/sensei-studio.html`: Updated page `<title>` to `"Sensei Studio BJJ & Dojo Headquarters | Sensei Sandy BJJ"` and added clear arrival copy explaining that our studio headquarters is located inside Studios on Main.
  - `src/bio.html`: Contextualized Coach Sandy Jose Nunez as a dedicated black belt *jiu jitsu sensei*.

### Pillar 2: NYC Lineage & Instructor Network
**Keywords**: `sd brazilian jiu jitsu nyc` (#86), `gracie barra sandy` (#74).

- **Root Cause**: Coach Sandy earned his black belt at Clockwork Jiu Jitsu under 4th-degree black belt Josh Griffiths in Manhattan. The official source page `/sources/clockwork-bjj-instructors` already documents Josh Griffiths and Clockwork lineage. Furthermore, searchers looking for "Gracie Barra Sandy" (a large school in Sandy, Utah) trigger Google's semantic index for "Sandy" + "BJJ" in New York.
- **Strategic Response**:
  - Keep `/sources/clockwork-bjj-instructors` rigorously indexed as an official source verification document.
  - Maintain the lineage node `Josh Griffiths → Clockwork Jiu-Jitsu → Sandy Jose Nunez` in schema structured data (`SportsTeam` and `Person`).
  - Distinguish Sensei Sandy BJJ as an independent, Clockwork-lineage academy in the Catskills, providing clear disambiguation for algorithmic search graphs.

### Pillar 3: Martial Arts Discipline Comparisons (Sanda / Judo)
**Keywords**: `new york sanda` (#88), `senshi judo` (#86).

- **Root Cause**: Coach Sandy's deep understanding of combat mechanics includes comparative analyses of Chinese Sanda (Sanshou) and Japanese Judo. Sensei Sandy BJJ already maintains high-authority blog articles (`/blog/what-is-sanda-sanshou` and `/blog/sanda-vs-jiu-jitsu-for-mma`) and glossary entries (`/bjj-glossary/kuzushi`).
- **Strategic Response**:
  - Keep `/blog/what-is-sanda-sanshou` focused on objective striking vs. ground combat comparisons and beginner safety.
  - In `/bjj-glossary/kuzushi`, maintain clear educational ties explaining how Judo kuzushi principles protect joints and enable low-impact takedown defense for adult beginners.

### Pillar 4: Downstate & Weekend Visitor Capture
**Keywords**: `long island bjj` (#90), `snyder dojo` (#84), `senjutsu martial arts` (#81).

- **Root Cause**: A significant portion of Catskills second-home owners and weekend visitors originate from Long Island and NYC. Practitioners training at Long Island academies look for training options near Windham and Hunter Mountain during ski season and summer retreats.
- **Strategic Response**:
  - Maintain the dedicated visitor landing pages: `/weekend-visitor-jiu-jitsu-tannersville-ny` and `/things-to-do-near-hunter-ny-private-bjj-coaching`.
  - Add internal links from glossary entries (such as `/bjj-glossary/snap-down`) to the visitor booking flow, allowing traveling practitioners to easily drop in for Saturday morning open mat or weekday training.

---

## 4. Operational Monitoring & Next Steps

1. **Rank Tracking Cadence**: Re-check Semrush / Ubersuggest positions 30 days post-crawl. Target threshold: Move all Tier 1 brand variations (`sandy jiu jitsu`, `sensei dojo`, `jiu jitsu sensei`) into top 10 within 60 days.
2. **Volatile Facts Adherence**: Continue enforcing `npm run qa:volatile-facts` on all editorial revisions to ensure schedule and pricing accuracy across competitor-targeting content.
3. **Positive Framing**: All educational content must maintain 3rd-grade reading simplicity and positive, affirming beginner framing.
