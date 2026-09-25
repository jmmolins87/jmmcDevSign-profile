/* SPEC 01 — Paso 8: sección 07 — Contacto.
   Formulario con validación nativa (required) y estado de envío
   [placeholder]: sin alert(), sin API route (spec futura). */

"use client";

import { useState } from "react";

export default function Contact() {
  // [placeholder] — envío real (proveedor de email) en una spec futura.
  const [sent, setSent] = useState(false);

  return (
    <section
      className="w-full max-w-[1280px] mx-auto px-margin-mobile lg:px-margin py-32"
      data-anim="reveal-lines"
      id="contacto"
    >
      <div className="flex items-center gap-space-md mb-16">
        <span className="font-mono-code text-mono-code text-primary uppercase tracking-[0.06em]">
          07 — Contacto
        </span>
        <div className="h-[1px] flex-1 bg-outline-variant" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Giant Left Title */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="font-display-xl text-[72px] sm:text-[96px] leading-[0.95] text-on-surface font-normal">
            ¿Hablamos?
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            ¿Tienes un proyecto en mente, buscas consultoría de arquitectura o
            necesitas elevar el diseño de tu producto? Cuéntame y te responderé
            en menos de 24 horas.
          </p>
          <div className="pt-8 space-y-3 font-mono-code text-mono-code">
            <div className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">
                mail
              </span>
              <a
                className="hover:text-primary transition-colors"
                href="mailto:hola@jmmc.dev"
              >
                hola@jmmc.dev
              </a>
            </div>
            <div className="flex items-center gap-3 text-on-surface">
              <span className="material-symbols-outlined text-primary text-[18px]">
                location_on
              </span>
              <span>Madrid, España (UTC+1)</span>
            </div>
          </div>
        </div>
        {/* Right Form */}
        <div className="lg:col-span-7 bg-surface-container-low p-8 sm:p-12 rounded-2xl border border-outline-variant">
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            {/* Field: Nombre */}
            <div className="space-y-2">
              <label
                className="block font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant"
                htmlFor="contact-name"
              >
                Tu nombre *
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:ring-0 focus:border-primary transition-colors outline-none"
                id="contact-name"
                name="name"
                placeholder="p. ej. Elena Navarro"
                required
                type="text"
                autoComplete="name"
              />
            </div>
            {/* Field: Email */}
            <div className="space-y-2">
              <label
                className="block font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant"
                htmlFor="contact-email"
              >
                Tu email *
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:ring-0 focus:border-primary transition-colors outline-none"
                id="contact-email"
                name="email"
                placeholder="elena@empresa.com"
                required
                type="email"
                autoComplete="email"
              />
            </div>
            {/* Field: Mensaje */}
            <div className="space-y-2">
              <label
                className="block font-mono-code text-[11px] uppercase tracking-wider text-on-surface-variant"
                htmlFor="contact-message"
              >
                Sobre el proyecto *
              </label>
              <textarea
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:ring-0 focus:border-primary transition-colors outline-none resize-none"
                id="contact-message"
                name="message"
                placeholder="Describe brevemente tus objetivos, plazos o el stack que tienes en mente..."
                required
                rows={4}
              />
            </div>
            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between">
              <span className="font-mono-code text-[11px] text-outline">
                Respuesta asegurada en &lt;24h
              </span>
              <button
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-on-primary font-mono-code text-mono-code font-medium hover:bg-on-surface transition-all duration-300 transform hover:-translate-y-0.5"
                type="submit"
              >
                <span>Enviar mensaje</span>
                <span className="material-symbols-outlined text-[18px]">
                  send
                </span>
              </button>
            </div>
            {sent && (
              <p
                role="status"
                className="flex items-center gap-2 font-mono-code text-mono-code text-secondary"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                Mensaje recibido — te responderé en menos de 24 horas.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
