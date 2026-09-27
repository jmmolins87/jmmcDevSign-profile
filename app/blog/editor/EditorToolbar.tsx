"use client";

/* SPEC 09 — Paso 4: toolbar funcional del editor.
   Botones H1/H2/H3 (visual), negrita/cursiva/enlace/cita/código/imagen/listas.
   Cada botón inserta markdown real en el body textarea (selectionStart/selectionEnd).
   Contador real de palabras y minutos de lectura a la derecha. */

import { type RefObject, useCallback } from "react";

/* ---------- Markdown insertion helpers ---------- */

/** Inserta wrappers de markdown alrededor del texto seleccionado o en el cursor. */
function insertMarkdown(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  placeholder = "texto",
): void {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const insertion = selected ? `${prefix}${selected}${suffix}` : `${prefix}${placeholder}${suffix}`;
  const newValue = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
  textarea.value = newValue;

  // Disparar evento 'input' para que React lo detecte
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Reposicionar el cursor
  if (selected) {
    textarea.setSelectionRange(selectionStart + insertion.length, selectionStart + insertion.length);
  } else {
    const cursorPos = selectionStart + prefix.length;
    textarea.setSelectionRange(cursorPos, cursorPos + placeholder.length);
  }
  textarea.focus();
}

/* ---------- Toolbar Button ---------- */
function TBtn({
  onClick,
  active,
  title,
  children,
  mono = false,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <button
      className={`w-7 h-7 rounded-md flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors ${
        active ? "bg-surface-container text-on-surface" : ""
      } ${mono ? "font-mono-code text-mono-code font-semibold" : ""}`}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

/* ---------- Main Toolbar ---------- */
export default function EditorToolbar({
  bodyRef,
  wordCount,
  readMin,
}: {
  bodyRef: RefObject<HTMLTextAreaElement | null>;
  wordCount: number;
  readMin: number;
}) {
  const ta = useCallback(
    () => bodyRef.current,
    [bodyRef],
  );

  const handleBold = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "**", "**");
  }, [ta]);

  const handleItalic = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "_", "_");
  }, [ta]);

  const handleLink = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "[", "](url)", "texto del enlace");
  }, [ta]);

  const handleQuote = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "> ", "");
  }, [ta]);

  const handleCode = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "`", "`", "código");
  }, [ta]);

  const handleImage = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "![", "](url)", "alt text");
  }, [ta]);

  const handleBulletList = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "- ", "");
  }, [ta]);

  const handleNumberedList = useCallback(() => {
    const el = ta();
    if (el) insertMarkdown(el, "1. ", "");
  }, [ta]);

  // Criterio de aceptación: los headings insertan markdown (# / ## / ###)
  const handleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      const el = ta();
      if (el) insertMarkdown(el, "#".repeat(level) + " ", "", "Título");
    },
    [ta],
  );

  return (
    <div className="sticky top-[80px] z-30 w-full py-1">
      <nav
        aria-label="Herramientas de edición"
        className="w-full bg-surface/95 backdrop-blur-md rounded-xl px-3 py-2 flex items-center justify-between shadow-md overflow-x-auto gap-2"
      >
        {/* Heading levels */}
        <div className="flex items-center gap-1">
          {([1, 2, 3] as const).map((level) => (
            <button
              key={level}
              className={`w-7 h-7 rounded-md font-mono-code text-mono-code font-semibold flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors ${
                level === 2 ? "bg-surface-container-high text-primary" : ""
              }`}
              type="button"
              title={`Encabezado H${level}`}
              onClick={() => handleHeading(level)}
            >
              {`H${level}`}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-outline-variant" />

        {/* Formatting */}
        <div className="flex items-center gap-0.5">
          <TBtn onClick={handleBold} title="Negrita">
            <span className="material-symbols-outlined text-[17px]">format_bold</span>
          </TBtn>
          <TBtn onClick={handleItalic} title="Cursiva">
            <span className="material-symbols-outlined text-[17px]">format_italic</span>
          </TBtn>
          <TBtn onClick={handleLink} title="Enlace">
            <span className="material-symbols-outlined text-[17px]">link</span>
          </TBtn>
          <TBtn onClick={handleQuote} title="Cita en bloque" active>
            <span className="material-symbols-outlined text-[17px]">format_quote</span>
          </TBtn>
          <TBtn onClick={handleCode} title="Fragmento de código">
            <span className="material-symbols-outlined text-[17px]">code</span>
          </TBtn>
          <TBtn onClick={handleImage} title="Insertar imagen">
            <span className="material-symbols-outlined text-[17px]">add_photo_alternate</span>
          </TBtn>
        </div>

        <div className="w-[1px] h-4 bg-outline-variant" />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <TBtn onClick={handleBulletList} title="Lista con viñetas">
            <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
          </TBtn>
          <TBtn onClick={handleNumberedList} title="Lista numerada">
            <span className="material-symbols-outlined text-[17px]">format_list_numbered</span>
          </TBtn>
        </div>

        {/* Word count */}
        <div className="ml-auto pl-2 flex items-center gap-2 font-mono-code text-mono-code text-on-surface-variant whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          <span>
            {wordCount.toLocaleString("es-ES")} palabras · {readMin} min
          </span>
        </div>
      </nav>
    </div>
  );
}
