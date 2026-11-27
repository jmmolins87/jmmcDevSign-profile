"use client";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import { motion } from "motion/react";
import { useActionState, useState } from "react";

import { submitContact } from "@/app/[locale]/_components/contact-action";
import { projectScopes } from "@/app/[locale]/_components/contact-scopes";
import { usePrefersReducedMotion } from "@/app/[locale]/_components/use-prefers-reduced-motion";

export function ContactForm() {
  const t = usePublicCopy();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [scope, setScope] = useState<string>(projectScopes[0].value);
  const [message, setMessage] = useState("");
  const [state, action, isSubmitting] = useActionState(submitContact, "idle");
  const shouldReduceMotion = usePrefersReducedMotion();
  const hasError = !isSubmitting && (state === "invalid" || state === "unavailable");
  const stateMessage = isSubmitting ? "{ TRANSMITIENDO... }"
    : state === "sent" ? "{ TRANSMITIDO CON ÉXITO ✦ }"
    : state === "invalid" ? "Faltan datos para preparar la transmisión."
    : state === "unavailable" ? "No se pudo enviar el mensaje. Inténtalo de nuevo o escríbenos por correo."
    : "{ LISTO PARA ENVIAR }";

  return (
    <form action={action} className="grid gap-space-md">
      <input autoComplete="off" hidden name="website" tabIndex={-1} />
      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-name">{t("{ 01 } IDENTIFICACIÓN / NOMBRE *")}</label>
        <input
          className="min-h-12 w-full bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface placeholder:text-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:bg-surface-container-highest"
          id="contact-name"
          autoComplete="name"
          maxLength={120}
          name="name"
          onChange={(event) => setName(event.target.value)}
          placeholder={t("p. ej. Carlos Mendonça // VP de Ingeniería")}
          required
          type="text"
          value={name}
        />
      </div>

      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-email">{t("{ 02 } CORREO ELECTRÓNICO *")}</label>
        <input
          className="min-h-12 w-full bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface placeholder:text-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:bg-surface-container-highest"
          id="contact-email"
          autoComplete="email"
          maxLength={254}
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="carlos@organizacion.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-scope">{t("{ 03 } ENVERGADURA DEL PROYECTO")}</label>
        <select
          className="min-h-12 w-full bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:bg-surface-container-highest"
          id="contact-scope"
          name="scope"
          onChange={(event) => setScope(event.target.value)}
          value={scope}
        >
          {projectScopes.map((projectScope) => <option key={projectScope.value} value={projectScope.value}>{t(projectScope.label)}</option>)}
        </select>
      </div>

      <div className="grid gap-space-xs">
        <label className="font-mono text-mono-code uppercase text-on-surface-variant" htmlFor="contact-message">{t("{ 04 } DESCRIPCIÓN DEL REQUERIMIENTO *")}</label>
        <textarea
          className="min-h-32 w-full resize-none bg-surface-container-low px-space-md py-3 font-mono text-mono-code text-on-surface placeholder:text-outline-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent transition-colors focus:bg-surface-container-highest"
          id="contact-message"
          maxLength={5000}
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("Describe los desafíos de infraestructura, volumen esperado y fechas objetivo...")}
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
          <span>{isSubmitting ? t("TRANSMITIENDO...") : t("ENVIAR TRANSMISIÓN")}</span>
          <span className="font-mono text-mono-code">[ POST ]</span>
        </motion.button>

        <motion.p
          aria-live="polite"
          className={hasError ? "font-mono text-mono-code text-error" : "font-mono text-mono-code text-accent-text"}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          initial={{ opacity: 0, transform: shouldReduceMotion ? "translateY(0)" : "translateY(0.25rem)" }}
          role={hasError ? "alert" : "status"}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.18, ease: [0.23, 1, 0.32, 1] }}
        >
          {t(stateMessage)}
        </motion.p>
      </div>
    </form>
  );
}
