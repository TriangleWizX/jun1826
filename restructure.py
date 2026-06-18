import re

with open('index.html', 'r') as f:
    content = f.read()

# Define regex patterns for sections
hero_pattern = re.compile(r'(<section class="home-hero.*?<\/section>)', re.DOTALL)
reassurance_pattern = re.compile(r'(<section class="home-reassurance ss-section ss-reveal".*?<\/section>)', re.DOTALL)
lane_cards_pattern = re.compile(r'(<section class="ss-home-section ss-home-section--lane-schedule" id="choose-starting-point".*?<\/section>)', re.DOTALL)
index_story_pattern = re.compile(r'(<section class="index-story".*?<\/section>)', re.DOTALL)
booking_router_pattern = re.compile(r'(<!--#include virtual="/partials/booking-router\.html" -->)')
reviews_village_pattern = re.compile(r'(<!--#include virtual="/partials/reviews-village\.html" -->)')
schedule_pattern = re.compile(r'(<section class="ss-home-section ss-home-section--schedule ss-reveal".*?<\/section>)', re.DOTALL)
flow_pattern = re.compile(r'(<section class="ss-home-section ss-home-section--flow ss-reveal".*?<\/section>)', re.DOTALL)
links_pattern = re.compile(r'(<section class="ss-home-section ss-home-section--links ss-reveal".*?<\/section>)', re.DOTALL)
final_cta_pattern = re.compile(r'(<!-- FINAL CTA -->.*?<\/div>)', re.DOTALL)

# Extract sections
hero = hero_pattern.search(content).group(1)
lane_cards = lane_cards_pattern.search(content).group(1)
flow = flow_pattern.search(content).group(1)
reviews_village = reviews_village_pattern.search(content).group(1)
schedule = schedule_pattern.search(content).group(1)
booking_router = booking_router_pattern.search(content).group(1)
links = links_pattern.search(content).group(1)
final_cta = final_cta_pattern.search(content).group(1)

coach_credibility = """    <section class="ss-home-section ss-home-section--coach ss-reveal" aria-labelledby="coach-credibility-title">
      <div class="container">
        <div class="ss-double-bezel">
          <div class="ss-double-bezel-inner">
            <span class="ss-home-kicker">Who We Are</span>
            <h2 id="coach-credibility-title">A small studio built around steady progress.</h2>
            <p>
              Sensei Sandy BJJ is a small, coach-led Brazilian Jiu-Jitsu studio in Tannersville, New York. Sandy teaches with clear language, patient pacing, and a steady structure so kids, teens, adults, and returning students know where to begin.
            </p>
            <p>
              The goal is bigger than learning jiu-jitsu techniques. It is to create a room where people feel seen, supported, and capable of making steady progress together.
            </p>
            <div class="mt-4">
              <a class="ss-home-inline-link" href="/bio">
                Read Sandy's Bio <i class="bi bi-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>"""

# Assemble new main content
new_main = f"""
    {hero}

    {lane_cards}

    {flow}

    {reviews_village}

    {schedule}

    {coach_credibility}

    {booking_router}

    {links}

    {final_cta}
"""

# Replace in content
main_pattern = re.compile(r'(<main class="ss-main ss-home-mockup" id="main-content" role="main">).*?(</main>)', re.DOTALL)
new_content = main_pattern.sub(r'\1' + new_main + r'\2', content)

with open('index.html', 'w') as f:
    f.write(new_content)
print("Done")
