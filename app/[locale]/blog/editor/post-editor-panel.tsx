"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState } from "react";

import { Badge, Button, CardMeta, Drawer, InputField, Modal } from "@/app/components/ui";
import type { UserRole } from "@/app/[locale]/auth/roles";
import { calculatePostTelemetry, type PostDraft, type PostStatus, type PostValidationErrors } from "@/app/[locale]/blog/domain";
import { usePostEditor, type PublicationOptions } from "@/app/[locale]/blog/editor/use-post-editor";
import { MarkdownRenderer } from "@/app/[locale]/blog/markdown/markdown-renderer";
import type { EditorialCatalog, PostEditorOperations, PostSnapshot } from "@/app/[locale]/blog/repositories/post-repository";
import { useLocale } from "@/app/lib/locale-context";

const statusLabels: Record<PostStatus, string> = {
  draft: "Borrador",
  review: "En revisión",
  scheduled: "Programado",
  published: "Publicado",
};

type DeleteTarget = "cover" | "post";

type PostEditorPanelProps = {
  initialCatalog: EditorialCatalog | null;
  operations: PostEditorOperations;
  role: UserRole;
};

export function PostEditorPanel({ initialCatalog, operations, role }: PostEditorPanelProps) {
  const locale = useLocale();
  const editor = usePostEditor(initialCatalog, operations);
  const { catalog, change, draft, feedback, record, errors: validationErrors } = editor;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [clipboardStatus, setClipboardStatus] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const postSelectorRef = useRef<HTMLSelectElement>(null);

  async function confirmDeletion() {
    if (deleteTarget === "cover") {
      change("coverAssetId", undefined);
      setDeleteTarget(null);
      return;
    }

    if (await editor.remove()) {
      setDeleteTarget(null);
      setIsInspectorOpen(false);
      postSelectorRef.current?.focus();
    }
  }

  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText([draft.title, draft.excerpt, draft.bodyMarkdown].join("\n\n"));
      setClipboardStatus("Texto del borrador copiado.");
    } catch {
      setClipboardStatus("No se pudo copiar automáticamente. Puedes seleccionar y copiar el texto del editor.");
    }
  }

  function insertMarkdown(before: string, after = "", fallback = "texto") {
    const textarea = bodyRef.current;
    if (!textarea || !draft) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = draft.bodyMarkdown.slice(start, end) || fallback;
    const nextBody = draft.bodyMarkdown.slice(0, start) + before + selectedText + after + draft.bodyMarkdown.slice(end);
    change("bodyMarkdown", nextBody);
    textarea.focus();
    textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
  }

  const actionDisabled = !draft || editor.busy || editor.conflict;
  const controls = (
    <>
      <header className="grid gap-space-md border-y border-border bg-surface-container-lowest px-space-md py-space-sm sm:flex sm:flex-wrap sm:items-center sm:justify-between" data-command-bar>
        <div className="flex min-w-0 flex-wrap items-center gap-space-sm font-mono text-mono-code uppercase text-on-surface-variant">
          <Link className="text-primary transition-colors hover:text-accent" href={"/" + locale + "/"}>[ PANEL ]</Link>
          <span aria-hidden="true" className="text-outline">/</span>
          <span className="truncate">POST EDITOR</span>
          {record ? <Badge variant={record.post.status === "published" ? "active" : "neutral"}>{statusLabels[record.post.status]}</Badge> : null}
          <span aria-label="Sesión activa" className="text-accent">SESIÓN ACTIVA / {role}</span>
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div aria-live="polite" className="font-mono text-[0.6875rem] uppercase text-on-surface-variant" role="status">
            {feedback.message || (editor.hasUnsavedChanges ? "Cambios sin guardar." : "")}
          </div>
          <Button disabled={actionDisabled} onClick={() => void editor.save(false)} size="sm" variant="secondary">Guardar borrador</Button>
          <Button disabled={actionDisabled} onClick={() => void editor.publish()} size="sm" variant="primary">
            {draft?.publishMode === "scheduled" ? "Programar" : "Publicar"}
          </Button>
        </div>
      </header>
      {catalog ? (
        <div className="flex flex-wrap items-end gap-space-sm border border-border bg-surface-container-low px-space-md py-space-sm">
          <div className="grid min-w-0 grow gap-space-xs">
            <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="editor-post">Publicación activa</label>
            <select
              className="min-h-11 w-full min-w-0 border border-border bg-surface-container px-space-md font-mono text-body-md text-on-surface focus:border-accent focus:outline-none"
              disabled={editor.busy}
              id="editor-post"
              onChange={(event) => {
                editor.select(event.target.value);
                setClipboardStatus("");
              }}
              ref={postSelectorRef}
              value={editor.selectedId ?? ""}
            >
              <option value="">Selecciona una publicación</option>
              {catalog.posts.map(({ post }) => (
                <option key={post.id} value={post.id}>
                  {post.title || "Sin título"} · {statusLabels[post.status]} · {post.updatedAt.slice(0, 10)}
                </option>
              ))}
            </select>
          </div>
          <Button disabled={editor.busy} onClick={() => void editor.create()} variant="secondary">Nuevo borrador</Button>
        </div>
      ) : null}
    </>
  );

  if (!draft || !catalog || !record) {
    return (
      <section className="grid gap-space-lg" data-post-editor>
        {controls}
        <div className="border border-border bg-surface-container-lowest px-space-lg py-space-2xl text-center sm:px-space-xl">
          <h2 className="font-headline text-headline-lg uppercase text-primary">{catalog ? "No hay una pieza activa" : "Catálogo no disponible"}</h2>
          <p className="mx-auto mt-space-sm max-w-xl text-body-md text-on-surface-variant">
            {catalog ? "Selecciona una publicación o crea un borrador." : "Comprueba la conexión e inténtalo de nuevo."}
          </p>
          {!catalog ? <Button className="mt-space-lg" disabled={editor.busy} onClick={() => void editor.reload()} variant="secondary">Reintentar</Button> : null}
        </div>
      </section>
    );
  }

  const telemetry = calculatePostTelemetry(draft.bodyMarkdown);
  const coverAsset = catalog.covers.find((asset) => asset.id === draft.coverAssetId);
  const inspector = {
    actionDisabled,
    draft,
    errors: validationErrors,
    onChange: change,
    onPublicationChange: editor.changePublication,
    onRequestDelete: setDeleteTarget,
    onCancelSchedule: editor.cancelSchedule,
    scheduledAt: record.post.scheduledAt,
    slugLocked: record.slugLocked,
    telemetry,
  };

  return (
    <section className="grid gap-space-lg" data-post-editor>
      {controls}
      {editor.conflict ? (
        <section aria-label="Conflicto de edición" className="grid gap-space-sm border border-error p-space-md">
          <p>Otra sesión guardó una versión más reciente. Recargar el documento descarta los cambios de esta sesión.</p>
          <div className="flex flex-wrap gap-space-sm">
            <Button disabled={editor.busy} onClick={() => void copyDraft()} size="sm" variant="secondary">Copiar texto del borrador</Button>
            <Button disabled={editor.busy} onClick={() => void editor.reload()} size="sm" variant="secondary">Recargar versión remota</Button>
          </div>
          <span aria-live="polite" className="text-body-sm text-on-surface-variant">{clipboardStatus}</span>
        </section>
      ) : null}

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
                onChange={(event) => change("title", event.target.value)}
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
                onChange={(event) => change("coverAssetId", event.target.value || undefined)}
                value={draft.coverAssetId ?? ""}
              >
                <option value="">Sin portada</option>
                {catalog.covers.map((asset) => <option key={asset.id} value={asset.id}>{asset.label}</option>)}
              </select>
              <div className="relative aspect-[16/7] overflow-clip border border-border bg-surface-container-highest">
                {coverAsset ? (
                  <Image alt={coverAsset.alt} className="object-cover" fill sizes="(min-width: 1024px) 60vw, 100vw" src={coverAsset.src} />
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
                onChange={(event) => change("bodyMarkdown", event.target.value)}
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
          <InspectorPanel {...inspector} />
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
          <InspectorPanel {...inspector} />
        </Drawer>
      ) : null}

      <Modal
        description={deleteTarget === "cover" ? "La portada se quitará de la revisión de trabajo." : "El documento dejará de estar disponible y se cancelará su programación."}
        footer={(
          <div className="flex flex-wrap justify-end gap-space-sm">
            <Button onClick={() => setDeleteTarget(null)} variant="secondary">Cancelar</Button>
            <Button disabled={editor.busy} onClick={() => void confirmDeletion()} variant="danger">Confirmar eliminación</Button>
          </div>
        )}
        onClose={() => setDeleteTarget(null)}
        open={deleteTarget !== null}
        title={deleteTarget === "cover" ? "Eliminar portada" : "Eliminar documento"}
      >
        <p className="text-body-md text-on-surface-variant">
          {deleteTarget === "cover" ? "La portada se quitará del documento activo." : "Las revisiones se conservarán para auditoría."}
        </p>
      </Modal>

    </section>
  );
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

function InspectorPanel({
  actionDisabled,
  draft,
  errors,
  onChange,
  onPublicationChange,
  onCancelSchedule,
  onRequestDelete,
  scheduledAt,
  slugLocked,
  telemetry,
}: {
  actionDisabled: boolean;
  draft: PostDraft;
  errors: PostValidationErrors;
  onChange: <Key extends keyof PostSnapshot>(key: Key, value: PostSnapshot[Key]) => void;
  onPublicationChange: (options: PublicationOptions) => void;
  onCancelSchedule: () => Promise<void>;
  onRequestDelete: (target: DeleteTarget) => void;
  scheduledAt?: string;
  slugLocked: boolean;
  telemetry: ReturnType<typeof calculatePostTelemetry>;
}) {
  const prefix = useId();
  const excerptId = prefix + "-excerpt";
  const tags = draft.tags.join(", ");
  const [tagsInput, setTagsInput] = useState<{ postId: string; parsed: string; text: string } | null>(null);

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
          description={slugLocked ? "La URL queda fija después de publicar o programar por primera vez." : "Se usa en la URL pública."}
          error={errors.slug}
          id={prefix + "-slug"}
          label="Slug público"
          onChange={(event) => onChange("slug", event.target.value)}
          readOnly={slugLocked}
          value={draft.slug}
        />
        <InputField
          error={errors.category}
          id={prefix + "-category"}
          label="Categoría"
          onChange={(event) => onChange("category", event.target.value)}
          value={draft.category}
        />
        <InputField
          description="Separa los tags con comas."
          error={errors.tags}
          id={prefix + "-tags"}
          label="Tags"
          onChange={(event) => {
            const text = event.target.value;
            const parsed = text.split(",").map((tag) => tag.trim()).filter(Boolean);
            setTagsInput({ postId: draft.id, parsed: parsed.join(", "), text });
            onChange("tags", parsed);
          }}
          value={tagsInput?.postId === draft.id && tagsInput.parsed === tags ? tagsInput.text : tags}
        />
        <div className="grid gap-space-sm">
          <label className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary" htmlFor={excerptId}>Resumen SEO / RSS</label>
          <textarea
            aria-describedby={errors.excerpt ? excerptId + "-length " + excerptId + "-error" : excerptId + "-length"}
            aria-invalid={errors.excerpt ? "true" : undefined}
            className="min-h-24 w-full resize-y border border-border-strong bg-surface-low px-space-md py-space-sm font-mono text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-state-focus focus:outline-none"
            id={excerptId}
            onChange={(event) => onChange("excerpt", event.target.value)}
            rows={3}
            value={draft.excerpt}
          />
          <span className="font-mono text-[0.6875rem] uppercase text-on-surface-variant" id={excerptId + "-length"}>{draft.excerpt.length} / 160 caracteres</span>
          {errors.excerpt ? <span className="text-body-sm text-error" id={excerptId + "-error"} role="alert">{errors.excerpt}</span> : null}
        </div>
      </div>

      <fieldset className="grid gap-space-sm border-t border-border pt-space-md">
        <legend className="font-headline text-label-caps uppercase tracking-[0.08em] text-primary">Publicación</legend>
        <label className="flex items-center gap-space-sm font-mono text-body-sm text-on-surface-variant">
          <input checked={draft.publishMode === "immediate"} name={prefix + "-publish-mode"} onChange={() => onPublicationChange({ publishMode: "immediate", scheduledAt: draft.scheduledAt })} type="radio" value="immediate" />
          Inmediata
        </label>
        <label className="flex items-center gap-space-sm font-mono text-body-sm text-on-surface-variant">
          <input checked={draft.publishMode === "scheduled"} name={prefix + "-publish-mode"} onChange={() => onPublicationChange({ publishMode: "scheduled", scheduledAt: draft.scheduledAt })} type="radio" value="scheduled" />
          Programada
        </label>
        {draft.publishMode === "scheduled" ? (
          <InputField
            description="Formato ISO explícito, por ejemplo 2026-12-01T09:00:00.000Z."
            error={errors.scheduledAt}
            id={prefix + "-scheduled-at"}
            label="Fecha programada (UTC)"
            onChange={(event) => onPublicationChange({ publishMode: "scheduled", scheduledAt: event.target.value || undefined })}
            placeholder="2026-12-01T09:00:00.000Z"
            value={draft.scheduledAt ?? ""}
          />
        ) : null}
        {scheduledAt ? (
          <div className="grid gap-space-xs">
            <span className="text-body-sm text-on-surface-variant">Programación vigente (UTC) <time dateTime={scheduledAt}>{scheduledAt}</time></span>
            <Button disabled={actionDisabled} onClick={() => void onCancelSchedule()} size="sm" variant="secondary">Cancelar programación</Button>
          </div>
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
        <Button className="mt-space-md" disabled={actionDisabled} onClick={() => onRequestDelete("post")} size="sm" variant="danger">Retirar documento</Button>
      </div>
    </div>
  );
}
