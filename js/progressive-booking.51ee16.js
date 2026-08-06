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
      profile: null
    };

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
        
        state.profile = target.getAttribute('data-profile');
        
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
    const initCalendly = (profile) => {
      const container = document.getElementById('calendly-embed-onsite');
      if (!container) return;
      
      container.innerHTML = '';
      
      const baseUrl = container.getAttribute('data-calendly-url') || 'https://calendly.com/senseisandy/bjj-goal-mapping-session';
      
      // Append tracking and profile parameters
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set('utm_source', 'onsite-booking');
      url.searchParams.set('utm_campaign', profile);
      url.searchParams.set('background_color', 'fbfaf8');
      url.searchParams.set('text_color', '1f1712');
      url.searchParams.set('primary_color', '289fa1');

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
            triggerPopup();
          });
        }
        // Auto-trigger popup for smooth transition
        setTimeout(triggerPopup, 200);
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
      if (e.data.event && e.data.event === 'calendly.event_scheduled') {
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
