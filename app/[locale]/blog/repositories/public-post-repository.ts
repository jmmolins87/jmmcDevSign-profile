import type { PostDraft } from "@/app/[locale]/blog/domain";
import { POST_FIXTURES } from "@/app/[locale]/blog/repositories/post-fixtures";

export interface PublicPostRepository {
  getPublishedBySlug(slug: string): Promise<PostDraft | null>;
}

function clonePost(post: PostDraft): PostDraft {
  return { ...post, tags: [...post.tags] };
}

export function createFixturePublicPostRepository(
  fixtures: readonly PostDraft[] = POST_FIXTURES,
): PublicPostRepository {
  return {
    async getPublishedBySlug(slug) {
      const post = fixtures.find((candidate) => candidate.slug === slug && candidate.status === "published");
      return post ? clonePost(post) : null;
    },
  };
}

export const publicPostRepository = createFixturePublicPostRepository();
