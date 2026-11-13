"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { usePrefersReducedMotion } from "@/app/es/_components/use-prefers-reduced-motion";

type ContactFormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const projectScopes = [
  { label: "[ AUDITORÍA DE ARQUITECTURA / CORE REFACTOR ]", value: "audit" },
  { label: "[ SISTEMA AUTÓNOMO IA MULTI-AGENTE ]", value: "ai-agent" },
  { label: "[ PLATAFORMA FULLSTACK DE ALTA ESCALA ]", value: "enterprise-fullstack" },
  { label: "[ ADVISORY TÉCNICO CONTINUO ]", value: "advisory" },
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<string>(projectScopes[0].value);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setState({ message: "Faltan datos para preparar la transmisión.", status: "error" });
      return;
    }

    setState({ status: "submitting" });
    timeoutRef.current = setTimeout(() => {
      setState({ message: "{ TRANSMITIDO CON ÉXITO ✦ }", status: "success" });
    }, 420);
  };

  const isSubmitting = state.status === "submitting";
  const stateMessage = state.status === "idle" ? "{ LISTO PARA ENVIAR }" : state.status === "submitting" ? "{ TRANSMITIENDO... }" : state.message;

  return (
    <form className="grid gap-space-md" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-name">{"{ 01 } IDENTIFICACIÓN / NOMBRE *"}</label>
        <input
          className="min-h-12 w-full bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface placeholder:text-outline-variant outline-none transition-colors focus:bg-surface-container-highest"
          id="contact-name"
          onChange={(event) => setName(event.target.value)}
          placeholder="p. ej. Carlos Mendonça // VP de Ingeniería"
          required
          type="text"
          value={name}
        />
      </div>

      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-email">{"{ 02 } CORREO ELECTRÓNICO *"}</label>
        <input
          className="min-h-12 w-full bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface placeholder:text-outline-variant outline-none transition-colors focus:bg-surface-container-highest"
          id="contact-email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="carlos@organizacion.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-scope">{"{ 03 } ENVERGADURA DEL PROYECTO"}</label>
        <select
          className="min-h-12 w-full bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface outline-none transition-colors focus:bg-surface-container-highest"
          id="contact-scope"
          onChange={(event) => setScope(event.target.value)}
          value={scope}
        >
          {projectScopes.map((projectScope) => <option key={projectScope.value} value={projectScope.value}>{projectScope.label}</option>)}
        </select>
      </div>

      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-message">{"{ 04 } DESCRIPCIÓN DEL REQUERIMIENTO *"}</label>
        <textarea
          className="min-h-32 w-full resize-none bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface placeholder:text-outline-variant outline-none transition-colors focus:bg-surface-container-highest"
          id="contact-message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Describe los desafíos de infraestructura, volumen esperado y fechas objetivo..."
          required
          rows={4}
          value={message}
        />
      </div>

      <div className="flex flex-col items-start justify-between gap-space-md pt-space-xs sm:flex-row sm:items-center">
        <motion.button
          animate={{ opacity: isSubmitting ? 0.72 : 1 }}
          className="inline-flex min-h-12 items-center gap-space-sm bg-primary px-space-xl font-headline text-label-caps uppercase text-primary-foreground transition-colors hover:bg-surface-container-highest hover:text-primary"
          disabled={isSubmitting}
          type="submit"
        >
          <span aria-hidden="true" className="text-accent">✦</span>
          <span>{isSubmitting ? "TRANSMITIENDO..." : "ENVIAR TRANSMISIÓN"}</span>
          <span className="font-mono text-mono-code">[ POST ]</span>
        </motion.button>

        <motion.p
          aria-live="polite"
          className={state.status === "error" ? "font-mono text-mono-code text-error" : "font-mono text-mono-code text-accent-text"}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          initial={{ opacity: 0, transform: shouldReduceMotion ? "translateY(0)" : "translateY(0.25rem)" }}
          role={state.status === "error" ? "alert" : "status"}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          {stateMessage}
        </motion.p>
      </div>
    </form>
  );
}
