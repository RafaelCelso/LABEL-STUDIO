"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { ScrollReveal } from "./scroll-reveal";

interface Plan {
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
}

const PLANS: Plan[] = [
  {
    name: "Gratuito",
    price: "Grátis",
    period: undefined,
    features: [
      "Até 3 projetos",
      "5 rótulos por projeto",
      "Exportação em PNG",
      "Suporte por e-mail",
    ],
    highlighted: false,
    ctaLabel: "Começar grátis",
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "por mês",
    features: [
      "Projetos ilimitados",
      "Rótulos ilimitados",
      "Exportação em PDF e PNG",
      "Validação ANVISA/MAPA",
      "Preview em tempo real",
      "Suporte prioritário",
    ],
    highlighted: true,
    ctaLabel: "Assinar Pro",
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: undefined,
    features: [
      "Tudo do Pro",
      "Usuários ilimitados",
      "API de integração",
      "SLA garantido",
      "Gerente de conta dedicado",
      "Treinamento personalizado",
    ],
    highlighted: false,
    ctaLabel: "Falar com vendas",
  },
];

export function PricingSection() {
  const router = useRouter();

  return (
    <SectionWrapper id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Planos
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">
            Escolha o plano ideal para você
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Comece gratuitamente e escale conforme sua necessidade. Sem
            surpresas na fatura.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={0.1 * index}>
              <div
                className={`flex flex-col h-full p-5 sm:p-7 ${
                  plan.highlighted
                    ? "auth-frost-panel-strong"
                    : "auth-frost-panel"
                }`}
              >
                {plan.highlighted && (
                  <div className="mb-3">
                    <span className="bg-primary/15 text-primary border border-primary/25 rounded-full px-3 py-0.5 text-xs font-medium">
                      Recomendado
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold">{plan.name}</h3>

                <div className="mt-3 mb-1">
                  <span className="font-serif text-4xl font-semibold">
                    {plan.price}
                  </span>
                </div>

                {plan.period ? (
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.period}
                  </p>
                ) : (
                  <div className="mb-6 h-5" />
                )}

                <ul className="flex flex-col gap-2.5 flex-1 mb-8">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <Check className="size-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push("/auth/sign-up")}
                  className={`w-full py-2.5 text-sm font-medium transition-opacity hover:opacity-80 ${
                    plan.highlighted
                      ? "auth-cta-glow bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full"
                      : "auth-frost-panel rounded-full"
                  }`}
                >
                  {plan.ctaLabel}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
