"use client";

/**
 * Background da landing page — coerente com o shader do hero.
 * Fundo preto profundo com glows nas cores do shader (R/G/B vibrantes)
 * e partículas sutis que imitam os anéis de luz do efeito.
 */
export function LandingBackground() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden w-full h-full"
      aria-hidden
    >
      {/* Base preta */}
      <div className="absolute inset-0 bg-black" />

      {/* Glows inspirados nas cores do shader (vermelho, verde, azul) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 15% 30%, rgba(180, 30, 80, 0.12) 0%, transparent 65%),
            radial-gradient(ellipse 50% 45% at 85% 20%, rgba(20, 80, 180, 0.10) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 50% 70%, rgba(20, 140, 80, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 35% at 80% 80%, rgba(160, 40, 120, 0.09) 0%, transparent 55%),
            radial-gradient(ellipse 35% 30% at 10% 85%, rgba(30, 60, 160, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Vignette para profundidade */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 110% at 50% 50%, transparent 35%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
}
