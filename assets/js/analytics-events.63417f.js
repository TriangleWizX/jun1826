/**
 * SenseiSandy.com — Privacy-Safe Funnel Analytics Module (DEV-801)
 * Standardizes event schema for GTM and GA4 without transmitting PII.
 */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const analyticsEnabled = !isLocalDev || window.SS_ENABLE_ANALYTICS === true;

  window.SS_TRACK_EVENT = function (eventName, eventParams) {
    if (!analyticsEnabled) {
      if (isLocalDev) {
        console.log("[Analytics Debug - Disabled in Dev]", eventName, eventParams);
      }
      return;
    }

    const payload = Object.assign({
      event: eventName,
      page_path: window.location.pathname
    }, eventParams || {});

    // Ensure NO PII is contained in payload
    delete payload.name;
    delete payload.email;
    delete payload.phone;
    delete payload.guardian_name;
    delete payload.goals;

    window.dataLayer.push(payload);
  };

  function initGlobalListeners() {
    document.addEventListener("click", function (e) {
      const target = e.target.closest("[data-analytics-event]");
      if (!target) return;

      const eventName = target.getAttribute("data-analytics-event");
      const ctaLocation = target.getAttribute("data-cta-location") || target.getAttribute("data-link-location") || "body";
      const ctaLabel = target.getAttribute("data-cta-label") || target.textContent.trim();
      const offerId = target.getAttribute("data-offer-id") || "";

      const params = {
        cta_location: ctaLocation,
        cta_label: ctaLabel
      };
      if (offerId) params.offer_id = offerId;

      window.SS_TRACK_EVENT(eventName, params);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobalListeners);
  } else {
    initGlobalListeners();
  }
})();
