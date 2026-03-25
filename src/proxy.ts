import { auth } from '@/lib/auth/server';
import { NextResponse, type NextRequest } from 'next/server';

// Next.js 16 renamed middleware to proxy.
// The exported function must be named `proxy`.
const authMiddlewareFn = auth.middleware({
  loginUrl: '/auth/sign-in',
});

/** Header que identifica invocações de Server Action (App Router). */
const NEXT_ACTION_HEADER = 'next-action';

export function proxy(request: NextRequest) {
  // As Server Actions fazem POST na URL da página (ex.: `/`). Se o middleware de auth
  // redirecionar para HTML (login), o cliente espera `text/x-component` e falha com
  // "An unexpected response was received from the server."
  // As actions em `app/actions/*` já validam sessão com `auth.getSession()`.
  if (request.method === 'POST' && request.headers.has(NEXT_ACTION_HEADER)) {
    return NextResponse.next();
  }

  return authMiddlewareFn(request);
}

export const config = {
  matcher: [
    // App shell (início / Label Studio) — exige sessão no edge para evitar corrida com useAuthenticate no cliente
    '/',
    '/dashboard/:path*',
    '/account/:path*',
  ],
};
