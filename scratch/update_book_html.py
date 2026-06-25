import re

with open("book-free-intro/index.html", "r") as f:
    content = f.read()

# 1. Remove Stray "S" watermark
content = content.replace('<div class="ss-footer-watermark">S</div>', '')

# 2. Eradicate redundant CTAs and Guided Process (Replace with Progressive UI)
# Using regex to find from <!-- MOBILE INSTAGRAM BOOKING to <!--#include virtual="/partials/booking-router.html" -->
pattern = r"<!-- MOBILE INSTAGRAM BOOKING \(QA REQ - HIDDEN\) -->.*?<!--#include virtual=\"/partials/booking-router\.html\" -->"
progressive_ui = """<!-- PROGRESSIVE BOOKING UI -->
      <section class="w-100 ss-section ss-progressive-booking" style="order: 3" id="booking-flow">
        <div class="container">
          
          <!-- STEP 1: Who is training? -->
          <div id="pb-step-1" class="pb-step pb-step-active">
            <span class="ss-eyebrow-pill d-inline-flex mx-auto mb-3">Step 1 of 3</span>
            <h2 class="h2 text-center mb-4" style="font-family: 'Instrument Serif', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 400; color: var(--ss-ink); letter-spacing: -0.02em; font-style: italic;">
              Who is training?
            </h2>
            <div class="row justify-content-center g-4">
              <div class="col-md-5 col-lg-4">
                <button class="pb-card-btn w-100 h-100" data-audience="adult">
                  <div class="pb-card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                  <h3>Adults</h3>
                  <p>Ages 16+</p>
                </button>
              </div>
              <div class="col-md-5 col-lg-4">
                <button class="pb-card-btn w-100 h-100" data-audience="youth">
                  <div class="pb-card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>
                  <h3>Youth</h3>
                  <p>Kids & Teens</p>
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 2: Which class lane fits? -->
          <div id="pb-step-2" class="pb-step pb-step-hidden" style="display: none;">
            <button class="pb-back-btn mb-3 btn btn-link text-decoration-none" data-back-to="1">&larr; Back</button>
            <div class="text-center"><span class="ss-eyebrow-pill d-inline-flex mx-auto mb-3">Step 2 of 3</span></div>
            <h2 class="h2 text-center mb-4" style="font-family: 'Instrument Serif', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 400; color: var(--ss-ink); letter-spacing: -0.02em; font-style: italic;">
              Which class lane fits best?
            </h2>
            
            <div id="pb-lanes-adult" class="row justify-content-center g-4 pb-lanes" style="display: none;">
              <div class="col-md-4">
                <button class="pb-card-btn w-100 h-100" data-lane="fundamentals">
                  <h3>Fundamentals</h3>
                  <p>Perfect for beginners.</p>
                </button>
              </div>
              <div class="col-md-4">
                <button class="pb-card-btn w-100 h-100" data-lane="advanced">
                  <h3>Advanced</h3>
                  <p>Competition & Live rolling.</p>
                </button>
              </div>
              <div class="col-md-4">
                <button class="pb-card-btn w-100 h-100" data-lane="leo">
                  <h3>LEO / Tactical</h3>
                  <p>Law enforcement focus.</p>
                </button>
              </div>
            </div>

            <div id="pb-lanes-youth" class="row justify-content-center g-4 pb-lanes" style="display: none;">
              <div class="col-md-5">
                <button class="pb-card-btn w-100 h-100" data-lane="kids">
                  <h3>Kids</h3>
                  <p>Ages 6-11</p>
                </button>
              </div>
              <div class="col-md-5">
                <button class="pb-card-btn w-100 h-100" data-lane="teens">
                  <h3>Teens</h3>
                  <p>Ages 12-15</p>
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 3: Choose a Time -->
          <div id="pb-step-3" class="pb-step pb-step-hidden" style="display: none;">
            <button class="pb-back-btn mb-3 btn btn-link text-decoration-none" data-back-to="2">&larr; Back</button>
            <div class="text-center"><span class="ss-eyebrow-pill d-inline-flex mx-auto mb-3">Step 3 of 3</span></div>
            <h2 class="h2 text-center mb-4" style="font-family: 'Instrument Serif', serif; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 400; color: var(--ss-ink); letter-spacing: -0.02em; font-style: italic;">
              Choose your time
            </h2>
            <!-- The Calendly JS will mount into #calendly-embed automatically if there are trigger buttons. We will manually init inline widget. -->
            <div id="calendly-embed-container" style="min-width:320px;height:700px;" data-calendly-url="https://calendly.com/senseisandy/bjj-goal-mapping-session"></div>
          </div>

          <!-- STEP 4: Show-Up Kit -->
          <div id="pb-step-4" class="pb-step pb-step-hidden" style="display: none;">
            <div class="pb-success-card text-center p-5 mx-auto" style="max-width: 600px; background: #fff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid rgba(54, 43, 36, 0.08);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ss-green)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <h2 class="h2 mt-3 mb-3">You're booked!</h2>
              <p class="lead mb-4" style="color: var(--ss-muted);">Here is your Show-Up Kit to make your first day a breeze.</p>
              
              <div class="text-start mb-4 p-4" style="background: rgba(244, 241, 237, 0.5); border-radius: 12px;">
                <h4 class="h5" style="color: var(--ss-ink);">What to Expect</h4>
                <p style="color: var(--ss-muted); font-size: 0.95rem;">A room tour, safety walkthrough, and skill-based resistance activities at the right pace from day one.</p>
                
                <h4 class="h5 mt-3" style="color: var(--ss-ink);">What to Wear</h4>
                <p style="color: var(--ss-muted); font-size: 0.95rem;">Comfortable workout clothes. We train barefoot on sanitized mats. (Academy rashguards and shorts are available on-site!)</p>
                
                <h4 class="h5 mt-3" style="color: var(--ss-ink);">Location</h4>
                <p style="color: var(--ss-muted); font-size: 0.95rem;">6045 Main Street, 2nd Floor Studio, Tannersville, NY 12485</p>
              </div>

              <a href="/waiver" class="btn btn-primary ss-btn-primary w-100 mb-3" style="border-radius: 999px;">Sign Digital Waiver Now</a>
              <p class="small text-muted mt-3">You can also text Sandy at +1 (917) 736-8649 if you need to reschedule.</p>
            </div>
          </div>

        </div>
      </section>"""
content = re.sub(pattern, progressive_ui, content, flags=re.DOTALL)

# 3. Remove FINAL CTA SECTION
pattern_final = r"<!-- FINAL CTA SECTION -->.*?<!-- Watermark S logo -->.*?</div>\s*</div>\s*</section>"
content = re.sub(pattern_final, "", content, flags=re.DOTALL)

# 4. Inject progressive-booking.js script
script_tag = '<script src="/js/progressive-booking.js" defer></script>'
content = content.replace('<script src="/assets/js/ss-evidence-accordion.c9619a.js" defer></script>', 
                          f'<script src="/assets/js/ss-evidence-accordion.c9619a.js" defer></script>\n    {script_tag}')

with open("book-free-intro/index.html", "w") as f:
    f.write(content)

print("HTML update complete.")
