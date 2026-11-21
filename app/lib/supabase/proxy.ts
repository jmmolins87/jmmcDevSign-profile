import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { hasSupabaseSessionCookie } from "@/app/lib/supabase/auth-cookie";
import type { Database } from "@/app/lib/supabase/database.types";
import { readSupabaseRuntimeEnv } from "@/app/lib/supabase/env";

export async function refreshSupabaseSession(request: NextRequest, rewrite?: URL) {
  const respond = () => rewrite ? NextResponse.rewrite(rewrite, { request }) : NextResponse.next({ request });
  let response = respond();
  const { url, publishableKey, siteUrl } = readSupabaseRuntimeEnv();
  if (!url || !publishableKey) return response;

  if (!hasSupabaseSessionCookie(url, request.cookies.getAll())) return response;

  const client = createServerClient<Database>(url, publishableKey, {
    cookieOptions: { secure: new URL(siteUrl).protocol === "https:" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = respond();
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        for (const [name, value] of Object.entries(headers ?? {})) response.headers.set(name, value);
      },
    },
  });

  const { error } = await client.auth.getClaims();
  if (error && (error.status ?? 0) >= 500) console.warn("[supabase-auth] session refresh unavailable");
  return response;
}
