import { MOCK_AUTH_FIXTURES, MOCK_REGISTRATION_REQUESTS } from "@/app/es/auth/mock-fixtures";
import type { AuthUser, RegistrationRequest, VerificationChallenge } from "@/app/es/auth/types";
import { createMockRepository, type MockRepository } from "@/app/es/repositories/mock-repository";

export type CreateAuthUserInput = Omit<AuthUser, "id">;
export type CreateRegistrationRequestInput = Omit<RegistrationRequest, "id">;
export type CreateVerificationChallengeInput = Omit<VerificationChallenge, "id">;

const authUserSeed: readonly AuthUser[] = MOCK_AUTH_FIXTURES.map((fixture) => ({
  id: fixture.id,
  email: fixture.email,
  fullName: fixture.fullName,
  role: fixture.role,
  provider: fixture.provider,
  status: fixture.status,
  createdAt: fixture.createdAt,
  activatedAt: fixture.activatedAt,
}));

export const authUsersRepository = createMockRepository<AuthUser, CreateAuthUserInput>({
  seed: authUserSeed,
  storageKey: "jmmcdevsign:auth:users",
  create: (input, sequence) => ({ id: `usr-mock-${String(sequence).padStart(3, "0")}`, ...input }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export const registrationRequestsRepository = createMockRepository<RegistrationRequest, CreateRegistrationRequestInput>({
  seed: MOCK_REGISTRATION_REQUESTS,
  storageKey: "jmmcdevsign:auth:registration-requests",
  create: (input, sequence) => ({ id: `registration-${String(sequence).padStart(3, "0")}`, ...input }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export const verificationChallengesRepository = createMockRepository<VerificationChallenge, CreateVerificationChallengeInput>({
  seed: [],
  storageKey: "jmmcdevsign:auth:verification-challenges",
  create: (input, sequence) => ({ id: `challenge-${String(sequence).padStart(3, "0")}`, ...input }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type MockAuthRepository = {
  version: typeof MOCK_AUTH_REPOSITORY_VERSION;
  users: MockRepository<AuthUser, CreateAuthUserInput>;
  registrationRequests: MockRepository<RegistrationRequest, CreateRegistrationRequestInput>;
  verificationChallenges: MockRepository<VerificationChallenge, CreateVerificationChallengeInput>;
};

export const MOCK_AUTH_REPOSITORY_VERSION = 1 as const;

export const mockAuthRepository: MockAuthRepository = {
  version: MOCK_AUTH_REPOSITORY_VERSION,
  users: authUsersRepository,
  registrationRequests: registrationRequestsRepository,
  verificationChallenges: verificationChallengesRepository,
};
