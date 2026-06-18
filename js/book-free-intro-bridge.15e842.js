(() => {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }
    fn();
  };

  const readAttribution = () => {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const tracking = window.SENSEI_LINK_UTILS?.getTrackingParams
        ? window.SENSEI_LINK_UTILS.getTrackingParams(window.location.search)
        : {};
      const src = String(tracking.src || params.get('src') || '').trim().toLowerCase();
      const utmSource = String(tracking.utm_source || params.get('utm_source') || '').trim().toLowerCase();
      return src === 'instagram' || utmSource === 'instagram';
    } catch (error) {
      return false;
    }
  };

  const applyCopyVariant = (bridge, isInstagram) => {
    bridge.dataset.attributionState = isInstagram ? 'instagram' : 'default';
    bridge.querySelectorAll('[data-instagram-copy-target]').forEach((el) => {
      const next = isInstagram ? el.dataset.instagramCopy : el.dataset.defaultCopy;
      if (!next) return;
      el.textContent = next;
    });
  };

  ready(() => {
    const bridge = document.querySelector('[data-instagram-bridge]');
    if (!bridge) return;
    const syncVariant = () => applyCopyVariant(bridge, readAttribution());
    syncVariant();
    window.addEventListener('load', syncVariant, { once: true });
  });
})();
