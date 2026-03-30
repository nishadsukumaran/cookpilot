/**
 * Ingredient substitution knowledge base.
 *
 * Structured data for deterministic substitution lookup.
 * Each entry provides best + fallback substitutes with
 * quantity mapping and impact ratings (1-5 scale).
 */

import type { SubstitutionEntry } from "../types";

export const SUBSTITUTION_DB: SubstitutionEntry[] = [
  // ─── Dairy ────────────────────────────────────────
  {
    original: "heavy cream",
    substitutes: [
      {
        name: "Cashew paste",
        tier: "best",
        quantityMapping: { ratio: 0.75, note: "Soak 15 cashews in hot water 10 min, blend smooth, add water to match volume" },
        impact: {
          taste: { score: 4, description: "Slightly nuttier, still rich" },
          texture: { score: 4, description: "Very similar creaminess" },
          authenticity: { score: 4, description: "Traditional in many Indian restaurants" },
          summary: "Closest substitute. Works especially well in Indian curries. Slightly nuttier flavor adds depth.",
        },
      },
      {
        name: "Coconut cream",
        tier: "fallback",
        quantityMapping: { ratio: 1, note: "Use full-fat coconut cream, not coconut milk" },
        impact: {
          taste: { score: 3, description: "Adds noticeable coconut flavor" },
          texture: { score: 5, description: "Equally creamy and rich" },
          authenticity: { score: 2, description: "Not traditional in North Indian dishes" },
          summary: "Great texture but adds coconut flavor. Best for South Indian or Thai-inspired dishes.",
        },
      },
    ],
  },
  {
    original: "butter",
    substitutes: [
      {
        name: "Ghee",
        tier: "best",
        quantityMapping: { ratio: 0.85, note: "Ghee is more concentrated — use slightly less" },
        impact: {
          taste: { score: 5, description: "Nuttier, richer flavor" },
          texture: { score: 5, description: "Identical behavior in cooking" },
          authenticity: { score: 5, description: "More traditional than butter in Indian cuisine" },
          summary: "Superior substitute for Indian cooking. Nuttier flavor, higher smoke point.",
        },
      },
      {
        name: "Olive oil",
        tier: "fallback",
        quantityMapping: { ratio: 0.75, note: "Use less — olive oil is more intensely flavored" },
        impact: {
          taste: { score: 2, description: "Loses buttery richness, adds olive flavor" },
          texture: { score: 3, description: "Thinner, less coating mouthfeel" },
          authenticity: { score: 1, description: "Not traditional in Indian or Middle Eastern curries" },
          summary: "Significantly changes the dish character. Only use when dairy-free is essential.",
        },
      },
    ],
  },
  {
    original: "yogurt",
    substitutes: [
      {
        name: "Greek yogurt",
        tier: "best",
        quantityMapping: { ratio: 1, note: "Direct replacement, slightly thicker" },
        impact: {
          taste: { score: 5, description: "Nearly identical, slightly tangier" },
          texture: { score: 5, description: "Thicker, which is usually better for marinades" },
          authenticity: { score: 5, description: "Perfectly acceptable" },
          summary: "Best possible swap. Thicker consistency actually improves marinades.",
        },
      },
      {
        name: "Sour cream",
        tier: "fallback",
        quantityMapping: { ratio: 0.75, note: "Thicker and richer — use less and thin with water if needed" },
        impact: {
          taste: { score: 3, description: "Richer, less tangy" },
          texture: { score: 4, description: "Creamier but heavier" },
          authenticity: { score: 2, description: "Not traditional" },
          summary: "Works in a pinch for gravies but too heavy for marinades. Don't heat too much — it can curdle.",
        },
      },
    ],
  },
  {
    original: "paneer",
    substitutes: [
      {
        name: "Extra-firm tofu",
        tier: "best",
        quantityMapping: { ratio: 1, note: "Press for 15 min, then pan-fry until golden before adding to curry" },
        impact: {
          taste: { score: 3, description: "Milder, less milky flavor" },
          texture: { score: 3, description: "Slightly different bite, softer interior" },
          authenticity: { score: 2, description: "Not traditional but widely accepted" },
          summary: "Good vegan alternative. Pan-frying is essential to get closer to paneer's texture.",
        },
      },
      {
        name: "Halloumi",
        tier: "fallback",
        quantityMapping: { ratio: 1, note: "Soak in water 30 min to reduce saltiness before using" },
        impact: {
          taste: { score: 3, description: "Saltier, squeaky texture" },
          texture: { score: 4, description: "Holds shape well, good chew" },
          authenticity: { score: 2, description: "Mediterranean cheese, different tradition" },
          summary: "Holds up well in curries. Soak first to reduce salt. Different but delicious.",
        },
      },
    ],
  },

  // ─── Proteins ─────────────────────────────────────
  {
    original: "chicken thighs",
    substitutes: [
      {
        name: "Chicken breast",
        tier: "best",
        quantityMapping: { ratio: 1, note: "Reduce cooking time by 5 min — breast dries out faster" },
        impact: {
          taste: { score: 4, description: "Leaner, slightly less flavorful" },
          texture: { score: 3, description: "Drier if overcooked" },
          authenticity: { score: 4, description: "Acceptable, thighs preferred for curries" },
          summary: "Lower calorie but less forgiving. Don't overcook — remove when just done.",
        },
      },
      {
        name: "Paneer cubes",
        tier: "fallback",
        quantityMapping: { ratio: 0.8, note: "Cut into 1-inch cubes, add in the last 5 minutes" },
        impact: {
          taste: { score: 2, description: "Completely different — mild, milky" },
          texture: { score: 2, description: "Soft, doesn't shred like chicken" },
          authenticity: { score: 3, description: "Becomes a different but authentic dish (Paneer Butter Masala)" },
          summary: "Transforms the dish into its vegetarian counterpart. Still authentic, just different.",
        },
      },
    ],
  },
  {
    original: "eggs",
    substitutes: [
      {
        name: "Silken tofu (cubed)",
        tier: "best",
        quantityMapping: { ratio: 1, note: "1 egg ≈ 60g silken tofu. Drain gently, don't press" },
        impact: {
          taste: { score: 2, description: "Neutral flavor, won't taste like egg" },
          texture: { score: 3, description: "Soft and delicate, different from egg" },
          authenticity: { score: 1, description: "Not traditional in any egg-based dish" },
          summary: "Best option for vegan adaptation. Won't replicate egg but works texturally in dishes like shakshuka.",
        },
      },
      {
        name: "Chickpea flour scramble",
        tier: "fallback",
        quantityMapping: { ratio: 0.5, unit: "cup", note: "Mix 1/2 cup chickpea flour + 1/2 cup water per 3 eggs" },
        impact: {
          taste: { score: 2, description: "Beany, savory — different from egg" },
          texture: { score: 2, description: "Denser, more like a pancake" },
          authenticity: { score: 1, description: "Not traditional" },
          summary: "Works for scrambled-egg style dishes. Not suitable for poached/fried egg dishes.",
        },
      },
    ],
  },

  // ─── Spices & Aromatics ───────────────────────────
  {
    original: "saffron",
    substitutes: [
      {
        name: "Turmeric + cardamom",
        tier: "best",
        quantityMapping: { ratio: 1, note: "1 pinch saffron → 1/4 tsp turmeric + 1 crushed cardamom pod" },
        impact: {
          taste: { score: 3, description: "Warm and earthy but lacks saffron's floral complexity" },
          texture: { score: 5, description: "No texture difference" },
          authenticity: { score: 2, description: "Saffron is irreplaceable for true authenticity" },
          summary: "Gets the color close but the delicate floral aroma of saffron is unique and irreplaceable.",
        },
      },
      {
        name: "Annatto + rose water",
        tier: "fallback",
        quantityMapping: { ratio: 1, note: "Tiny pinch of annatto for color + 1/2 tsp rose water for aroma" },
        impact: {
          taste: { score: 2, description: "Different flavor profile entirely" },
          texture: { score: 5, description: "No texture difference" },
          authenticity: { score: 1, description: "Not a traditional substitute" },
          summary: "Creative approximation of saffron's two main roles: color and fragrance. Not authentic.",
        },
      },
    ],
  },
  {
    original: "kasuri methi",
    substitutes: [
      {
        name: "Fresh fenugreek leaves",
        tier: "best",
        quantityMapping: { ratio: 3, note: "Use 3x the amount of dried kasuri methi, add earlier in cooking" },
        impact: {
          taste: { score: 4, description: "Similar bitter-sweet flavor, less concentrated" },
          texture: { score: 4, description: "Slightly different but blends in" },
          authenticity: { score: 4, description: "Same plant, just fresh form" },
          summary: "Best substitute — same flavor family. Use more since fresh is less concentrated than dried.",
        },
      },
      {
        name: "Dried celery leaves",
        tier: "fallback",
        quantityMapping: { ratio: 1, note: "Use same amount, add at the end" },
        impact: {
          taste: { score: 2, description: "Mild herbal note, lacks fenugreek's distinctive bitterness" },
          texture: { score: 4, description: "Similar dried leaf texture" },
          authenticity: { score: 1, description: "Not traditional at all" },
          summary: "Emergency substitute only. Missing the key bitter-sweet note that defines butter chicken.",
        },
      },
    ],
  },

  // ─── Grains ───────────────────────────────────────
  {
    original: "basmati rice",
    substitutes: [
      {
        name: "Jasmine rice",
        tier: "best",
        quantityMapping: { ratio: 1, note: "Same amount, same water ratio. Slightly stickier." },
        impact: {
          taste: { score: 3, description: "Sweeter, more floral — different aromatic profile" },
          texture: { score: 3, description: "Stickier, shorter grain" },
          authenticity: { score: 2, description: "Not traditional for biryani or pilaf" },
          summary: "Workable but the texture difference is noticeable. Biryani grains won't separate as well.",
        },
      },
      {
        name: "Long-grain white rice",
        tier: "fallback",
        quantityMapping: { ratio: 1, note: "Same amount, may need slightly more water" },
        impact: {
          taste: { score: 2, description: "Bland, lacks basmati's nutty aroma" },
          texture: { score: 3, description: "Acceptable grain separation" },
          authenticity: { score: 1, description: "Major authenticity loss for biryani/pilaf" },
          summary: "Emergency only. The dish will work but lose significant character.",
        },
      },
    ],
  },

  // ─── Fats & Oils ──────────────────────────────────
  {
    original: "ghee",
    substitutes: [
      {
        name: "Clarified butter",
        tier: "best",
        quantityMapping: { ratio: 1, note: "Identical for cooking purposes" },
        impact: {
          taste: { score: 5, description: "Nearly identical — ghee IS clarified butter (just cooked longer)" },
          texture: { score: 5, description: "Same" },
          authenticity: { score: 5, description: "Essentially the same product" },
          summary: "Practically the same thing. Ghee is cooked slightly longer for nuttier flavor.",
        },
      },
      {
        name: "Unsalted butter",
        tier: "fallback",
        quantityMapping: { ratio: 1.1, note: "Use 10% more to compensate for water content. Lower smoke point." },
        impact: {
          taste: { score: 4, description: "Similar richness, less nutty" },
          texture: { score: 4, description: "May spatter at high heat due to water content" },
          authenticity: { score: 3, description: "Acceptable but ghee preferred" },
          summary: "Good substitute. Watch heat — butter burns more easily than ghee.",
        },
      },
    ],
  },
  {
    original: "feta cheese",
    substitutes: [
      {
        name: "Goat cheese",
        tier: "best",
        quantityMapping: { ratio: 0.75, note: "Goat cheese is more intense — use less" },
        impact: {
          taste: { score: 4, description: "Tangier, creamier" },
          texture: { score: 3, description: "Creamier, less crumbly" },
          authenticity: { score: 4, description: "Both are traditional Mediterranean cheeses" },
          summary: "Excellent substitute. Slightly different texture but equally delicious in shakshuka.",
        },
      },
      {
        name: "Ricotta salata",
        tier: "fallback",
        quantityMapping: { ratio: 1, note: "Crumble similarly to feta" },
        impact: {
          taste: { score: 3, description: "Milder, less tangy" },
          texture: { score: 4, description: "Similar crumble" },
          authenticity: { score: 3, description: "Italian cheese, different tradition" },
          summary: "Mild alternative that won't overpower the dish. Less tangy than feta.",
        },
      },
    ],
  },
];

/**
 * Find substitutions for a given ingredient name.
 */
export function findSubstitutions(ingredientName: string): SubstitutionEntry | null {
  const name = ingredientName.toLowerCase().trim();

  // Direct match
  const direct = SUBSTITUTION_DB.find(
    (entry) => entry.original.toLowerCase() === name
  );
  if (direct) return direct;

  // Partial match
  return (
    SUBSTITUTION_DB.find(
      (entry) =>
        name.includes(entry.original.toLowerCase()) ||
        entry.original.toLowerCase().includes(name)
    ) || null
  );
}

/**
 * Get all available substitution entries.
 */
export function getAllSubstitutions(): SubstitutionEntry[] {
  return SUBSTITUTION_DB;
}
