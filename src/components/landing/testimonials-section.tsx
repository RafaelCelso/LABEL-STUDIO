"use client";

import { SectionWrapper } from "./section-wrapper";
import { ScrollReveal } from "./scroll-reveal";

const TESTIMONIALS = [
  {
    quote:
      "O LabelStudio Elite transformou nosso processo de rotulagem. Reduzimos o tempo de criação em 70% e eliminamos erros de conformidade.",
    name: "Ana Souza",
    role: "Gerente de Qualidade, Cervejaria Artesanal",
    initials: "AS",
  },
  {
    quote:
      "Finalmente uma ferramenta que entende as necessidades do setor alimentício. A validação automática de normas ANVISA é um diferencial enorme.",
    name: "Carlos Mendes",
    role: "Diretor de Operações, Alimentos Naturais Ltda.",
    initials: "CM",
  },
  {
    quote:
      "Usamos o LabelStudio Elite para gerenciar mais de 200 rótulos diferentes. A organização por projetos e o preview em tempo real são incríveis.",
    name: "Fernanda Lima",
    role: "Coordenadora de Produto, Distribuidora Nacional",
    initials: "FL",
  },
];

export function TestimonialsSection() {
  return (
    <SectionWrapper id="testimonials">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Depoimentos
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold">
            O que nossos clientes dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal key={testimonial.name} delay={0.1 * index}>
              <div className="auth-frost-panel p-6 flex flex-col gap-4 h-full">
                <p className="italic text-foreground/80 flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
