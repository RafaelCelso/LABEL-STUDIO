# Implementation Plan: Landing Page Complete

## Overview

Expansão de `src/components/landing-page.tsx` para uma landing page completa com 8 seções. Os sub-componentes ficam em `src/components/landing/`. Sem PBT — UI estática, testes são example-based e opcionais.

## Tasks

- [x] 1. Criar utilitários compartilhados e estrutura base
  - Criar `src/components/landing/scroll-reveal.tsx` — wrapper de animação de entrada com `useInView` + `motion.div`
  - Criar `src/components/landing/section-wrapper.tsx` — wrapper com `id` de âncora, padding e `className`
  - Mover `SidebarLogoHex` e `sharedStyles` (glass-button CSS) para `src/components/landing/shared.tsx` e exportar
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 2. Implementar Navbar
  - [x] 2.1 Criar `src/components/landing/navbar.tsx`
    - Estado `scrolled` com `useEffect` + `window.scrollY > 80`
    - Logo + nome à esquerda, links âncora no centro (`#features`, `#how-it-works`, `#pricing`), botões "Entrar" e "Criar conta" à direita
    - Estilo `auth-frost-panel` + `backdrop-filter`, opacidade progressiva via `scrolled`
    - Responsivo: links colapsados em mobile
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]\* 2.2 Escrever testes unitários para Navbar
    - Renderiza links âncora, botões auth, classe de opacidade quando `scrolled=true`, navegação correta
    - _Requirements: 8.1, 8.4, 8.5_

- [x] 3. Implementar HeroSection
  - [x] 3.1 Criar `src/components/landing/hero-section.tsx`
    - `AuthGradientBackground idPrefix="hero"` como fundo
    - Logo SVG, heading `font-serif`, subtítulo, botões CTA (`auth-cta-glow` + `GlassButton`)
    - `ProductPreview` — painel `auth-frost-panel` com mockup SVG/CSS puro
    - Animações escalonadas com `framer-motion` (delays 0.1s–0.7s)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [ ]\* 3.2 Escrever testes unitários para HeroSection
    - Logo, heading, subtítulo, classes dos botões, navegação, preview dentro de `auth-frost-panel`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [x] 4. Implementar FeaturesSection
  - [x] 4.1 Criar `src/components/landing/features-section.tsx`
    - Constante `FEATURES` com 6 itens (criação de rótulos, gestão de projetos, importação de dados, preview em tempo real, conformidade regulatória, exportação profissional)
    - Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    - Cards com `auth-frost-panel` ou `liquid-glass`, cada um com ícone, título e descrição
    - Título de seção `font-serif` + subtítulo acima do grid
    - `ScrollReveal` por card com delay escalonado
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [ ]\* 4.2 Escrever testes unitários para FeaturesSection
    - 6 cards, ícone/título/descrição em cada, classes de grid e glassmorphism, título e subtítulo
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

- [x] 5. Implementar HowItWorksSection
  - [x] 5.1 Criar `src/components/landing/how-it-works-section.tsx`
    - Constante `STEPS` com 4 etapas (número, título, descrição, ícone)
    - Layout horizontal em desktop com linha conectora, vertical em mobile
    - Título de seção `font-serif` acima das etapas
    - `ScrollReveal` sequencial com delay de 0.15s entre etapas
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [ ]\* 5.2 Escrever testes unitários para HowItWorksSection
    - 4 etapas, número/título/descrição/ícone em cada, elemento conector, título `font-serif`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 6. Implementar TestimonialsSection
  - [x] 6.1 Criar `src/components/landing/testimonials-section.tsx`
    - Constante `TESTIMONIALS` com 3+ depoimentos (quote, name, role, initials)
    - Grid `grid-cols-1 lg:grid-cols-3`, cards com `auth-frost-panel` ou `liquid-glass`
    - Avatar placeholder com iniciais, título de seção `font-serif`
    - `ScrollReveal` nos cards
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [ ]\* 6.2 Escrever testes unitários para TestimonialsSection
    - 3+ cards, quote/nome/cargo/avatar em cada, classes de glassmorphism, grid responsivo
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 7. Checkpoint — Garantir que os componentes anteriores compilam sem erros
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 8. Implementar PricingSection
  - [x] 8.1 Criar `src/components/landing/pricing-section.tsx`
    - Constante `PLANS` com 3 planos: Gratuito, Pro (`highlighted: true`), Enterprise
    - Card Pro com `auth-frost-panel-strong` + badge "Recomendado"; demais com `auth-frost-panel`
    - Cada card: nome, preço, lista de features, botão CTA → `/auth/sign-up`
    - Título `font-serif` + subtítulo acima dos cards
    - `ScrollReveal` nos cards
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [ ]\* 8.2 Escrever testes unitários para PricingSection
    - 3 planos, classes corretas por plano, badge "Recomendado" no Pro, navegação do CTA, título/subtítulo
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Implementar FinalCTASection e Footer
  - [x] 9.1 Criar `src/components/landing/final-cta-section.tsx`
    - `AuthGradientBackground idPrefix="cta"`, headline `font-serif`, subtítulo, botão "Começar agora" com `auth-cta-glow` → `/auth/sign-up`
    - `ScrollReveal` de entrada
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [x] 9.2 Criar `src/components/landing/footer.tsx`
    - Constante `LINK_GROUPS` com 3 grupos: Produto, Empresa, Legal
    - Logo + nome à esquerda, copyright com ano atual
    - Responsivo: coluna única em mobile, múltiplas colunas em desktop
    - Estilo `liquid-glass` ou `auth-frost-panel`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  - [ ]\* 9.3 Escrever testes unitários para FinalCTASection e Footer
    - FinalCTA: headline, subtítulo, botão com classe e navegação correta
    - Footer: logo, 3 grupos de links, copyright com ano, classe de glassmorphism
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4_

- [x] 10. Compor LandingPage e integrar todos os sub-componentes
  - [x] 10.1 Refatorar `src/components/landing-page.tsx`
    - Importar e compor: `Navbar`, `HeroSection`, `FeaturesSection`, `HowItWorksSection`, `TestimonialsSection`, `PricingSection`, `FinalCTASection`, `Footer`
    - Remover código inline que foi movido para `landing/shared.tsx`
    - Adicionar `scroll-behavior: smooth` via `<style>` ou confirmar que está em `globals.css`
    - _Requirements: 8.3, 9.1, 9.2, 9.3, 9.4, 9.5_
  - [ ]\* 10.2 Escrever testes de smoke/integração para LandingPage
    - Todas as seções renderizam sem erro, ausência de IDs SVG duplicados (`hero` vs `cta`)
    - _Requirements: 9.1, 9.2, 9.3_

- [x] 11. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- `ScrollReveal` e `SectionWrapper` são utilitários reutilizados em todas as seções
- Sem PBT — UI estática confirmada no design doc
