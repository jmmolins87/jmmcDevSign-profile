import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => createElement("img", { alt: alt ?? "", ...props }),
}));

import { MarkdownRenderer } from "@/app/[locale]/blog/markdown/markdown-renderer";

describe("MarkdownRenderer", () => {
  it("renders the Markdown syntax exposed by the editor toolbar", () => {
    render(
      <MarkdownRenderer
        markdown={"# Encabezado\n\nTexto **fuerte** y *énfasis* con `código`.\n\n[Documentación](https://example.com)\n\n> Una cita\n\n![Portada](/assets/landing/Retrato.png)\n\n---"}
      />,
    );

    expect(screen.getByRole("heading", { name: "Encabezado" })).toBeInTheDocument();
    expect(screen.getByText("fuerte")).toBeInTheDocument();
    expect(screen.getByText("énfasis")).toBeInTheDocument();
    expect(screen.getByText("código")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Documentación" })).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Una cita")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Portada" })).toHaveAttribute("src", "/assets/landing/Retrato.png");
    expect(document.querySelector("hr")).toBeInTheDocument();
  });

  it("discards raw HTML and unsafe link or image schemes", () => {
    render(
      <MarkdownRenderer
        markdown={"<script>alert('xss')</script>\n\n[Enlace inseguro](javascript:alert('xss'))\n\n![Imagen insegura](data:text/html,alert('xss'))"}
      />,
    );

    expect(document.querySelector("script")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Enlace inseguro" })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Imagen insegura" })).not.toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("<script");
  });
});
