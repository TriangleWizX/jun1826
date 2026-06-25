import re

with open("nearby-towns.html", "r") as f:
    content = f.read()

# 1. Hero Image Replacement
hero_old = """<div class="ss-hero-image-box"><img class="ss-hero-img" src="/assets/images/famfriday-320.d45604.webp" alt="Sensei Sandy coaching a young student in a bright studio" loading="eager" width="540" height="480"></div>"""
hero_new = """<div class="ss-hero-image-box text-center">
    <img class="ss-hero-img" src="/assets/images/hero_exterior_1782405460053.jpg" alt="Exterior of the building containing Sensei Sandy BJJ at 6045 Main Street in Tannersville, New York." loading="eager" fetchpriority="high" width="1600" height="1200" style="object-fit: cover; aspect-ratio: 4/3; border-radius: 20px; border: 1px solid rgba(54, 43, 36, 0.14); box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 100%; height: auto; max-width: 540px;">
    <p class="mt-2 mb-0 small text-muted fw-semibold">6045 Main Street &middot; Second-floor studio &middot; Tannersville</p>
</div>"""
content = content.replace(hero_old, hero_new)

# 2. Add Arrival Section
arrival_html = """</section>

<!-- ARRIVAL SEQUENCE -->
<section class="ss-arrival-section container py-5" aria-labelledby="arrival-title">
  <div class="text-center mb-5">
    <h2 id="arrival-title">Know Exactly What to Look For</h2>
    <p class="lead text-muted" style="max-width: 600px; margin: 0 auto;">Your first visit should not begin with a scavenger hunt. Here is the short path from Main Street to the mat.</p>
  </div>
  <div class="row g-4 text-center">
    <div class="col-md-4">
      <img src="/assets/images/arrival_across_street_1782405470509.jpg" alt="View of the Sensei Sandy BJJ building from across Main Street in Tannersville." class="img-fluid mb-3" style="object-fit: cover; aspect-ratio: 3/2; border-radius: 20px; border: 1px solid rgba(54, 43, 36, 0.14); box-shadow: 0 4px 12px rgba(0,0,0,0.05);" loading="lazy">
      <p class="fw-bold m-0 text-dark">1. Find 6045 Main Street</p>
    </div>
    <div class="col-md-4">
      <img src="/assets/images/arrival_front_door_1782405481275.jpg" alt="Street-level entrance used to reach Sensei Sandy BJJ on the second floor." class="img-fluid mb-3" style="object-fit: cover; aspect-ratio: 3/2; border-radius: 20px; border: 1px solid rgba(54, 43, 36, 0.14); box-shadow: 0 4px 12px rgba(0,0,0,0.05);" loading="lazy">
      <p class="fw-bold m-0 text-dark">2. Enter Through This Door</p>
    </div>
    <div class="col-md-4">
      <img src="/assets/images/arrival_hallway_1782405493033.jpg" alt="Second-floor hallway and doorway leading into the Sensei Sandy BJJ studio." class="img-fluid mb-3" style="object-fit: cover; aspect-ratio: 3/2; border-radius: 20px; border: 1px solid rgba(54, 43, 36, 0.14); box-shadow: 0 4px 12px rgba(0,0,0,0.05);" loading="lazy">
      <p class="fw-bold m-0 text-dark">3. Follow the Hallway Upstairs</p>
    </div>
  </div>
  <div class="text-center mt-5">
    <a href="/directions" class="text-decoration-none fw-semibold" style="color: var(--ss-text);">See parking and complete day-of directions &rarr;</a>
  </div>
</section>

<!-- 3. CHOOSE YOUR FIRST CLASS LANE SECTION -->"""
content = content.replace("</section><!-- 3. CHOOSE YOUR FIRST CLASS LANE SECTION -->", arrival_html)

# 3. Update Choose First Class Lane Section with Old Image
lanes_header_old = """<div class="ss-lanes-header"><div class="ss-line"></div><h2 id="lanes-title">Choose your first class lane</h2><div class="ss-line"></div></div>"""
lanes_header_new = """<div class="ss-lanes-header row align-items-center mb-4">
    <div class="col-md-8 text-md-start text-center">
        <h2 id="lanes-title" class="mb-2">Choose your first class lane</h2>
    </div>
    <div class="col-md-4 text-center mt-3 mt-md-0">
        <img src="/assets/images/famfriday-320.d45604.webp" alt="Sensei Sandy with students and members of the local Jiu-Jitsu community." class="img-fluid rounded-4 shadow-sm" style="max-width: 200px; border: 1px solid rgba(54, 43, 36, 0.14);" loading="lazy">
    </div>
</div>"""
content = content.replace(lanes_header_old, lanes_header_new)

# 4. Add Studio Interior
studio_interior_html = """</section>

<!-- STUDIO INTERIOR SECTION -->
<section class="container py-5 text-center" aria-labelledby="studio-proof-title">
  <h2 id="studio-proof-title">A Calm Room Worth the Drive</h2>
  <p class="lead mb-4" style="color: var(--ss-muted); max-width: 700px; margin: 0 auto;">Small classes, clear coaching and a clean mat space in the center of Tannersville. See the room before you choose a weekly class.</p>
  <img src="/assets/images/studio_interior_1782405513642.jpg" alt="Clean mat space inside the second-floor Sensei Sandy BJJ studio in Tannersville." class="img-fluid w-100 mb-3" style="object-fit: cover; aspect-ratio: 16/9; max-height: 520px; border-radius: 20px; border: 1px solid rgba(54, 43, 36, 0.14); box-shadow: 0 4px 12px rgba(0,0,0,0.05);" loading="lazy">
  <div class="d-flex flex-wrap justify-content-center gap-2 gap-md-4 mb-4 text-dark small fw-bold text-uppercase" style="letter-spacing: 0.05em;">
    <span>Small class cap</span> <span class="d-none d-md-inline">&bull;</span>
    <span>Beginner-guided</span> <span class="d-none d-md-inline">&bull;</span>
    <span>Clean mat space</span>
  </div>
  <div class="mt-4">
    <a href="/safety" class="d-inline-block text-decoration-none">
      <div class="card bg-white" style="max-width: 280px; margin: 0 auto; border-radius: 16px; border: 1px solid rgba(54, 43, 36, 0.14); box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
         <img src="/assets/images/cleaning_poster_1782405534541.jpg" alt="Sandy cleaning and resetting the studio mats before class." class="card-img-top" style="object-fit: cover; aspect-ratio: 16/9;" loading="lazy">
         <div class="card-body p-3">
           <span class="fw-semibold text-dark small">See How the Room Is Reset Before Class</span>
         </div>
      </div>
    </a>
  </div>
</section>

<!-- 4. CURRENT SCHEDULE SECTION -->"""
content = content.replace("</section><!-- 4. CURRENT SCHEDULE SECTION -->", studio_interior_html)

# 5. Pick Your Drive Time
dir_summary_old = """<p class="ss-dir-summary"> Greene County planning lists <strong>Haines Falls</strong> among county hamlets, and NCES lists Hunter-Tannersville CSD as an open regular local district at <strong>6094 Main St, Tannersville, NY 12485</strong> serving PK-12 across 2 schools. <a href="https://greenecountyny.gov/departments/planning/" target="_blank" rel="noopener noreferrer">Greene County Planning</a> &bull; <a href="https://nces.ed.gov/ccd/districtsearch/district_detail.asp?ID2=3615060" target="_blank" rel="noopener noreferrer">NCES district profile</a></p>"""
dir_summary_new = """<p class="ss-dir-summary">Choose the town or drive-time range that best matches your starting point. Each local page explains the route, class options and easiest first visit.</p>"""
content = content.replace(dir_summary_old, dir_summary_new)

# 6. Coming Today CTA
coming_today_old = """<section class="ss-footer-cta-section" aria-labelledby="day-of-directions-title"><div class="ss-footer-cta-container"><div class="ss-footer-cta-left"><img class="ss-footer-cta-logo" src="/assets/img/brand/sensei-sandy-bjj-logo-256.905957.webp" alt="Sensei Sandy BJJ mountain logo" width="90" height="90" loading="lazy" decoding="async"></div><div class="ss-footer-cta-center"><p class="mb-2 text-uppercase small fw-semibold" style="color: var(--ss-muted, #4F433C) !important;">Coming today?</p><h2 id="day-of-directions-title" style="color: var(--ss-text, #1F1712) !important;">Use the directions page for parking, entry, stairs, and what to do if you cannot find the door.</h2><p style="color: var(--ss-text, #1F1712) !important;">Choose your town here, then switch to the day-of arrival page when you are ready to drive.</p></div><div class="ss-footer-cta-right"><a class="ss-footer-cta-btn-primary" href="/bjj-tannersville-ny-directions"><span>Get Day-of Directions</span><svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a><a class="ss-footer-cta-link" href="https://maps.google.com/?q=6045%20Main%20Street%2C%20Tannersville%2C%20NY%2012485" target="_blank" rel="noopener" style="color: var(--ss-text, #1F1712) !important;"><span>Open Google Maps</span></a><a class="ss-footer-cta-link" href="sms:+19177368649" style="color: var(--ss-text, #1F1712) !important;"><span>Text Sandy First</span></a></div></div></section>"""
coming_today_new = """<section class="container py-5" aria-labelledby="day-of-directions-title">
  <div class="row align-items-center bg-white p-4 p-md-5 rounded-4 shadow-sm" style="border: 1px solid rgba(54, 43, 36, 0.14);">
    <div class="col-md-6 mb-4 mb-md-0">
      <p class="mb-2 text-uppercase small fw-bold" style="color: var(--ss-muted, #4F433C); letter-spacing: 0.1em;">Coming today?</p>
      <h2 id="day-of-directions-title" class="mb-3" style="color: var(--ss-text, #1F1712);">Use the directions page for parking, entry, stairs, and what to do if you cannot find the door.</h2>
      <div class="d-flex flex-column gap-3 mt-4">
        <a class="btn btn-dark w-100 rounded-pill py-3 fw-bold d-flex justify-content-center align-items-center" href="/bjj-tannersville-ny-directions" style="background-color: #116A42; border: none;">
          Get Day-of Directions
        </a>
        <div class="d-flex flex-column flex-sm-row justify-content-center gap-3 w-100 text-center">
            <a class="text-decoration-none fw-semibold" href="https://maps.google.com/?q=6045%20Main%20Street%2C%20Tannersville%2C%20NY%2012485" target="_blank" rel="noopener" style="color: var(--ss-text, #1F1712);">Open Google Maps</a>
            <span class="d-none d-sm-inline text-muted">&bull;</span>
            <a class="text-decoration-none fw-semibold" href="sms:+19177368649" style="color: var(--ss-text, #1F1712);">Text Sandy First</a>
        </div>
      </div>
    </div>
    <div class="col-md-6 text-center">
      <img src="/assets/images/parking_view_1782405522745.jpg" alt="View toward the nearby parking area from the second-floor Sensei Sandy BJJ studio." class="img-fluid rounded-4 shadow-sm" style="object-fit: cover; aspect-ratio: 4/3; border: 1px solid rgba(54, 43, 36, 0.14);" loading="lazy">
      <p class="small text-muted mt-2 fw-semibold">Parking and arrival details are available on the directions page.</p>
    </div>
  </div>
</section>"""
content = content.replace(coming_today_old, coming_today_new)

# 7. Final CTA Block
final_cta_old = """<!-- 7. FOOTER CTA BLOCK --><section class="ss-footer-cta-section" aria-label="Call to action block"><div class="ss-footer-cta-container"><div class="ss-footer-cta-left"><img class="ss-footer-cta-logo" src="/assets/img/brand/sensei-sandy-bjj-logo-256.905957.webp" alt="Sensei Sandy BJJ mountain logo" width="90" height="90" loading="lazy" decoding="async"></div><div class="ss-footer-cta-center"><h2 style="color: var(--ss-text, #1F1712) !important;">Ready to get started?</h2><p style="color: var(--ss-text, #1F1712) !important;">Reserve a calm, pressure-free Free Intro today.</p></div><div class="ss-footer-cta-right"><a class="ss-footer-cta-btn-primary" href="/free-bjj-intro-tannersville-ny" data-leo-event="leo_nearby_towns_free_intro_click"><svg class="icon-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>Reserve a Calm Free <u>Intro</u></span><svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a><a class="ss-footer-cta-link" href="sms:+19177368649" data-leo-event="leo_nearby_towns_text_sandy_click" style="color: var(--ss-text, #1F1712) !important;"><svg class="icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span>Prefer to text? <u>Text Sandy</u></span></a></div></div></section>"""
final_cta_new = """<!-- 7. FOOTER CTA BLOCK -->
<section class="container py-5 my-4 text-center" aria-label="Call to action block">
  <div class="mx-auto" style="max-width: 600px;">
    <h2 class="mb-3" style="color: var(--ss-text, #1F1712);">Ready to See Whether the Drive Fits Your Week?</h2>
    <p class="lead mb-4" style="color: var(--ss-text, #1F1712);">Reserve a calm Free Intro, see the room and choose the class lane that makes sense for your schedule.</p>
    <div class="d-flex flex-column align-items-center gap-3">
      <a class="btn btn-dark w-100 rounded-pill py-3 fw-bold d-flex justify-content-center align-items-center" href="/free-bjj-intro-tannersville-ny" style="background-color: #116A42; border: none; max-width: 300px;">
        Reserve Your Free Intro
      </a>
      <a class="text-decoration-none fw-semibold" href="sms:+19177368649" style="color: var(--ss-text, #1F1712);">
        Text Sandy
      </a>
    </div>
  </div>
</section>"""
content = content.replace(final_cta_old, final_cta_new)

with open("nearby-towns.html", "w") as f:
    f.write(content)
