import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const pricing = JSON.parse(read("src/_data/pricing.json"));
const offers = JSON.parse(read("src/_data/offers.json"));
const elite = read("src/elite-concierge.html");
const terms = read("src/guarantee-terms.html");
const pricingPage = read("src/options-pricing.njk");
const annual = read("src/annual-track.html");

assert.deepEqual(pricing.productPolicy.firstPaidTerm, ["coreCulture.youth", "coreCulture.adult", "coreCulture.communityServiceAdult"]);
assert.deepEqual(pricing.productPolicy.continuationOnly, ["eliteConcierge", "annualTrack"]);
assert.deepEqual(pricing.productPolicy.guaranteeEligible, ["coreCulture.youth", "coreCulture.adult"]);
assert.equal(pricing.eliteConcierge.price, 1050);
assert.equal(pricing.annualTrack.youth.price, 2100);
assert.equal(pricing.annualTrack.adult.price, 2650);
assert.equal(pricing.annualTrack.communityServiceAdult.price, 2250);

assert.match(terms, /first Youth or Adult 12-week program term includes our 30-Day Training Fit Guarantee/);
assert.match(terms, /renewed 12-week program terms,\s+annual plans/);
assert.match(elite, /continuation option for adults whose 12-week program routine is working/);
assert.doesNotMatch(elite, /committed adult students|adult beginners who want|first-time enrollment|Can you commit to 3 sessions/);
assert.match(elite, /eligible first Youth or Adult 12-week program term/);
assert.match(elite, /No additional gi/);
assert.match(elite, /three-planned-classes-per-week schedule fit your next 12 weeks/);
assert.match(elite, /Probably — I need help choosing days/);
assert.match(elite, /No \/ not sure/);
assert.match(pricingPage, /After your first term/);
assert.match(pricingPage, /Finishing a term does not obligate you to continue/);
assert.match(pricingPage, /community-service rate is outside the 30-Day Training Fit Guarantee/i);
assert.match(annual, /must complete one Core Culture term and a progress review/);
assert.match(annual, /Annual plans are excluded from the 30-Day Training Fit Guarantee/);
assert.equal(offers.qualified.find((offer) => offer.id === "elite-concierge").displayPrice, "$1,050");
assert.equal(offers.qualified.find((offer) => offer.id === "annual-track").audience, "Students continuing after a Core Culture term");

console.log("product lifecycle QA passed");
