"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

type ContactFormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export function ContactForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<ContactFormState>({ status: "idle" });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !message.trim()) {
      setState({ message: "Faltan datos para preparar la transmisión.", status: "error" });
      return;
    }

    setState({ status: "submitting" });
    timeoutRef.current = setTimeout(() => {
      setState({ message: "Transmisión mock preparada. Responderé en menos de 48 horas operativas.", status: "success" });
    }, 420);
  };

  const isSubmitting = state.status === "submitting";

  return (
    <form className="grid gap-space-lg" onSubmit={handleSubmit}>
      <div className="grid gap-space-sm">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-name">Identificador</label>
        <input
          className="min-h-12 border-b border-border bg-transparent px-space-sm font-mono text-mono-code text-primary outline-none focus:border-accent"
          id="contact-name"
          onChange={(event) => setName(event.target.value)}
          placeholder="NOMBRE / EQUIPO"
          required
          type="text"
          value={name}
        />
      </div>
      <div className="grid gap-space-sm">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-message">Brief de operación</label>
        <textarea
          className="min-h-28 resize-y border-b border-border bg-transparent px-space-sm py-space-sm font-mono text-mono-code text-primary outline-none focus:border-accent"
          id="contact-message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="QUÉ NECESITA TOMAR FORMA"
          required
          value={message}
        />
      </div>
      <motion.button
        animate={{ opacity: isSubmitting ? 0.72 : 1 }}
        className="inline-flex min-h-12 items-center justify-center border border-primary bg-primary px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground"
        disabled={isSubmitting}
        type="submit"
        whileHover={isSubmitting ? undefined : { backgroundColor: "var(--sys-color-background)", borderColor: "var(--sys-color-accent)", color: "var(--sys-color-primary)" }}
        whileTap={isSubmitting || shouldReduceMotion ? undefined : { scale: 0.96 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {isSubmitting ? "Preparando transmisión..." : "Preparar transmisión →"}
      </motion.button>

      <AnimatePresence initial={false} mode="wait">
        {state.status !== "idle" ? (
          <motion.p
            aria-live="polite"
            className={state.status === "error" ? "font-mono text-mono-code text-error" : "font-mono text-mono-code text-accent-text"}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -4 }}
            key={state.status}
            role={state.status === "error" ? "alert" : "status"}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {state.status === "submitting" ? "{ ESTADO: TRANSMITIENDO... }" : state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </form>
  );
}
