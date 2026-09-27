/* SPEC 10 — Proxy raíz (Next.js 16: el antiguo middleware.ts se llama proxy.ts).
   Refresca la sesión Supabase en cada request de página.
   El rewrite de locale /en/* se añade en el paso 5 (infra i18n). */

import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
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
