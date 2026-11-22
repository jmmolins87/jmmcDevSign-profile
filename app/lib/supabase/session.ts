import "server-only";

import { isAuthRetryableFetchError, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { isUserRole, type UserRole } from "@/app/[locale]/auth/roles";
import type { Database } from "@/app/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";

export type VerifiedIdentity =
  | { status: "anonymous" }
  | { status: "unavailable" }
  | { status: "verified"; userId: string; email: string; sessionId: string | null };

export type EditorialAccess =
  | { status: "anonymous" }
  | { status: "unavailable" }
  | { status: "inactive"; userId: string; email: string; role: UserRole | null }
  | { status: "active"; userId: string; email: string; role: UserRole };

export async function getVerifiedIdentity(client: SupabaseClient<Database>): Promise<VerifiedIdentity> {
  const { data, error } = await client.auth.getClaims();
  if (error && (isAuthRetryableFetchError(error) || (error.status ?? 0) >= 500)) {
    return { status: "unavailable" };
  }
  const claims = data?.claims;
  if (error || typeof claims?.sub !== "string" || claims.role !== "authenticated" || claims.is_anonymous === true) {
    return { status: "anonymous" };
  }
  return {
    status: "verified",
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    sessionId: typeof claims.session_id === "string" ? claims.session_id : null,
  };
}

async function checkEditorialAccess(client: SupabaseClient<Database>): Promise<EditorialAccess> {
  const verified = await getVerifiedIdentity(client);
  if (verified.status !== "verified") return verified;

  const { data, error } = await client
    .from("memberships")
    .select("role,status")
    .eq("user_id", verified.userId)
    .maybeSingle();
  if (error) return { status: "unavailable" };

  const { userId, email } = verified;
  const role = isUserRole(data?.role) ? data.role : null;
  return data?.status === "active" && role
    ? { status: "active", userId, email, role }
    : { status: "inactive", userId, email, role };
}

const getRequestAccess = cache(async () => checkEditorialAccess(await createServerSupabaseClient()));

export async function getEditorialAccess(client?: SupabaseClient<Database>) {
  return client ? checkEditorialAccess(client) : getRequestAccess();
}
