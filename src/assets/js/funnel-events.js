/**
 * Funnel stages for the First Visit path.
 *
 * Browser-observable stages are emitted automatically. Later lifecycle stages
 * are exposed through SS_TRACK_FUNNEL_STAGE for confirmed operational events;
 * the site must not infer attendance, purchase, activation, or renewal.
 */
(function () {
  "use strict";

  const BOOKING_PATH = "/free-bjj-intro-tannersville-ny";
  const startedForms = new WeakSet();
  const submittedForms = new WeakSet();

  function normalizeLane(value) {
    const raw = String(value || "").toLowerCase();
    if (raw.includes("kid") || raw.includes("child") || raw === "youth") return "kids";
    if (raw.includes("teen")) return "teens";
    if (raw.includes("adult")) return "adults";
    if (raw.includes("family")) return "family_unsure";
    return "family_unsure";
  }

  function query(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function laneFor(element) {
    const explicit = element?.dataset?.lane || element?.dataset?.ctaLane;
    if (explicit) return normalizeLane(explicit);
    const href = element?.getAttribute?.("href") || "";
    try {
      const url = new URL(href, window.location.origin);
      if (url.searchParams.get("lane")) return normalizeLane(url.searchParams.get("lane"));
    } catch (_) { /* use page/form context */ }
    const formLane = element?.querySelector?.("[name='student_lane'], [name='audience_lane']")?.value;
    if (formLane) return normalizeLane(formLane);
    return normalizeLane(query("lane") || document.body?.dataset?.audience);
  }

  function context(element, extra) {
    const campaign = query("campaign") || query("utm_campaign") ||
      window.SENSEI_LINK_UTILS?.readStoredAttribution?.()?.utm_campaign || "";
    const payload = {
      lane: laneFor(element),
      source_page: window.location.pathname || "/",
      campaign: campaign || "none",
      ...extra
    };
    if (element?.dataset?.sourcePage) payload.source_page = element.dataset.sourcePage;
    return payload;
  }

  function track(name, element, extra) {
    if (typeof window.SS_TRACK_EVENT === "function") {
      window.SS_TRACK_EVENT(name, context(element, extra));
    }
  }

  // Operational systems can call this after a real confirmation or lifecycle
  // update. Optional IDs are accepted only when supplied by that system.
  window.SS_TRACK_FUNNEL_STAGE = function (stage, details) {
    const allowed = new Set([
      "visit_confirmed", "first_visit_showed", "first_class_attended",
      "core_purchased", "activated_30d", "renewed"
    ]);
    if (!allowed.has(stage) || typeof window.SS_TRACK_EVENT !== "function") return;
    const safe = details && typeof details === "object" ? { ...details } : {};
    delete safe.name; delete safe.email; delete safe.phone;
    window.SS_TRACK_EVENT(stage, context(null, safe));
  };

  function isBookingLink(element) {
    if (!element?.matches?.("a[href]")) return false;
    try {
      return new URL(element.href, window.location.origin).pathname.replace(/\/+$/, "") === BOOKING_PATH;
    } catch (_) { return false; }
  }

  function formContext(form) {
    const selected = form.querySelector("[name='student_lane'], [name='audience_lane'], #booking-profile-value");
    const preferred = form.querySelector("[name='preferred_day'], [name='preferred_class_day'], [name='schedule_pref'], #booking-class-value");
    const period = form.querySelector("[name='preferred_days']:checked, [data-requested-start-period]");
    return {
      lane: normalizeLane(selected?.value || query("lane")),
      requested_start_period: period?.value || period?.dataset?.requestedStartPeriod || "",
      preferred_day: preferred?.value || ""
    };
  }

  function init() {
    document.addEventListener("click", function (event) {
      const link = event.target.closest("a[href]");
      if (isBookingLink(link)) {
        track("first_visit_cta_click", link, {
          cta_label: (link.textContent || "").trim().slice(0, 120),
          cta_location: link.dataset.ctaPlacement || link.dataset.ctaLocation || "body"
        });
      }
    });

    document.querySelectorAll("#pb-step-3 form, #ss-free-intro-form, form[data-booking-form]").forEach(function (form) {
      form.addEventListener("input", function () {
        if (startedForms.has(form)) return;
        startedForms.add(form);
        track("booking_started", form, formContext(form));
      });
      form.addEventListener("submit", function (event) {
        if (!form.checkValidity() || submittedForms.has(form)) return;
        submittedForms.add(form);
        track("booking_submitted", form, formContext(form));
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
}());
