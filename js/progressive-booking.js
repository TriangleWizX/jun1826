(function () {
  'use strict';
  const ORIGIN = 'https://calendly.com';
  const HOSTS = new Set(['calendly.com', 'www.calendly.com']);
  const CAMPAIGNS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'campaign'];
  const ALIASES = { adult: 'adult-beginner', adults: 'adult-beginner', 'adult-beginner': 'adult-beginner', kids: 'child', child: 'child', teens: 'teen', teen: 'teen', 'community-service': 'leo', leo: 'leo', family: 'family', 'not-sure': 'not-sure' };
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();

  ready(() => {
    const flow = document.getElementById('booking-flow');
    if (!flow) return;
    const steps = [1, 2, 3].map((n) => document.getElementById(`pb-step-${n}`));
    const mount = document.getElementById('calendly-embed-onsite');
    const status = document.querySelector('[data-calendly-status]');
    const form = document.querySelector('#pb-step-3 form');
    const requested = new URLSearchParams(window.location.search).get('lane');
    const state = { profile: null, url: null, inline: false, scheduled: new Set(), step: 1, generation: 0, timer: null, trigger: null };
    const focus = (element) => {
      if (!element) return;
      if (/^H[1-6]$/.test(element.tagName)) element.tabIndex = -1;
      element.focus({ preventScroll: true });
      const rect = element.getBoundingClientRect();
      if (rect.top < 96 || rect.bottom > window.innerHeight) element.scrollIntoView({ block: 'center', behavior: 'instant' });
    };
    const cancelPending = () => {
      state.generation += 1;
      window.clearTimeout(state.timer);
      state.timer = null;
    };

    const track = (name, extra = {}) => {
      const query = new URLSearchParams(window.location.search);
      const payload = { source_path: window.location.pathname || '/', page_type: 'booking', lane: state.profile || 'unknown', campaign: query.get('campaign') || query.get('utm_campaign') || 'none', ...extra };
      if (typeof window.SS_TRACK_EVENT === 'function') window.SS_TRACK_EVENT(name, payload);
      else if (typeof window.gtag === 'function') window.gtag('event', name, payload);
      else { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: name, ...payload }); }
    };
    const show = (number) => {
      state.step = number;
      if (number !== 2) cancelPending();
      document.body.classList.toggle('ss-booking-flow-active', number !== 1);
      steps.forEach((step, index) => {
        if (!step) return;
        const active = index === number - 1;
        step.hidden = !active; step.style.display = active ? 'block' : 'none';
        step.classList.toggle('pb-step-active', active); step.classList.toggle('pb-step-hidden', !active);
        step.setAttribute('aria-hidden', String(!active));
      });
      focus(number === 1 && state.trigger ? state.trigger : steps[number - 1]?.querySelector('h1, h2, h3'));
      updateSticky();
    };
    const message = (text, error = false) => {
      if (!status) return;
      status.textContent = text; status.hidden = !text; status.classList.toggle('text-danger', error);
    };
    const eventUrl = () => {
      try {
        const url = new URL(mount?.dataset.calendlyUrl || '');
        return url.protocol === 'https:' && HOSTS.has(url.hostname) && url.pathname === '/senseisandy/bjj-goal-mapping-session' ? url : null;
      } catch (_) { return null; }
    };
    const calendarUrl = () => {
      const url = eventUrl();
      if (!url) return null;
      const page = new URLSearchParams(window.location.search);
      CAMPAIGNS.forEach((key) => { const value = page.get(key); if (value && /^[a-z0-9._-]{1,80}$/i.test(value)) url.searchParams.set(key, value); });
      url.searchParams.set('utm_source', url.searchParams.get('utm_source') || 'onsite-booking');
      url.searchParams.set('audience_lane', state.profile || 'unknown');
      url.searchParams.set('background_color', 'fbfaf8'); url.searchParams.set('text_color', '1f1712'); url.searchParams.set('primary_color', '116a42');
      return url;
    };
    const syncFields = () => {
      if (!form) return;
      const profile = state.profile || '';
      const set = (selector, value) => { const field = form.querySelector(selector); if (field) field.value = value; };
      set('#booking-profile-value', profile);
      set('#booking-avatar', profile === 'adult-beginner' ? 'adult' : profile);
      set('#booking-economic-lane', ['adult-beginner', 'leo'].includes(profile) ? 'adult' : (['child', 'teen'].includes(profile) ? 'youth' : ''));
      const studentField = form.querySelector('[data-booking-student-field]');
      if (studentField) studentField.hidden = !['child', 'teen', 'family'].includes(profile);
      const params = new URLSearchParams(window.location.search);
      const campaign = form.querySelector('#booking-source-campaign');
      if (campaign) campaign.value = params.get('campaign') || params.get('utm_campaign') || '';
      CAMPAIGNS.forEach((key) => {
        const val = params.get(key);
        if (val && /^[a-z0-9._-]{1,80}$/i.test(val)) {
          let input = form.querySelector(`input[name="${key}"]`);
          if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            form.appendChild(input);
          }
          input.value = val;
        }
      });
    };
    const load = () => {
      if (!document.querySelector('link[href*="calendly.com/assets/external/widget.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://assets.calendly.com/assets/external/widget.css';
        document.head.appendChild(link);
      }
      if (window.Calendly?.initPopupWidget && window.Calendly?.initInlineWidget) return Promise.resolve();
      if (window.SSCalendly?.load) return window.SSCalendly.load();
      return new Promise((resolve, reject) => {
        const script = document.querySelector('script[src*="assets.calendly.com/assets/external/widget.js"]');
        if (!script) return reject(new Error('Calendly script missing'));
        const timer = window.setTimeout(() => reject(new Error('Calendly load timeout')), 8000);
        const finish = () => { window.clearTimeout(timer); window.Calendly ? resolve() : reject(new Error('Calendly unavailable')); };
        script.addEventListener('load', finish, { once: true }); script.addEventListener('error', () => reject(new Error('Calendly load failure')), { once: true });
      });
    };
    const failure = () => {
      if (!mount || !state.url) return;
      message('The calendar has not loaded. Retry or open it in a new tab. You can also text Sandy.', true);
      // Retain the widget: a slow provider may still recover without losing a selection.
      if (!mount.querySelector('[data-retry-calendar]')) {
        const retry = document.createElement('button');
        retry.type = 'button'; retry.className = 'btn btn-outline-secondary';
        retry.dataset.retryCalendar = ''; retry.textContent = 'Retry calendar';
        retry.addEventListener('click', () => { state.inline = false; renderCalendar(); });
        mount.appendChild(retry);
      }
      track('calendar_load_failed');
    };
    const openPopup = () => {
      if (!state.url) return;
      cancelPending();
      const generation = state.generation;
      const url = state.url.toString();
      const button = mount.querySelector('[data-open-calendar]');
      if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
      message('Loading appointment times…'); track('calendar_opened', { transport: 'popup' });
      load().then(() => {
        if (generation !== state.generation || state.step !== 2) return;
        if (!window.Calendly?.initPopupWidget) throw new Error('Calendar unavailable');
        window.Calendly.initPopupWidget({ url });
        message('Calendar opened. If you close it, use See available times to reopen it.');
      }).catch(() => { if (generation === state.generation && state.step === 2) failure(); })
        .finally(() => { if (button?.isConnected) { button.disabled = false; button.removeAttribute('aria-busy'); } });
    };
    const renderCalendar = () => {
      if (!mount || !state.url) return;
      cancelPending();
      const generation = state.generation;
      const url = state.url.toString();
      const fallback = document.querySelector('[data-calendar-external]');
      if (fallback) { fallback.href = url; fallback.hidden = false; }
      mount.replaceChildren(); message('');
      if (window.matchMedia('(max-width: 767.98px)').matches) {
        mount.style.minHeight = '';
        mount.innerHTML = '<div class="booking-calendar-entry"><button type="button" class="btn btn-primary ss-btn-primary w-100" data-open-calendar>See available times</button></div>';
        mount.querySelector('[data-open-calendar]')?.addEventListener('click', openPopup);
        return;
      }
      mount.style.minHeight = 'max(44rem, 75dvh)';
      mount.style.width = '100%';
      message('Loading appointment times…');
      load().then(() => {
        if (generation !== state.generation || state.step !== 2 || state.inline) return;
        if (!window.Calendly?.initInlineWidget) throw new Error('Calendar unavailable');
        state.inline = true;
        window.Calendly.initInlineWidget({ url, parentElement: mount, prefill: {}, utm: {} });
        const widget = mount.querySelector('.calendly-inline-widget');
        if (widget) {
          widget.style.minHeight = 'max(44rem, 75dvh)';
          widget.style.height = '100%';
          widget.style.width = '100%';
        }
        const iframe = mount.querySelector('iframe');
        if (iframe) {
          iframe.style.minHeight = 'max(44rem, 75dvh)';
          iframe.style.height = '100%';
          iframe.style.width = '100%';
        }
        state.timer = window.setTimeout(() => { if (generation === state.generation && state.step === 2) failure(); }, 12000);
      }).catch(() => { if (generation === state.generation && state.step === 2) failure(); });
    };
    const breakpoint = window.matchMedia('(max-width: 767.98px)');
    breakpoint.addEventListener('change', () => {
      if (state.step === 2) {
        state.inline = false;
        renderCalendar();
      }
    });
    const choose = (profile, method) => {
      const previous = state.profile;
      state.profile = profile; state.inline = false; state.url = calendarUrl(); syncFields();
      document.querySelectorAll('[data-profile]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.profile === profile)));
      const labels = { 'adult-beginner': 'an adult', child: 'a child', teen: 'a teen', leo: 'a community-service adult', family: 'more than one person', 'not-sure': 'help choosing' };
      const choice = document.querySelector('[data-current-choice]'); if (choice) choice.textContent = `Starting path: ${labels[profile] || 'your first visit'}.`;
      track('lane_resolved', { selection_method: method });
      if (method === 'manual' && previous !== profile) track('lane_selected', { previous_lane: previous || 'unknown', selected_lane: profile, selection_method: previous ? 'changed' : 'manual' });
      show(2); renderCalendar();
    };

    document.querySelectorAll('[data-profile]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); state.trigger = button; choose(button.dataset.profile, 'manual'); }));
    document.querySelectorAll('[data-back-to], [data-change-choice]').forEach((button) => button.addEventListener('click', (event) => { event.preventDefault(); show(1); }));
    document.querySelectorAll('[data-reveal-youth]').forEach((button) => button.addEventListener('click', () => {
      document.querySelector('[data-youth-choice]')?.removeAttribute('hidden');
      button.setAttribute('aria-expanded', 'true');
      focus(document.querySelector('[data-youth-choice] [data-profile]'));
    }));
    document.querySelectorAll('[data-collapse-youth]').forEach((button) => button.addEventListener('click', () => {
      document.querySelector('[data-youth-choice]')?.setAttribute('hidden', '');
      document.querySelector('[data-reveal-youth]')?.setAttribute('aria-expanded', 'false');
      focus(document.querySelector('[data-reveal-youth]'));
    }));
    window.addEventListener('message', (event) => {
      if (event.origin !== ORIGIN || !event.data || typeof event.data !== 'object') return;
      if (state.step !== 2) return;
      const type = event.data.event;
      if (type === 'calendly.event_type_viewed') { window.clearTimeout(state.timer); message(''); mount?.querySelector('[data-retry-calendar]')?.remove(); track('availability_viewed', { scheduler_event: type }); return; }
      if (type === 'calendly.date_and_time_selected') { track('time_selected', { scheduler_event: type }); return; }
      if (type !== 'calendly.event_scheduled') return;
      const uri = String(event.data.payload?.event?.uri || event.data.payload?.invitee?.uri || ''); const key = uri || JSON.stringify(event.data.payload || {});
      if (state.scheduled.has(key)) return; state.scheduled.add(key);
      track('calendly_scheduled', { scheduler_event: type, booking_reference_present: Boolean(uri) }); syncFields();
      const title = document.getElementById('booking-confirmation-title'); const copy = document.getElementById('booking-confirmation-copy');
      if (title) title.textContent = 'Your first visit is booked.';
      if (copy) copy.textContent = 'Use your Calendly confirmation for the date and time. Sandy will plan your coached first class with you afterward.';
      window.Calendly?.closePopupWidget?.();
      show(3);
    });
    const fields = Array.from(form?.querySelectorAll('input:not([type="hidden"])') || []);
    const validate = (field) => {
      const error = form.querySelector(`#${field.id}-error`);
      const invalid = !field.validity.valid;
      field.setAttribute('aria-invalid', String(invalid));
      if (error) error.textContent = invalid ? field.validationMessage : '';
    };
    fields.forEach((field) => {
      const error = document.createElement('p');
      error.id = `${field.id}-error`; error.className = 'pb-field-error';
      field.setAttribute('aria-describedby', error.id);
      field.insertAdjacentElement('afterend', error);
      field.addEventListener('blur', () => validate(field));
      field.addEventListener('input', () => { if (field.hasAttribute('aria-invalid')) validate(field); });
    });
    form?.addEventListener('submit', (event) => {
      syncFields();
      if (!form.checkValidity()) {
        event.preventDefault();
        fields.forEach(validate);
        form.classList.add('was-validated');
        form.querySelector(':invalid')?.focus();
        return;
      }
      try {
        sessionStorage.removeItem('ss_lead_fired');
        sessionStorage.setItem('ss_first_visit_details', JSON.stringify({
          profile: state.profile || '',
          submittedAt: Date.now()
        }));
      } catch (_) {}
      track('details_submit_attempt');
    });
    const stickyBar = document.querySelector('.ss-mobile-sticky-cta');
    let flowIntersecting = true;
    const updateSticky = () => {
      if (!stickyBar) return;
      stickyBar.classList.toggle('is-visible', !flowIntersecting && state.step === 1);
    };
    if (stickyBar && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        flowIntersecting = entries[0].isIntersecting;
        updateSticky();
      }, { threshold: 0.1 });
      observer.observe(flow);
    }
    track('intro_page_loaded');
    if (ALIASES[String(requested || '').toLowerCase()]) choose(ALIASES[String(requested).toLowerCase()], 'query');
    else if (requested) message('Choose who is starting, or text Sandy for help.');
  });
}());
