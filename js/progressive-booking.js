(function() {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  ready(() => {
    const bookingFlow = document.getElementById('booking-flow');
    if (!bookingFlow) return;

    const steps = [
      document.getElementById('pb-step-1'),
      document.getElementById('pb-step-2'),
      document.getElementById('pb-step-3')
    ];

    let state = {
      profile: null,
      preferredDays: [],
      bookingStarted: false,
      autoSelecting: false
    };

    const track = (name, extra = {}) => {
      const pageParams = new URLSearchParams(window.location.search);
      const payload = {
        source_page: window.location.href,
        source_path: window.location.pathname || '/',
        page_type: 'other',
        lane: String(new URLSearchParams(window.location.search).get('lane') || 'unknown').replace('-', '_'),
        campaign: pageParams.get('campaign') || pageParams.get('utm_campaign') || 'none',
        ...extra
      };
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, payload);
      } else {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: name, ...payload });
      }
    };

    track('intro_page_loaded');

    const showStep = (stepIndex) => {
      steps.forEach((step, idx) => {
        if (!step) return;
        if (idx === stepIndex - 1) {
          step.hidden = false;
          step.style.display = 'block';
          step.removeAttribute('aria-hidden');
          
          const heading = step.querySelector('h1, h2, h3');
          if (heading) {
            heading.tabIndex = -1;
            heading.focus();
          }

          // small delay to allow display:block to apply before opacity transition
          setTimeout(() => {
            step.classList.remove('pb-step-hidden');
            step.classList.add('pb-step-active');
          }, 10);
        } else {
          step.classList.add('pb-step-hidden');
          step.classList.remove('pb-step-active');
          step.setAttribute('aria-hidden', 'true');
          setTimeout(() => {
            if (step.classList.contains('pb-step-hidden')) {
              step.style.display = 'none';
              step.hidden = true;
            }
          }, 300); // match transition duration
        }
      });
    };

    // Step 1: Select Profile
    const profileBtns = document.querySelectorAll('#pb-step-1 [data-profile]');
    profileBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        profileBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
        const target = e.currentTarget; 
        target.setAttribute('aria-pressed', 'true');
        
        const previousProfile = state.profile;
        const wasBookingStarted = state.bookingStarted;
        state.profile = target.getAttribute('data-profile');
        state.bookingStarted = true;
        updateLanePresentation(state.profile);
        if (laneNote && (state.profile === 'child' || state.profile === 'teen')) {
          laneNote.textContent = state.profile === 'child' ? laneNotes.kids : laneNotes.teens;
        }
        if (!state.autoSelecting && !wasBookingStarted) {
          track('booking_started', { lane: state.profile, interaction: 'profile_selected' });
        }
        track('lane_resolved', { lane: state.profile, selection_method: state.autoSelecting ? 'query' : 'manual' });
        if (!state.autoSelecting && previousProfile !== state.profile) {
          track('lane_selected', {
            previous_lane: previousProfile || 'unknown',
            selected_lane: state.profile,
            selection_method: previousProfile ? 'changed' : 'manual'
          });
        }
        
        // Prepare Step 2: Calendly
        initCalendly(state.profile);
        
        showStep(2);
      });

      // Pre-load Calendly assets on user hover or focus for premium performance
      const preloadCalendly = () => {
        if (window.SSCalendly && typeof window.SSCalendly.load === 'function') {
          window.SSCalendly.load();
        }
      };
      btn.addEventListener('mouseenter', preloadCalendly, { once: true });
      btn.addEventListener('focus', preloadCalendly, { once: true });
    });

    // Program pages pass a lane so high-intent visitors do not have to repeat
    // the audience choice they already made. Keep the generic page unchanged.
    const requestedLane = new URLSearchParams(window.location.search).get('lane');
    const laneProfiles = {
      kids: 'child',
      teens: 'teen',
      teen: 'teen',
      adults: 'adult-beginner',
      adult: 'adult-beginner',
      'community-service': 'leo'
    };
    const requestedProfile = laneProfiles[String(requestedLane || '').toLowerCase()];
    const preferredDaysFieldset = document.querySelector('[data-youth-preferred-days]');
    const adultPreferredDaysFieldset = document.querySelector('[data-adult-preferred-days]');
    const preferredDayInputs = document.querySelectorAll('[data-youth-preferred-days] input[name="preferred_days"], [data-adult-preferred-days] input[name="preferred_days"]');
    preferredDayInputs.forEach((input) => {
      input.addEventListener('change', () => {
        state.preferredDays = Array.from(preferredDayInputs).filter((item) => item.checked).map((item) => item.value);
        track('preferred_days_selected', { lane: state.profile || requestedLane || 'unknown', preferred_days: state.preferredDays.join('|') });
        syncCalendlyPreferences();
      });
    });
    const laneNote = document.getElementById('first-visit-lane-note');
    const introTitle = document.getElementById('book-intro-title');
    const introSubtitle = document.getElementById('book-intro-subtitle');
    const laneNotes = {
      kids: 'For kids: we help your child understand the room and find the right starting challenge. Goal Mapping comes first, then Sandy selects and schedules the right coached class.',
      teens: 'For teens: we see how they learn, move, and respond before choosing the right starting lane. Goal Mapping comes first, then Sandy selects and schedules the coached class.',
      adults: 'For adults: we orient you to the room, explain how resistance works, and choose a manageable starting point during a calm 15-minute Goal Mapping visit.',
      adult: 'For adults: we orient you to the room, explain how resistance works, and choose a manageable starting point during a calm 15-minute Goal Mapping visit.',
      'community-service': 'For qualifying service professionals: use Goal Mapping to discuss the right class lane, schedule, and community-service rate.'
    };
    const setHiddenState = (element, hidden) => {
      if (!element) return;
      element.classList.toggle('d-none', hidden);
      element.toggleAttribute('hidden', hidden);
      element.setAttribute('aria-hidden', String(hidden));
    };
    const youthHeadline = 'See How Your Child Responds Before Choosing a Jiu-Jitsu Program';
    const youthSubheadline = 'Reserve a free beginner intro with Goal Mapping, a carefully matched partner, and one structured class. No experience, credit card, or enrollment commitment required.';
    const updateLanePresentation = (lane) => {
      const isYouth = lane === 'kids' || lane === 'teens' || lane === 'child' || lane === 'teen';
      if (introTitle) introTitle.textContent = isYouth ? youthHeadline : 'Reserve Your Free Intro.';
      if (introSubtitle) introSubtitle.textContent = isYouth ? youthSubheadline : 'Tour the studio, map your goal, then choose the right first class for your week.';
      setHiddenState(preferredDaysFieldset, !isYouth);
      setHiddenState(adultPreferredDaysFieldset, isYouth);
    };
    if (laneNote && laneNotes[String(requestedLane || '').toLowerCase()]) {
      laneNote.textContent = laneNotes[String(requestedLane).toLowerCase()];
    }
    updateLanePresentation(requestedLane);
    if (requestedProfile) {
      const matchingButton = Array.from(profileBtns).find((button) => button.getAttribute('data-profile') === requestedProfile);
      if (matchingButton) {
        state.autoSelecting = true;
        matchingButton.click();
        state.autoSelecting = false;
      }
    }

    // Back buttons
    const backBtns = document.querySelectorAll('[data-back-to]');
    backBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const stepNum = parseInt(e.currentTarget.getAttribute('data-back-to'), 10);
        if (stepNum) showStep(stepNum);
      });
    });

    // Initialize Calendly
    let mobilePopupShown = false;
    let preferenceSyncTimer;
    function syncCalendlyPreferences() {
      if (!state.profile || !state.bookingStarted) return;
      clearTimeout(preferenceSyncTimer);
      preferenceSyncTimer = setTimeout(() => initCalendly(state.profile), 350);
    }

    function initCalendly(profile) {
      const container = document.getElementById('calendly-embed-onsite');
      if (!container) return;
      
      container.innerHTML = '';
      track('availability_displayed', { lane: profile });
      
      const baseUrl = container.getAttribute('data-calendly-url') || 'https://calendly.com/senseisandy/bjj-goal-mapping-session';
      
      // Append tracking and profile parameters
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set('utm_source', 'onsite-booking');
      url.searchParams.set('utm_campaign', profile);
      const campaign = new URLSearchParams(window.location.search).get('campaign') || new URLSearchParams(window.location.search).get('utm_campaign');
      if (campaign) {
        url.searchParams.set('campaign', campaign);
        url.searchParams.set('campaign_tag', campaign);
      }
      url.searchParams.set('background_color', 'fbfaf8');
      url.searchParams.set('text_color', '1f1712');
      url.searchParams.set('primary_color', '289fa1');
      url.searchParams.set('audience_lane', profile);
      if (state.preferredDays.length) url.searchParams.set('preferred_days', state.preferredDays.join('|'));
      url.searchParams.set('referring_page', window.location.pathname || '/');

      // Forward any page-level search params for session attribution
      try {
        const pageParams = new URLSearchParams(window.location.search);
        pageParams.forEach((value, key) => {
          if (!url.searchParams.has(key)) {
            url.searchParams.set(key, value);
          }
        });
      } catch (err) {
        console.error('Error forwarding page params:', err);
      }

      // Track the step transition analytics
      const payload = {
        page_path: window.location.pathname,
        profile: profile,
        page_type: 'booking',
        page_id: 'booking',
        variant: 'default',
        utm_source: 'onsite-booking',
        utm_campaign: profile
      };
      payload.campaign = campaign || 'none';
      payload.referring_page = window.location.pathname || '/';
      payload.preferred_days = state.preferredDays.join('|');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'profile_selected', payload);
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'profile_selected', ...payload });
      }

      const isMobile = window.matchMedia('(max-width: 767.98px)').matches;

      const triggerPopup = () => {
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          window.Calendly.initPopupWidget({ url: url.toString() });
        } else if (window.SSCalendly && typeof window.SSCalendly.openPopup === 'function') {
          window.SSCalendly.openPopup(url.toString());
        } else {
          window.open(url.toString(), '_blank');
        }
      };

      if (isMobile) {
        container.innerHTML = `
          <div class="p-4 text-center rounded-4 border bg-white shadow-sm mt-3" style="border-color: rgba(54, 43, 36, 0.12) !important;">
            <p class="mb-3 text-muted">Click below to open our calendar and select a convenient time.</p>
            <button id="open-calendly-popup-btn" class="btn btn-primary ss-btn ss-btn-primary w-100 py-3" style="border-radius: 999px; font-weight: 700; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
              Select Date & Time
              <i class="bi bi-calendar-check ms-2"></i>
            </button>
            <p class="small text-muted mt-2 mb-0">Calendar opens in a clean popup view.</p>
          </div>
        `;
        
        // Ensure Calendly assets are loaded
        if (window.SSCalendly && typeof window.SSCalendly.load === 'function') {
          window.SSCalendly.load();
        }
        
        const popupBtn = document.getElementById('open-calendly-popup-btn');
        if (popupBtn) {
          popupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            track('appointment_selected', { lane: profile, interaction: 'calendar_open' });
            triggerPopup();
          });
        }
        // Auto-trigger popup for smooth transition
        if (!mobilePopupShown) {
          mobilePopupShown = true;
          setTimeout(triggerPopup, 200);
        }
      } else {
        if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
          window.Calendly.initInlineWidget({
            url: url.toString(),
            parentElement: container,
            prefill: {},
            utm: {}
          });
        } else {
          // Fallback: If Calendly script isn't loaded yet via intent, load it now
          if (window.SSCalendly && typeof window.SSCalendly.load === 'function') {
            window.SSCalendly.load().then(() => {
              if (window.Calendly) {
                window.Calendly.initInlineWidget({
                  url: url.toString(),
                  parentElement: container,
                });
              }
            });
          }
        }
      }
    };

    // Step 3: Listen for Calendly Booking Event
    window.addEventListener('message', (e) => {
      if (e.origin !== "https://calendly.com") return;
      const calendlyEvent = e.data?.event;
      if (calendlyEvent === 'calendly.event_type_viewed') {
        track('availability_displayed', { lane: state.profile || 'unknown', scheduler_event: calendlyEvent });
      }
      if (calendlyEvent === 'calendly.date_and_time_selected') {
        track('appointment_selected', { lane: state.profile || 'unknown', scheduler_event: calendlyEvent });
      }
      if (calendlyEvent === 'calendly.event_scheduled') {
        track('booking_submitted', { lane: state.profile || 'unknown', scheduler_event: calendlyEvent });
    track('booking_confirmed', { lane: state.profile || 'unknown', confirmation_source: 'calendly' });
    const confirmationTitle = document.getElementById('booking-confirmation-title');
    const confirmationCopy = document.getElementById('booking-confirmation-copy');
    const isYouthConfirmation = ['child', 'teen'].includes(state.profile);
    if (confirmationTitle) confirmationTitle.textContent = isYouthConfirmation ? 'Your youth first visit is booked.' : 'Your adult first visit is booked.';
    if (confirmationCopy) confirmationCopy.textContent = isYouthConfirmation ? 'Arrive 20 minutes before your selected class in clean athletic clothes. Sandy will meet you, review safety, and confirm whether your child trains that day.' : 'Wear normal clothes. No workout is required. Sandy will use this 15-minute conversation to help choose and schedule your free coached first class afterward.';
    showStep(3);
        // Scroll to success message
        setTimeout(() => {
          const successStep = document.getElementById('pb-step-3');
          if (successStep) {
            successStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    });

  });
})();
