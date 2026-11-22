import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import type { Database } from "@/app/lib/supabase/database.types";
import { requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";

export async function createServerSupabaseClient({ writeCookies = false } = {}) {
  await connection();
  const { url, publishableKey, siteUrl } = requireSupabaseRuntimeEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: { secure: new URL(siteUrl).protocol === "https:" },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        // Proxy persists refreshed cookies before Server Components render.
        if (!writeCookies) return;
        values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
