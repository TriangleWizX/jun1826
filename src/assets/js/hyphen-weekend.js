const form = document.querySelector('#hw-form');
const dateStep = document.createElement('fieldset');
dateStep.dataset.step = '0';
dateStep.hidden = true;
dateStep.innerHTML = '<legend>When should the house be ready?</legend><label for="hw-start-date">Arrival date</label><input id="hw-start-date" name="startDate" type="date" required><label for="hw-end-date">Leaving date</label><input id="hw-end-date" name="endDate" type="date" required><p class="hw-error" data-error></p>';
form.prepend(dateStep);
dateStep.querySelector('input[name="startDate"]').min = new Date().toISOString().slice(0, 10);
const sizeStep = document.createElement('fieldset');
sizeStep.dataset.step = '2';
sizeStep.hidden = true;
sizeStep.innerHTML = '<legend>HOW MUCH HOUSE ARE WE STOCKING?</legend><p class="hw-note">750 mL is the standard Bottle Match. Go smaller for a short stay or larger for a fuller house.</p><div class="hw-choice-grid hw-size-grid">' + [[375,'375 mL','CABIN','A smaller Bottle Match. About 6 pours each.'],[750,'750 mL','HOUSE · DEFAULT','The standard Bottle Match. About 12 pours each.'],[1000,'1 L','GATHERING','More room around the table. About 16 pours each.'],[1500,'1.5 L','FULL HOUSE','Built for the larger weekend. About 24 pours each.']].map(([ml,label,name,copy]) => '<label class="hw-choice"><input type="radio" name="bottleSize" value="'+ml+'"'+(ml===750?' checked':'')+' required><span><b>'+label+'</b><strong>'+name+'</strong><small>'+copy+'</small></span></label>').join('') + '</div><p class="hw-error" data-error></p>';
form.querySelector('[data-step="2"]').before(sizeStep);
const steps = [...document.querySelectorAll('[data-step]')];
const next = document.querySelector('#hw-next');
const back = document.querySelector('#hw-back');
const stepLabel = document.querySelector('#hw-step-label');
const stepName = document.querySelector('#hw-step-name');
const names = ['Dates', 'Property + Guests', 'Bottle Size', 'Bottle Match', 'Flavor', 'Finish Kit', 'Spirits', 'Icebox', 'House Drop', 'Review'];
const availability = { '2026-08-21': { friday: 'available' }, '2026-08-22': { saturday_morning: 'limited' } };
const mobileCta = document.querySelector('.hw-mobile-cta');
const finishChoice = form.querySelector('input[name="finishKit"]')?.closest('label');
const garnishNote = document.createElement('small');
garnishNote.id = 'finish-garnish-note';
finishChoice?.append(garnishNote);
document.querySelector('.hw-pricing[aria-labelledby="hw-pricing-title"] .hw-section-intro p:last-child').textContent = '750 mL is our standard Bottle Match. Choose a smaller or larger bottle for the house you are stocking.';
document.querySelector('.hw-configurator .hw-eyebrow').textContent = 'HOUSE DROP · REQUEST YOUR WEEKEND';
document.querySelector('.hw-pricing[aria-labelledby="flavors-title"] > p:last-child').innerHTML = 'Finish Kit from +$25<br>Icebox: +$39 · Full Icebox: +$59';
const weddingAnchor = document.querySelector('.hw-wedding-house .hw-price-card strong');
if (weddingAnchor) weddingAnchor.textContent = '750 mL House Setup — $358 + spirits';
const heroCopy = document.querySelector('.hw-hero-copy');
if (heroCopy) { const proof = document.createElement('div'); proof.className = 'hw-proof-strip'; proof.innerHTML = '<strong>Near Hunter · Windham · Belleayre</strong><span>Built for the rental house—the place the weekend keeps going after dinner, après and the wedding are over.</span>'; heroCopy.querySelector('.hw-actions')?.before(proof); heroCopy.querySelector('.hw-hero-lede').textContent = 'Bottle Match cocktail kits, serious ice and fresh finishes—built for the hours you actually spend back at the house.'; }
const problem = document.querySelector('.hw-problem');
if (problem) problem.insertAdjacentHTML('afterend', '<section class="hw-house hw-house-context" aria-labelledby="night-ends-title"><div><p class="hw-eyebrow">THE NIGHT ENDS AT THE HOUSE</p><h2 id="night-ends-title">Go out. Come back. Keep the night going.</h2><p>There are good bars around the mountains. But this is not a city. A lot of kitchens and bars wind down around 9 or 10, later options are limited, and your rental might be another 10, 15 or 20 minutes down a mountain road.</p><p>If you are spending the weekend near Hunter, Windham or Belleayre, the part of the night you actually control happens back at the house.</p><p>Bottle Match is already cold. The ice is already there. The citrus is already cut.</p><p><b>Open the fridge. Build the glass. Stay in.</b></p><a class="hw-button hw-button-primary" href="#configurator" data-hw-start>BUILD THE HOUSE</a></div></section><section class="hw-house hw-apres" aria-labelledby="apres-title"><div><p class="hw-eyebrow">FOR SKI WEEKENDS</p><h2 id="apres-title">Après does not have to end when the bar closes.</h2><p>Ski. Eat. Have a drink in town. Then come back to the house with the rest of the night already handled.</p><p><b>Bottle Match · Finish Kit · Serious Ice · House Drop</b></p><p>For weekend houses near Hunter, Windham and Belleayre.</p></div></section>');
const nightlifeVenues = { hunter: [{ name: 'Slopes Hunter Mountain', close: 'Close', note: 'Late-night service advertised; exact close not published.', official: 'https://www.slopeshuntermountain.com/', maps: 'https://www.google.com/maps/search/?api=1&query=Slopes+Hunter+Mountain+6002+Main+Street+Tannersville+NY+12485' }, { name: 'Hunter Tavern', close: '10 PM', note: 'Friday and Saturday published hours.', official: 'https://www.huntertavern.com/', maps: 'https://www.google.com/maps/search/?api=1&query=Hunter+Tavern+7433+Main+Street+Hunter+NY+12442' }, { name: 'Jägerberg Beer Hall', close: '9 PM', note: 'Friday and Saturday published hours.', official: 'https://jagerberghall.com/', maps: 'https://www.google.com/maps/search/?api=1&query=Jagerberg+Beer+Hall+7722+Main+Street+Hunter+NY+12442' }], windham: [{ name: 'TapHouse Grille', close: 'Midnight', note: 'Published daily hours.', official: 'https://www.taphousegrillewindham.com/', maps: 'https://www.google.com/maps/search/?api=1&query=TapHouse+Grille+5359+Main+Street+Windham+NY+12496' }, { name: 'Union + Post', close: 'Late', note: 'Bar open late; exact close not published.', official: 'https://www.unionandpost.com/restaurant/', maps: 'https://www.google.com/maps/search/?api=1&query=Union+and+Post+5098+NY-23+Windham+NY+12496' }, { name: 'The Windham Local', close: '9 PM', note: 'Friday and Saturday published hours.', official: 'https://www.thewindhamlocal.com/', maps: 'https://www.google.com/maps/search/?api=1&query=The+Windham+Local+5410+Main+Street+Windham+NY+12496' }], belleayre: [{ name: 'The Print House', close: '11 PM', note: 'Friday and Saturday published hours.', official: 'https://www.instagram.com/printhouseny/', maps: 'https://www.google.com/maps/search/?api=1&query=The+Print+House+1070+Main+Street+Fleischmanns+NY+12430' }, { name: 'Ralph’s Bar & Bowling', close: '11 PM', note: 'Friday through Sunday published hours.', official: 'https://www.urbancowboy.com/catskills/eat-drink', maps: 'https://www.google.com/maps/search/?api=1&query=Ralphs+Bar+and+Bowling+822+Oliverea+Road+Big+Indian+NY+12410' }, { name: 'Peekamoose Restaurant & Tap Room', close: '10 PM', note: 'Friday and Saturday published hours.', official: 'https://www.peekamooserestaurant.com/', maps: 'https://www.google.com/maps/search/?api=1&query=Peekamoose+Restaurant+8373+State+Route+28+Big+Indian+NY+12410' }] };
const nightlifeSection = document.createElement('section'); nightlifeSection.className = 'hw-nightlife'; nightlifeSection.setAttribute('aria-labelledby', 'nightlife-title'); nightlifeSection.innerHTML = '<div class="hw-section-intro"><p class="hw-eyebrow">TONIGHT NEAR THE MOUNTAINS</p><h2 id="nightlife-title">There are bars around. The late-night options thin out fast.</h2><p>There are good places for a drink around Hunter, Windham and Belleayre. Here are published hours to check before you head out.</p></div><div class="hw-nightlife-tabs" role="tablist">' + [['hunter','Hunter'],['windham','Windham'],['belleayre','Belleayre']].map(([id,label]) => '<button type="button" class="hw-button hw-button-quiet" data-nightlife-locale="' + id + '" role="tab">' + label + '</button>').join('') + '</div><div class="hw-nightlife-grid"></div><p class="hw-nightlife-note">Hours can change. Check the official source before you go; Hyphen is for the part of the night that happens back at the house.</p>';
document.querySelector('.hw-house-context')?.after(nightlifeSection);
function renderNightlife(locale = 'hunter') { nightlifeSection.querySelector('.hw-nightlife-grid').innerHTML = nightlifeVenues[locale].map(venue => '<article class="hw-nightlife-card"><p class="hw-price-kicker">PUBLISHED HOURS</p><h3>' + venue.name + '</h3><strong>' + venue.close + '</strong><p>' + venue.note + '</p><div><a href="' + venue.official + '" rel="noopener" target="_blank">Official source</a><a href="' + venue.maps + '" rel="noopener" target="_blank">Open in Google Maps</a></div></article>').join(''); nightlifeSection.querySelectorAll('[data-nightlife-locale]').forEach(button => { button.setAttribute('aria-selected', String(button.dataset.nightlifeLocale === locale)); }); }
nightlifeSection.querySelectorAll('[data-nightlife-locale]').forEach(button => button.addEventListener('click', () => renderNightlife(button.dataset.nightlifeLocale)));
renderNightlife();
document.querySelector('#hw-hero-title')?.replaceChildren(document.createTextNode("Go out. Come back to a house that's ready."));
const nightlifeBridge = document.createElement('section');
nightlifeBridge.className = 'hw-nightlife-bridge';
nightlifeBridge.innerHTML = '<p class="hw-eyebrow">THE EASY PART IS GOING OUT.</p><h2>The useful part is knowing the house is already handled.</h2><p>Bottle Match chilled.<br>Fresh finish ready.<br>Serious ice in the freezer.</p><a class="hw-button hw-button-primary" href="#configurator" data-hw-start>BUILD YOUR WEEKEND</a>';
nightlifeSection.after(nightlifeBridge);
nightlifeSection.querySelectorAll('.hw-nightlife-card>div').forEach(actions => { const official = actions.querySelector('a:first-child'); const maps = actions.querySelector('a:last-child'); official?.remove(); if (maps) { maps.textContent = 'MAP + DIRECTIONS ↗'; maps.addEventListener('click', () => send('hyphen_maps_click')); } });
window.__hyphenLocalHoursViewed = true;
const offerExplainer = document.createElement('section');
offerExplainer.className = 'hw-offer-explainer';
offerExplainer.setAttribute('aria-labelledby', 'hw-offer-title');
offerExplainer.innerHTML = '<p class="hw-eyebrow">HYPHEN WEEKEND</p><h2 id="hw-offer-title">Drinks, garnishes and serious ice, prepared for your Catskills weekend house.</h2><p>Choose the drink direction. Choose how much of the weekend you are stocking. Add bottle sourcing when you need it.</p><p class="hw-offer-location">Hunter · Windham · Belleayre</p>';
document.querySelector('.hw-hero')?.after(offerExplainer);
const buyingStrip = document.createElement('section');
buyingStrip.className = 'hw-buying-strip';
buyingStrip.setAttribute('aria-labelledby', 'hw-buying-title');
buyingStrip.innerHTML = '<p class="hw-eyebrow">START HERE</p><h2 id="hw-buying-title">What you are buying</h2><div class="hw-buying-grid"><article><b>01 · BOTTLE MATCH</b><p>A 750 mL prepared mixer built around your bottle.</p></article><article><b>02 · FINISH KIT</b><p>Fresh garnishes and serious ice, sized to the package.</p></article><article><b>03 · BOTTLE SOURCING</b><p>Optional bottle procurement when you do not want another errand.</p></article></div><p class="hw-note">750 mL is the standard Bottle Match size. Other sizes are priced separately.</p>';
document.querySelector('.hw-pricing[aria-labelledby="hw-pricing-title"]')?.before(buyingStrip);
const mechanism = document.createElement('section');
mechanism.className = 'hw-mechanism';
mechanism.innerHTML = '<p class="hw-eyebrow">HOW HYPHEN WORKS</p><h2>Tell us about the weekend. We handle the pieces.</h2><div class="hw-mechanism-grid"><article><b>01 · TELL US THE HOUSE</b><p>Where you are staying, guest count and occasion.</p></article><article><b>02 · WE BUILD THE SETUP</b><p>Bottle Match, finish, ice and optional sourcing.</p></article><article><b>03 · ARRIVE AND POUR</b><p>Everything cold, labeled and simple.</p></article></div>';
document.querySelector('.hw-pricing[aria-labelledby="hw-pricing-title"]')?.before(mechanism);
const anchor = document.createElement('section');
anchor.className = 'hw-anchor-offer';
anchor.innerHTML = '<p class="hw-eyebrow">THE HOUSE SETUP</p><h2>Full Flight for the weekend that needs everything handled.</h2><p>Bright + Silk + Deep. About 36 pours. Best for wedding houses, birthdays and group rentals.</p><strong>$145</strong><a class="hw-button hw-button-primary" href="#configurator" data-hw-package="full-flight">SET UP THE HOUSE</a>';
document.querySelector('.hw-pricing[aria-labelledby="hw-pricing-title"]')?.before(anchor);
const choosePath = document.createElement('section');
choosePath.className = 'hw-choose-path';
choosePath.innerHTML = '<p class="hw-eyebrow">NOT SURE?</p><h2>Let Hyphen choose.</h2><p>Tell us where you are staying, how many people are coming and what you normally drink. We will recommend the Bottle Match, finish, ice and bottle plan.</p><a class="hw-button hw-button-quiet" href="#configurator">LET HYPHEN CHOOSE</a>';
document.querySelector('#configurator')?.before(choosePath);
const heroTitle = document.querySelector('#hw-hero-title');
if (heroTitle) heroTitle.innerHTML = 'Your weekend is already too short.<span>Arrive to a house that\'s ready for drinks.</span>';
document.querySelectorAll('[data-hw-start]').forEach(link => { if (link.textContent.includes('BUILD')) link.textContent = 'BUILD MY HOUSE'; });
const sampleLink = document.querySelector('.hw-actions .hw-button-quiet');
if (sampleLink) sampleLink.textContent = 'SEE A SAMPLE WEEKEND';
document.querySelectorAll('input[name="sourcing"]').forEach(input => { const strong = input.closest('label')?.querySelector('strong'); const source = input.closest('label')?.querySelector('b')?.textContent || ''; if (strong && source !== 'I Have the Bottle') strong.textContent += ' + bottle cost'; });
document.querySelector('input[name="houseDrop"]')?.closest('fieldset')?.insertAdjacentHTML('beforeend', '<p class="hw-note">House Drop pricing is confirmed by property location before the request is accepted.</p>');
document.querySelector('input[name="icebox"][value="cocktail-cubes"]')?.closest('label')?.remove();
const guestInput = document.querySelector('#hw-guests');
if (guestInput) { const recommendation = document.createElement('small'); recommendation.className = 'hw-guest-recommendation'; guestInput.after(recommendation); const updateRecommendation = () => { const guests = Number(guestInput.value); recommendation.textContent = guests >= 14 ? 'Let Hyphen size the house for 14+ guests.' : guests >= 8 ? 'Full Flight is recommended for 8–14 guests.' : guests >= 5 ? 'Duo is recommended for 5–9 guests.' : 'One is a good starting point for 2–5 guests.'; }; guestInput.addEventListener('input', updateRecommendation); updateRecommendation(); }
const foodTitle = document.querySelector('#hw-food-title');
if (foodTitle) { foodTitle.textContent = 'Want dinner handled too?'; const foodCopy = foodTitle.parentElement?.querySelector('p:not(.hw-eyebrow)'); if (foodCopy) foodCopy.textContent = 'Join the food-package preview list. We will let you know when dinner options are ready.'; const foodLabel = foodTitle.parentElement?.querySelector('label'); if (foodLabel) foodLabel.lastChild.textContent = ' Join the food-package preview list.'; }
document.querySelectorAll('[data-hw-package]').forEach(link => { if (link.textContent.toLowerCase().includes('choose')) link.textContent = 'SET UP THIS HOUSE'; });
document.querySelectorAll('a[href="#inquiry"], #hw-inquiry-form button').forEach(element => { element.textContent = 'REQUEST MY HOUSE DROP'; });
document.querySelector('[data-hw-wedding]')?.replaceChildren(document.createTextNode('SET UP THE WEDDING HOUSE'));
const nightlifeIntro = nightlifeSection.querySelector('.hw-section-intro');
if (nightlifeIntro) { nightlifeIntro.querySelector('.hw-eyebrow').textContent = 'GOING OUT FIRST?'; nightlifeIntro.querySelector('h2').textContent = 'A few places stay late. Many wind down earlier.'; nightlifeIntro.querySelector('p:last-child').textContent = 'A quick look at published local hours around Hunter, Windham and Belleayre. Hours change seasonally, so confirm before heading out.'; }
function trackNightlife(name, value) { send(name, value ? { area: value } : {}); }
window.__hyphenOfferViewed = true;
document.querySelectorAll('[data-hw-start]').forEach(link => link.addEventListener('click', () => send('hyphen_build_weekend_click')));
nightlifeSection.querySelectorAll('[data-nightlife-locale]').forEach(button => button.addEventListener('click', () => trackNightlife('hyphen_local_area_selected', button.dataset.nightlifeLocale)));
const flavorSummary = document.createElement('div');
flavorSummary.className = 'hw-note';
flavorSummary.id = 'hw-flavor-summary';
form.querySelector('.hw-flavor-slots')?.after(flavorSummary);
function updateConfiguratorUX() {
  const selected = pkg();
  const slots = [...form.querySelectorAll('select[name="flavorSlot"]')];
  const labels = slots.map(slot => slot.closest('label'));
  labels[0]?.querySelector('b') && (labels[0].querySelector('b').textContent = selected === 'duo' ? 'First Bottle Match' : 'Choose your Bottle Match');
  labels[1]?.querySelector('b') && (labels[1].querySelector('b').textContent = 'Second Bottle Match');
  labels[1] && (labels[1].hidden = selected === 'one' || selected === 'full-flight');
  slots.forEach(slot => { slot.hidden = selected === 'full-flight'; });
  flavorSummary.hidden = selected !== 'full-flight';
  flavorSummary.innerHTML = selected === 'full-flight' ? '<b>FULL FLIGHT</b><br>Bright · Clarified Lime<br>Silk · Clarified Sour<br>Deep · Spirit-Forward<br>All three are included.' : '';
  const finishPrice = document.querySelector('#finish-price');
  const size = config.bottleMatch.bottleSizeMl || 750;
  const finishPrices = FINISH_KIT_PRICING[size];
  const finishes = selected === 'full-flight' ? 3 * (POURS_PER_MATCH[size] || 12) : selected === 'duo' ? 2 * (POURS_PER_MATCH[size] || 12) : (POURS_PER_MATCH[size] || 12);
  if (finishPrice && selected) finishPrice.textContent = '+$' + (finishPrices?.[priceKey(selected)] || 0) + ' · About ' + finishes + ' finishes';
  const iceLabels = [...form.querySelectorAll('input[name="icebox"]')].map(input => input.closest('label'));
  iceLabels.forEach(label => { const input = label?.querySelector('input'); const note = label?.querySelector('small'); if (note && input) note.textContent = input.value === (selected === 'full-flight' ? 'full' : 'standard') ? 'RECOMMENDED FOR YOUR ' + (selected === 'full-flight' ? 'FULL FLIGHT' : selected?.toUpperCase() || 'BOTTLE MATCH') : input.value === 'full' ? 'More large-format ice for Full Flight and larger houses.' : 'Large-format cocktail ice. Choose two-inch cubes or spears.'; });
}
let current = 0;
const config = { houseReadyDate: null, dates: {}, property: '', guests: 0, bottleMatch: { package: '', bottleSizeMl: 750, flavors: [] }, finishKit: { enabled: false, tier: '', garnishes: [] }, sourcing: 'guest_supplied', icebox: 'none', houseDrop: '', foodInterest: false, serviceSubtotal: 0, alcoholIncluded: false, paymentEnabled: false, transactionType: 'inquiry' };
import { BOTTLE_MATCH_PRICING, FINISH_KIT_PRICING, POURS_PER_MATCH, HYPHEN_PRICING as prices } from './hyphen-pricing.js';
const garnishes = { bright: ['lime'], silk: ['lemon'], deep: ['orange', 'cherry'] };
const priceKey = value => value === 'full-flight' ? 'fullFlight' : value;
const isoDate = date => date.toISOString().slice(0, 10);
function setDefaultDates() { const start = new Date(); start.setHours(12, 0, 0, 0); start.setDate(start.getDate() + ((5 - start.getDay() + 7) % 7)); const end = new Date(start); end.setDate(end.getDate() + 2); config.dates = { startDate: isoDate(start), endDate: isoDate(end) }; }
function inquiryMessage() { const name = form.querySelector('input[name="package"]:checked')?.closest('label')?.querySelector('b')?.textContent || 'Bottle Match package to confirm'; const dates = config.dates.startDate && config.dates.endDate ? config.dates.startDate + ' to ' + config.dates.endDate : 'Dates to confirm'; const flavors = config.bottleMatch.flavors.join(' · ') || 'Flavors to confirm'; return 'Hyphen Weekend request\nDates: ' + dates + '\nHouse: ' + (config.property || 'Property to confirm') + '\nGuests: ' + (config.guests || 'Guests to confirm') + '\nBottle Match: ' + name + '\nFlavors: ' + flavors + '\nFinish Kit: ' + (config.finishKit.enabled ? 'Yes' : 'No') + '\nSpirit sourcing: ' + config.sourcing + '\nIcebox: ' + config.icebox + '\nHouse Drop: ' + (config.houseDrop || 'To confirm') + '\nService subtotal: $' + config.serviceSubtotal + '\nSpirit cost additional.' + (config.foodInterest ? '\nFood interest: Yes' : ''); }
function syncInquiryMessage() { const message = document.querySelector('#hw-inquiry-message'); if (message) { message.required = true; if ((current === steps.length - 1 && config.bottleMatch.package || config.foodInterest || message.dataset.autofilled === 'true') && (message.dataset.autofilled === 'true' || !message.value)) { message.value = inquiryMessage(); message.dataset.autofilled = 'true'; } } }
const send = (name, value = {}) => (window.SS_TRACK_EVENT ? window.SS_TRACK_EVENT(name, value) : window.dataLayer?.push({ event: name, ...value }));
if (window.__hyphenLocalHoursViewed) send('hyphen_local_hours_view');
if (window.__hyphenOfferViewed) send('hyphen_offer_view');
const pkg = () => config.bottleMatch.package;
function selectedFlavors() { return config.bottleMatch.package === 'full-flight' ? ['bright', 'silk', 'deep'] : [...form.querySelectorAll('select[name="flavorSlot"]')].map(x => x.value).filter(Boolean); }
function refresh() {
  config.bottleMatch.flavors = selectedFlavors();
  config.finishKit.tier = pkg();
  config.finishKit.garnishes = [...new Set(config.bottleMatch.flavors.flatMap(x => garnishes[x] || []))];
  const size = config.bottleMatch.bottleSizeMl || 750;
  const bottlePrices = BOTTLE_MATCH_PRICING[size];
  const finishPrices = FINISH_KIT_PRICING[size];
  const finish = config.finishKit.enabled ? finishPrices[priceKey(pkg())] || 0 : 0;
  const subtotal = (bottlePrices?.[priceKey(pkg())] || 0) + finish + (prices.sourcing[config.sourcing.replace('_', '-')] || 0) + (prices.icebox[config.icebox] || 0);
  config.serviceSubtotal = subtotal;
  const packageName = form.querySelector('input[name="package"]:checked')?.closest('label')?.querySelector('b')?.textContent || 'Not chosen';
  form.querySelectorAll('input[name="package"]').forEach(input => { const label = input.closest('label'); const value = label?.querySelector('strong'); const description = label?.querySelector('small'); const packagePours = (input.value === 'full-flight' ? 3 : input.value === 'duo' ? 2 : 1) * (POURS_PER_MATCH[size] || 12); if (value) value.textContent = '$' + (bottlePrices?.[priceKey(input.value)] || 0); if (description) { description.dataset.baseDescription ||= description.innerHTML; description.innerHTML = description.dataset.baseDescription.replace(/About \d+ pours\./, 'About ' + packagePours + ' pours.'); } });
  document.querySelector('#finish-price').textContent = pkg() ? '+$' + (finishPrices?.[priceKey(pkg())] || 0) : 'Choose a package first';
  if (garnishNote) garnishNote.textContent = config.finishKit.enabled ? 'Sized for ' + (config.bottleMatch.flavors.length || 1) + ' direction' + (config.bottleMatch.flavors.length === 1 ? '' : 's') + ' and the ' + size + ' mL house.' : 'Fresh citrus and cocktail finishes, packed for your selected size.';
  const recommendedIce = size >= 1000 ? 'full' : 'standard';
  if (!config.icebox && form.querySelector('input[name="icebox"][value="' + recommendedIce + '"]')) { const recommendedInput = form.querySelector('input[name="icebox"][value="' + recommendedIce + '"]'); recommendedInput.checked = true; config.icebox = recommendedIce; }
  document.querySelector('#hw-summary-list').innerHTML = '<div><dt>Bottle Size</dt><dd>' + (size === 1000 ? '1 L' : size === 1500 ? '1.5 L' : size + ' mL') + '</dd></div><div><dt>Bottle Match</dt><dd>' + packageName + (pkg() ? ' · $' + (bottlePrices?.[priceKey(pkg())] || 0) : '') + '</dd></div><div><dt>Flavors</dt><dd>' + (config.bottleMatch.flavors.join(' · ') || 'Not chosen') + '</dd></div><div><dt>Subtotal</dt><dd>' + (subtotal ? '$' + subtotal : 'Choose your package') + '</dd></div>';
  if (current === steps.length - 1) document.querySelector('#hw-review').innerHTML = '<div><dt>Bottle Size</dt><dd>' + size + ' mL</dd></div><div><dt>Bottle Match</dt><dd>' + packageName + ' · $' + (bottlePrices?.[priceKey(pkg())] || 0) + '</dd></div><div><dt>Finish Kit</dt><dd>' + (config.finishKit.enabled ? '$' + finish : 'Not added') + '</dd></div><div><dt>Spirits</dt><dd>' + config.sourcing + ' · $' + (prices.sourcing[config.sourcing.replace('_', '-')] || 0) + '</dd></div><div><dt>Ice</dt><dd>' + config.icebox + '</dd></div><div><dt>BEVERAGE SERVICE SUBTOTAL</dt><dd>$' + subtotal + '</dd></div>';
  document.querySelector('#hw-payload').value = JSON.stringify(config);
  syncInquiryMessage();
}
function valid() {
  const fields = [...steps[current].querySelectorAll('input[required]')];
  const flavorCount = selectedFlavors().length;
  const requiredFlavorCount = pkg() === 'full-flight' ? 3 : pkg() === 'duo' ? 2 : 1;
  const ok = fields.every(x => x.checkValidity()) && (current !== 4 || flavorCount === requiredFlavorCount);
  steps[current].querySelector('[data-error]').textContent = ok ? '' : 'Please complete this step before continuing.';
  return ok;
}
function render() { steps.forEach((s, i) => { s.hidden = i !== current; }); stepLabel.textContent = 'Step ' + (current + 1) + ' of ' + steps.length; stepName.textContent = names[current]; back.hidden = current === 0; next.textContent = current === steps.length - 1 ? 'CONTINUE TO REQUEST' : 'Continue'; if (current === 5) send('hyphen_finish_kit_viewed', { package: config.bottleMatch.package }); refresh(); }
document.querySelectorAll('[data-hw-start]').forEach(x => x.addEventListener('click', () => send('hyphen_configurator_started')));
document.querySelectorAll('[data-hw-wedding]').forEach(x => x.addEventListener('click', () => send('hyphen_wedding_cta_clicked')));
document.querySelectorAll('[data-hw-package]').forEach(x => x.addEventListener('click', () => { const input = form.querySelector('input[name="package"][value="' + x.dataset.hwPackage + '"]'); input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); send('hyphen_package_selected', { package: x.dataset.hwPackage }); }));
form.addEventListener('change', e => { if (e.target.name === 'package') { config.bottleMatch.package = e.target.value; const slots = [...form.querySelectorAll('select[name="flavorSlot"]')]; slots.forEach((x, i) => { x.required = e.target.value !== 'full-flight' && i === 0; x.disabled = e.target.value === 'full-flight'; if (e.target.value === 'full-flight') x.value = i === 0 ? 'bright' : 'silk'; else if (e.target.value === 'one' || (e.target.value === 'duo' && i > 1)) x.value = ''; }); send('hyphen_package_selected', { package: e.target.value }); } if (e.target.name === 'finishKit') { config.finishKit.enabled = e.target.checked; send(e.target.checked ? 'hyphen_finish_kit_added' : 'hyphen_finish_kit_removed'); } if (e.target.name === 'sourcing') { config.sourcing = e.target.value.replace('-', '_'); send('hyphen_sourcing_selected', { sourcing: config.sourcing }); } if (e.target.name === 'icebox') { config.icebox = e.target.value; send('hyphen_icebox_selected', { icebox: e.target.value }); } if (e.target.name === 'houseDrop') { config.houseDrop = e.target.value; send('hyphen_house_drop_selected', { house_drop: e.target.value }); } if (e.target.name === 'foodInterest') { config.foodInterest = e.target.checked; send('hyphen_food_interest_selected', { selected: e.target.checked }); } if (e.target.name === 'flavorSlot') send('hyphen_flavor_selected', { flavors: selectedFlavors() }); if (e.target.name === 'startDate' || e.target.name === 'endDate') config.dates[e.target.name] = e.target.value; if (e.target.name === 'property') config.property = e.target.value; if (e.target.name === 'guests') config.guests = Number(e.target.value); refresh(); });
document.querySelector('input[name="foodInterest"]')?.addEventListener('change', e => { config.foodInterest = e.target.checked; send('hyphen_food_interest_selected', { selected: e.target.checked }); refresh(); });
next.addEventListener('click', () => { if (!valid()) return; if (current < steps.length - 1) { current++; render(); } else { send('hyphen_inquiry_started', { package: config.bottleMatch.package }); const inquiry = document.querySelector('#inquiry'); inquiry.scrollIntoView({ behavior: 'smooth', block: 'start' }); document.querySelector('#hw-name')?.focus({ preventScroll: true }); document.querySelector('#hw-summary-status').textContent = 'Your configuration is ready. Add your contact details below and send the request.'; } });
back.addEventListener('click', () => { current--; render(); });
document.querySelector('#hw-inquiry-form')?.addEventListener('submit', () => send('hyphen_inquiry_submitted', { package: config.bottleMatch.package, flavors: config.bottleMatch.flavors, finish_kit: config.finishKit.enabled, sourcing: config.sourcing, icebox: config.icebox, house_drop: config.houseDrop }));
form.querySelectorAll('input[name="bottleSize"]').forEach(input => input.addEventListener('change', e => { config.bottleMatch.bottleSizeMl = Number(e.target.value); send('hyphen_bottle_size_selected', { size_ml: config.bottleMatch.bottleSizeMl }); refresh(); }));
function updateDateFlow() {
  const dateAvailability = availability[config.houseReadyDate];
  form.querySelectorAll('input[name="houseDrop"]').forEach(input => { const label = input.closest('label'); const supported = !dateAvailability || dateAvailability[input.value]; input.disabled = !supported; label.hidden = !supported; const status = label?.querySelector('strong'); if (status && supported) status.textContent = dateAvailability?.[input.value] === 'limited' ? 'LIMITED' : dateAvailability?.[input.value] === 'available' ? 'RECOMMENDED FOR WEDDING WEEKENDS' : 'AVAILABILITY CONFIRMED WITH YOUR REQUEST'; });
  if (config.houseDrop && form.querySelector('input[name="houseDrop"][value="' + config.houseDrop + '"]')?.disabled) { config.houseDrop = ''; form.querySelectorAll('input[name="houseDrop"]').forEach(input => { input.checked = false; }); }
  if (current === steps.length - 1) { const review = document.querySelector('#hw-review'); const displayDate = config.houseReadyDate ? new Date(config.houseReadyDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Choose a date'; review.innerHTML = '<div><dt>HOUSE READY</dt><dd>' + displayDate + '</dd></div><div><dt>HOUSE DROP</dt><dd>' + (config.houseDrop || 'Choose a window') + '</dd></div>' + review.innerHTML + '<p>House Drop subject to confirmation. Spirit cost additional.</p>'; }
}
form.addEventListener('change', e => { if (e.target.name === 'startDate') { config.houseReadyDate = e.target.value || null; const selected = e.target.value ? new Date(e.target.value + 'T12:00:00') : null; const daysUntilService = selected ? Math.ceil((selected - new Date(new Date().toDateString())) / 86400000) : null; send('hyphen_house_ready_date_selected', { dayOfWeek: selected?.toLocaleDateString('en-US', { weekday: 'long' }) || '', daysUntilService }); updateDateFlow(); refresh(); } if (e.target.name === 'houseDrop') { config.houseDrop = e.target.value; const status = availability[config.houseReadyDate]?.[e.target.value] || 'available'; send('hyphen_house_drop_window_selected', { window: e.target.value, availability_status: status }); } });
document.querySelectorAll('[data-hw-wedding]').forEach(x => x.addEventListener('click', () => { current = 0; render(); document.querySelector('#hw-start-date')?.focus({ preventScroll: true }); }));
const packageStep = form.querySelector('input[name="package"]')?.closest('fieldset');
if (packageStep) packageStep.querySelector('legend').textContent = 'HOW MUCH OF THE WEEKEND ARE WE STOCKING?';
form.addEventListener('change', e => { if (e.target.name === 'package' || e.target.name === 'flavorSlot' || e.target.name === 'bottleSize') updateConfiguratorUX(); });
updateConfiguratorUX();
setDefaultDates();
render();
form.querySelector('#hw-inquiry-message')?.addEventListener('input', e => { e.target.dataset.autofilled = 'false'; });
refresh();
if (mobileCta && 'IntersectionObserver' in window) new IntersectionObserver(([entry]) => mobileCta.classList.toggle('hw-mobile-cta-hidden', entry.isIntersecting), { threshold: 0.1 }).observe(document.querySelector('.hw-actions'));
