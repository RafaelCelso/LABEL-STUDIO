"use client";

import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export function FinalCtaSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden py-24 px-4">
      {/* Dark nebula accent for this section */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.22 0.05 265 / 0.35) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 20% 80%, oklch(0.20 0.04 300 / 0.20) 0%, transparent 60%)
          `,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        <ScrollReveal>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Pronto para criar rótulos profissionais?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece gratuitamente hoje e transforme seu processo de rotulagem.
          </p>
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="auth-cta-glow bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full px-8 py-3 font-semibold cursor-pointer transition-transform hover:scale-105"
          >
            Começar agora
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
