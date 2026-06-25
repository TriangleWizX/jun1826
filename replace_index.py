import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the First Visit section
old_section = re.search(r'(<article class="ss-home-flow-card w-100">.*?)<div class="ss-home-steps"', content, re.DOTALL)
if old_section:
    new_intro = """<article class="ss-home-flow-card w-100">
          <span class="ss-home-kicker">Your Two-Step Free Intro</span>
          <h2 id="ss-home-flow-title">Your Two-Step Free Intro</h2>
          
          <p class="lead mb-3" style="font-family: var(--sans-font); font-size: 1.15rem; color: var(--ss-muted); line-height: 1.6;">
            Starting Jiu-Jitsu should feel clear from the beginning. Your Free Intro includes two separate visits.
          </p>
          
          <div class="mb-5">
            <a class="ss-btn ss-btn-primary ss-btn-island group" href="/free-bjj-intro-tannersville-ny" data-cta-target="intro"
              data-cta-label="Book Your Free Goal Mapping Session" data-cta-src="home-first-visit"
              data-cta-placement="funnel_book" data-cta-tier="primary" data-cta-lane="mixed">
              <span class="ss-btn-text">Book Your Free Goal Mapping Session</span>
              <span class="ss-btn-icon-wrapper">
                <i class="bi bi-calendar2-event" aria-hidden="true"></i>
              </span>
            </a>
          </div>
"""
    content = content.replace(old_section.group(1), new_intro)

old_steps = re.search(r'<div class="ss-home-steps".*?</section>', content, re.DOTALL)
if old_steps:
    new_steps = """<div class="ss-home-steps" aria-label="First visit steps">
            <article class="ss-home-step">
              <div class="ss-home-step__top">
                <span class="ss-home-step__index">01</span>
                <span class="ss-home-step__icon"><i class="bi bi-door-open" aria-hidden="true"></i></span>
              </div>
              <h3>Map Your Goal</h3>
              <p>Meet Sandy for 15 minutes. Tour the studio, discuss your goals, and select the right first class.</p>
            </article>

            <article class="ss-home-step">
              <div class="ss-home-step__top">
                <span class="ss-home-step__index">02</span>
                <span class="ss-home-step__icon"><i class="bi bi-compass" aria-hidden="true"></i></span>
              </div>
              <h3>Attend Your First Class</h3>
              <p>Return for a reserved group class and experience the coaching, partners, and training structure.</p>
            </article>
          </div>
        </article>
      </div>
    </section>"""
    content = content.replace(old_steps.group(0), new_steps)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

