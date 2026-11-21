import { NextResponse, type NextRequest } from "next/server";

import {
  createMembershipRequest,
  queueMembershipMail,
  registrationFromConfirmedUser,
} from "@/app/[locale]/auth/membership-data";
import { clearPasswordRecovery, markPasswordRecovery } from "@/app/[locale]/auth/recovery-cookie";
import { isLocale } from "@/app/lib/i18n";
import { requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { getVerifiedIdentity } from "@/app/lib/supabase/session";

export async function GET(request: NextRequest, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return new NextResponse(null, { status: 404 });

  const { siteUrl } = requireSupabaseRuntimeEnv();
  const login = new URL(`/${locale}/login`, siteUrl);
  function respond(flow: "link-error" | "reset" | "confirmed") {
    login.searchParams.set("flow", flow);
    return NextResponse.redirect(login, {
      status: 303,
      headers: { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
    });
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (!tokenHash || tokenHash.length > 256 || (type !== "email" && type !== "recovery")) {
    return respond("link-error");
  }

  const client = await createServerSupabaseClient({ writeCookies: true });
  const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error || !data.session || !data.user) return respond("link-error");

  if (type === "recovery") {
    const identity = await getVerifiedIdentity(client);
    if (identity.status !== "verified" || !identity.sessionId) return respond("link-error");
    await markPasswordRecovery(identity.sessionId, login.protocol === "https:");
    return respond("reset");
  }

  await clearPasswordRecovery();
  const intent = registrationFromConfirmedUser(data.user);
  if (intent) {
    const { error: registrationError } = await createMembershipRequest(client, intent);
    if (registrationError) {
      console.warn("[membership] confirmed registration unavailable");
    } else {
      queueMembershipMail();
    }
  }
  return respond("confirmed");
}
