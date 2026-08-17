import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pricing = JSON.parse(fs.readFileSync(path.join(root, "src/_data/pricing.json"), "utf8"));
const offers = JSON.parse(fs.readFileSync(path.join(root, "src/_data/offers.json"), "utf8"));
const pricingPage = fs.readFileSync(path.join(root, "src/options-pricing.html"), "utf8");
const visitorPage = fs.readFileSync(path.join(root, "src/catskills-home-base.html"), "utf8");
const flexible = pricing.visitorAndSupport;
const products = [flexible.dayPass, flexible.vacationWeek, flexible.tenPack, flexible.twentyPack];

assert.deepEqual(products.map((product) => product.accessModel), ["open_access", "open_access", "open_access", "open_access"]);
assert.deepEqual(products.map((product) => product.recurringReservation), [false, false, false, false]);
assert.deepEqual(products.map((product) => product.longitudinalProgressFeedback), [false, false, false, false]);
assert.deepEqual(products.map((product) => product.giIncluded), [false, false, false, false]);
assert.deepEqual(products.map((product) => product.guaranteeEligible), [false, false, false, false]);
assert.equal(flexible.dayPass.price, 35);
assert.equal(flexible.vacationWeek.price, 99);
assert.equal(flexible.vacationWeek.classesIncluded, "Up to 3 appropriate classes");
assert.equal(flexible.vacationWeek.validity, "7 consecutive days");
assert.equal(flexible.tenPack.price, 300);
assert.equal(flexible.tenPack.validity, "6 months");
assert.equal(flexible.twentyPack.price, 550);
assert.equal(flexible.twentyPack.validity, "12 months");

for (const id of ["day-pass", "vacation-week", "ten-class-pack", "twenty-class-pack"]) {
  const offer = [...offers.secondary, ...offers.qualified].find((item) => item.id === id);
  assert.ok(offer, `missing offer: ${id}`);
  assert.equal(offer.accessModel, "open_access");
  assert.equal(offer.recurringReservation, false);
  assert.equal(offer.longitudinalProgressFeedback, false);
  assert.equal(offer.giIncluded, false);
  assert.equal(offer.guaranteeEligible, false);
}

assert.match(pricingPage, /Visiting or need a flexible schedule\?/);
assert.doesNotMatch(pricingPage, /Visiting, easing in/);
assert.match(pricingPage, /Local first-time students begin with the Free Intro/);
assert.match(pricingPage, /do not reserve three recurring home-class seats/);
assert.match(pricingPage, /or qualify for the Training Fit Guarantee/);
assert.match(visitorPage, /Seasonal or second-home student/);
assert.match(visitorPage, /available space and suitable partner fit/);
assert.doesNotMatch(visitorPage, /Three-Class Free Trial/);

console.log("flexible access QA passed");
