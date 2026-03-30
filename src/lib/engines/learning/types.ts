/**
 * Learning layer types.
 */

export interface FeedbackAggregation {
  targetType: string;
  totalCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  tooRiskyCount: number;
  tooDifferentCount: number;
  helpfulRate: number;     // 0-1
  negativeRate: number;    // 0-1 (not_helpful + too_risky + too_different)
}

export interface ScenarioMetrics {
  scenario: string;         // "too-salty", "heavy cream → Cashew paste", etc.
  feedbackCount: number;
  helpfulRate: number;
  avgAiLatency: number;
  avgConfidence: number;
}

export interface ConfidenceAdjustment {
  baseScore: number;
  feedbackModifier: number;
  preferenceModifier: number;
  adjustedScore: number;
  reasons: string[];
}

export interface PersonalizationBias {
  spiceMultiplier: number;    // 0.5 (mild) to 1.5 (very hot)
  calorieTarget?: number;
  authenticityStrictness: number; // 0.8 (adventurous) to 1.2 (strict)
  unitSystem: "metric" | "imperial";
}
