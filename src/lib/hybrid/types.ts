/**
 * Hybrid intelligence response types.
 *
 * Every response from the controller carries both structured
 * knowledge and AI-generated reasoning, clearly labeled.
 */

export interface HybridResponse {
  /** What type of response this is */
  type: "rescue" | "substitution" | "explanation" | "general";

  /** The primary fix or answer */
  fix: FixSection;

  /** Alternative approaches */
  alternatives: Alternative[];

  /** Impact analysis — what changes and what doesn't */
  impact: ImpactSection;

  /** AI-generated contextual explanation */
  explanation: string;

  /** Prevention tip or pro tip */
  proTip: string;

  /** Data provenance — what came from where */
  source: {
    structured: boolean;
    ai: boolean;
    confidence: "high" | "medium" | "low";
  };

  /** Arbitration metadata (present when multi-model validation was used) */
  arbitration?: {
    tiersUsed: number;
    validationTriggered: boolean;
    validationReasons: string[];
    arbitrationTriggered: boolean;
    arbitrationReason?: string;
    guardrailApplied: boolean;
    guardrailCorrections: string[];
  };
}

export interface FixSection {
  title: string;
  instruction: string;
  ingredients?: { name: string; amount: string }[];
  urgency: "immediate" | "when-ready" | "optional";
  duration?: string;
}

export interface Alternative {
  title: string;
  instruction: string;
  ingredients?: { name: string; amount: string }[];
  tradeoff: string;
}

export interface ImpactSection {
  taste: ImpactDimension;
  texture: ImpactDimension;
  authenticity: ImpactDimension;
  calories?: ImpactDimension;
}

export interface ImpactDimension {
  direction: "better" | "worse" | "neutral" | "different";
  description: string;
}

/** Intent detected from user input */
export interface DetectedIntent {
  category: "rescue" | "substitution" | "scaling" | "calorie" | "modification" | "edit" | "recipe-search" | "general";
  subcategory?: string;
  confidence: number;
  entities: Record<string, string>;
}
