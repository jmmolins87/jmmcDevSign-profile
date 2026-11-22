"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import type { AuthFlow, LoginState } from "@/app/[locale]/auth/managed-types";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { AuthModalFrame, type AuthModalView } from "@/app/[locale]/login/auth-modal-frame";
import { createAuthLocaleDraftStore, saveAuthLocaleDraft, type AuthLocaleDraft } from "@/app/[locale]/login/auth-locale-handoff";
import { LoginPanel, ResetPasswordPanel } from "@/app/[locale]/login/login-panel";
import { PendingPanel, RefreshAuthStatus } from "@/app/[locale]/login/pending-panel";
import { RegistrationPanel } from "@/app/[locale]/login/registration-panel";
import { SessionPanel, SignOutForm } from "@/app/[locale]/login/session-panel";
import { Modal } from "@/app/components/ui";
import { localePath } from "@/app/lib/i18n";
import { useLocale } from "@/app/lib/locale-context";

const anonymous: LoginState = { access: { status: "anonymous" }, request: null, requestUnavailable: false, recovery: false };

export function LoginModal({ flow = null, isIntercepted = false, onClose, state = anonymous }: {
  flow?: AuthFlow;
  isIntercepted?: boolean;
  onClose?: () => void;
  state?: LoginState;
} = {}) {
  const t = useManagedAuthCopy();
  const router = useRouter();
  const locale = useLocale();
  const [draftStore] = useState(() => createAuthLocaleDraftStore());
  const restoredDraft = useSyncExternalStore(draftStore.subscribe, draftStore.getSnapshot, draftStore.getServerSnapshot);
  const [selectedView, setSelectedView] = useState<AuthModalView | null>(null);
  const credentialView = selectedView ?? (restoredDraft?.view === "register" ? "register" : "login");
  const safeDraft = useRef<Partial<AuthLocaleDraft>>({});

  useEffect(() => {
    function retainDraft() {
      if (state.access.status !== "anonymous" || state.recovery) return;
      saveAuthLocaleDraft({
        email: "",
        fullName: "",
        requestedRole: "",
        ...restoredDraft,
        ...safeDraft.current,
        view: credentialView,
      });
    }
    window.addEventListener("jmmc-locale-switch", retainDraft);
    return () => window.removeEventListener("jmmc-locale-switch", retainDraft);
  }, [credentialView, restoredDraft, state.access.status, state.recovery]);

  function handleClose() {
    if (onClose) onClose();
    else if (isIntercepted) router.back();
    else router.replace(localePath("/es/", locale));
  }

  function updateDraft(fields: Partial<AuthLocaleDraft>) {
    safeDraft.current = { ...safeDraft.current, ...fields };
  }

  const activeView = state.recovery || state.access.status === "active" || state.access.status === "unavailable" ? "status"
    : state.access.status === "inactive" ? "pending" : credentialView;
  const signedIn = state.access.status === "active" || state.access.status === "inactive";
  const notice = flow === "confirmed" && signedIn ? { status: "success" as const, message: "Correo confirmado." }
    : flow === "password-updated" ? { status: "success" as const, message: "Contraseña actualizada." }
    : flow === "link-error" || (flow === "reset" && !state.recovery && state.access.status !== "unavailable")
      ? { status: "error" as const, message: "Este enlace ya no es válido. Solicita uno nuevo." }
      : null;

  return (
    <Modal
      closeLabel={t("Cerrar autenticación")}
      description={t("Accede a tu cuenta editorial o solicita acceso.")}
      onClose={handleClose}
      open
      title={t("Acceso al sistema")}
    >
      <div className="mb-space-md flex justify-end"><LanguageSelector alwaysVisible /></div>
      {notice ? <div className="mb-space-md"><AuthFeedback feedback={notice} /></div> : null}
      <AuthModalFrame
        activeView={activeView}
        key={restoredDraft ? "restored-draft" : "empty-draft"}
        login={<LoginPanel initialEmail={restoredDraft?.email} onSafeDraftChange={updateDraft} />}
        onViewChange={setSelectedView}
        pending={(
          <div className="grid gap-space-md">
            {state.request ? <PendingPanel deliveryUnavailable={state.requestUnavailable} request={state.request} />
              : state.requestUnavailable ? (
                <>
                  <AuthFeedback feedback={{ status: "error", message: "No se pudo consultar el estado de la solicitud." }} />
                  <RefreshAuthStatus />
                </>
              ) : <RegistrationPanel completeRequest />}
            <SignOutForm />
          </div>
        )}
        register={<RegistrationPanel initialDraft={restoredDraft ?? undefined} onSafeDraftChange={updateDraft} />}
        status={state.recovery ? <ResetPasswordPanel /> : state.access.status === "active" ? <SessionPanel access={state.access} /> : (
          <div className="grid gap-space-md">
            <AuthFeedback feedback={{ status: "error", message: "El servicio de acceso no está disponible en este momento. Inténtalo de nuevo." }} />
            <RefreshAuthStatus />
          </div>
        )}
      />
    </Modal>
  );
}
