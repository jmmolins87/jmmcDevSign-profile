/* SPEC 10 — Refresco de sesión Supabase en el proxy de Next.js.
   Se ejecuta antes de cada request: lee las cookies, refresca el token
   si caducó y escribe las cookies actualizadas en la respuesta. */

import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    /* Sin credenciales no hay sesión que refrescar: la request sigue su curso. */
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  /* Refresca la sesión (no lanza aunque el usuario no esté autenticado). */
  await supabase.auth.getUser();

  return response;
}
