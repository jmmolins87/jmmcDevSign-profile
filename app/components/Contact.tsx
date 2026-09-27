/* SPEC 01 — Paso 8: sección 07 — Contacto.
   Formulario con validación nativa (required) y estado de envío
   [placeholder]: sin alert(), sin API route (spec futura). */

"use client";

import { useState } from "react";
import { useDict } from "@/lib/i18n/I18nProvider";
import Section from "./ui/Section";
import SectionHeading from "./ui/SectionHeading";

export default function Contact() {
  // [placeholder] — envío real (proveedor de email) en una spec futura.
  const [sent, setSent] = useState(false);
  const { contact } = useDict().sections;

  return (
    <Section id="contacto" anim="reveal-lines" divider={false}>
      <SectionHeading index="07" name={contact.name} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Giant Left Title */}
        <div className="lg:col-span-5 space-y-6">
          <h2 className="font-display-xl text-[72px] sm:text-[96px] leading-[0.95] text-on-surface font-normal">
            {contact.title}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {contact.body}
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
              <span>{contact.location}</span>
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
                {contact.nameLabel}
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:ring-0 focus:border-primary transition-colors outline-none"
                id="contact-name"
                name="name"
                placeholder={contact.namePlaceholder}
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
                {contact.emailLabel}
              </label>
              <input
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:ring-0 focus:border-primary transition-colors outline-none"
                id="contact-email"
                name="email"
                placeholder={contact.emailPlaceholder}
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
                {contact.messageLabel}
              </label>
              <textarea
                className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 font-body-md text-body-md text-on-surface placeholder:text-outline/60 focus:ring-0 focus:border-primary transition-colors outline-none resize-none"
                id="contact-message"
                name="message"
                placeholder={contact.messagePlaceholder}
                required
                rows={4}
              />
            </div>
            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between">
              <span className="font-mono-code text-[11px] text-outline">
                {contact.responseNote}
              </span>
              <button
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-on-primary font-mono-code text-mono-code font-medium hover:bg-on-surface transition-all duration-300 transform hover:-translate-y-0.5"
                type="submit"
              >
                <span>{contact.submit}</span>
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
                {contact.success}
              </p>
            )}
          </form>
        </div>
      </div>
    </Section>
  );
}
