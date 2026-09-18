---
name: copy-readability-audit
description: Audit and refactor customer-facing copy across the website to meet 3rd-grade reading level accessibility, positive beginner framing, zero negative terms rules, and 4-rubric copy pipeline compliance.
metadata:
  trigger: Auditing web copy, reviewing headlines, refactoring landing pages, checking marketing text
  author: Sensei Sandy BJJ Development Team
---

# Copy Readability & Positive Framing Audit Skill

Audit and refactor customer-facing copy on `senseisandy.com` to maintain maximum accessibility, beginner reassurance, positive framing, and 4-rubric quality pipeline compliance.

## Primary Principles

1. **3rd-Grade Reading Level Target**:
   - Short sentences (average 5–8 words).
   - Simple 1–2 syllable words.
   - High readability scores (Flesch-Kincaid Grade Level <= 5.0 for key components, <= 7.0 for full pages).
   - Clear, direct, action-oriented language.

2. **Positive Affirming Framing (Zero Negative Language)**:
   - **Strictly BAN**: `zero`, `without`, `no`, `stop`, `don't`, `never`, `injury`, `injuries`, `hurt`, `pain`, `roughhousing`, `muscling`, `ego`, `meathead`.
   - **Always Substitute**:
     - Negative: *"Zero live sparring on day one"* -> Positive: *"Cooperative, coached movement from day one"*
     - Negative: *"Train without getting wrecked"* -> Positive: *"Learn martial arts at a calm, steady pace"*
     - Negative: *"Zero testing fees"* -> Positive: *"All testing fees included"*
     - Negative: *"No experience needed"* -> Positive: *"Beginners welcome"* or *"We require zero prior experience"* (or *"Start right where you are"*)
     - Negative: *"Without aggression"* -> Positive: *"Peaceful self-assurance"*

3. **Canonical `START` Comment Trigger Consistency**:
   - Standardize all social media posts, ad templates, Reels, carousels, and DM funnels on the single trigger: **`START`** (`Comment START`).
   - Prevents automation routing failures and maintains predictable CTAs.

4. **Lineage Tagging Frequency Rule**:
   - Tag `@clockworkbjj` maximum **once per week**, reserved strictly for flagship technical micro-clinics or tournament proof posts.

---

## 4-Rubric Copy Quality Pipeline

Every public marketing page or customer-facing copy block MUST pass through these 4 rubrics:

| Rubric | Standard & Requirements |
| :--- | :--- |
| **Rubric 1: Stop-Slop** | Score >= 40/50. Active voice, zero adverbs, zero false agency, no binary contrasts, no em-dashes. |
| **Rubric 2: Universal Analyzer-Improver** | Grounded conversion mechanics, local SEO geo-keywords (*Tannersville*, *Hunter*, *Windham*, *Haines Falls*, *Catskills*), `npm run qa:volatile-facts` compliance. |
| **Rubric 3: Anything-Enhancer** | High sensory warmth, beginner reassurance (room tour, safety walkthrough, coached first class, normal clothes), kinesthetic realism. |
| **Rubric 4: Empirical Reach Matrix** | 16–30s Reel format priority for discovery, contrarian problem-solver hooks, 4-Tag Rule (`#catskills #bjj #tannersvilleny #hudsonvalley`), comment velocity prompts (`Comment START`). |

---

## Audit Workflow Checklist

When performing a site-wide copy audit:

- [ ] **Step 1: Run Readability Analysis**
  - Extract visible HTML text and calculate Flesch-Kincaid Grade Level per page.
  - Target: Core conversion components Grade 2.5–4.0; main pages Grade 5.0–7.0.

- [ ] **Step 2: Negative Term Scan**
  - Run line-by-line regex search for banned negative terms (`no`, `without`, `zero`, `stop`, `injury`, `hurt`, `ego`, etc.).
  - Convert any negative framing into positive affirming experiences.

- [ ] **Step 3: Volatile Facts Verification**
  - Run `npm run qa:volatile-facts` to ensure academy schedules, addresses, guarantees, and pricing remain canonical.

- [ ] **Step 4: Full Test Suite Check**
  - Run `npm test` to verify zero structural, link, contract, or performance regressions.

---

## Python Helper Script for Auditing

Use this quick CLI check command to audit any directory:

```bash
rtk proxy python3 -c '
import glob, re

files = [f for f in glob.glob("src/**/*.html", recursive=True)]
banned = ["without", "zero", "stop", "injury", "injuries", "hurt", "roughhousing", "muscling", "ego", "meathead"]
pattern = re.compile(r"\b(" + "|".join(banned) + r")\b", re.IGNORECASE)

findings = []
for f in files:
    with open(f, "r", encoding="utf-8") as fh:
        for idx, line in enumerate(fh):
            if not line.strip().startswith("<meta") and not "ld+json" in line:
                m = pattern.findall(line)
                if m:
                    findings.append((f, idx+1, set(x.lower() for x in m), line.strip()[:80]))

print(f"Total findings: {len(findings)}")
for f, l, terms, snippet in findings[:10]:
    print(f"{f}:L{l} [{terms}] -> {snippet}")
'
```
