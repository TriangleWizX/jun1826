import sys

with open("schedule.html", "r") as f:
    lines = f.readlines()

new_content = """    <!-- 1. Hero + Calendar Section (Editorial Split & Double-Bezel) -->
    <section class="ss-hero-editorial-split" aria-labelledby="ss-schedule-hero-title">
      <div class="ss-editorial-left ss-anim-fade-up">
        <span class="ss-eyebrow-badge" style="margin-bottom: 1rem; display: inline-block;">Tannersville, NY</span>
        <h1 id="ss-schedule-hero-title" class="ss-editorial-title">Choose the class that fits your week</h1>
        <p class="ss-editorial-lead">
          Start with a guided Free Intro. Compare youth, adult, morning, and weekend lanes in one calm view, then book the first visit that feels right.
        </p>
        <div class="ss-hero-actions">
          <a href="/free-bjj-intro-tannersville-ny" class="ss-btn-premium">
            <span>Reserve Free Intro</span>
            <div class="ss-btn-premium-icon">
              <i class="ph-light ph-arrow-up-right" aria-hidden="true"></i>
            </div>
          </a>
        </div>
        
        <ul class="ss-hero-features-row" aria-label="First class includes" style="margin-top: 3rem;">
          <li><i class="ph-light ph-door-open" aria-hidden="true"></i><span>Room tour</span></li>
          <li><i class="ph-light ph-shield-check" aria-hidden="true"></i><span>Safety walkthrough</span></li>
          <li><i class="ph-light ph-user" aria-hidden="true"></i><span>Beginner Lane</span></li>
        </ul>
      </div>

      <div class="ss-editorial-right ss-anim-fade-up ss-anim-delay-1">
        <div class="ss-calendar-bezel-outer">
          <div class="ss-calendar-bezel-inner">
            
            <!-- Monday -->
            <a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Monday</span>
                <span class="ss-cal-day-badge active">Gi Evening</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">5:00 PM</span>
                <span class="ss-cal-slot-name">Youth Class</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">6:00 PM</span>
                <span class="ss-cal-slot-name">Adult Class</span>
              </div>
            </a>

            <!-- Tuesday -->
            <a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Tuesday</span>
                <span class="ss-cal-day-badge active">Gi Evening</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">6:30 AM</span>
                <span class="ss-cal-slot-name">Private Lesson (By Request)</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">5:00 PM</span>
                <span class="ss-cal-slot-name">Youth Class</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">6:00 PM</span>
                <span class="ss-cal-slot-name">Adult Class</span>
              </div>
            </a>

            <!-- Wednesday -->
            <a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Wednesday</span>
                <span class="ss-cal-day-badge nogi">No-Gi Evening</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">10:00 AM</span>
                <span class="ss-cal-slot-name">Private Lesson (By Request)</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">5:00 PM</span>
                <span class="ss-cal-slot-name">Youth Class No-Gi</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">6:00 PM</span>
                <span class="ss-cal-slot-name">Adult Class No-Gi</span>
              </div>
            </a>

            <!-- Thursday -->
            <div class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Thursday</span>
                <span class="ss-cal-day-badge">Privates Only</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">6:30 AM</span>
                <span class="ss-cal-slot-name">Private Lesson (By Request)</span>
              </div>
            </div>

            <!-- Friday -->
            <a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Friday</span>
                <span class="ss-cal-day-badge active">Gi Evening</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">10:00 AM</span>
                <span class="ss-cal-slot-name">Private Lesson (By Request)</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">5:00 PM</span>
                <span class="ss-cal-slot-name">Youth Class</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">6:00 PM</span>
                <span class="ss-cal-slot-name">Adult Class</span>
              </div>
            </a>

            <!-- Saturday -->
            <a href="/free-bjj-intro-tannersville-ny" class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Saturday</span>
                <span class="ss-cal-day-badge nogi">No-Gi Weekend</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">10:30 AM</span>
                <span class="ss-cal-slot-name">Adult Class No-Gi</span>
              </div>
            </a>

            <!-- Sunday -->
            <div class="ss-cal-day">
              <div class="ss-cal-day-header">
                <span class="ss-cal-day-name">Sunday</span>
                <span class="ss-cal-day-badge">Rest Day</span>
              </div>
              <div class="ss-cal-slot">
                <span class="ss-cal-slot-time">All Day</span>
                <span class="ss-cal-slot-name">Private Lessons / Closed</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
"""

# Replace lines 54 (index 54) to 420 (index 420)
lines = lines[:54] + [new_content] + lines[421:]

with open("schedule.html", "w") as f:
    f.writelines(lines)
