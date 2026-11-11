"use client";

import { useSyncExternalStore } from "react";

export type UserRole = "admin" | "editor" | "lector";

export type MockSession = {
  userId: string;
  email: string;
  role: UserRole;
  isAuthenticated: true;
};

export type MockLoginProfile = {
  id: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  demoPassword: string;
};

export type MockLoginResult =
  | { ok: true; session: MockSession }
  | { ok: false; error: string };

const SESSION_STORAGE_KEY = "jmmc-mock-session";
const SESSION_CHANGE_EVENT = "jmmc-mock-session-change";

const mockUsers: readonly (MockLoginProfile & { userId: string })[] = [
  {
    id: "profile-admin",
    userId: "usr-admin-001",
    email: "admin@jmmcdevsign.es",
    role: "admin",
    roleLabel: "Administrador",
    demoPassword: "jmmc-admin-demo",
  },
  {
    id: "profile-editor",
    userId: "usr-editor-001",
    email: "editor@jmmcdevsign.es",
    role: "editor",
    roleLabel: "Editor",
    demoPassword: "jmmc-editor-demo",
  },
  {
    id: "profile-lector",
    userId: "usr-lector-001",
    email: "lector@jmmcdevsign.es",
    role: "lector",
    roleLabel: "Lector",
    demoPassword: "jmmc-lector-demo",
  },
];

let clientSession: MockSession | null = null;
let hasReadClientSnapshot = false;

function isUserRole(value: unknown): value is UserRole {
  return value === "admin" || value === "editor" || value === "lector";
}

function isKnownSession(value: unknown): value is MockSession {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<MockSession>;
  return (
    candidate.isAuthenticated === true &&
    typeof candidate.userId === "string" &&
    typeof candidate.email === "string" &&
    isUserRole(candidate.role) &&
    mockUsers.some(
      (user) =>
        user.userId === candidate.userId &&
        user.email === candidate.email &&
        user.role === candidate.role,
    )
  );
}

function readStoredSession(): MockSession | null {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) return null;

    const parsedSession: unknown = JSON.parse(rawSession);
    return isKnownSession(parsedSession) ? parsedSession : null;
  } catch {
    return null;
  }
}

function getClientSnapshot(): MockSession | null {
  if (!hasReadClientSnapshot) {
    hasReadClientSnapshot = true;
    clientSession = readStoredSession();
  }

  return clientSession;
}

function getServerSnapshot(): MockSession | null {
  return null;
}

function subscribeToSession(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleSessionChange = () => {
    clientSession = readStoredSession();
    onStoreChange();
  };

  window.addEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
  window.addEventListener("storage", handleSessionChange);

  return () => {
    window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionChange);
    window.removeEventListener("storage", handleSessionChange);
  };
}

function publishSessionChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
  }
}

export function useMockSession() {
  return useSyncExternalStore(
    subscribeToSession,
    getClientSnapshot,
    getServerSnapshot,
  );
}

export function listMockLoginProfiles(): readonly MockLoginProfile[] {
  return mockUsers.map(({ id, email, role, roleLabel, demoPassword }) => ({
    id,
    email,
    role,
    roleLabel,
    demoPassword,
  }));
}

export async function loginMockSession(
  email: string,
  password: string,
): Promise<MockLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = mockUsers.find(
    (candidate) =>
      candidate.email === normalizedEmail && candidate.demoPassword === password,
  );

  if (!user) {
    return {
      ok: false,
      error: "Las credenciales no coinciden con ningún perfil demo.",
    };
  }

  const session: MockSession = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    isAuthenticated: true,
  };

  clientSession = session;

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // The in-memory session remains available when storage is unavailable.
  }

  publishSessionChange();
  return { ok: true, session };
}

export function logoutMockSession() {
  clientSession = null;

  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Logout remains effective in memory when storage is unavailable.
  }

  publishSessionChange();
}
