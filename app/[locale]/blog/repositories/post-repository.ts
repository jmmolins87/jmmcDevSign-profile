import type { CoverAsset, PostDraft } from "@/app/[locale]/blog/domain";

export type PostSnapshot = Pick<
  PostDraft,
  "title" | "slug" | "excerpt" | "bodyMarkdown" | "category" | "tags" | "coverAssetId" | "access" | "rights"
>;

export type EditorialPost = {
  version: number;
  slugLocked: boolean;
  post: PostDraft;
};

export type EditorialCatalog = {
  posts: EditorialPost[];
  covers: CoverAsset[];
};

export type PostVersion = {
  postId: string;
  version: number;
};

type PostUpdate = PostVersion & { snapshot: PostSnapshot };
type PostPublication = PostUpdate & { scheduledAt: string | null };

export interface PostRepository {
  list(): Promise<EditorialCatalog>;
  create(snapshot: PostSnapshot): Promise<EditorialPost>;
  save(update: PostUpdate): Promise<EditorialPost>;
  publish(publication: PostPublication): Promise<EditorialPost>;
  cancel(version: PostVersion): Promise<EditorialPost>;
  remove(version: PostVersion): Promise<void>;
}

export type EditorialFailure = "conflict" | "unauthorized" | "slug-taken" | "invalid" | "unavailable";
export type EditorialResult<T> = { ok: true; data: T } | { ok: false; reason: EditorialFailure };

export type PostEditorOperations = {
  [Method in keyof PostRepository]: (
    ...args: Parameters<PostRepository[Method]>
  ) => Promise<EditorialResult<Awaited<ReturnType<PostRepository[Method]>>>>;
};
