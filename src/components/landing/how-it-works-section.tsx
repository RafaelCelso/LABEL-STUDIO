"use client";

import { SectionWrapper } from "@/components/landing/section-wrapper";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const STEPS = [
  {
    number: 1,
    title: "Crie seu projeto",
    description:
      "Inicie um novo projeto de rotulagem e configure as informações básicas do produto.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    number: 2,
    title: "Preencha os dados",
    description:
      "Insira ingredientes, informações nutricionais, fabricante e dados regulatórios.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <rect x="9" y="2" width="6" height="4" rx="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    number: 3,
    title: "Visualize em tempo real",
    description:
      "Acompanhe o preview do rótulo enquanto edita e ajuste o layout conforme necessário.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    number: 4,
    title: "Exporte e imprima",
    description:
      "Exporte o rótulo finalizado em alta resolução pronto para impressão profissional.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <SectionWrapper id="how-it-works" className="max-w-6xl mx-auto">
      <ScrollReveal className="text-center mb-14">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
          Como funciona
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Do projeto ao rótulo em 4 passos
        </h2>
      </ScrollReveal>

      <div className="flex flex-col items-center md:flex-row md:items-center gap-0">
        {STEPS.map((step, index) => (
          <div
            key={step.number}
            className="flex flex-col md:flex-row md:items-center flex-1 w-full md:w-auto"
          >
            <ScrollReveal
              delay={0.15 * index}
              className="flex flex-col items-center text-center gap-4 w-full px-2 sm:px-4 py-6 md:py-0 md:flex-1"
            >
              {/* Step number circle */}
              <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-primary leading-none">
                  {step.number}
                </span>
                {/* Icon badge */}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground">
                  {step.icon}
                </div>
              </div>

              <div className="flex flex-col gap-1.5 max-w-[220px]">
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>

            {/* Connecting line — desktop only, not after last step */}
            {index < STEPS.length - 1 && (
              <div className="hidden md:block h-px bg-foreground/15 w-8 lg:w-12 shrink-0 mt-[-2rem]" />
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
