"use client";

import { useCallback } from "react";

import { managedAuthText } from "@/app/[locale]/auth/managed-copy";
import { useLocale } from "@/app/lib/locale-context";

export function useManagedAuthCopy() {
  const locale = useLocale();
  return useCallback((text: string) => managedAuthText(locale, text), [locale]);
}
