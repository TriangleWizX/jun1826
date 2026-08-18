export const ALCOHOL_INCLUDED_ENABLED = false;
export const alcoholIncludedEnabled = ALCOHOL_INCLUDED_ENABLED;

export const drinkFamilies = [
  { id: "bright", name: "Bright", product: "Clarified Lime", description: "Cold. Bright. Clean.", supporting: "Crisp citrus. Clean finish." },
  { id: "silk", name: "Silk", product: "Clarified Sour", description: "Soft top. Sharp center.", supporting: "Bright acidity underneath a thick, soft head of foam." },
  { id: "deep", name: "Deep", product: "Clarified Old Fashioned", description: "Slow, cold and ready for the fire.", supporting: "Aromatic, spirit-forward and built for slow ice." }
];

export const drinkPackages = [
  { id: "one", name: "One", description: "One Bottle Match. About 12 pours.", price: 34, includes: ["bright"], featured: false },
  { id: "duo", name: "Duo", description: "Any two. About 24 pours.", price: 66, savings: "Save up to $8", includes: ["bright", "silk", "deep"], featured: false },
  { id: "full-flight", name: "Full Flight", description: "Bright + Silk + Deep. About 36 pours.", price: 94, savings: "Save $14", includes: ["bright", "silk", "deep"], featured: true }
];

// Public labels intentionally avoid exposing internal sourcing routes or vendor names.
export const spiritSourcing = [
  { id: "guest-supplied", name: "I Have the Bottle", description: "Bring the bottles you already like.", price: 0 },
  { id: "courtesy", name: "Courtesy", description: "Added to a scheduled sourcing run.", price: 65, internalNote: "Planned Cairo run" },
  { id: "curated", name: "Curated", description: "Dedicated sourcing, bottle selection and presentation.", price: 85, label: "Most popular", featured: true, internalNote: "Cairo sourcing + selection" },
  { id: "priority", name: "Priority", description: "Priority sourcing for specialty bottles or tighter timelines.", price: 125 }
];

export const bottleSizes = [
  { id: "375ml", label: "Cabin", volumeMl: 375, price: null },
  { id: "750ml", label: "House", volumeMl: 750, price: null, featured: true },
  { id: "1l", label: "Gathering", volumeMl: 1000, price: null },
  { id: "1.5l", label: "Full House", volumeMl: 1500, price: null }
];

export const iceProducts = [
  { id: "two-inch", name: "Two-inch", description: "Large-format cubes for slow dilution.", priceFrom: 24, priceTo: 32, available: true },
  { id: "spears", name: "Spears", description: "Long-format ice for tall drinks.", priceFrom: 24, priceTo: 32, available: true },
  { id: "cocktail-cubes", name: "Cocktail Cubes", description: "The cocktail is frozen into the cube.", available: false }
];

// Merchant data is intentionally empty until Bruce supplies verified offerings.
export const cuisines = [];

export default {
  ALCOHOL_INCLUDED_ENABLED,
  alcoholIncludedEnabled,
  drinkFamilies,
  drinkPackages,
  spiritSourcing,
  bottleSizes,
  iceProducts,
  cuisines
};
