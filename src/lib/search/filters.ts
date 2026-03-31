/**
 * Search filter types, constants, and helpers.
 *
 * Single source of truth for filter options used by:
 *   - FilterBar UI (chip labels)
 *   - GET /api/recipes (SQL WHERE clauses)
 *   - POST /api/recipes/search (AI prompt constraints)
 */

// ─── Types ─────────────────────────────────────────

export interface SearchFilters {
  cuisine: string | null;
  time: string | null;
  difficulty: string | null;
  dietary: string | null;
}

export const EMPTY_FILTERS: SearchFilters = {
  cuisine: null,
  time: null,
  difficulty: null,
  dietary: null,
};

// ─── Filter Options ────────────────────────────────

export interface FilterOption {
  id: string;
  label: string;
  icon?: string;
}

export const CUISINE_OPTIONS: FilterOption[] = [
  { id: "Indian", label: "Indian", icon: "🍛" },
  { id: "Italian", label: "Italian", icon: "🍝" },
  { id: "Mexican", label: "Mexican", icon: "🌮" },
  { id: "Middle Eastern", label: "Middle Eastern", icon: "🫓" },
  { id: "Thai", label: "Thai", icon: "🍜" },
  { id: "Japanese", label: "Japanese", icon: "🍣" },
  { id: "Chinese", label: "Chinese", icon: "🥡" },
  { id: "Arabic", label: "Arabic", icon: "🧆" },
];

export const TIME_OPTIONS: FilterOption[] = [
  { id: "under-30", label: "Under 30 min", icon: "⚡" },
  { id: "30-60", label: "30–60 min", icon: "⏱️" },
  { id: "60-plus", label: "60+ min", icon: "🕐" },
];

export const DIFFICULTY_OPTIONS: FilterOption[] = [
  { id: "Easy", label: "Easy", icon: "🟢" },
  { id: "Medium", label: "Medium", icon: "🟡" },
  { id: "Hard", label: "Hard", icon: "🔴" },
];

export const DIETARY_OPTIONS: FilterOption[] = [
  { id: "Vegetarian", label: "Vegetarian", icon: "🥬" },
  { id: "Vegan", label: "Vegan", icon: "🌱" },
  { id: "Gluten-free", label: "Gluten-free", icon: "🌾" },
  { id: "Dairy-free", label: "Dairy-free", icon: "🥛" },
];

// ─── URL Serialization ─────────────────────────────

export function filtersToQueryParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.cuisine) params.set("cuisine", filters.cuisine);
  if (filters.time) params.set("time", filters.time);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.dietary) params.set("dietary", filters.dietary);
  return params;
}

export function queryParamsToFilters(params: URLSearchParams): SearchFilters {
  return {
    cuisine: params.get("cuisine"),
    time: params.get("time"),
    difficulty: params.get("difficulty"),
    dietary: params.get("dietary"),
  };
}

// ─── AI Prompt Builder ─────────────────────────────

export function buildFilterPromptContext(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.cuisine) parts.push(`Cuisine: ${filters.cuisine}`);
  if (filters.time) {
    const timeLabel = TIME_OPTIONS.find((o) => o.id === filters.time)?.label ?? filters.time;
    parts.push(`Cooking time: ${timeLabel}`);
  }
  if (filters.difficulty) parts.push(`Difficulty: ${filters.difficulty}`);
  if (filters.dietary) parts.push(`Dietary: ${filters.dietary}`);
  return parts.length > 0
    ? `\nConstraints:\n${parts.map((p) => `- ${p}`).join("\n")}`
    : "";
}
