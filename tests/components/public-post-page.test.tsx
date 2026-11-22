import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { COVER_ASSETS, POST_FIXTURES } from "@/tests/fixtures/post-fixtures";

const notFoundMock = vi.hoisted(() => vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));
vi.mock("next/image", () => ({
  default: ({ alt, priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority;
    return createElement("img", { alt: alt ?? "", ...props });
  },
}));

const getPublishedBySlug = vi.hoisted(() => vi.fn());
const getCover = vi.hoisted(() => vi.fn());
vi.mock("@/app/[locale]/blog/repositories/public-post-repository", () => ({
  publicPostRepository: { getPublishedBySlug, getCover },
}));

vi.mock("@/app/lib/supabase/env", () => ({
  requireSupabaseRuntimeEnv: () => ({ siteUrl: "https://www.jmmcdevsign.es" }),
}));

import BlogPostPage, { generateMetadata } from "@/app/[locale]/blog/[slug]/page";

const publishedPost = POST_FIXTURES[1];
const publishedSlug = publishedPost.slug;

describe("public blog post route", () => {
  it("renders a published post without an editor or client repository surface", async () => {
    getPublishedBySlug.mockResolvedValueOnce(publishedPost);
    getCover.mockResolvedValueOnce(COVER_ASSETS[0]);
    render(await BlogPostPage({ params: Promise.resolve({ locale: "es", slug: publishedSlug }) }));

    expect(screen.getByRole("heading", { name: /El ocaso de los microservicios caóticos/u })).toBeInTheDocument();
    expect(screen.getByText("Distribuir datos no obliga a distribuir la complejidad.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "[ VOLVER AL PORTFOLIO ]" })).toHaveAttribute("href", "/es/");
    expect(screen.queryByText("POST EDITOR")).not.toBeInTheDocument();
  });

  it.each(["es", "en"])("generates canonical and Open Graph metadata from the published post in %s", async (locale) => {
    getPublishedBySlug.mockResolvedValueOnce(publishedPost);
    getCover.mockResolvedValueOnce(COVER_ASSETS[0]);
    const metadata = await generateMetadata({ params: Promise.resolve({ locale, slug: publishedSlug }) });

    expect(metadata.title).toBe("El ocaso de los microservicios caóticos: volviendo al monolito modular");
    expect(metadata.description).toContain("coste oculto");
    expect(metadata.alternates?.canonical).toBe(`https://www.jmmcdevsign.es/${locale}/blog/${publishedSlug}`);
    expect(metadata.openGraph).toMatchObject({
      title: "El ocaso de los microservicios caóticos: volviendo al monolito modular",
      type: "article",
      url: `https://www.jmmcdevsign.es/${locale}/blog/${publishedSlug}`,
    });
  });

  it("returns not found for an unknown or unpublished slug", async () => {
    getPublishedBySlug.mockResolvedValueOnce(null);

    await expect(BlogPostPage({ params: Promise.resolve({ locale: "es", slug: "no-existe" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("propagates remote failures to the error boundary without a false 404", async () => {
    getPublishedBySlug.mockRejectedValueOnce(new Error("Published post lookup failed"));

    await expect(BlogPostPage({ params: Promise.resolve({ locale: "es", slug: publishedSlug }) })).rejects.toThrow("Published post lookup failed");
    expect(notFoundMock).not.toHaveBeenCalled();
  });
});

