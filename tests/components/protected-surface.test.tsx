import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProtectedSurface } from "@/app/[locale]/auth/protected-surface";
import { SHARED_SURFACE_ROLES, type UserRole } from "@/app/[locale]/auth/roles";

vi.mock("@/app/[locale]/auth/actions", () => import("../fixtures/mock-managed-auth-actions"));

describe("ProtectedSurface", () => {
  it("denies access even with a legacy browser snapshot", () => {
    window.localStorage.setItem("jmmc-mock-session", JSON.stringify({ role: "admin", isAuthenticated: true }));
    render(<ProtectedSurface access={{ status: "anonymous" }} allowedRoles={SHARED_SURFACE_ROLES}><p>Datos privados</p></ProtectedSurface>);
    expect(screen.getByRole("heading", { name: "Sesión requerida" })).toBeVisible();
    expect(screen.queryByText("Datos privados")).toBeNull();
  });

  it.each(SHARED_SURFACE_ROLES)("allows the %s role with active membership on editor pages", (role: UserRole) => {
    render(<ProtectedSurface access={{ status: "active", userId: "member", email: "member@example.com", role }} allowedRoles={SHARED_SURFACE_ROLES}><p>Editor activo</p></ProtectedSurface>);
    expect(screen.getByText("Editor activo")).toBeVisible();
  });

  it("does not let a confirmed identity with pending membership view editorial content", () => {
    render(<ProtectedSurface access={{ status: "inactive", userId: "member", email: "member@example.com", role: "editor" }} allowedRoles={SHARED_SURFACE_ROLES}><p>Datos privados</p></ProtectedSurface>);
    expect(screen.getByRole("heading", { name: "Acceso no autorizado" })).toBeVisible();
    expect(screen.queryByText("Datos privados")).toBeNull();
  });

  it("denies administration to an active editorial user", () => {
    render(<ProtectedSurface access={{ status: "active", userId: "member", email: "member@example.com", role: "revisor" }} allowedRoles={["admin"]}><p>Datos privados</p></ProtectedSurface>);
    expect(screen.getByRole("heading", { name: "Acceso no autorizado" })).toBeVisible();
    expect(screen.queryByText("Datos privados")).toBeNull();
  });
});
