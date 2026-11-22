"use client";

import { useEffect, useRef, useState } from "react";

import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { InputField } from "@/app/components/ui";

export function PasswordFields({ confirm = false }: { confirm?: boolean }) {
  const t = useManagedAuthCopy();
  const [visible, setVisible] = useState(false);
  const fieldGroup = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function clearPasswords() {
      fieldGroup.current?.querySelectorAll("input").forEach((input) => { input.value = ""; });
    }
    window.addEventListener("jmmc-locale-switch", clearPasswords);
    return () => window.removeEventListener("jmmc-locale-switch", clearPasswords);
  }, []);
  return (
    <div className="grid gap-space-sm" ref={fieldGroup}>
      <div className={confirm ? "grid gap-space-md sm:grid-cols-2" : "grid gap-space-md"}>
        <InputField
          autoComplete={confirm ? "new-password" : "current-password"}
          description={confirm ? t("La contraseña debe tener al menos 8 caracteres.") : undefined}
          label={t("Contraseña")}
          minLength={confirm ? 8 : undefined}
          name="password"
          required
          type={visible ? "text" : "password"}
        />
        {confirm ? (
          <InputField
            autoComplete="new-password"
            label={t("Confirmar contraseña")}
            minLength={8}
            name="confirmPassword"
            required
            type={visible ? "text" : "password"}
          />
        ) : null}
      </div>
      <button
        aria-pressed={visible}
        className="justify-self-start border border-border px-space-sm py-space-xs text-body-sm text-on-surface-variant hover:border-accent hover:text-primary"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {t(visible ? "Ocultar contraseña" : "Mostrar contraseña")}
      </button>
    </div>
  );
}
