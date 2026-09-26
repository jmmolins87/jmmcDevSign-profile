/* SPEC 03 — Cliente Supabase perezoso con singleton.
   Solo se construye al llamarlo (modo `supabase`); en modo `mock`
   nunca se toca. Si falta env, falla en claro. */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Copia .env.example a .env.local y rellena los valores."
    );
  }
  cached ??= createClient(url, key);
  return cached;
}
