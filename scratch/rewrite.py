import bs4
import json
from pathlib import Path

file_path = Path("local-bjj-tournaments-for-parents.html")
html_content = file_path.read_text(encoding="utf-8")

# We will replace everything from <!-- MAIN REDESIGNED COLUMNS SECTION --> to <!--#include virtual="/cta-footer.html" -->
import re

start_marker = r"<!-- MAIN REDESIGNED COLUMNS SECTION -->"
end_marker = r"<!--#include virtual=\"/cta-footer.html\" -->"

with open("scratch/tournaments.json", "r", encoding="utf-8") as f:
    events = json.load(f)

json_data = json.dumps(events, indent=2)

new_content = f"""<!-- MAIN REDESIGNED COLUMNS SECTION -->
  <section class="py-24 position-relative" style="background-color: var(--ss-surface2, #F4F1ED);">
    <div class="container px-4 md:px-0">
      <div class="mb-16 max-w-3xl mx-auto text-center">
        <span class="inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-slate-800 mb-6">Parent Competition Guide</span>
        <h1 class="serif-title mb-6" style="font-size: clamp(3rem, 6vw, 5rem);">Local BJJ Tournaments Near Tannersville</h1>
        <p class="lead mb-8" style="font-size: 1.25rem;">
          Competition is optional. Growth is not. We help kids and teens build confidence, composure, and resilience, on and off the mats. Use this guide to find local tournaments that fit your family's goals and your child's experience level.
        </p>
        
        <div class="mx-auto bg-white/60 backdrop-blur-md border border-white/20 p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-start max-w-2xl">
          <div class="d-flex gap-3 align-items-center">
            <i class="bi bi-exclamation-triangle-fill text-warning fs-4"></i>
            <div class="small text-muted">
              <strong class="text-dark">Verify before registering:</strong> Tournament dates, brackets, rules, refund policies, and division availability can change. Always verify the official event page before registering. Talk with Coach Sandy first.
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Pills -->
      <div class="filter-bar mb-10 flex justify-center flex-wrap gap-2" aria-label="Tournament filters">
        <button class="btn btn-dark btn-sm rounded-full px-4 py-2" data-tournament-filter="all">All</button>
        <button class="btn btn-outline-dark btn-sm rounded-full px-4 py-2" data-tournament-filter="first">Best first conversation</button>
        <button class="btn btn-outline-dark btn-sm rounded-full px-4 py-2" data-tournament-filter="family">Family friendly</button>
        <button class="btn btn-outline-dark btn-sm rounded-full px-4 py-2" data-tournament-filter="serious">Serious test</button>
        <button class="btn btn-outline-dark btn-sm rounded-full px-4 py-2" data-tournament-filter="reps">More matches</button>
        <button class="btn btn-outline-dark btn-sm rounded-full px-4 py-2" data-tournament-filter="watch">Watch list <i class="bi bi-bookmark-fill ms-1" style="font-size: 0.75rem;"></i></button>
      </div>

      <!-- CSS Grid Tournament Container -->
      <div id="tournament-grid" class="d-grid gap-4" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
        <!-- Generated via JS -->
      </div>
      
    </div>
  </section>

  <!-- ACCORDIONS SECTION (Von Restorff) -->
  <section class="py-24 bg-white border-top border-bottom" id="parent-registration-checklist">
    <div class="container ss-container max-w-3xl mx-auto">
      <h2 class="h3 fw-bold mb-8 text-center text-dark">Pre-Tournament Preparation</h2>
      
      <div class="d-grid gap-4">
        <!-- Checklist Accordion -->
        <details class="p-1 bg-black/5 rounded-[2rem] border border-black/5 shadow-sm group">
          <summary class="cursor-pointer list-none px-6 py-4 bg-white rounded-[calc(2rem-0.25rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,1)] flex justify-between align-items-center">
            <span class="fw-bold font-ui text-dark"><i class="bi bi-check2-square text-success me-2"></i>Parent Registration Checklist</span>
            <span class="font-bold text-xl group-open:rotate-45 transition-transform duration-300">+</span>
          </summary>
          <div class="px-6 py-4 bg-white/50 rounded-b-[calc(2rem-0.25rem)]">
            <p class="text-muted small mb-4">Before registering, confirm these key details on the official tournament page:</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Correct age group</strong>, division criteria varies by birth year or actual age.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Correct belt or experience level</strong>, verify match time lengths.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Realistic weight class</strong>, verify if weigh-ins are with or without Gi.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Gi and No-gi division availability</strong></span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Weigh-in rules</strong>, check if there is a weight allowance or if missing weight means DQ.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Refund policy</strong>, check if they offer credits or refunds if injured.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Registration edit deadline</strong>, normally 3-5 days before the event.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Uniform rules</strong>, check gi color allowances and patch regulations.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Start time and arrival window</strong>, usually brackets are published 1-2 days prior.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span><strong>Parking and travel plan</strong>, some venues have parking fees or limited spaces.</span></li>
            </ul>
          </div>
        </details>
        
        <!-- What to Bring Accordion -->
        <details class="p-1 bg-black/5 rounded-[2rem] border border-black/5 shadow-sm group">
          <summary class="cursor-pointer list-none px-6 py-4 bg-white rounded-[calc(2rem-0.25rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,1)] flex justify-between align-items-center">
            <span class="fw-bold font-ui text-dark"><i class="bi bi-backpack text-primary me-2"></i>What to Bring (Tournament Bag)</span>
            <span class="font-bold text-xl group-open:rotate-45 transition-transform duration-300">+</span>
          </summary>
          <div class="px-6 py-4 bg-white/50 rounded-b-[calc(2rem-0.25rem)]">
            <p class="text-muted small mb-4">Pack these items the night before the tournament to ensure a stress-free day:</p>
            <ul class="list-unstyled mb-0">
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Clean gi</strong>, washed, dry, with no tears and of legal length.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Belt</strong>, matching division belt level.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Slides or sandals</strong>, mandatory to wear off the competition mats.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Water & electrolytes</strong></span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Simple snacks</strong>, fruit, honey, energy bars.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Hoodie or warm layer</strong>, gyms can get cold between brackets.</span></li>
              <li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Phone charger & power bank</strong>, brackets updates are live.</span></li>
              <li class="mb-0 d-flex align-items-start gap-2"><i class="bi bi-box-seam-fill text-primary mt-1"></i><span><strong>Something calm to do between matches</strong>, book or headphones.</span></li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  </section>

  <!-- SENSEI SANDY RULE -->
  <section class="py-24 bg-light">
    <div class="container ss-container text-center max-w-3xl mx-auto">
      <div class="p-1 bg-gradient-to-br from-[#306061] to-[#289FA1] rounded-[2rem] shadow-xl relative overflow-hidden">
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full pointer-events-none"></div>
        <div class="bg-black/10 rounded-[calc(2rem-0.25rem)] p-12 relative z-10 backdrop-blur-sm">
          <p class="text-uppercase fw-bold small mb-4 tracking-[0.2em] text-white/80">The Sensei Sandy Rule</p>
          <blockquote class="blockquote fs-2 fw-bold mb-6 font-serif text-white">
            “Win, lose, or learn, we come back to class better.”
          </blockquote>
          <p class="lead mb-0 fs-6 text-white/90">
            The best tournament outcome is a student who stays safe, learns something real, and wants to keep training.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- HELPFUL LINKS -->
  <section class="py-24" aria-labelledby="links-title">
    <div class="container ss-container text-center">
      <h2 class="h4 mb-8" id="links-title">Helpful Parent Links</h2>
      <div class="d-flex flex-wrap justify-content-center gap-3 max-w-4xl mx-auto">
        <a class="btn btn-outline-dark py-3 px-6 rounded-full font-ui fw-bold transition-all hover:-translate-y-1" href="/kids">Kids Jiu Jitsu in Tannersville NY</a>
        <a class="btn btn-outline-dark py-3 px-6 rounded-full font-ui fw-bold transition-all hover:-translate-y-1" href="/teen-jiu-jitsu-tannersville-ny">Teen Jiu Jitsu in Tannersville NY</a>
        <a class="btn btn-outline-dark py-3 px-6 rounded-full font-ui fw-bold transition-all hover:-translate-y-1" href="/book-free-intro">Reserve a Free Intro</a>
        <a class="btn btn-outline-dark py-3 px-6 rounded-full font-ui fw-bold transition-all hover:-translate-y-1" href="/bjj-glossary">Learn Common Jiu Jitsu Terms</a>
        <a class="btn btn-outline-dark py-3 px-6 rounded-full font-ui fw-bold transition-all hover:-translate-y-1" href="/schedule">View Class Schedule</a>
      </div>
    </div>
  </section>

  <!-- CUSTOM BOTTOM CTA BANNER -->
  <section class="py-12 pb-24">
    <div class="container">
      <div class="p-1 bg-black/5 rounded-[2rem] shadow-lg max-w-5xl mx-auto overflow-hidden relative">
        <div class="bg-white rounded-[calc(2rem-0.25rem)] p-8 md:p-12 d-flex flex-column flex-md-row align-items-center justify-content-between gap-6 relative z-10 shadow-[inset_0_1px_1px_rgba(255,255,255,1)]">
          
          <div class="d-flex align-items-center gap-6">
            <div class="d-none d-lg-flex align-items-center justify-content-center bg-black/5 border border-black/5 rounded-full" style="width: 80px; height: 80px; flex-shrink: 0; color: var(--ss-slate, #306061);">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
            </div>
            <div>
              <h2 class="mb-2 font-serif text-3xl text-dark">Start the Journey. We'll Guide the Rest.</h2>
              <p class="mb-0 text-muted max-w-md">A calm, pressure-free intro for kids and parents. See if our community feels like home.</p>
            </div>
          </div>
          <div class="text-center text-md-end shrink-0">
            <a class="group inline-flex items-center gap-3 bg-[#306061] text-white font-ui font-bold px-2 py-2 rounded-full transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:bg-[#254A4A] text-decoration-none shadow-md pl-6" href="/book-free-intro">
              <span>Reserve a Calm Free Intro</span>
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:bg-white/30">
                <i class="bi bi-arrow-right"></i>
              </div>
            </a>
            <span class="d-block small text-muted mt-3">Ask questions, understand the fit, and choose the next step.</span>
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

with open("scratch/local-bjj-tournaments-for-parents-new.html", "w", encoding="utf-8") as f:
    f.write(updated_content)

print("Generated new HTML")
