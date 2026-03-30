"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { Sparkles, SlidersHorizontal, Trophy } from "lucide-react";
import { SearchInput } from "@/components/search/search-input";
import { CategoryChip } from "@/components/search/category-chip";
import { RecipeDiscoveryCard } from "@/components/recipe/recipe-discovery-card";
import { AppHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/shared/empty-state";
import { recipes, categories } from "@/data/mock-data";
import { rankRecipes } from "@/lib/search/ranking";

const MAX_RESULTS = 3;

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredRecipes = useMemo(() => {
    let pool = recipes;

    // Category filter first
    if (activeCategory) {
      const cat = categories.find((c) => c.id === activeCategory);
      if (cat) {
        const label = cat.label.toLowerCase();
        pool = pool.filter(
          (r) =>
            r.cuisine.toLowerCase().includes(label) ||
            r.tags.some((t) => t.toLowerCase().includes(label)) ||
            r.difficulty.toLowerCase() === label
        );
      }
    }

    // Ranked search
    if (query.trim().length >= 2) {
      return rankRecipes(pool, query)
        .slice(0, MAX_RESULTS)
        .map((sr) => sr.recipe);
    }

    // No query — sort by rating
    return pool
      .sort((a, b) => b.rating - a.rating)
      .slice(0, MAX_RESULTS);
  }, [query, activeCategory]);

  const hasQuery = query.trim().length > 0 || activeCategory !== null;

  return (
    <div className="min-h-screen">
      <AppHeader title="Discover" />

      <div className="mx-auto max-w-lg px-4">
        <div className="mt-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            autoFocus={!initialQuery}
            placeholder="Search recipes, ingredients, cuisines..."
            showSuggestions={false}
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map((cat) => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              isActive={activeCategory === cat.id}
              onClick={() =>
                setActiveCategory(activeCategory === cat.id ? null : cat.id)
              }
            />
          ))}
        </div>

        {filteredRecipes.length > 0 ? (
          <motion.div
            key={`${query}-${activeCategory}`}
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mt-6 mb-8"
          >
            <motion.div
              variants={fadeUp}
              className="mb-5 flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                {hasQuery ? (
                  <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                  <Trophy className="h-4 w-4 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-semibold">
                  {hasQuery
                    ? `Top ${filteredRecipes.length} Best Recipes`
                    : "Today's Top Picks"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {hasQuery
                    ? "Ranked by relevance, rating & authenticity"
                    : "AI-curated selection based on popularity and quality"}
                </p>
              </div>
            </motion.div>

            <div className="space-y-5">
              {filteredRecipes.map((recipe, i) => (
                <motion.div key={recipe.id} variants={fadeUp}>
                  <RecipeDiscoveryCard recipe={recipe} rank={i + 1} />
                </motion.div>
              ))}
            </div>

            {hasQuery && (
              <motion.p
                variants={fadeUp}
                className="mt-6 text-center text-xs text-muted-foreground"
              >
                Showing the {filteredRecipes.length} best matches — not endless results
              </motion.p>
            )}
          </motion.div>
        ) : (
          <EmptyState
            icon={<SlidersHorizontal className="h-6 w-6" />}
            title="No recipes found"
            description="Try adjusting your search or browse categories above"
          />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
