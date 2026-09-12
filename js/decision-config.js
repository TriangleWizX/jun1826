// Centralized offer + CTA decisions (single source of truth).
window.SENSEI_DECISIONS = window.SENSEI_DECISIONS || {
  pricingVisibility: 'site-wide',
  primaryCtaLabel: 'Reserve Free Intro',
  primaryCtaUrl: '/free-bjj-intro-tannersville-ny',
  secondaryCtaLabel: 'Text Sandy',
  secondaryCtaUrl: 'sms:+19177368649'
};

window.SENSEI_CONFIG = window.SENSEI_CONFIG || {};
window.SENSEI_CONFIG.pricingVisibility = window.SENSEI_DECISIONS.pricingVisibility;
window.SENSEI_CONFIG.primaryCtaLabel = window.SENSEI_DECISIONS.primaryCtaLabel;
window.SENSEI_CONFIG.primaryCtaUrl = window.SENSEI_DECISIONS.primaryCtaUrl;
window.SENSEI_CONFIG.secondaryCtaLabel = window.SENSEI_DECISIONS.secondaryCtaLabel;
window.SENSEI_CONFIG.secondaryCtaUrl = window.SENSEI_DECISIONS.secondaryCtaUrl;
