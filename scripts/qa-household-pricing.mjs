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
assert.equal(family.continuationOnly, true);
assert.equal(family.guaranteeEligible, false);

const adult12W = pricing.coreCulture.frequencyLadder.adult[3]["12Weeks"];
const youth12W = pricing.coreCulture.frequencyLadder.youth[3]["12Weeks"];
const oneAdultTwoYouth = pricing.householdBundles.firstTerm.oneAdultTwoYouth;
const twoAdultsOneYouth = pricing.householdBundles.firstTerm.twoAdultsOneYouth;

assert.equal(adult12W, 715);
assert.equal(oneAdultTwoYouth.matchingIndividualTotal, adult12W + youth12W * 2);
assert.equal(oneAdultTwoYouth.savingsAmount, oneAdultTwoYouth.matchingIndividualTotal - oneAdultTwoYouth.price);
assert.equal(oneAdultTwoYouth.savingsPercent, Number((((oneAdultTwoYouth.matchingIndividualTotal - oneAdultTwoYouth.price) / oneAdultTwoYouth.matchingIndividualTotal) * 100).toFixed(1)));

assert.equal(twoAdultsOneYouth.matchingIndividualTotal, adult12W * 2 + youth12W);
assert.equal(twoAdultsOneYouth.savingsAmount, twoAdultsOneYouth.matchingIndividualTotal - twoAdultsOneYouth.price);
assert.equal(twoAdultsOneYouth.savingsPercent, Number((((twoAdultsOneYouth.matchingIndividualTotal - twoAdultsOneYouth.price) / twoAdultsOneYouth.matchingIndividualTotal) * 100).toFixed(1)));

assert.ok(pricing.productPolicy.continuationOnly.includes("householdBundles.annualFamily"));
assert.ok(pricing.productPolicy.guaranteeExcluded.includes("householdBundles.annualFamily"));
assert.equal(offers.qualified.find((offer) => offer.id === "annual-family-track")?.priceRef, "householdBundles.annualFamily");
assert.match(page, /Annual Family Track: \$5,400/);
assert.match(page, /Youth, 3 classes each week: \$185/);
assert.match(page, /Adult, 3 classes each week: \$245/);
assert.match(page, /Youth year plan: \$1,980/);
assert.match(page, /Adult year plan: \$2,475/);
const annualTable = page.slice(page.indexOf("Annual continuation prices"), page.indexOf("</table>", page.indexOf("Annual continuation prices")));
assert.ok(annualTable.indexOf("3×") < annualTable.indexOf("2×") && annualTable.indexOf("2×") < annualTable.indexOf("1×"), "annual frequency table should descend from the high anchor");
assert.match(page, /Free First Visit/); assert.match(page, /href=\"\/free-bjj-intro-tannersville-ny/);
assert.match(page, /The same plans cost \$6,435 on their own/);
assert.match(page, /\$1,035/);
assert.match(page, /each costs \$12\.50/);
assert.doesNotMatch(page, /\$3,300/);

// Global price range anchored at 3x monthly pricing down to lowest 1x monthly
const homePage = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const annualPage = fs.readFileSync(path.join(root, "dist/annual-track/index.html"), "utf8");

const adult3xMonthly = pricing.coreCulture.frequencyLadder.adult[3].monthly;
const youth3xMonthly = pricing.coreCulture.frequencyLadder.youth[3].monthly;
const youth1xMonthly = pricing.coreCulture.frequencyLadder.youth[1].monthly;
const adult1xMonthly = pricing.coreCulture.frequencyLadder.adult[1].monthly;

assert.equal(adult3xMonthly, 245);
assert.equal(youth3xMonthly, 185);
assert.equal(youth1xMonthly, 75);
assert.equal(adult1xMonthly, 95);

assert.match(homePage, /href="\/options-pricing/);
assert.match(annualPage, /\$245 to \$95 \/ month/);
assert.match(annualPage, /\$185 to \$75 \/ month/);
assert.ok(page.includes("$245") && page.includes("$75"), "pricing page includes canonical adult and youth monthly rates");
assert.match(page, /\$165 each month/);
assert.match(page, /\$206\.25 each month/);

// Verify every household frequency against individual tuition and continuation.
const siblings = pricing.householdBundles.firstTerm.siblings;
assert.equal(siblings.firstTermOnly, true);
assert.equal(siblings.termWeeks, pricing.coreCulture.termWeeks);
assert.deepEqual(siblings.frequencies.map(f => f.classesPerWeek), [1, 2, 3]);
assert.deepEqual(siblings.frequencies.map(f => f.pricePerYouth), [215, 425, 525]);
const siblingSection = page.slice(page.indexOf("Other household combinations"), page.indexOf("<!-- FIRST-TERM DECISION SUPPORT"));
for (const frequency of siblings.frequencies) {
  const ladder = pricing.coreCulture.frequencyLadder.youth[frequency.classesPerWeek];
  assert.equal(frequency.scheduledClassesPerPerson, frequency.classesPerWeek * 12);
  assert.deepEqual(frequency.tiers.map(t => t.youth), [2, 3, 4]);
  for (const tier of frequency.tiers) {
    assert.equal(tier.price, tier.youth * frequency.pricePerYouth);
    assert.equal(tier.matchingIndividualTotal, tier.youth * ladder["12Weeks"]);
    assert.equal(tier.savingsAmount, tier.matchingIndividualTotal - tier.price);
    assert.equal(tier.savingsPercent, Number((tier.savingsAmount / tier.matchingIndividualTotal * 100).toFixed(1)));
    assert.ok(frequency.pricePerYouth < ladder["12Weeks"]);
    assert.ok(frequency.pricePerYouth + ladder["12Weeks"] > ladder["6Months"]);
    assert.ok(frequency.pricePerYouth + ladder["12Weeks"] * 3 > ladder.annual);
    assert.ok(siblingSection.includes(tier.displayPrice));
    assert.ok(siblingSection.includes(`${tier.youth} siblings`));
  }
  assert.equal(frequency.tiers[0].price * 2, frequency.tiers[2].price);
}
assert.ok(oneAdultTwoYouth.price < siblings.frequencies[2].tiers[0].price + adult12W);
assert.match(siblingSection, /Choose one offer per child/);
assert.match(siblingSection, /Each child gets a first gi\. Choose one offer per child\./);
assert.match(siblingSection, /Each child picks the same plan/);
const packSection = page.slice(page.indexOf('id="visitor-training"'), page.indexOf('op-other-card--private'));
for (const [key, id] of [["tenPack", "ten-class-pack"], ["twentyPack", "twenty-class-pack"]]) {
  const pack = pricing.visitorAndSupport[key];
  assert.equal(pack.ageMin, 18);
  assert.equal(pack.eligibility, "Adults ages 18 and up");
  assert.match(pack.audience, /^Adults/);
  assert.equal(pack.giIncluded, false);
  assert.equal(pack.recurringReservation, false);
  assert.ok(packSection.includes(pack.name));
  const offer = offers.secondary.find(o => o.id === id);
  assert.equal(offer.name, pack.name);
  assert.match(offer.audience, /Adults ages 18 and up/);
  assert.equal(offer.eligibilityRef, `visitorAndSupport.${key}.eligibility`);
}
assert.match(packSection, /Adult packs: ages 18 and up/);
assert.match(packSection, /Kids and teens can pick a youth plan/);
assert.equal(pricing.visitorAndSupport.tenPack.price, 300);
assert.equal(pricing.visitorAndSupport.twentyPack.price, 550);
console.log("household pricing QA passed");
