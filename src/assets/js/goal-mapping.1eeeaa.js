(() => {
  'use strict';

  // Sensei Sandy BJJ — Global Goal Mapping Calendly launcher
  //
  // 1. Create the Calendly event type first.
  // 2. Confirm the slug below matches the live Calendly link.
  // 3. Load this file once, just before </body>, on every HTML page:
  //    <script src="/assets/js/goal-mapping.js" defer></script>

  const CALENDLY_URL =
    'https://calendly.com/senseisandy/bjj-goal-mapping-session' +
    '?background_color=f8f8f8' +
    '&text_color=333333' +
    '&primary_color=68963c' +
    '&hide_gdpr_banner=1';

  const WIDGET_JS = 'https://assets.calendly.com/assets/external/widget.js';
  const WIDGET_CSS = 'https://assets.calendly.com/assets/external/widget.css';

  let widgetPromise;

  function isLegacyBookingLink(element) {
    if (!(element instanceof HTMLAnchorElement)) return false;
    if (window.location.pathname.replace(/\/+$/, '') === '/schedule') return false;

    try {
      const url = new URL(element.href, window.location.href);
      const isCalendly =
        url.hostname === 'calendly.com' &&
        url.pathname.startsWith('/senseisandy');

      // Internal Free Intro links keep native navigation. Only explicitly
      // marked links should open the optional third-party popup flow.
      return isCalendly;
    } catch (_) {
      return false;
    }
  }

  function isBookingTrigger(element) {
    return Boolean(
      element &&
      (
        element.matches('[data-goal-mapping]') ||
        element.matches('[data-calendly]') ||
        isLegacyBookingLink(element)
      )
    );
  }

  function findTrigger(target) {
    if (!(target instanceof Element)) return null;

    return target.closest(
      '[data-goal-mapping], [data-calendly], a[href]'
    );
  }

  function addCalendlyStyles() {
    if (document.querySelector(`link[href="${WIDGET_CSS}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = WIDGET_CSS;
    document.head.appendChild(link);
  }

  function loadCalendlyWidget() {
    if (window.Calendly?.initPopupWidget) {
      return Promise.resolve(window.Calendly);
    }

    if (widgetPromise) return widgetPromise;

    widgetPromise = new Promise((resolve, reject) => {
      // Never strand a visitor on the source page when the third-party widget
      // is blocked or slow. The catch path below preserves the hosted fallback.
      window.setTimeout(
        () => reject(new Error('Calendly widget load timed out.')),
        3000
      );

      addCalendlyStyles();

      const existing = document.querySelector(`script[src="${WIDGET_JS}"]`);

      const finish = () => {
        if (window.Calendly?.initPopupWidget) {
          resolve(window.Calendly);
        } else {
          reject(new Error('Calendly loaded without initPopupWidget.'));
        }
      };

      if (existing) {
        existing.addEventListener('load', finish, { once: true });
        existing.addEventListener(
          'error',
          () => reject(new Error('Calendly widget failed to load.')),
          { once: true }
        );

        window.setTimeout(() => {
          if (window.Calendly?.initPopupWidget) finish();
        }, 200);
        return;
      }

      const script = document.createElement('script');
      script.src = WIDGET_JS;
      script.async = true;
      script.onload = finish;
      script.onerror = () =>
        reject(new Error('Calendly widget failed to load.'));
      document.body.appendChild(script);
    });

    return widgetPromise;
  }

  function buildTrackedUrl(trigger) {
    const url = new URL(CALENDLY_URL);

    const source =
      trigger?.dataset?.source ||
      trigger?.getAttribute('aria-label') ||
      trigger?.textContent?.trim() ||
      document.title;

    url.searchParams.set('utm_source', 'senseisandy.com');
    url.searchParams.set('utm_medium', 'website');
    url.searchParams.set('utm_campaign', 'goal_mapping');
    url.searchParams.set(
      'utm_content',
      source.toLowerCase().replace(/\s+/g, '-').slice(0, 80)
    );

    return url.toString();
  }

  async function openGoalMapping(trigger) {
    const url = buildTrackedUrl(trigger);

    try {
      const Calendly = await loadCalendlyWidget();
      Calendly.initPopupWidget({ url });
    } catch (error) {
      console.warn('[Goal Mapping] Opening hosted Calendly fallback.', error);
      window.location.assign(url);
    }
  }

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const trigger = findTrigger(event.target);
    if (!isBookingTrigger(trigger)) return;

    event.preventDefault();
    openGoalMapping(trigger);
  });

  document.addEventListener('DOMContentLoaded', () => {
    const triggers = Array.from(
      document.querySelectorAll('[data-goal-mapping], [data-calendly]')
    );

    document.querySelectorAll('a[href]').forEach((link) => {
      if (isLegacyBookingLink(link)) {
        triggers.push(link);
      }
    });

    const uniqueTriggers = [...new Set(triggers)];

    uniqueTriggers.forEach((trigger) => {
      trigger.setAttribute('aria-haspopup', 'dialog');

      if (!trigger.getAttribute('aria-label')) {
        trigger.setAttribute(
          'aria-label',
          'Reserve Your Free Intro'
        );
      }
    });
  });

  // Optional GA4 event. Safe when gtag is not installed.
  window.addEventListener('message', (event) => {
    if (event.data?.event !== 'calendly.event_scheduled') return;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'goal_mapping_booked', {
        event_category: 'lead',
        event_label: document.title,
      });
    }
  });
})();
