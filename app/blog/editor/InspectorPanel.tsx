"use client";

/* SPEC 10 — Paso 9: panel lateral del editor con 6 módulos.
   Idioma (funcional ES/EN), slug (auto-generado), categoría+tags, publicación, alt text, SEO. */

import { useState, useCallback } from "react";

import { useDict } from "@/lib/i18n/I18nProvider";

/* ---------- Language Module (funcional ES/EN) ---------- */
interface LanguageModuleProps {
  editorLocale: "es" | "en";
  onLocaleChange: (locale: "es" | "en") => void;
}

function LanguageModule({ editorLocale, onLocaleChange }: LanguageModuleProps) {
  const language = useDict().sections.editor.inspector.language;

  const handleLocaleChange = (locale: "es" | "en") => {
    onLocaleChange(locale);
  };

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3"
      data-anim="stagger-in"
    >
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          {language.label}
        </span>
        <span className="font-mono-code text-mono-code text-secondary">
          {editorLocale.toUpperCase()} · {language.active}
        </span>
      </div>
      <div className="grid grid-cols-2 p-1 rounded-full bg-surface-container">
        <button
          onClick={() => handleLocaleChange("es")}
          className={`py-1.5 rounded-full font-label-caps text-label-caps transition-colors ${
            editorLocale === "es"
              ? "bg-surface-container-lowest text-on-surface shadow-xs font-semibold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
          type="button"
        >
          Español (ES)
        </button>
        <button
          onClick={() => handleLocaleChange("en")}
          className={`py-1.5 rounded-full font-label-caps text-label-caps transition-colors ${
            editorLocale === "en"
              ? "bg-surface-container-lowest text-on-surface shadow-xs font-semibold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
          type="button"
        >
          English (EN)
        </button>
      </div>
    </div>
  );
}

/* ---------- Slug Module ---------- */
interface SlugModuleProps {
  slug: string;
}

function SlugModule({ slug }: SlugModuleProps) {
  const [copied, setCopied] = useState(false);
  const slugDict = useDict().sections.editor.inspector.slug;

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
          {slugDict.label}
        </label>
        <button
          className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1"
          type="button"
          onClick={handleCopy}
        >
          <span className="material-symbols-outlined text-[13px]">
            {copied ? "check" : "content_copy"}
          </span>
          <span>{copied ? slugDict.copied : slugDict.copy}</span>
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
        {slugDict.hint}
      </span>
    </div>
  );
}

/* ---------- Category & Tags Module ---------- */
interface CategoryModuleProps {
  category: string;
  onCategoryChange: (v: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onRemoveTag: (tag: string) => void;
}

function CategoryModule({
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  onRemoveTag,
}: CategoryModuleProps) {
  const categories = [ // [placeholder]
    "Ensayos de Diseño & Arquitectura",
    "Ingeniería de Software & Frontend",
    "Tipografía & Arte Computacional",
    "Bitácora de Investigación",
  ];
  const categoryDict = useDict().sections.editor.inspector.category;
  const [newTag, setNewTag] = useState("");

  const handleAddTag = useCallback(() => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
      setNewTag("");
    }
  }, [newTag, tags, onTagsChange]);

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4"
      data-anim="stagger-in"
    >
      {/* Category select */}
      <div className="flex flex-col gap-1.5">
        <label className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          {categoryDict.label}
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
          {categoryDict.tagsLabel}
        </span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface"
            >
              {tag}
              <button
                aria-label={`${categoryDict.removeTag} ${tag}`}
                className="hover:text-primary"
                type="button"
                onClick={() => onTagsChange(tags.filter((t) => t !== tag))}
              >
                <span className="material-symbols-outlined text-[13px]">
                  close
                </span>
              </button>
            </span>
          ))}
          {/* Add tag input */}
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder={categoryDict.addTag}
              className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps text-sm focus:outline-none focus:bg-surface-container w-32"
            />
            <button
              onClick={handleAddTag}
              className="inline-flex items-center justify-center p-1.5 rounded-full bg-surface-container-high hover:bg-surface-container transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Publication Module ---------- */
interface PublicationModuleProps {
  status: "draft" | "published";
}

function PublicationModule({ status }: PublicationModuleProps) {
  const publication = useDict().sections.editor.inspector.publication;
  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-3"
      data-anim="stagger-in"
    >
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          {publication.label}
        </span>
        <span className="font-label-caps text-label-caps text-primary">
          {status === "published" ? "Publicado" : publication.status}
        </span>
      </div>
      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-surface-container">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
          calendar_today
        </span>
        <div className="flex flex-col">
          <span className="font-body-sm text-body-sm font-medium text-on-surface">
            {status === "published" ? "Publicado ahora" : "Pendiente de publicación"} {/* [placeholder] */}
          </span>
          <span className="font-mono-code text-[11px] text-on-surface-variant">
            Lanzamiento sincronizado con Newsletter {/* [placeholder] */}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 font-body-sm text-[13px] text-on-surface-variant">
        <span>{publication.publishNow}</span>
        <button
          className="text-primary hover:underline font-medium"
          type="button"
        >
          {publication.switchImmediate}
        </button>
      </div>
    </div>
  );
}

/* ---------- Alt Text Module ---------- */
interface AltTextModuleProps {
  coverAlt: string;
  onChange: (v: string) => void;
}

function AltTextModule({ coverAlt, onChange }: AltTextModuleProps) {
  const charCount = coverAlt.length;
  const hasAlt = charCount > 10;
  const alt = useDict().sections.editor.inspector.alt;

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
          {alt.label}
        </label>
        <span
          className={`font-mono-code text-[11px] ${hasAlt ? "text-secondary" : "text-on-surface-variant"}`}
        >
          {hasAlt ? alt.a11yOk : `${charCount} ${alt.chars}`}
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
        {alt.hint}
      </span>
    </div>
  );
}

/* ---------- SEO Module ---------- */
interface SeoModuleProps {
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (v: string) => void;
  seoScore: number;
  slug: string;
}

function SeoModule({
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  seoScore,
  slug,
}: SeoModuleProps) {
  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;
  const titleOver = titleLen > 60;
  const descOver = descLen > 160;
  const seo = useDict().sections.editor.inspector.seo;

  return (
    <div
      className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-4"
      data-anim="stagger-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
          {seo.label}
        </span>
        <span className="inline-flex items-center gap-1 font-mono-code text-[11px] text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          {seo.score} {seoScore}/100
        </span>
      </div>

      {/* Meta Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <label
            className="font-label-caps text-label-caps text-on-surface-variant uppercase"
            htmlFor="seo-title"
          >
            {seo.titleLabel}
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
            {seo.descLabel}
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
          {seo.previewLabel}
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
            {seoTitle || seo.titleFallback}
          </span>
          <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-2 leading-relaxed mt-0.5">
            {seoDescription || seo.descFallback}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Inspector Panel ---------- */
interface InspectorPanelProps {
  editorLocale: "es" | "en";
  onEditorLocaleChange: (locale: "es" | "en") => void;
  slug: string;
  category: string;
  onCategoryChange: (v: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onRemoveTag: (tag: string) => void;
  coverAlt: string;
  onCoverAltChange: (v: string) => void;
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (v: string) => void;
  seoScore: number;
  status: "draft" | "published";
}

export default function InspectorPanel({
  editorLocale,
  onEditorLocaleChange,
  slug,
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  onRemoveTag,
  coverAlt,
  onCoverAltChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  seoScore,
  status,
}: InspectorPanelProps) {
  return (
    <aside
      className="lg:col-span-4 flex flex-col gap-6"
      data-anim="stagger-in"
    >
      <LanguageModule
        editorLocale={editorLocale}
        onLocaleChange={onEditorLocaleChange}
      />
      <SlugModule slug={slug} />
      <CategoryModule
        category={category}
        onCategoryChange={onCategoryChange}
        tags={tags}
        onTagsChange={onTagsChange}
        onRemoveTag={onRemoveTag}
      />
      <PublicationModule status={status} />
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