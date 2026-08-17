import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pricing = JSON.parse(fs.readFileSync(path.join(root, "src/_data/pricing.json"), "utf8"));
const offers = JSON.parse(fs.readFileSync(path.join(root, "src/_data/offers.json"), "utf8"));
const elite = fs.readFileSync(path.join(root, "src/elite-concierge.html"), "utf8");
const terms = fs.readFileSync(path.join(root, "src/guarantee-terms.html"), "utf8");
const pricingPage = fs.readFileSync(path.join(root, "src/options-pricing.njk"), "utf8");
const annual = fs.readFileSync(path.join(root, "src/annual-track.html"), "utf8");

assert.deepEqual(pricing.productPolicy.firstPaidTerm, ["coreCulture.youth", "coreCulture.adult", "coreCulture.communityServiceAdult"]);
assert.deepEqual(pricing.productPolicy.continuationOnly, ["eliteConcierge", "annualTrack"]);
assert.deepEqual(pricing.productPolicy.guaranteeEligible, ["coreCulture.youth", "coreCulture.adult"]);
assert.equal(pricing.eliteConcierge.price, 1050);
assert.equal(pricing.annualTrack.youth.price, 2100);
assert.equal(pricing.annualTrack.adult.price, 2650);
assert.equal(pricing.annualTrack.communityServiceAdult.price, 2250);

assert.match(terms, /first Youth or Adult Core Culture term includes our 30-Day Training Fit Guarantee/);
assert.match(terms, /renewed Core Culture terms,\s+annual plans/);
assert.match(elite, /continuation option for adults whose Core Culture routine is working/);
assert.doesNotMatch(elite, /committed adult students|adult beginners who want|first-time enrollment|Can you commit to 3 sessions/);
assert.match(elite, /eligible first Youth or Adult Core Culture term/);
assert.match(elite, /No additional gi/);
assert.match(elite, /three-planned-classes-per-week schedule fit your next 12 weeks/);
assert.match(elite, /Probably — I need help choosing days/);
assert.match(elite, /No \/ not sure/);
assert.match(pricingPage, /After your first term/);
assert.match(pricingPage, /Finishing a term does not obligate you to continue/);
assert.match(annual, /must complete one Core Culture term and a progress review/);
assert.match(annual, /Annual plans are excluded from the 30-Day Training Fit Guarantee/);
assert.equal(offers.qualified.find((offer) => offer.id === "elite-concierge").displayPrice, "$1,050");
assert.equal(offers.qualified.find((offer) => offer.id === "annual-track").audience, "Students continuing after a Core Culture term");

console.log("product lifecycle QA passed");
