import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";

import { LandingBlogList } from "@/app/[locale]/_components/landing-blog-list";
import { LocaleProvider } from "@/app/lib/locale-context";

const items = Array.from({ length: 7 }, (_, index) => ({
  href: `/es/blog/post-${index + 1}`,
  id: `post-${index + 1}`,
  title: `Publicación ${index + 1}`,
}));

it("paginates the archive and starts again when the size changes", async () => {
  const user = userEvent.setup();
  render(<LocaleProvider locale="es"><LandingBlogList items={items} /></LocaleProvider>);

  const archive = within(screen.getByRole("list", { name: "Archivo de publicaciones" }));
  const next = screen.getByRole("button", { name: "Página siguiente" });
  const previous = screen.getByRole("button", { name: "Página anterior" });
  expect(archive.getAllByRole("listitem")).toHaveLength(3);
  expect(previous).toBeDisabled();

  await user.click(next);
  expect(archive.getByRole("link", { name: "Publicación 4" })).toHaveAttribute("href", "/es/blog/post-4");
  expect(archive.queryByRole("link", { name: "Publicación 1" })).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("4–6 de 7");

  await user.click(next);
  expect(archive.getAllByRole("listitem")).toHaveLength(1);
  expect(next).toBeDisabled();
  await user.click(previous);
  expect(screen.getByRole("status")).toHaveTextContent("4–6 de 7");

  await user.selectOptions(screen.getByRole("combobox", { name: "Publicaciones por página" }), "6");
  expect(archive.getAllByRole("listitem")).toHaveLength(6);
  expect(screen.getByRole("status")).toHaveTextContent("1–6 de 7");
  expect(previous).toBeDisabled();
});
