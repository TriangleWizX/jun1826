(function siteUx() {
  const PREF_KEY = 'senseiCalmStartPrefs';

  const readPrefs = () => {
    try {
      return JSON.parse(localStorage.getItem(PREF_KEY) || '{}') || {};
    } catch (error) {
      return {};
    }
  };

  const writePrefs = (next) => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ ...readPrefs(), ...next }));
    } catch (error) {}
  };

  const formatPrefillPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    return phone.startsWith('+') ? phone : (digits ? `+${digits}` : phone);
  };

  const prefillFormFromUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const nameVal = params.get('name') || params.get('full_name') || params.get('firstName') || '';
      const emailVal = params.get('email') || '';
      const phoneVal = params.get('phone') || params.get('phone_number') || params.get('contact') || params.get('tel') || '';
      const trainedVal = params.get('trained') || params.get('experience') || params.get('trained_before') || '';

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const trainedInput = document.getElementById('trained');

      if (nameInput && nameVal) nameInput.value = nameVal;
      if (emailInput && emailVal) emailInput.value = emailVal;
      if (phoneInput && phoneVal) phoneInput.value = phoneVal;
      if (trainedInput && trainedVal) {
        const normalized = trainedVal.toLowerCase().trim();
        if (normalized === 'yes' || normalized === 'true' || normalized === 'y' || normalized === '1') {
          trainedInput.value = 'Yes';
        } else if (normalized === 'no' || normalized === 'false' || normalized === 'n' || normalized === '0') {
          trainedInput.value = 'No';
        } else {
          trainedInput.value = trainedVal;
        }
      }
    } catch (err) {
      console.error('Prefill failed', err);
    }
  };

  const ready = (fn) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  };

  ready(() => {
    prefillFormFromUrl();

    document.querySelectorAll('[data-lane-pref]').forEach((el) => {
      el.addEventListener('click', () => writePrefs({ selectedLane: el.dataset.lanePref }));
    });

    document.querySelectorAll('[data-contact-pref]').forEach((el) => {
      el.addEventListener('click', () => writePrefs({ preferredContact: el.dataset.contactPref }));
    });

    const bookRoot = document.querySelector('[data-booking-router]');
    if (bookRoot) {
      const status = bookRoot.querySelector('[data-booking-status]');
      const bookingFormSection = document.getElementById('booking-form');
      const bookingForm = document.getElementById('onsite-booking-form');
      const calendlyStep = document.getElementById('calendly-step');
      const calendlyEmbed = document.getElementById('calendly-embed-onsite');
      const laneLabel = document.querySelector('[data-selected-lane-label]');

      const showBookingForm = (lane, label) => {
        writePrefs({ selectedLane: lane });
        if (laneLabel) laneLabel.textContent = label || lane;
        const interestLaneInput = document.getElementById('interest_lane');
        if (interestLaneInput) interestLaneInput.value = lane;
        const radioBtn = document.querySelector(`input[name="interest_lane"][value="${lane}"]`);
        if (radioBtn) {
          radioBtn.checked = true;
        }

        // Skip to Calendly if coming from homepage lead form
        if (sessionStorage.getItem('sensei_homepage_lead_submitted') === 'true') {
          const payload = {
            page_path: window.location.pathname,
            lane: lane,
            page_type: 'booking',
            page_id: 'booking',
            variant: 'default',
            audience_segment: lane,
            spots_left: 3,
            month_label: new Date().toLocaleString('en-US', { month: 'long' }),
            utm_source: 'website',
            utm_medium: 'organic',
            utm_campaign: 'evergreen'
          };
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'homepage_time_selection', payload);
          } else if (Array.isArray(window.dataLayer)) {
            window.dataLayer.push({ event: 'homepage_time_selection', ...payload });
          }

          if (bookingFormSection) bookingFormSection.hidden = true;
          if (calendlyStep) {
            calendlyStep.hidden = false;
            calendlyStep.scrollIntoView({ behavior: 'smooth' });
          }

          if (window.SSCalendly && calendlyEmbed && typeof window.SSCalendly.openInline === 'function') {
            const laneUrls = {
              kids: 'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
              teens: 'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
              adults: 'https://calendly.com/senseisandy/free-first-class-adult-bjj',
              private: 'https://calendly.com/senseisandy/private-class'
            };
            const baseUrl = laneUrls[lane] || 'https://calendly.com/senseisandy';
            
            const savedName = sessionStorage.getItem('sensei_homepage_lead_name') || '';
            const savedEmail = sessionStorage.getItem('sensei_homepage_lead_email') || '';
            const savedPhone = sessionStorage.getItem('sensei_homepage_lead_phone') || '';
            const prefilledPhone = formatPrefillPhone(savedPhone);

            const urlObj = new URL(baseUrl);
            if (savedName) urlObj.searchParams.set('name', savedName);
            if (savedEmail) urlObj.searchParams.set('email', savedEmail);
            if (prefilledPhone) {
              urlObj.searchParams.set('a2', prefilledPhone);
              urlObj.searchParams.set('location', prefilledPhone);
              urlObj.searchParams.set('phone_number', prefilledPhone);
            }
            const url = urlObj.toString();

            calendlyEmbed.dataset.calendlyUrl = url;
            if (savedName || savedEmail || prefilledPhone) {
              calendlyEmbed.dataset.prefill = JSON.stringify({
                name: savedName,
                email: savedEmail,
                customAnswers: {
                  a2: prefilledPhone
                }
              });
            }
            window.SSCalendly.openInline(calendlyEmbed);
          }
          return;
        }

        if (bookingFormSection) {
          bookingFormSection.hidden = false;
          bookingFormSection.scrollIntoView({ behavior: 'smooth' });
        }
      };

      document.querySelectorAll('[data-booking-lane]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const lane = link.dataset.bookingLane || 'intro';
          const label = link.dataset.bookingLabel || lane;

          if (link.getAttribute('href') === '#booking-form') {
            e.preventDefault();
            showBookingForm(lane, label);
          } else {
            writePrefs({ selectedLane: lane });
            if (!status || !bookRoot.contains(link)) return;
            status.hidden = false;
            status.textContent = `You picked ${label} Intro. Next: choose a time.`;
            window.setTimeout(() => {
              status.textContent = 'Opening times... If booking does not load, text Sandy and we will help.';
            }, 650);
          }
        });
      });

      if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(bookingForm);
          const rawName = formData.get('name');
          const rawEmail = formData.get('email');
          const rawPhone = formData.get('phone');
          const rawTrained = formData.get('trained_before');
          const name = typeof rawName === 'string' ? rawName.trim() : '';
          const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
          const phone = typeof rawPhone === 'string' ? rawPhone.trim() : '';
          const trained_before = typeof rawTrained === 'string' ? rawTrained.trim() : '';
          
          let utmSource = 'website';
          let utmMedium = 'organic';
          let utmCampaign = 'evergreen';
          let utmContent = '';
          let srcVal = '';

          try {
            const stored = JSON.parse(sessionStorage.getItem('sensei_attribution_v1') || '{}');
            if (stored && typeof stored === 'object') {
              if (stored.utm_source) utmSource = stored.utm_source;
              if (stored.utm_medium) utmMedium = stored.utm_medium;
              if (stored.utm_campaign) utmCampaign = stored.utm_campaign;
              if (stored.utm_content) utmContent = stored.utm_content;
              if (stored.src) srcVal = stored.src;
            }
          } catch (err) {}

          const lane = formData.get('interest_lane') || 'intro';
          const studentType = lane.charAt(0).toUpperCase() + lane.slice(1);

          const data = {
            form_name: 'Book Free Intro Form',
            _subject: 'Sensei Sandy Book Free Intro Form',
            name,
            email,
            phone,
            trained_before,
            student_type: studentType,
            interest_lane: lane,
            message: `Onsite booking funnel - ${studentType}\nTrained before: ${trained_before}`,
            website: formData.get('website') || '',
            source_url: window.location.href,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            src: srcVal
          };

          const submitBtn = bookingForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.textContent;
          submitBtn.disabled = true;
          submitBtn.textContent = 'Saving...';

          try {
            const response = await fetch('https://formspree.io/f/myzpdvay', {
              method: 'POST',
              headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save lead');

            // Success Transition
            if (bookingFormSection) bookingFormSection.hidden = true;
            if (calendlyStep) {
              calendlyStep.hidden = false;
              calendlyStep.scrollIntoView({ behavior: 'smooth' });
            }

            // Initialize Calendly
            if (window.SSCalendly && calendlyEmbed && typeof window.SSCalendly.openInline === 'function') {
              const laneUrls = {
                kids: 'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
                teens: 'https://calendly.com/senseisandy/free-first-class-youth-ages-5-17',
                adults: 'https://calendly.com/senseisandy/free-first-class-adult-bjj',
                private: 'https://calendly.com/senseisandy/private-class'
              };
              const baseUrl = laneUrls[lane] || 'https://calendly.com/senseisandy';
              const prefilledPhone = formatPrefillPhone(phone);
              
              const urlObj = new URL(baseUrl);
              urlObj.searchParams.set('name', name);
                urlObj.searchParams.set('a1', trained_before);
              if (prefilledPhone) {
                urlObj.searchParams.set('a2', prefilledPhone);
                urlObj.searchParams.set('location', prefilledPhone);
                urlObj.searchParams.set('phone_number', prefilledPhone);
              }
              const url = urlObj.toString();

              calendlyEmbed.dataset.calendlyUrl = url;
              calendlyEmbed.dataset.prefill = JSON.stringify({
                name,
                email,
                customAnswers: {
                  a1: trained_before,
                  a2: prefilledPhone
                }
              });
              window.SSCalendly.openInline(calendlyEmbed);
            }
          } catch (error) {
            console.error(error);
            alert('Something went wrong. Please try again or text Sandy at (917) 736-8649.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
      }
    }

    const pricingRoot = document.querySelector('[data-pricing-toggle-root]');
    if (pricingRoot) {
      const panels = Array.from(pricingRoot.querySelectorAll('[data-pricing-panel]'));
      const tabs = Array.from(pricingRoot.querySelectorAll('[data-pricing-tab]'));
      const buttons = tabs.length ? tabs : Array.from(pricingRoot.querySelectorAll('[data-pricing-toggle]'));
      const params = new URLSearchParams(window.location.search);
      const refLane = `${params.get('lane') || params.get('audience') || readPrefs().selectedLane || ''}`.toLowerCase();
      let active = refLane.includes('youth') || refLane.includes('kid') || refLane.includes('teen') ? 'youth' : 'adults';

      const apply = (lane) => {
        active = lane;
        writePrefs({ selectedLane: lane });
        buttons.forEach((button) => {
          const selected = (button.dataset.pricingTab || button.dataset.pricingToggle) === active;
          button.classList.toggle('is-active', selected);
          if (button.matches('[role="tab"]')) {
            button.setAttribute('aria-selected', String(selected));
            button.setAttribute('tabindex', selected ? '0' : '-1');
          } else {
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
          }
        });
        panels.forEach((panel) => {
          const selected = panel.dataset.pricingPanel === active;
          panel.classList.toggle('is-active', selected);
          panel.hidden = !selected;
        });
      };

      buttons.forEach((button, index) => {
        button.addEventListener('click', () => apply(button.dataset.pricingTab || button.dataset.pricingToggle || 'adults'));

        if (!button.matches('[role="tab"]')) return;
        button.addEventListener('keydown', (event) => {
          const key = event.key;
          let nextIndex = index;

          if (key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
          if (key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
          if (key === 'Home') nextIndex = 0;
          if (key === 'End') nextIndex = buttons.length - 1;

          if (nextIndex === index) return;
          event.preventDefault();
          buttons[nextIndex].focus();
          apply(buttons[nextIndex].dataset.pricingTab || buttons[nextIndex].dataset.pricingToggle || 'adults');
        });
      });
      apply(active);
    }

    if (document.body.classList.contains('page-glossary-term')) {
      const revealStickyAfterDefinition = () => {
        const definition = document.getElementById('definition');
        const shouldHide = definition && definition.getBoundingClientRect().bottom > 0;
        document.querySelectorAll('.mobile-sticky-cta, .desktop-sticky-cta').forEach((sticky) => {
          sticky.classList.toggle('mobile-sticky-cta--hidden', shouldHide);
          sticky.classList.toggle('desktop-sticky-cta--hidden', shouldHide);
        });
      };
      window.addEventListener('scroll', revealStickyAfterDefinition, { passive: true });
      window.setTimeout(revealStickyAfterDefinition, 350);
    }

    // YouTube Facade Loader
    document.addEventListener('click', (e) => {
      const facade = e.target.closest('.ss-video-facade');
      if (!facade || facade.classList.contains('is-loaded')) return;

      const videoId = facade.dataset.videoId;
      const title = facade.dataset.videoTitle || 'YouTube Video';
      if (!videoId) return;

      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      iframe.title = title;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('frameborder', '0');

      facade.innerHTML = '';
      facade.appendChild(iframe);
      facade.classList.add('is-loaded');
    });

    // Listen for Calendly event scheduling to fire homepage_intro_booked if coming from homepage lead form
    const showConfirmation = (dateTimeStr) => {
      if (bookingFormSection) bookingFormSection.hidden = true;
      if (calendlyStep) calendlyStep.hidden = true;

      const confirmationStep = document.getElementById('confirmation-step');
      const confirmationContent = document.getElementById('confirmation-content');
      if (!confirmationStep || !confirmationContent) return;

      confirmationStep.hidden = false;
      confirmationStep.scrollIntoView({ behavior: 'smooth' });

      let displayDateTime = "Your selected day and time";
      let googleCalendarDates = "";
      if (dateTimeStr) {
        try {
          const dateObj = new Date(dateTimeStr);
          if (!isNaN(dateObj.getTime())) {
            displayDateTime = dateObj.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            }) + ' at ' + dateObj.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            
            const startIso = dateObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            const endObj = new Date(dateObj.getTime() + 60 * 60 * 1000);
            const endIso = endObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            googleCalendarDates = `${startIso}/${endIso}`;
          }
        } catch (e) {
          console.error("Error parsing date: ", e);
        }
      }

      const mapUrl = "https://www.google.com/maps/search/?api=1&query=Sensei+Sandy+BJJ+6045+Main+Street+Tannersville+NY";
      const waiverUrl = "/waiver.html";
      const kitUrl = "/show-up-kit.html";
      const textUrl = "sms:+19177368649?body=Hi%20Sandy%2C%20I%27m%20booked%20for%20my%20Free%20Intro%20class.";

      const calUrl = googleCalendarDates 
        ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Free+Intro+at+Sensei+Sandy+BJJ&dates=${googleCalendarDates}&details=Your+First+Class+Is+Not+A+Fight.+Location%3A+6045+Main+Street%2C+2nd+Floor%2C+Tannersville%2C+NY&location=6045+Main+Street%2C+2nd+Floor%2C+Tannersville%2C+NY`
        : `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Free+Intro+at+Sensei+Sandy+BJJ&details=Your+First+Class+Is+Not+A+Fight.+Location%3A+6045+Main+Street%2C+2nd+Floor%2C+Tannersville%2C+NY&location=6045+Main+Street%2C+2nd+Floor%2C+Tannersville%2C+NY`;

      confirmationContent.innerHTML = `
        <div class="text-center">
          <div class="mb-4">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--ss-teal)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
          </div>
          <h2 class="h2 mb-2" style="font-family: 'Lexend', sans-serif; font-weight: 800; color: var(--ss-ink); letter-spacing: -0.02em;">Booking Confirmed!</h2>
          <p class="mb-4" style="color: var(--ss-text); font-size: 1.1rem;">Forwarding to the waiver in a moment...</p>
          
          <div class="p-3 my-4 rounded-3" style="background-color: var(--ss-surface2); border: 1px solid var(--ss-border);">
            <p class="mb-1 text-muted small text-uppercase fw-bold">Your Appointment Time</p>
            <h3 class="h4 mb-0 fw-bold" style="color: var(--ss-green);">${displayDateTime}</h3>
          </div>

          <div class="mb-4 text-center mx-auto" style="max-width: 500px;">
            <p class="mb-1 fw-bold text-muted small text-uppercase">Location</p>
            <p class="mb-2" style="font-size: 1.1rem; color: var(--ss-text);">
              <strong>6045 Main Street, second floor</strong><br>
              Tannersville, NY 12485
            </p>
          </div>

          <div class="d-flex flex-column gap-3 mx-auto" style="max-width: 320px;">
            <a href="${waiverUrl}" class="btn btn-primary w-100 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              Continue to Waiver
            </a>
            <a href="${calUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary w-100 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              Add to calendar
            </a>
            <a href="${kitUrl}" class="btn btn-outline-secondary w-100 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              Read the Show-Up Kit
            </a>
            <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline-secondary w-100 py-2.5 fw-bold d-inline-flex align-items-center justify-content-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Open Maps
            </a>
          </div>
        </div>
      `;
      
      setTimeout(() => {
        window.location.href = waiverUrl;
      }, 2500);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const eventStartTime = urlParams.get('event_start_time');
    if (eventStartTime) {
      showConfirmation(eventStartTime);
    }

    window.addEventListener('message', (e) => {
      if (!e?.data || typeof e.data !== 'object') return;
      if (e.data.event !== 'calendly.event_scheduled') return;

      showConfirmation(e.data.payload?.event_start_time || '');

      if (sessionStorage.getItem('sensei_homepage_lead_submitted') === 'true') {
        const lane = readPrefs().selectedLane || 'mixed';
        const payload = {
          page_path: window.location.pathname,
          lane: lane,
          page_type: 'booking',
          page_id: 'booking',
          variant: 'default',
          audience_segment: lane,
          spots_left: 3,
          month_label: new Date().toLocaleString('en-US', { month: 'long' }),
          utm_source: 'website',
          utm_medium: 'organic',
          utm_campaign: 'evergreen'
        };
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'homepage_intro_booked', payload);
        } else if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({ event: 'homepage_intro_booked', ...payload });
        }
        // Clear flag and data after booking is complete so subsequent actions behave normally
        sessionStorage.removeItem('sensei_homepage_lead_submitted');
        sessionStorage.removeItem('sensei_homepage_lead_name');
        sessionStorage.removeItem('sensei_homepage_lead_email');
        sessionStorage.removeItem('sensei_homepage_lead_phone');
      }
    });
  });
})();
