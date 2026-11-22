"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/app/lib/supabase/database.types";
import { requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";

export function createBrowserSupabaseClient() {
  const { url, publishableKey, siteUrl } = requireSupabaseRuntimeEnv();
  return createBrowserClient<Database>(url, publishableKey, {
    cookieOptions: { secure: new URL(siteUrl).protocol === "https:" },
  });
}
