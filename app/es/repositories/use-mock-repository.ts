"use client";

import { useSyncExternalStore } from "react";

import type { MockRepository } from "@/app/es/repositories/mock-repository";

export function useMockRepository<T extends { id: string }, TInput>(
  repository: MockRepository<T, TInput>,
) {
  return useSyncExternalStore(
    repository.subscribe,
    repository.getSnapshot,
    repository.getSnapshot,
  );
}
