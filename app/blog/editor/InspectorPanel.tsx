"use client";

/* SPEC 09 — Paso 6: panel lateral del editor con 6 módulos.
   Idioma, slug (auto-generado), categoría+tags, publicación, alt text, SEO. */

import { useState } from "react";

/* ---------- Language Module ---------- */
function LanguageModule() {
  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3"
      data-anim="stagger-in"
    >
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          Idioma del artículo
        </span>
        <span className="font-mono-code text-mono-code text-secondary">
          ES · Activo
        </span>
      </div>
      <div className="grid grid-cols-2 p-1 rounded-full bg-surface-container">
        <button
          className="py-1.5 rounded-full bg-surface-container-lowest font-label-caps text-label-caps text-on-surface shadow-xs font-semibold"
          type="button"
        >
          Español (ES)
        </button>
        <button
          className="py-1.5 rounded-full text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps transition-colors"
          type="button"
        >
          English (EN)
        </button>
      </div>
    </div>
  );
}

/* ---------- Slug Module ---------- */
function SlugModule({
  slug,
}: {
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://jmmc.dev/blog/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3"
      data-anim="stagger-in"
    >
      <div className="flex items-center justify-between">
        <label
          className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant"
          htmlFor="post-slug"
        >
          Slug permanente
        </label>
        <button
          className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1"
          type="button"
          onClick={handleCopy}
        >
          <span className="material-symbols-outlined text-[13px]">
            {copied ? "check" : "content_copy"}
          </span>
          <span>{copied ? "¡Copiado!" : "Copiar URL"}</span>
        </button>
      </div>
      <div className="flex items-center px-3 py-2 rounded-lg bg-surface-container font-mono-code text-mono-code text-on-surface">
        <span className="text-on-surface-variant select-none">/blog/</span>
        <input
          className="w-full bg-transparent focus:outline-none text-on-surface ml-0.5 truncate"
          id="post-slug"
          type="text"
          value={slug}
          readOnly
        />
      </div>
      <span className="font-body-sm text-[12px] text-on-surface-variant">
        Se actualizará automáticamente si modificas el título principal.
      </span>
    </div>
  );
}

/* ---------- Category & Tags Module ---------- */
function CategoryModule({
  category,
  onCategoryChange,
  tags,
  onRemoveTag,
}: {
  category: string;
  onCategoryChange: (v: string) => void;
  tags: string[];
  onRemoveTag: (tag: string) => void;
}) {
  const categories = [ // [placeholder]
    "Ensayos de Diseño & Arquitectura",
    "Ingeniería de Software & Frontend",
    "Tipografía & Arte Computacional",
    "Bitácora de Investigación",
  ];

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4"
      data-anim="stagger-in"
    >
      {/* Category select */}
      <div className="flex flex-col gap-1.5">
        <label className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          Categoría editorial
        </label>
        <div className="relative">
          <select
            className="w-full appearance-none px-3.5 py-2.5 rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface focus:outline-none cursor-pointer pr-10"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[18px]">
            expand_more
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-2 pt-1">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          Etiquetas de indexación
        </span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface"
            >
              {tag}
              <button
                aria-label={`Quitar tag ${tag}`}
                className="hover:text-primary"
                type="button"
                onClick={() => onRemoveTag(tag)}
              >
                <span className="material-symbols-outlined text-[13px]">
                  close
                </span>
              </button>
            </span>
          ))}
          {/* Add tag pill (inert) */}
          <button
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[13px]">add</span>
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Publication Module ---------- */
function PublicationModule() {
  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3"
      data-anim="stagger-in"
    >
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          Publicación programada
        </span>
        <span className="font-label-caps text-label-caps text-primary">
          Programado
        </span>
      </div>
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-surface-container">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
          calendar_today
        </span>
        <div className="flex flex-col">
          <span className="font-body-sm text-body-sm font-medium text-on-surface">
            24 Octubre 2026, 10:00 CEST {/* [placeholder] */}
          </span>
          <span className="font-mono-code text-[11px] text-on-surface-variant">
            Lanzamiento sincronizado con Newsletter {/* [placeholder] */}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 font-body-sm text-[13px] text-on-surface-variant">
        <span>¿Publicar ahora?</span>
        <button
          className="text-primary hover:underline font-medium"
          type="button"
        >
          Cambiar a inmediata
        </button>
      </div>
    </div>
  );
}

/* ---------- Alt Text Module ---------- */
function AltTextModule({
  coverAlt,
  onChange,
}: {
  coverAlt: string;
  onChange: (v: string) => void;
}) {
  const charCount = coverAlt.length;
  const hasAlt = charCount > 10;

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-2"
      data-anim="stagger-in"
    >
      <div className="flex items-center justify-between">
        <label
          className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant"
          htmlFor="cover-alt"
        >
          Alt Text (Accesibilidad)
        </label>
        <span
          className={`font-mono-code text-[11px] ${hasAlt ? "text-secondary" : "text-on-surface-variant"}`}
        >
          {hasAlt ? "A11y OK" : `${charCount} chars`}
        </span>
      </div>
      <textarea
        className="w-full p-2.5 rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface focus:outline-none resize-none leading-relaxed"
        id="cover-alt"
        rows={3}
        value={coverAlt}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="font-body-sm text-[11px] text-on-surface-variant">
        Describe la portada para lectores de pantalla y buscadores.
      </span>
    </div>
  );
}

/* ---------- SEO Module ---------- */
function SeoModule({
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  seoScore,
  slug,
}: {
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (v: string) => void;
  seoScore: number;
  slug: string;
}) {
  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;
  const titleOver = titleLen > 60;
  const descOver = descLen > 160;

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4"
      data-anim="stagger-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          Optimización SEO
        </span>
        <span className="inline-flex items-center gap-1 font-mono-code text-[11px] text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          Puntuación {seoScore}/100
        </span>
      </div>

      {/* Meta Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label
            className="font-label-caps text-label-caps text-on-surface-variant uppercase"
            htmlFor="seo-title"
          >
            Meta Título
          </label>
          <span
            className={`font-mono-code text-[11px] ${titleOver ? "text-error" : "text-secondary"}`}
          >
            {titleLen} / 60
          </span>
        </div>
        <input
          className="w-full px-3 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface focus:outline-none"
          id="seo-title"
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
        />
      </div>

      {/* Meta Description */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label
            className="font-label-caps text-label-caps text-on-surface-variant uppercase"
            htmlFor="seo-desc"
          >
            Meta Descripción
          </label>
          <span
            className={`font-mono-code text-[11px] ${descOver ? "text-error" : "text-secondary"}`}
          >
            {descLen} / 160
          </span>
        </div>
        <textarea
          className="w-full px-3 py-2 rounded-lg bg-surface-container font-body-sm text-body-sm text-on-surface focus:outline-none resize-none"
          id="seo-desc"
          rows={3}
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
        />
      </div>

      {/* Google Preview */}
      <div className="flex flex-col gap-1.5 pt-2">
        <span className="font-label-caps text-[10px] uppercase tracking-wider text-on-surface-variant">
          Previsualización en Google
        </span>
        <div className="p-3.5 rounded-lg bg-surface-container-high flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[12px] font-mono-code text-on-surface-variant">
            <span>jmmc.dev</span>
            <span>›</span>
            <span>blog</span>
            <span>›</span>
            <span className="truncate">{slug.slice(0, 30)}…</span>
          </div>
          <span className="font-body-md text-[15px] font-medium text-primary hover:underline cursor-pointer leading-tight line-clamp-2">
            {seoTitle || "Título del artículo"}
          </span>
          <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed mt-0.5">
            {seoDescription || "Descripción del artículo..."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Inspector Panel ---------- */
const DEFAULT_TAGS = ["UI/UX", "EDITORIAL", "TYPOGRAPHY", "SYSTEMS"]; // [placeholder]
const DEFAULT_CATEGORY = "Ensayos de Diseño & Arquitectura"; // [placeholder]

export default function InspectorPanel({
  slug,
  category,
  onCategoryChange,
  tags,
  onRemoveTag,
  coverAlt,
  onCoverAltChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  seoScore,
}: {
  slug: string;
  category: string;
  onCategoryChange: (v: string) => void;
  tags: string[];
  onRemoveTag: (tag: string) => void;
  coverAlt: string;
  onCoverAltChange: (v: string) => void;
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (v: string) => void;
  seoScore: number;
}) {
  return (
    <aside
      className="lg:col-span-4 flex flex-col gap-6"
      data-anim="stagger-in"
    >
      <LanguageModule />
      <SlugModule slug={slug} />
      <CategoryModule
        category={category}
        onCategoryChange={onCategoryChange}
        tags={tags}
        onRemoveTag={onRemoveTag}
      />
      <PublicationModule />
      <AltTextModule coverAlt={coverAlt} onChange={onCoverAltChange} />
      <SeoModule
        seoTitle={seoTitle}
        onSeoTitleChange={onSeoTitleChange}
        seoDescription={seoDescription}
        onSeoDescriptionChange={onSeoDescriptionChange}
        seoScore={seoScore}
        slug={slug}
      />
    </aside>
  );
}

export { DEFAULT_TAGS, DEFAULT_CATEGORY };
