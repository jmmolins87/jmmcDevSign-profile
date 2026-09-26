"use client";

/* SPEC 08 — Paso 4: Panel auth (derecha).
   Header: ZONA PRIVADA — PORTAFOLIO v2.6.4
   Control segmentado: Entrar / Crear cuenta
   Formulario: AuthForm
   Footnote: Security card
   Bottom meta: ZONA_EDITORIAL // ID: JMMC-SYS-89 / ESTADO: SERVIDOR ACTIVO */

import { useState } from "react";
import AuthForm from "./AuthForm";

type AuthMode = "login" | "register";

const MODE_CONFIG: Record<AuthMode, { title: string; description: string }> = {
  login: {
    title: "Entrar",
    description:
      "Introduce tus credenciales para acceder al gestor editorial, notas de taller y publicaciones privadas.",
  },
  register: {
    title: "Crear cuenta",
    description:
      "Registra tu acceso al gestor editorial, notas de taller y publicaciones privadas.",
  },
};

export default function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const config = MODE_CONFIG[mode];

  return (
    <div className="w-full lg:w-1/2 bg-surface-container-lowest flex flex-col justify-between p-8 sm:p-12 lg:p-16">
      <div className="max-w-md w-full mx-auto my-auto flex flex-col justify-center">
        {/* Editorial Header Stack */}
        <div className="mb-8" data-anim="fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
              ZONA PRIVADA — PORTAFOLIO
            </span>
            <span className="font-mono-code text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
              v2.6.4
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2">
            {config.title}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Mode Selector / Segmented Control */}
        <div className="p-1 rounded-full bg-surface-container mb-8 flex items-center" data-anim="stagger-label">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 px-4 rounded-full font-label-caps text-label-caps uppercase transition-all ${
              mode === "login"
                ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-current={mode === "login" ? "true" : "false"}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 px-4 rounded-full font-label-caps text-label-caps uppercase transition-all ${
              mode === "register"
                ? "bg-inverse-surface text-inverse-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
            aria-current={mode === "register" ? "true" : "false"}
          >
            Crear cuenta
          </button>
        </div>

        {/* Authentication Form */}
        <AuthForm mode={mode} />

        {/* Security Footnote Card */}
        <div className="mt-8 pt-6 bg-surface-container-low rounded-xl p-4 space-y-3" data-anim="fade-up">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant mt-0.5 shrink-0">info</span>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              Solo los miembros acreditados pueden publicar en el blog y acceder a las notas de versión previas. Si aún no tienes invitación, solicita acceso mediante el formulario de contacto oficial.
            </p>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant/80 pt-2 font-mono-code text-[11px]">
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              Autenticación Cifrada
            </span>
            <a className="text-primary hover:underline uppercase font-label-caps text-label-caps" href="#">
              Solicitar Invitación →
            </a>
          </div>
        </div>

        {/* Bottom Session Meta Status */}
        <div className="mt-8 pt-4 flex items-center justify-between text-on-surface-variant font-mono-code text-[11px]" data-anim="fade-up">
          <span>ZONA_EDITORIAL // ID: JMMC-SYS-89</span>
          <span>ESTADO: SERVIDOR ACTIVO</span>
        </div>
      </div>
    </div>
  );
}