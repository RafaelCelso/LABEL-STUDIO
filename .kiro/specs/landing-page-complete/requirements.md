# Requirements Document

## Introduction

Expansão da landing page pública do LabelStudio Elite (`src/components/landing-page.tsx`) de uma página de autenticação simples para uma landing page completa de produto. A página atual contém apenas hero section com logo, heading, subtítulo e dois botões de auth. A versão expandida deve incluir todas as seções típicas de uma landing page de sucesso: hero, features, how it works, social proof (testimonials), pricing, CTA final e footer — mantendo total consistência com o design system existente (glassmorphism, tokens oklch, framer-motion, Tailwind).

O produto é o LabelStudio Elite: uma ferramenta para criar e gerenciar rótulos de produtos com precisão, inteligência e design profissional.

## Glossary

- **Landing_Page**: Componente React `src/components/landing-page.tsx`, renderizado na rota `/` para visitantes não autenticados.
- **Design_System**: Conjunto de classes CSS e tokens do projeto — `auth-frost-panel`, `auth-frost-panel-strong`, `auth-cta-glow`, `glass-button`, `liquid-glass`, `AuthGradientBackground`, tokens oklch, fontes serif para headings.
- **Hero_Section**: Primeira seção visível da Landing_Page, com logo, headline principal, subtítulo e CTAs de autenticação.
- **Features_Section**: Seção que apresenta as funcionalidades principais do produto em cards visuais.
- **HowItWorks_Section**: Seção que explica o fluxo de uso do produto em etapas numeradas.
- **Testimonials_Section**: Seção com depoimentos de usuários fictícios (social proof).
- **Pricing_Section**: Seção com planos e preços do produto.
- **FinalCTA_Section**: Seção de chamada para ação final antes do footer.
- **Footer**: Rodapé com links institucionais, copyright e informações de contato.
- **GlassButton**: Padrão de botão com efeito glassmorphism já implementado no projeto.
- **AuthGradientBackground**: Componente de fundo animado com gradientes SVG (`src/components/ui/auth-gradient-background.tsx`).
- **Auth_Routes**: Rotas de autenticação — `/auth/sign-in` e `/auth/sign-up`.
- **Scroll_Animation**: Animação de entrada de elementos ao entrar no viewport, implementada com `framer-motion`.

## Requirements

### Requirement 1: Hero Section expandida

**User Story:** Como visitante, quero ver uma hero section impactante que comunique claramente o valor do produto, para que eu entenda imediatamente o que é o LabelStudio Elite e seja motivado a criar uma conta.

#### Acceptance Criteria

1. THE Hero_Section SHALL exibir o logo SVG hexagonal, o nome "LabelStudio Elite" em fonte serif, e um subtítulo descritivo do produto.
2. THE Hero_Section SHALL exibir dois botões de CTA: "Criar conta" (primário, com `auth-cta-glow`) e "Entrar" (secundário, com `GlassButton`).
3. WHEN o visitante clica em "Criar conta", THE Landing_Page SHALL redirecionar para `/auth/sign-up`.
4. WHEN o visitante clica em "Entrar", THE Landing_Page SHALL redirecionar para `/auth/sign-in`.
5. THE Hero_Section SHALL exibir o `AuthGradientBackground` como fundo animado de tela cheia.
6. THE Hero_Section SHALL exibir um elemento visual de preview do produto (mockup ou ilustração estilizada) abaixo dos CTAs, dentro de um painel `auth-frost-panel`.
7. THE Hero_Section SHALL aplicar animações de entrada escalonadas com `framer-motion` em todos os elementos, com delays progressivos de 0.1s a 0.7s.

### Requirement 2: Features Section

**User Story:** Como visitante, quero ver as funcionalidades principais do produto apresentadas de forma clara e visual, para que eu entenda o que o LabelStudio Elite oferece antes de me cadastrar.

#### Acceptance Criteria

1. THE Features_Section SHALL exibir no mínimo 6 cards de funcionalidades, cada um com ícone, título e descrição curta.
2. THE Features_Section SHALL organizar os cards em grid responsivo: 1 coluna em mobile, 2 colunas em tablet, 3 colunas em desktop.
3. THE Features_Section SHALL estilizar cada card com a classe `auth-frost-panel` ou `liquid-glass` do Design_System.
4. THE Features_Section SHALL exibir um título de seção em fonte serif e um subtítulo descritivo acima do grid de cards.
5. WHEN um card entra no viewport durante o scroll, THE Features_Section SHALL aplicar Scroll_Animation de entrada com `framer-motion`.
6. THE Features_Section SHALL incluir as seguintes funcionalidades como conteúdo: criação de rótulos, gestão de projetos, importação de dados, preview em tempo real, conformidade regulatória e exportação profissional.

### Requirement 3: How It Works Section

**User Story:** Como visitante, quero entender como usar o produto em poucos passos, para que eu saiba o que esperar após criar minha conta.

#### Acceptance Criteria

1. THE HowItWorks_Section SHALL exibir exatamente 4 etapas numeradas do fluxo de uso do produto.
2. THE HowItWorks_Section SHALL apresentar cada etapa com: número de ordem visualmente destacado, título, descrição e ícone ou ilustração.
3. THE HowItWorks_Section SHALL conectar as etapas visualmente com uma linha ou seta indicando progressão.
4. THE HowItWorks_Section SHALL exibir um título de seção em fonte serif acima das etapas.
5. WHEN as etapas entram no viewport, THE HowItWorks_Section SHALL aplicar Scroll_Animation sequencial com `framer-motion`, com delay de 0.15s entre cada etapa.

### Requirement 4: Testimonials Section

**User Story:** Como visitante, quero ver depoimentos de outros usuários, para que eu tenha confiança no produto antes de criar minha conta.

#### Acceptance Criteria

1. THE Testimonials_Section SHALL exibir no mínimo 3 depoimentos de usuários fictícios, cada um com: texto do depoimento, nome do usuário, cargo/empresa e avatar placeholder.
2. THE Testimonials_Section SHALL estilizar cada depoimento em card com `auth-frost-panel` ou `liquid-glass`.
3. THE Testimonials_Section SHALL organizar os cards em grid responsivo: 1 coluna em mobile, 3 colunas em desktop.
4. THE Testimonials_Section SHALL exibir um título de seção em fonte serif acima dos cards.
5. WHEN os cards entram no viewport, THE Testimonials_Section SHALL aplicar Scroll_Animation com `framer-motion`.

### Requirement 5: Pricing Section

**User Story:** Como visitante, quero ver os planos e preços disponíveis, para que eu possa escolher o plano adequado antes de criar minha conta.

#### Acceptance Criteria

1. THE Pricing_Section SHALL exibir exatamente 3 planos: Gratuito, Pro e Enterprise.
2. THE Pricing_Section SHALL apresentar cada plano com: nome, preço mensal, lista de funcionalidades incluídas e botão de CTA.
3. THE Pricing_Section SHALL destacar visualmente o plano Pro como recomendado, usando borda ou badge diferenciado com tokens do Design_System.
4. WHEN o visitante clica no CTA de qualquer plano, THE Pricing_Section SHALL redirecionar para `/auth/sign-up`.
5. THE Pricing_Section SHALL estilizar os cards de plano com `auth-frost-panel-strong` para o plano destacado e `auth-frost-panel` para os demais.
6. THE Pricing_Section SHALL exibir um título de seção em fonte serif e subtítulo acima dos cards.
7. WHEN os cards de plano entram no viewport, THE Pricing_Section SHALL aplicar Scroll_Animation com `framer-motion`.

### Requirement 6: Final CTA Section

**User Story:** Como visitante que chegou ao final da página, quero ver uma chamada para ação clara e motivadora, para que eu seja incentivado a criar minha conta após conhecer o produto.

#### Acceptance Criteria

1. THE FinalCTA_Section SHALL exibir um headline em fonte serif, um subtítulo e um botão "Começar agora" com estilo `auth-cta-glow`.
2. WHEN o visitante clica em "Começar agora", THE FinalCTA_Section SHALL redirecionar para `/auth/sign-up`.
3. THE FinalCTA_Section SHALL usar o `AuthGradientBackground` ou gradiente similar como fundo da seção.
4. THE FinalCTA_Section SHALL aplicar Scroll_Animation de entrada com `framer-motion`.

### Requirement 7: Footer

**User Story:** Como visitante, quero ver um rodapé com informações institucionais e links úteis, para que eu possa encontrar informações adicionais sobre o produto e a empresa.

#### Acceptance Criteria

1. THE Footer SHALL exibir o logo e nome do produto no lado esquerdo.
2. THE Footer SHALL exibir no mínimo 3 grupos de links: Produto (funcionalidades, preços), Empresa (sobre, contato) e Legal (termos, privacidade).
3. THE Footer SHALL exibir o texto de copyright com o ano atual.
4. THE Footer SHALL usar `liquid-glass` ou `auth-frost-panel` como estilo de fundo.
5. THE Footer SHALL ser responsivo: links em coluna única em mobile, múltiplas colunas em desktop.

### Requirement 8: Navegação e scroll suave

**User Story:** Como visitante, quero poder navegar entre as seções da landing page de forma fluida, para que a experiência de explorar o produto seja agradável.

#### Acceptance Criteria

1. THE Landing_Page SHALL exibir uma barra de navegação fixa no topo com links âncora para as seções principais (Features, Como funciona, Preços).
2. THE Landing_Page SHALL estilizar a navbar com `auth-frost-panel` e `backdrop-filter` para efeito glassmorphism.
3. WHEN o visitante clica em um link da navbar, THE Landing_Page SHALL rolar suavemente até a seção correspondente usando `scroll-behavior: smooth`.
4. THE Landing_Page SHALL exibir na navbar os botões "Entrar" e "Criar conta" no lado direito.
5. WHILE o visitante rola a página para baixo além de 80px, THE Landing_Page SHALL aumentar a opacidade do fundo da navbar para melhorar a legibilidade.

### Requirement 9: Consistência com o Design System

**User Story:** Como membro da equipe, quero que todas as seções da landing page usem o mesmo design system do restante do projeto, para que a experiência visual seja coerente e profissional.

#### Acceptance Criteria

1. THE Landing_Page SHALL usar exclusivamente tokens de cor oklch definidos em `globals.css` (`--primary`, `--foreground`, `--background`, `--muted-foreground`, etc.), sem cores hardcoded.
2. THE Landing_Page SHALL usar as classes de glassmorphism do projeto (`auth-frost-panel`, `auth-frost-panel-strong`, `liquid-glass` ou equivalentes) para todos os painéis e cards.
3. THE Landing_Page SHALL ser responsiva, adaptando o layout para telas mobile (mínimo 320px), tablet (mínimo 768px) e desktop (mínimo 1024px).
4. IF o sistema operacional do usuário estiver configurado para modo escuro, THEN THE Landing_Page SHALL aplicar as variáveis CSS da classe `.dark` automaticamente via Tailwind.
5. THE Landing_Page SHALL usar `framer-motion` para todas as animações, sem CSS animations customizadas adicionais além das já existentes no Design_System.
