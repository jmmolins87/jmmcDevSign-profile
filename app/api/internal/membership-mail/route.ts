import { createHash, timingSafeEqual } from "node:crypto";

import { processMembershipMail } from "@/app/lib/supabase/membership-operations";
import { requireMembershipCronSecret } from "@/app/lib/supabase/service-env";

export const maxDuration = 30;

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export async function POST(request: Request) {
  try {
    const received = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${requireMembershipCronSecret()}`;
    if (!timingSafeEqual(digest(received), digest(expected))) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    return Response.json(await processMembershipMail());
  } catch {
    console.error("[membership-mail] worker-unavailable");
    return Response.json({ error: "worker-unavailable" }, { status: 503 });
  }
}
