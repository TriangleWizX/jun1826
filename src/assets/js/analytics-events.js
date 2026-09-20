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

  const EXPERIMENT_STORAGE_KEY = "ss_experiments_v1";

  function getOrAssignVariant(experimentId, variants) {
    const list = Array.isArray(variants) && variants.length ? variants : ["control", "variant"];
    try {
      let assignments = {};
      const stored = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
      if (stored) assignments = JSON.parse(stored) || {};
      if (assignments[experimentId]) return assignments[experimentId];

      const params = new URLSearchParams(window.location.search || "");
      const override = params.get("exp_" + experimentId);
      if (override && list.includes(override)) {
        assignments[experimentId] = override;
        localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(assignments));
        return override;
      }

      let visitorId = localStorage.getItem("ss_visitor_id");
      if (!visitorId) {
        visitorId = "v_" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
        localStorage.setItem("ss_visitor_id", visitorId);
      }
      let hash = 0;
      const str = experimentId + ":" + visitorId;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
      }
      const assigned = list[Math.abs(hash) % list.length];
      assignments[experimentId] = assigned;
      localStorage.setItem(EXPERIMENT_STORAGE_KEY, JSON.stringify(assignments));
      return assigned;
    } catch (_) {
      return list[0];
    }
  }

  function getActiveExperiments() {
    try {
      const stored = localStorage.getItem(EXPERIMENT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (_) {
      return {};
    }
  }

  window.SenseiExperiments = {
    getVariant: getOrAssignVariant,
    getAll: getActiveExperiments,
    trackImpression: function (experimentId, variant) {
      const assigned = variant || getOrAssignVariant(experimentId);
      if (typeof window.SS_TRACK_EVENT === "function") {
        window.SS_TRACK_EVENT("experiment_impression", {
          experiment_id: experimentId,
          variant: assigned
        });
      } else if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "experiment_impression",
          experiment_id: experimentId,
          variant: assigned
        });
      }
    }
  };

  try {
    window.dispatchEvent(new CustomEvent("sensei:experiments-ready", { detail: window.SenseiExperiments }));
  } catch (_) {}

  window.SS_TRACK_EVENT = function (eventName, eventParams) {
        if (!analyticsEnabled) {
      if (isLocalDev) {
        console.log("[Analytics Debug - Disabled in Dev]", eventName, eventParams);
      }
      return;
    }

    const experiments = window.SenseiExperiments?.getAll?.() || {};
    const expPayload = {};
    if (Object.keys(experiments).length > 0) {
      expPayload.experiments = experiments;
      if (experiments.hero_cta_copy_v1) {
        expPayload.experiment_variant = experiments.hero_cta_copy_v1;
      }
    }

    const payload = Object.assign({
      page_path: window.location.pathname
    }, expPayload, eventParams || {});

    // Ensure NO PII is contained in payload
    delete payload.name;
    delete payload.email;
    delete payload.phone;
    delete payload.guardian_name;
    delete payload.goals;

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    } else {
      payload.event = eventName;
      window.dataLayer.push(payload);
    }
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
