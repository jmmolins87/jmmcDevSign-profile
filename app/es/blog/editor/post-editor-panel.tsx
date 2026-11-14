"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Badge, Button, CardMeta, Drawer, InputField, Modal } from "@/app/components/ui";
import { useMockSession } from "@/app/es/auth/mock-session";
import {
  AUTOSAVE_DEBOUNCE_MS,
  calculatePostTelemetry,
  validatePostForPublishing,
  type CreatePostInput,
  type PostDraft,
  type PostValidationErrors,
  type PostStatus,
  type UpdatePostInput,
} from "@/app/es/blog/domain";
import { coverAssetRepository } from "@/app/es/blog/repositories/cover-asset-repository";
import { postRepository } from "@/app/es/blog/repositories/post-repositories";
import type { ClientPostRepository, PostPersistenceState } from "@/app/es/blog/repositories/post-repository";
import { MarkdownRenderer } from "@/app/es/blog/markdown/markdown-renderer";

const statusLabels: Record<PostStatus, string> = {
  draft: "Borrador",
  review: "En revisión",
  scheduled: "Programado",
  published: "Publicado",
};

type DemoState = "editing" | "saved" | "published" | "error" | "empty";
type DeleteTarget = "cover" | "post";

const demoStateLabels: Record<DemoState, string> = {
  editing: "Editando",
  saved: "Sincronizado",
  published: "Publicado",
  error: "Error de validación",
  empty: "Nuevo documento",
};

type PostEditorPanelProps = {
  repository?: ClientPostRepository;
};

export function PostEditorPanel({ repository = postRepository }: PostEditorPanelProps) {
  const posts = useSyncExternalStore(repository.subscribe, repository.getSnapshot, repository.getSnapshot);
  const persistenceState = useSyncExternalStore(repository.subscribe, repository.getPersistenceState, repository.getPersistenceState);
  const session = useMockSession();
  const [activePostId, setActivePostId] = useState<string | null>(() => posts[0]?.id ?? null);
  const post = posts.find((candidate) => candidate.id === activePostId) ?? null;
  const [demoState, setDemoState] = useState<DemoState>("editing");
  const [feedback, setFeedback] = useState("Cambios locales sin guardar.");
  const [isSimulatedEmpty, setIsSimulatedEmpty] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [validationErrors, setValidationErrors] = useState<PostValidationErrors>({});
  const [draft, setDraft] = useState<PostDraft | null>(post);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftRef = useRef<PostDraft | null>(draft);
  const dirtyDraftRef = useRef(false);

  const autosaveDraft = useCallback(async () => {
    const currentDraft = draftRef.current;
    if (!currentDraft || !dirtyDraftRef.current) return;

    const validation = validatePostForPublishing(currentDraft);
    setValidationErrors(validation.errors);
    if (!validation.valid) {
      setDemoState("error");
      setFeedback("Autoguardado detenido: corrige los campos marcados.");
      return;
    }

    try {
      const updatedPost = await repository.update(currentDraft.id, toUpdateInput({ ...currentDraft, status: "draft" }));
      dirtyDraftRef.current = false;
      setDraft(updatedPost);
      setDemoState("saved");
      setFeedback(`Autoguardado mock: ${updatedPost.updatedAt}.`);
    } catch {
      setDemoState("error");
      setFeedback("No se pudo autoguardar; los cambios siguen locales.");
    }
  }, [repository]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (!draft || !dirtyDraftRef.current || isSimulatedEmpty) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      void autosaveDraft();
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [autosaveDraft, draft, isSimulatedEmpty]);

  function updateDraft<Key extends keyof PostDraft>(key: Key, value: PostDraft[Key]) {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    dirtyDraftRef.current = true;
    setValidationErrors({});
    setDemoState("editing");
    setFeedback(`Cambios locales sin guardar. Autoguardado en ${AUTOSAVE_DEBOUNCE_MS} ms.`);
  }

  function clearAutosave() {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = null;
    dirtyDraftRef.current = false;
  }

  async function saveDraft() {
    if (!draft) return;

    clearAutosave();
    try {
      const updatedPost = await repository.update(draft.id, toUpdateInput({ ...draft, status: "draft" }));
      setDraft(updatedPost);
      setDemoState("saved");
      setFeedback(`Guardado mock: ${updatedPost.updatedAt}.`);
    } catch {
      dirtyDraftRef.current = true;
      setDemoState("error");
      setFeedback("No se pudo guardar el borrador en el repositorio mock.");
    }
  }

  async function publishPost() {
    if (!draft) return;

    const validation = validatePostForPublishing(draft);
    setValidationErrors(validation.errors);
    if (!validation.valid) {
      setDemoState("error");
      setFeedback("Error de validación: corrige los campos marcados.");
      return;
    }

    clearAutosave();
    const isScheduled = draft.publishMode === "scheduled";
    try {
      const updatedPost = await repository.update(draft.id, toUpdateInput({
        ...draft,
        publishedAt: isScheduled ? undefined : new Date().toISOString(),
        status: isScheduled ? "scheduled" : "published",
      }));
      setDraft(updatedPost);
      setDemoState(isScheduled ? "saved" : "published");
      setFeedback(isScheduled ? `Programación mock: ${updatedPost.scheduledAt}.` : `Publicación mock: ${updatedPost.slug}.`);
    } catch {
      dirtyDraftRef.current = true;
      setDemoState("error");
      setFeedback("No se pudo publicar en el repositorio mock.");
    }
  }

  async function createOrRecoverDraft() {
    const recoverableDraft = posts.find((candidate) => candidate.status === "draft");
    if (recoverableDraft) {
      setActivePostId(recoverableDraft.id);
      setDraft(recoverableDraft);
      setIsSimulatedEmpty(false);
      setDemoState("editing");
      setFeedback("Borrador recuperado desde el repositorio mock.");
      return;
    }

    const createdPost = await repository.create(createDefaultDraftInput());
    setActivePostId(createdPost.id);
    setDraft(createdPost);
    setIsSimulatedEmpty(false);
    setDemoState("editing");
    setFeedback("Nuevo borrador creado en el repositorio mock.");
  }

  async function confirmDeletion() {
    if (!draft || !deleteTarget) return;

    if (deleteTarget === "cover") {
      clearAutosave();
      const updatedPost = await repository.update(draft.id, { coverAssetId: undefined });
      setDraft(updatedPost);
      setDeleteTarget(null);
      setFeedback("Portada eliminada del documento.");
      return;
    }

    await repository.remove(draft.id);
    setActivePostId(null);
    setDraft(null);
    setDeleteTarget(null);
    setIsSimulatedEmpty(true);
    setDemoState("empty");
    setFeedback("Documento eliminado. El editor está vacío.");
  }

  function insertMarkdown(before: string, after = "", fallback = "texto") {
    const textarea = bodyRef.current;
    if (!textarea || !draft) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = draft.bodyMarkdown.slice(start, end) || fallback;
    const nextBody = `${draft.bodyMarkdown.slice(0, start)}${before}${selectedText}${after}${draft.bodyMarkdown.slice(end)}`;
    updateDraft("bodyMarkdown", nextBody);
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
  }

  if (!post || !draft || isSimulatedEmpty) {
    return (
      <section className="grid gap-space-lg" data-post-editor>
        <EditorCommandBar
          demoState="empty"
          feedback="Estado vacío simulado."
          onPublish={publishPost}
          onSave={saveDraft}
          persistenceState={persistenceState}
          sessionLabel={session ? `SESIÓN ACTIVA / ${session.role}` : undefined}
        />
        <StateSimulator activeState="empty" onStateChange={(state) => {
          setDemoState(state);
          setIsSimulatedEmpty(state === "empty");
        }} />
        <div className="border border-border bg-surface-container-lowest px-space-lg py-space-2xl text-center sm:px-space-xl">
          <p className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent">{`{ ESTADO: NUEVO DOCUMENTO }`}</p>
          <h1 className="mt-space-md font-headline text-headline-lg uppercase text-primary">No hay una pieza activa</h1>
          <p className="mx-auto mt-space-sm max-w-xl text-body-md text-on-surface-variant">Crea o recupera un borrador para volver al canvas editorial.</p>
          <Button className="mt-space-lg" onClick={() => void createOrRecoverDraft()} variant="primary">[ CREAR / RECUPERAR BORRADOR ]</Button>
        </div>
        <EditorFooter />
      </section>
    );
  }

  const telemetry = calculatePostTelemetry(draft.bodyMarkdown);
  const coverAssets = coverAssetRepository.list();
  const coverAsset = coverAssetRepository.get(draft.coverAssetId);

  return (
    <section className="grid gap-space-lg" data-post-editor>
      <EditorCommandBar
        demoState={demoState}
        feedback={feedback}
        onPublish={publishPost}
        onSave={saveDraft}
        persistenceState={persistenceState}
        postStatus={draft.status}
        sessionLabel={session ? `SESIÓN ACTIVA / ${session.role}` : undefined}
      />
      <StateSimulator activeState={demoState} onStateChange={(state) => {
        setDemoState(state);
        setFeedback(`${demoStateLabels[state]}: simulación visible.`);
        setIsSimulatedEmpty(state === "empty");
      }} />

      <div className="grid min-w-0 gap-space-lg lg:grid-cols-12" data-editor-layout>
        <article className="min-w-0 border border-border bg-surface-container-lowest p-space-md sm:p-space-lg lg:col-span-8" data-editor-canvas>
          <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-border pb-space-md font-mono text-mono-code uppercase text-on-surface-variant">
            <span className="text-accent">{`{ CANVAS // ACTIVE DOCUMENT }`}</span>
            <span>{`{ ${draft.category || "SIN CATEGORÍA"} }`}</span>
          </div>
          <div className="grid gap-space-lg py-space-lg">
            <div className="grid gap-space-sm">
              <label className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent" htmlFor="post-title">Título editorial</label>
              <textarea
                aria-describedby={validationErrors.title ? "post-title-hint post-title-error" : "post-title-hint"}
                aria-invalid={validationErrors.title ? "true" : undefined}
                className="min-h-28 w-full resize-y border-0 border-b-2 border-border bg-transparent p-0 pb-space-sm font-headline text-headline-xl-mobile uppercase leading-[1.05] text-primary placeholder:text-outline focus:border-accent focus:outline-none md:text-headline-xl"
                id="post-title"
                onChange={(event) => updateDraft("title", event.target.value)}
                placeholder="ESCRIBE EL TÍTULO DEL ARTÍCULO..."
                rows={2}
                value={draft.title}
              />
              <span className="text-body-sm text-on-surface-variant" id="post-title-hint">El título se mantiene como dato editable del documento.</span>
              {validationErrors.title ? <span className="text-body-sm text-error" id="post-title-error" role="alert">{validationErrors.title}</span> : null}
            </div>

            <div className="grid gap-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <label className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent" htmlFor="post-cover">Portada local</label>
                {coverAsset ? <Button onClick={() => setDeleteTarget("cover")} size="sm" variant="danger">Quitar portada</Button> : null}
              </div>
              <select
                className="min-h-11 w-full border border-border bg-surface-container px-space-md font-mono text-body-md uppercase text-on-surface focus:border-accent focus:outline-none"
                id="post-cover"
                onChange={(event) => updateDraft("coverAssetId", event.target.value || undefined)}
                value={draft.coverAssetId ?? ""}
              >
                <option value="">Sin portada</option>
                {coverAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.label}</option>)}
              </select>
              <div className="relative aspect-[16/7] overflow-clip border border-border bg-surface-container-highest">
                {coverAsset ? (
                  <Image alt={coverAsset.alt} className="object-cover grayscale contrast-125" fill sizes="(min-width: 1024px) 60vw, 100vw" src={coverAsset.src} />
                ) : (
                  <div className="grid h-full place-items-center font-mono text-mono-code uppercase text-on-surface-variant">{`{ SIN PORTADA }`}</div>
                )}
                <span className="absolute start-space-sm top-space-sm bg-background/90 px-space-sm py-space-xs font-mono text-mono-code uppercase text-accent">{`{ COVER // ${coverAsset?.label ?? "EMPTY"} }`}</span>
              </div>
            </div>

            <div className="grid gap-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <label className="font-mono text-mono-code uppercase tracking-[0.12em] text-accent" htmlFor="post-body">Cuerpo Markdown</label>
                <span className="font-mono text-[0.6875rem] uppercase text-on-surface-variant">{`{ ${telemetry.wordCount} PALABRAS // ${telemetry.readingMinutes} MIN }`}</span>
              </div>
              <MarkdownToolbar onInsert={insertMarkdown} />
              <textarea
                aria-describedby="post-body-hint"
                className="min-h-80 w-full resize-y border border-border bg-surface-container px-space-md py-space-md font-mono text-body-md leading-relaxed text-on-surface placeholder:text-on-surface-variant focus:border-accent focus:outline-none"
                id="post-body"
                onChange={(event) => updateDraft("bodyMarkdown", event.target.value)}
                ref={bodyRef}
                value={draft.bodyMarkdown}
              />
              <span className="text-body-sm text-on-surface-variant" id="post-body-hint">Solo se renderiza la sintaxis Markdown admitida por la toolbar.</span>
              <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-border pt-space-sm">
                <span className="font-mono text-[0.6875rem] uppercase text-on-surface-variant">Nivel técnico: {telemetry.technicalLevel}</span>
                <Button onClick={() => setIsPreviewOpen(true)} size="sm" variant="secondary">Abrir preview</Button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-space-sm border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant">
            <span>{`{ STATUS: ${statusLabels[draft.status].toUpperCase()} }`}</span>
            <span>{`{ UPDATED: ${draft.updatedAt} }`}</span>
          </div>
        </article>

        <Button className="lg:hidden" onClick={() => setIsInspectorOpen(true)} variant="secondary">[ ABRIR INSPECTOR ]</Button>

        <aside className="hidden min-w-0 border border-border bg-surface-container-lowest p-space-md sm:p-space-lg lg:col-span-4 lg:block" data-editor-inspector>
          <InspectorPanel draft={draft} errors={validationErrors} onChange={updateDraft} onRequestDelete={setDeleteTarget} telemetry={telemetry} />
        </aside>
      </div>

      <Modal
        description="Vista previa del contenido Markdown actual, sin ejecutar HTML arbitrario."
        footer={<Button onClick={() => setIsPreviewOpen(false)} variant="secondary">Cerrar preview</Button>}
        onClose={() => setIsPreviewOpen(false)}
        open={isPreviewOpen}
        title={draft.title || "Preview editorial"}
      >
        <article className="grid gap-space-md">
          <p className="text-body-lg text-on-surface-variant">{draft.excerpt}</p>
          <MarkdownRenderer markdown={draft.bodyMarkdown} />
        </article>
      </Modal>

      {isInspectorOpen ? (
        <Drawer
          description="Metadatos y publicación del documento activo."
          modal={false}
          onClose={() => setIsInspectorOpen(false)}
          open
          title="Inspector editorial"
        >
          <InspectorPanel draft={draft} errors={validationErrors} onChange={updateDraft} onRequestDelete={setDeleteTarget} telemetry={telemetry} />
        </Drawer>
      ) : null}

      <Modal
        description="Esta acción modifica el repositorio mock local y no puede deshacerse desde esta pantalla."
        footer={(
          <div className="flex flex-wrap justify-end gap-space-sm">
            <Button onClick={() => setDeleteTarget(null)} variant="secondary">Cancelar</Button>
            <Button onClick={() => void confirmDeletion()} variant="danger">Confirmar eliminación</Button>
          </div>
        )}
        onClose={() => setDeleteTarget(null)}
        open={deleteTarget !== null}
        title={deleteTarget === "cover" ? "Eliminar portada" : "Eliminar documento"}
      >
        <p className="text-body-md text-on-surface-variant">
          {deleteTarget === "cover" ? "La portada se quitará del documento activo." : "El borrador se eliminará y el editor pasará al estado vacío."}
        </p>
      </Modal>

      <EditorFooter />
    </section>
  );
}

function toUpdateInput(post: PostDraft): UpdatePostInput {
  const { createdAt, id, updatedAt, ...input } = post;
  void createdAt;
  void id;
  void updatedAt;
  return input;
}

function createDefaultDraftInput(): CreatePostInput {
  return {
    access: "public",
    bodyMarkdown: "# Nuevo documento\n\nEmpieza a escribir la pieza editorial.",
    category: "",
    excerpt: "",
    publishMode: "immediate",
    rights: "CC-BY-4.0",
    slug: "nuevo-documento",
    status: "draft",
    tags: [],
    title: "",
  };
}

function MarkdownToolbar({ onInsert }: { onInsert: (before: string, after?: string, fallback?: string) => void }) {
  const actions = [
    { after: "", before: "# ", fallback: "encabezado", label: "Encabezado" },
    { after: "**", before: "**", fallback: "énfasis fuerte", label: "Negrita" },
    { after: "*", before: "*", fallback: "énfasis", label: "Cursiva" },
    { after: "](https://example.com)", before: "[", fallback: "enlace", label: "Enlace" },
    { after: "", before: "> ", fallback: "cita", label: "Cita" },
    { after: "`", before: "`", fallback: "código", label: "Código" },
    { after: "](/assets/landing/Retrato.png)", before: "![", fallback: "alt", label: "Imagen" },
    { after: "\n\n---\n\n", before: "", fallback: "", label: "Divisor" },
  ] as const;

  return (
    <div aria-label="Toolbar Markdown" className="flex flex-wrap gap-space-xs border border-border bg-surface-container-low p-space-xs" role="toolbar">
      {actions.map((action) => (
        <button
          aria-label={`Insertar ${action.label}`}
          className="min-h-9 border border-transparent px-space-sm font-mono text-[0.6875rem] uppercase text-on-surface-variant transition-colors hover:border-border hover:text-primary active:scale-[0.98]"
          key={action.label}
          onClick={() => onInsert(action.before, action.after, action.fallback)}
          type="button"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

function EditorCommandBar({
  demoState,
  feedback,
  onPublish,
  onSave,
  persistenceState,
  postStatus,
  sessionLabel,
}: {
  demoState: DemoState;
  feedback: string;
  onPublish: () => void;
  onSave: () => void;
  persistenceState: PostPersistenceState;
  postStatus?: PostStatus;
  sessionLabel?: string;
}) {
  return (
    <header className="grid gap-space-md border-y border-border bg-surface-container-lowest px-space-md py-space-sm sm:flex sm:flex-wrap sm:items-center sm:justify-between" data-command-bar>
      <div className="flex min-w-0 flex-wrap items-center gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
        <Link className="text-primary transition-colors hover:text-accent" href="/es/">[ PANEL ]</Link>
        <span aria-hidden="true" className="text-outline">/</span>
        <span className="truncate">POST EDITOR</span>
        <Badge variant={demoState === "error" ? "error" : demoState === "published" ? "active" : "neutral"}>{`{ ESTADO: ${demoStateLabels[demoState].toUpperCase()} }`}</Badge>
        {postStatus ? <span className="text-outline">{statusLabels[postStatus]}</span> : null}
        {sessionLabel ? <span aria-label="Sesión activa" className="text-accent">{sessionLabel}</span> : null}
      </div>
      <div className="flex flex-wrap items-center gap-space-sm">
        <span aria-live="polite" className="font-mono text-[0.6875rem] uppercase text-on-surface-variant">
          {persistenceState.mode === "memory" ? "{ SINCRONIZACIÓN: MEMORIA }" : "{ SINCRONIZACIÓN: LOCAL }"}
          {persistenceState.message ? ` ${persistenceState.message}` : ""}
        </span>
        <span aria-live="polite" className="font-mono text-[0.6875rem] uppercase text-on-surface-variant">{feedback}</span>
        <Button onClick={onSave} size="sm" variant="secondary">Guardar borrador</Button>
        <Button onClick={onPublish} size="sm" variant="primary">Publicar</Button>
      </div>
    </header>
  );
}

function StateSimulator({ activeState, onStateChange }: { activeState: DemoState; onStateChange: (state: DemoState) => void }) {
  const states: readonly DemoState[] = ["editing", "saved", "published", "error", "empty"];

  return (
    <section aria-label="Simulador de estados del editor" className="flex flex-col gap-space-sm border border-border bg-surface-container-low px-space-md py-space-sm sm:flex-row sm:flex-wrap sm:items-center" data-state-simulator>
      <span className="font-mono text-mono-code uppercase text-outline">{`{ SIMULADOR DE ESTADOS }`}</span>
      <div className="flex flex-wrap gap-space-xs">
        {states.map((state) => (
          <button
            aria-pressed={activeState === state}
            className="min-h-9 border border-border px-space-sm font-mono text-[0.6875rem] uppercase text-on-surface-variant transition-colors hover:border-accent hover:text-primary aria-pressed:border-accent aria-pressed:text-accent"
            key={state}
            onClick={() => onStateChange(state)}
            type="button"
          >
            {state}
          </button>
        ))}
      </div>
    </section>
  );
}

function InspectorPanel({
  draft,
  errors,
  onChange,
  onRequestDelete,
  telemetry,
}: {
  draft: PostDraft;
  errors: PostValidationErrors;
  onChange: <Key extends keyof PostDraft>(key: Key, value: PostDraft[Key]) => void;
  onRequestDelete: (target: DeleteTarget) => void;
  telemetry: ReturnType<typeof calculatePostTelemetry>;
}) {
  return (
    <div className="grid gap-space-lg">
      <div className="flex items-center justify-between gap-space-md border-b border-border pb-space-md">
        <div>
          <CardMeta>Inspector / metadata</CardMeta>
          <h2 className="mt-space-xs font-headline text-headline-md uppercase text-primary">Control editorial</h2>
        </div>
        <span aria-hidden="true" className="font-mono text-mono-code text-accent">✦</span>
      </div>
      <div className="grid gap-space-md">
        <InputField
          description="Se usa en la URL pública y se valida sin normalización automática."
          error={errors.slug}
          id="post-slug"
          label="Slug público"
          onChange={(event) => onChange("slug", event.target.value)}
          value={draft.slug}
        />
        <InputField
          error={errors.category}
          id="post-category"
          label="Categoría"
          onChange={(event) => onChange("category", event.target.value)}
          value={draft.category}
        />
        <InputField
          description="Separa los tags con comas."
          error={errors.tags}
          id="post-tags"
          label="Tags"
          onChange={(event) => onChange("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))}
          value={draft.tags.join(", ")}
        />
        <div className="grid gap-space-sm">
          <label className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary" htmlFor="post-excerpt">Resumen SEO / RSS</label>
          <textarea
            aria-describedby={errors.excerpt ? "post-excerpt-length post-excerpt-error" : "post-excerpt-length"}
            aria-invalid={errors.excerpt ? "true" : undefined}
            className="min-h-24 w-full resize-y border border-border-strong bg-surface-low px-space-md py-space-sm font-mono text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-state-focus focus:outline-none"
            id="post-excerpt"
            onChange={(event) => onChange("excerpt", event.target.value)}
            rows={3}
            value={draft.excerpt}
          />
          <span className="font-mono text-[0.6875rem] uppercase text-on-surface-variant" id="post-excerpt-length">{draft.excerpt.length} / 160 caracteres</span>
          {errors.excerpt ? <span className="text-body-sm text-error" id="post-excerpt-error" role="alert">{errors.excerpt}</span> : null}
        </div>
      </div>

      <fieldset className="grid gap-space-sm border-t border-border pt-space-md">
        <legend className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary">Publicación</legend>
        <label className="flex items-center gap-space-sm font-mono text-body-sm text-on-surface-variant">
          <input checked={draft.publishMode === "immediate"} name="publish-mode" onChange={() => onChange("publishMode", "immediate")} type="radio" value="immediate" />
          Inmediata
        </label>
        <label className="flex items-center gap-space-sm font-mono text-body-sm text-on-surface-variant">
          <input checked={draft.publishMode === "scheduled"} name="publish-mode" onChange={() => onChange("publishMode", "scheduled")} type="radio" value="scheduled" />
          Programada
        </label>
        {draft.publishMode === "scheduled" ? (
          <InputField
            description="Formato ISO explícito, por ejemplo 2026-12-01T09:00:00.000Z."
            error={errors.scheduledAt}
            id="post-scheduled-at"
            label="Fecha programada (UTC)"
            onChange={(event) => onChange("scheduledAt", event.target.value || undefined)}
            placeholder="2026-12-01T09:00:00.000Z"
            value={draft.scheduledAt ?? ""}
          />
        ) : null}
      </fieldset>

      <div className="grid gap-space-sm border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant">
        <p className="text-accent">{`{ TELEMETRÍA }`}</p>
        <div className="flex items-center justify-between"><span>Palabras</span><span className="text-primary">{telemetry.wordCount}</span></div>
        <div className="flex items-center justify-between"><span>Lectura</span><span className="text-primary">{telemetry.readingMinutes} min</span></div>
        <div className="flex items-center justify-between"><span>Nivel</span><span className="text-primary">{telemetry.technicalLevel}</span></div>
      </div>

      <div className="grid gap-space-sm border-t border-border pt-space-md font-mono text-mono-code uppercase text-on-surface-variant">
        <p className="text-accent">{`{ ACCESS // RIGHTS }`}</p>
        <div className="flex items-center justify-between"><span>Acceso</span><span className="text-primary">{draft.access}</span></div>
        <div className="flex items-center justify-between"><span>Derechos</span><span className="text-primary">{draft.rights}</span></div>
      </div>

      <div className="border border-error/50 p-space-md">
        <p className="font-mono text-mono-code uppercase text-error">{`{ ZONA CRÍTICA }`}</p>
        <p className="mt-space-sm text-body-sm text-on-surface-variant">Las acciones destructivas requieren confirmación.</p>
        <Button className="mt-space-md" onClick={() => onRequestDelete("post")} size="sm" variant="danger">Eliminar borrador</Button>
      </div>
    </div>
  );
}

function EditorFooter() {
  return (
    <footer className="flex flex-col gap-space-md border-t border-border pt-space-lg font-mono text-mono-code uppercase text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
      <span><span aria-hidden="true" className="text-accent">✦</span> JUANMA (JMMC) // BRUTALIST EDITORIAL RUNTIME</span>
      <span>{`{ LOCAL MOCK // NO REMOTE SYNC }`}</span>
      <span>© 2025 JMMC</span>
    </footer>
  );
}
