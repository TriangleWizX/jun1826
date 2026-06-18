// Centralized offer + CTA decisions (single source of truth).
const CALENDLY_BOOKING_URL = 'https://calendly.com/senseisandy?background_color=f8f8f8&primary_color=68963c&text_color=333';
window.SENSEI_DECISIONS = window.SENSEI_DECISIONS || {
  pricingVisibility: 'site-wide',
  primaryCtaLabel: 'Reserve Free Intro',
  primaryCtaUrl: '/book-free-intro',
  secondaryCtaLabel: 'Text Sandy First',
  secondaryCtaUrl: 'sms:+19177368649'
};

window.SENSEI_CONFIG = window.SENSEI_CONFIG || {};
window.SENSEI_CONFIG.pricingVisibility = window.SENSEI_DECISIONS.pricingVisibility;
window.SENSEI_CONFIG.primaryCtaLabel = window.SENSEI_DECISIONS.primaryCtaLabel;
window.SENSEI_CONFIG.primaryCtaUrl = window.SENSEI_DECISIONS.primaryCtaUrl;
window.SENSEI_CONFIG.secondaryCtaLabel = window.SENSEI_DECISIONS.secondaryCtaLabel;
window.SENSEI_CONFIG.secondaryCtaUrl = window.SENSEI_DECISIONS.secondaryCtaUrl;
