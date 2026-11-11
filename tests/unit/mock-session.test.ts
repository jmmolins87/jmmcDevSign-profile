import {
  listMockLoginProfiles,
  loginMockSession,
  logoutMockSession,
} from "@/app/es/auth/mock-session";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  logoutMockSession();
});

describe("mock session", () => {
  it("authenticates a fixture profile and persists the session locally", async () => {
    const profile = listMockLoginProfiles()[0];

    const result = await loginMockSession(profile.email, profile.demoPassword);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session).toMatchObject({
        email: profile.email,
        role: profile.role,
        isAuthenticated: true,
      });
    }
    expect(window.localStorage.getItem("jmmc-mock-session")).toContain(profile.email);
  });

  it("rejects invalid credentials without creating a session", async () => {
    const result = await loginMockSession("admin@jmmcdevsign.es", "invalid-demo-password");

    expect(result).toEqual({
      ok: false,
      error: "Las credenciales no coinciden con ningún perfil demo.",
    });
    expect(window.localStorage.getItem("jmmc-mock-session")).toBeNull();
  });

  it("removes the persisted session on logout", async () => {
    const profile = listMockLoginProfiles()[1];
    await loginMockSession(profile.email, profile.demoPassword);

    logoutMockSession();

    expect(window.localStorage.getItem("jmmc-mock-session")).toBeNull();
  });
});
