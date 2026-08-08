/**
 * SenseiSandy.com — Acquisition Attribution Module (DEV-802)
 * Preserves acquisition context (UTM parameters, referrer, landing page, program interest)
 * in sessionStorage across navigation without storing any PII.
 */
(function () {
  "use strict";

  const STORAGE_KEY_FIRST = "ss_attr_first_touch";
  const STORAGE_KEY_LAST = "ss_attr_last_touch";

  function parseQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (key) {
      if (params.has(key)) {
        utm[key] = params.get(key);
      }
    });
    return utm;
  }

  function getCleanPath() {
    return window.location.pathname;
  }

  function initAttribution() {
    try {
      const queryUtm = parseQueryParams();
      const currentPath = getCleanPath();
      const referrer = document.referrer ? new URL(document.referrer).hostname : "direct";

      // 1. Capture First Touch (only set if not existing)
      if (!sessionStorage.getItem(STORAGE_KEY_FIRST)) {
        const firstTouchData = {
          utm_source: queryUtm.utm_source || "direct",
          utm_medium: queryUtm.utm_medium || "none",
          utm_campaign: queryUtm.utm_campaign || "none",
          landing_page: currentPath,
          referring_page: referrer,
          timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(STORAGE_KEY_FIRST, JSON.stringify(firstTouchData));
      }

      // 2. Capture Last Touch (always update if UTM present or first load)
      const lastTouchData = {
        utm_source: queryUtm.utm_source || "direct",
        utm_medium: queryUtm.utm_medium || "none",
        utm_campaign: queryUtm.utm_campaign || "none",
        last_page: currentPath,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem(STORAGE_KEY_LAST, JSON.stringify(lastTouchData));

      // 3. Populate hidden form fields if form exists on current page
      populateFormFields();

    } catch (e) {
      console.warn("Attribution tracking error:", e);
    }
  }

  function populateFormFields() {
    try {
      const first = JSON.parse(sessionStorage.getItem(STORAGE_KEY_FIRST) || "{}");
      const last = JSON.parse(sessionStorage.getItem(STORAGE_KEY_LAST) || "{}");

      const map = {
        "attr-first-utm-source": first.utm_source || "direct",
        "attr-first-utm-medium": first.utm_medium || "none",
        "attr-first-utm-campaign": first.utm_campaign || "none",
        "attr-last-utm-source": last.utm_source || "direct",
        "attr-last-utm-medium": last.utm_medium || "none",
        "attr-last-utm-campaign": last.utm_campaign || "none",
        "attr-landing-page": first.landing_page || getCleanPath(),
        "attr-referring-page": first.referring_page || "direct"
      };

      Object.keys(map).forEach(function (id) {
        const input = document.getElementById(id);
        if (input) {
          input.value = map[id];
        }
      });
    } catch (e) {
      console.warn("Error populating attribution fields:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAttribution);
  } else {
    initAttribution();
  }
})();
