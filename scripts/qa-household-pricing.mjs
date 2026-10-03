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
assert.match(page, /Youth: \$185 \/ month/);
assert.match(page, /Adult: \$245 \/ month/);
assert.match(page, /Youth: \$1,980 \/ year/);
assert.match(page, /Adult: \$2,475 \/ year/);
const annualTable = page.slice(page.indexOf("Annual continuation prices"), page.indexOf("</table>", page.indexOf("Annual continuation prices")));
assert.ok(annualTable.indexOf("3×") < annualTable.indexOf("2×") && annualTable.indexOf("2×") < annualTable.indexOf("1×"), "annual frequency table should descend from the high anchor");
assert.match(page, /Free First Visit: \$0/);
assert.match(page, /\$6,435 individual total/);
assert.match(page, /\$1,035/);
assert.match(page, /\$12\.50 per scheduled class/);
assert.doesNotMatch(page, /\$3,300/);

// Global price range anchored at highest annual track 3x monthly down to lowest 1x monthly
const homePage = fs.readFileSync(path.join(root, "dist/index.html"), "utf8");
const annualPage = fs.readFileSync(path.join(root, "dist/annual-track/index.html"), "utf8");

const adultAnnual3xMonthly = pricing.coreCulture.frequencyLadder.adult[3].annual / 12;
const youthAnnual3xMonthly = pricing.coreCulture.frequencyLadder.youth[3].annual / 12;
const youth1xMonthly = pricing.coreCulture.frequencyLadder.youth[1].monthly;
const adult1xMonthly = pricing.coreCulture.frequencyLadder.adult[1].monthly;

assert.equal(adultAnnual3xMonthly, 206.25);
assert.equal(youthAnnual3xMonthly, 165);
assert.equal(youth1xMonthly, 75);
assert.equal(adult1xMonthly, 95);

assert.match(homePage, /\$206 to \$75 \/ month/);
assert.match(annualPage, /\$206 to \$95 \/ month/);
assert.match(annualPage, /\$165 to \$75 \/ month/);
assert.match(page, /\$206 to \$75 \/ month/);
assert.match(page, /\$165 \/ month equivalent/);
assert.match(page, /\$206\.25 \/ month equivalent/);

console.log("household pricing QA passed");
