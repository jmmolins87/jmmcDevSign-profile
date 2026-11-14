import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PostEditorPanel } from "@/app/es/blog/editor/post-editor-panel";
import { AUTOSAVE_DEBOUNCE_MS } from "@/app/es/blog/domain";
import { loginMockSession } from "@/app/es/auth/mock-session";
import { POST_FIXTURES } from "@/app/es/blog/repositories/post-fixtures";
import { createClientPostRepository } from "@/app/es/blog/repositories/post-repository";

describe("PostEditorPanel", () => {
  it("shows the active session in the command bar", async () => {
    await loginMockSession("editor@jmmcdevsign.es", "jmmc-editor-demo");
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    expect(screen.getByLabelText("Sesión activa")).toHaveTextContent("SESIÓN ACTIVA / editor");
  });

  it("renders the command bar, simulator, canvas and inspector regions", () => {
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    expect(screen.getByRole("link", { name: "[ PANEL ]" })).toHaveAttribute("href", "/es");
    expect(screen.getByRole("region", { name: "Simulador de estados del editor" })).toBeInTheDocument();
    expect(screen.getByLabelText("Cuerpo Markdown")).toBeInTheDocument();
    expect(screen.getAllByText("Inspector / metadata")).toHaveLength(1);
  });

  it("keeps the editor composition when the active post is a draft", () => {
    const repository = createClientPostRepository({ seed: [POST_FIXTURES[0]] });

    render(<PostEditorPanel repository={repository} />);

    expect(screen.getByLabelText("Título editorial")).toHaveValue("Notas de un sistema editorial que todavía está en construcción");
    expect(screen.getByText("Borrador")).toBeInTheDocument();
    expect(screen.getByText("{ STATUS: BORRADOR }")).toBeInTheDocument();
  });

  it("announces simulated validation and empty states", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    await user.click(screen.getByRole("button", { name: "error" }));
    expect(screen.getByText("Error de validación: simulación visible.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "empty" }));
    expect(screen.getByRole("heading", { name: "No hay una pieza activa" })).toBeInTheDocument();
    expect(screen.getByText("Estado vacío simulado.")).toBeInTheDocument();
  });

  it("announces manual save and publish actions", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    await user.click(screen.getByRole("button", { name: "Guardar borrador" }));
    expect(screen.getByText(/Guardado mock:/u)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Publicar" }));
    expect(screen.getByText(/Publicación mock:/u)).toBeInTheDocument();
  });

  it("inserts Markdown from the toolbar and opens the accessible preview", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    const body = screen.getByLabelText("Cuerpo Markdown");
    await user.click(screen.getByRole("button", { name: "Insertar Cursiva" }));

    expect((body as HTMLTextAreaElement).value).toContain("*énfasis*");

    await user.click(screen.getByRole("button", { name: "Abrir preview" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Vista previa del contenido Markdown actual");
    expect(screen.getByRole("dialog")).toHaveTextContent("# Registro de trabajo");
  });

  it("allows the active cover fixture to be replaced from the canvas", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    await user.selectOptions(screen.getByLabelText("Portada local"), "cover-architecture");

    expect(screen.getByLabelText("Portada local")).toHaveValue("cover-architecture");
    expect(screen.getByAltText("Estructura brutalista de hormigón con diagonales geométricas y sombras duras")).toBeInTheDocument();
  });

  it("exposes editable inspector metadata and publication controls", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: POST_FIXTURES });

    render(<PostEditorPanel repository={repository} />);

    const slug = screen.getByLabelText("Slug público");
    const category = screen.getByLabelText("Categoría");
    const tags = screen.getByLabelText("Tags");
    const excerpt = screen.getByLabelText("Resumen SEO / RSS");

    await user.clear(slug);
    await user.type(slug, "nuevo-slug-editorial");
    await user.clear(category);
    await user.type(category, "Arquitectura");
    fireEvent.change(tags, { target: { value: "frontend, arquitectura" } });
    await user.clear(excerpt);
    await user.type(excerpt, "Resumen breve para la lectura pública.");
    await user.click(screen.getByRole("radio", { name: "Programada" }));

    expect(slug).toHaveValue("nuevo-slug-editorial");
    expect(category).toHaveValue("Arquitectura");
    expect(tags).toHaveValue("frontend, arquitectura");
    expect(excerpt).toHaveValue("Resumen breve para la lectura pública.");
    expect(screen.getByLabelText("Fecha programada (UTC)")).toBeInTheDocument();
    expect(screen.getAllByText("{ ACCESS // RIGHTS }")).toHaveLength(1);
    expect(screen.getAllByText("{ ZONA CRÍTICA }")).toHaveLength(1);
    expect(screen.getByText("Palabras")).toBeInTheDocument();
  });

  it("opens and closes the mobile inspector with Escape", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: [POST_FIXTURES[0]] });

    render(<PostEditorPanel repository={repository} />);

    const inspectorTrigger = screen.getByRole("button", { name: /ABRIR INSPECTOR/u });
    await user.click(inspectorTrigger);
    expect(screen.getByRole("dialog", { name: "Inspector editorial" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Inspector editorial" })).not.toBeInTheDocument();
    expect(inspectorTrigger).toHaveFocus();
  });

  it("confirms cover removal, deletes the active document and creates a new draft", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: [POST_FIXTURES[0]] });

    render(<PostEditorPanel repository={repository} />);

    await user.click(screen.getByRole("button", { name: "Quitar portada" }));
    expect(screen.getByRole("dialog", { name: "Eliminar portada" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar eliminación" }));
    expect(screen.getByLabelText("Portada local")).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Eliminar borrador" }));
    expect(screen.getByRole("dialog", { name: "Eliminar documento" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar eliminación" }));
    expect(screen.getByRole("heading", { name: "No hay una pieza activa" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /CREAR \/ RECUPERAR BORRADOR/u }));
    expect(await screen.findByLabelText("Título editorial")).toBeInTheDocument();
    expect(screen.getByText("Nuevo borrador creado en el repositorio mock.")).toBeInTheDocument();
  });

  it("autoguards valid edits only after the configured debounce", async () => {
    vi.useFakeTimers();
    try {
      const repository = createClientPostRepository({ seed: [POST_FIXTURES[0]] });
      render(<PostEditorPanel repository={repository} />);

      fireEvent.change(screen.getByLabelText("Título editorial"), { target: { value: "Título autoguardado" } });
      expect(repository.getSnapshot()[0].title).toBe(POST_FIXTURES[0].title);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS - 1);
      });
      expect(repository.getSnapshot()[0].title).toBe(POST_FIXTURES[0].title);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(repository.getSnapshot()[0].title).toBe("Título autoguardado");
      expect(screen.getByText(/Autoguardado mock:/u)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not autosave an invalid document and announces the validation reason", async () => {
    vi.useFakeTimers();
    try {
      const repository = createClientPostRepository({ seed: [POST_FIXTURES[0]] });
      render(<PostEditorPanel repository={repository} />);

      fireEvent.change(screen.getByLabelText("Título editorial"), { target: { value: "" } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(AUTOSAVE_DEBOUNCE_MS);
      });

      expect(repository.getSnapshot()[0].title).toBe(POST_FIXTURES[0].title);
      expect(screen.getByText("Autoguardado detenido: corrige los campos marcados.")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("El título es obligatorio.");
    } finally {
      vi.useRealTimers();
    }
  });

  it("announces the memory fallback when localStorage persistence fails", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: POST_FIXTURES });
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage unavailable");
    });

    try {
      render(<PostEditorPanel repository={repository} />);
      await user.click(screen.getByRole("button", { name: "Guardar borrador" }));

      expect(screen.getByText("{ SINCRONIZACIÓN: MEMORIA }", { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/los cambios siguen en memoria/u)).toBeInTheDocument();
    } finally {
      setItem.mockRestore();
    }
  });

  it("blocks incomplete publication and stores a future UTC schedule", async () => {
    const user = userEvent.setup();
    const repository = createClientPostRepository({ seed: [POST_FIXTURES[0]] });

    render(<PostEditorPanel repository={repository} />);

    await user.clear(screen.getByLabelText("Título editorial"));
    await user.click(screen.getByRole("button", { name: "Publicar" }));
    expect(screen.getByText("Error de validación: corrige los campos marcados.")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("El título es obligatorio.");
    expect(repository.getSnapshot()[0].status).toBe("draft");

    await user.type(screen.getByLabelText("Título editorial"), "Título programado");
    await user.click(screen.getByRole("radio", { name: "Programada" }));
    fireEvent.change(screen.getByLabelText("Fecha programada (UTC)"), { target: { value: "2099-12-01T09:00:00.000Z" } });
    await user.click(screen.getByRole("button", { name: "Publicar" }));

    expect(repository.getSnapshot()[0].status).toBe("scheduled");
    expect(repository.getSnapshot()[0].scheduledAt).toBe("2099-12-01T09:00:00.000Z");
    expect(screen.getByText(/Programación mock:/u)).toBeInTheDocument();
  });
});
