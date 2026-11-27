import { vi } from "vitest";

import type { AuthActionFeedback } from "@/app/[locale]/auth/managed-types";

type Action = (feedback: AuthActionFeedback, form: FormData) => Promise<AuthActionFeedback>;
type LocalizedAction = (locale: string, feedback: AuthActionFeedback, form: FormData) => Promise<AuthActionFeedback>;
const succeeded = async (): Promise<AuthActionFeedback> => ({ status: "success" });

export const signIn = vi.fn<Action>(succeeded);
export const signInWithSocialProvider = vi.fn<LocalizedAction>(succeeded);
export const signOut = vi.fn(succeeded);
export const register = vi.fn<LocalizedAction>(succeeded);
export const requestMembership = vi.fn<LocalizedAction>(succeeded);
export const sendRecoveryLink = vi.fn<LocalizedAction>(succeeded);
export const updateRecoveredPassword = vi.fn<LocalizedAction>(succeeded);
export const verifyCode = vi.fn<Action>(succeeded);
export const resendCode = vi.fn(succeeded);
export const decideRequest = vi.fn<Action>(succeeded);
