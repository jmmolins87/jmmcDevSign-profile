import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

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

import BlogPostPage, { generateMetadata } from "@/app/es/blog/[slug]/page";

const publishedSlug = "ocaso-microservicios-caoticos-monolito-modular";

describe("public blog post route", () => {
  it("renders a published post without an editor or client repository surface", async () => {
    render(await BlogPostPage({ params: Promise.resolve({ slug: publishedSlug }) }));

    expect(screen.getByRole("heading", { name: /El ocaso de los microservicios caóticos/u })).toBeInTheDocument();
    expect(screen.getByText("Distribuir datos no obliga a distribuir la complejidad.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "[ VOLVER AL PORTFOLIO ]" })).toHaveAttribute("href", "/es/");
    expect(screen.queryByText("POST EDITOR")).not.toBeInTheDocument();
  });

  it("generates canonical and Open Graph metadata from the published post", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: publishedSlug }) });

    expect(metadata.title).toBe("El ocaso de los microservicios caóticos: volviendo al monolito modular");
    expect(metadata.description).toContain("coste oculto");
    expect(metadata.alternates?.canonical).toBe(`https://www.jmmcdevsign.es/es/blog/${publishedSlug}`);
    expect(metadata.openGraph).toMatchObject({
      title: "El ocaso de los microservicios caóticos: volviendo al monolito modular",
      type: "article",
      url: `https://www.jmmcdevsign.es/es/blog/${publishedSlug}`,
    });
  });

  it("returns not found for an unknown or unpublished slug", async () => {
    notFoundMock.mockClear();

    await expect(BlogPostPage({ params: Promise.resolve({ slug: "no-existe" }) })).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });
});

