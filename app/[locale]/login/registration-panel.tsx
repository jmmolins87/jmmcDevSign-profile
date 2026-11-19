"use client";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { Button, CheckboxField, ErrorState, InputField } from "@/app/components/ui";
import { cn } from "@/app/components/ui/utils";
import type { RegistrationRequest, RegistrationRole } from "@/app/[locale]/auth/types";
import { mockRegistrationAdapter, type RegistrationAuthAdapter } from "@/app/[locale]/auth/mock-registration-service";

export type RegistrationFormValues = {
  email: string;
  fullName: string;
  password: string;
  passwordConfirmation: string;
  requestedRole: RegistrationRole | "";
  termsAccepted: boolean;
};

export type RegistrationFormErrors = Partial<Record<keyof RegistrationFormValues, string>>;

let localeDraft: Pick<RegistrationFormValues, "email" | "fullName" | "requestedRole"> | null = null;

const initialValues: RegistrationFormValues = {
  email: "",
  fullName: "",
  password: "",
  passwordConfirmation: "",
  requestedRole: "",
  termsAccepted: false,
};

const roleOptions: ReadonlyArray<{ label: string; value: RegistrationRole }> = [
  { label: "Editor", value: "editor" },
  { label: "Revisor", value: "revisor" },
] as const;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateRegistrationForm(values: RegistrationFormValues): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {};
  const fullNameParts = values.fullName.trim().split(/\s+/).filter(Boolean);

  if (fullNameParts.length < 2) {
    errors.fullName = "Escribe nombre y apellido.";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Introduce un correo válido.";
  }
  if (values.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }
  if (values.passwordConfirmation !== values.password) {
    errors.passwordConfirmation = "Las contraseñas no coinciden.";
  }
  if (values.requestedRole !== "editor" && values.requestedRole !== "revisor") {
    errors.requestedRole = "Selecciona editor o revisor.";
  }
  if (!values.termsAccepted) {
    errors.termsAccepted = "Debes aceptar los términos de acceso.";
  }

  return errors;
}

type RegistrationPanelProps = Readonly<{
  onRegistered?: (request: RegistrationRequest) => void;
  registrationAdapter?: RegistrationAuthAdapter;
}>;

export function RegistrationPanel({
  onRegistered,
  registrationAdapter = mockRegistrationAdapter,
}: RegistrationPanelProps = {}) {
  const t = usePublicCopy();
  const [values, setValues] = useState<RegistrationFormValues>(() => ({ ...initialValues, ...localeDraft }));
  useEffect(() => { localeDraft = null; }, []);
  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  useEffect(() => {
    const retainSafeDraft = () => { localeDraft = { email: values.email, fullName: values.fullName, requestedRole: values.requestedRole }; };
    window.addEventListener("jmmc-locale-switch", retainSafeDraft);
    return () => window.removeEventListener("jmmc-locale-switch", retainSafeDraft);
  }, [values.email, values.fullName, values.requestedRole]);

  function updateField<Field extends keyof RegistrationFormValues>(field: Field, value: RegistrationFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError(null);
    setSubmissionNotice(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateRegistrationForm(values);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0 || values.requestedRole === "") return;

    setIsSubmitting(true);
    const result = await registrationAdapter.register({
      email: values.email,
      fullName: values.fullName,
      password: values.password,
      requestedRole: values.requestedRole,
      termsAccepted: values.termsAccepted,
    });

    if (!result.ok) {
      setFormError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSubmissionNotice(t("Solicitud enviada. Esperando revisión del administrador."));
    onRegistered?.(result.request);
    setIsSubmitting(false);
  }

  return (
    <div className="grid gap-space-lg" data-registration-state="form">
      <div className="grid gap-space-xs">
        <span className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">{t("[ ALTA_INFRAESTRUCTURA ]")}</span>
        <h3 className="font-headline text-headline-lg uppercase tracking-[0.02em] text-primary">{t("Solicitar acceso")}</h3>
        <p className="text-body-md text-on-surface-variant">
          {t("Completa tus datos para solicitar un rol editorial. El admin revisará la solicitud antes de activar la cuenta.")}</p>
      </div>

      <form className="grid gap-space-lg" noValidate onSubmit={handleSubmit}>
        <InputField
          autoComplete="name"
          error={errors.fullName ? t(errors.fullName) : undefined}
          label={t("Nombre completo")}
          onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("fullName", event.target.value)}
          placeholder={t("Nombre Apellido")}
          required
          value={values.fullName}
        />
        <InputField
          autoComplete="email"
          error={errors.email ? t(errors.email) : undefined}
          label={t("Correo institucional")}
          onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("email", event.target.value)}
          placeholder={t("nombre@empresa.com")}
          required
          type="email"
          value={values.email}
        />
        <div className="grid gap-space-md sm:grid-cols-2">
          <InputField
            autoComplete="new-password"
            error={errors.password ? t(errors.password) : undefined}
            label={t("Contraseña")}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("password", event.target.value)}
            required
            type="password"
            value={values.password}
          />
          <InputField
            autoComplete="new-password"
            error={errors.passwordConfirmation ? t(errors.passwordConfirmation) : undefined}
            label={t("Confirmar contraseña")}
            onChange={(event: ChangeEvent<HTMLInputElement>) => updateField("passwordConfirmation", event.target.value)}
            required
            type="password"
            value={values.passwordConfirmation}
          />
        </div>
        <fieldset className="grid gap-space-sm">
          <legend className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">
            {t("Rol solicitado")}<span aria-hidden="true" className="text-accent">*</span>
          </legend>
          <p className="text-body-sm text-on-surface-variant">{t("Solo puedes solicitar los permisos editoriales disponibles.")}</p>
          <div aria-label={t("Roles disponibles")} className="grid grid-cols-2 gap-space-sm" role="group">
            {roleOptions.map((option) => {
              const isSelected = values.requestedRole === option.value;

              return (
                <button
                  aria-pressed={isSelected}
                  className={cn(
                    "flex min-h-14 items-center justify-between gap-space-sm border px-space-md py-space-sm text-start font-headline text-label-caps uppercase tracking-[0.08em] transition-colors",
                    isSelected
                      ? "border-accent bg-surface-high text-primary"
                      : "border-border bg-surface-container-lowest text-on-surface-variant hover:border-accent hover:text-primary",
                  )}
                  key={option.value}
                  onClick={() => updateField("requestedRole", option.value)}
                  type="button"
                >
                  <span>{t(option.label)}</span>
                  <span aria-hidden="true" className="text-accent">{isSelected ? "✦" : "✧"}</span>
                </button>
              );
            })}
          </div>
          {errors.requestedRole ? <p className="text-body-sm text-error" role="alert">{errors.requestedRole ? t(errors.requestedRole) : null}</p> : null}
        </fieldset>
        <CheckboxField
          checked={values.termsAccepted}
          error={errors.termsAccepted ? t(errors.termsAccepted) : undefined}
          label={t("Acepto los términos de acceso y el tratamiento de estos datos para revisar la solicitud.")}
          onChange={(event) => updateField("termsAccepted", event.target.checked)}
        />
        {formError ? <ErrorState message={t(formError)} title={t("No se pudo registrar la solicitud")} /> : null}
        {submissionNotice ? (
          <div aria-live="polite" className="border border-border bg-surface-container-lowest p-space-md text-body-sm text-on-surface-variant" role="status">
            {t(submissionNotice)}
          </div>
        ) : null}
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? t("Enviando solicitud…") : t("Crear cuenta")}
        </Button>
      </form>
    </div>
  );
}
