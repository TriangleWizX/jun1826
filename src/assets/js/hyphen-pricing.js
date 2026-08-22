export const BOTTLE_MATCH_PRICING = {
375: { one: 39, duo: 75, fullFlight: 105 }, 750: { one: 34, duo: 66, fullFlight: 94 },
  1000: { one: 69, duo: 135, fullFlight: 185 }, 1500: { one: 99, duo: 195, fullFlight: 265 }
};
export const FINISH_KIT_PRICING = {
  375: { one: 20, duo: 35, fullFlight: 55 }, 750: { one: 25, duo: 45, fullFlight: 69 },
  1000: { one: 30, duo: 55, fullFlight: 85 }, 1500: { one: 45, duo: 85, fullFlight: 129 }
};
export const POURS_PER_MATCH = { 375: 6, 750: 12, 1000: 16, 1500: 24 };
export const HYPHEN_PRICING = {
  bottleMatch: BOTTLE_MATCH_PRICING[750], finishKit: FINISH_KIT_PRICING[750],
  sourcing: { guestSupplied: 0, courtesy: 65, curated: 85, priority: 125 },
  icebox: { standard: 39, full: 59 }
};
