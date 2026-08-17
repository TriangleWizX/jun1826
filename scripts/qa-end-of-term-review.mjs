import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pricing = JSON.parse(fs.readFileSync(path.join(root, "src/_data/pricing.json"), "utf8"));
const review = fs.readFileSync(path.join(root, "src/core-culture-review.html"), "utf8");
const reportCard = fs.readFileSync(path.join(root, "src/report-card.html"), "utf8");
const pricingPage = fs.readFileSync(path.join(root, "src/options-pricing.html"), "utf8");
const annual = fs.readFileSync(path.join(root, "src/annual-track.html"), "utf8");
const terms = fs.readFileSync(path.join(root, "src/guarantee-terms.html"), "utf8");

assert.deepEqual(pricing.productPolicy.endOfTermReview.sequence, ["observe_training", "review_schedule", "choose_next_arrangement"]);
assert.deepEqual(pricing.productPolicy.endOfTermReview.outcomes, ["renewed_core_culture", "annual_track", "elite_concierge", "flexible_access", "pause", "stop"]);
assert.equal(pricing.productPolicy.endOfTermReview.guaranteeResets, false);
assert.equal(pricing.productPolicy.renewedCoreCulture.guaranteeEligible, false);
assert.equal(pricing.productPolicy.renewedCoreCulture.gi, "No additional gi by virtue of renewal");
assert.equal(pricing.productPolicy.renewedCoreCulture.longitudinalProgressFeedback, true);

assert.match(review, /Core Culture Review/);
assert.match(review, /Observe → Review → Adjust → Choose/);
assert.match(review, /What is working\?/);
assert.match(review, /What is the next problem\?/);
assert.match(review, /What is beginning to become yours\?/);
assert.match(review, /Which home classes were easiest to maintain\?/);
assert.match(review, /student.s own willingness/);
for (const outcome of ["Renew Core Culture", "Annual Track", "Elite Concierge", "Flexible Access", "Pause", "Stop"]) assert.match(review, new RegExp(outcome));
assert.match(review, /first-term gi does not repeat/);
assert.match(review, /Training Fit Guarantee does not reset/);
assert.match(review, /Stopping is allowed/);
assert.match(review, /Progress Report Card/);
assert.match(reportCard, /What is the next problem\?/);
assert.match(reportCard, /What is beginning to become yours\?/);
assert.match(pricingPage, /Core Culture Review/);
assert.match(annual, /Core Culture Review/);
assert.match(terms, /renewed Core Culture terms,\s+annual plans/);
assert.doesNotMatch(review, /Renew Now|upgrade|graduate|level up|don.t lose|keep your momentum|you.ve come too far|renew by Friday/);
assert.doesNotMatch(pricingPage, /Would you prefer Annual Track|interested in Concierge|ready to commit/);

console.log("end-of-term review QA passed");
