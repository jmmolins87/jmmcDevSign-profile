import { describe, expect, it } from "vitest";

import { MOCK_AUTH_FIXTURES, MOCK_REGISTRATION_REQUESTS } from "@/app/es/auth/mock-fixtures";
import { EDITORIAL_ROLES, SHARED_SURFACE_ROLES, USER_ROLES, isUserRole } from "@/app/es/auth/roles";

describe("auth domain fixtures", () => {
  it("defines only admin, editor and revisor with shared editorial access", () => {
    expect(USER_ROLES).toEqual(["admin", "editor", "revisor"]);
    expect(EDITORIAL_ROLES).toEqual(["editor", "revisor"]);
    expect(SHARED_SURFACE_ROLES).toEqual(["admin", "editor", "revisor"]);
    expect(isUserRole("revisor")).toBe(true);
    expect(isUserRole("guest")).toBe(false);
  });

  it("keeps the three documented fixture credentials and one admin", () => {
    expect(MOCK_AUTH_FIXTURES.map((fixture) => fixture.email)).toEqual([
      "admin@jmmcdevsign.es",
      "editor@jmmcdevsign.es",
      "revisor@jmmcdevsign.es",
    ]);
    expect(MOCK_AUTH_FIXTURES.map((fixture) => fixture.demoPassword)).toEqual([
      "jmmc-admin-demo",
      "jmmc-editor-demo",
      "jmmc-revisor-demo",
    ]);
    expect(MOCK_AUTH_FIXTURES.filter((fixture) => fixture.role === "admin")).toHaveLength(1);
  });

  it("seeds registration requests with non-admin roles and traceable statuses", () => {
    expect(MOCK_REGISTRATION_REQUESTS).toHaveLength(4);
    expect(MOCK_REGISTRATION_REQUESTS.map((request) => request.requestedRole as string)).not.toContain("admin");
    expect(MOCK_REGISTRATION_REQUESTS.some((request) => request.status === "pending")).toBe(true);
    expect(MOCK_REGISTRATION_REQUESTS.find((request) => request.status === "approved")).toMatchObject({
      assignedRole: "editor",
      approvedBy: "usr-admin-001",
    });
  });
});

