import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { AdministrationNavLink } from "@/app/[locale]/_components/administration-nav-link";
import { hasSupabaseSessionCookie } from "@/app/lib/supabase/auth-cookie";
import { readSupabaseRuntimeEnv } from "@/app/lib/supabase/env";
import { getEditorialAccess } from "@/app/lib/supabase/session";

const showAdminNavigation = cache(async () => {
  const { url, publishableKey } = readSupabaseRuntimeEnv();
  if (!url || !publishableKey || !hasSupabaseSessionCookie(url, (await cookies()).getAll())) return false;

  const access = await getEditorialAccess();
  return access.status === "active" && access.role === "admin";
});

export async function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  if (!await showAdminNavigation()) return null;
  const link = <AdministrationNavLink mobile={mobile} />;
  return mobile ? <li>{link}</li> : link;
}
