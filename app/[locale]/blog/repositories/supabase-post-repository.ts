import type { SupabaseClient } from "@supabase/supabase-js";

import { isPostDraft } from "@/app/[locale]/blog/domain";
import type { Database } from "@/app/lib/supabase/database.types";
import type {
  EditorialFailure,
  EditorialPost,
  PostRepository,
  PostVersion,
} from "@/app/[locale]/blog/repositories/post-repository";

export class PostRepositoryError extends Error {
  constructor(readonly reason: EditorialFailure) {
    super(`Editorial repository: ${reason}`);
  }
}

function toRepositoryError(code: string) {
  switch (code) {
    case "40001":
    case "P0002":
      return new PostRepositoryError("conflict");
    case "42501":
    case "PGRST301":
      return new PostRepositoryError("unauthorized");
    case "23505":
      return new PostRepositoryError("slug-taken");
    case "22023":
      return new PostRepositoryError("invalid");
    default:
      return new PostRepositoryError("unavailable");
  }
}

function readPost(value: unknown): EditorialPost {
  if (!value || typeof value !== "object") throw new PostRepositoryError("unavailable");
  const { post, slugLocked, version } = value as Partial<EditorialPost>;

  if (
    typeof version !== "number" || !Number.isSafeInteger(version) || version < 0 ||
    typeof slugLocked !== "boolean" || !isPostDraft(post)
  ) {
    throw new PostRepositoryError("unavailable");
  }

  return {
    post: {
      ...post,
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString() : undefined,
    },
    slugLocked,
    version,
  };
}

function toVersionArgs({ postId, version }: PostVersion) {
  return { p_post_id: postId, p_expected_version: version };
}

export function createSupabasePostRepository(client: SupabaseClient<Database>): PostRepository {
  return {
    async list() {
      const [catalog, covers] = await Promise.all([
        client.rpc("editorial_posts"),
        client.from("cover_assets").select("id,src,alt,label").order("label"),
      ]);
      if (catalog.error) throw toRepositoryError(catalog.error.code);
      if (covers.error) throw toRepositoryError(covers.error.code);
      if (!Array.isArray(catalog.data)) throw new PostRepositoryError("unavailable");
      return { posts: catalog.data.map(readPost), covers: covers.data };
    },

    async create(snapshot) {
      const { data, error } = await client.rpc("save_post", {
        p_snapshot: snapshot,
      });
      if (error) throw toRepositoryError(error.code);
      return readPost(data);
    },

    async save({ snapshot, ...version }) {
      const { data, error } = await client.rpc("save_post", {
        ...toVersionArgs(version),
        p_snapshot: snapshot,
      });
      if (error) throw toRepositoryError(error.code);
      return readPost(data);
    },

    async publish({ scheduledAt, snapshot, ...version }) {
      const { data, error } = await client.rpc("publish_post", {
        ...toVersionArgs(version),
        p_scheduled_at: scheduledAt ?? undefined,
        p_snapshot: snapshot,
      });
      if (error) throw toRepositoryError(error.code);
      return readPost(data);
    },

    async cancel(version) {
      const { data, error } = await client.rpc("cancel_post_schedule", toVersionArgs(version));
      if (error) throw toRepositoryError(error.code);
      return readPost(data);
    },

    async remove(version) {
      const { error } = await client.rpc("remove_post", toVersionArgs(version));
      if (error) throw toRepositoryError(error.code);
    },
  };
}
