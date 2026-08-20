const form = document.querySelector('#hw-form');
const steps = [...document.querySelectorAll('[data-step]')];
const next = document.querySelector('#hw-next');
const back = document.querySelector('#hw-back');
const stepLabel = document.querySelector('#hw-step-label');
const stepName = document.querySelector('#hw-step-name');
const names = ['Property + Guests', 'Bottle Match', 'Flavor', 'Finish Kit', 'Spirits', 'Icebox', 'House Drop', 'Review'];
const mobileCta = document.querySelector('.hw-mobile-cta');
let current = 0;
const config = { dates: {}, property: '', guests: 0, bottleMatch: { package: '', bottleSizeMl: 750, flavors: [] }, finishKit: { enabled: false, tier: '', garnishes: [] }, sourcing: 'guest_supplied', icebox: 'none', houseDrop: '', foodInterest: false, serviceSubtotal: 0, alcoholIncluded: false, paymentEnabled: false, transactionType: 'inquiry' };
import { HYPHEN_PRICING as prices } from './hyphen-pricing.js';
const garnishes = { bright: ['lime'], silk: ['lemon'], deep: ['orange', 'cherry'] };
const priceKey = value => value === 'full-flight' ? 'fullFlight' : value;
const isoDate = date => date.toISOString().slice(0, 10);
function setDefaultDates() { const start = new Date(); start.setHours(12, 0, 0, 0); start.setDate(start.getDate() + ((5 - start.getDay() + 7) % 7)); const end = new Date(start); end.setDate(end.getDate() + 2); config.dates = { startDate: isoDate(start), endDate: isoDate(end) }; }
function inquiryMessage() { const name = form.querySelector('input[name="package"]:checked')?.closest('label')?.querySelector('b')?.textContent || 'Bottle Match package to confirm'; const dates = config.dates.startDate && config.dates.endDate ? config.dates.startDate + ' to ' + config.dates.endDate : 'Dates to confirm'; const flavors = config.bottleMatch.flavors.join(' · ') || 'Flavors to confirm'; return 'Hyphen Weekend request\nDates: ' + dates + '\nHouse: ' + (config.property || 'Property to confirm') + '\nGuests: ' + (config.guests || 'Guests to confirm') + '\nBottle Match: ' + name + '\nFlavors: ' + flavors + '\nFinish Kit: ' + (config.finishKit.enabled ? 'Yes' : 'No') + '\nSpirit sourcing: ' + config.sourcing + '\nIcebox: ' + config.icebox + '\nHouse Drop: ' + (config.houseDrop || 'To confirm') + '\nService subtotal: $' + config.serviceSubtotal + '\nSpirit cost additional.'; }
function syncInquiryMessage() { const message = document.querySelector('#hw-inquiry-message'); if (message) { message.required = true; if (current === steps.length - 1 && config.bottleMatch.package && (message.dataset.autofilled === 'true' || !message.value)) { message.value = inquiryMessage(); message.dataset.autofilled = 'true'; } } }
const send = (name, value = {}) => (window.SS_TRACK_EVENT ? window.SS_TRACK_EVENT(name, value) : window.dataLayer?.push({ event: name, ...value }));
const pkg = () => config.bottleMatch.package;
function selectedFlavors() { return config.bottleMatch.package === 'full-flight' ? ['bright', 'silk', 'deep'] : [...form.querySelectorAll('select[name="flavorSlot"]')].map(x => x.value).filter(Boolean); }
function refresh() {
  config.bottleMatch.flavors = selectedFlavors();
  config.finishKit.tier = pkg();
  config.finishKit.garnishes = [...new Set(config.bottleMatch.flavors.flatMap(x => garnishes[x] || []))];
  const finish = config.finishKit.enabled ? prices.finishKit[priceKey(pkg())] || 0 : 0;
  const subtotal = (prices.bottleMatch[priceKey(pkg())] || 0) + finish + (prices.sourcing[config.sourcing.replace('_', '-')] || 0) + (prices.icebox[config.icebox] || 0);
  config.serviceSubtotal = subtotal;
  const packageName = form.querySelector('input[name="package"]:checked')?.closest('label')?.querySelector('b')?.textContent || 'Not chosen';
  document.querySelector('#finish-price').textContent = pkg() ? '+$' + (prices.finishKit[priceKey(pkg())] || 0) : 'Choose a package first';
  document.querySelector('#hw-summary-list').innerHTML = '<div><dt>Bottle Match</dt><dd>' + packageName + (pkg() ? ' · $' + prices.bottleMatch[priceKey(pkg())] : '') + '</dd></div><div><dt>Flavors</dt><dd>' + (config.bottleMatch.flavors.join(' · ') || 'Not chosen') + '</dd></div><div><dt>Subtotal</dt><dd>' + (subtotal ? '$' + subtotal : 'Choose your package') + '</dd></div>';
  if (current === steps.length - 1) document.querySelector('#hw-review').innerHTML = '<div><dt>Bottle Match</dt><dd>' + packageName + ' · $' + (prices.bottleMatch[priceKey(pkg())] || 0) + '</dd></div><div><dt>Finish Kit</dt><dd>' + (config.finishKit.enabled ? '$' + finish : 'Not added') + '</dd></div><div><dt>Spirits</dt><dd>' + config.sourcing + ' · $' + (prices.sourcing[config.sourcing.replace('_', '-')] || 0) + '</dd></div><div><dt>Ice</dt><dd>' + config.icebox + '</dd></div><div><dt>BEVERAGE SERVICE SUBTOTAL</dt><dd>$' + subtotal + '</dd></div>';
  document.querySelector('#hw-payload').value = JSON.stringify(config);
  syncInquiryMessage();
}
function valid() {
  const fields = [...steps[current].querySelectorAll('input[required]')];
  const flavorCount = selectedFlavors().length;
  const requiredFlavorCount = pkg() === 'full-flight' ? 3 : pkg() === 'duo' ? 2 : 1;
  const ok = fields.every(x => x.checkValidity()) && (current !== 2 || flavorCount === requiredFlavorCount);
  steps[current].querySelector('[data-error]').textContent = ok ? '' : 'Please complete this step before continuing.';
  return ok;
}
function render() { steps.forEach((s, i) => { s.hidden = i !== current; }); stepLabel.textContent = 'Step ' + (current + 1) + ' of ' + steps.length; stepName.textContent = names[current]; back.hidden = current === 0; next.textContent = current === steps.length - 1 ? 'CONTINUE TO REQUEST' : 'Continue'; if (current === 3) send('hyphen_finish_kit_viewed', { package: config.bottleMatch.package }); refresh(); }
document.querySelectorAll('[data-hw-start]').forEach(x => x.addEventListener('click', () => send('hyphen_configurator_started')));
document.querySelectorAll('[data-hw-wedding]').forEach(x => x.addEventListener('click', () => send('hyphen_wedding_cta_clicked')));
document.querySelectorAll('[data-hw-package]').forEach(x => x.addEventListener('click', () => { const input = form.querySelector('input[name="package"][value="' + x.dataset.hwPackage + '"]'); input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); send('hyphen_package_selected', { package: x.dataset.hwPackage }); }));
form.addEventListener('change', e => { if (e.target.name === 'package') { config.bottleMatch.package = e.target.value; const slots = [...form.querySelectorAll('select[name="flavorSlot"]')]; slots.forEach((x, i) => { x.required = e.target.value !== 'full-flight' && i === 0; x.disabled = e.target.value === 'full-flight'; if (e.target.value === 'full-flight') x.value = i === 0 ? 'bright' : 'silk'; else if (e.target.value === 'one' || (e.target.value === 'duo' && i > 1)) x.value = ''; }); send('hyphen_package_selected', { package: e.target.value }); } if (e.target.name === 'finishKit') { config.finishKit.enabled = e.target.checked; send(e.target.checked ? 'hyphen_finish_kit_added' : 'hyphen_finish_kit_removed'); } if (e.target.name === 'sourcing') { config.sourcing = e.target.value.replace('-', '_'); send('hyphen_sourcing_selected', { sourcing: config.sourcing }); } if (e.target.name === 'icebox') { config.icebox = e.target.value; send('hyphen_icebox_selected', { icebox: e.target.value }); } if (e.target.name === 'houseDrop') { config.houseDrop = e.target.value; send('hyphen_house_drop_selected', { house_drop: e.target.value }); } if (e.target.name === 'foodInterest') { config.foodInterest = e.target.checked; send('hyphen_food_interest_selected', { selected: e.target.checked }); } if (e.target.name === 'flavorSlot') send('hyphen_flavor_selected', { flavors: selectedFlavors() }); if (e.target.name === 'startDate' || e.target.name === 'endDate') config.dates[e.target.name] = e.target.value; if (e.target.name === 'property') config.property = e.target.value; if (e.target.name === 'guests') config.guests = Number(e.target.value); refresh(); });
next.addEventListener('click', () => { if (!valid()) return; if (current < steps.length - 1) { current++; render(); } else { send('hyphen_inquiry_started', { package: config.bottleMatch.package }); const inquiry = document.querySelector('#inquiry'); inquiry.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.querySelector('#hw-name')?.focus({ preventScroll: true }); document.querySelector('#hw-summary-status').textContent = 'Your configuration is ready. Add your contact details below and send the request.'; } });
back.addEventListener('click', () => { current--; render(); });
document.querySelector('#hw-inquiry-form')?.addEventListener('submit', () => send('hyphen_inquiry_submitted', { package: config.bottleMatch.package, flavors: config.bottleMatch.flavors, finish_kit: config.finishKit.enabled, sourcing: config.sourcing, icebox: config.icebox, house_drop: config.houseDrop }));
setDefaultDates();
render();
form.querySelector('#hw-inquiry-message')?.addEventListener('input', e => { e.target.dataset.autofilled = 'false'; });
refresh();
if (mobileCta && 'IntersectionObserver' in window) new IntersectionObserver(([entry]) => mobileCta.classList.toggle('hw-mobile-cta-hidden', entry.isIntersecting), { threshold: 0.1 }).observe(document.querySelector('.hw-actions'));
