# Requirements Document

## Introduction

Landing page pública que serve como página inicial (`/`) do projeto LabelStudio Elite. A página apresenta o produto ao visitante e oferece acesso direto às ações de autenticação: entrar em uma conta existente ou criar uma nova conta. O design deve ser consistente com o sistema visual já estabelecido no projeto (glassmorphism, liquid glass, framer-motion, fontes serif para headings, tokens oklch).

A página atual (`/`) é o editor completo, que requer autenticação. A landing page substituirá essa rota pública, redirecionando usuários autenticados diretamente para o editor.

## Glossary

- **Landing_Page**: Componente React da página inicial pública do projeto, renderizado na rota `/`.
- **Editor**: Aplicação principal de edição de labels, acessível após autenticação na rota `/`.
- **Auth_Routes**: Rotas de autenticação existentes — `/auth/sign-in` (login) e `/auth/sign-up` (criação de conta).
- **Design_System**: Conjunto de classes CSS e tokens do projeto: `auth-frost-panel`, `auth-frost-panel-strong`, `auth-cta-glow`, `glass-button`, `liquid-glass`, `AuthGradientBackground`, tokens oklch, fontes serif para headings.
- **GlassButton**: Componente de botão com efeito glassmorphism já implementado em `sign-in.tsx` e `sign-up.tsx`.
- **AuthGradientBackground**: Componente de fundo animado com gradientes SVG, usado nas telas de auth.
- **Authenticated_User**: Usuário com sessão ativa verificada pelo hook `useAuthenticate`.
- **Unauthenticated_User**: Visitante sem sessão ativa.

## Requirements

### Requirement 1: Página inicial pública com identidade visual

**User Story:** Como visitante, quero ver uma página inicial visualmente atraente que apresente o produto, para que eu entenda o que é o LabelStudio Elite antes de me cadastrar ou entrar.

#### Acceptance Criteria

1. THE Landing_Page SHALL renderizar na rota `/` como página pública acessível sem autenticação.
2. THE Landing_Page SHALL exibir o fundo animado `AuthGradientBackground` como camada de fundo, consistente com as telas de auth existentes.
3. THE Landing_Page SHALL exibir um heading principal com fonte serif (`font-serif font-light`) e o nome do produto.
4. THE Landing_Page SHALL exibir um subtítulo descritivo com classe `text-muted-foreground` abaixo do heading principal.
5. THE Landing_Page SHALL aplicar animações de entrada usando `framer-motion` (BlurFade ou motion.div) nos elementos principais, com delays escalonados.

### Requirement 2: Botão "Entrar"

**User Story:** Como visitante com conta existente, quero um botão "Entrar" visível na landing page, para que eu possa navegar diretamente para a tela de login.

#### Acceptance Criteria

1. THE Landing_Page SHALL exibir um botão com o texto "Entrar" visível na área principal da página.
2. WHEN o visitante clica no botão "Entrar", THE Landing_Page SHALL redirecionar para `/auth/sign-in`.
3. THE Landing_Page SHALL estilizar o botão "Entrar" usando o componente `GlassButton` ou classes equivalentes do Design_System (`glass-button`, `glass-button-wrap`).

### Requirement 3: Botão "Criar conta"

**User Story:** Como visitante sem conta, quero um botão "Criar conta" visível na landing page, para que eu possa navegar diretamente para a tela de cadastro.

#### Acceptance Criteria

1. THE Landing_Page SHALL exibir um botão com o texto "Criar conta" visível na área principal da página.
2. WHEN o visitante clica no botão "Criar conta", THE Landing_Page SHALL redirecionar para `/auth/sign-up`.
3. THE Landing_Page SHALL estilizar o botão "Criar conta" com destaque visual usando `auth-cta-glow` e gradiente `bg-gradient-to-br from-primary`, diferenciando-o visualmente do botão "Entrar".

### Requirement 4: Redirecionamento de usuário autenticado

**User Story:** Como usuário já autenticado, quero ser redirecionado automaticamente para o editor ao acessar a landing page, para que eu não precise navegar manualmente.

#### Acceptance Criteria

1. WHEN um Authenticated_User acessa a rota `/`, THE Landing_Page SHALL redirecionar para o Editor sem renderizar o conteúdo da landing page.
2. WHILE a verificação de sessão está em andamento, THE Landing_Page SHALL exibir um estado de carregamento neutro (sem flash de conteúdo da landing page).

### Requirement 5: Consistência com o Design System

**User Story:** Como membro da equipe, quero que a landing page use o mesmo design system do restante do projeto, para que a experiência visual seja coerente.

#### Acceptance Criteria

1. THE Landing_Page SHALL usar exclusivamente tokens de cor oklch definidos em `globals.css` (`--primary`, `--foreground`, `--background`, `--muted-foreground`, etc.), sem cores hardcoded.
2. THE Landing_Page SHALL usar as classes de glassmorphism do projeto (`auth-frost-panel`, `auth-frost-panel-strong`, `liquid-glass` ou equivalentes) para painéis e cards de conteúdo.
3. THE Landing_Page SHALL ser responsiva, adaptando o layout para telas mobile (mínimo 320px) e desktop (mínimo 1024px).
4. IF o sistema operacional do usuário estiver configurado para modo escuro, THEN THE Landing_Page SHALL aplicar as variáveis CSS da classe `.dark` automaticamente via Tailwind.
