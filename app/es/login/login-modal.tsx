"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Modal } from "@/app/components/ui";
import { registrationRequestsRepository } from "@/app/es/auth/mock-auth-repository";
import { AuthModalFrame, type AuthModalView } from "@/app/es/login/auth-modal-frame";
import type { RegistrationRequest } from "@/app/es/auth/types";
import { LoginPanel } from "@/app/es/login/login-panel";
import { PendingPanel } from "@/app/es/login/pending-panel";
import { RegistrationPanel } from "@/app/es/login/registration-panel";

const PENDING_REQUEST_STORAGE_KEY = "jmmcdevsign:auth:pending-request-id";

function readStoredPendingRequest() {
  if (typeof window === "undefined") return null;

  const requestId = window.localStorage.getItem(PENDING_REQUEST_STORAGE_KEY);
  if (!requestId) return null;

  return registrationRequestsRepository.getSnapshot().find((request) => request.id === requestId) ?? null;
}

export function LoginModal() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<AuthModalView>("login");
  const [pendingRequest, setPendingRequest] = useState<RegistrationRequest | null>(readStoredPendingRequest);

  function handleClose() {
    router.back();
  }

  function handleRegistered(request: RegistrationRequest) {
    setPendingRequest(request);
    window.localStorage.setItem(PENDING_REQUEST_STORAGE_KEY, request.id);
    setActiveView("pending");
  }

  function handleVerified() {
    setPendingRequest(null);
    window.localStorage.removeItem(PENDING_REQUEST_STORAGE_KEY);
    setActiveView("login");
  }

  return (
    <Modal
      closeLabel="Cerrar autenticación"
      description="Accede a tu entorno editorial con una sesión mock local."
      onClose={handleClose}
      open
      title="Acceso al sistema"
    >
      <AuthModalFrame
        activeView={activeView}
        login={<LoginPanel />}
        onViewChange={setActiveView}
        pending={<PendingPanel onVerified={handleVerified} request={pendingRequest} />}
        register={<RegistrationPanel onRegistered={handleRegistered} />}
      />
    </Modal>
  );
}
