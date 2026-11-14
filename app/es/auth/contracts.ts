import type {
  AuthProvider,
  AdminApprovalEmailModel,
  MockSession,
  RegistrationRequest,
  RegistrationRole,
} from "@/app/es/auth/types";

export type OAuthProvider = Extract<AuthProvider, "google" | "github">;

export type AuthResult =
  | { ok: true; session: MockSession }
  | { ok: false; error: string };

export type RegisterInput = {
  email: string;
  fullName: string;
  password: string;
  requestedRole: RegistrationRole;
  termsAccepted: boolean;
};

export type RegistrationResult =
  | { ok: true; request: RegistrationRequest }
  | { ok: false; error: string };

export interface AuthAdapter {
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  signInWithOAuth(provider: OAuthProvider): Promise<AuthResult>;
  register(input: RegisterInput): Promise<RegistrationResult>;
  verifyRegistration(requestId: string, code: string): Promise<AuthResult>;
  signOut(): Promise<void>;
}

export interface EmailService {
  notifyAdmin(model: AdminApprovalEmailModel): Promise<void>;
  sendVerificationCode(request: RegistrationRequest, code: string): Promise<void>;
}
