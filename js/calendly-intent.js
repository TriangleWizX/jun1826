(function () {
  const CSS_URL = 'https://assets.calendly.com/assets/external/widget.css';
  const JS_URL = 'https://assets.calendly.com/assets/external/widget.js';
  const DEFAULT_CALENDLY_URL = 'https://calendly.com/senseisandy';
  const SCRIPT_TIMEOUT_MS = 15000;
  const READY_TIMEOUT_MS = 6000;
  const CALENDLY_THEME = {
    background_color: 'fbfaf8',
    text_color: '1f1712',
    primary_color: '289fa1'
  };

  const INLINE_TRIGGER_SELECTOR = '.js-calendly-open';
  const INLINE_MOUNT_SELECTOR = '#calendly-embed, #calendly-embed-onsite, [data-calendly-inline]';
  const INLINE_SECTION_ID = 'book';

  let loadPromise = null;

  const addCalendlyCss = () => {
    if (document.querySelector(`link[href="${CSS_URL}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CSS_URL;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    document.head.appendChild(link);
  };

  const waitForCalendlyReady = (timeoutMs) => new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
        resolve();
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Calendly ready timeout'));
        return;
      }
      window.setTimeout(check, 60);
    };
    check();
  });

  const appendCalendlyScript = () => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = JS_URL;
    script.async = true;

    const timeoutId = window.setTimeout(() => {
      reject(new Error('Calendly script timeout'));
    }, SCRIPT_TIMEOUT_MS);

    script.onload = () => {
      waitForCalendlyReady(READY_TIMEOUT_MS)
        .then(resolve)
        .catch(reject)
        .finally(() => window.clearTimeout(timeoutId));
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('Calendly failed to load'));
    };

    (document.body || document.head || document.documentElement).appendChild(script);
  });

  const addCalendlyScript = () => {
    if (window.Calendly) return Promise.resolve();

    const existing = document.querySelector(`script[src="${JS_URL}"]`);
    if (existing && !window.Calendly) {
      existing.remove();
    }

    return appendCalendlyScript();
  };

  const loadCalendlyAssets = () => {
    if (loadPromise) return loadPromise;
    addCalendlyCss();
    loadPromise = addCalendlyScript();
    return loadPromise;
  };

  const getInlineMounts = () => Array.from(document.querySelectorAll(INLINE_MOUNT_SELECTOR));

  const isCalendlyUrl = (value) => {
    if (!value) return false;
    try {
      const parsed = new URL(value, window.location.origin);
      return /(^|\.)calendly\.com$/i.test(parsed.hostname);
    } catch (err) {
      return false;
    }
  };

  const applyCalendlyTheme = (value) => {
    const fallback = DEFAULT_CALENDLY_URL;
    const base = isCalendlyUrl(value) ? value : fallback;
    try {
      const url = new URL(base, window.location.origin);
      Object.entries(CALENDLY_THEME).forEach(([key, themeValue]) => {
        if (!url.searchParams.get(key)) {
          url.searchParams.set(key, themeValue);
        }
      });
      return url.toString();
    } catch (err) {
      return `${fallback}?background_color=${CALENDLY_THEME.background_color}&text_color=${CALENDLY_THEME.text_color}&primary_color=${CALENDLY_THEME.primary_color}`;
    }
  };

  const resolveUrl = (trigger, mount) => {
    const mountUrl =
      (mount && (mount.getAttribute('data-calendly-url') || mount.dataset.calendlyUrl)) || '';

    const triggerUrl = trigger
      ? (trigger.getAttribute('data-calendly-url') || trigger.dataset.calendlyUrl || '')
      : '';

    const triggerHref = trigger ? (trigger.getAttribute('href') || '') : '';
    const base =
      mountUrl ||
      triggerUrl ||
      (triggerHref && !triggerHref.startsWith('#') ? triggerHref : '') ||
      DEFAULT_CALENDLY_URL;

    if (typeof window.buildBookIntroUrl === 'function') {
      try {
        const src = (trigger?.dataset?.ctaSrc || trigger?.dataset?.ctaPosition || 'scroll') + '';
        const loc = (trigger?.dataset?.ctaLoc || trigger?.dataset?.ctaLocation || '') + '';
        const tracked = window.buildBookIntroUrl({ base, src, loc });
        return applyCalendlyTheme(tracked);
      } catch (err) {
        return applyCalendlyTheme(base);
      }
    }

    return applyCalendlyTheme(base);
  };

  const openPopup = (url) => {
    if (!url) return true;

    loadCalendlyAssets()
      .then(() => {
        if (window.Calendly && typeof window.Calendly.initPopupWidget === 'function') {
          window.Calendly.initPopupWidget({ url });
        } else {
          window.location.href = url;
        }
      })
      .catch(() => {
        window.location.href = url;
      });

    return false;
  };

  const getPopupTrigger = (target) => {
    if (!target) return null;
    return target.closest('[data-calendly-popup]');
  };

  const initInlineCalendly = async (trigger, mount) => {
    if (!mount) return;

    const url = resolveUrl(trigger, mount);
    if (!url) return;

    if (mount.dataset.loaded === '1' && mount.dataset.calendlyUrl === url) return;

    mount.dataset.loaded = '1';
    mount.dataset.calendlyUrl = url;

    mount.innerHTML = '<div class="ss-calendly__loading"><p class="fw-semibold mb-1">Finding available intro times&hellip;</p><p class="small mb-2">Calendar not loading? <a href="sms:+19177368649?body=I%20want%20a%20Free%20Intro." data-contact-pref="text">Text Sandy: "I want a Free Intro."</a></p><p class="small text-muted mb-0">While this loads, here&rsquo;s what happens first: room tour, safety walkthrough, Beginner Lane.</p></div>';

    try {
      await loadCalendlyAssets();
    } catch (err) {
      window.location.href = url;
      return;
    }

    mount.innerHTML = '';
    mount.classList.add('calendly-inline-widget');
    mount.setAttribute('data-url', url);
    if (!mount.style.minWidth) mount.style.minWidth = '320px';
    if (!mount.style.height) mount.style.height = '700px';

    let prefill = null;
    if (mount.dataset.prefill) {
      try {
        prefill = JSON.parse(mount.dataset.prefill);
      } catch (e) {}
    }

    if (window.Calendly && typeof window.Calendly.initInlineWidget === 'function') {
      const options = {
        url,
        parentElement: mount,
        resize: true
      };
      if (prefill) {
        options.prefill = prefill;
      }
      window.Calendly.initInlineWidget(options);
    } else {
      window.location.href = url;
    }
  };

  const handleInlineClick = (event) => {
    const trigger = event.target.closest(INLINE_TRIGGER_SELECTOR);
    if (!trigger) return;

    const mounts = getInlineMounts();
    const hasInline = mounts.length > 0;

    if (!hasInline) {
      event.preventDefault();
      const url = resolveUrl(trigger, null);
      openPopup(url);
      return;
    }

    event.preventDefault();
    initInlineCalendly(trigger, mounts[0]);

    const section = document.getElementById(INLINE_SECTION_ID);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleInlineIntent = (event) => {
    const trigger = event.target.closest(INLINE_TRIGGER_SELECTOR);
    if (!trigger) return;
    loadCalendlyAssets();
  };

  const handlePopupClick = (event) => {
    const trigger = getPopupTrigger(event.target);
    if (!trigger) return;
    event.preventDefault();
    const url = resolveUrl(trigger, null);
    openPopup(url);
  };

  const handlePopupIntent = (event) => {
    const trigger = getPopupTrigger(event.target);
    if (!trigger) return;
    loadCalendlyAssets();
  };

  document.addEventListener('click', handlePopupClick);
  document.addEventListener('touchstart', handlePopupIntent, { passive: true });
  document.addEventListener('mouseover', handlePopupIntent, { passive: true });

  document.addEventListener('click', handleInlineClick);
  document.addEventListener('pointerover', handleInlineIntent, { passive: true });
  document.addEventListener('focusin', handleInlineIntent);

  const boot = () => {};
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.SSCalendly = {
    load: loadCalendlyAssets,
    openPopup,
    openInline: (trigger) => {
      const mounts = getInlineMounts();
      if (!mounts.length) return openPopup(resolveUrl(trigger, null));
      return initInlineCalendly(trigger, mounts[0]);
    }
  };
})();
