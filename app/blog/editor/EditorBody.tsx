"use client";

/* SPEC 09 — Paso 5: cuerpo editable del artículo.
   Textarea grande con contenido de ejemplo, cursor pulsante animado.
   El usuario puede escribir y el contador de palabras se actualiza. */

import {
  forwardRef,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

import { useDict } from "@/lib/i18n/I18nProvider";

// [placeholder] Contenido de ejemplo del cuerpo
const DEFAULT_BODY = `Durante décadas, la industria del software ha tratado la interfaz de usuario como una mera capa de abstracción funcional: un conjunto prescindible de cajas ensambladas con el único propósito de despachar información transaccional. Sin embargo, cuando observamos las publicaciones editoriales del siglo XX —desde las partituras tipográficas de Emil Ruder hasta los volúmenes arquitectónicos de El Croquis—, descubrimos que cada espacio en blanco, cada modulación de ritmo y cada tensión asimétrica transmiten una intención estética inequívoca.

> «La verdadera elegancia visual surge de la contención: eliminar lo superfluo hasta que solo permanezca la estructura y la resonancia del contenido.»
>
> — Cuaderno de taller, 2026

1. La tensión entre densidad y whitespace

En sistemas de alta densidad de información, el reto no reside en comprimir datos de manera indiscriminada, sino en orquestar anclas visuales mediante JetBrains Mono para valores cuantitativos y una tipografía romana de alto contraste para el eje narrativo. Diseñar con código implica concebir el DOM no como un árbol estático, sino como un plano secuencial donde el scroll actúa como el paso de página en una publicación encuadernada.`;

const BodyTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...rest }, ref) => (
  <textarea
    ref={ref}
    className={`w-full bg-transparent resize-none font-body-lg text-body-lg text-on-surface leading-[1.85] text-justify focus:outline-none placeholder:text-outline-variant min-h-[320px] ${className ?? ""}`}
    {...rest}
  />
));
BodyTextarea.displayName = "BodyTextarea";

/* ---------- Pull Quote Preview (debajo del textarea, referencia visual) ---------- */
function PullQuotePreview({ body }: { body: string }) {
  const pullQuoteLabel = useDict().sections.editor.body.pullQuoteLabel;
  // Muestra el pull quote si existe en el body
  const quoteMatch = body.match(/>[ \t]*«([^»]+)»/);
  if (!quoteMatch) return null;
  return (
    <div className="my-4 pl-6 py-3 bg-surface-container-low rounded-r-xl relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-full" />
      <p className="font-headline-sm text-headline-sm text-on-surface italic leading-relaxed">
        «{quoteMatch[1]}»
      </p>
      <div className="mt-3 flex items-center gap-2 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
        <span>— Cuaderno de taller, 2026</span> {/* [placeholder] */}
        <span className="text-outline-variant">·</span>
        <span className="text-secondary font-mono-code">{pullQuoteLabel}</span>
      </div>
    </div>
  );
}

/* ---------- Revision Note Callout ---------- */
function RevisionNote() {
  const revisionTitle = useDict().sections.editor.body.revisionTitle;
  return (
    <div className="mt-4 p-5 rounded-xl bg-surface-container-low flex items-start gap-4">
      <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">
        edit_note
      </span>
      <div className="flex flex-col gap-1">
        <span className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider">
          {revisionTitle}
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Pendiente de añadir un gráfico interactivo SVG con la correlación de
          escala tipográfica áurea y la velocidad de lectura cognitiva en
          pantallas retina. {/* [placeholder] */}
        </p>
      </div>
    </div>
  );
}

/* ---------- Blinking Cursor Indicator ---------- */
function BlinkingCursor() {
  return (
    <span className="inline-block w-[2px] h-5 bg-primary ml-1 align-middle animate-pulse" />
  );
}

/* ---------- Main Body Component ---------- */
export default function EditorBody({
  value,
  onChange,
  bodyRef,
}: {
  value: string;
  onChange: (v: string) => void;
  bodyRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const ref = bodyRef || internalRef;
  const [showCursor, setShowCursor] = useState(true);
  const bodyPlaceholder = useDict().sections.editor.body.bodyPlaceholder;

  // Ocultar cursor pulsante cuando el textarea tiene foco
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = () => setShowCursor(false);
    const onBlur = () => setShowCursor(true);
    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);
    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
    };
  }, [ref]);

  return (
    <div className="flex flex-col gap-6 py-4" data-anim="fade-up">
      <BodyTextarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={bodyPlaceholder}
        rows={16}
      />
      {/* Visual accent: pull quote preview + revision note */}
      <PullQuotePreview body={value} />
      <RevisionNote />
      {showCursor && <BlinkingCursor />}
    </div>
  );
}

export { DEFAULT_BODY };
