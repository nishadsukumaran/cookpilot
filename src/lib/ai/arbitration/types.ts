/**
 * Structured response schema for multi-model arbitration.
 *
 * All models must return this exact shape. Comparison and
 * mismatch detection operate on these fields, not raw text.
 */

export interface StructuredAdvice {
  /** What kind of cooking scenario this addresses */
  scenario_type: "rescue" | "substitution" | "technique" | "general";

  /** The primary recommended action */
  primary_fix: {
    action: string;
    ingredients: Array<{ name: string; amount: string }>;
    urgency: "immediate" | "soon" | "when_ready";
  };

  /** Alternative approaches, ranked by preference */
  alternatives: Array<{
    action: string;
    tradeoff: string;
  }>;

  /** Impact ratings — 1 (major negative) to 5 (no change / improvement) */
  impact_on_taste: { score: number; direction: "better" | "worse" | "neutral" | "different"; note: string };
  impact_on_texture: { score: number; direction: "better" | "worse" | "neutral" | "different"; note: string };
  authenticity_impact: { score: number; direction: "better" | "worse" | "neutral" | "different"; note: string };

  /** Self-assessed confidence: 0.0 - 1.0 */
  confidence: number;

  /** Free-text reasoning (for display, not for comparison) */
  notes: string;
}

/** Which model tier produced a response */
export type ModelTier = "primary" | "validator" | "arbitrator";

/** A response tagged with its source model */
export interface TieredResponse {
  advice: StructuredAdvice;
  tier: ModelTier;
  model: string;
  latencyMs: number;
}

/** The final output of the arbitration pipeline */
export interface ArbitrationResult {
  /** The winning advice after all layers */
  final: StructuredAdvice;

  /** How many model tiers were invoked (1, 2, or 3) */
  tiersUsed: number;

  /** Whether validation was triggered and why */
  validationTriggered: boolean;
  validationReasons: string[];

  /** Whether arbitration was triggered and why */
  arbitrationTriggered: boolean;
  arbitrationReason?: string;

  /** Whether the knowledge guardrail made corrections */
  guardrailApplied: boolean;
  guardrailCorrections: string[];

  /** All responses from each tier (for debugging/transparency) */
  responses: TieredResponse[];
}
