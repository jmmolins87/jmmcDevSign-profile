"use client";

/* SPEC 08 — Paso 5: Formulario de autenticación completo.
   Campos: email (type=email), password (type=password con toggle)
   Checkbox: Recordar este terminal + mono "Sesión: 30 días"
   Botón primario: Acceder a la zona de miembros + icono file_download
   Botón secundario: Enviarme un enlace mágico + icono auto_fix_high + toast
   Error callout arquitectónico: ERR_AUTH_INVALID_TOKEN + Intento 1/3 + role="alert"
   Validación nativa HTML5 + estados visuales mock
   data-anim="fade-up" en formulario, data-anim="stagger-label" en campos */

import { useState, useRef, useEffect } from "react";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

// Module-level timestamp for initial hydration (evaluated once at module load)
// Avoids calling Date.now() during render (impure function lint rule)
const INITIAL_NOW = Date.now();

export default function AuthForm({ mode }: AuthFormProps) {
  // Lazy initial state from localStorage (avoids setState in effect)
  const getInitialAuthState = () => {
    if (typeof window === "undefined") {
      return { email: "juanma@estudio.io", remember: true }; // [placeholder]
    }
    try {
      const stored = localStorage.getItem("auth:v1");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.remember && data.expiresAt > INITIAL_NOW) {
          return { email: data.email, remember: true };
        }
      }
    } catch {
      // Ignorar errores de parsing
    }
    return { email: "juanma@estudio.io", remember: true }; // [placeholder]
  };

  const initialAuth = getInitialAuthState();

  const [email, setEmail] = useState(initialAuth.email);
  const [password, setPassword] = useState("SecretToken2026!"); // [placeholder]
  const [remember, setRemember] = useState(initialAuth.remember);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [attempt, setAttempt] = useState(1);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorCalloutRef = useRef<HTMLDivElement>(null);
  const passwordFieldRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const magicLinkBtnRef = useRef<HTMLButtonElement>(null);

  // Persistencia mock para "Recordar este terminal"
  useEffect(() => {
    if (remember && email) {
      const authData = {
        email,
        remember: true,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 días
      };
      localStorage.setItem("auth:v1", JSON.stringify(authData));
    } else {
      localStorage.removeItem("auth:v1");
    }
  }, [remember, email]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    if (submitBtnRef.current) {
      submitBtnRef.current.innerHTML =
        '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span><span>Verificando...</span>';
      submitBtnRef.current.classList.add("opacity-80", "pointer-events-none");
    }

    // Mock: simular verificación (700ms)
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Mock: siempre falla para mostrar error callout
    setErrorVisible(true);
    setAttempt((prev) => Math.min(prev + 1, 3));

    if (passwordFieldRef.current) {
      passwordFieldRef.current.setAttribute("aria-invalid", "true");
    }

    // Animación scale en error callout
    if (errorCalloutRef.current) {
      errorCalloutRef.current.classList.remove("scale-100");
      errorCalloutRef.current.classList.add("scale-[1.02]");
      setTimeout(() => {
        errorCalloutRef.current?.classList.remove("scale-[1.02]");
      }, 200);
    }

    // Restaurar botón
    if (submitBtnRef.current) {
      submitBtnRef.current.innerHTML =
        '<span>Acceder a la zona de miembros</span><span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">file_download</span>';
      submitBtnRef.current.classList.remove("opacity-80", "pointer-events-none");
    }

    setIsSubmitting(false);
  };

  const sendMagicLink = () => {
    if (magicLinkSent) return;

    setMagicLinkSent(true);
    if (magicLinkBtnRef.current) {
      const originalHTML = magicLinkBtnRef.current.innerHTML;
      magicLinkBtnRef.current.innerHTML =
        '<span class="material-symbols-outlined text-[18px] text-secondary animate-bounce">mark_email_read</span><span class="font-label-caps text-label-caps text-secondary uppercase">¡Enlace enviado a tu buzón!</span>';

      setTimeout(() => {
        if (magicLinkBtnRef.current) {
          magicLinkBtnRef.current.innerHTML = originalHTML;
        }
        setMagicLinkSent(false);
      }, 3500);
    }
  };

  const isLogin = mode === "login";

  return (
    <form className="space-y-6" data-anim="fade-up" onSubmit={handleSubmit}>
      {/* Email Input */}
      <div className="space-y-2" data-anim="stagger-label">
        <div className="flex items-center justify-between">
          <label
            htmlFor="email-field"
            className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest"
          >
            CORREO ELECTRÓNICO
          </label>
          <span className="font-mono-code text-[11px] text-on-surface-variant/70">ID DE AUTOR</span>
        </div>
        <div className="relative">
          <input
            className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            id="email-field"
            placeholder="nombre@estudio.io"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
          />
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            alternate_email
          </span>
        </div>
      </div>

      {/* Password Input with inline state */}
      <div className="space-y-2" data-anim="stagger-label">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password-field"
            className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest"
          >
            CONTRASEÑA
          </label>
          {isLogin && (
            <a
              className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors uppercase"
              href="#"
            >
              ¿Olvidé mi contraseña?
            </a>
          )}
        </div>
        <div className="relative">
          <input
            ref={passwordFieldRef}
            className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container-low text-on-surface font-mono-code text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-error focus:outline-none transition-all"
            id="password-field"
            placeholder="••••••••••••"
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            disabled={isSubmitting}
            aria-invalid={errorVisible}
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full transition-colors"
            onClick={togglePasswordVisibility}
            disabled={isSubmitting}
          >
            <span className="material-symbols-outlined text-[19px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>

        {/* Inline Architectural Error State Display */}
        <div
          ref={errorCalloutRef}
          className={`mt-2 p-3.5 rounded-xl bg-error-container text-on-error-container flex items-start gap-3 transition-all transform ${
            errorVisible ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
          }`}
          role="alert"
          aria-live="assertive"
          style={{ display: errorVisible ? "flex" : "none" }}
        >
          <span className="material-symbols-outlined text-error text-[20px] mt-0.5 shrink-0">error</span>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="font-body-sm text-body-sm font-medium text-error leading-snug">
              La contraseña introducida no coincide con los registros autorizados.
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-code text-[11px] text-on-surface-variant tracking-normal">
                Código: <code className="font-semibold text-error">ERR_AUTH_INVALID_TOKEN</code>
              </span>
              <span className="font-mono-code text-[11px] bg-surface-container-lowest px-1.5 py-0.5 rounded text-error font-medium">
                Intento {attempt}/3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Remember Me & Session Duration */}
      <div className="flex items-center justify-between pt-1" data-anim="stagger-label">
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-4 h-4 rounded text-primary accent-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
            disabled={isSubmitting}
          />
          <span className="font-body-sm text-body-sm text-on-surface-variant select-none">
            Recordar este terminal
          </span>
        </label>
        <span className="font-mono-code text-[11px] text-on-surface-variant/80">
          Sesión: 30 días
        </span>
      </div>

      {/* Actions Stack */}
      <div className="pt-2 space-y-3" data-anim="stagger-label">
        <button
          ref={submitBtnRef}
          type="submit"
          className="w-full h-12 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all group active:scale-[0.99]"
          disabled={isSubmitting}
        >
          <span>Acceder a la zona de miembros</span>
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">file_download</span>
        </button>

        {/* Secondary Alternative Action */}
        <button
          ref={magicLinkBtnRef}
          type="button"
          onClick={sendMagicLink}
          className="w-full py-2.5 text-center text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-2 group"
          disabled={isSubmitting || magicLinkSent}
        >
          <span className="material-symbols-outlined text-[18px] text-tertiary group-hover:rotate-12 transition-transform">auto_fix_high</span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider group-hover:underline underline-offset-4">
            Enviarme un enlace mágico
          </span>
        </button>
      </div>
    </form>
  );
}