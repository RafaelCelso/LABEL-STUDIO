"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SidebarLogoHex } from "@/components/landing/shared";
import { ShaderAnimation } from "@/components/ui/shader-animation";

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center w-full">
      {/* Shader background */}
      <div className="absolute inset-0 z-0">
        <ShaderAnimation />
      </div>

      {/* Fade para o fundo da landing abaixo */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, black)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto gap-8 pt-20 sm:pt-24 pb-12">
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
            className="cursor-pointer auth-cta-glow bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full px-8 py-3 text-sm font-semibold transition-transform hover:scale-105 active:scale-95"
          >
            Criar conta
          </button>

          {/* Secondary CTA — glass button pattern */}
          <div className="glass-button-wrap overflow-hidden rounded-full">
            <div className="glass-button-shadow" />
            <button
              onClick={() => router.push("/auth/sign-in")}
              className="cursor-pointer glass-button relative rounded-full px-8 py-3 text-sm font-semibold"
            >
              <span className="glass-button-text relative z-10">Entrar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
