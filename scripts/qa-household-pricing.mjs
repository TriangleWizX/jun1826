import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pricing = JSON.parse(fs.readFileSync(path.join(root, "src/_data/pricing.json"), "utf8"));
const offers = JSON.parse(fs.readFileSync(path.join(root, "src/_data/offers.json"), "utf8"));
const page = fs.readFileSync(path.join(root, "dist/options-pricing/index.html"), "utf8");

const family = pricing.householdBundles.annualFamily;
const adultAnnual = pricing.coreCulture.frequencyLadder.adult[family.frequencyPerPersonPerWeek].annual;
const youthAnnual = pricing.coreCulture.frequencyLadder.youth[family.frequencyPerPersonPerWeek].annual;
const individualTotal = adultAnnual * family.adults + youthAnnual * family.youth;
const fourTermTotal = pricing.householdBundles.firstTerm.oneAdultTwoYouth.price * pricing.annualTrack.cycles;
const scheduledClassTotal = (family.adults + family.youth) * family.scheduledClassesPerPerson;

assert.equal(family.price, 5400);
assert.equal(family.individualAnnualTotal, individualTotal);
assert.equal(family.savingsAmount, individualTotal - family.price);
assert.equal(family.savingsPercent, Number((((individualTotal - family.price) / individualTotal) * 100).toFixed(1)));
assert.equal(family.annualizedFirstTermFamilyTotal, fourTermTotal);
assert.equal(family.savingsVsAnnualizedFirstTermFamily, fourTermTotal - family.price);
assert.equal(family.savingsVsAnnualizedFirstTermFamilyPercent, Number((((fourTermTotal - family.price) / fourTermTotal) * 100).toFixed(1)));
assert.equal(family.scheduledClassesTotal, scheduledClassTotal);
assert.equal(family.averagePricePerScheduledClass, Number((family.price / scheduledClassTotal).toFixed(2)));
assert.equal(family.savingsPercent, pricing.householdBundles.firstTerm.oneAdultTwoYouth.savingsPercent);
assert.equal(family.continuationOnly, true);
assert.equal(family.guaranteeEligible, false);
assert.equal(offers.qualified.find((offer) => offer.id === "annual-family-track")?.priceRef, "householdBundles.annualFamily");
assert.match(page, /Annual Family Track: \$5,400/);
assert.match(page, /\$6,435 individual total/);
assert.match(page, /\$1,035/);
assert.match(page, /\$12\.50 per scheduled class/);
assert.doesNotMatch(page, /\$3,300/);

console.log("household pricing QA passed");
