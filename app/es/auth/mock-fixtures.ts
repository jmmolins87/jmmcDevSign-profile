import type { AuthUser, RegistrationRequest } from "@/app/es/auth/types";

export type MockAuthFixture = AuthUser & {
  fixtureId: string;
  roleLabel: string;
  demoPassword: string;
};

export const MOCK_AUTH_FIXTURES = [
  {
    fixtureId: "profile-admin",
    id: "usr-admin-001",
    email: "admin@jmmcdevsign.es",
    fullName: "JMMC Admin",
    role: "admin",
    roleLabel: "Administrador",
    provider: "password",
    status: "active",
    createdAt: "2026-11-01T09:00:00.000Z",
    activatedAt: "2026-11-01T09:00:00.000Z",
    demoPassword: "jmmc-admin-demo",
  },
  {
    fixtureId: "profile-editor",
    id: "usr-editor-001",
    email: "editor@jmmcdevsign.es",
    fullName: "JMMC Editor",
    role: "editor",
    roleLabel: "Editor",
    provider: "password",
    status: "active",
    createdAt: "2026-11-02T09:00:00.000Z",
    activatedAt: "2026-11-02T09:00:00.000Z",
    demoPassword: "jmmc-editor-demo",
  },
  {
    fixtureId: "profile-revisor",
    id: "usr-revisor-001",
    email: "revisor@jmmcdevsign.es",
    fullName: "JMMC Revisor",
    role: "revisor",
    roleLabel: "Revisor",
    provider: "password",
    status: "active",
    createdAt: "2026-11-03T09:00:00.000Z",
    activatedAt: "2026-11-03T09:00:00.000Z",
    demoPassword: "jmmc-revisor-demo",
  },
] satisfies readonly MockAuthFixture[];

export const MOCK_REGISTRATION_REQUESTS = [
  {
    id: "registration-001",
    email: "lucia.martin@northstar.test",
    fullName: "Lucía Martín",
    provider: "password",
    requestedRole: "editor",
    status: "pending",
    createdAt: "2026-11-11T09:12:00.000Z",
  },
  {
    id: "registration-002",
    email: "diego.serra@atelier.test",
    fullName: "Diego Serra",
    provider: "password",
    requestedRole: "revisor",
    status: "pending",
    createdAt: "2026-11-11T08:46:00.000Z",
  },
  {
    id: "registration-003",
    email: "marta.vidal@orbit.test",
    fullName: "Marta Vidal",
    provider: "password",
    requestedRole: "editor",
    assignedRole: "editor",
    status: "approved",
    createdAt: "2026-11-10T16:22:00.000Z",
    approvedAt: "2026-11-10T16:45:00.000Z",
    approvedBy: "usr-admin-001",
  },
  {
    id: "registration-004",
    email: "alex.costa@vector.test",
    fullName: "Álex Costa",
    provider: "password",
    requestedRole: "editor",
    status: "rejected",
    createdAt: "2026-11-10T12:09:00.000Z",
  },
] satisfies readonly RegistrationRequest[];
