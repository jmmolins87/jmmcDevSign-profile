"use server";

import type {
  EditorialResult,
  PostRepository,
  PostSnapshot,
  PostVersion,
} from "@/app/[locale]/blog/repositories/post-repository";
import {
  createSupabasePostRepository,
  PostRepositoryError,
} from "@/app/[locale]/blog/repositories/supabase-post-repository";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { getEditorialAccess } from "@/app/lib/supabase/session";

async function run<T>(operation: (repository: PostRepository) => Promise<T>): Promise<EditorialResult<T>> {
  try {
    const client = await createServerSupabaseClient();
    const access = await getEditorialAccess(client);
    if (access.status !== "active") {
      return { ok: false, reason: access.status === "unavailable" ? "unavailable" : "unauthorized" };
    }

    return { ok: true, data: await operation(createSupabasePostRepository(client)) };
  } catch (error) {
    if (error instanceof PostRepositoryError) return { ok: false, reason: error.reason };
    console.error("Editorial operation failed");
    return { ok: false, reason: "unavailable" };
  }
}

export async function loadEditorialCatalog() {
  return run((repository) => repository.list());
}

export async function createEditorialPost(snapshot: PostSnapshot) {
  return run((repository) => repository.create(snapshot));
}

export async function saveEditorialPost(input: PostVersion & { snapshot: PostSnapshot }) {
  return run((repository) => repository.save(input));
}

export async function publishEditorialPost(input: PostVersion & { scheduledAt: string | null; snapshot: PostSnapshot }) {
  return run((repository) => repository.publish(input));
}

export async function cancelEditorialSchedule(version: PostVersion) {
  return run((repository) => repository.cancel(version));
}

export async function removeEditorialPost(version: PostVersion) {
  return run((repository) => repository.remove(version));
}
