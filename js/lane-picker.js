/**
 * Lane Picker (Homepage)
 * - State: mixed | youth | adult
 * - Persistence: localStorage key "ss_lane"
 * - Hooks: toggles body classes, offer block variants, and hero form behavior.
 */

(() => {
  const laneConfig = {
    defaultMode: 'mixed', // 'mixed' | 'autoByPath'
  };

  const STORAGE_KEY = 'ss_lane';
  const VALID_LANES = new Set(['mixed', 'youth', 'adult']);

  const trackEvent =
    window.trackEvent ||
    function trackEventStub(name, properties) {
      // eslint-disable-next-line no-console
      console.log('[trackEvent]', name, properties);
    };

  window.trackEvent = trackEvent;

  const pagePath = () => window.location.pathname;

  const safeReadStorage = () => {
    try {
      return window.localStorage?.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  };

  const safeWriteStorage = (value) => {
    try {
      if (!window.localStorage) return;
      if (!value || value === 'mixed') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore storage failures (private mode, disabled storage, etc.)
    }
  };

  const getAutoLaneByPath = () => {
    const path = (window.location.pathname || '/').toLowerCase();
    if (path.startsWith('/kids')) return 'youth';
    if (path.startsWith('/adults') || path.startsWith('/adult')) return 'adult';
    return 'mixed';
  };

  const getInitialLane = () => {
    const stored = (safeReadStorage() || '').toLowerCase().trim();
    if (stored === 'youth' || stored === 'adult') return stored;

    if (laneConfig.defaultMode === 'autoByPath') {
      return getAutoLaneByPath();
    }

    return 'mixed';
  };

  let currentLane = 'mixed';
  let formStartedTracked = false;
  let lastChildAgeVisibility = null;

  const getAudienceLabel = (lane) => {
    if (lane === 'youth') return 'Youth (Kids + Teens)';
    if (lane === 'adult') return 'Adults (18+)';
    return 'Mixed (Youth + Adults)';
  };

  const updateNavAudienceStatus = (lane) => {
    const statusEl = document.getElementById('navViewingStatus');
    if (!statusEl) return;
    const label = lane === 'adult' ? 'Adults' : lane === 'youth' ? 'Youth' : 'Mixed (Youth + Adults)';
    statusEl.textContent = `You’re viewing: ${label}`;
  };

  const updateLaneToggles = (lane) => {
    const groups = Array.from(document.querySelectorAll('[data-ss-lane-toggle]'));
    if (!groups.length) return;

    groups.forEach((group) => {
      const buttons = Array.from(group.querySelectorAll('[data-ss-lane-toggle-option]'));
      buttons.forEach((btn) => {
        const option = (btn.getAttribute('data-ss-lane-toggle-option') || '').toLowerCase();
        const isActive = option === lane;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    });
  };

  const applyLaneToPage = (lane) => {
    const body = document.body;
    if (!body) return;

    body.classList.remove('lane-mixed', 'lane-youth', 'lane-adult');
    body.classList.add(`lane-${lane}`);

    body.dataset.audience = lane === 'adult' ? 'adults' : lane;
    updateNavAudienceStatus(lane);

    const heroAudienceLabel = document.getElementById('heroAudienceLabel');
    if (heroAudienceLabel) heroAudienceLabel.textContent = `Audience: ${getAudienceLabel(lane)}`;

    const hiddenLane = document.getElementById('ssLaneHidden');
    if (hiddenLane) hiddenLane.value = lane;

    const laneCards = Array.from(document.querySelectorAll('[data-ss-lane-card]'));
    laneCards.forEach((card) => {
      const cardLane = (card.getAttribute('data-ss-lane-card') || '').toLowerCase();
      const selected = lane !== 'mixed' && cardLane === lane;
      card.classList.toggle('is-selected', selected);
      const input = card.querySelector('input.hero-lane-card__input');
      if (input) input.checked = selected;
    });

    const childAgeWrap = document.querySelector('[data-ss-form-child-age-wrap]');
    const childAgeInput = document.getElementById('childAge');
    const shouldShowChildAge = lane !== 'adult';
    if (childAgeWrap) childAgeWrap.hidden = !shouldShowChildAge;
    if (childAgeInput) childAgeInput.disabled = !shouldShowChildAge;

    if (lastChildAgeVisibility !== null && lastChildAgeVisibility !== shouldShowChildAge) {
      trackEvent(shouldShowChildAge ? 'form_child_age_shown' : 'form_child_age_hidden', {
        lane: currentLane,
        module_location: 'form',
        page_path: pagePath(),
      });
    }
    lastChildAgeVisibility = shouldShowChildAge;

    const helperEl = document.querySelector('[data-ss-lane-form-helper]');
    if (helperEl) {
      if (lane === 'youth') {
        helperEl.textContent = 'Busy schedule? We’ll help you pick the easiest first day.';
        helperEl.hidden = false;
      } else if (lane === 'adult') {
        helperEl.textContent = 'Day 1 is technical + controlled—no hard sparring.';
        helperEl.hidden = false;
      } else {
        helperEl.textContent = '';
        helperEl.hidden = true;
      }
    }

    const scheduleBullet = document.querySelector('[data-ss-form-bullet="schedule"]');
    if (scheduleBullet) {
      scheduleBullet.textContent =
        lane === 'adult'
          ? 'See adults’ class time: 6:00 PM'
          : 'See youth class time: Mon, Tue, Wed, Fri at 5:00 PM';
    }

    const saveSpotBullet = document.querySelector('[data-ss-form-bullet="save_spot"]');
    if (saveSpotBullet) {
      saveSpotBullet.textContent =
        lane === 'adult'
          ? 'Save a 6 PM adult spot (or ask for another time)'
          : 'Save a 5 PM youth spot (or ask for another time)';
    }

    const scheduleLabel = document.querySelector('[data-ss-form-schedule-label]');
    if (scheduleLabel) {
      scheduleLabel.textContent =
        lane === 'adult'
          ? 'Does 6:00 PM in Tannersville work?'
          : 'Does 5:00 PM in Tannersville work?';
    }

    const scheduleOptionPrimary = document.querySelector('[data-ss-form-schedule-option="primary"]');
    if (scheduleOptionPrimary) {
      if (lane === 'adult') {
        scheduleOptionPrimary.value = 'yes-6pm-track';
        scheduleOptionPrimary.textContent = 'Yes, 6:00 PM works';
      } else {
        scheduleOptionPrimary.value = 'yes-5pm-track';
        scheduleOptionPrimary.textContent = 'Yes, that works';
      }
    }

    const switchBtn = document.querySelector('[data-ss-lane-switch]');
    if (switchBtn) {
      if (lane === 'youth') {
        switchBtn.textContent = 'Switch to Adults';
        switchBtn.hidden = false;
      } else if (lane === 'adult') {
        switchBtn.textContent = 'Switch to Youth';
        switchBtn.hidden = false;
      } else {
        switchBtn.textContent = '';
        switchBtn.hidden = true;
      }
    }

    updateLaneToggles(lane);
  };

  const setLane = (nextLane, options = {}) => {
    const { persist = true, moduleLocation = 'hero_lane_picker', trackSelection = true } = options;
    const normalized = (nextLane || '').toLowerCase();
    const lane = VALID_LANES.has(normalized) ? normalized : 'mixed';

    const prevLane = currentLane;
    currentLane = lane;

    if (persist) safeWriteStorage(lane);
    applyLaneToPage(lane);

    if (trackSelection && prevLane !== lane && (lane === 'youth' || lane === 'adult')) {
      trackEvent(lane === 'youth' ? 'lane_selected_youth' : 'lane_selected_adult', {
        lane: lane,
        module_location: moduleLocation,
        page_path: pagePath(),
      });
    }
  };

  const initLanePicker = () => {
    currentLane = getInitialLane();
    applyLaneToPage(currentLane);

    const laneCards = Array.from(document.querySelectorAll('[data-ss-lane-card]'));
    laneCards.forEach((card) => {
      const lane = (card.getAttribute('data-ss-lane-card') || '').toLowerCase();
      const input = card.querySelector('input.hero-lane-card__input');
      if (input) {
        input.addEventListener('change', () => setLane(lane, { moduleLocation: 'hero_lane_picker' }));
      }

      card.addEventListener('click', (e) => {
        const isInteractive = e.target.closest('a, button, input, select, textarea');
        if (isInteractive) return;
        setLane(lane, { moduleLocation: 'hero_lane_picker' });
      });
    });

    const ctas = Array.from(document.querySelectorAll('[data-ss-cta]'));
    ctas.forEach((cta) => {
      cta.addEventListener('click', () => {
        const name = cta.getAttribute('data-ss-cta');
        if (!name) return;

        const lane = name.endsWith('_youth') ? 'youth' : name.endsWith('_adult') ? 'adult' : currentLane;
        setLane(lane, { moduleLocation: 'hero_lane_picker' });

        trackEvent(name, {
          lane: currentLane,
          module_location: 'hero_lane_picker',
          page_path: pagePath(),
        });
      });
    });

    const switchBtn = document.querySelector('[data-ss-lane-switch]');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        if (currentLane === 'youth') setLane('adult', { moduleLocation: 'form' });
        else if (currentLane === 'adult') setLane('youth', { moduleLocation: 'form' });
      });
    }

    const toggleButtons = Array.from(document.querySelectorAll('[data-ss-lane-toggle-option]'));
    toggleButtons.forEach((btn) => {
      const option = (btn.getAttribute('data-ss-lane-toggle-option') || '').toLowerCase();
      if (!VALID_LANES.has(option)) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setLane(option, { moduleLocation: 'offer_toggle' });
      });
    });

    const form = document.querySelector('form.needs-validation');
    if (form) {
      form.addEventListener('focusin', () => {
        if (formStartedTracked) return;
        formStartedTracked = true;
        trackEvent('form_started', {
          lane: currentLane,
          module_location: 'form',
          page_path: pagePath(),
        });
      });

      form.addEventListener('submit', (e) => {
        const isValid = typeof form.checkValidity === 'function' ? form.checkValidity() : true;
        if (!isValid) {
          e.preventDefault();
          e.stopPropagation();
          form.classList.add('was-validated');
          trackEvent('form_error', {
            lane: currentLane,
            module_location: 'form',
            page_path: pagePath(),
          });
          return;
        }

        trackEvent('form_submit_success', {
          lane: currentLane,
          module_location: 'form',
          page_path: pagePath(),
        });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', initLanePicker);
})();
