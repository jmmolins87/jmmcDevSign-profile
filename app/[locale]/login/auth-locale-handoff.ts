import type { AuthModalView } from "@/app/[locale]/login/auth-modal-frame";
import type { RegistrationRole } from "@/app/[locale]/auth/types";

export const AUTH_LOCALE_HANDOFF_KEY = "jmmcdevsign:auth:locale-draft:v1";

export type AuthLocaleDraft = {
  view: AuthModalView;
  email: string;
  fullName: string;
  requestedRole: RegistrationRole | "";
};

type HandoffStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function getSessionStorage(): HandoffStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    // Degraded mode: language navigation remains available without restoring fields.
    return null;
  }
}

function parseStoredDraft(value: unknown): AuthLocaleDraft | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const keys = ["version", "view", "email", "fullName", "requestedRole"];
  if (Object.keys(record).some((key) => !keys.includes(key)) || record.version !== 1) return null;
  if (record.view !== "login" && record.view !== "register" && record.view !== "pending" && record.view !== "status") return null;
  if (typeof record.email !== "string" || record.email.length > 320) return null;
  if (typeof record.fullName !== "string" || record.fullName.length > 200) return null;
  if (record.requestedRole !== "" && record.requestedRole !== "editor" && record.requestedRole !== "revisor") return null;
  return { view: record.view, email: record.email, fullName: record.fullName, requestedRole: record.requestedRole };
}

/** Store an explicit allowlist: callers can never persist credentials through this handoff. */
export function saveAuthLocaleDraft(draft: AuthLocaleDraft, storage: HandoffStorage | null = getSessionStorage()): boolean {
  if (!storage) return false;
  const record = { version: 1, view: draft.view, email: draft.email, fullName: draft.fullName, requestedRole: draft.requestedRole };
  if (!parseStoredDraft(record)) return false;
  try {
    storage.setItem(AUTH_LOCALE_HANDOFF_KEY, JSON.stringify(record));
    return true;
  } catch {
    // Degraded mode: continue native navigation; no credentials or replacement storage are used.
    return false;
  }
}

/** A record that cannot be removed is never restored, so consumption stays single-use. */
export function consumeAuthLocaleDraft(storage: HandoffStorage | null = getSessionStorage()): AuthLocaleDraft | null {
  if (!storage) return null;
  try {
    const record = storage.getItem(AUTH_LOCALE_HANDOFF_KEY);
    if (!record) return null;
    storage.removeItem(AUTH_LOCALE_HANDOFF_KEY);
    return parseStoredDraft(JSON.parse(record));
  } catch {
    // Corrupt/blocked storage safely falls back to an empty form after navigation.
    return null;
  }
}

/** Defer browser storage until subscription, preserving identical server/hydration snapshots. */
export function createAuthLocaleDraftStore(load = consumeAuthLocaleDraft) {
  let loaded = false;
  let snapshot: AuthLocaleDraft | null = null;
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: (): AuthLocaleDraft | null => null,
    subscribe(listener: () => void) {
      if (!loaded) {
        loaded = true;
        snapshot = load();
        listener();
      }
      return () => undefined;
    },
  };
}
