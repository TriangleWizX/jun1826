import bs4
import json
from pathlib import Path
import re

file_path = Path("local-bjj-tournaments-for-parents.html")
html_content = file_path.read_text(encoding="utf-8")

start_marker = r"<!-- MAIN REDESIGNED COLUMNS SECTION -->"
end_marker = r"<!--#include virtual=\"/cta-footer.html\" -->"

with open("scratch/tournaments.json", "r", encoding="utf-8") as f:
    events = json.load(f)

json_data = json.dumps(events, indent=2)

custom_css = """
    /* --- HIGH-END VISUAL DESIGN --- */
    .he-section { padding-top: 6rem; padding-bottom: 6rem; }
    .he-bg-soft { background-color: var(--ss-surface2, #F4F1ED); }
    
    .he-eyebrow {
      display: inline-block;
      border-radius: 9999px;
      padding: 0.25rem 0.75rem;
      font-size: 0.625rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-weight: 500;
      background-color: rgba(0,0,0,0.05);
      color: var(--ss-muted, #4F433C);
      margin-bottom: 1.5rem;
    }
    
    .he-bezel-outer {
      padding: 0.25rem;
      background-color: rgba(0,0,0,0.03);
      border-radius: 2rem;
      border: 1px solid rgba(0,0,0,0.05);
      position: relative;
    }
    
    .he-bezel-inner {
      background-color: #fff;
      border-radius: calc(2rem - 0.25rem);
      box-shadow: inset 0 1px 1px rgba(255,255,255,1), 0 4px 20px rgba(54, 43, 36, 0.04);
      padding: 1.5rem;
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .he-card-hover {
      transition: all 0.7s cubic-bezier(0.32,0.72,0,1);
    }
    .he-card-hover:hover {
      transform: translateY(-4px);
      box-shadow: inset 0 1px 1px rgba(255,255,255,1), 0 12px 30px rgba(54, 43, 36, 0.08);
    }
    
    .he-cta-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background-color: var(--ss-slate, #306061);
      color: #fff;
      font-family: var(--font-ui);
      font-weight: 700;
      padding: 0.5rem 0.5rem 0.5rem 1.5rem;
      border-radius: 9999px;
      text-decoration: none;
      transition: all 0.7s cubic-bezier(0.32,0.72,0,1);
      box-shadow: 0 4px 12px rgba(48, 96, 97, 0.2);
    }
    .he-cta-pill:hover {
      background-color: #254A4A;
      color: #fff;
    }
    .he-cta-pill:active {
      transform: scale(0.98);
    }
    .he-cta-icon-wrapper {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 9999px;
      background-color: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.7s cubic-bezier(0.32,0.72,0,1);
    }
    .he-cta-pill:hover .he-cta-icon-wrapper {
      transform: translateX(4px) translateY(-1px) scale(1.05);
      background-color: rgba(255,255,255,0.3);
    }
    
    .he-stretched-link::after {
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      z-index: 1;
      content: "";
    }
    .he-nested-btn {
      position: relative;
      z-index: 2;
    }
    
    .he-accordion-summary {
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      outline: none;
    }
    .he-accordion-summary::-webkit-details-marker { display: none; }
    .he-accordion-icon {
      font-size: 1.5rem;
      font-weight: 700;
      transition: transform 0.4s cubic-bezier(0.32,0.72,0,1);
    }
    details[open] .he-accordion-icon {
      transform: rotate(45deg);
    }
    
    .he-reveal {
      opacity: 0;
      transform: translateY(2rem);
      filter: blur(4px);
      transition: all 0.9s cubic-bezier(0.32,0.72,0,1);
    }
    .he-reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
    
    .he-days-badge {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 2rem;
      font-family: var(--font-ui);
      font-size: 0.75rem;
      font-weight: 700;
      background-color: var(--ss-surface2, #F4F1ED);
      color: var(--ss-slate, #306061);
      border: 1px solid rgba(48, 96, 97, 0.15);
    }
"""

if "/* --- HIGH-END VISUAL DESIGN --- */" not in html_content:
    html_content = html_content.replace("    /* Fonts & Custom Variables */", custom_css + "\n    /* Fonts & Custom Variables */")

new_content = f"""<!-- MAIN REDESIGNED COLUMNS SECTION -->
  <section class="he-section he-bg-soft position-relative">
    <div class="container px-4">
      <div class="mb-5 mx-auto text-center" style="max-width: 48rem;">
        <span class="he-eyebrow">Parent Competition Guide</span>
        <h1 class="serif-title mb-4" style="font-size: clamp(3rem, 6vw, 4.5rem);">Local BJJ Tournaments Near Tannersville</h1>
        <p class="lead mb-5" style="font-size: 1.25rem;">
          Competition is optional. Growth is not. We help kids and teens build confidence, composure, and resilience, on and off the mats. Use this guide to find local tournaments that fit your family's goals and your child's experience level.
        </p>
        
        <div class="mx-auto bg-white p-4 rounded-4 shadow-sm text-start" style="max-width: 42rem; border: 1px solid rgba(255,255,255,0.4); backdrop-filter: blur(8px);">
          <div class="d-flex gap-3 align-items-center">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-4"></i>
            <div class="small text-muted">
              <strong class="text-dark">Verify before registering:</strong> Tournament dates, brackets, rules, refund policies, and division availability can change. Always verify the official event page before registering. Talk with Coach Sandy first.
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Pills -->
      <div class="filter-bar mb-5 d-flex justify-content-center flex-wrap gap-2" id="tournament-filters" aria-label="Tournament filters">
        <button class="btn btn-dark btn-sm rounded-pill px-4 py-2" data-tournament-filter="all">All</button>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-4 py-2" data-tournament-filter="first">Best first conversation</button>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-4 py-2" data-tournament-filter="family">Family friendly</button>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-4 py-2" data-tournament-filter="serious">Serious test</button>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-4 py-2" data-tournament-filter="reps">More matches</button>
        <button class="btn btn-outline-dark btn-sm rounded-pill px-4 py-2" data-tournament-filter="watch">Watch list <i class="bi bi-bookmark-fill ms-1" style="font-size: 0.75rem;"></i></button>
      </div>

      <!-- CSS Grid Tournament Container -->
      <div id="tournament-grid" style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
        <!-- Generated via JS -->
      </div>
      
    </div>
  </section>

  <!-- ACCORDIONS SECTION (Von Restorff) -->
  <section class="he-section bg-white border-top border-bottom" id="parent-registration-checklist">
    <div class="container ss-container mx-auto" style="max-width: 48rem;">
      <h2 class="h3 fw-bold mb-5 text-center text-dark font-serif">Pre-Tournament Preparation</h2>
      
      <div class="d-flex flex-column gap-4">
        <!-- Checklist Accordion -->
        <details class="he-bezel-outer he-reveal">
          <summary class="he-bezel-inner he-accordion-summary" style="padding: 1.25rem 1.5rem;">
            <span class="fw-bold font-ui text-dark d-flex align-items-center gap-2"><i class="bi bi-check2-square text-success fs-5"></i>Parent Registration Checklist</span>
            <span class="he-accordion-icon">+</span>
          </summary>
          <div class="px-4 py-4" style="background-color: rgba(255,255,255,0.6); border-radius: 0 0 calc(2rem - 0.25rem) calc(2rem - 0.25rem);">
            <p class="text-muted small mb-4 px-2">Before registering, confirm these key details on the official tournament page:</p>
            <ul class="list-unstyled mb-0 px-2">
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Correct age group</strong>, division criteria varies by birth year or actual age.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Correct belt or experience level</strong>, verify match time lengths.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Realistic weight class</strong>, verify if weigh-ins are with or without Gi.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Gi and No-gi division availability</strong></span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Weigh-in rules</strong>, check if there is a weight allowance or if missing weight means DQ.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Refund policy</strong>, check if they offer credits or refunds if injured.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Registration edit deadline</strong>, normally 3-5 days before the event.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Uniform rules</strong>, check gi color allowances and patch regulations.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Start time and arrival window</strong>, usually brackets are published 1-2 days prior.</span></li>
              <li class="mb-0 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Parking and travel plan</strong>, some venues have parking fees or limited spaces.</span></li>
            </ul>
          </div>
        </details>
        
        <!-- What to Bring Accordion -->
        <details class="he-bezel-outer he-reveal">
          <summary class="he-bezel-inner he-accordion-summary" style="padding: 1.25rem 1.5rem;">
            <span class="fw-bold font-ui text-dark d-flex align-items-center gap-2"><i class="bi bi-backpack text-primary fs-5"></i>What to Bring (Tournament Bag)</span>
            <span class="he-accordion-icon">+</span>
          </summary>
          <div class="px-4 py-4" style="background-color: rgba(255,255,255,0.6); border-radius: 0 0 calc(2rem - 0.25rem) calc(2rem - 0.25rem);">
            <p class="text-muted small mb-4 px-2">Pack these items the night before the tournament to ensure a stress-free day:</p>
            <ul class="list-unstyled mb-0 px-2">
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Clean gi</strong>, washed, dry, with no tears and of legal length.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Belt</strong>, matching division belt level.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Slides or sandals</strong>, mandatory to wear off the competition mats.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Water & electrolytes</strong></span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Simple snacks</strong>, fruit, honey, energy bars.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Hoodie or warm layer</strong>, gyms can get cold between brackets.</span></li>
              <li class="mb-3 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Phone charger & power bank</strong>, brackets updates are live.</span></li>
              <li class="mb-0 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Something calm to do between matches</strong>, book or headphones.</span></li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  </section>

  <!-- SENSEI SANDY RULE -->
  <section class="he-section bg-light">
    <div class="container ss-container text-center mx-auto" style="max-width: 48rem;">
      <div class="he-bezel-outer p-1 he-reveal" style="background: linear-gradient(135deg, var(--ss-slate, #306061), var(--ss-teal, #289FA1)); border: none; overflow: hidden;">
        <div class="position-absolute rounded-circle" style="top: -80px; right: -80px; width: 250px; height: 250px; background: rgba(255,255,255,0.05); pointer-events: none;"></div>
        <div class="he-bezel-inner" style="background: transparent; box-shadow: none; padding: 4rem 2rem; z-index: 10;">
          <p class="text-uppercase fw-bold small mb-4" style="letter-spacing: 0.2em; color: rgba(255,255,255,0.85);">The Sensei Sandy Rule</p>
          <blockquote class="blockquote fs-2 fw-bold mb-4 font-serif text-white">
            “Win, lose, or learn, we come back to class better.”
          </blockquote>
          <p class="lead mb-0 fs-6" style="color: rgba(255,255,255,0.9);">
            The best tournament outcome is a student who stays safe, learns something real, and wants to keep training.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- HELPFUL LINKS -->
  <section class="he-section" aria-labelledby="links-title">
    <div class="container ss-container text-center">
      <h2 class="h4 mb-5 font-serif" id="links-title">Helpful Parent Links</h2>
      <div class="d-flex flex-wrap justify-content-center gap-3 mx-auto" style="max-width: 56rem;">
        <a class="btn btn-outline-dark py-2 px-4 rounded-pill font-ui fw-bold he-card-hover" href="/kids">Kids Jiu Jitsu in Tannersville NY</a>
        <a class="btn btn-outline-dark py-2 px-4 rounded-pill font-ui fw-bold he-card-hover" href="/teen-jiu-jitsu-tannersville-ny">Teen Jiu Jitsu in Tannersville NY</a>
        <a class="btn btn-outline-dark py-2 px-4 rounded-pill font-ui fw-bold he-card-hover" href="/book-free-intro">Reserve a Free Intro</a>
        <a class="btn btn-outline-dark py-2 px-4 rounded-pill font-ui fw-bold he-card-hover" href="/bjj-glossary">Learn Common Jiu Jitsu Terms</a>
        <a class="btn btn-outline-dark py-2 px-4 rounded-pill font-ui fw-bold he-card-hover" href="/schedule">View Class Schedule</a>
      </div>
    </div>
  </section>

  <!-- CUSTOM BOTTOM CTA BANNER -->
  <section class="pb-5 pt-4">
    <div class="container">
      <div class="he-bezel-outer p-1 he-reveal mx-auto" style="max-width: 64rem;">
        <div class="he-bezel-inner d-flex flex-column flex-md-row align-items-center justify-content-between gap-4" style="padding: 3rem;">
          
          <div class="d-flex align-items-center gap-4">
            <div class="d-none d-lg-flex align-items-center justify-content-center rounded-circle" style="width: 72px; height: 72px; flex-shrink: 0; background-color: rgba(0,0,0,0.03); color: var(--ss-slate, #306061);">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
            </div>
            <div>
              <h2 class="mb-2 font-serif" style="font-size: 2rem; color: var(--ss-ink);">Start the Journey. We'll Guide the Rest.</h2>
              <p class="mb-0 text-muted" style="max-width: 28rem;">A calm, pressure-free intro for kids and parents. See if our community feels like home.</p>
            </div>
          </div>
          <div class="text-center text-md-end flex-shrink-0">
            <a class="he-cta-pill he-nested-btn" href="/book-free-intro">
              <span>Reserve a Calm Free Intro</span>
              <div class="he-cta-icon-wrapper">
                <i class="bi bi-arrow-right"></i>
              </div>
            </a>
            <span class="d-block small text-muted mt-3">Ask questions, understand the fit.</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- DATA & LOGIC -->
  <script>
    const TOURNAMENT_DATA = {json_data};
  </script>
"""

updated_content = re.sub(f"{start_marker}.*?{end_marker}", new_content + "\n" + end_marker, html_content, flags=re.DOTALL)

with open("local-bjj-tournaments-for-parents.html", "w", encoding="utf-8") as f:
    f.write(updated_content)

print("Replaced structure successfully.")
