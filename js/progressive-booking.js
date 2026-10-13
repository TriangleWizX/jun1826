(function () {
  'use strict';
  const CAL_ORIGIN = 'https://cal.com';
  const CAL_LINK = 'senseisandy/first-visit';
  const CAL_NAMESPACE = 'first-visit';
  const CAMPAIGNS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'campaign'];
  const ALIASES = { adult: 'adult-beginner', adults: 'adult-beginner', 'adult-beginner': 'adult-beginner', kids: 'child', child: 'child', teens: 'teen', teen: 'teen', 'community-service': 'leo', leo: 'leo', family: 'family', 'not-sure': 'not-sure' };
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn, { once: true }) : fn();

  ready(() => {
    const flow = document.getElementById('booking-flow');
    if (!flow) return;
    const steps = [1, 2, 3].map((n) => document.getElementById(`pb-step-${n}`));
    const mount = document.getElementById('first-visit-calendar');
    const status = document.querySelector('[data-calendar-status]');
    const choiceStatus = document.querySelector('[data-choice-status]');
    const form = document.querySelector('#pb-step-3 form');
    const requested = new URLSearchParams(window.location.search).get('lane');
    const query = new URLSearchParams(window.location.search);
    const requestedClass = (query.get('class') || '').slice(0, 100);
    const requestedDate = query.get('class_date') || '';
    const requestedTime = (query.get('class_time') || '').slice(0, 30);
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
    const setChoiceStatus = (text) => {
      if (!choiceStatus) return;
      choiceStatus.textContent = text;
      choiceStatus.hidden = !text;
    };
    const updateCalendarCopy = () => {
      const context = document.querySelector('[data-calendar-context]');
      const profiles = {
        'adult-beginner': { selected: 'Adult 18+ selected.', context: context?.dataset.adultCalendarContext },
        child: { selected: 'Child 5–9 selected.', context: context?.dataset.youthCalendarContext },
        teen: { selected: 'Teen 10–17 selected.', context: context?.dataset.youthCalendarContext },
        family: { selected: 'More than one person selected.', context: context?.dataset.familyCalendarContext },
        leo: { selected: 'Community-service adult selected.', context: context?.dataset.adultCalendarContext },
        'not-sure': { selected: 'Help choosing selected.', context: context?.dataset.helpCalendarContext }
      };
      const copy = profiles[state.profile] || { selected: 'Choose who is starting.', context: 'Pick a time to meet Sandy.' };
      const choice = document.querySelector('[data-current-choice]');
      if (choice) choice.textContent = copy.selected;
      if (context) {
        context.textContent = copy.context;
        if (requestedClass && requestedDate) {
          const date = new Date(`${requestedDate}T12:00:00Z`);
          const validDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === requestedDate;
          if (validDate) {
            const details = document.createElement('span');
            details.className = 'requested-class-context';
            details.textContent = ` Requested class: ${requestedClass}, ${new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(date)}${requestedTime ? ` at ${requestedTime}` : ''}. Sandy will confirm class availability.`;
            context.append(details);
          }
        }
      }
    };
    const updateConfirmation = () => {
      const adult = ['adult-beginner', 'leo'].includes(state.profile);
      const youth = ['child', 'teen'].includes(state.profile);
      document.querySelector('[data-adult-arrival-plan]')?.toggleAttribute('hidden', !adult);
      document.querySelector('[data-youth-arrival-plan]')?.toggleAttribute('hidden', !youth);
      document.querySelector('[data-general-arrival-plan]')?.toggleAttribute('hidden', adult || youth);
    };
    const calendarUrl = () => {
      const url = new URL(`${CAL_ORIGIN}/${CAL_LINK}`);
      const page = new URLSearchParams(window.location.search);
      CAMPAIGNS.forEach((key) => { const value = page.get(key); if (value && /^[a-z0-9._-]{1,80}$/i.test(value)) url.searchParams.set(key, value); });
      url.searchParams.set('utm_source', url.searchParams.get('utm_source') || 'onsite-booking');
      url.searchParams.set('audience_lane', state.profile || 'unknown');
      if (requestedClass && requestedDate) {
        const classDate = new Date(`${requestedDate}T12:00:00Z`);
        if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && !Number.isNaN(classDate.getTime()) && classDate.toISOString().slice(0, 10) === requestedDate) {
          const dateLabel = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(classDate);
          url.searchParams.set('notes', `Requested class: ${requestedClass} on ${dateLabel}${requestedTime ? ` at ${requestedTime}` : ''}. Please offer the closest available Free Intro time before this class.`);
        }
      }
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
    let calApiPromise;
    const loadCalApi = () => {
      if (calApiPromise) return calApiPromise;
      calApiPromise = new Promise((resolve, reject) => {
        // Official Cal queue bootstrap, loaded only after a starting path is chosen.
        window.Cal = window.Cal || function () {
          const cal = window.Cal;
          const args = arguments;
          cal.q = cal.q || [];
          if (args[0] === 'init') {
            const namespace = args[1];
            const api = function () { api.q.push(arguments); };
            api.q = [];
            cal.ns = cal.ns || {};
            cal.ns[namespace] = cal.ns[namespace] || api;
            cal.ns[namespace].q.push(args);
            cal.q.push(['initNamespace', namespace]);
            return;
          }
          cal.q.push(args);
        };
        window.Cal('init', CAL_NAMESPACE, { origin: CAL_ORIGIN });
        const script = document.createElement('script');
        script.src = 'https://app.cal.com/embed/embed.js';
        script.async = true;
        script.onload = () => resolve(window.Cal.ns[CAL_NAMESPACE]);
        script.onerror = () => {
          script.remove();
          calApiPromise = null;
          reject(new Error('Calendar script unavailable'));
        };
        document.head.appendChild(script);
      });
      return calApiPromise;
    };
    const failure = () => {
      if (!mount) return;
      message('Try the visit times again. Or open them in a new tab. Text Sandy for help.', true);
      if (!mount.querySelector('[data-retry-calendar]')) {
        const retry = document.createElement('button');
        retry.type = 'button'; retry.className = 'btn btn-outline-secondary';
        retry.dataset.retryCalendar = ''; retry.textContent = 'Try again.';
        retry.addEventListener('click', () => { state.inline = false; renderCalendar(); });
        mount.appendChild(retry);
      }
      track('calendar_load_failed');
    };
    const renderCalendar = () => {
      if (!mount) return;
      cancelPending();
      const generation = state.generation;
      state.url = calendarUrl();
      const fallback = document.querySelector('[data-calendar-external]');
      if (fallback) { fallback.href = state.url.toString(); fallback.hidden = false; }
      mount.replaceChildren(); mount.classList.remove('is-ready'); message('');
      message('Please wait. We are loading your visit times.');
      state.timer = window.setTimeout(() => {
        if (generation === state.generation && state.step === 2) failure();
      }, 15000);
      loadCalApi().then((cal) => {
        if (generation !== state.generation || state.step !== 2) return;
        // Unsubscribe before remounting so retries and lane changes count once.
        if (state.listeners) state.listeners.forEach((listener) => cal('off', listener));
        const current = () => generation === state.generation && state.step === 2;
        state.listeners = [
          { action: 'linkReady', callback: () => {
            if (!current()) return;
            window.clearTimeout(state.timer); message('');
            mount.classList.add('is-ready');
            mount.querySelector('[data-retry-calendar]')?.remove();
            track('availability_viewed', { scheduler_provider: 'cal', scheduler_event: 'linkReady' });
          } },
          { action: 'linkFailed', callback: () => {
            if (!current()) return;
            window.clearTimeout(state.timer); failure();
          } },
          { action: 'bookingSuccessfulV2', callback: (event) => {
            if (!current()) return;
            const data = event.detail?.data || {};
            if (!data.uid || state.scheduled.has(data.uid)) return;
            if (data.status !== 'ACCEPTED' || data.paymentRequired) {
              message('We got your request. Check your email for the next step. Text Sandy for help.');
              return;
            }
            state.scheduled.add(data.uid);
            const payload = { scheduler_provider: 'cal', scheduler_event: 'bookingSuccessfulV2', booking_reference_present: true };
            // Retain the legacy reporting key during migration; never send provider/attendee data.
            ['calendly_scheduled', 'booking_complete', 'booking_completed', 'book_intro_submit'].forEach((name) => track(name, payload));
            try {
              if (sessionStorage.getItem('sensei_homepage_lead_submitted') === 'true') {
                track('homepage_intro_booked', payload);
                ['submitted', 'name', 'email', 'phone'].forEach((key) => sessionStorage.removeItem(`sensei_homepage_lead_${key}`));
              }
            } catch (_) {}
            syncFields(); updateConfirmation(); show(3);
          } }
        ];
        state.listeners.forEach((listener) => cal('on', listener));
        cal('inline', {
          elementOrSelector: '#first-visit-calendar',
          calLink: CAL_LINK,
          config: { ...Object.fromEntries(state.url.searchParams), theme: 'light', layout: 'month_view', useSlotsViewOnSmallScreen: true }
        });
        const iframe = mount.querySelector('iframe');
        if (iframe) iframe.title = 'Choose a First Visit appointment';
        cal('ui', { theme: 'light', hideEventTypeDetails: true, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#292929' } } });
      }).catch(() => { if (generation === state.generation && state.step === 2) failure(); });
    };

    const choose = (profile, method) => {
      const previous = state.profile;
      state.profile = profile; state.inline = false; state.url = calendarUrl(); syncFields();
      document.querySelectorAll('[data-profile]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.profile === profile)));
      setChoiceStatus(''); updateCalendarCopy(); updateConfirmation();
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
    else if (requested === 'youth') {
      const date = new Date(`${requestedDate}T12:00:00Z`);
      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === requestedDate;
      const dateLabel = validDate ? new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(date) : '';
      setChoiceStatus(`Choose Child or Teen for ${requestedClass || 'this class'}${dateLabel ? ` on ${dateLabel}` : ''}${requestedTime ? ` at ${requestedTime}` : ''}.`);
    } else if (requested) setChoiceStatus('Choose who is starting, or text Sandy for help.');
  });
}());
