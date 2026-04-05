"use client";

import { AuthGradientBackground } from "@/components/ui/auth-gradient-background";
import { cn } from "@/lib/utils";

/** Camada de fundo animada compartilhada (auth / início / importador / editor). */
export function AppGradientLayer({
  idPrefix,
  className,
  fixed = false,
}: {
  idPrefix: string;
  className?: string;
  fixed?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none z-0",
        fixed ? "fixed inset-0" : "absolute inset-0",
        className,
      )}
      aria-hidden
    >
      <AuthGradientBackground idPrefix={idPrefix} className="h-full w-full" />
    </div>
  );
}
