import assert from "node:assert/strict";
import fs from "node:fs";
const pricing=JSON.parse(fs.readFileSync("src/_data/pricing.json","utf8"));
const policy=pricing.productPolicy;
assert.equal(policy.monthlyPayment.cardsOnFileRequired,1);
assert.equal(policy.monthlyPayment.paymentDue,"Before each month of training");
assert.equal(policy.annualPayment.cardsOnFileRequired,2);
assert.equal(policy.annualPayment.commitmentMonths,12);
assert.deepEqual(policy.annualPayment.paymentOptions,["paid_in_full","12_monthly_installments"]);
assert.equal(policy.annualPayment.continuationOnly,pricing.annualTrack.continuationOnly);
assert.equal(policy.annualPayment.installmentPlans.length,8);
for(const plan of policy.annualPayment.installmentPlans){
 const canonical=plan.priceRef.split(".").reduce((v,k)=>v[k],pricing);
 assert.equal(plan.annualTotal,canonical);
 assert.equal(plan.regularInstallments,11);
 assert.ok(Number.isInteger(plan.regularInstallmentCents));
 assert.ok(Number.isInteger(plan.finalInstallmentCents));
 assert.equal(plan.regularInstallmentCents*11+plan.finalInstallmentCents,canonical*100);
 assert.ok(Math.abs(plan.regularInstallmentCents-plan.finalInstallmentCents)<=4);
}
const page=fs.readFileSync("dist/options-pricing/index.html","utf8");
const annual=fs.readFileSync("dist/annual-track/index.html","utf8");
assert.equal(page.split(policy.monthlyPayment.publicCopy).length-1,2);
for(const text of [page,annual]){assert.ok(text.includes(policy.annualPayment.publicCopy));assert.match(text,/12-month commitment/);}
for(const plan of policy.annualPayment.installmentPlans){assert.ok(page.includes(plan.regularDisplay));assert.ok(page.includes(plan.finalDisplay));}
assert.doesNotMatch(annual,/Tuition \(Paid in Full\)/);
assert.match(annual,/Tuition \(Annual Total\)/);
console.log("Payment options QA passed: timing, card counts, eligibility, exact installment sums and rendered copy");

const accepted=policy.acceptedPayments;
assert.deepEqual(accepted.services,["Venmo","Cash","Check","Zelle","Stripe"]);
for(const text of [page,annual]){assert.ok(text.includes(accepted.publicCopy));assert.ok(text.includes(accepted.cardOnFileCopy));}
for(const key of ["cardTypesCopy","networkCopy","regionalCopy","availabilityCopy"]){assert.ok(page.includes(accepted[key]));}
assert.match(accepted.availabilityCopy,/Stripe account country/);
assert.match(accepted.availabilityCopy,/saved-card use/);
console.log("Accepted services and conditional Stripe card support QA passed");
