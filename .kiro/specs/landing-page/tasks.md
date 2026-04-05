# Implementation Plan: Landing Page

## Overview

Substituir a rota `/` pelo Server Component da landing page pública, mover o editor para `/app` com proteção de rota, e criar o componente `LandingPage` com identidade visual consistente (glassmorphism, framer-motion, AuthGradientBackground).

## Tasks

- [x] 1. Mover o editor para a rota /app
  - Criar o diretório `src/app/app/` e mover o conteúdo de `src/app/page.tsx` para `src/app/app/page.tsx`
  - Adicionar proteção de rota no novo `src/app/app/page.tsx`: verificar sessão via `auth.api.getSession` (server-side) e redirecionar para `/auth/sign-in` se não autenticado
  - Remover o `useAuthenticate` do componente `LabelStudio` (a verificação passa a ser server-side)
  - _Requirements: 4.1_

- [x] 2. Criar o componente LandingPage
  - Criar `src/components/landing-page.tsx` como Client Component (`"use client"`)
  - Extrair `SidebarLogoHex` de `src/app/page.tsx` para dentro do componente (ou arquivo separado)
  - Renderizar `AuthGradientBackground` como camada de fundo (reutilizar de `src/components/ui/auth-gradient-background.tsx`)
  - Adicionar painel central com classe `auth-frost-panel-strong` contendo logo, heading (`font-serif font-light`) e subtítulo (`text-muted-foreground`)
  - Aplicar animações de entrada com `framer-motion` (`motion.div`) nos elementos principais, com delays escalonados
  - Usar exclusivamente tokens oklch de `globals.css` — sem cores hardcoded
  - Garantir layout responsivo (mínimo 320px mobile, 1024px desktop) com classes Tailwind
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4_

- [x] 3. Adicionar botões de autenticação ao LandingPage
  - Adicionar botão "Entrar" estilizado com `glass-button` / `glass-button-wrap` (mesmo padrão inline de `sign-in.tsx`)
  - Adicionar botão "Criar conta" com `auth-cta-glow` e gradiente `bg-gradient-to-br from-primary`
  - Implementar navegação via `useRouter` do Next.js: "Entrar" → `/auth/sign-in`, "Criar conta" → `/auth/sign-up`
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_

- [x] 4. Criar o novo src/app/page.tsx como Server Component
  - Substituir `src/app/page.tsx` por um Server Component assíncrono
  - Verificar sessão com `auth.api.getSession({ headers: await headers() })` de `src/lib/auth/server.ts`
  - Envolver em try/catch: em caso de erro, renderizar `<LandingPage />` (fail-open)
  - Se sessão válida: `redirect('/app')` via `next/navigation`
  - Se sem sessão: retornar `<LandingPage />`
  - _Requirements: 1.1, 4.1, 4.2_

- [x] 5. Checkpoint — Verificar integração e testes
  - Garantir que a rota `/` renderiza a landing page para visitantes não autenticados
  - Garantir que a rota `/` redireciona para `/app` para usuários autenticados
  - Garantir que a rota `/app` redireciona para `/auth/sign-in` para visitantes não autenticados
  - Garantir que não há erros de TypeScript (`getDiagnostics` nos arquivos modificados)
  - Ensure all tests pass, ask the user if questions arise.

  - [ ]\* 5.1 Escrever testes unitários para LandingPage
    - Testar presença do heading, botão "Entrar" e botão "Criar conta"
    - Testar navegação: clique em "Entrar" chama `router.push('/auth/sign-in')`
    - Testar navegação: clique em "Criar conta" chama `router.push('/auth/sign-up')`
    - _Requirements: 1.3, 2.1, 2.2, 3.1, 3.2_

  - [ ]\* 5.2 Escrever testes para o Server Component page.tsx
    - Testar que usuário autenticado é redirecionado para `/app`
    - Testar que visitante não autenticado recebe o componente `LandingPage`
    - Testar que exceção em `getSession` resulta em renderização da landing page (fail-open)
    - _Requirements: 4.1, 4.2_

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Sem PBT — feature é UI estática + redirecionamento condicional (confirmado no design)
- `GlassButton` e `sharedStyles` devem ser replicados inline no componente, sem criar dependência circular com `sign-in.tsx`
- O editor em `/app` deve manter toda a lógica atual de `LabelStudio` intacta
