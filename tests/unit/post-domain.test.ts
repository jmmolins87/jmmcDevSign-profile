import {
  calculatePostTelemetry,
  isPostDraft,
  validatePostForPublishing,
  type PostDraft,
} from "@/app/es/blog/domain";
import { describe, expect, it } from "vitest";

const validPost: Pick<PostDraft, "title" | "slug" | "category" | "tags" | "excerpt" | "publishMode" | "scheduledAt"> = {
  title: "Arquitectura determinista",
  slug: "arquitectura-determinista",
  category: "Arquitectura",
  tags: ["monolito"],
  excerpt: "Un resumen editorial breve.",
  publishMode: "immediate",
};

describe("post domain", () => {
  it("accepts a complete post snapshot with contract values", () => {
    const post: PostDraft = {
      id: "post-001",
      ...validPost,
      bodyMarkdown: "# Hola",
      status: "draft",
      access: "public",
      rights: "CC-BY-4.0",
      createdAt: "2026-11-14T09:00:00.000Z",
      updatedAt: "2026-11-14T09:00:00.000Z",
    };

    expect(isPostDraft(post)).toBe(true);
  });

  it("rejects a slug that is not in the public URL format", () => {
    const result = validatePostForPublishing({ ...validPost, slug: "Arquitectura determinista" });

    expect(result.valid).toBe(false);
    expect(result.errors.slug).toBe("Usa solo letras minúsculas, números y guiones simples.");
  });

  it("rejects a summary longer than 160 characters", () => {
    const result = validatePostForPublishing({ ...validPost, excerpt: "a".repeat(161) });

    expect(result.valid).toBe(false);
    expect(result.errors.excerpt).toContain("160");
  });

  it("requires a future UTC date for scheduled publication", () => {
    const now = new Date("2026-11-14T10:00:00.000Z");
    const result = validatePostForPublishing(
      { ...validPost, publishMode: "scheduled", scheduledAt: "2026-11-14T09:59:00.000Z" },
      now,
    );

    expect(result.valid).toBe(false);
    expect(result.errors.scheduledAt).toContain("UTC");
  });

  it("calculates reading telemetry from Markdown words", () => {
    expect(calculatePostTelemetry("uno dos tres")).toEqual({
      wordCount: 3,
      readingMinutes: 1,
      technicalLevel: "advanced",
    });
  });
});
