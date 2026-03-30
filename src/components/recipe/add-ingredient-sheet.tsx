"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Ingredient } from "@/lib/engines/types";

const UNIT_SUGGESTIONS = ["g", "ml", "tsp", "tbsp", "cup", "pieces"] as const;

const CATEGORIES: Ingredient["category"][] = [
  "protein",
  "dairy",
  "spice",
  "vegetable",
  "grain",
  "oil",
  "other",
];

const categoryColors: Record<Ingredient["category"], string> = {
  protein: "bg-red-100 text-red-700 border-red-200",
  dairy: "bg-blue-100 text-blue-700 border-blue-200",
  spice: "bg-amber-100 text-amber-700 border-amber-200",
  vegetable: "bg-green-100 text-green-700 border-green-200",
  grain: "bg-yellow-100 text-yellow-700 border-yellow-200",
  oil: "bg-orange-100 text-orange-700 border-orange-200",
  other: "bg-gray-100 text-gray-700 border-gray-200",
};

interface AddIngredientSheetProps {
  recipeId: string;
  onIngredientAdded?: (ingredient: Ingredient) => void;
}

export function AddIngredientSheet({
  recipeId,
  onIngredientAdded,
}: AddIngredientSheetProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState<Ingredient["category"]>("other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setAmount("");
    setUnit("");
    setCategory("other");
    setError(null);
    setLoading(false);
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) reset();
  }

  const isValid = name.trim() !== "" && amount !== "" && amount > 0 && unit.trim() !== "";

  async function handleAdd() {
    if (!isValid) return;

    const newIngredient: Ingredient = {
      name: name.trim(),
      amount: Number(amount),
      unit: unit.trim(),
      category,
    };

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/recipe-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          action: {
            type: "add",
            ingredientName: newIngredient.name,
            newIngredient,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to add ingredient");

      onIngredientAdded?.(newIngredient);
      setOpen(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full gap-2 rounded-2xl">
          <Plus className="h-4 w-4" />
          Add Ingredient
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="max-h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left">
          <SheetTitle className="font-heading text-lg">
            Add Ingredient
          </SheetTitle>
        </SheetHeader>

        <div className="px-4 pb-8 space-y-5">
          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Ingredient name
            </label>
            <Input
              placeholder="e.g. fresh basil"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
              autoFocus
            />
          </motion.div>

          {/* Amount & Unit */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="flex gap-3"
          >
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Amount
              </label>
              <Input
                type="number"
                placeholder="0"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  setAmount(v === "" ? "" : Number(v));
                }}
                className="rounded-xl"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Unit
              </label>
              <Input
                placeholder="g, ml, cup..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </motion.div>

          {/* Unit suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex flex-wrap gap-1.5"
          >
            {UNIT_SUGGESTIONS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  unit === u
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {u}
              </button>
            ))}
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
          >
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                    category === cat
                      ? categoryColors[cat]
                      : "border-border bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-destructive text-center"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
          >
            <Button
              className="w-full rounded-2xl h-11"
              onClick={handleAdd}
              disabled={!isValid || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add to Recipe
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
