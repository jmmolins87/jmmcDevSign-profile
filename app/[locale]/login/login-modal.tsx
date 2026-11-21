"use client";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { LanguageSelector } from "@/app/[locale]/_components/language-selector";
import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";
import { Modal } from "@/app/components/ui";
import { registrationRequestsRepository } from "@/app/[locale]/auth/mock-auth-repository";
import { AuthModalFrame, type AuthModalView } from "@/app/[locale]/login/auth-modal-frame";
import type { RegistrationRequest } from "@/app/[locale]/auth/types";
import { LoginPanel } from "@/app/[locale]/login/login-panel";
import { PendingPanel } from "@/app/[locale]/login/pending-panel";
import { RegistrationPanel } from "@/app/[locale]/login/registration-panel";
import { createAuthLocaleDraftStore, saveAuthLocaleDraft, type AuthLocaleDraft } from "@/app/[locale]/login/auth-locale-handoff";

const PENDING_REQUEST_STORAGE_KEY = "jmmcdevsign:auth:pending-request-id";

function readStoredPendingRequest() {
  if (typeof window === "undefined") return null;

  let requestId: string | null;
  try { requestId = window.localStorage.getItem(PENDING_REQUEST_STORAGE_KEY); } catch { return null; }
  if (!requestId) return null;

  return registrationRequestsRepository.getSnapshot().find((request) => request.id === requestId) ?? null;
}

export function LoginModal({ isIntercepted = false, onClose }: { isIntercepted?: boolean; onClose?: () => void } = {}) {
  const t = usePublicCopy();
  const router = useRouter();
  const locale = useLocale();
  const [draftStore] = useState(() => createAuthLocaleDraftStore());
  const restoredDraft = useSyncExternalStore(draftStore.subscribe, draftStore.getSnapshot, draftStore.getServerSnapshot);
  const [selectedView, setActiveView] = useState<AuthModalView | null>(null);
  const activeView = selectedView ?? restoredDraft?.view ?? "login";
  const safeDraftRef = useRef<Partial<AuthLocaleDraft>>({});
  useEffect(() => {
    const retainView = () => {
      // Best effort only: blocked session storage must not prevent changing language.
      saveAuthLocaleDraft({
        email: "",
        fullName: "",
        requestedRole: "",
        ...restoredDraft,
        ...safeDraftRef.current,
        view: activeView,
      });
    };
    window.addEventListener("jmmc-locale-switch", retainView);
    return () => window.removeEventListener("jmmc-locale-switch", retainView);
  }, [activeView, restoredDraft]);
  const [pendingRequest, setPendingRequest] = useState<RegistrationRequest | null>(readStoredPendingRequest);

  function handleClose() {
    if (onClose) onClose();
    else if (isIntercepted) router.back();
    else router.replace(localePath("/es/", locale));
  }

  function handleRegistered(request: RegistrationRequest) {
    setPendingRequest(request);
    try { window.localStorage.setItem(PENDING_REQUEST_STORAGE_KEY, request.id); } catch { /* The request remains available in component memory. */ }
    setActiveView("pending");
  }

  function handleVerified() {
    setPendingRequest(null);
    try { window.localStorage.removeItem(PENDING_REQUEST_STORAGE_KEY); } catch { /* Verification still clears the in-memory request. */ }
    setActiveView("login");
  }

  return (
    <Modal
      closeLabel={t("Cerrar autenticación")}
      description={t("Accede a tu entorno editorial con una sesión mock local.")}
      onClose={handleClose}
      open
      title={t("Acceso al sistema")}
    >
      <div className="mb-space-md flex justify-end"><LanguageSelector alwaysVisible /></div>
      <AuthModalFrame
        activeView={activeView}
        key={restoredDraft ? "restored-draft" : "empty-draft"}
        login={<LoginPanel initialEmail={restoredDraft?.email} onSafeDraftChange={(draft) => { safeDraftRef.current = { ...safeDraftRef.current, ...draft }; }} />}
        onViewChange={setActiveView}
        pending={<PendingPanel onVerified={handleVerified} request={pendingRequest} />}
        register={<RegistrationPanel initialDraft={restoredDraft ?? undefined} onSafeDraftChange={(draft) => { safeDraftRef.current = { ...safeDraftRef.current, ...draft }; }} onRegistered={handleRegistered} />}
      />
    </Modal>
  );
}
