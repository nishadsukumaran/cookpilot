"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  transparent?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
}

export function AppHeader({
  title,
  showBack = false,
  transparent = false,
  rightAction,
  className,
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-14 items-center justify-between px-4",
        transparent
          ? "bg-transparent"
          : "border-b border-border bg-background/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        )}
      </div>
      {rightAction && <div>{rightAction}</div>}
    </header>
  );
}
