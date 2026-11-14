import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProtectedSurface } from "@/app/es/auth/protected-surface";
import { listMockLoginProfiles, loginMockSession } from "@/app/es/auth/mock-session";
import type { UserRole } from "@/app/es/auth/roles";

async function loginAsRole(role: UserRole) {
  const profile = listMockLoginProfiles().find((candidate) => candidate.role === role);
  if (!profile) throw new Error(`Fixture not found for role: ${role}`);
  await loginMockSession(profile.email, profile.demoPassword);
}

describe("ProtectedSurface", () => {
  it("shows a session-required state for anonymous visitors", () => {
    render(
      <ProtectedSurface allowedRoles={["admin", "editor", "revisor"]}>
        <p>Contenido protegido</p>
      </ProtectedSurface>,
    );

    expect(screen.getByRole("heading", { name: "Sesión requerida" })).toBeVisible();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it.each(["admin", "editor", "revisor"] as const)("allows %s on shared surfaces", async (role) => {
    await loginAsRole(role);

    render(
      <ProtectedSurface allowedRoles={["admin", "editor", "revisor"]}>
        <p>Contenido protegido</p>
      </ProtectedSurface>,
    );

    expect(screen.getByText("Contenido protegido")).toBeVisible();
  });

  it.each(["editor", "revisor"] as const)("denies %s on admin surfaces", async (role) => {
    await loginAsRole(role);

    render(
      <ProtectedSurface allowedRoles={["admin"]}>
        <p>Gestión administrativa</p>
      </ProtectedSurface>,
    );

    expect(screen.getByRole("heading", { name: "Acceso no autorizado" })).toBeVisible();
    expect(screen.getByText(/no tiene permisos para esta superficie/)).toBeVisible();
    expect(screen.queryByText("Gestión administrativa")).not.toBeInTheDocument();
  });
});

