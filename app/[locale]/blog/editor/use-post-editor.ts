import { useCallback, useEffect, useRef, useState } from "react";

import {
  AUTOSAVE_DEBOUNCE_MS,
  POST_ACCESS,
  POST_RIGHTS,
  validatePostForPublishing,
  type PostValidationErrors,
  type PublishMode,
} from "@/app/[locale]/blog/domain";
import type {
  EditorialCatalog,
  EditorialFailure,
  EditorialPost,
  EditorialResult,
  PostEditorOperations,
  PostSnapshot,
} from "@/app/[locale]/blog/repositories/post-repository";

export type PublicationOptions = { publishMode: PublishMode; scheduledAt?: string };

type Phase = "ready" | "editing" | "saving" | "saved" | "scheduled" | "published" | "error";
type PendingDraft = { snapshot: PostSnapshot; version: number };

const emptySnapshot: PostSnapshot = {
  access: POST_ACCESS,
  bodyMarkdown: "",
  category: "",
  excerpt: "",
  rights: POST_RIGHTS,
  slug: "",
  tags: [],
  title: "",
};

const failureMessages: Record<EditorialFailure, string> = {
  conflict: "Otra sesión guardó una versión más reciente. Tus cambios siguen en el editor.",
  invalid: "La operación no es válida. Revisa los campos editoriales.",
  "slug-taken": "El slug ya pertenece a otro documento.",
  unauthorized: "Tu sesión no tiene permiso para guardar. Tus cambios siguen en el editor.",
  unavailable: "No se pudo conectar con el repositorio. Tus cambios siguen en el editor.",
};

function toSnapshot(post: PostSnapshot): PostSnapshot {
  return {
    access: post.access,
    bodyMarkdown: post.bodyMarkdown,
    category: post.category,
    coverAssetId: post.coverAssetId,
    excerpt: post.excerpt,
    rights: post.rights,
    slug: post.slug,
    tags: post.tags,
    title: post.title,
  };
}

export function usePostEditor(initialCatalog: EditorialCatalog | null, operations: PostEditorOperations) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [selectedId, setSelectedId] = useState(initialCatalog?.posts[0]?.post.id ?? null);
  const [pending, setPending] = useState<Record<string, PendingDraft>>({});
  const [publicationOptions, setPublicationOptions] = useState<Record<string, PublicationOptions>>({});
  const [conflicts, setConflicts] = useState<Record<string, true>>({});
  const [feedback, setFeedback] = useState<{ phase: Phase; message: string }>(
    initialCatalog ? { phase: "ready", message: "" } : { phase: "error", message: "No se pudo cargar el catálogo editorial." },
  );
  const [errors, setErrors] = useState<PostValidationErrors>({});
  const busyRef = useRef(false);
  const editedWhileSaving = useRef(false);
  const record = catalog?.posts.find(({ post }) => post.id === selectedId);
  const pendingDraft = record ? pending[record.post.id] : undefined;
  const snapshot = pendingDraft?.snapshot;
  const options = record ? publicationOptions[record.post.id] : undefined;
  const conflict = selectedId ? Boolean(conflicts[selectedId]) : false;
  const busy = feedback.phase === "saving";

  function select(id: string) {
    setSelectedId(id || null);
    setErrors({});
    setFeedback({ phase: "ready", message: "" });
  }

  function change<Key extends keyof PostSnapshot>(key: Key, value: PostSnapshot[Key]) {
    if (!record) return;
    const id = record.post.id;
    editedWhileSaving.current = busyRef.current || editedWhileSaving.current;
    setPending((current) => ({
      ...current,
      [id]: {
        snapshot: { ...(current[id]?.snapshot ?? toSnapshot(record.post)), [key]: value },
        version: current[id]?.version ?? record.version,
      },
    }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    if (!busyRef.current) setFeedback({ phase: "editing", message: "Cambios sin guardar." });
  }

  function changePublication(next: PublicationOptions) {
    if (!record) return;
    setPublicationOptions((current) => ({ ...current, [record.post.id]: next }));
    setErrors((current) => ({ ...current, scheduledAt: undefined }));
    if (snapshot && !busyRef.current) setFeedback({ phase: "editing", message: "Cambios sin guardar." });
  }

  const perform = useCallback(async <T,>(
    operation: () => Promise<EditorialResult<T>>,
    savingMessage: string,
    id?: string,
  ): Promise<EditorialResult<T> | undefined> => {
    if (busyRef.current) return;
    busyRef.current = true;
    editedWhileSaving.current = false;
    setFeedback({ phase: "saving", message: savingMessage });

    let result: EditorialResult<T>;
    try {
      result = await operation();
    } catch {
      result = { ok: false, reason: "unavailable" };
    } finally {
      busyRef.current = false;
    }

    if (!result.ok) {
      if (result.reason === "conflict" && id) setConflicts((current) => ({ ...current, [id]: true }));
      if (result.reason === "slug-taken") setErrors((current) => ({ ...current, slug: failureMessages["slug-taken"] }));
      setFeedback({ phase: "error", message: failureMessages[result.reason] });
    }

    return result;
  }, []);

  const updateCatalog = useCallback((updated: EditorialPost) => {
    setCatalog((current) => {
      if (!current) return current;
      const posts = current.posts.filter(({ post }) => post.id !== updated.post.id);
      return { ...current, posts: [updated, ...posts] };
    });
  }, []);

  const clearPending = useCallback((id: string) => {
    setPending((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const acknowledgeDraft = useCallback((id: string, version: number, saved?: PostSnapshot) => {
    setPending((current) => {
      const draft = current[id];
      if (!draft) return current;
      if (draft.snapshot !== saved) return { ...current, [id]: { ...draft, version } };
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const save = useCallback(async (automatic: boolean) => {
    if (!record || conflict || busyRef.current) return;
    const input = snapshot ?? toSnapshot(record.post);
    const { publishMode, scheduledAt } = options ?? record.post;
    if (automatic) {
      const validation = validatePostForPublishing({ ...input, publishMode, scheduledAt });
      setErrors(validation.errors);
      if (!validation.valid) {
        setFeedback({ phase: "error", message: "Autoguardado detenido. Revisa los campos marcados." });
        return;
      }
    }

    const { id } = record.post;
    const result = await perform(
      () => operations.save({ postId: id, version: pendingDraft?.version ?? record.version, snapshot: input }),
      "Guardando borrador…",
      id,
    );
    if (!result?.ok) return;
    updateCatalog(result.data);
    acknowledgeDraft(id, result.data.version, snapshot);
    const message = automatic ? "Autoguardado." : "Borrador guardado.";
    setFeedback(editedWhileSaving.current
      ? { phase: "editing", message: "Quedan cambios sin guardar." }
      : { phase: "saved", message });
  }, [acknowledgeDraft, conflict, operations, options, pendingDraft, perform, record, snapshot, updateCatalog]);

  useEffect(() => {
    if (!snapshot || conflict || (feedback.phase !== "editing" && feedback.phase !== "ready")) return;
    const timer = setTimeout(() => void save(true), AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [conflict, feedback.phase, save, snapshot]);

  async function publish() {
    if (!record || conflict || busyRef.current) return;
    const input = snapshot ?? toSnapshot(record.post);
    const publication = options ?? record.post;
    const { publishMode, scheduledAt } = publication;
    const validation = validatePostForPublishing({ ...input, publishMode, scheduledAt });
    setErrors(validation.errors);
    if (!validation.valid) {
      setFeedback({ phase: "error", message: "Error de validación. Corrige los campos marcados." });
      return;
    }

    const { id } = record.post;
    const date = publishMode === "scheduled" ? scheduledAt ?? null : null;
    const result = await perform(() => operations.publish({
      postId: id,
      version: pendingDraft?.version ?? record.version,
      scheduledAt: date,
      snapshot: input,
    }), date ? "Programando publicación…" : "Publicando…", id);
    if (!result?.ok) return;
    updateCatalog(result.data);
    acknowledgeDraft(id, result.data.version, snapshot);
    setFeedback(editedWhileSaving.current
      ? { phase: "editing", message: "Quedan cambios sin guardar." }
      : { phase: date ? "scheduled" : "published", message: date ? "Publicación programada." : "Documento publicado." });
  }

  async function create() {
    const result = await perform(() => operations.create(emptySnapshot), "Creando borrador…");
    if (!result?.ok) return;
    updateCatalog(result.data);
    setSelectedId(result.data.post.id);
    setFeedback({ phase: "saved", message: "Nuevo borrador creado." });
    setErrors({});
  }

  async function reload() {
    const result = await perform(() => operations.list(), "Cargando catálogo…", selectedId ?? undefined);
    if (!result?.ok) return;
    setCatalog(result.data);
    if (selectedId && !editedWhileSaving.current) {
      clearPending(selectedId);
      clearPublication(selectedId);
      setConflicts((current) => {
        const next = { ...current };
        delete next[selectedId];
        return next;
      });
    }

    const remains = result.data.posts.some(({ post }) => post.id === selectedId);
    select(remains ? selectedId ?? "" : result.data.posts[0]?.post.id ?? "");
    setFeedback({ phase: "ready", message: "Catálogo actualizado." });
  }

  function clearPublication(id: string) {
    setPublicationOptions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function cancelSchedule() {
    if (!record || conflict) return;
    const { id } = record.post;
    const result = await perform(
      () => operations.cancel({ postId: id, version: pendingDraft?.version ?? record.version }),
      "Cancelando programación…",
      id,
    );
    if (!result?.ok) return;
    updateCatalog(result.data);
    acknowledgeDraft(id, result.data.version);
    clearPublication(id);
    setFeedback({ phase: snapshot || editedWhileSaving.current ? "editing" : "saved", message: "Programación cancelada." });
  }

  async function remove() {
    if (!record || conflict) return false;
    const { id } = record.post;
    const result = await perform(
      () => operations.remove({ postId: id, version: pendingDraft?.version ?? record.version }),
      "Retirando documento…",
      id,
    );
    if (!result?.ok) return false;
    setCatalog((current) => current && { ...current, posts: current.posts.filter(({ post }) => post.id !== id) });
    setSelectedId(null);
    clearPending(id);
    clearPublication(id);
    setErrors({});
    setFeedback({ phase: "saved", message: "Documento retirado." });
    return true;
  }

  return {
    busy,
    cancelSchedule,
    catalog,
    change,
    changePublication,
    conflict,
    create,
    draft: record ? { ...record.post, ...snapshot, ...options } : null,
    errors,
    feedback,
    hasUnsavedChanges: Boolean(snapshot),
    publish,
    record,
    reload,
    remove,
    save,
    select,
    selectedId,
  };
}
