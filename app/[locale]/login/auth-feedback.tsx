"use client";

import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import type { AuthActionFeedback } from "@/app/[locale]/auth/managed-types";

export function AuthFeedback({ feedback }: { feedback: AuthActionFeedback }) {
  const t = useManagedAuthCopy();
  if (!feedback.message) return null;
  const isError = feedback.status === "error";
  return (
    <p className={isError ? "border border-error p-space-md text-body-sm text-error" : "border border-border bg-surface-container-lowest p-space-md text-body-sm text-on-surface-variant"} role={isError ? "alert" : "status"}>
      {t(feedback.message)}
    </p>
  );
}
