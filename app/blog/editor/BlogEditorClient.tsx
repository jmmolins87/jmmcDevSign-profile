"use client";

/* SPEC 10 — Paso 9: Blog editor client conectado a Supabase.
   Estado bilingüe (ES/EN), carga/guarda/posts, upload portada, publish. */

import { useLayoutEffect, useRef, useState, useCallback, useMemo, useEffect } from "react";
import { generateSlug, countWords, readingTime, calcSeoScore } from "./utils";
import EditorTopBar from "./EditorTopBar";
import EditorCanvas, {
  DEFAULT_TITLE,
  DEFAULT_EXCERPT,
  DEFAULT_COVER_ALT,
} from "./EditorCanvas";
import EditorToolbar from "./EditorToolbar";
import EditorBody, { DEFAULT_BODY } from "./EditorBody";
import InspectorPanel from "./InspectorPanel";

/* eslint-disable react-hooks/exhaustive-deps -- sincronización de traducciones y sync tick son patrones legítimos */
/* eslint-disable react-hooks/set-state-in-effect -- sincronización de traducciones y sync tick son patrones legítimos */

/* --- Tipos --- */
interface PostTranslationInput {
  locale: "es" | "en";
  title: string;
  excerpt: string;
  body: string;
  reading_minutes: number;
}

interface InitialPost {
  id: string;
  slug_base: string;
  category: string;
  status: "draft" | "published";
  published_at: string | null;
  cover_image_id: string | null;
  images: {
    key: string;
    storage_path: string | null;
    url: string;
    alt: string;
  } | null;
  post_translations: {
    locale: "es" | "en";
    title: string;
    excerpt: string;
    body: string;
    reading_minutes: number;
  }[];
}

interface EditorState {
  title: string;
  excerpt: string;
  body: string;
  coverAlt: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  tags: string[];
  coverImageId: string | null;
  coverImageUrl: string;
  slugBase: string;
  status: "draft" | "published";
  postId: string | null;
}

const DEFAULT_CATEGORY = "Ensayos de Diseño & Arquitectura";
const DEFAULT_TAGS = ["UI/UX", "EDITORIAL", "TYPOGRAPHY", "SYSTEMS"];

const DEFAULT_STATE: EditorState = {
  title: DEFAULT_TITLE,
  excerpt: DEFAULT_EXCERPT,
  body: DEFAULT_BODY,
  coverAlt: DEFAULT_COVER_ALT,
  seoTitle: "Diseñar con código — Sensibilidad editorial | JMMC",
  seoDescription:
    "Exploración sobre la convergencia entre tipografía editorial clásica y arquitectura de frontend de alto rendimiento.",
  category: DEFAULT_CATEGORY,
  tags: DEFAULT_TAGS,
  coverImageId: null,
  coverImageUrl: "",
  slugBase: "",
  status: "draft",
  postId: null,
};

export default function BlogEditorClient({
  initialPost,
  locale: initialLocale,
}: {
  initialPost: InitialPost | null;
  locale: "es" | "en";
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  /* --- Estado del editor --- */
  const [editorLocale, setEditorLocale] = useState<"es" | "en">(initialLocale);
  const [state, setState] = useState<EditorState>(() => {
    if (!initialPost) return { ...DEFAULT_STATE, slugBase: generateSlug(DEFAULT_TITLE) };

    const esTrans = initialPost.post_translations.find((t) => t.locale === "es");
    const enTrans = initialPost.post_translations.find((t) => t.locale === "en");
    const primaryTrans = esTrans ?? enTrans ?? initialPost.post_translations[0];

    return {
      title: primaryTrans.title,
      excerpt: primaryTrans.excerpt,
      body: primaryTrans.body,
      coverAlt: initialPost.images?.alt ?? "",
      seoTitle: primaryTrans.title,
      seoDescription: primaryTrans.excerpt,
      category: initialPost.category,
      tags: [],
      coverImageId: initialPost.cover_image_id,
      coverImageUrl: initialPost.images?.url ?? "",
      slugBase: initialPost.slug_base,
      status: initialPost.status,
      postId: initialPost.id,
    };
  });

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  /* --- Derived --- */
  const slug = useMemo(() => generateSlug(state.title), [state.title]);
  const words = useMemo(() => countWords(state.body), [state.body]);
  const readMin = useMemo(() => readingTime(words), [words]);
  const seoScore = useMemo(
    () =>
      calcSeoScore(
        state.seoTitle.length,
        state.seoDescription.length,
        state.coverAlt.length,
        state.body.length,
      ),
    [state.seoTitle, state.seoDescription, state.coverAlt, state.body],
  );

  const handleRemoveTag = useCallback(
    (tag: string) =>
      setState((s) => ({ ...s, tags: s.tags.filter((t) => t !== tag) })),
    [],
  );

/* --- Cargar traducción al cambiar locale --- */
  const primaryTrans = useMemo(() => {
    if (!initialPost) return null;
    return initialPost.post_translations.find((t) => t.locale === editorLocale);
  }, [initialPost, editorLocale]);

  // Update state when translation changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincronizar traducción al cambiar locale
    if (!primaryTrans) return;
    setState((s) => ({
      ...s,
      title: primaryTrans.title,
      excerpt: primaryTrans.excerpt,
      body: primaryTrans.body,
    }));
  }, [primaryTrans]);

  /* --- API calls --- */
  const apiBase = "/api/blog/posts";

  const saveDraft = useCallback(async () => {
    setSaving(true);
    try {
      const translations: Record<string, Omit<PostTranslationInput, "locale">> = {
        es: {
          title: state.title,
          excerpt: state.excerpt,
          body: state.body,
          reading_minutes: readMin,
        },
      };
      // Only include EN translation if we have meaningful content
      if (state.title || state.excerpt || state.body) {
        translations.en = {
          title: state.title,
          excerpt: state.excerpt,
          body: state.body,
          reading_minutes: readMin,
        };
      }

      const body = {
        ...(state.postId ? { id: state.postId } : { slugBase: state.slugBase || generateSlug(state.title) }),
        category: state.category,
        status: "draft",
        coverImageId: state.coverImageId,
        translations,
      };

      const res = await fetch(apiBase, {
        method: state.postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setState((s) => ({ ...s, postId: data.id, slugBase: data.slugBase, status: "draft" }));
      setSavedAt(new Date());
    } catch (e) {
      console.error("[editor] saveDraft error:", e);
      alert("Error guardando borrador: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [state, readMin, apiBase]);

  const publishPost = useCallback(async () => {
    setSaving(true);
    try {
      const translations: Record<string, Omit<PostTranslationInput, "locale">> = {
        es: {
          title: state.title,
          excerpt: state.excerpt,
          body: state.body,
          reading_minutes: readMin,
        },
        en: {
          title: state.title,
          excerpt: state.excerpt,
          body: state.body,
          reading_minutes: readMin,
        },
      };

      const body = {
        ...(state.postId ? { id: state.postId } : { slugBase: state.slugBase || generateSlug(state.title) }),
        category: state.category,
        status: "published",
        coverImageId: state.coverImageId,
        translations,
      };

      const res = await fetch(apiBase, {
        method: state.postId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      setState((s) => ({
        ...s,
        postId: data.id,
        slugBase: data.slugBase,
        status: "published",
      }));
      setSavedAt(new Date());
    } catch (e) {
      console.error("[editor] publishPost error:", e);
      alert("Error publicando: " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [state, readMin, apiBase]);

  const uploadCover = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    if (state.slugBase) formData.append("key", `cover-${state.slugBase}`);

    try {
      const res = await fetch("/api/blog/cover-upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setState((s) => ({ ...s, coverImageId: data.imageId, coverImageUrl: data.url }));
      return data.url;
    } catch (e) {
      console.error("[editor] uploadCover error:", e);
      alert("Error subiendo portada: " + (e as Error).message);
      return null;
    }
  }, [state.slugBase]);

  /* --- Handlers --- */
  const handleTitleChange = useCallback((v: string) => setState((s) => ({ ...s, title: v })), []);
  const handleExcerptChange = useCallback((v: string) => setState((s) => ({ ...s, excerpt: v })), []);
  const handleBodyChange = useCallback((v: string) => setState((s) => ({ ...s, body: v })), []);
  const handleCoverAltChange = useCallback((v: string) => setState((s) => ({ ...s, coverAlt: v })), []);
  const handleSeoTitleChange = useCallback((v: string) => setState((s) => ({ ...s, seoTitle: v })), []);
  const handleSeoDescriptionChange = useCallback((v: string) => setState((s) => ({ ...s, seoDescription: v })), []);
  const handleCategoryChange = useCallback((v: string) => setState((s) => ({ ...s, category: v })), []);
  const handleTagsChange = useCallback((tags: string[]) => setState((s) => ({ ...s, tags })), []);
  const handleCoverUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadCover(file);
    },
    [uploadCover],
  );

  /* --- Animaciones (SPEC 09) --- */
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = containerRef.current;
    if (!root) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-anim='fade-up']"));
    const inspectorModules = Array.from(root.querySelectorAll<HTMLElement>("[data-anim='stagger-in']"));

    const hide = (el: HTMLElement, y: string) => {
      el.style.opacity = "0";
      el.style.transform = `translateY(${y})`;
    };
    panels.forEach((el) => hide(el, "24px"));
    inspectorModules.forEach((el) => hide(el, "8px"));

    let cancelled = false;
    (async () => {
      try {
        const { animate } = await import("animejs");
        if (cancelled) return;

        animate(panels, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 700,
          ease: "outExpo",
        });

        animate(inspectorModules, {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 600,
          delay: (_el, i) => (i ?? 0) * 45,
          ease: "outExpo",
        });
      } catch {
        [...panels, ...inspectorModules].forEach((el) => {
          el.style.removeProperty("opacity");
          el.style.removeProperty("transform");
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* --- Saved tick --- */
  useEffect(() => {
    if (!savedAt) return;
    const id = setInterval(() => {}, 1000);
    return () => clearInterval(id);
  }, [savedAt]);

  return (
    <div ref={containerRef} className="w-full">
      {/* Sub-barra superior */}
      <EditorTopBar
        status={state.status}
        savedAt={savedAt}
        saving={saving}
        onSave={saveDraft}
        onPublish={publishPost}
        slug={state.slugBase}
        postId={state.postId}
      />

      {/* Main editorial canvas workspace */}
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Main Editorial Draft (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <EditorCanvas
              title={state.title}
              onTitleChange={handleTitleChange}
              excerpt={state.excerpt}
              onExcerptChange={handleExcerptChange}
              coverAlt={state.coverAlt}
              onCoverAltChange={handleCoverAltChange}
              coverImageUrl={state.coverImageUrl}
              onCoverUpload={handleCoverUpload}
              readMin={readMin}
            />

            {/* Toolbar sticky entre header y cuerpo */}
            <EditorToolbar bodyRef={bodyRef} wordCount={words} readMin={readMin} />

            {/* Cuerpo del artículo */}
            <EditorBody value={state.body} onChange={handleBodyChange} bodyRef={bodyRef} />
          </div>

          {/* Column 2: Inspector & Publishing Metadata Panel (4 cols) */}
          <InspectorPanel
            editorLocale={editorLocale}
            onEditorLocaleChange={setEditorLocale}
            slug={slug}
            category={state.category}
            onCategoryChange={handleCategoryChange}
            tags={state.tags}
            onTagsChange={handleTagsChange}
            onRemoveTag={handleRemoveTag}
            coverAlt={state.coverAlt}
            onCoverAltChange={handleCoverAltChange}
            seoTitle={state.seoTitle}
            onSeoTitleChange={handleSeoTitleChange}
            seoDescription={state.seoDescription}
            onSeoDescriptionChange={handleSeoDescriptionChange}
            seoScore={seoScore}
            status={state.status}
          />
        </div>
      </div>
    </div>
  );
}