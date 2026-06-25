import re

with open('show-up-kit.html', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the main cluster area starting with `<section class="showup-cluster" aria-labelledby="showup-bento-title">`
old_cluster_pattern = r'<section class="showup-cluster" aria-labelledby="showup-bento-title">.*?(<section class="showup-visit")'
new_cluster = """<section class="showup-cluster" aria-labelledby="showup-bento-title">
    <div class="showup-bento-grid">
      
      <!-- Goal Mapping Session -->
      <article class="showup-panel showup-panel--accent">
        <p class="showup-panel__eyebrow">Step 1</p>
        <h2 class="showup-panel__title" id="showup-bento-title">Goal Mapping Session</h2>
        <p class="showup-panel__lede">15 minutes. No workout required.</p>
        <div class="showup-check-grid">
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-shirt"></use></svg></span>
            <strong>Wear normal clothes</strong>
            <span>No workout during this appointment.</span>
          </div>
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-doc-check"></use></svg></span>
            <strong>Bring your calendar</strong>
            <span>We'll schedule your free first class.</span>
          </div>
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-droplet"></use></svg></span>
            <strong>Parent attends for minors</strong>
            <span>A parent or guardian must be present.</span>
          </div>
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-parking"></use></svg></span>
            <strong>Arrive 5 minutes early</strong>
            <span>Give yourself a quiet couple of minutes before we start.</span>
          </div>
        </div>
      </article>

      <!-- First Group Class -->
      <article class="showup-panel">
        <p class="showup-panel__eyebrow">Step 2</p>
        <h2 class="showup-panel__title">First Group Class</h2>
        <p class="showup-panel__lede">Experience a real Sensei Sandy BJJ group class.</p>
        <div class="showup-check-grid">
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-shirt"></use></svg></span>
            <strong>Wear clean athletic clothes</strong>
            <span>Follow the class-specific Gi or No-Gi instructions. Remove jewelry.</span>
          </div>
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-droplet"></use></svg></span>
            <strong>Bring water</strong>
            <span>A bottle is enough.</span>
          </div>
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-doc-check"></use></svg></span>
            <strong>Complete the waiver</strong>
            <span>Do it ahead of time so the arrival stays easy.</span>
          </div>
          <div class="showup-check-item">
            <span><svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-parking"></use></svg></span>
            <strong>Arrive 10 minutes early</strong>
            <span>Meet your coach and training partners before class.</span>
          </div>
        </div>
        <div class="showup-check-links" style="margin-top: 1rem;">
          <a class="showup-check-link" href="/waiver" data-event="showup_desktop_waiver_click">
            <svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-doc"></use></svg>
            <span>Finish the waiver</span>
          </a>
          <a class="showup-check-link" href="sms:+19177368649" data-event="showup_desktop_text_click">
            <svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-chat"></use></svg>
            <span>Text Sandy</span>
          </a>
        </div>
      </article>

      <!-- Where To Go -->
      <article class="showup-panel">
        <p class="showup-panel__eyebrow">Where To Go</p>
        <h2 class="showup-panel__title">6045 Main Street, Tannersville</h2>
        <p class="showup-panel__lede">We're on the second floor. Enter through the main door and follow the signs upstairs.</p>
        <div class="showup-map" aria-label="Google Maps embed for 6045 Main Street, Tannersville">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2954.026410292731!2d-74.1354!3d42.1965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89ddaf5555555555%3A0x5555555555555555!2s6045%20Main%20St%2C%20Tannersville%2C%20NY%2012485!5e0!3m2!1sen!2sus!4v1234567890" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Maps location for Sensei Sandy BJJ"></iframe>
        </div>
        <div class="showup-check-links">
          <a class="showup-map-link" href="https://www.google.com/maps/search/?api=1&query=6045%20Main%20Street%20Tannersville%20NY%2012485" data-event="showup_desktop_maps_click">
            <svg class="showup-icon" aria-hidden="true" focusable="false"><use href="#showup-icon-pin"></use></svg>
            <span>Maps</span>
          </a>
        </div>
      </article>

    </div>
  </section>
  
  \g<1>"""

content = re.sub(old_cluster_pattern, new_cluster, content, flags=re.DOTALL)
with open('show-up-kit.html', 'w', encoding='utf-8') as f:
    f.write(content)
