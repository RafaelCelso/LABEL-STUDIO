"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SidebarLogoHex } from "@/components/landing/shared";

function ProductPreview() {
  return (
    <div className="auth-frost-panel w-full max-w-2xl mx-auto p-3 sm:p-6">
      {/* Mockup header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-foreground/10">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60 shrink-0" />
        <div className="w-2.5 h-2.5 rounded-full bg-chart-2/60 shrink-0" />
        <div className="w-2.5 h-2.5 rounded-full bg-chart-1/60 shrink-0" />
        <span className="ml-1 text-xs text-muted-foreground font-mono truncate">
          LabelStudio Elite — Rótulo Cerveja Artesanal
        </span>
      </div>

      {/* Toolbar mockup */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {["Produto", "Ingredientes", "Nutrição", "Exportar"].map((tab) => (
          <div
            key={tab}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tab === "Produto"
                ? "bg-primary/15 text-primary border border-primary/25"
                : "text-muted-foreground border border-foreground/10"
            }`}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Fields mockup */}
      <div className="space-y-2">
        {[
          { label: "Nome", value: "IPA Tropical 500ml", width: "w-3/4" },
          {
            label: "Fabricante",
            value: "Cervejaria Artesanal Ltda.",
            width: "w-2/3",
          },
          { label: "Registro", value: "D.I.E. 12345/SP", width: "w-1/2" },
          {
            label: "Validade",
            value: "12 meses após fabricação",
            width: "w-3/5",
          },
        ].map((field) => (
          <div key={field.label} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16 sm:w-28 shrink-0 truncate">
              {field.label}
            </span>
            <div
              className={`h-6 ${field.width} rounded bg-foreground/6 flex items-center px-2 min-w-0`}
            >
              <span className="text-xs text-foreground/70 truncate">
                {field.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Preview strip */}
      <div className="mt-3 pt-3 border-t border-foreground/10 flex items-center gap-3">
        <div className="w-10 h-14 sm:w-12 sm:h-16 rounded-md bg-gradient-to-br from-primary/20 to-chart-3/20 border border-foreground/10 flex items-center justify-center shrink-0">
          <SidebarLogoHex className="w-5 h-5 sm:w-6 sm:h-6 text-primary/60" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="h-2 w-3/4 rounded bg-foreground/10" />
          <div className="h-2 w-1/2 rounded bg-foreground/8" />
          <div className="h-2 w-2/3 rounded bg-foreground/6" />
        </div>
        <div className="text-xs text-muted-foreground border border-foreground/10 rounded px-2 py-1 shrink-0">
          Preview
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-20 sm:pt-24 pb-12 w-full">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto gap-8">
        {/* Logo + heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
          className="flex flex-col items-center gap-4"
        >
          <SidebarLogoHex className="w-14 h-14 text-primary" />
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            LabelStudio Elite
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.25 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Crie e gerencie rótulos de produtos com precisão, inteligência e
          design profissional. Do rascunho à conformidade regulatória em
          minutos.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center"
        >
          {/* Primary CTA */}
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="auth-cta-glow bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full px-8 py-3 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
          >
            Criar conta
          </button>

          {/* Secondary CTA — glass button pattern */}
          <div className="glass-button-wrap overflow-hidden rounded-full">
            <div className="glass-button-shadow" />
            <button
              onClick={() => router.push("/auth/sign-in")}
              className="glass-button relative rounded-full px-8 py-3 text-sm font-semibold"
            >
              <span className="glass-button-text relative z-10">Entrar</span>
            </button>
          </div>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.55 }}
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.7 }}
          >
            <ProductPreview />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
