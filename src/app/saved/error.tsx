"use client";

import { useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function SavedError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Auto-reload on chunk mismatch (deployment race condition)
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
    console.error("[Saved Page Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h2 className="mt-4 font-heading text-xl font-semibold">
          Couldn't load saved recipes
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This usually fixes itself with a refresh.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
        >
          Refresh page
        </button>
      </div>
    </div>
  );
}
