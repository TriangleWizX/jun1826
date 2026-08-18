export const ALCOHOL_INCLUDED_ENABLED = false;
export const alcoholIncludedEnabled = ALCOHOL_INCLUDED_ENABLED;

export const drinkFamilies = [
  { id: "bright", name: "Bright", product: "Clarified Lime", description: "Cold. Bright. Clean.", supporting: "Crisp citrus. Clean finish." },
  { id: "silk", name: "Silk", product: "Clarified Sour", description: "Soft top. Sharp center.", supporting: "Bright acidity underneath a thick, soft head of foam." },
  { id: "deep", name: "Deep", product: "Clarified Old Fashioned", description: "Slow, cold and ready for the fire.", supporting: "Aromatic, spirit-forward and built for slow ice." }
];

export const bottleSizes = [
  { id: "375ml", label: "Cabin", volumeMl: 375, price: null },
  { id: "750ml", label: "House", volumeMl: 750, price: null, featured: true },
  { id: "1l", label: "Gathering", volumeMl: 1000, price: null },
  { id: "1.5l", label: "Full House", volumeMl: 1500, price: null }
];

export const iceProducts = [
  { id: "two-inch", name: "Two-inch", description: "Large-format cubes for slow dilution.", available: true },
  { id: "spears", name: "Spears", description: "Long-format ice for tall drinks.", available: true },
  { id: "cocktail-cubes", name: "Cocktail Cubes", description: "The cocktail is frozen into the cube.", available: false }
];

// Merchant data is intentionally empty until Bruce supplies verified offerings.
export const cuisines = [];

export default {
  ALCOHOL_INCLUDED_ENABLED,
  alcoholIncludedEnabled,
  drinkFamilies,
  bottleSizes,
  iceProducts,
  cuisines
};
