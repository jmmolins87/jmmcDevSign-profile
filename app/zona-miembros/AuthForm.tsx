"use client";

/* SPEC 10 — Paso 4: formulario de autenticación real (Supabase Auth).
   Hereda el diseño de SPEC 08; la lógica mock se sustituye por:
   - login: signInWithPassword → redirect a /blog/editor
   - registro: signUp (rol author vía trigger) → sesión o aviso de confirmación
   - enlace mágico: signInWithOtp → toast visual
   - errores reales de Supabase en el callout arquitectónico
   Validación nativa HTML5 + estados visuales. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getBrowserClient } from "@/lib/supabase/browser";
import { useDict, useI18n } from "@/lib/i18n/I18nProvider";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode: AuthMode;
}

/* Códigos de error de Supabase → claves del diccionario. */
const ERROR_CODES = [
  "invalid_credentials",
  "user_already_exists",
  "email_not_confirmed",
  "weak_password",
  "signup_disabled",
  "over_email_send_rate_limit",
] as const;

type ErrorCode = (typeof ERROR_CODES)[number];

function isErrorCode(code: string | undefined): code is ErrorCode {
  return !!code && (ERROR_CODES as readonly string[]).includes(code);
}

function mapError(
  errors: Record<string, string>,
  code: string | undefined,
  fallback: string,
): { message: string; code: string } {
  const key = code ?? "";
  return {
    message: isErrorCode(key) ? errors[key] : fallback,
    code: key ? `AUTH_${key.toUpperCase()}` : "AUTH_ERROR",
  };
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const zone = useDict().sections.zonaMiembros;
  const { withLocale } = useI18n();

  // El email recordado se guarda en localStorage; la sesión la gestiona
  // Supabase en cookies (refresh token de 30 días).
  const [email, setEmail] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem("auth:remember");
      if (stored) {
        const data = JSON.parse(stored) as { email?: string };
        if (data.email) return data.email;
      }
    } catch {
      /* sin persistencia previa */
    }
    return "";
  });
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorCode, setErrorCode] = useState("AUTH_ERROR");
  const [notice, setNotice] = useState("");
  const [attempt, setAttempt] = useState(1);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorCalloutRef = useRef<HTMLDivElement>(null);
  const passwordFieldRef = useRef<HTMLInputElement>(null);
  const magicLinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (magicLinkTimerRef.current) clearTimeout(magicLinkTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      if (remember && email) {
        localStorage.setItem("auth:remember", JSON.stringify({ email }));
      } else {
        localStorage.removeItem("auth:remember");
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }, [remember, email]);

  const showError = (message: string, code: string) => {
    setErrorMessage(message);
    setErrorCode(code);
    setErrorVisible(true);
    setAttempt((prev) => Math.min(prev + 1, 3));
    setNotice("");
    if (passwordFieldRef.current) {
      passwordFieldRef.current.setAttribute("aria-invalid", "true");
    }
    if (errorCalloutRef.current) {
      errorCalloutRef.current.classList.remove("scale-100");
      errorCalloutRef.current.classList.add("scale-[1.02]");
      setTimeout(() => {
        errorCalloutRef.current?.classList.remove("scale-[1.02]");
      }, 200);
    }
  };

  const clearError = () => {
    setErrorVisible(false);
    if (passwordFieldRef.current) {
      passwordFieldRef.current.removeAttribute("aria-invalid");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearError();
    setNotice("");
    const supabase = getBrowserClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          const mapped = mapError(zone.errors, error.code, error.message);
          showError(mapped.message, mapped.code);
          return;
        }
        router.push(withLocale("/blog/editor"));
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        const mapped = mapError(zone.errors, error.code, error.message);
        showError(mapped.message, mapped.code);
        return;
      }
      if (data.session) {
        router.push(withLocale("/blog/editor"));
        return;
      }
      /* Confirmación de email activada en el proyecto: sin sesión aún. */
      setNotice(zone.signupNotice);
      setErrorVisible(false);
    } catch {
      showError(zone.networkError, "AUTH_NETWORK");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMagicLink = async () => {
    if (magicLinkSent || isSubmitting) return;
    clearError();

    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${withLocale("/blog/editor")}` },
    });

    if (error) {
      const mapped = mapError(zone.errors, error.code, error.message);
      showError(mapped.message, mapped.code);
      return;
    }

    setMagicLinkSent(true);
    if (magicLinkTimerRef.current) clearTimeout(magicLinkTimerRef.current);
    magicLinkTimerRef.current = setTimeout(() => {
      setMagicLinkSent(false);
    }, 3500);
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
            {zone.emailLabel}
          </label>
          <span className="font-mono-code text-[11px] text-on-surface-variant/70">{zone.authorId}</span>
        </div>
        <div className="relative">
          <input
            className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 font-body-md text-body-md focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            id="email-field"
            placeholder={zone.emailPlaceholder}
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
            {zone.passwordLabel}
          </label>
          {isLogin && (
            <a
              className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors uppercase"
              href="#"
            >
              {zone.forgotPassword}
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
            minLength={6}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            disabled={isSubmitting}
            aria-invalid={errorVisible}
          />
          <button
            type="button"
            aria-label={showPassword ? zone.hidePassword : zone.showPassword}
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
              {errorMessage}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-code text-[11px] text-on-surface-variant tracking-normal">
                {zone.codeLabel} <code className="font-semibold text-error">{errorCode}</code>
              </span>
              <span className="font-mono-code text-[11px] bg-surface-container-lowest px-1.5 py-0.5 rounded text-error font-medium">
                {zone.attempt} {attempt}/3
              </span>
            </div>
          </div>
        </div>

        {/* Notice (registro sin sesión: confirmación de email) */}
        {notice && (
          <div
            className="mt-2 p-3.5 rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-3"
            role="status"
            aria-live="polite"
          >
            <span className="material-symbols-outlined text-[20px] mt-0.5 shrink-0">mark_email_read</span>
            <p className="font-body-sm text-body-sm font-medium leading-snug">{notice}</p>
          </div>
        )}
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
            {zone.remember}
          </span>
        </label>
        <span className="font-mono-code text-[11px] text-on-surface-variant/80">
          {zone.sessionDuration}
        </span>
      </div>

      {/* Actions Stack */}
      <div className="pt-2 space-y-3" data-anim="stagger-label">
        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-caps text-label-caps uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all group active:scale-[0.99] disabled:opacity-80 disabled:pointer-events-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              <span>{zone.verifying}</span>
            </>
          ) : (
            <>
              <span>{isLogin ? zone.submitLogin : zone.submitRegister}</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">file_download</span>
            </>
          )}
        </button>

        {/* Secondary Alternative Action */}
        <button
          type="button"
          onClick={sendMagicLink}
          className={`w-full py-2.5 text-center transition-colors flex items-center justify-center gap-2 group ${
            magicLinkSent ? "text-secondary" : "text-on-surface-variant hover:text-primary"
          }`}
          disabled={isSubmitting || magicLinkSent}
        >
          {magicLinkSent ? (
            <>
              <span className="material-symbols-outlined text-[18px] text-secondary animate-bounce">mark_email_read</span>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                {zone.magicSent}
              </span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px] text-tertiary group-hover:rotate-12 transition-transform">auto_fix_high</span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider group-hover:underline underline-offset-4">
                {zone.magicLink}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
