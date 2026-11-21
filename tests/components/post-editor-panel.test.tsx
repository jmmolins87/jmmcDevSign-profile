import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PostEditorPanel } from "@/app/[locale]/blog/editor/post-editor-panel";
import { AUTOSAVE_DEBOUNCE_MS, type PostDraft } from "@/app/[locale]/blog/domain";
import type {
  EditorialCatalog,
  EditorialPost,
  EditorialResult,
  PostEditorOperations,
  PostSnapshot,
} from "@/app/[locale]/blog/repositories/post-repository";
import { COVER_ASSETS, POST_FIXTURES } from "@/tests/fixtures/post-fixtures";

const draft = POST_FIXTURES[0];
const published = POST_FIXTURES[1];

function accepted<T>(data: T): EditorialResult<T> {
  return { data, ok: true };
}

function createOperations(posts: readonly PostDraft[] = [draft, published]) {
  const catalog: EditorialCatalog = {
    covers: [...COVER_ASSETS],
    posts: posts.map((post) => ({ post, slugLocked: post.status === "published", version: 1 })),
  };
  const records = new Map(catalog.posts.map((record) => [record.post.id, record]));

  function write(id: string, snapshot: PostSnapshot, scheduledAt?: string | null): EditorialPost {
    const previous = records.get(id);
    const post: PostDraft = { ...draft, ...previous?.post, ...snapshot, id };
    if (scheduledAt !== undefined) {
      post.status = scheduledAt ? "scheduled" : "published";
      post.publishMode = scheduledAt ? "scheduled" : "immediate";
      post.scheduledAt = scheduledAt || undefined;
    }
    const saved = {
      post,
      slugLocked: previous?.slugLocked || scheduledAt !== undefined,
      version: (previous?.version ?? 0) + 1,
    };
    records.set(id, saved);
    return saved;
  }

  const operations = {
    list: vi.fn<PostEditorOperations["list"]>(async () => accepted({ ...catalog, posts: [...records.values()] })),
    create: vi.fn<PostEditorOperations["create"]>(async (snapshot) => accepted(write("post-new", snapshot))),
    save: vi.fn<PostEditorOperations["save"]>(async ({ postId, snapshot }) => accepted(write(postId, snapshot))),
    publish: vi.fn<PostEditorOperations["publish"]>(async ({ postId, snapshot, scheduledAt }) => accepted(write(postId, snapshot, scheduledAt))),
    cancel: vi.fn<PostEditorOperations["cancel"]>(async ({ postId }) => {
      const previous = records.get(postId);
      if (!previous) return { ok: false, reason: "conflict" };
      const post = { ...previous.post, status: "draft", publishMode: "immediate", scheduledAt: undefined } as const;
      return accepted({ ...previous, post, version: previous.version + 1 });
    }),
    remove: vi.fn<PostEditorOperations["remove"]>(async ({ postId }) => {
      records.delete(postId);
      return accepted(undefined);
    }),
  };

  return { catalog, operations };
}

function setupEditor(posts?: readonly PostDraft[]) {
  const setup = createOperations(posts);
  render(<PostEditorPanel initialCatalog={setup.catalog} operations={setup.operations} role="editor" />);
  return setup;
}

describe("PostEditorPanel", () => {
  it("opens one record from the editorial catalog, exposes its status and keeps its slug fixed", async () => {
    const user = userEvent.setup();
    setupEditor();

    expect(screen.getByLabelText("Sesión activa")).toHaveTextContent("SESIÓN ACTIVA / editor");
    const selector = screen.getByLabelText("Publicación activa");
    expect(within(selector).getAllByRole("option")).toHaveLength(3);
    expect(within(selector).getByRole("option", { name: /Borrador · 2026-11-14/u })).toBeVisible();
    expect(screen.getByLabelText("Título editorial")).toHaveValue(draft.title);

    await user.selectOptions(selector, published.id);
    expect(screen.getByLabelText("Título editorial")).toHaveValue(published.title);
    expect(screen.getByLabelText("Slug público")).toHaveAttribute("readonly");
  });

  it("saves incomplete manual drafts without attempting a publication", async () => {
    const user = userEvent.setup();
    const { operations } = setupEditor();

    await user.clear(screen.getByLabelText("Título editorial"));
    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));

    expect(operations.save).toHaveBeenCalledWith(expect.objectContaining({ snapshot: expect.objectContaining({ title: "" }) }));
    expect(screen.getByRole("status")).toHaveTextContent("Borrador guardado.");
    expect(operations.publish).not.toHaveBeenCalled();
  });

  it("inserts safe Markdown and previews the active document in an accessible dialog", async () => {
    const user = userEvent.setup();
    setupEditor();

    await user.click(screen.getByRole("button", { name: "Insertar Cursiva" }));
    expect((screen.getByLabelText("Cuerpo Markdown") as HTMLTextAreaElement).value).toContain("*énfasis*");

    await user.click(screen.getByRole("button", { name: "Abrir preview" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Vista previa del contenido Markdown actual");
    expect(screen.getByRole("dialog")).toHaveTextContent("# Registro de trabajo");
  });

  it("previews a different cover selected from the configured catalog", async () => {
    const user = userEvent.setup();
    setupEditor();

    await user.selectOptions(screen.getByLabelText("Portada local"), "cover-architecture");

    expect(screen.getByLabelText("Portada local")).toHaveValue("cover-architecture");
    expect(screen.getByAltText("Estructura brutalista de hormigón con diagonales geométricas y sombras duras")).toBeInTheDocument();
  });

  it("preserves typed tag separators until both tags can be saved", async () => {
    const user = userEvent.setup();
    const { operations } = setupEditor();
    const tags = screen.getByLabelText("Tags");

    await user.clear(tags);
    await user.type(tags, "editorial, diseño");
    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));

    expect(tags).toHaveValue("editorial, diseño");
    expect(operations.save).toHaveBeenCalledWith(expect.objectContaining({
      snapshot: expect.objectContaining({ tags: ["editorial", "diseño"] }),
    }));
  });

  it("opens and closes the mobile inspector with Escape and restores focus", async () => {
    const user = userEvent.setup();
    setupEditor();

    const inspectorTrigger = screen.getByRole("button", { name: /ABRIR INSPECTOR/u });
    await user.click(inspectorTrigger);
    expect(screen.getByRole("dialog", { name: "Inspector editorial" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Inspector editorial" })).not.toBeInTheDocument();
    expect(inspectorTrigger).toHaveFocus();
  });

  it("removes a cover and confirms withdrawal before creating a new draft", async () => {
    const user = userEvent.setup();
    const { operations } = setupEditor([draft]);

    await user.click(screen.getByRole("button", { name: "Quitar portada" }));
    await user.click(within(screen.getByRole("dialog", { name: "Eliminar portada" })).getByRole("button", { name: "Confirmar eliminación" }));
    expect(screen.getByLabelText("Portada local")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Retirar documento" }));
    expect(operations.remove).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole("dialog", { name: "Eliminar documento" })).getByRole("button", { name: "Confirmar eliminación" }));
    expect(operations.remove).toHaveBeenCalledWith({ postId: draft.id, version: 1 });
    expect(screen.getByRole("heading", { name: "No hay una pieza activa" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Nuevo borrador" }));
    expect(await screen.findByLabelText("Título editorial")).toHaveValue("");
    expect(screen.getByRole("status")).toHaveTextContent("Nuevo borrador creado.");
  });

  it("writes a valid edit only after the configured 800 ms debounce", async () => {
    vi.useFakeTimers();
    try {
      const { operations } = setupEditor();
      fireEvent.change(screen.getByLabelText("Título editorial"), { target: { value: "Título autoguardado" } });

      await act(() => vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS - 1));
      expect(operations.save).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(operations.save).toHaveBeenCalledWith({
        postId: draft.id,
        version: 1,
        snapshot: expect.objectContaining({ title: "Título autoguardado" }),
      });
      expect(screen.getByRole("status")).toHaveTextContent("Autoguardado.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not autosave an invalid title and associates the field with its error", async () => {
    vi.useFakeTimers();
    try {
      const { operations } = setupEditor();
      const title = screen.getByLabelText("Título editorial");
      fireEvent.change(title, { target: { value: "" } });

      await act(() => vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS));

      expect(operations.save).not.toHaveBeenCalled();
      expect(screen.getByRole("status")).toHaveTextContent("Autoguardado detenido");
      expect(title).toHaveAccessibleDescription(expect.stringContaining("El título es obligatorio."));
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps newer text after an in-flight save and uses the acknowledged version for the next save", async () => {
    const user = userEvent.setup();
    const { operations } = setupEditor();
    let confirmSave!: (result: EditorialResult<EditorialPost>) => void;
    operations.save.mockImplementationOnce(() => new Promise((resolve) => { confirmSave = resolve; }));
    const title = screen.getByLabelText("Título editorial");
    fireEvent.change(title, { target: { value: "Primer cambio" } });
    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));
    fireEvent.change(title, { target: { value: "Cambio durante el guardado" } });

    await act(async () => confirmSave(accepted({ post: { ...draft, title: "Primer cambio" }, slugLocked: false, version: 2 })));
    expect(title).toHaveValue("Cambio durante el guardado");
    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));

    expect(operations.save).toHaveBeenLastCalledWith({
      postId: draft.id,
      version: 2,
      snapshot: expect.objectContaining({ title: "Cambio durante el guardado" }),
    });
  });

  it("keeps local text on write failure and reports saving only after a successful retry", async () => {
    const user = userEvent.setup();
    const { operations } = setupEditor();
    operations.save.mockResolvedValueOnce({ ok: false, reason: "unavailable" });
    fireEvent.change(screen.getByLabelText("Título editorial"), { target: { value: "Cambio pendiente" } });

    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));
    expect(screen.getByRole("status")).toHaveTextContent("No se pudo conectar");
    expect(screen.getByLabelText("Título editorial")).toHaveValue("Cambio pendiente");

    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));
    expect(screen.getByRole("status")).toHaveTextContent("Borrador guardado.");
  });

  it("keeps conflicting content until the editor explicitly loads the remote revision", async () => {
    const user = userEvent.setup();
    const { catalog, operations } = setupEditor();
    operations.save.mockResolvedValueOnce({ ok: false, reason: "conflict" });
    operations.list.mockResolvedValueOnce(accepted({
      covers: catalog.covers,
      posts: [{ post: { ...draft, title: "Revisión de otra sesión" }, slugLocked: false, version: 2 }],
    }));
    const title = screen.getByLabelText("Título editorial");
    fireEvent.change(title, { target: { value: "Mi revisión" } });

    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));
    expect(title).toHaveValue("Mi revisión");
    expect(screen.getByRole("button", { name: "Guardar borrador" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copiar texto del borrador" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Recargar versión remota" }));

    expect(title).toHaveValue("Revisión de otra sesión");
    expect(screen.getByRole("button", { name: "Guardar borrador" })).toBeEnabled();
  });

  it("passes only a valid future UTC schedule and can cancel it without unlocking the slug", async () => {
    const user = userEvent.setup();
    const { operations } = setupEditor();

    await user.clear(screen.getByLabelText("Título editorial"));
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("El título es obligatorio.");
    expect(operations.publish).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Título editorial"), "Título programado");
    await user.click(screen.getByRole("radio", { name: "Programada" }));
    fireEvent.change(screen.getByLabelText("Fecha programada (UTC)"), { target: { value: "2099-12-01T09:00:00.000Z" } });
    await user.click(screen.getByRole("button", { name: "Programar" }));
    expect(operations.publish).toHaveBeenCalledWith(expect.objectContaining({ scheduledAt: "2099-12-01T09:00:00.000Z" }));
    expect(screen.getByRole("status")).toHaveTextContent("Publicación programada.");
    expect(screen.getByLabelText("Slug público")).toHaveAttribute("readonly");

    await user.click(screen.getByRole("button", { name: "Cancelar programación" }));
    expect(operations.cancel).toHaveBeenCalledWith({ postId: draft.id, version: 2 });
    expect(screen.getByRole("status")).toHaveTextContent("Programación cancelada.");
    expect(screen.getByLabelText("Slug público")).toHaveAttribute("readonly");
  });
});
