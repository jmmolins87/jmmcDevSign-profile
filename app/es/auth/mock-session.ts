"use client";

import { useSyncExternalStore } from "react";

import { authUsersRepository } from "@/app/es/auth/mock-auth-repository";
import { MOCK_AUTH_FIXTURES } from "@/app/es/auth/mock-fixtures";
import { isUserRole, type UserRole } from "@/app/es/auth/roles";
import { isAuthProvider, type AuthProvider, type AuthUser, type MockSession } from "@/app/es/auth/types";

export type { UserRole } from "@/app/es/auth/roles";
export type { MockSession } from "@/app/es/auth/types";

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

type MockUser = MockLoginProfile & { userId: string; provider: AuthProvider };

const mockUsers: readonly MockUser[] = MOCK_AUTH_FIXTURES.map((fixture) => ({
  id: fixture.fixtureId,
  userId: fixture.id,
  email: fixture.email,
  role: fixture.role,
  roleLabel: fixture.roleLabel,
  demoPassword: fixture.demoPassword,
  provider: fixture.provider,
}));

let clientSession: MockSession | null = null;
let hasReadClientSnapshot = false;

function isKnownSession(value: unknown): value is MockSession {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<MockSession>;
  return (
    candidate.isAuthenticated === true &&
    typeof candidate.userId === "string" &&
    typeof candidate.email === "string" &&
    isAuthProvider(candidate.provider) &&
    isUserRole(candidate.role) &&
    (mockUsers.some(
      (user) =>
        user.userId === candidate.userId &&
        user.email === candidate.email &&
        user.role === candidate.role &&
        user.provider === candidate.provider,
    ) || authUsersRepository.getSnapshot().some(
      (user) =>
        user.id === candidate.userId &&
        user.email === candidate.email &&
        user.role === candidate.role &&
        user.provider === candidate.provider &&
        user.status === "active",
    ))
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

function persistSession(session: MockSession) {
  clientSession = session;

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // The in-memory session remains available when storage is unavailable.
  }

  publishSessionChange();
}

export function createMockSessionForUser(user: Pick<AuthUser, "id" | "email" | "role" | "provider">) {
  const session: MockSession = {
    userId: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
    isAuthenticated: true,
  };

  persistSession(session);
  return session;
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

  const session = createMockSessionForUser({
    email: user.email,
    id: user.userId,
    provider: user.provider,
    role: user.role,
  });

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
