import { createClient } from "@supabase/supabase-js";

import {
  isPostDraft,
  POST_SLUG_PATTERN,
  type CoverAsset,
  type PostDraft,
} from "@/app/[locale]/blog/domain";
import type { Database } from "@/app/lib/supabase/database.types";
import { requireSupabaseRuntimeEnv } from "@/app/lib/supabase/env";

export interface PublicPostRepository {
  getPublishedBySlug(slug: string): Promise<PostDraft | null>;
  hasPublishedSlug(slug: string): Promise<boolean>;
  listPublished(): Promise<readonly PostDraft[]>;
  getCover(id: string): Promise<CoverAsset | null>;
  listCovers(): Promise<readonly CoverAsset[]>;
}

/** Newest publication first, so every listing surface shares the same order. */
function byPublishedAtDesc(left: PostDraft, right: PostDraft): number {
  return publishedTimestamp(right) - publishedTimestamp(left);
}

function publishedTimestamp(post: PostDraft): number {
  if (!post.publishedAt) return 0;
  const timestamp = Date.parse(post.publishedAt);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function createPublicClient() {
  const { url, publishableKey } = requireSupabaseRuntimeEnv();
  return createClient<Database>(url, publishableKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    db: { retry: false },
    global: {
      fetch: (input, options) => fetch(input, {
        ...options,
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      }),
    },
  });
}

export const publicPostRepository: PublicPostRepository = {
  async getPublishedBySlug(slug) {
    if (!POST_SLUG_PATTERN.test(slug)) return null;

    const { data, error } = await createPublicClient()
      .from("published_posts")
      .select("post")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`Published post lookup failed: ${error.message}`);
    if (!data) return null;

    const post: unknown = data.post;
    if (!isPostDraft(post) || post.status !== "published" || post.slug !== slug) {
      throw new Error("Published post response was invalid");
    }

    return post;
  },

  async hasPublishedSlug(slug) {
    if (!POST_SLUG_PATTERN.test(slug)) return false;

    const { data, error } = await createPublicClient()
      .from("published_posts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`Published slug lookup failed: ${error.message}`);
    return data !== null;
  },

  async listPublished() {
    const { data, error } = await createPublicClient()
      .from("published_posts")
      .select("post");

    if (error) throw new Error(`Published post listing failed: ${error.message}`);

    const posts: PostDraft[] = [];
    for (const row of data ?? []) {
      const post: unknown = row.post;
      if (!isPostDraft(post) || post.status !== "published") {
        throw new Error("Published post response was invalid");
      }
      posts.push(post);
    }

    return posts.sort(byPublishedAtDesc);
  },

  async getCover(id) {
    const { data, error } = await createPublicClient()
      .from("cover_assets")
      .select("id,src,alt,label")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Published cover lookup failed: ${error.message}`);
    return data;
  },

  async listCovers() {
    const { data, error } = await createPublicClient()
      .from("cover_assets")
      .select("id,src,alt,label");

    if (error) throw new Error(`Published cover listing failed: ${error.message}`);
    return data ?? [];
  },
};
