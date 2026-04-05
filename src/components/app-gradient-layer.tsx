"use client";

import { AuthGradientBackground } from "@/components/ui/auth-gradient-background";
import { cn } from "@/lib/utils";

/** Camada de fundo animada compartilhada (auth / início / importador / editor). */
export function AppGradientLayer({
  idPrefix,
  className,
}: {
  idPrefix: string;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      aria-hidden
    >
      <AuthGradientBackground idPrefix={idPrefix} className="h-full w-full" />
    </div>
  );
}
