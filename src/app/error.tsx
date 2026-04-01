"use client";

import { useEffect } from "react";
import { ChefHat } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Chunk load failures from deployment mismatches — force full reload
    const msg = error.message ?? "";
    if (
      msg.includes("ChunkLoadError") ||
      msg.includes("Loading chunk") ||
      msg.includes("Failed to fetch") ||
      msg.includes("Unexpected token")
    ) {
      window.location.reload();
      return;
    }
    console.error("[CookGenie Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page failed to load. This usually fixes itself with a refresh.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
          >
            Refresh page
          </button>
          <button
            onClick={reset}
            className="rounded-2xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
