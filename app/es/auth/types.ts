import type { UserRole } from "@/app/es/auth/roles";

export type { UserRole } from "@/app/es/auth/roles";

export const AUTH_PROVIDERS = ["password", "google", "github"] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export function isAuthProvider(value: unknown): value is AuthProvider {
  return AUTH_PROVIDERS.some((provider) => provider === value);
}

export const REGISTRATION_STATUSES = ["pending", "approved", "active", "rejected"] as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export type RegistrationRole = Exclude<UserRole, "admin">;

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  provider: AuthProvider;
  status: RegistrationStatus;
  createdAt: string;
  activatedAt?: string;
};

export type RegistrationRequest = {
  id: string;
  email: string;
  fullName: string;
  provider: AuthProvider;
  requestedRole: RegistrationRole;
  assignedRole?: RegistrationRole;
  status: RegistrationStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
};

export type VerificationChallenge = {
  id: string;
  registrationRequestId: string;
  codeDigest: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  failedAttempts: number;
  maxFailedAttempts: 5;
  consumedAt?: string;
};

export type MockSession = {
  userId: string;
  email: string;
  role: UserRole;
  provider: AuthProvider;
  isAuthenticated: true;
};
