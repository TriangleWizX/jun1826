/**
 * SenseiSandy.com — Privacy-Safe Funnel Analytics Module (DEV-801)
 * Standardizes event schema for GTM and GA4 without transmitting PII.
 */
(function () {
  "use strict";

  // Shared shell and page loaders can request this module more than once.
  if (window.__ssAnalyticsEventsInitialized) return;
  window.__ssAnalyticsEventsInitialized = true;

  window.dataLayer = window.dataLayer || [];

  const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const analyticsEnabled = !isLocalDev || window.SS_ENABLE_ANALYTICS === true;

  window.SS_TRACK_EVENT = function (eventName, eventParams) {
    const aliases = { first_visit_started: "first_visit_cta_click", profile_selected: "avatar_selected", visit_selected: "visit_window_selected", first_visit_start: "lead_form_started" };
    eventName = aliases[eventName] || eventName;
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
      if (!target || e.ssAnalyticsTracked) return;
      e.ssAnalyticsTracked = true;

      const eventName = target.getAttribute("data-analytics-event");
      const ctaLocation = target.getAttribute("data-cta-location") || target.getAttribute("data-link-location") || "body";
      const ctaLabel = target.getAttribute("data-cta-label") || target.textContent.trim();
      const offerId = target.getAttribute("data-offer-id") || "";

      const params = {
        cta_location: ctaLocation,
        cta_label: ctaLabel
      };
      const lifecycleFields = {
        offer_stage: target.getAttribute("data-offer-stage"),
        audience: target.getAttribute("data-audience"),
        source_component: target.getAttribute("data-cta-src") || target.getAttribute("data-source"),
        lane: target.getAttribute("data-cta-lane"),
        offer: target.getAttribute("data-offer") || target.getAttribute("data-offer-id")
      };
      Object.entries(lifecycleFields).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
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
