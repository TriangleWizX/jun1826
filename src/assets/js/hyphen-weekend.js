const form = document.querySelector('#hw-form');
const steps = [...document.querySelectorAll('[data-step]')];
const next = document.querySelector('#hw-next');
const back = document.querySelector('#hw-back');
const stepLabel = document.querySelector('#hw-step-label');
const stepName = document.querySelector('#hw-step-name');
const mobileCta = document.querySelector('.hw-mobile-cta');
const names = ['Dates', 'Property', 'Guests', 'Cuisine', 'Drinks', 'Bottle Match', 'Spirits', 'Icebox', 'House Drop', 'Review'];
let current = 0;
const config = { alcoholMode: 'guest_supplied', bottleSize: '750ml', ice: [] };
const checkoutAdapter = {
  start(configuration) {
    return { mode: 'reservation_inquiry', configuration };
  }
};
const send = (name, value = {}) => (window.SS_TRACK_EVENT ? window.SS_TRACK_EVENT(name, value) : window.dataLayer?.push({ event: name, ...value }));
function updateSummary() {
  const drink = form.elements.drinkPackage?.value || 'Not chosen';
  const size = form.elements.bottleSize?.value || '750ml';
  const guests = form.elements.guests?.value || '6';
  const packagePrice = Number(form.elements.drinkPackage?.selectedOptions?.[0]?.dataset.price || form.querySelector('input[name="drinkPackage"]:checked')?.dataset.price || 0);
  const sourcingPrice = Number(form.querySelector('input[name="spiritSourcing"]:checked')?.dataset.price || 0);
  const total = packagePrice + sourcingPrice;
  document.querySelector('#hw-summary-list').innerHTML = `<div><dt>Guests</dt><dd>${guests}</dd></div><div><dt>Drinks</dt><dd>${drink}</dd></div><div><dt>Bottle Match</dt><dd>${size}</dd></div><div><dt>Spirit service</dt><dd>${sourcingPrice ? `+$${sourcingPrice}` : '$0'}</dd></div><div><dt>Service subtotal</dt><dd>${total ? `$${total}` : 'Pending'}</dd></div>`;
}
function valid() {
  const fields = [...steps[current].querySelectorAll('input[required]')];
  const ok = fields.every((field) => field.checkValidity());
  steps[current].querySelector('[data-error]').textContent = ok ? '' : 'Please complete this step before continuing.';
  return ok;
}
function render() {
  steps.forEach((step, i) => { step.hidden = i !== current; });
  stepLabel.textContent = `Step ${current + 1} of ${steps.length}`;
  stepName.textContent = names[current];
  if (mobileCta) mobileCta.textContent = current === 0 ? 'Build your weekend' : `Step ${current + 1} / ${steps.length} · Continue`;
  back.hidden = current === 0;
  next.textContent = current === steps.length - 1 ? 'Review configuration' : 'Continue';
  updateSummary();
  if (current > 0) send(['hyphen_dates_selected','hyphen_property_entered','hyphen_guest_count_changed','hyphen_cuisine_selected','hyphen_drink_selected','hyphen_size_selected','hyphen_sourcing_selected','hyphen_ice_added','hyphen_delivery_selected'][current - 1]);
}
document.querySelectorAll('[data-hw-start]').forEach((link) => link.addEventListener('click', () => send('hyphen_configurator_started')));
next.addEventListener('click', () => { if (!valid()) return; if (current < steps.length - 1) { current += 1; render(); } else { const handoff = checkoutAdapter.start({ ...config, bottleSize: form.elements.bottleSize.value, deliveryDay: form.elements.deliveryDay?.value || null }); send('hyphen_configuration_completed', { alcohol_mode: handoff.configuration.alcoholMode, bottle_size: handoff.configuration.bottleSize }); send('hyphen_checkout_started', { configuration_value: handoff.mode }); document.querySelector('#hw-summary-status').textContent = 'Configuration complete. Reservation will be connected after merchant data and delivery operations are confirmed.'; next.disabled = true; next.textContent = 'Inquiry seam ready'; } });
back.addEventListener('click', () => { current -= 1; render(); });
form.addEventListener('change', (event) => { config[event.target.name] = event.target.value; updateSummary(); });
render();
