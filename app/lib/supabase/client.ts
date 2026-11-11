import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { readSupabaseRuntimeEnv } from "@/app/lib/supabase/env";
import type { Database } from "@/app/lib/supabase/database.types";

let client: SupabaseClient<Database> | null | undefined;

/**
 * Returns a configured client only when both public variables exist.
 * Calling this function does not execute a query; future repository adapters
 * remain responsible for making explicit remote calls.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  if (client !== undefined) return client;

  const { anonKey, url } = readSupabaseRuntimeEnv();
  if (!url || !anonKey) {
    client = null;
    return client;
  }

  client = createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  return client;
}
