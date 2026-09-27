/* SPEC 10 — Cliente Supabase para componentes de navegador.
   Usa cookies (no localStorage) para que la sesión sea visible en el
   proxy y en los Server Components. Singleton por pestaña. */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env.local y rellena los valores."
    );
  }
  cached = createBrowserClient(url, key);
  return cached;
}
