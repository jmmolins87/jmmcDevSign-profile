"use client";

/* SPEC 10 — Paso 9: panel principal — portada editorial + header editable.
   Imagen de portada 16:9 con overlay hover (cambiar/eliminar), badge alt text, dimensiones.
   Header: breadcrumb, título editable (textarea), excerpt editable (textarea cursiva).
   Upload de portada a Storage funcional. */

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { useDict } from "@/lib/i18n/I18nProvider";

// [placeholder] Portada de ejemplo (misma URL que references/06_editor_del_blog/code.html)
const COVER_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuATVQ789tbuRmiDcC6GlvQ0M272jYv1EYCcD4h9DMCca1BdPpFhDWMVbLMskZ8fe0vslehzYfhtsMIQ4Blg7JtNO2rY6pSq9wOKkl3uUg1Nq6tuYt_0eZATCp74nWAYrucurF4OIHlpJCgVeP8-g1y_xiih-fp9NOpLW5yovoquDC2M0FOyiUCKCAEhlp5TFW0p0CMA2tiOD0d8xss7hY5FGU54C7EPNiH9Ar2UnZIoyG8BfF77CSQd";

// [placeholder] Contenido de ejemplo
const DEFAULT_TITLE =
  "Diseñar con código: hacia una sensibilidad editorial en el software";
const DEFAULT_EXCERPT =
  "Reflexiones sobre el equilibrio entre rigor algorítmico, tipografía clásica y la tensión dramática en interfaces digitales contemporáneas.";
const DEFAULT_COVER_ALT =
  "Fotografía arquitectónica en tonos cálidos con estudio de diseño y biblioteca iluminada al atardecer.";

/* ---------- Cover Image ---------- */
interface CoverImageProps {
  coverAlt: string;
  altWordCount: number;
  coverImageUrl: string;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function CoverImage({
  coverAlt,
  altWordCount,
  coverImageUrl,
  onCoverUpload,
}: CoverImageProps) {
  const canvas = useDict().sections.editor.canvas;
  const imageSrc = coverImageUrl || COVER_IMAGE;

  return (
    <div
      className="relative group w-full rounded-xl overflow-hidden bg-surface-container aspect-[16/9]"
      data-anim="fade-up"
    >
      <div
        className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
        style={{ backgroundImage: `url('${imageSrc}')` }}
        data-alt={coverAlt}
        role="img"
        aria-label={coverAlt}
      />
      {/* Ambient scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent pointer-events-none" />

      {/* Hover toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md font-label-caps text-label-caps text-on-surface shadow-sm hover:bg-surface transition-colors cursor-pointer">
          <span className="material-symbols-outlined text-[15px]">
            photo_camera
          </span>
          <span>{canvas.changeImage}</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onCoverUpload}
          />
        </label>
        <button
          aria-label={canvas.removeCover}
          className="w-8 h-8 rounded-full bg-surface/90 backdrop-blur-md flex items-center justify-center text-error hover:bg-error-container transition-colors shadow-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>

      {/* Alt text pill + dimensions */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-surface-container-lowest font-mono-code text-mono-code pointer-events-none">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-inverse-surface/75 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[13px] text-secondary-fixed">
            check_circle
          </span>
          <span>{canvas.altConfigured} ({altWordCount} {canvas.altWords})</span>
        </span>
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-inverse-surface/60 backdrop-blur-sm text-[11px]">
          2140 × 1204 px · 16:9 {/* [placeholder] */}
        </span>
      </div>
    </div>
  );
}

/* ---------- Editable textarea wrappers ---------- */
const EditableTitle = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <div className="relative w-full">
    <textarea
      ref={ref}
      className={`w-full bg-transparent resize-none font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-on-surface tracking-tight leading-[1.08] focus:outline-none placeholder:text-outline-variant ${className ?? ""}`}
      rows={2}
      {...rest}
    />
  </div>
));
EditableTitle.displayName = "EditableTitle";

const EditableExcerpt = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <div className="w-full">
    <textarea
      ref={ref}
      className={`w-full bg-transparent resize-none font-body-lg text-body-lg text-on-surface-variant italic leading-relaxed focus:outline-none placeholder:text-outline-variant ${className ?? ""}`}
      rows={2}
      {...rest}
    />
  </div>
));
EditableExcerpt.displayName = "EditableExcerpt";

/* ---------- Essay Header ---------- */
interface EssayHeaderProps {
  title: string;
  onTitleChange: (v: string) => void;
  excerpt: string;
  onExcerptChange: (v: string) => void;
  readMin: number;
}

function EssayHeader({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  readMin,
}: EssayHeaderProps) {
  const canvas = useDict().sections.editor.canvas;
  return (
    <header className="flex flex-col gap-4 pt-2" data-anim="fade-up">
      {/* Category / breadcrumb */}
      <div className="flex items-center gap-2 font-mono-code text-mono-code text-primary">
        <span className="font-label-caps text-label-caps uppercase tracking-wider bg-surface-container-high px-2 py-0.5 rounded-full text-on-surface-variant">
          Volumen IV · Ensayo {/* [placeholder] */}
        </span>
        <span className="text-outline-variant">/</span>
        <span className="text-on-surface-variant">{readMin} {canvas.readTime}</span>
      </div>

      <EditableTitle
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={canvas.titlePlaceholder}
      />

      <EditableExcerpt
        value={excerpt}
        onChange={(e) => onExcerptChange(e.target.value)}
        placeholder={canvas.excerptPlaceholder}
      />
    </header>
  );
}

/* ---------- Export ---------- */
interface EditorCanvasProps {
  title: string;
  onTitleChange: (v: string) => void;
  excerpt: string;
  onExcerptChange: (v: string) => void;
  coverAlt: string;
  onCoverAltChange: (v: string) => void;
  coverImageUrl: string;
  onCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readMin: number;
}

export default function EditorCanvas({
  title,
  onTitleChange,
  excerpt,
  onExcerptChange,
  coverAlt,
  onCoverAltChange,
  coverImageUrl,
  onCoverUpload,
  readMin,
}: EditorCanvasProps) {
  const altWordCount = coverAlt.trim()
    ? coverAlt.trim().split(/\s+/).length
    : 0;

  return (
    <article className="lg:col-span-8 flex flex-col gap-6" data-anim="fade-up">
      <CoverImage
        coverAlt={coverAlt}
        altWordCount={altWordCount}
        coverImageUrl={coverImageUrl}
        onCoverUpload={onCoverUpload}
      />
      <EssayHeader
        title={title}
        onTitleChange={onTitleChange}
        excerpt={excerpt}
        onExcerptChange={onExcerptChange}
        readMin={readMin}
      />
    </article>
  );
}

export { DEFAULT_TITLE, DEFAULT_EXCERPT, DEFAULT_COVER_ALT };