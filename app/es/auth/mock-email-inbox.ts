import { createMockRepository } from "@/app/es/repositories/mock-repository";

export type MockEmailKind = "admin-notification" | "verification-code";

export type MockEmailMessage = {
  id: string;
  kind: MockEmailKind;
  to: string;
  subject: string;
  body: string;
  html?: string;
  text?: string;
  registrationRequestId: string;
  sentAt: string;
};

export type CreateMockEmailInput = Omit<MockEmailMessage, "id">;

export const mockEmailInbox = createMockRepository<MockEmailMessage, CreateMockEmailInput>({
  seed: [],
  storageKey: "jmmcdevsign:auth:email-inbox",
  create: (input, sequence) => ({ id: `email-${String(sequence).padStart(3, "0")}`, ...input }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});
