# FUJI New Gi Purchase Plan

**Status:** Planning draft; no purchase placed  
**Prepared:** 2026-09-29

## Recommendation

Use FUJI as a candidate source for the next academy gi, but place a small first order tied to confirmed enrollment and fit data. Do not use the prior personal A9 purchase or the old business forecast as a size-run proxy.

For budgeting, model two starting quantities:

- **10 gis:** about **$1,159.50** product subtotal at the last documented per-gi price.
- **20 gis:** about **$2,319.00** product subtotal at the last documented per-gi price.

These are planning scenarios only. The last documented $115.95 price was for one All Around BJJ Gi White, size A9, on 2026-03-04. It is not a current quote or a wholesale price. The one-item order had $13.16 shipping and $10.34 tax ($139.45 total); do not scale that one-order freight and tax linearly. Get a current written quote, bulk/academy terms, delivery estimate, and decoration options before choosing a quantity.

**Working recommendation:** Start with the smaller scenario only if upcoming first-term enrollments and replacements support it; otherwise collect size commitments and buy to those commitments. Hold the remaining demand as a follow-on order. The local evidence does not yet support a fixed inventory size curve.

## Evidence reviewed

| Evidence | What it establishes | Limit |
|---|---|---|
| FUJI order confirmation FS353494, March 4, 2026 | One personal purchase: All Around BJJ Gi White ×1, size A9, $115.95 item price, $139.45 total with shipping/tax | Retail purchase; not resale, wholesale, or academy volume |
| Current `src/_data/offers.json` and `src/_data/pricing.json` | Qualifying first enrollment includes one uniform; current 12-week offer prices are $550 youth and $715 adult | Defines potential fulfillment obligation, not enrollment forecast or gi size demand |
| Drive document “Sensei Sandy BJJ Business Context Answers” | Early sustainability target is described as about 20 students | The document says bold answers are below 51% confidence based on past conversation memory; not an observed count |
| Drive document “BusinessPlanDraft66” | A 2025 forecast projected about 14 adults and 16 youth by month 4, reaching 20+ of each by year end; stated inventory goal $750 monthly / likely initial investment $1,000 | Forecast and assumptions, not current results; dated and pre-current offer structure |
| Current public schedule data | Capacity is currently represented as 12 for a class | Class capacity is not gi demand or enrollment volume |

No academy gi sales ledger, enrollment-to-uniform fulfillment count, size history, or FUJI dealer quote was found in the local materials or the connected records reviewed. The accessible Gmail search found one FUJI order-confirmation thread; no prior wholesale confirmation appeared in that search.

## Quantity logic

The best demand unit is qualifying new enrollments over the next buying window, because the current offer includes one uniform for each qualifying first enrollment. Calculate the base order as:

`confirmed qualifying enrollments in the buy window + confirmed replacement/resale commitments − usable on-hand stock`

Only add speculative buffer units after recording the budget and expected replenishment lead time. If there are around 20 qualifying enrollments in the order window, 20 gis is a fulfillment scenario, not a safe speculative stock target. If enrollment demand is unconfirmed, use preorders/size commitments or split the buy into an initial batch and a replenishment batch.

## Before requesting the final quote

1. Confirm the exact gi model, color, and whether the academy logo/name will be custom decorated.
2. Count qualifying enrollments expected during the order window and any student-paid retail/preorder requests separately.
3. Reconcile all available gis and loaners by model, color, size, and condition.
4. Ask each recipient for height, weight, preferred fit, and an approved FUJI size after checking the current size chart or trying on a sample. Do not infer a size from age or lane.
5. Ask FUJI for current unit tiers, minimums, mixed-size/color rules, setup/artwork charges, shipping, tax handling, lead time, payment terms, and return/exchange rules for size issues.
6. Compare the landed cost and lead time with the authorized uniform budget. The canonical offer includes the qualifying uniform, so confirm the unit economics before committing.

## Suggested FUJI quote request

> Hi FUJI team,
>
> I’m planning an academy gi order for Sensei Sandy BJJ in Tannersville, NY. Please quote your current academy/wholesale pricing for [model and color], including quantities of 10 and 20 with mixed adult and youth sizes. Please include any minimums, custom logo options and setup charges, shipping, estimated ship date, payment terms, and your size exchange/return policy. We previously purchased one All Around BJJ Gi White (A9) at $115.95 retail in March 2026; please confirm whether that model and price are still current and whether academy volume pricing is available.
>
> This is a quote request only; final quantities and sizes are pending our enrollment and fit count.

## Decision record to complete

- Approved model/color/customization: **pending**
- Current FUJI quote / landed cost: **pending**
- Confirmed qualifying enrollment count for order window: **pending**
- Confirmed preorder/resale units: **pending**
- On-hand usable inventory: **pending**
- Recipient-approved size counts: **pending**
- Authorized total budget: **pending**
- Final quantity and approver: **pending**
- Order placed / confirmation number: **not placed**

## Persona and method

The repository persona router returned `no_suitable_persona` for this procurement analysis. I used an ordinary evidence-based purchasing approach. The available `Instructions - COMPETENCE` candidate (UUID `e144b81f-10ea-41a6-a06c-03d69dfb738f`) was marked ready but its stated capability scope did not cover procurement or inventory forecasting, so it was not adopted as an expert method. Work stayed read-only with respect to supplier and account systems; this document records planning evidence only.
