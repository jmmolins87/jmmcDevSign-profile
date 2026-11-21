import "server-only";

import { cookies } from "next/headers";

const RECOVERY_COOKIE = "jmmc-password-recovery";

export async function markPasswordRecovery(sessionId: string, secure: boolean) {
  (await cookies()).set(RECOVERY_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 10 * 60,
  });
}

export async function hasPasswordRecovery(sessionId: string | null) {
  return sessionId !== null && (await cookies()).get(RECOVERY_COOKIE)?.value === sessionId;
}

export async function clearPasswordRecovery() {
  (await cookies()).delete(RECOVERY_COOKIE);
}
