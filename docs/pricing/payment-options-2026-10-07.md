# Payment options implementation

Goal: reduce friction with one stored card for monthly tuition and two stored cards for annual pricing, paid in full or through monthly continuity.

Confirmed: monthly tuition is due before each month of training. One card on file unlocks the current individual Youth/Adult monthly rates. Existing rates are preserved. Website copy directs card setup to Sandy/payment provider, not a local card form.

Confirmed: annual-rate monthly continuity is a twelve-month commitment paid in twelve monthly installments. Annual pricing requires two stored cards for either payment option. Annual paid-in-full tuition is due before the annual term; installments before each month. Existing annual continuation eligibility stays in place. First eleven installments round to cents; the twelfth adjusts so their sum equals the current annual tuition. Rates are taken from the displayed frequency ladder, not legacy annualTrack youth/adult fields. Annual family installment is $450/month.

Contracts: P1 root writes canonical pricing and page/payment documentation; P2 read-only worker audits current amounts, annual rounding and eligibility conflicts. Completion requires unambiguous approved payment timing/commitment, canonical values, consistent customer-facing copy, focused/build/responsive checks and clear distinction from payment-provider automation.

Persona routing returned an ambiguous SEO candidate that does not fit payment-policy work. Ordinary pricing/payments specialist fallback applies. Prior COMPETENCE source recovery was incomplete; no adoption claimed. Existing pricing skill informs price/commitment separation. No payment credentials or card details accessed.

Verification: build, exact installment/payment-policy QA, existing household pricing QA, operational-fact QA and diff whitespace checks passed. Canonical comparison proves existing prices and policy remain unchanged outside the two added payment objects. Phone/desktop browser checks passed for both pages, including the expanded installment table. Card collection and recurring charge scheduling must be arranged in the payment provider; no website card form or provider automation was added. User has now authorized commit and deployment after validation.

Accepted services clarified from owner instructions: Venmo, cash, check, Zelle and Stripe cards. Stripe global/network capability is separated from academy account enablement: credit/debit, eligible prepaid/network gift cards; Visa/Mastercard/Amex/Discover/Diners/JCB/UnionPay and regional Cartes Bancaires/Interac/eftpos are conditional on account country, customer location, currency and payment setup. No merchant-account settings were inspected or changed. Card-on-file enrollment conditions apply even when tuition is paid another way. Source: official Stripe cards and payment-method overview documentation retrieved through Context7. User authorized commit and deployment of the pending payment-policy work plus these clarifications.

Release validation: updated build, payment and accepted-service QA, household pricing QA, operational-fact QA and unified site QA passed. Card brands are described as Stripe capability conditional on account configuration, not proof that all are enabled for this academy. No payment-provider settings or automation changed. Deployment limited to pricing/annual HTML routes; unrelated user work excluded.

## Approved credit-card surcharge clarification

Owner approved the revised policy instead of the requested 5%: eligible credit cards only, capped at the lower of 3% or actual acceptance cost and any stricter applicable rule. Debit/prepaid excluded, including debit run as credit. Official Visa surcharge FAQ was downloaded and inspected; Stripe compliance documentation also requires actual-cost/network caps, disclosure and itemized receipts. New York official pages could not be fetched (HTTP403), so no claim of a complete legal review is made.

Website publishes conditional policy, not a claim that surcharge collection is active. Processor configuration and actual academy acceptance costs were not accessed. Canonical processorConfigurationVerified=false and activation requirements preserve this boundary: verify actual costs, notices/network rules, show card-inclusive applicable prices/final totals before payment and itemize receipts. Existing tuition, installment principal, discounts and accepted methods remain unchanged. Stripe/acquirer setup remains operational work; this release adds no automatic fee charging.

Routing produced no suitable payments role. Ordinary payment-policy specialist fallback applies; earlier full-source limitations remain recorded. Verification covers canonical cap/credit-only conditions, rendered disclosure on both pages, no 5% claim, local build/QA/browser, three-file scoped deployment with current verified rollback snapshot and live marker checks.
