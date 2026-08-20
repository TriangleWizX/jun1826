export const ALCOHOL_INCLUDED_ENABLED = false;
import { HYPHEN_PRICING } from "../assets/js/hyphen-pricing.js";
export const bottleSizes = [
  { ml: 375, label: "375 mL", name: "Cabin", copy: "A smaller Bottle Match. About 6 pours each." },
  { ml: 750, label: "750 mL", name: "House · Default", copy: "The standard Bottle Match. About 12 pours each.", featured: true },
  { ml: 1000, label: "1 L", name: "Gathering", copy: "More room around the table. About 16 pours each." },
  { ml: 1500, label: "1.5 L", name: "Full House", copy: "Built for the larger weekend. About 24 pours each." }
];
export const drinkFamilies = [
  { id: "bright", name: "Bright", product: "Clarified Lime", description: "Cold. Bright. Clean.", supporting: "Crisp citrus built for the first glass after you put your bags down.", pairs: "rum · gin · tequila", garnish: ["lime"], container: "quart_mason_jar" },
  { id: "silk", name: "Silk", product: "Clarified Sour", description: "Soft. Bright. Aromatic.", supporting: "A polished sour built for cocktail hour without turning the rental kitchen into a bar.", pairs: "gin", garnish: ["lemon"], container: "quart_mason_jar" },
  { id: "deep", name: "Deep", product: "Spirit-Forward", description: "Slow. Aromatic. Ready for the fire.", supporting: "A darker Bottle Match for dinner ending, big ice and nowhere else to be.", pairs: "rye · bourbon", garnish: ["orange", "cherry"], container: "pint_mason_jar" }
];
export const drinkPackages = [
  { id: "one", name: "One", description: "For one drink direction. About 12 pours.", price: 55, includes: [], featured: false, image: "/assets/images/hyphen/20260718_174246.jpg", alt: "Three finished cocktails on a tray" },
  { id: "duo", name: "Duo", description: "For a weekend with options. About 24 pours.", price: 105, includes: [], featured: false, image: "/assets/images/hyphen/three-drinks.webp", alt: "Three finished cocktails arranged on a tray" },
  { id: "full-flight", name: "Full Flight", description: "Best for the house. Bright + Silk + Deep. About 36 pours.", price: 145, includes: ["bright", "silk", "deep"], featured: true, image: "/assets/images/hyphen/20260718_174246.jpg", alt: "Three finished cocktails on a tray" }
];
export const spiritSourcing = [
  { id: "guest-supplied", name: "I Have the Bottle", description: "Bring the bottles you already like.", price: 0 },
  { id: "courtesy", name: "Courtesy", description: "Added to a scheduled sourcing run.", price: 65 },
  { id: "curated", name: "Curated", description: "Dedicated sourcing, bottle selection and presentation.", price: 85, label: "Most popular", featured: true },
  { id: "priority", name: "Priority", description: "Priority sourcing for specialty bottles or tighter timelines.", price: 125 }
];
export const iceProducts = [
  { id: "standard", name: "Icebox", description: "Large-format cocktail ice. Choose two-inch cubes or spears.", price: 39, available: true },
  { id: "full", name: "Full Icebox", description: "More large-format ice for Full Flight and larger houses.", price: 59, available: true },
  { id: "cocktail-cubes", name: "Cocktail Cubes", description: "Coming soon.", available: false }
];
export const houseDrops = [
  { id: "friday", name: "Friday", description: "Best for weekend arrivals.", status: "Recommended for wedding weekends." },
  { id: "saturday-morning", name: "Saturday Morning", description: "Limited availability for getting-ready houses.", status: "Limited availability." }
];
export const galleryImages = [["20230508_195151.jpg", "A finished drink in warm evening light"], ["20230820_180830.jpg", "Drinks prepared for a weekend table"], ["20260718_174246.jpg", "Three finished cocktails on a tray"], ["20251109_162043.jpg", "Bottle selection and cocktail mise en place"]];
export const cuisines = [];
export default { ALCOHOL_INCLUDED_ENABLED, HYPHEN_PRICING, bottleSizes, drinkFamilies, drinkPackages, spiritSourcing, iceProducts, houseDrops, galleryImages, cuisines };
