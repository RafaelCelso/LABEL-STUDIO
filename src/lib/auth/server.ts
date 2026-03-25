import { createNeonAuth, type NeonAuth } from '@neondatabase/auth/next/server';

export type { NeonAuth };

let cached: NeonAuth | null = null;

/**
 * Neon Auth valida `cookies.secret` ao criar a instância. Durante `next build`
 * (ex.: Vercel sem env vars) os módulos da API/proxy ainda são carregados —
 * por isso a criação fica lazy e só ocorre em runtime quando algo usa `auth`.
 */
export function getNeonAuth(): NeonAuth {
  if (cached) return cached;

  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;

  if (!baseUrl?.trim() || !secret?.trim()) {
    throw new Error(
      'Neon Auth: defina NEON_AUTH_BASE_URL e NEON_AUTH_COOKIE_SECRET (ex.: em Vercel → Settings → Environment Variables).',
    );
  }

  cached = createNeonAuth({
    baseUrl,
    cookies: {
      secret,
    },
  });

  return cached;
}

function neonAuthProxy(): NeonAuth {
  return new Proxy({} as NeonAuth, {
    get(_target, prop, receiver) {
      const instance = getNeonAuth();
      const value = Reflect.get(instance, prop, receiver);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const auth: NeonAuth = neonAuthProxy();
