/**
 * Intent detection — deterministic pattern matching.
 *
 * Classifies user input into structured categories before
 * hitting the AI layer. Fast, free, and predictable.
 */

import type { DetectedIntent } from "./types";
import type { RescueProblem } from "../engines/types";

// ─── Pattern Definitions ────────────────────────────

interface PatternRule {
  category: DetectedIntent["category"];
  subcategory?: string;
  patterns: RegExp[];
  entityExtractors?: Record<string, RegExp>;
}

const rules: PatternRule[] = [
  // Rescue patterns
  {
    category: "rescue",
    subcategory: "too-salty",
    patterns: [
      /too\s*(much\s*)?salt/i,
      /over[\s-]?salt/i,
      /dish\s*(is|tastes?)\s*salty/i,
      /added\s*(too\s*much|extra)\s*salt/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "too-spicy",
    patterns: [
      /too\s*(much\s*)?(spic[ey]|hot|chil[li])/i,
      /over[\s-]?spiced/i,
      /dish\s*(is|tastes?)\s*(spicy|hot)/i,
      /too\s*much\s*(chil[li]|pepper|cayenne)/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "too-sweet",
    patterns: [
      /too\s*(much\s*)?sweet/i,
      /over[\s-]?sweet/i,
      /too\s*much\s*sugar/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "too-watery",
    patterns: [
      /too\s*(much\s*)?(water|watery|thin|liquid|runny)/i,
      /curry\s*(is|looks?)\s*(watery|thin|runny)/i,
      /sauce\s*(is|looks?)\s*(watery|thin)/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "too-thick",
    patterns: [
      /too\s*(much\s*)?(thick|dense|heavy)/i,
      /(sauce|gravy|curry)\s*(is|looks?)\s*thick/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "bland",
    patterns: [
      /bland/i,
      /no\s*(taste|flavor|flavour)/i,
      /tasteless/i,
      /needs?\s*more\s*flavor/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "slightly-burned",
    patterns: [
      /burn(ed|t|ing)/i,
      /scorched/i,
      /stuck\s*to\s*(the\s*)?(bottom|pan)/i,
      /smell(s|ing)?\s*burn/i,
    ],
  },
  {
    category: "rescue",
    subcategory: "missing-ingredient",
    patterns: [
      /(don'?t|do\s*not)\s*have/i,
      /missing\s*(an?\s*)?ingredient/i,
      /ran\s*out\s*of/i,
      /no\s*more\s*/i,
    ],
    entityExtractors: {
      ingredient: /(?:don'?t have|ran out of|no more|missing)\s+(.+?)(?:\.|,|$)/i,
    },
  },

  // Substitution patterns
  {
    category: "substitution",
    patterns: [
      /(?:can|could)\s*I\s*(replace|substitute|swap|use)\s/i,
      /what\s*(?:can|could)\s*I\s*use\s*instead/i,
      /alternative\s*(for|to)/i,
      /substitute\s*(for|of)/i,
      /instead\s*of/i,
    ],
    entityExtractors: {
      original: /(?:replace|substitute|swap|instead of)\s+(.+?)\s+(?:with|for|by)/i,
      substitute: /(?:with|for|by|use)\s+(.+?)(?:\?|\.|,|$)/i,
    },
  },

  // Scaling patterns
  {
    category: "scaling",
    patterns: [
      /(?:adjust|scale|make)\s*(?:this|it)?\s*(?:for|to)\s*\d+/i,
      /(?:double|triple|halve|half)\s*(?:the|this)?\s*recipe/i,
      /(\d+)\s*(?:people|servings|portions)/i,
    ],
    entityExtractors: {
      targetServings: /(?:for|to)\s*(\d+)/i,
    },
  },

  // Modification patterns
  {
    category: "modification",
    subcategory: "reduce-calories",
    patterns: [
      /(?:reduce|cut|lower)\s*calori/i,
      /fewer?\s*calori/i,
      /low[\s-]?cal/i,
      /(?:reduce|cut).*(?:by|to)\s*\d+\s*%/i,
    ],
    entityExtractors: {
      percent: /(?:by|reduce)\s*(\d+)\s*%/i,
    },
  },
  {
    category: "modification",
    subcategory: "healthier",
    patterns: [
      /(?:make|keep)\s*(?:it|this)?\s*health/i,
      /health(?:y|ier)\s*(?:version|but)/i,
      /(?:lighter|lean)\s*version/i,
    ],
  },
  {
    category: "modification",
    subcategory: "reduce-spice",
    patterns: [
      /(?:reduce|lower|less)\s*(?:the\s*)?spice/i,
      /(?:make|keep)\s*(?:it|this)?\s*(?:less|mild)/i,
      /(?:tone|bring)\s*down\s*(?:the\s*)?(?:spice|heat)/i,
    ],
  },

  // Recipe edit patterns
  {
    category: "edit",
    subcategory: "remove",
    patterns: [
      /(?:remove|take\s*out|drop|skip|omit)\s+(?:the\s+)?(.+?)(?:\s+from|\s*$)/i,
    ],
    entityExtractors: {
      ingredient: /(?:remove|take\s*out|drop|skip|omit)\s+(?:the\s+)?(.+?)(?:\s+from|,|\.|$)/i,
    },
  },
  {
    category: "edit",
    subcategory: "replace",
    patterns: [
      /(?:replace|swap|switch|change)\s+(.+?)\s+(?:with|to|for)\s+(.+)/i,
    ],
    entityExtractors: {
      ingredient: /(?:replace|swap|switch|change)\s+(?:the\s+)?(.+?)\s+(?:with|to|for)/i,
      replacement: /(?:with|to|for)\s+(.+?)(?:\?|\.|,|$)/i,
    },
  },
  {
    category: "edit",
    subcategory: "add",
    patterns: [
      /(?:add|include|throw\s*in|put\s*in)\s+(.+?)(?:\s+to|\s*$)/i,
    ],
    entityExtractors: {
      ingredient: /(?:add|include|throw\s*in|put\s*in)\s+(?:some\s+)?(.+?)(?:\s+to|,|\.|$)/i,
    },
  },
  {
    category: "edit",
    subcategory: "save",
    patterns: [
      /save\s+(?:this\s+)?(?:as\s+)?(?:my\s+)?recipe/i,
      /save\s+(?:to\s+)?my\s+recipes/i,
      /add\s+(?:this\s+)?to\s+my\s+recipes/i,
    ],
  },

  // Recipe search patterns
  {
    category: "recipe-search",
    patterns: [
      /recipe\s+for\b/i,
      /how\s+(?:to|do\s+(?:I|you))\s+(?:make|cook|prepare)\b/i,
      /make\s+(?:me\s+)?(?:a\s+|some\s+)?(.+)/i,
      /I\s+want\s+(?:to\s+(?:make|cook|eat)|some)\b/i,
      /suggest\s+(?:a\s+|some\s+)?recipe/i,
      /find\s+(?:me\s+)?(?:a\s+)?recipe/i,
      /show\s+(?:me\s+)?(?:a\s+)?recipe/i,
      /what\s+(?:can|should)\s+I\s+(?:make|cook)\b/i,
      /looking\s+for\s+(?:a\s+)?(.+)\s+recipe/i,
      /surprise\s+me/i,
      /(?:quick|easy|healthy|simple)\s+(?:dinner|lunch|breakfast|meal|recipe)/i,
      /(?:chicken|beef|lamb|fish|tofu|paneer|shrimp)\s+(?:curry|stir.?fry|stew|soup|salad|pasta|rice)/i,
    ],
    entityExtractors: {
      dish: /(?:recipe\s+for|make|cook|prepare|looking\s+for)\s+(?:a\s+|some\s+)?(.+?)(?:\s+recipe)?$/i,
    },
  },
];

// ─── Public API ─────────────────────────────────────

/**
 * Detect the user's intent from free-text input.
 * Returns the highest-confidence match.
 */
export function detectIntent(input: string): DetectedIntent {
  let bestMatch: DetectedIntent | null = null;

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const match = input.match(pattern);
      if (match) {
        const confidence = calculateConfidence(input, pattern, rule);

        if (!bestMatch || confidence > bestMatch.confidence) {
          const entities: Record<string, string> = {};

          if (rule.entityExtractors) {
            for (const [key, extractor] of Object.entries(rule.entityExtractors)) {
              const entityMatch = input.match(extractor);
              if (entityMatch?.[1]) {
                entities[key] = entityMatch[1].trim();
              }
            }
          }

          bestMatch = {
            category: rule.category,
            subcategory: rule.subcategory,
            confidence,
            entities,
          };
        }
      }
    }
  }

  return bestMatch || {
    category: "general",
    confidence: 0,
    entities: {},
  };
}

/**
 * Check if a detected intent maps to a known rescue problem.
 */
export function intentToRescueProblem(intent: DetectedIntent): RescueProblem | null {
  if (intent.category !== "rescue" || !intent.subcategory) return null;
  return intent.subcategory as RescueProblem;
}

// ─── Internal ───────────────────────────────────────

function calculateConfidence(
  input: string,
  pattern: RegExp,
  rule: PatternRule
): number {
  let confidence = 0.6; // base confidence for any match

  // Longer matches = higher confidence
  const match = input.match(pattern);
  if (match?.[0]) {
    const matchRatio = match[0].length / input.length;
    confidence += matchRatio * 0.3;
  }

  // Having a subcategory = more specific = higher confidence
  if (rule.subcategory) confidence += 0.1;

  return Math.min(confidence, 1);
}
