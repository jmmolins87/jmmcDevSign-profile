/* SPEC 10 — Proxy raíz (Next.js 16: el antiguo middleware.ts se llama proxy.ts).
   Paso 5 (infra i18n): 1) refresca la sesión Supabase en cada request de
   página; 2) sirve /en/* con rewrite a la ruta interna (sin prefijo) y el
   header `x-locale` que consume lib/i18n/server.ts. */

import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  /* El locale viaja como header de request hacia RSC (default: es). */
  request.headers.set("x-locale", isEn ? "en" : "es");

  const sessionResponse = await updateSession(request);

  if (!isEn) return sessionResponse;

  const stripped = pathname === "/en" ? "/" : pathname.slice("/en".length);
  const response = NextResponse.rewrite(new URL(stripped + search, request.url), {
    request: { headers: request.headers },
  });

  /* Conserva las cookies que updateSession pudo fijar (refresh de sesión). */
  for (const cookie of sessionResponse.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Excluye estáticos de Next y ficheros de /public.
     * Todas las rutas de página pasan por el proxy.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2?)$).*)",
  ],
};
