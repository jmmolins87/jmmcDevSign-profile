export const POST_STATUS_VALUES = ["draft", "review", "scheduled", "published"] as const;
export type PostStatus = (typeof POST_STATUS_VALUES)[number];

export const PUBLISH_MODE_VALUES = ["immediate", "scheduled"] as const;
export type PublishMode = (typeof PUBLISH_MODE_VALUES)[number];

export const POST_ACCESS = "public" as const;
export type PostAccess = typeof POST_ACCESS;

export const POST_RIGHTS = "CC-BY-4.0" as const;
export type PostRights = typeof POST_RIGHTS;

export type PostDraft = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  status: PostStatus;
  category: string;
  tags: string[];
  coverAssetId?: string;
  publishMode: PublishMode;
  scheduledAt?: string;
  publishedAt?: string;
  access: PostAccess;
  rights: PostRights;
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = Omit<PostDraft, "id" | "createdAt" | "updatedAt">;

export type UpdatePostInput = Partial<Omit<PostDraft, "id" | "createdAt" | "updatedAt">>;

export type CoverAsset = {
  id: string;
  src: string;
  alt: string;
  label: string;
};

export type PostTelemetry = {
  wordCount: number;
  readingMinutes: number;
  technicalLevel: "advanced";
};

export type PostValidationField =
  | "title"
  | "slug"
  | "category"
  | "tags"
  | "excerpt"
  | "scheduledAt";

export type PostValidationErrors = Partial<Record<PostValidationField, string>>;

export type PostValidationResult = {
  valid: boolean;
  errors: PostValidationErrors;
};

export const POST_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const POST_EXCERPT_MAX_LENGTH = 160;
export const AUTOSAVE_DEBOUNCE_MS = 800;

export function isPostStatus(value: unknown): value is PostStatus {
  return typeof value === "string" && POST_STATUS_VALUES.includes(value as PostStatus);
}

export function isPublishMode(value: unknown): value is PublishMode {
  return typeof value === "string" && PUBLISH_MODE_VALUES.includes(value as PublishMode);
}

export function isIsoDateString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

export function isPostDraft(value: unknown): value is PostDraft {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PostDraft>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.excerpt === "string" &&
    typeof candidate.bodyMarkdown === "string" &&
    isPostStatus(candidate.status) &&
    typeof candidate.category === "string" &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string") &&
    (candidate.coverAssetId === undefined || typeof candidate.coverAssetId === "string") &&
    isPublishMode(candidate.publishMode) &&
    (candidate.scheduledAt === undefined || isIsoDateString(candidate.scheduledAt)) &&
    (candidate.publishedAt === undefined || isIsoDateString(candidate.publishedAt)) &&
    candidate.access === POST_ACCESS &&
    candidate.rights === POST_RIGHTS &&
    isIsoDateString(candidate.createdAt) &&
    isIsoDateString(candidate.updatedAt)
  );
}
