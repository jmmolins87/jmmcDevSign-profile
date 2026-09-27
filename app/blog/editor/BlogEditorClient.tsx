"use client";

/* SPEC 09 — Blog editor client. Integra todos los componentes del editor:
   sub-barra, portada+header, toolbar, cuerpo, panel inspector.
   Estado en memoria, tema heredado, animaciones fade-up + stagger-in. */

import { useLayoutEffect, useRef, useState, useCallback, useMemo } from "react";
import { generateSlug, countWords, readingTime, calcSeoScore } from "./utils";
import EditorTopBar from "./EditorTopBar";
import EditorCanvas, {
  DEFAULT_TITLE,
  DEFAULT_EXCERPT,
  DEFAULT_COVER_ALT,
} from "./EditorCanvas";
import EditorToolbar from "./EditorToolbar";
import EditorBody, { DEFAULT_BODY } from "./EditorBody";
import InspectorPanel, { DEFAULT_TAGS, DEFAULT_CATEGORY } from "./InspectorPanel";

export default function BlogEditorClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // [placeholder] Estado efímero del editor
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [excerpt, setExcerpt] = useState(DEFAULT_EXCERPT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [coverAlt, setCoverAlt] = useState(DEFAULT_COVER_ALT);
  const [seoTitle, setSeoTitle] = useState(
    "Diseñar con código — Sensibilidad editorial | JMMC",
  );
  const [seoDescription, setSeoDescription] = useState(
    "Exploración sobre la convergencia entre tipografía editorial clásica y arquitectura de frontend de alto rendimiento.",
  );
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);

  // Derived values
  const slug = useMemo(() => generateSlug(title), [title]);
  const words = useMemo(() => countWords(body), [body]);
  const readMin = useMemo(() => readingTime(words), [words]);
  const seoScore = useMemo(
    () => calcSeoScore(seoTitle.length, seoDescription.length, coverAlt.length, body.length),
    [seoTitle, seoDescription, coverAlt, body],
  );

  const handleRemoveTag = useCallback(
    (tag: string) => setTags((prev) => prev.filter((t) => t !== tag)),
    [],
  );

  // SPEC 09 — Animaciones de entrada con Anime.js v4
  // fade-up en paneles (24px, 700ms, outExpo)
  // stagger-in en módulos del inspector (delay 45ms)
  // Todo anulado con prefers-reduced-motion: reduce
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = containerRef.current;
    if (!root) return;

    const panels = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='fade-up']"),
    );
    const inspectorModules = Array.from(
      root.querySelectorAll<HTMLElement>("[data-anim='stagger-in']"),
    );

    // Estado oculto síncrono antes del primer paint
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

  return (
    <div ref={containerRef} className="w-full">
      {/* Sub-barra superior */}
      <EditorTopBar />

      {/* Main editorial canvas workspace */}
      <div className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Main Editorial Draft (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <EditorCanvas
              title={title}
              onTitleChange={setTitle}
              excerpt={excerpt}
              onExcerptChange={setExcerpt}
              coverAlt={coverAlt}
              readMin={readMin}
            />

            {/* Toolbar sticky entre header y cuerpo */}
            <EditorToolbar bodyRef={bodyRef} wordCount={words} readMin={readMin} />

            {/* Cuerpo del artículo */}
            <EditorBody value={body} onChange={setBody} bodyRef={bodyRef} />
          </div>

          {/* Column 2: Inspector & Publishing Metadata Panel (4 cols) */}
          <InspectorPanel
            slug={slug}
            category={category}
            onCategoryChange={setCategory}
            tags={tags}
            onRemoveTag={handleRemoveTag}
            coverAlt={coverAlt}
            onCoverAltChange={setCoverAlt}
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            seoDescription={seoDescription}
            onSeoDescriptionChange={setSeoDescription}
            seoScore={seoScore}
          />
        </div>
      </div>
    </div>
  );
}
