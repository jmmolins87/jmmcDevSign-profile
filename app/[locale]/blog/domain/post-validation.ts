import {
  POST_EXCERPT_MAX_LENGTH,
  POST_SLUG_PATTERN,
  type PostDraft,
  type PostValidationErrors,
  type PostValidationResult,
} from "./post-types";

function isFutureUtcDate(value: string, now: Date): boolean {
  if (!value.endsWith("Z")) return false;

  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && timestamp > now.getTime();
}

export function validatePostForPublishing(
  post: Pick<PostDraft, "title" | "slug" | "category" | "tags" | "excerpt" | "publishMode" | "scheduledAt">,
  now = new Date(),
): PostValidationResult {
  const errors: PostValidationErrors = {};

  if (!post.title.trim()) errors.title = "El título es obligatorio.";
  if (post.slug === "editor" || post.slug === "not-found") {
    errors.slug = "Elige otro slug. Esta ruta está reservada.";
  } else if (!POST_SLUG_PATTERN.test(post.slug)) {
    errors.slug = "Usa solo letras minúsculas, números y guiones simples.";
  }
  if (!post.category.trim()) errors.category = "La categoría es obligatoria.";
  if (post.tags.length === 0 || post.tags.every((tag) => !tag.trim())) {
    errors.tags = "Añade al menos un tag.";
  }
  if (post.excerpt.length > POST_EXCERPT_MAX_LENGTH) {
    errors.excerpt = `El resumen no puede superar ${POST_EXCERPT_MAX_LENGTH} caracteres.`;
  }
  if (post.publishMode === "scheduled" && (!post.scheduledAt || !isFutureUtcDate(post.scheduledAt, now))) {
    errors.scheduledAt = "La fecha programada debe ser futura y estar expresada en UTC.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
