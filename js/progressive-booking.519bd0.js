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
      document.getElementById('pb-step-3'),
      document.getElementById('pb-step-4')
    ];

    let state = {
      audience: null,
      lane: null
    };

    const showStep = (stepIndex) => {
      steps.forEach((step, idx) => {
        if (!step) return;
        if (idx === stepIndex - 1) {
          step.style.display = 'block';
          // small delay to allow display:block to apply before opacity transition
          setTimeout(() => {
            step.classList.remove('pb-step-hidden');
            step.classList.add('pb-step-active');
          }, 10);
        } else {
          step.classList.add('pb-step-hidden');
          step.classList.remove('pb-step-active');
          setTimeout(() => {
            if (step.classList.contains('pb-step-hidden')) {
              step.style.display = 'none';
            }
          }, 300); // match transition duration
        }
      });
    };

    // Step 1: Select Audience
    const audienceBtns = document.querySelectorAll('#pb-step-1 [data-audience]');
    audienceBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); const target = e.currentTarget; state.audience = target.getAttribute('data-audience');
        
        // Prepare Step 2
        document.querySelectorAll('.pb-lanes').forEach(el => el.style.display = 'none');
        const laneContainer = document.getElementById(`pb-lanes-${state.audience}`);
        if (laneContainer) laneContainer.style.display = 'flex';
        
        showStep(2);
      });
    });

    // Step 2: Select Lane
    const laneBtns = document.querySelectorAll('#pb-step-2 [data-lane]');
    laneBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); const target = e.currentTarget; state.lane = target.getAttribute('data-lane');
        
        // Prepare Step 3: Calendly
        initCalendly(state.audience, state.lane);
        
        showStep(3);
      });
    });

    // Back buttons
    const backBtns = document.querySelectorAll('[data-back-to]');
    backBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); const stepNum = parseInt(e.currentTarget.getAttribute('data-back-to'), 10);
        if (stepNum) showStep(stepNum);
      });
    });

    // Initialize Calendly
    const initCalendly = (audience, lane) => {
      const container = document.getElementById('calendly-embed-container');
      if (!container) return;
      
      container.innerHTML = '';
      
      const baseUrl = container.getAttribute('data-calendly-url') || 'https://calendly.com/senseisandy/bjj-goal-mapping-session';
      
      // We can append custom answers or utm params based on audience/lane
      const url = new URL(baseUrl);
      url.searchParams.set('utm_source', audience);
      url.searchParams.set('utm_campaign', lane);
      url.searchParams.set('background_color', 'fbfaf8');
      url.searchParams.set('text_color', '1f1712');
      url.searchParams.set('primary_color', '289fa1');

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
    };

    // Step 4: Listen for Calendly Booking Event
    window.addEventListener('message', (e) => {
      if (e.origin !== "https://calendly.com") return;
      if (e.data.event && e.data.event === 'calendly.event_scheduled') {
        showStep(4);
        // Scroll to success message
        setTimeout(() => {
          document.getElementById('pb-step-4').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });

  });
})();
