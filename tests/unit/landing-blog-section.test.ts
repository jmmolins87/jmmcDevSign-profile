import { describe, expect, it } from "vitest";

import { formatLandingPostDate, mapLandingCarouselPost } from "@/app/[locale]/_components/landing-blog-section";
import type { PostDraft } from "@/app/[locale]/blog/domain";
import { COVER_ASSETS, POST_FIXTURES } from "@/tests/fixtures/post-fixtures";

const publishedPost: PostDraft = {
  ...POST_FIXTURES[1],
  title: "OpenRouter expulsa a tres proveedores de inferencia por fugas de datos",
  slug: "openrouter-expulsa-proveedores-por-fugas-de-datos",
  excerpt: "OpenRouter dio de baja a tres proveedores de inferencia y retiró 125 endpoints de retención cero tras hallazgos de investigadores de seguridad.",
  category: "Agentes de IA",
  publishedAt: "2026-11-22T09:00:00.000Z",
};

describe("landing publication archive mapping", () => {
  it("turns a published post into a carousel entry that links to its article", () => {
    const entry = mapLandingCarouselPost(publishedPost, COVER_ASSETS[0], "es");

    expect(entry.id).toBe(publishedPost.id);
    expect(entry.href).toBe(`/blog/${publishedPost.slug}`);
    expect(entry.date).toBe("22 nov 2026");
    expect(entry.readingTime).toMatch(/^\d{2} MIN$/u);
    expect(entry.image).toBe(COVER_ASSETS[0].src);
    expect(entry.imageAlt).toBe(COVER_ASSETS[0].alt);
    expect(entry.title).toBe(publishedPost.title);
    expect(entry.description).toBe(publishedPost.excerpt);
  });

  it("translates the editorial copy for the english landing", () => {
    const entry = mapLandingCarouselPost(publishedPost, COVER_ASSETS[0], "en");

    expect(entry.title).toBe("OpenRouter expels three inference providers over data leaks");
    expect(entry.category).toBe("AI agents");
    expect(entry.date).toBe("22 Nov 2026");
  });

  it("keeps the entry renderable when the cover asset is missing", () => {
    const entry = mapLandingCarouselPost(publishedPost, undefined, "es");

    expect(entry.image).toMatch(/^\/assets\//u);
    expect(entry.imageAlt).toBe(publishedPost.title);
  });

  it("formats the publication date per locale and tolerates a missing one", () => {
    expect(formatLandingPostDate("es", "2026-11-20T09:00:00.000Z")).toBe("20 nov 2026");
    expect(formatLandingPostDate("en", "2026-11-20T09:00:00.000Z")).toBe("20 Nov 2026");
    expect(formatLandingPostDate("es", undefined)).toBe("");
    expect(formatLandingPostDate("es", "not-a-date")).toBe("");
  });
});
