import { getNeonAuth, type NeonAuth } from '@/lib/auth/server';

let cachedHandlers: ReturnType<NeonAuth['handler']> | undefined;

function handlers() {
  if (!cachedHandlers) {
    cachedHandlers = getNeonAuth().handler();
  }
  return cachedHandlers;
}

export function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  return handlers().GET(request, context);
}

export function POST(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  return handlers().POST(request, context);
}
