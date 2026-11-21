"use client";

import { useCallback } from "react";
import { useLocale } from "@/app/lib/locale-context";
import { publicText } from "@/app/lib/public-messages";

export function usePublicCopy() {
  const locale = useLocale();
  return useCallback((source: string): string => publicText(locale, source), [locale]);
}
